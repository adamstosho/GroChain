// PWA utility functions

export interface OfflineData {
  id: string
  type: "order" | "product" | "harvest"
  data: any
  token?: string
  timestamp: number
}

// IndexedDB helper class
class OfflineStorage {
  private dbName = "GroChainOfflineDB"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = () => {
        const db = request.result

        // Create object stores
        if (!db.objectStoreNames.contains("pending-orders")) {
          db.createObjectStore("pending-orders", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("pending-products")) {
          db.createObjectStore("pending-products", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("cached-data")) {
          db.createObjectStore("cached-data", { keyPath: "key" })
        }
      }
    })
  }

  async store(storeName: string, data: OfflineData): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async get(storeName: string, id: string): Promise<OfflineData | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(storeName: string): Promise<OfflineData[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async remove(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const offlineStorage = new OfflineStorage()

// Register background sync
export function registerBackgroundSync(tag: string): void {
  if ("serviceWorker" in navigator && "sync" in (window.ServiceWorkerRegistration.prototype as any)) {
    navigator.serviceWorker.ready
      .then((registration) => {
        return (registration as any).sync.register(tag)
      })
      .catch((error) => {
        console.error("Background sync registration failed:", error)
      })
  }
}

// Store data for offline sync
export async function storeOfflineData(
  type: "order" | "product" | "harvest",
  data: any,
  token?: string,
): Promise<void> {
  const offlineData: OfflineData = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    token,
    timestamp: Date.now(),
  }

  const storeName = `pending-${type}s`
  await offlineStorage.store(storeName, offlineData)

  // Register background sync
  registerBackgroundSync(`background-sync-${type}s`)
}

// Push notification utilities
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications")
    return "denied"
  }

  if (Notification.permission === "granted") {
    return "granted"
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission
  }

  return Notification.permission
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push messaging is not supported")
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey || vapidKey === "your_vapid_public_key_here" || vapidKey.length < 50) {
      console.log("VAPID public key not properly configured, skipping push notification subscription")
      return null
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })

    console.log("Push subscription successful:", subscription)
    return subscription
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error)
    return null
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Service worker registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported")
    return null
  }

  const isPreview =
    window.location.hostname.includes("vusercontent.net") ||
    window.location.hostname.includes("vercel.app")

  if (isPreview) {
    console.log("Skipping service worker registration in preview environment")
    return null
  }

  // Allow service worker in development for testing
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 Development mode: Service worker registration enabled for testing")
  }

  try {
    // Use development service worker in development mode
    const swPath = process.env.NODE_ENV === "development" ? "/sw-dev.js" : "/sw.js"
    const response = await fetch(swPath, { method: "HEAD" })
    if (!response.ok || response.headers.get("content-type")?.includes("text/html")) {
      console.log("Service worker file not available or served incorrectly, skipping registration")
      return null
    }
  } catch (error) {
    console.log("Cannot access service worker file, skipping registration:", error)
    return null
  }

  try {
    const swPath = process.env.NODE_ENV === "development" ? "/sw-dev.js" : "/sw.js"
    const registration = await navigator.serviceWorker.register(swPath)
    console.log("Service worker registered successfully:", registration)

    // Handle service worker updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New service worker is available
            console.log("New service worker available")
            // You could show a notification to the user here
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error("Service worker registration failed:", error)
    return null
  }
}

// Check if app is running as PWA
export function isPWA(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
}

// Get network status
export function getNetworkStatus(): { online: boolean; effectiveType?: string } {
  const connection =
    (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
  }
}
