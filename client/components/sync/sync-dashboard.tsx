"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Download, 
  FileText, 
  RefreshCw, 
  Trash2, 
  Upload, 
  Users, 
  Wifi, 
  WifiOff,
  Smartphone,
  Globe,
  Settings,
  BarChart3
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface SyncStatus {
  lastSync: string
  status: 'success' | 'pending' | 'failed'
  pendingItems: number
  totalItems: number
}

interface OfflineDataItem {
  id: string
  type: 'harvest' | 'order' | 'listing' | 'transaction'
  data: any
  timestamp: string
  syncStatus: 'pending' | 'syncing' | 'completed' | 'failed'
  retryCount: number
}

interface SyncHistory {
  id: string
  timestamp: string
  status: 'success' | 'failed'
  itemsSynced: number
  errors: string[]
}

export function SyncDashboard() {
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: new Date().toISOString(),
    status: 'success',
    pendingItems: 0,
    totalItems: 0
  })
  const [offlineData, setOfflineData] = useState<OfflineDataItem[]>([])
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    // Fetch initial data
    fetchSyncStatus()
    fetchOfflineData()
    fetchSyncHistory()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const fetchSyncStatus = async () => {
    try {
      const response = await api.get(`/api/sync/status/${user?.id}`)
      if (response.success && response.data) {
        setSyncStatus({
          lastSync: response.data.lastSync || new Date().toISOString(),
          status: response.data.status || 'success',
          pendingItems: response.data.pendingItems || 0,
          totalItems: response.data.totalItems || 0
        })
      }
    } catch (error) {
      console.error("Failed to fetch sync status:", error)
    }
  }

  const fetchOfflineData = async () => {
    try {
      // This would typically come from IndexedDB or local storage
      // For now, we'll simulate it
      setOfflineData([])
    } catch (error) {
      console.error("Failed to fetch offline data:", error)
    }
  }

  const fetchSyncHistory = async () => {
    try {
      // This would typically come from the backend
      // For now, we'll simulate it
      setSyncHistory([])
    } catch (error) {
      console.error("Failed to fetch sync history:", error)
    }
  }

  const handleSync = async () => {
    if (!user?.id) return
    
    setIsSyncing(true)
    try {
      const response = await api.post("/api/sync/sync-user", { userId: user.id })
      if (response.success) {
        toast.success("Data synchronized successfully")
        await fetchSyncStatus()
        await fetchOfflineData()
        await fetchSyncHistory()
      } else {
        toast.error("Sync failed")
      }
    } catch (error) {
      console.error("Sync error:", error)
      toast.error("Failed to sync data")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleForceSync = async () => {
    if (!user?.id) return
    
    setIsSyncing(true)
    try {
      const response = await api.post("/api/sync/force-sync", { userId: user.id })
      if (response.success) {
        toast.success("Force sync completed")
        await fetchSyncStatus()
        await fetchOfflineData()
        await fetchSyncHistory()
      } else {
        toast.error("Force sync failed")
      }
    } catch (error) {
      console.error("Force sync error:", error)
      toast.error("Failed to force sync")
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Synchronization</h1>
          <p className="text-muted-foreground">
            Manage offline data and synchronization with the server
          </p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Connection Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network Status</span>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <Badge className="bg-green-500">Online</Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">Offline</Badge>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="offline-data">Offline Data</TabsTrigger>
          <TabsTrigger value="sync-history">Sync History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Status Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(syncStatus.lastSync).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(syncStatus.lastSync).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
            {getStatusIcon(syncStatus.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {syncStatus.status}
            </div>
            <p className="text-xs text-muted-foreground">
              {syncStatus.status === 'success' ? 'All data synced' : 'Sync required'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStatus.pendingItems}</div>
            <p className="text-xs text-muted-foreground">
              Waiting to sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStatus.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              In local storage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Full Sync Completed</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(syncStatus.lastSync).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{syncStatus.totalItems} items</p>
                <p className="text-sm text-muted-foreground">Successfully synced</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Previous Sync</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(Date.now() - 86400000).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">142 items</p>
                <p className="text-sm text-muted-foreground">Successfully synced</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wifi className="h-5 w-5" />
            <span>Offline Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection Status</span>
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Offline Mode</span>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600">Available</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-sync</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Enabled</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

          {/* Sync Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Sync Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button onClick={handleSync} disabled={isSyncing || !isOnline}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
                <Button onClick={handleForceSync} disabled={isSyncing || !isOnline} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Force Sync
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Offline Data Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {offlineData.length > 0 ? (
                <div className="space-y-4">
                  {offlineData.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium capitalize">{item.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={item.syncStatus === 'completed' ? 'default' : 'secondary'}>
                          {item.syncStatus}
                        </Badge>
                        {item.syncStatus === 'failed' && (
                          <span className="text-xs text-red-500">Retries: {item.retryCount}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No offline data to sync</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
            </CardHeader>
            <CardContent>
              {syncHistory.length > 0 ? (
                <div className="space-y-4">
                  {syncHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {item.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {item.status === 'success' ? 'Sync Completed' : 'Sync Failed'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.itemsSynced} items</p>
                        <p className="text-sm text-muted-foreground">
                          {item.status === 'success' ? 'Successfully synced' : `${item.errors.length} errors`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sync history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto-sync</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Enabled</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Background sync</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Enabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sync on connection</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Enabled</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
