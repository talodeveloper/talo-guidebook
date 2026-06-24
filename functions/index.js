// Talo Rentals — Cloud Functions
//
// provisionTenant: called right after a user signs up. It atomically claims a
// subdomain slug, creates the tenant record, and grants the signed-in user
// owner access via a custom claim ({ tenantId, role: 'owner' }). This replaces
// the manual `set-tenant-claims.mjs` script so signup is fully self-serve.
//
// Security model is unchanged: Firestore/Storage rules still enforce
// request.auth.token.tenantId — only this trusted backend can set that claim.

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import admin from 'firebase-admin'

admin.initializeApp()
const db = admin.firestore()

// Subdomains that are platform infrastructure, never tenant slugs.
const RESERVED = new Set([
  'admin', 'api', 'guidebook', 'app', 'www', 'signup', 'login', 'account',
  'super', 'platform', 'talo', 'support', 'help', 'billing', 'mail', 'smtp',
  'imap', 'pop', 'webmail', 'autodiscover', 'autoconfig', 'mx', 'ns', 'cdn',
  'static', 'assets', 'sd',
])

const PLAN_LIMITS = { starter: 3, pro: 10, founder: 999 }

export const provisionTenant = onCall(async (request) => {
  const uid = request.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'Please sign in first.')

  const email = request.auth.token.email || ''
  const companyName = String(request.data?.companyName || '').trim()
  const slug = String(request.data?.slug || '').trim().toLowerCase()
  const planKey = PLAN_LIMITS[request.data?.plan] ? request.data.plan : 'starter'

  if (!companyName) throw new HttpsError('invalid-argument', 'Company name is required.')
  if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug)) {
    throw new HttpsError('invalid-argument', 'Subdomain must be 3–40 lowercase letters, numbers, or hyphens.')
  }
  if (RESERVED.has(slug)) throw new HttpsError('invalid-argument', 'That subdomain is reserved.')

  // One workspace per account for now.
  const user = await admin.auth().getUser(uid)
  if (user.customClaims?.tenantId) {
    throw new HttpsError('failed-precondition', 'This account already has a workspace.')
  }

  // tenantId == slug at creation; the slug becomes a changeable label later via
  // the slugs/ lookup table, without moving the tenant's data.
  const tenantId = slug
  const slugRef = db.doc(`slugs/${slug}`)
  const tenantRef = db.doc(`tenants/${tenantId}`)

  await db.runTransaction(async (tx) => {
    if ((await tx.get(slugRef)).exists)   throw new HttpsError('already-exists', 'That subdomain is taken.')
    if ((await tx.get(tenantRef)).exists) throw new HttpsError('already-exists', 'That subdomain is taken.')
    tx.set(tenantRef, {
      name: companyName,
      slug,
      status: 'active',
      plan: planKey,
      propertyLimit: PLAN_LIMITS[planKey],
      adminEmail: email,
      ownerUid: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    tx.set(slugRef, { tenantId })
  })

  // Grant owner access. The client must refresh its ID token after this call.
  await admin.auth().setCustomUserClaims(uid, { tenantId, role: 'owner' })

  return { tenantId, slug }
})
