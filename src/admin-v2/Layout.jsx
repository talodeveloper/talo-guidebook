import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminV2Store } from '../data/adminV2Store'
import Icon from '../components/Icon'

function SidebarLink({ to, icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-orange-50 text-orange-700 font-semibold'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      <Icon name={icon} size={16} />
      <span>{label}</span>
    </NavLink>
  )
}

export default function AdminV2Layout() {
  const navigate = useNavigate()
  const [properties, setProperties]           = useState(adminV2Store.getPropertiesList())
  const [hasChanges, setHasChanges]           = useState(adminV2Store.hasUnsavedChanges())
  const [changeSummary, setChangeSummary]     = useState(adminV2Store.getChangeSummary())
  const [publishing, setPublishing]           = useState(false)
  const [publishedFlash, setPublishedFlash]   = useState(false)
  const [sidebarOpen, setSidebarOpen]         = useState(false)
  const [showDropdown, setShowDropdown]       = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    return adminV2Store.subscribe(() => {
      setProperties(adminV2Store.getPropertiesList())
      setHasChanges(adminV2Store.hasUnsavedChanges())
      setChangeSummary(adminV2Store.getChangeSummary())
    })
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showDropdown])

  const handleLogout = () => {
    adminV2Store.logout()
    navigate('/admin-v2')
  }

  const handlePublish = async () => {
    setPublishing(true)
    setShowDropdown(false)
    try {
      await adminV2Store.publish()
    } catch (e) {
      console.error('Publish error:', e)
    }
    setPublishing(false)
    setPublishedFlash(true)
    setTimeout(() => setPublishedFlash(false), 3000)
  }

  const handleDiscard = () => {
    if (window.confirm('Discard all unpublished changes? This cannot be undone.')) {
      setShowDropdown(false)
      adminV2Store.discardDraft()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto`}>
        {/* Brand */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              <span className="text-white text-sm font-black">T</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">TALO Admin</p>
              <p className="text-[10px] text-slate-400">Guidebook Manager</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <SidebarLink to="/admin-v2/dashboard" icon="dashboard" label="Dashboard" />
          <SidebarLink to="/admin-v2/global" icon="public" label="Global Content" />

          {/* Guest Records group */}
          <div className="pt-3 pb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Guest Records</p>
          </div>
          <SidebarLink to="/admin-v2/checkins" icon="how_to_reg" label="Check-In Records" />
          <SidebarLink to="/admin-v2/checkouts" icon="exit_to_app" label="Checked Out" />
          <SidebarLink to="/admin-v2/guest-database" icon="contacts" label="Guest Database" />

          <div className="pt-4 pb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Properties</p>
          </div>

          {properties.map(p => (
            <NavLink
              key={p.slug}
              to={`/admin-v2/property/${p.slug}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === 'active' ? 'bg-green-500' : 'bg-amber-400'}`} />
              <span className="truncate">{p.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <Icon name="logout" size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="h-14 flex items-center gap-3 px-4 md:px-6">
            <button className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
              <Icon name="menu" size={20} />
            </button>

            <div className="flex-1" />

            {/* Publish bar */}
            {publishedFlash ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                <Icon name="check_circle" size={14} /> Published successfully
              </div>
            ) : (
              <div className="flex items-center gap-2">

                {/* "Unpublished changes" clickable with dropdown */}
                {hasChanges && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(v => !v)}
                      className="hidden sm:flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors px-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      Unpublished changes
                      <Icon name={showDropdown ? 'expand_less' : 'expand_more'} size={13} className="text-amber-500" />
                    </button>

                    {/* Dropdown */}
                    {showDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                        <div className="px-3.5 py-2.5 border-b border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Changed sections</p>
                        </div>
                        <div className="max-h-56 overflow-y-auto py-1.5">
                          {changeSummary.length === 0 ? (
                            <p className="px-3.5 py-2 text-xs text-slate-400">No specific changes detected</p>
                          ) : (
                            changeSummary.map((c, i) => (
                              <div key={i} className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                <span className="text-xs text-slate-700">
                                  <strong>{c.label}</strong>
                                  <span className="text-slate-400"> — {c.property}</span>
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Discard — only when there are changes */}
                {hasChanges && (
                  <button
                    onClick={handleDiscard}
                    className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Discard
                  </button>
                )}

                {/* Publish — always clickable; grey = no local changes but can still force-sync to Firestore */}
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                  style={{
                    background: hasChanges
                      ? 'linear-gradient(135deg, #C84B31, #EA580C)'
                      : '#CBD5E1',
                    color: hasChanges ? 'white' : '#64748B',
                    cursor: publishing ? 'not-allowed' : 'pointer',
                    opacity: publishing ? 0.6 : 1,
                  }}
                >
                  <Icon name="publish" size={13} />
                  {publishing ? 'Publishing…' : 'Publish'}
                </button>

              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
