import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminStore } from '../data/adminStore'
import Icon from '../components/Icon'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [propertyList, setPropertyList] = useState(adminStore.getProperties())

  useEffect(() => {
    if (!adminStore.isAuthenticated()) {
      navigate('/admin', { replace: true })
    }
    const unsub = adminStore.subscribe(() => setPropertyList(adminStore.getProperties()))
    return unsub
  }, [navigate])

  const handleLogout = () => {
    adminStore.logout()
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-surface-container-lowest border-r border-outline-variant/20 z-50 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:z-auto`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-outline-variant/20">
          <img src="/talo-logo.jpeg" alt="TALO Rentals" className="h-8 w-auto object-contain mb-1" />
          <p className="text-on-surface-variant text-xs pl-0.5">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
          {/* Content — primary landing */}
          <NavLink
            to="/admin/content"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-label-md font-semibold transition-colors ${
                isActive
                  ? 'bg-secondary-container/60 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`
            }
          >
            <Icon name="article" size={18} />
            Content
          </NavLink>

          {/* Content List */}
          <NavLink
            to="/admin/content-list"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-label-md font-semibold transition-colors ${
                isActive
                  ? 'bg-secondary-container/60 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`
            }
          >
            <Icon name="format_list_bulleted" size={18} />
            Content List
          </NavLink>

          {/* Dashboard — Beta */}
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-label-md transition-colors ${
                isActive
                  ? 'bg-secondary-container/60 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`
            }
          >
            <Icon name="dashboard" size={18} />
            <span>Dashboard</span>
            <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Beta</span>
          </NavLink>

          <div className="pt-3 pb-1">
            <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider px-3 mb-1">
              Properties
            </p>
          </div>

          {propertyList.map((prop) => (
            <NavLink
              key={prop.slug}
              to={`/admin/property/${prop.slug}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-label-md transition-colors ${
                  isActive
                    ? 'bg-secondary-container/60 text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`
              }
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  prop.status === 'active' ? 'bg-green-500' : 'bg-amber-400'
                }`}
              />
              <span className="truncate">{prop.name}</span>
            </NavLink>
          ))}

          <NavLink
            to="/admin/new-property"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-2 text-label-md text-primary border border-dashed border-primary/30 hover:bg-primary/5 transition-colors"
          >
            <Icon name="add" size={18} className="text-primary" />
            Add Property
          </NavLink>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-outline-variant/20 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <Icon name="logout" size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-surface-container-lowest border-b border-outline-variant/20 h-14 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30">
          <button
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="menu" size={22} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-on-surface-variant text-label-md">
            <div className="w-8 h-8 bg-secondary-container rounded-full flex items-center justify-center">
              <Icon name="person" size={16} className="text-primary" />
            </div>
            <span className="hidden md:inline font-semibold text-on-surface">Joe Saari</span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-auto p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
