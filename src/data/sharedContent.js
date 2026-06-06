// Shared content — edit once, reflects in all property guidebooks instantly
// In production this is stored in Supabase shared_content table

export const sharedContent = {
  houseRules: {
    sectionKey: 'house_rules',
    title: 'House Rules',
    icon: 'gavel',
    lastUpdated: '2026-05-11T15:42:00Z',
    rules: [
      {
        number: 1,
        icon: 'smoke_free',
        title: 'No Smoking',
        body: 'Smoking of any substance (including vaping) is not allowed anywhere inside or outside the property. A fee of up to $1,000 will be imposed. Any burns on furniture will result in replacement costs.',
      },
      {
        number: 2,
        icon: 'volume_off',
        title: 'Quiet Hours',
        body: 'Quiet hours are from 10:00 PM – 8:00 AM. Excessive noise is not allowed at any hour. The neighborhood has young families — fines of up to $1,000 apply for violations.',
      },
      {
        number: 3,
        icon: 'celebration',
        title: 'No Large Gatherings',
        body: 'Parties or groups of more than 16 people are not allowed on the property without prior written approval from the host.',
      },
      {
        number: 4,
        icon: 'wc',
        title: 'Bathrooms',
        body: 'Do not flush anything other than toilet paper. No feminine hygiene products — many pipes are cast iron and will clog. Fees apply for any damage.',
      },
      {
        number: 5,
        icon: 'report_problem',
        title: 'Damage',
        body: 'Notify us immediately of any damaged or malfunctioning items so we can repair or replace them. Guests are responsible for damage caused during their stay.',
      },
    ],
  },

  legalInfo: {
    sectionKey: 'legal_info',
    title: 'Legal & Important Info',
    icon: 'policy',
    lastUpdated: '2026-05-11T15:42:00Z',
    content: `You are renting a home in a mixed-use residential community. It is incredibly important that you are respectful of the neighbors. Young families live and work in the area you are visiting.

If your intent is to have a party, organize a large gathering, or have a "binge weekend" — this property is not for you.

The City of San Diego strictly enforces rules to ensure vacation rental guests are respectful of their neighbors. The city may impose fines of $1,000 or more for:
• Excessive noise
• Public intoxication
• Disturbing the peace
• Parking violations

You will be held fully liable for any fines issued by the city, along with any attorney costs of the host.

QUIET HOURS: 10:00 PM – 8:00 AM

Contact Information:
Owner: Joe Saari
Phone: +1 (608) 239-3574
Email: saari.joseph@gmail.com
Emergency (Police / Medical / Fire): 911`,
  },

  thingsToKnow: {
    sectionKey: 'things_to_know',
    title: 'Things to Know',
    icon: 'info',
    lastUpdated: '2026-05-11T15:42:00Z',
    items: [
      { icon: 'smoke_free', text: 'No smoking of any type — including vaping — anywhere on the property.' },
      { icon: 'celebration', text: 'No parties or gatherings of more than 16 people without prior written approval.' },
      { icon: 'volume_off', text: 'Quiet hours 10 PM–8 AM. Excessive noise at any hour is not permitted.' },
      { icon: 'local_fire_department', text: 'Fire extinguisher under the kitchen sink. First aid kit in the bathroom cabinet.' },
      { icon: 'ac_unit', text: 'Please set AC to 75°F (24°C) when leaving and turn off all lights.' },
      { icon: 'lock', text: 'Lock all doors and windows whenever you leave and upon departure.' },
    ],
  },

  checkoutInstructions: {
    sectionKey: 'checkout_instructions',
    title: 'Check-Out Instructions',
    icon: 'logout',
    lastUpdated: '2026-05-11T15:42:00Z',
    checkoutTime: '11:00 AM',
    note: 'If you know you may leave sooner, please let us know so the cleaning crew can plan accordingly.',
    steps: [
      { icon: 'bed', text: 'Place all used towels, linens, sheets, and dishcloths on the floor so the cleaning crew knows which were used.' },
      { icon: 'dishwasher_gen', text: 'Clean all dishes before you go — putting them in the dishwasher and running it is fine.' },
      { icon: 'delete', text: 'Empty all indoor trash cans and put garbage in the bins outside.' },
      { icon: 'kitchen', text: 'Empty the fridge of all open and perishable food products.' },
      { icon: 'lightbulb', text: 'Turn off all lights, appliances, and electronics.' },
      { icon: 'lock', text: 'Close and lock ALL doors and windows before leaving.' },
      { icon: 'message', text: 'Please send us a message upon departure — we appreciate it!' },
    ],
  },

  gettingAround: {
    sectionKey: 'getting_around',
    title: 'Getting Around',
    icon: 'directions',
    lastUpdated: '2026-05-11T15:42:00Z',
    options: [
      {
        icon: 'directions_walk',
        title: 'On Foot',
        body: 'The surrounding Mission Hills neighborhood is enjoyable to walk. Starbucks, local coffee shops, and restaurants are within a 5–15 minute walk.',
      },
      {
        icon: 'directions_bus',
        title: 'By Bus / Trolley',
        body: 'Metropolitan Transit System (MTS) serves the area well. Maps and schedules at sdmts.com. The trolley at Old Town Transit Center (10 min drive) connects to downtown.',
      },
      {
        icon: 'directions_car',
        title: 'By Car / Rideshare',
        body: 'Many attractions are 10–20 min by car. Parking in Mission Bay, Gaslamp, Little Italy and other areas can be challenging — Uber/Lyft is recommended for nights out.',
      },
    ],
  },
}

export const SHARED_SECTION_KEYS = ['houseRules', 'legalInfo', 'thingsToKnow', 'checkoutInstructions', 'gettingAround']

export const SHARED_SECTION_LABELS = {
  houseRules: 'House Rules',
  legalInfo: 'Legal & Important Info',
  thingsToKnow: 'Things to Know',
  checkoutInstructions: 'Check-Out Instructions',
  gettingAround: 'Getting Around',
}
