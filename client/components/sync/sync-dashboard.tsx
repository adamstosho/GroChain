"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  RefreshCw,
  Download,
  Upload,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  AlertTriangle,
  Database,
  Sync,
  Trash2,
  Activity,
  Users,
  FileText
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface SyncStatus {
  userId: string
  lastSync: string
  status: "synced" | "pending" | "failed" | "in_progress"
  pendingItems: number
  failedItems: number
  totalItems: number
}

interface SyncHistory {
  id: string
  userId: string
  timestamp: string
  status: "success" | "failed" | "partial"
  itemsSynced: number
  itemsFailed: number
  duration: number
  errorMessage?: string
}

interface OfflineData {
  type: "harvest" | "marketplace" | "payment" | "sensor"
  count: number
  lastUpdated: string
  size: string
}

interface SyncStats {
  totalUsers: number
  activeUsers: number
  pendingSync: number
  failedSync: number
  successRate: number
  averageSyncTime: number
  dataVolumeToday: string
}

export function SyncDashboard() {
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([])
  const [offlineData, setOfflineData] = useState<OfflineData[]>([])
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncing, setSyncing] = useState(false)
  const [uploadingData, setUploadingData] = useState(false)

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    fetchSyncData()
    
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const fetchSyncData = async () => {
    setLoading(true)
    try {
      if (user?.id) {
        // Fetch sync status for current user
        const statusResponse = await apiClient.getSyncStatus(user.id)
        if (statusResponse.success) {
          setSyncStatus(statusResponse.data)
        } else {
          setSyncStatus(mockSyncStatus)
        }

        // Fetch sync history for current user
        const historyResponse = await apiClient.getSyncHistory(user.id)
        if (historyResponse.success) {
          setSyncHistory(historyResponse.data?.history || mockSyncHistory)
        } else {
          setSyncHistory(mockSyncHistory)
        }
      }

      // Fetch admin stats if admin
      if (isAdmin) {
        const statsResponse = await apiClient.getSyncStats()
        if (statsResponse.success) {
          setSyncStats(statsResponse.data)
        } else {
          setSyncStats(mockSyncStats)
        }
      }

      // Get offline data from localStorage/IndexedDB
      setOfflineData(getOfflineDataSummary())

    } catch (error) {
      console.error("Error fetching sync data:", error)
      setSyncStatus(mockSyncStatus)
      setSyncHistory(mockSyncHistory)
      if (isAdmin) setSyncStats(mockSyncStats)
    } finally {
      setLoading(false)
    }
  }

  const forceSync = async () => {
    if (!user?.id) return
    
    setSyncing(true)
    try {
      const response = await apiClient.forceSync(user.id)
      if (response.success) {
        fetchSyncData()
      }
    } catch (error) {
      console.error("Error forcing sync:", error)
    } finally {
      setSyncing(false)
    }
  }

  const uploadOfflineData = async () => {
    setUploadingData(true)
    try {
      // Get offline data from IndexedDB/localStorage
      const offlinePayload = await getOfflineDataForUpload()
      
      const response = await apiClient.uploadOfflineData(offlinePayload)
      if (response.success) {
        // Clear offline data after successful upload
        clearOfflineData()
        fetchSyncData()
      }
    } catch (error) {
      console.error("Error uploading offline data:", error)
    } finally {
      setUploadingData(false)
    }
  }

  const clearFailedSync = async () => {
    if (!user?.id) return
    
    try {
      const response = await apiClient.clearFailedSync(user.id)
      if (response.success) {
        fetchSyncData()
      }
    } catch (error) {
      console.error("Error clearing failed sync:", error)
    }
  }

  const getOfflineDataSummary = (): OfflineData[] => {
    // This would read from IndexedDB in a real implementation
    return [
      {
        type: "harvest",
        count: 3,
        lastUpdated: "2025-01-16T14:30:00Z",
        size: "2.3 MB"
      },
      {
        type: "marketplace",
        count: 1,
        lastUpdated: "2025-01-16T12:15:00Z",
        size: "0.8 MB"
      },
      {
        type: "sensor",
        count: 15,
        lastUpdated: "2025-01-16T15:00:00Z",
        size: "0.5 MB"
      }
    ]
  }

  const getOfflineDataForUpload = async () => {
    // This would collect actual offline data from IndexedDB
    return {
      harvests: [],
      marketplace: [],
      sensors: [],
      payments: []
    }
  }

  const clearOfflineData = () => {
    // This would clear IndexedDB/localStorage
    setOfflineData([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "synced": case "success": return "bg-green-500"
      case "pending": case "in_progress": return "bg-blue-500"
      case "failed": return "bg-red-500"
      case "partial": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "synced": case "success": return <CheckCircle className="h-4 w-4" />
      case "pending": case "in_progress": return <Clock className="h-4 w-4" />
      case "failed": return <AlertTriangle className="h-4 w-4" />
      case "partial": return <RefreshCw className="h-4 w-4" />
      default: return <Database className="h-4 w-4" />
    }
  }

  // Mock data
  const mockSyncStatus: SyncStatus = {
    userId: user?.id || "user_123",
    lastSync: "2025-01-16T14:30:00Z",
    status: "synced",
    pendingItems: 0,
    failedItems: 2,
    totalItems: 15
  }

  const mockSyncHistory: SyncHistory[] = [
    {
      id: "sync_001",
      userId: user?.id || "user_123",
      timestamp: "2025-01-16T14:30:00Z",
      status: "success",
      itemsSynced: 15,
      itemsFailed: 0,
      duration: 2300
    },
    {
      id: "sync_002",
      userId: user?.id || "user_123",
      timestamp: "2025-01-16T12:15:00Z",
      status: "partial",
      itemsSynced: 8,
      itemsFailed: 2,
      duration: 1800
    },
    {
      id: "sync_003",
      userId: user?.id || "user_123",
      timestamp: "2025-01-16T10:00:00Z",
      status: "failed",
      itemsSynced: 0,
      itemsFailed: 5,
      duration: 500,
      errorMessage: "Network timeout during sync"
    }
  ]

  const mockSyncStats: SyncStats = {
    totalUsers: 1250,
    activeUsers: 890,
    pendingSync: 45,
    failedSync: 12,
    successRate: 94.2,
    averageSyncTime: 2100,
    dataVolumeToday: "45.8 MB"
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Sync className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading sync data...</p>
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
            <h1 className="text-3xl font-bold">Sync Services</h1>
            <p className="text-muted-foreground">
              Manage offline data synchronization and backup
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={isOnline ? "bg-green-500" : "bg-red-500"}>
              {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <Button onClick={fetchSyncData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Sync Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Current Sync Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {getStatusIcon(syncStatus?.status || "")}
                    <Badge className={getStatusColor(syncStatus?.status || "")}>
                      {syncStatus?.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold">{syncStatus?.totalItems}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{syncStatus?.pendingItems}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{syncStatus?.failedItems}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Sync Progress</span>
                  <span>
                    {syncStatus ? Math.round(((syncStatus.totalItems - syncStatus.pendingItems) / syncStatus.totalItems) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={syncStatus ? ((syncStatus.totalItems - syncStatus.pendingItems) / syncStatus.totalItems) * 100 : 0} 
                />
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Button 
                  onClick={forceSync} 
                  disabled={syncing || !isOnline}
                  className="flex-1"
                >
                  {syncing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sync className="h-4 w-4 mr-2" />
                  )}
                  {syncing ? "Syncing..." : "Force Sync"}
                </Button>
                
                <Button 
                  onClick={uploadOfflineData} 
                  disabled={uploadingData || !isOnline || offlineData.length === 0}
                  variant="outline"
                >
                  {uploadingData ? (
                    <Upload className="h-4 w-4 mr-2 animate-pulse" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Offline Data
                </Button>
                
                {syncStatus?.failedItems && syncStatus.failedItems > 0 && (
                  <Button onClick={clearFailedSync} variant="outline">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Failed
                  </Button>
                )}
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
          <Tabs defaultValue="offline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="offline">Offline Data</TabsTrigger>
              <TabsTrigger value="history">Sync History</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin">Admin Stats</TabsTrigger>}
            </TabsList>

            <TabsContent value="offline" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Offline Data Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {offlineData.length > 0 ? (
                      <div className="space-y-4">
                        {offlineData.map((data) => (
                          <div key={data.type} className="flex items-center justify-between border rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{data.type.charAt(0).toUpperCase() + data.type.slice(1)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {data.count} items • {data.size}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                {new Date(data.lastUpdated).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        <div className="pt-4 border-t">
                          <Button onClick={uploadOfflineData} disabled={!isOnline} className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload All Offline Data
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No offline data to sync</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sync Instructions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <p className="font-semibold">Automatic Sync</p>
                          <p className="text-sm text-muted-foreground">Data syncs automatically when online</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <p className="font-semibold">Offline Storage</p>
                          <p className="text-sm text-muted-foreground">Data is saved locally when offline</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <p className="font-semibold">Manual Upload</p>
                          <p className="text-sm text-muted-foreground">Force upload when connection returns</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <p className="font-semibold">Conflict Resolution</p>
                          <p className="text-sm text-muted-foreground">System handles data conflicts automatically</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sync History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {syncHistory.map((sync) => (
                      <div key={sync.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(sync.status)}
                            <Badge className={getStatusColor(sync.status)}>
                              {sync.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sync.timestamp).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Items Synced</p>
                            <p className="text-green-600">{sync.itemsSynced}</p>
                          </div>
                          <div>
                            <p className="font-medium">Items Failed</p>
                            <p className="text-red-600">{sync.itemsFailed}</p>
                          </div>
                          <div>
                            <p className="font-medium">Duration</p>
                            <p>{(sync.duration / 1000).toFixed(1)}s</p>
                          </div>
                        </div>
                        
                        {sync.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-500">
                            <p className="text-sm text-red-700">{sync.errorMessage}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin" className="space-y-4">
                {syncStats && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <Users className="h-8 w-8 text-blue-500" />
                            <div>
                              <p className="text-2xl font-bold">{syncStats.totalUsers}</p>
                              <p className="text-sm text-muted-foreground">Total Users</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <Activity className="h-8 w-8 text-green-500" />
                            <div>
                              <p className="text-2xl font-bold">{syncStats.activeUsers}</p>
                              <p className="text-sm text-muted-foreground">Active Users</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-8 w-8 text-yellow-500" />
                            <div>
                              <p className="text-2xl font-bold">{syncStats.pendingSync}</p>
                              <p className="text-sm text-muted-foreground">Pending Sync</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                            <div>
                              <p className="text-2xl font-bold">{syncStats.failedSync}</p>
                              <p className="text-sm text-muted-foreground">Failed Sync</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>System Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span>Success Rate</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={syncStats.successRate} className="w-24" />
                              <span className="font-bold">{syncStats.successRate}%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span>Average Sync Time</span>
                            <span className="font-bold">{(syncStats.averageSyncTime / 1000).toFixed(1)}s</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span>Data Volume Today</span>
                            <span className="font-bold">{syncStats.dataVolumeToday}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            Export Sync Logs
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Force Global Sync
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Failed Syncs
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
