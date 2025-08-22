"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff, 
  Database, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Globe,
  Shield,
  Zap,
  BarChart3,
  Activity,
  Cloud,
  CloudOff
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { ServiceWorkerManager } from "./service-worker-manager"

interface PWAStatus {
  isInstalled: boolean
  isOnline: boolean
  serviceWorkerActive: boolean
  cacheSize: number
  offlineDataCount: number
  lastUpdate: string
  version: string
}

interface OfflineCapability {
  feature: string
  status: 'available' | 'partial' | 'unavailable'
  description: string
  icon: React.ReactNode
}

export function PWADashboard() {
  const { user } = useAuth()
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: navigator.onLine,
    serviceWorkerActive: false,
    cacheSize: 0,
    offlineDataCount: 0,
    lastUpdate: new Date().toISOString(),
    version: '1.0.0'
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [autoSync, setAutoSync] = useState(true)
  const [backgroundSync, setBackgroundSync] = useState(true)
  const [notifications, setNotifications] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkPWAStatus()
    checkServiceWorker()
    updateOnlineStatus()

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const updateOnlineStatus = () => {
    setPwaStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine
    }))
  }

  const checkPWAStatus = () => {
    // Check if app is installed
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches || 
                       (window.navigator as any).standalone === true
    
    setPwaStatus(prev => ({
      ...prev,
      isInstalled
    }))
  }

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        setPwaStatus(prev => ({
          ...prev,
          serviceWorkerActive: !!registration?.active
        }))
      } catch (error) {
        console.error('Service worker check failed:', error)
      }
    }
  }

  const handleInstall = async () => {
    try {
      // This would trigger the install prompt
      const promptEvent = (window as any).deferredPrompt
      if (promptEvent) {
        promptEvent.prompt()
        const { outcome } = await promptEvent.userChoice
        if (outcome === 'accepted') {
          toast.success('GroChain installed successfully!')
          checkPWAStatus()
        }
      } else {
        toast.info('Install prompt not available. Use your browser\'s install option.')
      }
    } catch (error) {
      console.error('Install failed:', error)
      toast.error('Installation failed')
    }
  }

  const handleSyncNow = async () => {
    setLoading(true)
    try {
      // Trigger background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register('background-sync')
        toast.success('Background sync initiated')
      } else {
        toast.info('Background sync not supported in this browser')
      }
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Sync failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        toast.success('Cache cleared successfully')
        checkPWAStatus()
      }
    } catch (error) {
      console.error('Cache clear failed:', error)
      toast.error('Failed to clear cache')
    }
  }

  const offlineCapabilities: OfflineCapability[] = [
    {
      feature: 'Harvest Logging',
      status: 'available',
      description: 'Log harvests offline and sync when online',
      icon: <Database className="h-5 w-5" />
    },
    {
      feature: 'Marketplace',
      status: 'partial',
      description: 'Browse products offline, limited functionality',
      icon: <Globe className="h-5 w-5" />
    },
    {
      feature: 'Data Sync',
      status: 'available',
      description: 'Automatic background synchronization',
      icon: <RefreshCw className="h-5 w-5" />
    },
    {
      feature: 'Push Notifications',
      status: 'available',
      description: 'Receive notifications even when app is closed',
      icon: <Zap className="h-5 w-5" />
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'partial':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'unavailable':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500'
      case 'partial':
        return 'bg-yellow-500'
      case 'unavailable':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Smartphone className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading PWA dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold">PWA & Offline Features</h1>
            <p className="text-muted-foreground">
              Progressive Web App capabilities and offline functionality
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Badge className={pwaStatus.isOnline ? "bg-green-500" : "bg-red-500"}>
              {pwaStatus.isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
            {pwaStatus.isInstalled && (
              <Badge className="bg-blue-500">
                <Smartphone className="h-3 w-3 mr-1" />
                Installed
              </Badge>
            )}
          </div>
        </motion.div>

        {/* PWA Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>PWA Status Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {pwaStatus.isInstalled ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-muted-foreground">App Installed</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Wifi className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {pwaStatus.isOnline ? 'Online' : 'Offline'}
                  </p>
                  <p className="text-sm text-muted-foreground">Connection</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Database className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {pwaStatus.offlineDataCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Offline Items</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Cloud className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {pwaStatus.cacheSize}MB
                  </p>
                  <p className="text-sm text-muted-foreground">Cache Size</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="capabilities">Offline Capabilities</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Installation Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">App Installed</span>
                        <Badge variant={pwaStatus.isInstalled ? "default" : "secondary"}>
                          {pwaStatus.isInstalled ? "Yes" : "No"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Service Worker</span>
                        <Badge variant={pwaStatus.serviceWorkerActive ? "default" : "secondary"}>
                          {pwaStatus.serviceWorkerActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Version</span>
                        <span className="text-sm text-muted-foreground">{pwaStatus.version}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Last Update</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(pwaStatus.lastUpdate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {!pwaStatus.isInstalled && (
                      <Button onClick={handleInstall} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Install App
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button onClick={handleSyncNow} disabled={loading} className="w-full">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Syncing...' : 'Sync Now'}
                      </Button>
                      
                      <Button onClick={handleClearCache} variant="outline" className="w-full">
                        <Database className="h-4 w-4 mr-2" />
                        Clear Cache
                      </Button>
                      
                      <Button variant="outline" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        PWA Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Offline Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {offlineCapabilities.map((capability, index) => (
                      <div key={capability.feature} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {capability.icon}
                          </div>
                          <div>
                            <p className="font-medium">{capability.feature}</p>
                            <p className="text-sm text-muted-foreground">{capability.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(capability.status)}
                          <Badge className={getStatusColor(capability.status)}>
                            {capability.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>PWA Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-sync when online</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically sync offline data when connection is restored
                        </p>
                      </div>
                      <Switch
                        checked={autoSync}
                        onCheckedChange={setAutoSync}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Background sync</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow background synchronization when app is closed
                        </p>
                      </div>
                      <Switch
                        checked={backgroundSync}
                        onCheckedChange={setBackgroundSync}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications for important updates
                        </p>
                      </div>
                      <Switch
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="management" className="space-y-4">
              <ServiceWorkerManager />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
