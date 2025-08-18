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
  TrendingDown
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AnalyticsCharts } from "./analytics-charts"
import { AnalyticsMetrics } from "./analytics-metrics"
import { AnalyticsTables } from "./analytics-tables"
import { Alert, AlertDescription } from "@/components/ui/Alert"

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

  useEffect(() => {
    fetchAnalyticsData()
  }, [filters])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch comprehensive dashboard metrics and sub-areas
      const [dash, farmers, harvests, marketplace, impact] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getFarmersAnalytics(),
        api.getHarvestsAnalytics(),
        api.getMarketplaceAnalytics(),
        api.getImpactAnalytics(),
      ])

      if (dash.success) {
        const base: any = dash.data
        const data: any = base
        if (farmers.success && farmers.data) data.farmers = (farmers.data as any).data || farmers.data
        if (harvests.success && harvests.data) data.harvests = (harvests.data as any).data || harvests.data
        if (marketplace.success && marketplace.data) data.marketplace = (marketplace.data as any).data || marketplace.data
        if (impact.success && impact.data) data.impact = (impact.data as any).data || impact.data
        setAnalyticsData(data)
        setLastUpdated(new Date())
      } else {
        throw new Error(dash.error || "Failed to fetch analytics data")
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
      const response = await api.exportAnalytics({
        format: 'json',
        period: filters.period,
        region: filters.region || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      })
      if (response.success) {
        const data = response.data as any
        const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        const type = typeof data === 'string' ? 'text/csv' : 'application/json'
        const ext = typeof data === 'string' ? 'csv' : 'json'
        const blob = new Blob([content], { type })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `grochain-analytics-${new Date().toISOString().split('T')[0]}.${ext}`
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

        {/* Actions: Report/Compare/Regional/Export */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Generate Report</Label>
                <Button disabled={reportLoading} onClick={async () => {
                  setReportLoading(true)
                  const resp = await api.generateAnalyticsReport({
                    period: filters.period,
                    region: filters.region || undefined,
                    startDate: filters.startDate || undefined,
                    endDate: filters.endDate || undefined,
                  })
                  if ((resp as any)?.success) setReportResult((resp.data as any)?.data || resp.data)
                  setReportLoading(false)
                }}>{reportLoading ? 'Generating…' : 'Generate'}</Button>
              </div>

              <div className="space-y-2">
                <Label>Compare Periods</Label>
                <Button disabled={compareLoading} onClick={async () => {
                  setCompareLoading(true)
                  const resp = await api.compareAnalytics({
                    baselineStartDate: filters.startDate || undefined,
                    baselineEndDate: filters.endDate || undefined,
                    currentStartDate: filters.startDate || undefined,
                    currentEndDate: filters.endDate || undefined,
                    period: filters.period,
                    region: filters.region || undefined,
                  })
                  if ((resp as any)?.success) setCompareResult((resp.data as any)?.data || resp.data)
                  setCompareLoading(false)
                }}>{compareLoading ? 'Comparing…' : 'Compare'}</Button>
              </div>

              <div className="space-y-2">
                <Label>Regional Analytics</Label>
                <Button disabled={regionalLoading} onClick={async () => {
                  setRegionalLoading(true)
                  const resp = await api.getRegionalAnalytics({
                    startDate: filters.startDate || undefined,
                    endDate: filters.endDate || undefined,
                    period: filters.period,
                    regions: ['Lagos','Kano','Kaduna']
                  })
                  if ((resp as any)?.success) setRegionalResult((resp.data as any)?.data || resp.data)
                  setRegionalLoading(false)
                }}>{regionalLoading ? 'Loading…' : 'Load Regions'}</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel (JSON stub)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={async () => {
                  const resp = await api.exportAnalytics({
                    format: exportFormat,
                    period: filters.period,
                    region: filters.region || undefined,
                    startDate: filters.startDate || undefined,
                    endDate: filters.endDate || undefined,
                  })
                  if (resp.success) {
                    const data = resp.data as any
                    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
                    const type = exportFormat === 'csv' ? 'text/csv' : 'application/json'
                    const ext = exportFormat === 'csv' ? 'csv' : 'json'
                    const blob = new Blob([content], { type })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `grochain-analytics-${new Date().toISOString().split('T')[0]}.${ext}`
                    document.body.appendChild(a)
                    a.click()
                    window.URL.revokeObjectURL(url)
                    document.body.removeChild(a)
                  }
                }}>Export Now</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results: Report / Compare / Regional */}
        {(reportResult || compareResult || regionalResult) && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {reportResult && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Generated Report</div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Report ID</span><div className="font-medium break-all">{reportResult.reportId || reportResult.id || '—'}</div></div>
                    <div><span className="text-muted-foreground">Date</span><div className="font-medium">{reportResult.date ? new Date(reportResult.date).toLocaleString() : '—'}</div></div>
                    <div><span className="text-muted-foreground">Period</span><div className="font-medium">{reportResult.period || '—'}</div></div>
                    <div><span className="text-muted-foreground">Region</span><div className="font-medium">{reportResult.region || 'all'}</div></div>
                  </div>
                </div>
              )}

              {compareResult && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Comparative Analytics</div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['farmers','transactions','revenue','harvests'].map((key) => {
                      const change = (compareResult.changes || {})[key] || { absolute: 0, percentage: 0 }
                      return (
                        <div key={key} className="p-3 rounded border">
                          <div className="text-xs text-muted-foreground capitalize">{key}</div>
                          <div className="text-sm">Δ {Math.round(change.absolute)}</div>
                          <div className="text-xs text-muted-foreground">{change.percentage?.toFixed?.(1) || 0}%</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {regionalResult && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Regional Analytics</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(regionalResult).map(([region, metrics]) => (
                      <div key={region} className="p-3 rounded border text-sm">
                        <div className="font-medium mb-2">{region}</div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Farmers</span><span className="font-medium">{metrics?.farmers?.total ?? 0}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Transactions</span><span className="font-medium">{metrics?.transactions?.total ?? 0}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Revenue</span><span className="font-medium">{metrics?.marketplace?.revenue ?? 0}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Growth</span><span className="font-medium">{metrics?.overview?.growthRate ?? 0}%</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="farmers">Farmers</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="harvests">Harvests</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="fintech">Fintech</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="predictive">Predictive</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
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

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <AnalyticsTables data={analyticsData} type="transactions" />
          </TabsContent>

          {/* Harvests Tab */}
          <TabsContent value="harvests" className="space-y-6">
            <AnalyticsTables data={analyticsData} type="harvests" />
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <AnalyticsTables data={analyticsData} type="marketplace" />
          </TabsContent>

          {/* Fintech Tab */}
          <TabsContent value="fintech" className="space-y-6">
            <AnalyticsTables data={analyticsData} type="fintech" />
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact" className="space-y-6">
            <AnalyticsTables data={analyticsData} type="impact" />
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-6">
            <AnalyticsTables data={analyticsData} type="partners" />
          </TabsContent>

          {/* Weather Tab */}
          <TabsContent value="weather" className="space-y-6">
            <AnalyticsTables data={analyticsData} type="weather" />
          </TabsContent>

          {/* Predictive Tab */}
          <TabsContent value="predictive" className="space-y-6">
            <PredictivePanel />
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <SummaryPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function PredictivePanel() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const load = async () => {
    setLoading(true)
    const resp = await api.getPredictiveAnalytics()
    if (resp.success) setData((resp.data as any).data || resp.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Predictive Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <div className="text-muted-foreground text-sm">Loading…</div> : (
          data ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded"><div className="text-xs text-muted-foreground">Next Month Farmers</div><div className="text-2xl font-bold">{data.nextMonth?.farmers}</div></div>
              <div className="p-4 bg-green-50 rounded"><div className="text-xs text-muted-foreground">Next Month Transactions</div><div className="text-2xl font-bold">{data.nextMonth?.transactions}</div></div>
              <div className="p-4 bg-purple-50 rounded"><div className="text-xs text-muted-foreground">Next Month Revenue</div><div className="text-2xl font-bold">{data.nextMonth?.revenue}</div></div>
            </div>
          ) : <div className="text-muted-foreground text-sm">No data</div>
        )}
      </CardContent>
    </Card>
  )
}

function SummaryPanel() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const load = async () => {
    setLoading(true)
    const resp = await api.getAnalyticsSummary()
    if (resp.success) setData((resp.data as any).data || resp.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <div className="text-muted-foreground text-sm">Loading…</div> : (
          data ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded"><div className="text-xs text-muted-foreground">Total Farmers</div><div className="text-2xl font-bold">{data.keyMetrics?.totalFarmers}</div></div>
              <div className="p-4 bg-green-50 rounded"><div className="text-xs text-muted-foreground">Total Revenue</div><div className="text-2xl font-bold">{data.keyMetrics?.totalRevenue}</div></div>
              <div className="p-4 bg-orange-50 rounded"><div className="text-xs text-muted-foreground">Growth Rate</div><div className="text-2xl font-bold">{data.keyMetrics?.growthRate}%</div></div>
            </div>
          ) : <div className="text-muted-foreground text-sm">No data</div>
        )}
      </CardContent>
    </Card>
  )
}
