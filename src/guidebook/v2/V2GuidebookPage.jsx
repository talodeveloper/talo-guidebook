import React, { useEffect, useState } from 'react'
import { useOutletContext, Link, useParams } from 'react-router-dom'
import { SECTIONS } from '../../data/sections'
import { contentStore } from '../../data/contentStore'
import Icon from '../../components/Icon'

const MAIN_SECTIONS = SECTIONS.filter((s) => s.key !== 'checkout' && s.key !== 'videos')

// ─── Day theme constants ───────────────────────────────────────────────────
const SUNSET    = 'linear-gradient(135deg, #7C2D12 0%, #C84B31 30%, #EA580C 58%, #F97316 78%, #FCD34D 100%)'
const OCEAN     = 'linear-gradient(135deg, #0C4A6E 0%, #0369A1 50%, #0284C7 100%)'
const CARD_BG   = '#FFFFFF'
const SAND_BG   = '#FFF7ED'
const PRIMARY   = '#C84B31'
const PRIMARY_D = '#9B3322'
const CORAL     = '#EA580C'
const TEXT      = '#1C0F06'
const MUTED     = '#78716C'
const BORDER    = 'rgba(200,80,50,0.12)'

// ─── Night theme constants ─────────────────────────────────────────────────
const N_SUNSET    = 'linear-gradient(135deg, #1E1B4B 0%, #312E81 35%, #4F46E5 65%, #7C3AED 100%)'
const N_OCEAN     = 'linear-gradient(135deg, #0B1120 0%, #0C2550 50%, #1E3A8A 100%)'
const N_CARD_BG   = '#111827'
const N_SAND_BG   = '#0B1120'
const N_PRIMARY   = '#818CF8'
const N_PRIMARY_D = '#6366F1'
const N_CORAL     = '#A78BFA'
const N_TEXT      = '#E2E8F0'
const N_MUTED     = '#94A3B8'
const N_BORDER    = 'rgba(99,102,241,0.20)'

// ─── Night mode context + theme hook ──────────────────────────────────────
export const NightModeCtx = React.createContext(false)

function useTheme() {
  const night = React.useContext(NightModeCtx)
  return {
    night,
    SUNSET:    night ? N_SUNSET    : SUNSET,
    OCEAN:     night ? N_OCEAN     : OCEAN,
    CARD_BG:   night ? N_CARD_BG   : CARD_BG,
    SAND_BG:   night ? N_SAND_BG   : SAND_BG,
    PRIMARY:   night ? N_PRIMARY   : PRIMARY,
    PRIMARY_D: night ? N_PRIMARY_D : PRIMARY_D,
    CORAL:     night ? N_CORAL     : CORAL,
    TEXT:      night ? N_TEXT      : TEXT,
    MUTED:     night ? N_MUTED     : MUTED,
    BORDER:    night ? N_BORDER    : BORDER,
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────
const iconBg = { background: 'linear-gradient(135deg, #C84B31, #EA580C)', padding: 8, borderRadius: 12 }

// ─── Standard block images ─────────────────────────────────────────────────
function BlockImages({ images }) {
  const { BORDER } = useTheme()
  if (!images || images.length === 0) return null
  return (
    <div className={`mt-4 grid gap-3 ${
      images.length === 1 ? 'grid-cols-1'
      : images.length === 2 ? 'grid-cols-2'
      : 'grid-cols-2 md:grid-cols-3'}`}>
      {images.map((img, i) => (
        <figure key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <img src={img.src} alt={img.caption} className="w-full object-cover"
            style={{ maxHeight: images.length === 1 ? '360px' : '220px' }} />
          {img.caption && (
            <figcaption className="px-3 py-1.5 text-[11px] text-center" style={{ color: MUTED, background: '#FFF7ED' }}>
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}

// ─── Standard content block ────────────────────────────────────────────────
function ContentBlock({ block }) {
  const { BORDER, TEXT, MUTED, PRIMARY, CARD_BG } = useTheme()
  const isPlace = !!(block.phone || block.link)
  return (
    <div className="mb-6 last:mb-0">
      {isPlace && block.images?.[0]?.src && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ maxHeight: 180, border: `1px solid ${BORDER}` }}>
          <img src={block.images[0].src} alt={block.title} className="w-full h-44 object-cover" />
        </div>
      )}
      {block.title && (
        <h4 className="text-[15px] font-bold mb-2" style={{ color: TEXT }}>{block.title}</h4>
      )}
      {block.body && (
        <div className="text-[14px] leading-relaxed
          [&_strong]:font-semibold
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mt-1
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mt-1
          [&_p]:mb-2 [&_p:last-child]:mb-0"
          style={{ color: MUTED }}
          dangerouslySetInnerHTML={{ __html: block.body }}
        />
      )}
      {isPlace && (
        <div className="flex flex-wrap gap-2 mt-3">
          {block.phone && (
            <a href={`tel:${block.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'rgba(200,75,49,0.1)', color: PRIMARY }}>
              <Icon name="phone" size={13} /> {block.phone}
            </a>
          )}
          {block.link && (
            <a href={block.link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors hover:bg-orange-50"
              style={{ borderColor: BORDER, color: MUTED }}>
              <Icon name="open_in_new" size={13} /> Visit Website
            </a>
          )}
        </div>
      )}
      <BlockImages images={isPlace ? (block.images?.slice(1) || []) : block.images} />
    </div>
  )
}

// ─── Flip card (Local Guide & Things to Do with images) ────────────────────
function PlaceCard({ block, activeId, setActiveId }) {
  const { PRIMARY, CORAL, MUTED, TEXT, BORDER, CARD_BG, night } = useTheme()
  const isFlipped = activeId === block.id
  const hasImage = block.images?.[0]?.src
  const mapsUrl = `https://maps.google.com/search?q=${encodeURIComponent(block.title + ' San Diego CA')}`

  return (
    <div className="cursor-pointer select-none"
      style={{ perspective: '1000px', height: '260px' }}
      onClick={() => setActiveId(isFlipped ? null : block.id)}>
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.45s cubic-bezier(0.4,0.2,0.2,1)',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Front */}
        <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
          className="rounded-2xl overflow-hidden shadow-sm flex flex-col"
          style2={{ border: `1px solid ${BORDER}`, background: CARD_BG }}>
          {hasImage ? (
            <div className="relative flex-1 overflow-hidden">
              <img src={block.images[0].src} alt={block.title} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(to top, rgba(124,45,18,0.85), transparent)' }} />
              <div className="absolute bottom-0 inset-x-0 p-3">
                <p className="text-white font-bold text-[13px] leading-tight line-clamp-2">{block.title}</p>
                <p className="text-white/65 text-[10px] mt-1 flex items-center gap-1">
                  <Icon name="touch_app" size={10} className="text-white/50" /> Tap for details
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4" style={{ background: 'rgba(200,75,49,0.05)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(200,75,49,0.15)' }}>
                <Icon name="place" size={22} style={{ color: PRIMARY }} />
              </div>
              <p className="font-bold text-[13px] text-center leading-tight" style={{ color: TEXT }}>{block.title}</p>
              <p className="text-[10px] mt-2 flex items-center gap-0.5" style={{ color: PRIMARY }}>
                <Icon name="touch_app" size={10} /> Tap for details
              </p>
            </div>
          )}
        </div>

        {/* Back */}
        <div style={{
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          position: 'absolute', inset: 0, transform: 'rotateY(180deg)',
          background: night ? '#1E293B' : '#FFF7ED', border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: '14px', display: 'flex', flexDirection: 'column',
        }}>
          <div className="flex items-start gap-1.5 mb-2">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-w-0 group">
              <span className="font-bold text-[13px] leading-tight flex items-start gap-1 hover:opacity-80"
                style={{ color: PRIMARY }}>
                <span className="line-clamp-2">{block.title}</span>
                <Icon name="location_on" size={12} className="flex-shrink-0 mt-0.5" style={{ color: CORAL }} />
              </span>
            </a>
            <span className="flex-shrink-0 text-[9px] leading-tight text-right" style={{ color: MUTED }}>tap to<br/>close</span>
          </div>
          <div className="flex-1 overflow-y-auto text-[12px] leading-relaxed
            [&_p]:mb-1 [&_p:last-child]:mb-0
            [&_strong]:font-semibold
            [&_ul]:list-disc [&_ul]:pl-3.5 [&_ul]:space-y-0.5"
            style={{ color: MUTED }}
            dangerouslySetInnerHTML={{ __html: block.body }}
          />
          {(block.phone || block.link) && (
            <div className="flex gap-1.5 mt-2 pt-2 flex-shrink-0" style={{ borderTop: `1px solid rgba(200,75,49,0.15)` }}>
              {block.phone && (
                <a href={`tel:${block.phone}`} onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(200,75,49,0.1)', color: PRIMARY }}>
                  <Icon name="phone" size={11} /> Call
                </a>
              )}
              {block.link && (
                <a href={block.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1 border py-1.5 rounded-lg text-[11px] font-semibold transition-colors hover:bg-orange-50"
                  style={{ borderColor: BORDER, color: MUTED }}>
                  <Icon name="open_in_new" size={11} /> Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PlaceCardGrid({ blocks }) {
  const [activeId, setActiveId] = useState(null)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {blocks.map((block) => (
        <PlaceCard key={block.id} block={block} activeId={activeId} setActiveId={setActiveId} />
      ))}
    </div>
  )
}

// ─── Flat card (no image, not flippable) ───────────────────────────────────
function FlatCard({ block }) {
  const { BORDER, MUTED, TEXT, PRIMARY, CARD_BG } = useTheme()
  const mapsUrl = !block.link ? `https://maps.google.com/search?q=${encodeURIComponent(block.title + ' San Diego CA')}` : null
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: BORDER, background: CARD_BG }}>
      <p className="font-bold text-[13px] mb-1.5 flex items-center gap-1.5" style={{ color: TEXT }}>
        {block.title}
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" style={{ color: PRIMARY }}>
            <Icon name="location_on" size={13} />
          </a>
        )}
      </p>
      <div className="text-[12px] leading-relaxed [&_p]:mb-1 [&_p:last-child]:mb-0 [&_strong]:font-semibold"
        style={{ color: MUTED }}
        dangerouslySetInnerHTML={{ __html: block.body }}
      />
      {block.link && (
        <a href={block.link} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 border px-2.5 py-1 rounded-lg text-[11px] font-semibold mt-2.5 transition-colors hover:bg-orange-50"
          style={{ borderColor: BORDER, color: MUTED }}>
          <Icon name="open_in_new" size={11} /> Website
        </a>
      )}
    </div>
  )
}

// ─── Video card ────────────────────────────────────────────────────────────
const DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto'

function VideoCard({ block }) {
  const thumb = block.images?.[0]?.src
  const href = block.link || DRIVE_FOLDER
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="block rounded-2xl overflow-hidden shadow-sm group" style={{ height: 220, border: `1px solid ${BORDER}` }}>
      <div className="relative w-full h-full" style={{ background: '#FDE8D8' }}>
        {thumb ? (
          <img src={thumb} alt={block.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="videocam" size={40} style={{ color: 'rgba(200,75,49,0.3)' }} />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'rgba(124,45,18,0.38)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(124,45,18,0.55) 0%, transparent 55%)' }} />
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-white/80 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-all duration-300 shadow-lg"
            style={{ background: 'rgba(255,255,255,0.22)' }}>
            <Icon name="play_arrow" size={28} className="text-white ml-1" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
          <p className="text-white font-bold text-[13px] leading-tight line-clamp-1">{block.title}</p>
          {block.body && (
            <p className="text-white/65 text-[11px] mt-0.5 line-clamp-1"
              dangerouslySetInnerHTML={{ __html: block.body.replace(/<[^>]*>/g, '') }} />
          )}
          <p className="text-white/40 text-[10px] mt-1 flex items-center gap-1">
            <Icon name="open_in_new" size={9} className="text-white/35" /> View in Google Drive
          </p>
        </div>
      </div>
    </a>
  )
}

// ─── Section wrappers ──────────────────────────────────────────────────────

function SectionHeader({ section }) {
  const { SUNSET, PRIMARY_D } = useTheme()
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: SUNSET }}>
        <Icon name={section.icon} size={18} className="text-white" />
      </div>
      <h2 className="text-headline-md font-bold" style={{ color: PRIMARY_D }}>{section.label}</h2>
    </div>
  )
}

function Section({ section, blocks }) {
  const { BORDER } = useTheme()
  if (blocks.length === 0) return null
  return (
    <div id={section.key} className="py-8 scroll-mt-[90px]" style={{ borderBottom: `1px solid ${BORDER}` }}>
      <SectionHeader section={section} />
      <div className="space-y-5">
        {blocks.map((block, idx) => (
          <div key={block.id} className="pt-5"
            style={{ borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}` }}>
            <ContentBlock block={block} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SubSection({ section, blocks }) {
  const { BORDER, PRIMARY, MUTED } = useTheme()
  if (blocks.length === 0) return null
  return (
    <div id={section.key} className="pt-6 scroll-mt-[90px]" style={{ borderTop: `1px solid ${BORDER}` }}>
      <div className="flex items-center gap-2 mb-4">
        <Icon name={section.icon} size={15} style={{ color: PRIMARY, opacity: 0.7 }} />
        <h3 className="text-[15px] font-semibold" style={{ color: PRIMARY, opacity: 0.8 }}>{section.label}</h3>
      </div>
      <div className="space-y-5">
        {blocks.map((block) => (
          <div key={block.id} className="pt-5 first:pt-0" style={{ borderTop: `1px solid ${BORDER}` }}>
            <ContentBlock block={block} />
          </div>
        ))}
      </div>
    </div>
  )
}

function LocalGuideSection({ section, blocks }) {
  const { BORDER } = useTheme()
  if (blocks.length === 0) return null
  return (
    <div id={section.key} className="py-8 scroll-mt-[90px]" style={{ borderBottom: `1px solid ${BORDER}` }}>
      <SectionHeader section={section} />
      <PlaceCardGrid blocks={blocks} />
    </div>
  )
}

function ThingsToDoSection({ section, blocks }) {
  const { BORDER } = useTheme()
  if (blocks.length === 0) return null
  const withImages = blocks.filter((b) => b.images?.[0]?.src)
  const withoutImages = blocks.filter((b) => !b.images?.[0]?.src)
  return (
    <div id={section.key} className="py-8 scroll-mt-[90px]" style={{ borderBottom: `1px solid ${BORDER}` }}>
      <SectionHeader section={section} />
      {withImages.length > 0 && <PlaceCardGrid blocks={withImages} />}
      {withoutImages.length > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${withImages.length > 0 ? 'mt-4' : ''}`}>
          {withoutImages.map((b) => <FlatCard key={b.id} block={b} />)}
        </div>
      )}
    </div>
  )
}

function VideoSection({ section, blocks }) {
  if (blocks.length === 0) return null
  return (
    <div id={section.key} className="py-8 scroll-mt-[90px]" style={{ borderBottom: `1px solid ${BORDER}` }}>
      <SectionHeader section={section} />
      <p className="text-[12px] mb-5 pl-12" style={{ color: MUTED }}>Click any video to watch in Google Drive</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {blocks.map((b) => <VideoCard key={b.id} block={b} />)}
      </div>
    </div>
  )
}

// ─── Right sidebar ─────────────────────────────────────────────────────────
export function V2RightSidebar({ property, slug, mapsUrl }) {
  const { BORDER, PRIMARY, TEXT, MUTED, SUNSET, OCEAN, CARD_BG, night } = useTheme()
  const faqGradient = night
    ? 'linear-gradient(135deg, #312E81 0%, #4338CA 50%, #6D28D9 100%)'
    : 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)'

  return (
    <aside className="space-y-4">
      {/* Address & details card — first */}
      <div className="rounded-2xl border p-4 shadow-sm" style={{ borderColor: BORDER, background: CARD_BG }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: PRIMARY }}>Property</p>
        {/* Property name + View on Map */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-bold text-[14px] leading-tight" style={{ color: TEXT }}>{property.name}</p>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold hover:opacity-75 transition-opacity"
            style={{ color: PRIMARY }}>
            <Icon name="map" size={12} style={{ color: PRIMARY }} /> Map
          </a>
        </div>
        <p className="text-[12px] leading-relaxed mb-3" style={{ color: MUTED }}>{property.address}</p>
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-[12px]">
            <span className="flex items-center gap-1" style={{ color: MUTED }}>
              <Icon name="login" size={13} style={{ color: PRIMARY }} /> Check-in
            </span>
            <span className="font-bold" style={{ color: TEXT }}>{property.checkInTime}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="flex items-center gap-1" style={{ color: MUTED }}>
              <Icon name="logout" size={13} style={{ color: PRIMARY }} /> Check-out
            </span>
            <span className="font-bold" style={{ color: TEXT }}>{property.checkoutTime}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="flex items-center gap-1" style={{ color: MUTED }}>
              <Icon name="group" size={13} style={{ color: PRIMARY }} /> Guests
            </span>
            <span className="font-bold" style={{ color: TEXT }}>Up to {property.maxGuests}</span>
          </div>
        </div>
        <Link to={`/v2/${slug}/checkout`}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-[12px] font-bold text-white shadow-sm"
          style={{ background: SUNSET }}>
          <Icon name="checklist" size={14} className="text-white" />
          Check-Out Instructions
        </Link>
      </div>

      {/* FAQ Card */}
      <Link to={`/v2/${slug}/faq`}
        className="block rounded-2xl p-5 text-white shadow-md hover:scale-[1.02] transition-transform"
        style={{ background: faqGradient }}>
        <div className="flex items-center gap-2 mb-3">
          <Icon name="help" size={18} className="text-white/90" />
          <h3 className="font-bold text-label-md uppercase tracking-wide">FAQ</h3>
        </div>
        <p className="text-white/85 text-[12px] leading-relaxed mb-3">
          Top 15 questions guests ask — with property-specific answers.
        </p>
        <div className="flex items-center gap-1.5 text-white font-bold text-[12px]">
          View all questions <Icon name="arrow_forward" size={13} className="text-white" />
        </div>
      </Link>

      {/* WiFi card */}
      <div className="rounded-2xl p-5 text-white shadow-sm" style={{ background: OCEAN }}>
        <div className="flex items-center gap-2 mb-4">
          <Icon name="wifi" size={18} className="text-white/80" />
          <h3 className="font-bold text-label-md uppercase tracking-wide">Wi-Fi</h3>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Network</p>
            <p className="font-bold text-white text-label-md">{property.wifi?.network}</p>
          </div>
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Password</p>
            <p className="font-bold text-white text-label-md break-all">{property.wifi?.password}</p>
          </div>
        </div>
      </div>

      {/* Host card */}
      <div className="rounded-xl border p-4" style={{ borderColor: BORDER, background: CARD_BG }}>
        <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: MUTED }}>Your Host</p>
        <p className="font-bold text-label-md" style={{ color: TEXT }}>{property.ownerName}</p>
        <div className="flex gap-2 mt-3">
          <a href={`tel:${property.ownerPhone}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-label-sm font-bold text-white"
            style={{ background: SUNSET }}>
            <Icon name="phone" size={14} className="text-white" /> Call
          </a>
          <a href={`mailto:${property.ownerEmail}`}
            className="flex-1 flex items-center justify-center gap-1.5 border py-2 rounded-lg text-label-sm font-bold transition-colors"
            style={{ borderColor: BORDER, color: MUTED }}>
            <Icon name="mail" size={14} /> Email
          </a>
        </div>
      </div>
    </aside>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function V2GuidebookPage() {
  const { property, nightMode, toggleNightMode } = useOutletContext()
  const { slug } = useParams()
  const [activeSection, setActiveSection] = useState(MAIN_SECTIONS[0].key)
  const [blocks, setBlocks] = useState({})
  const [tocOpen, setTocOpen] = useState(false)

  // Derive theme for this component's own inline styles
  const t = {
    BG:       nightMode ? N_SAND_BG   : SAND_BG,
    CARD:     nightMode ? N_CARD_BG   : CARD_BG,
    BORDER:   nightMode ? N_BORDER    : BORDER,
    PRIMARY:  nightMode ? N_PRIMARY   : PRIMARY,
    PRIMARY_D:nightMode ? N_PRIMARY_D : PRIMARY_D,
    MUTED:    nightMode ? N_MUTED     : MUTED,
    TEXT:     nightMode ? N_TEXT      : TEXT,
    SUNSET:   nightMode ? N_SUNSET    : SUNSET,
    OCEAN:    nightMode ? N_OCEAN     : OCEAN,
    HERO_IMG: nightMode ? '/images/nightview.png' : '/images/newhero.png',
    HERO_OVERLAY: nightMode
      ? 'linear-gradient(to right, rgba(15,10,40,0.92) 0%, rgba(30,15,80,0.72) 22%, rgba(50,20,100,0.25) 55%, rgba(0,0,0,0.08) 100%)'
      : 'linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.60) 22%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.10) 100%)',
  }

  useEffect(() => {
    const load = () => {
      const all = {}
      MAIN_SECTIONS.forEach((s) => {
        all[s.key] = contentStore.getBlocksForSection(s.key, slug)
      })
      setBlocks(all)
    }
    load()
    return contentStore.subscribe(load)
  }, [slug])

  useEffect(() => {
    const observers = []
    MAIN_SECTIONS.forEach((section) => {
      const el = document.getElementById(section.key)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(section.key) },
        { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [blocks])

  const scrollTo = (key) => {
    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTocOpen(false)
  }

  const sectionsWithContent = MAIN_SECTIONS.filter((s) => blocks[s.key]?.length > 0)
  const topLevelSections = sectionsWithContent.filter((s) => !s.parentKey)
  const childSections = (parentKey) => sectionsWithContent.filter((s) => s.parentKey === parentKey)
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(property.address)}`

  const exteriorPhoto = property.photos?.exterior
    || (slug === 'reynard-way'
        ? '/photos/reynard-way/p7_img1_720x480.png'
        : '/photos/hawk-street/p6_img1_1272x850.jpeg')

  const renderSection = (section) => {
    const sectionBlocks = blocks[section.key] || []
    const children = MAIN_SECTIONS.filter((s) => s.parentKey === section.key)

    if (section.key === 'videos') return <VideoSection key={section.key} section={section} blocks={sectionBlocks} />
    if (section.key === 'local_guide') return <LocalGuideSection key={section.key} section={section} blocks={sectionBlocks} />
    if (section.key === 'things_to_do') return <ThingsToDoSection key={section.key} section={section} blocks={sectionBlocks} />

    if (children.length === 0) {
      return <Section key={section.key} section={section} blocks={sectionBlocks} />
    }

    const hasChildren = children.some((c) => (blocks[c.key] || []).length > 0)
    if (sectionBlocks.length === 0 && !hasChildren) return null

    return (
      <div key={section.key} className="py-8" style={{ borderBottom: `1px solid ${t.BORDER}` }}>
        {sectionBlocks.length > 0 ? (
          <>
            <div id={section.key} className="scroll-mt-[90px]">
              <SectionHeader section={section} />
            </div>
            <div className="space-y-5">
              {sectionBlocks.map((block) => (
                <div key={block.id} className="pt-5 first:pt-0" style={{ borderTop: `1px solid ${t.BORDER}` }}>
                  <ContentBlock block={block} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div id={section.key} className="scroll-mt-[90px]">
            <SectionHeader section={section} />
          </div>
        )}
        <div className={sectionBlocks.length > 0 ? 'mt-6' : ''}>
          {children.map((child) => (
            <SubSection key={child.key} section={child} blocks={blocks[child.key] || []} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <NightModeCtx.Provider value={nightMode}>
    <div className="min-h-screen" style={{ background: t.BG }}>

      {/* ── Beach Hero ── */}
      {/* Outer div: no overflow-hidden so logo can sit at top-left edge cleanly */}
      <div className="relative w-full" style={{
        height: 'clamp(170px, 20vw, 260px)',
        backgroundColor: nightMode ? '#0B1120' : '#FFF7ED',
      }}>
        {/* Background image — pure original, no overlays */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `url(${t.HERO_IMG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        </div>

        {/* Night/Day toggle button — top right */}
        <button
          onClick={toggleNightMode}
          className="absolute top-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all hover:opacity-90"
          style={{
            background: nightMode ? 'rgba(129,140,248,0.25)' : 'rgba(0,0,0,0.22)',
            border: nightMode ? '1px solid rgba(129,140,248,0.5)' : '1px solid rgba(255,255,255,0.40)',
            color: '#fff',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          <Icon name={nightMode ? 'light_mode' : 'dark_mode'} size={13} className="text-white" />
          {nightMode ? 'Day' : 'Night'}
        </button>

        {/* TALO Logo — absolutely pinned to top-left, shifted 30% up on Y-axis */}
        <div className="absolute z-10" style={{
          top: 10,
          left: 10,
          width: 'clamp(180px, 40%, 480px)',
          transform: 'translateY(-30%)',
        }}>
          <img src="/images/talo-logo.png" alt="TALO Rentals"
            style={{
              width: '100%', height: 'auto', maxHeight: 240, objectFit: 'contain',
              filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.9)) drop-shadow(0 0 8px rgba(0,0,0,0.6))',
            }} />
        </div>

        {/* Guidebook + Property Name — absolutely centered on the full hero */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4">
          <p style={{
            color: 'rgba(255,255,255,0.92)', fontSize: 'clamp(11px, 1.4vw, 14px)', fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 4,
            textShadow: '0 1px 6px rgba(0,0,0,0.9)',
          }}>Guidebook</p>
          <h1 style={{
            color: '#fff', fontSize: 'clamp(18px, 3vw, 32px)', fontWeight: 800, lineHeight: 1.2,
            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
            textAlign: 'center',
          }}>{property.name}</h1>
        </div>
      </div>

      {/* ── Mobile TOC ── */}
      <div className="md:hidden sticky top-0 z-40 backdrop-blur-md border-b px-4 py-2"
        style={{ background: nightMode ? 'rgba(11,17,32,0.95)' : 'rgba(255,247,237,0.95)', borderColor: t.BORDER }}>
        <button onClick={() => setTocOpen(!tocOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-label-md font-semibold"
          style={{ borderColor: t.BORDER, color: t.TEXT, background: t.CARD }}>
          <span className="flex items-center gap-2">
            <Icon name="toc" size={16} style={{ color: t.PRIMARY }} />
            {MAIN_SECTIONS.find((s) => s.key === activeSection)?.label || 'Contents'}
          </span>
          <Icon name={tocOpen ? 'expand_less' : 'expand_more'} size={18} style={{ color: t.MUTED }} />
        </button>
        {tocOpen && (
          <div className="absolute left-4 right-4 top-full mt-1 rounded-xl shadow-lg overflow-hidden z-50 max-h-72 overflow-y-auto"
            style={{ border: `1px solid ${t.BORDER}`, background: t.CARD }}>
            {topLevelSections.map((s) => (
              <React.Fragment key={s.key}>
                <button onClick={() => scrollTo(s.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-label-md border-b transition-colors"
                  style={{
                    borderColor: t.BORDER,
                    background: activeSection === s.key ? `${t.PRIMARY}18` : 'transparent',
                    color: activeSection === s.key ? t.PRIMARY : t.MUTED,
                    fontWeight: activeSection === s.key ? 700 : 500,
                  }}>
                  <Icon name={s.icon} size={15} style={{ color: activeSection === s.key ? t.PRIMARY : t.MUTED }} />
                  {s.label}
                </button>
                {childSections(s.key).map((child) => (
                  <button key={child.key} onClick={() => scrollTo(child.key)}
                    className="w-full flex items-center gap-3 pl-10 pr-4 py-2.5 text-left text-[13px] border-b transition-colors"
                    style={{
                      borderColor: t.BORDER,
                      color: activeSection === child.key ? t.PRIMARY : t.MUTED,
                      fontWeight: activeSection === child.key ? 700 : 500,
                    }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'currentColor' }} />
                    {child.label}
                  </button>
                ))}
              </React.Fragment>
            ))}
            {/* Mobile FAQ link */}
            <Link to={`/v2/${slug}/faq`} onClick={() => setTocOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-label-md border-b font-semibold"
              style={{ borderColor: t.BORDER, color: nightMode ? '#A78BFA' : '#D97706', background: nightMode ? 'rgba(109,40,217,0.15)' : 'rgba(253,230,138,0.25)' }}>
              <Icon name="help" size={15} style={{ color: nightMode ? '#A78BFA' : '#D97706' }} />
              FAQ
            </Link>
            <Link to={`/v2/${slug}/checkout`} onClick={() => setTocOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-label-md transition-colors" style={{ color: t.MUTED }}>
              <Icon name="logout" size={15} />
              Check-Out
            </Link>
          </div>
        )}
      </div>

      {/* ── Mobile Property Card (horizontal, scrolls with page) ── */}
      <div className="md:hidden px-4 pt-4">
        <div className="rounded-2xl border shadow-sm" style={{ borderColor: t.BORDER, background: t.CARD }}>
          {/* Top row: name + checkout button */}
          <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: t.PRIMARY }}>Property</p>
              <p className="font-bold text-[13px] leading-tight truncate" style={{ color: t.TEXT }}>{property.name}</p>
              {/* Address + Map link on mobile */}
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-[11px] truncate" style={{ color: t.MUTED }}>{property.address}</p>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-0.5 text-[11px] font-semibold flex-shrink-0 hover:opacity-75 transition-opacity"
                  style={{ color: t.PRIMARY }}>
                  <Icon name="map" size={11} style={{ color: t.PRIMARY }} /> Map
                </a>
              </div>
            </div>
            <Link to={`/v2/${slug}/checkout`}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white"
              style={{ background: t.SUNSET }}>
              <Icon name="checklist" size={11} className="text-white" /> Check-Out
            </Link>
          </div>
          {/* Bottom row: details */}
          <div className="px-4 pb-3 flex items-center gap-4 overflow-x-auto">
            <div className="flex items-center gap-1 flex-shrink-0">
              <Icon name="login" size={12} style={{ color: t.PRIMARY }} />
              <span className="text-[11px]" style={{ color: t.MUTED }}>In</span>
              <span className="text-[11px] font-bold" style={{ color: t.TEXT }}>{property.checkInTime}</span>
            </div>
            <span className="text-[10px]" style={{ color: t.MUTED }}>·</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Icon name="logout" size={12} style={{ color: t.PRIMARY }} />
              <span className="text-[11px]" style={{ color: t.MUTED }}>Out</span>
              <span className="text-[11px] font-bold" style={{ color: t.TEXT }}>{property.checkoutTime}</span>
            </div>
            <span className="text-[10px]" style={{ color: t.MUTED }}>·</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Icon name="group" size={12} style={{ color: t.PRIMARY }} />
              <span className="text-[11px] font-bold" style={{ color: t.TEXT }}>Up to {property.maxGuests}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Three-column layout ── */}
      <div className="px-4 md:px-6 lg:px-10 xl:px-16 py-6">
        <div className="flex gap-5 lg:gap-7 items-start">

          {/* Left TOC (desktop) */}
          <aside className="hidden md:block w-48 lg:w-56 flex-shrink-0 sticky top-4 self-start">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-2" style={{ color: t.MUTED }}>Contents</p>
            <nav className="space-y-0.5">
              {topLevelSections.map((s) => (
                <React.Fragment key={s.key}>
                  <button onClick={() => scrollTo(s.key)}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors"
                    style={{
                      background: activeSection === s.key ? `${t.PRIMARY}18` : 'transparent',
                      color: activeSection === s.key ? t.PRIMARY : t.MUTED,
                      fontWeight: activeSection === s.key ? 700 : 500,
                    }}>
                    <Icon name={s.icon} size={14} style={{ color: activeSection === s.key ? t.PRIMARY : t.MUTED }} />
                    <span className="truncate">{s.label}</span>
                  </button>
                  {childSections(s.key).map((child) => (
                    <button key={child.key} onClick={() => scrollTo(child.key)}
                      className="w-full text-left flex items-center gap-2 pl-7 pr-3 py-1.5 rounded-lg text-[12px] transition-colors"
                      style={{
                        color: activeSection === child.key ? t.PRIMARY : t.MUTED,
                        fontWeight: activeSection === child.key ? 700 : 500,
                      }}>
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'currentColor' }} />
                      <span className="truncate">{child.label}</span>
                    </button>
                  ))}
                </React.Fragment>
              ))}
              {/* FAQ in left sidebar */}
              <div className="pt-2 mt-1" style={{ borderTop: `1px solid ${t.BORDER}` }}>
                <Link to={`/v2/${slug}/faq`}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors hover:opacity-80 font-semibold"
                  style={{ color: nightMode ? '#A78BFA' : '#D97706', background: nightMode ? 'rgba(109,40,217,0.15)' : 'rgba(253,230,138,0.3)' }}>
                  <Icon name="help" size={14} style={{ color: nightMode ? '#A78BFA' : '#D97706' }} />
                  <span>FAQ</span>
                </Link>
                <Link to={`/v2/${slug}/checkout`}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors"
                  style={{ color: t.MUTED }}>
                  <Icon name="logout" size={14} />
                  <span>Check-Out</span>
                </Link>
              </div>
            </nav>
          </aside>

          {/* Center content */}
          <main className="flex-1 min-w-0">
            {MAIN_SECTIONS.filter((s) => !s.parentKey).map(renderSection)}

            {/* Checkout CTA */}
            <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${t.BORDER}` }}>
              <Link to={`/v2/${slug}/checkout`}
                className="flex items-center justify-between rounded-2xl p-5 text-white hover:opacity-90 transition-opacity group shadow-md"
                style={{ background: t.SUNSET }}>
                <div>
                  <p className="text-white/70 text-label-sm uppercase tracking-widest mb-0.5">Ready to leave?</p>
                  <p className="font-bold text-lg">Check-Out Instructions</p>
                  <p className="text-white/80 text-label-md mt-0.5">Check-out by {property.checkoutTime}</p>
                </div>
                <Icon name="arrow_forward" size={24} className="text-white group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </main>

          {/* Right sidebar (large screens) */}
          <div className="hidden lg:block w-56 xl:w-64 flex-shrink-0 sticky top-4 self-start">
            <V2RightSidebar property={property} slug={slug} mapsUrl={mapsUrl} />
          </div>

        </div>
      </div>
    </div>
    </NightModeCtx.Provider>
  )
}
