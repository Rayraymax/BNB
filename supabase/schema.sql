-- Run this file in the Supabase SQL Editor for a new project.
-- It creates the BnB content model, admin permissions, storage buckets and no-overlap booking rule.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create table if not exists public.user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create or replace function public.has_role(required_role text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = required_role
  );
$$;

create table if not exists public.site_settings (
  id text primary key default 'site',
  name text not null,
  short_name text,
  logo_image text,
  tagline text,
  meta_description text,
  about text,
  story text,
  cover_image text,
  cover_video text,
  whatsapp text,
  phone text,
  email text,
  address text,
  landmark text,
  property_type text,
  map_embed text,
  check_in text,
  check_out text,
  check_in_notes text,
  house_rules jsonb not null default '[]'::jsonb,
  cancellation_policy text,
  children_policy text,
  payment_methods jsonb not null default '[]'::jsonb,
  payment_note text,
  tax_note text,
  socials jsonb not null default '{}'::jsonb,
  why_choose jsonb not null default '[]'::jsonb,
  stats jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'published' check (status in ('published', 'draft')),
  price integer not null default 0,
  price_label text not null,
  capacity integer not null default 1,
  size text,
  beds text,
  cover_image text,
  cover_video text,
  gallery jsonb not null default '[]'::jsonb,
  description text,
  amenities jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  name text not null,
  status text not null default 'published' check (status in ('published', 'draft')),
  price_label text,
  cover_image text,
  short_description text,
  description text,
  hours text,
  contact_name text,
  whatsapp text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  guest_name text not null,
  guest_phone text,
  start_date date not null,
  end_date date not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  source text not null default 'admin',
  external_source text,
  external_uid text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  check (start_date < end_date)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'no_overlapping_confirmed_room_bookings'
  ) then
    alter table public.bookings
      add constraint no_overlapping_confirmed_room_bookings
      exclude using gist (
        room_id with =,
        daterange(start_date, end_date, '[)') with &&
      )
      where (status = 'confirmed');
  end if;
end
$$;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('room', 'service', 'general')),
  room_id uuid references public.rooms(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  guest_name text,
  guest_phone text,
  start_date date,
  end_date date,
  message text not null,
  status text not null default 'new' check (status in ('new', 'open', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quote text not null,
  source text not null default 'Guest review',
  review_date date,
  status text not null default 'published' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_syncs (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null default 'Booking.com',
  provider text not null default 'booking.com',
  feed_url text not null,
  enabled boolean not null default true,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, feed_url)
);

alter table public.site_settings add column if not exists story text;
alter table public.site_settings add column if not exists logo_image text;
alter table public.site_settings add column if not exists stats jsonb not null default '[]'::jsonb;
alter table public.site_settings add column if not exists landmark text;
alter table public.site_settings add column if not exists property_type text;
alter table public.site_settings add column if not exists check_in_notes text;
alter table public.site_settings add column if not exists house_rules jsonb not null default '[]'::jsonb;
alter table public.site_settings add column if not exists cancellation_policy text;
alter table public.site_settings add column if not exists children_policy text;
alter table public.site_settings add column if not exists payment_methods jsonb not null default '[]'::jsonb;
alter table public.site_settings add column if not exists payment_note text;
alter table public.site_settings add column if not exists tax_note text;
alter table public.rooms add column if not exists cover_video text;
alter table public.bookings add column if not exists external_source text;
alter table public.bookings add column if not exists external_uid text;
alter table public.bookings add column if not exists last_synced_at timestamptz;

create unique index if not exists bookings_external_uid_idx
  on public.bookings (room_id, external_source, external_uid)
  where external_uid is not null;

alter table public.user_roles enable row level security;
alter table public.site_settings enable row level security;
alter table public.rooms enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.inquiries enable row level security;
alter table public.testimonials enable row level security;
alter table public.calendar_syncs enable row level security;

drop policy if exists "Admins can read roles" on public.user_roles;
create policy "Admins can read roles"
on public.user_roles for select
to authenticated
using (public.has_role('admin'));

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage settings" on public.site_settings;
create policy "Admins can manage settings"
on public.site_settings for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

drop policy if exists "Public can read published rooms" on public.rooms;
create policy "Public can read published rooms"
on public.rooms for select
to anon, authenticated
using (status = 'published' or public.has_role('admin'));

drop policy if exists "Admins can manage rooms" on public.rooms;
create policy "Admins can manage rooms"
on public.rooms for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

drop policy if exists "Public can read published services" on public.services;
create policy "Public can read published services"
on public.services for select
to anon, authenticated
using (status = 'published' or public.has_role('admin'));

drop policy if exists "Admins can manage services" on public.services;
create policy "Admins can manage services"
on public.services for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

drop policy if exists "Public can read confirmed bookings" on public.bookings;
create policy "Public can read confirmed bookings"
on public.bookings for select
to anon, authenticated
using (status = 'confirmed' or public.has_role('admin'));

drop policy if exists "Admins can manage bookings" on public.bookings;
create policy "Admins can manage bookings"
on public.bookings for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

drop policy if exists "Public can create inquiries" on public.inquiries;
create policy "Public can create inquiries"
on public.inquiries for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read inquiries" on public.inquiries;
create policy "Admins can read inquiries"
on public.inquiries for select
to authenticated
using (public.has_role('admin'));

drop policy if exists "Admins can update inquiries" on public.inquiries;
create policy "Admins can update inquiries"
on public.inquiries for update
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

drop policy if exists "Admins can delete inquiries" on public.inquiries;
create policy "Admins can delete inquiries"
on public.inquiries for delete
to authenticated
using (public.has_role('admin'));

drop policy if exists "Public can read published testimonials" on public.testimonials;
create policy "Public can read published testimonials"
on public.testimonials for select
to anon, authenticated
using (status = 'published' or public.has_role('admin'));

drop policy if exists "Admins can manage testimonials" on public.testimonials;
create policy "Admins can manage testimonials"
on public.testimonials for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

drop policy if exists "Admins can manage calendar syncs" on public.calendar_syncs;
create policy "Admins can manage calendar syncs"
on public.calendar_syncs for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

insert into storage.buckets (id, name, public)
values
  ('room-images', 'room-images', true),
  ('service-images', 'service-images', true),
  ('site-media', 'site-media', true)
on conflict (id) do nothing;

drop policy if exists "Public can read BnB media" on storage.objects;
create policy "Public can read BnB media"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('room-images', 'service-images', 'site-media'));

drop policy if exists "Admins can upload BnB media" on storage.objects;
create policy "Admins can upload BnB media"
on storage.objects for insert
to authenticated
with check (bucket_id in ('room-images', 'service-images', 'site-media') and public.has_role('admin'));

drop policy if exists "Admins can update BnB media" on storage.objects;
create policy "Admins can update BnB media"
on storage.objects for update
to authenticated
using (bucket_id in ('room-images', 'service-images', 'site-media') and public.has_role('admin'))
with check (bucket_id in ('room-images', 'service-images', 'site-media') and public.has_role('admin'));

drop policy if exists "Admins can delete BnB media" on storage.objects;
create policy "Admins can delete BnB media"
on storage.objects for delete
to authenticated
using (bucket_id in ('room-images', 'service-images', 'site-media') and public.has_role('admin'));
