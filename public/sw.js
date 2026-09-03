// ColorArchive Service Worker — offline caching for static assets
// Bump this on every change to THIS FILE's logic — activate() deletes every cache
// whose key is not the current one, so a bump is what makes existing installs adopt
// the new behaviour instead of keeping the old cached responses indefinitely.
// v4 -> v5 (2026-09-03): the navigation fallback no longer serves the homepage for
// other routes.
const CACHE_NAME = "colorarchive-v5";
const STATIC_ASSETS = [
  "/",
  "/all-colors/",
  "/brand-generator/",
  "/mood-palette/",
  "/favorites/",
  "/manifest.json",
];

// Install: pre-cache key pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first with cache fallback for navigation, cache-first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET, non-http(s), and API requests
  if (request.method !== "GET" || !request.url.startsWith("http") || request.url.includes("/api/") || request.url.includes("api.colorarchive.")) {
    return;
  }

  // HTML pages: network-first
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        // ─── DO NOT SERVE THE HOMEPAGE FOR A PAGE THAT IS NOT THE HOMEPAGE ─────
        // This used to end `cached || caches.match("/")`, so ANY navigation whose
        // network fetch failed and which was not already cached got the homepage
        // HTML served under its own URL: the address bar said /pro/, the content
        // was the front page, and Next.js then hydrated the homepage tree at a
        // route the server would have rendered differently.
        //
        // That is worse than an error in three ways — the visitor is silently
        // shown the wrong page, the URL and the content disagree so a reload or a
        // share propagates the confusion, and PageTracker reports a pageview for
        // the route that was ASKED for while the homepage is what rendered.
        //
        // Now the "/" fallback is used only when "/" is genuinely what was
        // requested. Anything else falls through to the browser's own offline
        // page, which at least tells the truth. Found 2026-09-03 while tracing a
        // client that produced 1,224 phantom homepage pageviews; this is not
        // proven to be that cause, but it is a real defect on its own.
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached;
            const url = new URL(request.url);
            if (url.origin === self.location.origin && (url.pathname === "/" || url.pathname === "")) {
              return caches.match("/");
            }
            return Response.error();
          })
        )
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
