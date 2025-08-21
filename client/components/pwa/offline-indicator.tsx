"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, Database, RefreshCw, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface OfflineData {
  harvests: number
  orders: number
  listings: number
  total: number
}

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [offlineData, setOfflineData] = useState<OfflineData>({
    harvests: 0,
    orders: 0,
    listings: 0,
    total: 0
  })

  useEffect(() => {
    setIsOnline(navigator.onLine)
    checkOfflineData()

    const handleOnline = () => {
      setIsOnline(true)
      setShowIndicator(true)
      // Hide the indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const checkOfflineData = async () => {
    try {
      // Check IndexedDB or localStorage for offline data
      // This is a simplified version - in real implementation, you'd check actual storage
      const mockData = {
        harvests: Math.floor(Math.random() * 5),
        orders: Math.floor(Math.random() * 3),
        listings: Math.floor(Math.random() * 2)
      }
      
      setOfflineData({
        ...mockData,
        total: mockData.harvests + mockData.orders + mockData.listings
      })
    } catch (error) {
      console.error('Failed to check offline data:', error)
    }
  }

  const handleSyncNow = async () => {
    try {
      // Trigger background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register('background-sync')
        console.log('Background sync initiated')
      }
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  if (!showIndicator && isOnline) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="space-y-2">
        {/* Main Status Badge */}
        <Badge 
          variant={isOnline ? "default" : "destructive"} 
          className="flex items-center gap-2 px-3 py-2 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              Back Online
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              Offline Mode
            </>
          )}
        </Badge>

        {/* Detailed Offline Information */}
        {!isOnline && showDetails && (
          <Card className="w-80 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Offline Data</span>
                  <Badge variant="secondary">{offlineData.total} items</Badge>
                </div>
                
                {offlineData.total > 0 && (
                  <div className="space-y-2 text-sm">
                    {offlineData.harvests > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Database className="h-3 w-3" />
                          Harvests
                        </span>
                        <span>{offlineData.harvests}</span>
                      </div>
                    )}
                    {offlineData.orders > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Database className="h-3 w-3" />
                          Orders
                        </span>
                        <span>{offlineData.orders}</span>
                      </div>
                    )}
                    {offlineData.listings > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Database className="h-3 w-3" />
                          Listings
                        </span>
                        <span>{offlineData.listings}</span>
                      </div>
                    )}
                  </div>
                )}

                {offlineData.total === 0 && (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    No offline data to sync
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={handleSyncNow}
                    disabled={offlineData.total === 0}
                    className="flex-1"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync Now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
