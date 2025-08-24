"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Download,
  Upload,
  Activity,
  Globe,
  Shield,
  Zap,
  Clock,
  BarChart3
} from "lucide-react"
import { usePWA } from "@/components/pwa/pwa-provider"
import { ServiceWorkerManager } from "@/components/pwa/service-worker-manager"
import { OfflineSyncManager } from "@/components/pwa/offline-sync-manager"
import { OfflineIndicator } from "@/components/pwa/offline-indicator"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { toast } from "sonner"

export default function PWADashboard() {
  const { 
    isInstalled, 
    isOnline, 
    networkType, 
    serviceWorker, 
    offlineCapabilities, 
    pendingSyncCount,
    showInstallPrompt,
    checkForUpdates,
    syncOfflineData,
    clearOfflineData
  } = usePWA()

  const [activeTab, setActiveTab] = useState("overview")

  const handleInstall = async () => {
    try {
      await showInstallPrompt()
    } catch (error) {
      console.error("Install failed:", error)
    }
  }

  const handleUpdateCheck = async () => {
    try {
      await checkForUpdates()
    } catch (error) {
      console.error("Update check failed:", error)
    }
  }

  const handleSync = async () => {
    try {
      await syncOfflineData()
    } catch (error) {
      console.error("Sync failed:", error)
    }
  }

  const handleClearData = async () => {
    if (confirm("Are you sure you want to clear all offline data? This action cannot be undone.")) {
      try {
        await clearOfflineData()
        toast.success("All offline data cleared")
      } catch (error) {
        console.error("Clear data failed:", error)
        toast.error("Failed to clear offline data")
      }
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">PWA Dashboard</h1>
            <p className="text-muted-foreground">
              Progressive Web App status, offline capabilities, and sync management
            </p>
          </div>
          <div className="flex gap-2">
            {!isInstalled && (
              <Button onClick={handleInstall} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            )}
            <Button onClick={handleUpdateCheck} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Updates
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Installation</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isInstalled ? "Installed" : "Not Installed"}
              </div>
              <Badge variant={isInstalled ? "default" : "secondary"} className="mt-2">
                {isInstalled ? "PWA Active" : "Browser Mode"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connection</CardTitle>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isOnline ? "Online" : "Offline"}
              </div>
              {networkType && (
                <p className="text-xs text-muted-foreground mt-1">
                  {networkType} connection
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Worker</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {serviceWorker ? "Active" : "Inactive"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {serviceWorker ? "Background sync enabled" : "No background sync"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSyncCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                items waiting to sync
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="service-worker">Service Worker</TabsTrigger>
            <TabsTrigger value="offline-sync">Offline Sync</TabsTrigger>
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* PWA Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  PWA Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-700">Active Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Offline-first functionality
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Background sync
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Push notifications
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        App-like experience
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-blue-700">Network Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Connection:</span>
                        <Badge variant={isOnline ? "default" : "destructive"}>
                          {isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                      {networkType && (
                        <div className="flex items-center justify-between">
                          <span>Quality:</span>
                          <Badge variant="outline">{networkType}</Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Service Worker:</span>
                        <Badge variant={serviceWorker ? "default" : "secondary"}>
                          {serviceWorker ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={handleSync} 
                    disabled={!isOnline || pendingSyncCount === 0}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Upload className="w-8 h-8 mb-2" />
                    <span>Sync Data</span>
                  </Button>
                  
                  <Button 
                    onClick={handleUpdateCheck} 
                    disabled={!serviceWorker}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <RefreshCw className="w-8 h-8 mb-2" />
                    <span>Check Updates</span>
                  </Button>
                  
                  <Button 
                    onClick={handleClearData} 
                    disabled={pendingSyncCount === 0}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Database className="w-8 h-8 mb-2" />
                    <span>Clear Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Offline Capabilities Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Offline Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(offlineCapabilities).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                      <Badge variant={enabled ? "default" : "secondary"}>
                        {enabled ? "Available" : "Limited"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="service-worker" className="space-y-6">
            <ServiceWorkerManager />
          </TabsContent>

          <TabsContent value="offline-sync" className="space-y-6">
            <OfflineSyncManager />
          </TabsContent>

          <TabsContent value="capabilities" className="space-y-6">
            {/* Detailed Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Feature Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(offlineCapabilities).map(([feature, enabled]) => (
                    <div key={feature} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium capitalize">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <Badge variant={enabled ? "default" : "secondary"}>
                          {enabled ? "Full Support" : "Limited Support"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {feature === "harvests" && (
                          <>
                            <p>• Log harvests with photos and metadata</p>
                            <p>• Store location, quantity, and quality data</p>
                            <p>• Generate QR codes for traceability</p>
                            <p>• Sync automatically when online</p>
                          </>
                        )}
                        {feature === "orders" && (
                          <>
                            <p>• Create and manage marketplace orders</p>
                            <p>• Process payments offline</p>
                            <p>• Track order status and history</p>
                            <p>• Sync order data when connected</p>
                          </>
                        )}
                        {feature === "marketplace" && (
                          <>
                            <p>• Browse cached product listings</p>
                            <p>• Create new listings offline</p>
                            <p>• Manage inventory and pricing</p>
                            <p>• Sync marketplace data</p>
                          </>
                        )}
                        {feature === "payments" && (
                          <>
                            <p>• Process payment transactions</p>
                            <p>• Store payment methods securely</p>
                            <p>• Handle multiple payment types</p>
                            <p>• Sync payment records</p>
                          </>
                        )}
                        {feature === "analytics" && (
                          <>
                            <p>• View cached analytics data</p>
                            <p>• Limited real-time updates</p>
                            <p>• Historical data available</p>
                            <p>• Full analytics when online</p>
                          </>
                        )}
                        {feature === "sync" && (
                          <>
                            <p>• Background data synchronization</p>
                            <p>• Automatic retry mechanisms</p>
                            <p>• Conflict resolution</p>
                            <p>• Real-time sync status</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Components */}
        <div className="space-y-4">
          <OfflineIndicator />
          <InstallPrompt />
        </div>
      </div>
    </div>
  )
}
