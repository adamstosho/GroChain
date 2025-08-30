"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Users, ShoppingCart, Leaf, DollarSign, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AnalyticsDashboard } from "@/components/agricultural"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { api } from "@/lib/api"

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalSales: number
    totalHarvests: number
    activeUsers: number
    revenueGrowth: number
    salesGrowth: number
    harvestGrowth: number
    userGrowth: number
  }
  salesData: Array<{
    month: string
    sales: number
    revenue: number
  }>
  harvestData: Array<{
    crop: string
    quantity: number
    value: number
  }>
  userActivity: Array<{
    date: string
    farmers: number
    buyers: number
    partners: number
  }>
  marketTrends: Array<{
    product: string
    currentPrice: number
    previousPrice: number
    change: number
  }>
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/analytics/dashboard?range=${timeRange}`)
      setAnalyticsData(response.data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    // Handle export logic
    console.log("Exporting analytics data")
  }

  const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track performance and insights across your agricultural platform</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Use our new AnalyticsDashboard component */}
        <AnalyticsDashboard
          timeRange={timeRange as "7d" | "30d" | "90d" | "1y"}
          onTimeRangeChange={setTimeRange}
          onExport={handleExport}
        />
      </div>
    </div>
  )
}
