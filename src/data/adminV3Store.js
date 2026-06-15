import { contentStore } from './contentStore'
import { properties as defaultProperties } from './properties'
import { FAQ_DATA as defaultFaq } from './faqData'
import { db } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'

// Push a live snapshot to Firestore so the cross-tab/cross-session listener
// can't overwrite our changes with stale data. Best-effort — failure here
// must not block the local publish, since the local data is already saved.
async function pushToFirestore(live) {
  try {
    await setDoc(doc(db, 'v2_content', 'blocks'), { data: live.blocks })
    if (live.properties) {
      await setDoc(doc(db, 'v2_content', 'properties'), live.properties)
    }
  } catch (err) {
    console.warn('[adminV3Store] Firestore push failed:', err)
  }
}

export const ADMIN_V3_LIVE_KEY = 'talo_admin_v3_live'
const DRAFT_KEY = 'talo_admin_v3_draft'
const AUTH_KEY = 'talo_admin_v3_auth'

export const ACTIVITY_CATEGORIES = [
  { key: 'rbc',                  label: "Restaurants, Bars & Cafés",  color: '#9B1C1C', accent: '#DC2626' },
  { key: 'parks-beaches',        label: 'Parks & Beaches',             color: '#14532D', accent: '#16A34A' },
  { key: 'shopping-attractions', label: 'Shopping & Attractions',      color: '#78350F', accent: '#D97706' },
  { key: 'others',               label: 'Others',                      color: '#1E3A5F', accent: '#3B82F6' },
]

// Accent palette cycled through for admin-created categories
const CATEGORY_PALETTE = [
  { color: '#581C87', accent: '#9333EA' }, // purple
  { color: '#155E75', accent: '#0891B2' }, // cyan
  { color: '#9D174D', accent: '#EC4899' }, // pink
  { color: '#3F6212', accent: '#84CC16' }, // lime
  { color: '#7C2D12', accent: '#F97316' }, // orange
  { color: '#1E3A8A', accent: '#6366F1' }, // indigo
]

export const BASE_PROPERTY_SLUGS = ['reynard-way', 'hawk-street', 'jackson-st', 'vista-pointe']

// V3 active sections per property (removes local_guide + things_to_do, adds activity_center)
export const DEFAULT_V3_SECTIONS = [
  'welcome', 'entry', 'parking', 'wifi', 'house_rules',
  'the_home', 'additional_space', 'outdoor_spaces',
  'services_maintenance', 'transport', 'activity_center',
]

// ── V3 guidebook section definitions (defaults) ──────────────────────────────
// outdoor_spaces nests under the_home; activity_center is a separate page link.
export const V3_SECTION_DEFAULTS = [
  { key: 'welcome',              label: 'Welcome',                 icon: 'waving_hand' },
  { key: 'entry',                label: 'How to Enter',            icon: 'key' },
  { key: 'parking',              label: 'Parking',                 icon: 'local_parking' },
  { key: 'wifi',                 label: 'Wi-Fi',                   icon: 'wifi' },
  { key: 'house_rules',          label: 'House Rules',             icon: 'gavel' },
  { key: 'the_home',             label: 'The Home',                icon: 'home' },
  { key: 'additional_space',     label: 'Additional Spaces',       icon: 'meeting_room',  parentKey: 'the_home' },
  { key: 'outdoor_spaces',       label: 'Outdoor Spaces',          icon: 'deck',          parentKey: 'the_home' },
  { key: 'services_maintenance', label: 'Services & Maintenance',  icon: 'build' },
  { key: 'transport',            label: 'Transportation Options',  icon: 'directions' },
  { key: 'activity_center',      label: 'Activity Center',         icon: 'explore',       page: true },
]

// Builds the per-property section list (ordered, with enabled flags + custom
// sections) by merging the stored config over the defaults. Pure — usable by
// the guidebook with parsed localStorage data.
export function buildV3Sections(data, slug) {
  const config = data?.propertySectionConfig?.[slug]
  const defMap = new Map(V3_SECTION_DEFAULTS.map(s => [s.key, s]))
  if (!config || !config.length) {
    return V3_SECTION_DEFAULTS.map(s => ({ ...s, enabled: true }))
  }
  const out = []
  const seen = new Set()
  for (const c of config) {
    const def = defMap.get(c.key)
    if (def) {
      out.push({ ...def, ...{ label: c.label || def.label }, enabled: c.enabled !== false })
    } else if (c.custom) {
      out.push({ key: c.key, label: c.label || 'Custom Section', icon: c.icon || 'article', custom: true, enabled: c.enabled !== false })
    }
    seen.add(c.key)
  }
  // Defaults added after the config was stored — append enabled
  for (const def of V3_SECTION_DEFAULTS) {
    if (!seen.has(def.key)) out.push({ ...def, enabled: true })
  }
  return out
}

const SEED_ACTIVITIES = [
  // ── Restaurants, Bars & Cafés ──────────────────────────────────────────
  { id: 'act-001', name: "Filippi's Pizza Grotto",    category: 'rbc', description: "Best lasagna ever! A San Diego classic in Little Italy.",                           address: '1747 India St, San Diego, CA 92101', phone: '(619) 232-5094', website: 'https://realcheesepizza.com/little-italy', imageUrl: '' },
  { id: 'act-002', name: 'Buon Appetito',             category: 'rbc', description: 'Authentic Italian trattoria in Little Italy with a cozy atmosphere.',               address: '1609 India St, San Diego, CA 92101', phone: '(619) 238-9880', website: 'https://buonappetitosandiego.com',           imageUrl: '' },
  { id: 'act-003', name: 'Soi PB Thai Street Food',   category: 'rbc', description: 'Flavorful Thai street food favorites near Mission Bay.',                            address: '4658 Mission Blvd, San Diego, CA 92109', phone: '(858) 263-4309', website: 'https://soipbthaifood.com',              imageUrl: '' },
  { id: 'act-004', name: 'La Puerta',                 category: 'rbc', description: 'Great Mexican food right in the neighborhood on Goldfinch St.',                     address: '4020 Goldfinch St, San Diego, CA 92103', phone: '(619) 876-5200', website: 'https://lapuertasd.com',              imageUrl: '' },
  { id: 'act-005', name: 'Starbucks',                 category: 'rbc', description: 'Coffee and quick bites — 5 min walk from most Mission Hills properties.',           address: '784 W. Washington St, San Diego, CA 92103', phone: '', website: '',                                          imageUrl: '/images/local/starbucks.png' },
  { id: 'act-006', name: 'Genteel Coffee Co.',        category: 'rbc', description: 'Local specialty coffee in North Park. Great beans, great vibes.',                   address: '2603 University Ave, San Diego, CA 92104', phone: '', website: '',                                           imageUrl: '/images/local/genteel-coffee.jpg' },
  { id: 'act-007', name: "Moe's Coffee & Munchies",   category: 'rbc', description: 'Casual neighborhood coffee shop and food spot.',                                    address: '', phone: '', website: '',                                                                                       imageUrl: '/images/local/moes-coffee.jpg' },
  { id: 'act-008', name: 'La Bella Pizza',            category: 'rbc', description: 'Local pizza spot with classic pies.',                                               address: '', phone: '', website: '',                                                                                       imageUrl: '/images/local/la-bella-pizza.jpg' },
  { id: 'act-009', name: 'Snooty Fox',                category: 'rbc', description: 'Popular neighborhood bar and restaurant with a lively crowd.',                      address: '', phone: '', website: '',                                                                                       imageUrl: '/images/local/snooty-fox.jpg' },

  // ── Parks & Beaches ────────────────────────────────────────────────────
  { id: 'act-010', name: 'Kayaking & SUP — Mission Bay',   category: 'parks-beaches', description: 'Aqua Adventures offers kayaks and stand-up paddleboards at Mission Bay.',              address: '', phone: '', website: 'https://aqua-adventures.com',          imageUrl: '/images/local/aqua-adventures.jpg' },
  { id: 'act-011', name: 'SUP — La Jolla',                 category: 'parks-beaches', description: 'Everyday California offers guided SUP tours along the La Jolla coastline.',            address: '', phone: '', website: 'https://everydaycalifornia.com',        imageUrl: '/images/local/kayak-la-jolla.jpg' },
  { id: 'act-012', name: 'Paddle Board San Diego',         category: 'parks-beaches', description: 'Multiple Mission Bay locations for paddleboard rental and lessons.',                    address: '', phone: '', website: 'https://paddleboardsandiego.com',       imageUrl: '/images/local/paddle.jpg' },
  { id: 'act-013', name: 'Palm Canyon Trail',              category: 'parks-beaches', description: "Beautiful urban hike through Balboa Park's canyon.",                                   address: '635 Pan American W Rd, San Diego', phone: '', website: 'https://balboapark.org', imageUrl: '/images/local/palm-canyon.jpg' },
  { id: 'act-014', name: 'Marston Point',                  category: 'parks-beaches', description: 'Scenic overlook trail in Balboa Park with city and canyon views.',                     address: '', phone: '', website: '',                                       imageUrl: '/images/local/marston-point.jpg' },
  { id: 'act-015', name: 'Sail San Diego',                 category: 'parks-beaches', description: 'Day trips and sailing tours around San Diego Bay.',                                     address: '', phone: '', website: 'https://sailsandiego.com',               imageUrl: '/images/local/sail-san-diego.jpg' },
  { id: 'act-016', name: 'Mission Bay Sport Center',       category: 'parks-beaches', description: 'Boat, jet ski, jet pack, and power boat rentals at Mission Bay.',                      address: '', phone: '', website: 'https://missionbaysportcenter.com',      imageUrl: '/images/local/mission-bay-sport.jpg' },
  { id: 'act-017', name: 'Balboa Park Golf Course',        category: 'parks-beaches', description: 'Historic 18-hole public golf course inside Balboa Park.',                              address: '', phone: '', website: 'https://sandiego.gov/park-and-recreation/golf/bpgolf', imageUrl: '/images/local/balboa-park-golf.jpg' },
  { id: 'act-018', name: 'The Loma Club',                  category: 'parks-beaches', description: 'Scenic golf club with stunning bay and city views.',                                   address: '', phone: '', website: 'https://thelomaclub.com',                imageUrl: '/images/local/loma-club.jpg' },
  { id: 'act-019', name: 'Coronado Island',                category: 'parks-beaches', description: 'Stunning beaches, shops, and the iconic Hotel del Coronado.',                          address: '', phone: '', website: 'https://coronadovisitorcenter.com',       imageUrl: '/images/local/coronado-island.jpg' },
  { id: 'act-020', name: 'Sweetwater Summit',              category: 'parks-beaches', description: 'Regional park with trails, camping, and wide-open outdoor spaces.',                    address: '', phone: '', website: '',                                       imageUrl: '/images/local/sweetwater-summit.jpg' },
  { id: 'act-021', name: 'Border Field State Park',        category: 'parks-beaches', description: 'Southernmost point of California with beach and hiking.',                              address: '', phone: '', website: '',                                       imageUrl: '/images/local/border-field.jpg' },
  { id: 'act-022', name: 'Olympic Training Center',        category: 'parks-beaches', description: 'Tour the US Olympic & Paralympic Training Center in Chula Vista.',                     address: '', phone: '', website: '',                                       imageUrl: '/images/local/olympic-training.jpg' },
  { id: 'act-023', name: 'Disco Paddle',                   category: 'parks-beaches', description: 'Fun group paddleboard events on Mission Bay — great for groups!',                      address: '', phone: '', website: '',                                       imageUrl: '/images/local/disco-paddle.jpg' },

  // ── Shopping & Attractions ─────────────────────────────────────────────
  { id: 'act-024', name: 'Fashion Valley Mall',     category: 'shopping-attractions', description: "San Diego's premier outdoor shopping mall with top retail and dining.",    address: '7007 Friars Rd, San Diego, CA 92108',       phone: '', website: '',                                         imageUrl: '/images/local/fashion-valley.jpg' },
  { id: 'act-025', name: 'Balboa Park',             category: 'shopping-attractions', description: 'Museums, gardens, and the San Diego Zoo all in one iconic location.',     address: '1549 El Prado, San Diego, CA 92101',        phone: '', website: 'https://balboapark.org',                    imageUrl: '/images/local/balboa-park.jpg' },
  { id: 'act-026', name: 'Little Italy',            category: 'shopping-attractions', description: 'Shops, outdoor markets (Wed & Sat) and some of SD\'s best restaurants.', address: '',                                          phone: '', website: 'https://littleitalysd.com',                 imageUrl: '' },
  { id: 'act-027', name: 'Legoland California',    category: 'shopping-attractions', description: 'Family theme park in Carlsbad — perfect for kids!',                       address: 'One Legoland Dr, Carlsbad, CA 92008',       phone: '', website: 'https://legoland.com/california',           imageUrl: '' },
  { id: 'act-028', name: 'SeaWorld San Diego',     category: 'shopping-attractions', description: 'World-famous amusement park with sea life shows and thrilling rides.',    address: '',                                          phone: '', website: 'https://seaworld.com',                      imageUrl: '' },
  { id: 'act-029', name: 'San Diego Zoo',          category: 'shopping-attractions', description: 'Internationally renowned zoo in Balboa Park. Safari park 32 mi north.',  address: '',                                          phone: '', website: 'https://sandiegozoowildlifealliance.org',   imageUrl: '' },
  { id: 'act-030', name: 'Old Town San Diego',     category: 'shopping-attractions', description: 'Historic district with shops, restaurants, and California heritage.',     address: '',                                          phone: '', website: '',                                         imageUrl: '/images/local/old-town-sd.jpg' },
  { id: 'act-031', name: 'Target',                 category: 'shopping-attractions', description: 'General merchandise, groceries, and everyday essentials.',                address: '3245 Sports Arena Blvd, San Diego, CA 92110', phone: '', website: '',                                       imageUrl: '/images/local/target.jpg' },
  { id: 'act-032', name: 'Vons Grocery',           category: 'shopping-attractions', description: 'Convenient grocery store, 5 min walk from Mission Hills properties.',    address: '515 W Washington St, San Diego, CA 92103',  phone: '', website: '',                                         imageUrl: '/images/local/vons-grocery.jpg' },
  { id: 'act-033', name: "Sprouts Farmers Market", category: 'shopping-attractions', description: 'Organic and specialty grocery store.',                                    address: '3315 Rosecrans St, San Diego, CA 92110',    phone: '', website: '',                                         imageUrl: '/images/local/sprouts.jpg' },
  { id: 'act-034', name: "Ralph's Grocery Store",  category: 'shopping-attractions', description: 'Full-service grocery store in Mission Hills.',                           address: '1020 University Ave, San Diego, CA 92103',  phone: '', website: '',                                         imageUrl: '/images/local/ralphs.jpg' },

  // ── Others ─────────────────────────────────────────────────────────────
  { id: 'act-035', name: 'Chula Vista Bayfront',   category: 'others', description: 'Scenic waterfront park and marina on San Diego Bay.',             address: '', phone: '', website: '',  imageUrl: '/images/local/chula-vista-bayfront.jpg' },
  { id: 'act-036', name: 'SD Oasis',               category: 'others', description: 'Community recreation and fitness center in Mission Hills area.',  address: '', phone: '', website: '',  imageUrl: '/images/local/sd-oasis.jpg' },
]

// Image paths use BASE_URL prefix — activity cards must call resolveActivityImage()
export const SEED_IMAGE_MAP = Object.fromEntries(SEED_ACTIVITIES.map(a => [a.id, a.imageUrl]))

function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}
function writeJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

const DEFAULT_CHECKIN_WELCOME = "Welcome! Please review each house rule below and tap the checkbox next to every rule to confirm you've read and agreed to it. All guests staying at this property are expected to follow these rules. Thank you for helping us keep this space special for everyone."

export const DEFAULT_CHECKIN_OFFER = "🎁 One more thing! Ask every adult (18+) in your group to complete their own check-in using this same link — when everyone signs in, you'll earn a $50 credit toward your next stay with TALO Rentals."

function buildDefaultPropertyInfo(slug) {
  const p = defaultProperties[slug]
  if (!p) return {}
  return {
    name: p.name || '',
    address: p.address || '',
    checkInTime: p.checkInTime || '4:00 PM',
    checkoutTime: p.checkoutTime || '11:00 AM',
    maxGuests: p.maxGuests || 0,
    wifi: { network: p.wifi?.network || '', password: p.wifi?.password || '', notes: p.wifi?.notes || '' },
    ownerName: p.ownerName || '',
    ownerPhone: p.ownerPhone || '',
    ownerEmail: p.ownerEmail || '',
    checkInWelcome: DEFAULT_CHECKIN_WELCOME,
    checkInOfferText: DEFAULT_CHECKIN_OFFER,
    // Guidebook card visibility — undefined is treated as true everywhere
    showPropertyCard: true,
    showWifiCard: true,
    showHostCard: true,
    checkInEnabled: true,
    showCheckoutTimeBanner: true,
    // Optional per-property hero banner. When null, the global default hero
    // (newhero.png / nightview.png) renders instead.
    heroImage: null,
    heroImageNight: null,
  }
}

function buildDefaultCurationForSlug(activities, categories = ACTIVITY_CATEGORIES) {
  const curation = {}
  for (const cat of categories) {
    curation[cat.key] = activities
      .filter(a => a.category === cat.key)
      .map((a, i) => ({ activityId: a.id, enabled: true, order: i }))
  }
  return curation
}

function buildDefaultDraft() {
  // Pre-seed from V2 live data (or V2 defaults)
  const v2Live = readJSON('talo_admin_v2_live')
  const v2Draft = readJSON('talo_admin_v2_draft')
  const base = v2Live || v2Draft

  const blocks = base?.blocks || contentStore.getAllBlocks()
  const properties = base?.properties || Object.fromEntries(
    BASE_PROPERTY_SLUGS.map(s => [s, buildDefaultPropertyInfo(s)])
  )
  const faq = base?.faq || JSON.parse(JSON.stringify(defaultFaq))

  const propertyCuration = {}
  for (const slug of BASE_PROPERTY_SLUGS) {
    propertyCuration[slug] = buildDefaultCurationForSlug(SEED_ACTIVITIES)
  }

  return {
    blocks,
    properties,
    faq,
    activities: SEED_ACTIVITIES,
    propertyCuration,
    propertyList: BASE_PROPERTY_SLUGS.map(s => ({ slug: s, status: 'active' })),
    propertySections: {},  // per-property section overrides (for new properties)
  }
}

// ── Pure helpers shared by admin + guidebook ─────────────────────────────────

// Re-orders a section's blocks using the per-property order overlay
// (propertyBlockOrder[slug][sectionKey] = [blockId, ...]). Blocks not in the
// overlay keep their default position relative to each other, appended after.
export function applyPropertyBlockOrder(blocks, slug, sectionKey, data) {
  const order = data?.propertyBlockOrder?.[slug]?.[sectionKey]
  if (!order || !order.length) return blocks
  const pos = new Map(order.map((id, i) => [id, i]))
  return [...blocks].sort((a, b) => {
    const ai = pos.has(a.id) ? pos.get(a.id) : Infinity
    const bi = pos.has(b.id) ? pos.get(b.id) : Infinity
    return ai - bi
  })
}

// Builds the guest-facing FAQ list for a property: global + local questions,
// in curated mixed order, with disabled global questions removed.
export function buildFaqList(data, slug) {
  const localItems  = data?.faq?.[slug] || []
  const globalItems = data?.globalFaq || []
  const curation    = data?.faqCuration?.[slug]
  if (!curation || !curation.length) return [...globalItems, ...localItems]
  const localMap  = new Map(localItems.map((it, i) => [it.id ?? `__idx-${i}`, it]))
  const globalMap = new Map(globalItems.map(it => [it.id, it]))
  const seen = new Set()
  const out = []
  for (const e of curation) {
    const item = e.source === 'global' ? globalMap.get(e.id) : localMap.get(e.id)
    if (!item) continue
    seen.add(e.id)
    if (e.enabled !== false) out.push(item)
  }
  for (const g of globalItems) if (g.id && !seen.has(g.id)) out.push(g)
  for (const [key, l] of localMap) if (!seen.has(key)) out.push(l)
  return out
}

// Ensure FAQ items have stable ids + global FAQ containers exist
function migrateFaqStructures(draft) {
  if (!draft) return draft
  let changed = false
  if (!draft.globalFaq)   { draft.globalFaq = [];   changed = true }
  if (!draft.faqCuration) { draft.faqCuration = {}; changed = true }
  if (draft.faq) {
    for (const slug of Object.keys(draft.faq)) {
      draft.faq[slug] = (draft.faq[slug] || []).map((it, i) => {
        if (!it.id) { changed = true; return { ...it, id: `lfaq-${slug}-${i}-${Math.random().toString(36).slice(2, 8)}` } }
        return it
      })
    }
  }
  if (changed) writeJSON(DRAFT_KEY, draft)
  return draft
}

// One-time fix for Hawk Street bedroom image mismatches that shipped in earlier
// drafts (bathroom and living room photos were in the bedrooms grid). Only
// rewrites blocks whose images still match the original broken array — admin
// edits are left untouched.
const HAWK_1F_BAD = [
  '/photos/hawk-street/p10_img1_848x567.jpeg',
  '/photos/hawk-street/p10_img2_848x567.jpeg',
  '/photos/hawk-street/p10_img3_848x567.jpeg',
  '/photos/hawk-street/p10_img4_848x567.jpeg',
]
const HAWK_1F_FIX = [
  { src: '/photos/hawk-street/p10_img2_848x567.jpeg', caption: 'Bedroom — Queen Bed' },
  { src: '/photos/hawk-street/p10_img3_848x567.jpeg', caption: 'Bedroom — Queen Bed' },
  { src: '/photos/hawk-street/p10_img1_848x567.jpeg', caption: 'Bedroom 4 — Bunk Beds' },
]
const HAWK_2F_BAD = [
  '/photos/hawk-street/p13_img1_848x567.jpeg',
  '/photos/hawk-street/p13_img2_848x567.jpeg',
  '/photos/hawk-street/p13_img3_848x567.jpeg',
  '/photos/hawk-street/p13_img4_848x567.jpeg',
]
const HAWK_2F_FIX = [
  { src: '/photos/hawk-street/p13_img3_848x567.jpeg', caption: '2F Bedroom — Queen Bed' },
  { src: '/photos/hawk-street/p13_img4_848x567.jpeg', caption: '2F Bedroom — 2 Queen Beds' },
]
function migrateHawkBedroomImages(data, persistKey) {
  if (!data?.blocks) return data
  let changed = false
  data.blocks = data.blocks.map(b => {
    if (b.id === 'space-hawk-bedrooms-1f') {
      const srcs = (b.images || []).map(i => i.src)
      if (srcs.length === HAWK_1F_BAD.length && srcs.every((s, i) => s === HAWK_1F_BAD[i])) {
        changed = true
        return { ...b, images: HAWK_1F_FIX }
      }
    }
    if (b.id === 'space-hawk-bedrooms-2f') {
      const srcs = (b.images || []).map(i => i.src)
      if (srcs.length === HAWK_2F_BAD.length && srcs.every((s, i) => s === HAWK_2F_BAD[i])) {
        changed = true
        return { ...b, images: HAWK_2F_FIX }
      }
    }
    return b
  })
  if (changed && persistKey) writeJSON(persistKey, data)
  return data
}

// Patch existing draft activities with imageUrls from seed (migration for already-stored drafts)
function migrateImages(draft) {
  if (!draft?.activities) return draft
  const seedMap = Object.fromEntries(SEED_ACTIVITIES.map(a => [a.id, a.imageUrl]))
  let changed = false
  draft.activities = draft.activities.map(a => {
    if (!a.imageUrl && seedMap[a.id]) { changed = true; return { ...a, imageUrl: seedMap[a.id] } }
    return a
  })
  if (changed) writeJSON(DRAFT_KEY, draft)
  return draft
}

let _draft = null
let _live = null
let _listeners = []

function notify() { _listeners.forEach(fn => fn()) }

_live = readJSON(ADMIN_V3_LIVE_KEY)
_draft = readJSON(DRAFT_KEY)
if (!_draft) {
  _draft = _live ? JSON.parse(JSON.stringify(_live)) : buildDefaultDraft()
  writeJSON(DRAFT_KEY, _draft)
} else {
  _draft = migrateImages(_draft)
}
_draft = migrateFaqStructures(_draft)
_draft = migrateHawkBedroomImages(_draft, DRAFT_KEY)
if (_live) _live = migrateHawkBedroomImages(_live, ADMIN_V3_LIVE_KEY)
// Seed dynamic activity categories for drafts created before they were data-driven
if (_draft && !_draft.activityCategories) {
  _draft.activityCategories = JSON.parse(JSON.stringify(ACTIVITY_CATEGORIES))
  writeJSON(DRAFT_KEY, _draft)
}
// Backfill deactivatedAt for properties deactivated before cool-off tracking existed
if (_draft?.propertyList?.some(p => p.status === 'inactive' && !p.deactivatedAt)) {
  _draft.propertyList = _draft.propertyList.map(p =>
    p.status === 'inactive' && !p.deactivatedAt
      ? { ...p, deactivatedAt: new Date().toISOString() }
      : p
  )
  writeJSON(DRAFT_KEY, _draft)
}

export const adminV3Store = {
  isAuthenticated: () => localStorage.getItem(AUTH_KEY) === 'true',

  login(email, password) {
    if (email === 'joe@talo.ventures' && password === 'Mytalo@2026') {
      localStorage.setItem(AUTH_KEY, 'true')
      return true
    }
    return false
  },

  logout() { localStorage.removeItem(AUTH_KEY) },

  hasUnsavedChanges() {
    if (!_live) return true
    return JSON.stringify(_draft) !== JSON.stringify(_live)
  },

  getChangeSummary() {
    if (!_live) return [{ label: 'Initial setup', property: 'All Properties' }]
    const changes = []
    const SECTION_LABELS = {
      welcome: 'Welcome', house_rules: 'House Rules', arrival_info: 'Arrival Info',
      parking: 'Parking', checkout: 'Checkout', trash: 'Trash & Recycling',
      amenities: 'Amenities', activity_center: 'Activity Center',
      services_maintenance: 'Services', transport: 'Transport', the_home: 'The Home',
    }
    const slugs = (_draft?.propertyList || BASE_PROPERTY_SLUGS.map(s => ({ slug: s }))).map(p => p.slug)
    const propName = (slug) =>
      _draft?.properties?.[slug]?.name || defaultProperties[slug]?.name || slug

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
      for (const slug of slugs) {
        const d = dS.filter(b => b.type === 'property' && b.propertySlug === slug)
        const l = lS.filter(b => b.type === 'property' && b.propertySlug === slug)
        if (JSON.stringify(d) !== JSON.stringify(l)) {
          changes.push({ label: SECTION_LABELS[sKey] || sKey, property: propName(slug) })
        }
      }
    }
    for (const slug of slugs) {
      if (JSON.stringify(_draft?.properties?.[slug]) !== JSON.stringify(_live?.properties?.[slug])) {
        changes.push({ label: 'Property Info', property: propName(slug) })
      }
    }
    if (JSON.stringify(_draft?.activities) !== JSON.stringify(_live?.activities)) {
      changes.push({ label: 'Activities', property: 'Global' })
    }
    for (const slug of slugs) {
      if (JSON.stringify(_draft?.propertyCuration?.[slug]) !== JSON.stringify(_live?.propertyCuration?.[slug])) {
        changes.push({ label: 'Activity Curation', property: propName(slug) })
      }
    }
    for (const slug of slugs) {
      if (JSON.stringify(_draft?.faq?.[slug]) !== JSON.stringify(_live?.faq?.[slug])
        || JSON.stringify(_draft?.faqCuration?.[slug]) !== JSON.stringify(_live?.faqCuration?.[slug])) {
        changes.push({ label: 'FAQ', property: propName(slug) })
      }
    }
    if (JSON.stringify(_draft?.globalFaq) !== JSON.stringify(_live?.globalFaq)) {
      changes.push({ label: 'FAQ', property: 'Global' })
    }
    for (const slug of slugs) {
      if (JSON.stringify(_draft?.propertyBlockOrder?.[slug]) !== JSON.stringify(_live?.propertyBlockOrder?.[slug])) {
        changes.push({ label: 'Rule Order', property: propName(slug) })
      }
    }
    if (JSON.stringify(_draft?.activityCategories) !== JSON.stringify(_live?.activityCategories)) {
      changes.push({ label: 'Activity Categories', property: 'Global' })
    }
    for (const slug of slugs) {
      if (JSON.stringify(_draft?.propertySectionConfig?.[slug]) !== JSON.stringify(_live?.propertySectionConfig?.[slug])) {
        changes.push({ label: 'Sections', property: propName(slug) })
      }
    }
    for (const slug of slugs) {
      if (JSON.stringify(_draft?.disabledBlocks?.[slug]) !== JSON.stringify(_live?.disabledBlocks?.[slug])) {
        changes.push({ label: 'Hidden Blocks', property: propName(slug) })
      }
    }
    for (const slug of slugs) {
      if (JSON.stringify(_draft?.propertyImageOverrides?.[slug]) !== JSON.stringify(_live?.propertyImageOverrides?.[slug])) {
        changes.push({ label: 'Images', property: propName(slug) })
      }
    }
    return changes
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

  // ── Per-property block visibility (e.g. checkout page parts) ──────────────

  getDisabledBlocks(slug) {
    return _draft?.disabledBlocks?.[slug] || []
  },

  isBlockDisabled(slug, blockId) {
    return (_draft?.disabledBlocks?.[slug] || []).includes(blockId)
  },

  toggleBlockDisabled(slug, blockId) {
    if (!_draft.disabledBlocks) _draft.disabledBlocks = {}
    const current = _draft.disabledBlocks[slug] || []
    _draft.disabledBlocks = {
      ..._draft.disabledBlocks,
      [slug]: current.includes(blockId)
        ? current.filter(id => id !== blockId)
        : [...current, blockId],
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Per-property image overrides (admin-uploaded replacements) ───────────
  //
  // Shape: propertyImageOverrides[slug][blockId] = [{ src, caption, path? }]
  //   - `src` is a Firebase Storage download URL or a static /photos/... path
  //   - `path` is the Storage object path (only present for uploaded images)
  //
  // Resolution: if an override exists for (slug, blockId), it FULLY replaces
  // the block's default images array. Otherwise the static defaults render.

  getBlockImages(slug, blockId, defaultImages) {
    const override = _draft?.propertyImageOverrides?.[slug]?.[blockId]
    return Array.isArray(override) ? override : (defaultImages || [])
  },

  hasImageOverride(slug, blockId) {
    return Array.isArray(_draft?.propertyImageOverrides?.[slug]?.[blockId])
  },

  setBlockImages(slug, blockId, images) {
    if (!_draft.propertyImageOverrides) _draft.propertyImageOverrides = {}
    _draft.propertyImageOverrides = {
      ..._draft.propertyImageOverrides,
      [slug]: {
        ...(_draft.propertyImageOverrides[slug] || {}),
        [blockId]: images,
      },
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  clearBlockImages(slug, blockId) {
    if (!_draft.propertyImageOverrides?.[slug]) return
    const next = { ...(_draft.propertyImageOverrides[slug] || {}) }
    delete next[blockId]
    _draft.propertyImageOverrides = {
      ..._draft.propertyImageOverrides,
      [slug]: next,
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Per-property block ordering (mixed global + property) ─────────────────

  // Returns blocks for a section in the per-property display order
  getOrderedBlocksForSection(sectionKey, slug) {
    const blocks = this.getBlocksForSection(sectionKey, slug)
    return applyPropertyBlockOrder(blocks, slug, sectionKey, _draft)
  },

  setPropertyBlockOrder(slug, sectionKey, orderedIds) {
    if (!_draft.propertyBlockOrder) _draft.propertyBlockOrder = {}
    _draft.propertyBlockOrder = {
      ..._draft.propertyBlockOrder,
      [slug]: { ...(_draft.propertyBlockOrder[slug] || {}), [sectionKey]: orderedIds },
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

  // ── Global FAQ ─────────────────────────────────────────────────────────────

  getGlobalFaq() { return _draft?.globalFaq || [] },

  addGlobalFaqItem() {
    const item = { id: `gfaq-${Date.now()}`, q: '', a: '' }
    _draft.globalFaq = [...(_draft.globalFaq || []), item]
    // Append to every property's curation (enabled)
    if (!_draft.faqCuration) _draft.faqCuration = {}
    for (const slug of Object.keys(_draft.faqCuration)) {
      _draft.faqCuration[slug] = [..._draft.faqCuration[slug], { id: item.id, source: 'global', enabled: true }]
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
    return item
  },

  updateGlobalFaqItem(id, updates) {
    _draft.globalFaq = (_draft.globalFaq || []).map(it => it.id === id ? { ...it, ...updates } : it)
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  deleteGlobalFaqItem(id) {
    _draft.globalFaq = (_draft.globalFaq || []).filter(it => it.id !== id)
    if (_draft.faqCuration) {
      for (const slug of Object.keys(_draft.faqCuration)) {
        _draft.faqCuration[slug] = _draft.faqCuration[slug].filter(e => e.id !== id)
      }
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Per-property FAQ curation (mixed order + global enable/disable) ───────

  // Returns [{ entry: {id, source, enabled}, item: {id, q, a} }] in display order
  getFaqDisplay(slug) {
    const localItems  = _draft?.faq?.[slug] || []
    const globalItems = _draft?.globalFaq || []
    if (!_draft.faqCuration) _draft.faqCuration = {}
    let curation = _draft.faqCuration[slug]
    if (!curation) {
      curation = [
        ...globalItems.map(it => ({ id: it.id, source: 'global', enabled: true })),
        ...localItems.map(it => ({ id: it.id, source: 'local', enabled: true })),
      ]
      _draft.faqCuration[slug] = curation
    }
    const localMap  = new Map(localItems.map(it => [it.id, it]))
    const globalMap = new Map(globalItems.map(it => [it.id, it]))
    const seen = new Set()
    const out = []
    for (const e of curation) {
      const item = e.source === 'global' ? globalMap.get(e.id) : localMap.get(e.id)
      if (!item) continue
      seen.add(e.id)
      out.push({ entry: e, item })
    }
    // Items added since curation was built — append
    for (const g of globalItems) if (!seen.has(g.id)) out.push({ entry: { id: g.id, source: 'global', enabled: true }, item: g })
    for (const l of localItems) if (!seen.has(l.id)) out.push({ entry: { id: l.id, source: 'local', enabled: true }, item: l })
    return out
  },

  setFaqCuration(slug, entries) {
    if (!_draft.faqCuration) _draft.faqCuration = {}
    _draft.faqCuration = { ..._draft.faqCuration, [slug]: entries }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  moveFaqEntry(slug, index, direction) {
    const display = this.getFaqDisplay(slug)
    const target = index + direction
    if (target < 0 || target >= display.length) return
    const entries = display.map(d => d.entry)
    ;[entries[index], entries[target]] = [entries[target], entries[index]]
    this.setFaqCuration(slug, entries)
  },

  toggleFaqEntry(slug, id) {
    const display = this.getFaqDisplay(slug)
    const entries = display.map(d => d.entry.id === id ? { ...d.entry, enabled: d.entry.enabled === false } : d.entry)
    this.setFaqCuration(slug, entries)
  },

  addLocalFaqItem(slug) {
    const item = { id: `lfaq-${slug}-${Date.now()}`, q: '', a: '' }
    if (!_draft.faq) _draft.faq = {}
    _draft.faq[slug] = [...(_draft.faq[slug] || []), item]
    // Append to curation
    const entries = this.getFaqDisplay(slug).map(d => d.entry)
    if (!entries.find(e => e.id === item.id)) entries.push({ id: item.id, source: 'local', enabled: true })
    if (!_draft.faqCuration) _draft.faqCuration = {}
    _draft.faqCuration = { ..._draft.faqCuration, [slug]: entries }
    writeJSON(DRAFT_KEY, _draft)
    notify()
    return item
  },

  updateLocalFaqItem(slug, id, updates) {
    _draft.faq[slug] = (_draft.faq[slug] || []).map(it => it.id === id ? { ...it, ...updates } : it)
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  deleteLocalFaqItem(slug, id) {
    _draft.faq[slug] = (_draft.faq[slug] || []).filter(it => it.id !== id)
    if (_draft.faqCuration?.[slug]) {
      _draft.faqCuration = {
        ..._draft.faqCuration,
        [slug]: _draft.faqCuration[slug].filter(e => e.id !== id),
      }
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Activity Categories (data-driven, admin can add more) ─────────────────

  getActivityCategories() {
    return _draft?.activityCategories || ACTIVITY_CATEGORIES
  },

  addActivityCategory(label) {
    const trimmed = (label || '').trim()
    if (!trimmed) return { error: 'Category name is required.' }
    const key = `cat-${trimmed.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')}-${Date.now().toString(36)}`
    const cats = _draft.activityCategories || JSON.parse(JSON.stringify(ACTIVITY_CATEGORIES))
    const palette = CATEGORY_PALETTE[cats.length % CATEGORY_PALETTE.length]
    const cat = { key, label: trimmed, ...palette }
    _draft.activityCategories = [...cats, cat]
    // Initialize empty curation bucket for every property
    const allSlugs = (_draft.propertyList || []).map(p => p.slug)
    for (const slug of allSlugs) {
      if (!_draft.propertyCuration) _draft.propertyCuration = {}
      if (!_draft.propertyCuration[slug]) continue
      _draft.propertyCuration[slug] = { ..._draft.propertyCuration[slug], [key]: [] }
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
    return { category: cat }
  },

  renameActivityCategory(key, label) {
    _draft.activityCategories = (_draft.activityCategories || []).map(c =>
      c.key === key ? { ...c, label } : c
    )
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  deleteActivityCategory(key) {
    const inUse = (_draft.activities || []).filter(a => a.category === key).length
    if (inUse > 0) {
      return { error: `This category still has ${inUse} activit${inUse === 1 ? 'y' : 'ies'}. Move or delete them first.` }
    }
    _draft.activityCategories = (_draft.activityCategories || []).filter(c => c.key !== key)
    for (const slug of Object.keys(_draft.propertyCuration || {})) {
      if (_draft.propertyCuration[slug][key]) {
        const { [key]: _, ...rest } = _draft.propertyCuration[slug]
        _draft.propertyCuration[slug] = rest
      }
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
    return {}
  },

  // ── Per-property guidebook section config ─────────────────────────────────

  getSectionConfig(slug) {
    return buildV3Sections(_draft, slug)
  },

  setSectionConfig(slug, sections) {
    if (!_draft.propertySectionConfig) _draft.propertySectionConfig = {}
    _draft.propertySectionConfig = {
      ..._draft.propertySectionConfig,
      [slug]: sections.map(s => ({
        key: s.key, enabled: s.enabled !== false,
        label: s.label, icon: s.icon, custom: s.custom || false,
      })),
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  addCustomSection(slug, label) {
    const trimmed = (label || '').trim()
    if (!trimmed) return { error: 'Section name is required.' }
    const key = `custom-${Date.now().toString(36)}`
    const sections = buildV3Sections(_draft, slug)
    sections.push({ key, label: trimmed, icon: 'article', custom: true, enabled: true })
    this.setSectionConfig(slug, sections)
    return { key }
  },

  removeCustomSection(slug, key) {
    const sections = buildV3Sections(_draft, slug).filter(s => s.key !== key)
    // Delete this property's blocks for the removed section
    _draft.blocks = (_draft.blocks || []).filter(
      b => !(b.sectionKey === key && b.type === 'property' && b.propertySlug === slug)
    )
    this.setSectionConfig(slug, sections)
  },

  // ── Global Activities ─────────────────────────────────────────────────────

  getActivities() { return _draft?.activities || [] },

  getActivitiesByCategory(category) {
    return (_draft?.activities || []).filter(a => a.category === category)
  },

  addActivity(data) {
    const id = `act-${Date.now()}`
    const activity = { id, name: '', description: '', address: '', phone: '', website: '', imageUrl: '', ...data }
    _draft.activities = [...(_draft?.activities || []), activity]

    // Add to all property curations as enabled at the end
    const allSlugs = (_draft.propertyList || []).map(p => p.slug)
    for (const slug of allSlugs) {
      if (!_draft.propertyCuration) _draft.propertyCuration = {}
      if (!_draft.propertyCuration[slug]) _draft.propertyCuration[slug] = {}
      const cat = activity.category
      if (!_draft.propertyCuration[slug][cat]) _draft.propertyCuration[slug][cat] = []
      const existing = _draft.propertyCuration[slug][cat]
      const maxOrder = existing.reduce((m, e) => Math.max(m, e.order || 0), -1)
      _draft.propertyCuration[slug][cat] = [...existing, { activityId: id, enabled: true, order: maxOrder + 1 }]
    }

    writeJSON(DRAFT_KEY, _draft)
    notify()
    return activity
  },

  updateActivity(id, updates) {
    _draft.activities = (_draft.activities || []).map(a => a.id === id ? { ...a, ...updates } : a)
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  deleteActivity(id) {
    _draft.activities = (_draft.activities || []).filter(a => a.id !== id)
    // Remove from all property curations
    const allSlugs = (_draft.propertyList || []).map(p => p.slug)
    for (const slug of allSlugs) {
      if (!_draft.propertyCuration?.[slug]) continue
      for (const cat of ACTIVITY_CATEGORIES.map(c => c.key)) {
        if (_draft.propertyCuration[slug][cat]) {
          _draft.propertyCuration[slug][cat] = _draft.propertyCuration[slug][cat].filter(e => e.activityId !== id)
        }
      }
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Per-property Activity Curation ─────────────────────────────────────────

  getPropertyCuration(slug) {
    if (_draft?.propertyCuration?.[slug]) return _draft.propertyCuration[slug]
    // Build default curation for this slug
    const curation = buildDefaultCurationForSlug(_draft?.activities || SEED_ACTIVITIES, _draft?.activityCategories || ACTIVITY_CATEGORIES)
    if (!_draft.propertyCuration) _draft.propertyCuration = {}
    _draft.propertyCuration[slug] = curation
    return curation
  },

  toggleActivityForProperty(slug, category, activityId) {
    if (!_draft.propertyCuration) _draft.propertyCuration = {}
    if (!_draft.propertyCuration[slug]) _draft.propertyCuration[slug] = buildDefaultCurationForSlug(_draft?.activities || SEED_ACTIVITIES, _draft?.activityCategories || ACTIVITY_CATEGORIES)
    const list = _draft.propertyCuration[slug][category] || []
    // Replace the slug object reference so React state updates detect the change
    _draft.propertyCuration[slug] = {
      ..._draft.propertyCuration[slug],
      [category]: list.map(e =>
        e.activityId === activityId ? { ...e, enabled: !e.enabled } : e
      ),
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  reorderPropertyCategory(slug, category, orderedIds) {
    if (!_draft.propertyCuration?.[slug]?.[category]) return
    const current = _draft.propertyCuration[slug][category]
    // Replace the slug object reference so React state updates detect the change
    _draft.propertyCuration[slug] = {
      ..._draft.propertyCuration[slug],
      [category]: orderedIds.map((id, i) => {
        const existing = current.find(e => e.activityId === id)
        return { activityId: id, enabled: existing?.enabled ?? true, order: i }
      }),
    }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Property Management ───────────────────────────────────────────────────

  getPropertiesList() {
    const list = _draft?.propertyList || BASE_PROPERTY_SLUGS.map(s => ({ slug: s, status: 'active' }))
    return list.map(p => ({
      slug: p.slug,
      status: p.status || 'active',
      deactivatedAt: p.deactivatedAt || null,
      name: _draft?.properties?.[p.slug]?.name || defaultProperties[p.slug]?.name || p.slug,
    }))
  },

  addProperty(data) {
    // Auto-generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    // Add to property list
    if (!_draft.propertyList) _draft.propertyList = BASE_PROPERTY_SLUGS.map(s => ({ slug: s, status: 'active' }))
    if (_draft.propertyList.find(p => p.slug === slug)) {
      return { error: 'A property with this name already exists.' }
    }
    _draft.propertyList = [..._draft.propertyList, { slug, status: 'active' }]

    // Set property info (blank — admin fills it in)
    if (!_draft.properties) _draft.properties = {}
    _draft.properties[slug] = {
      name: data.name,
      address: data.address || '',
      checkInTime: '4:00 PM',
      checkoutTime: '11:00 AM',
      maxGuests: 0,
      wifi: { network: '', password: '', notes: '' },
      ownerName: 'Joe Saari',
      ownerPhone: '+1 (608) 239-3574',
      ownerEmail: 'saari.joseph@gmail.com',
      checkInWelcome: DEFAULT_CHECKIN_WELCOME,
      checkInOfferText: DEFAULT_CHECKIN_OFFER,
      showPropertyCard: true,
      showWifiCard: true,
      showHostCard: true,
      checkInEnabled: true,
      showCheckoutTimeBanner: true,
    }

    // Initialize empty FAQ
    if (!_draft.faq) _draft.faq = {}
    _draft.faq[slug] = []

    // Initialize activity curation (all enabled)
    if (!_draft.propertyCuration) _draft.propertyCuration = {}
    _draft.propertyCuration[slug] = buildDefaultCurationForSlug(_draft?.activities || SEED_ACTIVITIES, _draft?.activityCategories || ACTIVITY_CATEGORIES)

    writeJSON(DRAFT_KEY, _draft)
    notify()
    return { slug }
  },

  setPropertyStatus(slug, status) {
    if (!_draft.propertyList) return
    _draft.propertyList = _draft.propertyList.map(p => {
      if (p.slug !== slug) return p
      // Track when deactivation happened — drives the 30-day delete cool-off
      if (status === 'inactive') return { ...p, status, deactivatedAt: new Date().toISOString() }
      const { deactivatedAt, ...rest } = p
      return { ...rest, status }
    })
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // Re-check credentials without touching the auth session (delete confirmation)
  verifyCredentials(email, password) {
    return email === 'joe@talo.ventures' && password === 'Mytalo@2026'
  },

  // Permanently removes a property and all its data from the draft.
  // Caller is responsible for the cool-off + credential checks.
  deleteProperty(slug) {
    _draft.propertyList = (_draft.propertyList || []).filter(p => p.slug !== slug)
    if (_draft.properties) delete _draft.properties[slug]
    if (_draft.faq) delete _draft.faq[slug]
    if (_draft.faqCuration) delete _draft.faqCuration[slug]
    if (_draft.propertyCuration) delete _draft.propertyCuration[slug]
    if (_draft.propertySections) delete _draft.propertySections[slug]
    if (_draft.propertyBlockOrder) delete _draft.propertyBlockOrder[slug]
    if (_draft.propertySectionConfig) delete _draft.propertySectionConfig[slug]
    if (_draft.disabledBlocks) delete _draft.disabledBlocks[slug]
    if (_draft.propertyImageOverrides) delete _draft.propertyImageOverrides[slug]
    _draft.blocks = (_draft.blocks || []).filter(
      b => !(b.type === 'property' && b.propertySlug === slug)
    )
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Per-property Section Management ───────────────────────────────────────

  getPropertySections(slug) {
    return _draft?.propertySections?.[slug] || [...DEFAULT_V3_SECTIONS]
  },

  setPropertySections(slug, sections) {
    if (!_draft.propertySections) _draft.propertySections = {}
    _draft.propertySections[slug] = sections
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Publish / Discard ─────────────────────────────────────────────────────

  publish() {
    _live = JSON.parse(JSON.stringify(_draft))
    writeJSON(ADMIN_V3_LIVE_KEY, _live)
    // Mirror to V2 live so `contentStore` (which reads V2) sees it on fresh
    // page loads.
    try {
      const v2Live = readJSON('talo_admin_v2_live') || {}
      writeJSON('talo_admin_v2_live', { ...v2Live, blocks: _live.blocks })
    } catch (e) { /* ignore */ }
    // Push to Firestore so the real-time listener doesn't overwrite our
    // changes with stale server data on the next page load. Fire and forget.
    pushToFirestore(_live)
    contentStore.reloadFromLive(_live.blocks)
    notify()
  },

  discardDraft() {
    _draft = _live ? JSON.parse(JSON.stringify(_live)) : buildDefaultDraft()
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Subscriptions ─────────────────────────────────────────────────────────

  subscribe(fn) {
    _listeners.push(fn)
    return () => { _listeners = _listeners.filter(l => l !== fn) }
  },
}
