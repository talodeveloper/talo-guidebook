import { contentStore } from './contentStore'
import { properties as defaultProperties } from './properties'
import { FAQ_DATA as defaultFaq } from './faqData'
import { db } from '../firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { adminSignIn, adminSignOut, verifyAdminPassword } from './auth'
import { clearSession } from './sessionStore'
import { fsPaths, getTenantId, DEFAULT_TENANT_ID } from './tenant'

// Push a live snapshot to Firestore so the cross-tab/cross-session listener
// can't overwrite our changes with stale data. Best-effort — failure here
// must not block the local publish, since the local data is already saved.
async function pushToFirestore(live, updatedAt = Date.now()) {
  // Tenant-scoped write ONLY. The previous global v2_content/blocks + /properties
  // writes leaked one tenant's content into the shared legacy docs (cross-tenant
  // pollution) — removed. firebaseSync reads tenants/{tid}/data/live as primary.
  // JSON round-trip strips `undefined` (Firestore rejects undefined values).
  const clean = JSON.parse(JSON.stringify(live))
  await setDoc(doc(db, ...fsPaths.tenantDataLive()), { data: clean, updatedAt })
}

export const ADMIN_V3_LIVE_KEY = 'talo_admin_v3_live'
const DRAFT_KEY = 'talo_admin_v3_draft'
const AUTH_KEY = 'talo_admin_v3_auth'
const LOADED_AT_KEY    = 'talo_admin_v3_loaded_at'    // persisted remote timestamp we loaded from
const PUBLISHED_AT_KEY = 'talo_admin_v3_published_at' // cross-tab broadcast after each publish

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

export const DEFAULT_CHECKIN_OFFER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. (Edit this in Property Info to add your own check-in offer or message for guests — or clear it to hide this banner.)"

// ── Starter template ─────────────────────────────────────────────────────────
// Generic, editable placeholder content used by loadStarterTemplate() so a new
// property starts as a fully-shaped guidebook the admin reshapes, rather than a
// blank page. All text is obviously-a-placeholder and all images point at the
// bundled section placeholders in /public/images/template/. Contains NO real
// property data — safe to apply to any tenant.
const TPL_IMG = (name, caption) => [{ src: `/images/template/${name}.svg`, caption }]
const TEMPLATE_SECTIONS = [
  { sectionKey: 'welcome', title: 'Welcome!',
    body: `<p>Welcome, and thank you for booking with us! We're thrilled to host you. This guidebook has everything you'll need for a smooth, comfortable stay — from getting in the door to our favorite local spots.</p><p><em>Replace this with your own warm welcome message.</em></p>`,
    img: TPL_IMG('welcome', 'Your property — add a photo') },
  { sectionKey: 'entry', title: 'Getting Inside',
    body: `<ol><li>Head to the main entrance.</li><li>Your access code will be sent to you on the day of check-in.</li><li>Enter the code on the keypad.</li><li>The door will unlock — welcome home!</li></ol><p><em>Edit these steps to match your property's entry.</em></p>`,
    img: TPL_IMG('entry', 'Entrance — add a photo') },
  { sectionKey: 'parking', title: 'Parking',
    body: `<p>Free street parking is usually available right out front. There is also a driveway spot for one vehicle.</p><p><em>Update with your property's real parking details.</em></p>`,
    img: TPL_IMG('parking', 'Parking — add a photo') },
  { sectionKey: 'wifi', title: 'Wi-Fi',
    body: `<p>The Wi-Fi network name and password are on the Property Info card. If you have any trouble connecting, just reach out to your host.</p><p><em>Set your network name and password in Property Info.</em></p>`,
    img: TPL_IMG('wifi', 'Wi-Fi — add a photo of your router if helpful') },
  { sectionKey: 'house_rules', title: 'Quiet Hours',
    body: `<p>Please keep noise to a minimum between <strong>10:00 PM and 8:00 AM</strong> out of respect for our neighbors.</p><p><em>Edit or remove this rule as needed.</em></p>`, img: [] },
  { sectionKey: 'house_rules', title: 'No Smoking',
    body: `<p>This is a strictly non-smoking property, indoors and out. A cleaning fee applies if smoking is detected.</p><p><em>Edit or remove this rule as needed.</em></p>`, img: [] },
  { sectionKey: 'the_home', title: 'Living Space',
    body: `<p>Relax in the comfortable living area with plenty of seating and a smart TV. Extra blankets are in the closet.</p><p><em>Describe your living space and add real photos.</em></p>`,
    img: TPL_IMG('livingroom', 'Living space — add a photo') },
  { sectionKey: 'the_home', title: 'Kitchen',
    body: `<p>The kitchen is fully equipped with everything you need to cook — cookware, dishes, coffee maker, and basic spices.</p><p><em>List what your kitchen offers and add photos.</em></p>`,
    img: TPL_IMG('kitchen', 'Kitchen — add a photo') },
  { sectionKey: 'additional_space', title: 'Bedrooms',
    body: `<p>Rest easy in our comfortable bedrooms with fresh linens and ample closet space.</p><p><em>Describe your bedrooms and add photos.</em></p>`,
    img: TPL_IMG('bedroom', 'Bedroom — add a photo') },
  { sectionKey: 'outdoor_spaces', title: 'Outdoor Space',
    body: `<p>Enjoy the outdoor area — perfect for morning coffee or evening relaxation.</p><p><em>Describe your patio, yard, or balcony and add photos.</em></p>`,
    img: TPL_IMG('outdoor', 'Outdoor space — add a photo') },
  { sectionKey: 'services_maintenance', title: 'Trash, Recycling & Essentials',
    body: `<p>Trash and recycling bins are located outside. Collection day is typically mid-week. Cleaning supplies are under the sink.</p><p><em>Update with your property's specifics.</em></p>`,
    img: TPL_IMG('services', 'Add a photo if helpful') },
  { sectionKey: 'transport', title: 'Getting Around',
    body: `<p>Rideshare and taxis are readily available. The nearest transit stop is a short walk away, and the area is very walkable.</p><p><em>Add local transport options guests will find useful.</em></p>`,
    img: TPL_IMG('transport', 'Getting around — add a photo') },
  { sectionKey: 'checkout', title: 'Before You Go',
    body: `<ol><li>Start the dishwasher if it's full.</li><li>Take out any trash to the outside bins.</li><li>Turn off all lights and the AC/heat.</li><li>Close and lock all windows and doors.</li><li>Leave the keys where you found them.</li></ol><p><em>Edit this checklist to match your check-out steps.</em></p>`,
    img: [] },
]
const TEMPLATE_FAQ = [
  { q: 'What time is check-in and check-out?', a: 'Check-in is at 4:00 PM and check-out is at 11:00 AM. Edit these times in Property Info.' },
  { q: 'Is early check-in or late check-out available?', a: 'Reach out to your host — we\'ll do our best to accommodate based on the schedule.' },
  { q: 'Where do I park?', a: 'See the Parking section of this guidebook for details.' },
]

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
    // Optional per-property V3 hero banner. When null, the global default
    // hero (newhero.png / nightview.png) renders instead. Named v3HeroImage
    // to avoid colliding with the legacy `heroImage` field on V1/V2 property
    // data, which points at interior photos used by older guidebook versions.
    v3HeroImage: null,
    v3HeroImageNight: null,
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
    // Global hero banner — fallback when a property has no v3HeroImage set.
    // Each field is null until admin uploads, in which case the built-in
    // /images/newhero.png and /images/nightview.png are used.
    globalHero: { day: null, dayPath: null, night: null, nightPath: null },
    // Global guidebook logo — shown in the guidebook header across all this
    // tenant's properties. `image` = uploaded logo URL, else `wordmark` text,
    // else nothing is shown.
    globalLogo: { image: null, imagePath: null, wordmark: '' },
    // Global host contact info — one host card shown in every guidebook.
    globalHostInfo: { ownerName: '', ownerPhone: '', ownerEmail: '', showHostCard: true },
  }
}

// A blank workspace for a genuinely new tenant. NEW tenants must start empty —
// they must NOT inherit the built-in TALO seed content (which is what
// buildDefaultDraft returns). Marked `__fromDefaults` so the publish guard
// knows this draft did not come from the tenant's own real data.
function buildEmptyDraft() {
  return {
    blocks: [],
    properties: {},
    faq: {},
    activities: [],
    propertyCuration: {},
    propertyList: [],
    propertySections: {},
    globalHero: { day: null, dayPath: null, night: null, nightPath: null },
    // Global guidebook logo — shown in the guidebook header across all this
    // tenant's properties. `image` = uploaded logo URL, else `wordmark` text,
    // else nothing is shown.
    globalLogo: { image: null, imagePath: null, wordmark: '' },
    // Global host contact info — one host card shown in every guidebook.
    globalHostInfo: { ownerName: '', ownerPhone: '', ownerEmail: '', showHostCard: true },
    activityCategories: JSON.parse(JSON.stringify(ACTIVITY_CATEGORIES)),
    __fromDefaults: true,
  }
}

// Count uploaded (Firebase Storage) images anywhere in a dataset. Used as the
// publish safety signal: built-in/default content references only bundled
// /photos/ images (count 0), whereas a tenant's real published content has
// uploaded images (count > 0).
function uploadedImageCount(obj) {
  try { return (JSON.stringify(obj).match(/firebasestorage/g) || []).length }
  catch { return 0 }
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

// Ensure FAQ items have stable ids + global FAQ containers exist.
// IDs are derived deterministically (slug + index) rather than randomly, so
// running this on two separate copies of the same underlying data (e.g. once
// for _draft, once for _live) always produces IDENTICAL output — required for
// hasUnsavedChanges()'s exact-equality comparison to be meaningful.
function migrateFaqStructures(draft, persistKey = DRAFT_KEY) {
  if (!draft) return draft
  let changed = false
  if (!draft.globalFaq)   { draft.globalFaq = [];   changed = true }
  if (!draft.faqCuration) { draft.faqCuration = {}; changed = true }
  if (draft.faq) {
    for (const slug of Object.keys(draft.faq)) {
      draft.faq[slug] = (draft.faq[slug] || []).map((it, i) => {
        if (!it.id) { changed = true; return { ...it, id: `lfaq-${slug}-${i}` } }
        return it
      })
    }
  }
  if (changed) writeJSON(persistKey, draft)
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
// _ready: true only once we hold AUTHORITATIVE data — a local working copy, the
// tenant's published content loaded from Firestore, or a confirmed brand-new
// tenant. Publishing is blocked until then, so a fresh browser/device can never
// overwrite live data with the built-in defaults (the bug that reverted live
// content when the admin was opened on a new origin with empty localStorage).
// _hydrating: true while we load from Firestore.
let _ready = false
let _hydrating = false
// Timestamp of the Firestore content we last loaded. Compared against Firestore's
// current updatedAt on each publish attempt — if Firestore is newer, another
// device/tab already published and this tab must reload before publishing.
let _loadedRemoteAt = null
// Cross-tab stale flag: set when another tab in the same browser publishes.
let _staleSession = false

function notify() { _listeners.forEach(fn => fn()) }

// Convert legacy shared blocks to per-property blocks. Three blocks were
// incorrectly type:'shared' (global) — each property now owns its own copy.
function migrateSharedToPropertyBlocks(draft) {
  if (!draft?.blocks) return draft
  const SHARED_IDS = ['getting-around-shared', 'checkout-instructions', 'checkout-legal']
  const slugs = (draft.propertyList || []).map(p => p.slug).filter(Boolean)
  if (!slugs.length) return draft

  let changed = false
  let blocks = [...draft.blocks]

  for (const sharedId of SHARED_IDS) {
    const idx = blocks.findIndex(b => b.id === sharedId && b.type === 'shared')
    if (idx === -1) continue

    const shared = blocks[idx]
    blocks.splice(idx, 1)
    changed = true

    for (const slug of slugs) {
      // Transport: skip properties that already have their own transport block
      if (shared.sectionKey === 'transport') {
        const hasOwn = blocks.some(
          b => b.sectionKey === 'transport' && b.type === 'property' && b.propertySlug === slug
        )
        if (hasOwn) continue
      }
      // Idempotent: skip if migrated copy already exists
      if (blocks.some(b => b.id === `${sharedId}-${slug}`)) continue

      blocks.push({ ...shared, id: `${sharedId}-${slug}`, type: 'property', propertySlug: slug })
    }
  }

  return changed ? { ...draft, blocks } : draft
}

// Shared post-load processing: migrations + one-time backfills. Used for BOTH
// _draft and _live so the two stay in lockstep — any divergence here would
// make hasUnsavedChanges() (a strict JSON.stringify equality check) report a
// false "unpublished changes" even when nothing was actually edited, which is
// exactly the kind of confusion that risks someone publishing a stale/local
// snapshot over newer live content. persistKey controls which localStorage
// slot receives a migration's one-time backfill write (DRAFT_KEY when
// processing the draft, ADMIN_V3_LIVE_KEY when processing live).
function postProcessDraft(draft, persistKey = DRAFT_KEY) {
  draft = migrateFaqStructures(draft, persistKey)
  draft = migrateHawkBedroomImages(draft, persistKey)
  draft = migrateSharedToPropertyBlocks(draft)
  if (draft && !draft.activityCategories) {
    draft.activityCategories = JSON.parse(JSON.stringify(ACTIVITY_CATEGORIES))
  }
  if (draft && !draft.globalHostInfo) {
    draft.globalHostInfo = { ownerName: '', ownerPhone: '', ownerEmail: '', showHostCard: true }
  }
  if (draft?.propertyList?.some(p => p.status === 'inactive' && !p.deactivatedAt)) {
    draft.propertyList = draft.propertyList.map(p =>
      p.status === 'inactive' && !p.deactivatedAt
        ? { ...p, deactivatedAt: new Date().toISOString() }
        : p
    )
  }
  return draft
}

// When a browser has no local copy, load THIS tenant's published content from
// Firestore instead of treating the built-in defaults as publishable.
async function hydrateFromFirestore() {
  try {
    const snap = await getDoc(doc(db, ...fsPaths.tenantDataLive()))
    const full = snap.exists() ? snap.data()?.data : null
    const remoteAt = snap.exists() ? (snap.data()?.updatedAt || null) : null
    if (remoteAt) {
      _loadedRemoteAt = remoteAt
      try { localStorage.setItem(LOADED_AT_KEY, String(remoteAt)) } catch {}
    }
    if (full && Array.isArray(full.blocks) && full.blocks.length > 0) {
      // Real published content exists — adopt it as both live and draft.
      // _live goes through the SAME migration pipeline as _draft (just
      // persisting backfills to the live slot instead of the draft slot) so
      // the two are exactly comparable.
      _live = postProcessDraft(full, ADMIN_V3_LIVE_KEY)
      _draft = postProcessDraft(JSON.parse(JSON.stringify(_live)))
      writeJSON(ADMIN_V3_LIVE_KEY, _live)
      writeJSON(DRAFT_KEY, _draft)
      _ready = true
    } else {
      // Genuinely new tenant with nothing published yet — start BLANK (never the
      // TALO seed). Align _live with the empty draft so hasUnsavedChanges()
      // returns false until the user actually makes a real change.
      _draft = postProcessDraft(buildEmptyDraft())
      _live = JSON.parse(JSON.stringify(_draft))
      writeJSON(DRAFT_KEY, _draft)
      writeJSON(ADMIN_V3_LIVE_KEY, _live)
      _ready = true
    }
  } catch (err) {
    // Fail safe: keep publish disabled rather than risk clobbering live data.
    console.warn('[adminV3Store] could not load live content; publish stays disabled until reload', err)
    _ready = false
  } finally {
    _hydrating = false
    notify()
  }
}

_live = readJSON(ADMIN_V3_LIVE_KEY)
_draft = readJSON(DRAFT_KEY)

// Restore the remote timestamp we last loaded, so the staleness check works
// across page reloads without re-fetching Firestore.
try {
  const stored = localStorage.getItem(LOADED_AT_KEY)
  if (stored) _loadedRemoteAt = Number(stored)
} catch {}

// Cross-tab broadcast: when another tab in this browser publishes, mark this
// tab as stale so it can't silently overwrite with outdated content.
try {
  window.addEventListener('storage', (e) => {
    if (e.key === PUBLISHED_AT_KEY && e.newValue && e.storageArea === localStorage) {
      _staleSession = true
      notify()
    }
  })
} catch {}

// Self-heal contaminated storage: a NON-default tenant must never carry the
// TALO seed content. This happens to any browser that opened a new tenant's
// admin BEFORE the buildEmptyDraft fix (it persisted the TALO defaults). Detect
// the talo signature (talo's base property slugs) on a non-talo tenant, discard
// the local copy, and re-hydrate fresh (which yields a blank workspace).
if (
  getTenantId() !== DEFAULT_TENANT_ID &&
  Array.isArray(_draft?.propertyList) &&
  _draft.propertyList.some(p => BASE_PROPERTY_SLUGS.includes(p.slug))
) {
  _draft = null
  _live = null
  try { localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(ADMIN_V3_LIVE_KEY) } catch { /* ignore */ }
}

if (_draft) {
  // Fast path: a local working copy exists — trust it (unchanged behavior).
  _draft = migrateImages(_draft)
  _draft = postProcessDraft(_draft)
  // _live must go through the SAME pipeline (not just the Hawk fix) or it will
  // never be exactly comparable to _draft, causing hasUnsavedChanges() to
  // report false "unpublished changes" for edits that never happened.
  if (_live) _live = postProcessDraft(_live, ADMIN_V3_LIVE_KEY)
  writeJSON(DRAFT_KEY, _draft)
  _ready = true
} else if (_live) {
  // A published copy exists locally but no draft — derive the draft from it.
  _live = postProcessDraft(_live, ADMIN_V3_LIVE_KEY)
  _draft = postProcessDraft(JSON.parse(JSON.stringify(_live)))
  writeJSON(DRAFT_KEY, _draft)
  _ready = true
} else {
  // Fresh browser/device, empty localStorage. Render a blank placeholder (NOT
  // the TALO seed) but do NOT persist it or allow publishing — load real
  // content from Firestore first.
  _draft = buildEmptyDraft()
  _ready = false
  _hydrating = true
  hydrateFromFirestore()
}

export const adminV3Store = {
  isAuthenticated: () => localStorage.getItem(AUTH_KEY) === 'true',

  async login(email, password) {
    try {
      const { user } = await adminSignIn(email, password)
      const token = await user.getIdTokenResult(true)
      const accountTenantId = token.claims.tenantId
      const hostTenantId = getTenantId()

      // Wrong-workspace guard: the account's OWN tenant (from its Firebase
      // Auth custom claim, set at signup and immutable by the account holder)
      // must match the tenant implied by the CURRENT hostname. Without this,
      // a testrentals owner who mistakenly opens talo.talo.llc and signs in
      // with their own valid credentials would land inside TALO's admin
      // panel — hostname-based tenant resolution has no other way to know
      // the login "belongs" elsewhere. Reject and sign back out rather than
      // silently exposing/allowing edits to a different tenant's workspace.
      if (accountTenantId && accountTenantId !== hostTenantId) {
        await adminSignOut()
        return 'wrong-tenant'
      }

      // Check tenant status — deactivated/suspended see a payment wall, not the dashboard
      if (accountTenantId) {
        const snap = await getDoc(doc(db, 'tenants', accountTenantId))
        if (snap.exists()) {
          const status = snap.data().status
          if (status === 'deactivated' || status === 'suspended') {
            localStorage.setItem(AUTH_KEY, 'true')
            localStorage.setItem('talo_admin_v3_locked', status)
            return status // caller navigates to dashboard; Layout shows the wall
          }
        }
      }
      localStorage.removeItem('talo_admin_v3_locked')
      localStorage.setItem(AUTH_KEY, 'true')
      return true
    } catch {
      return false
    }
  },

  isLocked() {
    return localStorage.getItem('talo_admin_v3_locked') || null // 'deactivated' | 'suspended' | null
  },

  logout() {
    clearSession().catch(() => {})
    adminSignOut()
  },

  // True once authoritative data is loaded; false while loading from Firestore
  // on a fresh browser/device. The UI uses these to block publishing defaults.
  isReady: () => _ready,
  isHydrating: () => _hydrating,

  hasUnsavedChanges() {
    if (!_ready) return false
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
    if (JSON.stringify(_draft?.globalHero) !== JSON.stringify(_live?.globalHero)) {
      changes.push({ label: 'Global Hero Banner', property: 'Global' })
    }
    if (JSON.stringify(_draft?.globalLogo) !== JSON.stringify(_live?.globalLogo)) {
      changes.push({ label: 'Guidebook Logo', property: 'Global' })
    }
    if (JSON.stringify(_draft?.globalHostInfo) !== JSON.stringify(_live?.globalHostInfo)) {
      changes.push({ label: 'Host Information', property: 'Global' })
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

  // ── Global hero banner ─────────────────────────────────────────────────────

  getGlobalHero() {
    return _draft?.globalHero || { day: null, dayPath: null, night: null, nightPath: null }
  },

  setGlobalHero(updates) {
    _draft.globalHero = { ...(_draft.globalHero || {}), ...updates }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Global logo ────────────────────────────────────────────────────────────

  getGlobalLogo() {
    return _draft?.globalLogo || { image: null, imagePath: null, wordmark: '' }
  },

  setGlobalLogo(updates) {
    _draft.globalLogo = { ...(_draft.globalLogo || { image: null, imagePath: null, wordmark: '' }), ...updates }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Global host info ───────────────────────────────────────────────────────

  getGlobalHostInfo() {
    return _draft?.globalHostInfo || { ownerName: '', ownerPhone: '', ownerEmail: '', showHostCard: true }
  },

  setGlobalHostInfo(updates) {
    _draft.globalHostInfo = { ...(_draft.globalHostInfo || { ownerName: '', ownerPhone: '', ownerEmail: '', showHostCard: true }), ...updates }
    writeJSON(DRAFT_KEY, _draft)
    notify()
  },

  // ── Starter template ───────────────────────────────────────────────────────

  // A property is "empty" (safe to load the template onto) when it has no
  // content blocks and no FAQ items of its own.
  isPropertyEmpty(slug) {
    const hasBlocks = (_draft?.blocks || []).some(
      b => b.type === 'property' && b.propertySlug === slug
    )
    const hasFaq = ((_draft?.faq?.[slug]) || []).length > 0
    return !hasBlocks && !hasFaq
  },

  // Fill an EMPTY property with the generic starter template (placeholder text
  // + bundled placeholder images) so the admin can edit rather than build from
  // scratch. Refuses if the property already has any content, so it can never
  // clobber real work. Returns false if blocked, true on success.
  loadStarterTemplate(slug) {
    if (!this.isPropertyEmpty(slug)) return false
    if (!_draft.blocks) _draft.blocks = []

    // Track per-section order so multiple blocks in one section stack cleanly.
    const orderBySection = {}
    const now = Date.now()
    let n = 0
    for (const t of TEMPLATE_SECTIONS) {
      orderBySection[t.sectionKey] = (orderBySection[t.sectionKey] || 0) + 1
      _draft.blocks.push({
        id: `tmpl-${slug}-${now}-${n++}`,
        sectionKey: t.sectionKey,
        type: 'property',
        propertySlug: slug,
        title: t.title,
        body: t.body,
        images: JSON.parse(JSON.stringify(t.img || [])),
        order: orderBySection[t.sectionKey],
      })
    }

    // Seed a few starter FAQ items.
    if (!_draft.faq) _draft.faq = {}
    _draft.faq[slug] = TEMPLATE_FAQ.map((it, i) => ({
      id: `tmpl-faq-${slug}-${i}`, q: it.q, a: it.a,
    }))

    writeJSON(DRAFT_KEY, _draft)
    notify()
    return true
  },

  // Copy an existing, filled property's entire guidebook into an EMPTY property
  // so the admin starts from a full clone and edits the differences. Copies all
  // content (blocks, FAQ, section config, block ordering, disabled blocks,
  // activity curation, image overrides) plus host + display settings. Does NOT
  // copy the target's own name/address or its Wi-Fi. Blocks/FAQ get fresh ids
  // (re-pointed to the target); ordering/overrides/curation are remapped to
  // those new ids. Refuses unless target is empty and source has content.
  duplicateGuidebook(sourceSlug, targetSlug) {
    if (sourceSlug === targetSlug) return false
    if (!this.isPropertyEmpty(targetSlug)) return false
    if (this.isPropertyEmpty(sourceSlug)) return false
    const clone = (o) => (o == null ? o : JSON.parse(JSON.stringify(o)))
    const now = Date.now()

    // 1. Property content blocks → new ids, re-pointed to target
    const blockIdMap = {}
    let i = 0
    const srcBlocks = (_draft.blocks || []).filter(b => b.type === 'property' && b.propertySlug === sourceSlug)
    const newBlocks = srcBlocks.map(b => {
      const nid = `dup-${targetSlug}-${now}-${i++}`
      blockIdMap[b.id] = nid
      return { ...clone(b), id: nid, propertySlug: targetSlug }
    })
    _draft.blocks = [...(_draft.blocks || []), ...newBlocks]

    // 2. Block ordering (remap ids)
    if (_draft.propertyBlockOrder?.[sourceSlug]) {
      _draft.propertyBlockOrder = _draft.propertyBlockOrder || {}
      const remapped = {}
      for (const [sectionKey, ids] of Object.entries(_draft.propertyBlockOrder[sourceSlug])) {
        remapped[sectionKey] = ids.map(id => blockIdMap[id] || id)
      }
      _draft.propertyBlockOrder[targetSlug] = remapped
    }

    // 3. Disabled blocks (remap ids)
    if (_draft.disabledBlocks?.[sourceSlug]) {
      _draft.disabledBlocks = _draft.disabledBlocks || {}
      _draft.disabledBlocks[targetSlug] = _draft.disabledBlocks[sourceSlug].map(id => blockIdMap[id] || id)
    }

    // 4. Per-property image overrides (keyed by block id → remap keys)
    if (_draft.propertyImageOverrides?.[sourceSlug]) {
      _draft.propertyImageOverrides = _draft.propertyImageOverrides || {}
      const remapped = {}
      for (const [blockId, imgs] of Object.entries(_draft.propertyImageOverrides[sourceSlug])) {
        remapped[blockIdMap[blockId] || blockId] = clone(imgs)
      }
      _draft.propertyImageOverrides[targetSlug] = remapped
    }

    // 5. Section config (section keys are stable — copy as-is)
    if (_draft.propertySectionConfig?.[sourceSlug]) {
      _draft.propertySectionConfig = _draft.propertySectionConfig || {}
      _draft.propertySectionConfig[targetSlug] = clone(_draft.propertySectionConfig[sourceSlug])
    }

    // 6. Activity curation (activity ids are stable — copy as-is)
    if (_draft.propertyCuration?.[sourceSlug]) {
      _draft.propertyCuration = _draft.propertyCuration || {}
      _draft.propertyCuration[targetSlug] = clone(_draft.propertyCuration[sourceSlug])
    }

    // 7. Local FAQ → new ids, with curation remap
    const faqIdMap = {}
    if (_draft.faq?.[sourceSlug]?.length) {
      _draft.faq = _draft.faq || {}
      _draft.faq[targetSlug] = _draft.faq[sourceSlug].map((it, idx) => {
        const nid = `dup-faq-${targetSlug}-${now}-${idx}`
        faqIdMap[it.id] = nid
        return { ...clone(it), id: nid }
      })
    }
    if (_draft.faqCuration?.[sourceSlug]) {
      _draft.faqCuration = _draft.faqCuration || {}
      _draft.faqCuration[targetSlug] = _draft.faqCuration[sourceSlug].map(e =>
        e.source === 'local' ? { ...e, id: faqIdMap[e.id] || e.id } : { ...e }
      )
    }

    // 8. Property info — host + display settings only (keep target's own
    //    name/address/Wi-Fi and operational fields).
    const src = _draft.properties?.[sourceSlug]
    if (src) {
      _draft.properties = _draft.properties || {}
      _draft.properties[targetSlug] = {
        ...(_draft.properties[targetSlug] || {}),
        ownerName: src.ownerName, ownerPhone: src.ownerPhone, ownerEmail: src.ownerEmail,
        showPropertyCard: src.showPropertyCard, showWifiCard: src.showWifiCard, showHostCard: src.showHostCard,
        checkInEnabled: src.checkInEnabled, showCheckoutTimeBanner: src.showCheckoutTimeBanner,
        checkInWelcome: src.checkInWelcome, checkInOfferText: src.checkInOfferText,
      }
    }

    writeJSON(DRAFT_KEY, _draft)
    notify()
    return true
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
  async verifyCredentials(email, password) {
    return verifyAdminPassword(email, password)
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

  async publish() {
    // Safety: never publish before authoritative data is loaded — this stops a
    // fresh browser/device from overwriting live content with defaults.
    if (!_ready) {
      console.warn('[adminV3Store] publish blocked — content not loaded yet')
      return false
    }
    // Hard safety net against the recurring data-loss bug: refuse to overwrite
    // real published content with defaults/blank. Built-in/default content has
    // ZERO uploaded (firebasestorage) images; a tenant's real content has them.
    // If Firestore already has uploads but this draft has none, it's a defaults
    // revert (e.g. a stale tab) — block it, no matter how the draft got stale.
    try {
      const snap = await getDoc(doc(db, ...fsPaths.tenantDataLive()))
      const remoteData = snap.exists() ? snap.data()?.data : null
      const remoteAt   = snap.exists() ? (snap.data()?.updatedAt || null) : null
      // Block if Firestore has been updated since this tab last loaded — another
      // device or tab already published. Reload first to get the latest content.
      if (remoteAt && _loadedRemoteAt && remoteAt > _loadedRemoteAt) {
        console.warn('[adminV3Store] publish BLOCKED — content updated remotely since this tab loaded')
        return 'blocked-stale'
      }
      // Block if this draft would wipe out uploaded images that live in Firestore.
      if (remoteData && uploadedImageCount(remoteData) > 0 && uploadedImageCount(_draft) === 0) {
        console.warn('[adminV3Store] publish BLOCKED — would revert live uploaded images to defaults')
        return 'blocked-defaults'
      }
    } catch (err) {
      console.warn('[adminV3Store] publish precheck failed — blocking to be safe', err)
      return 'blocked-error'
    }
    _live = JSON.parse(JSON.stringify(_draft))
    writeJSON(ADMIN_V3_LIVE_KEY, _live)
    // Mirror to V2 live so `contentStore` (which reads V2) sees it on fresh
    // page loads.
    try {
      const v2Live = readJSON('talo_admin_v2_live') || {}
      writeJSON('talo_admin_v2_live', { ...v2Live, blocks: _live.blocks })
    } catch (e) { /* ignore */ }
    // Record when we published so the staleness check works on next attempt.
    const publishedAt = Date.now()
    _loadedRemoteAt = publishedAt
    try {
      localStorage.setItem(LOADED_AT_KEY, String(publishedAt))
      // Broadcast to other tabs in this browser — they'll mark themselves stale.
      localStorage.setItem(PUBLISHED_AT_KEY, String(publishedAt))
    } catch {}
    // Push to Firestore — awaited so the UI only shows success after the write
    // actually lands. A failed push would leave other browsers on stale data.
    try {
      await pushToFirestore(_live, publishedAt)
    } catch (err) {
      // Roll back the local state so the admin reflects the truth.
      _live = readJSON(ADMIN_V3_LIVE_KEY) || null
      _loadedRemoteAt = null
      try { localStorage.removeItem(LOADED_AT_KEY) } catch {}
      notify()
      return 'firestore-error'
    }
    contentStore.reloadFromLive(_live.blocks)
    notify()
    return true
  },

  discardDraft() {
    if (_live) {
      _draft = postProcessDraft(JSON.parse(JSON.stringify(_live)))
      writeJSON(DRAFT_KEY, _draft)
    } else {
      // No published data yet — reset draft to empty and align _live so
      // hasUnsavedChanges() returns false (banner disappears after discard).
      _draft = buildEmptyDraft()
      _live = JSON.parse(JSON.stringify(_draft))
      writeJSON(DRAFT_KEY, _draft)
      writeJSON(ADMIN_V3_LIVE_KEY, _live)
    }
    notify()
  },

  isStaleSession: () => _staleSession,

  /**
   * Called when the stale-session banner's "Reload" button is clicked.
   * Re-hydrates _live and _draft from Firestore (fresh content + timestamp).
   * Clears the stale flag. Does not require a page reload.
   * Preserves the same pipeline as the initial load — this is the correct
   * response to a stale warning: get the real content, not just the timestamp.
   */
  async syncRemoteAt() {
    _staleSession = false
    _hydrating = true
    _ready = false
    notify()
    await hydrateFromFirestore()
  },

  /**
   * Called after a force-logout login: wipes localStorage content state and
   * re-hydrates from Firestore so _loadedRemoteAt is correct and the publish
   * check doesn't false-alarm.
   */
  async forceReset() {
    _draft = null
    _live = null
    _loadedRemoteAt = null
    _staleSession = false
    _ready = false
    _hydrating = true
    try {
      localStorage.removeItem(DRAFT_KEY)
      localStorage.removeItem(ADMIN_V3_LIVE_KEY)
      localStorage.removeItem(LOADED_AT_KEY)
      localStorage.removeItem(PUBLISHED_AT_KEY)
    } catch {}
    notify()
    await hydrateFromFirestore()
  },

  // ── Read-only helpers (used by guidebook side, not just admin) ────────────

  // Reads the published global hero from V3 live; falls back to draft so
  // newly-uploaded heroes preview correctly before publish.
  readPublishedGlobalHero() {
    const src = _live?.globalHero || _draft?.globalHero
    return src || { day: null, dayPath: null, night: null, nightPath: null }
  },

  // ── Subscriptions ─────────────────────────────────────────────────────────

  subscribe(fn) {
    _listeners.push(fn)
    return () => { _listeners = _listeners.filter(l => l !== fn) }
  },
}
