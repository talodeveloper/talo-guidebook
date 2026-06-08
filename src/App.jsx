import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { adminStore } from './data/adminStore'

// Guidebook v1 (original teal theme)
import GuidebookLayout from './guidebook/GuidebookLayout'
import GuidebookPage from './guidebook/GuidebookPage'
import Checkout from './guidebook/Checkout'

// Guidebook v2 (California theme + FAQ)
import V2GuidebookLayout from './guidebook/v2/V2GuidebookLayout'
import V2GuidebookPage from './guidebook/v2/V2GuidebookPage'
import V2FAQPage from './guidebook/v2/V2FAQPage'
import V2PrintPage from './guidebook/v2/V2PrintPage'

// Admin
import Login from './admin/Login'
import AdminLayout from './admin/AdminLayout'
import ContentPage from './admin/ContentPage'
import ContentList from './admin/ContentList'
import Dashboard from './admin/Dashboard'
import PropertyEditor from './admin/PropertyEditor'
import NewProperty from './admin/NewProperty'

function RequireAuth({ children }) {
  return adminStore.isAuthenticated() ? children : <Navigate to="/admin" replace />
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
          <Route path="checkout" element={<Checkout />} />
          <Route path="print" element={<V2PrintPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
