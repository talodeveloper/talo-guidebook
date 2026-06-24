// Tenant context + data locations — the single chokepoint for multi-tenancy.
//
// Tenant resolution (P2): on the platform domain, the active tenant is the
// SUBDOMAIN — e.g. `abcrentals.talo.llc` → tenant `abcrentals`. Anywhere the
// host is NOT a `*.talo.llc` subdomain (the current GitHub Pages production
// host, localhost dev, the apex/www/app hosts), this falls back to the default
// tenant, so the existing single-tenant deployment behaves byte-for-byte
// identically until the subdomain host is live.
//
// For local multi-tenant testing, append `?tenant=<slug>` to the URL.

export const DEFAULT_TENANT_ID = 'talo'

// The platform domain that carries tenant subdomains.
export const PLATFORM_DOMAIN = 'talo.llc'

// Subdomains that are platform infrastructure, NOT tenants. A host like
// `app.talo.llc` or `www.talo.llc` must not be mistaken for a tenant slug.
const RESERVED_SUBDOMAINS = new Set([
  'www', 'app', 'admin', 'platform', 'api', 'super', 'support', 'help',
  'billing', 'mail', 'smtp', 'imap', 'pop', 'webmail', 'autodiscover',
  'autoconfig', 'mx', 'ns', 'cdn', 'static', 'assets',
])

// Resolve the active tenant for the current request/page.
//   1. Subdomain on the platform domain (`abcrentals.talo.llc` → `abcrentals`)
//   2. `?tenant=<slug>` query override (local dev / preview only)
//   3. DEFAULT_TENANT_ID (current single-tenant production + localhost)
export function getTenantId() {
  if (typeof window === 'undefined') return DEFAULT_TENANT_ID

  const host = window.location.hostname || ''

  // Subdomain on the platform domain.
  if (host.endsWith('.' + PLATFORM_DOMAIN) && host !== PLATFORM_DOMAIN) {
    const sub = host.slice(0, -(PLATFORM_DOMAIN.length + 1)) // strip ".talo.llc"
    const label = sub.split('.')[0] // first label, in case of deeper nesting
    if (label && !RESERVED_SUBDOMAINS.has(label)) return label
  }

  // Dev / preview override.
  try {
    const override = new URLSearchParams(window.location.search).get('tenant')
    if (override) return override.trim().toLowerCase()
  } catch { /* ignore malformed query */ }

  return DEFAULT_TENANT_ID
}

// True when the current host is a tenant subdomain (vs apex/www/app/legacy).
// Useful for routing decisions once the subdomain host is live.
export function isTenantHost() {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname || ''
  if (!host.endsWith('.' + PLATFORM_DOMAIN) || host === PLATFORM_DOMAIN) return false
  const label = host.slice(0, -(PLATFORM_DOMAIN.length + 1)).split('.')[0]
  return !!label && !RESERVED_SUBDOMAINS.has(label)
}

// Build the public origin for a tenant's guidebook (used by the super-admin
// panel to generate shareable links once the subdomain host is live).
export function tenantOrigin(tenantId) {
  return `https://${tenantId}.${PLATFORM_DOMAIN}`
}

// Routing mode for the current host:
//   'tenant' — a {tenant}.talo.llc subdomain → clean guidebook URLs at root
//   'apex'   — talo.llc / www.talo.llc → marketing + signup (placeholder)
//   'legacy' — GitHub Pages, localhost, anything else → current route tree
export function getHostMode() {
  if (typeof window === 'undefined') return 'legacy'
  const host = window.location.hostname || ''
  // Local dev/preview override: ?host=apex|tenant|legacy (persists for the
  // session so it survives client-side navigation). Only on localhost — real
  // hosts always resolve from the actual hostname below.
  if (host === 'localhost' || host === '127.0.0.1') {
    try {
      const q = new URLSearchParams(window.location.search).get('host')
      if (q) sessionStorage.setItem('talo_host_override', q)
      const o = sessionStorage.getItem('talo_host_override')
      if (o === 'apex' || o === 'tenant' || o === 'legacy') return o
    } catch { /* ignore */ }
  }
  if (isTenantHost()) return 'tenant'
  if (host === PLATFORM_DOMAIN || host === 'www.' + PLATFORM_DOMAIN) return 'apex'
  return 'legacy'
}

// Host-aware guidebook path. On a tenant subdomain the property sits at the URL
// root (talo.llc → /beach-house); elsewhere it keeps the /v3 prefix so the
// existing GitHub Pages deployment is unchanged.
//   guidebookPath('beach-house')            -> '/beach-house'      (tenant)
//   guidebookPath('beach-house', '/faq')    -> '/beach-house/faq'  (tenant)
//   guidebookPath('beach-house')            -> '/v3/beach-house'   (legacy)
export function guidebookPath(slug, sub = '') {
  return getHostMode() === 'tenant' ? `/${slug}${sub}` : `/v3/${slug}${sub}`
}

// Firestore content document paths. Returned as segment arrays so callers can
// spread them into doc(db, ...): e.g. doc(db, ...fsPaths.contentBlocks()).
//
// NOTE: contentBlocks/Properties/Faq are still the LEGACY single-tenant
// locations (read with a tenant-path-first fallback in firebaseSync). The
// authoritative per-tenant dataset is tenantDataLive/Draft.
export const fsPaths = {
  contentBlocks:     () => ['v2_content', 'blocks'],
  contentProperties: () => ['v2_content', 'properties'],
  contentFaq:        () => ['v2_content', 'faq'],

  tenantDataLive:  (tid = getTenantId()) => ['tenants', tid, 'data', 'live'],
  tenantDataDraft: (tid = getTenantId()) => ['tenants', tid, 'data', 'draft'],
}
