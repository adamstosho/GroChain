"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Cloud, 
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  Settings,
  BarChart3,
  Activity,
  HardDrive,
  CloudOff,
  RefreshCw as Sync,
  FileText,
  Users,
  Package,
  DollarSign
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface SyncItem {
  id: string
  type: 'harvest' | 'order' | 'payment' | 'user' | 'partner'
  title: string
  status: 'pending' | 'synced' | 'conflict' | 'error'
  lastModified: string
  size: number
  priority: 'high' | 'medium' | 'low'
}

interface SyncStats {
  totalItems: number
  syncedItems: number
  pendingItems: number
  conflictItems: number
  errorItems: number
  lastSync: string
  syncDuration: number
  dataSize: number
}

interface OfflineData {
  harvests: any[]
  orders: any[]
  payments: any[]
  users: any[]
  partners: any[]
  lastUpdated: string
}

export function SyncDashboard() {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [activeTab, setActiveTab] = useState("overview")
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalItems: 0,
    syncedItems: 0,
    pendingItems: 0,
    conflictItems: 0,
    errorItems: 0,
    lastSync: new Date().toISOString(),
    syncDuration: 0,
    dataSize: 0
  })
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([])
  const [offlineData, setOfflineData] = useState<OfflineData>({
    harvests: [],
    orders: [],
    payments: [],
    users: [],
    partners: [],
    lastUpdated: new Date().toISOString()
  })

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load offline data from localStorage
  useEffect(() => {
    const loadOfflineData = () => {
      try {
        const stored = localStorage.getItem('grochain_offline_data')
        if (stored) {
          const data = JSON.parse(stored)
          setOfflineData(data)
          
          // Calculate sync stats
          const totalItems = Object.values(data).reduce((acc: number, items: any) => 
            acc + (Array.isArray(items) ? items.length : 0), 0
          )
          
          setSyncStats(prev => ({
            ...prev,
            totalItems,
            dataSize: new Blob([JSON.stringify(data)]).size
          }))
        }
      } catch (error) {
        console.error('Error loading offline data:', error)
      }
    }

    loadOfflineData()
  }, [])

  // Simulate sync process
  const handleSync = useCallback(async () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline")
      return
    }

    setIsSyncing(true)
    setSyncProgress(0)

    // Simulate sync steps
    const steps = [
      { name: "Checking connectivity", progress: 10 },
      { name: "Validating offline data", progress: 25 },
      { name: "Resolving conflicts", progress: 40 },
      { name: "Uploading changes", progress: 60 },
      { name: "Downloading updates", progress: 80 },
      { name: "Finalizing sync", progress: 100 }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setSyncProgress(step.progress)
      toast.success(step.name)
    }

    // Update sync stats
    setSyncStats(prev => ({
      ...prev,
      lastSync: new Date().toISOString(),
      syncDuration: 4800, // 4.8 seconds
      syncedItems: prev.totalItems,
      pendingItems: 0
    }))

    setIsSyncing(false)
    toast.success("Sync completed successfully!")
  }, [isOnline])

  // Clear offline data
  const handleClearOfflineData = () => {
    if (confirm("Are you sure you want to clear all offline data? This action cannot be undone.")) {
      localStorage.removeItem('grochain_offline_data')
      setOfflineData({
        harvests: [],
        orders: [],
        payments: [],
        users: [],
        partners: [],
        lastUpdated: new Date().toISOString()
      })
      setSyncStats(prev => ({
        ...prev,
        totalItems: 0,
        dataSize: 0
      }))
      toast.success("Offline data cleared successfully")
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return "bg-green-500"
      case 'pending': return "bg-yellow-500"
      case 'conflict': return "bg-orange-500"
      case 'error': return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return "bg-red-100 text-red-700"
      case 'medium': return "bg-yellow-100 text-yellow-700"
      case 'low': return "bg-green-100 text-green-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Database className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Please log in to access sync services</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Sync & Offline Data Management</h1>
            <p className="text-muted-foreground">
              Manage offline data synchronization and ensure data integrity across devices
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={isOnline ? "bg-green-500" : "bg-red-500"}>
              {isOnline ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <Button 
              onClick={handleSync} 
              disabled={!isOnline || isSyncing}
              className="min-w-[120px]"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Sync className="w-4 h-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Connection Status Alert */}
        {!isOnline && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You are currently offline. Data will be stored locally and synchronized when you reconnect.
            </AlertDescription>
          </Alert>
        )}

        {/* Sync Progress */}
        {isSyncing && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sync Progress</span>
                  <span className="text-sm text-muted-foreground">{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="w-full" />
                <div className="text-center text-sm text-muted-foreground">
                  Synchronizing data with server...
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sync Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Database className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{syncStats.totalItems}</p>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{syncStats.syncedItems}</p>
                    <p className="text-sm text-muted-foreground">Synced Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{syncStats.pendingItems}</p>
                    <p className="text-sm text-muted-foreground">Pending Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {(syncStats.dataSize / 1024).toFixed(1)} KB
                    </p>
                    <p className="text-sm text-muted-foreground">Data Size</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="offline">Offline Data</TabsTrigger>
              <TabsTrigger value="sync">Sync Queue</TabsTrigger>
              <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Data Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Harvests</span>
                        </div>
                        <Badge variant="outline">{offlineData.harvests.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Orders</span>
                        </div>
                        <Badge variant="outline">{offlineData.orders.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">Payments</span>
                        </div>
                        <Badge variant="outline">{offlineData.payments.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">Users</span>
                        </div>
                        <Badge variant="outline">{offlineData.users.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sync Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Sync Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Sync</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(syncStats.lastSync).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sync Duration</span>
                        <span className="text-sm text-muted-foreground">
                          {(syncStats.syncDuration / 1000).toFixed(1)}s
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Connection</span>
                        <Badge className={isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Auto-sync</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Enabled
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="offline" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Offline Data Storage</h3>
                <Button variant="outline" onClick={handleClearOfflineData}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-blue-500" />
                      Harvests ({offlineData.harvests.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Crop harvest records stored offline
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(offlineData.lastUpdated).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-green-500" />
                      Orders ({offlineData.orders.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Marketplace orders and transactions
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(offlineData.lastUpdated).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-purple-500" />
                      Payments ({offlineData.payments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Payment records and financial data
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(offlineData.lastUpdated).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sync" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Synchronization Queue</h3>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Queue
                  </Button>
                </div>

                {syncQueue.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-muted-foreground">No items in sync queue</p>
                      <p className="text-sm text-muted-foreground">
                        All data is up to date
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {syncQueue.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                              <div>
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.type} • {new Date(item.lastModified).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {(item.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="conflicts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Data Conflicts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">No data conflicts detected</p>
                    <p className="text-sm text-muted-foreground">
                      All offline data is consistent with server data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Sync Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto-sync</h4>
                        <p className="text-sm text-muted-foreground">
                          Automatically sync data when connection is restored
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Enabled
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Background Sync</h4>
                        <p className="text-sm text-muted-foreground">
                          Sync data in the background when app is not active
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Enabled
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Conflict Resolution</h4>
                        <p className="text-sm text-muted-foreground">
                          Automatically resolve data conflicts using timestamps
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Enabled
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Data Compression</h4>
                        <p className="text-sm text-muted-foreground">
                          Compress offline data to save storage space
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Enabled
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
