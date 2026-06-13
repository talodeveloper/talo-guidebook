import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminV3Store } from '../../data/adminV3Store'
import Icon from '../../components/Icon'

// One row in the mixed FAQ list. Global questions are locked (edited in
// Global Content) but can be toggled on/off and reordered per property.
function FAQRow({ display, index, total, slug, onReload }) {
  const { entry, item } = display
  const isGlobal = entry.source === 'global'
  const enabled = entry.enabled !== false
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [local, setLocal] = useState(item)
  const [dirty, setDirty] = useState(false)

  useEffect(() => { setLocal(item); setDirty(false) }, [item])

  const update = (field, val) => { setLocal(prev => ({ ...prev, [field]: val })); setDirty(true) }
  const handleSave = () => { adminV3Store.updateLocalFaqItem(slug, item.id, local); setDirty(false); onReload?.() }
  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    adminV3Store.deleteLocalFaqItem(slug, item.id)
    onReload?.()
  }

  return (
    <div className={`rounded-xl border bg-white transition-opacity ${enabled ? 'border-slate-200' : 'border-slate-200 opacity-50'}`}>
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Reorder */}
        <div className="flex flex-col flex-shrink-0">
          <button onClick={() => adminV3Store.moveFaqEntry(slug, index, -1)} disabled={index === 0}
            className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed">
            <Icon name="arrow_drop_up" size={18} />
          </button>
          <button onClick={() => adminV3Store.moveFaqEntry(slug, index, 1)} disabled={index === total - 1}
            className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed">
            <Icon name="arrow_drop_down" size={18} />
          </button>
        </div>

        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
          style={{ background: isGlobal ? 'linear-gradient(135deg, #B45309, #D97706)' : 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
          {index + 1}
        </span>

        <button onClick={() => setOpen(o => !o)} className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate flex items-center gap-1.5">
            {isGlobal && <Icon name="public" size={12} className="text-amber-600 flex-shrink-0" />}
            <span className="truncate">{item.q || <span className="italic text-slate-400">No question yet</span>}</span>
          </p>
          {isGlobal && <p className="text-[10px] text-amber-600 font-semibold">Global question</p>}
        </button>

        {dirty && <span className="text-[10px] text-amber-600 font-semibold flex-shrink-0">• unsaved</span>}

        {/* Global on/off toggle (per property) */}
        {isGlobal && (
          <button
            onClick={() => adminV3Store.toggleFaqEntry(slug, entry.id)}
            title={enabled ? 'Hide this global question on this property' : 'Show this global question on this property'}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
              enabled ? 'bg-green-500' : 'bg-slate-300'
            }`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-1'
            }`} />
          </button>
        )}

        <Icon name={open ? 'expand_less' : 'expand_more'} size={18}
          className="text-slate-400 flex-shrink-0 cursor-pointer" onClick={() => setOpen(o => !o)} />
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          {isGlobal ? (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 flex items-start gap-2.5">
              <Icon name="public" size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <p className="font-semibold mb-1">This is a Global FAQ — common to all properties.</p>
                <p>
                  To make any changes to this question or its answer, please use{' '}
                  <Link to="/admin-v3/global" className="font-bold text-amber-700 underline">Global Content</Link>.
                  If you don't want it to appear on this property, use the on/off switch on the right.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Question</label>
                <input
                  type="text"
                  value={local.q || ''}
                  onChange={e => update('q', e.target.value)}
                  placeholder="What time is check-in and check-out?"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Answer</label>
                <textarea
                  value={local.a || ''}
                  onChange={e => update('a', e.target.value)}
                  rows={4}
                  placeholder="Check-in is at 4:00 PM and check-out is at 11:00 AM…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300 resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {dirty && (
                    <button onClick={handleSave}
                      className="px-4 py-1.5 text-xs font-bold text-white rounded-lg hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
                      Save
                    </button>
                  )}
                  {confirmDelete ? (
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-slate-500">Delete this question?</span>
                      <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                      <button onClick={handleDelete} className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg font-semibold">Delete</button>
                    </div>
                  ) : (
                    <button onClick={handleDelete} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600">
                      <Icon name="delete" size={14} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function FAQEditorV3() {
  const { slug } = useParams()
  const [info, setInfo] = useState(adminV3Store.getPropertyInfo(slug))
  const [display, setDisplay] = useState(adminV3Store.getFaqDisplay(slug))

  const reload = () => setDisplay(adminV3Store.getFaqDisplay(slug))

  useEffect(() => {
    reload()
    return adminV3Store.subscribe(() => {
      setInfo(adminV3Store.getPropertyInfo(slug))
      reload()
    })
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = () => { adminV3Store.addLocalFaqItem(slug); reload() }

  const enabledCount = display.filter(d => d.entry.enabled !== false).length
  const globalCount = display.filter(d => d.entry.source === 'global').length

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link to="/admin-v3/dashboard" className="hover:text-slate-600">Dashboard</Link>
        <Icon name="chevron_right" size={12} />
        <Link to={`/admin-v3/property/${slug}`} className="hover:text-slate-600">{info.name || slug}</Link>
        <Icon name="chevron_right" size={12} />
        <span className="text-slate-700 font-medium">FAQ</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">FAQ</h1>
          <p className="text-sm text-slate-500 mt-1">
            {enabledCount} showing · {globalCount} global · {display.length - globalCount} property-specific
          </p>
        </div>
        <button onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
          <Icon name="add" size={16} /> Add Question
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2 mb-6">
        <Icon name="swap_vert" size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <Icon name="public" size={10} className="inline text-amber-600" /> <strong>Global</strong> questions appear on
          every property and are edited in <Link to="/admin-v3/global" className="font-semibold underline">Global Content</Link>.
          Mix the order freely with ↑↓ — the order is saved for this property only.
          Use the toggle to hide a global question on this property.
        </p>
      </div>

      {display.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Icon name="help_outline" size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold">No FAQ questions yet</p>
          <p className="text-xs mt-1">Click "Add Question" to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {display.map((d, i) => (
            <FAQRow
              key={d.entry.id}
              display={d}
              index={i}
              total={display.length}
              slug={slug}
              onReload={reload}
            />
          ))}
        </div>
      )}
    </div>
  )
}
