import { db } from '../firebase'
import { doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore'

const ref = () => doc(db, '_platform', 'maintenance')

/** Derive status from raw Firestore data + current time */
export function getMaintenanceState(data) {
  if (!data?.scheduledStart || !data?.scheduledEnd) return { status: 'none' }
  const now = Date.now()
  if (now >= data.scheduledStart && now < data.scheduledEnd) return { status: 'active',    ...data }
  if (now < data.scheduledStart)                             return { status: 'upcoming',  ...data }
  return { status: 'ended', ...data }
}

/** Subscribe to maintenance state. Callback fires on every change with (state, rawData). */
export function watchMaintenance(callback) {
  return onSnapshot(ref(),
    snap => callback(getMaintenanceState(snap.exists() ? snap.data() : null), snap.exists() ? snap.data() : null),
    ()   => callback({ status: 'none' }, null)
  )
}

/** Super-admin: schedule a maintenance window */
export async function scheduleMaintenance({ scheduledStart, scheduledEnd, message = '' }) {
  await setDoc(ref(), { scheduledStart, scheduledEnd, message, createdAt: Date.now() })
}

/** Super-admin: start maintenance immediately for N minutes */
export async function startMaintenanceNow(durationMinutes) {
  const now = Date.now()
  await setDoc(ref(), { scheduledStart: now, scheduledEnd: now + durationMinutes * 60_000, message: '', createdAt: now })
}

/** Super-admin: cancel/end maintenance */
export async function cancelMaintenance() {
  try { await deleteDoc(ref()) } catch {}
}

/** Format ms timestamp as "Thu Jan 3 · 2:00 PM" */
export function fmtTime(ms) {
  if (!ms) return ''
  const d = new Date(ms)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/** Format ms timestamp as just "2:00 PM" */
export function fmtTimeSh(ms) {
  if (!ms) return ''
  return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/** "2d 3h 40m" countdown from now to target ms */
export function fmtCountdown(targetMs) {
  const diff = Math.max(0, targetMs - Date.now())
  const totalMin = Math.floor(diff / 60_000)
  const days  = Math.floor(totalMin / 1440)
  const hours = Math.floor((totalMin % 1440) / 60)
  const mins  = totalMin % 60
  const parts = []
  if (days > 0)  parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  parts.push(`${mins}m`)
  return parts.join(' ')
}
