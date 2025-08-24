"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Phone, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Download,
  Upload
} from "lucide-react"

interface USSDSession {
  id: string
  phoneNumber: string
  sessionId: string
  status: 'active' | 'completed' | 'failed' | 'timeout'
  startTime: string
  endTime?: string
  duration: number
  menuPath: string
  lastAction: string
  farmerId?: string
  farmerName?: string
}

interface USSDStats {
  totalSessions: number
  activeSessions: number
  completedSessions: number
  failedSessions: number
  averageDuration: number
  uniqueUsers: number
  todaySessions: number
}

const USSDDashboard = () => {
  const [sessions, setSessions] = useState<USSDSession[]>([])
  const [stats, setStats] = useState<USSDStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchUSSDData()
  }, [])

  const fetchUSSDData = async () => {
    try {
      setLoading(true)
      // Mock data for now
      const mockSessions: USSDSession[] = [
        {
          id: "1",
          phoneNumber: "+2348012345678",
          sessionId: "ussd_001",
          status: "completed",
          startTime: "2025-01-15T10:00:00Z",
          endTime: "2025-01-15T10:03:00Z",
          duration: 180,
          menuPath: "Main Menu > Farmer Registration > Complete",
          lastAction: "Registration completed",
          farmerId: "farmer1",
          farmerName: "Adunni Adebayo"
        },
        {
          id: "2",
          phoneNumber: "+2348098765432",
          sessionId: "ussd_002",
          status: "active",
          startTime: "2025-01-15T10:15:00Z",
          duration: 45,
          menuPath: "Main Menu > Harvest Logging",
          lastAction: "Entering harvest quantity"
        },
        {
          id: "3",
          phoneNumber: "+2348055555555",
          sessionId: "ussd_003",
          status: "failed",
          startTime: "2025-01-15T09:45:00Z",
          endTime: "2025-01-15T09:46:00Z",
          duration: 60,
          menuPath: "Main Menu > Payment",
          lastAction: "Network error"
        }
      ]

      const mockStats: USSDStats = {
        totalSessions: mockSessions.length,
        activeSessions: mockSessions.filter(s => s.status === 'active').length,
        completedSessions: mockSessions.filter(s => s.status === 'completed').length,
        failedSessions: mockSessions.filter(s => s.status === 'failed').length,
        averageDuration: Math.round(mockSessions.reduce((sum, s) => sum + s.duration, 0) / mockSessions.length),
        uniqueUsers: new Set(mockSessions.map(s => s.phoneNumber)).size,
        todaySessions: mockSessions.filter(s => 
          new Date(s.startTime).toDateString() === new Date().toDateString()
        ).length
      }

      setSessions(mockSessions)
      setStats(mockStats)
    } catch (error) {
      console.error("Failed to fetch USSD data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'timeout':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />
      case 'timeout':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">USSD Dashboard</h1>
          <p className="text-muted-foreground">Monitor USSD sessions and user interactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUSSDData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
                </div>
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeSessions}</p>
                </div>
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.uniqueUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold text-foreground">{formatDuration(stats.averageDuration)}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Session {session.sessionId}</CardTitle>
                    <Badge className={getStatusColor(session.status)}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1">{session.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{session.phoneNumber}</span>
                    </div>
                    
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">Menu Path:</p>
                      <p className="font-medium">{session.menuPath}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-semibold">{formatDuration(session.duration)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Action</p>
                        <p className="font-semibold text-xs">{session.lastAction}</p>
                      </div>
                    </div>

                    {session.farmerName && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Farmer:</p>
                        <p className="text-sm font-medium">{session.farmerName}</p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Started: {new Date(session.startTime).toLocaleTimeString()}
                      </div>
                      {session.endTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ended: {new Date(session.endTime).toLocaleTimeString()}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        View Log
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed session management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>USSD Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics and reporting features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { USSDDashboard }
