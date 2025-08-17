"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { OfflineDataManager } from "@/lib/offline-storage"

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    const updatePendingCount = async () => {
      try {
        const pendingData = await OfflineDataManager.getOfflineData()
        setPendingCount(pendingData.length)
      } catch (error) {
        console.error("Failed to get pending offline data:", error)
      }
    }

    // Initial status
    updateOnlineStatus()
    updatePendingCount()

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    // Update pending count periodically
    const interval = setInterval(updatePendingCount, 30000) // Every 30 seconds

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isOnline ? "Online" : "Offline"}
      </Badge>

      {pendingCount > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {pendingCount} pending
        </Badge>
      )}
    </div>
  )
}
