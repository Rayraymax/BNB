import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config.js";

const DEFAULT_TZ = "UTC";

function runtimeEnv(name) {
  return typeof process !== "undefined" && process.env ? process.env[name] || "" : "";
}

function supabaseConfig() {
  const url = runtimeEnv("SUPABASE_URL") || SUPABASE_URL;
  const key = runtimeEnv("SUPABASE_SERVICE_ROLE_KEY") || runtimeEnv("SUPABASE_ANON_KEY") || SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are not configured.");
  return { url: url.replace(/\/$/, ""), key };
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase request failed (${response.status}): ${body}`);
  return body ? JSON.parse(body) : null;
}

function icsEscape(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll(/\r?\n/g, "\\n");
}

function compactDate(iso) {
  return String(iso || "").slice(0, 10).replaceAll("-", "");
}

function utcStamp(value = new Date()) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function dateFromCompact(value) {
  const match = String(value || "").match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return "";
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function addDays(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function resolveRoomKey(roomKey, rooms) {
  if (!roomKey) return null;
  return rooms.find((room) => room.id === roomKey || room.slug === roomKey) || null;
}

export async function buildCalendarFeed({ roomKey = "" } = {}) {
  const rooms = await supabaseRequest("rooms?select=id,slug,name&order=name.asc");
  const room = resolveRoomKey(roomKey, rooms);
  const query = new URLSearchParams({
    select: "id,room_id,start_date,end_date,status",
    status: "eq.confirmed",
    order: "start_date.asc"
  });
  if (room) query.set("room_id", `eq.${room.id}`);
  const bookings = await supabaseRequest(`bookings?${query.toString()}`);
  const names = new Map(rooms.map((item) => [item.id, item.name]));
  const title = room ? `${room.name} availability` : "ALKEY Homes availability";
  const events = bookings.map((booking) => {
    const roomName = names.get(booking.room_id) || "ALKEY Homes";
    return [
      "BEGIN:VEVENT",
      `UID:bnb-${icsEscape(booking.id)}@alkeyhomes`,
      `DTSTAMP:${utcStamp()}`,
      `DTSTART;VALUE=DATE:${compactDate(booking.start_date)}`,
      `DTEND;VALUE=DATE:${compactDate(booking.end_date)}`,
      `SUMMARY:${icsEscape(`Reserved - ${roomName}`)}`,
      `DESCRIPTION:${icsEscape(`${roomName} is unavailable.`)}`,
      "END:VEVENT"
    ].join("\r\n");
  });
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ALKEY Homes//Availability Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsEscape(title)}`,
    `X-WR-TIMEZONE:${DEFAULT_TZ}`,
    ...events,
    "END:VCALENDAR",
    ""
  ].join("\r\n");
}

function unfoldIcs(text) {
  return String(text || "").replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
}

function unescapeIcs(value) {
  return String(value || "")
    .replaceAll("\\n", "\n")
    .replaceAll("\\N", "\n")
    .replaceAll("\\,", ",")
    .replaceAll("\\;", ";")
    .replaceAll("\\\\", "\\");
}

function propertyLine(line) {
  const separator = line.indexOf(":");
  if (separator < 0) return ["", ""];
  return [line.slice(0, separator).split(";")[0].toUpperCase(), unescapeIcs(line.slice(separator + 1).trim())];
}

export function parseIcsEvents(text) {
  const events = [];
  let current = null;
  for (const line of unfoldIcs(text)) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current?.DTSTART) {
        events.push({
          uid: current.UID || "",
          startDate: dateFromCompact(current.DTSTART),
          endDate: dateFromCompact(current.DTEND) || addDays(dateFromCompact(current.DTSTART), 1),
          summary: current.SUMMARY || "Imported booking",
          status: String(current.STATUS || "CONFIRMED").toUpperCase()
        });
      }
      current = null;
      continue;
    }
    if (current) {
      const [key, value] = propertyLine(line);
      if (key) current[key] = value;
    }
  }
  return events.filter((event) => event.startDate && event.endDate && event.startDate < event.endDate);
}

function isoNow() {
  return new Date().toISOString();
}

async function updateSync(syncId, fields) {
  await supabaseRequest(`calendar_syncs?id=eq.${encodeURIComponent(syncId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ ...fields, updated_at: isoNow() })
  });
}

export async function syncCalendar(sync) {
  try {
    const response = await fetch(sync.feed_url || sync.feedUrl, { headers: { Accept: "text/calendar, text/plain;q=0.9" } });
    if (!response.ok) throw new Error(`Calendar feed returned HTTP ${response.status}.`);
    const calendarText = await response.text();
    if (!/BEGIN:VCALENDAR/i.test(calendarText)) throw new Error("The imported response is not a valid iCalendar feed.");
    const events = parseIcsEvents(calendarText);
    const current = await supabaseRequest(`bookings?room_id=eq.${encodeURIComponent(sync.room_id || sync.roomId)}&external_source=eq.${encodeURIComponent(sync.id)}&select=id,external_uid,status`);
    const currentByUid = new Map(current.map((booking) => [booking.external_uid, booking]));
    const seen = new Set();
    for (const event of events) {
      const uid = event.uid || `${event.startDate}:${event.endDate}:${event.summary}`;
      seen.add(uid);
      const existing = currentByUid.get(uid);
      const payload = {
        room_id: sync.room_id || sync.roomId,
        guest_name: `${sync.name || "Imported calendar"} · ${event.summary}`.slice(0, 250),
        start_date: event.startDate,
        end_date: event.endDate,
        status: event.status === "CANCELLED" ? "cancelled" : "confirmed",
        source: "booking.com",
        external_source: sync.id,
        external_uid: uid,
        last_synced_at: isoNow()
      };
      if (existing) {
        await supabaseRequest(`bookings?id=eq.${encodeURIComponent(existing.id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(payload) });
      } else if (payload.status === "confirmed") {
        await supabaseRequest("bookings", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(payload) });
      }
    }
    for (const booking of current) {
      if (!seen.has(booking.external_uid) && booking.status === "confirmed") {
        await supabaseRequest(`bookings?id=eq.${encodeURIComponent(booking.id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "cancelled", last_synced_at: isoNow() }) });
      }
    }
    await updateSync(sync.id, { last_synced_at: isoNow(), last_error: null });
    return { id: sync.id, imported: events.length, ok: true };
  } catch (error) {
    await updateSync(sync.id, { last_synced_at: isoNow(), last_error: error.message }).catch(() => {});
    return { id: sync.id, imported: 0, ok: false, error: error.message };
  }
}

export async function syncAllCalendars({ syncId = "" } = {}) {
  const query = syncId
    ? `calendar_syncs?id=eq.${encodeURIComponent(syncId)}&select=*`
    : "calendar_syncs?enabled=eq.true&select=*";
  const syncs = await supabaseRequest(query);
  const results = [];
  for (const sync of syncs) results.push(await syncCalendar(sync));
  return results;
}
