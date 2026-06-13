import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminV2Store } from '../../data/adminV2Store'
import Icon from '../../components/Icon'
import { RichTextEditor } from '../components/BodyEditor'

function BlockCard({ block, onSaved, onDeleted }) {
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState(block)
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  // Global shared rules: core ones (non blk-) cannot be deleted
  const canDelete = block.id.startsWith('blk-')

  useEffect(() => { setLocal(block); setDirty(false) }, [block])

  const update = (field, val) => {
    setLocal(prev => ({ ...prev, [field]: val }))
    setDirty(true)
  }

  const handleSave = () => {
    adminV2Store.updateBlock(local.id, local)
    setDirty(false)
    onSaved?.()
  }

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    adminV2Store.deleteBlock(block.id)
    onDeleted?.()
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon name="public" size={14} className="text-slate-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-slate-800 truncate">
            {block.title || <span className="italic text-slate-400">Untitled rule</span>}
          </p>
          {dirty && <span className="text-[10px] text-amber-600 font-semibold flex-shrink-0">• unsaved</span>}
        </div>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={18} className="text-slate-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          <div>
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
            <RichTextEditor
              key={`${block.id}-body`}
              value={local.body}
              onChange={v => update('body', v)}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              {canDelete ? (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600">Delete for ALL properties?</span>
                    <button onClick={handleDelete} className="text-xs font-semibold text-red-600 hover:text-red-800">Yes</button>
                    <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-500">Cancel</button>
                  </div>
                ) : (
                  <button onClick={handleDelete} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                    <Icon name="delete" size={13} /> Delete (all properties)
                  </button>
                )
              ) : (
                <span className="text-[10px] text-slate-300 flex items-center gap-1">
                  <Icon name="lock" size={11} /> Core rule
                </span>
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

function AddBlockForm({ onAdded }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  const handleAdd = () => {
    if (!title.trim()) return
    const existing = adminV2Store.getSharedBlocks('house_rules')
    const maxOrder = existing.reduce((m, b) => Math.max(m, b.order || 0), 0)
    adminV2Store.addBlock({
      sectionKey: 'house_rules',
      type: 'shared',
      propertySlug: null,
      title: title.trim(),
      body: '',
      images: [],
      order: maxOrder + 1,
    })
    setTitle('')
    setOpen(false)
    onAdded?.()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-orange-300 hover:text-orange-600 transition-colors"
      >
        <Icon name="add" size={16} /> Add global rule
      </button>
    )
  }

  return (
    <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4 space-y-3">
      <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">New Global Rule</p>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        placeholder="Rule title…"
        autoFocus
        className="w-full px-3 py-2 text-sm rounded-lg border border-orange-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-400"
      />
      <p className="text-[10px] text-orange-600">This rule will appear in House Rules for all 4 properties.</p>
      <div className="flex gap-2">
        <button onClick={handleAdd}
          className="px-4 py-1.5 rounded-lg text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>Add</button>
        <button onClick={() => { setOpen(false); setTitle('') }}
          className="px-4 py-1.5 rounded-lg text-xs text-slate-500 bg-white border border-slate-200">Cancel</button>
      </div>
    </div>
  )
}

export default function GlobalContent() {
  const [blocks, setBlocks] = useState([])

  const load = useCallback(() => {
    setBlocks(adminV2Store.getSharedBlocks('house_rules'))
  }, [])

  useEffect(() => {
    load()
    return adminV2Store.subscribe(load)
  }, [load])

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link to="/admin-v2/dashboard" className="hover:text-slate-600">Dashboard</Link>
        <Icon name="chevron_right" size={12} />
        <span className="text-slate-700 font-medium">Global Content</span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
          <Icon name="public" size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Global Content</h1>
          <p className="text-xs text-slate-500">Shared house rules — appear on all 4 properties</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2 mb-6 mt-4">
        <Icon name="info" size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          These rules appear in the <strong>House Rules</strong> section of every guidebook. Changes here affect all 4 properties at once.
        </p>
      </div>

      <div className="space-y-2 mb-4">
        {blocks.map(block => (
          <BlockCard key={block.id} block={block} onSaved={load} onDeleted={load} />
        ))}
        {blocks.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">No global rules yet.</p>
        )}
      </div>

      <AddBlockForm onAdded={load} />

      <p className="text-xs text-slate-400 text-center mt-6">
        Save each rule individually, then <strong className="text-slate-600">Publish</strong> from the top bar.
      </p>
    </div>
  )
}
