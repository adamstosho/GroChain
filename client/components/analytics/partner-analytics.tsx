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
  Banknote, 
  Users, 
  Handshake,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw,
  MapPin,
  Target,
  Award,
  Building
} from "lucide-react"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie, Legend } from "recharts"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useExportService } from "@/lib/export-utils"

interface PartnerAnalyticsData {
  totalFarmers: number
  activeFarmers: number
  inactiveFarmers: number
  pendingFarmers: number
  totalCommissions: number
  monthlyCommissions: number
  commissionRate: number
  approvalRate: number
  conversionRate: number
  performanceMetrics: {
    [key: string]: any
  }
  // Optional fields for backward compatibility
  totalHarvests?: number
  approvedHarvests?: number
  totalListings?: number
  averageFarmerHarvests?: number
}

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

export function PartnerAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<PartnerAnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const exportService = useExportService()

  // Mock data for charts (replace with real API calls)
  const mockFarmerGrowth: ChartData[] = [
    { name: "Jan", value: 45, farmers: 45, harvests: 120, revenue: 450000 },
    { name: "Feb", value: 52, farmers: 52, harvests: 145, revenue: 520000 },
    { name: "Mar", value: 58, farmers: 58, harvests: 168, revenue: 610000 },
    { name: "Apr", value: 65, farmers: 65, harvests: 195, revenue: 780000 },
    { name: "May", value: 72, farmers: 72, harvests: 225, revenue: 890000 },
    { name: "Jun", value: 78, farmers: 78, harvests: 248, revenue: 1020000 }
  ]

  const mockRegionalDistribution: ChartData[] = [
    { name: "Lagos", value: 35, color: "#22c55e" },
    { name: "Oyo", value: 25, color: "#f59e0b" },
    { name: "Kano", value: 20, color: "#8b5cf6" },
    { name: "Kaduna", value: 15, color: "#ef4444" },
    { name: "Others", value: 5, color: "#6b7280" }
  ]

  const mockTopFarmers = [
    { name: "John Doe", location: "Lagos", harvests: 25, revenue: 89000, rating: 4.8 },
    { name: "Mary Smith", location: "Oyo", harvests: 22, revenue: 78000, rating: 4.9 },
    { name: "Ahmed Hassan", location: "Kano", harvests: 20, revenue: 72000, rating: 4.7 },
    { name: "Fatima Ali", location: "Kaduna", harvests: 18, revenue: 65000, rating: 4.6 },
    { name: "Emeka Okafor", location: "Lagos", harvests: 16, revenue: 58000, rating: 4.5 }
  ]

  const mockCommissionMetrics = {
    earned: 75,
    pending: 20,
    potential: 5
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        // Fetch partner analytics data using existing method
        const response = await apiService.getPartnerMetrics()
        const data = response.data || response
        setAnalyticsData(data as PartnerAnalyticsData)
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

  const handleExport = async () => {
    await exportService.exportAnalytics('partner', timeRange, 'csv')
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

  // Ensure data is valid before rendering charts
  const isValidData = (data: any[]) => {
    return Array.isArray(data) && data.length > 0 && data.every(item => item !== null && item !== undefined)
  }

  // Safe chart rendering with error boundaries
  const renderChart = (chartType: string, data: any[], fallback: React.ReactNode) => {
    if (!isValidData(data)) {
      return fallback
    }
    
    try {
      switch (chartType) {
        case 'line':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Transactions"
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Volume (₦)"
                />
              </LineChart>
            </ResponsiveContainer>
          )
        case 'area':
          return (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="transactions" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  name="Transactions"
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stackId="2" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="Volume (₦)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        case 'bar':
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Transaction Count" />
                <Bar dataKey="amount" fill="#10b981" name="Total Amount" />
              </BarChart>
            </ResponsiveContainer>
          )
        case 'pie':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Grains', value: 35, color: '#10b981' },
                    { name: 'Vegetables', value: 25, color: '#3b82f6' },
                    { name: 'Tubers', value: 20, color: '#f59e0b' },
                    { name: 'Fruits', value: 20, color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {[
                    { name: 'Grains', value: 35, color: '#10b981' },
                    { name: 'Vegetables', value: 25, color: '#3b82f6' },
                    { name: 'Tubers', value: 20, color: '#f59e0b' },
                    { name: 'Fruits', value: 20, color: '#ef4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )
        default:
          return fallback
      }
    } catch (error) {
      console.error(`Error rendering ${chartType} chart:`, error)
      return fallback
    }
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
          <h2 className="text-3xl font-bold tracking-tight">Partner Analytics</h2>
          <p className="text-muted-foreground">
            Monitor your farmer network performance, commission earnings, and regional impact
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
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalFarmers || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              Active network
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.activeFarmers || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              {analyticsData?.pendingFarmers || 0} pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <Banknote className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.totalCommissions || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Award className="h-3 w-3 mr-1 text-blue-600" />
              {analyticsData?.commissionRate || 0}% rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.approvalRate?.toFixed(1) || 0}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Building className="h-3 w-3 mr-1 text-blue-600" />
              Network efficiency
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="farmers">Farmer Network</TabsTrigger>
          <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Network Growth Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Network Growth & Performance
              </CardTitle>
              <CardDescription>
                Monthly farmer growth, harvest volume, and revenue trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockFarmerGrowth}>
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
                      name === 'revenue' ? 'Revenue' : name === 'harvests' ? 'Harvests' : 'Farmers'
                    ]}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="farmers"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    name="Farmers"
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
                  78 farmers • 248 harvests • ₦1.02M revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData?.approvalRate || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Harvest approval rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Network Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsData?.conversionRate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Conversion rate
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="farmers" className="space-y-6">
          {/* Farmer Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Farmers by Month
                </CardTitle>
                <CardDescription>
                  Monthly farmer growth trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockFarmerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip formatter={(value: any) => [formatNumber(value), 'Farmers']} />
                    <Bar dataKey="farmers" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  Harvest Growth
                </CardTitle>
                <CardDescription>
                  Monthly harvest volume progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockFarmerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip formatter={(value: any) => [formatNumber(value), 'Harvests']} />
                    <Line
                      type="monotone"
                      dataKey="harvests"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Top Performing Farmers
              </CardTitle>
              <CardDescription>
                Best performing farmers in your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Farmer</th>
                      <th className="text-left p-2 font-medium">Location</th>
                      <th className="text-left p-2 font-medium">Harvests</th>
                      <th className="text-left p-2 font-medium">Revenue</th>
                      <th className="text-left p-2 font-medium">Rating</th>
                      <th className="text-left p-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTopFarmers.map((farmer, index) => (
                      <tr key={farmer.name} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{farmer.name}</td>
                        <td className="p-2">{farmer.location}</td>
                        <td className="p-2">{farmer.harvests}</td>
                        <td className="p-2">{formatCurrency(farmer.revenue)}</td>
                        <td className="p-2 flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          {farmer.rating}
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant={index < 2 ? "default" : index < 4 ? "secondary" : "outline"}
                          >
                            {index < 2 ? "Top Performer" : index < 4 ? "High Performer" : "Good"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          {/* Regional Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Regional Distribution
                </CardTitle>
                <CardDescription>
                  Farmer distribution across regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={mockRegionalDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockRegionalDistribution.map((entry, index) => (
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
                  Regional Performance
                </CardTitle>
                <CardDescription>
                  Performance comparison across regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockRegionalDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Market Share']} />
                    <Bar dataKey="value" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Commission Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-primary" />
                  Commission Breakdown
                </CardTitle>
                <CardDescription>
                  Commission earnings distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mockCommissionMetrics).map(([status, percentage]) => (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {status === 'earned' ? 'Earned' : status === 'pending' ? 'Pending' : 'Potential'}
                        </span>
                        <span className="text-sm text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            status === "earned" && "bg-green-500",
                            status === "pending" && "bg-yellow-500",
                            status === "potential" && "bg-blue-500"
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
                  Network Growth
                </CardTitle>
                <CardDescription>
                  Farmer network expansion over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockFarmerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip formatter={(value: any) => [formatNumber(value), 'Farmers']} />
                    <Line
                      type="monotone"
                      dataKey="farmers"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

