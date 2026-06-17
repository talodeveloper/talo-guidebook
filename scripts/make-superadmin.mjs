// One-time bootstrap: grant platform super-admin access to a Firebase Auth user.
//
// Usage:
//   node scripts/make-superadmin.mjs <email>
// Requires ./serviceAccountKey.json in the project root (gitignored).
//
// After running, the user can log in at /super-admin with their existing
// Firebase Auth credentials (same password they already have, or set via
// Firebase Console → Authentication → Users → Reset password).

import { readFileSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const email = process.argv[2]
if (!email) {
  console.error('Usage: node scripts/make-superadmin.mjs <email>')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'))
initializeApp({ credential: cert(serviceAccount) })
const auth = getAuth()

async function run() {
  const user = await auth.getUserByEmail(email)
  await auth.setCustomUserClaims(user.uid, { role: 'superadmin' })
  const refreshed = await auth.getUser(user.uid)
  console.log(`✓ Super-admin claims set on ${email} (uid: ${user.uid})`)
  console.log('  claims:', refreshed.customClaims)
  console.log('\nThe user must log out and back in to pick up the new claim.')
}

run().then(() => process.exit(0)).catch(e => { console.error('FAILED:', e.message); process.exit(1) })
