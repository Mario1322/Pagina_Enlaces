const STATIC_CACHE = "links-static-v2";
const RUNTIME_CACHE = "links-runtime-v1";
const IMAGE_CACHE = "links-images-v1";
const MAX_IMAGE_ENTRIES = 20;
const MAX_RUNTIME_ENTRIES = 30;

const CORE_ASSETS = [
  "./",
  "index.html",
  "404.html",
  "manifest.json",
  "css/terminal.css",
  "js/particles.js",
  "js/terminal.js",
  "js/i18n.js",
  "js/main.js",
  "imagenes/favicon-16.png",
  "imagenes/favicon-32.png",
  "imagenes/favicon-192.png",
  "imagenes/favicon-512.png",
  "imagenes/apple-touch-icon.png",
  "imagenes/senor-licenciado-660.webp"
];

const trimCache = async (cacheName, maxItems) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  while (keys.length > maxItems) {
    const key = keys.shift();
    if (key) await cache.delete(key);
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(CORE_ASSETS);
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      if (clients.length === 0) {
        self.skipWaiting();
      }
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const isNavigate = request.mode === "navigate";
  const isSameOrigin = new URL(request.url).origin === self.location.origin;
  const isImage = request.destination === "image";

  if (isNavigate) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("index.html"))),
    );
    return;
  }

  if (request.method !== "GET") return;

  if (isImage && isSameOrigin) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache
                .put(request, response.clone())
                .then(() => trimCache(IMAGE_CACHE, MAX_IMAGE_ENTRIES));
            }
            return response;
          });
        }),
      ),
    );
    return;
  }

  if (isSameOrigin) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                cache
                  .put(request, response.clone())
                  .then(() => trimCache(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES));
              }
              return response;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        }),
      ),
    );
    return;
  }

  // External assets (like CDN fonts, Boxicons)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        return response;
      });
    }),
  );
});
