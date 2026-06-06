import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminStore } from '../data/adminStore'
import Icon from '../components/Icon'

const STEPS = [
  { label: 'Import / Basic Info', icon: 'home' },
  { label: 'Location & Access', icon: 'key' },
  { label: 'Rooms & Amenities', icon: 'bed' },
  { label: 'Area Guide', icon: 'explore' },
]

const initialForm = {
  name: '', slug: '', address: '', neighborhood: 'Mission Hills',
  tagline: '', welcomeMessage: '',
  ownerName: 'Joe Saari', ownerPhone: '+1 (608) 239-3574', ownerEmail: 'saari.joseph@gmail.com',
  heroColor: '#00464d', petsAllowed: false, petFee: '',
  maxGuests: '', bedrooms: '', bathrooms: '',
  checkInTime: '4:00 PM', checkoutTime: '11:00 AM',
  wifiNetwork: '', wifiPassword: '',
  entryInstructions: '', parkingInstructions: '',
  livingRoom: '', kitchen: '', outdoor: '', laundry: '',
}

function LodgifyModal({ lodgifyData, existingProperties, onContinue, onSelectManually, onClose }) {
  const [selected, setSelected] = useState(() => {
    const init = {}
    lodgifyData.forEach((p) => { init[p.id] = true })
    return init
  })
  const [mode, setMode] = useState('preview') // 'preview' | 'select'

  const existingSlugs = new Set(existingProperties.map((p) => p.slug))
  const alreadyListed = lodgifyData.filter((p) =>
    existingProperties.some((ep) => ep.address?.toLowerCase().includes(p.address?.split(',')[0]?.toLowerCase()))
  )
  const toImport = lodgifyData.filter((p) => !alreadyListed.includes(p))

  const toggleSelect = (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }))

  if (mode === 'select') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-teal-lg w-full max-w-lg">
          <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
            <h3 className="text-headline-md font-bold text-primary">Select Properties to Import</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container transition-colors">
              <Icon name="close" size={20} className="text-on-surface-variant" />
            </button>
          </div>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {lodgifyData.map((prop) => {
              const isListed = alreadyListed.includes(prop)
              return (
                <label key={prop.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  selected[prop.id] ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:bg-surface-container'
                } ${isListed ? 'opacity-60' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!selected[prop.id]}
                    onChange={() => toggleSelect(prop.id)}
                    className="mt-0.5 accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-on-surface">{prop.name}</p>
                      {isListed && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Already Listed</span>
                      )}
                    </div>
                    <p className="text-body-md text-on-surface-variant mt-0.5">{prop.address}</p>
                    <p className="text-label-sm text-on-surface-variant">{prop.bedrooms} BR · {prop.bathrooms} BA · {prop.maxGuests} guests</p>
                  </div>
                </label>
              )
            })}
          </div>
          <div className="p-6 flex gap-3 border-t border-outline-variant/10">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-label-md font-semibold hover:bg-surface-container transition-colors">
              Cancel
            </button>
            <button
              onClick={() => onContinue(lodgifyData.filter((p) => selected[p.id]))}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-label-md font-semibold hover:bg-primary-container transition-colors"
            >
              Import Selected ({Object.values(selected).filter(Boolean).length})
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-teal-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center">
              <Icon name="sync" size={20} className="text-primary" />
            </div>
            <h3 className="text-headline-md font-bold text-primary">Lodgify Properties Found</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container transition-colors">
            <Icon name="close" size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {alreadyListed.length > 0 && (
            <div>
              <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Already listed ({alreadyListed.length})
              </p>
              <div className="space-y-2">
                {alreadyListed.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                    <Icon name="check_circle" size={18} className="text-secondary flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-on-surface text-label-md">{p.name}</p>
                      <p className="text-label-sm text-on-surface-variant">{p.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {toImport.length > 0 && (
            <div>
              <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Ready to import ({toImport.length})
              </p>
              <div className="space-y-2">
                {toImport.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <Icon name="add_circle" size={18} className="text-primary flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-on-surface text-label-md">{p.name}</p>
                      <p className="text-label-sm text-on-surface-variant">{p.address}</p>
                      <p className="text-label-sm text-primary">{p.bedrooms} BR · {p.bathrooms} BA · up to {p.maxGuests} guests</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {toImport.length === 0 && alreadyListed.length > 0 && (
            <p className="text-on-surface-variant text-body-md text-center py-2">All Lodgify properties are already in your guidebooks.</p>
          )}
        </div>

        <div className="p-6 flex gap-3 border-t border-outline-variant/10">
          <button
            onClick={() => setMode('select')}
            className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-label-md font-semibold hover:bg-surface-container transition-colors"
          >
            Select Manually
          </button>
          <button
            onClick={() => onContinue(toImport)}
            disabled={toImport.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-label-md font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            Import All ({toImport.length})
          </button>
        </div>
      </div>
    </div>
  )
}

function LodgifyImport({ onImport }) {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lodgifyData, setLodgifyData] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const existingProperties = adminStore.getProperties()

  const fetchLodgify = async () => {
    if (!apiKey.trim()) { setError('Please enter your Lodgify API key.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('https://api.lodgify.com/v2/properties?includeCount=false&offset=0&size=50', {
        headers: { 'X-ApiKey': apiKey.trim(), 'Accept': 'application/json' },
      })
      if (!res.ok) throw new Error(`Lodgify returned ${res.status}`)
      const data = await res.json()
      const items = Array.isArray(data) ? data : (data.items || data.properties || [])
      const normalized = items.map((p) => ({
        id: String(p.id),
        name: p.name || p.title || 'Unnamed Property',
        address: [p.address?.street, p.address?.city, p.address?.state, p.address?.postal_code].filter(Boolean).join(', '),
        bedrooms: p.bedrooms_count || p.bedrooms || 0,
        bathrooms: p.bathrooms_count || p.bathrooms || 0,
        maxGuests: p.max_guests || p.guests_count || 10,
        wifiNetwork: p.wifi_name || '',
        wifiPassword: p.wifi_password || '',
        heroImage: p.main_image?.url || '',
        _raw: p,
      }))
      setLodgifyData(normalized)
      setShowModal(true)
    } catch (e) {
      setError(`Could not connect to Lodgify: ${e.message}. Check your API key.`)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = (selected) => {
    setShowModal(false)
    onImport(selected)
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name="integration_instructions" size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-on-surface">Import from Lodgify PMS</h3>
          <p className="text-body-md text-on-surface-variant">Auto-populate property details from your Lodgify account.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchLodgify()}
          placeholder="Lodgify API Key (Settings → API Keys)"
          className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm"
        />
        <button
          onClick={fetchLodgify}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-label-md font-semibold flex items-center gap-2 hover:bg-primary-container transition-colors disabled:opacity-60"
        >
          {loading ? <Icon name="refresh" size={16} className="text-white animate-spin" /> : <Icon name="sync" size={16} className="text-white" />}
          {loading ? 'Fetching…' : 'Connect'}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-red-600 text-label-sm flex items-center gap-1.5">
          <Icon name="error" size={14} className="text-red-600" /> {error}
        </p>
      )}

      <p className="text-label-sm text-on-surface-variant mt-3">
        Or skip and fill in the details manually below.
      </p>

      {showModal && lodgifyData && (
        <LodgifyModal
          lodgifyData={lodgifyData}
          existingProperties={existingProperties}
          onContinue={handleContinue}
          onSelectManually={() => {}}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default function NewProperty() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

  const autoSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleLodgifyImport = (properties) => {
    if (properties.length === 0) return
    const first = properties[0]
    setForm((prev) => ({
      ...prev,
      name: first.name,
      slug: autoSlug(first.name),
      address: first.address,
      maxGuests: String(first.maxGuests || ''),
      bedrooms: String(first.bedrooms || ''),
      bathrooms: String(first.bathrooms || ''),
      wifiNetwork: first.wifiNetwork || prev.wifiNetwork,
      wifiPassword: first.wifiPassword || prev.wifiPassword,
    }))
    if (properties.length > 1) {
      properties.slice(1).forEach((p) => {
        const prop = {
          id: autoSlug(p.name),
          slug: autoSlug(p.name),
          name: p.name,
          address: p.address,
          neighborhood: 'Mission Hills',
          tagline: `Welcome to ${p.name}!`,
          welcomeMessage: '',
          ownerName: 'Joe Saari',
          ownerPhone: '+1 (608) 239-3574',
          ownerEmail: 'saari.joseph@gmail.com',
          heroColor: '#00464d',
          status: 'draft',
          petsAllowed: false,
          petFee: null,
          checkoutTime: '11:00 AM',
          checkInTime: '4:00 PM',
          maxGuests: parseInt(p.maxGuests) || 10,
          bedrooms: parseInt(p.bedrooms) || 3,
          bathrooms: parseFloat(p.bathrooms) || 2,
          wifi: { network: p.wifiNetwork, password: p.wifiPassword, notes: '' },
          entry: { instructions: [] },
          parking: { instructions: [] },
          bedrooms_detail: { queensBeds: 0, fullBeds: 0, sofaBeds: 0, description: '' },
          bathrooms_detail: { full: parseInt(p.bathrooms) || 2, half: 0, description: '' },
          laundry: '', livingRoom: '', dining: '', kitchen: '', outdoor: '', trash: '',
          amenities: [],
          photos: { hero: p.heroImage || '', bedrooms: [], living: [], kitchen: [], outdoor: [] },
        }
        adminStore.addProperty(prop)
      })
    }
    setStep(1)
  }

  const handleCreate = () => {
    const prop = {
      id: form.slug || autoSlug(form.name),
      slug: form.slug || autoSlug(form.name),
      name: form.name,
      address: form.address,
      neighborhood: form.neighborhood,
      tagline: form.tagline || `Welcome to ${form.name}!`,
      welcomeMessage: form.welcomeMessage,
      ownerName: form.ownerName,
      ownerPhone: form.ownerPhone,
      ownerEmail: form.ownerEmail,
      heroColor: form.heroColor,
      status: 'draft',
      petsAllowed: form.petsAllowed,
      petFee: form.petFee,
      checkoutTime: form.checkoutTime,
      checkInTime: form.checkInTime,
      maxGuests: parseInt(form.maxGuests) || 10,
      bedrooms: parseInt(form.bedrooms) || 3,
      bathrooms: parseFloat(form.bathrooms) || 2,
      wifi: { network: form.wifiNetwork, password: form.wifiPassword, notes: '1Gbps high-speed internet.' },
      entry: { instructions: form.entryInstructions.split('\n').filter(Boolean) },
      parking: { instructions: form.parkingInstructions.split('\n').filter(Boolean) },
      bedrooms_detail: { queensBeds: 0, fullBeds: 0, sofaBeds: 0, description: '' },
      bathrooms_detail: { full: parseInt(form.bathrooms) || 2, half: 0, description: '' },
      laundry: form.laundry,
      livingRoom: form.livingRoom,
      dining: '',
      kitchen: form.kitchen,
      outdoor: form.outdoor,
      trash: '',
      amenities: [],
      photos: {
        hero: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
        bedrooms: [],
        living: [],
        kitchen: [],
        outdoor: [],
      },
    }
    adminStore.addProperty(prop)
    navigate(`/admin/property/${prop.slug}`)
  }

  const InputField = ({ label, field, type = 'text', placeholder }) => (
    <div>
      <label className="block text-label-md font-semibold text-on-surface mb-1.5">{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={(e) => {
          update(field, e.target.value)
          if (field === 'name') update('slug', autoSlug(e.target.value))
        }}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
      />
    </div>
  )

  const TextareaField = ({ label, field, rows = 4, placeholder }) => (
    <div>
      <label className="block text-label-md font-semibold text-on-surface mb-1.5">{label}</label>
      <textarea
        value={form[field]}
        onChange={(e) => update(field, e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-y"
      />
    </div>
  )

  const stepContent = [
    // Step 0: Lodgify import + Basic info
    <div key={0} className="space-y-4">
      <LodgifyImport onImport={handleLodgifyImport} />

      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-outline-variant/30" />
        <span className="text-label-sm text-on-surface-variant font-semibold">or fill in manually</span>
        <div className="flex-1 h-px bg-outline-variant/30" />
      </div>

      <InputField label="Property Name *" field="name" placeholder="e.g. Ocean View Villa" />
      <InputField label="URL Slug (auto-generated)" field="slug" placeholder="ocean-view-villa" />
      <InputField label="Owner Name" field="ownerName" />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Phone" field="ownerPhone" />
        <InputField label="Email" field="ownerEmail" type="email" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Max Guests" field="maxGuests" type="number" placeholder="12" />
        <div>
          <label className="block text-label-md font-semibold text-on-surface mb-1.5">Hero Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={form.heroColor} onChange={(e) => update('heroColor', e.target.value)}
              className="w-12 h-10 rounded-lg border border-outline-variant cursor-pointer" />
            <span className="text-on-surface-variant font-mono">{form.heroColor}</span>
          </div>
        </div>
      </div>
      <TextareaField label="Welcome Message" field="welcomeMessage" placeholder="Welcome guests to your property…" />
    </div>,

    // Step 1: Location & access
    <div key={1} className="space-y-4">
      <InputField label="Full Address *" field="address" placeholder="1234 Ocean Dr, San Diego, CA 92103" />
      <InputField label="Neighborhood" field="neighborhood" placeholder="Mission Hills" />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Check-In Time" field="checkInTime" placeholder="4:00 PM" />
        <InputField label="Check-Out Time" field="checkoutTime" placeholder="11:00 AM" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="WiFi Network Name" field="wifiNetwork" placeholder="My_Guest_WiFi" />
        <InputField label="WiFi Password" field="wifiPassword" placeholder="password123" />
      </div>
      <TextareaField label="Entry Instructions (one per line)" field="entryInstructions"
        placeholder={"Enter the 4-digit code on the keypad.\nThe code will be sent to you on check-in day."} />
      <TextareaField label="Parking Instructions (one per line)" field="parkingInstructions"
        placeholder={"2 spots in the carport behind the house.\nStreet parking available on Eagle St."} />
      <div>
        <label className="block text-label-md font-semibold text-on-surface mb-2">Pets Allowed?</label>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => update('petsAllowed', !form.petsAllowed)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${form.petsAllowed ? 'bg-primary' : 'bg-outline-variant'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.petsAllowed ? 'translate-x-7' : 'translate-x-1'}`} />
          </div>
          <span className="text-on-surface">{form.petsAllowed ? 'Yes' : 'No'}</span>
        </label>
        {form.petsAllowed && (
          <input type="text" placeholder="Pet fee (e.g. $75 per pet)" value={form.petFee}
            onChange={(e) => update('petFee', e.target.value)}
            className="mt-2 w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-all" />
        )}
      </div>
    </div>,

    // Step 2: Rooms
    <div key={2} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Bedrooms" field="bedrooms" type="number" placeholder="4" />
        <InputField label="Bathrooms" field="bathrooms" type="number" placeholder="2.5" />
      </div>
      <TextareaField label="Living Room" field="livingRoom" placeholder="Describe the living room…" />
      <TextareaField label="Kitchen" field="kitchen" placeholder="Describe the kitchen and what's stocked…" />
      <TextareaField label="Outdoor Spaces" field="outdoor" placeholder="Describe the outdoor areas…" />
      <TextareaField label="Laundry" field="laundry" placeholder="Washer/dryer location and details…" />
    </div>,

    // Step 3: Area guide
    <div key={3} className="space-y-4">
      <div className="bg-secondary-container/20 border border-secondary/20 rounded-xl p-4 flex gap-3">
        <Icon name="info" size={18} className="text-primary flex-shrink-0" />
        <p className="text-on-surface-variant text-body-md">
          Area guide content (restaurants, things to do, places to see, nearest stores) is pre-populated with the Mission Hills recommendations from the existing properties. You can edit them per-property in the Property Editor after creation.
        </p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20">
        <h4 className="font-semibold text-on-surface mb-3">Shared rules auto-applied</h4>
        <p className="text-on-surface-variant text-body-md">These 5 sections are automatically inherited from the Shared Rules engine:</p>
        <ul className="mt-3 space-y-2">
          {['House Rules', 'Legal & Important Info', 'Things to Know', 'Check-Out Instructions', 'Getting Around'].map((s) => (
            <li key={s} className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <Icon name="check_circle" size={16} className="text-secondary" /> {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20">
        <h4 className="font-semibold text-on-surface mb-3">Add photos after creation</h4>
        <p className="text-on-surface-variant text-body-md">
          After creating this property, go to the <strong>Photos</strong> section in the Property Editor to upload photos for each room. The number of photo slots automatically matches your bedroom count and other room types.
        </p>
      </div>
    </div>,
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-primary mb-1">Add New Property</h1>
        <p className="text-on-surface-variant text-body-md">
          Import from Lodgify or fill in the details to create a live guest guidebook link.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold flex-shrink-0 transition-colors ${
              i < step ? 'bg-secondary-container text-primary'
              : i === step ? 'bg-primary text-white'
              : 'bg-surface-container text-on-surface-variant'
            }`}>
              {i < step ? <Icon name="check" size={16} /> : i + 1}
            </div>
            <span className={`text-label-md hidden sm:inline ${i === step ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-secondary-container' : 'bg-outline-variant/30'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 mb-6">
        <h2 className="text-headline-md font-semibold text-primary mb-5 flex items-center gap-2">
          <Icon name={STEPS[step].icon} size={20} className="text-primary" />
          {STEPS[step].label}
        </h2>
        {stepContent[step]}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : null}
          disabled={step === 0}
          className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-label-md font-semibold disabled:opacity-40 hover:bg-surface-container transition-colors"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!form.name}
            className="bg-primary text-white px-6 py-2.5 rounded-xl text-label-md font-semibold flex items-center gap-2 hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            Next <Icon name="arrow_forward" size={16} className="text-white" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            className="bg-primary text-white px-6 py-2.5 rounded-xl text-label-md font-semibold flex items-center gap-2 hover:bg-primary-container transition-colors"
          >
            <Icon name="add_home" size={16} className="text-white" /> Create Property
          </button>
        )}
      </div>
    </div>
  )
}
