import { db } from '../firebase'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { getTenantId } from './tenant'

// Unique ID for this browser tab — persists across page refreshes (sessionStorage
// survives Cmd+R / F5 but is cleared on tab close, so each new tab = new session)
const _SESS_KEY = 'talo_session_id'
let _storedId = null
try { _storedId = sessionStorage.getItem(_SESS_KEY) } catch {}
if (!_storedId) {
  _storedId = Math.random().toString(36).slice(2) + Date.now().toString(36)
  try { sessionStorage.setItem(_SESS_KEY, _storedId) } catch {}
}
export const SESSION_ID = _storedId

const STALE_MS          = 5  * 60 * 1000  // session stale after 5 min of no heartbeat
export const TAKEOVER_MS = 30 * 1000       // challenger takes over after 30s of inactivity
const CHALLENGE_TTL     = 60 * 1000        // challenge doc cleaned up after 60s
const HEARTBEAT_THROTTLE = 30 * 1000       // write lastSeen at most once per 30s

let _unsubWatch        = null
let _lastActivityWrite = 0
let _ownSession        = false  // true when this tab is the active session owner

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']

function sessionDocRef(tid) {
  return doc(db, 'tenants', tid || getTenantId(), 'data', '_session')
}

async function writeSession(fields, tid) {
  try {
    await setDoc(sessionDocRef(tid), fields, { merge: true })
  } catch (e) {
    console.warn('[sessionStore] write failed:', e)
  }
}

// ── Heartbeat (activity-gated) ───────────────────────────────────────────────
// Only updates lastSeen when the user is actually doing something — so the
// challenger's "30s inactivity" countdown reflects real idle time, not a timer.

function onActivity() {
  if (!_ownSession) return
  const now = Date.now()
  if (now - _lastActivityWrite < HEARTBEAT_THROTTLE) return
  _lastActivityWrite = now
  writeSession({ lastSeen: now })
}

function startHeartbeat() {
  _ownSession = true
  _lastActivityWrite = Date.now()
  ACTIVITY_EVENTS.forEach(e => document.addEventListener(e, onActivity, { passive: true }))
}

function stopHeartbeat() {
  _ownSession = false
  ACTIVITY_EVENTS.forEach(e => document.removeEventListener(e, onActivity))
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Called right after a successful login.
 * Returns:
 *   { status: 'ok' }                      — claimed, start working
 *   { status: 'challenged', data: {...} }  — another active session found;
 *                                            challenge written to Firestore
 */
export async function initSession() {
  const snap = await getDoc(sessionDocRef())
  const data = snap.exists() ? snap.data() : null
  const now  = Date.now()

  // forceLogout is a terminal state — treat as no active session so we can
  // claim it cleanly. The force-logout has already done its job.
  const otherIsActive =
    !data?.forceLogout &&
    data?.sessionId &&
    data.sessionId !== SESSION_ID &&
    data.lastSeen &&
    now - data.lastSeen < STALE_MS

  if (otherIsActive) {
    // Write our challenge only if no other challenge is in progress
    if (!data.challengeId || now - (data.challengeAt || 0) > CHALLENGE_TTL) {
      await writeSession({ challengeId: SESSION_ID, challengeAt: now, challengeResolved: null })
    }
    return { status: 'challenged', data }
  }

  // Detect if this login follows a force-logout+reset — caller will wipe
  // localStorage content so _loadedRemoteAt gets re-synced from Firestore.
  const wasForceReset = !!data?.forceReset

  // No active session (or stale/force-logged-out one) — claim it
  await writeSession({
    sessionId:         SESSION_ID,
    loginAt:           now,
    lastSeen:          now,
    challengeId:       null,
    challengeAt:       null,
    challengeResolved: null,
    forceLogout:       false,
    forceReset:        false,
  })
  startHeartbeat()
  return { status: 'ok', wasForceReset }
}

/** Person A clicks "Stay Signed In" — claims the session, resolves the challenge */
export async function claimSession() {
  const now = Date.now()
  _lastActivityWrite = now
  await writeSession({
    challengeResolved: 'stayed',
    lastSeen:          now,
  })
}

/** Person B takes over after Person A's 30s inactivity window expires */
export async function takeOverSession() {
  await writeSession({
    sessionId:         SESSION_ID,
    loginAt:           Date.now(),
    lastSeen:          Date.now(),
    challengeId:       null,
    challengeAt:       null,
    challengeResolved: null,
    forceLogout:       false,
  })
  startHeartbeat()
}

/** Called on normal logout — clears session only if we still own it */
export async function clearSession() {
  stopHeartbeat()
  if (_unsubWatch) { _unsubWatch(); _unsubWatch = null }
  try {
    const snap = await getDoc(sessionDocRef())
    if (snap.exists() && snap.data().sessionId === SESSION_ID) {
      await setDoc(sessionDocRef(), {
        sessionId:         null,
        lastSeen:          null,
        challengeId:       null,
        challengeAt:       null,
        challengeResolved: null,
        forceLogout:       false,
      })
    }
  } catch {}
}

/** Super-admin: force-logout all sessions for any tenant */
export async function forceLogoutTenant(tenantId) {
  await setDoc(doc(db, 'tenants', tenantId, 'data', '_session'), {
    forceLogout: true,
    forceReset: true,   // signals next login to wipe localStorage content cache
    sessionId:  null,
    lastSeen:   null,
  }, { merge: true })
}

/**
 * Called from Layout on every mount (including after page refresh).
 * If we still own the session, restarts the heartbeat — no Firestore write,
 * no challenge flow, just re-attaches the activity listeners.
 */
export async function resumeSession() {
  try {
    const snap = await getDoc(sessionDocRef())
    if (!snap.exists()) return
    const data = snap.data()
    if (data.sessionId === SESSION_ID && !data.forceLogout) {
      startHeartbeat()
    }
  } catch {}
}

/**
 * Watch the session doc while logged in (Person A's view).
 * Callback receives (data, event) where event is one of:
 *   'ok'               — normal, we own the session
 *   'challenged'       — someone is trying to log in (show banner)
 *   'force-logout'     — super-admin kicked all sessions
 *   'taken-over'       — another session replaced ours
 */
export function watchSession(callback) {
  if (_unsubWatch) { _unsubWatch(); _unsubWatch = null }

  _unsubWatch = onSnapshot(sessionDocRef(), snap => {
    if (!snap.exists()) return
    const data = snap.data()
    const now  = Date.now()

    if (data.forceLogout) {
      callback(data, 'force-logout')
      return
    }

    // We were taken over (session now belongs to someone else)
    if (data.sessionId && data.sessionId !== SESSION_ID) {
      callback(data, 'taken-over')
      return
    }

    // We own the session — check if someone is challenging us
    if (data.sessionId === SESSION_ID && data.challengeId && data.challengeId !== SESSION_ID && !data.challengeResolved) {
      const age = now - (data.challengeAt || 0)
      if (age < CHALLENGE_TTL) {
        callback(data, 'challenged')
        return
      }
      // Challenge expired — clean it up silently
      writeSession({ challengeId: null, challengeAt: null, challengeResolved: null })
    }

    callback(data, 'ok')
  })

  return () => { if (_unsubWatch) { _unsubWatch(); _unsubWatch = null } }
}

/**
 * Watch the session doc while waiting to take over (Person B's view).
 * Returns raw Firestore data on every change.
 */
export function watchChallenge(callback) {
  const unsub = onSnapshot(sessionDocRef(), snap => {
    if (snap.exists()) callback(snap.data())
  })
  return unsub
}
