/**
 * firebaseSync.js
 * Real-time Firestore source for the guidebook. Import ONCE at the top of App.jsx.
 *
 * Phase 1.6 cutover: the PRIMARY source is now the tenant-scoped dataset
 *   tenants/{tenantId}/data/live  →  { data: <full admin dataset> }
 * which holds blocks + properties + faq + all V3 config in one document.
 *
 * If that tenant doc is missing/empty, we automatically fall back to the legacy
 * per-collection docs (v2_content/blocks, /properties, /faq) — so there is no
 * failure mode during/after migration.
 *
 * The full dataset is also mirrored into localStorage `talo_admin_v3_live` so
 * the guidebook's readV3Data() returns the real published V3 config (sections,
 * curation, heroes, image overrides) to ALL visitors — fixing the prior issue
 * where guests fell back to defaults because that config lived only in the
 * admin's own browser.
 */

import { db } from '../firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { contentStore } from './contentStore'
import { fsPaths, getTenantId, DEFAULT_TENANT_ID } from './tenant'

// Guest-facing cache, populated from Firestore. Deliberately a DIFFERENT key
// from the admin's `talo_admin_v3_live` — the admin owns that one and we must
// not silently overwrite it (Firestore re-orders object keys, which would
// make in-memory _live drift from _draft and flag spurious "unsaved changes"
// on every reload).
export const GUEST_V3_CACHE_KEY = 'talo_v3_guest_cache'

// ─── In-memory caches (consumed by V2 layout via the subscribe API) ────────
let _propertyOverrides = {}
let _faqOverrides      = {}
let _propListeners = []
let _faqListeners  = []
function notifyProp() { _propListeners.forEach(fn => fn(_propertyOverrides)) }
function notifyFaq()  { _faqListeners.forEach(fn => fn(_faqOverrides)) }

// ─── Legacy fallback listeners (only attached for the default TALO tenant) ──
// Non-talo tenants with no published content intentionally show empty sections,
// not TALO's sample data.
let _legacyAttached = false
function attachLegacyListeners() {
  if (_legacyAttached) return
  if (getTenantId() !== DEFAULT_TENANT_ID) return  // gate: talo only
  _legacyAttached = true
  try {
    onSnapshot(doc(db, ...fsPaths.contentBlocks()), (snap) => {
      const data = snap.exists() ? snap.data()?.data : null
      if (Array.isArray(data) && data.length > 0) contentStore.reloadFromLive(data)
    }, () => {})
    onSnapshot(doc(db, ...fsPaths.contentProperties()), (snap) => {
      if (snap.exists()) { _propertyOverrides = snap.data() || {}; notifyProp() }
    }, () => {})
    onSnapshot(doc(db, ...fsPaths.contentFaq()), (snap) => {
      if (snap.exists()) { _faqOverrides = snap.data() || {}; notifyFaq() }
    }, () => {})
  } catch {}
}

// ─── Primary listener: tenant dataset (with automatic legacy fallback) ──────
try {
  onSnapshot(
    doc(db, ...fsPaths.tenantDataLive()),
    (snap) => {
      const full = snap.exists() ? snap.data()?.data : null
      if (full && Array.isArray(full.blocks) && full.blocks.length > 0) {
        // Hydrate the public guest cache so readV3Data() serves real published
        // config to first-time visitors.
        try { localStorage.setItem(GUEST_V3_CACHE_KEY, JSON.stringify(full)) } catch {}
        // If admin is NOT signed in on this browser, also refresh talo_admin_v3_live
        // so a stale key from a previous admin session doesn't shadow the fresh
        // Firestore data. (readV3Data reads admin-live first — a stale copy there
        // would hide logo/hero/host updates published from another device.)
        // We deliberately skip this when admin IS signed in to avoid clobbering
        // the in-memory _live state that adminV3Store owns.
        try {
          if (localStorage.getItem('talo_admin_v3_auth') !== 'true') {
            localStorage.setItem('talo_admin_v3_live', JSON.stringify(full))
          }
        } catch {}
        if (full.properties) { _propertyOverrides = full.properties; notifyProp() }
        if (full.faq)        { _faqOverrides = full.faq;        notifyFaq() }
        contentStore.reloadFromLive(full.blocks)
      } else {
        // Tenant doc missing/empty → use the legacy per-collection docs.
        attachLegacyListeners()
      }
    },
    () => { attachLegacyListeners() }  // permission/network error → fall back
  )
} catch {
  attachLegacyListeners()
}

// ─── Public API (unchanged) ────────────────────────────────────────────────
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
