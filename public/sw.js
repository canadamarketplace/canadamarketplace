const CACHE_NAME = "camarket-v1";

// Essential static assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/offline.html",
  "/icon.png",
  "/apple-icon.png",
  "/logo.png",
  "/logo-square.png",
  "/logo.svg"
];

// ─────────────────────────────────────────────
// Install: pre-cache essential static assets
// ─────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ─────────────────────────────────────────────
// Activate: clean up old caches
// ─────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─────────────────────────────────────────────
// Fetch: cache-first for static, network-first for API
// ─────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests (except for image CDNs)
  if (url.origin !== self.location.origin && !url.hostname.includes("picsum.photos")) return;

  // API calls: network-first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // HTML page requests: network-first with offline.html fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstWithOfflinePage(request));
    return;
  }

  // Static assets (CSS, JS, images, fonts): cache-first
  if (
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request));
});

// ─────────────────────────────────────────────
// Cache-first strategy (static assets)
// ─────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback for images
    if (request.url.match(/\.(png|jpg|jpeg|webp|svg)$/)) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#262626" width="200" height="200"/><text fill="#666" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">Offline</text></svg>',
        { headers: { "Content-Type": "image/svg+xml" } }
      );
    }
    return new Response("Offline", { status: 503 });
  }
}

// ─────────────────────────────────────────────
// Network-first strategy (API calls)
// ─────────────────────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response("Offline", { status: 503 });
  }
}

// ─────────────────────────────────────────────
// Network-first with offline.html fallback
// ─────────────────────────────────────────────
async function networkFirstWithOfflinePage(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Show offline fallback page
    const offlinePage = await caches.match("/offline.html");
    if (offlinePage) return offlinePage;

    return new Response("You're offline. Please check your internet connection.", { status: 503 });
  }
}
