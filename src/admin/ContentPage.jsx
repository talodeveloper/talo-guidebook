import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SECTIONS } from '../data/sections'
import { contentStore } from '../data/contentStore'
import { adminStore } from '../data/adminStore'
import RichTextEditor from '../components/RichTextEditor'
import Icon from '../components/Icon'

// ── Photo slot in block editor ─────────────────────────────────────────────

function ImageSlot({ image, onUpdate, onRemove }) {
  const inputRef = useRef()
  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onUpdate({ src: ev.target.result, caption: image?.caption || '' })
    reader.readAsDataURL(file)
  }
  return (
    <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest">
      <div
        className="relative aspect-video cursor-pointer group bg-surface-container"
        onClick={() => inputRef.current?.click()}
      >
        {image?.src ? (
          <>
            <img src={image.src} alt={image.caption} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Icon name="upload" size={24} className="text-white" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
            <Icon name="add_photo_alternate" size={28} />
            <span className="text-xs font-semibold">Add photo</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {image?.src && (
        <div className="flex gap-1 p-1.5">
          <input
            type="text"
            value={image.caption || ''}
            onChange={(e) => onUpdate({ ...image, caption: e.target.value })}
            placeholder="Caption…"
            className="flex-1 text-xs px-2 py-1 rounded-lg border border-outline-variant/40 bg-surface focus:outline-none focus:border-primary"
          />
          <button onClick={onRemove} className="p-1 text-red-400 hover:text-red-600 transition-colors">
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Block modal (create / edit) ────────────────────────────────────────────

function BlockModal({ block, sectionKey, onClose }) {
  const properties = adminStore.getProperties()
  const isNew = !block?.id

  const [form, setForm] = useState({
    sectionKey: block?.sectionKey || sectionKey,
    type: block?.type || 'shared',
    propertySlug: block?.propertySlug || '',
    title: block?.title || '',
    body: block?.body || '',
    images: block?.images || [],
    order: block?.order || 99,
    phone: block?.phone || '',
    link: block?.link || '',
    sharedWith: block?.sharedWith || 'all',
  })
  const [saving, setSaving] = useState(false)

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }))

  const updateImage = (i, img) =>
    setForm((p) => ({ ...p, images: p.images.map((x, idx) => idx === i ? img : x) }))

  const removeImage = (i) =>
    setForm((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))

  const addImageSlot = () =>
    setForm((p) => ({ ...p, images: [...p.images, { src: '', caption: '' }] }))

  const handleSave = () => {
    setSaving(true)
    const cleanImages = form.images.filter((img) => img.src)
    const payload = {
      ...form,
      images: cleanImages,
      propertySlug: form.type === 'shared' ? null : form.propertySlug,
      phone: form.phone || null,
      link: form.link || null,
      sharedWith: form.type === 'shared' ? form.sharedWith : null,
    }
    if (isNew) {
      contentStore.addBlock(payload)
    } else {
      contentStore.updateBlock(block.id, payload)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-xl w-full max-w-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <h3 className="text-headline-md font-bold text-primary">
            {isNew ? 'New Content Block' : 'Edit Block'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors">
            <Icon name="close" size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1.5">Section</label>
              <select
                value={form.sectionKey}
                onChange={(e) => update('sectionKey', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all"
              >
                {SECTIONS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1.5">Type</label>
              <div className="flex gap-2">
                {['shared', 'property'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update('type', t)}
                    className={`flex-1 py-2.5 rounded-xl text-label-md font-semibold border transition-all ${
                      form.type === t
                        ? 'bg-primary text-white border-primary'
                        : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {t === 'shared' ? '🌐 Shared' : '🏠 Property'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* sharedWith selector */}
          {form.type === 'shared' && (
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-2">Visible to</label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => update('sharedWith', 'all')}
                  className={`px-3 py-2 rounded-xl text-label-sm font-semibold border transition-all ${
                    form.sharedWith === 'all'
                      ? 'bg-secondary-container text-primary border-secondary/30'
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  All Properties
                </button>
                <button
                  type="button"
                  onClick={() => update('sharedWith', [])}
                  className={`px-3 py-2 rounded-xl text-label-sm font-semibold border transition-all ${
                    Array.isArray(form.sharedWith)
                      ? 'bg-secondary-container text-primary border-secondary/30'
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  Select Properties
                </button>
              </div>
              {Array.isArray(form.sharedWith) && (
                <div className="flex flex-wrap gap-2">
                  {properties.map((p) => {
                    const checked = form.sharedWith.includes(p.slug)
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => {
                          const current = Array.isArray(form.sharedWith) ? form.sharedWith : []
                          update('sharedWith', checked ? current.filter((s) => s !== p.slug) : [...current, p.slug])
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-semibold border transition-all ${
                          checked
                            ? 'bg-primary text-white border-primary'
                            : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${checked ? 'bg-white' : 'bg-outline-variant'}`} />
                        {p.name}
                      </button>
                    )
                  })}
                </div>
              )}
              {Array.isArray(form.sharedWith) && form.sharedWith.length === 0 && (
                <p className="text-label-sm text-amber-600 mt-1">Select at least one property.</p>
              )}
            </div>
          )}

          {/* Property selector */}
          {form.type === 'property' && (
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1.5">Property</label>
              <select
                value={form.propertySlug}
                onChange={(e) => update('propertySlug', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all"
              >
                <option value="">Select a property…</option>
                {properties.map((p) => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-label-md font-semibold text-on-surface mb-1.5">Block Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. No Smoking Policy"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Body — rich text */}
          <div>
            <label className="block text-label-md font-semibold text-on-surface mb-1.5">Content</label>
            <RichTextEditor
              value={form.body}
              onChange={(val) => update('body', val)}
              placeholder="Write the block content here…"
            />
          </div>

          {/* Phone & link — shown for Local Guide and Things to Do sections */}
          {(form.sectionKey === 'local_guide' || form.sectionKey === 'things_to_do') && (
            <div className="bg-secondary-container/15 rounded-xl p-4 space-y-3">
              <p className="text-label-sm font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                <Icon name="place" size={14} className="text-primary" /> Place Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+1 (619) 555-0100"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1.5">Website / Link</label>
                  <input
                    type="url"
                    value={form.link}
                    onChange={(e) => update('link', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-label-md font-semibold text-on-surface">Photos (optional)</label>
              <button
                type="button"
                onClick={addImageSlot}
                className="flex items-center gap-1 text-label-sm text-primary hover:underline"
              >
                <Icon name="add" size={14} className="text-primary" /> Add photo
              </button>
            </div>
            {form.images.length > 0 && (
              <div className={`grid gap-3 ${form.images.length === 1 ? 'grid-cols-1 max-w-xs' : 'grid-cols-2 md:grid-cols-3'}`}>
                {form.images.map((img, i) => (
                  <ImageSlot
                    key={i}
                    image={img}
                    onUpdate={(updated) => updateImage(i, updated)}
                    onRemove={() => removeImage(i)}
                  />
                ))}
              </div>
            )}
            {form.images.length === 0 && (
              <p className="text-label-sm text-on-surface-variant">No photos added. Click "Add photo" above.</p>
            )}
          </div>

          {/* Order */}
          <div className="flex items-center gap-3">
            <label className="text-label-md font-semibold text-on-surface">Display order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => update('order', parseInt(e.target.value) || 1)}
              min={1}
              className="w-20 px-3 py-1.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all text-center"
            />
            <span className="text-label-sm text-on-surface-variant">(lower = earlier within type group)</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/10 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-label-md font-semibold hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={
              !form.title ||
              (form.sectionKey !== 'local_guide' && !form.body) ||
              (form.type === 'property' && !form.propertySlug) ||
              (form.type === 'shared' && Array.isArray(form.sharedWith) && form.sharedWith.length === 0)
            }
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-label-md font-semibold hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Icon name="save" size={16} className="text-white" />
            {saving ? 'Saving…' : isNew ? 'Create Block' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Block card ─────────────────────────────────────────────────────────────

function BlockCard({ block, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  return (
    <div className={`bg-surface-container-lowest rounded-xl border p-4 flex gap-3 items-start group transition-all hover:shadow-sm ${
      block.type === 'shared'
        ? 'border-secondary/20 bg-secondary-container/5'
        : 'border-outline-variant/20'
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
            block.type === 'shared'
              ? 'bg-secondary-container text-secondary'
              : 'bg-primary/10 text-primary'
          }`}>
            {block.type === 'shared'
              ? (Array.isArray(block.sharedWith) && block.sharedWith.length > 0
                  ? `${block.sharedWith.length} prop${block.sharedWith.length > 1 ? 's' : ''}`
                  : 'Shared')
              : block.propertySlug}
          </span>
          <h4 className="text-label-md font-semibold text-on-surface">{block.title}</h4>
        </div>
        <div
          className="text-label-sm text-on-surface-variant line-clamp-2
            [&_*]:inline [&_ul]:hidden [&_ol]:hidden [&_p]:inline [&_br]:hidden"
          dangerouslySetInnerHTML={{ __html: block.body }}
        />
        {(block.phone || block.link) && (
          <div className="flex gap-2 mt-1.5 flex-wrap">
            {block.phone && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
                <Icon name="phone" size={10} /> {block.phone}
              </span>
            )}
            {block.link && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded font-semibold">
                <Icon name="link" size={10} /> Website
              </span>
            )}
          </div>
        )}
        {block.images?.length > 0 && (
          <p className="text-label-sm text-on-surface-variant mt-1 flex items-center gap-1">
            <Icon name="photo_library" size={12} /> {block.images.length} photo{block.images.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(block)}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-secondary-container/40 transition-colors"
          title="Edit"
        >
          <Icon name="edit" size={16} />
        </button>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Icon name="delete" size={16} />
          </button>
        ) : (
          <div className="flex gap-1">
            <button onClick={() => onDelete(block.id)} className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">Del</button>
            <button onClick={() => setConfirmDelete(false)} className="px-2 py-1 rounded-lg border border-outline-variant text-xs">No</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Content Page ──────────────────────────────────────────────────────

export default function ContentPage() {
  const navigate = useNavigate()
  const [allBlocks, setAllBlocks] = useState(contentStore.getAllBlocks())
  const [activeSection, setActiveSection] = useState(SECTIONS[0].key)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)
  const properties = adminStore.getProperties()

  useEffect(() => {
    return contentStore.subscribe(() => setAllBlocks(contentStore.getAllBlocks()))
  }, [])

  const sectionBlocks = allBlocks.filter((b) => b.sectionKey === activeSection)
  const shared = sectionBlocks.filter((b) => b.type === 'shared').sort((a, b) => a.order - b.order)
  const byProperty = {}
  sectionBlocks.filter((b) => b.type === 'property').forEach((b) => {
    if (!byProperty[b.propertySlug]) byProperty[b.propertySlug] = []
    byProperty[b.propertySlug].push(b)
  })

  const openNew = () => { setEditingBlock(null); setModalOpen(true) }
  const openEdit = (block) => { setEditingBlock(block); setModalOpen(true) }
  const closeModal = () => { setEditingBlock(null); setModalOpen(false) }

  const handleDelete = (id) => contentStore.deleteBlock(id)

  const goToGuidebook = (propertySlug) => {
    window.open(`/${propertySlug}#${activeSection}`, '_blank')
  }

  const activeSectionMeta = SECTIONS.find((s) => s.key === activeSection)

  return (
    <div className="flex gap-0 h-full min-h-0">
      {/* Section list */}
      <aside className="w-56 flex-shrink-0 border-r border-outline-variant/20 pr-0 -ml-5 md:-ml-8 pl-5 md:pl-8 pt-2 pb-6">
        <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">
          Guidebook Sections
        </p>
        <nav className="space-y-0.5">
          {SECTIONS.map((s) => {
            const count = allBlocks.filter((b) => b.sectionKey === s.key).length
            return (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                  activeSection === s.key
                    ? 'bg-secondary-container/60 text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <Icon name={s.icon} size={16} />
                <span className="text-label-md truncate flex-1">{s.label}</span>
                {count > 0 && (
                  <span className="text-[10px] font-bold bg-outline-variant/30 text-on-surface-variant px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Section detail */}
      <div className="flex-1 min-w-0 pl-6 md:pl-8 pt-2 overflow-y-auto">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Icon name={activeSectionMeta?.icon} size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-headline-md font-bold text-primary">{activeSectionMeta?.label}</h2>
              <p className="text-label-sm text-on-surface-variant">
                {sectionBlocks.length} block{sectionBlocks.length !== 1 ? 's' : ''} · {shared.length} shared · {sectionBlocks.length - shared.length} property-specific
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {properties.map((p) => (
              <button
                key={p.slug}
                onClick={() => goToGuidebook(p.slug)}
                className="flex items-center gap-1.5 text-label-sm text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors"
                title={`Preview ${p.name} guidebook`}
              >
                <Icon name="open_in_new" size={13} /> {p.name}
              </button>
            ))}
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-label-md font-semibold hover:bg-primary-container transition-colors"
            >
              <Icon name="add" size={16} className="text-white" />
              Add Block
            </button>
          </div>
        </div>

        {/* Ordering note */}
        <div className="flex items-center gap-2 bg-surface-container rounded-xl px-4 py-2.5 mb-5 text-label-sm text-on-surface-variant">
          <Icon name="info" size={15} className="text-secondary flex-shrink-0" />
          Shared blocks render first in the guidebook, followed by property-specific blocks.
        </div>

        {/* Shared blocks */}
        {shared.length > 0 && (
          <div className="mb-6">
            <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
              Shared — all properties ({shared.length})
            </p>
            <div className="space-y-2">
              {shared.map((b) => (
                <BlockCard key={b.id} block={b} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}

        {/* Per-property blocks */}
        {Object.entries(byProperty).map(([propSlug, propBlocks]) => {
          const prop = properties.find((p) => p.slug === propSlug)
          const sorted = propBlocks.sort((a, b) => a.order - b.order)
          return (
            <div key={propSlug} className="mb-6">
              <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                {prop?.name || propSlug} ({sorted.length})
              </p>
              <div className="space-y-2">
                {sorted.map((b) => (
                  <BlockCard key={b.id} block={b} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )
        })}

        {sectionBlocks.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            <Icon name="inbox" size={40} className="text-outline-variant mx-auto mb-3" />
            <p className="text-body-md font-semibold">No content blocks yet</p>
            <p className="text-label-md mt-1 mb-5">Add the first block for this section.</p>
            <button onClick={openNew} className="bg-primary text-white px-5 py-2.5 rounded-xl text-label-md font-semibold hover:bg-primary-container transition-colors">
              Add Block
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <BlockModal
          block={editingBlock}
          sectionKey={activeSection}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
