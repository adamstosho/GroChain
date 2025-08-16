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