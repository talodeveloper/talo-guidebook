import { contentStore } from './contentStore'
import { properties as defaultProperties } from './properties'
import { FAQ_DATA as defaultFaq } from './faqData'
import { db } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'
import { adminSignIn, adminSignOut } from './auth'

export const ADMIN_V2_LIVE_KEY = 'talo_admin_v2_live'
const DRAFT_KEY = 'talo_admin_v2_draft'
const AUTH_KEY = 'talo_admin_v2_auth'

export const PROPERTY_SLUGS = ['reynard-way', 'hawk-street', 'jackson-st', 'vista-pointe']

function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}
function writeJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

const DEFAULT_CHECKIN_WELCOME = "Welcome! Please review each house rule below and tap the checkbox next to every rule to confirm you've read and agreed to it. All guests staying at this property are expected to follow these rules. Thank you for helping us keep this space special for everyone."

function buildDefaultPropertyInfo(slug) {
  const p = defaultProperties[slug]
  if (!p) return {}
  return {
    name: p.name || '',
    address: p.address || '',
    checkInTime: p.checkInTime || '4:00 PM',
    checkoutTime: p.checkoutTime || '11:00 AM',
    maxGuests: p.maxGuests || 0,
    wifi: {
      network: p.wifi?.network || '',
      password: p.wifi?.password || '',
      notes: p.wifi?.notes || '',
    },
    ownerName: p.ownerName || '',
    ownerPhone: p.ownerPhone || '',
    ownerEmail: p.ownerEmail || '',
    checkInWelcome: DEFAULT_CHECKIN_WELCOME,
  }
}

function buildDefaultDraft() {
  return {
    blocks: contentStore.getAllBlocks(),
    properties: Object.fromEntries(
      PROPERTY_SLUGS.map(s => [s, buildDefaultPropertyInfo(s)])
    ),
    faq: JSON.parse(JSON.stringify(defaultFaq)),
  }
}

let _draft = null
let _live = null
let _listeners = []

function notify() { _listeners.forEach(fn => fn()) }

_live = readJSON(ADMIN_V2_LIVE_KEY)
_draft = readJSON(DRAFT_KEY)
if (!_draft) {
  _draft = _live ? JSON.parse(JSON.stringify(_live)) : buildDefaultDraft()
  writeJSON(DRAFT_KEY, _draft)
}

export const adminV2Store = {
  isAuthenticated: () => localStorage.getItem(AUTH_KEY) === 'true',

  async login(email, password) {
    try {
      await adminSignIn(email, password)
      localStorage.setItem(AUTH_KEY, 'true')
      return true
    } catch {
      return false
    }
  },

  logout() { adminSignOut() },

  hasUnsavedChanges() {
    if (!_live) return true
    return JSON.stringify(_draft) !== JSON.stringify(_live)
  },

  // ── Blocks ────────────────────────────────────────────────────────────────

  getBlocksForSection(sectionKey, slug) {
    return (_draft?.blocks || [])
      .filter(b => {
        if (b.sectionKey !== sectionKey) return false
        if (b.type === 'shared') return true
        return b.type === 'property' && b.propertySlug === slug
      })
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'shared' ? -1 : 1
        return (a.order || 99) - (b.order || 99)
      })
  },

  getSharedBlocks(sectionKey) {
    return (_draft?.blocks || [])
      .filter(b => b.sectionKey === sectionKey && b.type === 'shared')
      .sort((a, b) => (a.order || 99) - (b.order || 99))
  },

  updateBlock(id, updates) {
    _draft.blocks = (_draft.blocks || []).map(b => b.id === id ? { ...b, ...updates } : b)
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  addBlock(block) {
    const existing = (_draft.blocks || []).filter(
      b => b.sectionKey === block.sectionKey && b.propertySlug === block.propertySlug
    )
    const maxOrder = existing.reduce((m, b) => Math.max(m, b.order || 0), 0)
    const newBlock = { ...block, id: `blk-${Date.now()}`, order: maxOrder + 1 }
    _draft.blocks = [...(_draft.blocks || []), newBlock]
    writeJSON(DRAFT_KEY, _draft)
    notify()
    return newBlock
  },

  deleteBlock(id) {
    _draft.blocks = (_draft.blocks || []).filter(b => b.id !== id)
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Property info ─────────────────────────────────────────────────────────

  getPropertyInfo(slug) {
    return _draft?.properties?.[slug] || buildDefaultPropertyInfo(slug)
  },

  updatePropertyInfo(slug, updates) {
    if (!_draft.properties) _draft.properties = {}
    _draft.properties[slug] = {
      ...(_draft.properties[slug] || buildDefaultPropertyInfo(slug)),
      ...updates,
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── FAQ ───────────────────────────────────────────────────────────────────

  getFaq(slug) { return _draft?.faq?.[slug] || [] },

  setFaq(slug, items) {
    if (!_draft.faq) _draft.faq = {}
    _draft.faq[slug] = items
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Publish / Discard ─────────────────────────────────────────────────────

  async publish() {
    _live = JSON.parse(JSON.stringify(_draft))
    writeJSON(ADMIN_V2_LIVE_KEY, _live)
    contentStore.reloadFromLive(_live.blocks)

    // ── Push to Firestore so ALL devices see the update ──────────────────
    try {
      await setDoc(doc(db, 'v2_content', 'blocks'), {
        data: _live.blocks,
        updatedAt: new Date().toISOString(),
      })
      await setDoc(doc(db, 'v2_content', 'properties'), _live.properties || {})
      await setDoc(doc(db, 'v2_content', 'faq'), _live.faq || {})
    } catch (e) {
      console.error('[Firestore] publish failed:', e)
      // localStorage publish already succeeded — don't block the UI
    }

    notify()
  },

  discardDraft() {
    _draft = _live ? JSON.parse(JSON.stringify(_live)) : buildDefaultDraft()
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Change summary for "Unpublished Changes" dropdown ────────────────────

  getChangeSummary() {
    if (!_live) return [{ label: 'Initial setup', property: 'All Properties' }]
    const changes = []

    const SECTION_LABELS = {
      welcome: 'Welcome', house_rules: 'House Rules', arrival_info: 'Arrival Info',
      parking: 'Parking', checkout: 'Checkout', trash: 'Trash & Recycling',
      amenities: 'Amenities', local_guide: 'Local Guide',
      things_to_do: 'Things To Do', videos: 'Videos',
    }
    const propName = (slug) =>
      _draft?.properties?.[slug]?.name || defaultProperties[slug]?.name || slug

    // ─ Blocks
    const allSectionKeys = [...new Set([
      ...(_draft?.blocks || []).map(b => b.sectionKey),
      ...(_live?.blocks  || []).map(b => b.sectionKey),
    ])]
    for (const sKey of allSectionKeys) {
      const dS = (_draft?.blocks || []).filter(b => b.sectionKey === sKey)
      const lS = (_live?.blocks  || []).filter(b => b.sectionKey === sKey)
      const dShared = dS.filter(b => b.type === 'shared')
      const lShared = lS.filter(b => b.type === 'shared')
      if (JSON.stringify(dShared) !== JSON.stringify(lShared)) {
        changes.push({ label: SECTION_LABELS[sKey] || sKey, property: 'All Properties' })
      }
      const slugs = [...new Set([
        ...dS.filter(b => b.type === 'property').map(b => b.propertySlug),
        ...lS.filter(b => b.type === 'property').map(b => b.propertySlug),
      ])]
      for (const slug of slugs) {
        const d = dS.filter(b => b.type === 'property' && b.propertySlug === slug)
        const l = lS.filter(b => b.type === 'property' && b.propertySlug === slug)
        if (JSON.stringify(d) !== JSON.stringify(l)) {
          changes.push({ label: SECTION_LABELS[sKey] || sKey, property: propName(slug) })
        }
      }
    }

    // ─ Property info
    for (const slug of PROPERTY_SLUGS) {
      if (JSON.stringify(_draft?.properties?.[slug]) !== JSON.stringify(_live?.properties?.[slug])) {
        changes.push({ label: 'Property Info', property: propName(slug) })
      }
    }

    // ─ FAQ
    for (const slug of PROPERTY_SLUGS) {
      if (JSON.stringify(_draft?.faq?.[slug]) !== JSON.stringify(_live?.faq?.[slug])) {
        changes.push({ label: 'FAQ', property: propName(slug) })
      }
    }

    return changes
  },

  // ── Helpers ───────────────────────────────────────────────────────────────

  getPropertiesList() {
    return PROPERTY_SLUGS.map(slug => ({
      slug,
      name: _draft?.properties?.[slug]?.name || defaultProperties[slug]?.name || slug,
      status: defaultProperties[slug]?.status || 'active',
    }))
  },

  subscribe(fn) {
    _listeners.push(fn)
    return () => { _listeners = _listeners.filter(l => l !== fn) }
  },
}
