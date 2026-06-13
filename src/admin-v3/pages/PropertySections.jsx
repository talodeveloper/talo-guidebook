import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminV3Store } from '../../data/adminV3Store'
import Icon from '../../components/Icon'

// Groups the flat section config into [top-level, ...its children] clusters so
// reordering a parent moves its children along with it.
function toClusters(sections) {
  const clusters = []
  for (const s of sections) {
    if (!s.parentKey) clusters.push([s])
    else {
      const parent = clusters.find(c => c[0].key === s.parentKey)
      if (parent) parent.push(s)
      else clusters.push([s]) // orphan — treat as top-level
    }
  }
  return clusters
}

function SectionRow({ section, isChild, onToggle, onRename, onMoveUp, onMoveDown, onDelete, canMoveUp, canMoveDown, slug }) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(section.label)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const enabled = section.enabled !== false

  useEffect(() => { setLabel(section.label) }, [section.label])

  const saveRename = () => {
    if (label.trim() && label.trim() !== section.label) onRename(label.trim())
    setEditing(false)
  }

  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl border bg-white transition-opacity ${enabled ? 'border-slate-200' : 'border-slate-200 opacity-50'} ${isChild ? 'ml-8' : ''}`}>
      {/* Reorder */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button onClick={onMoveUp} disabled={!canMoveUp}
          className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400">
          <Icon name="arrow_drop_up" size={18} />
        </button>
        <button onClick={onMoveDown} disabled={!canMoveDown}
          className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400">
          <Icon name="arrow_drop_down" size={18} />
        </button>
      </div>

      {/* Icon */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: section.custom ? 'linear-gradient(135deg, #4338CA, #6D28D9)' : 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
        <Icon name={section.icon} size={15} className="text-white" />
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <input type="text" value={label} autoFocus
              onChange={e => setLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveRename()}
              className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-orange-200 focus:outline-none focus:ring-1 focus:ring-orange-400" />
            <button onClick={saveRename} className="text-xs font-semibold text-orange-600">Save</button>
            <button onClick={() => { setEditing(false); setLabel(section.label) }} className="text-xs text-slate-400">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{section.label}</p>
            {section.custom && (
              <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full uppercase flex-shrink-0">Custom</span>
            )}
            {section.page && (
              <span className="text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full uppercase flex-shrink-0">Own page</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {!editing && (
        <>
          <button onClick={() => setEditing(true)}
            className="p-1.5 text-slate-300 hover:text-slate-600 rounded-lg hover:bg-slate-50 flex-shrink-0" title="Rename section">
            <Icon name="edit" size={14} />
          </button>
          {!section.page && (
            <Link to={`/admin-v3/property/${slug}/section/${section.key}`}
              className="p-1.5 text-slate-300 hover:text-orange-500 rounded-lg hover:bg-orange-50 flex-shrink-0" title="Edit content">
              <Icon name="description" size={14} />
            </Link>
          )}
          {section.custom && (
            confirmDelete ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={onDelete} className="text-[10px] font-bold text-white bg-red-500 px-2 py-1 rounded-md">Delete</button>
                <button onClick={() => setConfirmDelete(false)} className="text-[10px] text-slate-400 px-1">No</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 flex-shrink-0" title="Delete custom section">
                <Icon name="delete" size={14} />
              </button>
            )
          )}
          {/* Enable toggle */}
          <button onClick={onToggle}
            title={enabled ? 'Hide this section from the guidebook' : 'Show this section'}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-green-500' : 'bg-slate-300'}`}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-1'}`} />
          </button>
        </>
      )}
    </div>
  )
}

export default function PropertySections() {
  const { slug } = useParams()
  const [info, setInfo] = useState(adminV3Store.getPropertyInfo(slug))
  const [sections, setSections] = useState(adminV3Store.getSectionConfig(slug))
  const [newLabel, setNewLabel] = useState('')

  useEffect(() => {
    const refresh = () => {
      setInfo(adminV3Store.getPropertyInfo(slug))
      setSections(adminV3Store.getSectionConfig(slug))
    }
    refresh()
    return adminV3Store.subscribe(refresh)
  }, [slug])

  const clusters = toClusters(sections)

  const commit = (newClusters) => {
    adminV3Store.setSectionConfig(slug, newClusters.flat())
  }

  const moveCluster = (index, dir) => {
    const target = index + dir
    if (target < 0 || target >= clusters.length) return
    const next = [...clusters]
    ;[next[index], next[target]] = [next[target], next[index]]
    commit(next)
  }

  const moveChild = (clusterIdx, childIdx, dir) => {
    const cluster = [...clusters[clusterIdx]]
    const target = childIdx + dir
    if (target < 1 || target >= cluster.length) return // index 0 is the parent
    ;[cluster[childIdx], cluster[target]] = [cluster[target], cluster[childIdx]]
    const next = [...clusters]
    next[clusterIdx] = cluster
    commit(next)
  }

  const updateSection = (key, updates) => {
    commit(toClusters(sections.map(s => s.key === key ? { ...s, ...updates } : s)))
  }

  const handleAdd = () => {
    if (!newLabel.trim()) return
    adminV3Store.addCustomSection(slug, newLabel)
    setNewLabel('')
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link to="/admin-v3/dashboard" className="hover:text-slate-600">Dashboard</Link>
        <Icon name="chevron_right" size={12} />
        <Link to={`/admin-v3/property/${slug}`} className="hover:text-slate-600">{info.name || slug}</Link>
        <Icon name="chevron_right" size={12} />
        <span className="text-slate-700 font-medium">Sections</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Guidebook Sections</h1>
      <p className="text-sm text-slate-500 mb-5">
        Control which sections appear in the guidebook for <strong>{info.name || slug}</strong>, in what order, and with what name.
      </p>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2 mb-6">
        <Icon name="info" size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Use the <strong>toggle</strong> to hide a section from guests (its content is kept).
          Use <strong>↑↓</strong> to reorder, the <strong>pencil</strong> to rename, and the <strong>page icon</strong> to edit content.
          Changes apply to this property only and go live when you <strong>Publish</strong>.
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {clusters.map((cluster, ci) => (
          <div key={cluster[0].key} className="space-y-2">
            <SectionRow
              section={cluster[0]}
              isChild={false}
              slug={slug}
              canMoveUp={ci > 0}
              canMoveDown={ci < clusters.length - 1}
              onMoveUp={() => moveCluster(ci, -1)}
              onMoveDown={() => moveCluster(ci, 1)}
              onToggle={() => updateSection(cluster[0].key, { enabled: !(cluster[0].enabled !== false) })}
              onRename={(label) => updateSection(cluster[0].key, { label })}
              onDelete={() => adminV3Store.removeCustomSection(slug, cluster[0].key)}
            />
            {cluster.slice(1).map((child, i) => (
              <SectionRow
                key={child.key}
                section={child}
                isChild
                slug={slug}
                canMoveUp={i > 0}
                canMoveDown={i < cluster.length - 2}
                onMoveUp={() => moveChild(ci, i + 1, -1)}
                onMoveDown={() => moveChild(ci, i + 1, 1)}
                onToggle={() => updateSection(child.key, { enabled: !(child.enabled !== false) })}
                onRename={(label) => updateSection(child.key, { label })}
                onDelete={() => adminV3Store.removeCustomSection(slug, child.key)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Add custom section */}
      <div className="rounded-xl border-2 border-dashed border-slate-200 p-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Add a custom section</p>
        <p className="text-[11px] text-slate-400 mb-3">
          Creates a new section in this property's guidebook — then add content blocks to it like any other section.
        </p>
        <div className="flex gap-2">
          <input type="text" value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Section name, e.g. Pool & Spa Guide…"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-300" />
          <button onClick={handleAdd} disabled={!newLabel.trim()}
            className="px-4 py-2 text-xs font-bold text-white rounded-lg disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            Add Section
          </button>
        </div>
      </div>
    </div>
  )
}
