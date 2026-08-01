import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";

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

function routeMeta(pathname) {
  const base = "https://alkeyhomes.netlify.app";
  const routes = {
    "/": ["ALKEY Homes | Roysambu Serviced Apartments", "Book ALKEY Homes serviced apartments in Roysambu with direct WhatsApp support, visible availability and guest services."],
    "/rooms": ["Rooms | ALKEY Homes", "Compare ALKEY Homes serviced apartments in Roysambu and check dates before booking directly."],
    "/services": ["Guest Services | ALKEY Homes", "Order laundry, cleaning, groceries, airport transfers and guest services around Roysambu."],
    "/about": ["About | ALKEY Homes", "Meet the hosts and learn about ALKEY Homes serviced stays in Roysambu, Nairobi."],
    "/contact": ["Contact | ALKEY Homes", "Contact ALKEY Homes for directions, booking questions and guest support."],
    "/auth": ["Owner login | ALKEY Homes", "Owner management login for ALKEY Homes rooms, bookings, content and media."]
  };
  const [title, description] = routes[pathname] || (pathname.startsWith("/rooms/")
    ? ["Room availability | ALKEY Homes", "View room photos, amenities, availability and direct booking details at ALKEY Homes."]
    : pathname.startsWith("/services/")
      ? ["Guest service | ALKEY Homes", "View guest service details, prices and WhatsApp ordering information at ALKEY Homes."]
      : routes["/"]);
  const url = `${base}${pathname === "/" ? "/" : pathname}`;
  return { title, description, url };
}

function renderShell(pathname) {
  const meta = routeMeta(pathname);
  return readFileSync(join(root, "index.html"), "utf8")
    .replace(/<title>[^<]*<\/title>/, `<title>${htmlEscape(meta.title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.description)}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.description)}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.url)}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.title)}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.description)}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/>)/, `$1${htmlEscape(meta.url)}$2`);
}

createServer((req, res) => {
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
