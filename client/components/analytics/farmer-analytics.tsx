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
  Package, 
  Leaf,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw,
  MapPin,
  QrCode,
  Target
} from "lucide-react"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie } from "recharts"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface FarmerAnalyticsData {
  totalHarvests: number
  approvedHarvests: number
  approvalRate: number
  totalListings: number
  totalOrders: number
  totalRevenue: number
  averageHarvestQuantity: number
  creditScore?: number
}

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

export function FarmerAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<FarmerAnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Mock data for charts (replace with real API calls)
  const mockHarvestTrends: ChartData[] = [
    { name: "Jan", harvests: 12, revenue: 45000, quality: 85 },
    { name: "Feb", harvests: 15, revenue: 52000, quality: 87 },
    { name: "Mar", harvests: 18, revenue: 61000, quality: 89 },
    { name: "Apr", harvests: 22, revenue: 78000, quality: 91 },
    { name: "May", harvests: 25, revenue: 89000, quality: 93 },
    { name: "Jun", harvests: 28, revenue: 102000, quality: 94 }
  ]

  const mockCropDistribution: ChartData[] = [
    { name: "Maize", value: 40, color: "#22c55e" },
    { name: "Cassava", value: 25, color: "#f59e0b" },
    { name: "Vegetables", value: 20, color: "#8b5cf6" },
    { name: "Rice", value: 10, color: "#ef4444" },
    { name: "Others", value: 5, color: "#6b7280" }
  ]

  const mockQualityMetrics = {
    excellent: 45,
    good: 35,
    fair: 15,
    poor: 5
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        // Fetch farmer analytics data
        const response = await apiService.getFarmerAnalytics()
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
          <h2 className="text-3xl font-bold tracking-tight">Farmer Analytics</h2>
          <p className="text-muted-foreground">
            Monitor your harvest performance, earnings, and farm productivity
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
            <CardTitle className="text-sm font-medium">Total Harvests</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalHarvests || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              {analyticsData?.approvalRate || 0}% approval rate
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
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Leaf className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalListings || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Target className="h-3 w-3 mr-1 text-blue-600" />
              Marketplace presence
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.creditScore || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              Financial health
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="harvests">Harvest Analysis</TabsTrigger>
          <TabsTrigger value="crops">Crop Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Harvest Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Harvest & Revenue Trends
              </CardTitle>
              <CardDescription>
                Monthly harvest volume, revenue, and quality trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockHarvestTrends}>
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
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="harvests"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    name="Harvests"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="quality"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Quality Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Best Performing Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">June</div>
                <p className="text-xs text-muted-foreground">
                  28 harvests • ₦102K revenue • 94% quality
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Harvest Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(analyticsData?.averageHarvestQuantity || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.totalHarvests || 0} total harvests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Market Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsData?.totalOrders > 0 ? Math.round((analyticsData.totalOrders / analyticsData.totalListings) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.totalOrders || 0} orders from {analyticsData?.totalListings || 0} listings
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="harvests" className="space-y-6">
          {/* Harvest Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Harvest Volume by Month
                </CardTitle>
                <CardDescription>
                  Monthly harvest volume trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockHarvestTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip formatter={(value: any) => [formatNumber(value), 'Harvests']} />
                    <Bar dataKey="harvests" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  Revenue Growth
                </CardTitle>
                <CardDescription>
                  Monthly revenue progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockHarvestTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: any) => [formatCurrency(value), 'Revenue']} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crops" className="space-y-6">
          {/* Crop Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Crop Distribution
                </CardTitle>
                <CardDescription>
                  Volume distribution across different crop types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={mockCropDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockCropDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Market Share']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Crop Performance
                </CardTitle>
                <CardDescription>
                  Revenue comparison across crop types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockCropDistribution}>
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
                  Quality Trends
                </CardTitle>
                <CardDescription>
                  Quality improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockHarvestTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Quality Score']} />
                    <Line
                      type="monotone"
                      dataKey="quality"
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

