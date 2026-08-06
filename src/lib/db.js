import { SUPABASE_ANON_KEY, SUPABASE_URL, LOCAL_ADMIN, OWNER_WHATSAPP_NUMBER } from "../config.js";
import { mockData } from "../data/mockData.js";
import { defaultTemplates } from "./whatsapp.js";

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
  const data = JSON.parse(saved);
  data.settings = { ...clone(mockData.settings), ...(data.settings || {}) };
  data.settings.whatsapp = OWNER_WHATSAPP_NUMBER;
  if (!/^Hello\s+{{\s*serviceName\s*}}\s*,/i.test((data.settings.whatsappTemplates?.service || "").trim())) {
    data.settings.whatsappTemplates.service = defaultTemplates.service;
  }
  if (data.settings.whatsappTemplates?.access && /{{\s*(doorPass|roomCode)\s*}}/i.test(data.settings.whatsappTemplates.access)) {
    data.settings.whatsappTemplates.access = defaultTemplates.access;
  }
  data.testimonials = (data.testimonials || clone(mockData.testimonials)).map((item, index) => ({
    ...item,
    id: item.id || `testimonial-local-${index + 1}`
  }));
  data.calendarSyncs = data.calendarSyncs || [];
  data.roomAccessDetails = Object.fromEntries(Object.entries(data.roomAccessDetails || clone(mockData.roomAccessDetails || {})).map(([roomId, details]) => [roomId, {
    ...details,
    roomId,
    phase: details.phase || details.roomCode || "",
    checkInTime: details.checkInTime || ""
  }]));
  const fixAssetPath = (value) => String(value || "").replaceAll("/public/assets/", "/assets/");
  data.settings.coverImage = fixAssetPath(data.settings.coverImage);
  data.settings.coverVideo = fixAssetPath(data.settings.coverVideo);
  data.rooms = (data.rooms || []).map((room) => ({
    ...room,
    coverImage: fixAssetPath(room.coverImage),
    coverVideo: fixAssetPath(room.coverVideo),
    gallery: (room.gallery || []).map(fixAssetPath)
  }));
  data.services = (data.services || []).map((service) => {
    const next = { ...service, coverImage: fixAssetPath(service.coverImage) };
    if (next.slug === "hair-drop-water" && next.name === "Hair Drop Water") {
      next.name = "Heri Drop Water";
      next.category = "groceries";
      next.shortDescription = "Bottled drinking water delivered to your apartment.";
      next.description = "Order bottled drinking water for your stay and we will help confirm available sizes, price and delivery timing to the apartment.";
      next.contactName = "Heri Drop Water";
      next.items = [{ name: "Water delivery", price: "on request" }];
    }
    if (next.slug === "coffee-shop-two") {
      next.shortDescription = "Coffee, breakfast bites and snacks from a nearby cafe.";
      next.description = "Order coffee, breakfast bites or snacks from Break Hub Coffee. Guest support can confirm the current menu and coordinate pickup or delivery.";
    }
    return next;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
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
  const whatsappTemplates = row.whatsapp_templates || row.whatsappTemplates || {};
  if (whatsappTemplates.access && /{{\s*(doorPass|roomCode)\s*}}/i.test(whatsappTemplates.access)) {
    whatsappTemplates.access = defaultTemplates.access;
  }
  if (!/^Hello\s+{{\s*serviceName\s*}}\s*,/i.test((whatsappTemplates.service || "").trim())) {
    whatsappTemplates.service = defaultTemplates.service;
  }
  return {
    ...row,
    whatsapp: OWNER_WHATSAPP_NUMBER,
    whyChoose: row.why_choose || row.whyChoose || [],
    story: row.story || "",
    stats: row.stats || [],
    shortName: row.short_name || row.shortName,
    logoImage: row.logo_image || row.logoImage || "/assets/brand/alkey-logo.png",
    coverImage: row.cover_image || row.coverImage,
    coverVideo: row.cover_video || row.coverVideo,
    metaDescription: row.meta_description || row.metaDescription,
    landmark: row.landmark || "",
    propertyType: row.property_type || row.propertyType || "Serviced apartment",
    mapEmbed: row.map_embed || row.mapEmbed,
    checkIn: row.check_in || row.checkIn,
    checkOut: row.check_out || row.checkOut,
    checkInNotes: row.check_in_notes || row.checkInNotes || "",
    houseRules: row.house_rules || row.houseRules || [],
    cancellationPolicy: row.cancellation_policy || row.cancellationPolicy || "",
    childrenPolicy: row.children_policy || row.childrenPolicy || "",
    paymentMethods: row.payment_methods || row.paymentMethods || [],
    paymentNote: row.payment_note || row.paymentNote || "",
    taxNote: row.tax_note || row.taxNote || "",
    whatsappTemplates
  };
}

function toSettingsRow(settings) {
  return {
    id: "site",
    name: settings.name,
    short_name: settings.shortName,
    logo_image: settings.logoImage,
    tagline: settings.tagline,
    meta_description: settings.metaDescription,
    about: settings.about,
    story: settings.story,
    cover_image: settings.coverImage,
    cover_video: settings.coverVideo,
    whatsapp: OWNER_WHATSAPP_NUMBER,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    landmark: settings.landmark,
    property_type: settings.propertyType,
    map_embed: settings.mapEmbed,
    check_in: settings.checkIn,
    check_out: settings.checkOut,
    check_in_notes: settings.checkInNotes,
    house_rules: settings.houseRules || [],
    cancellation_policy: settings.cancellationPolicy,
    children_policy: settings.childrenPolicy,
    payment_methods: settings.paymentMethods || [],
    payment_note: settings.paymentNote,
    tax_note: settings.taxNote,
    whatsapp_templates: settings.whatsappTemplates || {},
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

  const [settingsRes, roomsRes, servicesRes, bookingsRes, inquiriesRes, testimonialsRes] = await Promise.all([
    client.from("site_settings").select("*").eq("id", "site").maybeSingle(),
    client.from("rooms").select("*").order("name"),
    client.from("services").select("*").order("name"),
    client.from("bookings").select("*").order("start_date"),
    client.from("inquiries").select("*").order("created_at", { ascending: false }),
    client.from("testimonials").select("*").order("review_date", { ascending: false })
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
      guestPhone: booking.guest_phone,
      startDate: booking.start_date,
      endDate: booking.end_date,
      externalSource: booking.external_source,
      externalUid: booking.external_uid,
      lastSyncedAt: booking.last_synced_at
    })),
    inquiries: inquiriesRes.data,
    testimonials: testimonialsRes.error ? clone(mockData.testimonials) : testimonialsRes.data?.map((item) => ({
      ...item,
      reviewDate: item.review_date
    })) || clone(mockData.testimonials)
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

export async function updateInquiry(id, status) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    const item = data.inquiries.find((entry) => entry.id === id);
    if (item) item.status = status;
    saveLocal(data);
    return item;
  }
  const { data, error } = await client.from("inquiries").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteInquiry(id) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    data.inquiries = data.inquiries.filter((item) => item.id !== id);
    saveLocal(data);
    return;
  }
  const { error } = await client.from("inquiries").delete().eq("id", id);
  if (error) throw error;
}

export async function saveTestimonial(testimonial) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    const id = testimonial.id || crypto.randomUUID();
    const next = { ...testimonial, id, status: testimonial.status || "published" };
    const index = data.testimonials.findIndex((item) => item.id === id);
    if (index >= 0) data.testimonials[index] = next;
    else data.testimonials.unshift(next);
    saveLocal(data);
    return next;
  }
  const row = {
    id: testimonial.id || crypto.randomUUID(),
    name: testimonial.name,
    quote: testimonial.quote,
    source: testimonial.source || "Guest review",
    review_date: testimonial.reviewDate || null,
    status: testimonial.status || "published"
  };
  const { data, error } = await client.from("testimonials").upsert(row).select().single();
  if (error) throw error;
  return { ...data, reviewDate: data.review_date };
}

export async function deleteTestimonial(id) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    data.testimonials = data.testimonials.filter((item) => item.id !== id);
    saveLocal(data);
    return;
  }
  const { error } = await client.from("testimonials").delete().eq("id", id);
  if (error) throw error;
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
    source: booking.source || "admin",
    external_source: booking.externalSource || null,
    external_uid: booking.externalUid || null,
    last_synced_at: booking.lastSyncedAt || null
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getCalendarSyncs() {
  const client = await supabase();
  if (!client) return localData().calendarSyncs || [];
  const { data, error } = await client.from("calendar_syncs").select("*").order("created_at");
  if (error) throw error;
  return data.map((sync) => ({
    ...sync,
    roomId: sync.room_id,
    feedUrl: sync.feed_url,
    lastSyncedAt: sync.last_synced_at,
    lastError: sync.last_error
  }));
}

export async function getRoomAccessDetails() {
  const client = await supabase();
  if (!client) return clone(localData().roomAccessDetails || {});
  const { data, error } = await client.from("room_access_details").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return Object.fromEntries(data.map((item) => [item.room_id, normalizeRoomAccessDetails(item)]));
}

function normalizeRoomAccessDetails(row) {
  return {
    ...row,
    roomId: row.room_id,
    propertyName: row.property_name || "",
    houseToCheckIn: row.house_to_check_in || "",
    directions: row.directions || "",
    lockboxInstructions: row.lockbox_instructions || "",
    lockboxPassword: row.lockbox_password || "",
    phase: row.phase || row.room_phase || row.roomCode || "",
    wifiName: row.wifi_name || "",
    wifiPassword: row.wifi_password || "",
    checkInTime: row.check_in_time || "",
    checkOutTime: row.check_out_time || "",
    checkOutNotes: row.check_out_notes || "",
    houseRules: row.house_rules || [],
    additionalNotes: row.additional_notes || "",
    publicInstructions: row.public_instructions || ""
  };
}

export async function saveRoomAccessDetails(details) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    data.roomAccessDetails[details.roomId] = { ...details, roomId: details.roomId };
    saveLocal(data);
    return data.roomAccessDetails[details.roomId];
  }
  const row = {
    room_id: details.roomId,
    property_name: details.propertyName || "",
    house_to_check_in: details.houseToCheckIn || "",
    directions: details.directions || "",
    lockbox_instructions: details.lockboxInstructions || "",
    lockbox_password: details.lockboxPassword || "",
    phase: details.phase || "",
    wifi_name: details.wifiName || "",
    wifi_password: details.wifiPassword || "",
    check_in_time: details.checkInTime || "",
    check_out_time: details.checkOutTime || "",
    check_out_notes: details.checkOutNotes || "",
    house_rules: details.houseRules || [],
    additional_notes: details.additionalNotes || "",
    public_instructions: details.publicInstructions || ""
  };
  const { data, error } = await client.from("room_access_details").upsert(row).select().single();
  if (error) throw error;
  return normalizeRoomAccessDetails(data);
}

export async function saveCalendarSync(sync) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    const id = sync.id || crypto.randomUUID();
    const next = { ...sync, id, enabled: sync.enabled !== false };
    const index = data.calendarSyncs.findIndex((item) => item.id === id);
    if (index >= 0) data.calendarSyncs[index] = next;
    else data.calendarSyncs.push(next);
    saveLocal(data);
    return next;
  }
  const row = {
    id: sync.id || crypto.randomUUID(),
    room_id: sync.roomId,
    name: sync.name || "Booking.com",
    provider: sync.provider || "booking.com",
    feed_url: sync.feedUrl,
    enabled: sync.enabled !== false
  };
  const { data, error } = await client.from("calendar_syncs").upsert(row).select().single();
  if (error) throw error;
  return { ...data, roomId: data.room_id, feedUrl: data.feed_url, lastSyncedAt: data.last_synced_at, lastError: data.last_error };
}

export async function deleteCalendarSync(id) {
  const client = await supabase();
  if (!client) {
    const data = localData();
    data.calendarSyncs = data.calendarSyncs.filter((sync) => sync.id !== id);
    saveLocal(data);
    return;
  }
  const { error } = await client.from("calendar_syncs").delete().eq("id", id);
  if (error) throw error;
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
