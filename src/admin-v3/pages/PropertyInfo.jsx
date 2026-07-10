import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminV3Store, DEFAULT_CHECKIN_OFFER } from '../../data/adminV3Store'
import Icon from '../../components/Icon'
import ImagePicker from '../components/ImagePicker'
import { THEMES, THEME_CATEGORIES } from '../../data/themes'
import { guidebookPath } from '../../data/tenant'

// ─── Live iframe phone preview ────────────────────────────────────────────────
// Renders the actual guidebook at 375px width inside a phone shell frame.
// Uses ?preview_theme= URL param so it doesn't affect the saved theme.
function ThemePhonePreview({ themeId, slug }) {
  const iframeRef = useRef(null)
  const src = `${guidebookPath(slug)}?preview_theme=${themeId}`

  // Reload iframe when theme changes (src change alone doesn't always trigger)
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = src
    }
  }, [src])

  // Phone outer size
  const PHONE_W = 220
  const PHONE_H = 460
  const BORDER  = 3
  const STATUS  = 14
  // Inner content area
  const INNER_W = PHONE_W - BORDER * 2
  const INNER_H = PHONE_H - BORDER * 2 - STATUS
  // Scale the 375px guidebook to fit inner width
  const SCALE = INNER_W / 375

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {/* Phone shell */}
      <div style={{
        width: PHONE_W, height: PHONE_H, borderRadius: 28, overflow: 'hidden',
        border: `${BORDER}px solid #1C1C1E`,
        boxShadow: '0 24px 64px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.08) inset',
        flexShrink: 0, background: '#000', position: 'relative',
      }}>
        {/* Status bar */}
        <div style={{
          height: STATUS, background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px',
          position: 'relative', zIndex: 2,
        }}>
          <span style={{ fontSize: 7, color: '#fff', fontWeight: 700 }}>9:41</span>
          <div style={{ width: 60, height: 8, background: '#111', borderRadius: 6, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} />
          <span style={{ fontSize: 7, color: '#fff' }}>●●●</span>
        </div>

        {/* Scaled iframe — fully interactive: scroll, tap night toggle, etc. */}
        <div style={{ width: INNER_W, height: INNER_H, overflow: 'hidden', position: 'relative' }}>
          <iframe
            ref={iframeRef}
            src={src}
            title="guidebook-preview"
            style={{
              width: 375,
              height: Math.ceil(INNER_H / SCALE),
              border: 'none',
              transform: `scale(${SCALE})`,
              transformOrigin: 'top left',
              display: 'block',
            }}
          />
        </div>

        {/* Bottom home indicator */}
        <div style={{
          position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
          width: 80, height: 4, background: '#444', borderRadius: 2, zIndex: 2,
        }} />
      </div>

      {/* Glossy badge */}
      {THEMES[themeId]?.glossy && (
        <div style={{ fontSize: 10, fontWeight: 700, background: 'linear-gradient(135deg,#C9A84C,#FFE08A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.05em' }}>
          ✦ GLOSSY FINISH
        </div>
      )}
    </div>
  )
}

// ─── Theme picker ─────────────────────────────────────────────────────────────
function ThemePicker({ currentTheme, slug, onChange }) {
  const [preview, setPreview] = useState(currentTheme || 'modern')
  const [open, setOpen] = useState(false)

  const selected = THEMES[preview] || THEMES.modern
  const isPendingChange = preview !== (currentTheme || 'modern')

  // Clicking a theme only updates the iframe preview — does NOT save anything.
  // The explicit "Apply Theme" button is the only thing that writes to the draft.
  const selectForPreview = (id) => setPreview(id)

  const applyTheme = () => {
    onChange(preview)
    setOpen(false)
  }

  return (
    <div>
      {/* Current theme header */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Phone preview */}
        <div style={{ flexShrink: 0 }}>
          <ThemePhonePreview themeId={preview} slug={slug} />
        </div>

        {/* Info panel */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
              background: selected.swatchGrad,
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: '#1C1C1E' }}>{selected.name}</span>
            {selected.glossy && (
              <span style={{ fontSize: 9, fontWeight: 700, background: 'linear-gradient(135deg,#C9A84C,#E8D080)', color: '#4A3000', borderRadius: 4, padding: '2px 5px', letterSpacing: '0.04em' }}>GLOSSY</span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#6A6A6A', marginBottom: 4 }}>{selected.description}</p>
          <p style={{ fontSize: 11, color: '#9A9A9A', marginBottom: 12 }}>Category: {selected.category}</p>

          <p style={{ fontSize: 11, color: '#78716C', marginBottom: 8, lineHeight: 1.4 }}>
            This is a <strong>mobile preview</strong>. After applying, visit your live guidebook to see the full desktop experience.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setOpen(!open)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #C84B31, #EA580C)',
                color: '#fff', fontWeight: 700, fontSize: 13,
              }}>
              <Icon name="palette" size={14} className="text-white" />
              Change Theme
              <Icon name={open ? 'expand_less' : 'expand_more'} size={14} className="text-white" />
            </button>

            {isPendingChange && (
              <>
                <button
                  onClick={applyTheme}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: '#16A34A', color: '#fff', fontWeight: 700, fontSize: 13,
                  }}>
                  <Icon name="check" size={14} className="text-white" />
                  Apply — {selected.name}
                </button>
                <button
                  onClick={() => { setPreview(currentTheme || 'modern'); setOpen(false) }}
                  style={{
                    padding: '8px 12px', borderRadius: 10, fontSize: 12, cursor: 'pointer',
                    border: '1px solid #E5E3E0', background: '#fff', color: '#6A6A6A', fontWeight: 600,
                  }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Theme grid */}
      {open && (
        <div style={{ marginTop: 16, padding: '16px', background: '#F8F7F5', borderRadius: 14, border: '1px solid #E5E3E0', maxHeight: 340, overflowY: 'auto' }}>
          {THEME_CATEGORIES.map(cat => {
            const themes = Object.values(THEMES).filter(t => t.category === cat.key)
            if (!themes.length) return null
            return (
              <div key={cat.key} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  {cat.label}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {themes.map(t => {
                    const isActive = preview === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => selectForPreview(t.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                          border: isActive ? '2px solid #C84B31' : '2px solid transparent',
                          background: isActive ? '#FFF5F2' : '#FFFFFF',
                          boxShadow: isActive ? '0 0 0 2px rgba(200,75,49,0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{
                          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                          background: t.swatchGrad,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                        }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#1C1C1E', lineHeight: 1.2 }}>{t.name}</div>
                          {t.glossy && <div style={{ fontSize: 9, color: '#A07A20', fontWeight: 600, marginTop: 1 }}>✦ Glossy</div>}
                        </div>
                        {isActive && <Icon name="check_circle" size={14} style={{ color: '#C84B31', marginLeft: 'auto', flexShrink: 0 }} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

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

  // ── Theme ──────────────────────────────────────────────────────────────────
  const [currentTheme, setCurrentTheme] = useState(info.theme || 'modern')

  // ── Check-In Welcome ───────────────────────────────────────────────────────
  const DEFAULT_CHECKIN_WELCOME = "Welcome! Please review each house rule below and tap the checkbox next to every rule to confirm you've read and agreed to it. All guests staying at this property are expected to follow these rules. Thank you for helping us keep this space special for everyone."
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
    setCurrentTheme(fresh.theme || 'modern')
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

      {/* Guidebook Theme */}
      <Card title="Guidebook Theme" icon="palette" saved={saved === 'theme'}>
        <p className="text-[12px] text-slate-500 mb-4">
          Choose the visual theme for this property's guest guidebook. The preview below shows a live render of your actual guidebook at mobile size — exactly what guests will see.
        </p>
        <ThemePicker
          currentTheme={currentTheme}
          slug={slug}
          onChange={(themeId) => {
            setCurrentTheme(themeId)
            adminV3Store.updatePropertyInfo(slug, { theme: themeId })
            setSaved('theme')
            setTimeout(() => setSaved(null), 2500)
          }}
        />
      </Card>

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
