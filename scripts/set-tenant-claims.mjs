// Set tenant owner claims on a Firebase Auth user.
// Run this after manually creating a new tenant's admin account in Firebase
// Console (or after signing them up), to bind their account to the tenant.
//
// Usage:
//   node scripts/set-tenant-claims.mjs <email> <tenantId>
// Requires ./serviceAccountKey.json in the project root (gitignored).
//
// This will be replaced by a Cloud Function in Phase 3 (auto-runs on signup).

import { readFileSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const [email, tenantId] = process.argv.slice(2)
if (!email || !tenantId) {
  console.error('Usage: node scripts/set-tenant-claims.mjs <email> <tenantId>')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'))
initializeApp({ credential: cert(serviceAccount) })
const auth = getAuth()

async function run() {
  const user = await auth.getUserByEmail(email)
  await auth.setCustomUserClaims(user.uid, { tenantId, role: 'owner' })
  const refreshed = await auth.getUser(user.uid)
  console.log(`✓ Tenant claims set on ${email} (uid: ${user.uid})`)
  console.log('  claims:', refreshed.customClaims)
  console.log(`\nThe user can now log in at /admin-v3 and their data will be scoped to tenant "${tenantId}".`)
  console.log('They must log out and back in first if already signed in.')
}

run().then(() => process.exit(0)).catch(e => { console.error('FAILED:', e.message); process.exit(1) })
