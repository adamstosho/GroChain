"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  MapPin,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Package,
  Leaf,
  Globe,
  RefreshCw,
  Calendar,
  Loader2,
  AlertCircle,
  BarChart3,
  PieChart,
  Target,
  Award,
  Activity
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/Alert"

interface RegionalData {
  [region: string]: {
    farmers: number
    revenue: number
    growth: number
    transactions: number
    harvests: number
    marketShare: number
    performance: 'excellent' | 'good' | 'fair' | 'poor'
    topCrops: Array<{
      crop: string
      volume: number
      revenue: number
    }>
    trends: Array<{
      month: string
      revenue: number
      farmers: number
    }>
  }
}

interface RegionalComparison {
  current: RegionalData
  previous: RegionalData
  changes: {
    [region: string]: {
      revenueChange: number
      farmerChange: number
      growthRate: number
    }
  }
}

export function RegionalAnalyticsPage() {
  const { user } = useAuth()
  const [regionalData, setRegionalData] = useState<RegionalData | null>(null)
  const [comparisonData, setComparisonData] = useState<RegionalComparison | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    period: "monthly",
    startDate: "",
    endDate: "",
    compareWith: "previous_period"
  })
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [viewMode, setViewMode] = useState<"overview" | "detailed" | "comparison">("overview")

  useEffect(() => {
    if (user) {
      fetchRegionalData()
    }
  }, [user, filters])

  const fetchRegionalData = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.post("/api/analytics/regional", {
        filters,
        regions: []
      })

      if (response.success) {
        setRegionalData(response.data)
        toast.success("Regional analytics loaded successfully!")
      } else {
        throw new Error(response.error || "Failed to fetch regional analytics")
      }
    } catch (error) {
      console.error("Regional analytics error:", error)
      setError("Failed to fetch regional analytics data")
    } finally {
      setLoading(false)
    }
  }

  const fetchComparisonData = async () => {
    try {
      const response = await api.post("/api/analytics/compare", {
        filters,
        comparisonType: "regional",
        regions: Object.keys(regionalData || {})
      })

      if (response.success) {
        setComparisonData(response.data)
        toast.success("Regional comparison loaded!")
      } else {
        throw new Error(response.error || "Failed to fetch comparison data")
      }
    } catch (error) {
      console.error("Comparison error:", error)
      toast.error("Failed to fetch comparison data")
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getPerformanceColor = (performance: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-red-100 text-red-800"
    }
    return colors[performance as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getPerformanceIcon = (performance: string) => {
    const icons = {
      excellent: Award,
      good: TrendingUp,
      fair: Activity,
      poor: TrendingDown
    }
    return icons[performance as keyof typeof icons] || Activity
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading regional analytics...</p>
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
            <h1 className="text-3xl font-bold">Regional Analytics</h1>
            <p className="text-muted-foreground">
              Geographic performance analysis and regional insights across Nigeria
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchRegionalData} disabled={loading}>
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
              <Globe className="w-5 h-5 text-primary" />
              Regional Filters
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
                <Label htmlFor="compareWith">Compare With</Label>
                <Select value={filters.compareWith} onValueChange={(value) => handleFilterChange("compareWith", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="previous_period">Previous Period</SelectItem>
                    <SelectItem value="same_period_last_year">Same Period Last Year</SelectItem>
                    <SelectItem value="baseline">Baseline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant={viewMode === "overview" ? "default" : "outline"}
            onClick={() => setViewMode("overview")}
          >
            <Globe className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={viewMode === "detailed" ? "default" : "outline"}
            onClick={() => setViewMode("detailed")}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Detailed
          </Button>
          <Button
            variant={viewMode === "comparison" ? "default" : "outline"}
            onClick={() => {
              setViewMode("comparison")
              if (!comparisonData) {
                fetchComparisonData()
              }
            }}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Comparison
          </Button>
        </div>

        {/* Regional Overview */}
        {viewMode === "overview" && regionalData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(regionalData).map(([region, data]) => (
              <motion.div
                key={region}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedRegion(region)}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {region}
                      </span>
                      <Badge className={getPerformanceColor(data.performance)}>
                        {data.performance}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{data.farmers}</div>
                          <p className="text-xs text-muted-foreground">Farmers</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">₦{(data.revenue / 1000000).toFixed(1)}M</div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Growth:</span>
                          <span className={`font-medium ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {data.growth >= 0 ? '+' : ''}{data.growth}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Transactions:</span>
                          <span className="font-medium">{data.transactions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Market Share:</span>
                          <span className="font-medium">{data.marketShare.toFixed(1)}%</span>
                        </div>
                      </div>

                      {data.topCrops && data.topCrops.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Top Crop:</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{data.topCrops[0].crop}</span>
                            <span className="text-xs text-muted-foreground">
                              ₦{(data.topCrops[0].revenue / 1000).toFixed(0)}K
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detailed Regional View */}
        {viewMode === "detailed" && selectedRegion && regionalData && regionalData[selectedRegion] && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {selectedRegion} - Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Farmers:</span>
                        <span className="font-medium">{regionalData[selectedRegion].farmers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <span className="font-medium">₦{regionalData[selectedRegion].revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Growth Rate:</span>
                        <span className={`font-medium ${regionalData[selectedRegion].growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {regionalData[selectedRegion].growth >= 0 ? '+' : ''}{regionalData[selectedRegion].growth}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Market Share:</span>
                        <span className="font-medium">{regionalData[selectedRegion].marketShare.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Top Crops</h4>
                    <div className="space-y-2">
                      {regionalData[selectedRegion].topCrops?.map((crop, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                          <span className="font-medium">{crop.crop}</span>
                          <div className="text-right">
                            <div className="font-medium">₦{crop.revenue.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{crop.volume} kg</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {regionalData[selectedRegion].trends && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-4">Monthly Trends</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {regionalData[selectedRegion].trends.slice(-3).map((trend, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded text-center">
                          <div className="text-sm text-muted-foreground">{trend.month}</div>
                          <div className="text-lg font-bold">₦{(trend.revenue / 1000).toFixed(0)}K</div>
                          <div className="text-xs text-muted-foreground">{trend.farmers} farmers</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Regional Comparison */}
        {viewMode === "comparison" && comparisonData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Regional Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(comparisonData.changes).map(([region, change]) => (
                    <div key={region} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">{region}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${change.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change.revenueChange >= 0 ? '+' : ''}{change.revenueChange}%
                          </div>
                          <p className="text-sm text-muted-foreground">Revenue Change</p>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${change.farmerChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change.farmerChange >= 0 ? '+' : ''}{change.farmerChange}%
                          </div>
                          <p className="text-sm text-muted-foreground">Farmer Change</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{change.growthRate}%</div>
                          <p className="text-sm text-muted-foreground">Growth Rate</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Data State */}
        {!regionalData && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Regional Data Available</h2>
              <p className="text-muted-foreground mb-4">
                Regional analytics data will appear here once you have activity across different regions.
              </p>
              <Button onClick={fetchRegionalData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
