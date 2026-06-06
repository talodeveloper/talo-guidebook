import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminStore } from '../data/adminStore'
import { SHARED_SECTION_LABELS } from '../data/sharedContent'
import Icon from '../components/Icon'

const PROPERTY_SECTIONS = [
  { key: 'cover', label: 'Cover & Welcome', icon: 'home' },
  { key: 'photos', label: 'Photos', icon: 'photo_library' },
  { key: 'wifi', label: 'WiFi', icon: 'wifi' },
  { key: 'entry', label: 'Entry', icon: 'key' },
  { key: 'parking', label: 'Parking', icon: 'local_parking' },
  { key: 'bedrooms', label: 'Bedrooms', icon: 'bed' },
  { key: 'bathrooms', label: 'Bathrooms', icon: 'bathroom' },
  { key: 'laundry', label: 'Laundry', icon: 'local_laundry_service' },
  { key: 'living_room', label: 'Living Room', icon: 'weekend' },
  { key: 'dining', label: 'Dining Room', icon: 'dining' },
  { key: 'kitchen', label: 'Kitchen', icon: 'kitchen' },
  { key: 'outdoor', label: 'Outdoor Spaces', icon: 'deck' },
  { key: 'trash', label: 'Trash & Recycling', icon: 'delete' },
  { key: 'pets', label: 'Pet Policy', icon: 'pets' },
  { key: 'things_to_do', label: 'Things to Do', icon: 'directions_bike' },
  { key: 'places_to_see', label: 'Places to See', icon: 'photo_camera' },
  { key: 'restaurants', label: 'Restaurants', icon: 'restaurant' },
  { key: 'nearest_stores', label: 'Nearest Stores', icon: 'shopping_basket' },
]

const SHARED_SECTIONS = Object.entries(SHARED_SECTION_LABELS).map(([key, label]) => ({
  key,
  label,
  shared: true,
  icon:
    key === 'houseRules' ? 'gavel'
    : key === 'legalInfo' ? 'policy'
    : key === 'thingsToKnow' ? 'info'
    : key === 'checkoutInstructions' ? 'logout'
    : 'directions',
}))

function PhotoSlot({ photo, caption, onUpload, onCaptionChange, slotLabel }) {
  const inputRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onUpload(ev.target.result, file.name)
    reader.readAsDataURL(file)
  }

  return (
    <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest">
      <div
        className="relative aspect-[4/3] cursor-pointer group bg-surface-container"
        onClick={() => inputRef.current?.click()}
      >
        {photo ? (
          <>
            <img src={photo} alt={caption || slotLabel} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Icon name="upload" size={28} className="text-white" />
              <span className="text-white text-label-sm font-semibold">Replace Photo</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors">
            <Icon name="add_photo_alternate" size={32} />
            <span className="text-label-sm font-semibold">{slotLabel}</span>
            <span className="text-xs opacity-60">Click to upload</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      <div className="p-2">
        <input
          type="text"
          value={caption || ''}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Caption (e.g. Bedroom 1 — Queen Bed)"
          className="w-full text-xs px-2 py-1.5 rounded-lg border border-outline-variant/40 bg-surface text-on-surface focus:outline-none focus:border-primary transition-all"
        />
      </div>
    </div>
  )
}

function PhotosEditor({ property, onSave }) {
  const bedroomCount = property.bedrooms || 3
  const kitchenCount = property.slug === 'hawk-street' ? 2 : 1

  const initSlots = (existing = [], count, defaultLabel) =>
    Array.from({ length: count }, (_, i) => ({
      src: existing[i]?.src || '',
      caption: existing[i]?.caption || `${defaultLabel} ${i + 1}`,
    }))

  const [hero, setHero] = useState({ src: property.photos?.hero || '', caption: 'Property Exterior' })
  const [exterior, setExterior] = useState({ src: property.photos?.exterior || '', caption: 'Property Exterior' })
  const [bedrooms, setBedrooms] = useState(initSlots(property.photos?.bedrooms, bedroomCount, 'Bedroom'))
  const [living, setLiving] = useState(initSlots(property.photos?.living, 2, 'Living Room'))
  const [kitchen, setKitchen] = useState(initSlots(property.photos?.kitchen, kitchenCount, 'Kitchen'))
  const [outdoor, setOutdoor] = useState(initSlots(property.photos?.outdoor, 4, 'Outdoor'))
  const [studio, setStudio] = useState(property.photos?.studio ? initSlots(property.photos.studio, 4, 'Studio') : null)
  const [saved, setSaved] = useState(false)

  const updateSlot = (setter, idx, field, val) =>
    setter((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p))

  const handleSave = () => {
    const updatedPhotos = {
      hero: hero.src,
      exterior: exterior.src || property.photos?.exterior || '',
      bedrooms,
      living,
      kitchen,
      outdoor,
      ...(studio ? { studio } : {}),
      entry: property.photos?.entry || '',
      parking: property.photos?.parking || '',
    }
    onSave({ photos: updatedPhotos })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const SectionGrid = ({ label, slots, setter, icon, cols = 3 }) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Icon name={icon} size={18} className="text-primary" />
        <h4 className="font-semibold text-on-surface">{label}</h4>
        <span className="text-label-sm text-on-surface-variant ml-auto">{slots.length} slot{slots.length > 1 ? 's' : ''}</span>
      </div>
      <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-4`}>
        {slots.map((slot, idx) => (
          <PhotoSlot
            key={idx}
            photo={slot.src}
            caption={slot.caption}
            slotLabel={`${label} ${idx + 1}`}
            onUpload={(src) => updateSlot(setter, idx, 'src', src)}
            onCaptionChange={(cap) => updateSlot(setter, idx, 'caption', cap)}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="photo_camera" size={18} className="text-primary" />
          <h4 className="font-semibold text-on-surface">Hero / Cover Photo</h4>
        </div>
        <div className="max-w-sm">
          <PhotoSlot
            photo={hero.src}
            caption={hero.caption}
            slotLabel="Hero Photo"
            onUpload={(src) => setHero((prev) => ({ ...prev, src }))}
            onCaptionChange={(cap) => setHero((prev) => ({ ...prev, caption: cap }))}
          />
        </div>
      </div>

      {/* Exterior — shown in the property info card on guidebook */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="villa" size={18} className="text-primary" />
          <h4 className="font-semibold text-on-surface">Exterior Photo</h4>
          <span className="ml-auto text-label-sm text-on-surface-variant bg-secondary-container/40 px-2 py-0.5 rounded-full">Shown in property card</span>
        </div>
        <p className="text-label-sm text-on-surface-variant mb-3">This photo appears at the top of the guest guidebook alongside property details.</p>
        <div className="max-w-sm">
          <PhotoSlot
            photo={exterior.src}
            caption={exterior.caption}
            slotLabel="Exterior Photo"
            onUpload={(src) => setExterior((prev) => ({ ...prev, src }))}
            onCaptionChange={(cap) => setExterior((prev) => ({ ...prev, caption: cap }))}
          />
        </div>
      </div>

      <SectionGrid label="Bedroom" slots={bedrooms} setter={setBedrooms} icon="bed" cols={3} />
      <SectionGrid label="Living Room" slots={living} setter={setLiving} icon="weekend" cols={2} />
      <SectionGrid label="Kitchen" slots={kitchen} setter={setKitchen} icon="kitchen" cols={2} />
      <SectionGrid label="Outdoor" slots={outdoor} setter={setOutdoor} icon="deck" cols={3} />
      {studio && <SectionGrid label="Studio" slots={studio} setter={setStudio} icon="meeting_room" cols={2} />}

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-label-md font-semibold transition-all ${
            saved ? 'bg-secondary-container text-primary' : 'bg-primary text-white hover:bg-primary-container'
          }`}
        >
          <Icon name={saved ? 'check' : 'save'} size={16} className={saved ? 'text-primary' : 'text-white'} />
          {saved ? 'Photos Saved!' : 'Save Photos'}
        </button>
      </div>
    </div>
  )
}

function CoverEditor({ property, onSave }) {
  const [form, setForm] = useState({
    tagline: property.tagline || '',
    welcomeMessage: property.welcomeMessage || '',
    ownerName: property.ownerName || '',
    ownerPhone: property.ownerPhone || '',
    ownerEmail: property.ownerEmail || '',
    heroColor: property.heroColor || '#00464d',
    petsAllowed: property.petsAllowed || false,
    petFee: property.petFee || '',
    checkInTime: property.checkInTime || '4:00 PM',
    checkoutTime: property.checkoutTime || '11:00 AM',
    maxGuests: property.maxGuests || '',
  })
  const [saved, setSaved] = useState(false)

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

  const handleSave = () => {
    onSave(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-label-md font-semibold text-on-surface mb-1.5">Welcome Tagline</label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => update('tagline', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-label-md font-semibold text-on-surface mb-1.5">Welcome Message</label>
          <textarea
            value={form.welcomeMessage}
            onChange={(e) => update('welcomeMessage', e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-y"
          />
        </div>
        <div>
          <label className="block text-label-md font-semibold text-on-surface mb-1.5">Owner Name</label>
          <input type="text" value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all" />
        </div>
        <div>
          <label className="block text-label-md font-semibold text-on-surface mb-1.5">Phone</label>
          <input type="text" value={form.ownerPhone} onChange={(e) => update('ownerPhone', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all" />
        </div>
        <div>
          <label className="block text-label-md font-semibold text-on-surface mb-1.5">Email</label>
          <input type="email" value={form.ownerEmail} onChange={(e) => update('ownerEmail', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all" />
        </div>
        <div>
          <label className="block text-label-md font-semibold text-on-surface mb-1.5">Max Guests</label>
          <input type="number" value={form.maxGuests} onChange={(e) => update('maxGuests', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all" />
        </div>
        <div>
          <label className="block text-label-md font-semibold text-on-surface mb-1.5">Check-In Time</label>
          <input type="text" value={form.checkInTime} onChange={(e) => update('checkInTime', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all" />
        </div>
        <div>
          <label className="block text-label-md font-semibold text-on-surface mb-1.5">Check-Out Time</label>
          <input type="text" value={form.checkoutTime} onChange={(e) => update('checkoutTime', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all" />
        </div>
        <div>
          <label className="block text-label-md font-semibold text-on-surface mb-1.5">Hero Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={form.heroColor} onChange={(e) => update('heroColor', e.target.value)}
              className="w-12 h-10 rounded-lg border border-outline-variant cursor-pointer" />
            <span className="text-on-surface-variant text-body-md font-mono">{form.heroColor}</span>
          </div>
        </div>
        <div>
          <label className="block text-label-md font-semibold text-on-surface mb-1.5">Pets Allowed</label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => update('petsAllowed', !form.petsAllowed)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                form.petsAllowed ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                form.petsAllowed ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </div>
            <span className="text-on-surface">{form.petsAllowed ? 'Yes' : 'No'}</span>
          </label>
          {form.petsAllowed && (
            <input
              type="text"
              placeholder="Pet fee (e.g. $75 per pet)"
              value={form.petFee}
              onChange={(e) => update('petFee', e.target.value)}
              className="mt-2 w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all"
            />
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-label-md font-semibold transition-all ${
            saved ? 'bg-secondary-container text-primary' : 'bg-primary text-white hover:bg-primary-container'
          }`}
        >
          <Icon name={saved ? 'check' : 'save'} size={16} className={saved ? 'text-primary' : 'text-white'} />
          {saved ? 'Saved!' : 'Save Section'}
        </button>
      </div>
    </div>
  )
}

function TextEditor({ label, value: initialValue, onSave }) {
  const [value, setValue] = useState(initialValue || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSave(value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={10}
        placeholder={`Enter ${label} information here…`}
        className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-body-md leading-relaxed focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-y"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-label-md font-semibold transition-all ${
            saved ? 'bg-secondary-container text-primary' : 'bg-primary text-white hover:bg-primary-container'
          }`}
        >
          <Icon name={saved ? 'check' : 'save'} size={16} className={saved ? 'text-primary' : 'text-white'} />
          {saved ? 'Saved!' : 'Save Section'}
        </button>
      </div>
    </div>
  )
}

function getSectionContent(property, sectionKey) {
  const map = {
    wifi: `Network: ${property.wifi?.network}\nPassword: ${property.wifi?.password}\nNotes: ${property.wifi?.notes}`,
    entry: property.entry?.instructions?.join('\n') || '',
    parking: property.parking?.instructions?.join('\n') || '',
    bedrooms: property.bedrooms_detail?.description || '',
    bathrooms: property.bathrooms_detail?.description || '',
    laundry: property.laundry || '',
    living_room: property.livingRoom || '',
    dining: property.dining || '',
    kitchen: property.kitchen || '',
    outdoor: property.outdoor || '',
    trash: property.trash || '',
    pets: property.petsAllowed ? `Pets allowed. Fee: ${property.petFee}` : 'No pets allowed.',
    things_to_do: 'Kayaking/SUP at Mission Bay · Hiking at Balboa Park · Sailing · Golf at Balboa Park · Fashion Valley Mall',
    places_to_see: 'Balboa Park · Coronado Island · Little Italy · Legoland · SeaWorld · San Diego Zoo',
    restaurants: "Filippi's Pizza Grotto · Buon Appetito · Soi PB Thai · La Puerta",
    nearest_stores: 'Vons (5 min walk) · Clover Leaf Market (across the street) · Starbucks (5 min walk) · Target (10 min drive)',
  }
  return map[sectionKey] || ''
}

export default function PropertyEditor() {
  const { slug } = useParams()
  const [property, setProperty] = useState(adminStore.getProperty(slug))
  const [activeSection, setActiveSection] = useState(PROPERTY_SECTIONS[0].key)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProperty(adminStore.getProperty(slug))
    const unsub = adminStore.subscribe(() => setProperty(adminStore.getProperty(slug)))
    return unsub
  }, [slug])

  if (!property) return <div className="text-on-surface-variant p-8">Property not found.</div>

  const guestUrl = `${window.location.origin}/${slug}`

  const handleSaveSection = (key, value) => {
    console.log('Saving section', key, value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleSaveCover = (updates) => {
    adminStore.updateProperty(slug, updates)
  }

  const handleSavePhotos = (updates) => {
    adminStore.updateProperty(slug, updates)
  }

  const allSections = [...PROPERTY_SECTIONS, ...SHARED_SECTIONS]
  const activeMeta = allSections.find((s) => s.key === activeSection)

  return (
    <div>
      {/* Topbar */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link to="/admin/dashboard" className="text-on-surface-variant hover:text-primary transition-colors">
              <Icon name="arrow_back" size={20} />
            </Link>
            <h1 className="text-headline-lg font-bold text-primary truncate">{property.name}</h1>
            <span className={`text-label-sm font-bold px-2.5 py-1 rounded-full ${
              property.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {property.status === 'active' ? '● Active' : '○ Draft'}
            </span>
          </div>
          <p className="text-on-surface-variant text-body-md ml-8">{property.address}</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={guestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant text-label-md font-semibold hover:bg-surface-container transition-colors"
          >
            <Icon name="open_in_new" size={16} /> Preview
          </a>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(guestUrl)
              } else {
                const el = document.createElement('textarea')
                el.value = guestUrl
                document.body.appendChild(el)
                el.select()
                document.execCommand('copy')
                document.body.removeChild(el)
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-label-md font-semibold hover:bg-primary-container transition-colors"
          >
            <Icon name="content_copy" size={16} className="text-white" /> Copy Guest Link
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section sidebar */}
        <div className="lg:col-span-1 space-y-1">
          <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider px-1 mb-2">
            Property Sections
          </p>
          {PROPERTY_SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                activeSection === s.key
                  ? 'bg-secondary-container/60 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <Icon name={s.icon} size={16} />
              <span className="text-label-md truncate">{s.label}</span>
              {s.key === 'photos' && (
                <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">NEW</span>
              )}
            </button>
          ))}

          <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider px-1 mt-4 mb-2">
            Shared (All Properties)
          </p>
          {SHARED_SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                activeSection === s.key
                  ? 'bg-secondary-container/60 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <Icon name={s.icon} size={16} />
              <span className="text-label-md truncate">{s.label}</span>
              <span className="ml-auto text-[10px] font-bold text-secondary bg-secondary-container/60 px-1.5 py-0.5 rounded">ALL</span>
            </button>
          ))}
        </div>

        {/* Editor panel */}
        <div className="lg:col-span-3">
          {activeMeta && (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/10 bg-surface-container/50">
                <Icon name={activeMeta.icon} size={20} className="text-primary" />
                <h2 className="text-headline-md font-semibold text-primary flex-1">{activeMeta.label}</h2>
                {activeMeta.shared && (
                  <div className="flex items-center gap-2">
                    <span className="text-label-sm font-bold text-white bg-primary px-3 py-1 rounded-full">
                      ALL PROPERTIES
                    </span>
                    <Link
                      to="/admin/shared-rules"
                      className="text-label-sm text-secondary hover:underline"
                    >
                      Edit in Shared Rules →
                    </Link>
                  </div>
                )}
              </div>

              <div className="p-6">
                {activeMeta.shared ? (
                  <div className="space-y-4">
                    <div className="bg-secondary-container/20 border border-secondary/20 rounded-xl p-4 flex items-start gap-3">
                      <Icon name="info" size={18} className="text-primary flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-on-surface text-body-md">This section updates ALL properties</p>
                        <p className="text-on-surface-variant text-body-md mt-1">
                          Changes made here will instantly reflect in every property's guest guidebook. To edit, use the{' '}
                          <Link to="/admin/shared-rules" className="text-primary font-semibold hover:underline">
                            Shared Rules editor
                          </Link>.
                        </p>
                      </div>
                    </div>
                    <div className="bg-surface-container rounded-xl p-4 text-on-surface-variant text-body-md leading-relaxed opacity-60 select-none pointer-events-none">
                      This section is managed globally in Shared Rules and cannot be edited per-property.
                    </div>
                  </div>
                ) : activeSection === 'cover' ? (
                  <CoverEditor property={property} onSave={handleSaveCover} />
                ) : activeSection === 'photos' ? (
                  <PhotosEditor key={slug} property={property} onSave={handleSavePhotos} />
                ) : (
                  <TextEditor
                    key={activeSection}
                    label={activeMeta.label}
                    value={getSectionContent(property, activeSection)}
                    onSave={(val) => handleSaveSection(activeSection, val)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
