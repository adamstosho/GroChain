const CACHE_NAME = "grochain-v1"
const STATIC_CACHE = "grochain-static-v1"
const DYNAMIC_CACHE = "grochain-dynamic-v1"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/offline",
  // Add other critical assets
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.grochain\.com\/api\/marketplace\/products/,
  /^https:\/\/api\.grochain\.com\/api\/weather/,
  /^http:\/\/localhost:5000\/api\/marketplace\/products/,
  /^http:\/\/localhost:5000\/api\/weather/,
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("[SW] Static assets cached successfully")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Handle API requests
  if (API_CACHE_PATTERNS.some((pattern) => pattern.test(request.url))) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Handle static assets
  if (request.destination === "image" || request.destination === "script" || request.destination === "style") {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(networkFirstStrategy(request, "/offline"))
    return
  }

  // Default strategy
  event.respondWith(networkFirstStrategy(request))
})

// Network first strategy (for API calls and navigation)
async function networkFirstStrategy(request, fallbackUrl = null) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }

    throw new Error("Network response not ok")
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url)

    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return fallback for navigation requests
    if (fallbackUrl && request.mode === "navigate") {
      const fallbackResponse = await caches.match(fallbackUrl)
      if (fallbackResponse) {
        return fallbackResponse
      }
    }

    throw error
  }
}

// Cache first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error("[SW] Failed to fetch:", request.url, error)
    throw error
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "background-sync-orders") {
    event.waitUntil(syncOfflineOrders())
  }

  if (event.tag === "background-sync-products") {
    event.waitUntil(syncOfflineProducts())
  }
})

// Sync offline orders when connection is restored
async function syncOfflineOrders() {
  try {
    const offlineOrders = await getOfflineData("pending-orders")

    for (const order of offlineOrders) {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${order.token}`,
          },
          body: JSON.stringify(order.data),
        })

        if (response.ok) {
          await removeOfflineData("pending-orders", order.id)
          console.log("[SW] Order synced successfully:", order.id)
        }
      } catch (error) {
        console.error("[SW] Failed to sync order:", order.id, error)
      }
    }
  } catch (error) {
    console.error("[SW] Background sync failed:", error)
  }
}

// Sync offline products when connection is restored
async function syncOfflineProducts() {
  try {
    const offlineProducts = await getOfflineData("pending-products")

    for (const product of offlineProducts) {
      try {
        const response = await fetch("/api/marketplace/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${product.token}`,
          },
          body: JSON.stringify(product.data),
        })

        if (response.ok) {
          await removeOfflineData("pending-products", product.id)
          console.log("[SW] Product synced successfully:", product.id)
        }
      } catch (error) {
        console.error("[SW] Failed to sync product:", product.id, error)
      }
    }
  } catch (error) {
    console.error("[SW] Background sync failed:", error)
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  const options = {
    body: "You have a new notification from GroChain",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
        icon: "/icon-192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-192.png",
      },
    ],
  }

  if (event.data) {
    const data = event.data.json()
    options.body = data.body || options.body
    options.data = { ...options.data, ...data }
  }

  event.waitUntil(self.registration.showNotification("GroChain", options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/dashboard"))
  }
})

// Helper functions for offline data management
async function getOfflineData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("GroChainOfflineDB", 1)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const getAllRequest = store.getAll()

      getAllRequest.onsuccess = () => resolve(getAllRequest.result)
      getAllRequest.onerror = () => reject(getAllRequest.error)
    }

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" })
      }
    }
  })
}

async function removeOfflineData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("GroChainOfflineDB", 1)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const deleteRequest = store.delete(id)

      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    }
  })
}
