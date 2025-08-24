"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Wifi,
  WifiOff,
  Upload,
  Download,
  Trash2,
  Settings,
  Activity,
  BarChart3,
  Package,
  CreditCard,
  Truck,
  Loader2,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"
import { toast } from "sonner"
import { offlineUtils, OfflineData, OfflineCapabilities } from "@/lib/offline-storage"

interface SyncStats {
  total: number
  pending: number
  syncing: number
  completed: number
  failed: number
  byType: Record<string, number>
}

export function OfflineSyncManager() {
  const [syncStats, setSyncStats] = useState<SyncStats>({
    total: 0,
    pending: 0,
    syncing: 0,
    completed: 0,
    failed: 0,
    byType: {}
  })
  const [pendingData, setPendingData] = useState<OfflineData[]>([])
  const [capabilities, setCapabilities] = useState<OfflineCapabilities>({
    harvests: false,
    orders: false,
    marketplace: false,
    payments: false,
    analytics: false,
    sync: false
  })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadSyncData()
    checkCapabilities()
    updateOnlineStatus()

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Set up periodic sync check
    const syncInterval = setInterval(loadSyncData, 10000) // Check every 10 seconds

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      clearInterval(syncInterval)
    }
  }, [])

  const updateOnlineStatus = () => {
    setIsOnline(navigator.onLine)
  }

  const loadSyncData = async () => {
    try {
      const [stats, data] = await Promise.all([
        offlineUtils.getSyncStats(),
        offlineUtils.getPendingData()
      ])
      
      setSyncStats(stats)
      setPendingData(data)
    } catch (error) {
      console.error('Failed to load sync data:', error)
    }
  }

  const checkCapabilities = async () => {
    try {
      const caps = await offlineUtils.checkCapabilities()
      setCapabilities(caps)
    } catch (error) {
      console.error('Failed to check capabilities:', error)
    }
  }

  const startSync = async () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline")
      return
    }

    try {
      setIsSyncing(true)
      
      // Start background sync for each data type
      const harvestData = pendingData.filter(item => item.type === "harvest")
      const orderData = pendingData.filter(item => item.type === "order")
      const productData = pendingData.filter(item => item.type === "product")
      const paymentData = pendingData.filter(item => item.type === "payment")
      const shipmentData = pendingData.filter(item => item.type === "shipment")

      const syncPromises = []

      if (harvestData.length > 0) {
        syncPromises.push(syncHarvests(harvestData))
      }
      if (orderData.length > 0) {
        syncPromises.push(syncOrders(orderData))
      }
      if (productData.length > 0) {
        syncPromises.push(syncProducts(productData))
      }
      if (paymentData.length > 0) {
        syncPromises.push(syncPayments(paymentData))
      }
      if (shipmentData.length > 0) {
        syncPromises.push(syncShipments(shipmentData))
      }

      await Promise.all(syncPromises)
      
      toast.success("Sync completed successfully!")
      await loadSyncData() // Refresh data
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error("Sync failed. Some items may not have been synced.")
    } finally {
      setIsSyncing(false)
    }
  }

  const syncHarvests = async (harvestData: OfflineData[]) => {
    for (const item of harvestData) {
      try {
        // Attempt to sync with backend
        const response = await fetch('/api/harvests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        })

        if (response.ok) {
          // Remove from offline storage if sync successful
          await offlineUtils.enhancedOfflineStorage.removeSyncedData(item.id)
          console.log('Harvest synced successfully:', item.id)
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to sync harvest:', item.id, error)
        // Update retry count and status
        await offlineUtils.enhancedOfflineStorage.updateSyncStatus(item.id, "failed", error.message)
      }
    }
  }

  const syncOrders = async (orderData: OfflineData[]) => {
    for (const item of orderData) {
      try {
        const response = await fetch('/api/marketplace/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        })

        if (response.ok) {
          await offlineUtils.enhancedOfflineStorage.removeSyncedData(item.id)
          console.log('Order synced successfully:', item.id)
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to sync order:', item.id, error)
        await offlineUtils.enhancedOfflineStorage.updateSyncStatus(item.id, "failed", error.message)
      }
    }
  }

  const syncProducts = async (productData: OfflineData[]) => {
    for (const item of productData) {
      try {
        const response = await fetch('/api/marketplace/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        })

        if (response.ok) {
          await offlineUtils.enhancedOfflineStorage.removeSyncedData(item.id)
          console.log('Product synced successfully:', item.id)
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to sync product:', item.id, error)
        await offlineUtils.enhancedOfflineStorage.updateSyncStatus(item.id, "failed", error.message)
      }
    }
  }

  const syncPayments = async (paymentData: OfflineData[]) => {
    for (const item of paymentData) {
      try {
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        })

        if (response.ok) {
          await offlineUtils.enhancedOfflineStorage.removeSyncedData(item.id)
          console.log('Payment synced successfully:', item.id)
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to sync payment:', item.id, error)
        await offlineUtils.enhancedOfflineStorage.updateSyncStatus(item.id, "failed", error.message)
      }
    }
  }

  const syncShipments = async (shipmentData: OfflineData[]) => {
    for (const item of shipmentData) {
      try {
        const response = await fetch('/api/shipments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        })

        if (response.ok) {
          await offlineUtils.enhancedOfflineStorage.removeSyncedData(item.id)
          console.log('Shipment synced successfully:', item.id)
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to sync shipment:', item.id, error)
        await offlineUtils.enhancedOfflineStorage.updateSyncStatus(item.id, "failed", error.message)
      }
    }
  }

  const clearAllData = async () => {
    try {
      await offlineUtils.clearAll()
      toast.success("All offline data cleared")
      await loadSyncData()
    } catch (error) {
      console.error('Failed to clear data:', error)
      toast.error("Failed to clear offline data")
    }
  }

  const retryFailedItems = async () => {
    const failedItems = pendingData.filter(item => 
      item.retryCount < item.maxRetries
    )

    if (failedItems.length === 0) {
      toast.info("No failed items to retry")
      return
    }

    try {
      setIsSyncing(true)
      await startSync()
    } catch (error) {
      console.error('Retry failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "harvest": return <Package className="w-4 h-4" />
      case "order": return <BarChart3 className="w-4 h-4" />
      case "product": return <Package className="w-4 h-4" />
      case "payment": return <CreditCard className="w-4 h-4" />
      case "shipment": return <Truck className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Offline Sync Manager</h2>
          <p className="text-muted-foreground">
            Manage offline data synchronization and background sync operations
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

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Sync Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              onClick={startSync} 
              disabled={isSyncing || !isOnline || pendingData.length === 0}
              className="h-20 flex flex-col items-center justify-center"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-2" />
                  <span>Start Sync</span>
                </>
              )}
            </Button>
            
            <Button 
              onClick={retryFailedItems} 
              disabled={isSyncing || !isOnline}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <RotateCcw className="w-8 h-8 mb-2" />
              <span>Retry Failed</span>
            </Button>
            
            <Button 
              onClick={loadSyncData} 
              disabled={isSyncing}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <RefreshCw className="w-8 h-8 mb-2" />
              <span>Refresh</span>
            </Button>
            
            <Button 
              onClick={clearAllData} 
              disabled={isSyncing || pendingData.length === 0}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <Trash2 className="w-8 h-8 mb-2" />
              <span>Clear All</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{syncStats.total}</div>
              <p className="text-sm text-blue-700">Total</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{syncStats.pending}</div>
              <p className="text-sm text-yellow-700">Pending</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{syncStats.syncing}</div>
              <p className="text-sm text-blue-700">Syncing</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{syncStats.completed}</div>
              <p className="text-sm text-green-700">Completed</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{syncStats.failed}</div>
              <p className="text-sm text-red-700">Failed</p>
            </div>
          </div>

          {/* Progress Bar */}
          {syncStats.total > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Sync Progress</span>
                <span>{Math.round(((syncStats.completed + syncStats.failed) / syncStats.total) * 100)}%</span>
              </div>
              <Progress 
                value={((syncStats.completed + syncStats.failed) / syncStats.total) * 100} 
                className="h-3" 
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed View */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Data</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Data Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Data by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(syncStats.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      <span className="capitalize">{type}s</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
                
                {Object.keys(syncStats.byType).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No data to sync
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingData.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <p className="font-medium capitalize">{item.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Badge variant="outline">
                        Retry {item.retryCount}/{item.maxRetries}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {pendingData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          {/* Pending Data List */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Data ({pendingData.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingData.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <h4 className="font-medium capitalize">{item.type}</h4>
                          <p className="text-sm text-muted-foreground">ID: {item.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">
                          Retry {item.retryCount}/{item.maxRetries}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Created:</span>
                        <span className="ml-2 text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {item.metadata && (
                        <div>
                          <span className="font-medium">Metadata:</span>
                          <span className="ml-2 text-muted-foreground">
                            {Object.keys(item.metadata).length} fields
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {pendingData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4" />
                    <p>No pending data to sync</p>
                    <p className="text-sm">All your data is up to date!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-6">
          {/* Offline Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Offline Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(capabilities).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                    <Badge variant={enabled ? "default" : "secondary"}>
                      {enabled ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Sync</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync data when online
                    </p>
                  </div>
                  <Button
                    variant={autoSync ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoSync(!autoSync)}
                  >
                    {autoSync ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Disabled
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
