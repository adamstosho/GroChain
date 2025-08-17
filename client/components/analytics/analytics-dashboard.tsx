"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Leaf, 
  Shield, 
  Globe,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingDown
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AnalyticsCharts } from "./analytics-charts"
import { AnalyticsMetrics } from "./analytics-metrics"
import { AnalyticsTables } from "./analytics-tables"

interface AnalyticsData {
  overview: {
    totalFarmers: number
    totalTransactions: number
    totalRevenue: number
    activePartners: number
    growthRate: number
  }
  farmers: {
    total: number
    active: number
    new: number
    verified: number
    byGender: Record<string, number>
    byAgeGroup: Record<string, number>
    byEducation: Record<string, number>
    byRegion: Record<string, number>
  }
  transactions: {
    total: number
    volume: number
    averageValue: number
    byStatus: Record<string, number>
    byPaymentMethod: Record<string, number>
    trend: Array<{ date: string; value: number }>
  }
  harvests: {
    total: number
    totalVolume: number
    averageYield: number
    byCrop: Record<string, number>
    byQuality: Record<string, number>
    postHarvestLoss: number
    trend: Array<{ date: string; volume: number }>
  }
  marketplace: {
    listings: number
    orders: number
    revenue: number
    commission: number
    activeProducts: number
    topProducts: Array<{
      productId: string
      name: string
      sales: number
      revenue: number
    }>
  }
  fintech: {
    creditScores: {
      total: number
      average: number
      distribution: Record<string, number>
    }
    loans: {
      total: number
      amount: number
      averageAmount: number
      repaymentRate: number
      defaultRate: number
    }
  }
  impact: {
    incomeIncrease: number
    productivityImprovement: number
    foodSecurity: number
    employmentCreated: number
    carbonFootprintReduction: number
    waterConservation: number
  }
  partners: {
    total: number
    active: number
    farmerReferrals: number
    revenueGenerated: number
    performanceScore: number
    topPerformers: Array<{
      partnerId: string
      name: string
      referrals: number
      revenue: number
      score: number
    }>
  }
  weather: {
    averageTemperature: number
    averageHumidity: number
    favorableDays: number
    unfavorable: number
  }
}

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    period: "monthly",
    region: "",
    startDate: "",
    endDate: ""
  })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [filters])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch comprehensive dashboard metrics
      const response = await api.getDashboardAnalytics()
      
      if (response.success) {
        setAnalyticsData(response.data)
        setLastUpdated(new Date())
      } else {
        throw new Error(response.error || "Failed to fetch analytics data")
      }
    } catch (error) {
      console.error("Analytics fetch error:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch analytics data")
      
      // Set mock data for development/demo purposes
      setAnalyticsData(getMockAnalyticsData())
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  const getMockAnalyticsData = (): AnalyticsData => {
    return {
      overview: {
        totalFarmers: 1247,
        totalTransactions: 3456,
        totalRevenue: 12500000,
        activePartners: 89,
        growthRate: 23.5
      },
      farmers: {
        total: 1247,
        active: 892,
        new: 156,
        verified: 789,
        byGender: { male: 678, female: 569 },
        byAgeGroup: { "18-25": 234, "26-35": 456, "36-45": 345, "46-55": 156, "55+": 56 },
        byEducation: { none: 123, primary: 234, secondary: 456, tertiary: 434 },
        byRegion: { "Lagos": 234, "Kano": 189, "Kaduna": 167, "Ogun": 145, "Others": 512 }
      },
      transactions: {
        total: 3456,
        volume: 89000000,
        averageValue: 25750,
        byStatus: { pending: 234, completed: 2987, failed: 156, cancelled: 79 },
        byPaymentMethod: { mobileMoney: 1234, bankTransfer: 890, cash: 678, card: 654 },
        trend: [
          { date: "2025-01-01", value: 2340000 },
          { date: "2025-01-08", value: 2560000 },
          { date: "2025-01-15", value: 2890000 },
          { date: "2025-01-22", value: 3120000 }
        ]
      },
      harvests: {
        total: 2345,
        totalVolume: 5678000,
        averageYield: 2420,
        byCrop: { "Tomatoes": 456000, "Yam": 789000, "Cassava": 567000, "Rice": 456000, "Others": 2300000 },
        byQuality: { premium: 1234000, standard: 2345000, basic: 2099000 },
        postHarvestLoss: 12.5,
        trend: [
          { date: "2025-01-01", volume: 1234000 },
          { date: "2025-01-08", volume: 1345000 },
          { date: "2025-01-15", volume: 1456000 },
          { date: "2025-01-22", volume: 1567000 }
        ]
      },
      marketplace: {
        listings: 1890,
        orders: 3456,
        revenue: 12500000,
        commission: 1250000,
        activeProducts: 1456,
        topProducts: [
          { productId: "1", name: "Fresh Tomatoes", sales: 234, revenue: 2340000 },
          { productId: "2", name: "Organic Yam", sales: 189, revenue: 1890000 },
          { productId: "3", name: "Premium Cassava", sales: 167, revenue: 1670000 }
        ]
      },
      fintech: {
        creditScores: {
          total: 892,
          average: 685,
          distribution: { "300-500": 123, "501-700": 456, "701-850": 234, "851-900": 79 }
        },
        loans: {
          total: 234,
          amount: 45000000,
          averageAmount: 192307,
          repaymentRate: 87.5,
          defaultRate: 12.5
        }
      },
      impact: {
        incomeIncrease: 45.6,
        productivityImprovement: 38.9,
        foodSecurity: 67.8,
        employmentCreated: 234,
        carbonFootprintReduction: 23.4,
        waterConservation: 34.5
      },
      partners: {
        total: 89,
        active: 67,
        farmerReferrals: 456,
        revenueGenerated: 8900000,
        performanceScore: 78.9,
        topPerformers: [
          { partnerId: "1", name: "AgroPartners NG", referrals: 67, revenue: 890000, score: 92.3 },
          { partnerId: "2", name: "FarmConnect", referrals: 56, revenue: 756000, score: 88.7 },
          { partnerId: "3", name: "RuralLink", referrals: 45, revenue: 634000, score: 85.2 }
        ]
      },
      weather: {
        averageTemperature: 28.5,
        averageHumidity: 65.4,
        favorableDays: 78,
        unfavorable: 22
      }
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.exportAnalytics()
      if (response.success) {
        // Create download link
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `grochain-analytics-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Export error:", error)
    }
  }

  const handleRefresh = () => {
    fetchAnalyticsData()
  }

  if (loading && !analyticsData) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error && !analyticsData) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load analytics</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAnalyticsData}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!analyticsData) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your agricultural operations
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="period">Time Period</Label>
                <Select value={filters.period} onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="region">Region</Label>
                <Select value={filters.region} onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Regions</SelectItem>
                    <SelectItem value="Lagos">Lagos</SelectItem>
                    <SelectItem value="Kano">Kano</SelectItem>
                    <SelectItem value="Kaduna">Kaduna</SelectItem>
                    <SelectItem value="Ogun">Ogun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="farmers">Farmers</TabsTrigger>
            <TabsTrigger value="harvests">Harvests</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <AnalyticsMetrics data={analyticsData} />
            <AnalyticsCharts data={analyticsData} />
          </TabsContent>

          {/* Farmers Tab */}
          <TabsContent value="farmers" className="space-y-6">
            <AnalyticsTables data={analyticsData} type="farmers" />
          </TabsContent>

          {/* Harvests Tab */}
          <TabsContent value="harvests" className="space-y-6">
            <AnalyticsTables data={analyticsData} type="harvests" />
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <AnalyticsTables data={analyticsData} type="marketplace" />
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact" className="space-y-6">
            <AnalyticsTables data={analyticsData} type="impact" />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
