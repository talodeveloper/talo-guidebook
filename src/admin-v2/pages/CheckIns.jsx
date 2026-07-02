import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc } from 'firebase/firestore'
import Icon from '../../components/Icon'
import { getTenantId } from '../../data/tenant'
import { buildGuestGroups } from '../../data/guestRoster'

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
          const tid = getTenantId()
          setSubmissions(snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(r => r.tenantId === tid || (!r.tenantId && tid === 'talo')))
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
      const tid = getTenantId()
      return onSnapshot(q, (snap) => {
        setCheckouts(snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(r => r.tenantId === tid || (!r.tenantId && tid === 'talo')))
      })
    } catch {}
  }, [])

  // ── Merged booking groups ─────────────────────────────────────────────────
  // The roster engine unifies each primary booker's own record, the co-guests
  // they listed, and any guests who signed in themselves (matched by name) into
  // one people list per booking. Stay-aware active/checked-out detection lives
  // inside the engine.
  const allGroups = buildGuestGroups(submissions, checkouts)
  const propGroups = filterSlug === 'all'
    ? allGroups
    : allGroups.filter(g => g.propertySlug === filterSlug)
  const activeGroups    = propGroups.filter(g => g.active)
  const checkedOutCount = propGroups.filter(g => !g.active).length

  // Download active roster as CSV
  const downloadCSV = () => {
    const rows = [
      ['Property', 'Primary Booker', 'First Name', 'Last Name', 'Email', 'Phone', 'Age', 'Source'],
      ...activeGroups.flatMap(g => g.roster.map(p => [
        g.propertyName || g.propertySlug,
        g.primaryName || '(no primary booker)',
        p.firstName, p.lastName, p.email, p.phone,
        p.age ?? '',
        p.role === 'primary' ? 'Primary booker' : p.signedIn ? 'Guest signed in' : 'Listed by booker',
      ]))
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

  const handleMarkCheckedOut = async (group) => {
    if (!window.confirm(`Mark "${group.primaryName}" as checked out? The whole group will move to the Checked Out page.`)) return
    const now = new Date()
    const ts = now.toLocaleString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    try {
      await addDoc(collection(db, 'v2_checkouts'), {
        tenantId:              getTenantId(),
        primaryGuestName:      group.primaryName,
        propertySlug:          group.propertySlug || '',
        propertyName:          group.propertyName || group.propertySlug || '',
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
      {!loading && !error && activeGroups.map((group) => {
        const gkey = group.key
        const primaryLabel = group.orphan ? 'Guests — no primary booker yet' : (group.primaryName || 'Unknown')
        const isExpanded = expandedPrimary[gkey] !== false // default open
        const people = group.roster.length
        return (
          <div key={gkey} className="bg-white rounded-2xl border border-slate-200 mb-4 overflow-hidden">

            {/* Primary booker header */}
            <div className="flex items-center gap-0">
              <button
                onClick={() => togglePrimary(gkey)}
                className="flex-1 flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                  style={{ background: group.orphan ? 'linear-gradient(135deg,#64748B,#94A3B8)' : 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
                  {(primaryLabel.charAt(0) || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-[14px]">{primaryLabel}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {group.propertyName || group.propertySlug} &nbsp;·&nbsp; {people} {people === 1 ? 'person' : 'people'}
                  </p>
                </div>
                <Icon
                  name={isExpanded ? 'expand_less' : 'expand_more'}
                  size={18}
                  className="text-slate-400 flex-shrink-0"
                />
              </button>

              {/* Mark as Checked Out button — not for orphan (no primary) groups */}
              {!group.orphan && (
                <button
                  onClick={() => handleMarkCheckedOut(group)}
                  className="flex items-center gap-1.5 px-3 py-2 mx-2 rounded-lg text-[11px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors flex-shrink-0"
                  title="Mark entire group as checked out"
                >
                  <Icon name="exit_to_app" size={13} className="text-green-600" />
                  <span className="hidden sm:inline">Check Out</span>
                </button>
              )}
            </div>

            {/* Roster rows */}
            {isExpanded && (
              <div className="border-t border-slate-100">
                {group.roster.map((p, i) => {
                  const fullName = `${p.firstName} ${p.lastName}`.trim() || '—'
                  const sourceLabel = p.role === 'primary'
                    ? 'Primary booker'
                    : p.signedIn ? 'Signed in' : 'Listed by booker'
                  return (
                    <div
                      key={i}
                      className="flex flex-wrap items-start gap-3 px-5 py-3.5 text-[13px] group"
                      style={{ borderTop: i > 0 ? '1px solid #F1F5F9' : 'none' }}>

                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold text-slate-500">
                        {(fullName.charAt(0) || '?').toUpperCase()}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">
                          {fullName}
                          {p.age != null && <span className="ml-2 text-[11px] font-normal text-slate-400">age {p.age}{Number(p.age) < 18 ? ' · minor' : ''}</span>}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          {p.email && (
                            <a href={`mailto:${p.email}`}
                              className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5">
                              <Icon name="mail" size={10} /> {p.email}
                            </a>
                          )}
                          {p.phone && (
                            <a href={`tel:${p.phone}`}
                              className="text-[11px] text-slate-500 flex items-center gap-0.5">
                              <Icon name="phone" size={10} /> {p.phone}
                            </a>
                          )}
                          {!p.email && !p.phone && (
                            <span className="text-[11px] text-slate-300">No contact info yet</span>
                          )}
                        </div>
                      </div>

                      {/* Source tag */}
                      <div className="text-right flex-shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold"
                          style={{
                            background: p.role === 'primary' ? '#FEF2F2' : p.signedIn ? '#EFF6FF' : '#F1F5F9',
                            color:      p.role === 'primary' ? '#B91C1C' : p.signedIn ? '#1D4ED8' : '#64748B',
                          }}>
                          {sourceLabel}
                        </span>
                      </div>

                      {/* Delete — only rows backed by an actual check-in submission */}
                      {p.docId ? (
                        <button
                          onClick={() => handleDelete(p.docId)}
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all mt-0.5"
                          title="Delete this check-in submission"
                        >
                          <Icon name="delete" size={13} />
                        </button>
                      ) : <div className="w-6 flex-shrink-0" />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Summary */}
      {!loading && !error && activeGroups.length > 0 && (
        <p className="text-xs text-slate-400 text-center mt-2">
          {activeGroups.reduce((n, g) => n + g.roster.length, 0)} active guest{activeGroups.reduce((n, g) => n + g.roster.length, 0) !== 1 ? 's' : ''} ·{' '}
          {activeGroups.filter(g => !g.orphan).length} primary booker{activeGroups.filter(g => !g.orphan).length !== 1 ? 's' : ''}
          {checkedOutCount > 0 && <> · <Link to="/admin-v2/checkouts" className="text-green-600 hover:underline">{checkedOutCount} checked out</Link></>}
        </p>
      )}
    </div>
  )
}
