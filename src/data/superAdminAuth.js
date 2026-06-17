// Super-admin (platform operator) authentication.
// After Firebase sign-in, verifies the user has role: 'superadmin' in their
// custom claims. Throws if not — the superadmin account is a separate Firebase
// Auth user from any tenant admin.
//
// The localStorage flag follows the same UX-guard pattern as the tenant admins:
// it keeps the shell visible across reloads while Firebase rehydrates its
// session. Real enforcement is in Firestore rules (isSuper() function).

import { auth } from '../firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

const FLAG_KEY = 'talo_super_admin_auth'

export async function superAdminSignIn(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, (email || '').trim(), password)
  const token = await user.getIdTokenResult(true)
  if (token.claims.role !== 'superadmin') {
    await signOut(auth)
    throw new Error('This account does not have platform admin access.')
  }
  localStorage.setItem(FLAG_KEY, '1')
}

export function isSuperAdminAuthenticated() {
  return localStorage.getItem(FLAG_KEY) === '1'
}

export async function superAdminSignOut() {
  try { await signOut(auth) } catch {}
  localStorage.removeItem(FLAG_KEY)
}
