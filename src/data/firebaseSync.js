/**
 * firebaseSync.js
 * Sets up real-time Firestore listeners for V2 content.
 * Import this ONCE at the top of App.jsx — it initialises automatically.
 *
 * Data model in Firestore:
 *   v2_content/blocks      → { data: [...all content blocks] }
 *   v2_content/properties  → { 'reynard-way': {...}, 'hawk-street': {...}, ... }
 *   v2_content/faq         → { 'reynard-way': [...], 'hawk-street': [...], ... }
 *   v2_checkins/{auto-id}  → individual check-in submission documents
 */

import { db } from '../firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { contentStore } from './contentStore'
import { fsPaths } from './tenant'

// ─── In-memory Firestore caches ───────────────────────────────────────────
let _propertyOverrides = {}
let _faqOverrides      = {}

let _propListeners = []
let _faqListeners  = []

function notifyProp() { _propListeners.forEach(fn => fn(_propertyOverrides)) }
function notifyFaq()  { _faqListeners.forEach(fn => fn(_faqOverrides)) }

// ─── Listener: content blocks ─────────────────────────────────────────────
try {
  onSnapshot(
    doc(db, ...fsPaths.contentBlocks()),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data()?.data
        if (Array.isArray(data) && data.length > 0) {
          contentStore.reloadFromLive(data)
        }
      }
    },
    () => {} // silent fail — local data is still used
  )
} catch {}

// ─── Listener: property info ──────────────────────────────────────────────
try {
  onSnapshot(
    doc(db, ...fsPaths.contentProperties()),
    (snap) => {
      if (snap.exists()) {
        _propertyOverrides = snap.data() || {}
        notifyProp()
      }
    },
    () => {}
  )
} catch {}

// ─── Listener: FAQ ────────────────────────────────────────────────────────
try {
  onSnapshot(
    doc(db, ...fsPaths.contentFaq()),
    (snap) => {
      if (snap.exists()) {
        _faqOverrides = snap.data() || {}
        notifyFaq()
      }
    },
    () => {}
  )
} catch {}

// ─── Public API ───────────────────────────────────────────────────────────
export function getPropertyOverrides() { return _propertyOverrides }
export function getFaqOverrides()      { return _faqOverrides }

export function subscribeProperties(fn) {
  _propListeners.push(fn)
  return () => { _propListeners = _propListeners.filter(l => l !== fn) }
}

export function subscribeFaq(fn) {
  _faqListeners.push(fn)
  return () => { _faqListeners = _faqListeners.filter(l => l !== fn) }
}
