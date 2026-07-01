import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon'

// ── Toolbar button — onMouseDown + preventDefault keeps editor focused ────
function TB({ onClick, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className="px-1.5 py-1 rounded text-slate-600 hover:bg-white hover:shadow-sm transition-all text-[13px] select-none"
    >
      {children}
    </button>
  )
}

// ── Rich text editor ───────────────────────────────────────────────────────
export function RichTextEditor({ value, onChange }) {
  const divRef = useRef(null)

  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerHTML = value || ''
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const exec = (cmd, arg = null) => {
    divRef.current?.focus()
    document.execCommand(cmd, false, arg)
    if (divRef.current) onChange(divRef.current.innerHTML)
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        <TB onClick={() => exec('bold')} title="Bold"><strong>B</strong></TB>
        <TB onClick={() => exec('italic')} title="Italic"><em>I</em></TB>
        <TB onClick={() => exec('underline')} title="Underline"><span className="underline">U</span></TB>
        <div className="w-px h-3.5 bg-slate-300 mx-1 flex-shrink-0" />
        <TB onClick={() => exec('formatBlock', 'h2')} title="Heading">
          <span className="text-[11px] font-bold text-slate-600">H2</span>
        </TB>
        <TB onClick={() => exec('formatBlock', 'h3')} title="Sub-heading">
          <span className="text-[11px] font-semibold text-slate-500">H3</span>
        </TB>
        <TB onClick={() => exec('formatBlock', 'p')} title="Normal paragraph">
          <span className="text-[10px] text-slate-400 font-medium">¶</span>
        </TB>
        <div className="w-px h-3.5 bg-slate-300 mx-1 flex-shrink-0" />
        <TB onClick={() => exec('fontSize', '2')} title="Small text">
          <span className="text-[10px] font-semibold text-slate-500">A</span>
        </TB>
        <TB onClick={() => exec('fontSize', '4')} title="Large text">
          <span className="text-[16px] font-semibold">A</span>
        </TB>
        <div className="w-px h-3.5 bg-slate-300 mx-1 flex-shrink-0" />
        <TB onClick={() => exec('insertUnorderedList')} title="Bullet list">
          <span className="text-[11px] text-slate-500">• list</span>
        </TB>
        <div className="w-px h-3.5 bg-slate-300 mx-1 flex-shrink-0" />
        <TB onClick={() => exec('removeFormat')} title="Clear formatting">
          <span className="text-[10px] text-slate-400 font-medium">✕</span>
        </TB>
      </div>
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (divRef.current) onChange(divRef.current.innerHTML) }}
        className="min-h-[80px] max-h-52 overflow-y-auto p-3 text-sm text-slate-800 outline-none leading-relaxed
          [&_strong]:font-semibold [&_b]:font-semibold
          [&_em]:italic [&_i]:italic
          [&_u]:underline
          [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-3 [&_h2]:mb-1.5
          [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-slate-700 [&_h3]:mt-2 [&_h3]:mb-1
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:my-1.5
          [&_p]:mb-1.5 [&_p:last-child]:mb-0"
      />
    </div>
  )
}

// ── List editor ────────────────────────────────────────────────────────────
export function ListEditor({ value, onChange }) {
  const listType = /^\s*<ol/i.test(value || '') ? 'ol' : 'ul'

  const parseItems = (html) => {
    if (!html) return ['']
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const lis = Array.from(doc.querySelectorAll('li'))
      return lis.length > 0 ? lis.map(li => li.textContent || '') : ['']
    } catch { return [''] }
  }

  const [items, setItems] = useState(() => parseItems(value))
  const inputRefs = useRef([])

  const sync = (newItems) => {
    const safe = newItems.length > 0 ? newItems : ['']
    setItems(safe)
    onChange(`<${listType}>${safe.map(t => `<li>${t}</li>`).join('')}</${listType}>`)
  }

  const focus = (i) => setTimeout(() => inputRefs.current[i]?.focus(), 30)

  const move = (i, dir) => {
    const target = dir === 'up' ? i - 1 : i + 1
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[i], next[target]] = [next[target], next[i]]
    sync(next)
    focus(target)
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {/* Reorder buttons */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => move(i, 'up')}
              disabled={i === 0}
              className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Move up"
            >
              <Icon name="keyboard_arrow_up" size={14} />
            </button>
            <button
              type="button"
              onClick={() => move(i, 'down')}
              disabled={i === items.length - 1}
              className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Move down"
            >
              <Icon name="keyboard_arrow_down" size={14} />
            </button>
          </div>

          <span className="text-slate-400 text-xs w-5 text-right flex-shrink-0 font-mono">
            {listType === 'ol' ? `${i + 1}.` : '•'}
          </span>

          <input
            ref={el => { inputRefs.current[i] = el }}
            type="text"
            value={item}
            onChange={e => {
              const next = [...items]; next[i] = e.target.value; sync(next)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const next = [...items.slice(0, i + 1), '', ...items.slice(i + 1)]
                sync(next); focus(i + 1)
              }
              if (e.key === 'Backspace' && item === '' && items.length > 1) {
                e.preventDefault()
                sync(items.filter((_, j) => j !== i)); focus(Math.max(0, i - 1))
              }
            }}
            placeholder={`Item ${i + 1}`}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300"
          />

          {items.length > 1 && (
            <button
              type="button"
              onClick={() => sync(items.filter((_, j) => j !== i))}
              className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 text-lg leading-none w-5 text-center"
            >×</button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => { sync([...items, '']); focus(items.length) }}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 transition-colors mt-1 ml-7"
      >
        <span className="text-base leading-none">+</span> Add item
      </button>
    </div>
  )
}

// ── Auto-detect and render the right editor ────────────────────────────────
export default function BodyEditor({ value, onChange }) {
  const isList = /^\s*<[ou]l/i.test(value || '')
  return isList
    ? <ListEditor value={value} onChange={onChange} />
    : <RichTextEditor value={value} onChange={onChange} />
}
