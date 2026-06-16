// One-time bootstrap for Phase 1 steps 1.2 + 1.3 (see PHASE1_PLAN.md).
//
// Runs locally with the Firebase Admin SDK (bypasses security rules). It:
//   1.2  seeds the TALO tenant scaffolding:
//          tenants/talo  (public profile fields)
//          slugs/talo    -> { tenantId: "talo" }   (URL slug lookup)
//   1.3  sets custom auth claims { tenantId: "talo", role: "owner" }
//        on the TALO admin user so rules can recognise them.
//
// It does NOT touch any existing data (v2_content, v2_checkins, etc.) and does
// NOT populate tenants/talo/data/* — that's the dual-write/backfill in step 1.4.
//
// Usage:
//   node scripts/seed-talo-tenant.mjs <admin-email>
// Requires ./serviceAccountKey.json (gitignored) in the project root.

import { readFileSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const adminEmail = process.argv[2]
if (!adminEmail) {
  console.error('Usage: node scripts/seed-talo-tenant.mjs <admin-email>')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'))
initializeApp({ credential: cert(serviceAccount) })

const db = getFirestore()
const auth = getAuth()

const TENANT_ID = 'talo'

async function run() {
  // --- 1.3: resolve the admin user and set tenant claims ---
  const user = await auth.getUserByEmail(adminEmail)
  await auth.setCustomUserClaims(user.uid, { tenantId: TENANT_ID, role: 'owner' })
  console.log(`[1.3] claims set on ${adminEmail} (uid ${user.uid}): tenantId=${TENANT_ID}, role=owner`)

  // --- 1.2: seed tenant scaffolding (additive; nothing reads it yet) ---
  await db.doc(`tenants/${TENANT_ID}`).set({
    name: 'TALO Rentals',
    slug: TENANT_ID,
    ownerUid: user.uid,
    status: 'active',          // tenant-level on/off (separate from billing)
    plan: 'founder',
    propertyLimit: 999,
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true })
  console.log(`[1.2] tenants/${TENANT_ID} seeded`)

  await db.doc(`slugs/${TENANT_ID}`).set({ tenantId: TENANT_ID }, { merge: true })
  console.log(`[1.2] slugs/${TENANT_ID} -> { tenantId: "${TENANT_ID}" } seeded`)

  // --- verify ---
  const t = await db.doc(`tenants/${TENANT_ID}`).get()
  const s = await db.doc(`slugs/${TENANT_ID}`).get()
  const refreshed = await auth.getUser(user.uid)
  console.log('\nVERIFY:')
  console.log('  tenant doc:', t.exists ? t.data() : 'MISSING')
  console.log('  slug doc:  ', s.exists ? s.data() : 'MISSING')
  console.log('  claims:    ', refreshed.customClaims)
  console.log('\nDone. The admin must log out and back in to pick up the new claim.')
}

run().then(() => process.exit(0)).catch((e) => { console.error('FAILED:', e); process.exit(1) })
