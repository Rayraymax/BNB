# ALKEY Homes BnB Platform

Static guest-facing site plus Supabase-backed owner dashboard for ALKEY Homes in Roysambu.

## Included

- Public homepage, rooms, room details, services, service details, about and contact pages
- Luxury homepage hero, story section, premium why-choose-us grid and testimonials
- WhatsApp booking/order links with pre-filled guest messages
- Visible room availability calendar with booked days marked
- Owner dashboard for rooms, services, bookings, site settings and media
- Media upload targeting for homepage, Room 701, Room 739, future rooms, services or manual URL use
- Supabase schema with RLS policies, public storage buckets and no-overlap room booking constraint
- SEO metadata, JSON-LD helpers, sitemap, robots.txt and installable PWA manifest
- Netlify config for deployment

## Run Locally

```bash
node server.js
```

Open:

```text
http://localhost:5173
```

Local demo login:

```text
Email: owner@bnb.local
Password: demo-admin
```

## Production Setup

Follow:

```text
docs/SUPABASE_SETUP.md
```

That guide covers Supabase, owner login, GitHub, Netlify, image/video uploads and day-to-day editing.

## What The Owner Edits

After Supabase is connected, do normal management inside the dashboard:

- `/admin/site`: homepage text, story, contact details, WhatsApp, SEO, cover image and cover video
- `/admin/rooms`: Room 701, Room 739, future rooms, prices, amenities, cover media and gallery
- `/admin/services`: services, contacts, descriptions, prices and WhatsApp numbers
- `/admin/bookings`: confirmed blocks so dates cannot be double-booked
- `/admin/media`: upload images/videos and apply them to homepage, room, gallery or service targets

The main manual configuration file is:

```text
src/config.js
```

Use it for Supabase keys and the production site URL only.
