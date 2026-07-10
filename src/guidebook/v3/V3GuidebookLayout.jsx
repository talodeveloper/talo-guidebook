import { useEffect, useState } from 'react'
import { useParams, useNavigate, Outlet, useSearchParams } from 'react-router-dom'
import { properties } from '../../data/properties'
import { adminStore } from '../../data/adminStore'
import { THEMES, injectTheme } from '../../data/themes'

const ADMIN_V3_LIVE_KEY = 'talo_admin_v3_live'

// Admin "Preview guidebook" opens the guidebook with ?preview=1 so it shows the
// DRAFT (work in progress, incl. brand-new/unpublished properties) instead of
// only published content. The flag is made sticky per-tab in sessionStorage so
// it survives in-tab navigation to sub-pages (which drop the query string).
// Guests never carry the param and never have a draft, so they only ever see
// published content.
export function isGuidebookPreview() {
  try {
    if (typeof window === 'undefined') return false
    if (new URLSearchParams(window.location.search).get('preview') === '1') {
      sessionStorage.setItem('v3_preview', '1')
    }
    return sessionStorage.getItem('v3_preview') === '1'
  } catch { return false }
}

function readV3PropertyData() {
  try {
    // Preview reads the draft first (has unpublished work); normal reads live first.
    const order = isGuidebookPreview()
      ? ['talo_admin_v3_draft', ADMIN_V3_LIVE_KEY, 'talo_v3_guest_cache']
      : [ADMIN_V3_LIVE_KEY, 'talo_v3_guest_cache', 'talo_admin_v3_draft']
    for (const k of order) {
      const raw = localStorage.getItem(k)
      if (raw) return JSON.parse(raw)
    }
    return null
  } catch { return null }
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
const spaceImg = (file) => `${BASE}/images/space/${file}`


function StarfieldBg({ effect }) {
  const photoBg = effect === 'milky-way' ? spaceImg('milkyway.jpg') : spaceImg('starfield.jpg')

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Real photo — heavily dimmed so content text stays readable */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#000',
        backgroundImage: `url(${photoBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.20) saturate(1.6)',
      }} />
      {/* Black film layer on top for extra depth */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.35)',
      }} />
    </div>
  )
}

export default function V3GuidebookLayout() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const staticProperty = properties[slug] || null
  const [activeProperty, setActiveProperty] = useState(null)
  const [themeKey, setThemeKey] = useState('modern')

  const [nightMode, setNightMode] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem('talo_night_mode') === 'true'
  )
  const toggleNightMode = () => {
    setNightMode((prev) => {
      const next = !prev
      localStorage.setItem('talo_night_mode', String(next))
      return next
    })
  }

  useEffect(() => {
    const build = () => {
      const adminProp = adminStore.getProperty(slug)
      let merged = staticProperty
        ? adminProp
          ? { ...staticProperty, ...adminProp, photos: { ...staticProperty.photos, ...adminProp.photos } }
          : { ...staticProperty }
        : adminProp || null

      const v3data = readV3PropertyData()
      const overrides = v3data?.properties?.[slug]
      if (overrides) {
        merged = merged
          ? { ...merged, ...overrides, wifi: { ...(merged.wifi || {}), ...(overrides.wifi || {}) } }
          : null
      }

      if (!merged) {
        const propInfo = v3data?.properties?.[slug]
        const propInList = v3data?.propertyList?.find(p => p.slug === slug)
        if (propInfo && propInList) {
          merged = {
            slug,
            name: propInfo.name || slug,
            address: propInfo.address || '',
            checkInTime: propInfo.checkInTime || '4:00 PM',
            checkoutTime: propInfo.checkoutTime || '11:00 AM',
            maxGuests: propInfo.maxGuests || 0,
            wifi: propInfo.wifi || {},
            ownerName: propInfo.ownerName || '',
            ownerPhone: propInfo.ownerPhone || '',
            ownerEmail: propInfo.ownerEmail || '',
            checkInWelcome: propInfo.checkInWelcome,
            checkInOfferText: propInfo.checkInOfferText,
          }
        }
      }

      if (!merged) { navigate('/', { replace: true }); return }
      setActiveProperty(merged)

      // URL param ?preview_theme= overrides stored theme (used by admin iframe preview)
      const previewTheme = searchParams.get('preview_theme')
      const resolvedTheme = (previewTheme && THEMES[previewTheme])
        ? previewTheme
        : (v3data?.properties?.[slug]?.theme || 'modern')
      setThemeKey(resolvedTheme)
    }
    build()
    return adminStore.subscribe(build)
  }, [staticProperty, slug, navigate, searchParams])

  useEffect(() => {
    injectTheme(themeKey, nightMode)
  }, [themeKey, nightMode])

  if (!activeProperty) return null

  const nightEffect = nightMode ? THEMES[themeKey]?.nightEffect : null

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--t-bg)',
        fontFamily: 'var(--t-font-body)',
        position: 'relative',
      }}
    >
      {nightEffect && <StarfieldBg effect={nightEffect} />}
      <main className="pb-10" style={{ position: 'relative', zIndex: 1 }}>
        <Outlet context={{ property: activeProperty, nightMode, toggleNightMode, themeKey }} />
      </main>
    </div>
  )
}
