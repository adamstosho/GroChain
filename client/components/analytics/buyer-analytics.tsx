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
  ShoppingCart, 
  Heart,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw,
  MapPin,
  Package,
  Target,
  Star,
  Truck
} from "lucide-react"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie } from "recharts"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface BuyerAnalyticsData {
  totalOrders: number
  completedOrders: number
  totalSpent: number
  averageOrderValue: number
  completionRate: number
  favoriteProducts?: number
  pendingDeliveries?: number
}

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

export function BuyerAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<BuyerAnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Mock data for charts (replace with real API calls)
  const mockPurchaseTrends: ChartData[] = [
    { name: "Jan", orders: 8, spending: 45000, avgOrder: 5625 },
    { name: "Feb", orders: 12, spending: 68000, avgOrder: 5667 },
    { name: "Mar", orders: 15, spending: 89000, avgOrder: 5933 },
    { name: "Apr", orders: 18, spending: 112000, avgOrder: 6222 },
    { name: "May", orders: 22, spending: 145000, avgOrder: 6591 },
    { name: "Jun", orders: 25, spending: 178000, avgOrder: 7120 }
  ]

  const mockCategorySpending: ChartData[] = [
    { name: "Grains", value: 45, color: "#22c55e" },
    { name: "Vegetables", value: 25, color: "#f59e0b" },
    { name: "Tubers", value: 20, color: "#8b5cf6" },
    { name: "Fruits", value: 8, color: "#ef4444" },
    { name: "Others", value: 2, color: "#6b7280" }
  ]

  const mockSupplierPerformance = [
    { supplier: "Farm Fresh Co.", orders: 15, total: 89000, rating: 4.8, delivery: 95 },
    { supplier: "Green Valley", orders: 12, total: 67000, rating: 4.6, delivery: 92 },
    { supplier: "Organic Plus", orders: 8, total: 45000, rating: 4.9, delivery: 98 },
    { supplier: "Local Harvest", orders: 10, total: 52000, rating: 4.4, delivery: 88 },
    { supplier: "Premium Farms", orders: 6, total: 38000, rating: 4.7, delivery: 94 }
  ]

  const mockDeliveryMetrics = {
    onTime: 85,
    delayed: 12,
    early: 3
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        // Fetch buyer analytics data
        const response = await apiService.getBuyerAnalytics()
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
          <h2 className="text-3xl font-bold tracking-tight">Buyer Analytics</h2>
          <p className="text-muted-foreground">
            Track your purchasing patterns, spending analysis, and supplier performance
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
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalOrders || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              {analyticsData?.completionRate || 0}% completion rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.totalSpent || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              Avg: {formatCurrency(analyticsData?.averageOrderValue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Products</CardTitle>
            <Heart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.favoriteProducts || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Target className="h-3 w-3 mr-1 text-blue-600" />
              Saved items
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.pendingDeliveries || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Package className="h-3 w-3 mr-1 text-blue-600" />
              In transit
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="purchases">Purchase Analysis</TabsTrigger>
          <TabsTrigger value="categories">Category Spending</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Purchase Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Purchase & Spending Trends
              </CardTitle>
              <CardDescription>
                Monthly order volume, total spending, and average order value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockPurchaseTrends}>
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
                      name === 'spending' || name === 'avgOrder' ? formatCurrency(value) : value,
                      name === 'spending' ? 'Total Spending' : name === 'avgOrder' ? 'Avg Order' : 'Orders'
                    ]}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    name="Orders"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="spending"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Total Spending"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgOrder"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Average Order"
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
                  25 orders • ₦178K spent • ₦7.1K avg
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData?.completionRate || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.completedOrders || 0} of {analyticsData?.totalOrders || 0} orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(analyticsData?.averageOrderValue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total: {formatCurrency(analyticsData?.totalSpent || 0)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          {/* Purchase Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Orders by Month
                </CardTitle>
                <CardDescription>
                  Monthly order volume trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockPurchaseTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip formatter={(value: any) => [formatNumber(value), 'Orders']} />
                    <Bar dataKey="orders" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  Spending Growth
                </CardTitle>
                <CardDescription>
                  Monthly spending progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockPurchaseTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: any) => [formatCurrency(value), 'Spending']} />
                    <Line
                      type="monotone"
                      dataKey="spending"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Category Spending */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Spending by Category
                </CardTitle>
                <CardDescription>
                  Distribution of spending across product categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={mockCategorySpending}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockCategorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Spending']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Category Performance
                </CardTitle>
                <CardDescription>
                  Spending comparison across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockCategorySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Spending Share']} />
                    <Bar dataKey="value" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          {/* Supplier Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Supplier Performance Analysis
              </CardTitle>
              <CardDescription>
                Order volume, spending, ratings, and delivery performance by supplier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Supplier</th>
                      <th className="text-left p-2 font-medium">Orders</th>
                      <th className="text-left p-2 font-medium">Total Spent</th>
                      <th className="text-left p-2 font-medium">Rating</th>
                      <th className="text-left p-2 font-medium">Delivery %</th>
                      <th className="text-left p-2 font-medium">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSupplierPerformance.map((supplier) => (
                      <tr key={supplier.supplier} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{supplier.supplier}</td>
                        <td className="p-2">{supplier.orders}</td>
                        <td className="p-2">{formatCurrency(supplier.total)}</td>
                        <td className="p-2 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {supplier.rating}
                        </td>
                        <td className="p-2">{supplier.delivery}%</td>
                        <td className="p-2">
                          <Badge 
                            variant={supplier.delivery >= 95 ? "default" : supplier.delivery >= 90 ? "secondary" : "destructive"}
                          >
                            {supplier.delivery >= 95 ? "Excellent" : supplier.delivery >= 90 ? "Good" : "Needs Improvement"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Delivery Performance
                </CardTitle>
                <CardDescription>
                  Delivery timing breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mockDeliveryMetrics).map(([timing, percentage]) => (
                    <div key={timing} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {timing === 'onTime' ? 'On Time' : timing === 'delayed' ? 'Delayed' : 'Early'}
                        </span>
                        <span className="text-sm text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            timing === "onTime" && "bg-green-500",
                            timing === "delayed" && "bg-yellow-500",
                            timing === "early" && "bg-blue-500"
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
                  Supplier Ratings
                </CardTitle>
                <CardDescription>
                  Average ratings by supplier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockSupplierPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="supplier" />
                    <YAxis domain={[0, 5]} tickFormatter={(value) => value.toFixed(1)} />
                    <Tooltip formatter={(value: any) => [value.toFixed(1), 'Rating']} />
                    <Bar dataKey="rating" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

