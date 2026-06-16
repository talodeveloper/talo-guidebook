// Shared admin authentication, backed by Firebase Auth.
//
// Security model: the REAL enforcement is in Firestore/Storage rules, which
// require a valid Firebase token (request.auth != null) for any sensitive
// read/write. The localStorage flags below are only a UX convenience for the
// client-side route guards — they let a logged-in admin survive a page reload
// without being bounced to the login screen while Firebase rehydrates its
// session. A faked flag grants no real access, because without a Firebase
// token every protected Firestore/Storage operation is rejected by the rules.

import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'

// Persist the session across reloads/tabs (this is the default, but be explicit).
setPersistence(auth, browserLocalPersistence).catch(() => {})

// Route-guard flags kept in sync with real Firebase auth state.
const FLAG_KEYS = ['talo_admin_auth', 'talo_admin_v2_auth', 'talo_admin_v3_auth']

// When Firebase reports a real sign-out (explicit logout, expired/revoked
// token), clear the guard flags so the UI can't show a logged-in shell that
// can't actually do anything.
//
// IMPORTANT: onAuthStateChanged also fires once on registration with `null`
// BEFORE Firebase rehydrates the persisted session — eagerly clearing flags
// on that boot-time null caused spurious logouts on rapid reloads. So we only
// clear on a real transition (we previously saw a user, now we don't).
let _sawUser = false
onAuthStateChanged(auth, (user) => {
  if (user) { _sawUser = true; return }
  if (_sawUser) FLAG_KEYS.forEach(k => localStorage.removeItem(k))
})

// Attempts a real Firebase sign-in. Throws on bad credentials.
export async function adminSignIn(email, password) {
  await signInWithEmailAndPassword(auth, (email || '').trim(), password)
  return true
}

// Signs out of Firebase and clears every admin route-guard flag.
export async function adminSignOut() {
  try { await signOut(auth) } catch { /* ignore */ }
  FLAG_KEYS.forEach(k => localStorage.removeItem(k))
}

// Verifies a password for the currently-intended admin without disturbing the
// session in a meaningful way (used for re-auth confirmations, e.g. delete).
// Returns true/false rather than throwing.
export async function verifyAdminPassword(email, password) {
  try {
    await signInWithEmailAndPassword(auth, (email || '').trim(), password)
    return true
  } catch {
    return false
  }
}
