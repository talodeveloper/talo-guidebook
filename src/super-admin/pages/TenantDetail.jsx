import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, collection, getCountFromServer } from 'firebase/firestore'
import { db } from '../../firebase'

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-white">{value || '—'}</p>
    </div>
  )
}

function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function TenantDetail() {
  const { tenantId } = useParams()
  const navigate = useNavigate()

  const [tenant, setTenant] = useState(null)
  const [liveData, setLiveData] = useState(null)
  const [counts, setCounts] = useState({ checkins: null, checkouts: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toggling, setToggling] = useState(false)

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

        if (liveSnap.exists()) {
          setLiveData(liveSnap.data())
        }

        // Guest record counts (best-effort — may fail if rules block it)
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

  async function toggleStatus() {
    const next = tenant.status === 'active' ? 'suspended' : 'active'
    if (!window.confirm(`${next === 'suspended' ? 'Suspend' : 'Activate'} tenant "${tenant.name}"?`)) return
    setToggling(true)
    try {
      await updateDoc(doc(db, 'tenants', tenantId), { status: next })
      setTenant(t => ({ ...t, status: next }))
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setToggling(false)
    }
  }

  const properties = liveData?.data?.propertyList || []
  const propNames = liveData?.data?.properties || {}
  const lastPublish = liveData?.updatedAt
    ? new Date(liveData.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  if (loading) return (
    <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
  )
  if (error) return (
    <div className="p-8 text-center text-red-400 text-sm">{error}</div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/super-admin/dashboard')}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6"
      >
        <span style={{ fontFamily: 'Material Icons', fontSize: 16 }}>arrow_back</span>
        All Tenants
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{tenant.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{tenant.slug || tenant.id}</code>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${
              tenant.status === 'active' ? 'bg-green-900/50 text-green-400 border-green-800' : 'bg-red-900/50 text-red-400 border-red-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
              {tenant.status}
            </span>
          </div>
        </div>
        <a
          href="/admin-v3"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <span style={{ fontFamily: 'Material Icons', fontSize: 15 }}>open_in_new</span>
          Open Admin
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Profile */}
        <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Account</h2>
          <div className="space-y-3">
            <Field label="Plan" value={tenant.plan} />
            <Field label="Property limit" value={tenant.propertyLimit >= 999 ? 'Unlimited' : tenant.propertyLimit} />
            <Field label="Owner UID" value={tenant.ownerUid} />
            <Field label="Created" value={formatDate(tenant.createdAt)} />
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Usage</h2>
          <div className="space-y-3">
            <Field label="Properties" value={`${properties.length} active`} />
            <Field label="Last publish" value={lastPublish} />
            <Field label="Total check-ins" value={counts.checkins === null ? '…' : counts.checkins} />
            <Field label="Total check-outs" value={counts.checkouts === null ? '…' : counts.checkouts} />
          </div>
        </div>

        {/* Properties */}
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

        {/* Setup instructions — shown until Cloud Functions replace this */}
        <div className="rounded-2xl p-5 md:col-span-2" style={{ background: '#1E293B', border: '1px solid #334155' }}>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Admin access setup</h2>
          <p className="text-xs text-slate-400 mb-3">
            To give this tenant's admin user access, their Firebase Auth account needs tenant claims set.
            This will be automated in Phase 3 (Cloud Functions). Until then, run manually:
          </p>
          <code className="block text-xs text-green-400 bg-slate-900 rounded-xl p-3 font-mono">
            node scripts/set-tenant-claims.mjs &lt;admin-email&gt; {tenant.slug || tenant.id}
          </code>
          <p className="text-xs text-slate-500 mt-2">Requires serviceAccountKey.json in the project root.</p>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl p-5 md:col-span-2" style={{ background: '#1E293B', border: '1px solid #7f1d1d' }}>
          <h2 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">Danger zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-semibold">
                {tenant.status === 'active' ? 'Suspend tenant' : 'Activate tenant'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {tenant.status === 'active'
                  ? 'Locks the admin panel immediately. Guidebook stays live for now (3-day grace once billing is wired).'
                  : 'Re-enables admin access for this tenant.'}
              </p>
            </div>
            <button
              onClick={toggleStatus}
              disabled={toggling}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 ${
                tenant.status === 'active'
                  ? 'border border-red-700 text-red-400 hover:bg-red-900/30'
                  : 'border border-green-700 text-green-400 hover:bg-green-900/30'
              }`}
            >
              {toggling ? '…' : tenant.status === 'active' ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
