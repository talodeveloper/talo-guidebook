import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminV3Store } from '../../data/adminV3Store'

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '')
const resolveImg = (url) => { if (!url) return null; return url.startsWith('/') ? `${BASE_URL}${url}` : url }
import Icon from '../../components/Icon'

// ── Draggable activity row within a category ───────────────────────────────────
function ActivityRow({ entry, activity, onToggle, onMoveUp, onMoveDown, isFirst, isLast }) {
  if (!activity) return null

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
      entry.enabled
        ? 'bg-white border-slate-200'
        : 'bg-slate-50 border-slate-200 opacity-50'
    }`}>
      {/* Reorder */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400"
        >
          <Icon name="arrow_drop_up" size={18} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400"
        >
          <Icon name="arrow_drop_down" size={18} />
        </button>
      </div>

      {/* Image */}
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
        {resolveImg(activity.imageUrl) ? (
          <img src={resolveImg(activity.imageUrl)} alt="" className="w-full h-full object-cover"
            onError={e => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="image" size={18} className="text-slate-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{activity.name}</p>
        {activity.address && (
          <p className="text-xs text-slate-400 truncate">{activity.address.split(',')[0]}</p>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
          entry.enabled ? 'bg-green-500' : 'bg-slate-300'
        }`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          entry.enabled ? 'translate-x-4' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}

// ── Category panel ─────────────────────────────────────────────────────────────
function CategoryPanel({ cat, entries, activities, slug }) {
  const [open, setOpen] = useState(false)
  const actMap = Object.fromEntries(activities.map(a => [a.id, a]))
  const enabledCount = entries.filter(e => e.enabled).length

  const handleToggle = (activityId) => {
    adminV3Store.toggleActivityForProperty(slug, cat.key, activityId)
  }

  const handleMove = (index, direction) => {
    const ids = entries.map(e => e.activityId)
    const newIds = [...ids]
    const target = index + direction
    if (target < 0 || target >= newIds.length) return
    ;[newIds[index], newIds[target]] = [newIds[target], newIds[index]]
    adminV3Store.reorderPropertyCategory(slug, cat.key, newIds)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.accent }} />
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{cat.label}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {enabledCount} of {entries.length} showing
          </p>
        </div>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={20} className="text-slate-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 mt-3 mb-2 px-1">
            Toggle activities on/off for this property. Use arrows to set display order.
          </p>
          {entries.length === 0 ? (
            <p className="text-xs text-center text-slate-400 py-4">
              No activities in this category yet. Add them in{' '}
              <Link to="/admin-v3/activities" className="text-orange-500 hover:underline">Global Activities</Link>.
            </p>
          ) : (
            <div className="space-y-2 mt-3">
              {entries.map((entry, i) => (
                <ActivityRow
                  key={entry.activityId}
                  entry={entry}
                  activity={actMap[entry.activityId]}
                  onToggle={() => handleToggle(entry.activityId)}
                  onMoveUp={() => handleMove(i, -1)}
                  onMoveDown={() => handleMove(i, 1)}
                  isFirst={i === 0}
                  isLast={i === entries.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PropertyActivities() {
  const { slug } = useParams()
  const [info, setInfo] = useState(adminV3Store.getPropertyInfo(slug))
  const [activities, setActivities] = useState(adminV3Store.getActivities())
  const [categories, setCategories] = useState(adminV3Store.getActivityCategories())
  const [curation, setCuration] = useState(adminV3Store.getPropertyCuration(slug))

  useEffect(() => {
    const refresh = () => {
      setInfo(adminV3Store.getPropertyInfo(slug))
      setActivities(adminV3Store.getActivities())
      setCategories(adminV3Store.getActivityCategories())
      setCuration(adminV3Store.getPropertyCuration(slug))
    }
    refresh()
    return adminV3Store.subscribe(refresh)
  }, [slug])

  const totalEnabled = categories.reduce((sum, cat) => {
    return sum + (curation[cat.key] || []).filter(e => e.enabled).length
  }, 0)

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link to="/admin-v3/dashboard" className="hover:text-slate-600">Dashboard</Link>
        <Icon name="chevron_right" size={12} />
        <Link to={`/admin-v3/property/${slug}`} className="hover:text-slate-600">{info.name || slug}</Link>
        <Icon name="chevron_right" size={12} />
        <span className="text-slate-700 font-medium">Activity Center</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Activity Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          Curate which activities show in the V3 guidebook for <strong>{info.name || slug}</strong>.
          {' '}<span className="text-orange-600 font-semibold">{totalEnabled} activities</span> currently showing.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-6">
        <Icon name="info" size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-orange-800">
          <p className="font-semibold mb-0.5">How this works</p>
          <p>Activities toggled OFF are hidden in the guidebook for this property only — they remain in the global library. Reorder activities using the ↑↓ arrows. Changes are saved to draft; Publish to make them live.</p>
        </div>
      </div>

      {/* Category panels */}
      <div className="space-y-3">
        {categories.map(cat => (
          <CategoryPanel
            key={cat.key}
            cat={cat}
            entries={curation[cat.key] || []}
            activities={activities}
            slug={slug}
          />
        ))}
      </div>

      {/* Link to global repo */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400 mb-2">Need to add a new activity to the library?</p>
        <Link to="/admin-v3/activities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700">
          <Icon name="explore" size={13} /> Open Global Activities
        </Link>
      </div>
    </div>
  )
}
