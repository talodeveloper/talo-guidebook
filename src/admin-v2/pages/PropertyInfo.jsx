import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminV2Store } from '../../data/adminV2Store'
import Icon from '../../components/Icon'

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
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300 bg-white"
    />
  )
}

function Card({ title, icon, children, saved }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
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
      </div>
      {children}
    </div>
  )
}

export default function PropertyInfo() {
  const { slug } = useParams()
  const [info, setInfo] = useState(adminV2Store.getPropertyInfo(slug))
  const [detailsSaved, setDetailsSaved] = useState(false)
  const [wifiSaved, setWifiSaved]       = useState(false)
  const [hostSaved, setHostSaved]       = useState(false)
  const [welcomeSaved, setWelcomeSaved] = useState(false)

  useEffect(() => {
    return adminV2Store.subscribe(() => setInfo(adminV2Store.getPropertyInfo(slug)))
  }, [slug])

  const flash = (setter) => {
    setter(true)
    setTimeout(() => setter(false), 2500)
  }

  const saveDetails = () => {
    adminV2Store.updatePropertyInfo(slug, {
      name: info.name,
      address: info.address,
      checkInTime: info.checkInTime,
      checkoutTime: info.checkoutTime,
      maxGuests: Number(info.maxGuests),
    })
    flash(setDetailsSaved)
  }

  const saveWifi = () => {
    adminV2Store.updatePropertyInfo(slug, {
      wifi: {
        network: info.wifi?.network || '',
        password: info.wifi?.password || '',
        notes: info.wifi?.notes || '',
      },
    })
    flash(setWifiSaved)
  }

  const saveHost = () => {
    adminV2Store.updatePropertyInfo(slug, {
      ownerName: info.ownerName,
      ownerPhone: info.ownerPhone,
      ownerEmail: info.ownerEmail,
    })
    flash(setHostSaved)
  }

  const saveWelcome = () => {
    adminV2Store.updatePropertyInfo(slug, {
      checkInWelcome: info.checkInWelcome,
    })
    flash(setWelcomeSaved)
  }

  const set = (field, val) => setInfo(prev => ({ ...prev, [field]: val }))
  const setWifi = (field, val) => setInfo(prev => ({ ...prev, wifi: { ...prev.wifi, [field]: val } }))

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link to="/admin-v2/dashboard" className="hover:text-slate-600">Dashboard</Link>
        <Icon name="chevron_right" size={12} />
        <Link to={`/admin-v2/property/${slug}`} className="hover:text-slate-600 capitalize">{slug.replace(/-/g, ' ')}</Link>
        <Icon name="chevron_right" size={12} />
        <span className="text-slate-700 font-medium">Property Info</span>
      </div>

      <h1 className="text-xl font-bold text-slate-900 mb-6">Property Info</h1>

      {/* 1 — Property Details (matches guidebook order: name → address → check-in → check-out → guests) */}
      <Card title="Property Details" icon="home" saved={detailsSaved}>
        <div className="space-y-4">
          <Field label="Property Name">
            <Input value={info.name || ''} onChange={v => set('name', v)} placeholder="Reynard Way" />
          </Field>
          <Field label="Address">
            <Input value={info.address || ''} onChange={v => set('address', v)} placeholder="3003 Reynard Way, San Diego, CA 92103" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Check-in Time">
              <Input value={info.checkInTime || ''} onChange={v => set('checkInTime', v)} placeholder="4:00 PM" />
            </Field>
            <Field label="Check-out Time">
              <Input value={info.checkoutTime || ''} onChange={v => set('checkoutTime', v)} placeholder="11:00 AM" />
            </Field>
            <Field label="Max Guests">
              <Input value={info.maxGuests || ''} onChange={v => set('maxGuests', v)} placeholder="16" type="number" />
            </Field>
          </div>
          <div className="flex justify-end pt-1">
            <button onClick={saveDetails}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              Save Details
            </button>
          </div>
        </div>
      </Card>

      {/* 2 — Wi-Fi */}
      <Card title="Wi-Fi" icon="wifi" saved={wifiSaved}>
        <div className="space-y-4">
          <Field label="Network Name">
            <Input value={info.wifi?.network || ''} onChange={v => setWifi('network', v)} placeholder="SD Mission Hills" />
          </Field>
          <Field label="Password">
            <Input value={info.wifi?.password || ''} onChange={v => setWifi('password', v)} placeholder="••••••••" />
          </Field>
          <Field label="Notes" hint="Optional — shown in the WiFi section of the guidebook">
            <Input value={info.wifi?.notes || ''} onChange={v => setWifi('notes', v)} placeholder="1Gbps with extenders throughout" />
          </Field>
          <div className="flex justify-end pt-1">
            <button onClick={saveWifi}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              Save Wi-Fi
            </button>
          </div>
        </div>
      </Card>

      {/* 3 — Host Information */}
      <Card title="Host Information" icon="person" saved={hostSaved}>
        <div className="space-y-4">
          <Field label="Host Name">
            <Input value={info.ownerName || ''} onChange={v => set('ownerName', v)} placeholder="Joe Saari" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <Input value={info.ownerPhone || ''} onChange={v => set('ownerPhone', v)} placeholder="+1 (608) 239-3574" />
            </Field>
            <Field label="Email" hint="Leave blank to hide Email button from guests">
              <Input value={info.ownerEmail || ''} onChange={v => set('ownerEmail', v)} placeholder="joe@email.com" type="email" />
            </Field>
          </div>
          <div className="flex justify-end pt-1">
            <button onClick={saveHost}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              Save Host Info
            </button>
          </div>
        </div>
      </Card>

      {/* 4 — Check-In Page Settings */}
      <Card title="Check-In Page" icon="how_to_reg" saved={welcomeSaved}>
        <div className="space-y-4">
          <Field
            label="Welcome Message"
            hint="Shown at the top of the check-in page before guests read the house rules."
          >
            <textarea
              value={info.checkInWelcome || ''}
              onChange={e => set('checkInWelcome', e.target.value)}
              rows={4}
              placeholder="Welcome! Please review each house rule below…"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300 bg-white resize-none leading-relaxed"
            />
          </Field>
          <div className="bg-slate-50 rounded-xl px-3.5 py-2.5 flex gap-2">
            <Icon name="info" size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              House rules shown on the check-in page automatically sync with the <strong>House Rules</strong> section — no extra editing needed.
            </p>
          </div>
          <div className="flex justify-end pt-1">
            <button onClick={saveWelcome}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              Save Welcome Message
            </button>
          </div>
        </div>
      </Card>

      <p className="text-xs text-slate-400 text-center mt-2">
        Changes are saved to draft. Use the <strong className="text-slate-600">Publish</strong> button at the top to make them live on the guidebook.
      </p>
    </div>
  )
}
