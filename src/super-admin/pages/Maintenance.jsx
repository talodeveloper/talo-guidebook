import { useState, useEffect } from 'react'
import { scheduleMaintenance, cancelMaintenance, startMaintenanceNow, watchMaintenance, fmtTime, fmtCountdown } from '../../data/maintenanceStore'
import Icon from '../../components/Icon'

function StatusBadge({ status }) {
  const cfg = {
    none:     { label: 'No maintenance scheduled', dot: 'bg-green-400',  bg: 'bg-green-900/40 text-green-300 border-green-700' },
    upcoming: { label: 'Maintenance scheduled',    dot: 'bg-amber-400',  bg: 'bg-amber-900/40 text-amber-300 border-amber-700' },
    active:   { label: 'Maintenance ACTIVE',       dot: 'bg-red-400 animate-pulse', bg: 'bg-red-900/40 text-red-300 border-red-700' },
    ended:    { label: 'Maintenance ended',        dot: 'bg-slate-400',  bg: 'bg-slate-700/60 text-slate-300 border-slate-600' },
  }
  const c = cfg[status] || cfg.none
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${c.bg}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

// Format a Date object into the value for <input type="datetime-local">
function toDatetimeLocal(ms) {
  if (!ms) return ''
  const d = new Date(ms)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Parse a datetime-local string to ms timestamp (local time)
function fromDatetimeLocal(str) {
  if (!str) return null
  return new Date(str).getTime()
}

export default function MaintenancePage() {
  const [state, setState]       = useState({ status: 'none' })
  const [raw, setRaw]           = useState(null)
  const [tick, setTick]         = useState(0)

  // Schedule form
  const [startStr, setStartStr] = useState('')
  const [endStr, setEndStr]     = useState('')
  const [msg, setMsg]           = useState('')
  const [quickMins, setQuickMins] = useState('60')

  const [busy, setBusy]         = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    const unsub = watchMaintenance((s, r) => { setState(s); setRaw(r) })
    const tick  = setInterval(() => setTick(t => t + 1), 30_000)
    return () => { unsub(); clearInterval(tick) }
  }, [])

  const handleSchedule = async (e) => {
    e.preventDefault()
    setError('')
    const start = fromDatetimeLocal(startStr)
    const end   = fromDatetimeLocal(endStr)
    if (!start || !end) { setError('Please set both start and end times.'); return }
    if (end <= start)   { setError('End time must be after start time.'); return }
    if (start < Date.now() - 60_000) { setError('Start time must be in the future.'); return }
    setBusy(true)
    try {
      await scheduleMaintenance({ scheduledStart: start, scheduledEnd: end, message: msg })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Failed to save. Check console.')
      console.error(err)
    } finally {
      setBusy(false)
    }
  }

  const handleStartNow = async () => {
    const mins = parseInt(quickMins, 10)
    if (!mins || mins < 1) { setError('Enter a valid duration.'); return }
    setBusy(true)
    try {
      await startMaintenanceNow(mins)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Failed to start maintenance.')
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('End maintenance now? Tenant admins will regain access immediately.')) return
    setBusy(true)
    try { await cancelMaintenance() }
    catch (err) { setError('Failed to cancel maintenance.') }
    finally { setBusy(false) }
  }

  const isActive   = state.status === 'active'
  const isUpcoming = state.status === 'upcoming'

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Maintenance Mode</h1>
        <p className="text-sm text-slate-400">
          Schedule a platform maintenance window. All tenant admins will see a countdown banner,
          then a full-screen maintenance page when it starts. Guest guidebooks are never affected.
        </p>
      </div>

      {/* Current status */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: '#1E293B', border: '1px solid #334155' }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-slate-300">Current Status</p>
          <StatusBadge status={state.status} />
        </div>

        {(isActive || isUpcoming) && raw && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Starts</span>
              <span className="text-white font-semibold">{fmtTime(raw.scheduledStart)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Ends</span>
              <span className="text-white font-semibold">{fmtTime(raw.scheduledEnd)}</span>
            </div>
            {isUpcoming && (
              <div className="flex justify-between text-slate-400">
                <span>Starts in</span>
                <span className="text-amber-400 font-bold">{fmtCountdown(raw.scheduledStart)}</span>
              </div>
            )}
            {isActive && (
              <div className="flex justify-between text-slate-400">
                <span>Ends in</span>
                <span className="text-red-400 font-bold">{fmtCountdown(raw.scheduledEnd)}</span>
              </div>
            )}
            {raw.message && (
              <div className="flex justify-between text-slate-400">
                <span>Message</span>
                <span className="text-white text-right max-w-xs">{raw.message}</span>
              </div>
            )}
          </div>
        )}

        {state.status === 'none' && (
          <p className="text-sm text-slate-500">No maintenance is scheduled. Tenant admins have full access.</p>
        )}
        {state.status === 'ended' && (
          <p className="text-sm text-slate-500">The last maintenance window has ended. You can schedule a new one below.</p>
        )}

        {(isActive || isUpcoming) && (
          <button
            onClick={handleCancel}
            disabled={busy}
            className="mt-4 w-full py-2 rounded-xl text-sm font-bold text-red-300 border border-red-800 hover:bg-red-900/30 transition-colors disabled:opacity-50"
          >
            {isActive ? 'End Maintenance Now' : 'Cancel Scheduled Maintenance'}
          </button>
        )}
      </div>

      {/* Quick start */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{ background: '#1E293B', border: '1px solid #334155' }}
      >
        <p className="text-sm font-bold text-slate-300 mb-3">Start Immediately</p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1.5">Duration (minutes)</label>
            <input
              type="number"
              min="5"
              max="480"
              value={quickMins}
              onChange={e => setQuickMins(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm text-white bg-slate-800 border border-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleStartNow}
            disabled={busy}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Start Now
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">Tenant admins will see the maintenance screen immediately.</p>
      </div>

      {/* Scheduled window form */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#1E293B', border: '1px solid #334155' }}
      >
        <p className="text-sm font-bold text-slate-300 mb-4">Schedule a Window</p>
        <form onSubmit={handleSchedule} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Start time (local)</label>
              <input
                type="datetime-local"
                value={startStr}
                onChange={e => setStartStr(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-sm text-white bg-slate-800 border border-slate-600 focus:outline-none focus:border-indigo-500"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">End time (local)</label>
              <input
                type="datetime-local"
                value={endStr}
                onChange={e => setEndStr(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-sm text-white bg-slate-800 border border-slate-600 focus:outline-none focus:border-indigo-500"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Custom message (optional)</label>
            <input
              type="text"
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="e.g. We're upgrading the platform. Back soon!"
              className="w-full px-3 py-2 rounded-xl text-sm text-white bg-slate-800 border border-slate-600 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            {saved ? '✓ Scheduled' : busy ? 'Saving…' : 'Schedule Maintenance'}
          </button>
        </form>

        <div
          className="mt-4 rounded-xl px-4 py-3 text-xs text-slate-400 leading-relaxed"
          style={{ background: '#0F172A' }}
        >
          <strong className="text-slate-300">What happens:</strong>
          <ul className="mt-1.5 space-y-1 list-disc list-inside">
            <li>24h before start → tenant admins see a countdown banner</li>
            <li>At start → tenant admins see the full maintenance screen</li>
            <li>At end → access restored automatically</li>
            <li>Guest guidebooks are never blocked at any point</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
