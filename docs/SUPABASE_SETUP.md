# ALKEY Homes Setup Guide

This guide connects the site to Supabase, pushes it to GitHub, deploys it on Netlify, and explains how the owner manages rooms, services, bookings, images and videos from the dashboard.

## 1. Run The Site Locally

From `C:\Users\USER\Desktop\BNB`:

```bash
node server.js
```

Open:

```text
http://localhost:5173
```

Owner login in local demo mode:

```text
Email: owner@bnb.local
Password: demo-admin
```

Local demo mode stores edits in your browser. Production data will come from Supabase.

## 2. Create The Supabase Backend

1. Go to Supabase and create a new project.
2. Open `SQL Editor`.
3. Open this project file:

```text
C:\Users\USER\Desktop\BNB\supabase\schema.sql
```

4. Copy all SQL from `schema.sql`.
5. Paste it into Supabase SQL Editor.
6. Click `Run`.

This creates or safely upgrades:

- `site_settings`
- `rooms`
- `services`
- `bookings`
- `inquiries`
- `testimonials`
- `user_roles`
- public media buckets: `site-media`, `room-images`, `service-images`
- a database rule that prevents overlapping confirmed bookings for the same room

For an existing live project, run `schema.sql` before deploying the new frontend. The migration adds policy/payment/location fields and the testimonials table without dropping current rooms, bookings or media. Do not run `seed.sql` against live content unless you intentionally want to overwrite the demo seed rows.

## 3. Add Demo Content

Still in Supabase SQL Editor:

1. Open:

```text
C:\Users\USER\Desktop\BNB\supabase\seed.sql
```

2. Copy all SQL.
3. Paste it into SQL Editor.
4. Run it.

For a new project, this adds ALKEY Homes settings, Room 701, Room 739, services, dated sample reviews, and sample blocked dates. Existing production content should be edited from the dashboard instead.

## 4. Create The Owner Login

1. In Supabase, open `Authentication`.
2. Go to `Users`.
3. Click `Add user`.
4. Add your owner email and password.
5. Open the new user row and copy the user UUID.
6. Run this in SQL Editor, replacing the UUID:

```sql
insert into public.user_roles (user_id, role)
values ('PASTE-OWNER-USER-ID-HERE', 'admin')
on conflict do nothing;
```

Only users with this admin role can add, edit or delete rooms, services, bookings and media.
The owner dashboard also manages testimonials and inquiry status/deletion, plus house rules, cancellation terms, direct-payment instructions, accepted payment methods, taxes/fees notes, exact landmarks and check-in notes.

## 5. Connect The App To Supabase

In Supabase:

1. Open `Project Settings`.
2. Open `API`.
3. Copy the `Project URL`.
4. Copy the `anon public` key.

Edit:

```text
C:\Users\USER\Desktop\BNB\src\config.js
```

Set:

```js
export const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR-ANON-KEY";
export const SITE_BASE_URL = "https://your-netlify-site.netlify.app";
```

Leave `SITE_BASE_URL` blank until Netlify gives you the final URL.

## 6. Push To GitHub

From `C:\Users\USER\Desktop\BNB`:

```bash
git init
git add .
git commit -m "Initial ALKEY Homes site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

If Git asks you to sign in, use GitHub Desktop, GitHub CLI, or a GitHub personal access token.

## 7. Deploy On Netlify

1. Open Netlify.
2. Click `Add new site`.
3. Choose `Import an existing project`.
4. Connect GitHub.
5. Select the BNB repository.
6. Build command: leave blank.
7. Publish directory: leave blank or use the project root.
8. Deploy.

After deployment:

1. Copy the Netlify URL.
2. Put it in `src/config.js` as `SITE_BASE_URL`.
3. Commit and push again:

```bash
git add src/config.js
git commit -m "Set production site URL"
git push
```

Netlify will redeploy automatically.

## 8. Add Images And Videos

Use the dashboard, not code, once Supabase is connected.

1. Go to `/auth`.
2. Sign in with the Supabase owner email and password.
3. Open `/admin/media`.
4. Choose the media target:

- `Homepage cover image`
- `Homepage background video`
- `Room cover image`
- `Room video`
- `Room gallery image/video`
- `Service cover image`
- `Other / just give me the URL`

5. If the target is a room, choose `Room 701`, `Room 739`, or any new room you have added.
6. If the target is a service, choose the service.
7. Upload the file.

The dashboard uploads to Supabase Storage and applies the URL automatically when a target is selected. It also shows the URL so you can paste it manually if needed.
The Media page also lists assigned images and lets the owner remove a cover/gallery assignment or replace it with a new upload.

Recommended media sizes:

- Room photos: JPG/WebP, under 300 KB each
- Service photos: JPG/WebP, under 250 KB each
- Homepage video: MP4/WebM, 6-8 seconds, muted-friendly, under 5 MB if possible
- Room videos: MP4/WebM, short walkthroughs, under 8 MB each

The WhatsApp MHTML files are not real deployable video files. Upload the actual `.mp4` or `.webm` files through `/admin/media`.

## 9. Manage Rooms

Use:

```text
/admin/rooms
```

You can:

- add Room 701, Room 739, Room 3 or any future room
- edit name, slug, price, capacity, description and amenities
- upload cover images and room videos
- add gallery URLs
- publish or hide a room by changing status
- delete rooms

## 10. Manage Services

Use:

```text
/admin/services
```

You can:

- add services such as laundry, groceries, cleaning, food, transport and beauty contacts
- edit descriptions, contacts, WhatsApp numbers, hours and price previews
- add itemized price lines using this format:

```text
Wash and fold | from KSh 500
Ironing | on request
```

Guests order through WhatsApp, and the inquiry is logged in the dashboard.

## 11. Manage Blocked Dates

Use:

```text
/admin/bookings
```

Add a confirmed block with:

- room
- guest/block label
- start date
- end date

The public room page shows booked days on the calendar. The booking form also refuses overlapping dates. Supabase adds a second layer of protection with the `no_overlapping_confirmed_room_bookings` database constraint, so one room cannot be double-booked for the same confirmed dates.

Guests now see booked nights as filled red, disabled calendar buttons. The date inputs are limited to today/future dates, and the booking panel shows an estimated nightly total before the WhatsApp handoff.

## Direct Payment Configuration

On `/admin/site`, set:

- accepted methods such as M-Pesa, card, bank transfer or cash at check-in
- the direct-payment note shown beside the booking form
- the tax/fee note and cancellation policy

In Booking.com, choose the payment options available for your property and region that let guests pay the property directly. Booking.com may still require partner verification or payout details even when you primarily collect payment yourself. Confirm the final Booking.com payment setup in the Extranet before publishing.

## 12. Booking.com Readiness

The site does not push inventory directly into Booking.com yet. What it does provide is the correct content foundation:

- room names, descriptions and gallery images
- location, contact and amenities
- direct booking flow
- blocked date management
- SEO metadata

For Booking.com, reuse the same room descriptions, pricing, photos and availability policy from the dashboard. If you later need real two-way calendar sync, add an iCal or channel-manager integration.
