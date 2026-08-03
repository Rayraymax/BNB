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
    "Hello {{shortName}},",
    "I would like to order: {{serviceName}}.",
    "Kindly share your current menu and pricing."
  ].join("\n"),
  access: [
    "Hello {{guestName}},",
    "Here are your private access details for {{roomName}}:",
    "Room: {{roomCode}}",
    "Door pass: {{doorPass}}",
    "Lock box password: {{lockboxPassword}}",
    "WiFi name: {{wifiName}}",
    "WiFi password: {{wifiPassword}}",
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
  return renderWhatsappTemplate(settings.whatsappTemplates?.service || defaultTemplates.service, {
    shortName: settings.shortName || settings.name,
    serviceName: service.name,
    items,
    guestName: guestName || "",
    note: note || ""
  });
}

export function accessDetailsMessage({ room, guestName, details, settings }) {
  return renderWhatsappTemplate(settings.whatsappTemplates?.access || defaultTemplates.access, {
    guestName: guestName || "there",
    roomName: room?.name || "your room",
    roomCode: details.roomCode || "",
    doorPass: details.doorPass || "",
    lockboxPassword: details.lockboxPassword || "",
    wifiName: details.wifiName || "",
    wifiPassword: details.wifiPassword || "",
    additionalNotes: details.additionalNotes || ""
  });
}

export { defaultTemplates };
