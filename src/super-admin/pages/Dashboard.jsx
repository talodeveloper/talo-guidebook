import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
import Icon from '../../components/Icon'

const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'

function StatusBadge({ status }) {
  const styles = {
    active:      'bg-green-900/50 text-green-400 border-green-800',
    deactivated: 'bg-amber-900/50 text-amber-400 border-amber-800',
    suspended:   'bg-red-900/50 text-red-400 border-red-800',
  }
  const dots = {
    active:      'bg-green-400',
    deactivated: 'bg-amber-400',
    suspended:   'bg-red-400',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-slate-400'}`} />
      {cap(status)}
    </span>
  )
}

function PlanBadge({ plan }) {
  const styles = {
    founder: 'bg-indigo-900/50 text-indigo-300 border-indigo-700',
    pro:     'bg-amber-900/50 text-amber-300 border-amber-700',
    starter: 'bg-slate-700 text-slate-300 border-slate-600',
  }
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[plan] || styles.starter}`}>
      {cap(plan)}
    </span>
  )
}

function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const snap = await getDocs(collection(db, 'tenants'))
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => {
        const ta = a.createdAt?.toDate?.() || new Date(0)
        const tb = b.createdAt?.toDate?.() || new Date(0)
        return tb - ta
      })
      setTenants(list)
    } catch (e) {
      setError('Failed to load tenants: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const active      = tenants.filter(t => t.status === 'active').length
  const deactivated = tenants.filter(t => t.status === 'deactivated').length
  const suspended   = tenants.filter(t => t.status === 'suspended').length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Tenants</h1>
          <p className="text-sm text-slate-400 mt-0.5">All accounts on the platform</p>
        </div>
        <button
          onClick={() => navigate('/super-admin/create-tenant')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <Icon name="add" size={16} />
          Add Tenant
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total tenants', value: tenants.length },
          { label: 'Active',        value: active },
          { label: 'Deactivated',   value: deactivated },
          { label: 'Suspended',     value: suspended },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm text-red-400 border border-red-800" style={{ background: 'rgb(127 29 29 / 0.3)' }}>
          {error}
          <button onClick={load} className="ml-3 underline">Retry</button>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: '#1E293B', border: '1px solid #334155' }}>
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading tenants…</div>
        ) : tenants.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No tenants yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Tenant', 'Slug', 'Plan', 'Status', 'Created', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map((t, i) => (
                <tr
                  key={t.id}
                  style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(51,65,85,0.5)' }}
                  className="hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    {t.propertyLimit < 999 && (
                      <p className="text-xs text-slate-500">{t.propertyLimit} property limit</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded">{t.slug || t.id}</code>
                  </td>
                  <td className="px-4 py-3"><PlanBadge plan={t.plan} /></td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-sm text-slate-400">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/super-admin/tenant/${t.id}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                      style={{ border: '1px solid #334155' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && (
        <button onClick={load} className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          <Icon name="refresh" size={14} />
          Refresh
        </button>
      )}
    </div>
  )
}
