import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, collection, getCountFromServer, serverTimestamp } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '../../firebase'
import Icon from '../../components/Icon'

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

// ─── Confirmation modal ────────────────────────────────────────────────────

function ConfirmModal({ action, tenantName, onClose, onConfirmed }) {
  const [agreed, setAgreed]     = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  const isDeactivate = action === 'deactivate'
  const isSuspend    = action === 'suspend'
  const isReactivate = action === 'reactivate'

  const config = {
    deactivate: {
      title:    'Deactivate account',
      color:    'text-amber-400',
      border:   'border-amber-700',
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
      border:   'border-red-700',
      bg:       'bg-red-900/20',
      iconBg:   'bg-red-900/50',
      icon:     'warning',
      warning:  `You are about to permanently suspend "${tenantName}". The admin panel and all guidebooks will be locked indefinitely. This cannot be undone without manual intervention.`,
      checkMsg: 'I understand this will permanently suspend the account. All data is preserved — but the account will remain locked until the platform admin manually reactivates it.',
      btnLabel: 'Suspend Account',
      btnStyle: 'bg-red-600 hover:bg-red-500',
      needsAuth: true,
    },
    reactivate: {
      title:    'Reactivate account',
      color:    'text-green-400',
      border:   'border-green-700',
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
      if (c.needsAuth) {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      }
      await onConfirmed()
      onClose()
    } catch (e) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
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
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#1E293B', border: `1px solid`, borderColor: c.border.replace('border-', '') }}>

        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
            <Icon name={c.icon} size={20} className={c.color} />
          </div>
          <div className="flex-1">
            <h2 className={`text-base font-bold ${c.color}`}>{c.title}</h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{c.warning}</p>
          </div>
        </div>

        {/* Data retention notice */}
        {!isReactivate && (
          <div className="rounded-xl px-4 py-3 mb-4 flex items-start gap-2.5" style={{ background: '#0F172A', border: '1px solid #334155' }}>
            <Icon name="shield" size={15} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-indigo-300">Data is never automatically deleted.</span>{' '}
              The tenant can log in at any time to retrieve their data and resume from where they left off.
              Deletion only happens upon explicit request from the tenant, confirmed by the platform admin.
            </p>
          </div>
        )}

        {/* Acknowledgement checkbox */}
        <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer mb-4 ${c.bg}`} style={{ border: `1px solid`, borderColor: '#334155' }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 flex-shrink-0 accent-indigo-500"
          />
          <span className="text-sm text-slate-200 leading-relaxed">{c.checkMsg}</span>
        </label>

        {/* Admin credential verification */}
        {c.needsAuth && (
          <div className="space-y-3 mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm your admin credentials</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your admin email"
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: '#0F172A', border: '1px solid #334155' }}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: '#0F172A', border: '1px solid #334155' }}
            />
          </div>
        )}

        {error && (
          <p className="mb-4 text-xs text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            style={{ border: '1px solid #334155' }}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy || !agreed}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-40 ${c.btnStyle}`}
          >
            {busy ? 'Confirming…' : c.btnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-white">{value || '—'}</p>
    </div>
  )
}

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

export default function TenantDetail() {
  const { tenantId } = useParams()
  const navigate = useNavigate()

  const [tenant, setTenant]   = useState(null)
  const [liveData, setLiveData] = useState(null)
  const [counts, setCounts]   = useState({ checkins: null, checkouts: null })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [modal, setModal]     = useState(null) // 'deactivate' | 'suspend' | 'reactivate'

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
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
      } catch (e) {
        setError('Failed to load: ' + e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tenantId])

  async function applyAction(action) {
    const updates = { status: action === 'reactivate' ? 'active' : action }
    if (action === 'deactivate') updates.deactivatedAt = serverTimestamp()
    if (action === 'suspend')    updates.suspendedAt   = serverTimestamp()
    if (action === 'reactivate') { updates.deactivatedAt = null; updates.suspendedAt = null }
    await updateDoc(doc(db, 'tenants', tenantId), updates)
    setTenant(t => ({ ...t, ...updates, status: updates.status }))
  }

  if (loading) return <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
  if (error)   return <div className="p-8 text-center text-red-400 text-sm">{error}</div>

  const properties  = liveData?.data?.propertyList || []
  const propNames   = liveData?.data?.properties   || {}
  const lastPublish = liveData?.updatedAt
    ? new Date(liveData.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  const isActive      = tenant.status === 'active'
  const isDeactivated = tenant.status === 'deactivated'
  const isSuspended   = tenant.status === 'suspended'
  const daysDeactivated = isDeactivated ? daysSince(tenant.deactivatedAt) : 0
  const canSuspend    = isDeactivated && daysDeactivated >= 30

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

      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/super-admin/dashboard')}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6"
        >
          <Icon name="arrow_back" size={16} />
          All Tenants
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{tenant.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{tenant.slug || tenant.id}</code>
              <StatusBadge status={tenant.status} />
              {isDeactivated && (
                <span className="text-xs text-slate-500">
                  {daysDeactivated === 0 ? 'today' : `${daysDeactivated}d ago`}
                  {!canSuspend && ` · ${30 - daysDeactivated}d until suspend available`}
                </span>
              )}
            </div>
          </div>
          <a
            href="/admin-v3"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            <Icon name="open_in_new" size={15} />
            Open Admin
          </a>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Account info */}
          <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Account</h2>
            <div className="space-y-3">
              <Field label="Plan"           value={cap(tenant.plan)} />
              <Field label="Property limit" value={tenant.propertyLimit >= 999 ? 'Unlimited' : tenant.propertyLimit} />
              <Field label="Owner UID"      value={tenant.ownerUid} />
              <Field label="Created"        value={formatDate(tenant.createdAt)} />
              {isDeactivated && <Field label="Deactivated" value={formatDate(tenant.deactivatedAt)} />}
              {isSuspended   && <Field label="Suspended"   value={formatDate(tenant.suspendedAt)} />}
            </div>
          </div>

          {/* Usage stats */}
          <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Usage</h2>
            <div className="space-y-3">
              <Field label="Properties"     value={`${properties.length} active`} />
              <Field label="Last publish"   value={lastPublish} />
              <Field label="Total check-ins"  value={counts.checkins  === null ? '…' : counts.checkins} />
              <Field label="Total check-outs" value={counts.checkouts === null ? '…' : counts.checkouts} />
            </div>
          </div>

          {/* Properties list */}
          <div className="rounded-2xl p-5 md:col-span-2" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Properties</h2>
            {properties.length === 0 ? (
              <p className="text-sm text-slate-500">No properties published yet.</p>
            ) : (
              <div className="space-y-2">
                {properties.map(p => {
                  const info = propNames[p.slug] || {}
                  return (
                    <div key={p.slug} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #334155' }}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === 'active' ? 'bg-green-500' : 'bg-slate-500'}`} />
                        <span className="text-sm text-white">{info.name || p.slug}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <code className="text-xs text-slate-400">{p.slug}</code>
                        {p.status !== 'active' && (
                          <span className="text-xs text-slate-500 font-semibold uppercase">{p.status}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Data retention policy */}
          <div className="rounded-2xl p-5 md:col-span-2" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <div className="flex items-start gap-3">
              <Icon name="shield" size={18} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-indigo-300 mb-1">Data retention policy</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Tenant data is <span className="text-white font-semibold">never automatically deleted</span> — regardless of account status or how long the account has been inactive.
                  The tenant can log in at any time to retrieve their content, guest records, and settings, and resume operations from exactly where they left off.
                  Data is only deleted upon an explicit written request from the tenant, manually confirmed by the platform admin.
                </p>
              </div>
            </div>
          </div>

          {/* Admin setup instructions */}
          <div className="rounded-2xl p-5 md:col-span-2" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Admin access setup</h2>
            <p className="text-xs text-slate-400 mb-3">
              To bind this tenant's admin account to the platform, run the claims script after creating their Firebase Auth user.
              This will be automated by a Cloud Function in Phase 3.
            </p>
            <code className="block text-xs text-green-400 bg-slate-900 rounded-xl p-3 font-mono">
              node scripts/set-tenant-claims.mjs &lt;admin-email&gt; {tenant.slug || tenant.id}
            </code>
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl p-5 md:col-span-2" style={{ background: '#1E293B', border: '1px solid #7f1d1d' }}>
            <h2 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4">Danger zone</h2>

            <div className="space-y-4">

              {/* Deactivate (active → deactivated) */}
              {isActive && (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Deactivate account</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Locks the admin panel and guidebooks immediately. Data is fully preserved.
                      A "Suspend" option becomes available after 30 days.
                    </p>
                  </div>
                  <button
                    onClick={() => setModal('deactivate')}
                    className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-amber-400 border border-amber-700 hover:bg-amber-900/30 transition-colors"
                  >
                    Deactivate
                  </button>
                </div>
              )}

              {/* Reactivate (deactivated or suspended → active) */}
              {(isDeactivated || isSuspended) && (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Reactivate account</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Restores full access to the admin panel and guidebooks immediately.
                      All data and settings are exactly as the tenant left them.
                    </p>
                  </div>
                  <button
                    onClick={() => setModal('reactivate')}
                    className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-green-400 border border-green-700 hover:bg-green-900/30 transition-colors"
                  >
                    Reactivate
                  </button>
                </div>
              )}

              {/* Suspend (only available 30+ days after deactivation) */}
              {isDeactivated && (
                <>
                  {canSuspend ? (
                    <div className="flex items-start justify-between gap-4 pt-4" style={{ borderTop: '1px solid #7f1d1d' }}>
                      <div>
                        <p className="text-sm font-semibold text-white">Suspend account</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Permanently locks the account indefinitely. Data is still preserved —
                          the tenant can contact you to reactivate at any time.
                        </p>
                      </div>
                      <button
                        onClick={() => setModal('suspend')}
                        className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-700 hover:bg-red-900/30 transition-colors"
                      >
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
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
