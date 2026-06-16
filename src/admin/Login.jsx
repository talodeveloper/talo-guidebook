import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminStore } from '../data/adminStore'
import Icon from '../components/Icon'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('saari.joseph@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    const ok = await adminStore.login(email, password)
    setLoading(false)
    if (ok) {
      navigate('/admin/dashboard', { replace: true })
    } else {
      setError('Invalid email or password. Demo: use password "talo2026"')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-container flex items-center justify-center p-5">
      <div className="bg-surface-container-lowest rounded-3xl shadow-teal-lg w-full max-w-md p-8 md:p-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
            <Icon name="home_work" size={24} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-primary text-headline-md">Talo Rentals</p>
            <p className="text-on-surface-variant text-label-sm">Admin Portal</p>
          </div>
        </div>

        <h1 className="text-headline-lg font-bold text-on-surface mb-1">Welcome back</h1>
        <p className="text-on-surface-variant text-body-md mb-8">Sign in to manage your properties</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-label-md font-semibold text-on-surface mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-label-md font-semibold text-on-surface mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password…"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <p className="text-label-sm text-on-surface-variant mt-1.5">Demo password: <code className="bg-surface-container px-1.5 py-0.5 rounded text-primary font-mono">talo2026</code></p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-body-md flex items-start gap-2">
              <Icon name="error" size={18} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-xl text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing in…
              </>
            ) : (
              <>
                <Icon name="login" size={18} className="text-white" /> Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-label-sm text-on-surface-variant mt-8">
          Guest guidebooks are public — no login required.
        </p>
      </div>
    </div>
  )
}
