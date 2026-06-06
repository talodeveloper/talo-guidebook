import { useRef, useEffect, useCallback } from 'react'
import Icon from './Icon'

const TOOLBAR = [
  { cmd: 'bold',          icon: 'format_bold',          title: 'Bold' },
  { cmd: 'italic',        icon: 'format_italic',         title: 'Italic' },
  { cmd: 'underline',     icon: 'format_underlined',     title: 'Underline' },
  null,
  { cmd: 'insertUnorderedList', icon: 'format_list_bulleted', title: 'Bullet list' },
  { cmd: 'insertOrderedList',   icon: 'format_list_numbered', title: 'Numbered list' },
  null,
  { cmd: 'removeFormat',  icon: 'format_clear',          title: 'Clear formatting' },
]

export default function RichTextEditor({ value, onChange, placeholder = 'Write content here…' }) {
  const editorRef = useRef(null)
  const isInternalChange = useRef(false)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    // Only set innerHTML when value changes externally (not while typing)
    if (!isInternalChange.current && el.innerHTML !== value) {
      el.innerHTML = value || ''
    }
    isInternalChange.current = false
  }, [value])

  const handleInput = useCallback(() => {
    isInternalChange.current = true
    onChange(editorRef.current?.innerHTML || '')
  }, [onChange])

  const exec = (cmd) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, null)
    handleInput()
  }

  const isActive = (cmd) => {
    try { return document.queryCommandState(cmd) } catch { return false }
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-outline-variant/40 bg-surface-container/50 flex-wrap">
        {TOOLBAR.map((item, i) =>
          item === null ? (
            <div key={i} className="w-px h-5 bg-outline-variant/40 mx-1" />
          ) : (
            <button
              key={item.cmd}
              type="button"
              title={item.title}
              onMouseDown={(e) => { e.preventDefault(); exec(item.cmd) }}
              className={`p-1.5 rounded-lg transition-colors ${
                isActive(item.cmd)
                  ? 'bg-secondary-container text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <Icon name={item.icon} size={18} />
            </button>
          )
        )}
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[160px] px-4 py-3 text-on-surface text-body-md leading-relaxed outline-none
          [&_strong]:font-bold [&_em]:italic [&_u]:underline
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
          [&_p]:mb-2 [&_br]:block
          empty:before:content-[attr(data-placeholder)] empty:before:text-on-surface-variant/50 empty:before:pointer-events-none"
      />
    </div>
  )
}
