# ALKEY Homes BnB Platform

Static guest-facing site plus Supabase-backed owner dashboard for ALKEY Homes in Roysambu.

## Included

- Public homepage, rooms, room details, services, service details, about and contact pages
- Luxury homepage hero, story section, premium why-choose-us grid and testimonials
- WhatsApp booking/order links with pre-filled guest messages
- Visible room availability calendar with booked days marked
- Owner dashboard for rooms, services, bookings, site settings and media
- Owner dashboard for testimonials, inquiries, house rules, cancellation policy, direct-payment notes and accepted payment methods
- Media upload targeting for homepage, Room 701, Room 739, future rooms, services or manual URL use
- Supabase schema with RLS policies, public storage buckets and no-overlap room booking constraint
- SEO metadata, JSON-LD helpers, sitemap, robots.txt and installable PWA manifest
- Netlify config for deployment
- iCalendar export at `/calendar.ics` plus room-specific feeds for Booking.com calendar import
- Booking.com iCalendar import storage with a 15-minute Netlify scheduled sync

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
- `/admin/testimonials`: add, edit, publish or remove dated guest reviews
- `/admin/inquiries`: update status or delete guest contact/service requests
- `/admin/calendar`: copy website `.ics` feeds, paste Booking.com export feeds per room, pause/delete feeds and view last-sync errors

The main manual configuration file is:

```text
src/config.js
```

Use it for Supabase keys and the production site URL only. Content, prices, availability, policies and media are managed from the owner dashboard.

## Upgrade an Existing Supabase Project

Run `supabase/schema.sql` again in the Supabase SQL Editor. It uses `if not exists` / `add column if not exists` and adds the new editable policy fields and testimonials table without deleting existing rooms, bookings or media. Do not re-run `seed.sql` on a live property unless you intentionally want to refresh the demo content.

## iCalendar / Booking.com Sync

After the schema upgrade, open `/admin/calendar`. Use the room-specific export URL for the matching Booking.com unit:

```text
https://yourdomain.com/calendar.ics?room=ROOM_ID
```

Paste Booking.com's exported `.ics` URL into the matching room in the same admin page. Netlify runs `sync-calendars` every 15 minutes and imports external events as `booking.com` bookings. Set the `SUPABASE_SERVICE_ROLE_KEY` environment variable in Netlify so the scheduled function can read calendar feeds and update bookings; never expose this key in `src/config.js` or browser code.
