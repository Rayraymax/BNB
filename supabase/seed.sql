-- Optional ALKEY Homes demo content. Run after schema.sql.
-- Replace copy, prices and media URLs from the dashboard later.

insert into public.site_settings (
  id, name, short_name, logo_image, tagline, meta_description, about, story, cover_image, cover_video,
  whatsapp, phone, email, address, landmark, property_type, map_embed, check_in, check_out, check_in_notes,
  house_rules, cancellation_policy, children_policy, payment_methods, payment_note, tax_note, whatsapp_templates, socials, why_choose, stats
) values (
  'site',
  'ALKEY Homes',
  'ALKEY',
  '/assets/brand/alkey-logo.png',
  'Experience Elegance & Royalty',
  'ALKEY Homes offers premium serviced apartments in Roysambu with WhatsApp booking, fast Wi-Fi, self check-in, housekeeping, groceries, laundry and local guest support.',
  'ALKEY Homes is built for guests who want the comfort of a private apartment with the support of a responsive hospitality team. Our Roysambu stays are thoughtfully prepared for business travel, romantic getaways and relaxed city visits, with clean interiors, convenient services and instant WhatsApp assistance from check-in to check-out.',
  'We started ALKEY Homes with a simple belief: a stay should feel less like a rental and more like arriving somewhere already prepared for you. Every apartment is professionally managed, carefully cleaned, verified before check-in and supported by a team that treats hospitality as a personal promise.',
  '/assets/uploads/alkey-building-background.jpeg',
  '',
  '254728835885',
  '+254 728835885',
  'alkeyhomess@gmail.com',
  'Roysambu, Nairobi',
  'Near Thika Road Mall and TRM Drive, Roysambu, Nairobi',
  'Serviced apartment',
  'https://www.google.com/maps?q=Roysambu%20Nairobi&output=embed',
  'Flexible self check-in',
  '10:00 AM',
  'Check-in from 2:00 PM. Self check-in instructions are shared after confirmation.',
  '["No smoking inside the apartment","No parties or events","Quiet hours from 10:00 PM to 7:00 AM","Only registered guests may stay overnight"]',
  'Free cancellation up to 48 hours before check-in. Cancellations within 48 hours may be charged one night.',
  'Children are welcome when the selected room capacity allows. Contact the owner before adding an extra bed or cot.',
  '["M-Pesa","Visa / Mastercard","Bank transfer","Cash at check-in"]',
  'Guests pay the owner directly. Confirm the final total and payment instructions on WhatsApp before arrival.',
  'Rates are shown in Kenyan shillings. Confirm applicable taxes or fees with the owner before payment.',
  '{"booking":"Hello {{shortName}},\nI would like to book {{roomName}}.\nDates: {{startDate}} to {{endDate}}\nGuests: {{guests}}\nEstimated total: KSh {{totalCost}}\nName: {{guestName}}\nNote: {{note}}\nPlease confirm availability and total price.","service":"Hello {{serviceName}},\nI would like to order {{serviceName}}, please share your current menu and price","access":"Hello {{guestName}},\nYour booking is confirmed.\n{{propertyName}}\nHouse: {{houseToCheckIn}}\nDirections: {{directions}}\n{{lockboxInstructions}}\nLock box password: {{lockboxPassword}}\nPhase: {{phase}}\nWiFi name: {{wifiName}}\nWiFi password: {{wifiPassword}}\nCheck-in: {{checkInTime}}\nCheck-out: {{checkOutTime}}\n{{checkOutNotes}}\nHouse rules:\n{{houseRules}}\n{{additionalNotes}}"}',
  '{"instagram":"https://instagram.com/","facebook":"https://facebook.com/"}',
  '[
    {"icon":"bed","title":"Beautiful Rooms","text":"Modern interiors, premium bedding and apartment comforts designed for rest."},
    {"icon":"shield","title":"Safe Property","text":"Secure, verified accommodation that is professionally maintained."},
    {"icon":"pin","title":"Prime Location","text":"Roysambu convenience near malls, food, transport routes and city access."},
    {"icon":"key","title":"Self Check-In","text":"Clear arrival instructions and flexible entry when your schedule changes."},
    {"icon":"sparkles","title":"Housekeeping","text":"Fresh, spotless rooms prepared before arrival and serviced on request."},
    {"icon":"wifi","title":"Fast Wi-Fi","text":"Reliable internet and Smart TV entertainment for work or relaxation."},
    {"icon":"bell","title":"Guest Services","text":"Laundry, groceries, food delivery, local contacts and pickup support."},
    {"icon":"message","title":"Easy Booking","text":"Check dates, choose a room and confirm instantly through WhatsApp."}
  ]',
  '[
    {"value":"2","label":"featured apartments"},
    {"value":"24/7","label":"guest support"},
    {"value":"Roysambu","label":"prime location"},
    {"value":"Fast","label":"self check-in"}
  ]'
) on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  logo_image = excluded.logo_image,
  tagline = excluded.tagline,
  meta_description = excluded.meta_description,
  about = excluded.about,
  story = excluded.story,
  cover_image = excluded.cover_image,
  cover_video = excluded.cover_video,
  whatsapp = excluded.whatsapp,
  phone = excluded.phone,
  email = excluded.email,
  address = excluded.address,
  landmark = excluded.landmark,
  property_type = excluded.property_type,
  map_embed = excluded.map_embed,
  check_in = excluded.check_in,
  check_out = excluded.check_out,
  check_in_notes = excluded.check_in_notes,
  house_rules = excluded.house_rules,
  cancellation_policy = excluded.cancellation_policy,
  children_policy = excluded.children_policy,
  payment_methods = excluded.payment_methods,
  payment_note = excluded.payment_note,
  tax_note = excluded.tax_note,
  whatsapp_templates = excluded.whatsapp_templates,
  socials = excluded.socials,
  why_choose = excluded.why_choose,
  stats = excluded.stats,
  updated_at = now();

insert into public.rooms (
  id, slug, name, status, price, price_label, capacity, size, beds, cover_image, cover_video, gallery, description, amenities, seo_title, seo_description
) values
(
  '11111111-1111-1111-1111-111111111111',
  'room-701',
  'Room 701',
  'published',
  4500,
  'KSh 4,500/night',
  2,
  '1-bedroom apartment',
  'Queen bed',
  '/assets/uploads/alkey-building-background.jpeg',
  '',
  '["/assets/uploads/alkey-building-background.jpeg","/assets/room-garden.svg"]',
  'A warm, modern apartment prepared for easy city stays in Roysambu. Ideal for couples, solo guests and business travel, with fast Wi-Fi, Smart TV, clean linens and WhatsApp support.',
  '["Queen bed","Smart TV","Fast Wi-Fi","Kitchen access","Self check-in","Hot shower","Secure building"]',
  'Room 701 at ALKEY Homes Roysambu',
  'Book Room 701 at ALKEY Homes in Roysambu, Nairobi. A modern serviced apartment with Wi-Fi, Smart TV, self check-in and WhatsApp booking.'
),
(
  '22222222-2222-2222-2222-222222222222',
  'room-739',
  'Room 739',
  'published',
  5000,
  'KSh 5,000/night',
  2,
  '1-bedroom premium apartment',
  'Queen bed',
  '/assets/uploads/alkey-building-background.jpeg',
  '',
  '["/assets/uploads/alkey-building-background.jpeg","/assets/room-ridge.svg"]',
  'Our premium Roysambu apartment for guests who want extra space, a refined finish and a calm base for longer or more private stays. Expect a generous living area, dedicated work corner, fast Wi-Fi and responsive support throughout the stay.',
  '["Queen bed","Smart TV","Fast Wi-Fi","Kitchen essentials","Self check-in","Guest services","Secure building"]',
  'Room 739 at ALKEY Homes Roysambu',
  'Book Room 739 at ALKEY Homes in Roysambu, Nairobi. Premium apartment comfort with self check-in, Wi-Fi and direct WhatsApp support.'
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  status = excluded.status,
  price = excluded.price,
  price_label = excluded.price_label,
  capacity = excluded.capacity,
  size = excluded.size,
  beds = excluded.beds,
  cover_image = excluded.cover_image,
  cover_video = excluded.cover_video,
  gallery = excluded.gallery,
  description = excluded.description,
  amenities = excluded.amenities,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();

insert into public.room_access_details (
  room_id, property_name, house_to_check_in, directions, lockbox_instructions, lockbox_password,
  phase, wifi_name, wifi_password, check_in_time, check_out_time, check_out_notes, house_rules, public_instructions
) values
(
  '11111111-1111-1111-1111-111111111111',
  'TSAVO APARTMENTS CHECK IN DETAILS', 'Black Gate',
  '3rd floor, the 1st house on your right hand from the stairs.', 'Keys are in the lock box.', '2042',
  'Phase 4', 'Jay Homes', 'Jay@2026', '2:00 PM', '10.00 AM',
  'Extension past check-out time attracts charges.',
  '["When checking out, kindly ensure everything is switched off.","Return the key in the lockbox.","You are responsible for any damage caused.","Enjoy your stay."]',
  'Self check-in instructions and active access credentials are shared privately after confirmation.'
),
(
  '22222222-2222-2222-2222-222222222222',
  'POYLVIEW ESTATE CHECK IN DETAILS', 'Black Gate',
  '3rd floor, the 1st house on your right hand from the stairs.', 'Keys are in the lock box.', '',
  'Phase 4', 'Jay Homes', '', '2:00 PM', '10.00 AM',
  'Extension past check-out time attracts charges.',
  '["When checking out, kindly ensure everything is switched off.","Return the key in the lockbox.","You are responsible for any damage caused.","Enjoy your stay."]',
  'Self check-in instructions and active access credentials are shared privately after confirmation.'
)
on conflict (room_id) do update set
  property_name = excluded.property_name,
  house_to_check_in = excluded.house_to_check_in,
  directions = excluded.directions,
  lockbox_instructions = excluded.lockbox_instructions,
  lockbox_password = excluded.lockbox_password,
  phase = excluded.phase,
  wifi_name = excluded.wifi_name,
  wifi_password = excluded.wifi_password,
  check_in_time = excluded.check_in_time,
  check_out_time = excluded.check_out_time,
  check_out_notes = excluded.check_out_notes,
  house_rules = excluded.house_rules,
  public_instructions = excluded.public_instructions,
  updated_at = now();

insert into public.services (
  slug, category, name, status, price_label, cover_image, short_description, description, hours, contact_name, whatsapp, items
) values
('koffi-koffi','food','Koffi Koffi Coffee','published','menu pricing','/assets/services/koffi-koffi.png','Nearby coffee option for guests who want a quick cafe run.','Order coffee, snacks or cafe items through guest support. We can share the current menu and help coordinate pickup or delivery to your apartment.','Morning to evening','Koffi Koffi','254100065853','[{"name":"Coffee order assistance","price":"menu pricing"},{"name":"Pickup coordination","price":"on request"}]'),
('meat-delivery','food','Meat Delivery','published','menu pricing','/assets/services/meat-delivery.png','Meat delivery contact for guests cooking during longer stays.','Send your order or shopping note on WhatsApp and guest support will help confirm availability, price and delivery timing.','Daily, subject to vendor availability','Peter Meat Supply','254117699419','[{"name":"Meat order","price":"vendor pricing"},{"name":"Delivery coordination","price":"on request"}]'),
('kiosk-delivery','groceries','Kiosk Delivery','published','from KSh 200','/assets/services/kiosk-delivery.png','Quick kiosk essentials delivered around Roysambu.','Useful for water, snacks, airtime, toiletries and quick essentials. Send your list and we coordinate confirmation before dispatch.','8:00 AM - 10:00 PM','Local kiosk','254142492113','[{"name":"Small essentials run","price":"from KSh 200"},{"name":"Large essentials run","price":"from KSh 500"}]'),
('laundry','housekeeping','Laundry','published','from KSh 500','/assets/service-laundry.svg','Laundry pickup and return for longer stays.','Send a laundry request on WhatsApp. We help coordinate wash, dry, fold and return timing.','8:00 AM - 6:00 PM','Laundry support','254790928582','[{"name":"Wash and fold","price":"from KSh 500"},{"name":"Ironing","price":"on request"}]'),
('room-cleaning','housekeeping','Room Cleaning','published','from KSh 800','/assets/service-cleaning.svg','A full refresh of the apartment during your stay.','Fresh linens, bathroom reset, floor cleaning, trash removal and apartment refresh. Best booked the evening before.','8:00 AM - 5:00 PM','Housekeeping desk','254728835882','[{"name":"Standard refresh","price":"KSh 800"},{"name":"Deep clean","price":"KSh 1,800"},{"name":"Extra linen change","price":"KSh 500"}]'),
('airport-pickup','transport','Airport Pickup','published','from KSh 3,500','/assets/service-transfer.svg','Reliable pickup from JKIA or Wilson Airport.','Share your flight number and landing time. We help coordinate a direct pickup to ALKEY Homes in Roysambu.','24 hours with advance booking','Transport desk','254728835885','[{"name":"JKIA pickup","price":"from KSh 4,500"},{"name":"Wilson pickup","price":"from KSh 3,500"}]'),
('juice-and-smoothies','drink','Juice & Smoothies','published','menu pricing','/assets/service-groceries.svg','Fresh juice and smoothie delivery contacts nearby.','Order fresh juice or smoothies from nearby vendors. Guest support helps confirm current options and delivery timing.','Daily','Juice vendor','254740612042','[{"name":"Fresh juice","price":"menu pricing"},{"name":"Smoothie","price":"menu pricing"}]'),
('pizza-place','food','Pizza Place','published','from KSh 600','/assets/service-transfer.svg','Pizza delivery contact for easy meals.','Use the WhatsApp order button to ask for the latest pizza menu, delivery estimate and current offers.','Lunch to late evening','Pizza vendor','254140122156','[{"name":"Small pizza","price":"from KSh 600"},{"name":"Large pizza","price":"from KSh 1,200"}]'),
('liquor-store','drink','Liquor Store','published','menu pricing','/assets/service-cleaning.svg','Nearby liquor store contact for guests.','Request the current drinks list and delivery timing. Guests must confirm age and availability before delivery.','Subject to legal operating hours','Liquor store','254784840302','[{"name":"Beer and cider","price":"store pricing"},{"name":"Wine and spirits","price":"store pricing"}]'),
('hair-drop-water','groceries','Heri Drop Water','published','on request','/assets/service-laundry.svg','Bottled drinking water delivered to your apartment.','Order bottled drinking water for your stay and we will help confirm available sizes, price and delivery timing to the apartment.','Daily, subject to delivery availability','Heri Drop Water','254745680122','[{"name":"Water delivery","price":"on request"}]'),
('coffee-shop-two','food','Break Hub Coffee','published','menu pricing','/assets/services/coffee-shop-two.jpg','Coffee, breakfast bites and snacks from a nearby cafe.','Order coffee, breakfast bites or snacks from Break Hub Coffee. Guest support can confirm the current menu and coordinate pickup or delivery.','Daily','Break Hub','254715684262','[{"name":"Coffee and snack order","price":"menu pricing"}]')
on conflict (slug) do update set
  category = excluded.category,
  name = excluded.name,
  status = excluded.status,
  price_label = excluded.price_label,
  cover_image = excluded.cover_image,
  short_description = excluded.short_description,
  description = excluded.description,
  hours = excluded.hours,
  contact_name = excluded.contact_name,
  whatsapp = excluded.whatsapp,
  items = excluded.items,
  updated_at = now();

insert into public.testimonials (id, name, quote, source, review_date, status)
values
  ('33333333-3333-3333-3333-333333333331', 'Mercy, Nairobi', 'Self check-in was smooth, the apartment was spotless and the host replied quickly on WhatsApp.', 'Guest review', '2026-06-14', 'published'),
  ('33333333-3333-3333-3333-333333333332', 'Brian, Eldoret', 'Good location in Roysambu, fast Wi-Fi and easy access to food deliveries. I would book again.', 'Guest review', '2026-05-28', 'published'),
  ('33333333-3333-3333-3333-333333333333', 'Amina, Mombasa', 'The services were convenient. Laundry and groceries were handled without me leaving the apartment.', 'Guest review', '2026-04-19', 'published')
on conflict (id) do update set
  name = excluded.name,
  quote = excluded.quote,
  source = excluded.source,
  review_date = excluded.review_date,
  status = excluded.status,
  updated_at = now();

insert into public.bookings (room_id, guest_name, start_date, end_date, status, source)
values
  ('11111111-1111-1111-1111-111111111111', 'Sample booked stay', '2026-08-02', '2026-08-05', 'confirmed', 'seed'),
  ('22222222-2222-2222-2222-222222222222', 'Sample blocked dates', '2026-08-09', '2026-08-12', 'confirmed', 'seed')
on conflict do nothing;
