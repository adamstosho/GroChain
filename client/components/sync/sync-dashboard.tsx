"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  WifiOff 
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface SyncStatus {
  lastSync: string
  status: 'success' | 'pending' | 'failed'
  pendingItems: number
  totalItems: number
}

export function SyncDashboard() {
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: new Date().toISOString(),
    status: 'success',
    pendingItems: 0,
    totalItems: 150
  })

  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSyncStatus(prev => ({
      ...prev,
      lastSync: new Date().toISOString(),
      status: 'success',
      pendingItems: 0
    }))
    setIsSyncing(false)
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
    </div>
  )
}
