import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import Icon from '../../components/Icon'

const RESERVED = new Set(['admin', 'api', 'guidebook', 'app', 'www', 'signup', 'login',
  'account', 'super', 'platform', 'talo', 'support', 'help', 'billing'])

const PLANS = [
  { value: 'starter', label: 'Starter',              limit: 3,   desc: 'Up to 3 properties' },
  { value: 'pro',     label: 'Pro',                  limit: 10,  desc: 'Up to 10 properties' },
  { value: 'founder', label: 'Founder (unlimited)',  limit: 999, desc: 'Unlimited properties' },
]

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}

const LIVE_BASE = 'https://talodeveloper.github.io/talo-guidebook'

export default function CreateTenant() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', slug: '', plan: 'starter', adminEmail: '', phone: '', notes: '' })
  const [slugEdited, setSlugEdited] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  function set(field, value) {
    setForm(f => {
      const next = { ...f, [field]: value }
      if (field === 'name' && !slugEdited) next.slug = toSlug(value)
      return next
    })
  }

  function onSlugChange(v) {
    setSlugEdited(true)
    setForm(f => ({ ...f, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) }))
  }

  const selectedPlan = PLANS.find(p => p.value === form.plan) || PLANS[0]

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const slug = form.slug.trim()
    if (!slug) return setError('Tenant slug is required.')
    if (RESERVED.has(slug)) return setError(`"${slug}" is a reserved slug.`)
    if (!/^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/.test(slug) && slug.length > 1)
      return setError('Slug must be lowercase letters, numbers, and hyphens only.')
    if (!form.adminEmail.trim()) return setError('Admin email is required.')

    setBusy(true)
    try {
      const existing = await getDoc(doc(db, 'slugs', slug))
      if (existing.exists()) {
        setError(`Slug "${slug}" is already taken.`)
        setBusy(false)
        return
      }

      const tenantData = {
        name:          form.name.trim(),
        slug,
        status:        'active',
        plan:          form.plan,
        propertyLimit: selectedPlan.limit,
        adminEmail:    form.adminEmail.trim(),
        phone:         form.phone.trim(),
        notes:         form.notes.trim(),
        createdAt:     serverTimestamp(),
      }

      await setDoc(doc(db, 'tenants', slug), tenantData)
      await setDoc(doc(db, 'slugs', slug), { tenantId: slug })

      setSuccess({ slug, adminEmail: form.adminEmail.trim(), name: form.name.trim() })
    } catch (e) {
      setError('Failed to create tenant: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    const adminUrl   = `${LIVE_BASE}/admin-v3`
    const guidebookBase = `${LIVE_BASE}/v3/${success.slug}/`
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="rounded-2xl p-6" style={{ background: '#1E293B', border: '1px solid #334155' }}>
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-900/50 flex items-center justify-center flex-shrink-0">
              <Icon name="check_circle" size={20} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Tenant created — {success.name}</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Firestore docs written for <code className="text-slate-300">{success.slug}</code>
              </p>
            </div>
          </div>

          {/* Quick reference links */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl p-3" style={{ background: '#0F172A', border: '1px solid #334155' }}>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Admin panel link</p>
              <p className="text-xs text-indigo-300 break-all">{adminUrl}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#0F172A', border: '1px solid #334155' }}>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Guidebook base URL</p>
              <p className="text-xs text-indigo-300 break-all">{guidebookBase}</p>
            </div>
          </div>

          {/* Next steps */}
          <div className="rounded-xl p-4 mb-5" style={{ background: '#0F172A', border: '1px solid #334155' }}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Activation checklist</p>
            <ol className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2.5">
                <span className="text-indigo-400 font-bold flex-shrink-0">1.</span>
                <span>
                  Create a Firebase Auth account for{' '}
                  <span className="text-white font-semibold">{success.adminEmail}</span>{' '}
                  in{' '}
                  <a href="https://console.firebase.google.com/project/talo-guidebook/authentication/users"
                    target="_blank" rel="noopener noreferrer"
                    className="text-indigo-400 underline">
                    Firebase Console → Authentication
                  </a>
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-indigo-400 font-bold flex-shrink-0">2.</span>
                <div>
                  <span>Run the claims script (requires serviceAccountKey.json):</span>
                  <code className="block mt-2 text-xs text-green-400 bg-slate-900 rounded-lg p-3 font-mono">
                    node scripts/set-tenant-claims.mjs {success.adminEmail} {success.slug}
                  </code>
                </div>
              </li>
              <li className="flex gap-2.5">
                <span className="text-indigo-400 font-bold flex-shrink-0">3.</span>
                <span>Send the admin their login link: <span className="text-slate-300">{adminUrl}</span></span>
              </li>
            </ol>
            <p className="text-xs text-slate-500 mt-4">Steps 1–2 will be automated by a Cloud Function in Phase 3.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/super-admin/tenant/${success.slug}`)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              View Tenant
            </button>
            <button
              onClick={() => { setSuccess(null); setForm({ name: '', slug: '', plan: 'starter', adminEmail: '', phone: '', notes: '' }); setSlugEdited(false) }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              style={{ border: '1px solid #334155' }}
            >
              Add Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/super-admin/dashboard')}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6"
      >
        <Icon name="arrow_back" size={16} />
        All Tenants
      </button>

      <h1 className="text-xl font-bold text-white mb-1">Add Tenant</h1>
      <p className="text-sm text-slate-400 mb-6">Creates the Firestore tenant record. Firebase Auth setup is a separate step.</p>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Company info */}
        <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Company</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Company name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Sunrise Rentals"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ background: '#0F172A', border: '1px solid #334155' }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Tenant slug *
                <span className="ml-2 font-normal text-slate-500">— appears in guidebook URLs</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 whitespace-nowrap">…/v3/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => onSlugChange(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ background: '#0F172A', border: '1px solid #334155' }}
                  required
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">/property-name</span>
              </div>
              {RESERVED.has(form.slug) && (
                <p className="mt-1 text-xs text-red-400">This slug is reserved.</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Admin contact</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Admin email *</label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={e => set('adminEmail', e.target.value)}
                placeholder="admin@sunriserentals.com"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ background: '#0F172A', border: '1px solid #334155' }}
                required
              />
              <p className="mt-1 text-xs text-slate-500">This is the login email for the admin panel. Required for sending password resets.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Phone <span className="font-normal text-slate-500">(optional)</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ background: '#0F172A', border: '1px solid #334155' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Internal notes <span className="font-normal text-slate-500">(optional)</span></label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="e.g. Referred by Joe, paying monthly, on Founder trial..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                style={{ background: '#0F172A', border: '1px solid #334155' }}
              />
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className="rounded-2xl p-5" style={{ background: '#1E293B', border: '1px solid #334155' }}>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Plan</h2>
          <div className="space-y-2">
            {PLANS.map(p => (
              <label
                key={p.value}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  form.plan === p.value
                    ? 'bg-indigo-900/40 border border-indigo-700'
                    : 'border hover:bg-slate-700/30'
                }`}
                style={form.plan !== p.value ? { borderColor: '#334155' } : {}}
              >
                <input
                  type="radio"
                  name="plan"
                  value={p.value}
                  checked={form.plan === p.value}
                  onChange={() => set('plan', p.value)}
                  className="accent-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{p.label}</p>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
        >
          {busy ? 'Creating…' : 'Create Tenant'}
        </button>
      </form>
    </div>
  )
}
