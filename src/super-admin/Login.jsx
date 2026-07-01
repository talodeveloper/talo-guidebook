import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import { superAdminSignIn } from '../data/superAdminAuth'

export default function SuperAdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const [forgotMode, setForgotMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetBusy, setResetBusy] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const [resetError, setResetError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await superAdminSignIn(email, password)
      navigate('/super-admin/dashboard')
    } catch (err) {
      setError(err.message || 'Sign in failed.')
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setResetError('')
    setResetBusy(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim())
      setResetDone(true)
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        setResetError('No account found with that email address.')
      } else {
        setResetError('Something went wrong. Please try again.')
      }
    } finally {
      setResetBusy(false)
    }
  }

  const backToSignIn = () => {
    setForgotMode(false)
    setResetDone(false)
    setResetEmail('')
    setResetError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-slate-700 p-8" style={{ background: '#1E293B' }}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-indigo-600">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            {forgotMode ? (
              <>
                <h1 className="text-xl font-bold text-white">Reset password</h1>
                <p className="text-sm text-slate-400 mt-1">We'll send a reset link to your email</p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-white">Platform Admin</h1>
                <p className="text-sm text-slate-400 mt-1">Operator access only</p>
              </>
            )}
          </div>

          {forgotMode ? (
            resetDone ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: '#0F172A' }}>
                  <span className="material-symbols-outlined text-indigo-400" style={{ fontSize: 24 }}>mark_email_read</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Check your inbox at <span className="font-semibold text-white">{resetEmail}</span> — we sent a link to reset your password.
                </p>
                <p className="text-xs text-slate-500">Didn't get it? Check your spam folder or try again.</p>
                <button onClick={backToSignIn}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors mt-2">
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ background: '#0F172A', border: '1px solid #334155' }}
                    required
                    autoFocus
                  />
                </div>
                {resetError && (
                  <p className="text-xs text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">{resetError}</p>
                )}
                <button type="submit" disabled={resetBusy}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50">
                  {resetBusy ? 'Sending…' : 'Send reset link'}
                </button>
                <button type="button" onClick={backToSignIn}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-400 transition-colors">
                  Back to sign in
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ background: '#0F172A', border: '1px solid #334155' }}
                  required
                  autoFocus
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-400">Password</label>
                  <button type="button" onClick={() => { setForgotMode(true); setResetEmail(email) }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ background: '#0F172A', border: '1px solid #334155' }}
                  required
                />
              </div>
              {error && (
                <p className="text-xs text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">{error}</p>
              )}
              <button type="submit" disabled={busy}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50">
                {busy ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-slate-600 mt-4">Talo Rentals Platform · Internal</p>
      </div>
    </div>
  )
}
