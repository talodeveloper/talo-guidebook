import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import Icon from '../../components/Icon'
import { getTenantId } from '../../data/tenant'

const PROPERTY_LABELS = {
  'reynard-way':  'Reynard Way',
  'hawk-street':  'Hawk Street',
  'jackson-st':   'Jackson Street',
  'vista-pointe': 'Vista Pointe',
}

export default function Checkouts() {
  const [checkouts, setCheckouts] = useState([])
  const [checkins, setCheckins]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterSlug, setFilterSlug] = useState('all')

  // Load checkout records
  useEffect(() => {
    try {
      const q = query(collection(db, 'v2_checkouts'), orderBy('checkedOutAt', 'desc'))
      const unsub = onSnapshot(
        q,
        (snap) => {
          const tid = getTenantId()
          setCheckouts(snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(r => r.tenantId === tid || (!r.tenantId && tid === 'talo')))
          setLoading(false)
        },
        (err) => { console.error(err); setLoading(false) }
      )
      return unsub
    } catch { setLoading(false) }
  }, [])

  // Load check-in records to show guest roster under each checkout
  useEffect(() => {
    try {
      const q = query(collection(db, 'v2_checkins'), orderBy('submittedAt', 'desc'))
      const tid = getTenantId()
      return onSnapshot(q, (snap) => {
        setCheckins(snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(r => r.tenantId === tid || (!r.tenantId && tid === 'talo')))
      })
    } catch {}
  }, [])

  const filtered = filterSlug === 'all'
    ? checkouts
    : checkouts.filter(c => c.propertySlug === filterSlug)

  // Restore: delete the checkout record → group reappears in Check-In Records
  const handleRestore = async (checkoutId, primaryName) => {
    if (!window.confirm(`Restore "${primaryName}" back to active guests? This removes the checkout record.`)) return
    try {
      await deleteDoc(doc(db, 'v2_checkouts', checkoutId))
    } catch (e) {
      console.error('[Firestore] restore failed:', e)
      alert('Restore failed. Please try again.')
    }
  }

  const downloadCSV = () => {
    const rows = [
      ['Property', 'Primary Booker', 'Checked Out By', 'Guest Name', 'Checked Out At'],
      ...filtered.map(c => [
        PROPERTY_LABELS[c.propertySlug] || c.propertySlug,
        c.primaryGuestName || '',
        c.checkedOutBy === 'admin' ? 'Admin' : (c.guestName || 'Guest'),
        c.guestName || '',
        c.checkedOutAtFormatted || c.checkedOutAt || '',
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `checkouts-${filterSlug}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Checked Out</h1>
          <p className="text-sm text-slate-500 mt-1">
            Groups that have completed checkout — submitted by guest or marked by admin.
            &nbsp;·&nbsp;
            <Link to="/admin-v2/checkins" className="text-orange-600 font-semibold hover:underline">
              ← Active Guests
            </Link>
          </p>
        </div>
        {filtered.length > 0 && (
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
              background: filterSlug === slug ? '#059669' : '#F1F5F9',
              color: filterSlug === slug ? 'white' : '#475569',
            }}>
            {slug === 'all' ? 'All Properties' : PROPERTY_LABELS[slug]}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 text-slate-500 py-12 justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-green-500 animate-spin" />
          Loading…
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="exit_to_app" size={26} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700">No checkouts yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Groups appear here once guests submit the checkout form or you mark them checked out.
          </p>
        </div>
      )}

      {/* Checkout cards */}
      {!loading && filtered.map(checkout => {
        // Find all check-in submissions for this primary booker + property
        // — only ones that happened BEFORE this checkout (so a future re-booking
        //   with the same name doesn't bleed into a past stay's roster)
        const checkoutTs = new Date(checkout.checkedOutAt || 0).getTime()
        const guests = checkins.filter(c => {
          const sameBooker  = c.primaryGuestName?.trim().toLowerCase() === checkout.primaryGuestName?.trim().toLowerCase()
          const sameProp    = c.propertySlug === checkout.propertySlug
          const checkinTs   = new Date(c.submittedAt || 0).getTime()
          return sameBooker && sameProp && checkinTs <= checkoutTs
        })

        const byAdmin = checkout.checkedOutBy === 'admin'

        return (
          <div key={checkout.id} className="bg-white rounded-2xl border border-slate-200 mb-4 overflow-hidden">
            {/* Primary booker row */}
            <div className="flex items-start gap-3 px-5 py-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold mt-0.5"
                style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                <Icon name="check_circle" size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-[14px]">{checkout.primaryGuestName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {PROPERTY_LABELS[checkout.propertySlug] || checkout.propertySlug}
                  &nbsp;·&nbsp;
                  {byAdmin
                    ? 'Marked checked out by admin'
                    : `Submitted by ${checkout.guestName || 'guest'}`}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{checkout.checkedOutAtFormatted || checkout.checkedOutAt}</p>
              </div>

              {/* Restore button */}
              <button
                onClick={() => handleRestore(checkout.id, checkout.primaryGuestName)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
                title="Restore to active guests"
              >
                <Icon name="undo" size={13} /> Restore
              </button>
            </div>

            {/* Guest roster */}
            {guests.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">
                  {guests.length} check-in record{guests.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-2">
                  {guests.map(g => (
                    <div key={g.id} className="flex items-center gap-2.5 text-[12px]">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">
                        {(g.guestName || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{g.guestName}</span>
                      {g.email && (
                        <a href={`mailto:${g.email}`} className="text-[11px] text-blue-500 hover:underline">
                          {g.email}
                        </a>
                      )}
                      {g.phone && (
                        <span className="text-[11px] text-slate-400">{g.phone}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Summary */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-center mt-2">
          {filtered.length} checkout{filtered.length !== 1 ? 's' : ''} total
        </p>
      )}
    </div>
  )
}
