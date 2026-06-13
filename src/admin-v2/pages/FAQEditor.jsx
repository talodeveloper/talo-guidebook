import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminV2Store } from '../../data/adminV2Store'
import Icon from '../../components/Icon'

function FAQItem({ item, index, onChange, onDelete }) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [local, setLocal] = useState(item)
  const [dirty, setDirty] = useState(false)

  useEffect(() => { setLocal(item); setDirty(false) }, [item])

  const update = (field, val) => {
    setLocal(prev => ({ ...prev, [field]: val }))
    setDirty(true)
  }

  const handleSave = () => {
    onChange(index, local)
    setDirty(false)
  }

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    onDelete(index)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
          {index + 1}
        </span>
        <p className="text-sm font-semibold text-slate-800 flex-1 truncate">
          {item.q || <span className="italic text-slate-400">No question yet</span>}
        </p>
        {dirty && <span className="text-[10px] text-amber-600 font-semibold flex-shrink-0">• unsaved</span>}
        <Icon name={open ? 'expand_less' : 'expand_more'} size={18} className="text-slate-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
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
              placeholder="Check-in is at 4:00 PM…"
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300 resize-y"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600">Delete this question?</span>
                  <button onClick={handleDelete} className="text-xs font-semibold text-red-600 hover:text-red-800">Yes</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-500">Cancel</button>
                </div>
              ) : (
                <button onClick={handleDelete} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                  <Icon name="delete" size={13} /> Delete
                </button>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={!dirty}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FAQEditor() {
  const { slug } = useParams()
  const [faqs, setFaqs] = useState(adminV2Store.getFaq(slug))

  useEffect(() => {
    return adminV2Store.subscribe(() => setFaqs(adminV2Store.getFaq(slug)))
  }, [slug])

  const handleChange = (index, updated) => {
    const next = faqs.map((f, i) => i === index ? updated : f)
    adminV2Store.setFaq(slug, next)
  }

  const handleDelete = (index) => {
    const next = faqs.filter((_, i) => i !== index)
    adminV2Store.setFaq(slug, next)
  }

  const handleAdd = () => {
    adminV2Store.setFaq(slug, [...faqs, { q: '', a: '' }])
  }

  const propertyName = adminV2Store.getPropertyInfo(slug)?.name || slug

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link to="/admin-v2/dashboard" className="hover:text-slate-600">Dashboard</Link>
        <Icon name="chevron_right" size={12} />
        <Link to={`/admin-v2/property/${slug}`} className="hover:text-slate-600 capitalize">{slug.replace(/-/g, ' ')}</Link>
        <Icon name="chevron_right" size={12} />
        <span className="text-slate-700 font-medium">FAQ</span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">FAQ</h1>
          <p className="text-xs text-slate-500 mt-1">{propertyName} · {faqs.length} question{faqs.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}
        >
          <Icon name="add" size={15} /> Add Question
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
          <Icon name="help" size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-4">No FAQ questions yet</p>
          <button onClick={handleAdd}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            Add first question
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              index={i}
              onChange={handleChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center mt-6">
        Save each item individually, then <strong className="text-slate-600">Publish</strong> from the top bar to make changes live.
      </p>
    </div>
  )
}
