import { useOutletContext } from 'react-router-dom'
import Icon from '../components/Icon'

function PhotoGrid({ photos, title, icon }) {
  if (!photos || photos.length === 0) return null
  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 bg-secondary-container rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name={icon} size={18} className="text-primary" />
        </div>
        <h2 className="text-headline-md font-semibold text-primary">{title}</h2>
        <span className="ml-auto text-label-sm text-on-surface-variant">{photos.length} photo{photos.length > 1 ? 's' : ''}</span>
      </div>
      <div className={`grid gap-4 ${
        photos.length === 1 ? 'grid-cols-1'
        : photos.length === 2 ? 'grid-cols-2'
        : photos.length === 3 ? 'grid-cols-3'
        : photos.length === 4 ? 'grid-cols-2 md:grid-cols-4'
        : 'grid-cols-2 md:grid-cols-3'
      }`}>
        {photos.map((photo, idx) => (
          <div key={idx} className="group rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm hover:shadow-md transition-all duration-300 bg-surface-container-lowest">
            <div className={`overflow-hidden ${photos.length === 1 ? 'aspect-[16/9]' : 'aspect-square'}`}>
              <img
                src={photo.src}
                alt={photo.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="px-3 py-2 text-label-sm text-on-surface-variant font-medium">{photo.caption}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function TheSpace() {
  const { property } = useOutletContext()
  const { photos } = property

  return (
    <div className="max-w-container-max mx-auto px-5 md:px-16 py-10">
      {/* Page header */}
      <div className="mb-10">
        <span className="text-label-sm text-secondary font-bold uppercase tracking-[0.2em] mb-2 block">
          {property.neighborhood} · San Diego
        </span>
        <h1 className="text-headline-xl font-bold text-primary mb-3">The Space</h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Thoughtfully furnished with comfort and style in mind. Every room is designed to make you feel at home — from the fully equipped kitchen to the outdoor spaces perfect for San Diego evenings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-10">
        {[
          { icon: 'bed', label: 'Bedrooms', value: property.bedrooms },
          { icon: 'bathroom', label: 'Bathrooms', value: property.bathrooms },
          { icon: 'group', label: 'Max Guests', value: property.maxGuests },
          { icon: 'local_laundry_service', label: 'Laundry', value: '✓' },
          { icon: 'wifi', label: 'WiFi', value: '1Gbps' },
          { icon: property.petsAllowed ? 'pets' : 'do_not_disturb', label: 'Pets', value: property.petsAllowed ? 'Allowed' : 'No Pets' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 text-center"
          >
            <Icon name={stat.icon} size={22} className="text-primary mb-1" />
            <div className="text-headline-md font-bold text-primary text-lg">{stat.value}</div>
            <div className="text-label-sm text-on-surface-variant">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Hero photo — full width */}
      <div className="mb-10 rounded-2xl overflow-hidden border border-outline-variant/20 shadow-teal-sm">
        <div className="aspect-[21/9] relative overflow-hidden">
          <img
            src={photos.hero}
            alt={`${property.name} exterior`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-6">
            <p className="text-white text-label-sm font-bold uppercase tracking-widest mb-1 opacity-80">{property.neighborhood} · San Diego</p>
            <h2 className="text-white text-headline-lg font-bold">{property.name}</h2>
            <p className="text-white/70 text-body-md">{property.address}</p>
          </div>
        </div>
      </div>

      {/* Bedrooms */}
      <PhotoGrid photos={photos.bedrooms} title="Bedrooms" icon="bed" />

      {/* Living Room */}
      <PhotoGrid photos={photos.living} title="Living & Dining Room" icon="weekend" />

      {/* Kitchen */}
      <PhotoGrid photos={photos.kitchen} title="Kitchen & Supplies" icon="kitchen" />

      {/* Studio (Reynard Way only) */}
      {photos.studio && (
        <PhotoGrid photos={photos.studio} title="The Studio" icon="meeting_room" />
      )}

      {/* Outdoor */}
      <PhotoGrid photos={photos.outdoor} title="Outdoor Spaces" icon="deck" />

      {/* Room details text */}
      <div className="space-y-4 mt-4 mb-10">
        <h2 className="text-headline-lg font-bold text-primary">Room Details</h2>
        {[
          { icon: 'weekend', title: 'Living Room', content: property.livingRoom },
          { icon: 'dining', title: 'Dining Room', content: property.dining },
          { icon: 'kitchen', title: 'Kitchen & Supplies', content: property.kitchen },
          { icon: 'bed', title: 'Bedrooms', content: property.bedrooms_detail.description },
          { icon: 'bathroom', title: 'Bathrooms', content: property.bathrooms_detail.description },
          { icon: 'local_laundry_service', title: 'Laundry', content: property.laundry },
          { icon: 'deck', title: 'Outdoor Spaces', content: property.outdoor },
          ...(property.studio ? [{ icon: 'meeting_room', title: 'The Studio', content: property.studio }] : []),
        ].map((section) => (
          <div
            key={section.title}
            className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 flex gap-4"
          >
            <div className="w-11 h-11 bg-secondary-container rounded-xl flex-shrink-0 flex items-center justify-center">
              <Icon name={section.icon} size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-headline-md font-semibold text-primary mb-2">{section.title}</h3>
              <p className="text-on-surface-variant text-body-md leading-relaxed">{section.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Amenities */}
      <div className="mt-10">
        <h4 className="text-label-sm text-on-surface-variant font-bold uppercase tracking-widest mb-4">All Amenities</h4>
        <div className="flex flex-wrap gap-2">
          {property.amenities.map((amenity) => (
            <div
              key={amenity}
              className="bg-surface-container-low text-primary px-4 py-2 rounded-full flex items-center gap-2 border border-outline-variant/30 text-label-md"
            >
              <Icon name="check_circle" size={16} className="text-secondary" />
              {amenity}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
