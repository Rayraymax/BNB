import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";
import { buildCalendarFeed, syncAllCalendars } from "./src/lib/ical.js";
import { mockData } from "./src/data/mockData.js";

const root = process.cwd();
const port = Number(process.env.PORT || 5173);

// Any file type placed under the project (index.html, /src, /assets, /icons,
// fonts, video, pdf, etc.) is served automatically by path - nothing needs to
// be registered by hand here.
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf"
};

/**
 * Resolve a request path to a file on disk, staying inside `root`.
 * Returns null if the path escapes the project directory.
 */
function resolveWithinRoot(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const candidate = normalize(join(root, decoded));
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  return candidate;
}

function isFile(path) {
  return path && existsSync(path) && statSync(path).isFile();
}

function htmlEscape(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function absoluteMetaUrl(path) {
  const base = "https://alkeyhomes.netlify.app";
  if (!path) return `${base}/assets/uploads/alkey-building-background.jpeg`;
  if (/^https?:\/\//.test(path)) return path;
  return `${base}/${String(path).replace(/^\//, "")}`;
}

function routeMeta(pathname) {
  const base = "https://alkeyhomes.netlify.app";
  const room = pathname.startsWith("/rooms/")
    ? mockData.rooms.find((item) => item.slug === pathname.split("/")[2])
    : null;
  const routes = {
    "/": ["ALKEY Homes | Roysambu Serviced Apartments", "Book ALKEY Homes serviced apartments in Roysambu with direct WhatsApp support, visible availability and guest services."],
    "/rooms": ["Rooms | ALKEY Homes", "Compare ALKEY Homes serviced apartments in Roysambu and check dates before booking directly."],
    "/services": ["Guest Services | ALKEY Homes", "Order laundry, cleaning, groceries, airport transfers and guest services around Roysambu."],
    "/about": ["About | ALKEY Homes", "Meet the hosts and learn about ALKEY Homes serviced stays in Roysambu, Nairobi."],
    "/contact": ["Contact | ALKEY Homes", "Contact ALKEY Homes for directions, booking questions and guest support."],
    "/auth": ["Owner login | ALKEY Homes", "Owner management login for ALKEY Homes rooms, bookings, content and media."]
  };
  const [title, description] = routes[pathname] || (room
    ? [`${room.name} | ${mockData.settings.name}`, room.seoDescription || room.description]
    : pathname.startsWith("/services/")
      ? ["Guest service | ALKEY Homes", "View guest service details, prices and WhatsApp ordering information at ALKEY Homes."]
      : routes["/"]);
  const url = `${base}${pathname === "/" ? "/" : pathname}`;
  const isPrivate = pathname === "/auth" || pathname === "/admin" || pathname.startsWith("/admin/");
  const image = absoluteMetaUrl(room?.coverImage || mockData.settings.coverImage);
  const jsonLd = room ? {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LodgingBusiness",
        name: mockData.settings.name,
        description: mockData.settings.metaDescription,
        image: absoluteMetaUrl(mockData.settings.coverImage),
        url: `${base}/`,
        telephone: mockData.settings.phone,
        address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" }
      },
      {
        "@type": "HotelRoom",
        name: room.name,
        description: room.description,
        image,
        containedInPlace: { "@type": "LodgingBusiness", name: mockData.settings.name, url: `${base}/` },
        occupancy: { "@type": "QuantitativeValue", maxValue: room.capacity },
        offers: {
          "@type": "Offer",
          priceCurrency: "KES",
          price: room.price,
          availability: "https://schema.org/InStock",
          url
        }
      }
    ]
  } : null;
  return { title, description, url, image, jsonLd, robots: isPrivate ? "noindex, nofollow, noarchive" : "index, follow" };
}

function renderShell(pathname) {
  const meta = routeMeta(pathname);
  const shell = readFileSync(join(root, "index.html"), "utf8")
    .replace(/<title>[^<]*<\/title>/, `<title>${htmlEscape(meta.title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.description)}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.description)}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.url)}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.title)}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.description)}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.url)}$2`);
  return shell
    .replace(/(<meta\s+name="robots"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.robots)}$2`)
    .replace(/(<meta\s+property="og:image"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.image)}$2`)
    .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.image)}$2`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, meta.jsonLd
      ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replaceAll("<", "\\u003c")}</script>`
      : (match) => match);
}

createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", "http://localhost");

  if (requestUrl.pathname === "/calendar.ics" && (req.method === "GET" || req.method === "HEAD")) {
    try {
      const feed = await buildCalendarFeed({ roomKey: requestUrl.searchParams.get("room") || "" });
      res.writeHead(200, {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": "inline; filename=alkey-homes-calendar.ics",
        "Cache-Control": "no-store"
      });
      if (req.method !== "HEAD") res.end(feed);
      else res.end();
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`Calendar export failed: ${error.message}`);
    }
    return;
  }

  if (requestUrl.pathname === "/api/calendar-sync" && (req.method === "POST" || req.method === "GET")) {
    const expectedSecret = process.env.CALENDAR_SYNC_SECRET || "";
    const suppliedSecret = req.headers["x-calendar-sync-secret"] || requestUrl.searchParams.get("secret") || "";
    if (expectedSecret && suppliedSecret !== expectedSecret) {
      res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Unauthorized calendar sync request." }));
      return;
    }
    try {
      const results = await syncAllCalendars({ syncId: requestUrl.searchParams.get("syncId") || "" });
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify({ results }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  const requested = resolveWithinRoot(req.url || "/");
  const looksLikeAsset = /\.[a-zA-Z0-9]+$/.test((req.url || "").split("?")[0]);

  let filePath = requested;

  if (!requested) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  if (requested.endsWith(sep) || requested === root) {
    filePath = join(requested, "index.html");
  }

  if (!isFile(filePath)) {
    if (looksLikeAsset) {
      // A real asset (has a file extension) that doesn't exist - a genuine
      // 404, not the SPA shell, so broken image/script paths fail loudly
      // instead of silently resolving to an HTML page.
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    // Client-side route (e.g. /rooms, /services/laundry) - hand off to the
    // SPA shell so app.js's router can take over.
    filePath = join(root, "index.html");
  }

  if (filePath === join(root, "index.html") && !looksLikeAsset && req.method !== "HEAD") {
    const html = renderShell(new URL(req.url || "/", "http://localhost").pathname);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(html);
    return;
  }

  const ext = extname(filePath);
  const contentType = mimeTypes[ext] || "application/octet-stream";

  if (req.method === "HEAD") {
    res.writeHead(200, { "Content-Type": contentType });
    res.end();
    return;
  }

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600"
  });
  createReadStream(filePath)
    .on("error", () => {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
    })
    .pipe(res);
}).listen(port, () => {
  console.log(`BNB site running at http://localhost:${port}`);
});
