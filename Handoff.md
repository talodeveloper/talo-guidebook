# Talo Guidebook — Session Handoff

> **Last updated: End of Session 3**
> Session 1 — Built full V2 UI (approved)
> Session 2 — FAQ layout, hero tweaks, Vista Pointe photo mapping
> Session 3 — Jackson Street photo mapping
> Everything below is confirmed, saved to disk, and working.

---

## 1. Project Overview

**What it is:** React SPA guest guidebook for TALO Rentals (San Diego short-term rentals, owner: Joe Saari). Digital house manual for 4 properties.

**Tech stack:** React 19 · React Router v7 · Vite 8 (port `5175`, `strictPort: true`) · Tailwind CSS v3 · No backend — all data in JS files + localStorage

**Dev server:** `npm run dev` → `http://localhost:5175`

**V2 guidebook URLs:**
| Property | URL |
|---|---|
| Reynard Way | http://localhost:5175/v2/reynard-way |
| Hawk Street | http://localhost:5175/v2/hawk-street |
| Jackson Street | http://localhost:5175/v2/jackson-st |
| Vista Pointe | http://localhost:5175/v2/vista-pointe |

> ⛔ **V1** lives at `/:slug` — **NEVER TOUCH IT.**

---

## 2. Status

### ✅ Done
- Full V2 UI (terracotta day / indigo-purple night, 3-col layout, flip cards, FAQ, checkout, night mode toggle)
- Vista Pointe — all photos mapped ✅
- Jackson Street — all photos mapped ✅
- Local Guide & Things To Do — real photos (starbucks, genteel, target, sprouts, ralphs, moes, paddle, fashion valley, palm canyon)
- Checkout page — post-checkout CTA linking to `https://talo.rentals/`
- localStorage key → **`talo_content_blocks_v8`**

### 🔲 Remaining (in order)
1. **Photo mapping — Reynard Way** (Joe opens Airbnb listing in Chrome, shares URL → follow Section 7)
2. **Photo mapping — Hawk Street** (same process)
3. **GitHub Pages deployment** → Section 8
4. **Admin panel** — confirm with Joe whether `/admin` should be accessible in production

---

## 3. File Structure

```
talo-guidebook/
├── public/
│   ├── images/
│   │   ├── beach-hero.png          ← Day hero (1877×838)
│   │   ├── nightview.png           ← Night hero (2172×388, letterboxed & cropped)
│   │   ├── talo-logo.png           ← Logo (1536×1024, 3:2, no transparent padding)
│   │   └── local/                  ← Shared local guide photos
│   │       starbucks.png · genteel-coffee.jpg · target.jpg · sprouts.jpg
│   │       ralphs.jpg · moes-coffee.jpg · paddle.jpg · fashion-valley.jpg · palm-canyon.jpg
│   └── photos/
│       ├── reynard-way/            ← 🔲 Still needs photo mapping
│       ├── hawk-street/            ← 🔲 Still needs photo mapping
│       ├── jackson-st/             ← ✅ 59 files, UUID-named .jpeg/.png
│       └── vista-pointe/           ← ✅ 82 files, UUID-named .jpeg
│
├── src/
│   ├── App.jsx                     ← Router (V1 at /:slug, V2 at /v2/:slug)
│   ├── data/
│   │   ├── properties.js           ← 4 property configs (name, address, wifi, host)
│   │   ├── contentStore.js         ← ★ STORAGE_KEY = 'talo_content_blocks_v8'
│   │   ├── sections.js             ← Section key/label/icon definitions
│   │   ├── faqData.js              ← FAQ Q&A per property slug
│   │   └── adminStore.js           ← Admin only — DO NOT TOUCH
│   ├── components/Icon.jsx         ← Google Material Icons wrapper
│   └── guidebook/
│       ├── Checkout.jsx            ← Shared by V1 + V2
│       ├── GuidebookLayout.jsx     ← V1 — DO NOT EDIT
│       ├── GuidebookPage.jsx       ← V1 — DO NOT EDIT
│       └── v2/
│           ├── V2GuidebookLayout.jsx  ← Owns nightMode state + passes via Outlet context
│           ├── V2GuidebookPage.jsx    ← Main V2 page; exports NightModeCtx + V2RightSidebar
│           └── V2FAQPage.jsx          ← 3-col FAQ page; imports from V2GuidebookPage
├── .claude/launch.json             ← Dev server config (port 5175)
└── Handoff.md                      ← This file
```

---

## 4. Key Architecture & Design Decisions

### 4.1 Hero Section

```jsx
// Outer div — NO overflow:hidden (logo intentionally floats above)
<div className="relative w-full" style={{
  height: 'clamp(170px, 20vw, 260px)',
  backgroundColor: nightMode ? '#0B1120' : '#FFF7ED',
}}>
  {/* Background clips inside nested div */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0" style={{
      backgroundImage: `url(${t.HERO_IMG})`,   // switches day/night
      backgroundSize: 'cover', backgroundPosition: 'center',
    }} />
  </div>

  {/* Night/Day toggle — top right */}
  <button onClick={toggleNightMode} className="absolute top-3 right-4 z-20 ...">
    <Icon name={nightMode ? 'light_mode' : 'dark_mode'} /> {nightMode ? 'Day' : 'Night'}
  </button>

  {/* Logo — absolute top-left, translateY(-30%) floats it above hero boundary */}
  <div className="absolute z-10" style={{
    top: 10, left: 10,
    width: 'clamp(180px, 40%, 480px)',
    transform: 'translateY(-30%)',
  }}>
    <img src="/images/talo-logo.png"
      style={{ width:'100%', height:'auto', maxHeight:240,
               filter:'drop-shadow(0 2px 14px rgba(0,0,0,0.9))' }} />
  </div>

  {/* "Guidebook" + property name — absolutely centered */}
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4">
    <p style={{ fontSize:'clamp(11px,1.4vw,14px)', fontWeight:700, letterSpacing:'0.22em',
                textTransform:'uppercase', color:'rgba(255,255,255,0.92)',
                textShadow:'0 1px 6px rgba(0,0,0,0.9)' }}>Guidebook</p>
    <h1 style={{ fontSize:'clamp(18px,3vw,32px)', fontWeight:800,
                 color:'#fff', textShadow:'0 2px 10px rgba(0,0,0,0.9)' }}>{property.name}</h1>
  </div>
</div>
```

**Why:** No gradient overlay (client wanted raw images). Logo `translateY(-30%)` is intentional — pops above hero. Background clips inside nested div so logo can overflow without clipping.

**Hero images:**
- Day: `/images/beach-hero.png` (1877×838)
- Night: `/images/nightview.png` (2172×388) — cropped from 2172×724; original had 168px white letterboxing top+bottom (removed with Pillow)

---

### 4.2 Night Mode Architecture

State lives in **`V2GuidebookLayout.jsx`**, persisted to `localStorage('talo_night_mode')`.

```jsx
// Layout passes down via outlet context:
<Outlet context={{ property: activeProperty, nightMode, toggleNightMode }} />

// All child pages consume:
const { property, nightMode, toggleNightMode } = useOutletContext()
```

Theme propagates inside `V2GuidebookPage.jsx` via React Context:

```jsx
export const NightModeCtx = React.createContext(false)  // EXPORTED

function useTheme() {
  const night = React.useContext(NightModeCtx)
  return {
    SUNSET:  night ? 'linear-gradient(135deg,#1E1B4B,#312E81,#4F46E5,#7C3AED)' : SUNSET,
    CARD_BG: night ? '#111827' : '#FFFFFF',
    BG:      night ? '#0B1120' : '#FFF7ED',
    PRIMARY: night ? '#818CF8' : '#C84B31',
    TEXT:    night ? '#E2E8F0' : '#1C0F06',
    MUTED:   night ? '#94A3B8' : '#78716C',
    BORDER:  night ? 'rgba(99,102,241,0.20)' : 'rgba(200,80,50,0.12)',
    // ... OCEAN, PRIMARY_D, CORAL
  }
}
// Every sub-component calls: const { PRIMARY, BORDER, ... } = useTheme()
```

`NightModeCtx` + `V2RightSidebar` are **exported** from `V2GuidebookPage.jsx` so `V2FAQPage.jsx` can import them.

---

### 4.3 Themes at a Glance

**Day palette:**
```
SUNSET    = linear-gradient(135deg, #7C2D12 → #C84B31 → #EA580C → #F97316 → #FCD34D)
OCEAN     = linear-gradient(135deg, #0C4A6E → #0369A1 → #0284C7)
BG=#FFF7ED  PRIMARY=#C84B31  TEXT=#1C0F06  MUTED=#78716C  BORDER=rgba(200,80,50,0.12)
```

**Night palette:**
```
N_SUNSET  = linear-gradient(135deg, #1E1B4B → #312E81 → #4F46E5 → #7C3AED)
N_OCEAN   = linear-gradient(135deg, #0B1120 → #0C2550 → #1E3A8A)
BG=#0B1120  CARD=#111827  PRIMARY=#818CF8  TEXT=#E2E8F0  MUTED=#94A3B8  BORDER=rgba(99,102,241,0.20)
```

---

### 4.4 Critical Rules (Don't Break These)

1. **Never use Tailwind `divide-y`** in sections — hard-codes a white border in night mode. Use:
   ```jsx
   {blocks.map((block, idx) => (
     <div key={block.id} className="pt-5"
       style={{ borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}` }}>
   ```

2. **`Checkout.jsx` back-button** uses `useLocation()` to detect V1 vs V2:
   ```jsx
   const isV2 = location.pathname.startsWith('/v2/')
   const backPath = isV2 ? `/v2/${slug}` : `/${slug}`
   ```

3. **`V2RightSidebar`** requires `mapsUrl` prop — always pass it:
   ```jsx
   const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(property.address)}`
   <V2RightSidebar property={property} slug={slug} mapsUrl={mapsUrl} />
   ```

4. **localStorage key** — bump it (`v8` → `v9`) whenever you make bulk content changes in `contentStore.js`, so all browsers re-init from fresh seed data.

5. **`BlockImages` component** uses `object-cover` with `maxHeight`. Do NOT change to `object-contain` — tested and looks bad.

---

### 4.5 Routing

```jsx
// V1 (never touch)
<Route path="/:slug" element={<GuidebookLayout />}>
  <Route index element={<GuidebookPage />} />
  <Route path="checkout" element={<Checkout />} />
</Route>

// V2 (active)
<Route path="/v2/:slug" element={<V2GuidebookLayout />}>
  <Route index element={<V2GuidebookPage />} />
  <Route path="faq" element={<V2FAQPage />} />
  <Route path="checkout" element={<Checkout />} />
</Route>
```

---

### 4.6 FAQ Page (`V2FAQPage.jsx`)

- **3-column layout** matching home page (left TOC · center accordion · right sidebar)
- Left TOC links to home page sections via `Link to={/v2/${slug}}`
- Center: single-column accordion (one Q per row)
- Imports `NightModeCtx` + `V2RightSidebar` from `V2GuidebookPage.jsx`
- FAQ data in `src/data/faqData.js` keyed by slug

---

### 4.7 ContentStore Block Schema

```js
{
  id: 'unique-id',
  sectionKey: 'parking',          // matches sections.js key
  type: 'shared' | 'property',   // shared = all 4 props; property = specific slug only
  propertySlug: null | 'jackson-st',
  title: 'Section Title',
  body: `<p>HTML string</p>`,
  images: [{ src: '/photos/jackson-st/uuid.jpeg', caption: 'Caption' }],
  order: 1,                       // sort within section
  phone: '+1...',                 // optional
  link: 'https://...',            // optional
}
```

**Sections active in V2:** `welcome`, `entry`, `parking`, `wifi`, `house_rules`, `the_home`, `additional_space`, `outdoor_spaces`, `services_maintenance`, `local_guide`, `things_to_do`, `transport`
**Filtered out of V2:** `videos`, `checkout` (checkout has its own route)

---

## 5. Properties Reference

| Slug | Name | Address | Max Guests |
|---|---|---|---|
| `reynard-way` | Reynard Way | 3003 Reynard Way, San Diego, CA 92103 | 22 |
| `hawk-street` | Hawk Street | 3701-03 Hawk St, San Diego, CA 92103 | 16 |
| `jackson-st` | Jackson Street | 2525 Jackson St, San Diego, CA 92110 | 16 |
| `vista-pointe` | Vista Pointe | 3792 Vista Pointe, Bonita, CA 91902 | 16 |

**Host (all):** Joe Saari · `saari.joseph@gmail.com` · `+1 (608) 239-3574`
**Check-in:** 4:00 PM · **Check-out:** 11:00 AM (all properties)

---

## 6. Vista Pointe — Image Map ✅

**AirBnB:** https://www.airbnb.com/rooms/1476889583543698184
**Photos folder:** `public/photos/vista-pointe/` (82 files, UUID `.jpeg`)

| Section | Block ID | Photo UUIDs used |
|---|---|---|
| Welcome | `welcome-vista-msg` | `e00570e1` |
| Entry | `entry-vista` | `jackson-enter.png` |
| Parking | `parking-vista` | `3d2ab098` |
| Home Overview | `home-vista-overview` | `e00570e1` + `7c018d78` + `4f8fbadc` |
| Bedrooms | `home-vista-bedrooms` | `f95d804e` + `79247d82` + `1248ca54` |
| Kitchen | `home-vista-kitchen` | `850800ed` + `32a42c88` |
| Laundry | `home-vista-laundry` | `56f6229b` |
| Pool & Jacuzzi | `outdoor-vista-pool` | `ad9adbcf` + `c045b79b` |
| Patio & BBQ | `outdoor-vista-patio` | `vista-patio.avif` + `7aa4338f` |

---

## 7. Jackson Street — Image Map ✅

**AirBnB:** https://www.airbnb.com/rooms/1538684793721325394
**Photos folder:** `public/photos/jackson-st/` (59 files, UUID `.jpeg/.png`)

**Note:** Airbnb blocked all Chrome/JS access. Photos were mapped by visually scanning all 59 local files with the Read tool + user-specified parking photo caption.

| Section | Block ID | Photo UUID(s) | Caption |
|---|---|---|---|
| Welcome | `welcome-jackson-msg` | `92272c0b` | ✅ Keep as-is |
| Entry | `entry-jackson` | `92272c0b` | ✅ Keep as-is |
| **Parking** | `parking-jackson` | `0450b7ce` | Driveway + exterior roll-up door (Living Room 2) — **specified by Joe** |
| Home Overview | `home-jackson-overview` | `dc593096` + `e2159565` | Open-concept dining/kitchen/living · Panoramic bay windows |
| Bedrooms | `home-jackson-bedrooms` | `6fbed64d` + `4afea22b` + `573b3ad5` | BR1 king+bay+deck · BR2 king+bay windows · BR3 queen |
| Kitchen | `home-jackson-kitchen` | `d4f3baef` + `3820fd19` | Island+range · Sink+blue tile |
| Laundry | `home-jackson-laundry` | `8d787f08` | Stacked W/D |
| Outdoor Decks | `outdoor-jackson-decks` | `a4d681eb` + `634b598c` | Rooftop deck at dusk (hero) · Panoramic sunset |
| Fire Pit & BBQ | `outdoor-jackson-firepit-bbq` | `fb4f506f` + `d3df78d2` | BBQ+fire pit at sunset · Fire pit lounge at sunset |

**Jackson photo key (for reference — all 59 scanned):**

| UUID | What it shows |
|---|---|
| `0450b7ce` | Driveway + roll-up door open (game room visible) — **Parking** ✅ |
| `92272c0b` | Exterior of house — **Welcome/Entry** ✅ |
| `d2e99c2e` | Full exterior at dusk (CRMLS, wide shot) |
| `7043725b` | Living Room 1 — Netflix TV, 3 sofas, staircase |
| `5db02ea5` | Living Room 1 — sofa bed pulled out, Netflix |
| `a75f892a` | Living Room 1 — bay view windows, Netflix |
| `e2159565` | Living Room 1 — panoramic bay windows (best) |
| `dc593096` | Open-concept: dining + kitchen + living, bay view |
| `043f773b` | Dining area + staircase + bay view |
| `3a1b3d54` | Dining area + staircase (alternative angle) |
| `33198d6c` | Living Room 2 / Game Room interior (loft + sofas) |
| `8296df8a` | Living Room 2 — beds + loft (sleeping config) |
| `99da8cbb` | Living Room 2 — Netflix TV + loft ladder |
| `8d787f08` | Living Room 2 — stacked W/D + mini sink/bar |
| `92e5110a` | Sitting area/bedroom with bay view, connects to deck |
| `720dbe54` | Sofa bed room with bay window |
| `d4f3baef` | Kitchen — island + gas range + staircase (best overview) |
| `4ec8fae3` | Kitchen — gas range + double oven angle |
| `3820fd19` | Kitchen — sink + blue Talavera tile backsplash |
| `9f6fb284` | Kitchen — coffee station detail |
| `953988d7` | Kitchen — full stocked shot |
| `6fbed64d` | Bedroom 1 — king + Netflix + sofa + deck door + bay |
| `4afea22b` | Bedroom 2 — king + bay view through window |
| `583b0043` | Bedroom — king, bathroom door visible |
| `88a7d06a` | Bedroom — king, Netflix, walk-in closet visible |
| `ca0d9390` | Bedroom — king, built-in Netflix shelving unit |
| `38f73842` | Bedroom — double/queen, sofa, deck door |
| `ae40972a` | Bedroom — king, round mirror, ceiling fan |
| `178eb6e1` | Bedroom — king, ceiling fan, ground floor |
| `573b3ad5` | Bedroom 3 — queen, minimal, red pillows |
| `6236bb90` | Bedroom — Netflix TV, dresser, red pillows |
| `b1f0753d` | Bathroom — green tile, single vanity + shower |
| `10eda678` | Bathroom — walk-in shower, green tile accents |
| `4768afd3` | Bathroom — master, blue/white tile, double vanity |
| `eabbd39b` | Bathroom — blue tile shower closeup |
| `10719f05` | Bathroom — powder room/half bath |
| `48d0b186` | Walk-in closet |
| `a4d681eb` | **Rooftop deck at dusk** — fire pit table, house visible (HERO) |
| `634b598c` | Rooftop deck — panoramic golden sunset view |
| `d3df78d2` | Rooftop — fire pit lounge at sunset |
| `b96e0f05` | Rooftop — sectional sofa + fire pit at sunset |
| `f3e86091` | Rooftop — sofa seating + fire pit at dusk |
| `068b6b2f` | Rooftop — fire pit table + wine glasses, bay views |
| `744cf2f6` | Upper deck — fire pit table at dusk |
| `09c5f0fd` | Upper deck — dining table + umbrella at sunset |
| `fb4f506f` | Upper deck — BBQ + fire pit table at sunset |
| `f45d193a` | Lower patio — BBQ grill + patio heater |
| `7dce338f` | Outdoor — BBQ + alfresco dining |
| `1d8b09bc` | Outdoor — fire pit patio area |
| `06201083` | Outdoor deck — panoramic bay + skyline |
| `c8426d88` | Upper deck angle |
| `3321eee0` | Hallway — baby crib + high chair (amenity) |

---

## 8. Photo Mapping Process (Repeat for Reynard Way + Hawk Street)

### Step 1 — Extract from Airbnb (Chrome MCP — if not blocked)

```js
// On the Airbnb listing page (photo tour open), run in Chrome DevTools:
const scripts = Array.from(document.querySelectorAll('script:not([src])'));
const niobe = scripts.find(s => s.textContent.includes('niobeClientData'));
const parsed = JSON.parse(niobe.textContent);
const data = parsed.niobeClientData[0][1].data;

const imageMap = {};
const walkForImages = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  if (obj.__typename === 'Image' && obj.id && obj.baseUrl) {
    const match = obj.baseUrl.match(/\/([a-f0-9\-]{36})\.(jpeg|jpg|png)/i);
    if (match) imageMap[obj.id] = match[1] + '.' + match[2];
  }
  if (Array.isArray(obj)) obj.forEach(walkForImages);
  else Object.values(obj).forEach(v => { if (v && typeof v === 'object') walkForImages(v); });
};
walkForImages(data);

const sections = {};
const seen = new Set();
const walkForSections = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  if (obj.__typename === 'RoomTourItem' && obj.title && obj.imageIds) {
    if (!seen.has(obj.title)) {
      seen.add(obj.title);
      sections[obj.title] = obj.imageIds.map(id => imageMap[id] || id);
    }
  }
  if (Array.isArray(obj)) obj.forEach(walkForSections);
  else Object.values(obj).forEach(v => { if (v && typeof v === 'object') walkForSections(v); });
};
walkForSections(data);
window.__propertyPhotos = sections;
Object.keys(sections).length + ' sections found';
// Then: JSON.stringify(window.__propertyPhotos['Bedroom 1'])
```

> **Note:** Airbnb may block Chrome MCP JS execution. If so, fall back to visually scanning local files with the `Read` tool (it can view images). User can also specify which Airbnb photo caption matches which section.

### Step 2 — Copy files to project

```bash
SRC="/Users/anantgyan/Downloads/AiirBNB Photos"
DEST="/Users/anantgyan/talo-guidebook/public/photos/<slug>"
mkdir -p "$DEST"

copy_file() {
  local uuid=$1
  src_file=$(ls "$SRC/${uuid}".* 2>/dev/null | head -1)
  [ -n "$src_file" ] && cp "$src_file" "$DEST/${uuid}.${src_file##*.}"
}
copy_file "uuid-here"
# Or copy all at once and then trim
```

### Step 3 — Update `contentStore.js`

- Match section names to block IDs (welcome, entry, parking, the_home, outdoor_spaces, etc.)
- Use 1–3 best images per section; pick most representative/impressive
- Image path format: `/photos/<slug>/uuid.jpeg`

### Step 4 — Bump localStorage key

Each time bulk changes are made: increment `v8` → `v9` in `contentStore.js` line:
```js
const STORAGE_KEY = 'talo_content_blocks_v8'
```

---

## 9. GitHub Pages Deployment (When All 4 Properties Done)

1. Set `base` in `vite.config.js` to the GitHub repo path (e.g. `base: '/talo-guidebook/'`)
2. `npm run build` → output to `dist/`
3. Push `dist/` to GitHub, enable Pages (or use GitHub Actions workflow)
4. All `public/` files bundle automatically into `dist/`
5. External Unsplash image URLs work fine (CDN)
6. **Confirm with Joe:** should `/admin` be accessible in production or behind auth?

---

## 10. Resume Prompt

```
I'm continuing work on the "talo-guidebook" project.
Project root: /Users/anantgyan/talo-guidebook

READ Handoff.md FIRST — it has the full architecture, decisions, and status.

Quick context:
- React + Vite + Tailwind SPA. Dev server: npm run dev → port 5175
- V2 URLs: http://localhost:5175/v2/reynard-way (also hawk-street, jackson-st, vista-pointe)
- V1 (/:slug) is preserved — DO NOT TOUCH IT EVER
- localStorage key: 'talo_content_blocks_v8'
- NightModeCtx and V2RightSidebar are exported from V2GuidebookPage.jsx
- Vista Pointe ✅ and Jackson Street ✅ photo mapping complete
- Reynard Way 🔲 and Hawk Street 🔲 still need photo mapping

Next task: Photo mapping for Reynard Way, then Hawk Street.
Joe will open each Airbnb listing in Chrome and share the URL.
Follow the process in Handoff.md Section 8.
After both done → GitHub Pages deployment (Section 9).
```

---

*Session 1: Full V2 UI built & approved | Session 2: FAQ, hero, Vista Pointe | Session 3: Jackson Street*
