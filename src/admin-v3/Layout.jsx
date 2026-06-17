import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminV3Store } from '../data/adminV3Store'
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

function AccountLockedWall({ navigate }) {
  const lockedStatus = adminV3Store.isLocked()
  const isSuspended = lockedStatus === 'suspended'

  function handleSignOut() {
    adminV3Store.logout()
    navigate('/admin-v3')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: isSuspended ? '#fef2f2' : '#fffbeb' }}>
            <Icon name={isSuspended ? 'lock' : 'pause_circle'} size={28}
              className={isSuspended ? 'text-red-500' : 'text-amber-500'} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {isSuspended ? 'Account suspended' : 'Account deactivated'}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {isSuspended
              ? 'Your account has been suspended. Please contact support to restore access to your guidebooks and admin panel.'
              : 'Your account is currently deactivated. Choose a plan below to reactivate and get instant access to your guidebooks and admin panel.'}
          </p>

          {/* Placeholder — replaced with Stripe plan cards in Phase 4 */}
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 mb-6">
            <Icon name="credit_card" size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">Plan selection coming soon</p>
            <p className="text-xs text-slate-400 mt-1">
              Payment integration will be available in a future update.
              Contact support to reactivate your account manually.
            </p>
          </div>

          <a href="mailto:support@talorentals.com"
            className="block w-full py-2.5 rounded-xl text-sm font-bold text-white mb-3 transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            Contact Support
          </a>
          <button onClick={handleSignOut}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-colors">
            Sign Out
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">TALO Rentals · Admin Panel v3</p>
      </div>
    </div>
  )
}

export default function AdminV3Layout() {
  const navigate = useNavigate()
  const locked = adminV3Store.isLocked()
  const [properties, setProperties] = useState(adminV3Store.getPropertiesList())
  const [hasChanges, setHasChanges] = useState(adminV3Store.hasUnsavedChanges())
  const [changeSummary, setChangeSummary] = useState(adminV3Store.getChangeSummary())
  const [publishing, setPublishing] = useState(false)
  const [publishedFlash, setPublishedFlash] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Show payment wall if tenant is deactivated or suspended
  if (locked) return <AccountLockedWall navigate={navigate} />

  useEffect(() => {
    return adminV3Store.subscribe(() => {
      setProperties(adminV3Store.getPropertiesList())
      setHasChanges(adminV3Store.hasUnsavedChanges())
      setChangeSummary(adminV3Store.getChangeSummary())
    })
  }, [])

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
    adminV3Store.logout()
    navigate('/admin-v3')
  }

  const handlePublish = async () => {
    setPublishing(true)
    setShowDropdown(false)
    adminV3Store.publish()
    setPublishing(false)
    setPublishedFlash(true)
    setTimeout(() => setPublishedFlash(false), 3000)
  }

  const handleDiscard = () => {
    if (window.confirm('Discard all unpublished changes? This cannot be undone.')) {
      setShowDropdown(false)
      adminV3Store.discardDraft()
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
              <p className="text-[10px] text-slate-400">v3 · Activity Center</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <SidebarLink to="/admin-v3/dashboard" icon="dashboard" label="Dashboard" end />
          <SidebarLink to="/admin-v3/activities" icon="explore" label="Global Activities" />
          <SidebarLink to="/admin-v3/global" icon="public" label="Global Content" />

          {/* Guest Records group */}
          <div className="pt-3 pb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Guest Records</p>
          </div>
          <SidebarLink to="/admin-v3/checkins" icon="how_to_reg" label="Check-In Records" />
          <SidebarLink to="/admin-v3/checkouts" icon="exit_to_app" label="Checked Out" />
          <SidebarLink to="/admin-v3/guest-database" icon="contacts" label="Guest Database" />

          <div className="pt-4 pb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Properties</p>
          </div>

          {properties.map(p => (
            <NavLink
              key={p.slug}
              to={`/admin-v3/property/${p.slug}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                p.status === 'active' ? 'bg-green-500'
                : p.status === 'inactive' ? 'bg-slate-300'
                : 'bg-amber-400'
              }`} />
              <span className="truncate">{p.name}</span>
              {p.status === 'inactive' && (
                <span className="ml-auto text-[9px] text-slate-400 font-semibold uppercase">Off</span>
              )}
            </NavLink>
          ))}

          <NavLink
            to="/admin-v3/add-property"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mt-1 ${
                isActive
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            <Icon name="add_circle_outline" size={16} />
            <span>Add Property</span>
          </NavLink>
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

            {publishedFlash ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                <Icon name="check_circle" size={14} /> Published successfully
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Unpublished changes dropdown */}
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

                {/* Discard — only when changes */}
                {hasChanges && (
                  <button
                    onClick={handleDiscard}
                    className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Discard
                  </button>
                )}

                {/* Publish — always visible; grey = no changes but can force-sync */}
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                  style={{
                    background: hasChanges ? 'linear-gradient(135deg, #C84B31, #EA580C)' : '#CBD5E1',
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
