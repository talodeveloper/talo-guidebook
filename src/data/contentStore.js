// Block-based content model.
// type: 'shared'   → applies to all properties (shared first in render order)
// type: 'property' → applies only to propertySlug
//
// Within a section: shared blocks render before property-specific blocks.
// order field controls sort within each type group.

import { getTenantId, DEFAULT_TENANT_ID } from './tenant'

let _blocks = [

  // ─── WELCOME ──────────────────────────────────────────────────────────────

  {
    id: 'welcome-reynard-msg',
    sectionKey: 'welcome',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Welcome to Reynard Way',
    body: `<p>We hope you enjoy your stay in one of the most vibrant, historical, and central parts of San Diego! This guidebook contains everything you need to know about the property and surrounding area.</p><p>Thank you for choosing us as your host!</p>`,
    images: [{ src: '/photos/reynard-way/p2_img1_2007x1505.jpeg', caption: '3003 Reynard Way' }],
    order: 1,
  },
  {
    id: 'welcome-hawk-msg',
    sectionKey: 'welcome',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Welcome to Hawk Street',
    body: `<p>We hope you enjoy your stay in one of the most vibrant, historical, and central areas of San Diego! This duplex features two fully-equipped floors, each with their own living areas, kitchens, and beautiful spaces.</p><p>Thank you for choosing us as your host!</p>`,
    images: [{ src: '/photos/hawk-street/p2_img1_2007x1505.jpeg', caption: '3701-03 Hawk Street' }],
    order: 1,
  },

  // ─── HOW TO ENTER ─────────────────────────────────────────────────────────

  {
    id: 'entry-reynard',
    sectionKey: 'entry',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Entering Reynard Way',
    body: `<ol><li>The main entrance is on Reynard Way — up a small set of stairs to the right.</li><li>Your door code will be sent to you on the day of check-in.</li><li>Enter the 4-digit code on the keypad — no button to press after.</li><li>The lock pad will flash green when the code is accepted.</li></ol>`,
    images: [{ src: '/photos/reynard-way/p7_img1_720x480.png', caption: 'Main entrance — keypad lock' }],
    order: 1,
  },
  {
    id: 'entry-hawk',
    sectionKey: 'entry',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Entering Hawk Street',
    body: `<ol><li>First floor entrance: right side of the home, digital lock.</li><li>Second floor entrance: top of the far-left stairs, digital lock.</li><li>Your door codes will be sent to you on the day of check-in.</li><li>Enter the 4-digit code — no button press needed after.</li><li>Lock flashes green when accepted.</li><li>Please use the lower entrance as your primary entrance to minimize noise for neighbors.</li></ol>`,
    images: [
      { src: '/photos/hawk-street/p7_img1_1108x740.jpeg', caption: 'First floor entrance' },
      { src: '/photos/hawk-street/p8_img1_1272x850.jpeg', caption: 'Second floor entrance' },
    ],
    order: 1,
  },

  // ─── PARKING ──────────────────────────────────────────────────────────────

  {
    id: 'parking-reynard',
    sectionKey: 'parking',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Parking at Reynard Way',
    body: `<ul><li>Your assigned parking is in the carport behind the house on Eagle Street — the first driveway on your right.</li><li>The carport has 2 assigned spots. You can also double-park behind your own cars for a 3rd spot.</li><li>For unloading, pull up in front of the house on Reynard Way.</li><li>Street parking is also available on Eagle St. and Reynard Way.</li><li>One spot directly in front of the house (curb cut) — not officially reserved but often available.</li></ul>`,
    images: [{ src: '/photos/reynard-way/p6_img1_840x560.png', caption: 'Carport behind the house on Eagle St.' }],
    order: 1,
  },
  {
    id: 'parking-hawk',
    sectionKey: 'parking',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Parking at Hawk Street',
    body: `<ul><li>Maximum of 3 vehicles in the driveway.</li><li>Pull the first car as far right as possible, then double-park the second behind it.</li><li>With 2 cars on the right side, a 3rd car can fit on the left.</li><li>No portion of your car should block the sidewalk.</li><li>If you have more than 3 cars, contact the host for legal street parking tips.</li></ul>`,
    images: [{ src: '/photos/hawk-street/p6_img1_1272x850.jpeg', caption: 'Driveway parking — up to 3 vehicles' }],
    order: 1,
  },

  // ─── WI-FI ────────────────────────────────────────────────────────────────

  {
    id: 'wifi-reynard',
    sectionKey: 'wifi',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Wi-Fi — Reynard Way',
    body: `<p><strong>Network:</strong> SD Mission Hills<br/><strong>Password:</strong> SDOasis3003</p><p>1Gbps high-speed internet with Wi-Fi extenders throughout the house and outdoor areas.</p>`,
    images: [],
    order: 1,
  },
  {
    id: 'wifi-hawk',
    sectionKey: 'wifi',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Wi-Fi — Hawk Street',
    body: `<p><strong>Network:</strong> KETTLESNEST<br/><strong>Password:</strong> 3701&3703</p><p>1Gbps high-speed internet with Wi-Fi extenders throughout both floors and outdoor areas.</p>`,
    images: [],
    order: 1,
  },

  // ─── HOUSE RULES ──────────────────────────────────────────────────────────

  {
    id: 'rules-smoking',
    sectionKey: 'house_rules',
    type: 'shared',
    propertySlug: null,
    title: 'No Smoking',
    body: `<p>No smoking anywhere on the property — including cigarettes, cigars, vapes, cannabis, and any other smoking devices. This applies indoors and outdoors.</p><p>A <strong>$1,000 cleaning fee</strong> applies for any violation. Any burns on furniture will result in full replacement cost plus a fine.</p>`,
    images: [],
    order: 1,
  },
  {
    id: 'rules-quiet-hours',
    sectionKey: 'house_rules',
    type: 'shared',
    propertySlug: null,
    title: 'Quiet Hours & Noise',
    body: `<p>Quiet hours are from <strong>10 PM to 8 AM</strong>. Please be respectful of neighbors at all times — we are in a residential neighborhood.</p><p>Noise violations reported by neighbors to the City of San Diego can result in <strong>fines up to $1,000 or more</strong>. These fines will be passed on to the guest. Please take this seriously.</p>`,
    images: [],
    order: 2,
  },
  {
    id: 'rules-gatherings',
    sectionKey: 'house_rules',
    type: 'shared',
    propertySlug: null,
    title: 'Occupancy & Gatherings',
    body: `<p>No gatherings exceeding <strong>16 guests</strong> on the property at any time. Only registered guests may stay overnight. Unregistered guests are not permitted to stay the night.</p>`,
    images: [],
    order: 3,
  },
  {
    id: 'rules-plumbing',
    sectionKey: 'house_rules',
    type: 'shared',
    propertySlug: null,
    title: 'Plumbing',
    body: `<p>Please do not flush anything other than toilet paper down the toilets — no wet wipes, paper towels, or similar items. Violations resulting in plumbing damage will be charged to the guest.</p>`,
    images: [],
    order: 4,
  },
  {
    id: 'rules-damage',
    sectionKey: 'house_rules',
    type: 'shared',
    propertySlug: null,
    title: 'Damage Policy',
    body: `<p>Guests are responsible for any damage beyond normal wear and tear. Please report any accidental damage to the host as soon as possible. We appreciate honesty and will work with you in good faith.</p>`,
    images: [],
    order: 5,
  },
  {
    id: 'rules-security',
    sectionKey: 'house_rules',
    type: 'shared',
    propertySlug: null,
    title: 'Security & Cameras',
    body: `<p>Lock all doors and windows when leaving the property. Security cameras are located at <strong>exterior entry points only</strong> — there are no cameras inside the home.</p>`,
    images: [],
    order: 6,
  },
  {
    id: 'rules-contact',
    sectionKey: 'house_rules',
    type: 'shared',
    propertySlug: null,
    title: 'Contact & Emergency Info',
    body: `<p><strong>Your Host:</strong> Joe Saari<br/><strong>Phone/Text:</strong> +1 (608) 239-3574<br/><strong>Email:</strong> saari.joseph@gmail.com</p><p><strong>Emergency:</strong> Call 911</p><p>This property operates under a valid short-term rental permit issued by the City of San Diego. Guests agree to comply with all local ordinances regarding noise, occupancy, and parking.</p>`,
    images: [],
    order: 7,
  },
  {
    id: 'rules-pets-reynard',
    sectionKey: 'house_rules',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Pet Policy',
    body: `<p>Pets are <strong>welcome</strong> at this property! A fee of <strong>$75 per pet</strong> applies per stay. Please clean up after your pet in all outdoor areas.</p>`,
    images: [],
    order: 1,
  },
  {
    id: 'rules-pets-hawk',
    sectionKey: 'house_rules',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Pet Policy',
    body: `<p><strong>No pets</strong> are permitted at this property.</p>`,
    images: [],
    order: 1,
  },

  // ─── THE HOME ─────────────────────────────────────────────────────────────

  // Reynard Way
  {
    id: 'space-reynard-bedrooms',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Beds & Bedrooms',
    body: `<p><strong>5 Queen Beds</strong> — 3 upstairs, 2 downstairs.<br/><strong>3 Full Beds</strong> — 2 in the master bedroom upstairs, 1 Murphy bed in the studio.<br/><strong>4 Sofa Beds</strong> — 2 queen sofa beds in the main living room, 1 in the lower level common area, 1 full futon in the studio.</p>`,
    images: [
      { src: '/photos/reynard-way/p9_img1_504x336.png', caption: 'Bedroom 1 — Queen Bed' },
      { src: '/photos/reynard-way/p9_img2_504x336.png', caption: 'Bedroom 2 — Queen Bed' },
      { src: '/photos/reynard-way/p9_img3_504x336.png', caption: 'Bedroom 3 — Queen Bed' },
      { src: '/photos/reynard-way/p9_img4_504x334.png', caption: 'Bedroom 4 — Full Beds (Master)' },
    ],
    order: 1,
  },
  {
    id: 'space-reynard-bathrooms',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Bathrooms',
    body: `<p><strong>4 Full Bathrooms:</strong> 2 upstairs · 1 in the studio (main floor) · 1 downstairs.<br/><strong>1 Half Bathroom</strong> off the kitchen on the main floor.</p>`,
    images: [],
    order: 2,
  },
  {
    id: 'space-reynard-living',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Living Room & Dining',
    body: `<p>Plenty of seating and a smart TV are available. A <strong>pool table</strong> that converts to a <strong>ping pong table</strong> is in a large space adjacent to the seating area. Glass double doors lead to the hot tub and outdoor patio.</p><p>The dining room is confluent with the kitchen. A large wood table with benches seats 8–10 people. A highchair is available in the pantry. Soundproofing on walls.</p>`,
    images: [
      { src: '/photos/reynard-way/p10_img1_600x396.png', caption: 'Living Room — Pool Table & Seating' },
      { src: '/photos/reynard-way/p10_img2_600x397.png', caption: 'Dining Room — Seats 8–10' },
    ],
    order: 3,
  },
  {
    id: 'space-reynard-kitchen',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Kitchen & Supplies',
    body: `<p>The kitchen is stocked with basic cooking supplies: pots and pans, dishes, cutlery, a variety of spices, and cooking oil. Within the kitchen or pantry, you may use any dry goods or other items provided.</p><p>You will find sufficient towels, sheets, blankets, basic toiletries, paper towels, and basic cleaning supplies. Toothbrushes, toothpaste, and makeup remover are also provided.</p>`,
    images: [{ src: '/photos/reynard-way/p11_img1_840x557.png', caption: 'Kitchen — Fully Stocked' }],
    order: 4,
  },
  {
    id: 'space-reynard-laundry',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Laundry',
    body: `<p>Two washer/dryer sets are available: one in the pantry on the main floor, one on the lowest level. Detergent is provided.</p>`,
    images: [],
    order: 7,
  },

  // ─── ADDITIONAL SPACE (Reynard Way — Studio) ──────────────────────────────

  {
    id: 'space-reynard-studio',
    sectionKey: 'additional_space',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'The Studio',
    body: `<p>The Studio is adjacent to the dining room on the main level. It has its own separate bathroom and a full-size <strong>Murphy bed</strong>. The shades are motorized with a remote control. A ceiling-mounted TV with motorized arm is included. Portable heater and AC unit available.</p><p><em>Note: The studio is included in the 7BR configuration. It is not included in the 6BR option.</em></p>`,
    images: [
      { src: '/photos/reynard-way/p12_img1_504x336.png', caption: 'Studio — Murphy Bed' },
      { src: '/photos/reynard-way/p12_img2_504x335.png', caption: 'Studio — Seating Area' },
      { src: '/photos/reynard-way/p12_img3_600x398.png', caption: 'Studio — Bathroom' },
      { src: '/photos/reynard-way/p12_img4_504x336.png', caption: 'Studio — Kitchenette' },
    ],
    order: 5,
  },
  {
    id: 'studio-remote-controls',
    sectionKey: 'additional_space',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Studio Remote Controls',
    body: `<p>The studio has several remotes — here's what each one does:</p><ul><li><strong>Motorized Shades:</strong> Ch 1–4 control each shade individually; Ch 5 controls all shades at once. There is also a white button on the upper right of each shade panel as a manual backup.</li><li><strong>Ceiling TV:</strong> Use the Up/Down arrows on the remote to raise or lower the TV arm to your preferred viewing height.</li><li><strong>Heater & AC:</strong> Each unit has its own dedicated remote on the shelf.</li></ul>`,
    images: [{ src: '/photos/reynard-way/p13_img1_433x1223.jpeg', caption: 'Studio Remote Controls' }],
    order: 6,
  },
  {
    id: 'studio-murphy-bed',
    sectionKey: 'additional_space',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Murphy Bed Instructions',
    body: `<p><strong>To set up the Murphy bed:</strong></p><ol><li>Pull the two silver rails on the sides of the cabinet downward to unlock.</li><li>Lower the bed down fully until it rests flat.</li><li>Fold down the black metal rod at the top — this acts as the mattress base support.</li></ol><p><strong>To put it away:</strong></p><ol><li>Make the bed neatly and tuck in the sheets.</li><li>Toss pillows and extra blankets into the cabinet above.</li><li>Fold up the metal support rod.</li><li>Push the mattress back up into the wall until it clicks into place.</li></ol>`,
    images: [],
    order: 7,
  },

  // ─── OUTDOOR SPACES ───────────────────────────────────────────────────────

  {
    id: 'space-reynard-outdoor',
    sectionKey: 'outdoor_spaces',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Outdoor Spaces',
    body: `<p>Front yard with seating and an umbrella for shade. Large back patio with sectional couches, a table, chairs, benches, and four solar umbrellas.</p>`,
    images: [
      { src: '/photos/reynard-way/p14_img2_600x399.png', caption: 'Back Patio — Sectional Seating' },
    ],
    order: 1,
  },
  {
    id: 'space-reynard-hot-tub',
    sectionKey: 'outdoor_spaces',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Hot Tub',
    body: `<p>You are welcome to enjoy the hot tub! Please follow these rules to keep it clean and safe for everyone:</p><ul><li><strong>Rinse off</strong> any sand from your body and feet before entering — especially after a beach day.</li><li><strong>No lotions, oils, or sunscreen</strong> in or around the tub — these damage the filtration system.</li><li><strong>No glass items</strong> of any kind in the hot tub area.</li><li><strong>No food or drink</strong> inside the tub itself.</li><li><strong>Replace the cover</strong> when you are done — this conserves electricity and keeps the water clean.</li></ul>`,
    images: [
      { src: '/photos/reynard-way/p14_img1_576x397.png', caption: 'Hot Tub' },
    ],
    order: 2,
  },
  {
    id: 'space-hawk-outdoor',
    sectionKey: 'outdoor_spaces',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Outdoor Spaces',
    body: `<p>The house features a spacious balcony with a cozy patio equipped with comfortable chairs and a <strong>BBQ grill</strong>, perfect for enjoying San Diego's stunning sunsets.</p>`,
    images: [
      { src: '/photos/hawk-street/p16_img1_831x555.jpeg', caption: 'Balcony — BBQ & Patio Seating' },
      { src: '/photos/hawk-street/p16_img2_1272x850.jpeg', caption: 'Outdoor Patio — Sunset Views' },
      { src: '/photos/hawk-street/p16_img3_831x555.jpeg', caption: 'BBQ Grill' },
      { src: '/photos/hawk-street/p16_img4_1272x850.jpeg', caption: 'Covered Patio & Laundry' },
    ],
    order: 7,
  },

  // ─── SERVICES & MAINTENANCE ───────────────────────────────────────────────

  {
    id: 'space-reynard-trash',
    sectionKey: 'services_maintenance',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Trash & Recycling',
    body: `<p>Three bins are located outside the double doors near the pool/ping pong table: two blue bins (recycling) and one black bin (trash).</p><p><strong>Trash day is Wednesday.</strong> Bins are moved to the street Tuesday evening and returned Wednesday evening.</p>`,
    images: [],
    order: 8,
  },
  {
    id: 'space-hawk-trash',
    sectionKey: 'services_maintenance',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Trash & Recycling',
    body: `<p>8 bins total — 4 in the parking area, 4 in front of the stairs to the upper unit. Blue bins for recycling, black bins for trash.</p><p><strong>Trash day is Wednesday.</strong> Bins are moved Tuesday evening and returned Wednesday evening.</p>`,
    images: [],
    order: 9,
  },

  // ─── THE HOME — Hawk Street ───────────────────────────────────────────────

  {
    id: 'space-hawk-bedrooms-1f',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'First Floor Bedrooms',
    body: `<ul><li><strong>Bedroom 1:</strong> 1 Queen Bed</li><li><strong>Bedroom 2:</strong> 1 King Bed</li><li><strong>Bedroom 3:</strong> 1 Full Bed</li><li><strong>Bedroom 4:</strong> 2 Full Beds (Bunk Beds) + 1 Single Trundle</li><li><strong>TV Room:</strong> 1 Sofa Bed</li></ul><p><strong>Bathrooms (1F):</strong> 2 full bathrooms in the hall · 1 half bathroom near the laundry room.</p>`,
    images: [
      { src: '/photos/hawk-street/p10_img2_848x567.jpeg', caption: 'Bedroom — Queen Bed' },
      { src: '/photos/hawk-street/p10_img3_848x567.jpeg', caption: 'Bedroom — Queen Bed' },
      { src: '/photos/hawk-street/p10_img1_848x567.jpeg', caption: 'Bedroom 4 — Bunk Beds' },
    ],
    order: 1,
  },
  {
    id: 'space-hawk-bedrooms-2f',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Second Floor Bedrooms',
    body: `<ul><li><strong>Bedroom 1:</strong> 1 Queen Bed</li><li><strong>Bedroom 2:</strong> 1 Queen Bed</li><li><strong>Bedroom 3:</strong> 2 Queen Beds</li><li><strong>Main Living Room:</strong> 2 Queen Size Sofa Beds</li></ul><p><strong>Bathrooms (2F):</strong> 2 full bathrooms in the hallway across from the bedrooms.</p>`,
    images: [
      { src: '/photos/hawk-street/p13_img3_848x567.jpeg', caption: '2F Bedroom — Queen Bed' },
      { src: '/photos/hawk-street/p13_img4_848x567.jpeg', caption: '2F Bedroom — 2 Queen Beds' },
    ],
    order: 2,
  },
  {
    id: 'space-hawk-living-1f',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'First Floor Living Room & Dining',
    body: `<p>Boasting stunning views of beautiful San Diego, the living room contains plenty of seating and a Smart TV. There is a spacious couch that can be converted into a large sofa bed.</p><p><strong>Features:</strong> Pool Table · Ping Pong Table · Foosball Table · Access to Balcony · Smart TV</p><p>The dining table seats 8 and converts to a pool/ping pong table. A highchair is available in the pantry.</p>`,
    images: [
      { src: '/photos/hawk-street/p11_img1_848x567.jpeg', caption: '1F Living Room — Smart TV & Sofa Bed' },
      { src: '/photos/hawk-street/p11_img2_1272x850.jpeg', caption: '1F Dining — Seats 8' },
    ],
    order: 3,
  },
  {
    id: 'space-hawk-kitchen-1f',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'First Floor Kitchen & Supplies',
    body: `<p>The kitchen is stocked with basic cooking supplies: pots and pans, dishes, cutlery, a variety of spices, and cooking oil. Sufficient towels, sheets, blankets, and basic toiletries are also provided.</p>`,
    images: [{ src: '/photos/hawk-street/p12_img1_1108x740.jpeg', caption: '1F Kitchen — Fully Stocked' }],
    order: 4,
  },
  {
    id: 'space-hawk-living-2f',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Second Floor Living Room & Dining',
    body: `<p>There is a large sectional sofa giving plenty of seating area with a <strong>drop-down projector screen</strong> for movies. Or simply enjoy the views of the city skyline.</p><p>The dining room, kitchen, and living room are an open-layout great room. The large dining table accommodates 10 people. A highchair is available in the pantry.</p>`,
    images: [
      { src: '/photos/hawk-street/p14_img1_1272x850.jpeg', caption: '2F Living Room — Sectional & Projector' },
      { src: '/photos/hawk-street/p14_img2_1272x850.jpeg', caption: '2F Dining — Open Great Room, Seats 10' },
    ],
    order: 5,
  },
  {
    id: 'space-hawk-kitchen-2f',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Second Floor Kitchen',
    body: `<p>A complete kitchen is provided on the 2nd floor with its own cookware, utensils, spices, and basic cooking ingredients. Please aim to keep materials from the 2nd floor in that unit to simplify things for our cleaning staff.</p>`,
    images: [{ src: '/photos/hawk-street/p15_img1_1108x740.jpeg', caption: '2F Kitchen — Fully Stocked' }],
    order: 6,
  },
  {
    id: 'space-hawk-laundry',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Laundry',
    body: `<p><strong>First floor:</strong> Full washer/dryer in the half bathroom laundry room.<br/><strong>Second floor:</strong> Washer/dryer on the covered outdoor patio. Laundry detergent is supplied on both floors.</p>`,
    images: [],
    order: 8,
  },

  // ─── LOCAL GUIDE — Restaurants ────────────────────────────────────────────

  {
    id: 'guide-filippis',
    sectionKey: 'local_guide',
    type: 'shared',
    propertySlug: null,
    title: "Filippi's Pizza Grotto",
    body: `<p>A San Diego classic in Little Italy since 1950. Best lasagna ever! Known for authentic Italian comfort food, generous portions, and a warm neighborhood atmosphere.</p><p>1609 India St, Little Italy · $$</p>`,
    phone: '(619) 232-5094',
    link: 'https://realcheesepizza.com/little-italy',
    images: [{ src: '/photos/reynard-way/p21_img1_408x306.png', caption: "Filippi's Pizza Grotto" }],
    order: 1,
  },
  {
    id: 'guide-buon-appetito',
    sectionKey: 'local_guide',
    type: 'shared',
    propertySlug: null,
    title: 'Buon Appetito',
    body: `<p>Authentic Italian trattoria in the heart of Little Italy. Cozy atmosphere, excellent pasta, and an impressive wine list. A neighborhood favorite.</p><p>1747 India St, Little Italy · $$</p>`,
    phone: '(619) 238-9880',
    link: 'https://buonappetitosandiego.com',
    images: [{ src: '/photos/reynard-way/p21_img2_408x306.png', caption: 'Buon Appetito' }],
    order: 2,
  },
  {
    id: 'guide-soi-pb',
    sectionKey: 'local_guide',
    type: 'shared',
    propertySlug: null,
    title: 'Soi PB Thai Street Food',
    body: `<p>Vibrant and flavorful Thai street food near Mission Bay. Fresh ingredients, bold flavors, and great value. Perfect for a casual dinner.</p><p>4658 Mission Blvd, Pacific Beach · $</p>`,
    phone: '(858) 263-4309',
    link: 'https://soipbthaifood.com/home',
    images: [{ src: '/photos/reynard-way/p21_img3_324x216.png', caption: 'Soi PB Thai Street Food' }],
    order: 3,
  },
  {
    id: 'guide-la-puerta',
    sectionKey: 'local_guide',
    type: 'shared',
    propertySlug: null,
    title: 'La Puerta',
    body: `<p>Great Mexican food right in the neighborhood on Goldfinch St. Excellent tacos, margaritas, and a lively patio scene.</p><p>4020 Goldfinch St, Mission Hills · $</p>`,
    phone: '(619) 876-5200',
    link: 'https://lapuertasd.com',
    images: [{ src: '/photos/reynard-way/p21_img4_230x306.png', caption: 'La Puerta' }],
    order: 4,
  },

  // ─── LOCAL GUIDE — Nearest Stores ─────────────────────────────────────────

  {
    id: 'guide-clover-leaf',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Clover Leaf Market & Gas Station',
    body: `<p>Convenience store and gas station directly across the street. Great for quick snacks, drinks, and fuel.</p><p>3070 Reynard Way · 1 min walk</p>`,
    images: [{ src: '/photos/reynard-way/p22_img1_240x178.png', caption: 'Clover Leaf Market' }],
    order: 5,
  },
  {
    id: 'guide-vons',
    sectionKey: 'local_guide',
    type: 'shared',
    propertySlug: null,
    title: 'Vons',
    body: `<p>Full-service grocery store. Parking is available on the lower level of the building.</p><p>515 W Washington St · 5 min walk</p>`,
    images: [{ src: '/photos/reynard-way/p22_img2_256x145.png', caption: 'Vons Grocery' }],
    order: 6,
  },
  {
    id: 'guide-starbucks',
    sectionKey: 'local_guide',
    type: 'shared',
    propertySlug: null,
    title: 'Starbucks',
    body: `<p>Conveniently located on W Washington St, an easy walk from both properties.</p><p>784 W Washington St · 5 min walk</p>`,
    images: [{ src: '/images/local/starbucks.png', caption: 'Starbucks' }],
    order: 7,
  },
  {
    id: 'guide-walgreens',
    sectionKey: 'local_guide',
    type: 'shared',
    propertySlug: null,
    title: 'Walgreens Pharmacy',
    body: `<p>Full pharmacy plus general convenience items, snacks, and household essentials.</p><p>301 W University Ave · 10 min walk</p>`,
    phone: '(619) 325-0423',
    images: [{ src: '/photos/reynard-way/p22_img3_300x225.png', caption: 'Walgreens' }],
    order: 8,
  },
  {
    id: 'guide-genteel-coffee',
    sectionKey: 'local_guide',
    type: 'shared',
    propertySlug: null,
    title: 'Genteel Coffee Co',
    body: `<p>A beloved local coffee shop serving specialty coffee in a relaxed neighborhood setting.</p><p>2603 University Ave</p>`,
    link: 'https://genteelcoffee.com',
    images: [{ src: '/images/local/genteel-coffee.jpg', caption: 'Genteel Coffee Co' }],
    order: 9,
  },
  {
    id: 'guide-target',
    sectionKey: 'local_guide',
    type: 'shared',
    propertySlug: null,
    title: 'Target',
    body: `<p>Full-size Target with groceries, household goods, and general merchandise.</p><p>3245 Sports Arena Blvd · 10 min drive</p>`,
    images: [{ src: '/images/local/target.jpg', caption: 'Target' }],
    order: 10,
  },
  {
    id: 'guide-sprouts',
    sectionKey: 'local_guide',
    type: 'shared',
    propertySlug: null,
    title: 'Sprouts Farmers Market',
    body: `<p>Natural and organic grocery store with great produce, bulk foods, and prepared meals.</p><p>3315 Rosecrans St, Suite B · 10 min drive</p>`,
    images: [{ src: '/images/local/sprouts.jpg', caption: 'Sprouts Farmers Market' }],
    order: 11,
  },
  {
    id: 'guide-ralphs',
    sectionKey: 'local_guide',
    type: 'shared',
    propertySlug: null,
    title: "Ralph's Grocery",
    body: `<p>Large grocery store with full deli, bakery, and pharmacy sections.</p><p>1020 University Ave · 10 min drive</p>`,
    images: [{ src: '/images/local/ralphs.jpg', caption: "Ralph's Grocery" }],
    order: 12,
  },
  {
    id: 'guide-moes-coffee',
    sectionKey: 'local_guide',
    type: 'shared',
    propertySlug: null,
    title: "Moe's Coffee",
    body: `<p>A cozy neighborhood coffee spot with great espresso drinks, pastries, and a welcoming vibe. Perfect for a morning pick-me-up.</p><p>Nearby · Short walk or drive</p>`,
    link: 'https://moecoffee.co/',
    images: [{ src: '/images/local/moes-coffee.jpg', caption: "Moe's Coffee" }],
    order: 13,
  },

  // ─── THINGS TO DO — Water Activities ──────────────────────────────────────

  {
    id: 'todo-mbsc',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Mission Bay Sport Center',
    body: `<p>Rent jet skis, jet packs, power boats, kayaks, and paddleboards right on Mission Bay. Perfect for a fun day on the water with the whole group.</p><p>1010 Santa Clara Pl, Mission Bay · 10 min drive</p>`,
    link: 'https://missionbaysportcenter.com',
    images: [{ src: '/photos/reynard-way/p19_img1_275x183.png', caption: 'Mission Bay Sport Center' }],
    order: 1,
  },
  {
    id: 'todo-aqua-adventures',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Aqua Adventures',
    body: `<p>Kayak and SUP (stand-up paddleboard) rentals on Mission Bay. Great for all skill levels with calm bay waters and beautiful scenery.</p><p>1548 W Mission Bay Dr · 10 min drive</p>`,
    link: 'https://aqua-adventures.com',
    images: [{ src: '/photos/reynard-way/p19_img2_490x327.png', caption: 'Aqua Adventures — Kayaks & SUP' }],
    order: 2,
  },
  {
    id: 'todo-sail-sd',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Sail San Diego',
    body: `<p>Experience San Diego from the water on a sailing day trip or tour around the bay. Breathtaking views of the city skyline and Coronado Bridge.</p><p>Harbor Island · 15 min drive</p>`,
    link: 'https://sailsandiego.com',
    images: [{ src: '/photos/reynard-way/p19_img3_820x461.png', caption: 'Sail San Diego' }],
    order: 3,
  },
  {
    id: 'todo-everyday-ca',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Everyday California',
    body: `<p>Guided SUP and kayak eco-tours along the stunning La Jolla coastline. Explore sea caves and swim with leopard sharks in their natural habitat!</p><p>2246 Avenida de la Playa, La Jolla · 20 min drive</p>`,
    link: 'https://everydaycalifornia.com',
    images: [{ src: '/images/local/everyday-california.jpg', caption: 'Everyday California — La Jolla Kayak Tours' }],
    order: 4,
  },
  {
    id: 'todo-paddle-sd',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Paddle Board San Diego',
    body: `<p>SUP lessons and rentals at various Mission Bay locations. Great for beginners — their instructors will have you up and paddling in no time.</p>`,
    link: 'https://paddleboardsandiego.com',
    images: [{ src: '/images/local/paddle.jpg', caption: 'Paddle Board San Diego' }],
    order: 5,
  },
  {
    id: 'todo-disco-paddle',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Disco Paddle Surf',
    body: `<p>A fun and unique SUP experience out of Point Loma. Guided tours and rentals with a great local vibe.</p><p>Point Loma · 10 min drive</p>`,
    link: 'https://discospaddlesurf.com',
    images: [{ src: '/images/local/disco-paddle.jpg', caption: 'Disco Paddle Surf' }],
    order: 6,
  },

  // ─── THINGS TO DO — Hiking ────────────────────────────────────────────────

  {
    id: 'todo-palm-canyon',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Palm Canyon Trail',
    body: `<p>A beautiful urban canyon hike winding through the heart of Balboa Park. Towering palm trees, native vegetation, and a peaceful escape from the city — just minutes away.</p><p>635 Pan American W Rd, Balboa Park · 5 min drive</p>`,
    link: 'https://balboapark.org/parks-trails-gardens/palm-canyon-balboa-park/',
    images: [{ src: '/images/local/palm-canyon.jpg', caption: 'Palm Canyon Trail' }],
    order: 7,
  },
  {
    id: 'todo-marston-point',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Marston Point',
    body: `<p>A scenic overlook trail in Balboa Park with panoramic views of Mission Valley and the surrounding canyons. Great for a morning walk or sunset views.</p><p>Eighth Ave, Balboa Park · 5 min drive</p>`,
    link: 'https://balboapark.org/parks-trails-gardens/marston-point-trails-gateway/',
    images: [{ src: '/images/local/marston-point.jpg', caption: 'Marston Point Trail' }],
    order: 8,
  },

  // ─── THINGS TO DO — Golf ──────────────────────────────────────────────────

  {
    id: 'todo-bpgolf',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Balboa Park Golf Course',
    body: `<p>A historic 18-hole public golf course in the heart of Balboa Park. Stunning canyon views and one of the most accessible courses in San Diego.</p><p>2600 Golf Course Dr, Balboa Park · 5 min drive</p>`,
    link: 'https://sandiego.gov/park-and-recreation/golf/bpgolf',
    images: [{ src: '/images/local/balboa-park-golf.jpg', caption: 'Balboa Park Golf Course' }],
    order: 9,
  },
  {
    id: 'todo-loma-club',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'The Loma Club',
    body: `<p>A boutique 9-hole golf course and lounge in Point Loma with stunning bay views. Great course for a relaxed round with drinks and food afterward.</p><p>Point Loma · 10 min drive</p>`,
    link: 'https://thelomaclub.com',
    images: [{ src: '/images/local/balboa-park-golf.jpg', caption: 'The Loma Club Golf Course' }],
    order: 10,
  },

  // ─── THINGS TO DO — Shopping ──────────────────────────────────────────────

  {
    id: 'todo-fashion-valley',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Fashion Valley Mall',
    body: `<p>San Diego's premier outdoor shopping destination featuring luxury brands, flagship stores, dining, and a movie theater. One of the best malls in Southern California.</p><p>7007 Friars Rd, Mission Valley · 10 min drive</p>`,
    link: 'https://www.simon.com/mall/fashion-valley',
    images: [{ src: '/images/local/fashion-valley.jpg', caption: 'Fashion Valley Mall' }],
    order: 11,
  },

  // ─── THINGS TO DO — Places to See ─────────────────────────────────────────

  {
    id: 'todo-balboa-park',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Balboa Park',
    body: `<p>San Diego's crown jewel — 1,200 acres of museums, botanical gardens, performance venues, and the world-famous San Diego Zoo. You could spend an entire week here and not see it all.</p><p>1549 El Prado, San Diego · 5 min drive</p>`,
    link: 'https://balboapark.org',
    images: [{ src: '/photos/reynard-way/p20_img1_338x191.png', caption: 'Balboa Park' }],
    order: 12,
  },
  {
    id: 'todo-coronado',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Coronado Island',
    body: `<p>Cross the iconic Coronado Bridge to discover one of San Diego's most charming destinations. Stunning white-sand beach, the legendary Hotel del Coronado, boutique shops, and great restaurants.</p>`,
    link: 'https://coronadovisitorcenter.com',
    images: [{ src: '/photos/reynard-way/p20_img2_360x240.png', caption: 'Coronado Island' }],
    order: 13,
  },
  {
    id: 'todo-little-italy',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Little Italy',
    body: `<p>San Diego's most vibrant neighborhood — packed with excellent Italian restaurants, wine bars, coffee shops, and boutiques. Don't miss the farmers market on Wednesdays and Saturdays.</p><p>India St & Date St · 10 min drive</p>`,
    link: 'https://littleitalysd.com',
    images: [{ src: '/photos/reynard-way/p20_img3_410x273.png', caption: 'Little Italy' }],
    order: 14,
  },
  {
    id: 'todo-seaworld',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'SeaWorld San Diego',
    body: `<p>World-famous marine theme park featuring thrilling rides, live shows, and up-close encounters with dolphins, orcas, sea lions, and more. Great for all ages.</p><p>500 SeaWorld Dr, Mission Bay · 10 min drive</p>`,
    link: 'https://seaworld.com/san-diego',
    images: [{ src: '/photos/reynard-way/p20_img4_512x256.png', caption: 'SeaWorld San Diego' }],
    order: 15,
  },
  {
    id: 'todo-zoo',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'San Diego Zoo',
    body: `<p>One of the most celebrated zoos in the world with over 12,000 animals across 650+ species. Located inside Balboa Park. The Safari Park is 32 miles north for an extended adventure.</p><p>2920 Zoo Dr, Balboa Park · 5 min drive</p>`,
    link: 'https://sandiegozoowildlifealliance.org',
    images: [{ src: '/photos/reynard-way/p20_img5_319x213.png', caption: 'San Diego Zoo' }],
    order: 16,
  },
  {
    id: 'todo-legoland',
    sectionKey: 'things_to_do',
    type: 'shared',
    propertySlug: null,
    title: 'Legoland California',
    body: `<p>A fantastic family theme park in Carlsbad with interactive rides, LEGO-themed worlds, a water park, and an aquarium. Perfect for families with younger children.</p><p>One Legoland Dr, Carlsbad · 35 min drive</p>`,
    link: 'https://legoland.com/california',
    images: [{ src: '/photos/reynard-way/p20_img6_496x406.png', caption: 'Legoland California' }],
    order: 17,
  },

  // ─── VIDEO GUIDES ─────────────────────────────────────────────────────────

  // Reynard Way
  {
    id: 'video-reynard-tour',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Full Property Tour',
    body: `<p>A complete walkthrough of the entire 7-bedroom property — from the main entrance to the studio, backyard, and hot tub.</p>`,
    images: [{ src: '/photos/reynard-way/p2_img1_2007x1505.jpeg', caption: 'Property Tour' }],
    link: 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto',
    order: 1,
  },
  {
    id: 'video-reynard-living',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Living Room & Game Room',
    body: `<p>Tour of the main living room, pool/ping-pong table, sofa beds, and smart TV area.</p>`,
    images: [{ src: '/photos/reynard-way/p10_img1_600x396.png', caption: 'Living Room & Game Room' }],
    link: 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto',
    order: 2,
  },
  {
    id: 'video-reynard-kitchen',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Kitchen & Dining',
    body: `<p>Overview of the kitchen, pantry, dining table, and everything provided for cooking and meals.</p>`,
    images: [{ src: '/photos/reynard-way/p11_img1_840x557.png', caption: 'Kitchen & Dining' }],
    link: 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto',
    order: 3,
  },
  {
    id: 'video-reynard-bedrooms',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Bedrooms Tour',
    body: `<p>Walk through all bedrooms, bathroom locations, and sleeping arrangements across all three floors.</p>`,
    images: [{ src: '/photos/reynard-way/p9_img1_504x336.png', caption: 'Bedrooms Tour' }],
    link: 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto',
    order: 4,
  },
  {
    id: 'video-reynard-outdoor',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Outdoor Patio & Hot Tub',
    body: `<p>Guide to the back patio, sectional seating, solar umbrellas, and hot tub — including how to use the cover and controls.</p>`,
    images: [{ src: '/photos/reynard-way/p14_img2_600x399.png', caption: 'Outdoor Patio & Hot Tub' }],
    link: 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto',
    order: 5,
  },
  {
    id: 'video-reynard-studio',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'The Studio',
    body: `<p>How to use the Murphy bed, motorized shades remote, ceiling TV arm, and the studio's separate bathroom and kitchenette.</p>`,
    images: [{ src: '/photos/reynard-way/p12_img1_504x336.png', caption: 'The Studio' }],
    link: 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto',
    order: 6,
  },

  // Hawk Street
  {
    id: 'video-hawk-tour',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Full Property Tour',
    body: `<p>A complete walkthrough of both floors of the duplex — entrances, living areas, kitchens, bedrooms, and outdoor spaces.</p>`,
    images: [{ src: '/photos/hawk-street/p2_img1_2007x1505.jpeg', caption: 'Property Tour' }],
    link: 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto',
    order: 1,
  },
  {
    id: 'video-hawk-living-1f',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'hawk-street',
    title: '1st Floor Living Room',
    body: `<p>Tour of the first floor living room, sofa bed, pool/ping-pong/foosball tables, and balcony access.</p>`,
    images: [{ src: '/photos/hawk-street/p11_img1_848x567.jpeg', caption: '1F Living Room' }],
    link: 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto',
    order: 2,
  },
  {
    id: 'video-hawk-kitchen',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Kitchens & Dining',
    body: `<p>Overview of both the 1st and 2nd floor kitchens, dining tables, and all cooking supplies provided on each level.</p>`,
    images: [{ src: '/photos/hawk-street/p12_img1_1108x740.jpeg', caption: 'Kitchen & Dining' }],
    link: 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto',
    order: 3,
  },
  {
    id: 'video-hawk-bedrooms',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Bedrooms Tour',
    body: `<p>Walk through all bedrooms on both floors — king, queen, full, and bunk bed configurations with bathroom locations.</p>`,
    images: [{ src: '/photos/hawk-street/p10_img1_848x567.jpeg', caption: 'Bedrooms Tour' }],
    link: 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto',
    order: 4,
  },
  {
    id: 'video-hawk-outdoor',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Balcony & Outdoor Spaces',
    body: `<p>Tour of the balcony, BBQ grill, patio seating, and the covered outdoor laundry area on the 2nd floor.</p>`,
    images: [{ src: '/photos/hawk-street/p16_img1_831x555.jpeg', caption: 'Balcony & Outdoor Spaces' }],
    link: 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto',
    order: 5,
  },
  {
    id: 'video-hawk-living-2f',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'hawk-street',
    title: '2nd Floor Living Room',
    body: `<p>Overview of the second floor great room — sectional sofa, drop-down projector screen, open dining, city skyline views.</p>`,
    images: [{ src: '/photos/hawk-street/p14_img1_1272x850.jpeg', caption: '2F Living Room' }],
    link: 'https://drive.google.com/drive/folders/1BRdFxxfWBFt4yMZheimYpywuOAkrzLVb?dmr=1&ec=wgc-drive-[module]-goto',
    order: 6,
  },

  // ─── TRANSPORTATION ───────────────────────────────────────────────────────

  {
    id: 'getting-around-reynard',
    sectionKey: 'transport',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Getting Around San Diego',
    body: `<p><strong>On Foot:</strong> Both properties are in walkable neighborhoods. Little Italy, Starbucks, and local coffee shops are within 15–30 minutes on foot. Mission Hills restaurants, bars, and cafés are within a 5–10 minute walk.</p><p><strong>Rideshare:</strong> Uber and Lyft are widely available throughout San Diego and are often the easiest option — especially for beach areas, the Gaslamp Quarter, and Little Italy where parking can be challenging.</p><p><strong>Bus & Trolley:</strong> Multiple MTS bus routes stop nearby. Check <strong>sdmts.com</strong> for maps and schedules. The Green Line Trolley connects to downtown and Mission Valley.</p><p><strong>By Car:</strong> Centrally located — Balboa Park is 5 min, downtown is 10 min, beaches are 15–20 min. Note that parking in Mission Bay, Gaslamp, and Little Italy can be tight on weekends; Uber/Lyft is recommended for those areas.</p>`,
    images: [],
    order: 1,
  },
  {
    id: 'getting-around-hawk',
    sectionKey: 'transport',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Getting Around San Diego',
    body: `<p><strong>On Foot:</strong> Both properties are in walkable neighborhoods. Little Italy, Starbucks, and local coffee shops are within 15–30 minutes on foot. Mission Hills restaurants, bars, and cafés are within a 5–10 minute walk.</p><p><strong>Rideshare:</strong> Uber and Lyft are widely available throughout San Diego and are often the easiest option — especially for beach areas, the Gaslamp Quarter, and Little Italy where parking can be challenging.</p><p><strong>Bus & Trolley:</strong> Multiple MTS bus routes stop nearby. Check <strong>sdmts.com</strong> for maps and schedules. The Green Line Trolley connects to downtown and Mission Valley.</p><p><strong>By Car:</strong> Centrally located — Balboa Park is 5 min, downtown is 10 min, beaches are 15–20 min. Note that parking in Mission Bay, Gaslamp, and Little Italy can be tight on weekends; Uber/Lyft is recommended for those areas.</p>`,
    images: [],
    order: 1,
  },

  // ─── CHECKOUT ─────────────────────────────────────────────────────────────

  {
    id: 'checkout-instructions-reynard',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Before You Go',
    body: `<ol><li>Strip the beds — leave all used linens on the floor in the bedroom.</li><li>Wash all dishes and return them to the cabinets.</li><li>Take all trash to the bins outside.</li><li>Empty the refrigerator of any perishable items you brought.</li><li>Turn off all lights, fans, and electronics.</li><li>Lock all doors and windows before leaving.</li><li>Send your host a quick message to let them know you have checked out.</li></ol>`,
    images: [],
    order: 1,
  },
  {
    id: 'checkout-instructions-hawk',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Before You Go',
    body: `<ol><li>Strip the beds — leave all used linens on the floor in the bedroom.</li><li>Wash all dishes and return them to the cabinets.</li><li>Take all trash to the bins outside.</li><li>Empty the refrigerator of any perishable items you brought.</li><li>Turn off all lights, fans, and electronics.</li><li>Lock all doors and windows before leaving.</li><li>Send your host a quick message to let them know you have checked out.</li></ol>`,
    images: [],
    order: 1,
  },
  {
    id: 'checkout-time-reynard',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Check-Out Time',
    body: `<p>Please check out by <strong>11:00 AM</strong>. If you need a late check-out, contact the host at least 24 hours in advance — we will do our best to accommodate.</p>`,
    images: [],
    order: 1,
  },
  {
    id: 'checkout-time-hawk',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Check-Out Time',
    body: `<p>Please check out by <strong>11:00 AM</strong>. If you need a late check-out, contact the host at least 24 hours in advance — we will do our best to accommodate.</p>`,
    images: [],
    order: 1,
  },
  {
    id: 'checkout-legal-reynard',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'reynard-way',
    title: 'Legal Notice',
    body: `<p>TALO Rentals operates under a valid short-term rental permit issued by the City of San Diego. Guests agree to comply with all local ordinances regarding noise, occupancy, and parking. The property is located in a residential neighborhood — please be respectful of neighbors at all times.</p><p>TALO Rentals is not liable for personal injury, theft, or property damage resulting from misuse of the property or its amenities. Guests assume full responsibility for their own safety and the safety of their group.</p>`,
    images: [],
    order: 2,
  },
  {
    id: 'checkout-legal-hawk',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'hawk-street',
    title: 'Legal Notice',
    body: `<p>TALO Rentals operates under a valid short-term rental permit issued by the City of San Diego. Guests agree to comply with all local ordinances regarding noise, occupancy, and parking. The property is located in a residential neighborhood — please be respectful of neighbors at all times.</p><p>TALO Rentals is not liable for personal injury, theft, or property damage resulting from misuse of the property or its amenities. Guests assume full responsibility for their own safety and the safety of their group.</p>`,
    images: [],
    order: 2,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // JACKSON STREET — 2525 Jackson St, San Diego, CA 92110
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── WELCOME ──────────────────────────────────────────────────────────────

  {
    id: 'welcome-jackson-msg',
    sectionKey: 'welcome',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Welcome to Jackson Street!',
    body: `<p>We hope you enjoy your stay at this stunning 5-bedroom home in Mission Hills! Featuring panoramic views of the San Diego Bay and city skyline from multiple outdoor decks, an open-concept layout, and a modern kitchen — this home is the perfect base for exploring San Diego.</p><p>This guidebook covers everything you need — entry instructions, parking, house rules, and our best local tips. Thank you for choosing us as your host!</p>`,
    images: [{ src: '/photos/jackson-st/92272c0b-3368-4d11-8ff9-1968c49b4788.jpeg', caption: '2525 Jackson St, San Diego' }],
    order: 1,
  },

  // ─── HOW TO ENTER ─────────────────────────────────────────────────────────

  {
    id: 'entry-jackson',
    sectionKey: 'entry',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Entering Jackson Street',
    body: `<ol><li>Your door access code will be sent via Airbnb message on the day of check-in.</li><li>Locate the digital keypad at the private entrance.</li><li>Enter your 4-digit code — the lock will beep and unlock when accepted.</li><li>Contact the host immediately if you have any trouble accessing the property.</li></ol>`,
    images: [{ src: '/photos/jackson-st/92272c0b-3368-4d11-8ff9-1968c49b4788.jpeg', caption: 'Private entrance — 2525 Jackson St' }],
    order: 1,
  },

  // ─── PARKING ──────────────────────────────────────────────────────────────

  {
    id: 'parking-jackson',
    sectionKey: 'parking',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Parking at Jackson Street',
    body: `<ul><li>Free off-street parking is available at the property.</li><li>Please park fully on the property without blocking the street, sidewalk, or neighbors.</li><li>Street parking is also available on Jackson St and the surrounding Mission Hills streets — typically free and plentiful.</li><li>For unloading, you can briefly park in front of the property on Jackson St.</li><li>Contact the host if you need guidance on parking for a large group.</li></ul>`,
    images: [{ src: '/photos/jackson-st/parking.avif', caption: 'Driveway — Accessed via Exterior Roll-Up Door (Living Room 2)' }],
    order: 1,
  },

  // ─── WI-FI ────────────────────────────────────────────────────────────────

  {
    id: 'wifi-jackson',
    sectionKey: 'wifi',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Wi-Fi at Jackson Street',
    body: `<p>High-speed Wi-Fi is available throughout the home and on the outdoor decks. Your network name and password will be included in your check-in message and are also posted inside the home.</p><p>If you experience connectivity issues, try restarting your device. Contact the host if problems persist.</p>`,
    images: [],
    order: 1,
  },

  // ─── HOUSE RULES ──────────────────────────────────────────────────────────

  {
    id: 'house-rules-jackson-general',
    sectionKey: 'house_rules',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'General House Rules',
    body: `<ul><li><strong>Max occupancy: 16 guests</strong> — please do not exceed this limit at any time.</li><li>No smoking anywhere on the property, indoors or outdoors.</li><li><strong>Pets are welcome</strong> — please clean up after your pet and keep them off the furniture.</li><li>No parties or events without prior written approval from the host.</li><li><strong>Quiet hours: 10:00 PM – 8:00 AM</strong> — we're in a residential neighborhood, please be mindful of neighbors.</li><li>No illegal activity on the premises.</li><li>Treat the property with respect — guests are responsible for any damages during their stay.</li></ul>`,
    images: [],
    order: 1,
  },
  {
    id: 'house-rules-jackson-decks',
    sectionKey: 'house_rules',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Outdoor Decks & Fire Pit',
    body: `<ul><li>Outdoor decks are for registered guests only.</li><li>No glass near the fire pit area — use the cups provided.</li><li>Ensure the fire pit is fully extinguished before going inside for the night.</li><li>Please be especially mindful of noise levels on the decks after 10:00 PM — sound travels far with open canyon and bay views.</li><li>Do not lean on or climb the deck railings.</li></ul>`,
    images: [],
    order: 2,
  },

  // ─── THE HOME ─────────────────────────────────────────────────────────────

  {
    id: 'home-jackson-overview',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Overview — 2525 Jackson St',
    body: `<p>This stylish 5-bedroom, 3.5-bathroom home in Mission Hills is designed for comfort and entertaining. With 12 beds sleeping up to 16 guests, panoramic bay and skyline views, and multiple outdoor decks — it's one of San Diego's most spectacular stays.</p><ul><li>5 Bedrooms · 3.5 Bathrooms · 12 beds</li><li>Sleeps up to 16 guests</li><li>Open-concept living with large picture windows</li><li>Smart TV in multiple rooms</li><li>High-speed Wi-Fi throughout, including outdoor decks</li><li>Washer & dryer on-site</li><li>In-home safe for valuables</li><li>Private entrance</li></ul>`,
    images: [
      { src: '/photos/jackson-st/dc593096-370b-4b0d-adaa-d4b1a95a3b6c.jpeg', caption: 'Open-Concept Living & Dining with Bay Views' },
      { src: '/photos/jackson-st/e2159565-d41b-497f-a343-971d138406f2.jpeg', caption: 'Living Room — Panoramic Bay & City Views' },
    ],
    order: 1,
  },
  {
    id: 'home-jackson-bedrooms',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Bedrooms',
    body: `<ul><li><strong>Bedroom 1</strong> — King bed + sofa bed · TV · AC · Wardrobe & hangers</li><li><strong>Bedroom 2</strong> — King bed · TV · AC · Heating</li><li><strong>Bedroom 3</strong> — Queen bed + sofa bed · AC · Wardrobe & hangers</li><li><strong>Bedroom 4</strong> — Sofa bed (flex/bonus room) · TV · AC · Heating · Hangers</li><li><strong>Bedroom 5</strong> — Double bed + sofa bed · TV · AC · Heating</li></ul><p>All bedrooms include bed linens, pillows, and extra blankets. A baby crib is available on request.</p>`,
    images: [
      { src: '/photos/jackson-st/6fbed64d-98b6-4d80-8ea1-95bb685a5162.jpeg', caption: 'Bedroom 1 — King Bed with Bay View & Deck Access' },
      { src: '/photos/jackson-st/4afea22b-be84-4e5b-b040-2d7457ae5bb3.jpeg', caption: 'Bedroom 2 — King Bed with Bay Views' },
      { src: '/photos/jackson-st/573b3ad5-a199-4676-bf19-8fbc0d5773da.jpeg', caption: 'Bedroom 3 — Queen Bed' },
    ],
    order: 2,
  },
  {
    id: 'home-jackson-kitchen',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Kitchen & Dining',
    body: `<p>The modern open-concept kitchen is fully stocked for cooking large group meals:</p><ul><li>Full-size refrigerator & freezer</li><li>Oven, stove, microwave, toaster, coffee maker, blender</li><li>Dishwasher · Dining table for the full group</li><li>Pots, pans, dishes, silverware, wine glasses, cooking basics</li><li>Ground coffee and pantry staples provided</li></ul>`,
    images: [
      { src: '/photos/jackson-st/d4f3baef-0abc-4ab2-b3b3-1fdb446fd94f.jpeg', caption: 'Kitchen — Island, Gas Range & Open to Dining' },
      { src: '/photos/jackson-st/3820fd19-6e20-4c81-8407-ed4d2e372990.jpeg', caption: 'Kitchen — Sink & Blue Talavera Tile Backsplash' },
    ],
    order: 3,
  },
  {
    id: 'home-jackson-laundry',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Laundry',
    body: `<p>A washer and dryer are available on-site for guest use. Laundry detergent is provided — check under the sink or in the laundry area.</p>`,
    images: [{ src: '/photos/jackson-st/8d787f08-d30f-40b0-8892-1f4947891fea.jpeg', caption: 'Stacked Washer & Dryer' }],
    order: 4,
  },

  // ─── OUTDOOR SPACES ───────────────────────────────────────────────────────

  {
    id: 'outdoor-jackson-decks',
    sectionKey: 'outdoor_spaces',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Outdoor Decks & Views',
    body: `<p>The star of this property is the multiple outdoor decks with <strong>panoramic views of the San Diego Bay and city skyline</strong> — truly stunning at sunrise, during the day, and especially at sunset.</p><ul><li>Multiple decks accessible from the home — perfect for morning coffee, evening drinks, or group dining.</li><li>Comfortable outdoor seating throughout.</li><li>Alfresco dining area — great for group meals outside.</li></ul>`,
    images: [
      { src: '/photos/jackson-st/a4d681eb-0abb-4176-b4e0-e6a95ccad8e9.jpeg', caption: 'Rooftop Deck — Fire Pit & Bay Views at Dusk' },
      { src: '/photos/jackson-st/634b598c-69dc-476b-acfd-3d20609f3a6c.jpeg', caption: 'Panoramic Sunset Views from the Rooftop Deck' },
    ],
    order: 1,
  },
  {
    id: 'outdoor-jackson-firepit-bbq',
    sectionKey: 'outdoor_spaces',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Fire Pit & BBQ',
    body: `<ul><li><strong>Fire pit</strong> — perfect for evening gatherings under the stars with bay views.</li><li><strong>BBQ grill</strong> — grill up a feast for the whole group. BBQ utensils are provided.</li><li><strong>Patio seating</strong> — comfortable outdoor furniture scattered across the outdoor areas.</li></ul>`,
    images: [
      { src: '/photos/jackson-st/fb4f506f-fcb0-4c77-bfb3-3987e21e3af4.jpeg', caption: 'Rooftop Deck — BBQ Grill & Fire Pit at Sunset' },
      { src: '/photos/jackson-st/d3df78d2-1afa-4dae-b4f0-5a7a82d7c83a.jpeg', caption: 'Fire Pit Lounge — Rooftop Deck at Sunset' },
    ],
    order: 2,
  },

  // ─── SERVICES & MAINTENANCE ───────────────────────────────────────────────

  {
    id: 'services-jackson',
    sectionKey: 'services_maintenance',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Services & Maintenance',
    body: `<p>We want your stay to be seamless. Here's how to handle common situations:</p><ul><li><strong>Something broken or not working?</strong> Message or call the host — we respond quickly.</li><li><strong>In-home safe:</strong> Located inside the home for securing valuables. The combination is in your check-in message.</li><li><strong>Power issues:</strong> Circuit breakers are in the utility panel — the host can walk you through it.</li><li><strong>Cleaning supplies:</strong> Basic products provided under the kitchen sink.</li><li><strong>Emergency:</strong> Call 911. For non-emergency property issues, contact Joe at +1 (608) 239-3574.</li></ul>`,
    images: [],
    order: 1,
  },

  // ─── VIDEO GUIDES ─────────────────────────────────────────────────────────

  {
    id: 'video-jackson-tour',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Full Property Tour',
    body: `<p>A complete walkthrough of the home — all 5 bedrooms, living areas, kitchen, outdoor decks, and fire pit.</p>`,
    images: [{ src: '/photos/jackson-st/92272c0b-3368-4d11-8ff9-1968c49b4788.jpeg', caption: 'Jackson Street Tour' }],
    link: 'https://drive.google.com/drive/folders/jackson-st-videos',
    order: 1,
  },
  {
    id: 'video-jackson-decks',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Outdoor Decks & Views',
    body: `<p>A tour of all the outdoor decks and the panoramic bay and skyline views — see how to access each deck from inside the home.</p>`,
    images: [{ src: '/photos/jackson-st/06201083-3e79-4e64-8dc2-1e8aa176a0d3.jpeg', caption: 'Outdoor Deck Views' }],
    link: 'https://drive.google.com/drive/folders/jackson-st-videos',
    order: 2,
  },
  {
    id: 'video-jackson-kitchen',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Kitchen Walkthrough',
    body: `<p>Where to find everything in the kitchen — appliances, cookware, pantry items, and more.</p>`,
    images: [{ src: '/photos/jackson-st/953988d7-b146-44a5-bbb3-86cee7b7973a.jpeg', caption: 'Kitchen' }],
    link: 'https://drive.google.com/drive/folders/jackson-st-videos',
    order: 3,
  },
  {
    id: 'video-jackson-bbq',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'BBQ & Fire Pit Guide',
    body: `<p>How to safely use the outdoor BBQ grill and fire pit.</p>`,
    images: [{ src: '/photos/jackson-st/7dce338f-b609-4522-bf87-20daf2926b98.jpeg', caption: 'BBQ & Outdoor Area' }],
    link: 'https://drive.google.com/drive/folders/jackson-st-videos',
    order: 4,
  },
  {
    id: 'video-jackson-entry',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Check-In & Entry Guide',
    body: `<p>How to arrive, where to park, and how to enter the property with your door code.</p>`,
    images: [{ src: '/photos/jackson-st/92272c0b-3368-4d11-8ff9-1968c49b4788.jpeg', caption: 'Jackson St Entrance' }],
    link: 'https://drive.google.com/drive/folders/jackson-st-videos',
    order: 5,
  },
  {
    id: 'video-jackson-checkout',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Check-Out Instructions',
    body: `<p>Everything you need to do before you leave — stripping beds, dishes, trash, locking up, and more.</p>`,
    images: [{ src: '/photos/jackson-st/92272c0b-3368-4d11-8ff9-1968c49b4788.jpeg', caption: 'Jackson Street' }],
    link: 'https://drive.google.com/drive/folders/jackson-st-videos',
    order: 6,
  },

  // ─── LOCAL GUIDE ──────────────────────────────────────────────────────────

  {
    id: 'local-jackson-old-town',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Old Town San Diego',
    body: `<p>Steps away from the property! Old Town is California's birthplace — explore historic adobe buildings, great Mexican restaurants, shops, and open-air museums.</p>`,
    images: [{ src: '/images/local/loma-club.jpg', caption: 'Old Town San Diego' }],
    link: 'https://www.oldtownsdca.com',
    phone: null,
    order: 1,
  },
  {
    id: 'local-jackson-balboa',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Balboa Park',
    body: `<p>San Diego's crown jewel — 1,200 acres of museums, gardens, the San Diego Zoo, the Botanical Building, and stunning Spanish Colonial architecture. 10 min drive.</p>`,
    images: [{ src: '/images/local/kayak-la-jolla.jpg', caption: 'Balboa Park' }],
    link: 'https://balboapark.org',
    phone: null,
    order: 2,
  },
  {
    id: 'local-jackson-little-italy',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Little Italy',
    body: `<p>San Diego's most vibrant dining and entertainment district — excellent restaurants, a weekly farmers market (Wed & Sat), and a lively walkable street scene. 10 min drive.</p>`,
    images: [{ src: '/images/local/aqua-adventures.jpg', caption: 'Little Italy, San Diego' }],
    link: 'https://littleitalysd.com',
    phone: null,
    order: 3,
  },
  {
    id: 'local-jackson-coronado',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Coronado Island',
    body: `<p>Beautiful white-sand beach, the iconic Hotel del Coronado, great restaurants and shops — a scenic 20-min drive or take the ferry from downtown.</p>`,
    images: [{ src: '/images/local/coronado-island.jpg', caption: 'Coronado Island' }],
    link: 'https://coronadovisitorcenter.com',
    phone: null,
    order: 4,
  },
  {
    id: 'local-jackson-mission-bay',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Mission Bay & Mission Beach',
    body: `<p>15 minutes away — kayaking, paddleboarding, jet ski rentals, a lovely boardwalk, and Mission Beach with its classic SoCal beach vibes.</p>`,
    images: [{ src: '/images/local/chula-vista-bayfront.jpg', caption: 'Mission Bay' }],
    link: null,
    phone: null,
    order: 5,
  },
  {
    id: 'local-jackson-la-puerta',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'La Puerta',
    body: `<p>Excellent Mexican food right in the neighborhood on Goldfinch St — great margaritas, tacos, and a buzzy outdoor patio. A Mission Hills staple.</p>`,
    images: [{ src: '/images/local/snooty-fox.jpg', caption: 'La Puerta — Mexican Food' }],
    link: 'https://lapuertasd.com',
    phone: '(619) 876-5200',
    order: 6,
  },
  {
    id: 'local-jackson-filippi',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'jackson-st',
    title: "Filippi's Pizza Grotto",
    body: `<p>Best lasagna in San Diego — a Little Italy classic since 1950. Great for feeding a big group. Walk through the Italian deli to get to the restaurant.</p>`,
    images: [{ src: '/images/local/la-bella-pizza.jpg', caption: "Filippi's Pizza Grotto" }],
    link: 'https://realcheesepizza.com/little-italy',
    phone: '(619) 232-5094',
    order: 7,
  },
  {
    id: 'local-jackson-gaslamp',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Gaslamp Quarter',
    body: `<p>San Diego's premier nightlife and dining hub — dozens of restaurants, bars, and clubs. Located in downtown, about 15 min by car or Uber.</p>`,
    images: [{ src: '/images/local/sail-san-diego.jpg', caption: 'Gaslamp Quarter' }],
    link: null,
    phone: null,
    order: 8,
  },
  {
    id: 'local-jackson-vons',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Vons Grocery',
    body: `<p>Closest full-service grocery store on W Washington St — about a 5-min drive. Stock up on everything for your stay.</p>`,
    images: [{ src: '/images/local/vons-grocery.jpg', caption: 'Vons Grocery' }],
    link: null,
    phone: null,
    order: 9,
  },
  {
    id: 'local-jackson-genteel',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Genteel Coffee Co.',
    body: `<p>A beloved local coffee shop on University Ave — excellent espresso, pastries, and a cozy neighborhood vibe. 10 min walk.</p>`,
    images: [{ src: '/images/local/genteel-coffee.jpg', caption: 'Genteel Coffee Co.' }],
    link: null,
    phone: null,
    order: 10,
  },
  {
    id: 'local-jackson-zoo',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'San Diego Zoo',
    body: `<p>World-famous zoo inside Balboa Park with 3,500+ animals. Plan for a full day — buy tickets online in advance to save time. 10 min drive.</p>`,
    images: [{ src: '/images/local/balboa-park.jpg', caption: 'San Diego Zoo' }],
    link: 'https://sandiegozoowildlifealliance.org',
    phone: null,
    order: 11,
  },
  {
    id: 'local-jackson-harbor',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'San Diego Harbor',
    body: `<p>Stroll the waterfront, board the USS Midway aircraft carrier museum, or take a harbor cruise. The bay you see from the decks — up close. 15 min drive.</p>`,
    images: [{ src: '/images/local/old-town-sd.jpg', caption: 'San Diego Harbor & USS Midway' }],
    link: null,
    phone: null,
    order: 12,
  },

  // ─── THINGS TO DO ─────────────────────────────────────────────────────────

  {
    id: 'todo-jackson-kayak',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Kayaking & SUP — Mission Bay',
    body: `<p>Aqua Adventures offers kayaks and stand-up paddleboards at Mission Bay — calm, flat water perfect for all skill levels. 15 min drive.</p>`,
    images: [{ src: '/images/local/everyday-california.jpg', caption: 'Kayaking — Mission Bay' }],
    link: 'https://aqua-adventures.com',
    order: 1,
  },
  {
    id: 'todo-jackson-sailing',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Sailing on the Bay',
    body: `<p>The San Diego Bay is right in front of you — take a sailing charter or sunset cruise. Sail San Diego offers half-day, full-day, and sunset trips.</p>`,
    images: [{ src: '/images/local/disco-paddle.jpg', caption: 'Sailing on San Diego Bay' }],
    link: 'https://sailsandiego.com',
    order: 2,
  },
  {
    id: 'todo-jackson-balboa-hike',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Balboa Park Trails',
    body: `<p>Hike the Palm Canyon Trail and Marston Point inside Balboa Park — beautiful urban canyon hiking just 10 min from the house.</p>`,
    images: [{ src: '/images/local/marston-point.jpg', caption: 'Balboa Park Trails' }],
    link: 'https://balboapark.org',
    order: 3,
  },
  {
    id: 'todo-jackson-seaworld',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'SeaWorld San Diego',
    body: `<p>Rides, animal shows, and aquariums at SeaWorld on Mission Bay — great for families and groups. 15 min drive.</p>`,
    images: [{ src: '/images/local/mission-bay-sport.jpg', caption: 'SeaWorld San Diego' }],
    link: 'https://seaworld.com/san-diego',
    order: 4,
  },
  {
    id: 'todo-jackson-oldtown-tour',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Old Town History Walk',
    body: `<p>Explore California's first European settlement right next door. Free walking tours of historic adobe buildings, the Wells Fargo Museum, and amazing Mexican restaurants.</p>`,
    images: [{ src: '/images/local/loma-club.jpg', caption: 'Old Town San Diego History Walk' }],
    link: 'https://www.oldtownsdca.com',
    order: 5,
  },
  {
    id: 'todo-jackson-golf',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Balboa Park Golf Course',
    body: `<p>Historic 18-hole public course inside Balboa Park — one of the best-value rounds in San Diego with beautiful canyon views. 5 min drive.</p>`,
    images: [{ src: '/images/local/balboa-park-golf.jpg', caption: 'Balboa Park Golf Course' }],
    link: 'https://sandiego.gov/park-and-recreation/golf/bpgolf',
    order: 6,
  },
  {
    id: 'todo-jackson-coronado-beach',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Coronado Beach',
    body: `<p>Consistently ranked one of America's best beaches — wide, white, and uncrowded. The iconic Hotel del Coronado is right there for lunch or a drink. 20 min drive.</p>`,
    images: [{ src: '/images/local/sweetwater-summit.jpg', caption: 'Coronado Beach' }],
    link: null,
    order: 7,
  },
  {
    id: 'todo-jackson-midway',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'USS Midway Museum',
    body: `<p>Tour one of America's longest-serving aircraft carriers, now a museum on the downtown waterfront. Fascinating for all ages. 15 min drive.</p>`,
    images: [{ src: '/images/local/old-town-sd.jpg', caption: 'USS Midway Museum' }],
    link: 'https://midway.org',
    order: 8,
  },
  {
    id: 'todo-jackson-lajolla',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'La Jolla Cove',
    body: `<p>One of the most beautiful spots in California — snorkel with leopard sharks, watch sea lions, and hike the coastal trail. 25 min drive.</p>`,
    images: [{ src: '/images/local/border-field.jpg', caption: 'La Jolla Cove' }],
    link: null,
    order: 9,
  },

  // ─── TRANSPORT ────────────────────────────────────────────────────────────

  {
    id: 'transport-jackson',
    sectionKey: 'transport',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Getting Around from Jackson Street',
    body: `<ul><li><strong>Uber / Lyft</strong> — Very convenient from Mission Hills. Downtown, beaches, and most attractions are 10–20 minutes away.</li><li><strong>MTS Bus</strong> — Several routes accessible within walking distance. The #8 and #9 buses connect to downtown and Mission Beach.</li><li><strong>San Diego Trolley</strong> — Old Town Transit Center is just 5–10 minutes away — the Blue, Green, and Orange lines connect to downtown, the waterfront, and Mission Valley.</li><li><strong>Bike</strong> — Mission Hills is very bikeable. Grab a Bird or Lime e-scooter for quick neighborhood trips.</li><li><strong>Airport (SAN)</strong> — San Diego International Airport is only 10 minutes away — extremely convenient.</li><li><strong>Ferry to Coronado</strong> — Take Uber to the Broadway Pier and hop the ferry to Coronado Island (15 min).</li></ul>`,
    images: [],
    order: 1,
  },

  // ─── CHECKOUT ─────────────────────────────────────────────────────────────

  {
    id: 'checkout-time-jackson',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Check-Out Time',
    body: `<p>Please check out by <strong>11:00 AM</strong>. If you need a late check-out, contact the host at least 24 hours in advance — we'll do our best to accommodate based on availability.</p>`,
    images: [],
    order: 1,
  },
  {
    id: 'checkout-jackson-outdoor',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Outdoor Areas',
    body: `<ul><li>Ensure the fire pit is fully extinguished before leaving.</li><li>Close the BBQ lid and leave it in the same position as when you arrived.</li><li>Collect any items left on the outdoor decks and bring them inside.</li><li>Return outdoor furniture to its original position.</li></ul>`,
    images: [],
    order: 2,
  },
  {
    id: 'checkout-instructions-jackson',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Before You Go',
    body: `<ol><li>Strip the beds — leave all used linens on the floor in the bedroom.</li><li>Wash all dishes and return them to the cabinets.</li><li>Take all trash to the bins outside.</li><li>Empty the refrigerator of any perishable items you brought.</li><li>Turn off all lights, fans, and electronics.</li><li>Lock all doors and windows before leaving.</li><li>Send your host a quick message to let them know you have checked out.</li></ol>`,
    images: [],
    order: 3,
  },
  {
    id: 'checkout-legal-jackson',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'jackson-st',
    title: 'Legal Notice',
    body: `<p>TALO Rentals operates under a valid short-term rental permit issued by the City of San Diego. Guests agree to comply with all local ordinances regarding noise, occupancy, and parking. The property is located in a residential neighborhood — please be respectful of neighbors at all times.</p><p>TALO Rentals is not liable for personal injury, theft, or property damage resulting from misuse of the property or its amenities. Guests assume full responsibility for their own safety and the safety of their group.</p>`,
    images: [],
    order: 4,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VISTA POINTE — 3792 Vista Pointe, Bonita, CA 91902
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── WELCOME ──────────────────────────────────────────────────────────────

  {
    id: 'welcome-vista-msg',
    sectionKey: 'welcome',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Welcome to Vista Pointe!',
    body: `<p>We hope you enjoy your stay at this stunning 5-bedroom home in Bonita, CA! Perched on a hilltop with breathtaking panoramic views, a sparkling pool, and a jacuzzi, this retreat is the perfect escape for groups and families.</p><p>This guidebook has everything you need — from how to access the property to local tips and our best restaurant recommendations. Thank you for choosing us as your host!</p>`,
    images: [{ src: '/photos/vista-pointe/e00570e1-ccf0-45cc-bd67-dc61d0baa3ec.jpeg', caption: 'Vista Pointe — Hilltop Home' }],
    order: 1,
  },

  // ─── HOW TO ENTER ─────────────────────────────────────────────────────────

  {
    id: 'entry-vista',
    sectionKey: 'entry',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Entering Vista Pointe',
    body: `<ol><li>Your door access code will be sent to you via Airbnb message on the day of check-in.</li><li>Locate the digital keypad lock on the front door.</li><li>Enter your 4-digit code — the lock will beep and unlock when accepted.</li><li>If you have any trouble accessing the property, contact the host immediately via Airbnb or by phone.</li></ol>`,
    images: [{ src: '/photos/vista-pointe/jackson-enter.png', caption: 'Front entrance — Vista Pointe' }],
    order: 1,
  },

  // ─── PARKING ──────────────────────────────────────────────────────────────

  {
    id: 'parking-vista',
    sectionKey: 'parking',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Parking at Vista Pointe',
    body: `<ul><li>Free off-street parking is available in the driveway — fits multiple vehicles.</li><li>Please park fully on the property and do not block the street, sidewalk, or neighboring driveways.</li><li>Additional street parking is available on Vista Pointe and surrounding streets.</li><li>If you have a large group with many vehicles, please contact the host ahead of arrival.</li></ul>`,
    images: [{ src: '/photos/vista-pointe/3d2ab098-dfe0-4947-a8c3-7101f59b88ed.jpeg', caption: 'Driveway & Exterior — Vista Pointe' }],
    order: 1,
  },

  // ─── WI-FI ────────────────────────────────────────────────────────────────

  {
    id: 'wifi-vista',
    sectionKey: 'wifi',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Wi-Fi at Vista Pointe',
    body: `<p>High-speed Wi-Fi is available throughout the home. Your network name and password will be included in your check-in message or posted inside the home.</p><p>If you have any connectivity issues, try restarting your device or contact the host for assistance.</p>`,
    images: [],
    order: 1,
  },

  // ─── HOUSE RULES ──────────────────────────────────────────────────────────

  {
    id: 'house-rules-vista-general',
    sectionKey: 'house_rules',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'General House Rules',
    body: `<ul><li><strong>Max occupancy: 16 guests</strong> — please do not exceed this limit.</li><li>No smoking anywhere on the property, indoors or outdoors.</li><li><strong>Pets are welcome</strong> — please clean up after your pet and keep them off the furniture.</li><li>No parties or events without prior written approval from the host.</li><li>Quiet hours: 10:00 PM – 8:00 AM — please be mindful of neighbors.</li><li>No illegal activity on the premises.</li><li>Treat the property with care — you are responsible for any damages during your stay.</li></ul>`,
    images: [],
    order: 1,
  },
  {
    id: 'house-rules-vista-pool',
    sectionKey: 'house_rules',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Pool & Jacuzzi Rules',
    body: `<ul><li><strong>Jacuzzi:</strong> The jacuzzi is controlled remotely. Please request activation at least 30 minutes in advance so we can turn it on for you.</li><li><strong>Pool heating:</strong> The pool can be heated on request — heating takes up to 8–10 hours in winter. There is an additional <strong>$100/day service fee</strong> for heated pool requests.</li><li>No glass near the pool or jacuzzi.</li><li>Shower before entering — especially if coming from the beach or dusty outdoor areas.</li><li>Children must be supervised by an adult at all times near the pool and jacuzzi.</li><li>No diving — shallow end starts immediately.</li><li>Pool and jacuzzi are for registered guests only.</li></ul>`,
    images: [{ src: '/photos/vista-pointe/c045b79b-0bb4-4698-8391-c786c89d5550.jpeg', caption: 'Pool area — Vista Pointe' }],
    order: 2,
  },
  {
    id: 'house-rules-vista-tax',
    sectionKey: 'house_rules',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Transient Occupancy Tax (TOT)',
    body: `<p>This property is located in <strong>Bonita, CA</strong>, an unincorporated community within the County of San Diego. The county charges an <strong>8% Transient Occupancy Tax (TOT)</strong> on all stays of less than 30 days.</p><p>This tax is collected by the host through the Airbnb platform and remitted directly to the county. The tax is reflected in your Airbnb booking total and does not require any additional payment from guests.</p>`,
    images: [],
    order: 3,
  },

  // ─── THE HOME ─────────────────────────────────────────────────────────────

  {
    id: 'home-vista-overview',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Overview — 3792 Vista Pointe',
    body: `<p>This spacious 5-bedroom, 4-bathroom home is designed for comfortable group stays. With 10 beds sleeping up to 16 guests, a fully stocked kitchen, and resort-style outdoor amenities, you'll have everything you need for an unforgettable stay.</p><ul><li>5 Bedrooms · 4 Full Bathrooms</li><li>10 beds — sleeps up to 16 guests</li><li>Fully stocked kitchen with all appliances</li><li>Pool table & ping pong table in the living area</li><li>Smart TV in the living room</li><li>High-speed Wi-Fi throughout</li><li>Washer & dryer on-site</li></ul>`,
    images: [
      { src: '/photos/vista-pointe/e00570e1-ccf0-45cc-bd67-dc61d0baa3ec.jpeg', caption: 'Vista Pointe — Hilltop Home' },
      { src: '/photos/vista-pointe/7c018d78-10a5-4f73-88f9-ea9fd3d3811c.jpeg', caption: 'Living Room' },
      { src: '/photos/vista-pointe/4f8fbadc-df4d-488e-9f7b-633d1bc05398.jpeg', caption: 'Living Room 2' },
    ],
    order: 1,
  },
  {
    id: 'home-vista-bedrooms',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Bedrooms',
    body: `<ul><li><strong>Bedroom 1</strong> — Queen bed + sofa bed · En-suite bathroom · TV · AC · Crib available · Wardrobe</li><li><strong>Bedroom 2</strong> — Double bed</li><li><strong>Bedroom 3</strong> — King bed · En-suite bathroom</li><li><strong>Bedroom 4</strong> — Queen bed + sofa bed</li><li><strong>Bedroom 5</strong> — Double bed</li></ul><p>All bedrooms are furnished with bed linens, pillows, and extra blankets. Hangers and wardrobe space are provided in all rooms.</p>`,
    images: [
      { src: '/photos/vista-pointe/f95d804e-8785-41ce-ac4f-a0db399cd08e.jpeg', caption: 'Bedroom 1 — Queen Bed, En Suite' },
      { src: '/photos/vista-pointe/79247d82-7fda-4167-90ae-26424b5c467d.jpeg', caption: 'Bedroom 3 — King Bed, En Suite' },
      { src: '/photos/vista-pointe/1248ca54-7d20-4af7-b64c-c92a69784f81.jpeg', caption: 'Bedroom 4 — Queen Bed' },
    ],
    order: 2,
  },
  {
    id: 'home-vista-kitchen',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Kitchen & Dining',
    body: `<p>The kitchen is fully stocked with everything you need to cook for a large group:</p><ul><li>Full-size refrigerator & freezer</li><li>Oven, stove, microwave, toaster</li><li>Dishwasher · Rice maker · Blender · Coffee maker</li><li>Pots, pans, baking sheets, dishes, silverware, wine glasses</li><li>BBQ utensils, cooking basics, spices, and condiments</li><li>Ground coffee provided</li></ul><p>The dining area comfortably seats the full group.</p>`,
    images: [
      { src: '/photos/vista-pointe/850800ed-6c82-41b1-8c39-7b8640fb4fc8.jpeg', caption: 'Full Kitchen — Spectacular Views' },
      { src: '/photos/vista-pointe/32a42c88-73fa-4596-a4e8-342369daa971.jpeg', caption: 'Dining Area' },
    ],
    order: 3,
  },
  {
    id: 'home-vista-laundry',
    sectionKey: 'the_home',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Laundry',
    body: `<p>A washer and dryer are available on-site for guest use. Laundry detergent is provided — please check under the sink or in the laundry area.</p>`,
    images: [{ src: '/photos/vista-pointe/56f6229b-2cc6-48d7-8a9b-5fed6542fed6.jpeg', caption: 'Laundry Area — Washer & Dryer' }],
    order: 4,
  },

  // ─── OUTDOOR SPACES ───────────────────────────────────────────────────────

  {
    id: 'outdoor-vista-pool',
    sectionKey: 'outdoor_spaces',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Pool & Jacuzzi',
    body: `<p>The highlight of Vista Pointe is the stunning outdoor pool and jacuzzi with panoramic views.</p><ul><li><strong>Pool:</strong> Private outdoor swimming pool with sun loungers surrounding it. Pool heating available on request ($100/day — contact host in advance as heating takes 8–10 hours).</li><li><strong>Jacuzzi:</strong> Remote-controlled — request activation at least 30 minutes before you'd like to use it.</li><li><strong>Outdoor shower:</strong> Rinse off before entering — especially after hiking or beach visits.</li></ul>`,
    images: [
      { src: '/photos/vista-pointe/ad9adbcf-e8a0-465e-83b0-89098b2434be.jpeg', caption: 'Pool & Jacuzzi — Panoramic Views' },
      { src: '/photos/vista-pointe/c045b79b-0bb4-4698-8391-c786c89d5550.jpeg', caption: 'Pool — Vista Pointe' },
    ],
    order: 1,
  },
  {
    id: 'outdoor-vista-patio',
    sectionKey: 'outdoor_spaces',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Patio, BBQ & Fire Pit',
    body: `<ul><li><strong>Alfresco dining area</strong> with outdoor table and chairs — perfect for meals with a view.</li><li><strong>BBQ grill</strong> — charcoal/gas grill with BBQ utensils provided.</li><li><strong>Fire pit</strong> — gather around for evening conversations under the stars.</li><li><strong>Sun loungers</strong> — scattered around the pool for relaxing and sunbathing.</li></ul>`,
    images: [
      { src: '/photos/vista-pointe/vista-patio.avif', caption: 'Outdoor Patio — Al Fresco Dining' },
      { src: '/photos/vista-pointe/7aa4338f-a44c-4049-8e40-752d4fff9cf4.jpeg', caption: 'Patio — Fire Pit & Views' },
    ],
    order: 2,
  },

  // ─── SERVICES & MAINTENANCE ───────────────────────────────────────────────

  {
    id: 'services-vista',
    sectionKey: 'services_maintenance',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Services & Maintenance',
    body: `<p>We want your stay to be perfect. Here's how to handle common situations:</p><ul><li><strong>Something broken?</strong> Message the host immediately — we'll arrange a fix as quickly as possible.</li><li><strong>Pool/Jacuzzi issues:</strong> Contact the host if the jacuzzi is not responding or the pool needs attention.</li><li><strong>Power/utilities:</strong> Circuit breakers are in the utility room — the host can guide you if needed.</li><li><strong>Cleaning supplies:</strong> Basic cleaning products are provided under the kitchen sink.</li><li><strong>Trash:</strong> Bins are located outside the property. Details on trash day will be in your check-in message.</li></ul>`,
    images: [],
    order: 1,
  },

  // ─── VIDEO GUIDES ─────────────────────────────────────────────────────────

  {
    id: 'video-vista-tour',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Full Property Tour',
    body: `<p>A complete walkthrough of the home — all 5 bedrooms, living areas, kitchen, and outdoor spaces.</p>`,
    images: [{ src: '/photos/vista-pointe/ad9adbcf-e8a0-465e-83b0-89098b2434be.jpeg', caption: 'Vista Pointe Tour' }],
    link: 'https://drive.google.com/drive/folders/vista-pointe-videos',
    order: 1,
  },
  {
    id: 'video-vista-pool',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Pool & Jacuzzi Guide',
    body: `<p>How to use the pool and jacuzzi — including how to request remote activation and pool heating.</p>`,
    images: [{ src: '/photos/vista-pointe/c045b79b-0bb4-4698-8391-c786c89d5550.jpeg', caption: 'Pool & Jacuzzi' }],
    link: 'https://drive.google.com/drive/folders/vista-pointe-videos',
    order: 2,
  },
  {
    id: 'video-vista-kitchen',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Kitchen Walkthrough',
    body: `<p>Where to find everything in the kitchen — appliances, cookware, pantry staples, and more.</p>`,
    images: [{ src: '/photos/vista-pointe/32a42c88-73fa-4596-a4e8-342369daa971.jpeg', caption: 'Kitchen' }],
    link: 'https://drive.google.com/drive/folders/vista-pointe-videos',
    order: 3,
  },
  {
    id: 'video-vista-bbq',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'BBQ & Fire Pit Guide',
    body: `<p>How to use the outdoor BBQ grill and fire pit safely.</p>`,
    images: [{ src: '/photos/vista-pointe/ae20dbef-f498-459b-a3f2-cdc46ab9f825.jpeg', caption: 'BBQ & Outdoor Area' }],
    link: 'https://drive.google.com/drive/folders/vista-pointe-videos',
    order: 4,
  },
  {
    id: 'video-vista-entry',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Check-In & Entry Guide',
    body: `<p>Step-by-step video walkthrough for arriving at the property and entering with your door code.</p>`,
    images: [{ src: '/photos/vista-pointe/ad9adbcf-e8a0-465e-83b0-89098b2434be.jpeg', caption: 'Front Entrance' }],
    link: 'https://drive.google.com/drive/folders/vista-pointe-videos',
    order: 5,
  },
  {
    id: 'video-vista-checkout',
    sectionKey: 'videos',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Check-Out Instructions',
    body: `<p>Everything you need to do before you leave — stripping beds, dishes, trash, and more.</p>`,
    images: [{ src: '/photos/vista-pointe/ad9adbcf-e8a0-465e-83b0-89098b2434be.jpeg', caption: 'Vista Pointe' }],
    link: 'https://drive.google.com/drive/folders/vista-pointe-videos',
    order: 6,
  },

  // ─── LOCAL GUIDE ──────────────────────────────────────────────────────────

  {
    id: 'local-vista-sweetwater-park',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Sweetwater Summit Regional Park',
    body: `<p>Beautiful regional park with hiking trails, equestrian paths, and stunning reservoir views — just minutes away.</p>`,
    images: [{ src: '/images/local/marston-point.jpg', caption: 'Sweetwater Summit Regional Park' }],
    link: 'https://www.sandiegocounty.gov/content/sdc/parks/camping/sweetwater-summit',
    phone: null,
    order: 1,
  },
  {
    id: 'local-vista-chula-bayfront',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Chula Vista Bayfront',
    body: `<p>Enjoy waterfront walks, parks, and stunning San Diego Bay views at the Chula Vista Bayfront — about 15 minutes away.</p>`,
    images: [{ src: '/images/local/chula-vista-bayfront.jpg', caption: 'Chula Vista Bayfront' }],
    link: null,
    phone: null,
    order: 2,
  },
  {
    id: 'local-vista-downtown-sd',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Downtown San Diego',
    body: `<p>The Gaslamp Quarter, Petco Park, the waterfront, and San Diego's best restaurants — just 20 minutes north on I-805.</p>`,
    images: [{ src: '/images/local/downtown-san-diego.jpg', caption: 'Downtown San Diego' }],
    link: null,
    phone: null,
    order: 3,
  },
  {
    id: 'local-vista-coronado',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Coronado Island',
    body: `<p>White-sand beaches, the iconic Hotel del Coronado, and charming boutique shops — a stunning day trip 25 minutes away.</p>`,
    images: [{ src: '/images/local/coronado-island.jpg', caption: 'Coronado Island' }],
    link: 'https://coronadovisitorcenter.com',
    phone: null,
    order: 4,
  },
  {
    id: 'local-vista-otc',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Olympic Training Center',
    body: `<p>Tour the U.S. Olympic & Paralympic Training Center in Chula Vista — free public tours available on weekdays and Saturdays.</p>`,
    images: [{ src: '/images/local/marston-point.jpg', caption: 'Olympic Training Center — Chula Vista' }],
    link: 'https://www.teamusa.org/USOC-About/Facilities/Chula-Vista-Elite-Athlete-Training-Center',
    phone: null,
    order: 5,
  },
  {
    id: 'local-vista-border-field',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Border Field State Park',
    body: `<p>One of California's most unique state parks — where the Pacific Ocean meets the US-Mexico border. Great for birdwatching and coastal hikes.</p>`,
    images: [{ src: '/images/local/border-field.jpg', caption: 'Border Field State Park' }],
    link: null,
    phone: null,
    order: 6,
  },
  {
    id: 'local-vista-snooty-fox',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: "The Snooty Fox",
    body: `<p>A beloved neighborhood bar and restaurant right in Bonita. Great for casual dinners, drinks, and watching the game.</p>`,
    images: [{ src: '/images/local/snooty-fox.jpg', caption: 'The Snooty Fox — Bonita' }],
    link: null,
    phone: '(619) 656-0866',
    order: 7,
  },
  {
    id: 'local-vista-la-bella-pizza',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'La Bella Pizza',
    body: `<p>Local favorite for classic Italian-American pizza and pasta — great for feeding a big group. Located in nearby Bonita.</p>`,
    images: [{ src: '/images/local/la-bella-pizza.jpg', caption: 'La Bella Pizza' }],
    link: null,
    phone: null,
    order: 8,
  },
  {
    id: 'local-vista-vons-chula',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Vons Grocery — Bonita',
    body: `<p>Closest full-service grocery store — stock up on food, beverages, and anything you need for your stay.</p>`,
    images: [{ src: '/images/local/vons-grocery.jpg', caption: 'Vons Grocery — Bonita' }],
    link: null,
    phone: null,
    order: 9,
  },
  {
    id: 'local-vista-target-cv',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Target — Chula Vista',
    body: `<p>Full-size Target for all your essentials — about 10–15 minutes from the property in Chula Vista.</p>`,
    images: [{ src: '/images/local/vons-grocery.jpg', caption: 'Target — Chula Vista' }],
    link: null,
    phone: null,
    order: 10,
  },
  {
    id: 'local-vista-national-city-food',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'National City Filipino Food',
    body: `<p>National City is home to some of the best Filipino food in California — explore restaurants and bakeries just 10 minutes away.</p>`,
    images: [{ src: '/images/local/snooty-fox.jpg', caption: 'National City Food Scene' }],
    link: null,
    phone: null,
    order: 11,
  },
  {
    id: 'local-vista-tijuana',
    sectionKey: 'local_guide',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Tijuana Day Trip',
    body: `<p>Just 20 minutes south! Experience vibrant street food, famous tacos, craft beer, and culture. Cross via San Ysidro — walking across is easiest. Bring a valid passport.</p>`,
    images: [{ src: '/images/local/sd-oasis.jpg', caption: 'Tijuana Day Trip' }],
    link: null,
    phone: null,
    order: 12,
  },

  // ─── THINGS TO DO ─────────────────────────────────────────────────────────

  {
    id: 'todo-vista-hike-sweetwater',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Hike Sweetwater Summit',
    body: `<p>Explore miles of trails through Sweetwater Summit Regional Park, just minutes from the property. Great for all fitness levels with stunning reservoir and valley views.</p>`,
    images: [{ src: '/images/local/marston-point.jpg', caption: 'Sweetwater Summit Trails' }],
    link: 'https://www.sandiegocounty.gov/content/sdc/parks/camping/sweetwater-summit',
    order: 1,
  },
  {
    id: 'todo-vista-kayak-otay',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Kayak Lower Otay Lake',
    body: `<p>Rent kayaks or fish at Lower Otay Lake — a beautiful reservoir surrounded by hills just 15 minutes away. Permits required for fishing.</p>`,
    images: [{ src: '/images/local/everyday-california.jpg', caption: 'Kayaking — Lower Otay Lake' }],
    link: null,
    order: 2,
  },
  {
    id: 'todo-vista-coronado-beach',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Coronado Beach',
    body: `<p>One of the most beautiful beaches in the country — wide white sand, gentle waves, and the iconic Hotel del Coronado as your backdrop. About 25 minutes away.</p>`,
    images: [{ src: '/images/local/sweetwater-summit.jpg', caption: 'Coronado Beach' }],
    link: null,
    order: 3,
  },
  {
    id: 'todo-vista-gaslamp',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Gaslamp Quarter Nightlife',
    body: `<p>San Diego's premier entertainment district — dozens of bars, restaurants, and clubs. Take an Uber for a fun group night out — about 20 minutes away.</p>`,
    images: [{ src: '/images/local/olympic-training.jpg', caption: 'Gaslamp Quarter' }],
    link: null,
    order: 6,
  },
  {
    id: 'todo-vista-otc-tour',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Olympic Training Center Tour',
    body: `<p>Free public tours of the U.S. Olympic & Paralympic Training Center in Chula Vista — see world-class athletic facilities and learn about Team USA athletes training there.</p>`,
    images: [{ src: '/images/local/marston-point.jpg', caption: 'Olympic Training Center — Chula Vista' }],
    link: 'https://www.teamusa.org',
    order: 7,
  },
  {
    id: 'todo-vista-tijuana-tacos',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Tijuana Taco Trail',
    body: `<p>Cross the border for the best tacos of your life! Try Tacos El Gordo (also has San Diego locations), adobada, carne asada, and freshly made tortillas. Passport required.</p>`,
    images: [{ src: '/images/local/sd-oasis.jpg', caption: 'Tijuana Taco Trail' }],
    link: null,
    order: 8,
  },
  {
    id: 'todo-vista-balboa',
    sectionKey: 'things_to_do',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Balboa Park',
    body: `<p>Explore museums, gardens, the Botanical Building, and the iconic Spanish Colonial architecture of Balboa Park — San Diego's crown jewel. About 25 minutes away.</p>`,
    images: [{ src: '/images/local/kayak-la-jolla.jpg', caption: 'Balboa Park' }],
    link: 'https://balboapark.org',
    order: 9,
  },

  // ─── TRANSPORT ────────────────────────────────────────────────────────────

  {
    id: 'transport-vista',
    sectionKey: 'transport',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Getting Around from Vista Pointe',
    body: `<ul><li><strong>Uber / Lyft</strong> — Most convenient for group outings to downtown San Diego, the beach, or restaurants. 15–25 minutes to most attractions.</li><li><strong>Car recommended</strong> — Bonita is a suburban hillside community; having a car makes exploring much easier.</li><li><strong>MTS Bus</strong> — Bus stops accessible within a short drive. The 701 and 709 routes connect to downtown San Diego and the trolley system.</li><li><strong>San Diego Trolley (Blue Line)</strong> — The nearest trolley station is H Street in Chula Vista (~10 min drive). Runs to downtown and the border.</li><li><strong>Airport (SAN)</strong> — San Diego International Airport is approximately 20–25 minutes away via I-5 or I-805.</li></ul>`,
    images: [],
    order: 1,
  },

  // ─── CHECKOUT ─────────────────────────────────────────────────────────────

  {
    id: 'checkout-time-vista',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Check-Out Time',
    body: `<p>Please check out by <strong>11:00 AM</strong>. If you need a late check-out, contact the host at least 24 hours in advance — we will do our best to accommodate, subject to availability.</p>`,
    images: [],
    order: 1,
  },
  {
    id: 'checkout-vista-pool',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Pool & Outdoor Areas',
    body: `<ul><li>Please ensure the pool area is clean — collect any items left around the pool.</li><li>If the jacuzzi cover is removable, replace it before leaving.</li><li>Extinguish any remaining embers in the fire pit and close the BBQ lid.</li><li>Return any outdoor furniture to its original position.</li></ul>`,
    images: [],
    order: 2,
  },
  {
    id: 'checkout-instructions-vista',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Before You Go',
    body: `<ol><li>Strip the beds — leave all used linens on the floor in the bedroom.</li><li>Wash all dishes and return them to the cabinets.</li><li>Take all trash to the bins outside.</li><li>Empty the refrigerator of any perishable items you brought.</li><li>Turn off all lights, fans, and electronics.</li><li>Lock all doors and windows before leaving.</li><li>Send your host a quick message to let them know you have checked out.</li></ol>`,
    images: [],
    order: 3,
  },
  {
    id: 'checkout-legal-vista',
    sectionKey: 'checkout',
    type: 'property',
    propertySlug: 'vista-pointe',
    title: 'Legal Notice',
    body: `<p>TALO Rentals operates under a valid short-term rental permit issued by the City of San Diego. Guests agree to comply with all local ordinances regarding noise, occupancy, and parking. The property is located in a residential neighborhood — please be respectful of neighbors at all times.</p><p>TALO Rentals is not liable for personal injury, theft, or property damage resulting from misuse of the property or its amenities. Guests assume full responsibility for their own safety and the safety of their group.</p>`,
    images: [],
    order: 4,
  },
]

const STORAGE_KEY = 'talo_content_blocks_v8'

// One-time fix for the Hawk Street bedroom image mismatches that shipped in
// earlier datasets (bathroom and living-room photos appeared in the bedroom
// grid). Only rewrites blocks whose image arrays still match the original
// known-broken signature — preserves any admin edits.
function _migrateHawkBedroomImages(blocks) {
  // Each entry: block id, signature of the original (broken) image srcs, and the corrected images array.
  const FIXES = [
    {
      id: 'space-hawk-bedrooms-1f',
      sig: [
        '/photos/hawk-street/p10_img1_848x567.jpeg',
        '/photos/hawk-street/p10_img2_848x567.jpeg',
        '/photos/hawk-street/p10_img3_848x567.jpeg',
        '/photos/hawk-street/p10_img4_848x567.jpeg',
      ],
      images: [
        { src: '/photos/hawk-street/p10_img2_848x567.jpeg', caption: 'Bedroom — Queen Bed' },
        { src: '/photos/hawk-street/p10_img3_848x567.jpeg', caption: 'Bedroom — Queen Bed' },
        { src: '/photos/hawk-street/p10_img1_848x567.jpeg', caption: 'Bedroom 4 — Bunk Beds' },
      ],
    },
    {
      id: 'space-hawk-bedrooms-2f',
      sig: [
        '/photos/hawk-street/p13_img1_848x567.jpeg',
        '/photos/hawk-street/p13_img2_848x567.jpeg',
        '/photos/hawk-street/p13_img3_848x567.jpeg',
        '/photos/hawk-street/p13_img4_848x567.jpeg',
      ],
      images: [
        { src: '/photos/hawk-street/p13_img3_848x567.jpeg', caption: '2F Bedroom — Queen Bed' },
        { src: '/photos/hawk-street/p13_img4_848x567.jpeg', caption: '2F Bedroom — 2 Queen Beds' },
      ],
    },
    {
      id: 'space-hawk-outdoor',
      sig: [
        '/photos/hawk-street/p16_img1_831x555.jpeg',
        '/photos/hawk-street/p16_img2_1272x850.jpeg',
        '/photos/hawk-street/p16_img3_831x555.jpeg',
        '/photos/hawk-street/p16_img4_1272x850.jpeg',
      ],
      images: [
        { src: '/photos/hawk-street/p16_img1_831x555.jpeg', caption: 'Balcony — BBQ & City Views' },
        { src: '/photos/hawk-street/p16_img2_1272x850.jpeg', caption: 'Outdoor Patio — Sunset Views' },
        { src: '/photos/hawk-street/p16_img4_1272x850.jpeg', caption: 'Covered Patio & Bar' },
      ],
    },
    {
      id: 'space-reynard-bedrooms',
      sig: [
        '/photos/reynard-way/p9_img1_504x336.png',
        '/photos/reynard-way/p9_img2_504x336.png',
        '/photos/reynard-way/p9_img3_504x336.png',
        '/photos/reynard-way/p9_img4_504x334.png',
      ],
      images: [
        { src: '/photos/reynard-way/p9_img1_504x336.png', caption: 'Bedroom 1 — Queen Bed' },
        { src: '/photos/reynard-way/p9_img2_504x336.png', caption: 'Bedroom 2 — Queen Bed' },
        { src: '/photos/reynard-way/p9_img4_504x334.png', caption: 'Bedroom 4 — Full Beds (Master)' },
      ],
    },
    {
      id: 'space-reynard-studio',
      sig: [
        '/photos/reynard-way/p12_img1_504x336.png',
        '/photos/reynard-way/p12_img2_504x335.png',
        '/photos/reynard-way/p12_img3_600x398.png',
        '/photos/reynard-way/p12_img4_504x336.png',
      ],
      images: [
        { src: '/photos/reynard-way/p12_img1_504x336.png', caption: 'Studio — Kitchenette' },
        { src: '/photos/reynard-way/p12_img3_600x398.png', caption: 'Studio — Seating Area & Murphy Bed' },
        { src: '/photos/reynard-way/p12_img4_504x336.png', caption: 'Studio — Overview' },
      ],
    },
  ]
  return blocks.map(b => {
    const fix = FIXES.find(f => f.id === b.id)
    if (!fix) return b
    const srcs = (b.images || []).map(i => i.src)
    if (srcs.length === fix.sig.length && srcs.every((s, i) => s === fix.sig[i])) {
      return { ...b, images: fix.images }
    }
    return b
  })
}

// Priority 1: admin v2 published data (highest authority — admin's own browser)
const _adminV2Raw = typeof localStorage !== 'undefined' ? localStorage.getItem('talo_admin_v2_live') : null
let _usedLiveData = false
if (_adminV2Raw) {
  try {
    const _adminV2Live = JSON.parse(_adminV2Raw)
    if (Array.isArray(_adminV2Live?.blocks)) {
      _blocks = _migrateHawkBedroomImages(_adminV2Live.blocks)
      _adminV2Live.blocks = _blocks
      try { localStorage.setItem('talo_admin_v2_live', JSON.stringify(_adminV2Live)) } catch {}
      _usedLiveData = true
    }
  } catch {}
}
if (!_usedLiveData) {
  // Priority 2: guest cache populated by firebaseSync from Firestore on prior
  // visits. This is the REAL published content, so returning guests render the
  // correct images on first paint instead of flashing the built-in defaults
  // before the live snapshot arrives.
  const _guestRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('talo_v3_guest_cache') : null
  if (_guestRaw) {
    try {
      const _guest = JSON.parse(_guestRaw)
      if (Array.isArray(_guest?.blocks) && _guest.blocks.length > 0) {
        _blocks = _migrateHawkBedroomImages(_guest.blocks)
        _usedLiveData = true
      }
    } catch {}
  }
  // Priority 3: legacy admin v1 / persisted defaults (talo only)
  if (!_usedLiveData) {
    const _savedRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (_savedRaw) {
      try { _blocks = _migrateHawkBedroomImages(JSON.parse(_savedRaw)) } catch {}
    }
  }
}
// Always apply migration to in-memory defaults too, so a fresh install is correct.
_blocks = _migrateHawkBedroomImages(_blocks)
// For non-talo tenants with no published content, use empty sections rather
// than leaking TALO's hardcoded sample data to their guests.
if (!_usedLiveData && getTenantId() !== DEFAULT_TENANT_ID) {
  _blocks = []
}

function _persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_blocks))
  } catch (e) { /* ignore */ }
}

let _listeners = []

function notify() {
  _listeners.forEach((fn) => fn())
}

export const contentStore = {
  // Returns all blocks for a section, filtered by property (shared + matching property),
  // sorted: shared first, then property-specific, each group by order.
  getBlocksForSection: (sectionKey, propertySlug) => {
    return _blocks
      .filter((b) => {
        if (b.sectionKey !== sectionKey) return false
        if (b.type === 'shared') {
          if (!b.sharedWith || b.sharedWith === 'all') return true
          if (Array.isArray(b.sharedWith)) return b.sharedWith.includes(propertySlug)
          return true
        }
        return b.type === 'property' && b.propertySlug === propertySlug
      })
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'shared' ? -1 : 1
        return (a.order || 99) - (b.order || 99)
      })
  },

  getAllBlocks: () => [..._blocks],

  getBlocksBySection: (sectionKey) => _blocks.filter((b) => b.sectionKey === sectionKey),

  getBlock: (id) => _blocks.find((b) => b.id === id),

  addBlock: (block) => {
    const newBlock = { ...block, id: `block-${Date.now()}` }
    _blocks = [..._blocks, newBlock]
    _persist()
    notify()
    return newBlock
  },

  updateBlock: (id, updates) => {
    _blocks = _blocks.map((b) => b.id === id ? { ...b, ...updates } : b)
    _persist()
    notify()
  },

  deleteBlock: (id) => {
    _blocks = _blocks.filter((b) => b.id !== id)
    _persist()
    notify()
  },

  subscribe: (fn) => {
    _listeners.push(fn)
    return () => { _listeners = _listeners.filter((l) => l !== fn) }
  },

  reloadFromLive: (blocks) => {
    if (Array.isArray(blocks)) {
      _blocks = _migrateHawkBedroomImages([...blocks])
      notify()
    }
  },
}
