// Tenant context + data locations — the single chokepoint for the Phase 1
// multi-tenancy migration (see PHASE1_PLAN.md).
//
// IMPORTANT: during the migration these helpers still resolve to the EXISTING
// (legacy) Firestore locations, so the app behaves byte-for-byte identically.
// The cutover to tenant-scoped paths (`tenants/{tenantId}/...`) happens in a
// later, deliberately separate step — at which point only this file changes.

export const DEFAULT_TENANT_ID = 'talo'

// Resolve the active tenant. For now this is always TALO (single-tenant
// production). Later it will come from the URL (`/guidebook/:tenantSlug`) for
// guests, or the logged-in user's auth claim for the admin.
export function getTenantId() {
  return DEFAULT_TENANT_ID
}

// Firestore content document paths. Returned as segment arrays so callers can
// spread them into doc(db, ...): e.g. doc(db, ...fsPaths.contentBlocks()).
//
// LEGACY locations for now — switched to tenant scope in the read-cutover step.
export const fsPaths = {
  contentBlocks:     () => ['v2_content', 'blocks'],
  contentProperties: () => ['v2_content', 'properties'],
  contentFaq:        () => ['v2_content', 'faq'],

  // Tenant-scoped full dataset blob (Phase 1.4+). Holds the entire published
  // (live) / working (draft) admin dataset for one tenant. Written by publish
  // as a dual-write now; becomes the authoritative read source at step 1.6.
  tenantDataLive:  (tid = getTenantId()) => ['tenants', tid, 'data', 'live'],
  tenantDataDraft: (tid = getTenantId()) => ['tenants', tid, 'data', 'draft'],
}
