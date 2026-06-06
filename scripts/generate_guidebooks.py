#!/usr/bin/env python3
"""
Generate shareable, print-friendly HTML guidebooks for all TALO properties.
Images are embedded as base64 for true portability — open in any browser, print to PDF cleanly.
"""

import os, base64, mimetypes

PHOTOS_BASE = '/Users/anantgyan/talo-guidebook/public/photos'
OUTPUT_DIR  = '/Users/anantgyan/talo-guidebook/dist-html'
os.makedirs(OUTPUT_DIR, exist_ok=True)

def b64img(path, max_kb=400):
    """Return a base64 data URI for the image at path, or '' if not found / too large."""
    if not path or not os.path.exists(path):
        return ''
    if os.path.getsize(path) > max_kb * 1024:
        # Downsample large images via PIL if available, else skip
        try:
            from PIL import Image
            import io
            img = Image.open(path)
            img.thumbnail((1200, 900))
            buf = io.BytesIO()
            fmt = 'JPEG' if path.lower().endswith(('.jpg','.jpeg')) else 'PNG'
            img.save(buf, format=fmt, quality=72)
            data = base64.b64encode(buf.getvalue()).decode()
            mime = 'image/jpeg' if fmt == 'JPEG' else 'image/png'
            return f'data:{mime};base64,{data}'
        except ImportError:
            return ''
    mime, _ = mimetypes.guess_type(path)
    mime = mime or 'image/jpeg'
    with open(path, 'rb') as f:
        data = base64.b64encode(f.read()).decode()
    return f'data:{mime};base64,{data}'

def img_tag(src_rel, alt='', cls='', style='', slug=None):
    """Return an <img> tag with base64 embedded image."""
    if not src_rel:
        return ''
    # Strip leading slash
    rel = src_rel.lstrip('/')
    # rel is like "photos/reynard-way/file.jpeg"
    full = os.path.join('/Users/anantgyan/talo-guidebook/public', rel)
    uri = b64img(full)
    if not uri:
        return ''
    attrs = f'src="{uri}" alt="{alt}"'
    if cls:
        attrs += f' class="{cls}"'
    if style:
        attrs += f' style="{style}"'
    return f'<img {attrs}>'

# ─── CSS ──────────────────────────────────────────────────────────────────────
CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1c1917; font-size: 14px; line-height: 1.6; }

/* ── Cover page ── */
.cover { page-break-after: always; min-height: 100vh; display: flex; flex-direction: column; }
.cover-hero { position: relative; height: 55vh; overflow: hidden; background: #1e3a5f; }
.cover-hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cover-hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%); }
.cover-hero-text { position: absolute; bottom: 0; left: 0; right: 0; padding: 40px; color: #fff; }
.cover-badge { display: inline-block; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 100px; padding: 4px 14px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #fff; margin-bottom: 12px; }
.cover-title { font-size: 38px; font-weight: 800; line-height: 1.15; margin-bottom: 8px; }
.cover-address { font-size: 15px; opacity: 0.85; }
.cover-body { flex: 1; padding: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.stat-card { background: #f8f7f5; border-radius: 16px; padding: 20px 24px; }
.stat-card h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; margin-bottom: 12px; }
.stat-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e7e5e4; font-size: 13px; }
.stat-row:last-child { border-bottom: none; }
.stat-row .label { color: #78716c; }
.stat-row .value { font-weight: 700; color: #1c1917; }
.amenity-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.amenity-chip { background: #fff1eb; color: #c2410c; border-radius: 100px; padding: 4px 12px; font-size: 12px; font-weight: 600; border: 1px solid rgba(194,65,12,0.15); }
.cover-welcome { grid-column: 1 / -1; background: linear-gradient(135deg, #7C2D12, #EA580C); border-radius: 16px; padding: 28px; color: #fff; }
.cover-welcome h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.75; margin-bottom: 8px; }
.cover-welcome p { font-size: 15px; line-height: 1.7; }

/* ── Sections ── */
.toc-page { page-break-after: always; padding: 48px; }
.toc-page h2 { font-size: 28px; font-weight: 800; margin-bottom: 32px; color: #1c1917; }
.toc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.toc-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f8f7f5; border-radius: 12px; font-size: 13px; font-weight: 600; }
.toc-num { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #C84B31, #EA580C); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }

.section { page-break-before: always; padding: 48px; }
.section:first-of-type { page-break-before: auto; }
.section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #f0ece8; }
.section-icon { width: 48px; height: 48px; border-radius: 16px; background: linear-gradient(135deg, #C84B31, #EA580C); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-icon svg { width: 24px; height: 24px; fill: white; }
.section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #C84B31; margin-bottom: 2px; }
.section-title { font-size: 24px; font-weight: 800; color: #1c1917; }

/* ── Content blocks ── */
.block { margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #f0ece8; }
.block:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.block-title { font-size: 16px; font-weight: 700; color: #1c1917; margin-bottom: 10px; }
.block-body { color: #57534e; font-size: 14px; line-height: 1.7; }
.block-body ul, .block-body ol { padding-left: 20px; margin-top: 6px; }
.block-body li { margin-bottom: 4px; }
.block-body strong { font-weight: 700; color: #1c1917; }
.block-body p { margin-bottom: 8px; }
.block-body p:last-child { margin-bottom: 0; }

/* ── Photo grids ── */
.photo-grid { display: grid; gap: 12px; margin-top: 16px; }
.photo-grid.cols-1 { grid-template-columns: 1fr; }
.photo-grid.cols-2 { grid-template-columns: 1fr 1fr; }
.photo-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
.photo-grid.cols-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
.photo-item { border-radius: 12px; overflow: hidden; border: 1px solid #e7e5e4; }
.photo-item img { width: 100%; object-fit: cover; display: block; }
.photo-item.tall img { height: 280px; }
.photo-item.med img { height: 200px; }
.photo-item.sm img { height: 150px; }
.photo-cap { padding: 6px 10px; font-size: 11px; color: #78716c; text-align: center; background: #faf9f8; }

/* ── Gallery strip ── */
.gallery { margin-top: 16px; }
.gallery-strip { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
.gallery-strip .photo-item img { height: 130px; }

/* ── Print ── */
@media print {
  body { font-size: 13px; }
  .cover { min-height: auto; }
  .cover-hero { height: 45vh; }
  .section, .cover { page-break-inside: avoid; }
  .block { page-break-inside: avoid; }
  .photo-grid { page-break-inside: avoid; }
}
@page { margin: 0; size: A4; }
"""

# ─── Property definitions ─────────────────────────────────────────────────────
PROPERTIES = {

  'reynard-way': {
    'name': '3003 Reynard Way',
    'tagline': 'Welcome to Reynard Way!',
    'address': '3003 Reynard Way, San Diego, CA 92103',
    'neighborhood': 'Mission Hills',
    'hero': 'photos/reynard-way/p2_img1_2007x1505.jpeg',
    'exterior': 'photos/reynard-way/p7_img1_720x480.png',
    'bedrooms': 7, 'bathrooms': '4.5', 'beds': 18, 'guests': 22,
    'pets': 'Yes ($75/pet)', 'checkin': '4:00 PM', 'checkout': '11:00 AM',
    'welcome': 'We hope you enjoy your stay in one of the most vibrant, historical, and central parts of San Diego! This guidebook contains everything you need to know about the property and surrounding area. Thank you for choosing us as your host!',
    'wifi_network': 'SD Mission Hills', 'wifi_pass': 'SDOasis3003',
    'amenities': ['Pool Table', 'Ping Pong Table', 'Hot Tub', 'Smart TV', 'High-Speed WiFi (1Gbps)', 'Washer + Dryer (×2)', 'Fully Stocked Kitchen', 'Outdoor Patio', 'Front Yard', 'Baby Highchair', 'Motorized Shades (Studio)', 'Ceiling TV (Studio)'],
    'sections': [
      { 'key': 'entry', 'title': 'How to Enter', 'content': [
        { 'h': 'Entering Reynard Way', 'body': '<ol><li>The main entrance is on Reynard Way — up a small set of stairs to the right.</li><li>Your door code will be sent to you on the day of check-in.</li><li>Enter the 4-digit code on the keypad — no button to press after.</li><li>The lock pad will flash green when the code is accepted.</li></ol>',
          'photos': [('photos/reynard-way/p7_img1_720x480.png', 'Main entrance — keypad lock')] },
      ]},
      { 'key': 'parking', 'title': 'Parking', 'content': [
        { 'h': 'Parking at Reynard Way', 'body': '<ul><li>Assigned parking is in the carport behind the house on Eagle Street — first driveway on the right.</li><li>The carport has 2 assigned spots; double-park behind your own cars for a 3rd.</li><li>For unloading, pull up in front of the house on Reynard Way.</li><li>Street parking available on Eagle St. and Reynard Way.</li><li>One spot directly in front of the house (curb cut) — often available.</li></ul>',
          'photos': [('photos/reynard-way/p6_img1_840x560.png', 'Carport — Eagle Street')] },
      ]},
      { 'key': 'wifi', 'title': 'Wi-Fi', 'content': [
        { 'h': 'Wi-Fi Details', 'body': '<p><strong>Network:</strong> SD Mission Hills<br><strong>Password:</strong> SDOasis3003</p><p>1Gbps high-speed internet with Wi-Fi extenders throughout the house and outdoor areas.</p>', 'photos': [] },
      ]},
      { 'key': 'house_rules', 'title': 'House Rules', 'content': [
        { 'h': 'General Rules', 'body': '<ul><li>Max occupancy: 22 guests.</li><li>No smoking anywhere on the property.</li><li>Pets welcome — $75 per pet fee, keep off furniture.</li><li>No parties without host approval.</li><li>Quiet hours: 10 PM – 8 AM.</li></ul>', 'photos': [] },
        { 'h': 'Hot Tub Rules', 'body': '<ul><li>Rinse off sand before entering — no glass items near the tub.</li><li>Replace the cover when not in use.</li><li>No more than 6 people in the hot tub at once.</li><li>Children must be supervised by an adult at all times.</li></ul>', 'photos': [] },
      ]},
      { 'key': 'the_home', 'title': 'The Home', 'content': [
        { 'h': 'Overview — 3003 Reynard Way', 'body': '<ul><li>7 Bedrooms · 4.5 Bathrooms · 18 beds · Sleeps up to 22 guests</li><li>5 Queen beds · 3 Full beds · 4 Sofa beds</li><li>4 Full bathrooms · 1 Half bathroom</li><li>2 Washer/dryer sets (main floor + lowest level)</li><li>Pool table ⟷ Ping pong table in living room</li><li>Studio with Murphy bed, motorized shades, ceiling-mounted TV</li></ul>',
          'photos': [('photos/reynard-way/p10_img1_600x396.png', 'Living Room'), ('photos/reynard-way/p10_img2_600x397.png', 'Dining Room')] },
        { 'h': 'Bedrooms', 'body': '<ul><li>Bedroom 1 — Queen Bed</li><li>Bedroom 2 — Queen Bed</li><li>Bedroom 3 — Queen Bed</li><li>Bedroom 4 — Full Beds (Master)</li><li>Studio — Murphy Bed + Sofa Bed</li></ul>',
          'photos': [('photos/reynard-way/p9_img1_504x336.png','Bedroom 1 — Queen'),('photos/reynard-way/p9_img2_504x336.png','Bedroom 2 — Queen'),('photos/reynard-way/p9_img3_504x336.png','Bedroom 3 — Queen'),('photos/reynard-way/p9_img4_504x334.png','Bedroom 4 — Full Beds (Master)')] },
        { 'h': 'Kitchen', 'body': '<p>Fully stocked with pots, pans, dishes, cutlery, spices, cooking oil, and basic dry goods. Paper towels and cleaning supplies also provided. Large wood dining table seats 8–10.</p>',
          'photos': [('photos/reynard-way/p11_img1_840x557.png', 'Kitchen — Fully Stocked')] },
        { 'h': 'Studio', 'body': '<p>Adjacent to the dining room on the main level. Separate bathroom, full-size Murphy bed, motorized shades (remote controlled), ceiling-mounted TV with motorized arm. Portable heater and AC unit available.</p>',
          'photos': [('photos/reynard-way/p12_img1_504x336.png','Studio — Murphy Bed'),('photos/reynard-way/p12_img2_504x335.png','Seating Area'),('photos/reynard-way/p12_img3_600x398.png','Bathroom'),('photos/reynard-way/p12_img4_504x336.png','Kitchenette')] },
      ]},
      { 'key': 'outdoor_spaces', 'title': 'Outdoor Spaces', 'content': [
        { 'h': 'Back Patio & Hot Tub', 'body': '<ul><li>Large back patio with sectional couches, table, chairs, benches, and four solar umbrellas.</li><li>Hot Tub — rinse off before entering, no glass items, cover when not in use.</li><li>Front yard with seating and umbrella.</li></ul>',
          'photos': [('photos/reynard-way/p14_img1_576x397.png','Back Patio — Sectional Seating'),('photos/reynard-way/p14_img2_600x399.png','Hot Tub')] },
      ]},
      { 'key': 'checkout', 'title': 'Check-Out', 'content': [
        { 'h': 'Before You Go', 'body': '<ol><li>Strip the beds — leave all used linens on the floor.</li><li>Wash all dishes and return to cabinets.</li><li>Take all trash to the bins outside.</li><li>Empty the refrigerator of any perishables.</li><li>Turn off all lights, fans, and electronics.</li><li>Lock all doors and windows.</li><li>Send the host a message confirming check-out.</li></ol><p><strong>Check-out time: 11:00 AM.</strong></p>', 'photos': [] },
      ]},
    ],
    'gallery': [
      'photos/reynard-way/p2_img1_2007x1505.jpeg',
      'photos/reynard-way/p7_img1_720x480.png',
      'photos/reynard-way/p9_img1_504x336.png',
      'photos/reynard-way/p10_img1_600x396.png',
      'photos/reynard-way/p11_img1_840x557.png',
      'photos/reynard-way/p12_img1_504x336.png',
      'photos/reynard-way/p14_img1_576x397.png',
      'photos/reynard-way/p14_img2_600x399.png',
    ],
  },

  'hawk-street': {
    'name': '3701-03 Hawk Street',
    'tagline': 'Welcome to Hawk Street!',
    'address': '3701-03 Hawk St, San Diego, CA 92103',
    'neighborhood': 'Mission Hills',
    'hero': 'photos/hawk-street/p2_img1_2007x1505.jpeg',
    'exterior': 'photos/hawk-street/p6_img1_1272x850.jpeg',
    'bedrooms': 7, 'bathrooms': '4.5', 'beds': 18, 'guests': 16,
    'pets': 'No', 'checkin': '4:00 PM', 'checkout': '11:00 AM',
    'welcome': 'We hope you enjoy your stay in one of the most vibrant, historical, and central areas of San Diego! This duplex features two fully-equipped floors, each with their own living areas, kitchens, and beautiful spaces.',
    'wifi_network': 'KETTLESNEST', 'wifi_pass': '3701&3703',
    'amenities': ['Pool Table', 'Ping Pong Table', 'Foosball Table', 'Smart TV', 'Movie Projector', 'BBQ Grill', 'Balcony + Patio', 'High-Speed WiFi (1Gbps)', 'Washer + Dryer (×2)', 'Two Full Kitchens', 'City Skyline Views', 'Baby Highchair (×2)'],
    'sections': [
      { 'key': 'entry', 'title': 'How to Enter', 'content': [
        { 'h': 'Entering Hawk Street', 'body': '<ol><li>First floor entrance: right side of the home, digital lock.</li><li>Second floor entrance: top of the far-left stairs, digital lock.</li><li>Your door codes will be sent on the day of check-in.</li><li>Enter the 4-digit code — no button press needed after.</li><li>Lock flashes green when accepted.</li><li>Use the lower entrance as your primary entrance to minimise noise.</li></ol>',
          'photos': [('photos/hawk-street/p7_img1_1108x740.jpeg','First floor entrance'),('photos/hawk-street/p8_img1_1272x850.jpeg','Second floor entrance')] },
      ]},
      { 'key': 'parking', 'title': 'Parking', 'content': [
        { 'h': 'Parking at Hawk Street', 'body': '<ul><li>Maximum of 3 vehicles in the driveway.</li><li>Pull the first car as far right as possible, then double-park the second behind it.</li><li>With 2 on the right side, a 3rd car can fit on the left.</li><li>No car may block the sidewalk.</li><li>Contact the host for street parking guidance if you have more than 3 cars.</li></ul>',
          'photos': [('photos/hawk-street/p6_img1_1272x850.jpeg','Driveway — up to 3 vehicles')] },
      ]},
      { 'key': 'wifi', 'title': 'Wi-Fi', 'content': [
        { 'h': 'Wi-Fi Details', 'body': '<p><strong>Network:</strong> KETTLESNEST<br><strong>Password:</strong> 3701&amp;3703</p><p>1Gbps high-speed internet with Wi-Fi extenders throughout both floors and outdoor areas.</p>', 'photos': [] },
      ]},
      { 'key': 'house_rules', 'title': 'House Rules', 'content': [
        { 'h': 'General Rules', 'body': '<ul><li>Max occupancy: 16 guests.</li><li>No smoking anywhere on the property.</li><li>No pets.</li><li>No parties without host approval.</li><li>Quiet hours: 10 PM – 8 AM.</li><li>Use the lower entrance as the primary entrance.</li></ul>', 'photos': [] },
      ]},
      { 'key': 'the_home', 'title': 'The Home', 'content': [
        { 'h': '1st Floor', 'body': '<ul><li>4 Bedrooms: Queen · King · Full · Bunk beds + trundle</li><li>2 full bathrooms + 1 half bathroom</li><li>Smart TV, pool table, ping pong, foosball table</li><li>Sofa bed in TV room</li><li>Full kitchen · Dining table seats 8 · Highchair · Balcony with stunning views</li></ul>',
          'photos': [('photos/hawk-street/p10_img1_848x567.jpeg','BR1 — Queen'),('photos/hawk-street/p10_img2_848x567.jpeg','BR2 — King'),('photos/hawk-street/p11_img1_848x567.jpeg','1F Living Room'),('photos/hawk-street/p11_img2_1272x850.jpeg','1F Dining')] },
        { 'h': '2nd Floor', 'body': '<ul><li>3 Bedrooms: 3 Queens + 2 Queen sofa beds in common area</li><li>2 full bathrooms</li><li>Large sectional sofa · Drop-down projector for movies · City skyline views</li><li>Full kitchen · Dining table seats 10 · Highchair</li><li>Washer/dryer on covered outdoor patio</li></ul>',
          'photos': [('photos/hawk-street/p13_img1_848x567.jpeg','2F BR1 — Queen'),('photos/hawk-street/p14_img1_1272x850.jpeg','2F Living Room'),('photos/hawk-street/p15_img1_1108x740.jpeg','2F Kitchen')] },
        { 'h': 'Kitchens', 'body': '<p>Both floors have fully stocked kitchens with cookware, utensils, spices, and basic cooking ingredients. Please keep materials on the correct floor for the cleaning staff.</p>',
          'photos': [('photos/hawk-street/p12_img1_1108x740.jpeg','1F Kitchen'),('photos/hawk-street/p15_img1_1108x740.jpeg','2F Kitchen')] },
      ]},
      { 'key': 'outdoor_spaces', 'title': 'Outdoor Spaces', 'content': [
        { 'h': 'Balcony & Patio', 'body': '<p>Spacious balcony with cozy patio, comfortable chairs, and BBQ grill — perfect for enjoying San Diego sunsets. Covered patio on 2nd floor has the washer/dryer.</p>',
          'photos': [('photos/hawk-street/p16_img1_831x555.jpeg','Balcony — BBQ & Seating'),('photos/hawk-street/p16_img2_1272x850.jpeg','Patio — Sunset Views')] },
      ]},
      { 'key': 'checkout', 'title': 'Check-Out', 'content': [
        { 'h': 'Before You Go', 'body': '<ol><li>Strip all beds on both floors — leave linens on the floor.</li><li>Wash all dishes on both floors and return to cabinets.</li><li>Take all trash to the 8 bins outside (4 in parking, 4 near upper stairs).</li><li>Empty both refrigerators of perishables.</li><li>Turn off all lights, fans, and electronics on both floors.</li><li>Lock all doors and windows.</li><li>Send the host a check-out message.</li></ol><p><strong>Check-out time: 11:00 AM.</strong></p>', 'photos': [] },
      ]},
    ],
    'gallery': [
      'photos/hawk-street/p2_img1_2007x1505.jpeg',
      'photos/hawk-street/p6_img1_1272x850.jpeg',
      'photos/hawk-street/p10_img1_848x567.jpeg',
      'photos/hawk-street/p11_img1_848x567.jpeg',
      'photos/hawk-street/p12_img1_1108x740.jpeg',
      'photos/hawk-street/p13_img1_848x567.jpeg',
      'photos/hawk-street/p14_img1_1272x850.jpeg',
      'photos/hawk-street/p16_img1_831x555.jpeg',
    ],
  },

  'vista-pointe': {
    'name': '3792 Vista Pointe',
    'tagline': 'Welcome to Vista Pointe!',
    'address': '3792 Vista Pointe, Bonita, CA 91902',
    'neighborhood': 'Bonita',
    'hero': 'photos/vista-pointe/ad9adbcf-e8a0-465e-83b0-89098b2434be.jpeg',
    'exterior': 'photos/vista-pointe/ad9adbcf-e8a0-465e-83b0-89098b2434be.jpeg',
    'bedrooms': 5, 'bathrooms': 4, 'beds': 10, 'guests': 16,
    'pets': 'Yes', 'checkin': '4:00 PM', 'checkout': '11:00 AM',
    'welcome': 'We hope you enjoy your stay at this stunning 5-bedroom home in Bonita, CA! Perched on a hill with breathtaking views, a sparkling pool, and a jacuzzi, this retreat is the perfect escape for groups and families.',
    'wifi_network': '[Provided at check-in]', 'wifi_pass': '[Provided at check-in]',
    'amenities': ['Private Pool', 'Jacuzzi', 'Pool Table', 'Ping Pong Table', 'Fire Pit', 'BBQ Grill', 'Smart TV', 'High-Speed Wi-Fi', 'Washer + Dryer', 'Fully Stocked Kitchen', 'Alfresco Dining', 'Outdoor Shower', 'Sun Loungers', 'Stunning Views', 'Baby Crib'],
    'sections': [
      { 'key': 'entry', 'title': 'How to Enter', 'content': [
        { 'h': 'Entering Vista Pointe', 'body': '<ol><li>Your door access code will be sent via Airbnb message on the day of check-in.</li><li>Locate the digital keypad at the front door.</li><li>Enter your code — the lock will beep and unlock when accepted.</li><li>Contact the host immediately if you have any trouble.</li></ol>',
          'photos': [('photos/vista-pointe/ad9adbcf-e8a0-465e-83b0-89098b2434be.jpeg','Front entrance — Vista Pointe')] },
      ]},
      { 'key': 'parking', 'title': 'Parking', 'content': [
        { 'h': 'Parking at Vista Pointe', 'body': '<ul><li>Free off-street parking available in the driveway — fits multiple vehicles.</li><li>Please park fully on the property — do not block the street or sidewalk.</li><li>Additional street parking available on Vista Pointe and surrounding streets.</li></ul>',
          'photos': [] },
      ]},
      { 'key': 'wifi', 'title': 'Wi-Fi', 'content': [
        { 'h': 'Wi-Fi Details', 'body': '<p>Wi-Fi name and password provided in your check-in message and posted inside the home.</p>', 'photos': [] },
      ]},
      { 'key': 'house_rules', 'title': 'House Rules', 'content': [
        { 'h': 'General Rules', 'body': '<ul><li>Max occupancy: 16 guests.</li><li>No smoking anywhere on the property, indoors or outdoors.</li><li>Pets welcome — clean up after your pet, keep off furniture.</li><li>No parties without host approval.</li><li>Quiet hours: 10 PM – 8 AM.</li></ul>', 'photos': [] },
        { 'h': 'Pool & Jacuzzi Rules', 'body': '<ul><li><strong>Jacuzzi:</strong> Controlled remotely — request activation at least 30 minutes in advance.</li><li><strong>Pool heating:</strong> Available on request — $100/day fee. Takes 8–10 hours in winter.</li><li>No glass near the pool or jacuzzi.</li><li>Shower before entering.</li><li>Children must be supervised by an adult at all times.</li><li>No diving.</li></ul>',
          'photos': [('photos/vista-pointe/c045b79b-0bb4-4698-8391-c786c89d5550.jpeg','Pool area')] },
        { 'h': 'Transient Occupancy Tax (TOT)', 'body': '<p>This property is in Bonita, CA (County of San Diego). An 8% TOT applies to stays under 30 days. This is collected through Airbnb and is included in your booking total.</p>', 'photos': [] },
      ]},
      { 'key': 'the_home', 'title': 'The Home', 'content': [
        { 'h': 'Overview', 'body': '<ul><li>5 Bedrooms · 4 Bathrooms · 10 beds · Sleeps up to 16</li><li>BR1: Queen + Sofa Bed (En Suite, TV, Crib)</li><li>BR2: Double Bed</li><li>BR3: King Bed (En Suite)</li><li>BR4: Queen + Sofa Bed</li><li>BR5: Double Bed</li><li>Pool table & ping pong · Smart TV · High-speed Wi-Fi · Washer/dryer</li></ul>',
          'photos': [('photos/vista-pointe/7c018d78-10a5-4f73-88f9-ea9fd3d3811c.jpeg','Living Area'),('photos/vista-pointe/8e4b6e10-501d-46ad-b20a-543e042edce2.jpeg','Dining Area')] },
        { 'h': 'Bedrooms', 'body': '<p>All bedrooms include bed linens, pillows, and extra blankets.</p>',
          'photos': [('photos/vista-pointe/c500b802-7b89-4779-9f67-be0e96b783fc.jpeg','BR1 — Queen, En Suite'),('photos/vista-pointe/7e493f3d-bb3f-4168-9309-ff0b847b93f1.jpeg','BR3 — King, En Suite'),('photos/vista-pointe/2d9e5865-3d13-4443-8c86-3931ac3bb0df.jpeg','BR4 — Queen')] },
        { 'h': 'Kitchen', 'body': '<p>Fully stocked: refrigerator, oven, stove, microwave, coffee maker, blender, rice maker, dishwasher, wine glasses, cooking basics, and pantry staples.</p>',
          'photos': [('photos/vista-pointe/32a42c88-73fa-4596-a4e8-342369daa971.jpeg','Kitchen — Fully Stocked')] },
      ]},
      { 'key': 'outdoor_spaces', 'title': 'Outdoor Spaces', 'content': [
        { 'h': 'Pool & Jacuzzi', 'body': '<ul><li>Private pool with sun loungers and outdoor shower.</li><li>Jacuzzi — remote-controlled, request activation 30 min in advance.</li><li>Pool heating available on request ($100/day, takes 8–10 hrs in winter).</li></ul>',
          'photos': [('photos/vista-pointe/c045b79b-0bb4-4698-8391-c786c89d5550.jpeg','Pool'),('photos/vista-pointe/43bc6347-d461-4f19-9bd2-dc731ef097d8.jpeg','Jacuzzi')] },
        { 'h': 'Patio, BBQ & Fire Pit', 'body': '<ul><li>Alfresco dining area with outdoor table and chairs.</li><li>BBQ grill with utensils provided.</li><li>Fire pit — great for evening gatherings.</li><li>Sun loungers scattered around pool.</li></ul>',
          'photos': [('photos/vista-pointe/2e671807-411c-4e27-a4a2-4bdb4160a3e2.jpeg','Fire Pit & Patio'),('photos/vista-pointe/ae20dbef-f498-459b-a3f2-cdc46ab9f825.jpeg','BBQ & Alfresco Dining')] },
      ]},
      { 'key': 'checkout', 'title': 'Check-Out', 'content': [
        { 'h': 'Before You Go', 'body': '<ol><li>Strip all beds — leave used linens on the floor.</li><li>Wash all dishes and return to cabinets.</li><li>Take all trash to the bins outside.</li><li>Empty the refrigerator of perishables.</li><li>Turn off all lights, fans, electronics.</li><li>Ensure fire pit is fully extinguished.</li><li>Close the BBQ lid.</li><li>Lock all doors and windows.</li><li>Message the host to confirm check-out.</li></ol><p><strong>Check-out time: 11:00 AM.</strong></p>', 'photos': [] },
      ]},
    ],
    'gallery': [
      'photos/vista-pointe/ad9adbcf-e8a0-465e-83b0-89098b2434be.jpeg',
      'photos/vista-pointe/c045b79b-0bb4-4698-8391-c786c89d5550.jpeg',
      'photos/vista-pointe/43bc6347-d461-4f19-9bd2-dc731ef097d8.jpeg',
      'photos/vista-pointe/c500b802-7b89-4779-9f67-be0e96b783fc.jpeg',
      'photos/vista-pointe/7e493f3d-bb3f-4168-9309-ff0b847b93f1.jpeg',
      'photos/vista-pointe/32a42c88-73fa-4596-a4e8-342369daa971.jpeg',
      'photos/vista-pointe/2e671807-411c-4e27-a4a2-4bdb4160a3e2.jpeg',
      'photos/vista-pointe/ae20dbef-f498-459b-a3f2-cdc46ab9f825.jpeg',
    ],
  },

  'jackson-st': {
    'name': '2525 Jackson Street',
    'tagline': 'Welcome to 2525 Jackson Street!',
    'address': '2525 Jackson St, San Diego, CA 92110',
    'neighborhood': 'Mission Hills / Old Town',
    'hero': 'photos/jackson-st/92272c0b-3368-4d11-8ff9-1968c49b4788.jpeg',
    'exterior': 'photos/jackson-st/18842b23-7276-41cb-a215-2cb1f4a43a68.png',
    'bedrooms': 5, 'bathrooms': '3.5', 'beds': 12, 'guests': 16,
    'pets': 'Yes', 'checkin': '4:00 PM', 'checkout': '11:00 AM',
    'welcome': 'We hope you enjoy your stay at this stunning 5-bedroom home in Mission Hills! With panoramic views of the San Diego Bay and city skyline, multiple outdoor decks, and an open-concept layout, this home is the perfect base for exploring everything San Diego has to offer.',
    'wifi_network': '[Provided at check-in]', 'wifi_pass': '[Provided at check-in]',
    'amenities': ['Panoramic Bay Views', 'Multiple Outdoor Decks', 'Fire Pit', 'BBQ Grill', 'Smart TV', 'High-Speed Wi-Fi', 'Alfresco Dining', 'Private Entrance', 'In-Home Safe', 'Washer + Dryer', 'Fully Stocked Kitchen', 'Baby Crib', 'Bathtub'],
    'sections': [
      { 'key': 'entry', 'title': 'How to Enter', 'content': [
        { 'h': 'Entering Jackson Street', 'body': '<ol><li>Your door access code will be sent via Airbnb message on the day of check-in.</li><li>Locate the digital keypad at the private entrance.</li><li>Enter your 4-digit code — the lock will beep and unlock when accepted.</li><li>Contact the host immediately if you have any trouble.</li></ol>',
          'photos': [('photos/jackson-st/92272c0b-3368-4d11-8ff9-1968c49b4788.jpeg','Private entrance — 2525 Jackson St')] },
      ]},
      { 'key': 'parking', 'title': 'Parking', 'content': [
        { 'h': 'Parking at Jackson Street', 'body': '<ul><li>Free off-street parking available at the property.</li><li>Park fully on-site without blocking the street or sidewalk.</li><li>Street parking on Jackson St and surrounding Mission Hills streets typically plentiful.</li></ul>',
          'photos': [('photos/jackson-st/18842b23-7276-41cb-a215-2cb1f4a43a68.png','2525 Jackson St')] },
      ]},
      { 'key': 'wifi', 'title': 'Wi-Fi', 'content': [
        { 'h': 'Wi-Fi Details', 'body': '<p>Wi-Fi name and password provided in your check-in message and posted inside the home. Available throughout the home and outdoor decks.</p>', 'photos': [] },
      ]},
      { 'key': 'house_rules', 'title': 'House Rules', 'content': [
        { 'h': 'General Rules', 'body': '<ul><li>Max occupancy: 16 guests.</li><li>No smoking anywhere on the property, indoors or outdoors.</li><li>Pets welcome — clean up after your pet, keep off furniture.</li><li>No parties without host approval.</li><li>Quiet hours: 10 PM – 8 AM (sound carries with open bay views).</li></ul>', 'photos': [] },
        { 'h': 'Outdoor Decks & Fire Pit', 'body': '<ul><li>No glass near the fire pit — use the cups provided.</li><li>Ensure the fire pit is fully extinguished before going inside for the night.</li><li>Be especially mindful of noise on decks after 10 PM.</li><li>Do not lean on or climb deck railings.</li></ul>', 'photos': [] },
      ]},
      { 'key': 'the_home', 'title': 'The Home', 'content': [
        { 'h': 'Overview', 'body': '<ul><li>5 Bedrooms · 3.5 Bathrooms · 12 beds · Sleeps up to 16</li><li>BR1: King + Sofa Bed (TV, AC, Wardrobe)</li><li>BR2: King (TV, AC)</li><li>BR3: Queen + Sofa Bed (AC, Wardrobe)</li><li>BR4: Sofa Bed / Flex room (TV, AC)</li><li>BR5: Double + Sofa Bed (TV, AC)</li><li>Open-concept living · Panoramic bay & skyline views · Smart TV · High-speed Wi-Fi · In-home safe</li></ul>',
          'photos': [('photos/jackson-st/0b0de5f5-e48a-487b-96fd-5dfccac55f0d.jpeg','Living Room — Bay Views'),('photos/jackson-st/44fd014e-89fb-4973-ba58-c8d4c85f4f59.jpeg','Dining Area')] },
        { 'h': 'Bedrooms', 'body': '<p>All bedrooms include bed linens, pillows, and extra blankets. Baby crib available on request.</p>',
          'photos': [('photos/jackson-st/488513e1-c0a2-40b9-8e6b-119d5156dbfa.jpeg','BR1 — King'),('photos/jackson-st/cad65b5c-18bf-4077-a1f4-314787b0243e.jpeg','BR2 — King'),('photos/jackson-st/98e291a6-afce-4d7f-8add-0750e7ba9f11.jpeg','BR3 — Queen')] },
        { 'h': 'Kitchen', 'body': '<p>Modern fully stocked kitchen: refrigerator, oven, stove, microwave, coffee maker, blender, dishwasher, wine glasses, cooking basics, and pantry staples.</p>',
          'photos': [('photos/jackson-st/953988d7-b146-44a5-bbb3-86cee7b7973a.jpeg','Kitchen — Fully Stocked')] },
      ]},
      { 'key': 'outdoor_spaces', 'title': 'Outdoor Spaces', 'content': [
        { 'h': 'Outdoor Decks & Views', 'body': '<p>Multiple outdoor decks with <strong>panoramic views of San Diego Bay and the city skyline</strong> — stunning at sunrise, day, and sunset. Alfresco dining, comfortable seating throughout.</p>',
          'photos': [('photos/jackson-st/06201083-3e79-4e64-8dc2-1e8aa176a0d3.jpeg','Deck — Panoramic Views'),('photos/jackson-st/c8426d88-4961-4d0d-9137-6b5ee59ca1a8.jpeg','Upper Deck')] },
        { 'h': 'Fire Pit & BBQ', 'body': '<ul><li>Fire pit — perfect for evening gatherings with bay views.</li><li>BBQ grill with utensils provided.</li><li>Patio seating scattered across all outdoor areas.</li></ul>',
          'photos': [('photos/jackson-st/1d8b09bc-3dfc-4a31-9875-6af5973c7720.jpeg','Fire Pit & Patio'),('photos/jackson-st/7dce338f-b609-4522-bf87-20daf2926b98.jpeg','BBQ')] },
      ]},
      { 'key': 'checkout', 'title': 'Check-Out', 'content': [
        { 'h': 'Before You Go', 'body': '<ol><li>Strip all beds — leave used linens on the floor.</li><li>Wash all dishes and return to cabinets.</li><li>Take all trash to the bins outside.</li><li>Empty the refrigerator of perishables.</li><li>Turn off all lights, fans, electronics.</li><li>Ensure fire pit is fully extinguished.</li><li>Close the BBQ lid.</li><li>Lock all doors and windows.</li><li>Message the host to confirm check-out.</li></ol><p><strong>Check-out time: 11:00 AM.</strong></p>', 'photos': [] },
      ]},
    ],
    'gallery': [
      'photos/jackson-st/92272c0b-3368-4d11-8ff9-1968c49b4788.jpeg',
      'photos/jackson-st/0b0de5f5-e48a-487b-96fd-5dfccac55f0d.jpeg',
      'photos/jackson-st/06201083-3e79-4e64-8dc2-1e8aa176a0d3.jpeg',
      'photos/jackson-st/488513e1-c0a2-40b9-8e6b-119d5156dbfa.jpeg',
      'photos/jackson-st/953988d7-b146-44a5-bbb3-86cee7b7973a.jpeg',
      'photos/jackson-st/1d8b09bc-3dfc-4a31-9875-6af5973c7720.jpeg',
      'photos/jackson-st/7dce338f-b609-4522-bf87-20daf2926b98.jpeg',
      'photos/jackson-st/c8426d88-4961-4d0d-9137-6b5ee59ca1a8.jpeg',
    ],
  },
}

# ─── Section icons (SVG paths) ────────────────────────────────────────────────
ICONS = {
  'entry':           '<path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>',
  'parking':         '<path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z"/>',
  'wifi':            '<path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>',
  'house_rules':     '<path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>',
  'the_home':        '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
  'outdoor_spaces':  '<path d="M17 12h2L12 2 2 12h2v8h6v-5h4v5h6z"/>',
  'checkout':        '<path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>',
}

def get_icon_svg(key):
    path = ICONS.get(key, '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>')
    return f'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">{path}</svg>'

# ─── HTML builder ─────────────────────────────────────────────────────────────
def build_html(slug, prop):
    hero_src = img_tag(prop['hero'], prop['name'], style='width:100%;height:100%;object-fit:cover;display:block;')
    ext_src  = img_tag(prop['exterior'], prop['name'], style='width:100%;height:260px;object-fit:cover;display:block;')

    # Stats card
    stats_html = f"""
    <div class="stat-card">
      <h4>Property Details</h4>
      <div class="stat-row"><span class="label">Address</span><span class="value">{prop['address']}</span></div>
      <div class="stat-row"><span class="label">Neighborhood</span><span class="value">{prop['neighborhood']}</span></div>
      <div class="stat-row"><span class="label">Bedrooms</span><span class="value">{prop['bedrooms']}</span></div>
      <div class="stat-row"><span class="label">Bathrooms</span><span class="value">{prop['bathrooms']}</span></div>
      <div class="stat-row"><span class="label">Beds</span><span class="value">{prop['beds']}</span></div>
      <div class="stat-row"><span class="label">Max Guests</span><span class="value">{prop['guests']}</span></div>
      <div class="stat-row"><span class="label">Pets</span><span class="value">{prop['pets']}</span></div>
      <div class="stat-row"><span class="label">Check-in</span><span class="value">{prop['checkin']}</span></div>
      <div class="stat-row"><span class="label">Check-out</span><span class="value">{prop['checkout']}</span></div>
      <div class="stat-row"><span class="label">Wi-Fi Network</span><span class="value">{prop['wifi_network']}</span></div>
      <div class="stat-row"><span class="label">Wi-Fi Password</span><span class="value">{prop['wifi_pass']}</span></div>
    </div>
    """

    amenities_html = '<div class="stat-card"><h4>Amenities</h4><div class="amenity-grid">' + \
        ''.join(f'<span class="amenity-chip">{a}</span>' for a in prop['amenities']) + \
        '</div></div>'

    welcome_html = f'''
    <div class="cover-welcome">
      <h3>A Message from Your Host</h3>
      <p>{prop['welcome']}</p>
    </div>
    '''

    cover = f"""
    <div class="cover">
      <div class="cover-hero">
        {hero_src}
        <div class="cover-hero-overlay"></div>
        <div class="cover-hero-text">
          <div class="cover-badge">TALO · Guest Guidebook</div>
          <div class="cover-title">{prop['name']}</div>
          <div class="cover-address">{prop['address']}</div>
        </div>
      </div>
      <div class="cover-body">
        {stats_html}
        {amenities_html}
        {welcome_html}
      </div>
    </div>
    """

    # TOC
    section_labels = [s['title'] for s in prop['sections']]
    toc_items = ''.join(
        f'<div class="toc-item"><div class="toc-num">{i+1}</div>{label}</div>'
        for i, label in enumerate(section_labels)
    )
    toc = f'<div class="toc-page"><h2>Contents</h2><div class="toc-grid">{toc_items}</div></div>'

    # Sections
    sections_html = ''
    for sec in prop['sections']:
        icon_svg = get_icon_svg(sec['key'])
        blocks_html = ''
        for blk in sec['content']:
            # Photos
            photos_html = ''
            if blk.get('photos'):
                photos = blk['photos']
                n = len(photos)
                cols_cls = {1:'cols-1', 2:'cols-2', 3:'cols-3', 4:'cols-4'}.get(n, 'cols-2')
                items = ''
                for (p_path, cap) in photos:
                    tag = img_tag(p_path, cap)
                    if tag:
                        items += f'<div class="photo-item med"><div>{tag}</div><div class="photo-cap">{cap}</div></div>'
                if items:
                    photos_html = f'<div class="photo-grid {cols_cls}">{items}</div>'
            blocks_html += f'''
            <div class="block">
              <div class="block-title">{blk["h"]}</div>
              <div class="block-body">{blk["body"]}</div>
              {photos_html}
            </div>
            '''
        sections_html += f'''
        <div class="section">
          <div class="section-header">
            <div class="section-icon">{icon_svg}</div>
            <div>
              <div class="section-label">Section</div>
              <div class="section-title">{sec['title']}</div>
            </div>
          </div>
          {blocks_html}
        </div>
        '''

    # Photo gallery page
    gallery_items = ''
    for g in prop.get('gallery', []):
        tag = img_tag(g, '')
        if tag:
            gallery_items += f'<div class="photo-item"><div>{tag}</div></div>'
    gallery_page = ''
    if gallery_items:
        gallery_page = f'''
        <div class="section" style="page-break-before:always;">
          <div class="section-header">
            <div class="section-icon"><svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="white"/></svg></div>
            <div>
              <div class="section-label">Gallery</div>
              <div class="section-title">Photo Gallery</div>
            </div>
          </div>
          <div class="gallery-strip">{gallery_items}</div>
        </div>
        '''

    # Full HTML doc
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TALO Guidebook — {prop['name']}</title>
  <style>{CSS}</style>
</head>
<body>
  {cover}
  {toc}
  {sections_html}
  {gallery_page}
</body>
</html>"""
    return html


# ─── Generate all files ────────────────────────────────────────────────────────
for slug, prop in PROPERTIES.items():
    print(f'Generating {slug}...', end=' ', flush=True)
    html = build_html(slug, prop)
    out_path = os.path.join(OUTPUT_DIR, f'guidebook-{slug}.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
    size_kb = os.path.getsize(out_path) // 1024
    print(f'✅  {out_path}  ({size_kb} KB)')

print(f'\nAll guidebooks written to: {OUTPUT_DIR}')
