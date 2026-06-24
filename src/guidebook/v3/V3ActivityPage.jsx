import React, { useState } from 'react'
import { useOutletContext, useParams, Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import { NightModeCtx, V3RightSidebar, ActivityCard, readV3Data, buildGuidebookSections } from './V3GuidebookPage'
import { ACTIVITY_CATEGORIES } from '../../data/adminV3Store'
import { guidebookPath } from '../../data/tenant'

const SUNSET    = 'linear-gradient(135deg, #7C2D12 0%, #C84B31 30%, #EA580C 58%, #F97316 78%, #FCD34D 100%)'
const PRIMARY   = '#C84B31'
const TEXT      = '#1C0F06'
const MUTED     = '#78716C'
const BORDER    = 'rgba(200,80,50,0.12)'
const CARD_BG   = '#FFFFFF'
const SAND_BG   = '#FFF7ED'

const N_SUNSET  = 'linear-gradient(135deg, #1E1B4B 0%, #312E81 35%, #4F46E5 65%, #7C3AED 100%)'
const N_PRIMARY = '#818CF8'
const N_TEXT    = '#E2E8F0'
const N_MUTED   = '#94A3B8'
const N_BORDER  = 'rgba(99,102,241,0.20)'
const N_CARD_BG = '#111827'
const N_SAND_BG = '#0B1120'

// ─── Expandable category accordion (FAQ-style) ───────────────────────────────
function CategoryAccordion({ cat, activities, open, onToggle, nightMode, cardBg, cardBorder, textColor, mutedColor }) {
  const [activeId, setActiveId] = useState(null)
  const hoverBg = nightMode ? 'rgba(99,102,241,0.08)' : 'rgba(249,115,22,0.06)'
  const dividerColor = nightMode ? 'rgba(99,102,241,0.12)' : 'rgba(251,146,60,0.15)'

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: `1px solid ${cardBorder}`, background: cardBg }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors"
        style={{ background: open ? hoverBg : 'transparent' }}
        onMouseEnter={e => e.currentTarget.style.background = hoverBg}
        onMouseLeave={e => e.currentTarget.style.background = open ? hoverBg : 'transparent'}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: cat.accent }}>
            <Icon name="place" size={14} className="text-white" />
          </span>
          <div className="min-w-0">
            <span className="font-semibold text-[14px] leading-snug block" style={{ color: textColor }}>{cat.label}</span>
            <span className="text-[11px]" style={{ color: mutedColor }}>
              {activities.length} {activities.length === 1 ? 'place' : 'places'} · tap to {open ? 'close' : 'explore'}
            </span>
          </div>
        </div>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={20} style={{ color: cat.accent, flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{ borderTop: `1px solid ${dividerColor}` }} className="px-4 py-4">
          {activities.length === 0 ? (
            <div className="text-center py-6" style={{ color: mutedColor }}>
              <Icon name="explore_off" size={30} className="mx-auto mb-2 opacity-30" />
              <p className="text-[13px]">No activities in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {activities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  activeId={activeId}
                  setActiveId={setActiveId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function V3ActivityPage() {
  const { property, nightMode } = useOutletContext()
  const { slug } = useParams()
  const [openKey, setOpenKey] = useState(null)

  const v3data = readV3Data()
  const categories = v3data?.activityCategories?.length ? v3data.activityCategories : ACTIVITY_CATEGORIES
  const allActivities = v3data?.activities || []

  // Activities visible for this property in curated order
  const visibleFor = (catKey) => {
    const curation = v3data?.propertyCuration?.[slug]?.[catKey] || []
    if (curation.length === 0) return allActivities.filter(a => a.category === catKey)
    return curation
      .filter(e => e.enabled)
      .map(e => allActivities.find(a => a.id === e.activityId))
      .filter(Boolean)
  }

  const toggle = (key) => setOpenKey(openKey === key ? null : key)

  const bg         = nightMode ? N_SAND_BG : SAND_BG
  const cardBg     = nightMode ? N_CARD_BG : CARD_BG
  const cardBorder = nightMode ? N_BORDER  : 'rgba(251,146,60,0.3)'
  const headerGrad = nightMode ? N_SUNSET  : SUNSET
  const primary    = nightMode ? N_PRIMARY : PRIMARY
  const textColor  = nightMode ? N_TEXT    : TEXT
  const mutedColor = nightMode ? N_MUTED   : MUTED
  const border     = nightMode ? N_BORDER  : BORDER
  const mapsUrl    = `https://maps.google.com/?q=${encodeURIComponent(property.address)}`

  const tocSections = buildGuidebookSections(v3data, slug).filter(s => !s.parentKey && !s.virtual)
  const totalCount = categories.reduce((n, c) => n + visibleFor(c.key).length, 0)

  return (
    <NightModeCtx.Provider value={nightMode}>
      <div className="min-h-screen" style={{ background: bg }}>
        {/* Header bar */}
        <div className="relative overflow-hidden" style={{ background: headerGrad }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-white/25" />
          <div className="relative z-10 px-6 py-4 flex items-center justify-between">
            <Link to={guidebookPath(slug)}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-[13px] font-semibold">
              <Icon name="arrow_back" size={16} className="text-white/80" />
              Back to Guidebook
            </Link>
            <span className="text-white font-black text-lg tracking-[0.35em] uppercase">TALO</span>
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-10 xl:px-16 py-6">
          <div className="flex gap-5 lg:gap-7 items-start">

            {/* Left TOC */}
            <aside className="hidden md:block w-48 lg:w-56 flex-shrink-0 sticky top-4 self-start">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-2" style={{ color: mutedColor }}>Contents</p>
              <nav className="space-y-0.5">
                {tocSections.map((s) => s.page ? (
                  <div key={s.key}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-bold"
                    style={{ color: nightMode ? '#86EFAC' : '#15803D', background: nightMode ? 'rgba(22,101,52,0.2)' : 'rgba(220,252,231,0.6)' }}>
                    <Icon name={s.icon} size={14} style={{ color: nightMode ? '#86EFAC' : '#15803D' }} />
                    <span className="truncate">{s.label}</span>
                  </div>
                ) : (
                  <Link key={s.key} to={guidebookPath(slug, `#${s.key}`)}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors"
                    style={{ color: mutedColor, fontWeight: 500 }}
                    onMouseEnter={e => { e.currentTarget.style.color = primary; e.currentTarget.style.background = `${primary}12` }}
                    onMouseLeave={e => { e.currentTarget.style.color = mutedColor; e.currentTarget.style.background = 'transparent' }}>
                    <Icon name={s.icon} size={14} style={{ color: mutedColor }} />
                    <span className="truncate">{s.label}</span>
                  </Link>
                ))}
                <div className="pt-2 mt-1" style={{ borderTop: `1px solid ${border}` }}>
                  <Link to={guidebookPath(slug, '/faq')}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors hover:opacity-80 font-semibold"
                    style={{ color: nightMode ? '#A78BFA' : '#D97706', background: nightMode ? 'rgba(109,40,217,0.15)' : 'rgba(253,230,138,0.3)' }}>
                    <Icon name="help" size={14} style={{ color: nightMode ? '#A78BFA' : '#D97706' }} />
                    <span>FAQ</span>
                  </Link>
                  <Link to={guidebookPath(slug, '/checkout')}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors"
                    style={{ color: mutedColor }}>
                    <Icon name="logout" size={14} />
                    <span>Check-Out</span>
                  </Link>
                </div>
              </nav>
            </aside>

            {/* Center */}
            <main className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
                  style={{ background: nightMode ? 'linear-gradient(135deg, #4338CA, #6D28D9)' : 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
                  <Icon name="explore" size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: primary }}>
                    Activity Center
                  </p>
                  <h1 className="text-2xl font-bold" style={{ color: textColor }}>{property.name}</h1>
                  <p className="text-[12px] mt-0.5" style={{ color: mutedColor }}>
                    {totalCount} hand-picked places in {categories.length} categories · Tap a category to explore
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {categories.map((cat) => (
                  <CategoryAccordion
                    key={cat.key}
                    cat={cat}
                    activities={visibleFor(cat.key)}
                    open={openKey === cat.key}
                    onToggle={() => toggle(cat.key)}
                    nightMode={nightMode}
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    textColor={textColor}
                    mutedColor={mutedColor}
                  />
                ))}
              </div>

              <div className="mt-8">
                <Link to={guidebookPath(slug)}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline"
                  style={{ color: primary }}>
                  <Icon name="arrow_back" size={13} /> Return to Guidebook
                </Link>
              </div>
            </main>

            {/* Right sidebar */}
            <div className="hidden lg:block w-56 xl:w-64 flex-shrink-0 sticky top-4 self-start">
              <V3RightSidebar property={property} slug={slug} mapsUrl={mapsUrl} />
            </div>
          </div>
        </div>
      </div>
    </NightModeCtx.Provider>
  )
}
