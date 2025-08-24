import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'grochain-offline'
const DB_VERSION = 2

interface OfflineQueue {
  id?: number
  url: string
  method: string
  data?: any
  headers?: Record<string, string>
  timestamp: number
  retries: number
  maxRetries: number
  priority: 'high' | 'medium' | 'low'
}

interface CachedData {
  id?: number
  key: string
  data: any
  timestamp: number
  expiresAt?: number
  version: number
}

interface SyncStatus {
  key: string
  lastSync: number
  status: 'synced' | 'pending' | 'failed'
  error?: string
}

class OfflineStorage {
  private db: IDBPDatabase | null = null

  async init() {
    if (this.db) return this.db

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Queue store for offline mutations
        if (!db.objectStoreNames.contains('queue')) {
          const queueStore = db.createObjectStore('queue', {
            keyPath: 'id',
            autoIncrement: true,
          })
          queueStore.createIndex('timestamp', 'timestamp')
          queueStore.createIndex('priority', 'priority')
        }

        // Cache store for API responses
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', {
            keyPath: 'key',
          })
          cacheStore.createIndex('timestamp', 'timestamp')
          cacheStore.createIndex('expiresAt', 'expiresAt')
        }

        // User data store
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', {
            keyPath: 'key',
          })
        }

        // Sync status store
        if (!db.objectStoreNames.contains('syncStatus')) {
          const syncStore = db.createObjectStore('syncStatus', {
            keyPath: 'key',
          })
          syncStore.createIndex('lastSync', 'lastSync')
          syncStore.createIndex('status', 'status')
        }

        // Images store for offline images
        if (!db.objectStoreNames.contains('images')) {
          const imageStore = db.createObjectStore('images', {
            keyPath: 'key',
          })
          imageStore.createIndex('timestamp', 'timestamp')
        }
      },
    })

    return this.db
  }

  // Queue Management with Priority
  async addToQueue(item: Omit<OfflineQueue, 'id' | 'timestamp' | 'retries' | 'maxRetries' | 'priority'> & { priority?: 'high' | 'medium' | 'low' }) {
    const db = await this.init()
    const queueItem: OfflineQueue = {
      ...item,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3,
      priority: item.priority || 'medium',
    }
    return db.add('queue', queueItem)
  }

  async getQueue(priorityOrder = true): Promise<OfflineQueue[]> {
    const db = await this.init()
    if (priorityOrder) {
      const all = await db.getAll('queue')
      const priorityMap = { high: 3, medium: 2, low: 1 }
      return all.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority])
    }
    return db.getAll('queue')
  }

  async removeFromQueue(id: number) {
    const db = await this.init()
    return db.delete('queue', id)
  }

  async incrementRetries(id: number) {
    const db = await this.init()
    const item = await db.get('queue', id)
    if (item) {
      item.retries += 1
      await db.put('queue', item)
      
      // Remove if max retries exceeded
      if (item.retries >= item.maxRetries) {
        await this.removeFromQueue(id)
        return false
      }
    }
    return true
  }

  // Enhanced Cache Management
  async setCache(key: string, data: any, ttlMinutes = 60, version = 1) {
    const db = await this.init()
    const cacheItem: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
      version,
    }
    return db.put('cache', cacheItem)
  }

  async getCache(key: string, minVersion = 1): Promise<any | null> {
    const db = await this.init()
    const item = await db.get('cache', key)
    
    if (!item) return null
    
    // Check version compatibility
    if (item.version < minVersion) {
      await db.delete('cache', key)
      return null
    }
    
    // Check if expired
    if (item.expiresAt && Date.now() > item.expiresAt) {
      await db.delete('cache', key)
      return null
    }
    
    return item.data
  }

  async invalidateCache(pattern?: string) {
    const db = await this.init()
    if (pattern) {
      const all = await db.getAll('cache')
      const toDelete = all.filter(item => item.key.includes(pattern))
      await Promise.all(toDelete.map(item => db.delete('cache', item.key)))
    } else {
      await db.clear('cache')
    }
  }

  async clearExpiredCache() {
    const db = await this.init()
    const tx = db.transaction('cache', 'readwrite')
    const index = tx.store.index('expiresAt')
    const expired = await index.getAll(IDBKeyRange.upperBound(Date.now()))
    
    await Promise.all(expired.map(item => tx.store.delete(item.key)))
    await tx.done
  }

  // Sync Status Management
  async setSyncStatus(key: string, status: 'synced' | 'pending' | 'failed', error?: string) {
    const db = await this.init()
    const syncStatus: SyncStatus = {
      key,
      lastSync: Date.now(),
      status,
      error,
    }
    return db.put('syncStatus', syncStatus)
  }

  async getSyncStatus(key: string): Promise<SyncStatus | null> {
    const db = await this.init()
    return db.get('syncStatus', key)
  }

  async getPendingSyncs(): Promise<SyncStatus[]> {
    const db = await this.init()
    const tx = db.transaction('syncStatus', 'readonly')
    const index = tx.store.index('status')
    return index.getAll('pending')
  }

  // Image Storage for Offline
  async storeImage(key: string, blob: Blob) {
    const db = await this.init()
    return db.put('images', {
      key,
      blob,
      timestamp: Date.now(),
    })
  }

  async getImage(key: string): Promise<Blob | null> {
    const db = await this.init()
    const item = await db.get('images', key)
    return item?.blob || null
  }

  // User Data Management
  async setUserData(key: string, data: any) {
    const db = await this.init()
    return db.put('userData', { key, data, timestamp: Date.now() })
  }

  async getUserData(key: string): Promise<any | null> {
    const db = await this.init()
    const item = await db.get('userData', key)
    return item?.data || null
  }

  async clearUserData() {
    const db = await this.init()
    return db.clear('userData')
  }

  // Background Sync Integration
  async processQueue(apiClient: any) {
    const queue = await this.getQueue(true) // Get with priority order
    const results = []

    for (const item of queue) {
      try {
        // Attempt to replay the request
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.data ? JSON.stringify(item.data) : undefined,
        })

        if (response.ok) {
          await this.removeFromQueue(item.id!)
          await this.setSyncStatus(item.url, 'synced')
          results.push({ success: true, item })
        } else {
          const canRetry = await this.incrementRetries(item.id!)
          if (!canRetry) {
            await this.setSyncStatus(item.url, 'failed', 'Max retries exceeded')
          }
          results.push({ success: false, item, canRetry })
        }
      } catch (error) {
        const canRetry = await this.incrementRetries(item.id!)
        if (!canRetry) {
          await this.setSyncStatus(item.url, 'failed', error instanceof Error ? error.message : 'Unknown error')
        }
        results.push({ success: false, item, error, canRetry })
      }
    }

    return results
  }

  // Utilities
  async clearAll() {
    const db = await this.init()
    await Promise.all([
      db.clear('queue'),
      db.clear('cache'),
      db.clear('userData'),
      db.clear('syncStatus'),
      db.clear('images'),
    ])
  }

  async getStorageStats() {
    const db = await this.init()
    const [queueCount, cacheCount, userDataCount, syncCount, imageCount] = await Promise.all([
      db.count('queue'),
      db.count('cache'),
      db.count('userData'),
      db.count('syncStatus'),
      db.count('images'),
    ])
    
    // Calculate approximate storage size
    const cacheSize = await this.calculateStoreSize('cache')
    const imageSize = await this.calculateStoreSize('images')
    
    return {
      queueCount,
      cacheCount,
      userDataCount,
      syncCount,
      imageCount,
      approximateSize: {
        cache: cacheSize,
        images: imageSize,
        total: cacheSize + imageSize,
      },
    }
  }

  private async calculateStoreSize(storeName: string): Promise<number> {
    const db = await this.init()
    const all = await db.getAll(storeName)
    return all.reduce((size, item) => {
      return size + JSON.stringify(item).length * 2 // Rough estimate
    }, 0)
  }
}

export const offlineStorage = new OfflineStorage()

// Legacy compatibility exports
export class OfflineDataManager {
  static async saveOfflineData(data: any) {
    return offlineStorage.addToQueue({
      url: '/api/sync/offline-data',
      method: 'POST',
      data,
      priority: 'medium'
    })
  }

  static async getOfflineData() {
    return offlineStorage.getQueue()
  }

  static async clearOfflineData() {
    return offlineStorage.clearAll()
  }
}

// Enhanced Offline Storage for GroChain
// Provides offline-first functionality with background sync and comprehensive data management

export interface OfflineData {
  id: string
  type: "harvest" | "order" | "product" | "payment" | "shipment"
  data: any
  token?: string
  timestamp: number
  retryCount: number
  maxRetries: number
  priority: "high" | "medium" | "low"
  metadata?: {
    location?: string
    farmerId?: string
    batchId?: string
    qrCode?: string
    photos?: string[]
    notes?: string
  }
}

export interface SyncStatus {
  id: string
  type: string
  status: "pending" | "syncing" | "completed" | "failed"
  lastAttempt: number
  nextRetry: number
  error?: string
}

export interface OfflineCapabilities {
  harvests: boolean
  orders: boolean
  marketplace: boolean
  payments: boolean
  analytics: boolean
  sync: boolean
}

class EnhancedOfflineStorage {
  private dbName = "GroChainOfflineDB"
  private version = 2
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores with enhanced structure
        if (!db.objectStoreNames.contains("pending-data")) {
          const store = db.createObjectStore("pending-data", { keyPath: "id" })
          store.createIndex("type", "type", { unique: false })
          store.createIndex("timestamp", "timestamp", { unique: false })
          store.createIndex("priority", "priority", { unique: false })
          store.createIndex("retryCount", "retryCount", { unique: false })
        }

        if (!db.objectStoreNames.contains("cached-data")) {
          const store = db.createObjectStore("cached-data", { keyPath: "key" })
          store.createIndex("timestamp", "timestamp", { unique: false })
        }

        if (!db.objectStoreNames.contains("sync-status")) {
          const store = db.createObjectStore("sync-status", { keyPath: "id" })
          store.createIndex("type", "type", { unique: false })
          store.createIndex("status", "status", { unique: false })
        }

        if (!db.objectStoreNames.contains("offline-capabilities")) {
          db.createObjectStore("offline-capabilities", { keyPath: "feature" })
        }
      }
    })
  }

  // Store offline data with enhanced metadata
  async storeOfflineData(
    type: OfflineData["type"],
    data: any,
    options: {
      token?: string
      priority?: "high" | "medium" | "low"
      metadata?: OfflineData["metadata"]
      maxRetries?: number
    } = {}
  ): Promise<string> {
    if (!this.db) await this.init()

    const offlineData: OfflineData = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      token: options.token,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      priority: options.priority || "medium",
      metadata: options.metadata
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pending-data"], "readwrite")
      const store = transaction.objectStore("pending-data")
      const request = store.put(offlineData)

      request.onsuccess = () => {
        // Register background sync
        this.registerBackgroundSync(type)
        resolve(offlineData.id)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Get offline data by type and priority
  async getOfflineData(
    type?: OfflineData["type"],
    priority?: "high" | "medium" | "low"
  ): Promise<OfflineData[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pending-data"], "readonly")
      const store = transaction.objectStore("pending-data")
      const request = store.getAll()

      request.onsuccess = () => {
        let results = request.result as OfflineData[]
        
        if (type) {
          results = results.filter(item => item.type === type)
        }
        
        if (priority) {
          results = results.filter(item => item.priority === priority)
        }
        
        // Sort by priority and timestamp
        results.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
          if (priorityDiff !== 0) return priorityDiff
          return a.timestamp - b.timestamp
        })
        
        resolve(results)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Update sync status
  async updateSyncStatus(id: string, status: SyncStatus["status"], error?: string): Promise<void> {
    if (!this.db) await this.init()

    const syncStatus: SyncStatus = {
      key: id, // Assuming key is the ID for sync status
      lastSync: Date.now(),
      status,
      error,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["syncStatus"], "readwrite")
      const store = transaction.objectStore("syncStatus")
      const request = store.put(syncStatus)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Get retry delay based on retry count
  private getRetryDelay(id: string): number {
    // Exponential backoff: 1min, 2min, 4min, 8min, 16min
    const baseDelay = 60000 // 1 minute
    const maxDelay = 960000 // 16 minutes
    const retryCount = parseInt(id.split('-')[2]) || 0
    return Math.min(baseDelay * Math.pow(2, retryCount), maxDelay)
  }

  // Remove successfully synced data
  async removeSyncedData(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pending-data", "sync-status"], "readwrite")
      const pendingStore = transaction.objectStore("pending-data")
      const syncStore = transaction.objectStore("sync-status")
      
      const pendingRequest = pendingStore.delete(id)
      const syncRequest = syncStore.delete(id)

      Promise.all([pendingRequest, syncRequest])
        .then(() => resolve())
        .catch(reject)
    })
  }

  // Cache data for offline access
  async cacheData(key: string, data: any, ttl: number = 86400000): Promise<void> {
    if (!this.db) await this.init()

    const cacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cached-data"], "readwrite")
      const store = transaction.objectStore("cached-data")
      const request = store.put(cacheEntry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Get cached data
  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cached-data"], "readonly")
      const store = transaction.objectStore("cached-data")
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        if (!result) {
          resolve(null)
          return
        }

        // Check if data is expired
        if (Date.now() - result.timestamp > result.ttl) {
          // Remove expired data
          this.removeCachedData(key)
          resolve(null)
          return
        }

        resolve(result.data)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Remove cached data
  async removeCachedData(key: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cached-data"], "readwrite")
      const store = transaction.objectStore("cached-data")
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Get sync statistics
  async getSyncStats(): Promise<{
    total: number
    pending: number
    syncing: number
    completed: number
    failed: number
    byType: Record<string, number>
  }> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["sync-status"], "readonly")
      const store = transaction.objectStore("sync-status")
      const request = store.getAll()

      request.onsuccess = () => {
        const results = request.result as SyncStatus[]
        
        const stats = {
          total: results.length,
          pending: results.filter(r => r.status === "pending").length,
          syncing: results.filter(r => r.status === "syncing").length,
          completed: results.filter(r => r.status === "completed").length,
          failed: results.filter(r => r.status === "failed").length,
          byType: {} as Record<string, number>
        }

        results.forEach(result => {
          stats.byType[result.type] = (stats.byType[result.type] || 0) + 1
        })

        resolve(stats)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Clear all offline data
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["pending-data", "cached-data", "sync-status"], 
        "readwrite"
      )
      
      const pendingStore = transaction.objectStore("pending-data")
      const cachedStore = transaction.objectStore("cached-data")
      const syncStore = transaction.objectStore("sync-status")

      Promise.all([
        pendingStore.clear(),
        cachedStore.clear(),
        syncStore.clear()
      ])
        .then(() => resolve())
        .catch(reject)
    })
  }

  // Register background sync
  private registerBackgroundSync(type: OfflineData["type"]): void {
    if ("serviceWorker" in navigator && "sync" in (window.ServiceWorkerRegistration.prototype as any)) {
      navigator.serviceWorker.ready
        .then((registration) => {
          return (registration as any).sync.register(`background-sync-${type}s`)
        })
        .catch((error) => {
          console.error("Background sync registration failed:", error)
        })
    }
  }

  // Check offline capabilities
  async checkOfflineCapabilities(): Promise<OfflineCapabilities> {
    const capabilities: OfflineCapabilities = {
      harvests: await this.isFeatureAvailable("harvests"),
      orders: await this.isFeatureAvailable("orders"),
      marketplace: await this.isFeatureAvailable("marketplace"),
      payments: await this.isFeatureAvailable("payments"),
      analytics: await this.isFeatureAvailable("analytics"),
      sync: "serviceWorker" in navigator && "sync" in (window.ServiceWorkerRegistration.prototype as any)
    }

    return capabilities
  }

  // Check if a specific feature is available offline
  private async isFeatureAvailable(feature: string): Promise<boolean> {
    if (!this.db) await this.init()

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(["offline-capabilities"], "readonly")
      const store = transaction.objectStore("offline-capabilities")
      const request = store.get(feature)

      request.onsuccess = () => {
        resolve(!!request.result)
      }
      request.onerror = () => resolve(false)
    })
  }

  // Set offline capability for a feature
  async setOfflineCapability(feature: string, enabled: boolean): Promise<void> {
    if (!this.db) await this.init()

    if (enabled) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(["offline-capabilities"], "readwrite")
        const store = transaction.objectStore("offline-capabilities")
        const request = store.put({ feature, enabled: true, timestamp: Date.now() })

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } else {
      return this.removeOfflineCapability(feature)
    }
  }

  // Remove offline capability for a feature
  private async removeOfflineCapability(feature: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["offline-capabilities"], "readwrite")
      const store = transaction.objectStore("offline-capabilities")
      const request = store.delete(feature)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const enhancedOfflineStorage = new EnhancedOfflineStorage()

// Utility functions for common offline operations
export const offlineUtils = {
  // Store harvest data offline
  async storeHarvest(harvestData: any, metadata?: OfflineData["metadata"]): Promise<string> {
    return enhancedOfflineStorage.storeOfflineData("harvest", harvestData, {
      priority: "high",
      metadata,
      maxRetries: 5
    })
  },

  // Store order data offline
  async storeOrder(orderData: any, metadata?: OfflineData["metadata"]): Promise<string> {
    return enhancedOfflineStorage.storeOfflineData("order", orderData, {
      priority: "high",
      metadata,
      maxRetries: 3
    })
  },

  // Store product data offline
  async storeProduct(productData: any, metadata?: OfflineData["metadata"]): Promise<string> {
    return enhancedOfflineStorage.storeOfflineData("product", productData, {
      priority: "medium",
      metadata,
      maxRetries: 3
    })
  },

  // Store payment data offline
  async storePayment(paymentData: any, metadata?: OfflineData["metadata"]): Promise<string> {
    return enhancedOfflineStorage.storeOfflineData("payment", paymentData, {
      priority: "high",
      metadata,
      maxRetries: 5
    })
  },

  // Store shipment data offline
  async storeShipment(shipmentData: any, metadata?: OfflineData["metadata"]): Promise<string> {
    return enhancedOfflineStorage.storeOfflineData("shipment", shipmentData, {
      priority: "medium",
      metadata,
      maxRetries: 3
    })
  },

  // Get all pending data for sync
  async getPendingData(): Promise<OfflineData[]> {
    return enhancedOfflineStorage.getOfflineData()
  },

  // Get sync statistics
  async getSyncStats() {
    return enhancedOfflineStorage.getSyncStats()
  },

  // Check offline capabilities
  async checkCapabilities(): Promise<OfflineCapabilities> {
    return enhancedOfflineStorage.checkOfflineCapabilities()
  },

  // Clear all offline data
  async clearAll(): Promise<void> {
    return enhancedOfflineStorage.clearAllData()
  }
}