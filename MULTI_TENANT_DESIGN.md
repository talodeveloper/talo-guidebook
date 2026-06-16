# Multi-Tenant SaaS — Data Model & Migration Design

> Status: **DESIGN / PROPOSAL** — no code written yet. For review before implementation.
> Locked decisions so far: subdomains per tenant (`abc.talorentals.com`); hosting on Firebase.
> Foundation already built: real Firebase Auth + locked Firestore/Storage rules (Session 13.1).

---

## 1. Core concepts

| Concept | Meaning |
|---|---|
| **Tenant** | One paying customer account (e.g. "TALO Rentals"). Owns its properties, content, guests, billing, and admin users. Fully isolated from every other tenant. |
| **User** | A Firebase Auth account. Belongs to exactly one tenant (v1), with a role. |
| **Role** | `owner` (tenant admin — full control of their own tenant) or `superadmin` (you — platform operator, can manage all tenants). |
| **Subdomain** | The public address of a tenant's guidebooks: `talo.talorentals.com`. Maps 1:1 to a `tenantId`. |

TALO becomes the **first tenant** (`tenantId: "talo"`). Nothing about TALO's data or admin experience changes — it just moves under the tenant umbrella.

---

## 2. Firestore data model

We use **subcollections under a tenant document** (clean isolation, simple rules):

```
tenants/{tenantId}
  ├─ (doc fields) profile: {
  │     name, subdomain, customDomain?, ownerUid,
  │     status: "active" | "suspended",
  │     createdAt
  │  }
  ├─ subscription: {                      ← written only by backend (Stripe webhook / superadmin)
  │     plan: "starter" | "pro" | ...,
  │     propertyLimit: number,
  │     status: "trialing" | "active" | "past_due" | "canceled",
  │     stripeCustomerId, stripeSubscriptionId,
  │     currentPeriodEnd
  │  }
  ├─ data/live      ← the PUBLISHED dataset (what guests see)
  ├─ data/draft     ← the working draft (what admin edits before Publish)
  ├─ checkins/{autoId}
  └─ checkouts/{autoId}

subdomains/{subdomain}  →  { tenantId }   ← public lookup, resolves URL → tenant

users/{uid}  →  { tenantId, role, email } ← app-side convenience mirror of auth claims
```

### Why `data/live` and `data/draft` as single documents
The current app already stores the **entire** dataset as one structure (the `talo_admin_v3_live` object / `v2_content/blocks` doc). We keep that shape — `data/live` is a near-1:1 copy of today's `_live` object:

```
data/live = {
  blocks, properties, faq, globalFaq, faqCuration,
  activities, activityCategories, propertyCuration,
  propertyList, propertySections, propertySectionConfig,
  propertyBlockOrder, disabledBlocks, propertyImageOverrides, globalHero
}
```

This makes migration trivial (copy the existing object straight in) and keeps the admin/guidebook code almost unchanged — it just reads/writes a tenant-scoped doc instead of a global one.

> **Scaling note:** a Firestore document caps at 1 MB. The single-blob model comfortably handles ~15–20 properties per tenant. Beyond that we split `blocks`/`properties` into per-property docs (`tenants/{tid}/properties/{slug}`). Not needed for v1; flagged as the known upgrade path.

### Draft moves from localStorage → Firestore
Today the draft lives in the browser's `localStorage`. For multi-tenant (and multi-device admin) it must live server-side at `tenants/{tid}/data/draft`. **The admin experience and data are identical** — edit → draft → Publish — but the draft now syncs across devices and is properly isolated/secured. This is an improvement, not a behavior change.

---

## 3. Storage model

```
tenants/{tenantId}/properties/{slug}/{blockId}/{file}
```

- Public read (guidebooks display images).
- Write/delete only if the caller's auth belongs to that tenant.
- **Existing TALO images don't need to move** — they're referenced by absolute download URLs already stored in the data, so they keep loading from their current path. Only *new* uploads use the tenant-scoped path.

---

## 4. Authentication & tenant binding

- Each user gets **Firebase Auth custom claims**: `{ tenantId, role }`.
- Claims are set by a **Cloud Function** (using the Admin SDK) at signup/provisioning — they can't be forged client-side.
- Rules read `request.auth.token.tenantId` directly — no extra lookup, fast and secure.
- `users/{uid}` mirrors the claim for convenient app reads.
- **Superadmin**: `role: "superadmin"` claim → bypasses tenant scoping in rules (for your super-admin panel).

---

## 5. Subdomain → tenant resolution

1. App loads at `talo.talorentals.com`.
2. Frontend extracts the subdomain (`talo`), reads `subdomains/talo` → `{ tenantId: "talo" }`.
3. Loads `tenants/talo/data/live` and renders that tenant's guidebooks.
4. `subdomains/*` is **public-readable** (needed before login).
5. **Reserved subdomains** (cannot be claimed by tenants): `www`, `app`, `admin`, `api`, `mail`, `dashboard`, etc.
6. The apex/`www` domain serves the **marketing + signup** site, not a tenant guidebook.

---

## 6. Security rules (sketch)

```
// Firestore
match /subdomains/{sub}        { allow read: if true; allow write: if isSuper(); }
match /users/{uid}             { allow read: if isSelf(uid) || isSuper();
                                 allow write: if isSuper(); }   // claims set via backend

match /tenants/{tid} {
  allow read:  if true;                              // profile is public-ish (name/subdomain)
  allow write: if isSuper();                         // tenant profile managed by platform

  match /subscription { allow read: if belongsTo(tid) || isSuper();
                        allow write: if isSuper(); }  // only backend/Stripe webhook

  match /data/live    { allow read: if true;                       // guests see published content
                        allow write: if belongsTo(tid) || isSuper(); }
  match /data/draft   { allow read, write: if belongsTo(tid) || isSuper(); }  // private

  match /checkins/{id}  { allow create: if true;                   // guests submit
                          allow read, update, delete: if belongsTo(tid) || isSuper(); }
  match /checkouts/{id} { allow create: if true;
                          allow read, update, delete: if belongsTo(tid) || isSuper(); }
}

function belongsTo(tid) { return request.auth != null && request.auth.token.tenantId == tid; }
function isSuper()      { return request.auth != null && request.auth.token.role == "superadmin"; }
function isSelf(uid)    { return request.auth != null && request.auth.uid == uid; }
```

Same shape as the rules we just shipped, now scoped per tenant. Tenant A's admin token carries `tenantId: "A"`, so it can never touch tenant B's documents.

---

## 7. Subscription / billing behavior

- Stripe webhook (Cloud Function) updates `tenants/{tid}/subscription.status`.
- **Proposed lapse behavior:** if `status` is `past_due`/`canceled`, **lock the admin panel** (read-only or blocked) but **keep the guest guidebook live** — don't punish guests for the owner's billing, and keep QR codes/links working during a grace period. *(Open decision — see §10.)*
- **Plan limits:** `propertyLimit` enforced in the admin when adding a property; downgrades that exceed the new limit are handled gracefully (block new adds; existing extras become read-only rather than deleted).

---

## 8. Migration plan for TALO (your key concern)

**Principle: copy, verify, cut over — never delete the old data until the new path is proven.** TALO's content, properties, images, guests, and admin experience stay exactly as they are.

### Step-by-step
1. **Build the tenant layer in code, defaulting to `talo`.** The app becomes tenant-aware but, on the current domain with no subdomain, resolves to `tenantId: "talo"`. Deployed behavior is identical to today.
2. **Create the `talo` tenant scaffold:** `tenants/talo/profile`, `subscription` (seed as `active`, unlimited), `subdomains/talo → {tenantId:"talo"}`.
3. **Set TALO's existing admin user's claims** to `{ tenantId: "talo", role: "owner" }` (one-time Cloud Function call). Login keeps working with the same Firebase credentials.
4. **Copy data into the tenant** (one-time migration script, run while authenticated):
   - Current `_live` dataset (from `v2_content/blocks` + properties + the full V3 config) → `tenants/talo/data/live` and `data/draft`.
   - `v2_checkins` → `tenants/talo/checkins`; `v2_checkouts` → `tenants/talo/checkouts`.
   - Images: **no move needed** — absolute URLs already in the data keep working.
5. **Verify byte-for-byte:** diff the migrated `data/live` against the current live dataset; load the guidebook against the new path in a staging check and confirm it renders identically (same properties, content, images, order).
6. **Cut over:** flip the app to read/write the tenant paths. The OLD collections (`v2_content`, `v2_checkins`, `v2_checkouts`) are left intact as a backup.
7. **Rollback (if anything looks wrong):** point the app back at the old collections and redeploy. Old data was never touched, so this is instant and safe.
8. **Decommission later:** only after TALO runs cleanly on the tenant model for a while do we (optionally) archive the legacy collections.

### What explicitly does NOT change for TALO
- Same admin URL, same login credentials, same screens, same draft→publish flow.
- Same guidebook content, property order, images, FAQ, activities, check-in flow.
- Same guest records (copied, originals retained).

---

## 9. Rollout phasing

| Phase | What | Risk |
|---|---|---|
| **P1** | Tenant-aware code defaulting to `talo`; migrate TALO data; verify + cut over | Medium — touches data layer; fully reversible |
| **P2** | Subdomain resolution + `*.talorentals.com` wildcard DNS on Firebase Hosting | Low |
| **P3** | Cloud Functions: provisioning + custom-claims + Stripe webhooks | Medium |
| **P4** | Signup page → Stripe Checkout → auto-provision tenant → account page | Medium |
| **P5** | Super-admin panel (create/suspend/delete tenants, impersonate) | Low–Med |
| **P6** | Plan limits, transactional email, onboarding, legal (ToS/privacy, minors' data) | Low |

P1 is the foundation and the one that touches TALO's live data — so it gets the most careful verify/rollback treatment (§8).

---

## 10. Open decisions to confirm before building P1

1. **Lapsed-subscription behavior** — when a tenant stops paying: lock admin but keep guest guidebook live (recommended), or take the whole guidebook offline?
2. **Tenant ID format** — human-readable slugs (`talo`) or opaque generated IDs? (Slugs are friendlier for debugging; opaque is tidier long-term. Recommend: slug = subdomain for v1.)
3. **One user ↔ one tenant for v1?** (Recommended. Multi-tenant-per-user / team members can come later.)
4. **Plans & pricing tiers** — rough shape (e.g. Starter = N properties, Pro = more)? Needed before P3/P4 but not for P1.

---

*Design prepared end of Session 13. Implementation starts with Phase 1 after these decisions are confirmed.*
