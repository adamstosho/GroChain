"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  Globe, 
  Clock, 
  MapPin,
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface DeviceSession {
  id: string
  deviceType: "mobile" | "desktop" | "tablet"
  browser: string
  os: string
  location: string
  lastActive: string
  isCurrent: boolean
  ipAddress: string
}

interface SessionManagerProps {
  onSessionExpired?: () => void
}

export function SessionManager({ onSessionExpired }: SessionManagerProps) {
  const [sessions, setSessions] = useState<DeviceSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const { user, logout } = useAuth()

  // Mock data for demonstration - replace with actual API calls
  const mockSessions: DeviceSession[] = [
    {
      id: "1",
      deviceType: "desktop",
      browser: "Chrome 120.0",
      os: "Windows 11",
      location: "Lagos, Nigeria",
      lastActive: new Date().toISOString(),
      isCurrent: true,
      ipAddress: "192.168.1.100"
    },
    {
      id: "2",
      deviceType: "mobile",
      browser: "Safari 17.0",
      os: "iOS 17.0",
      location: "Abuja, Nigeria",
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isCurrent: false,
      ipAddress: "192.168.1.101"
    },
    {
      id: "3",
      deviceType: "tablet",
      browser: "Firefox 119.0",
      os: "Android 13",
      location: "Port Harcourt, Nigeria",
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isCurrent: false,
      ipAddress: "192.168.1.102"
    }
  ]

  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")
      
      // TODO: Replace with actual API call
      // const response = await api.getActiveSessions()
      // if (response.success) {
      //   setSessions(response.data.sessions)
      // } else {
      //   setError(response.error || "Failed to load sessions")
      // }
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSessions(mockSessions)
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Load sessions error:", error)
      setError("Failed to load active sessions")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshToken = useCallback(async () => {
    try {
      setIsRefreshing(true)
      setError("")
      
      const response = await api.refreshToken()
      if (response.success) {
        setLastRefresh(new Date())
        // Token refreshed successfully
      } else {
        setError("Token refresh failed. Please log in again.")
        if (onSessionExpired) {
          onSessionExpired()
        }
      }
    } catch (error) {
      console.error("Token refresh error:", error)
      setError("Failed to refresh token. Please log in again.")
      if (onSessionExpired) {
        onSessionExpired()
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [onSessionExpired])

  const terminateSession = async (sessionId: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.terminateSession(sessionId)
      // if (response.success) {
      //   setSessions(prev => prev.filter(s => s.id !== sessionId))
      // } else {
      //   setError(response.error || "Failed to terminate session")
      // }
      
      // Using mock for now
      await new Promise(resolve => setTimeout(resolve, 500))
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (error) {
      console.error("Terminate session error:", error)
      setError("Failed to terminate session")
    }
  }

  const terminateAllOtherSessions = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.terminateAllOtherSessions()
      // if (response.success) {
      //   setSessions(prev => prev.filter(s => s.isCurrent))
      // } else {
      //   setError(response.error || "Failed to terminate other sessions")
      // }
      
      // Using mock for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSessions(prev => prev.filter(s => s.isCurrent))
    } catch (error) {
      console.error("Terminate all sessions error:", error)
      setError("Failed to terminate other sessions")
    }
  }

  useEffect(() => {
    loadSessions()
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      refreshToken()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [loadSessions, refreshToken])

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />
      case "tablet":
        return <Monitor className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getDeviceBadgeColor = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return "bg-blue-100 text-blue-800"
      case "tablet":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatLastActive = (lastActive: string) => {
    const now = new Date()
    const last = new Date(lastActive)
    const diffMs = now.getTime() - last.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading active sessions...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Session Management</h2>
          <p className="text-muted-foreground">
            Manage your active sessions and security settings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={refreshToken}
            disabled={isRefreshing}
            size="sm"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh Token
          </Button>
          <Button
            variant="outline"
            onClick={terminateAllOtherSessions}
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Terminate Others
          </Button>
        </div>
      </div>

      {/* Status */}
      {lastRefresh && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Last refreshed: {lastRefresh.toLocaleTimeString()}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sessions List */}
      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className={session.isCurrent ? "ring-2 ring-primary" : ""}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(session.deviceType)}
                    <Badge variant="secondary" className={getDeviceBadgeColor(session.deviceType)}>
                      {session.deviceType}
                    </Badge>
                    {session.isCurrent && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Current
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{session.browser}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{session.os}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>{session.ipAddress}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatLastActive(session.lastActive)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!session.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => terminateSession(session.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Terminate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Enable two-factor authentication for extra security</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Regularly review and terminate suspicious sessions</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Use strong, unique passwords for your account</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Log out from shared or public devices</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
