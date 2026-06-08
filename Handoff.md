# Talo Guidebook — Session Handoff

> **Last updated: End of Session 4**
> Session 1 — Built full V2 UI (approved)
> Session 2 — FAQ layout, hero tweaks, Vista Pointe photo mapping
> Session 3 — Jackson Street photo mapping
> Session 4 — GitHub Pages deployment, image fixes, print CSS, tablet card
> Everything below is confirmed, saved to disk, deployed to GitHub Pages, and working.

---

## 1. Project Overview

**What it is:** React SPA guest guidebook for TALO Rentals (San Diego short-term rentals, owner: Joe Saari). Digital house manual for 4 properties.

**Tech stack:** React 19 · React Router v7 · Vite 8 (port `5175`, `strictPort: true`) · Tailwind CSS v3 · No backend — all data in JS files + localStorage

**Dev server:** `npm run dev` → `http://localhost:5175`

**V2 guidebook URLs (local):**
| Property | URL |
|---|---|
| Reynard Way | http://localhost:5175/v2/reynard-way |
| Hawk Street | http://localhost:5175/v2/hawk-street |
| Jackson Street | http://localhost:5175/v2/jackson-st |
| Vista Pointe | http://localhost:5175/v2/vista-pointe |

**Live GitHub Pages URLs:**
| Property | URL |
|---|---|
| Reynard Way | https://talodeveloper.github.io/talo-guidebook/v2/reynard-way |
| Hawk Street | https://talodeveloper.github.io/talo-guidebook/v2/hawk-street |
| Jackson Street | https://talodeveloper.github.io/talo-guidebook/v2/jackson-st |
| Vista Pointe | https://talodeveloper.github.io/talo-guidebook/v2/vista-pointe |

> ⛔ **V1** lives at `/:slug` — **NEVER TOUCH IT.**

---

## 2. Status

### ✅ Done
- Full V2 UI (terracotta day / indigo-purple night, 3-col layout, flip cards, FAQ, checkout, night mode toggle)
- Vista Pointe — all photos mapped ✅
- Jackson Street — all photos mapped ✅
- Local Guide & Things To Do — real photos (all previously-Unsplash images now self-hosted in `public/images/local/`)
- Checkout page — post-checkout CTA linking to `https://talo.rentals/`
- localStorage key → **`talo_content_blocks_v8`**
- GitHub Pages deployed at `https://talodeveloper.github.io/talo-guidebook/`
- Hero image: `newhero.png` (day) — cropped to same aspect ratio as `nightview.png`
- Jackson Street parking photo: `parking.avif`
- Print/PDF support: Ctrl+P on main, FAQ, and Checkout pages all work cleanly
- Tablet view: property detail card shows between hero and content on md screens

### 🔲 Remaining (in order)
1. **Photo mapping — Reynard Way** (Joe opens Airbnb listing in Chrome, shares URL → follow Section 8)
2. **Photo mapping — Hawk Street** (same process)
3. **Admin panel** — confirm with Joe whether `/admin` should be accessible in production

---

## 3. File Structure

```
talo-guidebook/
├── public/
│   ├── images/
│   │   ├── beach-hero.png          ← Old day hero (kept for reference)
│   │   ├── newhero.png             ← Current day hero (2172×388, cropped)
│   │   ├── nightview.png           ← Night hero (2172×388)
│   │   ├── talo-logo.png           ← Logo
│   │   └── local/                  ← All local guide + things-to-do photos
│   │       starbucks.png · genteel-coffee.jpg · target.jpg · sprouts.jpg
│   │       ralphs.jpg · moes-coffee.jpg · paddle.jpg · fashion-valley.jpg
│   │       palm-canyon.jpg · everyday-california.jpg · disco-paddle.jpg
│   │       marston-point.jpg · balboa-park-golf.jpg · coronado-island.jpg
│   │       chula-vista-bayfront.jpg · downtown-san-diego.jpg · vons-grocery.jpg
│   │       border-field.jpg · snooty-fox.jpg · la-bella-pizza.jpg
│   │       sail-san-diego.jpg · mission-bay-sport.jpg · aqua-adventures.jpg
│   │       kayak-la-jolla.jpg · loma-club.jpg · balboa-park.jpg
│   │       sweetwater-summit.jpg · olympic-training.jpg · sd-oasis.jpg · old-town-sd.jpg
│   └── photos/
│       ├── reynard-way/            ← 🔲 Still needs photo mapping
│       ├── hawk-street/            ← 🔲 Still needs photo mapping
│       ├── jackson-st/             ← ✅ 59 files + parking.avif
│       └── vista-pointe/           ← ✅ 82 files, UUID-named .jpeg
│
├── src/
│   ├── App.jsx                     ← Router (V1 at /:slug, V2 at /v2/:slug)
│   ├── data/
│   │   ├── properties.js           ← 4 property configs
│   │   ├── contentStore.js         ← ★ STORAGE_KEY = 'talo_content_blocks_v8'
│   │   ├── sections.js             ← Section key/label/icon definitions
│   │   ├── faqData.js              ← FAQ Q&A per property slug
│   │   └── adminStore.js           ← Admin only — DO NOT TOUCH
│   ├── components/Icon.jsx         ← Google Material Icons wrapper
│   └── guidebook/
│       ├── Checkout.jsx            ← Shared by V1 + V2 (has print CSS hooks)
│       ├── GuidebookLayout.jsx     ← V1 — DO NOT EDIT
│       ├── GuidebookPage.jsx       ← V1 — DO NOT EDIT
│       └── v2/
│           ├── V2GuidebookLayout.jsx  ← Owns nightMode state
│           ├── V2GuidebookPage.jsx    ← Main V2 page
│           ├── V2FAQPage.jsx          ← FAQ page (has print CSS hooks)
│           └── V2PrintPage.jsx        ← Standby print page at /v2/:slug/print
├── vite.config.js                  ← base: '/talo-guidebook/' for production only
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
    {/* Print-only img — background-image doesn't print */}
    <img src={t.HERO_IMG} className="print-hero-img" style={{ display:'none' }} />
  </div>
  ...
```

**Hero images:**
- Day: `/images/newhero.png` (2172×388)
- Night: `/images/nightview.png` (2172×388)

---

### 4.2 Night Mode Architecture

State lives in **`V2GuidebookLayout.jsx`**, persisted to `localStorage('talo_night_mode')`.

```jsx
<Outlet context={{ property: activeProperty, nightMode, toggleNightMode }} />
const { property, nightMode, toggleNightMode } = useOutletContext()
```

Theme propagates inside `V2GuidebookPage.jsx` via React Context:
```jsx
export const NightModeCtx = React.createContext(false)  // EXPORTED
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

1. **Never use Tailwind `divide-y`** in sections — hard-codes a white border in night mode.

2. **`Checkout.jsx` back-button** uses `useLocation()` to detect V1 vs V2:
   ```jsx
   const isV2 = location.pathname.startsWith('/v2/')
   ```

3. **`V2RightSidebar`** requires `mapsUrl` prop — always pass it.

4. **localStorage key** — bump it (`v8` → `v9`) whenever you make bulk content changes in `contentStore.js`.

5. **`BlockImages` component** uses `object-cover` with `maxHeight`. Do NOT change to `object-contain`.

6. **`imgUrl()` helper** — ALL image paths in V2GuidebookPage must go through this:
   ```js
   const imgUrl = (path) => path ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}` : path
   ```
   This is defined at module level in `V2GuidebookPage.jsx` and also in `V2PrintPage.jsx`.

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
  <Route path="print" element={<V2PrintPage />} />   ← standby, not linked
</Route>
```

**BrowserRouter basename** is set to `import.meta.env.BASE_URL` so it works on both localhost (base=`/`) and GitHub Pages (base=`/talo-guidebook/`).

---

### 4.6 Vite Config

```js
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/talo-guidebook/' : '/',
  server: { port: 5175, strictPort: true },
}))
```
`base` is `/talo-guidebook/` only during `npm run build` — dev server stays at `/`.

---

### 4.7 ContentStore Block Schema

```js
{
  id: 'unique-id',
  sectionKey: 'parking',
  type: 'shared' | 'property',
  propertySlug: null | 'jackson-st',
  title: 'Section Title',
  body: `<p>HTML string</p>`,
  images: [{ src: '/photos/jackson-st/uuid.jpeg', caption: 'Caption' }],
  order: 1,
  phone: '+1...',   // optional
  link: 'https://', // optional
}
```

**Sections active in V2:** `welcome`, `entry`, `parking`, `wifi`, `house_rules`, `the_home`, `additional_space`, `outdoor_spaces`, `services_maintenance`, `local_guide`, `things_to_do`, `transport`

---

### 4.8 Print / PDF Support

**How it works:**
- `Ctrl+P` on **any** of the three pages produces a clean PDF
- CSS class `no-print` → hidden in print (toggle button, sidebars, mobile TOC)
- `#local_guide`, `#things_to_do` → hidden in print
- `print-hero-img` → hidden on screen, shown in print (fixes background-image not printing)
- `print-full-width` → main content goes full width in print

**FAQ page print:** All accordion answers are always in the DOM (hidden via `display:none` CSS, not conditional render). `@media print` forces `.faq-answer { display: block }` so all Q&As expand automatically.

**Checkout page print:** Checkboxes show as empty printable boxes; checked state, strikethrough, and "all done" banner are reset via CSS.

**Standby print page:** `/v2/:slug/print` — a single-page print document with all content (guidebook + FAQ + checkout) assembled inline. Not linked anywhere currently, but route is active. To activate: add a button linking to it.

---

### 4.9 Tablet Layout

On `md` screens (768px–1023px), a compact property detail card is injected between the hero and the 3-column layout (`hidden md:block lg:hidden`). It shows: property name, address, check-in time, check-out time, max guests, Map link, Check-Out button.

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
**Photos folder:** `public/photos/jackson-st/` (59 files + parking.avif)

| Section | Block ID | Photo UUID(s) | Caption |
|---|---|---|---|
| Welcome | `welcome-jackson-msg` | `92272c0b` | ✅ |
| Entry | `entry-jackson` | `92272c0b` | ✅ |
| Parking | `parking-jackson` | `parking.avif` | Driveway + exterior roll-up door |
| Home Overview | `home-jackson-overview` | `dc593096` + `e2159565` | |
| Bedrooms | `home-jackson-bedrooms` | `6fbed64d` + `4afea22b` + `573b3ad5` | |
| Kitchen | `home-jackson-kitchen` | `d4f3baef` + `3820fd19` | |
| Laundry | `home-jackson-laundry` | `8d787f08` | |
| Outdoor Decks | `outdoor-jackson-decks` | `a4d681eb` + `634b598c` | |
| Fire Pit & BBQ | `outdoor-jackson-firepit-bbq` | `fb4f506f` + `d3df78d2` | |

---

## 8. Photo Mapping Process (Repeat for Reynard Way + Hawk Street)

### Step 1 — Extract from Airbnb (Chrome MCP — if not blocked)

```js
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
```

> **Note:** Airbnb may block Chrome MCP JS execution. Fall back to visually scanning local files with the `Read` tool.

### Step 2 — Copy files to project

```bash
SRC="/Users/anantgyan/Downloads/AiirBNB Photos"
DEST="/Users/anantgyan/talo-guidebook/public/photos/<slug>"
mkdir -p "$DEST"
cp "$SRC/uuid.jpeg" "$DEST/uuid.jpeg"
```

### Step 3 — Update `contentStore.js`

- Match section names to block IDs
- 1–3 best images per section
- Image path format: `/photos/<slug>/uuid.jpeg`

### Step 4 — Bump localStorage key + Deploy

```js
// contentStore.js line ~2041
const STORAGE_KEY = 'talo_content_blocks_v9'  // bump v8 → v9
```

Then deploy:
```bash
cd /Users/anantgyan/talo-guidebook
npm run deploy
```

---

## 9. GitHub Deployment

**Repo:** `https://github.com/talodeveloper/talo-guidebook`
**Live site:** `https://talodeveloper.github.io/talo-guidebook/`
**GitHub account:** talodeveloper

**To push updates (one command):**
```bash
cd /Users/anantgyan/talo-guidebook && npm run deploy
```

This builds and publishes automatically. Source code is on `main` branch, built site is on `gh-pages` branch.

**GitHub token** (expires ~60 days from Jun 6 2025): stored locally — do not commit. Ask Joe to regenerate if expired.
When expired: go to github.com → Joe's account → Settings → Developer settings → Personal access tokens → generate new classic token with `repo` scope. Then update the remote:
```bash
git remote set-url origin https://talodeveloper:NEW_TOKEN@github.com/talodeveloper/talo-guidebook.git
```

---

## 10. Resume Prompt

```
I'm continuing work on the "talo-guidebook" project.
Project root: /Users/anantgyan/talo-guidebook

Please READ the file /Users/anantgyan/talo-guidebook/Handoff.md FIRST before doing anything — it has the full architecture, all design decisions, current status, and what's next.

Quick orientation:
- React + Vite + Tailwind SPA. Dev server: npm run dev → port 5175
- V2 URLs: http://localhost:5175/v2/reynard-way (also hawk-street, jackson-st, vista-pointe)
- Live: https://talodeveloper.github.io/talo-guidebook/v2/reynard-way
- V1 (/:slug) is preserved — DO NOT TOUCH IT EVER
- localStorage key: 'talo_content_blocks_v8'
- Vista Pointe ✅ and Jackson Street ✅ photo mapping complete
- Reynard Way 🔲 and Hawk Street 🔲 still need photo mapping
- imgUrl() helper must be used for ALL image paths in V2GuidebookPage.jsx
- All Unsplash images have been replaced with self-hosted copies in public/images/local/

Next task: Photo mapping for Reynard Way, then Hawk Street.
Joe will open each Airbnb listing in Chrome and share the URL.
Follow the process in Handoff.md Section 8.
After both done → confirm admin panel access with Joe.
```

---

*Session 1: Full V2 UI | Session 2: FAQ, hero, Vista Pointe | Session 3: Jackson Street | Session 4: GitHub Pages, images, print CSS, tablet card*
