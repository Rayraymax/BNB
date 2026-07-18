-- Optional ALKEY Homes demo content. Run after schema.sql.
-- Replace copy, prices and media URLs from the dashboard later.

insert into public.site_settings (
  id, name, short_name, tagline, meta_description, about, story, cover_image, cover_video,
  whatsapp, phone, email, address, map_embed, check_in, check_out, socials, why_choose, stats
) values (
  'site',
  'ALKEY Homes',
  'ALKEY',
  'Experience Elegance & Royalty',
  'ALKEY Homes offers premium serviced apartments in Roysambu with WhatsApp booking, fast Wi-Fi, self check-in, housekeeping, groceries, laundry and local guest support.',
  'ALKEY Homes is built for guests who want the comfort of a private apartment with the support of a responsive hospitality team. Our Roysambu stays are thoughtfully prepared for business travel, romantic getaways and relaxed city visits, with clean interiors, convenient services and instant WhatsApp assistance from check-in to check-out.',
  'We started ALKEY Homes with a simple belief: a stay should feel less like a rental and more like arriving somewhere already prepared for you. Every apartment is professionally managed, carefully cleaned, verified before check-in and supported by a team that treats hospitality as a personal promise.',
  '/public/assets/uploads/alkey-building-background.jpeg',
  '',
  '254704330604',
  '+254 704 330604',
  'alkeyhomess@gmail.com',
  'Roysambu, Nairobi',
  'https://www.google.com/maps?q=Roysambu%20Nairobi&output=embed',
  'Flexible self check-in',
  '10:00 AM',
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
  map_embed = excluded.map_embed,
  check_in = excluded.check_in,
  check_out = excluded.check_out,
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
  '1 bedroom apartment',
  'Queen bed',
  '/public/assets/uploads/alkey-building-background.jpeg',
  '',
  '["/public/assets/uploads/alkey-building-background.jpeg","/public/assets/room-garden.svg"]',
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
  'premium apartment',
  'Queen bed',
  '/public/assets/uploads/alkey-building-background.jpeg',
  '',
  '["/public/assets/uploads/alkey-building-background.jpeg","/public/assets/room-ridge.svg"]',
  'A premium Roysambu apartment with a polished, comfortable feel for guests who want privacy, convenience and responsive support throughout the stay.',
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

insert into public.services (
  slug, category, name, status, price_label, cover_image, short_description, description, hours, contact_name, whatsapp, items
) values
('koffi-koffi','food','Koffi Koffi Coffee','published','menu pricing','/public/assets/services/koffi-koffi.png','Nearby coffee option for guests who want a quick cafe run.','Order coffee, snacks or cafe items through guest support. We can share the current menu and help coordinate pickup or delivery to your apartment.','Morning to evening','Koffi Koffi','254100065853','[{"name":"Coffee order assistance","price":"menu pricing"},{"name":"Pickup coordination","price":"on request"}]'),
('meat-delivery','food','Meat Delivery','published','menu pricing','/public/assets/services/meat-delivery.png','Meat delivery contact for guests cooking during longer stays.','Send your order or shopping note on WhatsApp and guest support will help confirm availability, price and delivery timing.','Daily, subject to vendor availability','Peter Meat Supply','254117699419','[{"name":"Meat order","price":"vendor pricing"},{"name":"Delivery coordination","price":"on request"}]'),
('kiosk-delivery','groceries','Kiosk Delivery','published','from KSh 200','/public/assets/services/kiosk-delivery.png','Quick kiosk essentials delivered around Roysambu.','Useful for water, snacks, airtime, toiletries and quick essentials. Send your list and we coordinate confirmation before dispatch.','8:00 AM - 10:00 PM','Local kiosk','254142492113','[{"name":"Small essentials run","price":"from KSh 200"},{"name":"Large essentials run","price":"from KSh 500"}]'),
('laundry','housekeeping','Laundry','published','from KSh 500','/public/assets/service-laundry.svg','Laundry pickup and return for longer stays.','Send a laundry request on WhatsApp. We help coordinate wash, dry, fold and return timing.','8:00 AM - 6:00 PM','Laundry support','254790928582','[{"name":"Wash and fold","price":"from KSh 500"},{"name":"Ironing","price":"on request"}]'),
('room-cleaning','housekeeping','Room Cleaning','published','from KSh 800','/public/assets/service-cleaning.svg','A full refresh of the apartment during your stay.','Fresh linens, bathroom reset, floor cleaning, trash removal and apartment refresh. Best booked the evening before.','8:00 AM - 5:00 PM','Housekeeping desk','254704330604','[{"name":"Standard refresh","price":"KSh 800"},{"name":"Deep clean","price":"KSh 1,800"},{"name":"Extra linen change","price":"KSh 500"}]'),
('airport-pickup','transport','Airport Pickup','published','from KSh 3,500','/public/assets/service-transfer.svg','Reliable pickup from JKIA or Wilson Airport.','Share your flight number and landing time. We help coordinate a direct pickup to ALKEY Homes in Roysambu.','24 hours with advance booking','Transport desk','254704330604','[{"name":"JKIA pickup","price":"from KSh 4,500"},{"name":"Wilson pickup","price":"from KSh 3,500"}]'),
('juice-and-smoothies','drink','Juice & Smoothies','published','menu pricing','/public/assets/service-groceries.svg','Fresh juice and smoothie delivery contacts nearby.','Order fresh juice or smoothies from nearby vendors. Guest support helps confirm current options and delivery timing.','Daily','Juice vendor','254740612042','[{"name":"Fresh juice","price":"menu pricing"},{"name":"Smoothie","price":"menu pricing"}]'),
('pizza-place','food','Pizza Place','published','from KSh 600','/public/assets/service-transfer.svg','Pizza delivery contact for easy meals.','Use the WhatsApp order button to ask for the latest pizza menu, delivery estimate and current offers.','Lunch to late evening','Pizza vendor','254140122156','[{"name":"Small pizza","price":"from KSh 600"},{"name":"Large pizza","price":"from KSh 1,200"}]'),
('liquor-store','drink','Liquor Store','published','menu pricing','/public/assets/service-cleaning.svg','Nearby liquor store contact for guests.','Request the current drinks list and delivery timing. Guests must confirm age and availability before delivery.','Subject to legal operating hours','Liquor store','254784840302','[{"name":"Beer and cider","price":"store pricing"},{"name":"Wine and spirits","price":"store pricing"}]'),
('hair-drop-water','services','Hair Drop Water','published','on request','/public/assets/service-laundry.svg','Beauty and grooming support contact.','A guest support contact for hair, grooming and beauty-related arrangements around Roysambu.','By appointment','Beauty contact','254745680122','[{"name":"Hair appointment support","price":"on request"}]'),
('coffee-shop-two','food','Break Hub Coffee','published','menu pricing','/public/assets/services/coffee-shop-two.png','Another nearby coffee and snack stop.','Guests can request coffee, light bites or directions to the cafe. WhatsApp support can help coordinate pickup.','Daily','Break Hub','254715684262','[{"name":"Coffee and snack order","price":"menu pricing"}]')
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

insert into public.bookings (room_id, guest_name, start_date, end_date, status, source)
values
  ('11111111-1111-1111-1111-111111111111', 'Sample booked stay', '2026-08-02', '2026-08-05', 'confirmed', 'seed'),
  ('22222222-2222-2222-2222-222222222222', 'Sample blocked dates', '2026-08-09', '2026-08-12', 'confirmed', 'seed')
on conflict do nothing;
