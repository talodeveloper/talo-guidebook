import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { adminStore } from './data/adminStore'
import { adminV2Store } from './data/adminV2Store'
import { adminV3Store } from './data/adminV3Store'
import { isSuperAdminAuthenticated } from './data/superAdminAuth'
import { getHostMode } from './data/tenant'
import './data/firebaseSync' // initialises Firestore real-time listeners for V2

// Super-admin panel
import SuperAdminLogin from './super-admin/Login'
import SuperAdminLayout from './super-admin/Layout'
import SuperAdminDashboard from './super-admin/pages/Dashboard'
import SuperAdminTenantDetail from './super-admin/pages/TenantDetail'
import SuperAdminCreateTenant from './super-admin/pages/CreateTenant'

// Guidebook v1 (original teal theme)
import GuidebookLayout from './guidebook/GuidebookLayout'
import GuidebookPage from './guidebook/GuidebookPage'
import Checkout from './guidebook/Checkout'

// Guidebook v2 (California theme + FAQ)
import V2GuidebookLayout from './guidebook/v2/V2GuidebookLayout'
import V2GuidebookPage from './guidebook/v2/V2GuidebookPage'
import V2FAQPage from './guidebook/v2/V2FAQPage'
import V2PrintPage from './guidebook/v2/V2PrintPage'
import V2CheckInPage from './guidebook/v2/V2CheckInPage'

// Admin v1
import Login from './admin/Login'
import AdminLayout from './admin/AdminLayout'
import ContentPage from './admin/ContentPage'
import ContentList from './admin/ContentList'
import Dashboard from './admin/Dashboard'
import PropertyEditor from './admin/PropertyEditor'
import NewProperty from './admin/NewProperty'

// Guidebook v3 (Activity Center)
import V3GuidebookLayout from './guidebook/v3/V3GuidebookLayout'
import V3GuidebookPage from './guidebook/v3/V3GuidebookPage'
import V3FAQPage from './guidebook/v3/V3FAQPage'
import V3CheckInPage from './guidebook/v3/V3CheckInPage'
import V3ActivityPage from './guidebook/v3/V3ActivityPage'

// Admin v2
import AdminV2Login from './admin-v2/Login'
import AdminV2Layout from './admin-v2/Layout'
import AdminV2Dashboard from './admin-v2/pages/Dashboard'
import AdminV2PropertyHome from './admin-v2/pages/PropertyHome'
import AdminV2SectionEditor from './admin-v2/pages/SectionEditor'
import AdminV2PropertyInfo from './admin-v2/pages/PropertyInfo'
import AdminV2FAQEditor from './admin-v2/pages/FAQEditor'
import AdminV2GlobalContent from './admin-v2/pages/GlobalContent'
import AdminV2CheckIns from './admin-v2/pages/CheckIns'
import AdminV2Checkouts from './admin-v2/pages/Checkouts'
import AdminV2GuestDatabase from './admin-v2/pages/GuestDatabase'

// Admin v3
import AdminV3Login from './admin-v3/Login'
import AdminV3Layout from './admin-v3/Layout'
import AdminV3Dashboard from './admin-v3/pages/Dashboard'
import AdminV3GlobalActivities from './admin-v3/pages/GlobalActivities'
import AdminV3GlobalContent from './admin-v3/pages/GlobalContent'
import AdminV3PropertyHome from './admin-v3/pages/PropertyHome'
import AdminV3PropertyInfo from './admin-v3/pages/PropertyInfo'
import AdminV3PropertyActivities from './admin-v3/pages/PropertyActivities'
import AdminV3SectionEditor from './admin-v3/pages/SectionEditor'
import AdminV3PropertySections from './admin-v3/pages/PropertySections'
import AdminV3FAQEditor from './admin-v3/pages/FAQEditor'
import AdminV3AddProperty from './admin-v3/pages/AddProperty'

function RequireSuperAdmin({ children }) {
  return isSuperAdminAuthenticated() ? children : <Navigate to="/super-admin" replace />
}

function RequireAuth({ children }) {
  return adminStore.isAuthenticated() ? children : <Navigate to="/admin" replace />
}

function RequireAuthV2({ children }) {
  return adminV2Store.isAuthenticated() ? children : <Navigate to="/admin-v2" replace />
}

function RequireAuthV3({ children }) {
  return adminV3Store.isAuthenticated() ? children : <Navigate to="/admin-v3" replace />
}

// Routes served on a tenant subdomain ({tenant}.talo.llc): the guest guidebook
// lives at the URL root (/beach-house), and the tenant admin keeps /admin-v3
// for now (cleaned to /admin in a later step). The tenant is resolved from the
// subdomain by getTenantId(), so no /v3 or tenant segment is needed in the path.
function TenantRoutes() {
  return (
    <Routes>
      {/* Tenant admin */}
      <Route path="/admin-v3">
        <Route index element={<AdminV3Login />} />
        <Route
          element={
            <RequireAuthV3>
              <AdminV3Layout />
            </RequireAuthV3>
          }
        >
          <Route path="dashboard" element={<AdminV3Dashboard />} />
          <Route path="activities" element={<AdminV3GlobalActivities />} />
          <Route path="global" element={<AdminV3GlobalContent />} />
          <Route path="add-property" element={<AdminV3AddProperty />} />
          <Route path="checkins" element={<AdminV2CheckIns />} />
          <Route path="checkouts" element={<AdminV2Checkouts />} />
          <Route path="guest-database" element={<AdminV2GuestDatabase />} />
          <Route path="property/:slug" element={<AdminV3PropertyHome />} />
          <Route path="property/:slug/info" element={<AdminV3PropertyInfo />} />
          <Route path="property/:slug/faq" element={<AdminV3FAQEditor />} />
          <Route path="property/:slug/activities" element={<AdminV3PropertyActivities />} />
          <Route path="property/:slug/sections" element={<AdminV3PropertySections />} />
          <Route path="property/:slug/section/:sectionKey" element={<AdminV3SectionEditor />} />
        </Route>
      </Route>

      {/* Guest guidebook at the clean URL root (static /admin-v3 outranks /:slug) */}
      <Route path="/:slug" element={<V3GuidebookLayout />}>
        <Route index element={<V3GuidebookPage />} />
        <Route path="faq" element={<V3FAQPage />} />
        <Route path="activities" element={<V3ActivityPage />} />
        <Route path="checkin" element={<V3CheckInPage />} />
        <Route path="checkout" element={<Checkout />} />
      </Route>

      {/* Root + unknown → tenant admin (owner landing) */}
      <Route path="/" element={<Navigate to="/admin-v3" replace />} />
      <Route path="*" element={<Navigate to="/admin-v3" replace />} />
    </Routes>
  )
}

export default function App() {
  const hostMode = getHostMode()
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {hostMode === 'tenant' ? <TenantRoutes /> : (
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Admin login */}
        <Route path="/admin" element={<Login />} />

        {/* Admin panel (protected) — Content is the landing page */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route path="content" element={<ContentPage />} />
          <Route path="content-list" element={<ContentList />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="property/:slug" element={<PropertyEditor />} />
          <Route path="new-property" element={<NewProperty />} />
          {/* Default redirect after login → Content */}
          <Route index element={<Navigate to="content" replace />} />
        </Route>

        {/* Guest guidebooks v1 — original teal theme (preserved) */}
        <Route path="/:slug" element={<GuidebookLayout />}>
          <Route index element={<GuidebookPage />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>

        {/* Guest guidebooks v2 — California theme with FAQ */}
        <Route path="/v2/:slug" element={<V2GuidebookLayout />}>
          <Route index element={<V2GuidebookPage />} />
          <Route path="faq" element={<V2FAQPage />} />
          <Route path="checkin" element={<V2CheckInPage />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="print" element={<V2PrintPage />} />
        </Route>

        {/* Admin v2 — login at index, protected pages under pathless layout */}
        <Route path="/admin-v2">
          <Route index element={<AdminV2Login />} />
          <Route
            element={
              <RequireAuthV2>
                <AdminV2Layout />
              </RequireAuthV2>
            }
          >
            <Route path="dashboard" element={<AdminV2Dashboard />} />
            <Route path="global" element={<AdminV2GlobalContent />} />
            <Route path="checkins" element={<AdminV2CheckIns />} />
            <Route path="checkouts" element={<AdminV2Checkouts />} />
            <Route path="guest-database" element={<AdminV2GuestDatabase />} />
            <Route path="property/:slug" element={<AdminV2PropertyHome />} />
            <Route path="property/:slug/info" element={<AdminV2PropertyInfo />} />
            <Route path="property/:slug/faq" element={<AdminV2FAQEditor />} />
            <Route path="property/:slug/section/:sectionKey" element={<AdminV2SectionEditor />} />
          </Route>
        </Route>

        {/* Guest guidebooks v3 — Activity Center replaces Local Guide + Things To Do */}
        <Route path="/v3/:slug" element={<V3GuidebookLayout />}>
          <Route index element={<V3GuidebookPage />} />
          <Route path="faq" element={<V3FAQPage />} />
          <Route path="activities" element={<V3ActivityPage />} />
          <Route path="checkin" element={<V3CheckInPage />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>

        {/* Admin v3 */}
        <Route path="/admin-v3">
          <Route index element={<AdminV3Login />} />
          <Route
            element={
              <RequireAuthV3>
                <AdminV3Layout />
              </RequireAuthV3>
            }
          >
            <Route path="dashboard" element={<AdminV3Dashboard />} />
            <Route path="activities" element={<AdminV3GlobalActivities />} />
            <Route path="global" element={<AdminV3GlobalContent />} />
            <Route path="add-property" element={<AdminV3AddProperty />} />
            <Route path="checkins" element={<AdminV2CheckIns />} />
            <Route path="checkouts" element={<AdminV2Checkouts />} />
            <Route path="guest-database" element={<AdminV2GuestDatabase />} />
            <Route path="property/:slug" element={<AdminV3PropertyHome />} />
            <Route path="property/:slug/info" element={<AdminV3PropertyInfo />} />
            <Route path="property/:slug/faq" element={<AdminV3FAQEditor />} />
            <Route path="property/:slug/activities" element={<AdminV3PropertyActivities />} />
            <Route path="property/:slug/sections" element={<AdminV3PropertySections />} />
            <Route path="property/:slug/section/:sectionKey" element={<AdminV3SectionEditor />} />
          </Route>
        </Route>

        {/* Super-admin platform panel */}
        <Route path="/super-admin">
          <Route index element={<SuperAdminLogin />} />
          <Route
            element={
              <RequireSuperAdmin>
                <SuperAdminLayout />
              </RequireSuperAdmin>
            }
          >
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="tenant/:tenantId" element={<SuperAdminTenantDetail />} />
            <Route path="create-tenant" element={<SuperAdminCreateTenant />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
      )}
    </BrowserRouter>
  )
}
