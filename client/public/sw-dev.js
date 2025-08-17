// Development Service Worker for GroChain
const CACHE_NAME = 'grochain-dev-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json'
];

// Install event - cache basic resources
self.addEventListener('install', (event) => {
  console.log('🔧 Development Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('🔧 Development Service Worker: Caching basic resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('🔧 Development Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔧 Development Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🔧 Development Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🔧 Development Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('🔧 Development Service Worker: API request failed, returning offline response');
          return new Response(
            JSON.stringify({ 
              error: 'Network error - please check your connection',
              offline: true 
            }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('🔧 Development Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                console.log('🔧 Development Service Worker: Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              console.log('🔧 Development Service Worker: Navigation failed, returning offline page');
              return caches.match('/offline');
            }
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('🔧 Development Service Worker: Push notification received');
  
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'You have a new notification',
        icon: '/placeholder-logo.png',
        badge: '/placeholder-logo.png',
        tag: 'grochain-notification',
        data: data
      };

      event.waitUntil(
        self.registration.showNotification(data.title || 'GroChain Notification', options)
      );
    } catch (error) {
      console.error('🔧 Development Service Worker: Error parsing push data:', error);
    }
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🔧 Development Service Worker: Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/dashboard')
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('🔧 Development Service Worker: Background sync event:', event.tag);
  
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncOrders());
  } else if (event.tag === 'background-sync-harvests') {
    event.waitUntil(syncHarvests());
  }
});

// Mock sync functions for development
async function syncOrders() {
  console.log('🔧 Development Service Worker: Syncing orders...');
  // In production, this would sync pending orders
}

async function syncHarvests() {
  console.log('🔧 Development Service Worker: Syncing harvests...');
  // In production, this would sync pending harvests
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('🔧 Development Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🔧 Development Service Worker: Loaded successfully');
