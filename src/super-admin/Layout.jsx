import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { superAdminSignOut } from '../data/superAdminAuth'
import { auth } from '../firebase'

function SidebarLink({ to, label, icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-indigo-600 text-white font-semibold'
            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
        }`
      }
    >
      <span className="text-base leading-none" style={{ fontFamily: 'Material Icons', fontSize: 16 }}>{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

export default function SuperAdminLayout() {
  const navigate = useNavigate()
  const currentEmail = auth.currentUser?.email || ''

  const handleSignOut = async () => {
    await superAdminSignOut()
    navigate('/super-admin')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0F172A' }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r" style={{ background: '#1E293B', borderColor: '#334155' }}>
        {/* Brand */}
        <div className="px-5 py-4 border-b" style={{ borderColor: '#334155' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Platform Admin</p>
              <p className="text-[10px] text-slate-500">Talo Rentals</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <SidebarLink to="/super-admin/dashboard" icon="dashboard" label="Tenants" end />
          <SidebarLink to="/super-admin/create-tenant" icon="add_business" label="Add Tenant" />
        </nav>

        {/* Footer */}
        <div className="p-3 border-t space-y-1" style={{ borderColor: '#334155' }}>
          <div className="px-3 py-2">
            <p className="text-[10px] text-slate-500 truncate">{currentEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <span className="text-base leading-none" style={{ fontFamily: 'Material Icons', fontSize: 16 }}>logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto" style={{ background: '#0F172A' }}>
        <Outlet />
      </main>
    </div>
  )
}
