# Talo Guidebook — Session Handoff

> **Last updated: End of Session 13**
> Session 1 — Built full V2 UI
> Session 2 — FAQ layout, hero tweaks, Vista Pointe photo mapping
> Session 3 — Jackson Street photo mapping
> Session 4 — GitHub Pages deployment, image fixes, print CSS, tablet card
> Session 5 — Admin Panel V2 built from scratch
> Session 6 — WYSIWYG body editor, list reorder, new credentials, deployed
> Session 7 — V3 Admin Panel + V3 Guidebook with Activity Center (local only, not deployed)
> Session 8 — Firebase Firestore backend, Check-In page, Check-Out form, admin records, blue UI, property info reorder
> Session 9 — Stay-aware checkout matching, Guest Database admin page, host phone visible, form validation, Call/Text label
> Sessions 10–12 — V3 sync + architectural overhaul (then DEPLOYED to production)
> Session 13 — Image upload via Firebase Storage (block / per-property hero / global hero / activities), Reynard+Hawk image fixes, check-in count 0–30, V3 publish now writes to Firestore. **All deployed and live.**
> Everything below is confirmed and saved to disk.

---

## ⏪ LIVE STATE & ROLLBACK (read this first)

**Production URL:** `https://talodeveloper.github.io/talo-guidebook/`

**Current live commit:** `6c9a38f` — "Migrate all 3 admin logins to Firebase Authentication"

**Security state (Session 13.1):** Admin login is now real **Firebase Auth** (email/password) — the hardcoded `Mytalo@2026` is retired everywhere. **Firestore rules are locked**: `v2_content` public-read / auth-write; `v2_checkins` + `v2_checkouts` anonymous-create-only, auth-required to read/manage; deny-all default. Verified in production: guest PII reads are `permission-denied` for anonymous clients, guidebook content still public-readable. The Firebase Auth user lives in Firebase Console → Authentication → Users.
**Still open (next):** (1) GitHub PAT embedded in local `.git/config` remote URL — rotate it. (2) Firebase **Storage** rules still allow anonymous write/delete — should be tightened to `request.auth != null` for write/delete (admin-only; guests only read images).

V1, V2, **and V3** are all live and working as of this commit. To roll back if something breaks later:

```bash
# See history
git log --oneline -15

# Option A — undo a specific bad commit (preferred, keeps history)
git revert <bad-commit-sha>
npm run build && npm run deploy

# Option B — hard reset the live site to a known-good commit
git checkout b90fe7e
npm run build && npm run deploy
git checkout main   # return to latest after redeploying
```

**Known-good checkpoints (deploy any of these to restore that state):**
| Commit | State |
|---|---|
| `b90fe7e` | **Current.** Image upload + global hero + all fixes |
| `0a62d36` | After V3 hero field rename (heroes correct, before global-hero feature) |
| `4be9f0c` | Image upload first shipped + Reynard/Hawk fixes |
| `20aa485` | V3 first launched to production (no image upload yet) |
| `7515783` | V2-only era (V3 not yet deployed) — ultimate safe fallback |

**Deploy mechanics:** `npm run deploy` runs `vite build` then `gh-pages -d dist`, publishing `dist/` to the `gh-pages` branch. GitHub Pages serves that branch. Source lives on `main`. The two are pushed separately — `git push origin main` for source, `npm run deploy` for the live site.

**Data note:** Admin content lives in Firestore (`v2_content/blocks`, `v2_content/properties`) + Firebase Storage (uploaded images under `properties/...`), NOT in the git repo. A code rollback does **not** revert content/images — those persist in Firebase. Guest data is in `v2_checkins` / `v2_checkouts`.

---

## 1. Project Overview

**What it is:** React SPA guest guidebook for TALO Rentals (San Diego short-term rentals, owner: Joe Saari). Digital house manual for 4 properties.

**Tech stack:** React 19 · React Router v7 · Vite 8 (port `5175`, `strictPort: true`) · Tailwind CSS v3 · Firebase Firestore (real-time backend for V2)

**Dev server:** `npm run dev` → `http://localhost:5175`

**Owner / Host:** Joe Saari · `saari.joseph@gmail.com` · `+1 (608) 239-3574`

---

## 2. Version Architecture — Critical Overview

There are **3 separate version layers**. NEVER mix them up.

| Version | Route | Admin | Status |
|---|---|---|---|
| V1 | `/:slug` | `/admin` | ⛔ NEVER TOUCH — preserved as-is |
| V2 | `/v2/:slug` | `/admin-v2` | ✅ Live on GitHub Pages |
| V3 | `/v3/:slug` | `/admin-v3` | ✅ Live on GitHub Pages (since Session 10–12 deploy) — the going-forward product |

**Login credentials (all three admins):** `joe@talo.ventures` / `Mytalo@2026`

---

## 3. Current Status

### ✅ V2 — Fully Live & Deployed

**Live URL:** `https://talodeveloper.github.io/talo-guidebook/`

- Full V2 guidebook UI: terracotta day / indigo-purple night, 3-col layout, flip cards, FAQ, checkout, night mode
- Vista Pointe ✅ and Jackson Street ✅ — photos mapped
- Reynard Way 🔲 and Hawk Street 🔲 — still need photo mapping (see Section 8)
- Admin Panel V2: Draft/Publish workflow, WYSIWYG editor, reorder blocks/list items, all 4 properties, FAQ, Global Content (house rules)
- **Firebase Firestore backend** — content syncs globally; all devices see admin changes after Publish
- localStorage key: `talo_admin_v2_draft` / `talo_admin_v2_live` (used as fallback)
- Guidebook reads from: Firestore (highest priority) → localStorage → `contentStore.js`

#### Session 8 V2 additions

**Firebase / Backend**
- `src/firebase.js` — Firebase app init + Firestore export
- `src/data/firebaseSync.js` — `onSnapshot` listeners for `v2_content/blocks`, `v2_content/properties`, `v2_content/faq`
- Admin Publish pushes to Firestore so all devices update in real-time
- `v2_checkins` Firestore collection — guest check-in form submissions
- `v2_checkouts` Firestore collection — guest checkout form submissions (or admin manual checkout)

**Guidebook**
- Check In button color → **blue** everywhere (right sidebar, inline card, left TOC, mobile TOC, check-in page header icon)
- Email/Phone buttons in Host card + Checkout contact — **hidden if field is empty**
- V2 checkout page — Sign-Out form after checklist (Primary Booker Name + Your Name); saves to `v2_checkouts`

**Admin panel**
- Property Info field order now matches guidebook: Details → WiFi → Host → Check-In Page
- Host email hint: "Leave blank to hide Email button from guests"
- **Check-In Page card** — editable welcome message per property (stored in `properties[slug].checkInWelcome`)
- **Unpublished Changes dropdown** — click "Unpublished changes" text to see list: "House Rules — Reynard Way", etc.
- **Publish button always visible** — greyed out when nothing to publish; Discard button only appears when there are changes
- **Check-In Records** (`/admin-v2/checkins`) — delete individual guest records (hover to reveal); Mark as Checked Out button per primary booker group; filters out checked-out groups
- **Checked Out** (`/admin-v2/checkouts`) — NEW page; shows groups that checked out (by form or admin); guest roster below each group; Restore button to undo; Download CSV

**V2 Check-In page** (`/v2/:slug/checkin`)
- Header icon is now blue
- Welcome message reads from `property.checkInWelcome` (editable in admin Property Info → Check-In Page card)
- Firestore `v2_checkins` write on form submit

#### Firebase rules reminder
Test mode expires 30 days from database creation. Update rules in Firebase console:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /v2_content/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /v2_checkins/{doc} {
      allow read, write: if true;
    }
    match /v2_checkouts/{doc} {
      allow read, write: if true;
    }
  }
}
```
**Important:** First time using the live admin, Joe must click Publish once to seed Firestore with all current content.

#### Session 9 V2 additions

**Guidebook**
- Host card right sidebar shows phone number as plain text (`select-all` for easy copy) next to Joe's name + the Call / Text button
- All "Call" labels → **"Call / Text"** (right sidebar Host card + Checkout contact)

**Check-In page — input validation**
- Phone: regex `/^[+]?[\d\s\-().]{7,15}$/` — accepts only digits, spaces, `+`, `-`, `()`. Inline red error on invalid format
- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Inline red border + error on invalid format
- Phone marked "(optional)"; submit blocked until all required fields pass validation

**Admin — stay-aware checkout matching**
- A checkout record only "hides" a check-in group from active records if checkout timestamp > latest check-in timestamp for that booker+property
- Fixes: if a new guest checks in with the same primary booker name as an old guest who already checked out, the new booking now correctly appears in active records (not auto-marked as checked-out)
- Same logic applied to Checkouts page roster — only shows check-ins that happened BEFORE that checkout

**Admin — composite grouping key (Session 9.1)**
- Check-In Records groups guests by `primaryGuestName + propertySlug` (not name alone)
- Fixes: two different bookings with the same primary booker name across different properties (e.g. a "Joe" at Jackson and a "Joe" at Hawk Street) now appear as separate groups in the "All Properties" view instead of being merged into one

**Admin — NEW Guest Database page** (`/admin-v2/guest-database`)
- Flat tabular list of every check-in submission (excludes primary booker name — for email marketing)
- Columns: Name · Email · Phone · Property · Checked-In Date · Checked-Out Date
- Sorted newest first; live-updating from Firestore
- "Currently in" badge if no checkout yet; otherwise shows checkout date in green
- Search box (name / email / phone) + property filter chips
- Download CSV button (respects current filters)
- Available in sidebar under "Guest Records" group: Check-In Records · Checked Out · Guest Database

### ✅ V3 — Fully Live & Deployed (the going-forward product)

- V3 Admin at `/admin-v3`, V3 Guidebook at `/v3/:slug` — all live on GitHub Pages
- localStorage keys: `talo_admin_v3_draft` / `talo_admin_v3_live` / `talo_admin_v3_auth`
- **Publish flow (important):** `adminV3Store.publish()` writes to (a) `talo_admin_v3_live`, (b) `talo_admin_v2_live` blocks key (what `contentStore` reads on fresh load), AND (c) **pushes to Firestore** `v2_content/blocks` + `v2_content/properties`. The Firestore push is what makes changes survive reloads and appear cross-device — without it the real-time listener overwrites local changes with stale server data.
- Guidebook read order: Firestore (real-time listener) → `talo_admin_v2_live` localStorage → `contentStore.js` defaults
- **36 activities seeded**; Reynard & Hawk bedroom/studio/outdoor image mismatches fixed via signature-checked migration in `contentStore.js`

### ✅ Image upload (Session 13) — Firebase Storage, NOT Supabase

Images now upload to **Firebase Storage** (project already on Blaze plan). Earlier handoff notes mentioning "Supabase" are obsolete — we went all-Firebase.

- `src/data/imageUpload.js` — `uploadPropertyImage({slug, blockId, file, onProgress, profile})` + `deletePropertyImage(path)`. Client-side compression; two validation profiles: `default` (min 1000×700, aspect 1:3–3:1) and `hero` (min 1600×300, aspect 3.5:1–8:1, wide banner).
- `src/admin-v3/components/ImagePicker.jsx` — reusable picker (drag/click upload, replace, remove, reorder, caption, progress, error + warning banners). Accepts `profile` prop; only dirties the draft when an upload actually succeeds.
- Wired into: **SectionEditor** (per-block images), **PropertyInfo** (per-property hero, day + night — fields `v3HeroImage` / `v3HeroImageNight`), **GlobalActivities** modal (activity photo, replaced the old URL-paste field), **GlobalContent** (global hero banner day + night).
- **Hero resolution chain:** per-property `v3HeroImage` → global `globalHero.day` → built-in `/images/newhero.png` (night: `v3HeroImageNight` → `globalHero.night` → `/images/nightview.png`).
- ⚠️ The V3 hero field is named `v3HeroImage` (NOT `heroImage`) on purpose — `heroImage` already exists in `properties.js` for V1/V2 and points at interior photos. Reusing it caused V3 day heroes to render V2 data (the bug fixed in `0a62d36`).

### Firebase Storage rules (set in Firebase console, not in repo)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /properties/{slug}/{allPaths=**} {
      allow read: if true;
      allow create, update: if request.resource.size < 10 * 1024 * 1024
                            && request.resource.contentType.matches('image/.*')
                            && request.resource.contentType != 'image/gif';
      allow delete: if true;
    }
  }
}
```
`delete` needs its own clause — on a delete there's no `request.resource`, so folding it into `write` blocked deletes.

### 🔲 Remaining Work / Next Up

1. **SECURITY (next session):** real Firebase Auth to replace the hardcoded client-side password (`Mytalo@2026` is in committed source AND the public JS bundle); lock down Firestore rules (guest PII in `v2_checkins` may be world-readable — rules need confirming); rotate the GitHub PAT currently embedded in `.git/config` remote URL.
2. **Productization (planned):** multi-tenant SaaS — subdomains (`abc.talorentals.com`), Firebase Hosting, Stripe billing, super-admin, signup/account pages. Real auth (item 1) is the first foundation brick.
3. Per-property / global hero photos are still the built-in defaults until an admin uploads real ones via the new pickers.

---

## 4. File Structure

```
talo-guidebook/
├── public/
│   ├── images/
│   │   ├── newhero.png             ← Day hero (2172×388)
│   │   ├── nightview.png           ← Night hero (2172×388)
│   │   ├── talo-logo.png
│   │   └── local/                  ← All Activity Center photos + local guide
│   │       (30 files: starbucks.png, genteel-coffee.jpg, moes-coffee.jpg,
│   │        la-bella-pizza.jpg, snooty-fox.jpg, aqua-adventures.jpg,
│   │        kayak-la-jolla.jpg, paddle.jpg, palm-canyon.jpg, marston-point.jpg,
│   │        sail-san-diego.jpg, mission-bay-sport.jpg, balboa-park-golf.jpg,
│   │        loma-club.jpg, coronado-island.jpg, sweetwater-summit.jpg,
│   │        border-field.jpg, olympic-training.jpg, disco-paddle.jpg,
│   │        fashion-valley.jpg, balboa-park.jpg, old-town-sd.jpg, target.jpg,
│   │        vons-grocery.jpg, sprouts.jpg, ralphs.jpg, chula-vista-bayfront.jpg,
│   │        sd-oasis.jpg, downtown-san-diego.jpg, everyday-california.jpg)
│   └── photos/
│       ├── reynard-way/            ← 🔲 Still needs photo mapping
│       ├── hawk-street/            ← 🔲 Still needs photo mapping
│       ├── jackson-st/             ← ✅ 59 files + parking.avif
│       └── vista-pointe/           ← ✅ 82 files, UUID-named .jpeg
│
├── src/
│   ├── App.jsx                     ← Router (V1/V2/V3 guidebooks + all 3 admins)
│   ├── firebase.js                 ← Firebase app init + db export (Firestore)
│   ├── data/
│   │   ├── properties.js           ← 4 property configs (static)
│   │   ├── contentStore.js         ← STORAGE_KEY = 'talo_content_blocks_v8'
│   │   ├── sections.js             ← Section key/label/icon (used by V2 admin)
│   │   ├── faqData.js              ← FAQ Q&A per property slug
│   │   ├── adminStore.js           ← V1 admin store (DO NOT TOUCH)
│   │   ├── adminV2Store.js         ← V2 admin store (draft/publish, getChangeSummary)
│   │   ├── adminV3Store.js         ← V3 admin store (activities, curation, property mgmt)
│   │   └── firebaseSync.js         ← onSnapshot listeners; exports getPropertyOverrides, subscribeProperties, getFaqOverrides, subscribeFaq
│   ├── components/
│   │   ├── Icon.jsx                ← Google Material Icons wrapper
│   │   └── RichTextEditor.jsx
│   ├── admin/                      ← V1 admin (DO NOT TOUCH)
│   ├── admin-v2/                   ← V2 admin
│   │   ├── Layout.jsx              ← Sidebar + header (Publish/Discard/dropdown/Checkouts link)
│   │   ├── Login.jsx
│   │   ├── components/BodyEditor.jsx
│   │   └── pages/
│   │       Dashboard.jsx · FAQEditor.jsx · GlobalContent.jsx
│   │       PropertyHome.jsx · PropertyInfo.jsx · SectionEditor.jsx
│   │       CheckIns.jsx (active guests) · Checkouts.jsx (checked-out groups)
│   │       GuestDatabase.jsx (flat tabular view + CSV for email marketing)
│   ├── admin-v3/                   ← V3 admin (NEW in Session 7)
│   │   ├── Layout.jsx
│   │   ├── Login.jsx
│   │   ├── components/BodyEditor.jsx (copy of v2)
│   │   └── pages/
│   │       Dashboard.jsx · FAQEditor.jsx · GlobalContent.jsx
│   │       GlobalActivities.jsx · PropertyActivities.jsx
│   │       PropertyHome.jsx · PropertyInfo.jsx · SectionEditor.jsx
│   │       AddProperty.jsx
│   └── guidebook/
│       ├── Checkout.jsx            ← Shared by V1+V2+V3
│       ├── GuidebookLayout.jsx     ← V1 (DO NOT TOUCH)
│       ├── GuidebookPage.jsx       ← V1 (DO NOT TOUCH)
│       └── v2/
│       │   ├── V2GuidebookLayout.jsx
│       │   ├── V2GuidebookPage.jsx   (exports NightModeCtx, V2RightSidebar)
│       │   ├── V2FAQPage.jsx
│       │   ├── V2PrintPage.jsx
│       │   └── V2CheckInPage.jsx     (house rules checklist + form → v2_checkins Firestore)
│       └── v3/                     ← NEW in Session 7
│           ├── V3GuidebookLayout.jsx
│           ├── V3GuidebookPage.jsx   (exports NightModeCtx, V3RightSidebar)
│           └── V3FAQPage.jsx
```

---

## 5. V2 Guidebook — Full Detail

### URLs
| Property | Local | Live |
|---|---|---|
| Reynard Way | http://localhost:5175/v2/reynard-way | https://talodeveloper.github.io/talo-guidebook/v2/reynard-way |
| Hawk Street | http://localhost:5175/v2/hawk-street | https://talodeveloper.github.io/talo-guidebook/v2/hawk-street |
| Jackson Street | http://localhost:5175/v2/jackson-st | https://talodeveloper.github.io/talo-guidebook/v2/jackson-st |
| Vista Pointe | http://localhost:5175/v2/vista-pointe | https://talodeveloper.github.io/talo-guidebook/v2/vista-pointe |

### V2 Active Sections (in order)
`welcome` · `entry` · `parking` · `wifi` · `house_rules` · `the_home` · `additional_space` · `outdoor_spaces` · `services_maintenance` · `videos` · `local_guide` · `things_to_do` · `transport` · `checkout`

### V2 Content Data Flow
1. `contentStore.js` — hardcoded fallback blocks (key: `talo_content_blocks_v8`)
2. V2 admin draft → `talo_admin_v2_draft` in localStorage
3. V2 admin publish → `talo_admin_v2_live` in localStorage
4. Guidebook reads: `talo_admin_v2_live` first, then `contentStore.js`

### V2 Admin Panel — `/admin-v2`
- **Login:** joe@talo.ventures / Mytalo@2026
- **Draft/Publish workflow:** Publish button → makes changes live instantly
- **Sections:** WYSIWYG body editor (paragraphs = rich text B/I/U/size, lists = individual item boxes)
- **Reorder:** ↑↓ on list items within block AND ↑↓ on blocks within section
- **Global Content:** shared house rules (affect all 4 properties)
- **Property Info:** WiFi, host, address, check-in/out, max guests
- **Core blocks locked** (🔒 no delete); admin-added blocks are deletable

### V2 Design Tokens

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

### V2 Critical Rules
1. **Never use Tailwind `divide-y`** — hard-codes white border in night mode
2. **`Checkout.jsx` back-button** uses `useLocation()` to detect V1 vs V2 (`isV2 = location.pathname.startsWith('/v2/')`) — V3 checkout uses the same component, detects `/v3/` in the same way (already handled)
3. **`imgUrl()` helper** — ALL image paths in V2GuidebookPage must go through this:
   ```js
   const imgUrl = (path) => path ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}` : path
   ```
4. **`BlockImages` component** uses `object-cover` with `maxHeight` — do NOT change to `object-contain`
5. **localStorage key** — bump (`v8` → `v9`) if making bulk changes to `contentStore.js`

### V2 Print/PDF Support
- `Ctrl+P` on main page, FAQ, or Checkout → clean PDF
- `no-print` class → hidden in print
- `#local_guide`, `#things_to_do` → hidden in print
- `print-hero-img` → hidden on screen, shown in print
- `print-full-width` → main content goes full width in print
- FAQ: all answers always in DOM, `@media print` forces `.faq-answer { display: block }`

---

## 6. V3 Guidebook — Full Detail (Session 7)

### URLs (local only)
| Property | Local |
|---|---|
| Reynard Way | http://localhost:5175/v3/reynard-way |
| Hawk Street | http://localhost:5175/v3/hawk-street |
| Jackson Street | http://localhost:5175/v3/jackson-st |
| Vista Pointe | http://localhost:5175/v3/vista-pointe |

### V3 vs V2 differences
- **Identical to V2 EXCEPT:** `local_guide` and `things_to_do` sections are **removed**
- **Added:** `activity_center` section — powered by the Global Activity Repository
- All other sections, design, night mode, hero, FAQ, checkout — identical to V2

### V3 Active Sections (in order)
`welcome` · `entry` · `parking` · `wifi` · `house_rules` · `the_home` · `additional_space` · `outdoor_spaces` · `services_maintenance` · `transport` · **`activity_center`** · `checkout`

### V3 Activity Center
- 4 category tabs: **RBC** (red), **Parks & Beaches** (green), **Shopping & Attractions** (amber), **Others** (blue)
- Default tab: RBC (Restaurants, Bars & Cafés)
- Same flip-card UI as V2 Local Guide (image front, details on tap)
- `resolveImg()` helper handles both local paths (`/images/local/...`) and external URLs
- Mobile: horizontal scroll tabs, "← swipe to see all categories →" hint, right fade gradient

### V3 Content Data Flow
1. `adminV3Store.js` — 36 seed activities pre-populated with images
2. V3 admin draft → `talo_admin_v3_draft` in localStorage
3. V3 admin publish → `talo_admin_v3_live` in localStorage
4. Guidebook reads: `talo_admin_v3_live` first, falls back to `talo_admin_v3_draft`
5. **To make activities show in guidebook:** go to `/admin-v3`, click Publish in the header

### V3 Admin Panel — `/admin-v3`

**New features over V2 admin:**

**1. Global Activity Repository (`/admin-v3/activities`)**
- Master library of all activities across all properties/cities
- Add/Edit/Delete activities
- Fields: Name* (required), Category* (required), Description, Address, Phone, Website, Image URL
- 4 categories: RBC · Parks & Beaches · Shopping & Attractions · Others
- Tile grid display with category filter tabs and search
- Adding an activity automatically adds it to all property curations (enabled by default)
- Deleting an activity removes it from all property curations

**2. Per-property Activity Curation (`/admin-v3/property/:slug/activities`)**
- Categories shown collapsed — expand to see activities
- Toggle each activity on/off per property (off = hidden in guidebook, stays in global repo)
- Reorder with ↑↓ arrows within each category
- Changes are property-specific

**3. Property Management**
- Add new property (`/admin-v3/add-property`) — slug auto-generated from name
- New properties get all sections blank + all activities enabled by default
- Deactivate/reactivate properties (hides from guidebook, stays in admin)

### V3 Data Schema (adminV3Store.js)

```js
// Activity object
{
  id: 'act-001',
  name: "Filippi's Pizza Grotto",   // required
  category: 'rbc',                   // required: 'rbc' | 'parks-beaches' | 'shopping-attractions' | 'others'
  description: '...',                // optional
  address: '...',                    // optional
  phone: '...',                      // optional
  website: 'https://...',            // optional
  imageUrl: '/images/local/x.jpg',   // optional — local path OR external URL
}

// Per-property curation
propertyCuration: {
  'reynard-way': {
    rbc: [{ activityId: 'act-001', enabled: true, order: 0 }, ...],
    'parks-beaches': [...],
    'shopping-attractions': [...],
    others: [...],
  }
}

// Property list (includes new properties added by Joe)
propertyList: [{ slug: 'reynard-way', status: 'active' }, ...]
```

### V3 Store Methods
```js
adminV3Store.getActivities()                              // all global activities
adminV3Store.addActivity(data)                            // add + sync to all property curations
adminV3Store.updateActivity(id, updates)
adminV3Store.deleteActivity(id)                           // remove from global + all curations
adminV3Store.getPropertyCuration(slug)                    // { rbc: [...], 'parks-beaches': [...], ... }
adminV3Store.toggleActivityForProperty(slug, cat, actId)  // flip enabled state
adminV3Store.reorderPropertyCategory(slug, cat, orderedIds)
adminV3Store.addProperty({ name, address })               // auto-generates slug
adminV3Store.setPropertyStatus(slug, 'active'|'inactive')
adminV3Store.publish()                                    // writes talo_admin_v3_live
adminV3Store.discardDraft()
```

---

## 7. Properties Reference

| Slug | Name | Address | Max Guests |
|---|---|---|---|
| `reynard-way` | Reynard Way | 3003 Reynard Way, San Diego, CA 92103 | 22 |
| `hawk-street` | Hawk Street | 3701-03 Hawk St, San Diego, CA 92103 | 16 |
| `jackson-st` | Jackson Street | 2525 Jackson St, San Diego, CA 92110 | 16 |
| `vista-pointe` | Vista Pointe | 3792 Vista Pointe, Bonita, CA 91902 | 16 |

**Check-in:** 4:00 PM · **Check-out:** 11:00 AM (all properties)

---

## 8. Photo Mapping — Vista Pointe ✅ & Jackson Street ✅

Both complete. See previous sessions for details.

**Reynard Way 🔲 & Hawk Street 🔲 — Still Needed**

### Process
1. Open Airbnb listing in Chrome, run this in DevTools console:
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

2. Copy photos to `public/photos/<slug>/`
3. Update `contentStore.js` with image paths
4. Bump `STORAGE_KEY` in `contentStore.js` (v8 → v9)
5. Deploy

---

## 9. GitHub Deployment

**Repo:** `https://github.com/talodeveloper/talo-guidebook`
**Live site:** `https://talodeveloper.github.io/talo-guidebook/`
**Account:** talodeveloper

**To push any update:**
```bash
cd /Users/anantgyan/talo-guidebook && npm run deploy
```

**GitHub token** (expires ~60 days from Jun 6 2025): stored locally.
If expired: GitHub → Settings → Developer settings → Personal access tokens → new classic token with `repo` scope, then:
```bash
git remote set-url origin https://talodeveloper:NEW_TOKEN@github.com/talodeveloper/talo-guidebook.git
```

**V3 not deployed yet.** When ready, just run `npm run deploy` — the SPA includes all routes.

---

## 10. Vite Config

```js
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/talo-guidebook/' : '/',
  server: { port: 5175, strictPort: true },
}))
```

---

## 11. Resume Prompts

### To work on V2 (guidebook or admin):
```
I'm continuing work on the "talo-guidebook" project.
Project root: /Users/anantgyan/talo-guidebook
READ /Users/anantgyan/talo-guidebook/Handoff.md FIRST — it has everything.

Quick V2 orientation:
- Dev server: npm run dev → port 5175
- V2 guidebook: http://localhost:5175/v2/reynard-way (also hawk-street, jackson-st, vista-pointe)
- V2 admin: http://localhost:5175/admin-v2 — Login: joe@talo.ventures / Mytalo@2026
- V2 live: https://talodeveloper.github.io/talo-guidebook/v2/reynard-way
- V1 (/:slug) — NEVER TOUCH IT
- localStorage: talo_admin_v2_draft / talo_admin_v2_live
- imgUrl() helper must be used for ALL image paths in V2GuidebookPage.jsx
- Vista Pointe ✅ Jackson Street ✅ photo mapped. Reynard Way 🔲 Hawk Street 🔲 need mapping.
- To deploy: cd /Users/anantgyan/talo-guidebook && npm run deploy
```

### To work on V3 (Activity Center / new admin features):
```
I'm continuing work on the "talo-guidebook" project.
Project root: /Users/anantgyan/talo-guidebook
READ /Users/anantgyan/talo-guidebook/Handoff.md FIRST — it has everything.

Quick V3 orientation:
- Dev server: npm run dev → port 5175
- V3 guidebook: http://localhost:5175/v3/reynard-way (also hawk-street, jackson-st, vista-pointe)
- V3 admin: http://localhost:5175/admin-v3 — Login: joe@talo.ventures / Mytalo@2026
- V3 is NOT yet deployed to GitHub Pages (V2 is live)
- V3 = V2 layout + Activity Center section (replaces Local Guide + Things To Do)
- Activity Center: 4 tabs (RBC, Parks & Beaches, Shopping & Attractions, Others), flip cards
- Global Activity Repository: 36 pre-seeded activities with local images from public/images/local/
- localStorage: talo_admin_v3_draft / talo_admin_v3_live / talo_admin_v3_auth
- Guidebook reads from talo_admin_v3_live (falls back to draft for preview)
- To make activities show: go to /admin-v3 → Publish
- V1 (/:slug) and V2 (/v2/:slug and /admin-v2) — NEVER TOUCH THEM
- resolveImg() helper in V3GuidebookPage.jsx handles both local paths and external URLs
```

---

*Session 1: Full V2 UI | Session 2: FAQ, hero, Vista Pointe | Session 3: Jackson Street | Session 4: GitHub Pages, images, print CSS, tablet | Session 5: Admin Panel V2 | Session 6: WYSIWYG editor, reorder, credentials, deployed | Session 7: V3 Admin (Global Activities, Property Curation, Add Property) + V3 Guidebook (Activity Center with tabs + flip cards) | Session 8: Firebase Firestore backend, Check-In page, Check-Out form, admin check-in/checkout records, blue Check In buttons, property info reorder, unpublished changes dropdown, greyed Publish, hide email if empty | Session 9: Stay-aware checkout matching, Guest Database admin page (flat tabular CSV export for email marketing), host phone visible on guidebook, Call/Text label, phone+email regex validation, composite grouping key fix (same-named bookers across properties no longer merge)*

---

## Sessions 10–12 (V3 sync + architectural overhaul) — LOCAL ONLY

V2 is unchanged in production. Everything below lives only in the local V3 codebase.

### What changed
1. **V3 brought to parity with V2 first** — Check-In page, admin Check-In Records / Checked Out / Guest Database pages, blue Check In buttons, host phone visible, Call/Text label, phone+email validation, composite grouping key, hide-email-if-empty, unpublished-changes dropdown with diff per section, always-visible Publish button.
2. **House Rules — mixed global + property ordering per property** — `_draft.propertyBlockOrder[slug][sectionKey]` is the overlay; `applyPropertyBlockOrder()` reorders both admin and guidebook reads.
3. **Global FAQ with per-property curation** — `_draft.globalFaq[]` + `_draft.faqCuration[slug] = [{id, source, enabled}]`. Property FAQ editor shows one mixed list; expanding a global question shows only an explanatory message ("This is a Global FAQ — common to all properties…"). Switch hides it per property. Guest FAQ reads via `buildFaqList()`.
4. **New V3 check-in flow** at `/v3/:slug/checkin` — interstitial "Did you make the reservation?" → Yes: primary booker (first+last+email+phone required + adults/minors counts + per-guest names/ages + admin-editable $50 offer text); No: guest (first+last required, email optional). Both write to `v2_checkins` with `checkinRole` field.
5. **Activity Center moved to its own page** at `/v3/:slug/activities` — FAQ-style accordions per category, flip cards inside.
6. **Activity categories are data-driven** — `_draft.activityCategories[]` editable from Global Activities → "Manage Categories" (rename any, delete custom, add unlimited). Auto-cycles color palette.
7. **Per-property Section Manager** at `/admin-v3/property/:slug/sections` — toggle any section off (content kept), reorder (parent+children move together), rename labels, add unlimited custom sections (`custom-<id>`). Built from `_draft.propertySectionConfig[slug]` via `buildV3Sections()`.
8. **Outdoor Spaces nested under The Home** — both in left/mobile TOC (click-to-expand chevron) and on the page (Outdoor renders as subsection like Additional Spaces).
9. **"Contact & Emergency Info"** is now a TOC subsection under House Rules — virtual entry anchored to the matching block by title.
10. **Property Info card visibility toggles** — `info.showPropertyCard / showWifiCard / showHostCard / checkInEnabled / showCheckoutTimeBanner` on each property. Toggle in admin Property Info; guidebook respects them. Check-in page shows a "not available" screen when disabled.
11. **Check-Out section editor — per-block toggles** — switch on each block (Before You Go, Legal Notice…) + dedicated switch for the amber check-out time banner. Stored in `_draft.disabledBlocks[slug] = [blockId,…]`. Guest checkout page filters them out for V3 only.
12. **Property deactivation hardened** — per-page state refreshes on slug change (PropertyHome/PropertyInfo/PropertyActivities) so stale names/data don't show after toggling status.
13. **Property delete** — 30-day cool-off after deactivation. Two-layer confirmation: warning ("you will lose access to the guidebook…"), then admin email + password re-entry. `adminV3Store.deleteProperty(slug)` purges propertyList/properties/faq/faqCuration/propertyCuration/propertySections/propertyBlockOrder/propertySectionConfig/disabledBlocks + all property blocks.
14. **Preview links fixed for new properties** — V3 guidebook layout now falls back to draft for unpublished property previews. V2 preview link hidden for non-base (`BASE_PROPERTY_SLUGS`) properties.
15. **Section spelling** — "Additional Space" → "Additional Spaces" in sections.js.
16. **Activity Center toggle/sort is real-time** — store now replaces curation object reference immutably so React state detects the change.

### Key new files
- `src/admin-v3/pages/PropertySections.jsx` — section manager UI
- `src/guidebook/v3/V3CheckInPage.jsx` — new check-in flow
- `src/guidebook/v3/V3ActivityPage.jsx` — Activity Center as its own page

### Key new store APIs (`src/data/adminV3Store.js`)
- `getChangeSummary()`, `getActivityCategories()`, `addActivityCategory()`, `renameActivityCategory()`, `deleteActivityCategory()`
- `getSectionConfig(slug)`, `setSectionConfig()`, `addCustomSection()`, `removeCustomSection()`
- `getGlobalFaq()`, `addGlobalFaqItem()`, `updateGlobalFaqItem()`, `deleteGlobalFaqItem()`
- `getFaqDisplay(slug)`, `setFaqCuration()`, `moveFaqEntry()`, `toggleFaqEntry()`, `addLocalFaqItem()`, `updateLocalFaqItem()`, `deleteLocalFaqItem()`
- `getOrderedBlocksForSection()`, `setPropertyBlockOrder()`
- `getDisabledBlocks()`, `isBlockDisabled()`, `toggleBlockDisabled()`
- `verifyCredentials()`, `deleteProperty()`
- Pure helpers exported for guidebook use: `applyPropertyBlockOrder()`, `buildFaqList()`, `buildV3Sections()`

### Data model additions in `talo_admin_v3_draft` / `_live`
```
activityCategories: [{key, label, color, accent}]
globalFaq: [{id, q, a}]
faqCuration: { [slug]: [{id, source: 'global'|'local', enabled}] }
propertyBlockOrder: { [slug]: { [sectionKey]: [blockId, …] } }
propertySectionConfig: { [slug]: [{key, enabled, label, icon, custom}] }
disabledBlocks: { [slug]: [blockId, …] }
propertyList[i].deactivatedAt: ISO timestamp (when status === 'inactive')
properties[slug].checkInWelcome / checkInOfferText: strings
properties[slug].showPropertyCard / showWifiCard / showHostCard: booleans (undefined = true)
properties[slug].checkInEnabled / showCheckoutTimeBanner: booleans (undefined = true)
```

---

## Two-phase production deployment plan

V2 stays untouched until both phases land. Changes batched by risk — architecture first (Phase 1) since everything else builds on it.

### Phase 1 — Architectural changes (deploy first)
The big structural shifts. Riskier because they change how data is read/written. Test thoroughly on local before promoting.

- New stores/data shapes: `propertySectionConfig`, `propertyBlockOrder`, `globalFaq`, `faqCuration`, `activityCategories`, `disabledBlocks`, `propertyList[].deactivatedAt`
- Per-property Section Manager (`/admin-v3/property/:slug/sections`) + dynamic section rendering on guidebook
- Activity Center moved to its own page (`/v3/:slug/activities`); data-driven categories with admin CRUD
- House Rules mixed global+property ordering per property
- Global FAQ + per-property mixing/disable
- New V3 check-in flow (interstitial + primary-booker branch)
- Outdoor Spaces nested under The Home + TOC dropdown behavior
- Property delete with 30-day cool-off + credential confirmation
- New preview-link behavior (V3-only for new properties)

**Phase 1 sanity checks before merging to main:**
1. `npm run build` succeeds
2. Open each of the 4 base properties at `/v3/<slug>` — TOC, sections, activity center page, FAQ, check-in interstitial, checkout all render
3. `/admin-v3` → Properties → Reynard Way → Manage Sections → toggle one section off → confirm hidden on guidebook
4. Global FAQ: add one → confirm appears on all 4 properties with disable switch
5. House Rules editor: reorder a global rule mid-list → confirm order saves per-property only
6. Add property "Test Villa" → preview link opens correctly without publishing
7. Deactivate a property → Property page still loads → re-activate → name updates correctly
8. Publish → live key updates → reload guest guidebook reflects changes

### Phase 2 — Polish & content features (deploy after Phase 1 is stable)
Lower-risk additions that depend on Phase 1.

- Property Info card visibility toggles (Property/Wi-Fi/Host/Check-In)
- Check-Out per-block toggles + amber time banner toggle
- Global FAQ row collapsed message ("This is a Global FAQ…")
- Activity Center sort/toggle real-time fix
- Stale-state fixes on PropertyHome/PropertyInfo/PropertyActivities
- "Additional Space" → "Additional Spaces" spelling
- Contact & Emergency Info as TOC subsection
- Your Host card moved under Property card in sidebar
- Sections grid: remove duplicate Check-Out

**Phase 2 sanity checks:**
1. In admin Property Info, toggle each card off → confirm matching guidebook card disappears
2. Check-Out editor: toggle Before You Go off + time banner off → guest checkout page reflects both
3. Click on a global FAQ row in property FAQ editor → confirm message appears (no editable preview)
4. Activity Center admin: re-order an activity with arrows → updates immediately
5. Re-publish → spot-check all 4 properties + 1 new test property

### Rollback
Each phase is one Git commit (or small series). To roll back: `git revert <commit>` and re-deploy. Both phases only touch V3 code paths and a new localStorage shape (V2 keys are untouched), so V2 production is unaffected by either rollback.

---

*Session 10: V2→V3 parity sync | Session 11: House rule + FAQ mixing, sections engine, Activity page, categories admin, dynamic check-in flow, deactivation/delete, preview-link fix | Session 12: Property Info card toggles, checkout part toggles, duplicate fix, menu/content order verified, QA pass, 2-phase deployment plan*

---

## Session 13 (image upload + fixes) — DEPLOYED & LIVE

All of the following is live in production at commit `b90fe7e`.

### What changed
1. **Sessions 10–12 deployed.** V3 went from local-only to live (commit `20aa485`). V2 untouched.
2. **Firebase Storage image upload** built end-to-end (see "Image upload" section above). All-Firebase, not Supabase.
3. **Reynard & Hawk image fixes** via signature-checked migration in `contentStore.js` (`_migrateHawkBedroomImages`) — only rewrites blocks whose images still match the original broken signature, so admin edits are preserved. Fixes: Hawk 1F bedrooms (dropped a living-room photo mislabeled "bunk beds", reduced to 3), Hawk 2F bedrooms (dropped a bathroom + living-room shot, reduced to 2), Hawk Outdoor (dropped mismatched BBQ caption, 3 imgs), Reynard bedrooms (reduced to 3), Reynard Studio (corrected captions, reduced to 3). Same migration also runs inside `adminV3Store` on draft/live and inside `contentStore.reloadFromLive` so Firestore data is corrected at runtime too.
4. **Per-property hero** (PropertyInfo → Hero Banner Image, day + night) and **global hero** (GlobalContent → Global Hero Banner, day + night).
5. **Activity photos** now upload via ImagePicker (was URL paste).
6. **Check-in guest count 0→30** (was 0→15) in `V3CheckInPage.jsx` — one property allows 22 guests.
7. **Publish now pushes to Firestore** (`pushToFirestore` in `adminV3Store.publish`). Root-cause fix for "uploaded image disappears on reload" — the real-time listener was overwriting local publishes with stale server data.
8. **ImagePicker bug fixes:** BASE_URL prefix for static-image previews on production (`e7d6c04`); don't dirty the draft / activate Publish when an upload is rejected (`b90fe7e`).

### Key new files
- `src/data/imageUpload.js` — upload/delete helpers + validation profiles
- `src/admin-v3/components/ImagePicker.jsx` — reusable image picker

### Key new store APIs (`src/data/adminV3Store.js`)
- `getBlockImages()`, `hasImageOverride()`, `setBlockImages()`, `clearBlockImages()` (per-property image overrides — `propertyImageOverrides[slug][blockId]`)
- `getGlobalHero()`, `setGlobalHero()`, `readPublishedGlobalHero()`
- `pushToFirestore()` (internal, called by `publish()`)

### Data model additions
```
globalHero: { day, dayPath, night, nightPath }
propertyImageOverrides: { [slug]: { [blockId]: [{src, caption, path}] } }
properties[slug].v3HeroImage / v3HeroImagePath: day hero (null = use global/default)
properties[slug].v3HeroImageNight / v3HeroImageNightPath: night hero
```

### Firebase setup done this session
- Upgraded project to **Blaze** (pay-as-you-go) plan — required for Storage
- Budget alert set at $10/mo (50/90/100% thresholds) in Google Cloud
- Storage rules published (see "Firebase Storage rules" above)
