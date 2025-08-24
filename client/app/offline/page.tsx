"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Database, 
  Package, 
  CreditCard, 
  BarChart3, 
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Download,
  Upload,
  Smartphone,
  Globe
} from "lucide-react"
import { useOfflineFirst } from "@/components/pwa/pwa-provider"
import { offlineUtils } from "@/lib/offline-storage"
import { toast } from "sonner"
import Link from "next/link"

interface OfflineData {
  id: string
  type: string
  data: any
  timestamp: number
  priority: string
  retryCount: number
  maxRetries: number
}

export default function OfflinePage() {
  const { isOnline, offlineCapabilities, storeOffline } = useOfflineFirst()
  const [pendingData, setPendingData] = useState<OfflineData[]>([])
  const [syncStats, setSyncStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0
  })
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    if (isOnline) {
      // Redirect to dashboard when online
      window.location.href = '/dashboard'
      return
    }

    loadOfflineData()
    const interval = setInterval(loadOfflineData, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [isOnline])

  const loadOfflineData = async () => {
    try {
      const [data, stats] = await Promise.all([
        offlineUtils.getPendingData(),
        offlineUtils.getSyncStats()
      ])
      
      setPendingData(data)
      setSyncStats(stats)
    } catch (error) {
      console.error('Failed to load offline data:', error)
    }
  }

  const startSync = async () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline")
      return
    }

    try {
      setIsSyncing(true)
      // This will trigger the sync in the PWA provider
      window.location.reload()
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error("Sync failed")
    } finally {
      setIsSyncing(false)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1) + 's'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <WifiOff className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">You're Offline</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't worry! GroChain works offline too. You can continue logging harvests, 
            creating orders, and managing your farm data. Everything will sync automatically 
            when you're back online.
          </p>
        </div>

        {/* Connection Status */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <WifiOff className="w-5 h-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-800 font-medium">No Internet Connection</span>
              </div>
              <Button 
                onClick={startSync} 
                disabled={!isOnline || isSyncing}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 mr-2" />
                    Check Connection
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Offline Capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Available Offline Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(offlineCapabilities).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <Badge variant={enabled ? "default" : "secondary"} className="ml-auto">
                    {enabled ? "Available" : "Limited"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sync Status */}
        {pendingData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Pending Sync ({pendingData.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Sync Progress</span>
                    <span>{Math.round(((syncStats.completed + syncStats.failed) / syncStats.total) * 100)}%</span>
                  </div>
                  <Progress 
                    value={((syncStats.completed + syncStats.failed) / syncStats.total) * 100} 
                    className="h-3" 
                  />
                </div>

                {/* Data Type Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{syncStats.total}</div>
                    <p className="text-sm text-blue-700">Total</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">{syncStats.pending}</div>
                    <p className="text-sm text-yellow-700">Pending</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{syncStats.completed}</div>
                    <p className="text-sm text-green-700">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-600">{syncStats.failed}</div>
                    <p className="text-sm text-red-700">Failed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Data List */}
        {pendingData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Pending Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingData.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <p className="font-medium capitalize">{getTypeLabel(item.type)}</p>
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
                
                {pendingData.length > 5 && (
                  <div className="text-center py-3 text-muted-foreground">
                    +{pendingData.length - 5} more items pending sync
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offline Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              What You Can Do Offline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-700">Available Actions</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Log new harvests with photos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Create marketplace listings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Process orders and payments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Update farm information
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-yellow-700">Limited Actions</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    View real-time analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Send notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Sync with other devices
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Access cloud data
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/harvests/new">
            <Button className="w-full h-20 flex flex-col items-center justify-center" variant="outline">
              <Package className="w-8 h-8 mb-2" />
              <span>Log Harvest</span>
            </Button>
          </Link>
          
          <Link href="/marketplace/create">
            <Button className="w-full h-20 flex flex-col items-center justify-center" variant="outline">
              <BarChart3 className="w-8 h-8 mb-2" />
              <span>Create Listing</span>
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button className="w-full h-20 flex flex-col items-center justify-center" variant="outline">
              <Globe className="w-8 h-8 mb-2" />
              <span>Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-8">
          <p>GroChain will automatically sync your data when you're back online</p>
          <p className="mt-2">
            <Button 
              onClick={startSync} 
              disabled={!isOnline || isSyncing}
              variant="link" 
              className="p-0 h-auto text-primary"
            >
              Check connection status
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
