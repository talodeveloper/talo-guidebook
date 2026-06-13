import { useEffect, useState } from 'react'
import { useParams, useNavigate, Outlet } from 'react-router-dom'
import { properties } from '../../data/properties'
import { adminStore } from '../../data/adminStore'
import { getPropertyOverrides, subscribeProperties } from '../../data/firebaseSync'

export default function V2GuidebookLayout() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const staticProperty = properties[slug] || null
  const [activeProperty, setActiveProperty] = useState(null)

  // ── Night mode — persisted in localStorage ─────────────────────────────
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
    const build = (firestoreProps) => {
      const propOverrides = firestoreProps ?? getPropertyOverrides()
      const adminProp = adminStore.getProperty(slug)
      let merged = staticProperty
        ? adminProp
          ? { ...staticProperty, ...adminProp, photos: { ...staticProperty.photos, ...adminProp.photos } }
          : { ...staticProperty }
        : adminProp || null

      if (!merged) { navigate('/', { replace: true }); return }

      // Apply admin v2 live localStorage overrides
      try {
        const liveRaw = localStorage.getItem('talo_admin_v2_live')
        if (liveRaw) {
          const live = JSON.parse(liveRaw)
          const overrides = live?.properties?.[slug]
          if (overrides) {
            merged = { ...merged, ...overrides, wifi: { ...merged.wifi, ...overrides.wifi } }
          }
        }
      } catch {}

      // Apply Firestore overrides — highest priority, visible to ALL devices
      const fsOverrides = propOverrides[slug]
      if (fsOverrides) {
        merged = { ...merged, ...fsOverrides, wifi: { ...merged.wifi, ...(fsOverrides.wifi || {}) } }
      }

      setActiveProperty(merged)
    }
    build()
    const unsubAdmin     = adminStore.subscribe(() => build())
    const unsubFirestore = subscribeProperties(build)
    return () => { unsubAdmin(); unsubFirestore() }
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
