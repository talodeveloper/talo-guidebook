// Simple in-memory store that simulates Supabase for the demo
// In production: replace all reads/writes with Supabase calls

import { properties as initialProperties } from './properties'
import { sharedContent as initialShared } from './sharedContent'
import { adminSignIn, adminSignOut } from './auth'

// Clone so mutations don't affect original imports
let _properties = JSON.parse(JSON.stringify(initialProperties))
let _shared = JSON.parse(JSON.stringify(initialShared))
let _listeners = []

function notify() {
  _listeners.forEach((fn) => fn())
}

export const adminStore = {
  // Auth — backed by Firebase Auth (see src/data/auth.js)
  isAuthenticated: () => localStorage.getItem('talo_admin_auth') === 'true',
  login: async (email, password) => {
    try {
      await adminSignIn(email, password)
      localStorage.setItem('talo_admin_auth', 'true')
      return true
    } catch {
      return false
    }
  },
  logout: () => { adminSignOut() },

  // Properties
  getProperties: () => Object.values(_properties),
  getProperty: (slug) => _properties[slug],
  updateProperty: (slug, updates) => {
    _properties[slug] = { ..._properties[slug], ...updates }
    notify()
  },
  addProperty: (property) => {
    _properties[property.slug] = property
    notify()
  },

  // Shared content
  getShared: () => _shared,
  getSharedSection: (key) => _shared[key],
  updateSharedSection: (key, content) => {
    _shared[key] = { ..._shared[key], ...content, lastUpdated: new Date().toISOString() }
    notify()
  },

  // Subscribe to changes
  subscribe: (fn) => {
    _listeners.push(fn)
    return () => {
      _listeners = _listeners.filter((l) => l !== fn)
    }
  },
}
