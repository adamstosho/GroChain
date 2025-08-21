"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
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
  LineChart
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AnalyticsCharts } from "./analytics-charts"
import { AnalyticsMetrics } from "./analytics-metrics"
import { AnalyticsTables } from "./analytics-tables"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { toast } from "sonner"

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
  const [reportLoading, setReportLoading] = useState(false)
  const [compareLoading, setCompareLoading] = useState(false)
  const [regionalLoading, setRegionalLoading] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json'|'csv'|'excel'>('json')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [reportResult, setReportResult] = useState<any | null>(null)
  const [compareResult, setCompareResult] = useState<any | null>(null)
  const [regionalResult, setRegionalResult] = useState<Record<string, any> | null>(null)
  const [predictiveData, setPredictiveData] = useState<any | null>(null)
  const [predictiveLoading, setPredictiveLoading] = useState(false)

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

  const generateReport = async () => {
    try {
      setReportLoading(true)
      const response = await api.post("/api/analytics/report", {
        filters,
        format: exportFormat
      })
      
      if (response.success) {
        setReportResult(response.data)
        toast.success("Report generated successfully!")
      } else {
        throw new Error(response.error || "Failed to generate report")
      }
    } catch (error) {
      console.error("Report generation error:", error)
      toast.error("Failed to generate report")
    } finally {
      setReportLoading(false)
    }
  }

  const compareAnalytics = async () => {
    try {
      setCompareLoading(true)
      const response = await api.post("/api/analytics/compare", {
        filters,
        comparisonType: "period"
      })
      
      if (response.success) {
        setCompareResult(response.data)
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

  const fetchRegionalAnalytics = async () => {
    try {
      setRegionalLoading(true)
      const response = await api.post("/api/analytics/regional", {
        filters,
        regions: filters.region ? [filters.region] : []
      })
      
      if (response.success) {
        setRegionalResult(response.data)
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
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your agricultural platform performance
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
            Predictive Analytics
          </Button>
          
          <Button variant="outline" onClick={fetchRegionalAnalytics} disabled={regionalLoading}>
            {regionalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            Regional Analysis
          </Button>
          
          <Button variant="outline" onClick={compareAnalytics} disabled={compareLoading}>
            {compareLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <BarChart className="w-4 h-4 mr-2" />
            )}
            Compare Periods
          </Button>
          
          <Button variant="outline" onClick={generateReport} disabled={reportLoading}>
            {reportLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Generate Report
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
            {analyticsData && <AnalyticsMetrics data={analyticsData} />}
          </TabsContent>

          <TabsContent value="farmers" className="space-y-6">
            {analyticsData && <AnalyticsCharts data={analyticsData} type="farmers" />}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {analyticsData && <AnalyticsCharts data={analyticsData} type="transactions" />}
          </TabsContent>

          <TabsContent value="harvests" className="space-y-6">
            {analyticsData && <AnalyticsCharts data={analyticsData} type="harvests" />}
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            {analyticsData && <AnalyticsCharts data={analyticsData} type="marketplace" />}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {/* Predictive Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Predictive Analytics
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
                      Click "Predictive Analytics" to generate AI-powered insights
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
                {regionalResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(regionalResult).map(([region, data]: [string, any]) => (
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
                {compareResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2 text-blue-800">Current Period</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Revenue:</span>
                            <span className="font-medium">₦{(compareResult.current?.revenue || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transactions:</span>
                            <span className="font-medium">{compareResult.current?.transactions || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium mb-2 text-green-800">Previous Period</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Revenue:</span>
                            <span className="font-medium">₦{(compareResult.previous?.revenue || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transactions:</span>
                            <span className="font-medium">{compareResult.previous?.transactions || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {compareResult.change && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-2">Change Analysis</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Revenue Change:</span>
                            <span className={`font-medium ${compareResult.change.revenue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {compareResult.change.revenue > 0 ? '+' : ''}{compareResult.change.revenue}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transaction Change:</span>
                            <span className={`font-medium ${compareResult.change.transactions > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {compareResult.change.transactions > 0 ? '+' : ''}{compareResult.change.transactions}%
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

            {/* Report Results */}
            {reportResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Generated Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2">Report Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Generated:</span>
                          <span className="font-medium">{new Date(reportResult.generatedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Format:</span>
                          <span className="font-medium">{reportResult.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Data Points:</span>
                          <span className="font-medium">{reportResult.dataPoints || 0}</span>
                        </div>
                      </div>
                    </div>
                    <Button onClick={exportData} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
