import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
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
