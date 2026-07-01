import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, deleteDoc, collection, getCountFromServer, serverTimestamp } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '../../firebase'
import Icon from '../../components/Icon'
import { forceLogoutTenant } from '../../data/sessionStore'

const LIVE_BASE = 'https://talodeveloper.github.io/talo-guidebook'

const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'

function daysSince(ts) {
  if (!ts) return 0
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDateShort(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Copy button ──────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button onClick={copy} className="ml-1.5 text-slate-500 hover:text-indigo-400 transition-colors flex-shrink-0" title="Copy">
      <Icon name={copied ? 'check' : 'content_copy'} size={13} />
    </button>
  )
}

// ─── Confirmation modal ───────────────────────────────────────────────────
function ConfirmModal({ action, tenantName, onClose, onConfirmed }) {
  const [agreed, setAgreed]     = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  const config = {
    deactivate: {
      title:    'Deactivate account',
      color:    'text-amber-400',
      border:   '#92400e',
      bg:       'bg-amber-900/20',
      iconBg:   'bg-amber-900/50',
      icon:     'block',
      warning:  `You are about to deactivate "${tenantName}". Their admin panel and all guidebooks will be locked immediately.`,
      checkMsg: 'I understand this will lock the account. All data is fully preserved — the account can be reactivated at any time with no data loss.',
      btnLabel: 'Deactivate Account',
      btnStyle: 'bg-amber-600 hover:bg-amber-500',
      needsAuth: true,
    },
    suspend: {
      title:    'Suspend account',
      color:    'text-red-400',
      border:   '#991b1b',
      bg:       'bg-red-900/20',
      iconBg:   'bg-red-900/50',
      icon:     'warning',
      warning:  `You are about to permanently suspend "${tenantName}". The admin panel and all guidebooks will be locked indefinitely.`,
      checkMsg: 'I understand this will permanently suspend the account. All data is preserved — but the account will remain locked until manually reactivated.',
      btnLabel: 'Suspend Account',
      btnStyle: 'bg-red-600 hover:bg-red-500',
      needsAuth: true,
    },
    reactivate: {
      title:    'Reactivate account',
      color:    'text-green-400',
      border:   '#166534',
      bg:       'bg-green-900/20',
      iconBg:   'bg-green-900/50',
      icon:     'check_circle',
      warning:  `You are about to reactivate "${tenantName}". Their admin panel and guidebooks will become accessible immediately.`,
      checkMsg: 'I understand this will restore full access to this account.',
      btnLabel: 'Reactivate Account',
      btnStyle: 'bg-green-600 hover:bg-green-500',
      needsAuth: false,
    },
  }

  const c = config[action]

  async function handleConfirm() {
    if (!agreed) { setError('Please check the acknowledgement box first.'); return }
    if (c.needsAuth && (!email.trim() || !password)) {
      setError('Please enter your admin email and password to confirm.')
      return
    }
    setError('')
    setBusy(true)
    try {
      if (c.needsAuth) await signInWithEmailAndPassword(auth, email.trim(), password)
      await onConfirmed()
      onClose()
    } catch (e) {
      if (['auth/invalid-credential','auth/wrong-password','auth/user-not-found'].includes(e.code)) {
        setError('Incorrect email or password. Please try again.')
      } else {
        setError(e.message || 'Something went wrong.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#1E293B', border: `1px solid ${c.border}` }}>
        <div className="flex items-start gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
            <Icon name={c.icon} size={20} className={c.color} />
          </div>
          <div className="flex-1">
            <h2 className={`text-base font-bold ${c.color}`}>{c.title}</h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{c.warning}</p>
          </div>
        </div>

        {action !== 'reactivate' && (
          <div className="rounded-xl px-4 py-3 mb-4 flex items-start gap-2.5" style={{ background: '#0F172A', border: '1px solid #334155' }}>
            <Icon name="shield" size={15} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-indigo-300">Data is never automatically deleted.</span>{' '}
              The tenant can log in at any time to retrieve their data and resume. Deletion only happens upon explicit tenant request.
            </p>
          </div>
        )}

        <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer mb-4 ${c.bg}`} style={{ border: '1px solid #334155' }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 flex-shrink-0 accent-indigo-500" />
          <span className="text-sm text-slate-200 leading-relaxed">{c.checkMsg}</span>
        </label>

        {c.needsAuth && (
          <div className="space-y-3 mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm your admin credentials</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your admin email"
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: '#0F172A', border: '1px solid #334155' }} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password"
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: '#0F172A', border: '1px solid #334155' }} />
          </div>
        )}

        {error && <p className="mb-4 text-xs text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} disabled={busy}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            style={{ border: '1px solid #334155' }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={busy || !agreed}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-40 ${c.btnStyle}`}>
            {busy ? 'Confirming…' : c.btnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    active:      'bg-green-900/50 text-green-400 border-green-800',
    deactivated: 'bg-amber-900/50 text-amber-400 border-amber-800',
    suspended:   'bg-red-900/50 text-red-400 border-red-800',
  }
  const dots = { active: 'bg-green-400', deactivated: 'bg-amber-400', suspended: 'bg-red-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-slate-400'}`} />
      {cap(status)}
    </span>
  )
}

// ─── Editable contact section ─────────────────────────────────────────────
function ContactEditor({ tenant, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ adminEmail: tenant.adminEmail || '', phone: tenant.phone || '', notes: tenant.notes || '' })
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')

  async function save() {
    if (!form.adminEmail.trim()) { setError('Admin email is required.'); return }
    setError('')
    setBusy(true)
    try {
      await updateDoc(doc(db, 'tenants', tenant.id), {
        adminEmail: form.adminEmail.trim(),
        phone:      form.phone.trim(),
        notes:      form.notes.trim(),
      })
      onSaved({ adminEmail: form.adminEmail.trim(), phone: form.phone.trim(), notes: form.notes.trim() })
      setEditing(false)
    } catch (e) {
      setError('Save failed: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  function cancel() {
    setForm({ adminEmail: tenant.adminEmail || '', phone: tenant.phone || '', notes: tenant.notes || '' })
    setError('')
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact info</h2>
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
            <Icon name="edit" size={13} />
            Edit
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Admin login email</p>
            <div className="flex items-center">
              <p className="text-sm text-white font-mono break-all">{tenant.adminEmail || <span className="text-slate-500 font-sans italic">Not set</span>}</p>
              {tenant.adminEmail && <CopyButton text={tenant.adminEmail} />}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Send this address a Firebase password reset if the admin is locked out.</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Phone</p>
            <p className="text-sm text-white">{tenant.phone || <span className="text-slate-500 italic">Not set</span>}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Internal notes</p>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{tenant.notes || <span className="text-slate-500 italic">None</span>}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #6366f1' }}>
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Edit contact info</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Admin login email *</label>
          <input type="email" value={form.adminEmail} onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ background: '#0F172A', border: '1px solid #334155' }} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Phone</label>
          <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ background: '#0F172A', border: '1px solid #334155' }} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Internal notes</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            style={{ background: '#0F172A', border: '1px solid #334155' }} />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button onClick={save} disabled={busy}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50">
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button onClick={cancel}
            className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
            style={{ border: '1px solid #334155' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete modal ─────────────────────────────────────────────────────────
function DeleteModal({ tenantSlug, onClose, onDeleted }) {
  const [typedSlug, setTypedSlug]   = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [busy, setBusy]             = useState(false)

  const slugMatch = typedSlug.trim() === tenantSlug

  async function handleDelete() {
    if (!slugMatch) { setError('Slug does not match.'); return }
    if (!email.trim() || !password) { setError('Please enter your admin email and password to confirm.'); return }
    setError('')
    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      await onDeleted()
      onClose()
    } catch (e) {
      if (['auth/invalid-credential','auth/wrong-password','auth/user-not-found'].includes(e.code)) {
        setError('Incorrect email or password. Please try again.')
      } else {
        setError(e.message || 'Something went wrong.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#1E293B', border: '1px solid #991b1b' }}>
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-900/50">
            <Icon name="delete_forever" size={20} className="text-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-red-400">Delete tenant</h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              This is <span className="font-semibold text-white">permanent and cannot be undone.</span> All guidebook content, settings, and configuration will be erased immediately.
            </p>
          </div>
        </div>

        <div className="rounded-xl px-4 py-3 mb-4 flex items-start gap-2.5" style={{ background: '#0F172A', border: '1px solid #334155' }}>
          <Icon name="warning" size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-300 leading-relaxed">
            Guest check-in/check-out records and uploaded images in Firebase Storage are <span className="font-semibold text-white">not</span> automatically removed. If full cleanup is needed, delete them manually from the Firebase Console.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Type <span className="text-red-300 font-mono">{tenantSlug}</span> to confirm deletion
          </label>
          <input
            type="text"
            value={typedSlug}
            onChange={e => setTypedSlug(e.target.value)}
            placeholder={tenantSlug}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            style={{ background: '#0F172A', border: `1px solid ${slugMatch ? '#dc2626' : '#334155'}` }}
          />
        </div>

        <div className="space-y-3 mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm your admin credentials</p>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your admin email"
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            style={{ background: '#0F172A', border: '1px solid #334155' }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password"
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            style={{ background: '#0F172A', border: '1px solid #334155' }} />
        </div>

        {error && <p className="mb-4 text-xs text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} disabled={busy}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            style={{ border: '1px solid #334155' }}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={busy || !slugMatch || !email.trim() || !password}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-40 bg-red-700 hover:bg-red-600">
            {busy ? 'Deleting…' : 'Delete tenant'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function TenantDetail() {
  const { tenantId } = useParams()
  const navigate     = useNavigate()

  const [tenant, setTenant]     = useState(null)
  const [liveData, setLiveData] = useState(null)
  const [counts, setCounts]     = useState({ checkins: null, checkouts: null })
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [modal, setModal]           = useState(null)
  const [showDelete, setShowDelete] = useState(false)
  const [forceLogoutBusy, setForceLogoutBusy]   = useState(false)
  const [forceLogoutDone, setForceLogoutDone]   = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true); setError('')
      try {
        const [tenantSnap, liveSnap] = await Promise.all([
          getDoc(doc(db, 'tenants', tenantId)),
          getDoc(doc(db, 'tenants', tenantId, 'data', 'live')),
        ])
        if (!tenantSnap.exists()) { setError('Tenant not found.'); setLoading(false); return }
        setTenant({ id: tenantSnap.id, ...tenantSnap.data() })
        if (liveSnap.exists()) setLiveData(liveSnap.data())
        try {
          const [ci, co] = await Promise.all([
            getCountFromServer(collection(db, 'tenants', tenantId, 'checkins')),
            getCountFromServer(collection(db, 'tenants', tenantId, 'checkouts')),
          ])
          setCounts({ checkins: ci.data().count, checkouts: co.data().count })
        } catch {
          setCounts({ checkins: 'n/a', checkouts: 'n/a' })
        }
      } catch (e) { setError('Failed to load: ' + e.message) }
      finally { setLoading(false) }
    }
    load()
  }, [tenantId])

  async function applyAction(action) {
    const updates = { status: action === 'reactivate' ? 'active' : action }
    if (action === 'deactivate') updates.deactivatedAt = serverTimestamp()
    if (action === 'suspend')    updates.suspendedAt   = serverTimestamp()
    if (action === 'reactivate') { updates.deactivatedAt = null; updates.suspendedAt = null }
    await updateDoc(doc(db, 'tenants', tenantId), updates)
    setTenant(t => ({ ...t, ...updates }))
  }

  async function deleteTenant() {
    const slug = tenant.slug || tenant.id
    await Promise.all([
      deleteDoc(doc(db, 'tenants', tenantId)),
      deleteDoc(doc(db, 'slugs', slug)),
    ])
    navigate('/super-admin/dashboard')
  }

  if (loading) return <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
  if (error)   return <div className="p-8 text-center text-red-400 text-sm">{error}</div>

  const properties  = liveData?.data?.propertyList || []
  const propNames   = liveData?.data?.properties   || {}
  const lastPublish = liveData?.updatedAt
    ? new Date(liveData.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  const isActive      = tenant.status === 'active'
  const isDeactivated = tenant.status === 'deactivated'
  const isSuspended   = tenant.status === 'suspended'
  const daysDeactivated = isDeactivated ? daysSince(tenant.deactivatedAt) : 0
  const canSuspend    = isDeactivated && daysDeactivated >= 30

  const adminUrl      = `${LIVE_BASE}/admin-v3`
  const guidebookBase = `${LIVE_BASE}/v3/${tenant.slug || tenant.id}/`

  const planMeta = {
    founder: { label: 'Founder', color: 'text-indigo-300', badge: 'bg-indigo-900/30 border-indigo-700 text-indigo-300' },
    pro:     { label: 'Pro',     color: 'text-amber-300',  badge: 'bg-amber-900/30 border-amber-700 text-amber-300' },
    starter: { label: 'Starter', color: 'text-slate-300',  badge: 'bg-slate-700 border-slate-600 text-slate-300' },
  }[tenant.plan] || { label: cap(tenant.plan), color: 'text-slate-300', badge: 'bg-slate-700 border-slate-600 text-slate-300' }

  return (
    <>
      {modal && (
        <ConfirmModal
          action={modal}
          tenantName={tenant.name}
          onClose={() => setModal(null)}
          onConfirmed={() => applyAction(modal)}
        />
      )}
      {showDelete && (
        <DeleteModal
          tenantSlug={tenant.slug || tenant.id}
          onClose={() => setShowDelete(false)}
          onDeleted={deleteTenant}
        />
      )}

      <div className="p-6 max-w-4xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate('/super-admin/dashboard')}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6">
          <Icon name="arrow_back" size={16} />
          All Tenants
        </button>

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">{tenant.name}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <code className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{tenant.slug || tenant.id}</code>
            <StatusBadge status={tenant.status} />
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${planMeta.badge}`}>{planMeta.label}</span>
            {isDeactivated && (
              <span className="text-xs text-slate-500">
                deactivated {daysDeactivated === 0 ? 'today' : `${daysDeactivated}d ago`}
                {!canSuspend && ` · ${30 - daysDeactivated}d until suspend available`}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* ── Access links (full width) ── */}
          <div className="rounded-2xl p-5 md:col-span-2" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Access links</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              <div className="rounded-xl p-3.5" style={{ background: '#0F172A', border: '1px solid #334155' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon name="admin_panel_settings" size={14} className="text-indigo-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin panel login</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-indigo-300 break-all">{adminUrl}</p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <CopyButton text={adminUrl} />
                    <a href={adminUrl} target="_blank" rel="noopener noreferrer"
                      className="text-slate-500 hover:text-indigo-400 transition-colors ml-1" title="Open">
                      <Icon name="open_in_new" size={13} />
                    </a>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Share when admin forgets their login URL</p>
              </div>

              <div className="rounded-xl p-3.5" style={{ background: '#0F172A', border: '1px solid #334155' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon name="menu_book" size={14} className="text-green-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guidebook base URL</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-green-300 break-all">{guidebookBase}</p>
                  <CopyButton text={guidebookBase} />
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Append property slug — e.g. <span className="text-slate-400">beach-house</span></p>
              </div>

            </div>
          </div>

          {/* ── Contact info (editable) ── */}
          <ContactEditor
            tenant={tenant}
            onSaved={updates => setTenant(t => ({ ...t, ...updates }))}
          />

          {/* ── Account details ── */}
          <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Account</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Status</p>
                <StatusBadge status={tenant.status} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Plan</p>
                <p className={`text-sm font-semibold ${planMeta.color}`}>{planMeta.label}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Property limit</p>
                <p className="text-sm text-white">{tenant.propertyLimit >= 999 ? 'Unlimited' : `${tenant.propertyLimit} properties`}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Account created</p>
                <p className="text-sm text-white">{formatDateShort(tenant.createdAt)}</p>
              </div>
              {isDeactivated && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Deactivated on</p>
                  <p className="text-sm text-amber-400">{formatDate(tenant.deactivatedAt)}</p>
                </div>
              )}
              {isSuspended && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Suspended on</p>
                  <p className="text-sm text-red-400">{formatDate(tenant.suspendedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Usage stats ── */}
          <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Usage</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Active properties</p>
                <p className="text-sm text-white">
                  {properties.length}
                  <span className="text-slate-500"> / {tenant.propertyLimit >= 999 ? '∞' : tenant.propertyLimit}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Last published</p>
                <p className="text-sm text-white">{lastPublish || <span className="text-slate-500 italic">Never published</span>}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Total guest check-ins</p>
                <p className="text-sm text-white">{counts.checkins === null ? '…' : counts.checkins}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Total guest check-outs</p>
                <p className="text-sm text-white">{counts.checkouts === null ? '…' : counts.checkouts}</p>
              </div>
            </div>
          </div>

          {/* ── Billing context ── */}
          <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Billing</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Current plan</p>
                <p className={`text-sm font-semibold ${planMeta.color}`}>{planMeta.label}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Data retention</p>
                <p className="text-xs text-slate-400">Data is <span className="text-white font-semibold">never auto-deleted</span>, regardless of payment or account status. See policy below.</p>
              </div>
              <div className="rounded-xl px-3 py-2.5" style={{ background: '#0F172A', border: '1px solid #334155' }}>
                <p className="text-xs text-slate-500 leading-relaxed">
                  <Icon name="info" size={13} className="inline mr-1.5 align-text-bottom" />
                  Stripe payment integration is coming in Phase 4. Billing history and subscription management will appear here once connected.
                </p>
              </div>
            </div>
          </div>

          {/* ── Properties list ── */}
          <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Properties <span className="font-normal text-slate-600 normal-case">({properties.length})</span>
            </h2>
            {properties.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No properties published yet.</p>
            ) : (
              <div>
                {properties.map((p, i) => {
                  const info    = propNames[p.slug] || {}
                  const propUrl = `${guidebookBase}${p.slug}`
                  return (
                    <div key={p.slug} className="flex items-center justify-between py-2.5"
                      style={{ borderTop: i > 0 ? '1px solid rgba(51,65,85,0.5)' : 'none' }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === 'active' ? 'bg-green-500' : 'bg-slate-500'}`} />
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{info.name || p.slug}</p>
                          <code className="text-[10px] text-slate-500">{p.slug}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <CopyButton text={propUrl} />
                        <a href={propUrl} target="_blank" rel="noopener noreferrer"
                          className="text-slate-500 hover:text-indigo-400 transition-colors ml-1" title="Open guidebook">
                          <Icon name="open_in_new" size={13} />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Data retention policy (full width) ── */}
          <div className="rounded-2xl p-5 md:col-span-2" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <div className="flex items-start gap-3">
              <Icon name="shield" size={18} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-indigo-300 mb-1">Data retention policy</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Tenant data is <span className="text-white font-semibold">never automatically deleted</span> — regardless of account status, plan, or how long the account has been inactive.
                  The tenant can log in at any time to retrieve their content, guest records, and settings, and resume from exactly where they left off.
                  Data is only deleted upon an explicit written request from the tenant, manually confirmed by the platform admin.
                </p>
              </div>
            </div>
          </div>

          {/* ── Admin setup instructions ── */}
          <div className="rounded-2xl p-5 md:col-span-2" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Admin access setup</h2>
            <p className="text-xs text-slate-400 mb-3">
              To bind this tenant's admin account to the platform, run the claims script after creating their Firebase Auth user.
              This will be automated by a Cloud Function in Phase 3.
            </p>
            <code className="block text-xs text-green-400 bg-slate-900 rounded-xl p-3 font-mono break-all">
              node scripts/set-tenant-claims.mjs {tenant.adminEmail || '<admin-email>'} {tenant.slug || tenant.id}
            </code>
          </div>

          {/* ── Danger zone ── */}
          <div className="rounded-2xl p-5 md:col-span-2" style={{ background: '#1E293B', border: '1px solid #7f1d1d' }}>
            <h2 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4">Danger zone</h2>
            <div className="space-y-4">

              {isActive && (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Deactivate account</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Locks the admin panel and guidebooks immediately. Data is fully preserved.
                      "Suspend" becomes available after 30 days.
                    </p>
                  </div>
                  <button onClick={() => setModal('deactivate')}
                    className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-amber-400 border border-amber-700 hover:bg-amber-900/30 transition-colors">
                    Deactivate
                  </button>
                </div>
              )}

              {(isDeactivated || isSuspended) && (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Reactivate account</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Restores full access immediately. All data and settings are exactly as the tenant left them.
                    </p>
                  </div>
                  <button onClick={() => setModal('reactivate')}
                    className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-green-400 border border-green-700 hover:bg-green-900/30 transition-colors">
                    Reactivate
                  </button>
                </div>
              )}

              {isDeactivated && (
                canSuspend ? (
                  <div className="flex items-start justify-between gap-4 pt-4" style={{ borderTop: '1px solid #7f1d1d' }}>
                    <div>
                      <p className="text-sm font-semibold text-white">Suspend account</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Permanently locks the account indefinitely. Data is preserved — tenant can contact you to reactivate.
                      </p>
                    </div>
                    <button onClick={() => setModal('suspend')}
                      className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-700 hover:bg-red-900/30 transition-colors">
                      Suspend
                    </button>
                  </div>
                ) : (
                  <div className="pt-4" style={{ borderTop: '1px solid #334155' }}>
                    <p className="text-xs text-slate-500">
                      <Icon name="schedule" size={13} className="inline mr-1 align-text-bottom" />
                      "Suspend" becomes available {30 - daysDeactivated} day{30 - daysDeactivated !== 1 ? 's' : ''} after deactivation.
                    </p>
                  </div>
                )
              )}

              {/* ── Force logout all sessions ── */}
              <div className="flex items-start justify-between gap-4 pt-4" style={{ borderTop: '1px solid #7f1d1d' }}>
                <div>
                  <p className="text-sm font-semibold text-white">Force sign out all sessions</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Immediately signs out every active admin session for this tenant.
                    Any unpublished changes on their end will be lost — notify them first.
                  </p>
                  {forceLogoutDone && (
                    <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                      <Icon name="check_circle" size={12} /> Done — all sessions have been signed out.
                    </p>
                  )}
                </div>
                <button
                  onClick={async () => {
                    if (!window.confirm(`Sign out all active sessions for "${tenant.name}"?\n\nAny unpublished changes they have will be lost. Make sure you've notified them first.`)) return
                    setForceLogoutBusy(true)
                    setForceLogoutDone(false)
                    try {
                      await forceLogoutTenant(tenantId)
                      setForceLogoutDone(true)
                      setTimeout(() => setForceLogoutDone(false), 5000)
                    } catch (e) {
                      window.alert('Force logout failed: ' + e.message)
                    } finally {
                      setForceLogoutBusy(false)
                    }
                  }}
                  disabled={forceLogoutBusy}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-orange-400 border border-orange-700 hover:bg-orange-900/30 transition-colors disabled:opacity-50">
                  <Icon name="logout" size={14} />
                  {forceLogoutBusy ? 'Signing out…' : 'Force Sign Out'}
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 pt-4" style={{ borderTop: '1px solid #7f1d1d' }}>
                <div>
                  <p className="text-sm font-semibold text-white">Delete tenant</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Permanently erases all Firestore data for this tenant. This cannot be undone.
                    Guest records and Storage files must be removed separately from the Firebase Console.
                  </p>
                </div>
                <button onClick={() => setShowDelete(true)}
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-700 bg-red-900/20 hover:bg-red-900/40 transition-colors">
                  Delete
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  )
}
