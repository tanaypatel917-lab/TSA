const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const CACHE = "ai-compass-v1";
const SHELL = [`${BASE}/`, `${BASE}/modules/`, `${BASE}/badges/`, `${BASE}/glossary/`, `${BASE}/about/`];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(SHELL.map((url) => cache.add(url).catch(() => {})))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/_next/webpack-hmr")) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      });
      if (cached) {
        event.waitUntil(network.catch(() => {}));
        return cached;
      }
      try {
        return await network;
      } catch (error) {
        if (request.mode === "navigate") {
          const fallback = await cache.match(`${BASE}/`);
          if (fallback) return fallback;
        }
        throw error;
      }
    })
  );
});
