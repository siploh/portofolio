const CACHE_NAME = 'w-pos-cache-v4';
// Hanya cache file utama yang pasti ada agar instalasi tidak gagal
const assetsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Event Install: Caching file utama dengan aman
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Menggunakan addAll dengan penanganan error agar tidak memutus instalasi jika ada file opsional
        return cache.addAll(assetsToCache).catch(err => console.log('Cache addAll error:', err));
      })
      .then(() => self.skipWaiting())
  );
});

// Event Activate: Mengambil alih kontrol klien
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

// Event Fetch: Strategi Stale-While-Revalidate yang aman untuk PWA
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Ambil dari cache dulu jika ada, lalu update dari network di latar belakang
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Jika network gagal dan tidak ada cache, biarkan atau abaikan
          });

        return cachedResponse || fetchPromise;
      })
  );
});
