import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'
import { getTenantId } from './tenant'

// Validation profiles — each upload picks one matching its render context.
// `default` is for property/activity grid images. `hero` is for wide banner
// images (much wider aspect, lower min height).
const PROFILES = {
  default: {
    minWidth: 1000, minHeight: 700,
    warnWidth: 1600, warnHeight: 1200,
    maxDimension: 1600,
    aspectMin: 1 / 3, aspectMax: 3,
    aspectHelp: 'Use a normal photo shape (not panoramic or tall-strip).',
  },
  hero: {
    minWidth: 1600, minHeight: 300,
    warnWidth: 2000, warnHeight: 360,
    maxDimension: 2400,
    aspectMin: 3.5, aspectMax: 8,
    aspectHelp: 'Hero banner must be wide — width should be 3.5× to 8× the height (e.g. 2000×400).',
  },
  // Logo: small, can be square or wide. A transparent PNG under ~600KB keeps
  // its transparency (compressImage passes small files through untouched);
  // larger logos are re-encoded to JPEG and lose transparency.
  logo: {
    minWidth: 80, minHeight: 40,
    warnWidth: 240, warnHeight: 80,
    maxDimension: 1000,
    aspectMin: 0.4, aspectMax: 12,
    aspectHelp: 'A logo can be square or wide. A transparent PNG works best.',
  },
}

const JPEG_QUALITY = 0.85
const MAX_RAW_BYTES = 20 * 1024 * 1024

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Could not read image — file may be corrupt'))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

// Inspect dimensions + aspect ratio. Returns { warning } or throws on hard reject.
function validateImage(img, profile) {
  if (img.width < profile.minWidth || img.height < profile.minHeight) {
    throw new Error(
      `Image too small (${img.width}×${img.height}). Minimum is ${profile.minWidth}×${profile.minHeight} pixels.`
    )
  }
  const aspect = img.width / img.height
  if (aspect < profile.aspectMin || aspect > profile.aspectMax) {
    throw new Error(
      `Image shape doesn't fit here (${img.width}×${img.height}, ratio ${aspect.toFixed(1)}:1). ${profile.aspectHelp}`
    )
  }
  const warning = (img.width < profile.warnWidth || img.height < profile.warnHeight)
    ? `This image is ${img.width}×${img.height} — it will work but may look soft. ${profile.warnWidth}×${profile.warnHeight} or larger is ideal.`
    : null
  return { warning }
}

async function compressImage(img, sourceFile, profile) {
  const scale = Math.min(1, profile.maxDimension / Math.max(img.width, img.height))
  // No shrink needed AND already reasonably small — keep original bytes
  if (scale === 1 && sourceFile.size < 600 * 1024) return sourceFile

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Preserve PNG format so transparent logos don't get a black background.
  // JPEG doesn't support alpha — canvas fills transparent pixels with black.
  const isPng = sourceFile.type === 'image/png'
  const mimeType = isPng ? 'image/png' : 'image/jpeg'
  const quality = isPng ? undefined : JPEG_QUALITY

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob || sourceFile),
      mimeType,
      quality
    )
  })
}

export async function uploadPropertyImage({ slug, blockId, file, onProgress, profile = 'default' }) {
  if (!file) throw new Error('No file selected')
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Only JPEG, PNG, or WebP images are allowed. GIFs and SVGs are not supported.')
  }
  if (file.size > MAX_RAW_BYTES) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 20 MB.`)
  }

  const prof = PROFILES[profile] || PROFILES.default

  onProgress?.(5)
  const img = await loadImage(file)
  const { warning } = validateImage(img, prof)
  onProgress?.(20)

  const compressed = await compressImage(img, file, prof)
  onProgress?.(50)

  const safeName = (file.name || 'upload.jpg').replace(/[^a-zA-Z0-9._-]/g, '_')
  // P1.8: new uploads live under the tenant-scoped path. Existing images keep
  // their old `properties/...` paths and absolute URLs, so they're unaffected.
  const tid = getTenantId()
  const path = `tenants/${tid}/properties/${slug}/${blockId || 'misc'}/${Date.now()}_${safeName}`
  const storageRef = ref(storage, path)

  await uploadBytes(storageRef, compressed, {
    contentType: compressed.type || 'image/jpeg',
  })
  onProgress?.(85)

  const url = await getDownloadURL(storageRef)
  onProgress?.(100)
  return { url, path, warning }
}

export async function deletePropertyImage(path) {
  if (!path || !path.startsWith('properties/')) return
  try {
    await deleteObject(ref(storage, path))
  } catch (err) {
    console.warn('[imageUpload] delete failed:', err)
  }
}
