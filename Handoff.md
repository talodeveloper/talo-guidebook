# Talo Guidebook — Session Handoff

> **Last updated: Jul 29 2026 — Global host info: Host Information moved from per-property to GlobalContent; mobile/tablet guidebook gets slim "Your Host" strip (Call/Text only)**
> Previous: Jul 11 2026 — Rental Terms rename + booking dates + guest→booker dropdown (getActivePrimaryBookers Cloud Function), false "unpublished changes" fix, wrong-workspace login guard, starter template + duplicate guidebook + global logo, lorem-ipsum check-in offer, preview-mode (?preview=1) fix
> Previous: Jul 2 2026 — Guest roster merge (co-guests + guest sign-ins under each primary booker), Guest Database full roster + P/G type column, smart checkout, maintenance-mode activation fix
> Previous: Jul 1 2026 — Per-property theme system (20 themes), night sky photo backgrounds, live iframe theme preview, rich-text toolbar additions
> Previous: Jun 25 2026 — Landing page redesign, password reset, super-admin routing fix, tenant data isolation for check-ins, new-account banner fix
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
> Session 13 — Image upload via Firebase Storage, Reynard+Hawk fixes, check-in count 0–30, V3 publish writes to Firestore. All deployed.
> Session 13.1 — Firebase Auth for all 3 admin logins, Firestore + Storage rules locked.
> Phase 1 (productization) — Multi-tenancy foundation: tenant data seam, TALO tenant seeded in Firestore, dual-write on publish, reads flipped to tenants/talo/data/live with legacy fallback, tenant-scoped Storage uploads, Firestore rules updated. Two bug fixes (spurious unsaved changes + spurious logout). All deployed and live.
> Phase 5 — Super-admin platform panel at /super-admin: login (checks superadmin claim), tenant dashboard, tenant detail, create tenant, scripts for bootstrapping claims.
> Phase 2 — Cloudflare Workers deployed, talo.llc apex + *.talo.llc wildcard live. host-based routing in App.jsx. Landing, Signup, WorkspaceLogin pages built.
> Phase 3 — provisionTenant Cloud Function deployed (us-central1). Self-serve signup end-to-end working.
> Phase 4 (partial) — Signup page live. Stripe still placeholder. Tenant isolation + data-loss bugs fully fixed.
> Session 14 (Jun 25 2026) — Landing page redesign, password reset flows, super-admin apex routing fix, check-in/checkout tenant isolation, new-account "Initial setup" banner fix, login screen copy update
> Session 15 (Jul 1 2026) — Per-property theme system + night backgrounds. See section below.
> Session 16 (Jul 2 2026) — Maintenance-mode activation fix + guest roster merge (co-guests & guest sign-ins unified under primary booker, Guest Database full roster + P/G column, smart checkout). See section below.
> Session 17 (Jul 11 2026) — Rental Terms rename, booking dates, guest→booker dropdown + Cloud Function, false-unpublished fix, wrong-workspace login guard, starter template + duplicate + global logo, lorem-ipsum offer, preview-mode fix. See section below.
> Everything below is confirmed and saved to disk.

---

## ⏪ LIVE STATE & ROLLBACK (read this first)

**Production URL:** `https://talodeveloper.github.io/talo-guidebook/`

**Current live commit (GitHub Pages):** `2499e22` — Fresh-device publish guard + guest guidebook flash fix (both deployed to GitHub Pages prod AND Cloudflare worker)

**Security state (Session 13.1):** Admin login is now real **Firebase Auth** (email/password) — the hardcoded `Mytalo@2026` is retired everywhere. **Firestore rules are locked**: `v2_content` public-read / auth-write; `v2_checkins` + `v2_checkouts` anonymous-create-only, auth-required to read/manage; deny-all default. Verified in production: guest PII reads are `permission-denied` for anonymous clients, guidebook content still public-readable. The Firebase Auth user lives in Firebase Console → Authentication → Users.
**Storage rules also locked (Session 13.1):** `properties/**` is public-read, but **create/update/delete require `request.auth != null`** (admin-only) plus the existing image-type/size/no-GIF checks on writes. Verified in production: anonymous upload returns `unauthorized`, public image read still works, authed admin upload confirmed working.
**Still open (next):** GitHub PAT embedded in local `.git/config` remote URL — rotate it (deferred; local-only, ~60-day expiry).

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

**Login (all three admins):** real **Firebase Auth** (email/password). The hardcoded `Mytalo@2026` is retired everywhere. Accounts live in Firebase Console → Authentication → Users. For local dev, sign in with whatever Firebase Auth user you've created.

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

### ✅ Completed (Productization)

**Phase 1 — Multi-tenancy foundation** (all deployed, commit `f6ff625`):
- `src/data/tenant.js` — single chokepoint for Firestore path resolution
- `scripts/seed-talo-tenant.mjs` — seeded `tenants/talo` + `slugs/talo` + auth claims (already executed)
- Publish dual-writes to `tenants/talo/data/live` (on top of legacy `v2_content/*`)
- `firebaseSync.js` reads from tenant path first; auto-falls back to legacy if absent
- New image uploads → `tenants/talo/properties/...` Storage path
- Firestore rules updated: `tenants/{tid}/data/live` public-read; `tenants/{tid}/checkins` auth-only
- Bug fixes: spurious "unsaved changes" after Firestore hydration; spurious logout on rapid refresh

**Phase 5 — Super-admin panel** (deployed, updated Jun 17 2026):
- `/super-admin` — completely separate dark-themed panel, no overlap with TALO admin
- Login verifies Firebase Auth + `role: 'superadmin'` custom claim
- Dashboard: all tenants, status/plan badges, "View" to navigate to detail (no inline destructive actions)
- Tenant Detail: properties, usage stats, last publish time, setup instructions + full Deactivate/Suspend/Reactivate flow
- Create Tenant: writes `tenants/{slug}` + `slugs/{slug}`, shows claims-script instructions
- `scripts/make-superadmin.mjs` — grants superadmin access to any Firebase Auth user
- `scripts/set-tenant-claims.mjs` — sets `{tenantId, role: 'owner'}` on any user

**Deactivate / Suspend / Reactivate flow (TenantDetail):**
- Status model: `active` → `deactivated` (stores `deactivatedAt`) → after 30 days: `suspended`
- **Deactivate** button: amber danger zone, opens confirmation modal — checkbox agreement + superadmin email/password re-verification via `signInWithEmailAndPassword`
- **Suspend** button: only appears 30+ days after deactivation, same modal pattern with stronger red styling
- **Reactivate** button: always visible for deactivated/suspended accounts, no credential re-check (low risk)
- **Data retention policy**: data is NEVER auto-deleted. Tenants can log in at any time to retrieve data and resume. Deletion only on explicit written tenant request + manual platform admin confirmation. Policy displayed prominently on detail page and in every modal.

### ✅ Productization foundation — COMPLETE

Everything below is done and live. The manual `set-tenant-claims.mjs` script is the only remaining rough edge — it gets replaced by Cloud Functions in P3.

- Multi-tenancy data seam (P1)
- Super-admin panel: login, dashboard, tenant detail (access links, contact info, account, usage, billing, properties, deactivation flow), create tenant (P5)
- Deactivation enforced at admin-v3: after Firebase Auth succeeds, tenant `status` is read from Firestore. Deactivated/suspended tenants **log in successfully but land on a full-screen locked wall** (`AccountLockedWall` in `src/admin-v3/Layout.jsx`) instead of the dashboard — all admin routes blocked, only Contact Support + Sign Out available. The locked state is flagged via `localStorage['talo_admin_v3_locked']` (set in `adminV3Store.login`, read by `adminV3Store.isLocked()`). The plan-selection placeholder on that wall gets replaced with real Stripe plan cards in P4.
- Payment expiry + plan gating UX fully designed (see memory note), ready to implement in P3/P4
- **Fresh-device publish guard (data-loss fix, Jun 24 2026):** `adminV3Store` used to build built-in defaults as the working draft when a browser had empty localStorage; clicking Publish then pushed those defaults to Firestore and reverted live content (this happened once during P2 testing on the workers.dev origin — recovered by re-publishing from the browser that still held the good draft). Fixed: on load with no local copy, the store now hydrates draft/live from `tenants/{tid}/data/live` (Firestore); Publish is blocked until authoritative data loads (`_ready` flag, fail-safe on error); defaults are only used for a genuinely new tenant that never published. Layout shows a loading/error screen while hydrating. Returning users (populated localStorage) use the unchanged fast path.
- **Tenant-isolation + data-loss fixes (Jun 24 2026, incident 2):** talo's live data was reverted to defaults a 2nd time. Root causes + fixes: (1) "defaults" = TALO seed content — new tenants now start from `buildEmptyDraft()` (blank), not `buildDefaultDraft()`; (2) `pushToFirestore` wrote GLOBAL `v2_content/blocks`+`/properties` on every publish (cross-tenant leak) — removed, now writes ONLY `tenants/{tid}/data/live`; (3) `publish()` is now async with a HARD GUARD: it refuses to write if Firestore already has uploaded (firebasestorage) images but the draft has none (a defaults revert) — returns `'blocked-defaults'`/`'blocked-error'`, Layout shows an alert. So a stale tab can no longer clobber live data once that tenant has uploaded images. Admin "Preview guidebook" link fixed to use `guidebookHref()` (was hardcoded `/v3/{slug}` → 404→login on subdomains). **Self-heal:** browsers that opened a new tenant's admin before the fix had the TALO seed persisted to localStorage; on load, a non-default tenant whose draft carries talo's BASE_PROPERTY_SLUGS now discards it + re-hydrates blank (talo itself never self-healed — gated to non-default tenants). **Known follow-up:** a brand-new tenant's GUEST guidebook can still show talo's sample content via the legacy `v2_content` read-fallback + hardcoded `contentStore` defaults (read-path leak — cosmetic, not data loss); fix = gate `firebaseSync` legacy fallback + `contentStore` defaults to the default tenant only.
- **Guest guidebook flash fix (Jun 24 2026):** `contentStore` now initialises blocks from the `talo_v3_guest_cache` (real published content written by `firebaseSync`) before falling back to legacy/built-in defaults, so returning guests render the correct images on first paint instead of flashing defaults until the Firestore snapshot arrives. First-ever visit still shows defaults once (no cache yet) then updates — unavoidable without SSR.
- **Storage note from the incident:** uploaded images are never deleted by publish. Pre-P1 uploads live under `properties/{slug}/{blockId}/...`; post-P1 under `tenants/talo/properties/{slug}/{blockId}/...`. Both are public-read. To recover a lost image reference, the file can be re-downloaded from its Storage URL and re-uploaded via the admin.

### ✅ Completed in this productization push (Jun 24 2026)

**P2 — Cloudflare Workers hosting (LIVE)**
- `wrangler.jsonc` deploys to two routes: `talo.llc/*` (apex marketing) + `*.talo.llc/*` (tenant subdomains). SPA fallback so all React routes work.
- `vite.config.js`: `base: process.env.DEPLOY_TARGET === 'cloudflare' ? '/' : (command === 'build' ? '/talo-guidebook/' : '/')`. Deploy: `npm run deploy:cf` (= `DEPLOY_TARGET=cloudflare vite build && wrangler deploy`).
- DNS: talo.llc nameservers moved to Cloudflare (clint + melany). Worker intercepts all traffic, including old GoDaddy parking A records.
- `src/data/tenant.js`: `getHostMode()` → `'apex' | 'tenant' | 'legacy'`. `getTenantId()` reads subdomain on `*.talo.llc`. `guidebookPath(slug, sub)`, `isTenantHost()`, `tenantOrigin(tenantId)`, `PLATFORM_DOMAIN = 'talo.llc'`, `RESERVED_SUBDOMAINS`.
- `src/App.jsx`: `ApexRoutes` (`/` → Landing, `/signup` → Signup, `/login` → WorkspaceLogin, `*` → redirect `/`). `TenantRoutes` (admin-v3 tree + `/:slug` guidebook at root).
- `src/platform/Landing.jsx`: marketing page, hero, 3 feature cards, brand gradient.
- `src/platform/Signup.jsx`: company name → auto-slug, slug field with `.talo.llc` suffix, email/password, plan picker (Free in beta). Submit: `createUserWithEmailAndPassword` → `httpsCallable(functions, 'provisionTenant')` → success screen with link to `{slug}.talo.llc/admin-v3`.
- `src/platform/WorkspaceLogin.jsx`: slug input → redirects owner to `{slug}.talo.llc/admin-v3` (Firebase sessions don't span subdomains; actual login happens on the tenant subdomain).
- Dev tip: `getHostMode()` honors `?host=apex|tenant|legacy` on localhost (`sessionStorage['talo_host_override']`) for local testing.

**P3 — provisionTenant Cloud Function (LIVE)**
- `functions/index.js`: HTTPS callable. Validates slug, runs Firestore transaction (atomically claims `slugs/{slug}` + creates `tenants/{slug}`), sets custom claims `{tenantId, role:'owner'}`. Project `talo-guidebook`, us-central1.
- Deploy: `npx firebase deploy --only functions`. `.firebaserc` + `firebase.json` in repo.
- NOTE: runtime is Node 20 (deprecated 2026-10-30) — bump to Node 22 before that date.

**Tenant data isolation + data-loss fixes (all deployed)**
1. `buildEmptyDraft()` — new tenants start blank, not with TALO seed
2. `pushToFirestore()` — now only writes `tenants/{tid}/data/live` (removed cross-tenant global `v2_content` writes)
3. `publish()` is async with a hard guard — blocks if Firestore has uploaded images but draft has none (returns `'blocked-defaults'` / `'blocked-error'`)
4. Self-heal — on load, non-default tenant with TALO's `BASE_PROPERTY_SLUGS` in draft → discards it + re-hydrates blank from Firestore
5. `hydrateFromFirestore()` — fresh browser/device loads real content before enabling publish; `_ready` flag; Layout shows loading/error screens during hydration
6. `contentStore` priority 2 reads `talo_v3_guest_cache` (returning guests see real images on first paint)
7. "Preview guidebook" link in PropertyHome uses `guidebookHref(slug)` via `guidebookPath()` (was hardcoded `/v3/{slug}` → 404 on subdomains)

**Deactivation enforcement (admin-v3)**
- `login()` sets `talo_admin_v3_locked` in localStorage for deactivated/suspended tenants; caller navigates to dashboard.
- `AdminV3Layout` renders `AccountLockedWall` (Contact Support + Sign Out, plan selection placeholder) when `isLocked()`.
- Deactivated tenants: CAN log in, CAN'T access any admin routes. Data is never auto-deleted.

---

### ✅ Session 14 (Jun 25 2026) — DEPLOYED & LIVE

**Password reset flows**
- `src/admin-v3/Login.jsx` — inline forgot-password flow using `sendPasswordResetEmail(auth, email)`. Toggle between login and reset forms; success screen shows "Check your inbox at {email}". No Firebase config changes needed.
- `src/super-admin/Login.jsx` — same pattern, dark indigo theme. Pre-fills email if already typed in login form.

**Super-admin routing fix on apex domain (`talo.llc`)**
- Bug: `/super-admin/login` and all super-admin sub-routes redirected to `/` on talo.llc (catch-all route caught them).
- Fix: added full super-admin route tree to `ApexRoutes` in `src/App.jsx` — pathless layout route wrapping dashboard/tenant/create-tenant, mirroring the legacy tree exactly to match all `navigate()` calls in Dashboard/Layout/TenantDetail.
- A second routing bug (wrong nesting made tenant detail paths `/super-admin/dashboard/tenant/:id`) was also fixed.

**Landing page full redesign** (`src/platform/Landing.jsx`)
- Dark charcoal theme (`#1C1C1E` — same tone as Claude Code / macOS dark UI), not pure black
- Left panel: pill badge → large gradient headline → description → "Get started free →" CTA → compact 3-feature vertical list (Live in 3 min, No app needed, Your own address)
- Right panel: tilted CSS phone mockup showing the Jackson property guidebook — real photo from `/photos/jackson-st/a4d681eb-0abb-4176-b4e0-e6a95ccad8e9.jpeg` at top with tab strip overlay, blurred welcome text lines + Check-in card + Wi-Fi card below
- Sticky frosted-glass nav with TALO logo, "How it works" / "Pricing" anchor links, Log in + Get started buttons
- Photo used: `/photos/jackson-st/a4d681eb-0abb-4176-b4e0-e6a95ccad8e9.jpeg` (rooftop/bay view at dusk)

**New-account "Unpublished changes → Initial setup" banner fix** (`src/data/adminV3Store.js`)
- Bug 1 (initial load): `hydrateFromFirestore()` left `_live = null` for brand-new tenants; `hasUnsavedChanges()` always returned `true` because `!_live`. Fixed: now sets `_live = JSON.parse(JSON.stringify(_draft))` and persists to localStorage when Firestore has no data — `hasUnsavedChanges()` computes `draft === live → false`.
- Bug 2 (discard): `discardDraft()` called `buildEmptyDraft()` but left `_live = null`, so the banner never cleared. Fixed: when `_live` is null, discard now aligns `_live` with the reset draft (same content, both equal, banner clears).

**Check-in / checkout tenant data isolation**
- Bug: `v2_checkins` and `v2_checkouts` are global Firestore collections with no tenant filter — testrentals admin was showing talo's check-in records.
- Write fix: `src/guidebook/v3/V3CheckInPage.jsx` and `src/guidebook/Checkout.jsx` now include `tenantId: getTenantId()` in every record written to Firestore.
- Read fix: `src/admin-v2/pages/CheckIns.jsx`, `Checkouts.jsx`, and `GuestDatabase.jsx` all client-side filter: `r.tenantId === tid || (!r.tenantId && tid === 'talo')`. This means: new records are strictly tenant-scoped; talo's legacy records (no `tenantId` field) remain visible to talo only.

**Login screen copy**
- `src/admin-v3/Login.jsx`: heading changed from "TALO Admin" → "Welcome" (subtitle unchanged: "Sign in to manage your guidebooks")

---

### ✅ Session 15 (Jul 1 2026) — Per-property theme system — DEPLOYED & LIVE

**Zero breaking changes guarantee:** Existing tenants have no `theme` field saved → layout resolves `v3data?.properties?.[slug]?.theme || 'modern'` → applies the `'modern'` (Default) theme which is visually identical to what was live before. Themes only change when a tenant explicitly picks one in Admin → Property Info → Guidebook Theme.

**20 themes across 6 categories** (`src/data/themes.js` — new file):
| Category | Themes |
|---|---|
| Coastal | Default (modern), Tropical Breeze, Deep Azure, Pearl Shore |
| Alpine & Nordic | Nordic Pine, Chalet Noir, Glacial Frost ✦ |
| Luxury & Urban | Midnight Gold ✦, Ivory Onyx, Obsidian Gloss ✦, Art Deco Noir |
| Mediterranean | Imperial Marble ✦, Amber Ruins ✦, Pompeii Gloss ✦, Lapis Cairo ✦ |
| Nature & Organic | Forest Canopy, Terracotta Bloom |
| Retro & Ancient | Neon Retro, Chrome Dusk, Copper Patina |

✦ = night-effect theme (real photo background in night mode — marked as premium tier, payment gate not yet built)

**Night backgrounds:** 7 themes show real photo backgrounds in night mode:
- Stars: Glacial, Obsidian Gloss, Amber Ruins, Pompeii Gloss → `public/images/space/starfield.jpg`
- Milky Way: Midnight Gold, Imperial Marble, Lapis Cairo → `public/images/space/milkyway.jpg`
- Photo darkened via `filter: brightness(0.20) saturate(1.6)` + `rgba(0,0,0,0.35)` film overlay
- No SVG dots/animations — pure real photos only

**Per-theme CSS vars** (all injected on `document.documentElement` by `injectTheme(themeKey, isNight)`):
- `--t-bg`, `--t-surface`, `--t-border`, `--t-primary`, `--t-gradient`, `--t-text`, `--t-muted` (and more)
- `--t-radius`, `--t-radius-sm` — structural shape (sharp for retro/luxury, rounded for nature/coastal)
- `--t-font-heading`, `--t-font-body` — Google Fonts loaded dynamically via injected `<link>` tags
- Night objects: `--t-bg: transparent` on starfield themes so body black shows through photo

**Admin theme picker** (`src/admin-v3/pages/PropertyInfo.jsx`):
- Live iframe preview — loads the actual guidebook at `?preview_theme=X`, fully interactive (scroll, tap night toggle — all works natively inside iframe)
- `pointer-events` and `scrolling` both enabled on the iframe
- Scrollable grid of all 20 themes grouped by category, swatch colors, glossy badge
- Saving writes `theme` field to `properties[slug]` via `adminV3Store.updatePropertyInfo`

**Rich-text editor toolbar additions** (`src/admin-v3/components/BodyEditor.jsx`):
- H2, H3, ¶ (paragraph) buttons via `document.execCommand('formatBlock', ...)`
- Bullet list button via `document.execCommand('insertUnorderedList')`
- Small A / Large A font-size buttons

**Key files changed this session:**
- `src/data/themes.js` — NEW, all 20 themes + `injectTheme()` + `loadGoogleFont()`
- `src/guidebook/v3/V3GuidebookLayout.jsx` — `injectTheme` call, `StarfieldBg` component, `?preview_theme=` param
- `src/guidebook/v3/V3GuidebookPage.jsx` — `--t-font-heading` on h1/h2, `--t-radius` on activity cards
- `src/guidebook/v3/V3FAQPage.jsx` — `--t-font-heading` on h1
- `src/guidebook/v3/V3ActivityPage.jsx` — `--t-font-heading` on h1
- `src/admin-v3/pages/PropertyInfo.jsx` — `ThemePhonePreview` (live iframe), `ThemePicker` component
- `src/admin-v3/components/BodyEditor.jsx` — H2/H3/¶/bullet/size buttons
- `public/images/space/starfield.jpg` + `milkyway.jpg` — real night sky photos

**Pending for theme system:**
- Payment gating for ✦ night-effect themes (marked premium, gate not yet built — all themes accessible for now)
- Theme field stored in `properties[slug].theme` in Firestore once tenant publishes

---

### ✅ Session 18 (Jul 29 2026) — committed, not yet deployed

**Global Host Information** (`adminV3Store.js`, `GlobalContent.jsx`, `PropertyInfo.jsx`, `V3GuidebookPage.jsx`):
- Host info (`ownerName`, `ownerPhone`, `ownerEmail`, `showHostCard`) moved from per-property to a new top-level `globalHostInfo` field. One host card, all properties.
- `getGlobalHostInfo()` / `setGlobalHostInfo()` added to store. `postProcessDraft` migration seeds the field on all existing drafts (starts empty — admin fills it in from Global Content). `hasUnsavedChanges` tracks changes.
- **Admin:** "Host Information" card removed from every property's Property Info page. Added to Global Content (after Guidebook Logo) with name, phone, email, show/hide toggle, and Save button.
- **Desktop guidebook** right sidebar: unchanged visually — reads from `globalHostInfo` now (Call/Text + Email as before, only if phone/email set and `ownerName` non-empty).
- **Mobile/tablet guidebook** (`lg:hidden`): new slim "Your Host" strip added below the Property Info block — shows host name + Call/Text button only (no Email). Hidden on desktop (`lg+`).

---

### ✅ Session 17 (Jul 11 2026) — DEPLOYED & LIVE

All committed + deployed to Cloudflare. Commits: `66829cc`, `c5897a5`, `7ad306d`, `88f8a3a`, `ec29a37`.

**"Check In" → "Rental Terms" rename** (`V3GuidebookPage.jsx`, `V3CheckInPage.jsx`): all 4 guest entry buttons + the check-in page's own headers/success screen/submit now say "Rental Terms" (icons removed). Check-Out unchanged. V1/V2 untouched.

**Booking dates** (`V3CheckInPage.jsx`, `guestRoster.js`, both admin views): primary booker form has required, validated Booking Check-In / Check-Out date fields (checkout must be after check-in). Stored on the record, shown next to the primary's name in Check-In Records, added as Guest Database columns, both CSVs, and the printed agreement.

**Guest → primary-booker dropdown** (fixes the old "guests fell into an Unknown group" gap): the guest self-check-in step shows a dropdown of the property's currently-active primary bookers; the guest picks theirs, which sets an explicit `primaryGuestName` link. `guestRoster.js` now matches by this exact link (falling back to the old timing heuristic only for legacy records) — this also corrected a wrong assumption that only one primary can be active per property (multiple concurrent bookings now handled). Empty dropdown → guest check-in blocked with a message.
- **New Cloud Function `getActivePrimaryBookers`** (`functions/index.js`, deployed us-central1): returns ONLY first/last names of active primary bookers for a property. Used instead of loosening Firestore rules — guests still can't read the check-in/checkout collections directly, so no PII exposure.

**False "unpublished changes" fix** (`adminV3Store.js`): `_live` only ran `migrateHawkBedroomImages` while `_draft` ran the full `postProcessDraft` pipeline, so they could never be byte-equal → false banner. Also the FAQ-id migration used `Math.random()` (non-deterministic across the two copies). Fixes: `_live` now runs the SAME `postProcessDraft` (with a `persistKey` param so backfills write to the live slot), and FAQ ids are deterministic (`lfaq-${slug}-${i}`). Removes the risk of publishing a stale snapshot on a false signal.

**Wrong-workspace login guard** (`adminV3Store.js login()`): compares the account's own `tenantId` claim vs the hostname's tenant; a mismatch is rejected + signed back out with a message. Legacy Talo accounts (no tenantId claim) unaffected.

**Starter template + Duplicate + Global logo** (all tenant-isolated, generic — no Talo data leaks):
- `loadStarterTemplate(slug)` fills an EMPTY property with generic `TEMPLATE_SECTIONS`/`TEMPLATE_FAQ` + 11 section-relevant SVG placeholders in `public/images/template/`. `isPropertyEmpty(slug)` guards it.
- `duplicateGuidebook(source, target)` deep-copies one filled property's whole guidebook (blocks, FAQ, section config, ordering, disabled blocks, curation, image overrides — all re-keyed) + host & display settings; keeps target's own name/address/Wi-Fi. Refuses unless target empty & source non-empty. Both offered only on an empty property (PropertyHome).
- `globalLogo { image, imagePath, wordmark }` in Global Content; new `logo` upload profile; guidebook header uses image→wordmark→nothing. Hardcoded "TALO" removed from hero, FAQ/Activity headers, check-in agreement.

**Lorem-ipsum check-in offer** (`adminV3Store.js`): `DEFAULT_CHECKIN_OFFER` was "TALO Rentals / $50 credit" (white-label leak) → now neutral placeholder. Only affects new properties + fallback; existing published properties keep their stored value.

**Preview-mode fix** (`V3GuidebookLayout.jsx`, `V3GuidebookPage.jsx`, `V3FAQPage.jsx`, `PropertyHome.jsx`, `PropertyInfo.jsx`): "Preview guidebook" + the theme-preview iframe now carry `?preview=1`. In preview the guidebook reads the DRAFT first (so new/unpublished/template properties resolve — no more redirect to admin login) and reads content blocks STRAIGHT FROM THE DRAFT (not contentStore, which firebaseSync overwrites with published data). Flag is sticky per-tab via `sessionStorage['v3_preview']`. Guests never carry it → only see published.

**⚠️ Known bug found this session (NOT yet fixed) — session guard can deadlock:** in `sessionStore.js`/`Layout.jsx`, when a session is taken-over or force-logged-out, the old tab's heartbeat is NOT stopped (the watchSession taken-over/force-logout branch returns without `stopHeartbeat`/`clearSession`). A stale session keeps writing `lastSeen`, looks "active" forever, and can lock out a legitimate user with no escape. Recommended: stop heartbeat on takeover/force-logout, add a "sign in here anyway (force takeover)" button on the challenge screen, shorten the stale window. (Surfaced while trying to automate a testrentals login for onboarding screenshots.)

**Onboarding playbook** (Jul 11): produced `~/Downloads/Talo-Host-Onboarding-Playbook.docx` — comprehensive Talo-branded new-host manual with 17 screenshot placeholders. Read-only task, no code changed. (Deliverable lives outside the repo.)

### ✅ Session 16 (Jul 2 2026) — Maintenance fix + guest roster merge — DEPLOYED & LIVE

**Maintenance-mode activation fix** (`src/admin-v3/Layout.jsx`, `src/data/maintenanceStore.js`, `src/admin-v3/MaintenanceScreen.jsx`):
- **Root-cause bug:** an open admin tab only updated maintenance status on a Firestore snapshot. A *scheduled* window's start time passing is not a document change (just the clock moving), so the tab stayed on `'upcoming'` forever and never locked out — the admin could keep editing/publishing during maintenance. Fixed: a 10s local tick recomputes the derived status from the stored data, so `upcoming→active` and `active→ended` flip on their own with no refresh.
- New `mode` field on the maintenance record (`'scheduled'` vs `'now'`):
  - **Scheduled** (advance notice): on activation, the unpublished draft is discarded + session ended; maintenance screen shows a "Sign in again" button and stays up until they re-auth. Upcoming banner warns to publish first.
  - **Start now** (no notice): draft + session preserved; when the window ends the tab auto-returns to the admin with unpublished changes intact.
- ⚠️ Follow-up not done: the super-admin Maintenance page "What happens" copy still says "At end → access restored automatically" for all cases — now only true for Start-now. Minor copy fix.

**Guest roster merge** — NEW `src/data/guestRoster.js` (pure, read-only merge engine; both admin views consume it so they never disagree):
- Unifies each booking's primary record + the co-guests the primary listed + guests who signed in themselves into one roster per booking.
- Matching: a guest self-check-in fills the person the primary listed, matched by **first name → last name on collision → earliest-entered wins on a full tie**. Only blank fields filled, never overwrites.
- Guests attach to their property's **single active stay** automatically — no "which booker?" field on the check-in form (the design rests on: one active booking per property at a time; overlap tiebreak = stay whose window contains the submit time, else most recent active).
- **Check-In Records** (`admin-v2/pages/CheckIns.jsx`): full roster per booker (first, last, age, email, phone) tagged Primary / Signed-in / Listed-by-booker; whole-group checkout preserved; per-row delete only for rows backed by a real check-in doc; orphan guests (no primary yet) shown under a "Guests — no primary booker yet" group.
- **Guest Database** (`admin-v2/pages/GuestDatabase.jsx`): lists EVERYONE (bookers + all guests). Columns: **Type (P/G)** · First · Last · Email · Phone · Age · Property · Checked-In · Checked-Out. Legend explains blank fields (guest age from booker; email/phone only after they self-sign-in). CSV export (opens in Excel) with all columns.
- **Checkout** (`guidebook/Checkout.jsx`): only checks out when an active stay exists for that booker+property; otherwise shows "You've already checked out from this property" and writes nothing. Whole group checks out together (`isStayActive` from the engine).
- Verified with a 16-case Node test of the pure engine (co-guest merge, email fill-in, first/last collision, unmatched-guest-as-own-row, age preservation, full DB roster, checkout active/inactive/wrong-name). Test was throwaway, not committed.
- **Data note:** guest records created before Jul 2 2026 have no primary-booker link, so historical guests may appear under "Guests — no primary booker yet." New check-ins merge correctly.

### ✅ Already built (confirmed Jul 1 2026)

**1. Progress bar on signup** — ✅ DONE (animated steps during Cloud Function call)
**2. New-tenant guest guidebook read-path leak** — ✅ DONE (gated legacy fallback to talo only)
**3. Delete Tenant in super-admin** — ✅ DONE (typed slug confirmation + credential re-verify + deletes tenants/{id} + slugs/{slug})

### 🔲 Active pending tasks (in priority order)

**1. Slug-change feature (`talo → sd`)**
- User wants to rename `talo.talo.llc` to `sd.talo.llc`. Currently impossible because `tenantId === slug` — every Firestore path, Storage path, and Auth claim references the slug as the stable ID.
- `slugs/{slug} → { tenantId }` lookup table already exists in Firestore, but the frontend reads the subdomain directly as the tenantId.
- Full fix requires: (1) decouple tenantId from slug (tenantId becomes a stable UUID or internal id, slug is a mutable label); (2) Cloudflare Worker resolves slug → tenantId via Firestore before serving; (3) all data paths use tenantId, not slug. This is a non-trivial schema migration — design carefully before starting.

**5. Node 20 → 22 for Cloud Function** ← BEFORE OCT 2026
- Node 20 deprecation: 2026-10-30.
- Files: `firebase.json` (change `"runtime": "nodejs20"` → `"nodejs22"`) + `functions/package.json` (engine field).
- Then: `npx firebase deploy --only functions`.

**6. Stripe integration** ← BLOCKED: need Stripe account
- Plans currently "Free in beta" — all placeholder in `Signup.jsx` and `AccountLockedWall`.
- When Stripe account is ready: wire Stripe Checkout to the plan cards, add webhooks for `customer.subscription.updated/deleted` → update `tenants/{tid}/status` + `plan` in Firestore.
- Grace-period logic (3-day countdown banner → locked wall) is already designed — see "Payment expiry UX" section below.

**7. P6 Support ticket system** ← AFTER Stripe

**8. Multilingual support (Spanish + English)** ← TARGET: Aug–Sep 2026
- Two halves:
  - **Tenant side (`/admin-v3`):** "Support" sidebar item. Tenant submits a ticket (subject + message). Stored in `tenants/{tenantId}/support/{ticketId}` + mirrored to top-level `supportTickets/{id}` with `tenantId` + `tenantName` for super-admin querying. Tenant sees own ticket history + status.
  - **Super-admin side (`/super-admin`):** "Support" panel — all tickets across all tenants, showing which account raised it. Filter by status. Reply + mark resolved. Open-ticket badge on dashboard.
  - Firestore rules: tenants read/write own tickets only; superadmin reads/writes all.

---

### 🔲 Next — blocked on external dependencies

2. **Stripe account** → unblocks P4 billing. Create at stripe.com (free).

### Multilingual Support Plan — Aug/Sep 2026

**Goal:** Full English + Spanish support for both the guest guidebook and the admin panel, so Spanish-speaking property owners can manage their properties entirely in Spanish.

**Key insight:** All content (welcome text, house rules, FAQ, activity descriptions, property names) is already typed by the host and works in any language today. The only gap is ~350–500 hardcoded UI strings in the product.

---

#### Phase 1 — Infrastructure (1 session)
1. Add `react-i18next` (handles plurals, interpolation, namespaces — don't roll a custom solution)
2. Create `src/i18n/en.js` and `src/i18n/es.js` — flat key-value files, one namespace per area (`common`, `admin`, `guidebook`)
3. `src/i18n/index.js` — initialise i18next, detect language from localStorage, expose `useTranslation` hook
4. Language preference storage:
   - Admin panel: `talo_admin_language` in localStorage (per browser, not synced across devices — simple)
   - Per-property guidebook language: new field `properties[slug].language = 'en' | 'es'` in the admin store. Guest opens guidebook → language is set by the property, not a guest preference toggle
5. Language switcher in admin nav (small EN/ES toggle, top-right of Layout sidebar)

---

#### Phase 2 — Admin panel strings (3–4 sessions)

Every visible hardcoded string in every admin page needs wrapping in `t('key')`. Pages to cover:

| File | Approximate string count |
|---|---|
| `src/admin-v3/Layout.jsx` | ~40 (sidebar labels, Publish/Discard/Unpublished changes, modals, status toasts) |
| `src/admin-v3/Login.jsx` | ~15 (labels, placeholders, error messages, password reset) |
| `src/admin-v3/pages/Dashboard.jsx` | ~20 (headers, empty states, property cards) |
| `src/admin-v3/pages/PropertyHome.jsx` | ~25 (section grid, status badges, action buttons) |
| `src/admin-v3/pages/PropertyInfo.jsx` | ~40 (all form labels, placeholders, helper text) |
| `src/admin-v3/pages/SectionEditor.jsx` | ~30 (block labels, add/remove, reorder) |
| `src/admin-v3/pages/PropertySections.jsx` | ~20 (section manager labels) |
| `src/admin-v3/pages/GlobalActivities.jsx` | ~30 (activity modal, category manager) |
| `src/admin-v3/pages/PropertyActivities.jsx` | ~20 |
| `src/admin-v3/pages/GlobalContent.jsx` | ~15 |
| `src/admin-v3/pages/FAQEditor.jsx` | ~20 |
| `src/admin-v3/pages/AddProperty.jsx` | ~15 |
| `src/admin-v2/pages/CheckIns.jsx` | ~30 |
| `src/admin-v2/pages/Checkouts.jsx` | ~20 |
| `src/admin-v2/pages/GuestDatabase.jsx` | ~20 |
| `src/super-admin/` (all pages) | ~50 (separate from tenant admin — lower priority) |

Total admin: ~400 strings. Mechanical but must be thorough — one missed string looks jarring.

Special cases:
- Interpolated strings: `"${count} properties"` → `t('property_count', { count })` with plural form in both locale files
- Firebase Auth error codes (auth/wrong-password, auth/user-not-found, etc.) → map to translated messages manually
- Date formatting: use `Intl.DateTimeFormat` with locale code (`'en-US'` vs `'es-ES'`) — affects check-in records, tenant dashboard timestamps

---

#### Phase 3 — Guest guidebook strings (1 session)

Smaller scope — ~40–60 strings. Key files:

| File | Strings |
|---|---|
| `src/guidebook/v3/V3GuidebookPage.jsx` | Tab labels ("The Home", "Rules", "Tips"), night mode toggle, section default labels |
| `src/guidebook/v3/V3ActivityPage.jsx` | "Back to Guidebook", "places · tap to explore", category names |
| `src/guidebook/v3/V3CheckInPage.jsx` | All form labels, validation messages, button text (~25 strings — highest guest impact) |
| `src/guidebook/v3/V3FAQPage.jsx` | Page title, empty state |
| `src/guidebook/Checkout.jsx` | Form labels, confirmation text |
| `src/data/adminV3Store.js` | `ACTIVITY_CATEGORIES` default labels (if not renamed by host) |

Guidebook language is determined by `properties[slug].language` — no guest-visible toggle. The host sets it once in admin Property Info.

---

#### Phase 4 — Translation & QA (1 session)

1. Fill out `es.js` with all Spanish translations (can use AI-assisted draft, host reviews)
2. End-to-end QA pass:
   - Switch admin to Spanish → check every page for missing keys (i18next shows key name when missing)
   - Open guidebook for an `es`-language property → check form labels, activity page, FAQ, checkout
   - Test plurals: 1 property vs 3 properties ("1 propiedad" vs "3 propiedades")
   - Test date formats: check-in records should render `dd/mm/yyyy` style for Spanish
3. Add language field to admin Property Info UI (EN / ES selector) and wire it to guidebook rendering

---

#### Effort summary

| Phase | Sessions | Output |
|---|---|---|
| Infrastructure | 1 | i18n setup, language storage, switcher |
| Admin panel | 3–4 | All ~400 admin strings translated |
| Guest guidebook | 1 | ~50 guidebook strings translated |
| Translation + QA | 1 | Full Spanish locale file, QA pass |
| **Total** | **6–7 sessions** | Complete EN + ES product |

**Not in scope:** Right-to-left layout (Spanish is LTR), V1/V2 admin (deprecated), super-admin panel (English-only is fine for now — admins are platform operators).

---

### Payment expiry UX (agreed, build in P3/P4)
- **Grace period:** 3-day countdown banner inside admin panel, full access retained
- **Locked state:** guidebooks go dark, admin login works but lands on plan wall (Sign Out only)
- **Plan gating:** plans filtered by active property count at purchase time (e.g. 10 properties → Starter hidden)
- **Downgrade:** allowed anytime, takes effect next billing cycle, no mid-period refunds

### Super-admin credentials (live)
- **URL:** `https://talodeveloper.github.io/talo-guidebook/super-admin`
- **Login:** `saari.joseph@gmail.com` + password set in Firebase Console
- **Claims:** `role: superadmin` (set via `make-superadmin.mjs` on Jun 16 2026)
- **Note:** This is a separate Firebase Auth account from Joe's TALO admin (`joe@talo.ventures`). The two panels are fully isolated.
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
- **Login:** Firebase Auth (email/password) — account in Firebase Console → Authentication → Users
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

### Master handoff prompt (copy-paste this into a new Claude window)
```
I'm continuing work on the "talo-guidebook" project — a React SPA being productized into a multi-tenant SaaS platform for short-term rental guidebooks.

Project root: /Users/anantgyan/talo-guidebook
READ /Users/anantgyan/talo-guidebook/Handoff.md FIRST — it has the full history, architecture, and pending task list.

== CURRENT LIVE STATE (as of Jul 1 2026) ==

Two separate deploy targets:
1. GitHub Pages (legacy): https://talodeveloper.github.io/talo-guidebook/ — V2 + V3 admin + V3 guidebook for the original TALO properties. Deploy: npm run deploy
2. Cloudflare Workers (new): talo.llc (apex marketing site) + *.talo.llc (per-tenant). Deploy: npm run deploy:cf (= DEPLOY_TARGET=cloudflare vite build && wrangler deploy)

Firebase project: talo-guidebook (Blaze)
- Firestore: multi-tenant model — tenants/{tenantId}/data/live (per-tenant published content), slugs/{slug} (slug→tenantId map)
- Auth: real Firebase Auth (email/password). Custom claims: {role:'superadmin'} for super-admin, {tenantId, role:'owner'} for tenant owners
- Cloud Functions: provisionTenant (HTTPS callable, us-central1) — self-serve tenant creation
- Storage: public-read, auth-required write

Host routing: getHostMode() in src/data/tenant.js returns 'apex'|'tenant'|'legacy'
- apex (talo.llc) → ApexRoutes: Landing, Signup, WorkspaceLogin
- tenant (*.talo.llc) → TenantRoutes: admin-v3 + /:slug guidebook
- legacy (github.io) → all old routes

== ACTIVE PENDING TASKS (in priority order) ==

1. SLUG-CHANGE FEATURE (talo → sd) — complex, needs design
   User wants to rename talo.talo.llc to sd.talo.llc.
   Currently impossible: tenantId === slug, used as primary key everywhere (Firestore paths, Storage paths, Auth claims).
   slugs/{slug} → { tenantId } lookup table already exists but getTenantId() reads subdomain directly.
   Need to decouple: stable internal tenantId (UUID) + mutable slug label. Non-trivial migration.
   Read Handoff.md for full context before starting this one.

5. NODE 20 → 22 FOR CLOUD FUNCTION — deadline Oct 30 2026
   files: firebase.json ("runtime": "nodejs20" → "nodejs22") + functions/package.json (engine field)
   then: npx firebase deploy --only functions

6. STRIPE INTEGRATION — blocked: need Stripe account first
   Plans are "Free in beta" placeholder everywhere. When Stripe account is ready, wire up plan billing.

7. P6 SUPPORT TICKETS — after Stripe
   Tenant submits tickets in /admin-v3 sidebar. Super-admin sees all tickets + which account raised it.

8. MULTILINGUAL SUPPORT (EN + ES) — target Aug/Sep 2026
   Full English + Spanish for both admin panel and guest guidebook. 6–7 sessions total.
   See "Multilingual Support Plan" section below for full phase breakdown.
   Key decision: per-property language (host sets it in Property Info), not a guest toggle.
   Infrastructure: react-i18next, src/i18n/en.js + es.js, language switcher in admin nav sidebar.

== KEY FILES ==
src/data/tenant.js — getTenantId, getHostMode, guidebookPath, tenantOrigin, PLATFORM_DOMAIN
src/data/themes.js — all 20 themes, injectTheme(), loadGoogleFont() — NEW in Session 15
src/data/adminV3Store.js — all V3 admin state, publish guard, self-heal, hydrateFromFirestore
src/data/firebaseSync.js — onSnapshot listeners; falls back to legacy v2_content path (READ-LEAK BUG HERE)
src/data/contentStore.js — hardcoded TALO defaults (READ-LEAK BUG HERE TOO)
src/admin-v3/Layout.jsx — AccountLockedWall, LoadingContent, LoadContentError, handlePublish (async)
src/admin-v3/pages/PropertyInfo.jsx — ThemePhonePreview (live iframe), ThemePicker (20 themes)
src/guidebook/v3/V3GuidebookLayout.jsx — theme injection, StarfieldBg, ?preview_theme= param
src/platform/Signup.jsx — self-serve signup form (PROGRESS BAR GOES HERE)
src/super-admin/pages/TenantDetail.jsx — Deactivate/Suspend/Reactivate flow (DELETE GOES HERE)
functions/index.js — provisionTenant Cloud Function
wrangler.jsonc — Cloudflare Worker routes
public/images/space/ — starfield.jpg (stars) + milkyway.jpg (Milky Way) — night backgrounds

== CRITICAL RULES ==
- V1 (/:slug admin + guidebook) — NEVER TOUCH
- V2 admin/guidebook — NEVER TOUCH unless fixing a V2-specific bug
- pushToFirestore() writes ONLY tenants/{tid}/data/live — never global v2_content/* (cross-tenant pollution)
- publish() is async, always await it, check result ('blocked-defaults'|'blocked-error'|true|false)
- New tenants start from buildEmptyDraft() — never buildDefaultDraft() (TALO seed)
- Icon component: <Icon name="icon_name" /> uses material-symbols-outlined CSS class — NEVER inline fontFamily: 'Material Icons'
- Dev server: npm run dev → port 5175 (strictPort)
- To test apex: localhost:5175?host=apex (persisted in sessionStorage)
- To test tenant: localhost:5175?host=tenant&tenant=testrentals
```

### To work on V2 (guidebook or admin):
```
I'm continuing work on the "talo-guidebook" project.
Project root: /Users/anantgyan/talo-guidebook
READ /Users/anantgyan/talo-guidebook/Handoff.md FIRST — it has everything.

Quick V2 orientation:
- Dev server: npm run dev → port 5175
- V2 guidebook: http://localhost:5175/v2/reynard-way (also hawk-street, jackson-st, vista-pointe)
- V2 admin: http://localhost:5175/admin-v2 — Login: Firebase Auth user (see Firebase Console → Authentication)
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
- V3 admin: http://localhost:5175/admin-v3 — Login: Firebase Auth user (see Firebase Console → Authentication)
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

---

*Sessions 14–18 notes missing from Handoff.md — see memory file (talo-guidebook-project.md) for the Jul 2026 features: 20-theme system, guest roster merge, Rental Terms + booking dates + booker dropdown, starter template / duplicate / global logo, preview mode, maintenance mode, global host info migration.*

---

## Session 19 (Aug 31 2026) — DEPLOYED & LIVE

All of the following is live in production (Cloudflare Workers via `npm run deploy:cf`).
Cloud Functions deployed to us-central1 via Firebase CLI.
**Git commits are local only — `git push` was NOT run during this session. Push before next session.**

### What changed

1. **Two-step primary booker check-in flow — complete end-to-end**
   - Step 1: primary booker fills rules + personal details + check-in/out dates + cars/day-visitors → single `setDoc` creates a new doc in `v2_checkins` with pre-generated ref (doc id known before write). All state updates execute OUTSIDE the try block so a failed write aborts without a blank screen.
   - Step 2: primary booker enters co-guest names + ages → another `setDoc` creating a brand-new doc (NOT `updateDoc`) with the full payload (all primary data re-included + co-guest data + `step1DocId` link + `resumeUrl`). New doc becomes the `lead` in `buildGuestGroups` because it's newer; step-1 doc remains as audit trail.

2. **Resume link — stored invisibly, admin-accessible**
   - Resume URL (`?resume=<step1DocId>`) is stored in Firestore (both step-1 and step-2 docs carry `resumeUrl`) but never shown to the guest.
   - Admin Check-In Records page shows a **"Resume Link"** copy button next to each primary booker's name (visible always — even after step 2 complete, because step-2 doc also carries `resumeUrl`).
   - Copying writes to clipboard; button briefly shows "Copied!" feedback.

3. **Resume link deep-links to step 2 (skips choice screen)**
   - Opening `?resume=<id>` pre-populates all primary booker state and navigates directly to `primaryStep = 'guests'` — the co-guest form — bypassing step 0 (primary/guest choice) and the rules form.

4. **Resume link works in incognito / unauthenticated sessions**
   - **Root cause of prior failure:** `getDoc()` on `v2_checkins` requires Firebase Auth (security rules: `allow read: if request.auth != null`). Incognito has no auth → silent failure → component stayed on step 0.
   - **Fix:** New `getCheckinResume` Cloud Function (Firebase Admin SDK, bypasses rules). Resume `useEffect` now calls `httpsCallable(functions, 'getCheckinResume')` instead of `getDoc()`. Works with no auth session.

5. **Step-2 "check your internet connection" error — fixed**
   - Root cause: previous code used `updateDoc` on the existing step-1 doc. Firestore rules allow `create` for guests but NOT `update`. Every step-2 submission was rejected.
   - Fix: `setDoc` to a brand-new doc ID instead.

6. **Blank screen after step-1 submit — fixed (third time; now definitive)**
   - Root cause: prior code used `addDoc` then `updateDoc` (to add `resumeUrl`). The `updateDoc` failed (same rules issue). Catch block returned early before `setPrimaryStep('guests')` could run.
   - Fix: Pre-generate doc ref with `doc(collection(db, 'v2_checkins'))`, include `resumeUrl` in the initial `setDoc` payload. Single write, state updates outside try.

7. **Success screen centered on screen (desktop + mobile)**
   - Separate DOM containers for screen view and print view. Screen container: `min-h-screen flex flex-col items-center justify-center`. Print container: hidden on screen, shown only in `@media print`.

8. **PDF download always white background**
   - Root cause: `[data-theme="dark"]` selector has higher specificity than bare `:root`. Dark theme vars were winning over print-block vars.
   - Fix: `!important` on all CSS custom property overrides inside `@media print { :root { … } }`.

9. **Exported 36 Talo activities to Excel** — file placed in `~/Downloads/talo-activities.xlsx`. No code changes.

### Files changed

| File | Change |
|---|---|
| `src/guidebook/v3/V3CheckInPage.jsx` | `handleSubmitStep1` rewritten (single `setDoc`, pre-generated ref, state outside try); `handleSubmitStep2` rewritten (`setDoc` new doc, carries `resumeUrl`); resume `useEffect` now calls `getCheckinResume` Cloud Function; success screen centered + PDF white fix |
| `src/data/guestRoster.js` | `buildGuestGroups` now includes `resumeUrl`, `carsCount`, `dayVisitorsCount` on group object |
| `src/admin-v2/pages/CheckIns.jsx` | Added "Resume Link" copy button in primary booker header row |
| `functions/index.js` | Added `getCheckinResume` Cloud Function (Admin SDK, unauthenticated, returns step-1 doc fields only) |

### Data model (v2_checkins)

Step-1 doc (created on step-1 submit, lives as audit trail):
```
{ tenantId, propertySlug, propertyName, checkinRole: 'primary',
  firstName, lastName, guestName, primaryGuestName, email, phone,
  submittedAt, submittedAtFormatted, agreedRules[],
  stayCheckIn, stayCheckOut, carsCount, dayVisitorsCount,
  adultsCount: 0, minorsCount: 0, coGuests: [],
  resumeUrl: 'https://…?resume=<this-doc-id>' }
```

Step-2 doc (created on step-2 submit, becomes `lead` for admin display):
```
{ …same primary fields…,
  adultsCount, minorsCount, coGuests: [{firstName, lastName, age, isMinor}],
  step1DocId: '<step-1-doc-id>',
  resumeUrl: 'https://…?resume=<step-1-doc-id>' }
```

### Multi-session guest entry (accepted limitation)
Opening resume link always pre-populates from step-1 doc (which has `coGuests: []`). Each resume session REPLACES the guest list, not appends. True additive sessions would require querying for the latest step-2 doc — blocked by Firestore read rules (`allow read: if request.auth != null`) without another Cloud Function. Accepted for now.

### Cloud Functions deployed this session
- `getCheckinResume` — new, deployed us-central1
- `getActivePrimaryBookers` — pre-existing, unchanged

### Pending (carried forward)
- **Push to GitHub:** 7 local commits not yet pushed. Run `git push origin main`.
- **Node 20 → 22 Cloud Functions** — deadline Oct 30 2026
- **Stripe integration** — blocked on Stripe account
- **P6 Support ticket system** — after Stripe
- **Session guard deadlock bug** — found Jul 11 2026, not yet fixed
- **Multi-session additive guest entry** — accepted limitation, noted above
- **Slug-change feature** — complex, no ETA
