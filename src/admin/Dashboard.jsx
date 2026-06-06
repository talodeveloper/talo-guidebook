import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminStore } from '../data/adminStore'
import Icon from '../components/Icon'

function CopyButton({ url }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2400)
  }

  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 text-label-sm font-bold px-3 py-1.5 rounded-lg transition-all ${
        copied
          ? 'bg-secondary-container text-primary'
          : 'bg-surface-container text-on-surface-variant hover:bg-secondary-container/50 hover:text-primary'
      }`}
    >
      <Icon name={copied ? 'check' : 'content_copy'} size={14} />
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  )
}

function PropertyCard({ property }) {
  const guestUrl = `${window.location.origin}/${property.slug}`

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-teal-sm hover:shadow-teal-md transition-shadow">
      {/* Hero image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.photos.hero}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <h3 className="text-white font-bold text-headline-md">{property.name}</h3>
          <span
            className={`text-label-sm font-bold px-2.5 py-1 rounded-full ${
              property.status === 'active'
                ? 'bg-green-500/90 text-white'
                : 'bg-amber-400/90 text-amber-900'
            }`}
          >
            {property.status === 'active' ? 'Active' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5">
        <p className="text-on-surface-variant text-body-md mb-4">{property.address}</p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: 'bed', label: 'Beds', value: property.bedrooms },
            { icon: 'bathroom', label: 'Baths', value: property.bathrooms },
            { icon: 'group', label: 'Guests', value: property.maxGuests },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container rounded-xl p-2.5 text-center">
              <Icon name={s.icon} size={18} className="text-primary mb-0.5" />
              <div className="text-primary font-bold">{s.value}</div>
              <div className="text-on-surface-variant text-label-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pet policy */}
        <div className="flex items-center gap-2 mb-4 text-label-md text-on-surface-variant">
          <Icon
            name={property.petsAllowed ? 'pets' : 'do_not_disturb'}
            size={16}
            className={property.petsAllowed ? 'text-secondary' : 'text-on-surface-variant'}
          />
          {property.petsAllowed
            ? `Pets allowed (${property.petFee})`
            : 'No pets'}
        </div>

        {/* Guest link */}
        <div className="bg-surface-container rounded-xl px-3 py-2.5 flex items-center gap-2 mb-4">
          <Icon name="link" size={16} className="text-primary flex-shrink-0" />
          <a
            href={guestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-label-md font-semibold truncate hover:underline flex-1"
          >
            {guestUrl}
          </a>
          <CopyButton url={guestUrl} />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/admin/property/${property.slug}`}
            className="flex-1 bg-primary text-white py-2.5 rounded-xl text-label-md font-semibold text-center flex items-center justify-center gap-1.5 hover:bg-primary-container transition-colors"
          >
            <Icon name="edit" size={16} className="text-white" /> Edit
          </Link>
          <a
            href={`/${property.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-label-md font-semibold border border-outline-variant text-on-surface-variant flex items-center gap-1.5 hover:bg-surface-container transition-colors"
          >
            <Icon name="visibility" size={16} /> Preview
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [properties, setProperties] = useState(adminStore.getProperties())

  useEffect(() => {
    const unsub = adminStore.subscribe(() => setProperties(adminStore.getProperties()))
    return unsub
  }, [])

  const activeCount = properties.filter((p) => p.status === 'active').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">Dashboard</h1>
          <p className="text-on-surface-variant text-body-md">
            {activeCount} of {properties.length} properties active
          </p>
        </div>
        <Link
          to="/admin/new-property"
          className="bg-primary text-white px-5 py-2.5 rounded-xl text-label-md font-semibold flex items-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Icon name="add" size={18} className="text-white" /> Add Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: 'home_work', label: 'Total Properties', value: properties.length, color: 'text-primary' },
          { icon: 'check_circle', label: 'Active', value: activeCount, color: 'text-green-600' },
          { icon: 'rule', label: 'Shared Sections', value: 5, color: 'text-secondary' },
          { icon: 'link', label: 'Live Guest Links', value: activeCount, color: 'text-primary' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20">
            <Icon name={stat.icon} size={22} className={`${stat.color} mb-2`} />
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-on-surface-variant text-label-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Property cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <PropertyCard key={prop.slug} property={prop} />
        ))}

        {/* Add new card */}
        <Link
          to="/admin/new-property"
          className="border-2 border-dashed border-outline-variant/40 rounded-2xl flex flex-col items-center justify-center p-10 text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/3 transition-colors group min-h-[300px]"
        >
          <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary-container transition-colors">
            <Icon name="add_home" size={28} className="text-on-surface-variant group-hover:text-primary" />
          </div>
          <p className="font-semibold text-label-md">Add New Property</p>
          <p className="text-label-sm mt-1">Live guidebook link in minutes</p>
        </Link>
      </div>
    </div>
  )
}
