"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw,
  MapPin,
  Target,
  Shield,
  Globe
} from "lucide-react"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie } from "recharts"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AdminAnalyticsData {
  totalUsers: number
  activeUsers: number
  newRegistrations: number
  totalHarvests: number
  approvedHarvests: number
  totalListings: number
  totalOrders: number
  totalRevenue: number
  averageCreditScore: number
  approvalRate: number
}

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

export function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Mock data for charts (replace with real API calls)
  const mockPlatformGrowth: ChartData[] = [
    { name: "Jan", users: 1200, harvests: 850, revenue: 2500000, orders: 320 },
    { name: "Feb", users: 1350, harvests: 920, revenue: 2800000, orders: 380 },
    { name: "Mar", users: 1480, harvests: 1050, revenue: 3200000, orders: 420 },
    { name: "Apr", users: 1620, harvests: 1180, revenue: 3800000, orders: 480 },
    { name: "May", users: 1780, harvests: 1320, revenue: 4500000, orders: 550 },
    { name: "Jun", users: 1950, harvests: 1480, revenue: 5200000, orders: 620 }
  ]

  const mockUserDistribution: ChartData[] = [
    { name: "Farmers", value: 45, color: "#22c55e" },
    { name: "Buyers", value: 30, color: "#f59e0b" },
    { name: "Partners", value: 20, color: "#8b5cf6" },
    { name: "Admins", value: 5, color: "#ef4444" }
  ]

  const mockRegionalData: ChartData[] = [
    { region: "Lagos", users: 450, harvests: 320, revenue: 1200000 },
    { region: "Kano", users: 380, harvests: 280, revenue: 980000 },
    { region: "Oyo", users: 320, harvests: 240, revenue: 850000 },
    { region: "Kaduna", users: 280, harvests: 200, revenue: 720000 },
    { region: "Katsina", users: 240, harvests: 180, revenue: 650000 },
    { region: "Others", users: 280, harvests: 260, revenue: 700000 }
  ]

  const mockQualityMetrics = {
    excellent: 40,
    good: 35,
    fair: 20,
    poor: 5
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        // Fetch admin analytics data
        const response = await apiService.getDashboardMetrics()
        setAnalyticsData(response.data)
      } catch (error: any) {
        toast({
          title: "Error loading analytics",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [toast])

  const handleRefresh = () => {
    // Refresh analytics data
    window.location.reload()
  }

  const handleExport = () => {
    // Export analytics data
    toast({
      title: "Export initiated",
      description: "Your analytics report is being prepared for download.",
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Analytics</h2>
          <p className="text-muted-foreground">
            Platform-wide insights, user growth, and system performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalUsers || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              {analyticsData?.activeUsers || 0} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.totalRevenue || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              From {analyticsData?.totalOrders || 0} orders
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Harvests</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalHarvests || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Target className="h-3 w-3 mr-1 text-blue-600" />
              {analyticsData?.approvalRate || 0}% approval rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.averageCreditScore || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Shield className="h-3 w-3 mr-1 text-blue-600" />
              Platform average
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="regional">Regional Data</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Platform Growth Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Platform Growth & Performance
              </CardTitle>
              <CardDescription>
                Monthly user growth, harvest volume, revenue, and order trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockPlatformGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : name === 'harvests' ? 'Harvests' : name === 'orders' ? 'Orders' : 'Users'
                    ]}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    name="Users"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="harvests"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Harvests"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Best Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">June</div>
                <p className="text-xs text-muted-foreground">
                  1,950 users • 1,480 harvests • ₦5.2M revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData?.newRegistrations || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  New registrations this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsData?.approvalRate || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Harvest approval rate
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  User Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of users across different roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={mockUserDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockUserDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Distribution']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  User Growth
                </CardTitle>
                <CardDescription>
                  Monthly user registration trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockPlatformGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip formatter={(value: any) => [formatNumber(value), 'Users']} />
                    <Bar dataKey="users" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          {/* Regional Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Regional Performance Analysis
              </CardTitle>
              <CardDescription>
                User distribution, harvest volume, and revenue by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockRegionalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis yAxisId="left" tickFormatter={(value) => formatNumber(value)} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : name === 'harvests' ? 'Harvests' : 'Users'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="users" fill="#3b82f6" name="Users" />
                  <Bar yAxisId="left" dataKey="harvests" fill="#22c55e" name="Harvests" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#8b5cf6" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Regional Table */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Region</th>
                      <th className="text-left p-2 font-medium">Users</th>
                      <th className="text-left p-2 font-medium">Harvests</th>
                      <th className="text-left p-2 font-medium">Revenue</th>
                      <th className="text-left p-2 font-medium">Avg Revenue/User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRegionalData.map((region) => (
                      <tr key={region.region} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{region.region}</td>
                        <td className="p-2">{formatNumber(region.users)}</td>
                        <td className="p-2">{formatNumber(region.harvests)}</td>
                        <td className="p-2">{formatCurrency(region.revenue)}</td>
                        <td className="p-2">{formatCurrency(region.revenue / region.users)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          {/* Quality Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Quality Distribution
                </CardTitle>
                <CardDescription>
                  Harvest quality breakdown across all products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mockQualityMetrics).map(([quality, percentage]) => (
                    <div key={quality} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{quality}</span>
                        <span className="text-sm text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            quality === "excellent" && "bg-green-500",
                            quality === "good" && "bg-blue-500",
                            quality === "fair" && "bg-yellow-500",
                            quality === "poor" && "bg-red-500"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Platform Metrics
                </CardTitle>
                <CardDescription>
                  Key platform performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Users</span>
                    <span className="text-sm text-muted-foreground">
                      {analyticsData?.activeUsers || 0} / {analyticsData?.totalUsers || 0}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ 
                        width: `${analyticsData?.totalUsers > 0 ? (analyticsData.activeUsers / analyticsData.totalUsers) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Approval Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {analyticsData?.approvalRate || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-500 transition-all duration-300"
                      style={{ width: `${analyticsData?.approvalRate || 0}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Credit Score</span>
                    <span className="text-sm text-muted-foreground">
                      {analyticsData?.averageCreditScore || 0}/100
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${analyticsData?.averageCreditScore || 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

