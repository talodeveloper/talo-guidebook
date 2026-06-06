// Property-specific FAQ data derived from guest communication patterns.
// Top 13 universally-asked questions, with answers customised per property.

const FAQ_SHARED = {
  smoking: {
    q: 'Is smoking allowed anywhere on the property?',
    reynard: 'No — smoking is strictly prohibited indoors and outdoors. A $1,000 cleaning fee applies for any violation, and burns on furniture will result in full replacement costs.',
    hawk: 'No — smoking is not permitted anywhere on the property, including the balcony and outdoor areas. A $1,000 cleaning fee applies for violations.',
  },
  quiet: {
    q: 'What are the quiet hours?',
    reynard: 'Quiet hours are 10 PM – 8 AM. We\'re in a residential neighborhood and neighbors take this seriously — City of San Diego noise violations can result in fines over $1,000 passed on to guests.',
    hawk: 'Quiet hours are 10 PM – 8 AM. Please use the first-floor entrance as your primary entrance to minimise noise for surrounding neighbors.',
  },
  contact: {
    q: 'Who do we contact if something breaks or we need help?',
    reynard: 'Contact your host Joe Saari anytime — phone/text: +1 (608) 239-3574, or email saari.joseph@gmail.com. For emergencies, call 911.',
    hawk: 'Reach Joe Saari anytime by phone/text at +1 (608) 239-3574 or email saari.joseph@gmail.com. For emergencies, call 911.',
  },
  capacity: {
    q: 'How many guests can stay overnight?',
    reynard: 'Up to 16 registered guests may stay overnight. Unregistered guests may not stay the night, and total guests on the property at any time should not exceed 16.',
    hawk: 'Up to 16 registered guests overnight. Unregistered guests may not stay the night, and the total number of people on the property at once should not exceed 16.',
  },
  visitors: {
    q: 'Can we have extra daytime visitors not on the reservation?',
    reynard: 'Daytime visitors are welcome, but total people on the property — guests plus visitors — may never exceed 16 at any time. Overnight stays are restricted to registered guests only.',
    hawk: 'Yes, daytime visitors are fine. The combined total of guests and visitors must stay at or below 16 at all times. No unregistered overnight stays.',
  },
  location: {
    q: 'How far is the property from the beach and downtown San Diego?',
    reynard: 'Downtown San Diego is ~10 minutes by car, Mission Bay and Mission Beach are 15–20 minutes, and Balboa Park is just 5 minutes. Little Italy is an easy 15-minute walk.',
    hawk: 'Downtown is about 10 minutes by car, beaches are 15–20 minutes, and Mission Hills restaurants, coffee shops, and bars are within a 5–10 minute walk right outside your door.',
  },
}

export const FAQ_DATA = {
  'reynard-way': [
    {
      q: 'What time is check-in and check-out?',
      a: 'Check-in is at 4:00 PM and check-out is at 11:00 AM. If you\'d like an early check-in, message the host a few days before arrival — if the home is vacant the prior night, it can often be arranged at no charge.',
    },
    {
      q: 'Is an early check-in or late check-out possible?',
      a: 'Early check-in depends on whether prior guests have departed and cleaning is complete. Contact Joe a few days before your stay. To guarantee it, you can pay to have the night before blocked. Late check-out (after 11 AM) is very difficult when another group arrives that day.',
    },
    {
      q: 'What\'s the Wi-Fi network name and password?',
      a: 'Network: SD Mission Hills — Password: SDOasis3003. It\'s 1 Gbps with extenders throughout the house and outdoor patio area.',
    },
    {
      q: 'How many cars can park at the property?',
      a: 'The carport on Eagle Street has 2 assigned spots and you can double-park your own cars for a 3rd. Street parking on Eagle St. and Reynard Way is also usually available nearby.',
    },
    {
      q: 'Are pets allowed?',
      a: 'Yes! Pets are welcome with a $75 per pet fee per stay. Please clean up after your pet in all outdoor areas.',
    },
    {
      q: FAQ_SHARED.smoking.q,
      a: FAQ_SHARED.smoking.reynard,
    },
    {
      q: FAQ_SHARED.capacity.q,
      a: FAQ_SHARED.capacity.reynard,
    },
    {
      q: 'Is there a hot tub? How do we use it?',
      a: 'Yes! The hot tub is on the back patio and ready to use. Please rinse off any sand before entering, no lotions or glass items in or around the tub, and replace the cover when done to conserve electricity.',
    },
    {
      q: 'What supplies and toiletries are provided?',
      a: 'The kitchen is fully stocked with pots, pans, dishes, cutlery, spices, and cooking oil. Towels, sheets, blankets, paper towels, basic toiletries, toothbrushes, and cleaning supplies are all provided.',
    },
    {
      q: FAQ_SHARED.quiet.q,
      a: FAQ_SHARED.quiet.reynard,
    },
    {
      q: 'What day is trash collection?',
      a: 'Trash day is Wednesday. Three bins are outside by the double doors (2 blue recycling, 1 black trash). They\'re moved to Eagle Street Tuesday evening and returned Wednesday evening.',
    },
    {
      q: FAQ_SHARED.visitors.q,
      a: FAQ_SHARED.visitors.reynard,
    },
    {
      q: FAQ_SHARED.location.q,
      a: FAQ_SHARED.location.reynard,
    },
    {
      q: 'Is laundry available?',
      a: 'Yes — two washer/dryer sets: one in the pantry on the main floor, one on the lowest level. Detergent is provided for both.',
    },
    {
      q: FAQ_SHARED.contact.q,
      a: FAQ_SHARED.contact.reynard,
    },
  ],

  'hawk-street': [
    {
      q: 'What time is check-in and check-out?',
      a: 'Check-in is at 4:00 PM and check-out is at 11:00 AM for both floors. Message the host a few days before arrival if you\'d like to request an early check-in.',
    },
    {
      q: 'Is an early check-in or late check-out possible?',
      a: 'Early check-in depends on prior guests\' departure and cleaning schedule. Reach out to Joe a few days before your arrival and we\'ll do our best to accommodate. Late check-outs after 11 AM are very limited when new guests arrive that day.',
    },
    {
      q: 'What\'s the Wi-Fi network name and password?',
      a: 'Network: KETTLESNEST — Password: 3701&3703. 1 Gbps high-speed internet with extenders covering both floors and outdoor areas.',
    },
    {
      q: 'How many cars can park at the property?',
      a: 'Up to 3 cars fit in the driveway: two on the far right side (double-parked) and one on the left. No part of a car may block the sidewalk. Contact Joe for street parking guidance if you have more vehicles.',
    },
    {
      q: 'Are pets allowed?',
      a: 'No — pets are not permitted at this property.',
    },
    {
      q: FAQ_SHARED.smoking.q,
      a: FAQ_SHARED.smoking.hawk,
    },
    {
      q: FAQ_SHARED.capacity.q,
      a: FAQ_SHARED.capacity.hawk,
    },
    {
      q: 'Is there a hot tub or pool?',
      a: 'There is no hot tub or pool at this property. You\'ll enjoy a spacious balcony with BBQ grill, comfortable patio seating, and stunning San Diego sunset views.',
    },
    {
      q: 'What supplies and toiletries are provided?',
      a: 'Both the 1st and 2nd floor kitchens are stocked with cookware, dishes, spices, and cooking oil. Towels, sheets, blankets, and basic toiletries are provided on each floor. Please try to keep kitchen items on their respective floor for the cleaning crew.',
    },
    {
      q: FAQ_SHARED.quiet.q,
      a: FAQ_SHARED.quiet.hawk,
    },
    {
      q: 'What day is trash collection?',
      a: 'Trash day is Wednesday. There are 8 bins total — 4 in the parking area and 4 by the stairs to the upper unit. They\'re moved to the street Tuesday evening and brought back Wednesday evening.',
    },
    {
      q: FAQ_SHARED.visitors.q,
      a: FAQ_SHARED.visitors.hawk,
    },
    {
      q: FAQ_SHARED.location.q,
      a: FAQ_SHARED.location.hawk,
    },
    {
      q: 'Is laundry available on both floors?',
      a: 'Yes — the 1st floor has a full washer/dryer in the laundry room off the half-bathroom. The 2nd floor washer/dryer is on the covered outdoor patio. Detergent is supplied on both floors.',
    },
    {
      q: FAQ_SHARED.contact.q,
      a: FAQ_SHARED.contact.hawk,
    },
  ],

  'jackson-st': [
    {
      q: 'What time is check-in and check-out?',
      a: 'Check-in is at 4:00 PM and check-out is at 11:00 AM. If you\'d like an early check-in or late check-out, please contact Joe at least 24 hours ahead — we\'ll do our best to accommodate based on availability.',
    },
    {
      q: 'Can I get an early check-in or late check-out?',
      a: 'Sometimes! Early check-in and late check-out depend on the cleaning schedule. Message Joe at least 24 hours before your arrival or departure to ask. We can\'t guarantee it, but we try to help when possible.',
    },
    {
      q: 'How do I get the Wi-Fi password?',
      a: 'Wi-Fi credentials are included in your Airbnb check-in message on the day of arrival, and are also posted inside the home. If you can\'t find them, text Joe at +1 (608) 239-3574.',
    },
    {
      q: 'Where can I park at the property?',
      a: 'Free off-street parking is available at the property. Please park fully on-site without blocking the street or sidewalk. Street parking on Jackson St and surrounding Mission Hills streets is also typically available.',
    },
    {
      q: 'Are pets allowed?',
      a: 'Yes — pets are welcome at Jackson Street! Please clean up after your pet in and around the property, and do not leave pets unattended indoors for extended periods. Keep them off the furniture. Contact Joe if you\'re bringing multiple pets.',
    },
    {
      q: FAQ_SHARED.smoking.q,
      a: 'No — smoking is strictly prohibited everywhere on the property, indoors and outdoors, including the outdoor decks. A $1,000 cleaning fee applies for any violation.',
    },
    {
      q: FAQ_SHARED.capacity.q,
      a: 'The maximum occupancy is 16 guests. This applies at all times, including during the day. Please do not exceed this limit.',
    },
    {
      q: 'Is there a pool or hot tub?',
      a: 'There\'s no pool or hot tub at this property. The highlight here is the stunning panoramic views of San Diego Bay and the city skyline from multiple outdoor decks — perfect for morning coffee, sunset cocktails, and evening fire pit gatherings.',
    },
    {
      q: 'What supplies and toiletries are provided?',
      a: 'The kitchen is fully stocked with cookware, dishes, utensils, spices, coffee, and cooking basics. All bedrooms have bed linens, pillows, and extra blankets. Bathrooms are stocked with shampoo, conditioner, shower gel, and towels. Laundry detergent and basic cleaning supplies are also provided.',
    },
    {
      q: FAQ_SHARED.quiet.q,
      a: 'Quiet hours are 10:00 PM – 8:00 AM. Mission Hills is a quiet residential neighborhood and sound carries easily with the open bay views — please be especially mindful of noise levels on the outdoor decks at night.',
    },
    {
      q: 'What day is trash collection?',
      a: 'Trash pickup day and bin locations are included in your check-in message. Please separate recycling (blue or green bins) from general waste (black bins) and place them at the curb the evening before pickup.',
    },
    {
      q: FAQ_SHARED.visitors.q,
      a: 'Daytime visitors are welcome as long as the total number of people on the property — guests plus visitors — never exceeds 16. No unregistered overnight guests.',
    },
    {
      q: 'Where is the property located and what\'s nearby?',
      a: 'Jackson Street is in Mission Hills, one of San Diego\'s most beloved historic neighborhoods — right next to Old Town. You\'re 10–15 min from downtown, Little Italy, Balboa Park, Mission Bay, and the airport. Old Town\'s restaurants and shops are literally steps away.',
    },
    {
      q: 'Is there a safe for valuables?',
      a: 'Yes — there\'s an in-home safe available for securing passports, cash, or other valuables. The combination is included in your check-in message.',
    },
    {
      q: 'Is laundry available?',
      a: 'Yes — a full washer and dryer are available on-site. Laundry detergent is provided in the laundry area.',
    },
    {
      q: FAQ_SHARED.contact.q,
      a: 'Reach Joe Saari anytime by phone/text at +1 (608) 239-3574 or email saari.joseph@gmail.com. We respond quickly. For emergencies, call 911.',
    },
  ],

  'vista-pointe': [
    {
      q: 'What time is check-in and check-out?',
      a: 'Check-in is at 4:00 PM and check-out is at 11:00 AM. If you\'d like an early check-in or late check-out, contact Joe at least 24 hours in advance — we\'ll do our best to accommodate based on availability.',
    },
    {
      q: 'Can I get an early check-in or late check-out?',
      a: 'Early check-in and late check-out are sometimes possible depending on the cleaning schedule. Please message Joe at least 24 hours before your arrival or departure to check — there\'s no guarantee but we do our best.',
    },
    {
      q: 'How do I get the Wi-Fi password?',
      a: 'Wi-Fi details are included in your check-in message sent on the day of arrival, and are also posted inside the home. If you can\'t find them, just text Joe at +1 (608) 239-3574.',
    },
    {
      q: 'Where can I park at the property?',
      a: 'Free off-street parking is available in the driveway with space for multiple vehicles. Please park fully on the property without blocking the street, sidewalk, or neighboring driveways. Additional street parking is available nearby.',
    },
    {
      q: 'Are pets allowed?',
      a: 'Yes — pets are welcome at Vista Pointe! Please clean up after your pet outdoors and do not allow them on the furniture or in the pool area. Contact Joe if you\'re bringing multiple pets.',
    },
    {
      q: FAQ_SHARED.smoking.q,
      a: 'No — smoking is strictly prohibited everywhere on the property, indoors and outdoors. A $1,000 cleaning fee applies for any violations.',
    },
    {
      q: FAQ_SHARED.capacity.q,
      a: 'The maximum occupancy is 16 guests. This includes all adults and children. Please do not exceed this limit — it is set for safety and compliance with county regulations.',
    },
    {
      q: 'How do I use the pool and jacuzzi?',
      a: 'The pool is ready to use as-is. If you\'d like it heated, there\'s a $100/day fee — contact Joe in advance as heating takes 8–10 hours in cooler weather. The jacuzzi is remote-controlled: message or call Joe at least 30 minutes before you\'d like to use it and we\'ll turn it on for you.',
    },
    {
      q: 'Can we heat the pool?',
      a: 'Yes! Pool heating is available for an additional $100/day service fee. Please request it in advance as it takes 8–10 hours to heat fully in winter. Contact Joe as soon as possible to arrange this.',
    },
    {
      q: 'What supplies and toiletries are provided?',
      a: 'The kitchen is fully stocked with cookware, dishes, utensils, spices, coffee, and cooking basics. Bed linens, pillows, and extra blankets are in all bedrooms. Shampoo, conditioner, shower gel, and basic toiletries are in the bathrooms. Cleaning products and laundry detergent are also provided.',
    },
    {
      q: FAQ_SHARED.quiet.q,
      a: 'Quiet hours are 10:00 PM – 8:00 AM. Bonita is a peaceful residential community — please be considerate of neighbors, especially around the pool and outdoor areas at night.',
    },
    {
      q: 'What day is trash collection?',
      a: 'Trash pickup day and bin locations will be detailed in your check-in message. Generally, bins should be placed at the curb the evening before pickup day. Please separate recycling (blue bins) from general trash (black bins).',
    },
    {
      q: FAQ_SHARED.visitors.q,
      a: 'Only registered guests may be on the property overnight. Daytime visitors (during reasonable hours) are allowed up to the maximum occupancy of 16 total people on the property at any time.',
    },
    {
      q: 'Where is the property located and what\'s nearby?',
      a: 'Vista Pointe is in Bonita, CA — a quiet hilltop community about 20 minutes south of downtown San Diego, 15 minutes from Coronado, and 20 minutes from the US-Mexico border. Sweetwater Summit Regional Park is minutes away, and Chula Vista, National City, and the San Diego Bayfront are all easily accessible.',
    },
    {
      q: 'Is laundry available?',
      a: 'Yes — a washer and dryer are available on-site. Laundry detergent is provided. You\'ll find the laundry area inside the home (details in your check-in message).',
    },
    {
      q: FAQ_SHARED.contact.q,
      a: 'Reach Joe Saari anytime by phone/text at +1 (608) 239-3574 or email saari.joseph@gmail.com. For pool/jacuzzi requests, please message as early as possible. For emergencies, call 911.',
    },
  ],
}
