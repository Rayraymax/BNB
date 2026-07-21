const CACHE_NAME = "bnb-platform-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/src/styles.css",
  "/src/app.js",
  "/src/data/mockData.js",
  "/src/lib/db.js",
  "/src/lib/seo.js",
  "/src/lib/whatsapp.js",
  "/assets/brand/alkey-logo.png",
  "/assets/uploads/alkey-luxury-hero-reference.png",
  "/assets/uploads/alkey-building-background.jpeg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/index.html")))
  );
});
