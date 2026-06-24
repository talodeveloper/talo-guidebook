import { useState } from 'react'
import { Link } from 'react-router-dom'
import { tenantOrigin } from '../data/tenant'

const BRAND = 'linear-gradient(135deg, #C84B31, #EA580C)'

// Apex login is a router to each tenant's own admin: Firebase sessions don't
// span subdomains, so the actual sign-in happens on the tenant's subdomain.
export default function WorkspaceLogin() {
  const [slug, setSlug] = useState('')
  const [error, setError] = useState('')

  function go(e) {
    e.preventDefault()
    const s = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!s) { setError('Enter your workspace name.'); return }
    window.location.href = `${tenantOrigin(s)}/admin-v3`
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
          <h1 className="text-xl font-bold text-slate-900 mb-1">Go to your workspace</h1>
          <p className="text-sm text-slate-500 mb-6">Enter your workspace name and we'll take you to its sign-in page.</p>

          <form onSubmit={go} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Workspace</label>
              <div className="flex items-center gap-1.5">
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
                  placeholder="sunrise" autoFocus
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                <span className="text-sm text-slate-400 whitespace-nowrap">.talo.llc</span>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: BRAND }}>
              Continue
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-4">
            You'll sign in (and can reset your password) on your workspace's own page.
          </p>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          New to Talo? <Link to="/signup" className="font-semibold text-orange-600 hover:underline">Create a workspace</Link>
        </p>
      </div>
    </div>
  )
}
