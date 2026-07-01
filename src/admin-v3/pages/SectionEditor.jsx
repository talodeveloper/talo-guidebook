import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminV3Store } from '../../data/adminV3Store'
import { SECTIONS } from '../../data/sections'
import Icon from '../../components/Icon'
import BodyEditor from '../components/BodyEditor'
import ImagePicker from '../components/ImagePicker'

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '')
const imgUrl = p => {
  if (!p) return p
  if (/^https?:\/\//i.test(p) || p.startsWith('data:') || p.startsWith('blob:')) return p
  return `${BASE_URL}${p}`
}

const PLACE_SECTIONS = ['local_guide', 'things_to_do']
const RULES_SECTION = 'house_rules'
const CHECKOUT_SECTION = 'checkout'

// On/off switch used for checkout page parts
function PartToggle({ enabled, onToggle, title }) {
  return (
    <button onClick={onToggle} title={title}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-green-500' : 'bg-slate-300'}`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  )
}

const isDeletable = (_block) => true

function ImageCaptionField({ image, onChange }) {
  return (
    <div className="flex items-start gap-2.5">
      {image.src && (
        <img
          src={imgUrl(image.src)}
          alt=""
          className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-slate-100"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 font-mono truncate mb-1">{image.src}</p>
        <input
          type="text"
          value={image.caption || ''}
          onChange={e => onChange({ ...image, caption: e.target.value })}
          placeholder="Caption (leave blank for section name)"
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300"
        />
      </div>
    </div>
  )
}

function BlockCard({ block, isShared, slug, onSaved, onDeleted }) {
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState(block)
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canDelete = isDeletable(block)

  useEffect(() => { setLocal(block); setDirty(false) }, [block])

  const update = (field, val) => { setLocal(prev => ({ ...prev, [field]: val })); setDirty(true) }
  const updateImage = (idx, img) => { const imgs = [...(local.images || [])]; imgs[idx] = img; update('images', imgs) }

  const handleSave = () => { adminV3Store.updateBlock(local.id, local); setDirty(false); onSaved?.() }
  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    adminV3Store.deleteBlock(block.id)
    onDeleted?.()
  }

  const isPlace = PLACE_SECTIONS.includes(block.sectionKey)

  return (
    <div className={`rounded-xl border bg-white transition-all ${isShared ? 'border-slate-100 opacity-80' : 'border-slate-200'}`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left">
        <div className="flex items-center gap-2.5 min-w-0">
          {isShared && <Icon name="lock" size={14} className="text-slate-400 flex-shrink-0" />}
          <p className={`text-sm font-semibold truncate ${isShared ? 'text-slate-500' : 'text-slate-800'}`}>
            {block.title || <span className="italic text-slate-400">Untitled block</span>}
          </p>
          {dirty && <span className="text-[10px] text-amber-600 font-semibold flex-shrink-0">• unsaved</span>}
        </div>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={18} className="text-slate-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100">
          {isShared ? (
            <div className="pt-3">
              <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center gap-2">
                <Icon name="lock" size={13} className="text-amber-600 flex-shrink-0" />
                Shared rule — edit in <Link to="/admin-v3/global" className="font-semibold text-amber-700 hover:underline">Global Content</Link>.
              </p>
              {block.title && <p className="mt-3 text-sm font-semibold text-slate-700">{block.title}</p>}
              {block.body && (
                <div className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: block.body }} />
              )}
            </div>
          ) : (
            <>
              <div className="pt-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title</label>
                <input
                  type="text"
                  value={local.title || ''}
                  onChange={e => update('title', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Body</label>
                <BodyEditor key={`${block.id}-body`} value={local.body} onChange={v => update('body', v)} />
              </div>
              {isPlace && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                    <input type="text" value={local.phone || ''} onChange={e => update('phone', e.target.value)}
                      placeholder="+1 (619) 555-0000"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website URL</label>
                    <input type="text" value={local.link || ''} onChange={e => update('link', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Images</label>
                <ImagePicker
                  value={local.images || []}
                  slug={slug}
                  blockId={block.id}
                  onChange={imgs => update('images', imgs)}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  {canDelete ? (
                    confirmDelete ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600">Are you sure?</span>
                        <button onClick={handleDelete} className="text-xs font-semibold text-red-600 hover:text-red-800">Yes, delete</button>
                        <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-500">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={handleDelete} className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
                        <Icon name="delete" size={13} /> Delete
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-300 flex items-center gap-1">
                      <Icon name="lock" size={11} /> Core block
                    </span>
                  )}
                </div>
                <button onClick={handleSave} disabled={!dirty}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function AddBlockForm({ sectionKey, slug, onAdded }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const isPlace = PLACE_SECTIONS.includes(sectionKey)

  const handleAdd = () => {
    if (!title.trim()) return
    adminV3Store.addBlock({ sectionKey, type: 'property', propertySlug: slug, title: title.trim(), body: '', images: [] })
    setTitle('')
    setOpen(false)
    onAdded?.()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-orange-300 hover:text-orange-600 transition-colors">
        <Icon name="add" size={16} />
        Add {sectionKey === RULES_SECTION ? 'rule' : isPlace ? 'place' : 'block'}
      </button>
    )
  }

  return (
    <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4 space-y-3">
      <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">
        New {sectionKey === RULES_SECTION ? 'Rule' : isPlace ? 'Place' : 'Block'}
      </p>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        placeholder="Title…" autoFocus
        className="w-full px-3 py-2 text-sm rounded-lg border border-orange-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-400" />
      <div className="flex gap-2">
        <button onClick={handleAdd} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>Add</button>
        <button onClick={() => { setOpen(false); setTitle('') }}
          className="px-4 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200">Cancel</button>
      </div>
    </div>
  )
}

function MoveButtons({ onUp, onDown, disableUp, disableDown }) {
  return (
    <div className="flex flex-col gap-0.5 flex-shrink-0 self-start pt-3">
      <button type="button" onClick={onUp} disabled={disableUp}
        className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
        <Icon name="keyboard_arrow_up" size={16} />
      </button>
      <button type="button" onClick={onDown} disabled={disableDown}
        className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
        <Icon name="keyboard_arrow_down" size={16} />
      </button>
    </div>
  )
}

export default function SectionEditorV3() {
  const { slug, sectionKey } = useParams()
  // Per-property config first (covers custom + renamed sections), then static defs
  const section = adminV3Store.getSectionConfig(slug).find(s => s.key === sectionKey)
    || SECTIONS.find(s => s.key === sectionKey)
  const [blocks, setBlocks] = useState([])

  const isRules = sectionKey === RULES_SECTION
  const isCheckout = sectionKey === CHECKOUT_SECTION
  const [info, setInfo] = useState(adminV3Store.getPropertyInfo(slug))
  const [disabledIds, setDisabledIds] = useState(adminV3Store.getDisabledBlocks(slug))

  const loadBlocks = useCallback(() => {
    // Rules: single mixed list (global + property) in per-property display order
    setBlocks(sectionKey === RULES_SECTION
      ? adminV3Store.getOrderedBlocksForSection(sectionKey, slug)
      : adminV3Store.getBlocksForSection(sectionKey, slug))
  }, [sectionKey, slug])

  useEffect(() => {
    const refresh = () => {
      loadBlocks()
      setInfo(adminV3Store.getPropertyInfo(slug))
      setDisabledIds(adminV3Store.getDisabledBlocks(slug))
    }
    refresh()
    return adminV3Store.subscribe(refresh)
  }, [loadBlocks, slug])

  const displayBlocks = blocks

  const handleMove = (index, dir) => {
    const target = dir === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= displayBlocks.length) return
    const reordered = [...displayBlocks]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    if (isRules) {
      // Per-property order overlay — global rules can mix freely with
      // property rules without affecting other properties
      adminV3Store.setPropertyBlockOrder(slug, sectionKey, reordered.map(b => b.id))
    } else {
      reordered.forEach((block, i) => adminV3Store.updateBlock(block.id, { order: i + 1 }))
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link to="/admin-v3/dashboard" className="hover:text-slate-600">Dashboard</Link>
        <Icon name="chevron_right" size={12} />
        <Link to={`/admin-v3/property/${slug}`} className="hover:text-slate-600 capitalize">{slug.replace(/-/g, ' ')}</Link>
        <Icon name="chevron_right" size={12} />
        <span className="text-slate-700 font-medium">{section?.label || sectionKey}</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        {section && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            <Icon name={section.icon} size={18} className="text-white" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900">{section?.label || sectionKey}</h1>
          <p className="text-xs text-slate-500">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''} · <span className="capitalize">{slug.replace(/-/g, ' ')}</span>
          </p>
        </div>
      </div>

      {isRules && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2 mb-4">
          <Icon name="swap_vert" size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <strong>Global</strong> <Icon name="lock" size={10} className="inline text-blue-500" /> and{' '}
            <strong>property-specific</strong> rules can be freely mixed with the ↑↓ arrows.
            The order is saved for <span className="capitalize font-semibold">{slug.replace(/-/g, ' ')}</span> only —
            other properties keep their own order. Global rule content is edited in{' '}
            <Link to="/admin-v3/global" className="font-semibold underline">Global Content</Link>.
          </p>
        </div>
      )}

      {/* Checkout-only: page part toggles */}
      {isCheckout && (
        <>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2 mb-4">
            <Icon name="visibility" size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Use the switches to show/hide each part of the check-out page for{' '}
              <span className="capitalize font-semibold">{slug.replace(/-/g, ' ')}</span>.
              Hidden parts keep their content and can be re-enabled anytime.
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Icon name="schedule" size={15} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">Check-out time banner</p>
              <p className="text-xs text-slate-400">The amber "Check-out time: {info.checkoutTime}" strip at the top of the page</p>
            </div>
            <PartToggle
              enabled={info.showCheckoutTimeBanner !== false}
              onToggle={() => adminV3Store.updatePropertyInfo(slug, { showCheckoutTimeBanner: info.showCheckoutTimeBanner === false })}
              title="Show/hide the check-out time banner"
            />
          </div>
        </>
      )}

      <div className="space-y-2 mb-4">
        {displayBlocks.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">No blocks yet — add one below.</p>
        )}
        {displayBlocks.map((block, i) => {
          const isOff = isCheckout && disabledIds.includes(block.id)
          return (
            <div key={block.id} className={`flex items-start gap-2 ${isOff ? 'opacity-50' : ''}`}>
              {displayBlocks.length > 1 && (
                <MoveButtons
                  onUp={() => handleMove(i, 'up')}
                  onDown={() => handleMove(i, 'down')}
                  disableUp={i === 0}
                  disableDown={i === displayBlocks.length - 1}
                />
              )}
              <div className="flex-1 min-w-0">
                <BlockCard block={block} isShared={isRules && block.type === 'shared'} slug={slug} onSaved={loadBlocks} onDeleted={loadBlocks} />
              </div>
              {isCheckout && (
                <div className="self-start pt-3.5 pr-1">
                  <PartToggle
                    enabled={!isOff}
                    onToggle={() => adminV3Store.toggleBlockDisabled(slug, block.id)}
                    title={isOff ? 'Show this part on the check-out page' : 'Hide this part from the check-out page'}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <AddBlockForm sectionKey={sectionKey} slug={slug} onAdded={loadBlocks} />
    </div>
  )
}
