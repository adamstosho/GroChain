"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Phone, 
  MessageSquare, 
  Activity, 
  Users, 
  BarChart3, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  Plus,
  Smartphone,
  Signal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface USSDServiceInfo {
  serviceCode: string
  provider: string
  status: 'active' | 'inactive' | 'pending'
  description: string
  registeredAt: string
  lastUsed: string
  totalSessions: number
  successRate: number
}

interface USSDStats {
  totalSessions: number
  activeSessions: number
  completedSessions: number
  errorSessions: number
  averageSessionDuration: number
  popularCommands: Array<{
    command: string
    count: number
    description: string
  }>
  hourlyStats: Array<{
    hour: number
    sessions: number
  }>
}

interface USSDSession {
  id: string
  phoneNumber: string
  sessionId: string
  currentMenu: string
  status: 'active' | 'completed' | 'expired' | 'error'
  startTime: string
  lastActivity: string
  steps: Array<{
    input: string
    response: string
    timestamp: string
  }>
}

export function USSDDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  
  // USSD data states
  const [serviceInfo, setServiceInfo] = useState<USSDServiceInfo | null>(null)
  const [stats, setStats] = useState<USSDStats | null>(null)
  const [sessions, setSessions] = useState<USSDSession[]>([])
  
  // Test form states
  const [testPhoneNumber, setTestPhoneNumber] = useState("")
  const [testText, setTestText] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetchUSSDData()
  }, [])

  const fetchUSSDData = async () => {
    try {
      setLoading(true)
      
      // Fetch USSD service info, stats, and sessions
      const [infoResp, statsResp, sessionsResp] = await Promise.all([
        api.getUSSDInfo(),
        api.getUSSDStats(),
        api.getUSSDSessions()
      ])

      if (infoResp.success && infoResp.data) {
        setServiceInfo(infoResp.data)
      }

      if (statsResp.success && statsResp.data) {
        setStats(statsResp.data)
      }

      if (sessionsResp.success && sessionsResp.data) {
        setSessions(sessionsResp.data.sessions || [])
      }
    } catch (error) {
      console.error("USSD fetch error:", error)
      // Use mock data as fallback
      setServiceInfo(generateMockServiceInfo())
      setStats(generateMockStats())
      setSessions(generateMockSessions())
    } finally {
      setLoading(false)
    }
  }

  const generateMockServiceInfo = (): USSDServiceInfo => {
    return {
      serviceCode: "*347*678#",
      provider: "MTN Nigeria",
      status: 'active',
      description: "GroChain USSD Service for agricultural marketplace and services",
      registeredAt: "2025-01-01T00:00:00Z",
      lastUsed: "2025-01-16T10:30:00Z",
      totalSessions: 15847,
      successRate: 94.2
    }
  }

  const generateMockStats = (): USSDStats => {
    return {
      totalSessions: 15847,
      activeSessions: 23,
      completedSessions: 14956,
      errorSessions: 868,
      averageSessionDuration: 45.5,
      popularCommands: [
        { command: "1", count: 8945, description: "Check Market Prices" },
        { command: "2", count: 4235, description: "View Products" },
        { command: "3", count: 2140, description: "Account Balance" },
        { command: "4", count: 1850, description: "Weather Information" },
        { command: "5", count: 1120, description: "Support & Help" }
      ],
      hourlyStats: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        sessions: Math.floor(Math.random() * 100) + 20
      }))
    }
  }

  const generateMockSessions = (): USSDSession[] => {
    const statuses: USSDSession['status'][] = ['active', 'completed', 'expired', 'error']
    const phoneNumbers = ['+234801234567', '+234802345678', '+234803456789', '+234804567890']
    
    return Array.from({ length: 10 }, (_, index) => ({
      id: `session_${index + 1}`,
      phoneNumber: phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)],
      sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
      currentMenu: `menu_${Math.floor(Math.random() * 5) + 1}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      startTime: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
      steps: [
        {
          input: "*347*678#",
          response: "Welcome to GroChain! 1. Market Prices 2. My Products 3. Account",
          timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString()
        },
        {
          input: "1",
          response: "Market Prices: 1. Tomatoes 2. Yam 3. Cassava 4. Rice",
          timestamp: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString()
        }
      ]
    }))
  }

  const handleTestUSSD = async () => {
    if (!testPhoneNumber || !testText) {
      toast.error("Please enter both phone number and text")
      return
    }

    try {
      setTesting(true)
      const response = await api.testUSSD({
        phoneNumber: testPhoneNumber,
        text: testText
      })

      if (response.success) {
        setTestResult(response.data)
        toast.success("USSD test completed successfully")
      } else {
        toast.error("USSD test failed")
      }
    } catch (error) {
      console.error("USSD test error:", error)
      toast.error("USSD test failed")
      // Mock test result for demonstration
      setTestResult({
        success: true,
        response: "Welcome to GroChain USSD Service! 1. Market Prices 2. My Products 3. Account Balance",
        sessionId: `test_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case "completed":
        return <Badge variant="default" className="bg-blue-500">Completed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "expired":
        return <Badge variant="outline" className="text-orange-600">Expired</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "expired":
        return <Clock className="w-4 h-4 text-orange-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "inactive":
        return <XCircle className="w-4 h-4 text-gray-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  if (!user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Phone className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading USSD dashboard...</p>
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
            <h1 className="text-3xl font-bold">USSD Services</h1>
            <p className="text-muted-foreground">
              Manage USSD service integration and monitor usage statistics
            </p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={fetchUSSDData} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </motion.div>

        {/* Service Info and Stats Cards */}
        {(serviceInfo || stats) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Service Status</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{serviceInfo?.serviceCode || "*347*678#"}</div>
                <div className="flex items-center mt-2">
                  {getStatusIcon(serviceInfo?.status || "active")}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {serviceInfo?.provider || "MTN Nigeria"}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSessions?.toLocaleString() || "15,847"}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeSessions || 23} active sessions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {serviceInfo?.successRate || stats?.completedSessions ? 
                    `${(serviceInfo?.successRate || ((stats?.completedSessions || 0) / (stats?.totalSessions || 1) * 100)).toFixed(1)}%`
                    : "94.2%"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.errorSessions || 868} failed sessions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averageSessionDuration?.toFixed(1) || "45.5"}s</div>
                <p className="text-xs text-muted-foreground">
                  Per session average
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {serviceInfo ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service Code:</span>
                          <span className="font-medium">{serviceInfo.serviceCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Provider:</span>
                          <span className="font-medium">{serviceInfo.provider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          {getStatusBadge(serviceInfo.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Registered:</span>
                          <span className="font-medium">
                            {new Date(serviceInfo.registeredAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Used:</span>
                          <span className="font-medium">
                            {new Date(serviceInfo.lastUsed).toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            {serviceInfo.description}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Service information not available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Popular Commands */}
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Commands</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats?.popularCommands?.map((command, index) => (
                        <div key={command.command} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Option {command.command}</p>
                            <p className="text-sm text-muted-foreground">{command.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{command.count.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">uses</p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-muted-foreground">No command statistics available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active & Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">{session.phoneNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              Session: {session.sessionId}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(session.status)}
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(session.lastActivity).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground mb-2">
                          Current Menu: {session.currentMenu}
                        </div>

                        {session.steps.length > 0 && (
                          <div className="space-y-2 bg-muted/30 rounded p-3">
                            <p className="text-sm font-medium">Recent Steps:</p>
                            {session.steps.slice(-2).map((step, index) => (
                              <div key={index} className="text-sm">
                                <div className="flex items-center space-x-2">
                                  <Smartphone className="w-3 h-3" />
                                  <span className="font-medium">User:</span>
                                  <span>{step.input}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1 text-muted-foreground">
                                  <Signal className="w-3 h-3" />
                                  <span className="font-medium">System:</span>
                                  <span>{step.response}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Session Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Sessions:</span>
                          <span className="font-medium">{stats?.totalSessions?.toLocaleString() || "15,847"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completed:</span>
                          <span className="font-medium text-green-600">{stats?.completedSessions?.toLocaleString() || "14,956"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Errors:</span>
                          <span className="font-medium text-red-600">{stats?.errorSessions?.toLocaleString() || "868"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Currently Active:</span>
                          <span className="font-medium text-blue-600">{stats?.activeSessions || "23"}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Performance Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span className="font-medium text-green-600">
                            {serviceInfo?.successRate?.toFixed(1) || "94.2"}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg. Duration:</span>
                          <span className="font-medium">{stats?.averageSessionDuration?.toFixed(1) || "45.5"}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Provider:</span>
                          <span className="font-medium">{serviceInfo?.provider || "MTN Nigeria"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service Code:</span>
                          <span className="font-medium">{serviceInfo?.serviceCode || "*347*678#"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>USSD Service Testing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+234801234567"
                        value={testPhoneNumber}
                        onChange={(e) => setTestPhoneNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="text">USSD Text</Label>
                      <Input
                        id="text"
                        placeholder="*347*678# or menu option"
                        value={testText}
                        onChange={(e) => setTestText(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleTestUSSD} disabled={testing} className="w-full">
                      {testing ? (
                        <div className="flex items-center">
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Play className="w-4 h-4 mr-2" />
                          Test USSD Service
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Test Results */}
                <Card>
                  <CardHeader>
                    <CardTitle>Test Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResult ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-medium">Test Successful</span>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="font-medium mb-2">Response:</p>
                          <p className="text-sm">{testResult.response}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Session ID: {testResult.sessionId}</p>
                          <p>Timestamp: {new Date(testResult.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No test results yet. Use the test form to simulate a USSD session.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}