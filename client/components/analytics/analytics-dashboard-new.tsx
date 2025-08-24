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
  TrendingDown,
  Brain,
  Target,
  FileText,
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

export function AnalyticsDashboardNew() {
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
  const [predictiveData, setPredictiveData] = useState<any | null>(null)
  const [predictiveLoading, setPredictiveLoading] = useState(false)
  const [regionalData, setRegionalData] = useState<any | null>(null)
  const [regionalLoading, setRegionalLoading] = useState(false)
  const [compareData, setCompareData] = useState<any | null>(null)
  const [compareLoading, setCompareLoading] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json'|'csv'|'excel'>('json')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
    }
  }, [user, filters])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch comprehensive analytics data from backend APIs
      const [dashboardRes, farmersRes, transactionsRes, harvestsRes, marketplaceRes, fintechRes, impactRes, partnersRes, weatherRes] = await Promise.all([
        api.get("/api/analytics/dashboard", { params: filters }),
        api.get("/api/analytics/farmers", { params: filters }),
        api.get("/api/analytics/transactions", { params: filters }),
        api.get("/api/analytics/harvests", { params: filters }),
        api.get("/api/analytics/marketplace", { params: filters }),
        api.get("/api/analytics/fintech", { params: filters }),
        api.get("/api/analytics/impact", { params: filters }),
        api.get("/api/analytics/partners", { params: filters }),
        api.get("/api/analytics/weather", { params: filters })
      ])

      // Combine all analytics data
      const combinedData: AnalyticsData = {
        overview: dashboardRes.success ? dashboardRes.data?.overview || {} : {},
        farmers: farmersRes.success ? farmersRes.data?.overview || {} : {},
        transactions: transactionsRes.success ? transactionsRes.data || {} : {},
        harvests: harvestsRes.success ? harvestsRes.data || {} : {},
        marketplace: marketplaceRes.success ? marketplaceRes.data || {} : {},
        fintech: fintechRes.success ? fintechRes.data || {} : {},
        impact: impactRes.success ? impactRes.data || {} : {},
        partners: partnersRes.success ? partnersRes.data || {} : {},
        weather: weatherRes.success ? weatherRes.data || {} : {}
      }

      setAnalyticsData(combinedData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Analytics fetch error:", error)
      setError("Failed to fetch analytics data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchPredictiveAnalytics = async () => {
    try {
      setPredictiveLoading(true)
      const response = await api.get("/api/analytics/predictive", { params: filters })
      if (response.success) {
        setPredictiveData(response.data)
        toast.success("Predictive analytics loaded!")
      } else {
        throw new Error(response.error || "Failed to fetch predictive analytics")
      }
    } catch (error) {
      console.error("Predictive analytics error:", error)
      toast.error("Failed to fetch predictive analytics")
    } finally {
      setPredictiveLoading(false)
    }
  }

  const fetchRegionalAnalytics = async () => {
    try {
      setRegionalLoading(true)
      const response = await api.post("/api/analytics/regional", {
        filters,
        regions: filters.region ? [filters.region] : []
      })
      
      if (response.success) {
        setRegionalData(response.data)
        toast.success("Regional analytics loaded!")
      } else {
        throw new Error(response.error || "Failed to fetch regional analytics")
      }
    } catch (error) {
      console.error("Regional analytics error:", error)
      toast.error("Failed to fetch regional analytics")
    } finally {
      setRegionalLoading(false)
    }
  }

  const fetchCompareAnalytics = async () => {
    try {
      setCompareLoading(true)
      const response = await api.post("/api/analytics/compare", {
        filters,
        comparisonType: "period"
      })
      
      if (response.success) {
        setCompareData(response.data)
        toast.success("Comparison analysis completed!")
      } else {
        throw new Error(response.error || "Failed to compare analytics")
      }
    } catch (error) {
      console.error("Comparison error:", error)
      toast.error("Failed to compare analytics")
    } finally {
      setCompareLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const response = await api.get("/api/analytics/export", { 
        params: { ...filters, format: exportFormat }
      })
      
      if (response.success) {
        // Handle file download
        const blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `grochain-analytics-${new Date().toISOString().split('T')[0]}.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Data exported successfully!")
      } else {
        throw new Error(response.error || "Failed to export data")
      }
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export data")
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
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

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              AI-powered insights and comprehensive platform performance analysis
            </p>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchAnalyticsData} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Analytics Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period">Time Period</Label>
                <Select value={filters.period} onValueChange={(value) => handleFilterChange("period", value)}>
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

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  placeholder="All regions"
                  value={filters.region}
                  onChange={(e) => handleFilterChange("region", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={fetchPredictiveAnalytics} disabled={predictiveLoading}>
            {predictiveLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            AI Predictive Analytics
          </Button>
          
          <Button variant="outline" onClick={fetchRegionalAnalytics} disabled={regionalLoading}>
            {regionalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            Regional Analysis
          </Button>
          
          <Button variant="outline" onClick={fetchCompareAnalytics} disabled={compareLoading}>
            {compareLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <BarChart className="w-4 h-4 mr-2" />
            )}
            Compare Periods
          </Button>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Export Format Selection */}
        <div className="flex items-center gap-3">
          <Label htmlFor="exportFormat">Export Format:</Label>
          <Select value={exportFormat} onValueChange={(value: 'json'|'csv'|'excel') => setExportFormat(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="farmers" className="text-xs sm:text-sm">Farmers</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transactions</TabsTrigger>
            <TabsTrigger value="harvests" className="text-xs sm:text-sm">Harvests</TabsTrigger>
            <TabsTrigger value="marketplace" className="text-xs sm:text-sm">Marketplace</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs sm:text-sm">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {analyticsData && (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.overview.totalFarmers?.toLocaleString() || 0}</div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {analyticsData.overview.growthRate && analyticsData.overview.growthRate > 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-600" />
                        )}
                        <span className={analyticsData.overview.growthRate && analyticsData.overview.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                          {analyticsData.overview.growthRate || 0}% from last period
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₦{(analyticsData.overview.totalRevenue || 0).toLocaleString()}</div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {analyticsData.overview.growthRate && analyticsData.overview.growthRate > 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-600" />
                        )}
                        <span className={analyticsData.overview.growthRate && analyticsData.overview.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                          {analyticsData.overview.growthRate || 0}% from last period
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.overview.totalTransactions?.toLocaleString() || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Active marketplace activity
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.overview.activePartners || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Partner organizations
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Platform Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Uptime</span>
                        <span className="font-medium text-green-600">99.9%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Response Time</span>
                        <span className="font-medium text-blue-600">120ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Success Rate</span>
                        <span className="font-medium text-green-600">98.5%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Growth Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">User Growth</span>
                        <span className="font-medium text-green-600">+15%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Revenue Growth</span>
                        <span className="font-medium text-green-600">+23%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Market Share</span>
                        <span className="font-medium text-blue-600">12.5%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Farmers Helped</span>
                        <span className="font-medium text-purple-600">2,500+</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Communities</span>
                        <span className="font-medium text-purple-600">45</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Impact Score</span>
                        <span className="font-medium text-purple-600">8.7/10</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New farmer registration</p>
                          <p className="text-xs text-muted-foreground">Adunni Adebayo joined from Lagos State</p>
                        </div>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Large order completed</p>
                          <p className="text-xs text-muted-foreground">₦125,000 order for cassava flour</p>
                        </div>
                        <span className="text-xs text-muted-foreground">4 hours ago</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Partner milestone</p>
                          <p className="text-xs text-muted-foreground">Grace Farms reached 100 harvests</p>
                        </div>
                        <span className="text-xs text-muted-foreground">6 hours ago</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Weather alert</p>
                          <p className="text-xs text-muted-foreground">Heavy rainfall expected in Kano State</p>
                        </div>
                        <span className="text-xs text-muted-foreground">8 hours ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="farmers" className="space-y-6">
            {analyticsData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Farmer Demographics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Farmers:</span>
                        <span className="font-medium">{analyticsData.farmers.total || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Farmers:</span>
                        <span className="font-medium">{analyticsData.farmers.active || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New This Period:</span>
                        <span className="font-medium">{analyticsData.farmers.new || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verified:</span>
                        <span className="font-medium">{analyticsData.farmers.verified || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Regional Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analyticsData.farmers.byRegion && Object.entries(analyticsData.farmers.byRegion).map(([region, count]) => (
                        <div key={region} className="flex justify-between">
                          <span>{region}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {analyticsData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Transactions:</span>
                        <span className="font-medium">{analyticsData.transactions.total || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Volume:</span>
                        <span className="font-medium">₦{(analyticsData.transactions.volume || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Value:</span>
                        <span className="font-medium">₦{(analyticsData.transactions.averageValue || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analyticsData.transactions.byPaymentMethod && Object.entries(analyticsData.transactions.byPaymentMethod).map(([method, count]) => (
                        <div key={method} className="flex justify-between">
                          <span>{method}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="harvests" className="space-y-6">
            {analyticsData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Harvest Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Harvests:</span>
                        <span className="font-medium">{analyticsData.harvests.total || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Volume:</span>
                        <span className="font-medium">{(analyticsData.harvests.totalVolume || 0).toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Yield:</span>
                        <span className="font-medium">{(analyticsData.harvests.averageYield || 0).toLocaleString()} kg/ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Post-Harvest Loss:</span>
                        <span className="font-medium">{(analyticsData.harvests.postHarvestLoss || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Crop Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analyticsData.harvests.byCrop && Object.entries(analyticsData.harvests.byCrop).map(([crop, volume]) => (
                        <div key={crop} className="flex justify-between">
                          <span>{crop}:</span>
                          <span className="font-medium">{(volume as number).toLocaleString()} kg</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            {analyticsData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Marketplace Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Active Listings:</span>
                        <span className="font-medium">{analyticsData.marketplace.listings || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Orders:</span>
                        <span className="font-medium">{analyticsData.marketplace.orders || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-medium">₦{(analyticsData.marketplace.revenue || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commission:</span>
                        <span className="font-medium">₦{(analyticsData.marketplace.commission || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.marketplace.topProducts && analyticsData.marketplace.topProducts.slice(0, 5).map((product, index) => (
                        <div key={product.productId} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                            <span className="font-medium">{product.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">₦{(product.revenue || 0).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{product.sales || 0} sales</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {/* Predictive Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Predictive Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {predictiveData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {predictiveData.yieldPrediction || "N/A"}
                        </div>
                        <p className="text-sm text-blue-700">Yield Prediction</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {predictiveData.marketTrend || "N/A"}
                        </div>
                        <p className="text-sm text-green-700">Market Trend</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {predictiveData.riskScore || "N/A"}
                        </div>
                        <p className="text-sm text-purple-700">Risk Score</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No predictive data available</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click "AI Predictive Analytics" to generate AI-powered insights
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Regional Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Regional Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {regionalData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(regionalData).map(([region, data]: [string, any]) => (
                        <div key={region} className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">{region}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Farmers:</span>
                              <span className="font-medium">{data.farmers || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Revenue:</span>
                              <span className="font-medium">₦{(data.revenue || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Growth:</span>
                              <span className="font-medium">{data.growth || 0}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No regional data available</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click "Regional Analysis" to load geographic insights
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comparison Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-primary" />
                  Period Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                {compareData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2 text-blue-800">Current Period</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Revenue:</span>
                            <span className="font-medium">₦{(compareData.current?.revenue || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transactions:</span>
                            <span className="font-medium">{compareData.current?.transactions || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium mb-2 text-green-800">Previous Period</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Revenue:</span>
                            <span className="font-medium">₦{(compareData.previous?.revenue || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transactions:</span>
                            <span className="font-medium">{compareData.previous?.transactions || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {compareData.change && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-2">Change Analysis</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Revenue Change:</span>
                            <span className={`font-medium ${compareData.change.revenue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {compareData.change.revenue > 0 ? '+' : ''}{compareData.change.revenue}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transaction Change:</span>
                            <span className={`font-medium ${compareData.change.transactions > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {compareData.change.transactions > 0 ? '+' : ''}{compareData.change.transactions}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No comparison data available</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click "Compare Periods" to analyze performance changes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
