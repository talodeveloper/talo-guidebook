import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '../firebase'
import { tenantOrigin } from '../data/tenant'

const BRAND = 'linear-gradient(135deg, #C84B31, #EA580C)'

const PLANS = [
  { value: 'starter', label: 'Starter', desc: 'Up to 3 properties' },
  { value: 'pro',     label: 'Pro',     desc: 'Up to 10 properties' },
  { value: 'founder', label: 'Founder', desc: 'Unlimited properties' },
]

const RESERVED = new Set(['admin', 'api', 'guidebook', 'app', 'www', 'signup', 'login',
  'account', 'super', 'platform', 'talo', 'support', 'help', 'billing', 'sd'])

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}

export default function Signup() {
  const [form, setForm] = useState({ company: '', email: '', password: '', slug: '', plan: 'starter' })
  const [slugEdited, setSlugEdited] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null) // { slug }

  function set(field, value) {
    setForm(f => {
      const next = { ...f, [field]: value }
      if (field === 'company' && !slugEdited) next.slug = toSlug(value)
      return next
    })
  }

  function onSlug(v) {
    setSlugEdited(true)
    setForm(f => ({ ...f, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const slug = form.slug.trim()
    if (!form.company.trim()) return setError('Please enter your company name.')
    if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug)) return setError('Subdomain must be 3–40 lowercase letters, numbers, or hyphens.')
    if (RESERVED.has(slug)) return setError(`"${slug}" is reserved — please choose another.`)
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')

    setBusy(true)
    try {
      // 1. Create the Firebase Auth account (signs in on this apex origin)
      await createUserWithEmailAndPassword(auth, form.email.trim(), form.password)
      // 2. Provision the tenant + grant owner access (Cloud Function)
      const provision = httpsCallable(functions, 'provisionTenant')
      const res = await provision({ companyName: form.company.trim(), slug, plan: form.plan })
      setDone({ slug: res.data?.slug || slug })
    } catch (err) {
      const code = err?.code || err?.message || ''
      if (code.includes('email-already-in-use')) {
        setError('That email already has an account. Try logging in instead.')
      } else if (code.includes('already-exists')) {
        setError('That subdomain is taken — please choose another.')
      } else if (code.includes('failed-precondition')) {
        setError('This account already has a workspace. Try logging in.')
      } else if (code.includes('invalid-argument')) {
        setError(err.message || 'Please check your details and try again.')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    const url = `${tenantOrigin(done.slug)}/admin-v3`
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-green-600" style={{ fontSize: 28 }}>check_circle</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Your workspace is ready!</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            We've set up <span className="font-semibold text-slate-700">{done.slug}.talo.llc</span>.
            Head to your admin panel and sign in with the email and password you just created.
          </p>
          <a href={url}
            className="block w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: BRAND }}>
            Go to my admin panel
          </a>
          <p className="text-xs text-slate-400 mt-3 break-all">{url}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: BRAND }}>
            <span className="text-white text-lg font-black">T</span>
          </div>
          <span className="text-lg font-bold text-slate-900">Talo</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Create your workspace</h1>
          <p className="text-sm text-slate-500 mb-6">Free during beta — no credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company name</label>
              <input type="text" value={form.company} onChange={e => set('company', e.target.value)}
                placeholder="Sunrise Rentals" required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your address</label>
              <div className="flex items-center gap-1.5">
                <input type="text" value={form.slug} onChange={e => onSlug(e.target.value)}
                  placeholder="sunrise" required
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                <span className="text-sm text-slate-400 whitespace-nowrap">.talo.llc</span>
              </div>
              {RESERVED.has(form.slug) && <p className="mt-1 text-xs text-red-500">That subdomain is reserved.</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@company.com" required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="At least 6 characters" required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Plan</label>
              <div className="space-y-2">
                {PLANS.map(p => (
                  <label key={p.value}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${
                      form.plan === p.value ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="plan" value={p.value} checked={form.plan === p.value}
                      onChange={() => set('plan', p.value)} className="accent-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{p.label}</p>
                      <p className="text-xs text-slate-500">{p.desc}</p>
                    </div>
                    <span className="text-xs font-semibold text-green-600">Free in beta</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">Payment will be added later — nothing is charged now.</p>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={busy}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: BRAND }}>
              {busy ? 'Creating your workspace…' : 'Create workspace'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account? <Link to="/login" className="font-semibold text-orange-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
