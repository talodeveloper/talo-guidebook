import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'

// Visual quality bar — uploads outside these limits are rejected or warned.
const MIN_WIDTH = 1000
const MIN_HEIGHT = 700
const WARN_WIDTH = 1600
const WARN_HEIGHT = 1200
const MAX_DIMENSION = 1600          // compress wider than this
const JPEG_QUALITY = 0.85
const MAX_RAW_BYTES = 20 * 1024 * 1024
const MAX_ASPECT_RATIO = 3          // reject if W/H or H/W exceeds this

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
function validateImage(img) {
  if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
    throw new Error(
      `Image too small (${img.width}×${img.height}). Minimum is ${MIN_WIDTH}×${MIN_HEIGHT} pixels — please use a higher-resolution photo.`
    )
  }
  const ratio = Math.max(img.width / img.height, img.height / img.width)
  if (ratio > MAX_ASPECT_RATIO) {
    throw new Error(
      `Image is too narrow or too wide (${img.width}×${img.height}). Please crop closer to a normal photo shape before uploading.`
    )
  }
  const warning = (img.width < WARN_WIDTH || img.height < WARN_HEIGHT)
    ? `This image is ${img.width}×${img.height} — it will work but may look soft on the welcome card. ${WARN_WIDTH}×${WARN_HEIGHT} or larger is ideal.`
    : null
  return { warning }
}

async function compressImage(img, sourceFile) {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  // No shrink needed AND already reasonably small — keep original bytes
  if (scale === 1 && sourceFile.size < 600 * 1024) return sourceFile

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob || sourceFile),
      'image/jpeg',
      JPEG_QUALITY
    )
  })
}

export async function uploadPropertyImage({ slug, blockId, file, onProgress }) {
  if (!file) throw new Error('No file selected')
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Only JPEG, PNG, or WebP images are allowed. GIFs and SVGs are not supported.')
  }
  if (file.size > MAX_RAW_BYTES) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 20 MB.`)
  }

  onProgress?.(5)
  const img = await loadImage(file)
  const { warning } = validateImage(img)
  onProgress?.(20)

  const compressed = await compressImage(img, file)
  onProgress?.(50)

  const safeName = (file.name || 'upload.jpg').replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `properties/${slug}/${blockId || 'misc'}/${Date.now()}_${safeName}`
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
