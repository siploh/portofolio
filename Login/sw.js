const CACHE_NAME = 'login-pwa-v2';
const assetsToCache = [
  './',
  './index.html',
  './manifest.json',
  './img/iklan.jpeg'
];

// Event Install: Caching file utama
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(assetsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Event Activate: Hapus cache lama jika ada update
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Event Fetch: Menyajikan file dari cache atau jaringan
self.addEventListener('fetch', (event) => {
  // Hanya proses request GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
  );
});