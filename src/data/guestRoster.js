// ─────────────────────────────────────────────────────────────────────────────
// Guest roster merge engine (read-only)
//
// Both the admin "Check-In Records" and "Guest Database" views build on this so
// they never disagree. Nothing here mutates Firestore — rosters are computed
// live from the raw v2_checkins / v2_checkouts records every render.
//
// Data sources per person:
//   • Primary booker record  → first, last, email, phone (no age)
//   • coGuests[] on that record (typed by the primary) → first, last, age
//   • Guest self-check-in records → first, last, email (guests aren't asked phone)
//
// Matching: a guest self-check-in is merged into the person the primary listed
// by FIRST name; if several share a first name, narrow by LAST name; if first
// AND last are identical, the earliest-entered match is filled (okay to be
// occasionally wrong — an accepted edge case). Only blank fields are filled,
// existing data is never overwritten.
//
// Assumption: at most one primary booking is active per property at a time, so a
// guest self-check-in is attached to that property's active stay without the
// guest naming their booker. If stays somehow overlap, the guest attaches to the
// stay whose window contains their submit time, else the most recent active one.
// ─────────────────────────────────────────────────────────────────────────────

const norm = (s) => (s || '').trim().toLowerCase()
const ts   = (v) => { const t = new Date(v || 0).getTime(); return isNaN(t) ? 0 : t }

// New records carry checkinRole; legacy ones don't, so fall back to whether a
// primaryGuestName was recorded (that was the old "submitter is primary" shape).
function isPrimaryRecord(r) {
  if (r.checkinRole === 'primary') return true
  if (r.checkinRole === 'guest') return false
  return norm(r.primaryGuestName) !== ''
}

// Latest checkout timestamp for a given primary booker + property.
function latestCheckout(checkouts, primaryName, slug) {
  const key = norm(primaryName)
  const matching = checkouts.filter(c => norm(c.primaryGuestName) === key && c.propertySlug === slug)
  return matching.length ? Math.max(...matching.map(c => ts(c.checkedOutAt))) : 0
}

function person(firstName, lastName, opts = {}) {
  const { email = '', phone = '', age = null, role = 'coguest', signedIn = false, checkedInAt = null, docId = null } = opts
  return {
    firstName: (firstName || '').trim(),
    lastName:  (lastName  || '').trim(),
    email:     (email || '').trim(),
    phone:     (phone || '').trim(),
    age:       (age === null || age === undefined || age === '') ? null : age,
    role, signedIn, checkedInAt, docId,
  }
}

// Fill only blank fields on target from src — never overwrite existing data.
function fillBlanks(target, src) {
  if (!target.email && src.email) target.email = src.email
  if (!target.phone && src.phone) target.phone = src.phone
  if (!target.lastName && src.lastName) target.lastName = src.lastName
  if (target.age === null && src.age !== null) target.age = src.age
}

// Find the roster person a guest self-check-in should merge into (see header).
function findMatch(roster, g) {
  const fn = norm(g.firstName)
  let candidates = roster.filter(p => p.role !== 'primary' && norm(p.firstName) === fn)
  if (candidates.length === 0) return null
  if (candidates.length > 1 && norm(g.lastName)) {
    const byLast = candidates.filter(p => norm(p.lastName) === norm(g.lastName) || !p.lastName)
    if (byLast.length) candidates = byLast
  }
  return candidates.find(p => !p.email) || candidates[0]
}

const splitName = (full, part) => {
  const bits = (full || '').trim().split(/\s+/)
  return part === 'first' ? (bits[0] || '') : bits.slice(1).join(' ')
}

/**
 * Build merged booking groups from raw records.
 * Returns: [{ key, primaryName, propertySlug, propertyName, checkinTs,
 *             checkoutTs, active, orphan, roster: [person, …] }]
 */
export function buildGuestGroups(checkins, checkouts) {
  const primaries = checkins.filter(isPrimaryRecord)
  const guests    = checkins.filter(r => !isPrimaryRecord(r))

  // One group per primary booker name + property
  const groupMap = new Map()
  for (const p of primaries) {
    const key = `${norm(p.primaryGuestName || p.guestName)}|${p.propertySlug || ''}`
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key).push(p)
  }

  const groups = []
  for (const [key, recs] of groupMap.entries()) {
    const lead = [...recs].sort((a, b) => ts(b.submittedAt) - ts(a.submittedAt))[0]
    const slug = lead.propertySlug || ''
    const primaryName = (lead.primaryGuestName || lead.guestName || 'Unknown').trim()
    const checkinTs = Math.max(...recs.map(r => ts(r.submittedAt)))
    const coTs = latestCheckout(checkouts, primaryName, slug)
    const checkedOut = coTs > 0 && coTs > checkinTs

    const roster = [
      person(
        lead.firstName || splitName(lead.guestName, 'first'),
        lead.lastName  || splitName(lead.guestName, 'last'),
        { email: lead.email, phone: lead.phone, role: 'primary', signedIn: true, checkedInAt: lead.submittedAt, docId: lead.id },
      ),
    ]
    for (const cg of (lead.coGuests || [])) {
      roster.push(person(cg.firstName, cg.lastName, {
        age: (cg.age === 0 || cg.age) ? cg.age : null,
        role: 'coguest', signedIn: false, checkedInAt: lead.submittedAt,
      }))
    }

    groups.push({
      key, primaryName, propertySlug: slug, propertyName: lead.propertyName || slug,
      checkinTs, checkoutTs: checkedOut ? coTs : null, active: !checkedOut, orphan: false, roster,
    })
  }

  // Attach guest self-check-ins to the right group, merging by name.
  const orphans = new Map()
  for (const g of guests) {
    const slug = g.propertySlug || ''
    const gts = ts(g.submittedAt)
    const cands = groups.filter(gr => gr.propertySlug === slug)
    let target = cands.find(gr => gr.checkinTs <= gts && (gr.checkoutTs == null || gts <= gr.checkoutTs))
      || cands.filter(gr => gr.active).sort((a, b) => b.checkinTs - a.checkinTs)[0]
      || cands.sort((a, b) => b.checkinTs - a.checkinTs)[0]

    const guestPerson = person(g.firstName, g.lastName, { email: g.email, phone: g.phone, role: 'guest', signedIn: true, checkedInAt: g.submittedAt, docId: g.id })

    if (target) {
      const match = findMatch(target.roster, g)
      if (match) {
        match.signedIn = true
        if (!match.checkedInAt) match.checkedInAt = g.submittedAt
        if (!match.docId) match.docId = g.id
        fillBlanks(match, guestPerson)
      } else {
        target.roster.push(guestPerson)
      }
    } else {
      const okey = `__orphan__|${slug}`
      if (!orphans.has(okey)) {
        orphans.set(okey, {
          key: okey, primaryName: '', propertySlug: slug, propertyName: g.propertyName || slug,
          checkinTs: gts, checkoutTs: null, active: true, orphan: true, roster: [],
        })
      }
      const og = orphans.get(okey)
      const match = findMatch(og.roster, g)
      if (match) fillBlanks(match, guestPerson)
      else og.roster.push(guestPerson)
    }
  }

  return [...groups, ...orphans.values()]
}

/** Flat per-person rows for the Guest Database (everyone, every group). */
export function buildGuestDatabaseRows(checkins, checkouts) {
  const groups = buildGuestGroups(checkins, checkouts)
  const rows = []
  for (const gr of groups) {
    for (const p of gr.roster) {
      rows.push({
        docId:        p.docId,
        firstName:    p.firstName,
        lastName:     p.lastName,
        email:        p.email,
        phone:        p.phone,
        age:          p.age,
        role:         p.role,
        signedIn:     p.signedIn,
        primaryName:  gr.primaryName,
        propertySlug: gr.propertySlug,
        propertyName: gr.propertyName,
        checkedInAt:  p.checkedInAt || (gr.checkinTs ? new Date(gr.checkinTs).toISOString() : null),
        checkedOutAt: gr.checkoutTs ? new Date(gr.checkoutTs).toISOString() : null,
      })
    }
  }
  return rows.sort((a, b) => ts(b.checkedInAt) - ts(a.checkedInAt))
}

/** Is there an active (not-yet-checked-out) stay for this primary + property? */
export function isStayActive(checkins, checkouts, primaryName, slug) {
  const key = norm(primaryName)
  const mine = checkins.filter(r => norm(r.primaryGuestName) === key && r.propertySlug === slug)
  if (!mine.length) return false
  const latestCheckin = Math.max(...mine.map(r => ts(r.submittedAt)))
  const co = latestCheckout(checkouts, primaryName, slug)
  return !(co > 0 && co > latestCheckin)
}
