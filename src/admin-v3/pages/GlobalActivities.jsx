import { useState, useEffect } from 'react'
import { adminV3Store } from '../../data/adminV3Store'
import Icon from '../../components/Icon'
import ImagePicker from '../components/ImagePicker'

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '')
const CAT_ALL = 'all'
const resolveImg = (url) => {
  if (!url) return null
  if (url.startsWith('/')) return `${BASE_URL}${url}`
  return url
}

// ── Activity Form Modal ────────────────────────────────────────────────────────
function ActivityModal({ initial, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', category: categories[0]?.key || 'rbc', description: '', address: '', phone: '', website: '', imageUrl: '',
    ...initial,
  })
  const [error, setError] = useState('')

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSave = () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (!form.category) { setError('Category is required.'); return }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">{initial ? 'Edit Activity' : 'Add Activity'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Filippi's Pizza Grotto"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300 bg-white"
              >
                {categories.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="A brief description guests will see on the flip side of the card…"
              rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder="123 Main St, San Diego, CA 92103"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="(619) 555-0100"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website</label>
              <input
                type="text"
                value={form.website}
                onChange={e => set('website', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Photo</label>
            <ImagePicker
              value={form.imageUrl ? [{ src: form.imageUrl, path: form.imagePath }] : []}
              slug="activities"
              blockId={initial?.id || 'new-activity'}
              maxImages={1}
              onChange={imgs => {
                const img = imgs[0]
                setForm(f => ({ ...f, imageUrl: img?.src || '', imagePath: img?.path || undefined }))
              }}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className="px-5 py-2 text-sm font-bold text-white rounded-xl transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            {initial ? 'Save Changes' : 'Add Activity'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Activity Tile ──────────────────────────────────────────────────────────────
function ActivityTile({ activity, categories, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cat = categories.find(c => c.key === activity.category)

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="h-36 bg-slate-100 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
        {resolveImg(activity.imageUrl) ? (
          <img src={resolveImg(activity.imageUrl)} alt={activity.name}
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <Icon name="image" size={32} className="text-slate-300" />
        )}
        {/* Category badge */}
        <span className="absolute top-2 left-2 text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
          style={{ background: cat?.accent || '#6B7280' }}>
          {cat?.label?.split(' ')[0] || activity.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col min-w-0">
        <p className="text-sm font-bold text-slate-900 leading-tight truncate">{activity.name}</p>
        {activity.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex-1">{activity.description}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-1">
          {activity.address && (
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <Icon name="location_on" size={10} /> {activity.address.split(',')[0]}
            </span>
          )}
          {activity.phone && (
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <Icon name="phone" size={10} /> {activity.phone}
            </span>
          )}
          {activity.website && (
            <a href={activity.website} target="_blank" rel="noopener noreferrer"
              className="text-[10px] text-orange-500 flex items-center gap-0.5 hover:underline">
              <Icon name="link" size={10} /> Website
            </a>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 flex gap-2">
        <button onClick={() => onEdit(activity)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
          <Icon name="edit" size={13} /> Edit
        </button>
        {confirmDelete ? (
          <div className="flex gap-1">
            <button onClick={() => setConfirmDelete(false)}
              className="px-2 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={() => onDelete(activity.id)}
              className="px-2 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
              Delete
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)}
            className="flex items-center justify-center px-2 py-1.5 text-xs text-red-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
            <Icon name="delete" size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Category manager ───────────────────────────────────────────────────────────
function CategoryManager({ categories, activities }) {
  const [open, setOpen] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [editing, setEditing] = useState(null) // key being renamed
  const [editLabel, setEditLabel] = useState('')
  const [error, setError] = useState('')

  const countFor = (key) => activities.filter(a => a.category === key).length
  const isSeedCategory = (key) => ['rbc', 'parks-beaches', 'shopping-attractions', 'others'].includes(key)

  const handleAdd = () => {
    const res = adminV3Store.addActivityCategory(newLabel)
    if (res.error) { setError(res.error); return }
    setNewLabel('')
    setError('')
  }

  const handleDelete = (key) => {
    const res = adminV3Store.deleteActivityCategory(key)
    if (res.error) setError(res.error)
    else setError('')
  }

  const handleRename = (key) => {
    if (editLabel.trim()) adminV3Store.renameActivityCategory(key, editLabel.trim())
    setEditing(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 mb-6 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left">
        <Icon name="category" size={16} className="text-orange-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Manage Categories</p>
          <p className="text-xs text-slate-400">{categories.length} categories — add as many as you need</p>
        </div>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={18} className="text-slate-400" />
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-3 space-y-2">
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {categories.map(cat => (
            <div key={cat.key} className="flex items-center gap-2.5 py-1.5">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.accent }} />
              {editing === cat.key ? (
                <>
                  <input type="text" value={editLabel} autoFocus
                    onChange={e => setEditLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRename(cat.key)}
                    className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-orange-200 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                  <button onClick={() => handleRename(cat.key)}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700">Save</button>
                  <button onClick={() => setEditing(null)} className="text-xs text-slate-400">Cancel</button>
                </>
              ) : (
                <>
                  <p className="flex-1 text-sm text-slate-700">{cat.label}
                    <span className="text-xs text-slate-400 ml-2">{countFor(cat.key)} activities</span>
                  </p>
                  <button onClick={() => { setEditing(cat.key); setEditLabel(cat.label) }}
                    className="p-1 text-slate-300 hover:text-slate-600 rounded" title="Rename">
                    <Icon name="edit" size={13} />
                  </button>
                  {!isSeedCategory(cat.key) && (
                    <button onClick={() => handleDelete(cat.key)}
                      className="p-1 text-slate-300 hover:text-red-500 rounded"
                      title={countFor(cat.key) > 0 ? 'Move or delete its activities first' : 'Delete category'}>
                      <Icon name="delete" size={13} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <input type="text" value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="New category name…"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-300" />
            <button onClick={handleAdd} disabled={!newLabel.trim()}
              className="px-4 py-2 text-xs font-bold text-white rounded-lg disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              Add Category
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function GlobalActivities() {
  const [activities, setActivities] = useState(adminV3Store.getActivities())
  const [categories, setCategories] = useState(adminV3Store.getActivityCategories())
  const [filter, setFilter] = useState(CAT_ALL)
  const [modal, setModal] = useState(null) // null | 'add' | activity object (edit)
  const [search, setSearch] = useState('')

  useEffect(() => {
    return adminV3Store.subscribe(() => {
      setActivities(adminV3Store.getActivities())
      setCategories(adminV3Store.getActivityCategories())
    })
  }, [])

  const filtered = activities.filter(a => {
    const matchCat = filter === CAT_ALL || a.category === filter
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleSave = (form) => {
    if (modal === 'add') {
      adminV3Store.addActivity(form)
    } else {
      adminV3Store.updateActivity(modal.id, form)
    }
    setModal(null)
  }

  const handleDelete = (id) => {
    adminV3Store.deleteActivity(id)
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Global Activity Repository</h1>
          <p className="text-sm text-slate-500 mt-1">
            Master library of all activities. Add, edit, or remove entries here. Per-property curation is done inside each property.
          </p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-xl transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}
        >
          <Icon name="add" size={16} /> Add Activity
        </button>
      </div>

      {/* Category management */}
      <CategoryManager categories={categories} activities={activities} />

      {/* Filter tabs + search */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setFilter(CAT_ALL)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === CAT_ALL ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All ({activities.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === cat.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {cat.label.split(' ')[0]} ({activities.filter(a => a.category === cat.key).length})
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search activities…"
          className="ml-auto px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-300 w-48"
        />
      </div>

      {/* Category label */}
      {filter !== CAT_ALL && (
        <div className="flex items-center gap-2 mb-4">
          {(() => {
            const cat = categories.find(c => c.key === filter)
            return (
              <>
                <span className="w-3 h-3 rounded-full" style={{ background: cat?.accent }} />
                <p className="text-sm font-bold text-slate-700">{cat?.label}</p>
                <span className="text-xs text-slate-400">{filtered.length} activities</span>
              </>
            )
          })()}
        </div>
      )}

      {/* Activity grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Icon name="explore_off" size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold">No activities found</p>
          <p className="text-xs mt-1">Try a different filter or add a new activity.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(activity => (
            <ActivityTile
              key={activity.id}
              activity={activity}
              categories={categories}
              onEdit={a => setModal(a)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ActivityModal
          initial={modal === 'add' ? null : modal}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
