import React, { useState } from 'react'
import { useOutletContext, useParams, Link } from 'react-router-dom'
import { FAQ_DATA } from '../../data/faqData'
import { SECTIONS } from '../../data/sections'
import Icon from '../../components/Icon'
import { NightModeCtx, V2RightSidebar } from './V2GuidebookPage'

// ─── Day theme constants ───────────────────────────────────────────────────
const SUNSET    = 'linear-gradient(135deg, #7C2D12 0%, #C84B31 30%, #EA580C 58%, #F97316 78%, #FCD34D 100%)'
const OCEAN     = 'linear-gradient(135deg, #0C4A6E 0%, #0369A1 50%, #0284C7 100%)'
const PRIMARY   = '#C84B31'
const TEXT      = '#1C0F06'
const MUTED     = '#78716C'
const BORDER    = 'rgba(200,80,50,0.12)'
const CARD_BG   = '#FFFFFF'
const SAND_BG   = '#FFF7ED'

// ─── Night theme constants ─────────────────────────────────────────────────
const N_SUNSET    = 'linear-gradient(135deg, #1E1B4B 0%, #312E81 35%, #4F46E5 65%, #7C3AED 100%)'
const N_PRIMARY   = '#818CF8'
const N_TEXT      = '#E2E8F0'
const N_MUTED     = '#94A3B8'
const N_BORDER    = 'rgba(99,102,241,0.20)'
const N_CARD_BG   = '#111827'
const N_SAND_BG   = '#0B1120'

const MAIN_SECTIONS = SECTIONS.filter((s) => s.key !== 'checkout' && s.key !== 'videos')

// ─── FAQ accordion item ────────────────────────────────────────────────────
function FAQItem({ item, index, open, onToggle, nightMode, cardBg, cardBorder, primary, textColor, mutedColor }) {
  const numBg = nightMode
    ? 'linear-gradient(135deg, #4338CA, #6D28D9)'
    : 'linear-gradient(135deg, #C84B31, #EA580C)'
  const hoverBg = nightMode ? 'rgba(99,102,241,0.08)' : 'rgba(249,115,22,0.06)'
  const dividerColor = nightMode ? 'rgba(99,102,241,0.12)' : 'rgba(251,146,60,0.15)'

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: `1px solid ${cardBorder}`, background: cardBg }}>
      <button
        onClick={onToggle}
        className="faq-question-btn w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors"
        style={{ background: open ? hoverBg : 'transparent' }}
        onMouseEnter={e => e.currentTarget.style.background = hoverBg}
        onMouseLeave={e => e.currentTarget.style.background = open ? hoverBg : 'transparent'}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
            style={{ background: numBg }}>
            {index + 1}
          </span>
          <span className="font-semibold text-[14px] leading-snug pr-2" style={{ color: textColor }}>{item.q}</span>
        </div>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={20}
          className="faq-chevron" style={{ color: primary, flexShrink: 0 }} />
      </button>
      {/* Answer — always in DOM, hidden via CSS when closed; print forces visible */}
      <div className="faq-answer" style={{ display: open ? 'block' : 'none', borderTop: `1px solid ${dividerColor}` }}>
        <p className="px-5 pb-4 pt-1 text-[14px] leading-relaxed pl-10" style={{ color: mutedColor }}>{item.a}</p>
      </div>
    </div>
  )
}

export default function V2FAQPage() {
  const { property, nightMode } = useOutletContext()
  const { slug } = useParams()
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = FAQ_DATA[slug] || []
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  const bg         = nightMode ? N_SAND_BG : SAND_BG
  const cardBg     = nightMode ? N_CARD_BG : CARD_BG
  const cardBorder = nightMode ? N_BORDER  : 'rgba(251,146,60,0.3)'
  const headerGrad = nightMode ? N_SUNSET  : SUNSET
  const primary    = nightMode ? N_PRIMARY : PRIMARY
  const textColor  = nightMode ? N_TEXT    : TEXT
  const mutedColor = nightMode ? N_MUTED   : MUTED
  const border     = nightMode ? N_BORDER  : BORDER
  const mapsUrl    = `https://maps.google.com/?q=${encodeURIComponent(property.address)}`

  const topLevelSections = MAIN_SECTIONS.filter((s) => !s.parentKey)

  return (
    <NightModeCtx.Provider value={nightMode}>
      <div className="min-h-screen" style={{ background: bg }}>

        {/* Header bar — matches home page hero gradient */}
        <div className="relative overflow-hidden" style={{ background: headerGrad }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)'
          }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-white/25" />
          <div className="faq-page-header relative z-10 px-6 py-4 flex items-center justify-between">
            <Link
              to={`/v2/${slug}`}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-[13px] font-semibold"
            >
              <Icon name="arrow_back" size={16} className="text-white/80" />
              Back to Guidebook
            </Link>
            <span className="text-white font-black text-lg tracking-[0.35em] uppercase">TALO</span>
          </div>
        </div>

        {/* ── Three-column layout ── */}
        <div className="px-4 md:px-6 lg:px-10 xl:px-16 py-6">
          <div className="flex gap-5 lg:gap-7 items-start">

            {/* Left TOC (desktop) */}
            <aside className="faq-left-toc hidden md:block w-48 lg:w-56 flex-shrink-0 sticky top-4 self-start">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-2" style={{ color: mutedColor }}>Contents</p>
              <nav className="space-y-0.5">
                {topLevelSections.map((s) => (
                  <Link
                    key={s.key}
                    to={`/v2/${slug}#${s.key}`}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors"
                    style={{ color: mutedColor, fontWeight: 500 }}
                    onMouseEnter={e => { e.currentTarget.style.color = primary; e.currentTarget.style.background = `${primary}12` }}
                    onMouseLeave={e => { e.currentTarget.style.color = mutedColor; e.currentTarget.style.background = 'transparent' }}
                  >
                    <Icon name={s.icon} size={14} style={{ color: mutedColor }} />
                    <span className="truncate">{s.label}</span>
                  </Link>
                ))}
                {/* FAQ + Checkout links */}
                <div className="pt-2 mt-1" style={{ borderTop: `1px solid ${border}` }}>
                  {/* FAQ — highlighted as active page */}
                  <div
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-bold"
                    style={{
                      color: nightMode ? '#A78BFA' : '#D97706',
                      background: nightMode ? 'rgba(109,40,217,0.15)' : 'rgba(253,230,138,0.3)',
                    }}
                  >
                    <Icon name="help" size={14} style={{ color: nightMode ? '#A78BFA' : '#D97706' }} />
                    <span>FAQ</span>
                  </div>
                  <Link to={`/v2/${slug}/checkout`}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors"
                    style={{ color: mutedColor }}
                    onMouseEnter={e => { e.currentTarget.style.color = primary }}
                    onMouseLeave={e => { e.currentTarget.style.color = mutedColor }}
                  >
                    <Icon name="logout" size={14} />
                    <span>Check-Out</span>
                  </Link>
                </div>
              </nav>
            </aside>

            {/* Center — FAQ content */}
            <main className="flex-1 min-w-0">
              {/* Page title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
                    style={{ background: nightMode ? 'linear-gradient(135deg, #4338CA, #6D28D9)' : 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
                    <Icon name="help" size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: primary }}>
                      Frequently Asked Questions
                    </p>
                    <h1 className="text-2xl font-bold" style={{ color: textColor }}>{property.name}</h1>
                    <p className="text-[12px] mt-0.5" style={{ color: mutedColor }}>
                      {faqs.length} questions · Tap any question to see the answer
                    </p>
                  </div>
                </div>
                {/* Contact buttons */}
                <div className="faq-contact-btns flex gap-2 flex-shrink-0">
                  <a href="tel:+16082393574"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white shadow-sm"
                    style={{ background: nightMode ? 'linear-gradient(135deg, #4338CA, #6D28D9)' : 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
                    <Icon name="phone" size={13} className="text-white" /> Call Joe
                  </a>
                  <a href="mailto:saari.joseph@gmail.com"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-colors"
                    style={{ border: `1px solid ${cardBorder}`, color: primary }}>
                    <Icon name="mail" size={13} /> Email
                  </a>
                </div>
              </div>

              {/* FAQ accordion — single column */}
              <div className="space-y-2.5">
                {faqs.map((item, i) => (
                  <FAQItem
                    key={i}
                    item={item}
                    index={i}
                    open={openIndex === i}
                    onToggle={() => toggle(i)}
                    nightMode={nightMode}
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    primary={primary}
                    textColor={textColor}
                    mutedColor={mutedColor}
                  />
                ))}
              </div>

              {/* Back link */}
              <div className="faq-back-link mt-8">
                <Link to={`/v2/${slug}`}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline"
                  style={{ color: primary }}>
                  <Icon name="arrow_back" size={13} /> Return to Guidebook
                </Link>
              </div>
            </main>

            {/* Right sidebar (large screens) */}
            <div className="faq-right-sidebar hidden lg:block w-56 xl:w-64 flex-shrink-0 sticky top-4 self-start">
              <V2RightSidebar property={property} slug={slug} mapsUrl={mapsUrl} />
            </div>

          </div>
        </div>
      </div>
    </NightModeCtx.Provider>
  )
}
