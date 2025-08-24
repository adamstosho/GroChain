"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Download, 
  Upload,
  Database,
  Cloud,
  Wifi,
  WifiOff,
  Loader2,
  Settings,
  Play,
  Pause
} from "lucide-react"

interface SyncJob {
  id: string
  type: 'harvest' | 'shipment' | 'payment' | 'farmer' | 'market'
  status: 'pending' | 'syncing' | 'completed' | 'failed'
  progress: number
  startTime: string
  endTime?: string
  recordsCount: number
  errorMessage?: string
}

interface SyncStats {
  totalJobs: number
  completedJobs: number
  failedJobs: number
  pendingJobs: number
  lastSyncTime: string
  nextSyncTime: string
  syncInterval: string
}

const SyncDashboard = () => {
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([])
  const [stats, setStats] = useState<SyncStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchSyncData()
  }, [])

  const fetchSyncData = async () => {
    try {
      setLoading(true)
      // Mock data for now
      const mockJobs: SyncJob[] = [
        {
          id: "1",
          type: "harvest",
          status: "completed",
          progress: 100,
          startTime: "2025-01-15T10:00:00Z",
          endTime: "2025-01-15T10:05:00Z",
          recordsCount: 45
        },
        {
          id: "2",
          type: "shipment",
          status: "syncing",
          progress: 67,
          startTime: "2025-01-15T10:10:00Z",
          recordsCount: 23
        },
        {
          id: "3",
          type: "payment",
          status: "failed",
          progress: 0,
          startTime: "2025-01-15T09:30:00Z",
          endTime: "2025-01-15T09:32:00Z",
          recordsCount: 12,
          errorMessage: "Network timeout"
        }
      ]

      const mockStats: SyncStats = {
        totalJobs: mockJobs.length,
        completedJobs: mockJobs.filter(j => j.status === 'completed').length,
        failedJobs: mockJobs.filter(j => j.status === 'failed').length,
        pendingJobs: mockJobs.filter(j => j.status === 'pending').length,
        lastSyncTime: "2025-01-15T10:05:00Z",
        nextSyncTime: "2025-01-15T10:30:00Z",
        syncInterval: "30 minutes"
      }

      setSyncJobs(mockJobs)
      setStats(mockStats)
    } catch (error) {
      console.error("Failed to fetch sync data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'harvest':
        return <Database className="w-5 h-5" />
      case 'shipment':
        return <Cloud className="w-5 h-5" />
      case 'payment':
        return <Upload className="w-5 h-5" />
      case 'farmer':
        return <Download className="w-5 h-5" />
      case 'market':
        return <RefreshCw className="w-5 h-5" />
      default:
        return <RefreshCw className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'syncing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'syncing':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
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
          <h1 className="text-2xl font-heading font-bold text-foreground">Data Sync Dashboard</h1>
          <p className="text-muted-foreground">Monitor data synchronization between offline and online systems</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSyncData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Play className="w-4 h-4 mr-2" />
            Start Sync
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
                  <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalJobs}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{stats.completedJobs}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-foreground">{stats.failedJobs}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sync Interval</p>
                  <p className="text-2xl font-bold text-foreground">{stats.syncInterval}</p>
                  <p className="text-xs text-muted-foreground">Next: {new Date(stats.nextSyncTime).toLocaleTimeString()}</p>
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
          <TabsTrigger value="jobs">Sync Jobs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {syncJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{job.type}</CardTitle>
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusIcon(job.status)}
                      <span className="ml-1">{job.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(job.type)}
                      <span className="text-sm text-muted-foreground">{job.type}</span>
                    </div>
                    
                    {job.status === 'syncing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Records</p>
                        <p className="font-semibold">{job.recordsCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-semibold">
                          {job.endTime ? 
                            `${Math.round((new Date(job.endTime).getTime() - new Date(job.startTime).getTime()) / 1000)}s` : 
                            'Running'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Started: {new Date(job.startTime).toLocaleTimeString()}
                      </div>
                      {job.endTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ended: {new Date(job.endTime).toLocaleTimeString()}
                        </div>
                      )}
                    </div>

                    {job.errorMessage && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-red-600 font-medium">Error:</p>
                        <p className="text-xs text-red-600">{job.errorMessage}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Job Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed job management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configuration settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { SyncDashboard }
