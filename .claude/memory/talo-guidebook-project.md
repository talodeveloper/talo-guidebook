---
name: talo-guidebook-project
description: "talo-guidebook React SPA — architecture, key files, completed features, and pending work"
metadata: 
  node_type: memory
  type: project
  originSessionId: dd528a12-5454-4c39-9d7a-e751ecb8a812
  modified: 2026-09-05T19:36:19.755Z
---

# Talo Guidebook — Project State

**Repo:** `/Users/anantgyan/talo-guidebook`
**Stack:** React 19 + React Router v7 + Vite 8 + Tailwind CSS v3 + Firebase (Auth + Firestore + Cloud Functions) + Cloudflare Workers
**Deploy:** `npm run deploy:cf` (builds then wrangler deploys). GitHub Pages fully retired — no deploy or predeploy scripts remain.

---

## Architecture

- Multi-tenant SaaS: each tenant gets `{slug}.talo.llc` subdomain
- Host routing: `getHostMode()` → `'apex' | 'tenant' | 'legacy'`
- Tenant ID resolved from subdomain; fallback = `DEFAULT_TENANT_ID = 'talo'`
- Firestore:
  - `tenants/{tid}/data/live` → `{ data: <full dataset>, updatedAt: Date.now() }`
  - `tenants/{tid}/data/_session` → session management doc
  - `_platform/maintenance` → platform-wide maintenance schedule (super-admin only)
- localStorage keys:
  - `talo_admin_v3_draft` — admin's working draft
  - `talo_admin_v3_live` — last published version (admin's copy)
  - `talo_v3_guest_cache` — Firestore snapshot for guests (never overwritten by admin)
  - `talo_admin_v3_loaded_at` — Firestore `updatedAt` when content was last loaded (staleness guard)
  - `talo_admin_v3_published_at` — cross-tab broadcast: written on every publish, listeners mark other tabs stale
  - `talo_session_id` (sessionStorage) — SESSION_ID persists across page refreshes but clears on tab close
- Firebase Auth custom claims: `{role:'superadmin'}` or `{tenantId, role:'owner'}`

---

## Key Files

| File | Purpose |
|---|---|
| `src/data/adminV3Store.js` | Central store — draft/live state, publish, discard, staleness guard, syncRemoteAt, forceReset, postProcessDraft migrations |
| `src/data/sessionStore.js` | Session state machine in Firestore — multi-login detection, heartbeat, force-logout |
| `src/data/inactivityTimer.js` | 15-min auto-logout with 12-min warning banner |
| `src/data/contentStore.js` | Block/section seed data for guidebook rendering — all blocks now per-property (no type:'shared' outside house_rules/local_guide/things_to_do) |
| `src/data/maintenanceStore.js` | Firestore `_platform/maintenance` — scheduleMaintenance, startMaintenanceNow, cancelMaintenance, watchMaintenance, fmtTime, fmtCountdown |
| `src/data/tenant.js` | Tenant resolution, host mode, Firestore path helpers |
| `src/admin-v3/Login.jsx` | Login form + ChallengeWaiting screen (Person B 30s countdown). Background: destination image collage (20 Unsplash tiles + dark radial overlay). Frosted glass card. |
| `src/admin-v3/Layout.jsx` | Admin panel header, Publish/Discard, session banners, inactivity banner, maintenance watcher + gate |
| `src/admin-v3/MaintenanceScreen.jsx` | Full-screen maintenance overlay — 5×4 destination tile grid, frosted glass card, countdown |
| `src/admin-v3/pages/SectionEditor.jsx` | Section block editor — all blocks now deletable (isDeletable always returns true) |
| `src/super-admin/pages/Maintenance.jsx` | Super-admin maintenance scheduler UI — start now, schedule window, cancel |
| `src/super-admin/pages/TenantDetail.jsx` | Super-admin tenant detail + Delete Tenant modal + Force Sign Out button |
| `src/data/themes.js` | 20 per-property themes (day+night CSS vars, fonts, radii), `injectTheme()`, `loadGoogleFont()` |
| `src/data/guestRoster.js` | Read-only merge engine: unifies primary + co-guests + guest sign-ins per booking; `buildGuestGroups`, `buildGuestDatabaseRows`, `getActivePrimaryBookers`, `isStayActive` |
| `src/data/imageUpload.js` | Firebase Storage upload + validation profiles (`default`, `hero`, `logo`) |
| `functions/index.js` | Cloud Functions: `provisionTenant` + `getActivePrimaryBookers` (names only, no PII) + `getCheckinResume` (fetches step-1 doc for resume flow, Admin SDK, unauthenticated) |
| `src/admin-v3/pages/PropertyHome.jsx` | Property hub + empty-state head-start (Load starter template / Duplicate an existing guidebook) + Preview link (`?preview=1`) |
| `src/admin-v3/pages/GlobalContent.jsx` | Global logo (image OR wordmark), global hero, global house rules, global FAQ |

---

## Content Block Architecture

Three types in `_draft.blocks`:
- `type: 'shared'` — appears on ALL properties within a tenant. Only `house_rules`, `local_guide`, `things_to_do` legitimately use this. Managed via Global Content page.
- `type: 'property'` — property-specific. Each property owns its own copy.
- Global FAQ and Global Hero are separate fields (`_draft.globalFaq`, `_draft.globalHero`).

**Former shared blocks (now per-property after migration):**
- `getting-around-shared` → converted to `getting-around-{slug}` per property (transport section). jackson-st and vista-pointe already had their own; reynard-way and hawk-street got new copies.
- `checkout-instructions` → `checkout-instructions-{slug}` for all 4 properties
- `checkout-legal` → `checkout-legal-{slug}` for all 4 properties

Migration runs automatically in `migrateSharedToPropertyBlocks()` inside `postProcessDraft()` on every load — idempotent. Tenant must publish once to persist to Firestore.

---

## Completed Features

### GitHub Pages retirement
- Removed `predeploy`, `deploy` (gh-pages) scripts from `package.json`
- Uninstalled `gh-pages` devDependency
- User unpublished site in GitHub repo Settings → Pages → None

### Maintenance mode system
- **Firestore path:** `_platform/maintenance` with fields `{ scheduledStart, scheduledEnd, message, createdAt }`
- **Super-admin UI:** `src/super-admin/pages/Maintenance.jsx` — start now (duration in mins), schedule window (datetime-local pickers), cancel/end now
- **Tenant admin:** `src/admin-v3/Layout.jsx` watches maintenance state via `onSnapshot`; shows amber countdown banner when <24h before start; shows full `<MaintenanceScreen />` when active
- **Super-admin exempt:** super-admin panel never sees maintenance screen
- **Guidebooks unaffected:** maintenance code not imported anywhere in `src/guidebook/`
- **Firestore rule:** `_platform/{doc}` — read: any auth user; write: role === 'superadmin'

### Core blocks now deletable
- `isDeletable` in `SectionEditor.jsx` now always returns `true`
- Previously locked core (pre-seeded) blocks with `id` not starting with `blk-`
- No functional difference between core and user-added blocks — both render identically on guidebook

### Login page destination collage
- `src/admin-v3/Login.jsx` — replaced plain `bg-slate-50` with same 20-tile Unsplash destination grid as MaintenanceScreen
- Dark radial overlay + frosted glass white card (rgba 0.97, backdrop-blur 20px)
- All three login states (main form, challenge waiting, sign-in declined) use same `<PageBackground>` wrapper
- Footer text changed to `text-white/50`

### Session management system (see full detail in Session section below)

### Stale-tab publish guard (3-layer)

### Signup progress bar

### Session 20 (Sep 5 2026) — DEPLOYED & PUSHED TO GITHUB

**adminV3Store.js — four bug fixes:**
1. Spurious "Publish everything" on login: fast path aligned `_live = copy(_draft)` when `_live` absent in localStorage (avoids `_live = null` → `hasUnsavedChanges()` = true). Silently fetches remote `updatedAt` in background for staleness guard.
2. `migrateImages()` now accepts `persistKey` param (was hardcoded `DRAFT_KEY`); applied to `_live` with `ADMIN_V3_LIVE_KEY`.
3. Staleness guard null hole: `if (remoteAt && (!_loadedRemoteAt || remoteAt > _loadedRemoteAt))` — was always false when `_loadedRemoteAt = null`.
4. `writeJSON(ADMIN_V3_LIVE_KEY, _live)` added unconditionally in fast path.

**V3CheckInPage.jsx:** Lorem Ipsum offer text removed — `(property.checkInOfferText || '').trim()` + `{offerText && ...}` hides banner when blank.

**PropertyHome.jsx — section deep-link copy-link buttons:**
- 🔗 icon button on each section card copies full guest URL with hash (e.g. `https://talo.talo.llc/reynard-way#house_rules`)
- Cards converted from `<Link>` to `<div onClick={navigate(...)}>` to allow nested `<button>`
- Hash uses existing underscore format (`house_rules`, `services_maintenance`, etc.) — scroll-on-load `useEffect` was already in `V3GuidebookPage.jsx`

**GitHub:** all 28 local commits (Sessions 18+19+20) pushed. Classic PAT in remote URL — rotate ~Sep 2026.

### Session 19 (Aug 31 2026) — DEPLOYED
Two-step primary booker check-in flow:
- Step 1: single `setDoc` with pre-generated ref (includes `resumeUrl`); all state updates outside try block — fixes blank screen bug
- Step 2: `setDoc` new doc (not `updateDoc`) with full payload + `step1DocId` + `resumeUrl` — fixes "check your internet" error
- Resume link: stored invisibly in Firestore; admin "Resume Link" copy button in Check-In Records (always visible)
- Resume link deep-links to step-2 co-guest form (skips choice screen)
- Resume link works in incognito: new `getCheckinResume` Cloud Function (Admin SDK, bypasses auth)
- Success screen: vertically centered via `min-h-screen flex items-center justify-center`; PDF always white via `!important` on CSS vars in `@media print :root`
- **Git push needed**: 23 local commits (Sessions 18+19) not pushed — PAT expired, needs renewal

### Session 18 (Jul 29 2026) — committed, not yet deployed
- **Global host info** (`globalHostInfo { ownerName, ownerPhone, ownerEmail, showHostCard }`): moved from per-property `PropertyInfo` to `GlobalContent`. `adminV3Store` has `getGlobalHostInfo()` / `setGlobalHostInfo()`, `postProcessDraft` migration (starts empty), and `hasUnsavedChanges` tracking.
- **Admin:** Host Information card removed from every property's Property Info page; added to Global Content page (after Guidebook Logo).
- **Desktop guidebook:** right sidebar `V3RightSidebar` now reads from `globalHostInfo` instead of `property.*`; visually unchanged (Call/Text + Email).
- **Mobile/tablet guidebook:** slim "Your Host" strip added (`lg:hidden`) below the Property Info block — host name + Call/Text button only (no Email).

### Jul 2026 additions (Sessions 15–17) — all deployed
- **20-theme system** (`themes.js`): per-property day/night themes, Google Fonts, radii; live iframe preview in Property Info with explicit Apply button; 7 premium night themes show real starfield/Milky-Way photos (`public/images/space/`). Default theme night palette is indigo (must stay — don't let it drift to orange).
- **Guest roster merge** (`guestRoster.js`): Check-In Records + Guest Database show co-guests + guest sign-ins unified under each primary booker; Guest Database = full roster with P/G Type column; matched by first→last name.
- **Rental Terms** = the guest check-in flow (renamed from "Check In" in the guidebook UI). Primary booker enters required booking check-in/out **dates** (validated) + lists co-guests with ages. Guests pick their primary booker from a **dropdown** (populated by `getActivePrimaryBookers` Cloud Function — active bookers only, names only) → explicit `primaryGuestName` link. Empty dropdown blocks guest check-in.
- **Smart checkout**: only checks out when an active stay exists for that booker+property; else shows "already checked out". Whole group checks out together.
- **Starter template + Duplicate guidebook** (PropertyHome, empty properties only): `loadStarterTemplate` (generic content + `public/images/template/*.svg`), `duplicateGuidebook` (deep-copy one property's whole guidebook, re-keyed, keeps target name/address/wifi). Both tenant-isolated — no Talo data.
- **Global logo** (`globalLogo {image, wordmark}`): image OR wordmark, header shows image→wordmark→nothing. All hardcoded "TALO" removed from V3 guidebook.
- **Preview mode** (`?preview=1`, sticky per-tab `sessionStorage['v3_preview']`): admin "Preview guidebook" + theme iframe read the DRAFT (property + blocks straight from draft, bypassing contentStore/firebaseSync) so new/unpublished/template properties render instead of redirecting to login. Guests never carry it.
- **Wrong-workspace login guard**: `login()` rejects if account's `tenantId` claim ≠ hostname tenant (legacy no-claim accounts unaffected).
- **False "unpublished changes" fix**: `_live` now runs the SAME `postProcessDraft` as `_draft` (persistKey param); FAQ ids deterministic (no `Math.random()`).
- **Lorem-ipsum default check-in offer** (`DEFAULT_CHECKIN_OFFER`) — replaced the "TALO Rentals / $50" white-label leak.

---

## Session Management System (`src/data/sessionStore.js`)

Firestore doc at `tenants/{tid}/data/_session`:
```js
{ sessionId, loginAt, lastSeen, challengeId, challengeAt, challengeResolved, forceLogout, forceReset }
```

**SESSION_ID:** `sessionStorage` key `talo_session_id`. Persists across Cmd+R, clears on tab close.

**Key constants:** STALE_MS=5min, TAKEOVER_MS=30s, HEARTBEAT_THROTTLE=30s

**Key exports:** `initSession()`, `resumeSession()`, `claimSession()`, `takeOverSession()`, `clearSession()`, `forceLogoutTenant()`, `watchSession()`, `watchChallenge()`

**Challenge flow:** Person B logs in → sees countdown → Person A gets banner → A clicks Stay (B sees "declined") or A goes inactive 30s (B takes over)

**Force-logout flow:** super-admin `forceLogoutTenant()` sets `{forceLogout:true, forceReset:true, sessionId:null, lastSeen:null}` → active session kicked → next login calls `adminV3Store.forceReset()` → wipes localStorage content → fresh Firestore hydration

**adminV3Store additions:**
- `syncRemoteAt()` — fetches Firestore `updatedAt`, aligns `_loadedRemoteAt`, clears `_staleSession` (no page reload)
- `forceReset()` — wipes localStorage content keys, calls `hydrateFromFirestore()` fresh

---

## Per-tenant Feature Flags (not yet built)

**Decision:** Currently all tenants get identical code. If a specific tenant ever needs a custom feature, implement a `features` map on their Firestore tenant doc and gate rendering with `tenant.features?.feature_name`. Super-admin panel would have toggle UI. Build this only when a concrete tenant request arrives — no speculative work.

---

## Pending Work

| Priority | Task | Notes |
|---|---|---|
| BUG | **Session guard can deadlock** | On takeover/force-logout the old tab's heartbeat isn't stopped → stale session looks "active" forever, can lock out a legit user with no escape. Fix: stop heartbeat on takeover/force-logout, add "force takeover / sign in here" button on challenge screen, shorten stale window. Found Jul 11 2026. |
| P1 | **Multilingual (EN + ES)** | Top priority now. Decided: UI-only first (react-i18next), admin lang by owner, guidebook lang per-property; guest content translation deferred (guests can use browser translate). No recurring cost. |
| P2 | **Premium gating for ✦ night themes** | 7 photo-background themes marked premium but no paywall yet; needs Stripe. |
| P3 | **Slug-change feature** | Complex schema migration. Needs design. Interim: add "can't be changed later" warning on signup slug field (not yet added). |
| GIT | **PAT rotation reminder** | Classic PAT set in remote URL Sep 2026. Rotate before ~Dec 2026. Command: `git remote set-url origin https://talodeveloper:NEW_TOKEN@github.com/talodeveloper/talo-guidebook.git` |
| P4 | **Node 20 → 22 Cloud Functions** | Deadline Oct 30 2026. Bundle with the super-admin Maintenance "What happens" copy fix (scheduled maintenance now force-logs-out, not "restored automatically"). |
| P5 | **Stripe integration** | Blocked: need Stripe account |
| P6 | **Support ticket system** | Tenant raises in admin-v3, super-admin views all + which account; after Stripe |

**Affitto (white-label clone):** a full plan + one reusable prompt were produced this session to clone Talo into a separate `~/affitto` folder on new Firebase/Cloudflare/GitHub accounts. The prompt lives in the chat transcript (not saved in-repo, by design — clean copy for clients). Talo untouched.

---

## Production Incident (resolved 2026-06)

Root cause: stale tab published old content while updated tab was blocked by the guard.
Recovery: merged storage image blocks from Firestore snapshot into draft via localStorage script, then published.
Prevention: 3-layer stale guard + Reload button calls `syncRemoteAt()` instead of blind page reload.

**Why:** [[talo-domain-hosting]] [[talo-payment-expiry-flow]]
