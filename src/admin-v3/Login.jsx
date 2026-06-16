import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminV3Store } from '../data/adminV3Store'

export default function AdminV3Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const ok = await adminV3Store.login(email, password)
    setBusy(false)
    if (ok) {
      navigate('/admin-v3/dashboard')
    } else {
      setError('Incorrect email or password.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              <span className="text-white text-xl font-black">T</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">TALO Admin</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to manage your guidebooks</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="joe@talo.ventures"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#C84B31' }}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent"
                required
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}
            >
              Sign In
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">TALO Rentals · Admin Panel v3</p>
      </div>
    </div>
  )
}
