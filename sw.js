const CACHE_NAME = 'rdr2-animals-v2';
const urlsToCache = [
  '/rdrcompendum/',
  '/rdrcompendum/index.html',
  '/rdrcompendum/manifest.json',
  '/rdrcompendum/icon-192.png',
  '/rdrcompendum/icon-512.png'
];

self.addEventListener('install', event => {
  // Force the waiting service worker to become active
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // Network-first strategy: try network, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and cache the fresh response
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  // Take control of all pages immediately
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});
