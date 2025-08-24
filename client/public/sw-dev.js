// GroChain Development Service Worker
// This service worker provides offline-first functionality, background sync, and comprehensive caching

const CACHE_NAME = 'grochain-dev-v1'
const STATIC_CACHE = 'grochain-static-v1'
const DYNAMIC_CACHE = 'grochain-dynamic-v1'
const API_CACHE = 'grochain-api-v1'

// Core files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/_next/static/css/app.css',
  '/_next/static/js/app.js'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/health',
  '/api/analytics/dashboard',
  '/api/marketplace/listings',
  '/api/harvests',
  '/api/farmers'
]

// Install event - cache core files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static files')
        return cache.addAll(STATIC_FILES)
      }),
      
      // Cache API responses
      caches.open(API_CACHE).then((cache) => {
        console.log('Caching API endpoints')
        return cache.addAll(API_ENDPOINTS)
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Claim all clients
      self.clients.claim()
    ])
  )
})

// Fetch event - implement offline-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with fallback to cache
    event.respondWith(handleApiRequest(request))
  } else if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/static/')) {
    // Static assets - Cache First with fallback to network
    event.respondWith(handleStaticRequest(request))
  } else {
    // HTML pages - Network First with fallback to cache
    event.respondWith(handlePageRequest(request))
  }
})

// Handle API requests with Network First strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    throw new Error('Network response not ok')
  } catch (error) {
    console.log('API request failed, trying cache:', request.url)
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline mode', 
        message: 'This data is not available offline',
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 503, 
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle static asset requests with Cache First strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('Static asset fetch failed:', request.url)
    return new Response('Asset not available offline', { status: 404 })
  }
}

// Handle page requests with Network First strategy
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful page responses
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    throw new Error('Page response not ok')
  } catch (error) {
    console.log('Page request failed, trying cache:', request.url)
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    return caches.match('/offline')
  }
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync-harvests') {
    event.waitUntil(syncHarvests())
  } else if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncOrders())
  } else if (event.tag === 'background-sync-products') {
    event.waitUntil(syncProducts())
  }
})

// Sync harvests from offline storage
async function syncHarvests() {
  try {
    const cache = await caches.open('offline-harvests')
    const requests = await cache.keys()
    
    for (const request of requests) {
      try {
        const response = await cache.match(request)
        const harvestData = await response.json()
        
        // Attempt to sync with backend
        const syncResponse = await fetch('/api/harvests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(harvestData.data)
        })
        
        if (syncResponse.ok) {
          // Remove from offline cache if sync successful
          await cache.delete(request)
          console.log('Harvest synced successfully:', harvestData.id)
        }
      } catch (error) {
        console.error('Failed to sync harvest:', error)
      }
    }
  } catch (error) {
    console.error('Harvest sync failed:', error)
  }
}

// Sync orders from offline storage
async function syncOrders() {
  try {
    const cache = await caches.open('offline-orders')
    const requests = await cache.keys()
    
    for (const request of requests) {
      try {
        const response = await cache.match(request)
        const orderData = await response.json()
        
        // Attempt to sync with backend
        const syncResponse = await fetch('/api/marketplace/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData.data)
        })
        
        if (syncResponse.ok) {
          // Remove from offline cache if sync successful
          await cache.delete(request)
          console.log('Order synced successfully:', orderData.id)
        }
      } catch (error) {
        console.error('Failed to sync order:', error)
      }
    }
  } catch (error) {
    console.error('Order sync failed:', error)
  }
}

// Sync products from offline storage
async function syncProducts() {
  try {
    const cache = await caches.open('offline-products')
    const requests = await cache.keys()
    
    for (const request of requests) {
      try {
        const response = await cache.match(request)
        const productData = await response.json()
        
        // Attempt to sync with backend
        const syncResponse = await fetch('/api/marketplace/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData.data)
        })
        
        if (syncResponse.ok) {
          // Remove from offline cache if sync successful
          await cache.delete(request)
          console.log('Product synced successfully:', productData.id)
        }
      } catch (error) {
        console.error('Failed to sync product:', error)
      }
    }
  } catch (error) {
    console.error('Product sync failed:', error)
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body || 'New notification from GroChain',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      tag: data.tag || 'grochain-notification'
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'GroChain', options)
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  if (event.action) {
    // Handle specific actions
    handleNotificationAction(event.action, event.notification.data)
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Handle notification actions
function handleNotificationAction(action, data) {
  switch (action) {
    case 'view':
      clients.openWindow(data.url || '/')
      break
    case 'dismiss':
      // Just close the notification
      break
    default:
      clients.openWindow('/')
  }
}

// Message handling for service worker communication
self.addEventListener('message', (event) => {
  console.log('Service Worker message received:', event)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches())
  }
})

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  )
  console.log('All caches cleared')
}

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    console.log('Periodic sync triggered:', event.tag)
    
    if (event.tag === 'content-sync') {
      event.waitUntil(syncContent())
    }
  })
}

// Sync content periodically
async function syncContent() {
  try {
    // Sync various data types
    await Promise.all([
      syncHarvests(),
      syncOrders(),
      syncProducts()
    ])
    
    console.log('Periodic content sync completed')
  } catch (error) {
    console.error('Periodic content sync failed:', error)
  }
}

console.log('GroChain Service Worker loaded successfully')
