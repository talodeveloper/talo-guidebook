import { useEffect, useState } from 'react'
import { useParams, useNavigate, Outlet } from 'react-router-dom'
import { properties } from '../data/properties'
import { adminStore } from '../data/adminStore'

export default function GuidebookLayout() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const staticProperty = properties[slug] || null
  const [activeProperty, setActiveProperty] = useState(null)

  useEffect(() => {
    const build = () => {
      const adminProp = adminStore.getProperty(slug)
      if (staticProperty) {
        // Merge admin overrides on top of static (deep merge photos)
        const merged = adminProp
          ? {
              ...staticProperty,
              ...adminProp,
              photos: { ...staticProperty.photos, ...adminProp.photos },
            }
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
    <div className="min-h-screen bg-background">
      <main className="pb-10">
        <Outlet context={{ property: activeProperty }} />
      </main>
    </div>
  )
}
