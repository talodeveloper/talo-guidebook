import { useEffect, useState, useMemo } from 'react'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import Icon from '../../components/Icon'

const PROPERTY_LABELS = {
  'reynard-way':  'Reynard Way',
  'hawk-street':  'Hawk Street',
  'jackson-st':   'Jackson Street',
  'vista-pointe': 'Vista Pointe',
}

const fmtDate = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

export default function GuestDatabase() {
  const [checkins, setCheckins]   = useState([])
  const [checkouts, setCheckouts] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterSlug, setFilterSlug] = useState('all')

  // Live load check-ins
  useEffect(() => {
    try {
      const q = query(collection(db, 'v2_checkins'), orderBy('submittedAt', 'desc'))
      const unsub = onSnapshot(
        q,
        snap => {
          setCheckins(snap.docs.map(d => ({ id: d.id, ...d.data() })))
          setLoading(false)
        },
        err => { console.error(err); setLoading(false) }
      )
      return unsub
    } catch { setLoading(false) }
  }, [])

  // Live load checkouts (so we can derive checked-out date per guest)
  useEffect(() => {
    try {
      const q = query(collection(db, 'v2_checkouts'), orderBy('checkedOutAt', 'desc'))
      return onSnapshot(q, snap => {
        setCheckouts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      })
    } catch {}
  }, [])

  // For each check-in row, find the FIRST checkout that happened AFTER this check-in
  // for the same primary booker + property. That's their checked-out date.
  const rows = useMemo(() => {
    const decorated = checkins.map(c => {
      const checkinTs = new Date(c.submittedAt || 0).getTime()
      const key       = c.primaryGuestName?.trim().toLowerCase()
      const match = checkouts
        .filter(co => co.propertySlug === c.propertySlug)
        .filter(co => co.primaryGuestName?.trim().toLowerCase() === key)
        .filter(co => new Date(co.checkedOutAt || 0).getTime() >= checkinTs)
        .sort((a, b) => new Date(a.checkedOutAt) - new Date(b.checkedOutAt))[0]

      return {
        id:            c.id,
        guestName:     c.guestName || '—',
        email:         c.email || '',
        phone:         c.phone || '',
        propertySlug:  c.propertySlug,
        propertyName:  c.propertyName || c.propertySlug,
        checkedInAt:   c.submittedAt,
        checkedOutAt:  match?.checkedOutAt || null,
      }
    })
    // Sort newest first
    return decorated.sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt))
  }, [checkins, checkouts])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter(r => {
      if (filterSlug !== 'all' && r.propertySlug !== filterSlug) return false
      if (!q) return true
      return [r.guestName, r.email, r.phone, r.propertyName]
        .some(v => (v || '').toLowerCase().includes(q))
    })
  }, [rows, search, filterSlug])

  const downloadCSV = () => {
    const header = ['Guest Name', 'Email', 'Phone', 'Property', 'Checked-In Date', 'Checked-Out Date']
    const data = filtered.map(r => [
      r.guestName, r.email, r.phone,
      PROPERTY_LABELS[r.propertySlug] || r.propertyName,
      fmtDate(r.checkedInAt),
      r.checkedOutAt ? fmtDate(r.checkedOutAt) : 'Still checked in',
    ])
    const csv = [header, ...data]
      .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `talo-guest-database-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Guest Database</h1>
          <p className="text-sm text-slate-500 mt-1">
            Every guest check-in submission — newest first. Use for email marketing.
          </p>
        </div>
        {filtered.length > 0 && (
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            <Icon name="download" size={15} className="text-white" />
            Download CSV ({filtered.length})
          </button>
        )}
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300 bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'reynard-way', 'hawk-street', 'jackson-st', 'vista-pointe'].map(slug => (
            <button
              key={slug}
              onClick={() => setFilterSlug(slug)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: filterSlug === slug ? '#C84B31' : '#F1F5F9',
                color: filterSlug === slug ? 'white' : '#475569',
              }}>
              {slug === 'all' ? 'All' : PROPERTY_LABELS[slug]}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center gap-3 text-slate-500 py-12 justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-orange-500 animate-spin" />
          Loading guest records…
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="database" size={26} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700">No guest records yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Guests appear here once they submit the check-in form.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Checked In</th>
                  <th className="px-4 py-3">Checked Out</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 transition-colors"
                    style={{ borderTop: idx > 0 ? '1px solid #F1F5F9' : 'none' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-[11px] font-bold text-orange-700 flex-shrink-0">
                          {(r.guestName || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{r.guestName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {r.email ? (
                        <a href={`mailto:${r.email}`} className="text-blue-600 hover:underline">{r.email}</a>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {r.phone ? (
                        <a href={`tel:${r.phone}`} className="text-slate-600 hover:underline">{r.phone}</a>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-50 text-orange-700">
                        {PROPERTY_LABELS[r.propertySlug] || r.propertyName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{fmtDate(r.checkedInAt)}</td>
                    <td className="px-4 py-3">
                      {r.checkedOutAt ? (
                        <span className="text-green-600">{fmtDate(r.checkedOutAt)}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Currently in
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-center mt-3">
          Showing {filtered.length} of {rows.length} total guest record{rows.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
