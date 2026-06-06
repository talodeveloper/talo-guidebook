import React, { useEffect, useState } from 'react'
import { useOutletContext, Link, useParams } from 'react-router-dom'
import { SECTIONS } from '../data/sections'
import { contentStore } from '../data/contentStore'
import Icon from '../components/Icon'

const MAIN_SECTIONS = SECTIONS.filter((s) => s.key !== 'checkout')

// ─── Standard block image grid ─────────────────────────────────────────────

function BlockImages({ images }) {
  if (!images || images.length === 0) return null
  return (
    <div className={`mt-4 grid gap-3 ${
      images.length === 1 ? 'grid-cols-1'
      : images.length === 2 ? 'grid-cols-2'
      : 'grid-cols-2 md:grid-cols-3'
    }`}>
      {images.map((img, i) => (
        <figure key={i} className="rounded-xl overflow-hidden border border-outline-variant/20">
          <img
            src={img.src}
            alt={img.caption}
            className="w-full object-cover"
            style={{ maxHeight: images.length === 1 ? '360px' : '220px' }}
          />
          {img.caption && (
            <figcaption className="px-3 py-1.5 text-label-sm text-on-surface-variant bg-surface-container/60 text-center">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}

// ─── Standard content block (used for most sections) ──────────────────────

function ContentBlock({ block }) {
  const isPlace = !!(block.phone || block.link)
  return (
    <div className="mb-6 last:mb-0">
      {isPlace && block.images?.[0]?.src && (
        <div className="mb-3 rounded-xl overflow-hidden border border-outline-variant/15" style={{ maxHeight: '180px' }}>
          <img src={block.images[0].src} alt={block.images[0].caption || block.title} className="w-full h-44 object-cover" />
        </div>
      )}
      {block.title && (
        <h4 className="text-[15px] font-bold text-on-surface mb-2">{block.title}</h4>
      )}
      {block.body && (
        <div
          className="text-body-md text-on-surface-variant leading-relaxed
            [&_strong]:font-semibold [&_strong]:text-on-surface
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mt-1
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mt-1
            [&_p]:mb-2 [&_p:last-child]:mb-0
            [&_li]:text-on-surface-variant"
          dangerouslySetInnerHTML={{ __html: block.body }}
        />
      )}
      {isPlace && (
        <div className="flex flex-wrap gap-2 mt-3">
          {block.phone && (
            <a href={`tel:${block.phone}`}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-label-sm font-semibold hover:bg-primary/20 transition-colors">
              <Icon name="phone" size={13} className="text-primary" /> {block.phone}
            </a>
          )}
          {block.link && (
            <a href={block.link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-outline-variant/40 text-on-surface-variant px-3 py-1.5 rounded-lg text-label-sm font-semibold hover:bg-surface-container transition-colors">
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
  const isFlipped = activeId === block.id
  const hasImage = block.images?.[0]?.src
  const mapsUrl = `https://maps.google.com/search?q=${encodeURIComponent(block.title + ' San Diego CA')}`

  return (
    <div
      className="cursor-pointer select-none"
      style={{ perspective: '1000px', height: '260px' }}
      onClick={() => setActiveId(isFlipped ? null : block.id)}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.45s cubic-bezier(0.4,0.2,0.2,1)',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>

        {/* ── Front face ── */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
          className="rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm bg-surface-container-lowest flex flex-col"
        >
          {hasImage ? (
            <div className="relative flex-1 overflow-hidden">
              <img src={block.images[0].src} alt={block.title} className="w-full h-full object-cover" />
              {/* Gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-3">
                <p className="text-white font-bold text-[13px] leading-tight line-clamp-2">{block.title}</p>
                <p className="text-white/65 text-[10px] mt-1 flex items-center gap-1">
                  <Icon name="touch_app" size={10} className="text-white/50" /> Tap for details
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-primary/5">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
                <Icon name="place" size={22} className="text-primary" />
              </div>
              <p className="font-bold text-on-surface text-[13px] text-center leading-tight">{block.title}</p>
              <p className="text-[10px] text-primary/60 mt-2 flex items-center gap-0.5">
                <Icon name="touch_app" size={10} /> Tap for details
              </p>
            </div>
          )}
        </div>

        {/* ── Back face ── */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
          }}
          className="rounded-2xl border border-primary/20 shadow-md bg-surface-container p-3.5 flex flex-col"
        >
          {/* Title + maps link + close hint */}
          <div className="flex items-start gap-1.5 mb-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-w-0 group"
            >
              <span className="font-bold text-on-surface text-[13px] leading-tight flex items-start gap-1 hover:text-primary">
                <span className="line-clamp-2">{block.title}</span>
                <Icon name="location_on" size={12} className="text-primary flex-shrink-0 mt-0.5 opacity-70 group-hover:opacity-100" />
              </span>
            </a>
            <span className="flex-shrink-0 text-[9px] text-on-surface-variant/40 leading-tight text-right">
              tap to<br/>close
            </span>
          </div>

          {/* Body */}
          <div
            className="flex-1 overflow-y-auto text-[12px] text-on-surface-variant leading-relaxed
              [&_p]:mb-1 [&_p:last-child]:mb-0
              [&_strong]:font-semibold [&_strong]:text-on-surface
              [&_ul]:list-disc [&_ul]:pl-3.5 [&_ul]:space-y-0.5
              [&_li]:text-on-surface-variant"
            dangerouslySetInnerHTML={{ __html: block.body }}
          />

          {/* Action buttons */}
          {(block.phone || block.link) && (
            <div className="flex gap-1.5 mt-2 pt-2 border-t border-outline-variant/20 flex-shrink-0">
              {block.phone && (
                <a href={`tel:${block.phone}`} onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1 bg-primary/10 text-primary px-1.5 py-1.5 rounded-lg text-[11px] font-semibold hover:bg-primary/20 transition-colors">
                  <Icon name="phone" size={11} /> Call
                </a>
              )}
              {block.link && (
                <a href={block.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1 border border-outline-variant/40 text-on-surface-variant px-1.5 py-1.5 rounded-lg text-[11px] font-semibold hover:bg-surface-container-low transition-colors">
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

// Grid that manages which card is open (one at a time)
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

// ─── Flat card (Things to Do — no image, not flippable) ────────────────────

function FlatCard({ block }) {
  const noWebLink = !block.link
  const mapsUrl = noWebLink
    ? `https://maps.google.com/search?q=${encodeURIComponent(block.title + ' San Diego CA')}`
    : null

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4">
      <p className="font-bold text-on-surface text-[13px] mb-1.5 flex items-center gap-1.5">
        {block.title}
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="text-primary/60 hover:text-primary transition-colors">
            <Icon name="location_on" size={13} />
          </a>
        )}
      </p>
      <div
        className="text-[12px] text-on-surface-variant leading-relaxed
          [&_p]:mb-1 [&_p:last-child]:mb-0
          [&_strong]:font-semibold [&_strong]:text-on-surface"
        dangerouslySetInnerHTML={{ __html: block.body }}
      />
      {block.link && (
        <a href={block.link} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 border border-outline-variant/40 text-on-surface-variant px-2.5 py-1 rounded-lg text-[11px] font-semibold mt-2.5 hover:bg-surface-container transition-colors">
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
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm group"
      style={{ height: '220px' }}
    >
      <div className="relative w-full h-full bg-surface-container">
        {/* Thumbnail */}
        {thumb ? (
          <img src={thumb} alt={block.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <Icon name="videocam" size={40} className="text-primary/30" />
          </div>
        )}

        {/* Dark overlay — lighter on hover */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/70 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-lg">
            <Icon name="play_arrow" size={28} className="text-white ml-1" />
          </div>
        </div>

        {/* Bottom title strip */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent pt-8 px-3 pb-3">
          <p className="text-white font-bold text-[13px] leading-tight line-clamp-1">{block.title}</p>
          {block.body && (
            <p
              className="text-white/65 text-[11px] mt-0.5 line-clamp-1 leading-snug"
              dangerouslySetInnerHTML={{ __html: block.body.replace(/<[^>]*>/g, '') }}
            />
          )}
          <p className="text-white/45 text-[10px] mt-1 flex items-center gap-1">
            <Icon name="open_in_new" size={9} className="text-white/40" /> View in Google Drive
          </p>
        </div>
      </div>
    </a>
  )
}

function VideoSection({ section, blocks }) {
  if (blocks.length === 0) return null
  return (
    <div id={section.key} className="py-8 border-b border-outline-variant/20 last:border-0 scroll-mt-[90px]">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Icon name={section.icon} size={18} className="text-white" />
        </div>
        <h2 className="text-headline-md font-bold text-primary">{section.label}</h2>
      </div>
      <p className="text-[12px] text-on-surface-variant mb-5 pl-12">
        Click any video to watch in Google Drive
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {blocks.map((block) => (
          <VideoCard key={block.id} block={block} />
        ))}
      </div>
    </div>
  )
}

// ─── Local Guide section ───────────────────────────────────────────────────

function LocalGuideSection({ section, blocks }) {
  if (blocks.length === 0) return null
  return (
    <div id={section.key} className="py-8 border-b border-outline-variant/20 last:border-0 scroll-mt-[90px]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Icon name={section.icon} size={18} className="text-white" />
        </div>
        <h2 className="text-headline-md font-bold text-primary">{section.label}</h2>
      </div>
      <PlaceCardGrid blocks={blocks} />
    </div>
  )
}

// ─── Things to Do section ──────────────────────────────────────────────────

function ThingsToDoSection({ section, blocks }) {
  if (blocks.length === 0) return null
  const withImages = blocks.filter((b) => b.images?.[0]?.src)
  const withoutImages = blocks.filter((b) => !b.images?.[0]?.src)

  return (
    <div id={section.key} className="py-8 border-b border-outline-variant/20 last:border-0 scroll-mt-[90px]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Icon name={section.icon} size={18} className="text-white" />
        </div>
        <h2 className="text-headline-md font-bold text-primary">{section.label}</h2>
      </div>

      {/* Cards with images — flip grid */}
      {withImages.length > 0 && (
        <PlaceCardGrid blocks={withImages} />
      )}

      {/* Cards without images — flat 2-col grid */}
      {withoutImages.length > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${withImages.length > 0 ? 'mt-4' : ''}`}>
          {withoutImages.map((block) => (
            <FlatCard key={block.id} block={block} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Standard section ──────────────────────────────────────────────────────

function Section({ section, blocks }) {
  if (blocks.length === 0) return null
  return (
    <div id={section.key} className="py-8 border-b border-outline-variant/20 last:border-0 scroll-mt-[90px]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Icon name={section.icon} size={18} className="text-white" />
        </div>
        <h2 className="text-headline-md font-bold text-primary">{section.label}</h2>
      </div>
      <div className="space-y-5 divide-y divide-outline-variant/10">
        {blocks.map((block) => (
          <div key={block.id} className="pt-5 first:pt-0">
            <ContentBlock block={block} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SubSection({ section, blocks }) {
  if (blocks.length === 0) return null
  return (
    <div id={section.key} className="pt-6 border-t border-outline-variant/15 scroll-mt-[90px]">
      <div className="flex items-center gap-2 mb-4">
        <Icon name={section.icon} size={15} className="text-primary/70" />
        <h3 className="text-[15px] font-semibold text-primary/80 tracking-tight">{section.label}</h3>
      </div>
      <div className="space-y-5 divide-y divide-outline-variant/10">
        {blocks.map((block) => (
          <div key={block.id} className="pt-5 first:pt-0">
            <ContentBlock block={block} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Right sidebar ─────────────────────────────────────────────────────────

function RightSidebar({ property, slug }) {
  return (
    <aside className="space-y-4">
      {/* WiFi card */}
      <div className="rounded-2xl p-5 text-white" style={{
        background: 'linear-gradient(135deg, #003d44 0%, #00646e 50%, #004d55 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px rgba(0,70,77,0.3)'
      }}>
        <div className="flex items-center gap-2 mb-4">
          <Icon name="wifi" size={18} className="text-white/80" />
          <h3 className="font-bold text-label-md uppercase tracking-wide">Wi-Fi</h3>
        </div>
        <div className="space-y-3">
          <div className="bg-white/15 rounded-xl px-4 py-3">
            <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Network</p>
            <p className="font-bold text-white text-label-md">{property.wifi?.network}</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-3">
            <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Password</p>
            <p className="font-bold text-white text-label-md break-all">{property.wifi?.password}</p>
          </div>
        </div>
        {property.wifi?.notes && (
          <p className="text-white/60 text-xs mt-3 leading-relaxed">{property.wifi.notes}</p>
        )}
      </div>

      {/* Check-out card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="logout" size={18} className="text-primary" />
          <h3 className="font-bold text-label-md uppercase tracking-wide text-primary">Check-Out</h3>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-label-md">
            <span className="text-on-surface-variant flex items-center gap-1.5">
              <Icon name="login" size={14} className="text-on-surface-variant" /> Check-in
            </span>
            <span className="font-bold text-on-surface">{property.checkInTime}</span>
          </div>
          <div className="flex justify-between items-center text-label-md">
            <span className="text-on-surface-variant flex items-center gap-1.5">
              <Icon name="logout" size={14} className="text-on-surface-variant" /> Check-out
            </span>
            <span className="font-bold text-on-surface">{property.checkoutTime}</span>
          </div>
        </div>
        <Link
          to={`/${slug}/checkout`}
          className="flex items-center justify-center gap-2 w-full bg-primary text-white py-2.5 rounded-xl text-label-md font-semibold hover:bg-primary-container transition-colors"
        >
          <Icon name="checklist" size={16} className="text-white" />
          Check-Out Instructions
        </Link>
      </div>

      {/* Host card */}
      <div className="bg-surface-container rounded-xl p-4">
        <p className="text-label-sm text-on-surface-variant mb-2 font-semibold uppercase tracking-wide">Your Host</p>
        <p className="font-bold text-on-surface text-label-md">{property.ownerName}</p>
        <div className="flex gap-2 mt-3">
          <a href={`tel:${property.ownerPhone}`}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white py-2 rounded-lg text-label-sm font-semibold hover:bg-primary-container transition-colors">
            <Icon name="phone" size={14} className="text-white" /> Call
          </a>
          <a href={`mailto:${property.ownerEmail}`}
            className="flex-1 flex items-center justify-center gap-1.5 border border-outline-variant py-2 rounded-lg text-label-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <Icon name="mail" size={14} /> Email
          </a>
        </div>
      </div>
    </aside>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function GuidebookPage() {
  const { property } = useOutletContext()
  const { slug } = useParams()
  const [activeSection, setActiveSection] = useState(MAIN_SECTIONS[0].key)
  const [blocks, setBlocks] = useState({})
  const [tocOpen, setTocOpen] = useState(false)

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

  const watermarkPhoto = '/photos/reynard-way/p2_img1_2007x1505.jpeg'

  // Renders a top-level section choosing the right layout component
  const renderSection = (section) => {
    const sectionBlocks = blocks[section.key] || []
    const children = MAIN_SECTIONS.filter((s) => s.parentKey === section.key)

    // Special layouts
    if (section.key === 'videos') {
      return <VideoSection key={section.key} section={section} blocks={sectionBlocks} />
    }
    if (section.key === 'local_guide') {
      return <LocalGuideSection key={section.key} section={section} blocks={sectionBlocks} />
    }
    if (section.key === 'things_to_do') {
      return <ThingsToDoSection key={section.key} section={section} blocks={sectionBlocks} />
    }

    // Standard section with no children
    if (children.length === 0) {
      return <Section key={section.key} section={section} blocks={sectionBlocks} />
    }

    // Parent section with children (e.g. The Home + Additional Space)
    const hasChildren = children.some((c) => (blocks[c.key] || []).length > 0)
    if (sectionBlocks.length === 0 && !hasChildren) return null

    return (
      <div key={section.key} className="py-8 border-b border-outline-variant/20 last:border-0">
        {sectionBlocks.length > 0 && (
          <>
            <div id={section.key} className="flex items-center gap-3 mb-5 scroll-mt-[90px]">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <Icon name={section.icon} size={18} className="text-white" />
              </div>
              <h2 className="text-headline-md font-bold text-primary">{section.label}</h2>
            </div>
            <div className="space-y-5 divide-y divide-outline-variant/10">
              {sectionBlocks.map((block) => (
                <div key={block.id} className="pt-5 first:pt-0">
                  <ContentBlock block={block} />
                </div>
              ))}
            </div>
          </>
        )}
        {sectionBlocks.length === 0 && hasChildren && (
          <div id={section.key} className="flex items-center gap-3 mb-5 scroll-mt-[90px]">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Icon name={section.icon} size={18} className="text-white" />
            </div>
            <h2 className="text-headline-md font-bold text-primary">{section.label}</h2>
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
    <div className="min-h-screen bg-background relative">

      {/* Full-screen palm watermark */}
      <div className="fixed inset-0 pointer-events-none select-none" style={{ zIndex: 0, opacity: 0.055 }} aria-hidden="true">
        <img src={watermarkPhoto} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>

        {/* TALO header strip */}
        <div className="relative overflow-hidden w-full" style={{
          background: 'linear-gradient(135deg, #002a30 0%, #00464d 35%, #00737f 60%, #004d55 80%, #002a30 100%)',
        }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 45%, transparent 100%)',
          }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-white/30" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-black/20" />
          <div className="relative z-10 px-6 md:px-10 py-3.5 flex items-center justify-between max-w-full">
            <div className="flex items-center gap-3">
              <span className="text-white font-black text-xl tracking-[0.35em] uppercase select-none"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.08)' }}>
                TALO
              </span>
              <span className="hidden sm:block w-px h-4 bg-white/30" />
              <span className="hidden sm:block text-white/55 text-xs font-medium tracking-widest uppercase">Rentals</span>
            </div>
            <span className="text-white/45 text-xs font-medium tracking-wide hidden sm:block">
              {property.name} · Guest Guidebook
            </span>
          </div>
        </div>

        {/* Property info + exterior photo */}
        <div className="bg-surface-container-lowest border-b border-outline-variant/20">
          <div className="px-5 md:px-10 lg:px-16 py-5">
            <div className="flex gap-5 items-stretch flex-col sm:flex-row">
              <div className="flex-1 min-w-0">
                <p className="text-label-sm font-bold uppercase tracking-widest text-secondary mb-1">
                  Guest Guidebook · {property.neighborhood} · San Diego
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight mb-1">{property.name}</h1>
                <p className="text-on-surface-variant text-body-md mb-4">{property.address}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-label-md text-on-surface-variant mb-4">
                  <span className="flex items-center gap-1.5">
                    <Icon name="login" size={15} className="text-primary" />
                    Check-in: <strong className="text-on-surface ml-0.5">{property.checkInTime}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="logout" size={15} className="text-primary" />
                    Check-out: <strong className="text-on-surface ml-0.5">{property.checkoutTime}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="group" size={15} className="text-primary" />
                    Up to <strong className="text-on-surface mx-0.5">{property.maxGuests}</strong> guests
                  </span>
                </div>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary text-label-md font-semibold hover:underline">
                  <Icon name="map" size={16} className="text-primary" />
                  View on Google Maps
                </a>
              </div>
              <div className="w-full sm:w-72 md:w-80 lg:w-96 flex-shrink-0 rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm">
                <img src={exteriorPhoto} alt={`${property.name} — exterior`}
                  className="w-full h-48 sm:h-full object-cover"
                  style={{ minHeight: '180px', maxHeight: '240px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile TOC dropdown */}
        <div className="md:hidden sticky top-0 z-40 bg-surface/96 backdrop-blur-md border-b border-outline-variant/20 px-4 py-2">
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant/20 text-on-surface text-label-md font-semibold"
          >
            <span className="flex items-center gap-2">
              <Icon name="toc" size={16} className="text-primary" />
              {MAIN_SECTIONS.find((s) => s.key === activeSection)?.label || 'Contents'}
            </span>
            <Icon name={tocOpen ? 'expand_less' : 'expand_more'} size={18} className="text-on-surface-variant" />
          </button>
          {tocOpen && (
            <div className="absolute left-4 right-4 top-full mt-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-lg overflow-hidden z-50 max-h-72 overflow-y-auto">
              {topLevelSections.map((s) => (
                <React.Fragment key={s.key}>
                  <button onClick={() => scrollTo(s.key)} className={`w-full flex items-center gap-3 px-4 py-3 text-left text-label-md border-b border-outline-variant/10 last:border-0 transition-colors ${
                    activeSection === s.key ? 'bg-secondary-container/40 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}>
                    <Icon name={s.icon} size={15} className={activeSection === s.key ? 'text-primary' : 'text-on-surface-variant'} />
                    {s.label}
                  </button>
                  {childSections(s.key).map((child) => (
                    <button key={child.key} onClick={() => scrollTo(child.key)} className={`w-full flex items-center gap-3 pl-10 pr-4 py-2.5 text-left text-[13px] border-b border-outline-variant/10 last:border-0 transition-colors ${
                      activeSection === child.key ? 'text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}>
                      <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                      {child.label}
                    </button>
                  ))}
                </React.Fragment>
              ))}
              <Link
                to={`/${slug}/checkout`}
                onClick={() => setTocOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <Icon name="logout" size={15} />
                Check-Out
              </Link>
            </div>
          )}
        </div>

        {/* Three-column layout */}
        <div className="px-4 md:px-6 lg:px-10 xl:px-16 py-6">
          <div className="flex gap-5 lg:gap-7 items-start">

            {/* Left TOC (desktop) */}
            <aside className="hidden md:block w-48 lg:w-56 flex-shrink-0 sticky top-4 self-start">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 px-2">Contents</p>
              <nav className="space-y-0.5">
                {topLevelSections.map((s) => (
                  <React.Fragment key={s.key}>
                    <button onClick={() => scrollTo(s.key)} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                      activeSection === s.key ? 'bg-secondary-container/50 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}>
                      <Icon name={s.icon} size={14} className={activeSection === s.key ? 'text-primary' : 'text-on-surface-variant'} />
                      <span className="truncate">{s.label}</span>
                    </button>
                    {childSections(s.key).map((child) => (
                      <button key={child.key} onClick={() => scrollTo(child.key)} className={`w-full text-left flex items-center gap-2 pl-7 pr-3 py-1.5 rounded-lg text-[12px] transition-colors ${
                        activeSection === child.key ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                      }`}>
                        <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                        <span className="truncate">{child.label}</span>
                      </button>
                    ))}
                  </React.Fragment>
                ))}
                <div className="pt-2 border-t border-outline-variant/20 mt-1">
                  <Link to={`/${slug}/checkout`}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
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
              <div className="mt-8 pt-6 border-t border-outline-variant/20">
                <Link
                  to={`/${slug}/checkout`}
                  className="flex items-center justify-between bg-primary text-white rounded-2xl p-5 hover:bg-primary-container transition-colors group"
                >
                  <div>
                    <p className="text-white/70 text-label-sm uppercase tracking-widest mb-0.5">Ready to leave?</p>
                    <p className="font-bold text-lg">Check-Out Instructions</p>
                    <p className="text-white/80 text-label-md mt-0.5">Check-out by {property.checkoutTime}</p>
                  </div>
                  <Icon name="arrow_forward" size={24} className="text-white group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </main>

            {/* Right sidebar */}
            <div className="hidden lg:block w-56 xl:w-64 flex-shrink-0 sticky top-4 self-start">
              <RightSidebar property={property} slug={slug} />
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
