import { useEffect, useState } from 'react'
import { useParams, useNavigate, Outlet } from 'react-router-dom'
import { properties } from '../../data/properties'
import { adminStore } from '../../data/adminStore'

const ADMIN_V3_LIVE_KEY = 'talo_admin_v3_live'
const ADMIN_V3_DRAFT_KEY = 'talo_admin_v3_draft'

// Live first; draft fallback so brand-new (unpublished) properties preview correctly
function readV3PropertyData() {
  try {
    const raw = localStorage.getItem(ADMIN_V3_LIVE_KEY) || localStorage.getItem(ADMIN_V3_DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export default function V3GuidebookLayout() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const staticProperty = properties[slug] || null
  const [activeProperty, setActiveProperty] = useState(null)

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

      // Apply V3 overrides (highest priority) — live, or draft for unpublished previews
      const v3data = readV3PropertyData()
      const overrides = v3data?.properties?.[slug]
      if (overrides) {
        merged = merged
          ? { ...merged, ...overrides, wifi: { ...(merged.wifi || {}), ...(overrides.wifi || {}) } }
          : null
      }

      // For new properties (not in static list) that exist only in V3 admin
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
    }
    build()
    return adminStore.subscribe(build)
  }, [staticProperty, slug, navigate])

  if (!activeProperty) return null

  return (
    <div className="min-h-screen" style={{ background: nightMode ? '#0B1120' : '#FFF7ED' }}>
      <main className="pb-10">
        <Outlet context={{ property: activeProperty, nightMode, toggleNightMode }} />
      </main>
    </div>
  )
}
