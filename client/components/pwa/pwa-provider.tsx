"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { registerServiceWorker, isPWA, getNetworkStatus } from "@/lib/pwa-utils"
import { enhancedOfflineStorage, offlineUtils } from "@/lib/offline-storage"
import { toast } from "sonner"

interface PWAContextType {
  isInstalled: boolean
  isOnline: boolean
  networkType?: string
  serviceWorker: ServiceWorkerRegistration | null
  offlineCapabilities: {
    harvests: boolean
    orders: boolean
    marketplace: boolean
    payments: boolean
    analytics: boolean
    sync: boolean
  }
  pendingSyncCount: number
  installPrompt: any
  showInstallPrompt: () => void
  checkForUpdates: () => void
  syncOfflineData: () => Promise<void>
  clearOfflineData: () => Promise<void>
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function PWAProvider({ children }: { children: ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [networkType, setNetworkType] = useState<string>()
  const [serviceWorker, setServiceWorker] = useState<ServiceWorkerRegistration | null>(null)
  const [offlineCapabilities, setOfflineCapabilities] = useState({
    harvests: false,
    orders: false,
    marketplace: false,
    payments: false,
    analytics: false,
    sync: false
  })
  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    initializePWA()
    setupNetworkListeners()
    setupOfflineCapabilities()
    setupInstallPrompt()
    setupServiceWorker()
  }, [])

  const initializePWA = async () => {
    try {
      // Check if app is installed as PWA
      const installed = isPWA()
      setIsInstalled(installed)

      // Get network status
      const networkStatus = getNetworkStatus()
      setIsOnline(networkStatus.online)
      setNetworkType(networkStatus.effectiveType)

      // Initialize offline storage
      await enhancedOfflineStorage.init()

      // Check offline capabilities
      const capabilities = await offlineUtils.checkCapabilities()
      setOfflineCapabilities(capabilities)

      // Load pending sync count
      await updatePendingSyncCount()

      console.log("PWA initialized successfully")
    } catch (error) {
      console.error("PWA initialization failed:", error)
    }
  }

  const setupNetworkListeners = () => {
    const updateNetworkStatus = () => {
      const status = getNetworkStatus()
      setIsOnline(status.online)
      setNetworkType(status.effectiveType)

      if (status.online) {
        // Auto-sync when coming back online
        syncOfflineData()
      }
    }

    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    // Listen for network quality changes
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateNetworkStatus)
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', updateNetworkStatus)
      }
    }
  }

  const setupOfflineCapabilities = async () => {
    try {
      // Enable offline capabilities for core features
      await Promise.all([
        enhancedOfflineStorage.setOfflineCapability('harvests', true),
        enhancedOfflineStorage.setOfflineCapability('orders', true),
        enhancedOfflineStorage.setOfflineCapability('marketplace', true),
        enhancedOfflineStorage.setOfflineCapability('payments', true),
        enhancedOfflineStorage.setOfflineCapability('analytics', false), // Limited offline
        enhancedOfflineStorage.setOfflineCapability('sync', true)
      ])

      // Refresh capabilities
      const capabilities = await offlineUtils.checkCapabilities()
      setOfflineCapabilities(capabilities)
    } catch (error) {
      console.error("Failed to setup offline capabilities:", error)
    }
  }

  const setupInstallPrompt = () => {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      console.log("Install prompt available")
    })

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      toast.success("GroChain installed successfully!")
      console.log("App installed")
    })
  }

  const setupServiceWorker = async () => {
    try {
      const registration = await registerServiceWorker()
      if (registration) {
        setServiceWorker(registration)
        console.log("Service worker registered:", registration)

        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available
                toast.info("New version available! Refresh to update.")
                console.log("New service worker available")
              }
            })
          }
        })

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SYNC_PROGRESS') {
            setPendingSyncCount(event.data.count)
          }
        })
      }
    } catch (error) {
      console.error("Service worker setup failed:", error)
    }
  }

  const updatePendingSyncCount = async () => {
    try {
      const stats = await offlineUtils.getSyncStats()
      setPendingSyncCount(stats.pending)
    } catch (error) {
      console.error("Failed to update pending sync count:", error)
    }
  }

  const showInstallPrompt = async () => {
    if (!installPrompt) {
      toast.error("Install prompt not available")
      return
    }

    try {
      const result = await installPrompt.prompt()
      console.log("Install prompt result:", result)
      
      if (result.outcome === 'accepted') {
        toast.success("Installing GroChain...")
      } else {
        toast.info("Installation cancelled")
      }
      
      setInstallPrompt(null)
    } catch (error) {
      console.error("Install prompt failed:", error)
      toast.error("Failed to show install prompt")
    }
  }

  const checkForUpdates = async () => {
    if (!serviceWorker) {
      toast.error("Service worker not available")
      return
    }

    try {
      await serviceWorker.update()
      toast.info("Checking for updates...")
    } catch (error) {
      console.error("Update check failed:", error)
      toast.error("Failed to check for updates")
    }
  }

  const syncOfflineData = async () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline")
      return
    }

    try {
      toast.info("Starting offline data sync...")
      
      // Get all pending data
      const pendingData = await offlineUtils.getPendingData()
      
      if (pendingData.length === 0) {
        toast.success("No data to sync")
        return
      }

      // Start background sync for each data type
      const syncPromises = []

      const harvestData = pendingData.filter(item => item.type === "harvest")
      const orderData = pendingData.filter(item => item.type === "order")
      const productData = pendingData.filter(item => item.type === "product")
      const paymentData = pendingData.filter(item => item.type === "payment")
      const shipmentData = pendingData.filter(item => item.type === "shipment")

      if (harvestData.length > 0) {
        syncPromises.push(syncDataType("harvests", harvestData))
      }
      if (orderData.length > 0) {
        syncPromises.push(syncDataType("orders", orderData))
      }
      if (productData.length > 0) {
        syncPromises.push(syncDataType("products", productData))
      }
      if (paymentData.length > 0) {
        syncPromises.push(syncDataType("payments", paymentData))
      }
      if (shipmentData.length > 0) {
        syncPromises.push(syncDataType("shipments", shipmentData))
      }

      await Promise.all(syncPromises)
      
      toast.success("Offline data sync completed!")
      await updatePendingSyncCount()
    } catch (error) {
      console.error("Offline data sync failed:", error)
      toast.error("Sync failed. Some items may not have been synced.")
    }
  }

  const syncDataType = async (type: string, data: any[]) => {
    const endpoints = {
      harvests: '/api/harvests',
      orders: '/api/marketplace/orders',
      products: '/api/marketplace/listings',
      payments: '/api/payments',
      shipments: '/api/shipments'
    }

    const endpoint = endpoints[type as keyof typeof endpoints]
    if (!endpoint) return

    for (const item of data) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        })

        if (response.ok) {
          await enhancedOfflineStorage.removeSyncedData(item.id)
          console.log(`${type} synced successfully:`, item.id)
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        console.error(`Failed to sync ${type}:`, item.id, error)
        await enhancedOfflineStorage.updateSyncStatus(item.id, "failed", error.message)
      }
    }
  }

  const clearOfflineData = async () => {
    try {
      await offlineUtils.clearAll()
      toast.success("All offline data cleared")
      await updatePendingSyncCount()
    } catch (error) {
      console.error("Failed to clear offline data:", error)
      toast.error("Failed to clear offline data")
    }
  }

  // Periodic sync check when online
  useEffect(() => {
    if (!isOnline) return

    const syncInterval = setInterval(async () => {
      await updatePendingSyncCount()
      
      // Auto-sync if there's pending data and auto-sync is enabled
      if (pendingSyncCount > 0) {
        await syncOfflineData()
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(syncInterval)
  }, [isOnline, pendingSyncCount])

  const contextValue: PWAContextType = {
    isInstalled,
    isOnline,
    networkType,
    serviceWorker,
    offlineCapabilities,
    pendingSyncCount,
    installPrompt,
    showInstallPrompt,
    checkForUpdates,
    syncOfflineData,
    clearOfflineData
  }

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  )
}

export function usePWA() {
  const context = useContext(PWAContext)
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}

// Hook for offline-first operations
export function useOfflineFirst() {
  const { isOnline, offlineCapabilities } = usePWA()

  const storeOffline = async (
    type: "harvest" | "order" | "product" | "payment" | "shipment",
    data: any,
    metadata?: any
  ) => {
    try {
      const id = await offlineUtils[`store${type.charAt(0).toUpperCase() + type.slice(1)}`](data, metadata)
      
      if (isOnline) {
        // Try to sync immediately if online
        await syncOfflineData()
      } else {
        toast.info("Data stored offline. Will sync when connection is restored.")
      }
      
      return id
    } catch (error) {
      console.error(`Failed to store ${type} offline:`, error)
      throw error
    }
  }

  const getOfflineData = async (type?: string) => {
    return offlineUtils.getPendingData(type as any)
  }

  const isFeatureAvailableOffline = (feature: keyof typeof offlineCapabilities) => {
    return offlineCapabilities[feature]
  }

  return {
    storeOffline,
    getOfflineData,
    isFeatureAvailableOffline,
    isOnline,
    offlineCapabilities
  }
}
