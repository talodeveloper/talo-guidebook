import { useRef, useState } from 'react'
import Icon from '../../components/Icon'
import { uploadPropertyImage, deletePropertyImage } from '../../data/imageUpload'

// Reusable image manager for a block's images array.
//   value:    [{ src, caption, path? }]
//   onChange: (nextImages) => void
//   slug:     property slug
//   blockId:  unique key (used for storage path)
//   maxImages: cap if provided
export default function ImagePicker({ value = [], onChange, slug, blockId, maxImages = 12 }) {
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')

  const handleFiles = async (files) => {
    setError(''); setWarning('')
    const list = Array.from(files || []).slice(0, maxImages - value.length)
    if (!list.length) return
    setBusy(true)
    const nextItems = [...value]
    const warnings = []
    for (const file of list) {
      try {
        const { url, path, warning: w } = await uploadPropertyImage({
          slug, blockId, file, onProgress: setProgress,
        })
        nextItems.push({ src: url, caption: '', path })
        if (w) warnings.push(`${file.name}: ${w}`)
      } catch (err) {
        setError(err.message || 'Upload failed')
      }
    }
    setBusy(false)
    setProgress(0)
    if (warnings.length) setWarning(warnings.join(' · '))
    onChange?.(nextItems)
  }

  const handleReplace = async (idx, file) => {
    if (!file) return
    setError(''); setWarning('')
    setBusy(true)
    try {
      const { url, path, warning: w } = await uploadPropertyImage({
        slug, blockId, file, onProgress: setProgress,
      })
      const next = [...value]
      const old = next[idx]
      next[idx] = { src: url, caption: old?.caption || '', path }
      onChange?.(next)
      if (old?.path) deletePropertyImage(old.path)
      if (w) setWarning(w)
    } catch (err) {
      setError(err.message || 'Upload failed')
    }
    setBusy(false)
    setProgress(0)
  }

  const handleRemove = (idx) => {
    const next = [...value]
    const removed = next.splice(idx, 1)[0]
    onChange?.(next)
    if (removed?.path) deletePropertyImage(removed.path)
  }

  const handleCaption = (idx, caption) => {
    const next = value.map((img, i) => (i === idx ? { ...img, caption } : img))
    onChange?.(next)
  }

  const move = (idx, dir) => {
    const j = idx + dir
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[idx], next[j]] = [next[j], next[idx]]
    onChange?.(next)
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {value.map((img, idx) => (
            <ImageCard
              key={idx}
              img={img}
              idx={idx}
              total={value.length}
              busy={busy}
              onReplace={(file) => handleReplace(idx, file)}
              onRemove={() => handleRemove(idx)}
              onCaption={(c) => handleCaption(idx, c)}
              onMove={(dir) => move(idx, dir)}
            />
          ))}
        </div>
      )}

      {value.length < maxImages && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary transition disabled:opacity-50"
          >
            <Icon name="add_photo_alternate" size={18} />
            <span className="text-[13px] font-semibold">
              {busy ? `Uploading… ${progress}%` : 'Add image'}
            </span>
          </button>
        </div>
      )}

      {error && (
        <div className="text-[12px] text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {warning && (
        <div className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
          ⚠ {warning}
        </div>
      )}
    </div>
  )
}

function ImageCard({ img, idx, total, busy, onReplace, onRemove, onCaption, onMove }) {
  const replaceRef = useRef(null)
  return (
    <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface">
      <div className="aspect-[4/3] bg-surface-container relative">
        {img.src ? (
          <img src={img.src} alt={img.caption || ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
            <Icon name="image" size={32} />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => replaceRef.current?.click()}
            title="Replace image"
            className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 disabled:opacity-40"
          >
            <Icon name="autorenew" size={14} className="text-white" />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onRemove}
            title="Remove image"
            className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 disabled:opacity-40"
          >
            <Icon name="close" size={14} className="text-white" />
          </button>
        </div>
        <input
          ref={replaceRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onReplace(e.target.files?.[0])}
        />
      </div>
      <div className="p-2 space-y-1.5">
        <input
          type="text"
          value={img.caption || ''}
          onChange={(e) => onCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="w-full px-2 py-1.5 text-[12px] rounded-md border border-outline-variant/30 bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => onMove(-1)}
            className="px-2 py-0.5 text-[11px] rounded border border-outline-variant/30 disabled:opacity-30"
          >↑</button>
          <button
            type="button"
            disabled={idx === total - 1}
            onClick={() => onMove(1)}
            className="px-2 py-0.5 text-[11px] rounded border border-outline-variant/30 disabled:opacity-30"
          >↓</button>
          <span className="text-[11px] text-on-surface-variant ml-auto">{idx + 1} / {total}</span>
        </div>
      </div>
    </div>
  )
}
