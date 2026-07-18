import { SUPABASE_ANON_KEY, SUPABASE_URL, LOCAL_ADMIN } from "../config.js";
import { mockData } from "../data/mockData.js";

const STORAGE_KEY = "bnb-platform-local-data";
const SESSION_KEY = "bnb-platform-local-session";
const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
let supabaseClient = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function localData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    const initial = clone(mockData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(saved);
}

function saveLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("bnb:data-changed"));
  return data;
}

async function supabase() {
  if (!configured) return null;
  if (supabaseClient) return supabaseClient;
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

function normalizeSettings(row) {
  if (!row) return null;
  return {
    ...row,
    whyChoose: row.why_choose || row.whyChoose || [],
    story: row.story || "",
    stats: row.stats || [],
    shortName: row.short_name || row.shortName,
    coverImage: row.cover_image || row.coverImage,
    coverVideo: row.cover_video || row.coverVideo,
    metaDescription: row.meta_description || row.metaDescription,
    mapEmbed: row.map_embed || row.mapEmbed,
    checkIn: row.check_in || row.checkIn,
    checkOut: row.check_out || row.checkOut
  };
}

function toSettingsRow(settings) {
  return {
    id: "site",
    name: settings.name,
    short_name: settings.shortName,
    tagline: settings.tagline,
    meta_description: settings.metaDescription,
    about: settings.about,
    story: settings.story,
    cover_image: settings.coverImage,
    cover_video: settings.coverVideo,
    whatsapp: settings.whatsapp,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    map_embed: settings.mapEmbed,
    check_in: settings.checkIn,
    check_out: settings.checkOut,
    socials: settings.socials || {},
    why_choose: settings.whyChoose || [],
    stats: settings.stats || []
  };
}

function normalizeRoom(row) {
  return {
    ...row,
    priceLabel: row.price_label || row.priceLabel,
    coverImage: row.cover_image || row.coverImage,
    coverVideo: row.cover_video || row.coverVideo,
    seoTitle: row.seo_title || row.seoTitle,
    seoDescription: row.seo_description || row.seoDescription
  };
}

function toRoomRow(room) {
  return {
    id: room.id,
    slug: room.slug,
    name: room.name,
    status: room.status || "published",
    price: Number(room.price || 0),
    price_label: room.priceLabel,
    capacity: Number(room.capacity || 1),
    size: room.size,
    beds: room.beds,
    cover_image: room.coverImage,
    cover_video: room.coverVideo,
    gallery: room.gallery || [],
    description: room.description,
    amenities: room.amenities || [],
    seo_title: room.seoTitle,
    seo_description: room.seoDescription
  };
}

function normalizeService(row) {
  return {
    ...row,
    priceLabel: row.price_label || row.priceLabel,
    coverImage: row.cover_image || row.coverImage,
    shortDescription: row.short_description || row.shortDescription,
    contactName: row.contact_name || row.contactName
  };
}

function toServiceRow(service) {
  return {
    id: service.id,
    slug: service.slug,
    category: service.category,
    name: service.name,
    status: service.status || "published",
    price_label: service.priceLabel,
    cover_image: service.coverImage,
    short_description: service.shortDescription,
    description: service.description,
    hours: service.hours,
    contact_name: service.contactName,
    whatsapp: service.whatsapp,
    items: service.items || []
  };
}

export function isSupabaseConfigured() {
  return configured;
}

export async function getContent() {
  const client = await supabase();
  if (!client) return localData();

  const [settingsRes, roomsRes, servicesRes, bookingsRes, inquiriesRes] = await Promise.all([
    client.from("site_settings").select("*").eq("id", "site").maybeSingle(),
    client.from("rooms").select("*").order("name"),
    client.from("services").select("*").order("name"),
    client.from("bookings").select("*").order("start_date"),
    client.from("inquiries").select("*").order("created_at", { ascending: false })
  ]);

  for (const result of [settingsRes, roomsRes, servicesRes, bookingsRes, inquiriesRes]) {
    if (result.error) throw result.error;
  }

  return {
    settings: normalizeSettings(settingsRes.data) || clone(mockData.settings),
    rooms: roomsRes.data.map(normalizeRoom),
    services: servicesRes.data.map(normalizeService),
    bookings: bookingsRes.data.map((booking) => ({
      ...booking,
      roomId: booking.room_id,
      guestName: booking.guest_name,
      startDate: booking.start_date,
      endDate: booking.end_date
    })),
    inquiries: inquiriesRes.data,
    testimonials: clone(mockData.testimonials)
  };
}

export async function signIn(email, password) {
  const client = await supabase();
  if (!client) {
    const ok = email === LOCAL_ADMIN.email && password === LOCAL_ADMIN.password;
    if (!ok) throw new Error("Wrong local demo login.");
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email, signedIn: true }));
    return { email };
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const client = await supabase();
  if (!client) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  await client.auth.signOut();
}

export async function currentUser() {
  const client = await supabase();
  if (!client) return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  const { data } = await client.auth.getUser();
  return data.user;
}

export async function saveSettings(settings) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    data.settings = { ...data.settings, ...settings };
    saveLocal(data);
    return data.settings;
  }
  const row = toSettingsRow(settings);
  const { data, error } = await client.from("site_settings").upsert(row).select().single();
  if (error) throw error;
  return normalizeSettings(data);
}

export async function saveRoom(room) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    const id = room.id || crypto.randomUUID();
    const next = { ...room, id, slug: room.slug || slugify(room.name) };
    const index = data.rooms.findIndex((item) => item.id === id);
    if (index >= 0) data.rooms[index] = next;
    else data.rooms.push(next);
    saveLocal(data);
    return next;
  }
  const row = toRoomRow({ ...room, id: room.id || crypto.randomUUID(), slug: room.slug || slugify(room.name) });
  const { data, error } = await client.from("rooms").upsert(row).select().single();
  if (error) throw error;
  return normalizeRoom(data);
}

export async function deleteRoom(id) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    data.rooms = data.rooms.filter((room) => room.id !== id);
    data.bookings = data.bookings.filter((booking) => booking.roomId !== id);
    saveLocal(data);
    return;
  }
  const { error } = await client.from("rooms").delete().eq("id", id);
  if (error) throw error;
}

export async function saveService(service) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    const id = service.id || crypto.randomUUID();
    const next = { ...service, id, slug: service.slug || slugify(service.name) };
    const index = data.services.findIndex((item) => item.id === id);
    if (index >= 0) data.services[index] = next;
    else data.services.push(next);
    saveLocal(data);
    return next;
  }
  const row = toServiceRow({ ...service, id: service.id || crypto.randomUUID(), slug: service.slug || slugify(service.name) });
  const { data, error } = await client.from("services").upsert(row).select().single();
  if (error) throw error;
  return normalizeService(data);
}

export async function deleteService(id) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    data.services = data.services.filter((service) => service.id !== id);
    saveLocal(data);
    return;
  }
  const { error } = await client.from("services").delete().eq("id", id);
  if (error) throw error;
}

export async function createInquiry(inquiry) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    const next = { ...inquiry, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    data.inquiries.unshift(next);
    saveLocal(data);
    return next;
  }
  const { data, error } = await client.from("inquiries").insert({
    type: inquiry.type,
    room_id: inquiry.roomId || null,
    service_id: inquiry.serviceId || null,
    guest_name: inquiry.guestName || null,
    guest_phone: inquiry.guestPhone || null,
    start_date: inquiry.startDate || null,
    end_date: inquiry.endDate || null,
    message: inquiry.message,
    status: "new"
  }).select().single();
  if (error) throw error;
  return data;
}

export async function saveBooking(booking) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    if (data.bookings.some((item) => item.id !== booking.id && item.roomId === booking.roomId && item.status === "confirmed" && rangesOverlap(item.startDate, item.endDate, booking.startDate, booking.endDate))) {
      throw new Error("Those dates already overlap an existing booking.");
    }
    const id = booking.id || crypto.randomUUID();
    const next = { ...booking, id, status: booking.status || "confirmed" };
    const index = data.bookings.findIndex((item) => item.id === id);
    if (index >= 0) data.bookings[index] = next;
    else data.bookings.push(next);
    saveLocal(data);
    return next;
  }
  const { data, error } = await client.from("bookings").upsert({
    id: booking.id || crypto.randomUUID(),
    room_id: booking.roomId,
    guest_name: booking.guestName,
    guest_phone: booking.guestPhone || null,
    start_date: booking.startDate,
    end_date: booking.endDate,
    status: booking.status || "confirmed",
    source: booking.source || "admin"
  }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBooking(id) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    data.bookings = data.bookings.filter((booking) => booking.id !== id);
    saveLocal(data);
    return;
  }
  const { error } = await client.from("bookings").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadMedia(file, bucket = "site-media") {
  const client = await supabase();
  if (!client) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  const extension = file.name.split(".").pop();
  const path = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}
