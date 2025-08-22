"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { 
  Smartphone, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Settings,
  BarChart3,
  Globe,
  Wifi,
  WifiOff
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface USSDServiceInfo {
  serviceCode: string
  description: string
  features: string[]
  instructions: string
  supportedNetworks: string[]
  languages: string[]
}

interface USSDStats {
  totalSessions: number
  activeUsers: number
  successRate: number
  averageResponseTime: number
  topFeatures: Array<{
    feature: string
    usageCount: number
  }>
}

interface USSDSession {
  sessionId: string
  phoneNumber: string
  status: "active" | "completed" | "failed"
  startTime: string
  lastActivity: string
  currentMenu: string
  network: string
}

export function USSDDashboard() {
  const { user } = useAuth()
  const [serviceInfo, setServiceInfo] = useState<USSDServiceInfo | null>(null)
  const [stats, setStats] = useState<USSDStats | null>(null)
  const [activeSessions, setActiveSessions] = useState<USSDSession[]>([])
  const [loading, setLoading] = useState(true)
  const [testPhoneNumber, setTestPhoneNumber] = useState("")
  const [testScenario, setTestScenario] = useState("menu_navigation")
  const [testInput, setTestInput] = useState("")
  const [testResult, setTestResult] = useState<any>(null)

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    fetchUSSDData()
  }, [])

  const fetchUSSDData = async () => {
    setLoading(true)
    try {
      // Fetch USSD service info
      const infoResp = await api.getUSSDInfo()
      if (infoResp.success && infoResp.data) {
        const payload: any = infoResp.data
        setServiceInfo(payload.data || payload)
      } else {
        setServiceInfo(null)
      }

      // Fetch stats (admin only)
      if (isAdmin) {
        const statsResp = await api.getUSSDStats()
        if (statsResp.success && statsResp.data) {
          const payload: any = statsResp.data
          setStats(payload.data || payload)
        } else {
          setStats(null)
        }
      }

      // Fetch active sessions (admin only)
      if (isAdmin) {
        const sessionsResp = await api.getUSSDSessions()
        if (sessionsResp.success && sessionsResp.data) {
          setActiveSessions(sessionsResp.data)
        } else {
          setActiveSessions([])
        }
      }

    } catch (error) {
      console.error("Error fetching USSD data:", error)
      setServiceInfo(null)
      if (isAdmin) setStats(null)
      setActiveSessions([])
    } finally {
      setLoading(false)
    }
  }

  const handleTestUSSD = async () => {
    if (!testPhoneNumber.trim()) return

    // Map scenario to a representative USSD text flow
    const scenarioTextMap: Record<string, string> = {
      menu_navigation: '1',                   // Go to Harvest menu
      market_prices: '2*1',                   // Marketplace → Browse Products
      weather_info: '4*2',                    // Support & Training → FAQ (placeholder)
      loan_status: '3*1*12345678901',         // Fintech → Check Credit → sample BVN
    }

    const text = (testInput && testInput.trim()) || scenarioTextMap[testScenario] || ''

    try {
      const resp = await api.testUSSD({ phoneNumber: testPhoneNumber, text })
      if (resp.success && resp.data) {
        const payload: any = resp.data
        setTestResult(payload.data || payload)
      } else {
        setTestResult({ success: false, error: resp.error || 'Test failed' })
      }
    } catch (error) {
      console.error("Error testing USSD:", error)
      setTestResult({
        success: false,
        error: "Test failed"
      })
    }
  }

  const registerUSSDService = async (provider: string) => {
    try {
      const response = await api.registerUSSD({
        provider,
        serviceCode: serviceInfo?.serviceCode,
        callbackUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ussd`,
      })

      if (response.success) {
        alert(`USSD service registered successfully with ${provider}`)
      }
    } catch (error) {
      console.error("Error registering USSD service:", error)
    }
  }

  // No mock data - all data comes from real APIs

  if (loading || !user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Smartphone className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading USSD services...</p>
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
              Offline-accessible agricultural services via mobile phones
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Badge className="bg-green-500">
              <Wifi className="h-3 w-3 mr-1" />
              Service Active
            </Badge>
          </div>
        </motion.div>

        {/* Service Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Service Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{serviceInfo?.serviceCode}</p>
                  <p className="text-sm text-muted-foreground">Service Code</p>
                  <p className="text-xs mt-2">{serviceInfo?.instructions}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="font-semibold">Supported Networks</p>
                  <div className="flex flex-wrap gap-1">
                    {serviceInfo?.supportedNetworks.map((network) => (
                      <Badge key={network} variant="outline">{network}</Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="font-semibold">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {serviceInfo?.languages.map((lang) => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="font-semibold">Available Features</p>
                  <ul className="text-sm space-y-1">
                    {serviceInfo?.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        {feature}
                      </li>
                    ))}
                    {serviceInfo && serviceInfo.features.length > 3 && (
                      <li className="text-muted-foreground">+{serviceInfo.features.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue={isAdmin ? "analytics" : "usage"} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="usage">Usage Guide</TabsTrigger>
              <TabsTrigger value="analytics" disabled={!isAdmin}>Analytics</TabsTrigger>
              <TabsTrigger value="testing" disabled={!isAdmin}>Testing</TabsTrigger>
              <TabsTrigger value="management" disabled={!isAdmin}>Management</TabsTrigger>
            </TabsList>

            <TabsContent value="usage" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>How to Use USSD Services</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <p className="font-semibold">Dial the Service Code</p>
                          <p className="text-sm text-muted-foreground">Dial {serviceInfo?.serviceCode} from any mobile phone</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <p className="font-semibold">Select Language</p>
                          <p className="text-sm text-muted-foreground">Choose your preferred language (English, Hausa, Yoruba, Igbo)</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <p className="font-semibold">Navigate Menu</p>
                          <p className="text-sm text-muted-foreground">Use number keys to select options from the menu</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <p className="font-semibold">Access Information</p>
                          <p className="text-sm text-muted-foreground">Get real-time data on prices, weather, loans, and more</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Available Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {serviceInfo?.features.map((feature, index) => (
                        <div key={feature} className="flex items-center space-x-3 p-2 border rounded">
                          <div className="bg-blue-100 text-blue-800 rounded w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{feature}</p>
                            <p className="text-sm text-muted-foreground">
                              {getFeatureDescription(feature)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="analytics" className="space-y-4">
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <Users className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold">{stats.totalSessions.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Total Sessions</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-8 w-8 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Active Users</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold">{stats.successRate}%</p>
                            <p className="text-sm text-muted-foreground">Success Rate</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-8 w-8 text-orange-500" />
                          <div>
                            <p className="text-2xl font-bold">{stats.averageResponseTime}ms</p>
                            <p className="text-sm text-muted-foreground">Avg Response</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Popular Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats?.topFeatures.map((feature, index) => (
                        <div key={feature.feature} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-100 rounded w-8 h-8 flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{feature.feature}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{feature.usageCount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">uses</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="testing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>USSD Service Testing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Phone Number</label>
                          <Input
                            placeholder="+234801234567"
                            value={testPhoneNumber}
                            onChange={(e) => setTestPhoneNumber(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Test Scenario</label>
                          <Select value={testScenario} onValueChange={setTestScenario}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="menu_navigation">Menu Navigation</SelectItem>
                              <SelectItem value="market_prices">Market Prices</SelectItem>
                              <SelectItem value="weather_info">Weather Information</SelectItem>
                              <SelectItem value="loan_status">Loan Status</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Custom Input (Optional)</label>
                          <Input
                            placeholder="1*2*3"
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                          />
                        </div>
                        
                        <Button onClick={handleTestUSSD} className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Run Test
                        </Button>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Test Results</label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg min-h-32">
                          {testResult ? (
                            <pre className="text-sm">{JSON.stringify(testResult, null, 2)}</pre>
                          ) : (
                            <p className="text-muted-foreground text-sm">Run a test to see results...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="management" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Network Provider Registration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {serviceInfo?.supportedNetworks.map((network) => (
                        <Card key={network} className="text-center">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                                <Smartphone className="h-6 w-6" />
                              </div>
                              <p className="font-semibold">{network}</p>
                              <Badge className="bg-green-500">Registered</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => registerUSSDService(network.toLowerCase())}
                                className="w-full"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Service Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Service Code</label>
                        <Input value={serviceInfo?.serviceCode || ""} readOnly />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Callback URL</label>
                        <Input value={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ussd`} readOnly />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Service Description</label>
                      <Textarea value={serviceInfo?.description || ""} readOnly />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    "Market Prices": "Get current commodity prices and market rates",
    "Weather Information": "Access weather forecasts and agricultural alerts",
    "Loan Status": "Check your loan application and repayment status",
    "Account Balance": "View your account balance and transaction history",
    "Crop Advice": "Receive personalized farming recommendations"
  }
  return descriptions[feature] || "Agricultural service information"
}
