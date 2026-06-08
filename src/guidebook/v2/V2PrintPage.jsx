import { useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { SECTIONS } from '../../data/sections'
import { contentStore } from '../../data/contentStore'
import { FAQ_DATA } from '../../data/faqData'

const imgUrl = (path) => path ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}` : path

const PRINT_SECTIONS = SECTIONS.filter(
  (s) => !['checkout', 'videos', 'local_guide', 'things_to_do'].includes(s.key)
)

// ─── Inline HTML body renderer ────────────────────────────────────────────────
function Body({ html }) {
  return (
    <div
      style={{ fontSize: 13, lineHeight: 1.65, color: '#374151', marginTop: 6 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// ─── Section block renderer ───────────────────────────────────────────────────
function PrintBlock({ block }) {
  return (
    <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
      {block.title && (
        <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 4 }}>{block.title}</p>
      )}
      {block.body && <Body html={block.body} />}
      {block.images?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {block.images.map((img, i) => (
            <figure key={i} style={{ margin: 0 }}>
              <img
                src={imgUrl(img.src)}
                alt={img.caption}
                style={{ width: 200, height: 130, objectFit: 'cover', borderRadius: 8, display: 'block' }}
              />
              {img.caption && (
                <figcaption style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3, textAlign: 'center', width: 200 }}>
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main print page ──────────────────────────────────────────────────────────
export default function V2PrintPage() {
  const { property } = useOutletContext()
  const { slug } = useParams()
  const [blocks, setBlocks] = useState({})
  const faqs = FAQ_DATA[slug] || []
  const checkoutBlocks = blocks['checkout'] || []

  useEffect(() => {
    const load = () => {
      const all = {}
      ;[...PRINT_SECTIONS, { key: 'checkout' }].forEach((s) => {
        all[s.key] = contentStore.getBlocksForSection(s.key, slug)
      })
      setBlocks(all)
    }
    load()
    return contentStore.subscribe(load)
  }, [slug])

  // Parse checkout checklist items
  const checklistBlock = checkoutBlocks.find((b) => b.body?.includes('<ol>'))
  const otherCheckoutBlocks = checkoutBlocks.filter((b) => b !== checklistBlock)
  let checklistItems = []
  if (checklistBlock) {
    const match = checklistBlock.body.match(/<li>(.*?)<\/li>/gs) || []
    checklistItems = match.map((item) => item.replace(/<\/?li>/g, '').replace(/<[^>]+>/g, ''))
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: '0 0 60px' }}>

      {/* ── Print button (hidden in actual print) ── */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#fff', borderBottom: '1px solid #E5E7EB',
        padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button
          onClick={() => window.print()}
          style={{
            background: '#C84B31', color: '#fff', border: 'none', borderRadius: 10,
            padding: '9px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          🖨️ Print / Save as PDF
        </button>
        <span style={{ fontSize: 12, color: '#6B7280' }}>
          To save as PDF: choose "Save as PDF" in the print dialog
        </span>
      </div>

      {/* ── Document body ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 32px 0' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, paddingBottom: 20, borderBottom: '2px solid #C84B31' }}>
          <img
            src={imgUrl('/images/talo-logo.png')}
            alt="TALO Rentals"
            style={{ height: 48, marginBottom: 12 }}
          />
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#C84B31', margin: '0 0 4px' }}>
            {property.name} — Guest Guidebook
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{property.address}</p>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0' }}>
            Check-in: {property.checkinTime} &nbsp;·&nbsp; Check-out: {property.checkoutTime} &nbsp;·&nbsp; Up to {property.maxGuests} guests
          </p>
        </div>

        {/* ── Guidebook sections ── */}
        {PRINT_SECTIONS.filter((s) => !s.parentKey).map((section) => {
          const sectionBlocks = blocks[section.key] || []
          const children = PRINT_SECTIONS.filter((s) => s.parentKey === section.key)
          const childBlocks = children.flatMap((c) => blocks[c.key] || [])
          if (sectionBlocks.length === 0 && childBlocks.length === 0) return null

          return (
            <div key={section.key} style={{ marginBottom: 28, pageBreakInside: 'avoid' }}>
              <h2 style={{
                fontSize: 17, fontWeight: 800, color: '#C84B31',
                margin: '0 0 14px', paddingBottom: 6,
                borderBottom: '1px solid #FECDD3',
              }}>
                {section.label}
              </h2>
              {sectionBlocks.map((b) => <PrintBlock key={b.id} block={b} />)}
              {children.map((child) => {
                const cb = blocks[child.key] || []
                if (cb.length === 0) return null
                return (
                  <div key={child.key} style={{ marginTop: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {child.label}
                    </p>
                    {cb.map((b) => <PrintBlock key={b.id} block={b} />)}
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* ── FAQ ── */}
        {faqs.length > 0 && (
          <div style={{ marginTop: 36, pageBreakBefore: 'always' }}>
            <h2 style={{
              fontSize: 20, fontWeight: 800, color: '#C84B31',
              margin: '0 0 20px', paddingBottom: 8,
              borderBottom: '2px solid #FECDD3',
            }}>
              Frequently Asked Questions
            </h2>
            {faqs.map((item, i) => (
              <div key={i} style={{
                marginBottom: 16, paddingBottom: 14,
                borderBottom: '1px solid #F3F4F6',
                pageBreakInside: 'avoid',
              }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', margin: '0 0 5px' }}>
                  {i + 1}. {item.q}
                </p>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Check-Out Instructions ── */}
        <div style={{ marginTop: 36, pageBreakBefore: 'always' }}>
          <h2 style={{
            fontSize: 20, fontWeight: 800, color: '#C84B31',
            margin: '0 0 8px', paddingBottom: 8,
            borderBottom: '2px solid #FECDD3',
          }}>
            Check-Out Instructions
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
            Check-out time: <strong>{property.checkoutTime}</strong> &nbsp;·&nbsp; {property.name}
          </p>

          {checklistItems.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: '0 0 10px' }}>
                {checklistBlock?.title || 'Before You Go'}
              </p>
              {checklistItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  marginBottom: 8, pageBreakInside: 'avoid',
                }}>
                  <div style={{
                    width: 16, height: 16, border: '1.5px solid #C84B31',
                    borderRadius: 4, flexShrink: 0, marginTop: 2,
                  }} />
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          )}

          {otherCheckoutBlocks.map((b) => <PrintBlock key={b.id} block={b} />)}
        </div>

        {/* ── Footer ── */}
        <div style={{
          marginTop: 40, paddingTop: 16, borderTop: '1px solid #E5E7EB',
          fontSize: 12, color: '#9CA3AF', textAlign: 'center',
        }}>
          <p style={{ margin: 0 }}>
            Questions? Contact Joe Saari · {property.ownerPhone} · {property.ownerEmail}
          </p>
          <p style={{ margin: '4px 0 0' }}>TALO Rentals · talo.rentals</p>
        </div>
      </div>
    </div>
  )
}
