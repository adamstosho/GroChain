"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Settings,
  Download,
  Trash2,
  Activity,
  Clock,
  Database,
  Globe,
  Smartphone
} from "lucide-react"
import { toast } from "sonner"

interface ServiceWorkerInfo {
  isRegistered: boolean
  isActive: boolean
  isInstalled: boolean
  isUpdateAvailable: boolean
  version: string
  lastUpdate: string
  cacheSize: number
  offlineCapabilities: string[]
  pushSubscription: boolean
  backgroundSync: boolean
}

interface CacheInfo {
  name: string
  size: number
  entries: number
  lastAccessed: string
}

export function ServiceWorkerManager() {
  const [swInfo, setSwInfo] = useState<ServiceWorkerInfo>({
    isRegistered: false,
    isActive: false,
    isInstalled: false,
    isUpdateAvailable: false,
    version: '1.0.0',
    lastUpdate: new Date().toISOString(),
    cacheSize: 0,
    offlineCapabilities: [],
    pushSubscription: false,
    backgroundSync: false
  })
  const [caches, setCaches] = useState<CacheInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    checkServiceWorkerStatus()
    checkCaches()
    updateOnlineStatus()

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const updateOnlineStatus = () => {
    setIsOnline(navigator.onLine)
  }

  const checkServiceWorkerStatus = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        
        if (registration) {
          const activeWorker = registration.active
          const waitingWorker = registration.waiting
          
          setSwInfo(prev => ({
            ...prev,
            isRegistered: true,
            isActive: !!activeWorker,
            isInstalled: !!activeWorker,
            isUpdateAvailable: !!waitingWorker,
            version: activeWorker?.scriptURL ? '1.0.0' : '1.0.0',
            lastUpdate: activeWorker ? new Date().toISOString() : new Date().toISOString()
          }))

          // Check for updates
          registration.addEventListener('updatefound', () => {
            setSwInfo(prev => ({ ...prev, isUpdateAvailable: true }))
          })

          // Listen for service worker state changes
          if (activeWorker) {
            activeWorker.addEventListener('statechange', () => {
              setSwInfo(prev => ({ ...prev, isActive: activeWorker.state === 'activated' }))
            })
          }
        }
      } catch (error) {
        console.error('Service worker check failed:', error)
      }
    }
  }

  const checkCaches = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        const cacheInfos: CacheInfo[] = []

        for (const name of cacheNames) {
          const cache = await caches.open(name)
          const keys = await cache.keys()
          const size = keys.length // Approximate size
          
          cacheInfos.push({
            name,
            size,
            entries: keys.length,
            lastAccessed: new Date().toISOString()
          })
        }

        setCaches(cacheInfos)
        setSwInfo(prev => ({ 
          ...prev, 
          cacheSize: cacheInfos.reduce((acc, cache) => acc + cache.size, 0)
        }))
      } catch (error) {
        console.error('Cache check failed:', error)
      }
    }
  }

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        setLoading(true)
        
        const registration = await navigator.serviceWorker.register('/sw.js')
        
        if (registration.installing) {
          toast.success('Service worker installing...')
        } else if (registration.waiting) {
          toast.success('Service worker waiting...')
        } else if (registration.active) {
          toast.success('Service worker activated!')
        }
        
        await checkServiceWorkerStatus()
      } catch (error) {
        console.error('Service worker registration failed:', error)
        toast.error('Failed to register service worker')
      } finally {
        setLoading(false)
      }
    } else {
      toast.error('Service workers not supported in this browser')
    }
  }

  const unregisterServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        setLoading(true)
        
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.unregister()
          toast.success('Service worker unregistered')
          await checkServiceWorkerStatus()
        }
      } catch (error) {
        console.error('Service worker unregistration failed:', error)
        toast.error('Failed to unregister service worker')
      } finally {
        setLoading(false)
      }
    }
  }

  const updateServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        setLoading(true)
        
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          // Send message to waiting service worker to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          toast.success('Service worker update initiated')
          
          // Reload page after update
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          toast.info('No service worker update available')
        }
      } catch (error) {
        console.error('Service worker update failed:', error)
        toast.error('Failed to update service worker')
      } finally {
        setLoading(false)
      }
    }
  }

  const clearAllCaches = async () => {
    if ('caches' in window) {
      try {
        setLoading(true)
        
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        
        toast.success('All caches cleared')
        await checkCaches()
      } catch (error) {
        console.error('Cache clear failed:', error)
        toast.error('Failed to clear caches')
      } finally {
        setLoading(false)
      }
    }
  }

  const clearSpecificCache = async (cacheName: string) => {
    if ('caches' in window) {
      try {
        await caches.delete(cacheName)
        toast.success(`Cache '${cacheName}' cleared`)
        await checkCaches()
      } catch (error) {
        console.error('Cache clear failed:', error)
        toast.error('Failed to clear cache')
      }
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          toast.success('Push notifications enabled!')
          setSwInfo(prev => ({ ...prev, pushSubscription: true }))
        } else {
          toast.error('Push notifications denied')
        }
      } catch (error) {
        console.error('Notification permission request failed:', error)
        toast.error('Failed to request notification permission')
      }
    } else {
      toast.error('Notifications not supported in this browser')
    }
  }

  const testOfflineCapability = async () => {
    try {
      // Test if the app can work offline
      const testResponse = await fetch('/api/health')
      if (testResponse.ok) {
        toast.success('Online functionality working')
      }
    } catch (error) {
      // This is expected when offline
      toast.info('App is working offline')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Service Worker Manager</h2>
          <p className="text-muted-foreground">
            Manage service worker lifecycle, caching, and offline capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className={isOnline ? "bg-green-500" : "bg-red-500"}>
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Service Worker Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Worker Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {swInfo.isRegistered ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-muted-foreground">Registered</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {swInfo.isActive ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {swInfo.isInstalled ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-muted-foreground">Installed</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Download className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {swInfo.isUpdateAvailable ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-muted-foreground">Update Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Worker Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Service Worker Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={registerServiceWorker} 
              disabled={loading || swInfo.isRegistered}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Activity className="w-8 h-8 mb-2" />
              <span>Register SW</span>
            </Button>
            
            <Button 
              onClick={updateServiceWorker} 
              disabled={loading || !swInfo.isUpdateAvailable}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <RefreshCw className="w-8 h-8 mb-2" />
              <span>Update SW</span>
            </Button>
            
            <Button 
              onClick={unregisterServiceWorker} 
              disabled={loading || !swInfo.isRegistered}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <Trash2 className="w-8 h-8 mb-2" />
              <span>Unregister SW</span>
            </Button>
            
            <Button 
              onClick={testOfflineCapability} 
              disabled={loading}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <Globe className="w-8 h-8 mb-2" />
              <span>Test Offline</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cache Management</CardTitle>
            <Button onClick={clearAllCaches} disabled={loading} variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {caches.map((cache, index) => (
              <div key={cache.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{cache.name}</h4>
                    <Badge variant="outline">{cache.entries} entries</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Size: {cache.size} items</span>
                    <span>Last accessed: {new Date(cache.lastAccessed).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => clearSpecificCache(cache.name)} 
                  variant="outline" 
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            ))}
            
            {caches.length === 0 && (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No caches found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Enable push notifications for important updates
                </p>
              </div>
              <Button 
                onClick={requestNotificationPermission}
                disabled={swInfo.pushSubscription}
                variant={swInfo.pushSubscription ? "outline" : "default"}
              >
                {swInfo.pushSubscription ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Enabled
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Enable
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Background Sync</p>
                <p className="text-sm text-muted-foreground">
                  Sync data when app is closed
                </p>
              </div>
              <Badge variant={swInfo.backgroundSync ? "default" : "secondary"}>
                {swInfo.backgroundSync ? "Available" : "Not Available"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Offline Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Harvest Logging</span>
                <Badge className="bg-green-100 text-green-800">Available</Badge>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Sync</span>
                <Badge className="bg-green-100 text-green-800">Available</Badge>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Marketplace</span>
                <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Analytics</span>
                <Badge className="bg-red-100 text-red-800">Limited</Badge>
              </div>
              <Progress value={30} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
