import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc } from 'firebase/firestore'
import Icon from '../../components/Icon'

const PROPERTY_LABELS = {
  'reynard-way':  'Reynard Way',
  'hawk-street':  'Hawk Street',
  'jackson-st':   'Jackson Street',
  'vista-pointe': 'Vista Pointe',
}

export default function CheckIns() {
  const [submissions, setSubmissions]   = useState([])
  const [checkouts, setCheckouts]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [filterSlug, setFilterSlug]     = useState('all')
  const [expandedPrimary, setExpandedPrimary] = useState({})

  // Load check-in submissions
  useEffect(() => {
    try {
      const q = query(collection(db, 'v2_checkins'), orderBy('submittedAt', 'desc'))
      const unsub = onSnapshot(
        q,
        (snap) => {
          setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
          setLoading(false)
        },
        (err) => {
          console.error(err)
          setError('Could not load check-in records. Check your Firebase connection.')
          setLoading(false)
        }
      )
      return unsub
    } catch (e) {
      setError('Firebase is not configured correctly.')
      setLoading(false)
    }
  }, [])

  // Load checkouts to filter out checked-out groups
  useEffect(() => {
    try {
      const q = query(collection(db, 'v2_checkouts'), orderBy('checkedOutAt', 'desc'))
      return onSnapshot(q, (snap) => {
        setCheckouts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      })
    } catch {}
  }, [])

  // ── Stay-aware checkout matching ──────────────────────────────────────────
  // A group's "latest check-in time" must be AFTER any matching checkout
  // for that booker+property to be considered active again. Prevents a
  // brand-new booking with the same primary booker name (e.g. a year later)
  // from being auto-marked as checked-out by an old checkout record.
  const isCheckedOut = (primaryName, propertySlug, items) => {
    const key = primaryName?.trim().toLowerCase()
    const matching = checkouts.filter(
      c => c.primaryGuestName?.trim().toLowerCase() === key
        && c.propertySlug === propertySlug
    )
    if (matching.length === 0) return false

    // Most recent check-in time for this group
    const latestCheckinTs = Math.max(...items.map(i => new Date(i.submittedAt || 0).getTime()))
    // Most recent checkout for this primary+property
    const latestCheckoutTs = Math.max(...matching.map(c => new Date(c.checkedOutAt || 0).getTime()))

    // Only treat as checked out if the checkout happened AFTER the latest check-in
    return latestCheckoutTs > latestCheckinTs
  }

  // Filter by property
  const filtered = filterSlug === 'all'
    ? submissions
    : submissions.filter(s => s.propertySlug === filterSlug)

  // Group by primary guest name + property — never collapse same-named bookers
  // across different properties (e.g. two "Joe"s at Jackson and Hawk should
  // remain two distinct groups even in the "All Properties" view).
  const groupKey = (s) => `${(s.primaryGuestName || 'Unknown').trim()}|${s.propertySlug || ''}`
  const grouped = filtered.reduce((acc, s) => {
    const key = groupKey(s)
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  // Separate active (not checked out) from checked-out groups
  const activeGroups    = Object.entries(grouped).filter(([, items]) => !isCheckedOut(items[0]?.primaryGuestName, items[0]?.propertySlug, items))
  const checkedOutCount = Object.entries(grouped).filter(([, items]) =>  isCheckedOut(items[0]?.primaryGuestName, items[0]?.propertySlug, items)).length

  // Download as CSV
  const downloadCSV = () => {
    const rows = [
      ['Property', 'Primary Booker', 'Guest Name', 'Email', 'Phone', 'Submitted At'],
      ...filtered
        .filter(s => !isCheckedOut(s.primaryGuestName, s.propertySlug, grouped[groupKey(s)] || [s]))
        .map(s => [
          s.propertyName || s.propertySlug,
          s.primaryGuestName || '',
          s.guestName || '',
          s.email || '',
          s.phone || '',
          s.submittedAtFormatted || s.submittedAt || '',
        ])
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `checkins-${filterSlug}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const togglePrimary = (key) =>
    setExpandedPrimary(prev => ({ ...prev, [key]: !prev[key] }))

  const showRulesAlert = () => {
    alert(
      'Firestore permission denied.\n\n' +
      'Your Firebase security rules need to be updated:\n\n' +
      '1. Go to console.firebase.google.com\n' +
      '2. Open your project → Firestore Database → Rules\n' +
      '3. Paste the rules from Handoff.md (Section 3 Firebase rules reminder)\n' +
      '   The key lines are:\n' +
      '   match /v2_checkins/{doc} { allow read, write: if true; }\n' +
      '   match /v2_checkouts/{doc} { allow read, write: if true; }\n' +
      '4. Click Publish'
    )
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this guest record? This cannot be undone.')) return
    try {
      await deleteDoc(doc(db, 'v2_checkins', id))
    } catch (e) {
      console.error('[Firestore] delete failed:', e)
      showRulesAlert()
    }
  }

  const handleMarkCheckedOut = async (primaryName, items) => {
    if (!window.confirm(`Mark "${primaryName}" as checked out? They will move to the Checked Out page.`)) return
    const now = new Date()
    const ts = now.toLocaleString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    try {
      await addDoc(collection(db, 'v2_checkouts'), {
        primaryGuestName:      primaryName,
        propertySlug:          items[0]?.propertySlug || '',
        propertyName:          items[0]?.propertyName || items[0]?.propertySlug || '',
        checkedOutAt:          now.toISOString(),
        checkedOutAtFormatted: ts,
        checkedOutBy:          'admin',
        guestName:             null,
      })
    } catch (e) {
      console.error('[Firestore] checkout mark failed:', e)
      showRulesAlert()
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Check-In Records</h1>
          <p className="text-sm text-slate-500 mt-1">
            Active guests — grouped by primary booker.
            {checkedOutCount > 0 && (
              <> &nbsp;·&nbsp;
                <Link to="/admin-v2/checkouts" className="text-green-600 font-semibold hover:underline">
                  {checkedOutCount} checked out →
                </Link>
              </>
            )}
          </p>
        </div>
        {activeGroups.length > 0 && (
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
            <Icon name="download" size={15} className="text-white" />
            Download CSV
          </button>
        )}
      </div>

      {/* Property filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'reynard-way', 'hawk-street', 'jackson-st', 'vista-pointe'].map(slug => (
          <button
            key={slug}
            onClick={() => setFilterSlug(slug)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: filterSlug === slug ? '#C84B31' : '#F1F5F9',
              color: filterSlug === slug ? 'white' : '#475569',
            }}>
            {slug === 'all' ? 'All Properties' : PROPERTY_LABELS[slug]}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center gap-3 text-slate-500 py-12 justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-orange-500 animate-spin" />
          Loading records…
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && activeGroups.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="how_to_reg" size={26} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700">No active check-ins</p>
          <p className="text-sm text-slate-400 mt-1">
            {checkedOutCount > 0
              ? <>All groups have checked out. <Link to="/admin-v2/checkouts" className="text-green-600 hover:underline">View Checked Out →</Link></>
              : 'Submissions will appear here as guests complete check-in.'}
          </p>
        </div>
      )}

      {/* Active groups */}
      {!loading && !error && activeGroups.map(([gkey, items]) => {
        const primaryName = items[0]?.primaryGuestName?.trim() || 'Unknown'
        const isExpanded = expandedPrimary[gkey] !== false // default open
        const props = [...new Set(items.map(i => i.propertyName || i.propertySlug))]
        return (
          <div key={gkey} className="bg-white rounded-2xl border border-slate-200 mb-4 overflow-hidden">

            {/* Primary booker header */}
            <div className="flex items-center gap-0">
              <button
                onClick={() => togglePrimary(gkey)}
                className="flex-1 flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
                  {primaryName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-[14px]">{primaryName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {props.join(' · ')} &nbsp;·&nbsp; {items.length} guest{items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Icon
                  name={isExpanded ? 'expand_less' : 'expand_more'}
                  size={18}
                  className="text-slate-400 flex-shrink-0"
                />
              </button>

              {/* Mark as Checked Out button */}
              <button
                onClick={() => handleMarkCheckedOut(primaryName, items)}
                className="flex items-center gap-1.5 px-3 py-2 mx-2 rounded-lg text-[11px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors flex-shrink-0"
                title="Mark entire group as checked out"
              >
                <Icon name="exit_to_app" size={13} className="text-green-600" />
                <span className="hidden sm:inline">Check Out</span>
              </button>
            </div>

            {/* Guest rows */}
            {isExpanded && (
              <div className="border-t border-slate-100">
                {items.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-start gap-3 px-5 py-3.5 text-[13px] group"
                    style={{ borderTop: i > 0 ? '1px solid #F1F5F9' : 'none' }}>

                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold text-slate-500">
                      {(s.guestName || '?').charAt(0).toUpperCase()}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{s.guestName || '—'}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        {s.email && (
                          <a href={`mailto:${s.email}`}
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5">
                            <Icon name="mail" size={10} /> {s.email}
                          </a>
                        )}
                        {s.phone && (
                          <a href={`tel:${s.phone}`}
                            className="text-[11px] text-slate-500 flex items-center gap-0.5">
                            <Icon name="phone" size={10} /> {s.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Property + timestamp */}
                    <div className="text-right flex-shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 text-orange-700 mb-1">
                        {s.propertyName || s.propertySlug}
                      </span>
                      <p className="text-[10px] text-slate-400">{s.submittedAtFormatted || s.submittedAt}</p>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all mt-0.5"
                      title="Delete this record"
                    >
                      <Icon name="delete" size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Summary */}
      {!loading && !error && activeGroups.length > 0 && (
        <p className="text-xs text-slate-400 text-center mt-2">
          {activeGroups.reduce((n, [, items]) => n + items.length, 0)} active guest submission{activeGroups.reduce((n, [, items]) => n + items.length, 0) !== 1 ? 's' : ''} ·{' '}
          {activeGroups.length} primary booker{activeGroups.length !== 1 ? 's' : ''}
          {checkedOutCount > 0 && <> · <Link to="/admin-v2/checkouts" className="text-green-600 hover:underline">{checkedOutCount} checked out</Link></>}
        </p>
      )}
    </div>
  )
}
