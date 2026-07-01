import { useState, useEffect } from 'react'
import { fmtTimeSh, fmtCountdown } from '../data/maintenanceStore'

// Curated destination photos — mix of 7 wonders, beach houses, ocean views, iconic cities
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

export default function MaintenanceScreen({ scheduledEnd, message }) {
  const [tick, setTick] = useState(0)

  // Tick every minute to update countdown
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const remaining = fmtCountdown(scheduledEnd)
  const backBy    = fmtTimeSh(scheduledEnd)

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Destination tile grid (background) ────────────────────────────── */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          gap: '3px',
        }}
      >
        {TILES.map((t, i) => (
          <div
            key={i}
            className="relative overflow-hidden"
            style={{
              background: `hsl(${(i * 37) % 360}, 40%, 25%)`,  // fallback gradient colour
            }}
          >
            <img
              src={t.url}
              alt={t.label}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scale(1.05)', transition: 'transform 8s ease' }}
              onLoad={e => { e.target.style.transform = 'scale(1.0)' }}
            />
            {/* Subtle hover label */}
            <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 opacity-0 hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.55)' }}>
              <p className="text-white text-[9px] font-medium truncate">{t.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Dark gradient overlay ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.82) 100%)',
        }}
      />

      {/* ── Centre card ───────────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-3xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.45)',
          }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>

          {/* Logo wordmark */}
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-white/50 mb-2">TALO Rentals</p>

          {/* Headline */}
          <h1 className="text-2xl font-black text-white leading-tight mb-3">
            Platform Under<br />Maintenance
          </h1>

          {/* Message */}
          {message ? (
            <p className="text-sm text-white/70 leading-relaxed mb-6">{message}</p>
          ) : (
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              We're making improvements to give you a better experience.
              Your live guidebooks are unaffected and guests can still access them.
            </p>
          )}

          {/* Back time */}
          {scheduledEnd && (
            <div
              className="rounded-2xl px-5 py-4 mb-6"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-1">We'll be back</p>
              <p className="text-2xl font-black text-white">{backBy}</p>
              {remaining && (
                <p className="text-sm text-white/60 mt-1">in approximately {remaining}</p>
              )}
            </div>
          )}

          {/* Footer note */}
          <p className="text-[11px] text-white/35 leading-relaxed">
            Questions? Contact your platform administrator.
          </p>
        </div>
      </div>

      {/* ── Top label ────────────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
          style={{ background: 'rgba(200,75,49,0.85)', color: 'white', backdropFilter: 'blur(8px)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
          Maintenance in progress
        </div>
      </div>
    </div>
  )
}
