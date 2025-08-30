"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  Star,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award
} from "lucide-react"
import Link from "next/link"

interface AnalyticsData {
  period: string
  revenue: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  orders: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  customers: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  views: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  topProducts: Array<{
    name: string
    revenue: number
    orders: number
    views: number
    rating: number
  }>
  topCategories: Array<{
    name: string
    revenue: number
    percentage: number
  }>
  monthlyData: Array<{
    month: string
    revenue: number
    orders: number
    customers: number
  }>
  customerSegments: Array<{
    segment: string
    count: number
    percentage: number
    revenue: number
  }>
}

const timePeriods = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' }
]

export default function MarketplaceAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Mock data for now - replace with actual API call
      const mockAnalytics: AnalyticsData = {
        period: selectedPeriod,
        revenue: {
          total: 1250000,
          change: 12.5,
          trend: 'up'
        },
        orders: {
          total: 156,
          change: 8.3,
          trend: 'up'
        },
        customers: {
          total: 89,
          change: -2.1,
          trend: 'down'
        },
        views: {
          total: 2340,
          change: 15.7,
          trend: 'up'
        },
        topProducts: [
          {
            name: 'Fresh Maize',
            revenue: 450000,
            orders: 45,
            views: 890,
            rating: 4.8
          },
          {
            name: 'Cassava Tubers',
            revenue: 320000,
            orders: 38,
            views: 650,
            rating: 4.6
          },
          {
            name: 'Tomatoes',
            revenue: 280000,
            orders: 42,
            views: 720,
            rating: 4.9
          },
          {
            name: 'Rice Grains',
            revenue: 200000,
            orders: 31,
            views: 480,
            rating: 4.5
          }
        ],
        topCategories: [
          { name: 'Grains', revenue: 650000, percentage: 52 },
          { name: 'Tubers', revenue: 320000, percentage: 25.6 },
          { name: 'Vegetables', revenue: 280000, percentage: 22.4 }
        ],
        monthlyData: [
          { month: 'Jan', revenue: 180000, orders: 23, customers: 15 },
          { month: 'Feb', revenue: 220000, orders: 28, customers: 19 },
          { month: 'Mar', revenue: 195000, orders: 25, customers: 17 },
          { month: 'Apr', revenue: 240000, orders: 31, customers: 21 },
          { month: 'May', revenue: 210000, orders: 27, customers: 18 },
          { month: 'Jun', revenue: 235000, orders: 30, customers: 20 }
        ],
        customerSegments: [
          { segment: 'New Customers', count: 23, percentage: 25.8, revenue: 280000 },
          { segment: 'Returning Customers', count: 45, percentage: 50.6, revenue: 650000 },
          { segment: 'Loyal Customers', count: 21, percentage: 23.6, revenue: 320000 }
        ]
      }

      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-emerald-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-emerald-600' : 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}K`
    }
    return `₦${amount.toLocaleString()}`
  }

  if (loading) {
    return (
      <DashboardLayout pageTitle="Marketplace Analytics">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse border border-gray-200">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!analytics) {
    return (
      <DashboardLayout pageTitle="Marketplace Analytics">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">
            Analytics data will appear here once you start receiving orders.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Marketplace Analytics">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
                <Link href="/dashboard/marketplace" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Marketplace
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Marketplace Analytics</h1>
            <p className="text-gray-600">
              Track your sales performance, customer insights, and market trends
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timePeriods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.revenue.total)}
              </div>
              <div className={`flex items-center gap-1 text-sm ${getTrendColor(analytics.revenue.trend)}`}>
                {getTrendIcon(analytics.revenue.trend)}
                <span>{analytics.revenue.change}%</span>
                <span>vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-500" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.orders.total}</div>
              <div className={`flex items-center gap-1 text-sm ${getTrendColor(analytics.orders.trend)}`}>
                {getTrendIcon(analytics.orders.trend)}
                <span>{analytics.orders.change}%</span>
                <span>vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                Total Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.customers.total}</div>
              <div className={`flex items-center gap-1 text-sm ${getTrendColor(analytics.customers.trend)}`}>
                {getTrendIcon(analytics.customers.trend)}
                <span>{analytics.customers.change}%</span>
                <span>vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-500" />
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.views.total.toLocaleString()}</div>
              <div className={`flex items-center gap-1 text-sm ${getTrendColor(analytics.views.trend)}`}>
                {getTrendIcon(analytics.views.trend)}
                <span>{analytics.views.change}%</span>
                <span>vs last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Award className="h-4 w-4 text-blue-500" />
                Top Performing Products
              </CardTitle>
              <CardDescription>
                Your best-selling products by revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.orders} orders • ⭐ {product.rating}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(product.revenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.views} views
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Category */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <PieChart className="h-4 w-4 text-green-500" />
                Revenue by Category
              </CardTitle>
              <CardDescription>
                Breakdown of revenue across product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topCategories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(category.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {category.percentage}% of total revenue
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Activity className="h-4 w-4 text-purple-500" />
              Monthly Performance Trends
            </CardTitle>
            <CardDescription>
              Track your performance over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Month</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Orders</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Customers</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.monthlyData.map((month, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{month.month}</td>
                      <td className="py-3 px-4 text-gray-900">{formatCurrency(month.revenue)}</td>
                      <td className="py-3 px-4 text-gray-600">{month.orders}</td>
                      <td className="py-3 px-4 text-gray-600">{month.customers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Customer Insights */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Target className="h-4 w-4 text-indigo-500" />
              Customer Insights
            </CardTitle>
            <CardDescription>
              Understand your customer segments and their value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analytics.customerSegments.map((segment, index) => (
                <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {segment.count}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {segment.segment}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    {segment.percentage}% of total customers
                  </div>
                  <div className="text-lg font-semibold text-emerald-600">
                    {formatCurrency(segment.revenue)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total revenue from this segment
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-medium">Recommended Actions</CardTitle>
            <CardDescription>
              Based on your analytics, here are some suggestions to improve performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <h4 className="font-medium text-gray-900">Increase Product Visibility</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Your top products are performing well. Consider increasing inventory and promoting them more.
                </p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium text-gray-900">Customer Retention</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Focus on retaining existing customers as they generate the most revenue.
                </p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <h4 className="font-medium text-gray-900">Quality Improvement</h4>
                </div>
                <p className="text-sm text-gray-600">
                  High ratings are driving sales. Maintain quality standards to keep customers happy.
                </p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium text-gray-900">Seasonal Planning</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Plan inventory based on seasonal trends to maximize revenue opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
