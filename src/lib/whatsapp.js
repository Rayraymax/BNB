import { OWNER_WHATSAPP_NUMBER } from "../config.js";

export function normalizeWhatsapp(number) {
  return String(number || "").replace(/[^\d]/g, "");
}

export function whatsappUrl(number, message) {
  const clean = normalizeWhatsapp(number);
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

const defaultTemplates = {
  booking: [
    "Hello {{shortName}},",
    "I would like to book {{roomName}}.",
    "Dates: {{startDate}} to {{endDate}}",
    "Guests: {{guests}}",
    "Estimated total: KSh {{totalCost}}",
    "Name: {{guestName}}",
    "Note: {{note}}",
    "Please confirm availability and total price."
  ].join("\n"),
  service: [
    "Hello {{serviceName}},",
    "I would like to order {{serviceName}}, please share your current menu and price"
  ].join("\n"),
  access: [
    "Hello {{guestName}},",
    "Your booking is confirmed.",
    "{{propertyName}}",
    "House: {{houseToCheckIn}}",
    "Directions: {{directions}}",
    "{{lockboxInstructions}}",
    "Lock box password: {{lockboxPassword}}",
    "Phase: {{phase}}",
    "WiFi name: {{wifiName}}",
    "WiFi password: {{wifiPassword}}",
    "Check-in: {{checkInTime}}",
    "Check-out: {{checkOutTime}}",
    "{{checkOutNotes}}",
    "House rules:\n{{houseRules}}",
    "{{additionalNotes}}"
  ].join("\n")
};

export function renderWhatsappTemplate(template, values) {
  return String(template || "").replace(/{{\s*([\w]+)\s*}}/g, (_, key) => values[key] ?? "").trim();
}

export function roomBookingMessage({ room, settings, startDate, endDate, guests, guestName, note, totalCost }) {
  return renderWhatsappTemplate(settings.whatsappTemplates?.booking || defaultTemplates.booking, {
    shortName: settings.shortName || settings.name,
    roomName: room.name,
    startDate: startDate || "I will confirm",
    endDate: endDate || "",
    guests: guests || "",
    totalCost: totalCost ? Number(totalCost).toLocaleString() : "",
    guestName: guestName || "",
    note: note || ""
  });
}

export function serviceOrderMessage({ service, settings, selectedItems, guestName, note }) {
  const items = selectedItems?.length ? selectedItems.map((item) => item.name).join(", ") : "";
  const savedTemplate = String(settings.whatsappTemplates?.service || "");
  const usesServiceNameGreeting = /^Hello\s+{{\s*serviceName\s*}}\s*,/i.test(savedTemplate.trim());
  const template = usesServiceNameGreeting ? savedTemplate : defaultTemplates.service;
  return renderWhatsappTemplate(template, {
    shortName: settings.shortName || settings.name,
    serviceName: service.name,
    items,
    guestName: guestName || "",
    note: note || ""
  });
}

export function accessDetailsMessage({ room, guestName, details, settings }) {
  const template = String(settings.whatsappTemplates?.access || defaultTemplates.access)
    .split(/\r?\n/)
    .filter((line) => !/{{\s*(doorPass|roomCode)\s*}}/i.test(line))
    .join("\n");
  return renderWhatsappTemplate(template, {
    guestName: guestName || "there",
    roomName: room?.name || "your room",
    propertyName: details.propertyName || room?.name || "Your stay",
    houseToCheckIn: details.houseToCheckIn || "",
    directions: details.directions || "",
    lockboxInstructions: details.lockboxInstructions || "Keys are in the lockbox.",
    lockboxPassword: details.lockboxPassword || "",
    phase: details.phase || "",
    wifiName: details.wifiName || "",
    wifiPassword: details.wifiPassword || "",
    checkInTime: details.checkInTime || "",
    checkOutTime: details.checkOutTime || "",
    checkOutNotes: details.checkOutNotes || "",
    houseRules: (details.houseRules || []).join("\n"),
    additionalNotes: details.additionalNotes || ""
  });
}

export { defaultTemplates };
export { OWNER_WHATSAPP_NUMBER };
