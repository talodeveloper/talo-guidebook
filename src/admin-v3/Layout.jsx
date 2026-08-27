import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminV3Store } from '../data/adminV3Store'
import Icon from '../components/Icon'
import { watchSession, claimSession, clearSession, resumeSession } from '../data/sessionStore'
import { startInactivityTimer, stopInactivityTimer, resetInactivityTimer } from '../data/inactivityTimer'
import { watchMaintenance, getMaintenanceState, fmtTime, fmtCountdown } from '../data/maintenanceStore'
import MaintenanceScreen from './MaintenanceScreen'

function SidebarLink({ to, icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-orange-50 text-orange-700 font-semibold'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      <Icon name={icon} size={16} />
      <span>{label}</span>
    </NavLink>
  )
}

function AccountLockedWall({ navigate }) {
  const lockedStatus = adminV3Store.isLocked()
  const isSuspended = lockedStatus === 'suspended'

  function handleSignOut() {
    adminV3Store.logout()
    navigate('/admin-v3')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: isSuspended ? '#fef2f2' : '#fffbeb' }}>
            <Icon name={isSuspended ? 'lock' : 'pause_circle'} size={28}
              className={isSuspended ? 'text-red-500' : 'text-amber-500'} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {isSuspended ? 'Account suspended' : 'Account deactivated'}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {isSuspended
              ? 'Your account has been suspended. Please contact support to restore access to your guidebooks and admin panel.'
              : 'Your account is currently deactivated. Choose a plan below to reactivate and get instant access to your guidebooks and admin panel.'}
          </p>

          {/* Placeholder — replaced with Stripe plan cards in Phase 4 */}
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 mb-6">
            <Icon name="credit_card" size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">Plan selection coming soon</p>
            <p className="text-xs text-slate-400 mt-1">
              Payment integration will be available in a future update.
              Contact support to reactivate your account manually.
            </p>
          </div>

          <a href="mailto:support@talorentals.com"
            className="block w-full py-2.5 rounded-xl text-sm font-bold text-white mb-3 transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            Contact Support
          </a>
          <button onClick={handleSignOut}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-colors">
            Sign Out
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">TALO Rentals · Admin Panel v3</p>
      </div>
    </div>
  )
}

function LoadingContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-slate-500">Loading your content…</p>
      </div>
    </div>
  )
}

function LoadContentError({ navigate }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <Icon name="cloud_off" size={28} className="text-amber-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Couldn't load your content</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          We couldn't reach your saved content just now. To protect your live data,
          editing and publishing stay disabled until it loads. Check your connection
          and try again.
        </p>
        <button onClick={() => window.location.reload()}
          className="block w-full py-2.5 rounded-xl text-sm font-bold text-white mb-3 transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
          Reload
        </button>
        <button onClick={() => { adminV3Store.logout(); navigate('/admin-v3') }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default function AdminV3Layout() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState(adminV3Store.getPropertiesList())
  const [hasChanges, setHasChanges] = useState(adminV3Store.hasUnsavedChanges())
  const [changeSummary, setChangeSummary] = useState(adminV3Store.getChangeSummary())
  const [publishing, setPublishing] = useState(false)
  const [publishedFlash, setPublishedFlash] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [ready, setReady] = useState(adminV3Store.isReady())
  const [hydrating, setHydrating] = useState(adminV3Store.isHydrating())
  const [staleSession, setStaleSession] = useState(adminV3Store.isStaleSession())
  const dropdownRef = useRef(null)

  // Session awareness
  const [sessionEvent, setSessionEvent]   = useState(null)  // 'challenged'|'force-logout'|'taken-over'
  const [sessionData, setSessionData]     = useState(null)
  const [challengeCountdown, setChallengeCountdown] = useState(null)
  const challengeTimerRef = useRef(null)

  // Inactivity auto-logout
  const [inactivityWarnSecs, setInactivityWarnSecs] = useState(null)
  const inactivityTickRef = useRef(null)

  // Maintenance mode — watched from Firestore; screen shown only to tenant admins
  const [maintenanceState, setMaintenanceState] = useState({ status: 'none' })
  const maintenanceRawRef = useRef(null)
  // Set once when a *scheduled* window activates: draft discarded + session ended,
  // keeps the maintenance screen up until the admin explicitly signs in again.
  const [forcedOut, setForcedOut] = useState(false)

  useEffect(() => {
    return adminV3Store.subscribe(() => {
      setProperties(adminV3Store.getPropertiesList())
      setHasChanges(adminV3Store.hasUnsavedChanges())
      setChangeSummary(adminV3Store.getChangeSummary())
      setReady(adminV3Store.isReady())
      setHydrating(adminV3Store.isHydrating())
      setStaleSession(adminV3Store.isStaleSession())
    })
  }, [])

  useEffect(() => {
    if (!showDropdown) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showDropdown])

  // ── Maintenance watcher ────────────────────────────────────────────────────
  // Firestore only fires a snapshot when the document changes. A *scheduled*
  // window's start time passing is NOT a document change — it's just the wall
  // clock moving — so without this local tick an open tab would stay on
  // 'upcoming' forever and never lock out. We recompute the derived status from
  // the raw stored data every 10s so upcoming→active (and active→ended) flips
  // happen on their own, no refresh required.
  useEffect(() => {
    const unsub = watchMaintenance((s, raw) => {
      maintenanceRawRef.current = raw
      setMaintenanceState(s)
    })
    const tick = setInterval(() => {
      setMaintenanceState(getMaintenanceState(maintenanceRawRef.current))
    }, 10_000)
    return () => { unsub(); clearInterval(tick) }
  }, [])

  // ── Scheduled-maintenance force-logout ──────────────────────────────────────
  // Scheduled windows give tenants advance notice (banner + message telling them
  // to publish). When one activates we discard the unpublished draft and end the
  // session, then keep the maintenance screen up until they sign in again.
  // Immediate ("Start now") windows do NOT do this — they preserve the draft and
  // auto-return the admin when the window ends.
  useEffect(() => {
    if (
      maintenanceState.status === 'active' &&
      maintenanceState.mode !== 'now' &&
      !forcedOut
    ) {
      setForcedOut(true)
      try { adminV3Store.discardDraft() } catch {}
      clearSession()
      stopInactivityTimer()
    }
  }, [maintenanceState.status, maintenanceState.mode, forcedOut])

  // ── Session watcher ────────────────────────────────────────────────────────
  useEffect(() => {
    // On refresh, Firebase auth persists but initSession() wasn't called —
    // resumeSession() restarts the heartbeat if we still own the session.
    resumeSession()
    const unsub = watchSession((data, event) => {
      setSessionData(data)

      if (event === 'force-logout' || event === 'taken-over') {
        setSessionEvent(event)
        stopInactivityTimer()
        return
      }

      if (event === 'challenged') {
        setSessionEvent('challenged')
        // Compute initial countdown for the challenge banner
        const lastSeen  = data.lastSeen || 0
        const remaining = Math.max(0, Math.ceil((lastSeen + 30_000 - Date.now()) / 1000))
        setChallengeCountdown(remaining)
        return
      }

      // 'ok' — challenge resolved, clear banner
      if (sessionEvent === 'challenged') {
        setSessionEvent(null)
        setChallengeCountdown(null)
        if (challengeTimerRef.current) { clearInterval(challengeTimerRef.current); challengeTimerRef.current = null }
      }
    })
    return unsub
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown tick for the challenge banner (ticks down smoothly between Firestore updates)
  useEffect(() => {
    if (sessionEvent !== 'challenged' || challengeCountdown === null) {
      if (challengeTimerRef.current) { clearInterval(challengeTimerRef.current); challengeTimerRef.current = null }
      return
    }
    challengeTimerRef.current = setInterval(() => {
      setChallengeCountdown(c => Math.max(0, c - 1))
    }, 1000)
    return () => { if (challengeTimerRef.current) clearInterval(challengeTimerRef.current) }
  }, [sessionEvent, challengeCountdown === null]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Inactivity timer ───────────────────────────────────────────────────────
  useEffect(() => {
    startInactivityTimer({
      onWarn: (remainingSecs) => {
        if (remainingSecs === null) {
          // User became active — dismiss warning
          setInactivityWarnSecs(null)
          if (inactivityTickRef.current) { clearInterval(inactivityTickRef.current); inactivityTickRef.current = null }
          return
        }
        setInactivityWarnSecs(remainingSecs)
        // Start a per-second tick for smooth countdown in the banner
        if (inactivityTickRef.current) clearInterval(inactivityTickRef.current)
        inactivityTickRef.current = setInterval(() => {
          setInactivityWarnSecs(s => {
            if (s <= 1) { clearInterval(inactivityTickRef.current); inactivityTickRef.current = null; return 0 }
            return s - 1
          })
        }, 1000)
      },
      onLogout: () => {
        setInactivityWarnSecs(null)
        clearSession()
        adminV3Store.logout()
        navigate('/admin-v3?reason=inactivity')
      },
    })
    return () => {
      stopInactivityTimer()
      if (inactivityTickRef.current) clearInterval(inactivityTickRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Conditional screens — placed AFTER all hooks (rules of hooks).
  if (adminV3Store.isLocked()) return <AccountLockedWall navigate={navigate} />
  if (hydrating) return <LoadingContent />
  if (!ready) return <LoadContentError navigate={navigate} />

  const handleLogout = () => {
    clearSession()
    stopInactivityTimer()
    adminV3Store.logout()
    navigate('/admin-v3')
  }

  const handleStaySignedIn = async () => {
    resetInactivityTimer()
    setInactivityWarnSecs(null)
    if (inactivityTickRef.current) { clearInterval(inactivityTickRef.current); inactivityTickRef.current = null }
    await claimSession()
    setSessionEvent(null)
    setChallengeCountdown(null)
  }

  const handlePublish = async () => {
    setPublishing(true)
    setShowDropdown(false)
    const result = await adminV3Store.publish()
    setPublishing(false)
    if (result === true) {
      setPublishedFlash(true)
      setTimeout(() => setPublishedFlash(false), 3000)
    } else if (result === 'blocked-stale') {
      setStaleSession(true)
    } else if (result === 'blocked-defaults') {
      window.alert('Publish blocked: this would replace your live guidebook content (including uploaded images) with empty/default content. This usually means this browser tab is out of date — please reload the page and try again.')
    } else if (result === 'blocked-error') {
      window.alert("Couldn't verify your live content just now (network issue). Publish was cancelled to protect your data — please try again in a moment.")
    } else if (result === 'firestore-error') {
      window.alert("Your changes were saved locally but couldn't reach Firestore (network issue). Other browsers won't see the update yet. Please check your connection and try publishing again.")
    } else {
      window.alert('Publish is not ready yet — please reload the page and try again.')
    }
  }

  const handleDiscard = () => {
    setShowDropdown(false)
    setConfirmDiscard(true)
  }

  const doDiscard = () => {
    setConfirmDiscard(false)
    adminV3Store.discardDraft()
  }

  // ── Full-screen overlays for session termination ────────────────────────────
  if (sessionEvent === 'force-logout' || sessionEvent === 'taken-over') {
    const isForced = sessionEvent === 'force-logout'
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <Icon name={isForced ? 'admin_panel_settings' : 'devices'} size={28} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {isForced ? 'Signed out by administrator' : 'Signed in from another location'}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {isForced
              ? 'An administrator has signed you out of all sessions. Any unpublished changes have been lost. Please sign in again.'
              : 'Your session was taken over by a new login. Please sign in again to continue editing.'}
          </p>
          <button
            onClick={() => { adminV3Store.logout(); navigate('/admin-v3') }}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            Sign In Again
          </button>
        </div>
      </div>
    )
  }

  // ── Maintenance gate ─────────────────────────────────────────────────────
  // Active window → show the screen. A scheduled window additionally keeps the
  // screen up (forcedOut) even after it ends, until the admin signs in again.
  if (maintenanceState.status === 'active' || forcedOut) {
    return (
      <MaintenanceScreen
        scheduledEnd={maintenanceState.scheduledEnd}
        message={maintenanceState.message}
        mustReLogin={forcedOut}
        onReLogin={handleLogout}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Discard confirmation modal */}
      {confirmDiscard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-2">Discard changes?</h2>
            <p className="text-sm text-slate-500 mb-5">All unpublished changes will be lost. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDiscard(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={doDiscard}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto`}>
        {/* Brand */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              <span className="text-white text-sm font-black">T</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">TALO Admin</p>
              <p className="text-[10px] text-slate-400">v3 · Activity Center</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <SidebarLink to="/admin-v3/dashboard" icon="dashboard" label="Dashboard" end />
          <SidebarLink to="/admin-v3/activities" icon="explore" label="Global Activities" />
          <SidebarLink to="/admin-v3/global" icon="public" label="Global Content" />

          {/* Guest Records group */}
          <div className="pt-3 pb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Guest Records</p>
          </div>
          <SidebarLink to="/admin-v3/checkins" icon="how_to_reg" label="Check-In Records" />
          <SidebarLink to="/admin-v3/checkouts" icon="exit_to_app" label="Checked Out" />
          <SidebarLink to="/admin-v3/guest-database" icon="contacts" label="Guest Database" />

          <div className="pt-4 pb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Properties</p>
          </div>

          {properties.map(p => (
            <NavLink
              key={p.slug}
              to={`/admin-v3/property/${p.slug}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                p.status === 'active' ? 'bg-green-500'
                : p.status === 'inactive' ? 'bg-slate-300'
                : 'bg-amber-400'
              }`} />
              <span className="truncate">{p.name}</span>
              {p.status === 'inactive' && (
                <span className="ml-auto text-[9px] text-slate-400 font-semibold uppercase">Off</span>
              )}
            </NavLink>
          ))}

          <NavLink
            to="/admin-v3/add-property"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mt-1 ${
                isActive
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            <Icon name="add_circle_outline" size={16} />
            <span>Add Property</span>
          </NavLink>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <Icon name="logout" size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Upcoming maintenance banner — shown up to 24h before start */}
        {maintenanceState.status === 'upcoming' &&
          maintenanceState.scheduledStart - Date.now() < 24 * 60 * 60 * 1000 && (
          <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center gap-3 flex-wrap justify-between z-40 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>construction</span>
              Maintenance scheduled — {fmtTime(maintenanceState.scheduledStart)} to {fmtTime(maintenanceState.scheduledEnd)}
              <span className="font-normal text-amber-100 ml-1">
                · starts in {fmtCountdown(maintenanceState.scheduledStart)}
              </span>
            </div>
            <span className="text-amber-100 text-xs">
              Publish your changes before this time — unpublished edits are discarded and you'll be signed out when it begins.
            </span>
          </div>
        )}

        {/* Challenge banner — someone is trying to log in (Person A's view) */}
        {sessionEvent === 'challenged' && (
          <div className="bg-amber-600 text-white px-4 py-3 flex items-center gap-3 flex-wrap justify-between z-40">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="person_alert" size={16} />
              Someone is trying to sign in to your account.
              {challengeCountdown !== null && challengeCountdown > 0 && (
                <span className="text-amber-100 font-normal ml-1">
                  Your session ends in {challengeCountdown}s if you're inactive.
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <p className="text-xs text-amber-100 hidden sm:block">Any unpublished changes will be lost if you're signed out.</p>
              <button
                onClick={handleStaySignedIn}
                className="px-4 py-1.5 rounded-lg text-sm font-bold bg-white text-amber-700 hover:bg-amber-50 transition-colors flex-shrink-0">
                Stay Signed In
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-amber-100 hover:text-white border border-amber-400 hover:border-amber-200 transition-colors flex-shrink-0">
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Inactivity warning banner */}
        {inactivityWarnSecs !== null && sessionEvent !== 'challenged' && (
          <div className="bg-slate-800 text-white px-4 py-3 flex items-center gap-3 flex-wrap justify-between z-40">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="timer" size={16} className="text-slate-300" />
              <span>
                <span className="font-semibold">Inactive for a while.</span>
                {' '}You'll be signed out in{' '}
                <span className="font-bold text-amber-400">
                  {inactivityWarnSecs >= 60
                    ? `${Math.ceil(inactivityWarnSecs / 60)} min`
                    : `${inactivityWarnSecs}s`}
                </span>
                . Any unpublished changes will be lost.
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => { resetInactivityTimer(); setInactivityWarnSecs(null); if (inactivityTickRef.current) { clearInterval(inactivityTickRef.current); inactivityTickRef.current = null } }}
                className="px-4 py-1.5 rounded-lg text-sm font-bold bg-orange-500 hover:bg-orange-400 transition-colors">
                Stay Signed In
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="h-14 flex items-center gap-3 px-4 md:px-6">
            <button className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
              <Icon name="menu" size={20} />
            </button>

            <div className="flex-1" />

            {staleSession ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                  <Icon name="sync_problem" size={14} />
                  Content updated elsewhere — reload to get latest
                </div>
                <button onClick={async () => { await adminV3Store.syncRemoteAt() }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
                  Reload
                </button>
              </div>
            ) : publishedFlash ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                <Icon name="check_circle" size={14} /> Published successfully
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Unpublished changes dropdown */}
                {hasChanges && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(v => !v)}
                      className="hidden sm:flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors px-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      Unpublished changes
                      <Icon name={showDropdown ? 'expand_less' : 'expand_more'} size={13} className="text-amber-500" />
                    </button>
                    {showDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                        <div className="px-3.5 py-2.5 border-b border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Changed sections</p>
                        </div>
                        <div className="max-h-56 overflow-y-auto py-1.5">
                          {changeSummary.length === 0 ? (
                            <p className="px-3.5 py-2 text-xs text-slate-400">No specific changes detected</p>
                          ) : (
                            changeSummary.map((c, i) => (
                              <div key={i} className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                <span className="text-xs text-slate-700">
                                  <strong>{c.label}</strong>
                                  <span className="text-slate-400"> — {c.property}</span>
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Discard — only when changes */}
                {hasChanges && (
                  <button
                    onClick={handleDiscard}
                    className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Discard
                  </button>
                )}

                {/* Publish — always visible; grey = no changes but can force-sync */}
                <button
                  onClick={handlePublish}
                  disabled={publishing || staleSession}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                  style={{
                    background: (hasChanges && !staleSession) ? 'linear-gradient(135deg, #C84B31, #EA580C)' : '#CBD5E1',
                    color: (hasChanges && !staleSession) ? 'white' : '#64748B',
                    cursor: (publishing || staleSession) ? 'not-allowed' : 'pointer',
                    opacity: (publishing || staleSession) ? 0.6 : 1,
                  }}
                >
                  <Icon name="publish" size={13} />
                  {publishing ? 'Publishing…' : 'Publish'}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
