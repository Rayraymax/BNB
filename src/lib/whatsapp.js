export function normalizeWhatsapp(number) {
  return String(number || "").replace(/[^\d]/g, "");
}

export function whatsappUrl(number, message) {
  const clean = normalizeWhatsapp(number);
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function roomBookingMessage({ room, settings, startDate, endDate, guests, guestName, note }) {
  return [
    `Hello ${settings.shortName || settings.name},`,
    `I would like to book ${room.name}.`,
    startDate && endDate ? `Dates: ${startDate} to ${endDate}` : "Dates: I will confirm.",
    guests ? `Guests: ${guests}` : "",
    guestName ? `Name: ${guestName}` : "",
    note ? `Note: ${note}` : "",
    "Please confirm availability and total price."
  ]
    .filter(Boolean)
    .join("\n");
}

export function serviceOrderMessage({ service, settings, selectedItems, guestName, note }) {
  const itemText = selectedItems?.length
    ? selectedItems.map((item) => `- ${item.name} (${item.price})`).join("\n")
    : `- ${service.name}`;

  return [
    `Hello ${settings.shortName || settings.name},`,
    `I would like to order/book: ${service.name}.`,
    itemText,
    guestName ? `Name: ${guestName}` : "",
    note ? `Note: ${note}` : "",
    "Please confirm timing and total price."
  ]
    .filter(Boolean)
    .join("\n");
}
