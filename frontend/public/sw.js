// Service Worker for Medical Reference Guide PWA
const CACHE_NAME = 'med-guide-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/vite.svg',
  '/manifest.json'
];

// Install service worker and cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE).catch(err => {
          console.log('Cache addAll error:', err);
          // Continue even if some assets fail to cache
          return Promise.resolve();
        });
      })
      .catch(err => console.log('Cache open error:', err))
  );
  self.skipWaiting();
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Cache API responses for offline reliability
  if (event.request.url.includes('/api/') && event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return response;
          })
          .catch(() => {
            return new Response('Offline: API data unavailable', {
              status: 503,
              statusText: 'Offline API'
            });
          });
      })
    );
    return;
  }

  // Network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Skip unsupported schemes (chrome-extension, etc.)
        if (event.request.url.startsWith('chrome-extension://')) {
          return response;
        }
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        // Clone the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // Try to return from cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page or empty response
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            return new Response('Network error occurred', {
              status: 408,
              statusText: 'Request Timeout'
            });
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cards') {
    event.waitUntil(
      // Sync cards data when back online
      Promise.resolve()
    );
  }
});
