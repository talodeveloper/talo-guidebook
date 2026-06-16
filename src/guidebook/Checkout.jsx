import { useState, useEffect } from 'react'
import { useOutletContext, Link, useParams, useLocation } from 'react-router-dom'
import { contentStore } from '../data/contentStore'
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
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
  const isV3 = location.pathname.startsWith('/v3/')
  const backPath = isV2 ? `/v2/${slug}` : isV3 ? `/v3/${slug}` : `/${slug}`
  const [blocks, setBlocks] = useState([])
  const [checked, setChecked] = useState({})

  // V2 checkout sign-out form
  const [checkoutForm, setCheckoutForm]           = useState({ primaryName: '', guestName: '' })
  const [checkoutSubmitted, setCheckoutSubmitted] = useState(false)
  const [submittingCheckout, setSubmittingCheckout] = useState(false)

  useEffect(() => {
    const load = () => {
      let next = contentStore.getBlocksForSection('checkout', slug)
      // V3: admin can hide individual checkout parts per property
      if (isV3) {
        try {
          const raw = localStorage.getItem('talo_admin_v3_live')
                   || localStorage.getItem('talo_v3_guest_cache')
                   || localStorage.getItem('talo_admin_v3_draft')
          const disabled = raw ? (JSON.parse(raw)?.disabledBlocks?.[slug] || []) : []
          if (disabled.length) next = next.filter(b => !disabled.includes(b.id))
        } catch {}
      }
      setBlocks(next)
    }
    load()
    return contentStore.subscribe(load)
  }, [slug, isV3])

  // V3: amber time banner can be hidden from admin (Check-Out editor)
  const showTimeBanner = !isV3 || property.showCheckoutTimeBanner !== false

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

  const handleCheckout = async () => {
    if (!checkoutForm.primaryName.trim() || !checkoutForm.guestName.trim()) return
    setSubmittingCheckout(true)
    const now = new Date()
    const ts = now.toLocaleString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    try {
      await addDoc(collection(db, 'v2_checkouts'), {
        primaryGuestName:      checkoutForm.primaryName.trim(),
        guestName:             checkoutForm.guestName.trim(),
        propertySlug:          slug,
        propertyName:          property.name,
        checkedOutAt:          now.toISOString(),
        checkedOutAtFormatted: ts,
        checkedOutBy:          'guest',
      })
    } catch (err) {
      console.error('[Firestore] checkout save failed:', err)
    }
    setSubmittingCheckout(false)
    setCheckoutSubmitted(true)
  }

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-10">
      {/* Back link */}
      <Link
        to={backPath}
        className="checkout-back inline-flex items-center gap-1.5 text-label-md text-primary hover:underline mb-8"
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
        {showTimeBanner && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <Icon name="schedule" size={18} className="text-amber-700 flex-shrink-0" />
            <p className="text-amber-800 text-body-md font-semibold">Check-out time: {property.checkoutTime}</p>
          </div>
        )}
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
                className={`checkout-item flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  checked[i]
                    ? 'bg-secondary-container/30 border border-secondary/20'
                    : 'border border-outline-variant/20 hover:bg-surface-container'
                }`}
              >
                <div
                  onClick={() => toggle(i)}
                  className={`checkout-checkbox w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    checked[i] ? 'bg-primary border-primary' : 'border-outline-variant'
                  }`}
                >
                  {checked[i] && <Icon name="check" size={13} className="checkout-checkbox-icon text-white" />}
                </div>
                <span className={`checkout-item-text text-body-md leading-snug ${checked[i] ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                  {item}
                </span>
              </label>
            ))}
          </div>

          {allChecked && (
            <div>
              {/* All done card */}
              <div className="checkout-all-done mt-5 bg-primary text-white rounded-xl px-5 py-5 text-center">
                <Icon name="check_circle" size={28} className="text-white mx-auto mb-1" />
                <p className="font-bold text-label-lg">All done — safe travels!</p>
                <p className="text-white/80 text-label-md mt-0.5">Thank you for staying with TALO Rentals.</p>
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

              {/* V2 + V3: sign-out form (all tasks must be checked first — gate is allChecked above) */}
              {(isV2 || isV3) && (
                checkoutSubmitted ? (
                  <div className="mt-4 rounded-xl p-5 text-center border border-green-200 bg-green-50">
                    <Icon name="check_circle" size={30} className="text-green-600 mx-auto mb-2" />
                    <p className="font-bold text-green-800 text-[15px]">Checkout confirmed!</p>
                    <p className="text-green-700 text-[13px] mt-1">
                      Thanks, {checkoutForm.guestName}! Safe travels. 🌊
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon name="assignment_turned_in" size={16} className="text-primary" />
                      <p className="font-bold text-on-surface text-[14px]">Sign Out</p>
                      <span className="ml-auto text-[11px] text-on-surface-variant">Takes 10 seconds</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">
                          Primary Booker's Name <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.primaryName}
                          onChange={e => setCheckoutForm(f => ({ ...f, primaryName: e.target.value }))}
                          placeholder="Name on the original booking"
                          className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/30 text-[13px] text-on-surface bg-surface focus:outline-none focus:ring-1"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">
                          Your Full Name <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.guestName}
                          onChange={e => setCheckoutForm(f => ({ ...f, guestName: e.target.value }))}
                          placeholder="Your own full name"
                          className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/30 text-[13px] text-on-surface bg-surface focus:outline-none focus:ring-1"
                        />
                      </div>
                      <button
                        disabled={!checkoutForm.primaryName.trim() || !checkoutForm.guestName.trim() || submittingCheckout}
                        onClick={handleCheckout}
                        className="w-full py-3 rounded-xl text-[13px] font-bold text-white transition-opacity disabled:opacity-40 mt-1"
                        style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}
                      >
                        {submittingCheckout ? 'Confirming…' : 'Confirm Checkout'}
                      </button>
                    </div>
                  </div>
                )
              )}
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
      <div className="checkout-contact mt-8 bg-surface-container rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-on-surface">{property.ownerName}</p>
          <p className="text-on-surface-variant text-label-md">Your host</p>
        </div>
        <div className="flex gap-2">
          {property.ownerPhone && (
            <a href={`tel:${property.ownerPhone}`}
              className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-label-md font-semibold hover:bg-primary-container transition-colors">
              <Icon name="phone" size={16} className="text-white" /> Call / Text
            </a>
          )}
          {property.ownerEmail && (
            <a href={`mailto:${property.ownerEmail}`}
              className="flex items-center gap-1.5 border border-outline-variant px-4 py-2 rounded-xl text-label-md font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
              <Icon name="mail" size={16} /> Email
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
