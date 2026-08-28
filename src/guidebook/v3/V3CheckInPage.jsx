import React, { useEffect, useState } from 'react'
import { useOutletContext, useParams, Link } from 'react-router-dom'
import { contentStore } from '../../data/contentStore'
import { NightModeCtx, readV3Data, resolveGuidebookLogo } from './V3GuidebookPage'
import { applyPropertyBlockOrder, DEFAULT_CHECKIN_OFFER } from '../../data/adminV3Store'
import { guidebookPath, getTenantId } from '../../data/tenant'
import Icon from '../../components/Icon'
import { db, functions } from '../../firebase'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'

// Colors resolved via CSS custom properties injected by V3GuidebookLayout
const GREEN_GRAD = 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
const BLUE_GRAD  = 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)'

function buildTheme() {
  return {
    BG:      'var(--t-bg)',
    CARD:    'var(--t-surface)',
    BORDER:  'var(--t-border)',
    PRIMARY: 'var(--t-primary)',
    TEXT:    'var(--t-text)',
    MUTED:   'var(--t-muted)',
    SUNSET:  'var(--t-gradient)',
  }
}

// ─── Validation ──────────────────────────────────────────────────────────────
const validatePhone = (val) => {
  if (!val.trim()) return ''
  return /^[+]?[\d\s\-().]{7,15}$/.test(val.trim())
    ? ''
    : 'Phone must contain only digits, spaces, +, -, ( )'
}
const validateEmailFormat = (val) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? '' : 'Enter a valid email address (e.g. you@example.com)'

// ─── Shared input ────────────────────────────────────────────────────────────
function FormInput({ label, required, optional, error, t, nightMode, ...props }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: t.MUTED }}>
        {label}{' '}
        {required && <span style={{ color: 'var(--t-primary)' }}>*</span>}
        {optional && <span className="ml-1 font-normal normal-case" style={{ color: t.MUTED }}>(optional)</span>}
      </label>
      <input
        {...props}
        className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none transition-all"
        style={{
          border: `1.5px solid ${error ? '#EF4444' : t.BORDER}`,
          background: 'var(--t-bg)',
          color: t.TEXT,
        }}
      />
      {error && (
        <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: '#EF4444' }}>
          <Icon name="error" size={11} /> {error}
        </p>
      )}
    </div>
  )
}

// ─── Success screen ──────────────────────────────────────────────────────────
function SuccessScreen({ property, slug, data, timestamp, rules, nightMode, offerText, isPrimary }) {
  const t = buildTheme()
  const fullName = `${data.firstName} ${data.lastName}`.trim()
  // Brand label on the printed agreement: tenant wordmark, else property name.
  const brandLabel = resolveGuidebookLogo(readV3Data()).wordmark || property.name
  return (
    <NightModeCtx.Provider value={nightMode}>
      <style>{`
        @media print {
          .ci-no-print { display: none !important; }
          .ci-print-show { display: block !important; }
          .ci-print-page { background: white !important; padding: 0 !important; }
          body { background: white !important; color: #111827 !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          :root {
            --t-bg: #ffffff;
            --t-surface: #ffffff;
            --t-border: #e5e7eb;
            --t-text: #111827;
            --t-muted: #6b7280;
            --t-primary: #2563eb;
            --t-primary-05: rgba(37,99,235,0.06);
          }
        }
        .ci-print-show { display: none; }
      `}</style>
      <div className="ci-print-page min-h-screen" style={{ background: t.BG }}>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="ci-no-print flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg"
              style={{ background: GREEN_GRAD }}>
              <Icon name="check_circle" size={44} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: t.TEXT }}>Rental Terms Accepted!</h1>
            <p className="text-[15px]" style={{ color: t.MUTED }}>
              Thank you, <strong style={{ color: t.TEXT }}>{fullName}</strong>
            </p>
            <p className="text-[13px] mt-1" style={{ color: t.MUTED }}>{property.name}</p>
            <p className="text-[11px] mt-0.5" style={{ color: t.MUTED }}>{timestamp}</p>
          </div>

          {/* Group check-in offer — primary booker only */}
          {isPrimary && offerText && (
            <div className="ci-no-print rounded-2xl p-4 mb-6 border"
              style={{
                borderColor: 'rgba(37,99,235,0.25)',
                background: nightMode ? 'rgba(29,78,216,0.12)' : 'rgba(37,99,235,0.06)',
              }}>
              <p className="text-[13px] leading-relaxed font-medium" style={{ color: t.TEXT }}>{offerText}</p>
            </div>
          )}

          {/* Buttons — screen only, appear right after the thank-you header */}
          <div className="ci-no-print flex flex-col sm:flex-row gap-3 mb-6">
            <button onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: GREEN_GRAD }}>
              <Icon name="download" size={16} className="text-white" />
              Download PDF
            </button>
            <Link to={guidebookPath(slug)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] font-bold border transition-colors"
              style={{ borderColor: t.BORDER, color: t.PRIMARY }}>
              <Icon name="arrow_back" size={16} />
              Back to Guidebook
            </Link>
          </div>

          {/* Full agreement card — print/PDF only, hidden on screen */}
          <div className="ci-print-show rounded-2xl border p-6 mb-6" style={{ borderColor: t.BORDER, background: t.CARD }}>
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--t-primary)' }}>{brandLabel}</p>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--t-text)' }}>House Rules Agreement</h2>
              <p className="text-[13px]" style={{ color: 'var(--t-muted)' }}>{property.name} · {property.address}</p>
              <div className="my-4" style={{ borderBottom: `1px solid ${t.BORDER}` }} />
              <div className="space-y-1 text-[13px]">
                <p><strong>Guest Name:</strong> {fullName}</p>
                {data.email && <p><strong>Email:</strong> {data.email}</p>}
                {data.phone && <p><strong>Phone:</strong> {data.phone}</p>}
                <p><strong>Role:</strong> {isPrimary ? 'Primary Booker' : 'Guest'}</p>
                {isPrimary && data.stayCheckIn && data.stayCheckOut && (
                  <p><strong>Booking Dates:</strong> {data.stayCheckIn} to {data.stayCheckOut}</p>
                )}
                <p><strong>Agreed on:</strong> {timestamp}</p>
              </div>
              {isPrimary && (data.coGuests || []).length > 0 && (
                <>
                  <div className="my-4" style={{ borderBottom: `1px solid ${t.BORDER}` }} />
                  <p className="text-[13px] font-bold mb-1">Additional Guests</p>
                  {data.coGuests.map((g, i) => (
                    <p key={i} className="text-[12px]">
                      {g.firstName} {g.lastName} — age {g.age}{Number(g.age) < 18 ? ' (minor)' : ''}
                    </p>
                  ))}
                </>
              )}
              <div className="my-4" style={{ borderBottom: `1px solid ${t.BORDER}` }} />
            </div>
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
                    <div className="text-[11px] leading-relaxed mt-0.5
                      [&_p]:mb-0.5 [&_strong]:font-semibold
                      [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                      style={{ color: 'var(--t-muted)' }}
                      dangerouslySetInnerHTML={{ __html: rule.body }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl p-4" style={{
              background: 'rgba(5,150,105,0.06)',
              border: '1px solid rgba(5,150,105,0.2)',
            }}>
              <p className="text-[12px] italic mb-2" style={{ color: t.MUTED }}>
                "I hereby agree to follow these rules & share that with all other guests going to stay in this property. I will also share a copy of this agreement with all co-guests."
              </p>
              <p className="text-[13px] font-bold" style={{ color: t.TEXT }}>— {fullName}</p>
              {data.email && <p className="text-[11px]" style={{ color: t.MUTED }}>{data.email}{data.phone ? ` · ${data.phone}` : ''}</p>}
              <p className="text-[11px] mt-0.5" style={{ color: t.MUTED }}>{timestamp}</p>
            </div>
          </div>
        </div>
      </div>
    </NightModeCtx.Provider>
  )
}

// ─── Interstitial: Did you make the reservation? ─────────────────────────────
function ChoiceScreen({ property, slug, nightMode, onChoose }) {
  const t = buildTheme()
  return (
    <NightModeCtx.Provider value={nightMode}>
      <div className="min-h-screen" style={{ background: t.BG }}>
        <div className="max-w-xl mx-auto px-4 py-10">
          <Link to={guidebookPath(slug)}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold mb-8 hover:opacity-75 transition-opacity"
            style={{ color: t.PRIMARY }}>
            <Icon name="arrow_back" size={14} /> Back to Guidebook
          </Link>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md"
              style={{ background: BLUE_GRAD }}>
              <Icon name="login" size={30} className="text-white" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: t.PRIMARY }}>Rental Terms</p>
            <h1 className="text-2xl font-bold" style={{ color: t.TEXT }}>{property.name}</h1>
          </div>

          <div className="rounded-2xl border p-6" style={{ borderColor: t.BORDER, background: t.CARD }}>
            <h2 className="text-lg font-bold text-center mb-2" style={{ color: t.TEXT }}>
              Did you make the reservation?
            </h2>
            <p className="text-[12px] leading-relaxed text-center mb-6" style={{ color: t.MUTED }}>
              If you are the person who booked this property — the <strong>primary booker</strong> — select
              <strong> Yes</strong>. If you are a guest staying with the primary booker, select <strong>No</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => onChoose('primary')}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl text-white shadow-md transition-transform hover:scale-[1.02]"
                style={{ background: BLUE_GRAD }}>
                <Icon name="vpn_key" size={26} className="text-white" />
                <span className="font-bold text-[15px]">Yes, I booked it</span>
                <span className="text-white/75 text-[11px]">I'm the primary booker</span>
              </button>
              <button onClick={() => onChoose('guest')}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-transform hover:scale-[1.02]"
                style={{ borderColor: t.BORDER, background: 'var(--t-bg)' }}>
                <Icon name="group" size={26} style={{ color: t.PRIMARY }} />
                <span className="font-bold text-[15px]" style={{ color: t.TEXT }}>No, I'm a guest</span>
                <span className="text-[11px]" style={{ color: t.MUTED }}>Staying with the primary booker</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </NightModeCtx.Provider>
  )
}

// ─── Rules checklist (shared by both flows) ──────────────────────────────────
function RulesChecklist({ rules, checked, toggleRule, allChecked, checkedCount, t, nightMode }) {
  return (
    <div className="rounded-2xl border overflow-hidden mb-5" style={{ borderColor: t.BORDER }}>
      <div className="px-5 py-3.5 flex items-center gap-2"
        style={{ background: 'var(--t-primary-05)', borderBottom: `1px solid ${t.BORDER}` }}>
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
      {rules.map((rule, idx) => (
        <label key={rule.id}
          className="flex gap-3.5 px-5 py-4 cursor-pointer transition-colors"
          style={{
            background: checked[rule.id]
              ? (nightMode ? 'rgba(5,150,105,0.08)' : 'rgba(5,150,105,0.05)')
              : t.CARD,
            borderTop: idx === 0 ? 'none' : `1px solid ${t.BORDER}`,
          }}>
          <div className="flex-shrink-0 mt-0.5" onClick={() => toggleRule(rule.id)}>
            <input type="checkbox" className="sr-only" checked={checked[rule.id] || false} onChange={() => toggleRule(rule.id)} />
            <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150"
              style={{
                borderColor: checked[rule.id] ? '#059669' : t.MUTED,
                background: checked[rule.id] ? '#059669' : 'transparent',
              }}>
              {checked[rule.id] && <Icon name="check" size={12} className="text-white" />}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[13px] mb-1" style={{ color: t.TEXT }}>{rule.title}</p>
            <div className="text-[12px] leading-relaxed
              [&_p]:mb-1 [&_p:last-child]:mb-0 [&_strong]:font-semibold
              [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-0.5
              [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-0.5"
              style={{ color: t.MUTED }}
              dangerouslySetInnerHTML={{ __html: rule.body }}
            />
          </div>
        </label>
      ))}
    </div>
  )
}

// ─── Main Check-In Page ──────────────────────────────────────────────────────
export default function V3CheckInPage() {
  const { property, nightMode } = useOutletContext()
  const { slug } = useParams()

  // 'choice' | 'primary' | 'guest'
  const [step, setStep] = useState('choice')

  const [rules, setRules]     = useState([])
  const [checked, setChecked] = useState({})
  const [errors, setErrors]   = useState({})
  const [submitted, setSubmitted]         = useState(false)
  const [submittedData, setSubmittedData] = useState(null)
  const [submitTime, setSubmitTime]       = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [submitError, setSubmitError]     = useState('')

  // Common fields
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  // Primary-only: additional guests
  const [adultCount, setAdultCount] = useState(0)
  const [minorCount, setMinorCount] = useState(0)
  const [coGuests, setCoGuests]     = useState([]) // [{ firstName, lastName, age, isMinor }]
  // Primary-only: booking stay dates
  const [stayCheckIn, setStayCheckIn]   = useState('')
  const [stayCheckOut, setStayCheckOut] = useState('')
  // Primary-only: cars and day visitors
  const [carsCount, setCarsCount]         = useState(0)
  const [dayVisitors, setDayVisitors]     = useState(0)
  const [hasDayVisitors, setHasDayVisitors] = useState(false)
  // Primary-only: two-step flow ('form' → 'guests')
  const [primaryStep, setPrimaryStep]     = useState('form')
  // Primary-only: Firestore doc ref stored after step-1 save
  const [checkinDocRef, setCheckinDocRef] = useState(null)

  // Guest-only: which primary booker they're staying with
  const [selectedBooker, setSelectedBooker] = useState('')
  const [bookers, setBookers]               = useState(null) // null = not yet loaded
  const [bookersError, setBookersError]     = useState('')

  const t = buildTheme()
  const offerText = property.checkInOfferText || DEFAULT_CHECKIN_OFFER

  // Load house rules in the per-property curated order
  useEffect(() => {
    const load = () => {
      const v3data = readV3Data()
      const r = applyPropertyBlockOrder(
        contentStore.getBlocksForSection('house_rules', slug), slug, 'house_rules', v3data
      )
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

  // Resize co-guest rows when counts change (adults first, then minors)
  useEffect(() => {
    setCoGuests(prev => {
      const total = adultCount + minorCount
      const next = []
      for (let i = 0; i < total; i++) {
        next.push(prev[i] || { firstName: '', lastName: '', age: '' })
      }
      return next.map((g, i) => ({ ...g, isMinor: i >= adultCount }))
    })
  }, [adultCount, minorCount])

  const setField = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    if (field === 'phone') setErrors(e => ({ ...e, phone: validatePhone(val) }))
    if (field === 'email') setErrors(e => ({ ...e, email: val.trim() ? validateEmailFormat(val) : '' }))
  }

  const setCoGuest = (index, field, val) => {
    setCoGuests(prev => prev.map((g, i) => i === index ? { ...g, [field]: val } : g))
  }

  const checkedCount = Object.values(checked).filter(Boolean).length
  const allChecked   = rules.length > 0 && checkedCount === rules.length
  const toggleRule = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  const isPrimary = step === 'primary'
  const isGuest   = step === 'guest'

  // Fetch active primary bookers via Cloud Function when a guest reaches this
  // step. Runs server-side with admin privileges — guests themselves cannot
  // read the check-in collections directly (see functions/index.js).
  useEffect(() => {
    if (!isGuest) return
    let cancelled = false
    setBookers(null)
    setBookersError('')
    const fn = httpsCallable(functions, 'getActivePrimaryBookers')
    fn({ tenantId: getTenantId(), propertySlug: slug })
      .then(res => { if (!cancelled) setBookers(res.data?.bookers || []) })
      .catch(err => {
        console.error('[Functions] getActivePrimaryBookers failed:', err)
        if (!cancelled) { setBookers([]); setBookersError('Could not load active bookings. Please try again.') }
      })
    return () => { cancelled = true }
  }, [isGuest, slug])

  // ── Validity ────────────────────────────────────────────────────────────
  const namesValid = form.firstName.trim() !== '' && form.lastName.trim() !== ''
  const emailValid = isPrimary
    ? (form.email.trim() !== '' && !validateEmailFormat(form.email))
    : (form.email.trim() === '' || !validateEmailFormat(form.email))
  const phoneValid = isPrimary
    ? (form.phone.trim() !== '' && !validatePhone(form.phone))
    : true
  const bookerValid = !isGuest || selectedBooker.trim() !== ''
  const coGuestsValid = coGuests.every(g =>
    g.firstName.trim() !== '' && g.lastName.trim() !== '' && String(g.age).trim() !== '' && !isNaN(Number(g.age))
  )
  const stayDatesValid = !isPrimary || (
    stayCheckIn.trim() !== '' && stayCheckOut.trim() !== '' && new Date(stayCheckOut) > new Date(stayCheckIn)
  )
  // Step-1 (details + new questions) — does NOT require co-guest details
  const canSubmitStep1 = allChecked && namesValid && emailValid && phoneValid && stayDatesValid && bookerValid
  // Step-2 (co-guests) — only co-guest completeness required
  const canSubmitStep2 = coGuestsValid
  // Guest / legacy single-step
  const canSubmit = canSubmitStep1

  // ── Step-1: save primary booker details to Firestore, advance to guest step ─
  const handleSubmitStep1 = async (e) => {
    e.preventDefault()
    if (!canSubmitStep1 || submitting) return
    setSubmitting(true)
    setSubmitError('')

    const now = new Date()
    const ts  = now.toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`

    const payload = {
      tenantId:             getTenantId(),
      propertySlug:         slug,
      propertyName:         property.name,
      checkinRole:          'primary',
      firstName:            form.firstName.trim(),
      lastName:             form.lastName.trim(),
      guestName:            fullName,
      primaryGuestName:     fullName,
      email:                form.email.trim() || '',
      phone:                form.phone.trim() || '',
      submittedAt:          now.toISOString(),
      submittedAtFormatted: ts,
      agreedRules:          rules.map(r => ({ id: r.id, title: r.title })),
      stayCheckIn,
      stayCheckOut,
      carsCount,
      dayVisitorsCount:     hasDayVisitors ? dayVisitors : 0,
      adultsCount:          0,
      minorsCount:          0,
      coGuests:             [],
    }

    try {
      const docRef = await addDoc(collection(db, 'v2_checkins'), payload)
      // Store resume URL in the doc itself so a Talo admin can find and share it if
      // the primary booker never completes step 2.
      const resumeUrl = `${window.location.origin}${window.location.pathname}?resume=${docRef.id}`
      await updateDoc(doc(db, 'v2_checkins', docRef.id), { resumeUrl })
      setCheckinDocRef(docRef)
      setSubmitTime(ts)
      setSubmittedData({ ...form, coGuests: [], stayCheckIn, stayCheckOut })
    } catch (err) {
      console.error('[Firestore] check-in step-1 save failed:', err)
      setSubmitting(false)
      setSubmitError('Something went wrong saving your submission. Please check your connection and try again.')
      return
    }

    setSubmitting(false)
    setPrimaryStep('guests')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Step-2: update the same doc with co-guest details, show success screen ──
  const handleSubmitStep2 = async (e) => {
    e.preventDefault()
    if (!canSubmitStep2 || submitting) return
    setSubmitting(true)
    setSubmitError('')

    const coGuestData = coGuests.map(g => ({
      firstName: g.firstName.trim(),
      lastName:  g.lastName.trim(),
      age:       Number(g.age),
      isMinor:   Number(g.age) < 18,
    }))

    if (checkinDocRef) {
      try {
        await updateDoc(doc(db, 'v2_checkins', checkinDocRef.id), {
          adultsCount: adultCount,
          minorsCount: minorCount,
          coGuests:    coGuestData,
        })
      } catch (err) {
        console.error('[Firestore] check-in step-2 update failed:', err)
        setSubmitting(false)
        setSubmitError('Something went wrong saving your guests. Please check your connection and try again.')
        return
      }
    }

    setSubmittedData(prev => ({ ...(prev || {}), coGuests: coGuestData, stayCheckIn, stayCheckOut }))
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Guest / single-step submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setSubmitError('')

    const now = new Date()
    const ts  = now.toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`

    const payload = {
      tenantId:             getTenantId(),
      propertySlug:         slug,
      propertyName:         property.name,
      checkinRole:          'guest',
      firstName:            form.firstName.trim(),
      lastName:             form.lastName.trim(),
      guestName:            fullName,
      primaryGuestName:     selectedBooker,
      email:                form.email.trim() || '',
      phone:                form.phone.trim() || '',
      submittedAt:          now.toISOString(),
      submittedAtFormatted: ts,
      agreedRules:          rules.map(r => ({ id: r.id, title: r.title })),
    }

    try {
      await addDoc(collection(db, 'v2_checkins'), payload)
    } catch (err) {
      console.error('[Firestore] check-in save failed:', err)
      setSubmitting(false)
      setSubmitError('Something went wrong saving your submission. Please check your connection and try again.')
      return
    }

    setSubmittedData({ ...form, coGuests: [], stayCheckIn: '', stayCheckOut: '' })
    setSubmitTime(ts)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Screens ─────────────────────────────────────────────────────────────
  // Check-in disabled by admin (Property Info → Check-In Page toggle)
  if (property.checkInEnabled === false) {
    return (
      <NightModeCtx.Provider value={nightMode}>
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: t.BG }}>
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: nightMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
              <Icon name="lock" size={26} style={{ color: t.MUTED }} />
            </div>
            <h1 className="text-lg font-bold mb-1" style={{ color: t.TEXT }}>Rental Terms isn't available</h1>
            <p className="text-[13px] mb-6" style={{ color: t.MUTED }}>
              Online rental terms is not enabled for this property. Please contact your host with any questions.
            </p>
            <Link to={guidebookPath(slug)}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline"
              style={{ color: t.PRIMARY }}>
              <Icon name="arrow_back" size={14} /> Back to Guidebook
            </Link>
          </div>
        </div>
      </NightModeCtx.Provider>
    )
  }

  if (submitted && submittedData) {
    return (
      <SuccessScreen
        property={property} slug={slug} data={submittedData}
        timestamp={submitTime} rules={rules} nightMode={nightMode}
        offerText={offerText} isPrimary={isPrimary}
      />
    )
  }

  if (step === 'choice') {
    return <ChoiceScreen property={property} slug={slug} nightMode={nightMode} onChoose={setStep} />
  }

  // Guest step, no active primary booker found at this property yet — block
  // rather than let the guest submit unlinked.
  if (isGuest && bookers !== null && bookers.length === 0) {
    return (
      <NightModeCtx.Provider value={nightMode}>
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: t.BG }}>
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: nightMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
              <Icon name="person_search" size={26} style={{ color: t.MUTED }} />
            </div>
            <h1 className="text-lg font-bold mb-1" style={{ color: t.TEXT }}>No active booking found yet</h1>
            <p className="text-[13px] mb-6" style={{ color: t.MUTED }}>
              {bookersError || "We couldn't find any active primary booker for this property yet. Please ask your primary booker to complete their check-in first, then try again."}
            </p>
            <button onClick={() => setStep('choice')}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline"
              style={{ color: t.PRIMARY, background: 'none', border: 'none', cursor: 'pointer' }}>
              <Icon name="arrow_back" size={14} /> Back
            </button>
          </div>
        </div>
      </NightModeCtx.Provider>
    )
  }

  if (isGuest && bookers === null) {
    return (
      <NightModeCtx.Provider value={nightMode}>
        <div className="min-h-screen flex items-center justify-center" style={{ background: t.BG }}>
          <div className="flex items-center gap-3" style={{ color: t.MUTED }}>
            <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            <span className="text-[13px]">Loading active bookings…</span>
          </div>
        </div>
      </NightModeCtx.Provider>
    )
  }

  const countOptions = [...Array(31).keys()] // 0–30
  const carOptions   = [...Array(11).keys()] // 0–10

  // ── Primary step 2: Register Guests ─────────────────────────────────────────
  if (isPrimary && primaryStep === 'guests') {
    return (
      <NightModeCtx.Provider value={nightMode}>
        <div className="min-h-screen" style={{ background: t.BG }}>
          <div className="max-w-2xl mx-auto px-4 py-8">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ background: BLUE_GRAD }}>
                <Icon name="group" size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: t.PRIMARY }}>
                  Step 2 of 2 · Register Guests
                </p>
                <p className="font-bold text-[17px] leading-tight" style={{ color: t.TEXT }}>{property.name}</p>
              </div>
            </div>

            {/* Offer / message banner at top */}
            {offerText && (
              <div className="rounded-2xl p-4 mb-5 border"
                style={{
                  borderColor: 'rgba(37,99,235,0.25)',
                  background: nightMode ? 'rgba(29,78,216,0.12)' : 'rgba(37,99,235,0.06)',
                }}>
                <p className="text-[13px] leading-relaxed font-medium" style={{ color: t.TEXT }}>{offerText}</p>
              </div>
            )}

            {/* Co-guest section */}
            <form onSubmit={handleSubmitStep2}>
              <div className="rounded-2xl border p-5 mb-5 space-y-4" style={{ borderColor: t.BORDER, background: t.CARD }}>
                <div>
                  <h3 className="font-bold text-[14px]" style={{ color: t.TEXT }}>Who's Staying With You?</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: t.MUTED }}>
                    Don't count yourself — just the other guests staying at the property.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: t.MUTED }}>
                      Adults (18+)
                    </label>
                    <select value={adultCount} onChange={e => setAdultCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none"
                      style={{ border: `1.5px solid ${t.BORDER}`, background: 'var(--t-bg)', color: t.TEXT }}>
                      {countOptions.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: t.MUTED }}>
                      Minors (under 18)
                    </label>
                    <select value={minorCount} onChange={e => setMinorCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none"
                      style={{ border: `1.5px solid ${t.BORDER}`, background: 'var(--t-bg)', color: t.TEXT }}>
                      {countOptions.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                {coGuests.length > 0 && (
                  <div className="space-y-3 pt-1">
                    {coGuests.map((g, i) => (
                      <div key={i} className="rounded-xl p-3 space-y-2" style={{
                        border: `1px solid ${t.BORDER}`,
                        background: 'var(--t-primary-05)',
                      }}>
                        <p className="text-[11px] font-bold" style={{ color: t.PRIMARY }}>
                          {g.isMinor ? `Minor ${i - adultCount + 1}` : `Adult ${i + 1}`}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={g.firstName}
                            onChange={e => setCoGuest(i, 'firstName', e.target.value)}
                            placeholder="First name"
                            className="w-full px-3 py-2 rounded-lg text-[12px] outline-none"
                            style={{ border: `1.5px solid ${t.BORDER}`, background: 'var(--t-bg)', color: t.TEXT }} />
                          <input type="text" value={g.lastName}
                            onChange={e => setCoGuest(i, 'lastName', e.target.value)}
                            placeholder="Last name"
                            className="w-full px-3 py-2 rounded-lg text-[12px] outline-none"
                            style={{ border: `1.5px solid ${t.BORDER}`, background: 'var(--t-bg)', color: t.TEXT }} />
                        </div>
                        <input type="number" min={g.isMinor ? 0 : 18} max={g.isMinor ? 17 : 120} value={g.age}
                          onChange={e => setCoGuest(i, 'age', e.target.value)}
                          placeholder="Age"
                          className="w-24 px-3 py-2 rounded-lg text-[12px] outline-none"
                          style={{ border: `1.5px solid ${t.BORDER}`, background: 'var(--t-bg)', color: t.TEXT }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={!canSubmitStep2 || submitting}
                className="w-full py-4 rounded-2xl text-[14px] font-bold transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: canSubmitStep2 && !submitting ? GREEN_GRAD : (nightMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                  color: canSubmitStep2 && !submitting ? 'white' : t.MUTED,
                  cursor: canSubmitStep2 && !submitting ? 'pointer' : 'not-allowed',
                  boxShadow: canSubmitStep2 && !submitting ? '0 4px 15px rgba(5,150,105,0.3)' : 'none',
                }}>
                {submitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Saving…
                  </>
                ) : '✓  Submit'}
              </button>

              {submitError && (
                <div className="mt-3 rounded-xl px-4 py-3 flex items-start gap-2"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <Icon name="error" size={15} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
                  <p className="text-[12px]" style={{ color: '#EF4444' }}>{submitError}</p>
                </div>
              )}
            </form>

            <div className="h-12" />
          </div>
        </div>
      </NightModeCtx.Provider>
    )
  }

  return (
    <NightModeCtx.Provider value={nightMode}>
      <div className="min-h-screen" style={{ background: t.BG }}>
        <div className="max-w-2xl mx-auto px-4 py-8">

          <button onClick={() => setStep('choice')}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold mb-6 hover:opacity-75 transition-opacity"
            style={{ color: t.PRIMARY }}>
            <Icon name="arrow_back" size={14} /> Back
          </button>

          {/* Header card */}
          <div className="rounded-2xl border p-5 mb-5" style={{ borderColor: t.BORDER, background: t.CARD }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ background: BLUE_GRAD }}>
                <Icon name={isPrimary ? 'vpn_key' : 'group'} size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: t.PRIMARY }}>
                  {isPrimary ? 'Step 1 of 2 · ' : ''}Rental Terms · {isPrimary ? 'Primary Booker' : 'Guest'}
                </p>
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

          {/* House Rules */}
          <RulesChecklist
            rules={rules} checked={checked} toggleRule={toggleRule}
            allChecked={allChecked} checkedCount={checkedCount} t={t} nightMode={nightMode}
          />

          {/* Agreement statement */}
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

          {/* Form — step 1 (primary) or single-step (guest) */}
          <form onSubmit={isPrimary ? handleSubmitStep1 : handleSubmit}>
            <div className="rounded-2xl border p-5 mb-5 space-y-4" style={{ borderColor: t.BORDER, background: t.CARD }}>
              <div>
                <h3 className="font-bold text-[14px]" style={{ color: t.TEXT }}>Your Details</h3>
                <p className="text-[11px] mt-0.5" style={{ color: t.MUTED }}>
                  {isPrimary
                    ? 'Fill in your details below. You will register the rest of your group in the next step.'
                    : 'All guests must fill this individually using the same link.'}
                </p>
              </div>

              {isGuest && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: t.MUTED }}>
                    Who's your primary booker? <span style={{ color: 'var(--t-primary)' }}>*</span>
                  </label>
                  <select value={selectedBooker} onChange={e => setSelectedBooker(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none"
                    style={{ border: `1.5px solid ${t.BORDER}`, background: 'var(--t-bg)', color: t.TEXT }}>
                    <option value="">Select the person who booked this stay…</option>
                    {bookers.map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                  <p className="text-[11px] mt-1.5" style={{ color: t.MUTED }}>
                    Choosing correctly links your details to their booking.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <FormInput label="First Name" required t={t} nightMode={nightMode}
                  type="text" value={form.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  placeholder="First name" />
                <FormInput label="Last Name" required t={t} nightMode={nightMode}
                  type="text" value={form.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  placeholder="Last name" />
              </div>

              <FormInput label="Email Address" required={isPrimary} optional={!isPrimary}
                error={errors.email && form.email ? errors.email : ''} t={t} nightMode={nightMode}
                type="email" value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="you@example.com" />

              {isPrimary && (
                <FormInput label="Phone Number" required
                  error={errors.phone} t={t} nightMode={nightMode}
                  type="tel" value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="+1 (608) 239-3574" />
              )}

              {isPrimary && (
                <div className="grid grid-cols-2 gap-3">
                  <FormInput label="Booking Check-In Date" required t={t} nightMode={nightMode}
                    type="date" value={stayCheckIn}
                    onChange={(e) => setStayCheckIn(e.target.value)} />
                  <FormInput label="Booking Check-Out Date" required t={t} nightMode={nightMode}
                    error={stayCheckIn && stayCheckOut && new Date(stayCheckOut) <= new Date(stayCheckIn) ? 'Must be after check-in date' : ''}
                    type="date" value={stayCheckOut}
                    onChange={(e) => setStayCheckOut(e.target.value)} />
                </div>
              )}

              {/* Cars and day visitors — primary booker only */}
              {isPrimary && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: t.MUTED }}>
                      How many cars will you be bringing? <span style={{ color: 'var(--t-primary)' }}>*</span>
                    </label>
                    <select value={carsCount} onChange={e => setCarsCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none"
                      style={{ border: `1.5px solid ${t.BORDER}`, background: 'var(--t-bg)', color: t.TEXT }}>
                      {carOptions.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: t.MUTED }}>
                      Any visitors who will NOT be staying overnight at the property?{' '}
                      <span className="font-normal normal-case" style={{ color: t.MUTED }}>(optional)</span>
                    </label>
                    <p className="text-[11px] mb-2 leading-relaxed" style={{ color: t.MUTED }}>
                      Day visitors are people who will spend time at the property during the day but will not be sleeping overnight.
                    </p>
                    <select value={hasDayVisitors ? 'yes' : 'no'}
                      onChange={e => {
                        const yes = e.target.value === 'yes'
                        setHasDayVisitors(yes)
                        if (!yes) setDayVisitors(0)
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none"
                      style={{ border: `1.5px solid ${t.BORDER}`, background: 'var(--t-bg)', color: t.TEXT }}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                    {hasDayVisitors && (
                      <div className="mt-3">
                        <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: t.MUTED }}>
                          How many day visitors? <span style={{ color: 'var(--t-primary)' }}>*</span>
                        </label>
                        <input
                          type="number" min={1} max={50} value={dayVisitors || ''}
                          onChange={e => setDayVisitors(Math.max(1, Number(e.target.value) || 1))}
                          placeholder="e.g. 3"
                          className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none"
                          style={{ border: `1.5px solid ${t.BORDER}`, background: 'var(--t-bg)', color: t.TEXT }}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Submit button */}
            <button type="submit" disabled={!canSubmit || submitting}
              className="w-full py-4 rounded-2xl text-[14px] font-bold transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: canSubmit && !submitting ? GREEN_GRAD : (nightMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                color: canSubmit && !submitting ? 'white' : t.MUTED,
                cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit && !submitting ? '0 4px 15px rgba(5,150,105,0.3)' : 'none',
              }}>
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Saving your agreement…
                </>
              ) : canSubmit
                ? isPrimary ? '→  Submit & Register Guests' : '✓  Accept Rental Terms'
                : !allChecked
                  ? `Please agree to all ${rules.length} rules above`
                  : !namesValid
                    ? 'Please fill in your first and last name'
                    : isPrimary && !emailValid
                      ? 'Please enter a valid email'
                      : isPrimary && !phoneValid
                        ? 'Please enter a valid phone number'
                        : isPrimary && !stayDatesValid
                          ? 'Please enter valid booking check-in and check-out dates'
                          : isGuest && !bookerValid
                            ? "Please select your primary booker"
                            : 'Please check your details'}
            </button>

            {submitError && (
              <div className="mt-3 rounded-xl px-4 py-3 flex items-start gap-2"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <Icon name="error" size={15} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
                <p className="text-[12px]" style={{ color: '#EF4444' }}>{submitError}</p>
              </div>
            )}
          </form>

          <div className="h-12" />
        </div>
      </div>
    </NightModeCtx.Provider>
  )
}
