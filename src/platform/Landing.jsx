import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

const BRAND  = 'linear-gradient(135deg, #C84B31, #EA580C)'
const SUNSET = 'linear-gradient(135deg, #7C2D12 0%, #C84B31 30%, #EA580C 58%, #F97316 78%, #FCD34D 100%)'

const BLUR_WIDTHS = [92, 78, 88, 65, 82, 70, 90, 60]

const FEATURES = [
  { icon: 'bolt',         title: 'Live in 3 minutes',  body: 'Publish instantly from a simple admin panel.',           accent: '#C84B31', bg: '#2A1A10' },
  { icon: 'phone_iphone', title: 'No app needed',      body: "Guests open a link — that's it. Works on every phone.", accent: '#4A8FD4', bg: '#0E1A28' },
  { icon: 'public',       title: 'Your own address',   body: 'yourname.talo.llc — clean, branded, and secure.',       accent: '#3A9A5A', bg: '#0E1E10' },
]

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#1C1C1E', color: 'white' }}>

      {/* Nav */}
      <header style={{ background: 'rgba(28,28,30,0.96)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid #2A2A2C', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: BRAND }}>
              <span className="text-white font-black text-sm">T</span>
            </div>
            <div className="leading-none">
              <div className="text-white font-bold" style={{ letterSpacing: '0.15em', fontSize: '15px' }}>TALO</div>
              <div className="mt-0.5" style={{ fontSize: '9px', color: '#888', letterSpacing: '0.04em' }}>Means "House" in Finnish</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7">
            <a href="#how-it-works" className="text-sm font-medium" style={{ color: 'white' }}>How it works</a>
            <a href="#pricing"      className="text-sm font-medium" style={{ color: 'white' }}>Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login"
              className="text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ color: 'white', border: '0.5px solid #3A3A3C' }}>
              Log in
            </Link>
            <Link to="/signup"
              className="text-sm font-bold px-4 py-2 rounded-lg"
              style={{ background: BRAND, color: 'white' }}>
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 flex flex-col md:flex-row items-start gap-12 md:gap-16">

          {/* LEFT — Headline + CTA + compact features */}
          <div className="flex-1 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(200,75,49,0.12)', border: '0.5px solid rgba(200,75,49,0.3)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C84B31' }} />
              <span className="text-xs font-semibold" style={{ color: '#EA580C' }}>Short-term rental guidebooks</span>
            </div>

            <h1 className="font-black leading-[1.08] mb-5"
              style={{ fontSize: 'clamp(32px, 5vw, 54px)', letterSpacing: '-1.5px', color: 'white' }}>
              Guidebooks your<br />
              <span style={{ background: BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                guests actually
              </span>
              <br />use.
            </h1>

            <p className="text-base leading-relaxed mb-7 max-w-md" style={{ color: 'white', opacity: 0.7 }}>
              One link. Check-in details, house rules, local tips, activities — all in one beautiful mobile-ready page. No app needed.
            </p>

            <Link to="/signup"
              className="font-bold text-sm px-6 py-3.5 rounded-xl mb-10"
              style={{ background: BRAND, color: 'white' }}>
              Get started free →
            </Link>

            {/* Compact feature list */}
            <div className="flex flex-col gap-6 w-full" id="how-it-works">
              {FEATURES.map(f => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: f.bg }}>
                    <Icon name={f.icon} size={16} style={{ color: f.accent }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-0.5" style={{ color: 'white' }}>{f.title}</div>
                    <div className="text-sm leading-relaxed" style={{ color: 'white', opacity: 0.6 }}>{f.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Phone mockup with full Jackson welcome section */}
          <div className="flex-shrink-0 flex items-start justify-center" style={{ perspective: '1200px' }}>
            <div style={{
              width: '250px',
              height: '520px',
              borderRadius: '40px',
              background: '#2A2A2C',
              border: '2px solid #3A3A3C',
              boxShadow: '0 0 0 1px #1C1C1E, 0 40px 80px rgba(0,0,0,0.5), 0 20px 40px rgba(200,75,49,0.1)',
              overflow: 'hidden',
              position: 'relative',
              transform: 'rotateY(-6deg) rotateX(2deg)',
            }}>
              {/* Notch */}
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '80px', height: '24px', background: '#2A2A2C',
                borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px',
                zIndex: 20,
              }} />

              {/* Phone screen */}
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#FFF7ED' }}>

                {/* Hero image — fills top portion */}
                <div style={{ height: '190px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src="/photos/jackson-st/a4d681eb-0abb-4176-b4e0-e6a95ccad8e9.jpeg"
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
                  />
                  {/* Dark overlay so tabs are readable */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.6) 100%)',
                  }} />
                  {/* TALO badge */}
                  <div style={{
                    position: 'absolute', top: '28px', right: '12px',
                    fontSize: '10px', fontWeight: 900, letterSpacing: '0.3em',
                    color: 'rgba(255,255,255,0.85)',
                  }}>TALO</div>
                  {/* Tab strip */}
                  <div style={{
                    position: 'absolute', bottom: '10px', left: '10px', right: '10px',
                    display: 'flex', gap: '5px', flexWrap: 'wrap',
                  }}>
                    {['The Home', 'Rules', 'Tips', 'Activities'].map((tab, i) => (
                      <span key={tab} style={{
                        fontSize: '8px', fontWeight: 600,
                        padding: '3px 8px', borderRadius: '20px',
                        background: i === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)',
                        color:      i === 0 ? '#1C0F06' : '#EEE',
                      }}>{tab}</span>
                    ))}
                  </div>
                </div>

                {/* Welcome section body */}
                <div style={{ padding: '14px 14px 0', background: '#FFF7ED', overflow: 'hidden' }}>
                  {/* Section header */}
                  <div style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em',
                    color: '#C84B31', textTransform: 'uppercase', marginBottom: '10px',
                  }}>Welcome</div>

                  {/* Blurred text lines */}
                  {BLUR_WIDTHS.map((w, i) => (
                    <div key={i} style={{
                      width: `${w}%`, height: '6px', borderRadius: '3px',
                      background: 'rgba(28,15,6,0.14)', filter: 'blur(2.5px)',
                      marginBottom: '7px',
                    }} />
                  ))}

                  {/* Section divider */}
                  <div style={{ height: '0.5px', background: 'rgba(200,75,49,0.2)', margin: '12px 0' }} />

                  {/* Check-in card */}
                  <div style={{
                    borderRadius: '10px', overflow: 'hidden',
                    border: '1px solid rgba(200,75,49,0.15)', background: 'white',
                    marginBottom: '8px',
                  }}>
                    <div style={{ background: SUNSET, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '9px' }}>🗝️</span>
                      <span style={{ fontSize: '8px', fontWeight: 700, color: 'white' }}>Check-in Instructions</span>
                    </div>
                    <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {[80, 65, 72].map((w, i) => (
                        <div key={i} style={{
                          width: `${w}%`, height: '5px', borderRadius: '3px',
                          background: 'rgba(28,15,6,0.1)', filter: 'blur(2px)',
                        }} />
                      ))}
                    </div>
                  </div>

                  {/* Wi-Fi card */}
                  <div style={{
                    borderRadius: '10px', overflow: 'hidden',
                    border: '1px solid rgba(200,75,49,0.15)', background: 'white',
                  }}>
                    <div style={{ background: '#FFF1E6', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '5px', borderBottom: '1px solid rgba(200,75,49,0.1)' }}>
                      <span style={{ fontSize: '9px' }}>📶</span>
                      <span style={{ fontSize: '8px', fontWeight: 700, color: '#C84B31' }}>Wi-Fi</span>
                    </div>
                    <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {[55, 40].map((w, i) => (
                        <div key={i} style={{
                          width: `${w}%`, height: '5px', borderRadius: '3px',
                          background: 'rgba(28,15,6,0.1)', filter: 'blur(2px)',
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle red glow */}
            <div style={{
              position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
              width: '160px', height: '24px', borderRadius: '50%',
              background: 'rgba(200,75,49,0.18)', filter: 'blur(18px)',
              pointerEvents: 'none',
            }} />
          </div>
        </section>
      </main>

      <div id="pricing" />

      {/* Footer */}
      <footer style={{ borderTop: '0.5px solid #2A2A2C', background: '#161618' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="text-xs" style={{ color: 'white', opacity: 0.4 }}>© {new Date().getFullYear()} Talo Rentals</span>
          <Link to="/signup" className="text-xs font-semibold" style={{ color: 'white', opacity: 0.6 }}>Get started →</Link>
        </div>
      </footer>

    </div>
  )
}
