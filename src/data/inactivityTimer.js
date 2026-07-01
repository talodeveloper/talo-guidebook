const WARN_MS   = 12 * 60 * 1000  // show warning at 12 minutes idle
const LOGOUT_MS = 15 * 60 * 1000  // auto-logout at 15 minutes idle
const CHECK_INTERVAL = 30_000      // check every 30 seconds

let _lastActivity = Date.now()
let _timer        = null
let _onWarn       = null
let _onLogout     = null
let _warnFired    = false
let _running      = false

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']

function onActivity() {
  const wasWarning = _warnFired
  _lastActivity = Date.now()
  _warnFired    = false
  // If warning was showing, dismiss it (pass null = dismiss)
  if (wasWarning && _onWarn) _onWarn(null)
}

function check() {
  if (!_running) return
  const idle = Date.now() - _lastActivity

  if (idle >= LOGOUT_MS) {
    if (_onLogout) _onLogout()
    stopInactivityTimer()
    return
  }

  if (idle >= WARN_MS && !_warnFired) {
    _warnFired = true
    const remainingSeconds = Math.ceil((LOGOUT_MS - idle) / 1000)
    if (_onWarn) _onWarn(remainingSeconds)
  }

  _timer = setTimeout(check, CHECK_INTERVAL)
}

export function startInactivityTimer({ onWarn, onLogout }) {
  if (_running) stopInactivityTimer()
  _onWarn       = onWarn
  _onLogout     = onLogout
  _warnFired    = false
  _lastActivity = Date.now()
  _running      = true
  EVENTS.forEach(e => document.addEventListener(e, onActivity, { passive: true }))
  _timer = setTimeout(check, CHECK_INTERVAL)
}

export function stopInactivityTimer() {
  _running = false
  EVENTS.forEach(e => document.removeEventListener(e, onActivity))
  if (_timer) { clearTimeout(_timer); _timer = null }
  _onWarn   = null
  _onLogout = null
}

/** Call when user explicitly stays signed in (resets timer + dismisses banner) */
export function resetInactivityTimer() {
  onActivity()
}

export function getLastActivity() {
  return _lastActivity
}
