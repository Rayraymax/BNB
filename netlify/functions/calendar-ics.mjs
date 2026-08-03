import { buildCalendarFeed } from "../../src/lib/ical.js";

export default async (request) => {
  try {
    const url = new URL(request.url);
    const feed = await buildCalendarFeed({ roomKey: url.searchParams.get("room") || "" });
    return new Response(feed, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": "inline; filename=alkey-homes-calendar.ics",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return new Response(`Calendar export failed: ${error.message}`, { status: 500 });
  }
};
