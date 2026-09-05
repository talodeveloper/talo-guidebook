# Talo Guidebook — Claude Code Instructions

> Read this file at the start of every session. It is the single source of ground rules.
> For full session history (what was built, what broke, what was fixed), read **Handoff.md**.
> For architecture, key files, and pending work, read **.claude/memory/talo-guidebook-project.md**.

---

## Ground Rules (non-negotiable)

1. **Never touch V1 (`/:slug`) or V2 (`/v2`, `/admin-v2`)** — except a genuine V2 bug fix. All new work is V3 only.
2. **Multi-tenant safety is a hard constraint** — never let one tenant's data leak into another. Every Firestore read/write must be scoped to the active tenant.
3. **Ask before deploying to production** — confirm scope first. Command: `npm run deploy:cf`.
4. **When in doubt, ASK before building** — a clarifying question is always cheaper than a wrong implementation.
5. **Don't claim something is done from memory** — verify in actual code first.
6. **Never auto-save from a preview/test UI** without explicit user confirmation.
7. **Commit trailers** — every commit message must end with:
   `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
8. **Update Handoff.md AND `.claude/memory/talo-guidebook-project.md`** at the end of every session, then commit and push both.

---

## Stack

- **React 19** + **React Router v7** + **Vite 8** + **Tailwind CSS v3**
- **Firebase** (Auth + Firestore Blaze + Cloud Functions + Storage)
- **Cloudflare Workers** — deploy via `npm run deploy:cf`
- **GitHub:** `https://github.com/talodeveloper/talo-guidebook`

---

## Key Concepts

- `adminV3Store.js` — central state: `_draft` (working copy), `_live` (last published), `_ready`, `_hydrating`
- `hydrateFromFirestore()` — loads Firestore → sets both `_draft` and `_live`; sets `_loadedRemoteAt`
- `hasUnsavedChanges()` — `JSON.stringify(_draft) !== JSON.stringify(_live)`; true when `_live = null`
- `postProcessDraft()` — migration pipeline run on every load; contains `deactivatedAt: new Date().toISOString()` which is non-idempotent across separate calls — never run it separately on `_draft` and `_live` and then compare them
- Firestore content path: `tenants/{tid}/data/live` → `{ data: <full dataset>, updatedAt: Date.now() }`
- localStorage keys: `talo_admin_v3_draft`, `talo_admin_v3_live`, `talo_admin_v3_loaded_at`, `talo_v3_guest_cache`

---

## Deploy Command

```bash
npm run deploy:cf
```

Builds with Vite then deploys via Wrangler to Cloudflare Workers. No GitHub Pages — that is fully retired.

---

## GitHub Push (when PAT needed)

```bash
git remote set-url origin https://talodeveloper:GITHUB_PAT@github.com/talodeveloper/talo-guidebook.git
git push origin main
```

Use a **classic PAT** with `repo` scope. Fine-grained tokens have given 403 errors.

---

## Where to Find Things

| What | Where |
|---|---|
| Session history (what was built) | `Handoff.md` |
| Architecture + pending work | `.claude/memory/talo-guidebook-project.md` |
| Central admin state | `src/data/adminV3Store.js` |
| Tenant/host resolution | `src/data/tenant.js` |
| Content block seed data | `src/data/contentStore.js` |
| Session management | `src/data/sessionStore.js` |
| Theme system (20 themes) | `src/data/themes.js` |
| Admin panel entry | `src/admin-v3/` |
| Guidebook (guest view) | `src/guidebook/v3/` |
| Cloud Functions | `functions/index.js` |
