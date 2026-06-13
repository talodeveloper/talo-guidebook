import React, { useEffect, useState } from 'react'
import { useOutletContext, useParams, Link } from 'react-router-dom'
import { contentStore } from '../../data/contentStore'
import { NightModeCtx } from './V2GuidebookPage'
import Icon from '../../components/Icon'
import { db } from '../../firebase'
import { collection, addDoc } from 'firebase/firestore'

// ─── Day theme ─────────────────────────────────────────────────────────────
const SUNSET    = 'linear-gradient(135deg, #7C2D12 0%, #C84B31 30%, #EA580C 58%, #F97316 78%, #FCD34D 100%)'
const PRIMARY   = '#C84B31'
const TEXT      = '#1C0F06'
const MUTED     = '#78716C'
const BORDER    = 'rgba(200,80,50,0.12)'
const CARD_BG   = '#FFFFFF'
const SAND_BG   = '#FFF7ED'

// ─── Night theme ───────────────────────────────────────────────────────────
const N_SUNSET  = 'linear-gradient(135deg, #1E1B4B 0%, #312E81 35%, #4F46E5 65%, #7C3AED 100%)'
const N_PRIMARY = '#818CF8'
const N_TEXT    = '#E2E8F0'
const N_MUTED   = '#94A3B8'
const N_BORDER  = 'rgba(99,102,241,0.20)'
const N_CARD_BG = '#111827'
const N_SAND_BG = '#0B1120'

const GREEN_GRAD = 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
const BLUE_GRAD  = 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)'

// ─── Confirmation / Success screen ─────────────────────────────────────────
function SuccessScreen({ property, slug, data, timestamp, rules, nightMode }) {
  const t = buildTheme(nightMode)

  return (
    <NightModeCtx.Provider value={nightMode}>
      {/* Print-specific styles scoped to this page */}
      <style>{`
        @media print {
          .ci-no-print { display: none !important; }
          .ci-print-show { display: block !important; }
          .ci-print-page { background: white !important; padding: 0 !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .ci-print-show { display: none; }
      `}</style>

      <div className="ci-print-page min-h-screen" style={{ background: t.BG }}>
        <div className="max-w-2xl mx-auto px-4 py-10">

          {/* Success badge */}
          <div className="ci-no-print flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg"
              style={{ background: GREEN_GRAD }}>
              <Icon name="check_circle" size={44} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: t.TEXT }}>Check-In Complete!</h1>
            <p className="text-[15px]" style={{ color: t.MUTED }}>
              Thank you, <strong style={{ color: t.TEXT }}>{data.name}</strong>
            </p>
            <p className="text-[13px] mt-1" style={{ color: t.MUTED }}>{property.name}</p>
            <p className="text-[11px] mt-0.5" style={{ color: t.MUTED }}>{timestamp}</p>
          </div>

          {/* Agreement summary card — visible on screen AND in print */}
          <div className="rounded-2xl border p-6 mb-6" style={{ borderColor: t.BORDER, background: t.CARD }}>

            {/* Print-only header */}
            <div className="ci-print-show mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: PRIMARY }}>TALO Rentals</p>
              <h2 className="text-xl font-bold mb-1" style={{ color: TEXT }}>House Rules Agreement</h2>
              <p className="text-[13px]" style={{ color: MUTED }}>{property.name} · {property.address}</p>
              <div className="my-4" style={{ borderBottom: `1px solid ${BORDER}` }} />
              <div className="space-y-1 text-[13px]">
                <p><strong>Guest Name:</strong> {data.name}</p>
                {data.email && <p><strong>Email:</strong> {data.email}</p>}
                {data.phone && <p><strong>Phone:</strong> {data.phone}</p>}
                <p><strong>Agreed on:</strong> {timestamp}</p>
              </div>
              <div className="my-4" style={{ borderBottom: `1px solid ${BORDER}` }} />
            </div>

            {/* Rules agreed to */}
            <h3 className="font-bold text-[14px] mb-3 flex items-center gap-2" style={{ color: t.TEXT }}>
              <Icon name="gavel" size={15} style={{ color: t.PRIMARY }} />
              Rules Agreed To
            </h3>
            <div className="space-y-2.5">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: '#059669' }}>
                    <Icon name="check" size={11} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[13px]" style={{ color: t.TEXT }}>{rule.title}</p>
                    {/* Show body in print only */}
                    <div className="ci-print-show text-[11px] leading-relaxed mt-0.5
                      [&_p]:mb-0.5 [&_strong]:font-semibold
                      [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                      style={{ color: MUTED }}
                      dangerouslySetInnerHTML={{ __html: rule.body }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Signature */}
            <div className="mt-5 pt-4 rounded-xl p-4" style={{
              borderTop: `1px solid ${t.BORDER}`,
              background: nightMode ? 'rgba(5,150,105,0.08)' : 'rgba(5,150,105,0.06)',
              border: `1px solid rgba(5,150,105,0.2)`,
            }}>
              <p className="text-[12px] italic mb-2" style={{ color: t.MUTED }}>
                "I hereby agree to follow these rules & share that with all other guests going to stay in this property. I will also share a copy of this agreement with all co-guests."
              </p>
              <p className="text-[13px] font-bold" style={{ color: t.TEXT }}>— {data.name}</p>
              {data.primaryName && data.primaryName !== data.name && (
                <p className="text-[11px] mt-0.5" style={{ color: t.MUTED }}>Primary Booker: {data.primaryName}</p>
              )}
              {data.email && <p className="text-[11px]" style={{ color: t.MUTED }}>{data.email}{data.phone ? ` · ${data.phone}` : ''}</p>}
              <p className="text-[11px] mt-0.5" style={{ color: t.MUTED }}>{timestamp}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="ci-no-print flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: GREEN_GRAD }}>
              <Icon name="download" size={16} className="text-white" />
              Download PDF
            </button>
            <Link to={`/v2/${slug}`}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] font-bold border transition-colors"
              style={{ borderColor: t.BORDER, color: t.PRIMARY }}>
              <Icon name="arrow_back" size={16} />
              Back to Guidebook
            </Link>
          </div>

        </div>
      </div>
    </NightModeCtx.Provider>
  )
}

// ─── Theme builder ──────────────────────────────────────────────────────────
function buildTheme(nightMode) {
  return {
    BG:     nightMode ? N_SAND_BG : SAND_BG,
    CARD:   nightMode ? N_CARD_BG : CARD_BG,
    BORDER: nightMode ? N_BORDER  : BORDER,
    PRIMARY:nightMode ? N_PRIMARY : PRIMARY,
    TEXT:   nightMode ? N_TEXT    : TEXT,
    MUTED:  nightMode ? N_MUTED   : MUTED,
    SUNSET: nightMode ? N_SUNSET  : SUNSET,
  }
}

// ─── Main Check-In Page ─────────────────────────────────────────────────────
export default function V2CheckInPage() {
  const { property, nightMode } = useOutletContext()
  const { slug } = useParams()

  const [rules, setRules]       = useState([])
  const [checked, setChecked]   = useState({})
  const [form, setForm]         = useState({ primaryName: '', name: '', phone: '', email: '' })
  const [errors, setErrors]     = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)
  const [submitTime, setSubmitTime]       = useState('')
  const [saveError, setSaveError]         = useState(false)

  const t = buildTheme(nightMode)

  // Load house_rules for this property (same source as guidebook)
  useEffect(() => {
    const load = () => {
      const r = contentStore.getBlocksForSection('house_rules', slug)
      setRules(r)
      setChecked((prev) => {
        const next = {}
        r.forEach((rule) => { next[rule.id] = prev[rule.id] ?? false })
        return next
      })
    }
    load()
    return contentStore.subscribe(load)
  }, [slug])

  // ── Validation helpers ────────────────────────────────────────────────────
  const validatePhone = (val) => {
    if (!val.trim()) return ''   // optional field — blank is fine
    return /^[+]?[\d\s\-().]{7,15}$/.test(val.trim())
      ? ''
      : 'Phone must contain only digits, spaces, +, -, ( )'
  }
  const validateEmail = (val) => {
    if (!val.trim()) return 'Email is required'
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
      ? ''
      : 'Enter a valid email address (e.g. you@example.com)'
  }

  const setField = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    if (field === 'phone') setErrors(e => ({ ...e, phone: validatePhone(val) }))
    if (field === 'email') setErrors(e => ({ ...e, email: val.trim() ? validateEmail(val) : '' }))
  }

  const checkedCount = Object.values(checked).filter(Boolean).length
  const allChecked   = rules.length > 0 && checkedCount === rules.length
  const noFieldErrors = !errors.phone && !errors.email
  const formValid    = form.primaryName.trim() !== '' && form.name.trim() !== '' && form.email.trim() !== '' && noFieldErrors
  const canSubmit    = allChecked && formValid

  const toggleRule = (id) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Run full validation before submitting
    const phoneErr = validatePhone(form.phone)
    const emailErr = validateEmail(form.email)
    setErrors({ phone: phoneErr, email: emailErr })
    if (phoneErr || emailErr || !form.primaryName.trim() || !form.name.trim()) return
    if (!canSubmit) return

    const now = new Date()
    const ts  = now.toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

    // ── Save to Firestore ────────────────────────────────────────────────
    try {
      await addDoc(collection(db, 'v2_checkins'), {
        propertySlug:      slug,
        propertyName:      property.name,
        primaryGuestName:  form.primaryName.trim(),
        guestName:         form.name.trim(),
        email:             form.email.trim(),
        phone:             form.phone.trim() || '',
        submittedAt:       now.toISOString(),
        submittedAtFormatted: ts,
        agreedRules:       rules.map(r => ({ id: r.id, title: r.title })),
      })
      setSaveError(false)
    } catch (err) {
      console.error('[Firestore] check-in save failed:', err)
      setSaveError(true)
      // Still show success UI — submission attempt is recorded locally
    }

    setSubmittedData({ ...form })
    setSubmitTime(ts)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Show success screen after submission ──────────────────────────────────
  if (submitted && submittedData) {
    return (
      <SuccessScreen
        property={property}
        slug={slug}
        data={submittedData}
        timestamp={submitTime}
        rules={rules}
        nightMode={nightMode}
      />
    )
  }

  // ── Check-In form ─────────────────────────────────────────────────────────
  return (
    <NightModeCtx.Provider value={nightMode}>
      <div className="min-h-screen" style={{ background: t.BG }}>
        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* Back link */}
          <Link
            to={`/v2/${slug}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold mb-6 hover:opacity-75 transition-opacity"
            style={{ color: t.PRIMARY }}>
            <Icon name="arrow_back" size={14} /> Back to Guidebook
          </Link>

          {/* ── Header card ── */}
          <div className="rounded-2xl border p-5 mb-5" style={{ borderColor: t.BORDER, background: t.CARD }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ background: BLUE_GRAD }}>
                <Icon name="login" size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: t.PRIMARY }}>Check-In</p>
                <p className="font-bold text-[17px] leading-tight" style={{ color: t.TEXT }}>{property.name}</p>
              </div>
            </div>
            <p className="text-[12px] mb-3" style={{ color: t.MUTED }}>{property.address}</p>
            <div className="rounded-xl p-3" style={{
              background: nightMode ? 'rgba(29,78,216,0.1)' : 'rgba(37,99,235,0.06)',
              border: '1px solid rgba(37,99,235,0.2)',
            }}>
              <p className="text-[13px] leading-relaxed" style={{ color: t.TEXT }}>
                {property.checkInWelcome || '👋 Welcome! Please review each house rule below and tap the checkbox next to every rule to confirm you\'ve read and agreed to it.'}
              </p>
            </div>
          </div>

          {/* ── House Rules ── */}
          <div className="rounded-2xl border overflow-hidden mb-5" style={{ borderColor: t.BORDER }}>

            {/* Rules header */}
            <div className="px-5 py-3.5 flex items-center gap-2"
              style={{ background: nightMode ? 'rgba(99,102,241,0.1)' : 'rgba(200,75,49,0.06)', borderBottom: `1px solid ${t.BORDER}` }}>
              <Icon name="gavel" size={15} style={{ color: t.PRIMARY }} />
              <span className="font-bold text-[14px]" style={{ color: t.TEXT }}>House Rules</span>
              <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: allChecked ? 'rgba(5,150,105,0.15)' : (nightMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                  color: allChecked ? '#059669' : t.MUTED,
                }}>
                {checkedCount} / {rules.length} agreed
              </span>
            </div>

            {/* Individual rule rows */}
            {rules.map((rule, idx) => (
              <label
                key={rule.id}
                className="flex gap-3.5 px-5 py-4 cursor-pointer transition-colors"
                style={{
                  background: checked[rule.id]
                    ? (nightMode ? 'rgba(5,150,105,0.08)' : 'rgba(5,150,105,0.05)')
                    : t.CARD,
                  borderTop: idx === 0 ? 'none' : `1px solid ${t.BORDER}`,
                }}>

                {/* Custom checkbox */}
                <div className="flex-shrink-0 mt-0.5" onClick={() => toggleRule(rule.id)}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked[rule.id] || false}
                    onChange={() => toggleRule(rule.id)}
                  />
                  <div
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150"
                    style={{
                      borderColor: checked[rule.id] ? '#059669' : t.MUTED,
                      background: checked[rule.id] ? '#059669' : 'transparent',
                    }}>
                    {checked[rule.id] && <Icon name="check" size={12} className="text-white" />}
                  </div>
                </div>

                {/* Rule content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px] mb-1" style={{ color: t.TEXT }}>{rule.title}</p>
                  <div
                    className="text-[12px] leading-relaxed
                      [&_p]:mb-1 [&_p:last-child]:mb-0
                      [&_strong]:font-semibold
                      [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-0.5
                      [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-0.5"
                    style={{ color: t.MUTED }}
                    dangerouslySetInnerHTML={{ __html: rule.body }}
                  />
                </div>
              </label>
            ))}
          </div>

          {/* ── Agreement statement ── */}
          <div className="rounded-2xl border p-5 mb-5" style={{
            borderColor: 'rgba(5,150,105,0.25)',
            background: nightMode ? 'rgba(5,150,105,0.08)' : 'rgba(5,150,105,0.05)',
          }}>
            <p className="text-[13px] font-semibold mb-1" style={{ color: t.TEXT }}>By submitting, I confirm:</p>
            <p className="text-[12px] leading-relaxed" style={{ color: t.MUTED }}>
              I hereby agree to follow these rules & share that with all other guests going to stay in this property.
              I understand that violations may result in fines or charges as described in the rules above.
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit}>
            <div className="rounded-2xl border p-5 mb-5 space-y-4" style={{ borderColor: t.BORDER, background: t.CARD }}>
              <div>
                <h3 className="font-bold text-[14px]" style={{ color: t.TEXT }}>Your Details</h3>
                <p className="text-[11px] mt-0.5" style={{ color: t.MUTED }}>
                  All guests must fill this individually using the same link.
                </p>
              </div>

              {/* Primary Guest Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: t.MUTED }}>
                  Primary Booker's Name <span style={{ color: PRIMARY }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.primaryName}
                  onChange={(e) => setField('primaryName', e.target.value)}
                  placeholder="Name of the person who made the booking"
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none transition-all"
                  style={{
                    border: `1.5px solid ${t.BORDER}`,
                    background: nightMode ? 'rgba(255,255,255,0.05)' : SAND_BG,
                    color: t.TEXT,
                  }}
                />
                <p className="text-[10px] mt-1" style={{ color: t.MUTED }}>
                  If you are the primary booker, enter your own name here too.
                </p>
              </div>

              {/* Your Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: t.MUTED }}>
                  Your Full Name <span style={{ color: PRIMARY }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Your own full name"
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none transition-all"
                  style={{
                    border: `1.5px solid ${t.BORDER}`,
                    background: nightMode ? 'rgba(255,255,255,0.05)' : SAND_BG,
                    color: t.TEXT,
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: t.MUTED }}>
                  Phone Number
                  <span className="ml-1 font-normal normal-case" style={{ color: t.MUTED }}>(optional)</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="+1 (608) 239-3574"
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none transition-all"
                  style={{
                    border: `1.5px solid ${errors.phone ? '#EF4444' : t.BORDER}`,
                    background: nightMode ? 'rgba(255,255,255,0.05)' : SAND_BG,
                    color: t.TEXT,
                  }}
                />
                {errors.phone && (
                  <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: '#EF4444' }}>
                    <Icon name="error" size={11} /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: t.MUTED }}>
                  Email Address <span style={{ color: PRIMARY }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none transition-all"
                  style={{
                    border: `1.5px solid ${errors.email && form.email ? '#EF4444' : t.BORDER}`,
                    background: nightMode ? 'rgba(255,255,255,0.05)' : SAND_BG,
                    color: t.TEXT,
                  }}
                />
                {errors.email && form.email && (
                  <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: '#EF4444' }}>
                    <Icon name="error" size={11} /> {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-4 rounded-2xl text-[14px] font-bold transition-all duration-200"
              style={{
                background: canSubmit ? GREEN_GRAD : (nightMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                color: canSubmit ? 'white' : t.MUTED,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit ? '0 4px 15px rgba(5,150,105,0.3)' : 'none',
              }}>
              {canSubmit
                ? '✓  Complete Check-In'
                : !allChecked
                  ? `Please agree to all ${rules.length} rules above`
                  : 'Please fill in your name and email'}
            </button>
          </form>

          {/* Bottom spacer */}
          <div className="h-12" />
        </div>
      </div>
    </NightModeCtx.Provider>
  )
}
