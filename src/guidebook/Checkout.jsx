import { useState, useEffect } from 'react'
import { useOutletContext, Link, useParams, useLocation } from 'react-router-dom'
import { contentStore } from '../data/contentStore'
import Icon from '../components/Icon'

function ContentBlock({ block }) {
  return (
    <div className="mb-6 last:mb-0">
      {block.title && (
        <h4 className="text-[15px] font-bold text-on-surface mb-2">{block.title}</h4>
      )}
      <div
        className="text-body-md text-on-surface-variant leading-relaxed
          [&_strong]:font-semibold [&_strong]:text-on-surface
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mt-1
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mt-1
          [&_p]:mb-2 [&_p:last-child]:mb-0
          [&_li]:text-on-surface-variant"
        dangerouslySetInnerHTML={{ __html: block.body }}
      />
    </div>
  )
}

export default function Checkout() {
  const { property } = useOutletContext()
  const { slug } = useParams()
  const location = useLocation()
  const isV2 = location.pathname.startsWith('/v2/')
  const backPath = isV2 ? `/v2/${slug}` : `/${slug}`
  const [blocks, setBlocks] = useState([])
  const [checked, setChecked] = useState({})

  useEffect(() => {
    const load = () => setBlocks(contentStore.getBlocksForSection('checkout', slug))
    load()
    return contentStore.subscribe(load)
  }, [slug])

  // Extract checklist items from the first ordered list block
  const checklistBlock = blocks.find((b) => b.body?.includes('<ol>'))
  const otherBlocks = blocks.filter((b) => b !== checklistBlock)

  let checklistItems = []
  if (checklistBlock) {
    const match = checklistBlock.body.match(/<li>(.*?)<\/li>/gs) || []
    checklistItems = match.map((item) =>
      item.replace(/<\/?li>/g, '').replace(/<[^>]+>/g, '')
    )
  }

  const allChecked = checklistItems.length > 0 &&
    checklistItems.every((_, i) => checked[i])

  const toggle = (i) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-10">
      {/* Back link */}
      <Link
        to={backPath}
        className="inline-flex items-center gap-1.5 text-label-md text-primary hover:underline mb-8"
      >
        <Icon name="arrow_back" size={16} className="text-primary" />
        Back to Guidebook
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Icon name="logout" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-headline-lg font-bold text-primary">Check-Out</h1>
            <p className="text-on-surface-variant text-body-md">{property.name} · {property.checkoutTime}</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <Icon name="schedule" size={18} className="text-amber-700 flex-shrink-0" />
          <p className="text-amber-800 text-body-md font-semibold">Check-out time: {property.checkoutTime}</p>
        </div>
      </div>

      {/* Interactive checklist */}
      {checklistItems.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 mb-8">
          <h3 className="text-headline-md font-semibold text-primary mb-5 flex items-center gap-2">
            <Icon name="checklist" size={20} className="text-primary" />
            {checklistBlock.title || 'Before You Go'}
          </h3>
          <div className="space-y-3">
            {checklistItems.map((item, i) => (
              <label
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  checked[i]
                    ? 'bg-secondary-container/30 border border-secondary/20'
                    : 'border border-outline-variant/20 hover:bg-surface-container'
                }`}
              >
                <div
                  onClick={() => toggle(i)}
                  className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    checked[i] ? 'bg-primary border-primary' : 'border-outline-variant'
                  }`}
                >
                  {checked[i] && <Icon name="check" size={13} className="text-white" />}
                </div>
                <span className={`text-body-md leading-snug ${checked[i] ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                  {item}
                </span>
              </label>
            ))}
          </div>

          {allChecked && (
            <div className="mt-5 bg-primary text-white rounded-xl px-5 py-5 text-center">
              <Icon name="check_circle" size={28} className="text-white mx-auto mb-1" />
              <p className="font-bold text-label-lg">All done — safe travels!</p>
              <p className="text-white/80 text-label-md mt-0.5">Thank you for staying with TALO Rentals.</p>
              {/* Future booking CTA */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white/85 text-label-md mb-3">
                  Loved your stay? We'd love to have you back. 🌊
                </p>
                <a
                  href="https://talo.rentals/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl font-bold text-label-md hover:opacity-90 transition-opacity"
                  style={{ color: '#C84B31' }}
                >
                  <Icon name="cottage" size={16} style={{ color: '#C84B31' }} />
                  Browse our properties
                  <Icon name="arrow_forward" size={14} style={{ color: '#C84B31' }} />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other content blocks */}
      {otherBlocks.map((block) => (
        <div key={block.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 mb-4">
          <ContentBlock block={block} />
        </div>
      ))}

      {/* Contact */}
      <div className="mt-8 bg-surface-container rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-on-surface">{property.ownerName}</p>
          <p className="text-on-surface-variant text-label-md">Your host</p>
        </div>
        <div className="flex gap-2">
          <a href={`tel:${property.ownerPhone}`}
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-label-md font-semibold hover:bg-primary-container transition-colors">
            <Icon name="phone" size={16} className="text-white" /> Call
          </a>
          <a href={`mailto:${property.ownerEmail}`}
            className="flex items-center gap-1.5 border border-outline-variant px-4 py-2 rounded-xl text-label-md font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
            <Icon name="mail" size={16} /> Email
          </a>
        </div>
      </div>
    </div>
  )
}
