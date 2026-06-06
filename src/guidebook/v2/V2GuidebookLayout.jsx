import { useEffect, useState } from 'react'
import { useParams, useNavigate, Outlet } from 'react-router-dom'
import { properties } from '../../data/properties'
import { adminStore } from '../../data/adminStore'

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
    const build = () => {
      const adminProp = adminStore.getProperty(slug)
      if (staticProperty) {
        const merged = adminProp
          ? { ...staticProperty, ...adminProp, photos: { ...staticProperty.photos, ...adminProp.photos } }
          : staticProperty
        setActiveProperty(merged)
      } else if (adminProp) {
        setActiveProperty(adminProp)
      } else {
        navigate('/', { replace: true })
      }
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
