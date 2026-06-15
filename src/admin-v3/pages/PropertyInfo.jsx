import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminV3Store } from '../../data/adminV3Store'
import Icon from '../../components/Icon'
import ImagePicker from '../components/ImagePicker'

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {hint && <p className="text-[10px] text-slate-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300 bg-white"
    />
  )
}

function Card({ title, icon, children, saved, enabled, onToggle, toggleHint }) {
  const isOn = enabled !== false
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 mb-5 transition-opacity ${onToggle && !isOn ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
          <Icon name={icon} size={16} className="text-white" />
        </div>
        <h2 className="font-bold text-slate-900 text-base">{title}</h2>
        {saved && (
          <span className="ml-auto text-xs text-green-600 font-semibold flex items-center gap-1">
            <Icon name="check_circle" size={13} /> Saved to draft
          </span>
        )}
        {onToggle && (
          <div className={`flex items-center gap-2 ${saved ? '' : 'ml-auto'}`}>
            <span className="text-[10px] font-semibold text-slate-400">{isOn ? 'Shown' : 'Hidden'}</span>
            <button onClick={onToggle} title={toggleHint}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${isOn ? 'bg-green-500' : 'bg-slate-300'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${isOn ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>
        )}
      </div>
      {onToggle && !isOn && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
          {toggleHint || 'This card is hidden from the guidebook.'} You can still edit the values — they're kept.
        </p>
      )}
      {children}
    </div>
  )
}

export default function PropertyInfoV3() {
  const { slug } = useParams()
  const [info, setInfo] = useState(adminV3Store.getPropertyInfo(slug))
  const [saved, setSaved] = useState(null)

  // ── Check-In Welcome ───────────────────────────────────────────────────────
  const DEFAULT_CHECKIN_WELCOME = "Welcome! Please review each house rule below and tap the checkbox next to every rule to confirm you've read and agreed to it. All guests staying at this property are expected to follow these rules. Thank you for helping us keep this space special for everyone."
  const DEFAULT_CHECKIN_OFFER = "🎁 One more thing! Ask every adult (18+) in your group to complete their own check-in using this same link — when everyone signs in, you'll earn a $50 credit toward your next stay with TALO Rentals."
  const [welcomeText, setWelcomeText] = useState(info.checkInWelcome || DEFAULT_CHECKIN_WELCOME)
  const [offerText, setOfferText] = useState(info.checkInOfferText || DEFAULT_CHECKIN_OFFER)
  const welcomeSaved = saved === 'welcome'

  useEffect(() => {
    // Reset all form state when navigating between properties
    const fresh = adminV3Store.getPropertyInfo(slug)
    setInfo(fresh)
    setGen({ name: fresh.name, address: fresh.address, maxGuests: fresh.maxGuests, checkInTime: fresh.checkInTime, checkoutTime: fresh.checkoutTime })
    setWifi({ network: fresh.wifi?.network || '', password: fresh.wifi?.password || '', notes: fresh.wifi?.notes || '' })
    setHost({ ownerName: fresh.ownerName || '', ownerPhone: fresh.ownerPhone || '', ownerEmail: fresh.ownerEmail || '' })
    setWelcomeText(fresh.checkInWelcome || DEFAULT_CHECKIN_WELCOME)
    setOfferText(fresh.checkInOfferText || DEFAULT_CHECKIN_OFFER)
    return adminV3Store.subscribe(() => setInfo(adminV3Store.getPropertyInfo(slug)))
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = (section, updates) => {
    adminV3Store.updatePropertyInfo(slug, updates)
    setSaved(section)
    setTimeout(() => setSaved(null), 2500)
  }

  // ── General ────────────────────────────────────────────────────────────────
  const [gen, setGen] = useState({ name: info.name, address: info.address, maxGuests: info.maxGuests, checkInTime: info.checkInTime, checkoutTime: info.checkoutTime })
  const detailsSaved = saved === 'gen'

  // ── WiFi ───────────────────────────────────────────────────────────────────
  const [wifi, setWifi] = useState({ network: info.wifi?.network || '', password: info.wifi?.password || '', notes: info.wifi?.notes || '' })

  // ── Host ───────────────────────────────────────────────────────────────────
  const [host, setHost] = useState({ ownerName: info.ownerName || '', ownerPhone: info.ownerPhone || '', ownerEmail: info.ownerEmail || '' })

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link to="/admin-v3/dashboard" className="hover:text-slate-600">Dashboard</Link>
        <Icon name="chevron_right" size={12} />
        <Link to={`/admin-v3/property/${slug}`} className="hover:text-slate-600">{info.name || slug}</Link>
        <Icon name="chevron_right" size={12} />
        <span className="text-slate-700 font-medium">Property Info</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Property Info</h1>

      {/* Hero banner image */}
      <Card title="Hero Banner Image" icon="image">
        <p className="text-[12px] text-slate-500 mb-3">
          Optional. Replaces the default sunset/night banner at the top of the guidebook for this property only.
          Leave blank to use the global default. Upload a separate <strong>night-mode</strong> image to swap when guests toggle night.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Day mode</p>
            <ImagePicker
              value={info.v3HeroImage ? [{ src: info.v3HeroImage, path: info.v3HeroImagePath }] : []}
              slug={slug}
              blockId="hero-day"
              maxImages={1}
              onChange={imgs => {
                const img = imgs[0]
                adminV3Store.updatePropertyInfo(slug, {
                  v3HeroImage: img?.src || null,
                  v3HeroImagePath: img?.path || null,
                })
                setInfo(adminV3Store.getPropertyInfo(slug))
              }}
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Night mode</p>
            <ImagePicker
              value={info.v3HeroImageNight ? [{ src: info.v3HeroImageNight, path: info.v3HeroImageNightPath }] : []}
              slug={slug}
              blockId="hero-night"
              maxImages={1}
              onChange={imgs => {
                const img = imgs[0]
                adminV3Store.updatePropertyInfo(slug, {
                  v3HeroImageNight: img?.src || null,
                  v3HeroImageNightPath: img?.path || null,
                })
                setInfo(adminV3Store.getPropertyInfo(slug))
              }}
            />
          </div>
        </div>
      </Card>

      {/* Property Details */}
      <Card title="Property Details" icon="home" saved={detailsSaved}
        enabled={info.showPropertyCard}
        onToggle={() => adminV3Store.updatePropertyInfo(slug, { showPropertyCard: info.showPropertyCard === false })}
        toggleHint="Hides the property card (address, times, guests) from the guidebook.">
        <div className="space-y-4">
          <Field label="Property Name">
            <Input value={gen.name} onChange={v => setGen(g => ({ ...g, name: v }))} placeholder="Reynard Way" />
          </Field>
          <Field label="Address">
            <Input value={gen.address} onChange={v => setGen(g => ({ ...g, address: v }))} placeholder="3003 Reynard Way, San Diego, CA 92103" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Max Guests">
              <Input type="number" value={gen.maxGuests} onChange={v => setGen(g => ({ ...g, maxGuests: Number(v) }))} placeholder="16" />
            </Field>
            <Field label="Check-In">
              <Input value={gen.checkInTime} onChange={v => setGen(g => ({ ...g, checkInTime: v }))} placeholder="4:00 PM" />
            </Field>
            <Field label="Check-Out">
              <Input value={gen.checkoutTime} onChange={v => setGen(g => ({ ...g, checkoutTime: v }))} placeholder="11:00 AM" />
            </Field>
          </div>
          <div className="flex justify-end">
            <button onClick={() => save('gen', gen)}
              className="px-5 py-2 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              Save
            </button>
          </div>
        </div>
      </Card>

      {/* WiFi */}
      <Card title="Wi-Fi" icon="wifi" saved={saved === 'wifi'}
        enabled={info.showWifiCard}
        onToggle={() => adminV3Store.updatePropertyInfo(slug, { showWifiCard: info.showWifiCard === false })}
        toggleHint="Hides the blue Wi-Fi card from the guidebook sidebar (the Wi-Fi content section is controlled in Manage Sections).">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Network Name">
              <Input value={wifi.network} onChange={v => setWifi(w => ({ ...w, network: v }))} placeholder="MyNetwork" />
            </Field>
            <Field label="Password">
              <Input value={wifi.password} onChange={v => setWifi(w => ({ ...w, password: v }))} placeholder="password123" />
            </Field>
          </div>
          <Field label="Notes" hint="Optional — shown below the WiFi credentials">
            <textarea
              value={wifi.notes}
              onChange={e => setWifi(w => ({ ...w, notes: e.target.value }))}
              placeholder="1Gbps high-speed internet…"
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300 resize-none"
            />
          </Field>
          <div className="flex justify-end">
            <button onClick={() => save('wifi', { wifi })}
              className="px-5 py-2 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              Save
            </button>
          </div>
        </div>
      </Card>

      {/* Host */}
      <Card title="Host Information" icon="person" saved={saved === 'host'}
        enabled={info.showHostCard}
        onToggle={() => adminV3Store.updatePropertyInfo(slug, { showHostCard: info.showHostCard === false })}
        toggleHint="Hides the 'Your Host' card from the guidebook.">
        <div className="space-y-4">
          <Field label="Host Name">
            <Input value={host.ownerName} onChange={v => setHost(h => ({ ...h, ownerName: v }))} placeholder="Joe Saari" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <Input value={host.ownerPhone} onChange={v => setHost(h => ({ ...h, ownerPhone: v }))} placeholder="+1 (608) 239-3574" />
            </Field>
            <Field label="Email" hint="Leave blank to hide Email button from guests">
              <Input value={host.ownerEmail} onChange={v => setHost(h => ({ ...h, ownerEmail: v }))} placeholder="joe@talo.ventures" />
            </Field>
          </div>
          <div className="flex justify-end">
            <button onClick={() => save('host', host)}
              className="px-5 py-2 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              Save
            </button>
          </div>
        </div>
      </Card>

      {/* Check-In Page */}
      <Card title="Check-In Page" icon="how_to_reg" saved={welcomeSaved}
        enabled={info.checkInEnabled}
        onToggle={() => adminV3Store.updatePropertyInfo(slug, { checkInEnabled: info.checkInEnabled === false })}
        toggleHint="Hides all Check In buttons and disables the guest check-in page for this property.">
        <div className="space-y-4">
          <Field label="Welcome Message" hint="Shown at the top of the guest check-in page, above the house rules.">
            <textarea
              value={welcomeText}
              onChange={e => setWelcomeText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300 resize-none"
              placeholder="Welcome! Please review each house rule…"
            />
          </Field>
          <Field label="Group Check-In Offer" hint="Shown to the primary booker after check-in — encourages every adult guest to sign in individually (e.g. a $50 credit).">
            <textarea
              value={offerText}
              onChange={e => setOfferText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300 resize-none"
              placeholder="🎁 Ask every adult in your group to check in…"
            />
          </Field>
          <div className="flex justify-end">
            <button onClick={() => save('welcome', { checkInWelcome: welcomeText, checkInOfferText: offerText })}
              className="px-5 py-2 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              Save
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
