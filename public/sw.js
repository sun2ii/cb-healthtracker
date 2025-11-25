const CACHE_NAME = 'cb-health-tracker-v1';
const STATIC_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Time for your medication',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'medication-reminder',
    requireInteraction: true,
    actions: [
      { action: 'confirm', title: 'I took it' },
      { action: 'snooze', title: 'Remind me later' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('CB Health Tracker', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'confirm') {
    event.waitUntil(
      clients.openWindow('/confirm')
    );
  } else if (event.action === 'snooze') {
    // Handle snooze
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
