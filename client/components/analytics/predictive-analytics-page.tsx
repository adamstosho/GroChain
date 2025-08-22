"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Leaf,
  DollarSign,
  Calendar,
  MapPin,
  RefreshCw,
  Loader2,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/Alert"

interface PredictiveData {
  yieldPrediction: {
    crop: string
    predictedYield: number
    confidence: number
    factors: Array<{
      factor: string
      impact: 'positive' | 'negative' | 'neutral'
      weight: number
    }>
    recommendations: Array<string>
  }
  marketInsights: {
    trend: 'bullish' | 'bearish' | 'stable'
    pricePrediction: number
    demandForecast: number
    supplyProjection: number
    riskFactors: Array<string>
    opportunities: Array<string>
  }
  weatherPrediction: {
    temperature: number
    humidity: number
    rainfall: number
    favorableDays: number
    alerts: Array<{
      type: 'warning' | 'danger' | 'info'
      message: string
      severity: number
    }>
  }
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high'
    riskScore: number
    riskFactors: Array<{
      factor: string
      probability: number
      impact: number
      mitigation: string
    }>
    recommendations: Array<string>
  }
  seasonalCalendar: {
    currentSeason: string
    nextSeason: string
    recommendedCrops: Array<{
      crop: string
      reason: string
      expectedYield: number
      marketPrice: number
    }>
    activities: Array<{
      activity: string
      timing: string
      importance: 'high' | 'medium' | 'low'
    }>
  }
}

interface PredictionRequest {
  cropType: string
  region: string
  farmSize: number
  soilType: string
  irrigation: boolean
  season: string
}

export function PredictiveAnalyticsPage() {
  const { user } = useAuth()
  const [predictiveData, setPredictiveData] = useState<PredictiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    period: "monthly",
    region: "",
    cropType: "",
    startDate: "",
    endDate: ""
  })
  const [predictionRequest, setPredictionRequest] = useState<PredictionRequest>({
    cropType: "",
    region: "",
    farmSize: 0,
    soilType: "",
    irrigation: false,
    season: ""
  })
  const [generatingPrediction, setGeneratingPrediction] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const CROP_TYPES = [
    "Maize", "Rice", "Cassava", "Yam", "Sorghum", "Millet", 
    "Groundnut", "Soybean", "Vegetables", "Fruits", "Other"
  ]

  const SOIL_TYPES = [
    "Sandy", "Clay", "Loamy", "Silty", "Peaty", "Chalky"
  ]

  const SEASONS = [
    "Early Rainy Season", "Late Rainy Season", "Dry Season", "Year-round"
  ]

  useEffect(() => {
    if (user) {
      fetchPredictiveData()
    }
  }, [user, filters])

  const fetchPredictiveData = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/api/analytics/predictive", { params: filters })

      if (response.success) {
        setPredictiveData(response.data)
        toast.success("AI predictions loaded successfully!")
      } else {
        throw new Error(response.error || "Failed to fetch predictive analytics")
      }
    } catch (error) {
      console.error("Predictive analytics error:", error)
      setError("Failed to fetch AI predictions")
    } finally {
      setLoading(false)
    }
  }

  const generateCustomPrediction = async () => {
    try {
      setGeneratingPrediction(true)

      const response = await api.post("/api/ai/yield-prediction", predictionRequest)

      if (response.success) {
        // Update the yield prediction data
        if (predictiveData) {
          setPredictiveData({
            ...predictiveData,
            yieldPrediction: response.data
          })
        }
        toast.success("Custom prediction generated successfully!")
      } else {
        throw new Error(response.error || "Failed to generate prediction")
      }
    } catch (error) {
      console.error("Custom prediction error:", error)
      toast.error("Failed to generate custom prediction")
    } finally {
      setGeneratingPrediction(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handlePredictionChange = (key: keyof PredictionRequest, value: string | number | boolean) => {
    setPredictionRequest(prev => ({ ...prev, [key]: value }))
  }

  const getTrendColor = (trend: string) => {
    const colors = {
      bullish: "bg-green-100 text-green-800",
      bearish: "bg-red-100 text-red-800",
      stable: "bg-blue-100 text-blue-800"
    }
    return colors[trend as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getRiskColor = (risk: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    }
    return colors[risk as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getImpactColor = (impact: string) => {
    const colors = {
      positive: "text-green-600",
      negative: "text-red-600",
      neutral: "text-gray-600"
    }
    return colors[impact as keyof typeof colors] || "text-gray-600"
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading AI predictions...</p>
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
            <h1 className="text-3xl font-bold">AI Predictive Analytics</h1>
            <p className="text-muted-foreground">
              AI-powered forecasting, yield predictions, and market insights for agricultural planning
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchPredictiveData} disabled={loading}>
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
              <Target className="w-5 h-5 text-primary" />
              Prediction Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <Label htmlFor="region">Region</Label>
                <Input
                  placeholder="All regions"
                  value={filters.region}
                  onChange={(e) => handleFilterChange("region", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type</Label>
                <Select value={filters.cropType} onValueChange={(value) => handleFilterChange("cropType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All crops" />
                  </SelectTrigger>
                  <SelectContent>
                    {CROP_TYPES.map((crop) => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
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
            </div>
          </CardContent>
        </Card>

        {/* Custom Prediction Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Generate Custom Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type</Label>
                <Select value={predictionRequest.cropType} onValueChange={(value) => handlePredictionChange("cropType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {CROP_TYPES.map((crop) => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  placeholder="Enter region"
                  value={predictionRequest.region}
                  onChange={(e) => handlePredictionChange("region", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmSize">Farm Size (hectares)</Label>
                <Input
                  type="number"
                  placeholder="5"
                  value={predictionRequest.farmSize}
                  onChange={(e) => handlePredictionChange("farmSize", parseFloat(e.target.value) || 0)}
                  min="0.1"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="soilType">Soil Type</Label>
                <Select value={predictionRequest.soilType} onValueChange={(value) => handlePredictionChange("soilType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOIL_TYPES.map((soil) => (
                      <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Select value={predictionRequest.season} onValueChange={(value) => handlePredictionChange("season", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((season) => (
                      <SelectItem key={season} value={season}>{season}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="irrigation">Irrigation Available</Label>
                <Select value={predictionRequest.irrigation.toString()} onValueChange={(value) => handlePredictionChange("irrigation", value === "true")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Button 
                onClick={generateCustomPrediction} 
                disabled={generatingPrediction || !predictionRequest.cropType || !predictionRequest.region}
                className="w-full"
              >
                {generatingPrediction ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating Prediction...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate AI Prediction
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="yield" className="text-xs sm:text-sm">Yield Prediction</TabsTrigger>
            <TabsTrigger value="market" className="text-xs sm:text-sm">Market Insights</TabsTrigger>
            <TabsTrigger value="weather" className="text-xs sm:text-sm">Weather</TabsTrigger>
            <TabsTrigger value="risk" className="text-xs sm:text-sm">Risk Assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {predictiveData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Yield Prediction</CardTitle>
                    <Leaf className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {predictiveData.yieldPrediction.predictedYield.toFixed(1)} tons/ha
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {predictiveData.yieldPrediction.crop} - {predictiveData.yieldPrediction.confidence}% confidence
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Market Trend</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {predictiveData.marketInsights.pricePrediction.toFixed(0)} ₦/kg
                    </div>
                    <Badge className={getTrendColor(predictiveData.marketInsights.trend)}>
                      {predictiveData.marketInsights.trend}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {predictiveData.riskAssessment.riskScore}/100
                    </div>
                    <Badge className={getRiskColor(predictiveData.riskAssessment.overallRisk)}>
                      {predictiveData.riskAssessment.overallRisk}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weather Alert</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {predictiveData.weatherPrediction.favorableDays}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Favorable days this month
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No AI Predictions Available</h2>
                  <p className="text-muted-foreground mb-4">
                    Generate custom predictions or wait for system predictions to load.
                  </p>
                  <Button onClick={fetchPredictiveData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Load Predictions
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="yield" className="space-y-6">
            {predictiveData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-primary" />
                      Yield Prediction Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                        <div className="text-4xl font-bold text-green-600">
                          {predictiveData.yieldPrediction.predictedYield.toFixed(1)}
                        </div>
                        <p className="text-lg text-muted-foreground">tons per hectare</p>
                        <Badge className="mt-2">
                          {predictiveData.yieldPrediction.confidence}% Confidence
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Key Factors</h4>
                        {predictiveData.yieldPrediction.factors.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="text-sm">{factor.factor}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${getImpactColor(factor.impact)}`}>
                                {factor.impact}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Weight: {factor.weight}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Recommendations</h4>
                        {predictiveData.yieldPrediction.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                            <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Seasonal Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-2">Current Season: {predictiveData.seasonalCalendar.currentSeason}</h4>
                        <p className="text-sm text-muted-foreground">
                          Next: {predictiveData.seasonalCalendar.nextSeason}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Recommended Crops</h4>
                        {predictiveData.seasonalCalendar.recommendedCrops.map((crop, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{crop.crop}</span>
                              <Badge>₦{crop.marketPrice}/kg</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{crop.reason}</p>
                            <div className="flex justify-between text-sm">
                              <span>Expected Yield: {crop.expectedYield} tons/ha</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            {predictiveData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Market Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            ₦{predictiveData.marketInsights.pricePrediction.toFixed(0)}
                          </div>
                          <p className="text-sm text-blue-700">Price Prediction</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {predictiveData.marketInsights.demandForecast.toFixed(0)}%
                          </div>
                          <p className="text-sm text-green-700">Demand Forecast</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Risk Factors</h4>
                        {predictiveData.marketInsights.riskFactors.map((risk, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                            <span className="text-sm">{risk}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Opportunities</h4>
                        {predictiveData.marketInsights.opportunities.map((opp, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <span className="text-sm">{opp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Supply & Demand
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Supply Projection</h4>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {predictiveData.marketInsights.supplyProjection.toFixed(0)}%
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Expected supply increase/decrease
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Market Sentiment</h4>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <Badge className={`text-lg px-4 py-2 ${getTrendColor(predictiveData.marketInsights.trend)}`}>
                            {predictiveData.marketInsights.trend.toUpperCase()}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-2">
                            Overall market outlook for the selected period
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="weather" className="space-y-6">
            {predictiveData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Weather Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {predictiveData.weatherPrediction.temperature}°C
                          </div>
                          <p className="text-sm text-blue-700">Temperature</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {predictiveData.weatherPrediction.humidity}%
                          </div>
                          <p className="text-sm text-green-700">Humidity</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {predictiveData.weatherPrediction.rainfall}mm
                          </div>
                          <p className="text-sm text-purple-700">Rainfall</p>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-2">Favorable Days</h4>
                        <div className="text-2xl font-bold text-green-600">
                          {predictiveData.weatherPrediction.favorableDays} days
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Optimal weather conditions for farming activities
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                      Weather Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {predictiveData.weatherPrediction.alerts.length > 0 ? (
                        predictiveData.weatherPrediction.alerts.map((alert, index) => (
                          <div key={index} className={`p-3 rounded-lg ${
                            alert.type === 'danger' ? 'bg-red-50 border border-red-200' :
                            alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                            'bg-blue-50 border border-blue-200'
                          }`}>
                            <div className="flex items-start gap-2">
                              {alert.type === 'danger' ? (
                                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                              ) : alert.type === 'warning' ? (
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium">{alert.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Severity: {alert.severity}/10
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                          <p className="text-muted-foreground">No weather alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Weather conditions are favorable for farming
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            {predictiveData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                        <div className="text-4xl font-bold text-red-600">
                          {predictiveData.riskAssessment.riskScore}/100
                        </div>
                        <p className="text-lg text-muted-foreground">Overall Risk Score</p>
                        <Badge className={`mt-2 text-lg px-4 py-2 ${getRiskColor(predictiveData.riskAssessment.overallRisk)}`}>
                          {predictiveData.riskAssessment.overallRisk.toUpperCase()} RISK
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Risk Factors</h4>
                        {predictiveData.riskAssessment.riskFactors.map((risk, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{risk.factor}</span>
                              <div className="text-right">
                                <Badge variant="outline" className="mr-2">
                                  P: {risk.probability}%
                                </Badge>
                                <Badge variant="outline">
                                  I: {risk.impact}/10
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Mitigation: {risk.mitigation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      Risk Mitigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Recommendations</h4>
                        {predictiveData.riskAssessment.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded">
                            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-2">Risk Monitoring</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Monitor these factors regularly to manage risk effectively
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Update predictions every 24 hours</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
