# Phase 1 — Multi-Tenancy Foundation: Implementation Plan

> Status: **PLAN for approval** — no code written yet.
> Hard constraint: **the live TALO admin and guidebooks stay up the entire time.** Every step below is individually deployable, invisible to TALO, and reversible on its own.

---

## Guiding principle: strangler / parallel-run

We never "switch over" in one risky move. Instead we:
1. Build the new tenant layer **alongside** the existing one.
2. **Copy** TALO's data into it (originals never deleted).
3. **Verify** the new path produces an identical app.
4. **Flip reads** to the new path with the **old path as automatic fallback**.
5. Keep the old data as backup; decommission only much later.

At any moment, a single `git revert` + redeploy returns to the previous working state, because we add capability without removing the working path until it's proven.

---

## Current reality this plan must respect

- **Guidebook reads:** `contentStore` ← Firestore `v2_content/blocks` + localStorage `talo_admin_v2_live`; plus `readV3Data()` ← localStorage `talo_admin_v3_live` for V3 config (sections, curation, hero, FAQ curation…).
- **Latent issue this fixes:** the richer V3 config currently lives only in **localStorage**, not Firestore — so it isn't truly server-synced for all guests/devices. Moving the full dataset into `tenants/talo/data/live` (Firestore) **fixes** this while preserving current behavior.
- **Admin writes:** `adminV3Store` → localStorage draft/live + on publish → Firestore `v2_content/*` + `talo_admin_v2_live`.
- **Check-ins/outs:** Firestore `v2_checkins` / `v2_checkouts`.

---

## The steps (each one keeps everything live)

### 1.1 — Data-access abstraction (pure refactor, zero behavior change)
Wrap all content reads/writes in one `tenantRepo` module that **currently points at the exact same legacy locations**. Nothing observable changes; this just gives us a single place to swap paths later.
- **TALO sees:** nothing.
- **Verify:** app behaves byte-identical; build + smoke test.
- **Rollback:** revert one commit.

### 1.2 — Seed TALO tenant scaffolding (additive data only, nothing reads it)
One-time script creates `tenants/talo/profile`, `tenants/talo/subscription` (status `active`, unlimited), `slugs/talo → {tenantId:"talo"}`. No code reads these yet.
- **TALO sees:** nothing.
- **Rollback:** delete the seeded docs (nothing depends on them).

### 1.3 — Set TALO admin's custom claims `{tenantId:"talo", role:"owner"}`
One-time Admin-SDK call (see "What I need from you"). Current code doesn't check claims yet, so login is unchanged.
- **TALO sees:** nothing — same login, same access.
- **Rollback:** claims are additive and unused until 1.6; harmless.

### 1.4 — Dual-write on publish + one-time backfill
`publish()` additionally writes the **full** `_live` dataset to `tenants/talo/data/live` (and draft → `tenants/talo/data/draft`), on top of the existing legacy writes. Then a one-time backfill populates the tenant docs from the current live state immediately.
- **TALO sees:** nothing — reads still come from legacy paths; this is an extra write.
- **Verify:** confirm `tenants/talo/data/live` now contains the complete dataset.
- **Rollback:** stop dual-writing (revert); tenant docs sit unused.

### 1.5 — Shadow-read verification (no cutover)
Build a temporary read path that loads from `tenants/talo/data/live` and **diff it against the live app** — same properties, content, order, images, FAQ, activities, hero. Confirm identical.
- **TALO sees:** nothing (verification is internal).

### 1.6 — Flip reads to tenant path **with legacy fallback** (the one real switch)
The guidebook + admin read from `tenants/talo/data/...` first; if missing/empty, **automatically fall back to the legacy path**. Old routes (`/v3/:slug`, `/admin-v3`) keep working — new path-based routes (`/guidebook/talo/:property`) are **added alongside**, not replacing.
- **TALO sees:** nothing — same content, now served from the tenant doc.
- **Verify:** full guidebook + admin walkthrough on production.
- **Rollback:** the fallback already protects us; worst case, one `git revert` returns to legacy reads instantly.

### 1.7 — Tenant-scoped Firestore rules (kept backward-compatible)
Add `tenants/{tid}/...` rules (per the design) **while leaving the legacy `v2_content`/`v2_checkins` rules in place** during transition. Tighten/remove legacy rules only once stable.
- **TALO sees:** nothing.
- **Verify:** same script checks we used in Session 13.1 (public read OK, PII blocked, admin write OK).

### 1.8 — Tenant-scoped Storage for new uploads
New image uploads go to `tenants/talo/properties/...`. **Existing images don't move** — their absolute URLs keep loading.
- **TALO sees:** nothing; existing images intact, new uploads land in the tenant path.

---

## Routing during P1 (nothing breaks for existing links)
- Keep `/v3/:slug` and `/admin-v3` working (mapped to the `talo` tenant).
- **Add** `/guidebook/:tenantSlug/:propertySlug` alongside.
- Existing TALO QR codes / shared links keep resolving. We can later 301-redirect old → new, but only when we choose.

---

## What I need from you (only at specific steps)

- **For 1.3 (custom claims):** setting auth claims requires the Firebase **Admin SDK** (can't be done from the browser). Cleanest bootstrap: you download a **service-account key** (Firebase Console → Project Settings → Service accounts → Generate new private key) and I run a one-time local Node script with it to stamp TALO's claim. ⚠️ That key is a secret — it must **never** be committed; we use it once and delete it. (Alternative: deploy a temporary Cloud Function — more moving parts.)
- **For 1.7 (rules):** you paste the updated rules into the Firebase console (same as before), I verify.
- Nothing here requires the GoDaddy domain — that move stays parked and independent.

---

## Explicit safety guarantees
- ✅ Admin panel stays logged-in-and-working at every step.
- ✅ Guidebooks stay live and identical at every step.
- ✅ Guest data (`v2_checkins`/`checkouts`) is **copied**, never deleted, during migration.
- ✅ Existing images keep loading (absolute URLs unchanged).
- ✅ Every step is one small commit → one-command rollback.
- ✅ The only read-cutover (1.6) ships with an automatic legacy fallback.

---

## Out of scope for P1 (later phases)
Signup, Stripe billing, super-admin, account page, plan-limit enforcement, the GoDaddy/domain move, subdomain/custom-domain upgrades. P1 is purely the tenant data foundation, proven on TALO.

---

*Plan prepared end of Session 13. Execution begins with step 1.1 after approval.*
