import { syncAllCalendars } from "../src/lib/ical.js";

const results = await syncAllCalendars();
console.log(JSON.stringify({ results }, null, 2));
