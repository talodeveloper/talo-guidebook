import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import { adminV3Store } from '../data/adminV3Store'
import { initSession, takeOverSession, watchChallenge, SESSION_ID, TAKEOVER_MS } from '../data/sessionStore'

const BRAND = 'linear-gradient(135deg, #C84B31, #EA580C)'

const TILES = [
  { url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=400&q=75', label: 'Santorini, Greece' },
  { url: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=400&q=75', label: 'Maldives' },
  { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=75', label: 'Paris, France' },
  { url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=75', label: 'Bali, Indonesia' },
  { url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=400&q=75', label: 'Venice, Italy' },
  { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=75', label: 'Tokyo, Japan' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=75', label: 'Swiss Alps' },
  { url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=400&q=75', label: 'Northern Lights' },
  { url: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=400&q=75', label: 'Machu Picchu' },
  { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=75', label: 'Dubai, UAE' },
  { url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=75', label: 'Colosseum, Rome' },
  { url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=75', label: 'New York City' },
  { url: 'https://images.unsplash.com/photo-1509233725247-49e657319fde?auto=format&fit=crop&w=400&q=75', label: 'Amalfi Coast' },
  { url: 'https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&w=400&q=75', label: 'Cappadocia, Turkey' },
  { url: 'https://images.unsplash.com/photo-1520769945061-0a448c463865?auto=format&fit=crop&w=400&q=75', label: 'Phuket, Thailand' },
  { url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=400&q=75', label: 'Beach House' },
  { url: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?auto=format&fit=crop&w=400&q=75', label: 'Ocean View Villa' },
  { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=75', label: 'Lake Como, Italy' },
  { url: 'https://images.unsplash.com/photo-1467226632440-65f0b4957563?auto=format&fit=crop&w=400&q=75', label: 'Great Wall, China' },
  { url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=400&q=75', label: 'Tulum, Mexico' },
]

function PageBackground({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Destination tile grid */}
      <div
        className="absolute inset-0 grid"
        style={{ gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: '3px' }}
      >
        {TILES.map((t, i) => (
          <div
            key={i}
            className="relative overflow-hidden"
            style={{ background: `hsl(${(i * 37) % 360}, 40%, 25%)` }}
          >
            <img
              src={t.url}
              alt={t.label}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scale(1.05)', transition: 'transform 8s ease' }}
              onLoad={e => { e.target.style.transform = 'scale(1.0)' }}
            />
          </div>
        ))}
      </div>
      {/* Dark radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.82) 100%)' }}
      />
      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}

// ── Challenge waiting screen ──────────────────────────────────────────────────
function ChallengeWaiting({ challengeData, onCancel }) {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(null)
  const [resolved, setResolved]   = useState(false)
  const unsubRef = useRef(null)

  useEffect(() => {
    unsubRef.current = watchChallenge(async (data) => {
      if (data.challengeResolved === 'stayed') {
        setResolved(true)
        return
      }

      if (data.sessionId && data.sessionId !== SESSION_ID && !data.challengeId) {
        return
      }

      const challengeAt = data.challengeAt || Date.now()
      const remaining   = Math.max(0, Math.ceil((challengeAt + TAKEOVER_MS - Date.now()) / 1000))
      setCountdown(remaining)

      if (remaining <= 0) {
        if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
        await takeOverSession()
        navigate('/admin-v3/dashboard')
      }
    })

    return () => { if (unsubRef.current) unsubRef.current() }
  }, [navigate])

  useEffect(() => {
    if (resolved || countdown === null || countdown <= 0) return
    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(tick); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [resolved, countdown])

  if (resolved) {
    return (
      <PageBackground>
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.45)',
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 24 }}>lock_person</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mb-2">Sign-in declined</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            The active session chose to stay signed in — they may have unpublished changes they need to save first.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5 text-left">
            <p className="text-xs font-semibold text-slate-700 mb-1">What to do next:</p>
            <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>If this is a team member — contact them directly and ask them to sign out.</li>
              <li>If you believe this is unauthorized access — ask your super-admin to force sign out all sessions from the admin panel.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <button
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: BRAND }}>
              Back to Sign In
            </button>
            <a
              href="mailto:support@talo.llc"
              className="block w-full py-2.5 rounded-xl text-sm font-semibold text-center text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
        <p className="text-center text-xs text-white/50 mt-4">TALO Rentals · Admin Panel v3</p>
      </PageBackground>
    )
  }

  return (
    <PageBackground>
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.45)',
        }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: BRAND }}>
          <span className="text-white text-xl font-black">T</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900 mb-2">Admin panel is open elsewhere</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-5">
          This account is currently signed in on another device or tab.
          They've been notified — you'll be signed in automatically once they're inactive.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 mb-6">
          {countdown === null ? (
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
              Checking activity…
            </div>
          ) : countdown > 0 ? (
            <>
              <p className="text-xs text-slate-400 mb-1">Signing in automatically in</p>
              <p className="text-3xl font-black text-slate-800">
                {countdown}
                <span className="text-base font-semibold text-slate-400 ml-1">sec</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                (resets if the other session is still active)
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 text-orange-600 text-sm font-semibold">
              <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
              Signing you in…
            </div>
          )}
        </div>

        <button
          onClick={onCancel}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors">
          Cancel — Back to Sign In
        </button>
      </div>
      <p className="text-center text-xs text-white/50 mt-4">TALO Rentals · Admin Panel v3</p>
    </PageBackground>
  )
}

// ── Main login form ───────────────────────────────────────────────────────────
export default function AdminV3Login() {
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

  const [challengeData, setChallengeData] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const result = await adminV3Store.login(email, password)
    setBusy(false)

    if (result === 'deactivated' || result === 'suspended') {
      navigate('/admin-v3/dashboard')
      return
    }

    if (result === true) {
      const session = await initSession()
      if (session.status === 'ok') {
        if (session.wasForceReset) {
          await adminV3Store.forceReset()
        }
        navigate('/admin-v3/dashboard')
      } else {
        setChallengeData(session.data)
      }
      return
    }

    setError('Incorrect email or password.')
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

  if (challengeData) {
    return (
      <ChallengeWaiting
        challengeData={challengeData}
        onCancel={() => setChallengeData(null)}
      />
    )
  }

  return (
    <PageBackground>
      <div
        className="rounded-2xl p-8"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.45)',
        }}
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: BRAND }}>
            <span className="text-white text-xl font-black">T</span>
          </div>
          {forgotMode ? (
            <>
              <h1 className="text-xl font-bold text-slate-900">Reset password</h1>
              <p className="text-sm text-slate-500 mt-1">We'll send a reset link to your email</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-slate-900">Welcome</h1>
              <p className="text-sm text-slate-500 mt-1">Sign in to manage your guidebooks</p>
            </>
          )}
        </div>

        {forgotMode ? (
          resetDone ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-green-600" style={{ fontSize: 24 }}>mark_email_read</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Check your inbox at <span className="font-semibold">{resetEmail}</span> — we sent a link to reset your password.
              </p>
              <p className="text-xs text-slate-400">Didn't get it? Check your spam folder or try again.</p>
              <button onClick={backToSignIn}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 mt-2"
                style={{ background: BRAND }}>
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent"
                  required
                  autoFocus
                />
              </div>
              {resetError && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{resetError}</p>}
              <button type="submit" disabled={resetBusy}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: BRAND }}>
                {resetBusy ? 'Sending…' : 'Send reset link'}
              </button>
              <button type="button" onClick={backToSignIn}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                Back to sign in
              </button>
            </form>
          )
        ) : (
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600">Password</label>
                <button type="button" onClick={() => { setForgotMode(true); setResetEmail(email) }}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent"
                required
              />
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={busy}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: BRAND }}>
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
      <p className="text-center text-xs text-white/50 mt-4">TALO Rentals · Admin Panel v3</p>
    </PageBackground>
  )
}
