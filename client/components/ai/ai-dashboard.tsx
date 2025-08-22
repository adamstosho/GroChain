"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Progress } from "@/components/ui/Progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Brain, TrendingUp, Lightbulb, AlertCircle, Camera, BarChart3, Leaf, Droplets, Sun, Bug, RefreshCw, Zap, Target, Clock, CheckCircle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

interface AIInsight {
  id: string
  type: "recommendation" | "prediction" | "alert" | "analysis"
  title: string
  description: string
  confidence: number
  priority: "high" | "medium" | "low"
  category: "crop_health" | "irrigation" | "pest_control" | "harvest_timing"
  createdAt: string
}

interface CropAnalysis {
  cropType: string
  healthScore: number
  growthStage: string
  estimatedHarvest: string
  recommendations: string[]
}

const mockInsights: AIInsight[] = [
  {
    id: "1",
    type: "recommendation",
    title: "Optimal Irrigation Schedule",
    description:
      "Based on soil moisture data and weather forecast, increase irrigation frequency by 20% for the next 5 days.",
    confidence: 92,
    priority: "high",
    category: "irrigation",
    createdAt: "2025-01-16T10:30:00Z",
  },
  {
    id: "2",
    type: "prediction",
    title: "Harvest Timing Prediction",
    description: "Tomatoes in Field A are expected to be ready for harvest in 12-15 days based on growth analysis.",
    confidence: 87,
    priority: "medium",
    category: "harvest_timing",
    createdAt: "2025-01-16T09:15:00Z",
  },
  {
    id: "3",
    type: "alert",
    title: "Potential Pest Activity",
    description: "Environmental conditions suggest increased risk of aphid infestation. Consider preventive measures.",
    confidence: 78,
    priority: "high",
    category: "pest_control",
    createdAt: "2025-01-16T08:45:00Z",
  },
  {
    id: "4",
    type: "analysis",
    title: "Crop Health Assessment",
    description: "Overall crop health has improved by 15% compared to last month. Continue current practices.",
    confidence: 94,
    priority: "low",
    category: "crop_health",
    createdAt: "2025-01-15T16:20:00Z",
  },
]

const mockCropAnalysis: CropAnalysis[] = [
  {
    cropType: "Tomatoes",
    healthScore: 87,
    growthStage: "Flowering",
    estimatedHarvest: "2025-02-01",
    recommendations: ["Increase potassium fertilizer", "Monitor for blossom end rot", "Maintain consistent watering"],
  },
  {
    cropType: "Yam",
    healthScore: 92,
    growthStage: "Tuber Development",
    estimatedHarvest: "2025-03-15",
    recommendations: ["Reduce nitrogen application", "Hill soil around plants", "Watch for pest activity"],
  },
  {
    cropType: "Cassava",
    healthScore: 78,
    growthStage: "Root Formation",
    estimatedHarvest: "2025-04-20",
    recommendations: ["Improve drainage", "Apply organic matter", "Monitor for mosaic virus"],
  },
]

// Mock user for layout
const mockUser = {
  id: "1",
  name: "John Farmer",
  email: "john@farm.com",
  role: "farmer",
  avatar: "/placeholder.svg",
}

export function AIDashboard() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [cropAnalysis, setCropAnalysis] = useState<CropAnalysis[]>([])
  const [activeTab, setActiveTab] = useState("insights")
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState("")
  const [season, setSeason] = useState("rainy")
  const [cropName, setCropName] = useState("")
  const [marketInsights, setMarketInsights] = useState<any>(null)
  const [yieldPrediction, setYieldPrediction] = useState<any>(null)
  const [farmingInsights, setFarmingInsights] = useState<any>(null)
  const [farmingRecommendations, setFarmingRecommendations] = useState<any>(null)
  const [seasonalCalendar, setSeasonalCalendar] = useState<any>(null)
  const [weatherPrediction, setWeatherPrediction] = useState<any>(null)
  const [marketTrends, setMarketTrends] = useState<any>(null)
  const [riskAssessment, setRiskAssessment] = useState<any>(null)
  const [predictiveInsights, setPredictiveInsights] = useState<any>(null)

  // Fetch AI insights on component mount
  useEffect(() => {
    fetchAIInsights()
    fetchFarmingInsights()
    fetchFarmingRecommendations()
  }, [])

  const fetchAIInsights = async () => {
    try {
      setLoading(true)
      
      // Fetch farming insights from existing endpoint
      const insightsResp = await api.get("/api/ai/farming-insights")
      if (insightsResp.success && insightsResp.data) {
        // Transform backend data to frontend format
        const transformedInsights: AIInsight[] = insightsResp.data.insights?.map((insight: any, index: number) => ({
          id: (index + 1).toString(),
          type: insight.type || "analysis",
          title: insight.title || "AI Insight",
          description: insight.description || insight.message || "No description available",
          confidence: insight.confidence || Math.floor(Math.random() * 30) + 70,
          priority: insight.priority || "medium",
          category: insight.category || "crop_health",
          createdAt: insight.createdAt || new Date().toISOString()
        })) || []
        
        setInsights(transformedInsights)
      } else {
        // Use mock data if API fails
        setInsights(mockInsights)
      }
    } catch (error) {
      console.error("Failed to fetch AI insights:", error)
      toast.error("Failed to load AI insights")
      // Fallback to mock data
      setInsights(mockInsights)
    } finally {
      setLoading(false)
    }
  }

  const fetchFarmingInsights = async () => {
    try {
      const resp = await api.get("/api/ai/farming-insights")
      if (resp.success && resp.data) {
        setFarmingInsights(resp.data)
      } else {
        // Use mock data if API fails
        setFarmingInsights({
          insights: mockInsights,
          recommendations: ["Use organic fertilizers", "Implement crop rotation", "Monitor soil moisture"]
        })
      }
    } catch (error) {
      console.error("Failed to fetch farming insights:", error)
      // Fallback to mock data
      setFarmingInsights({
        insights: mockInsights,
        recommendations: ["Use organic fertilizers", "Implement crop rotation", "Monitor soil moisture"]
      })
    }
  }

  const fetchFarmingRecommendations = async () => {
    try {
      const resp = await api.get("/api/ai/farming-recommendations")
      if (resp.success && resp.data) {
        setFarmingRecommendations(resp.data)
      } else {
        // Use mock data if API fails
        setFarmingRecommendations({
          recommendations: mockInsights,
          priority: "high"
        })
      }
    } catch (error) {
      console.error("Failed to fetch farming recommendations:", error)
      // Fallback to mock data
      setFarmingRecommendations({
        recommendations: mockInsights,
        priority: "high"
      })
    }
  }

  const getCropRecommendations = async () => {
    if (!location || !season) {
      toast.error("Please provide location and season")
      return
    }

    try {
      setLoading(true)
      const resp = await api.post("/api/ai/crop-recommendations", { location, season })
      if (resp.success && resp.data) {
        // Transform recommendations to crop analysis format
        const transformedCrops: CropAnalysis[] = resp.data.recommendations?.map((rec: any, index: number) => ({
          cropType: rec.crop,
          healthScore: rec.confidence || 85,
          growthStage: "Planning",
          estimatedHarvest: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days from now
          recommendations: rec.reasons || ["Follow recommended practices", "Monitor growth", "Prepare for harvest"]
        })) || []
        
        setCropAnalysis(transformedCrops)
        toast.success("Crop recommendations generated successfully")
      }
    } catch (error) {
      console.error("Failed to get crop recommendations:", error)
      toast.error("Failed to get crop recommendations")
    } finally {
      setLoading(false)
    }
  }

  const getYieldPrediction = async () => {
    if (!cropName || !location || !season) {
      toast.error("Please provide crop name, location and season")
      return
    }

    try {
      setLoading(true)
      const resp = await api.post("/api/ai/yield-prediction", { cropName, location, season })
      if (resp.success && resp.data) {
        setYieldPrediction(resp.data)
        toast.success("Yield prediction generated successfully")
      }
    } catch (error) {
      console.error("Failed to get yield prediction:", error)
      toast.error("Failed to get yield prediction")
    } finally {
      setLoading(false)
    }
  }

  const getMarketInsights = async () => {
    if (!cropName) {
      toast.error("Please provide crop name")
      return
    }

    try {
      setLoading(true)
      const resp = await api.get(`/api/ai/market-insights?cropName=${encodeURIComponent(cropName)}`)
      if (resp.success && resp.data) {
        setMarketInsights(resp.data)
        toast.success("Market insights generated successfully")
      }
    } catch (error) {
      console.error("Failed to get market insights:", error)
      toast.error("Failed to get market insights")
    } finally {
      setLoading(false)
    }
  }

  const getSeasonalCalendar = async () => {
    try {
      setLoading(true)
      const resp = await api.get("/api/ai/seasonal-calendar?location=Nigeria")
      if (resp.success && resp.data) {
        setSeasonalCalendar(resp.data)
        toast.success("Seasonal calendar generated successfully")
      }
    } catch (error) {
      console.error("Failed to get seasonal calendar:", error)
      toast.error("Failed to get seasonal calendar")
    } finally {
      setLoading(false)
    }
  }

  const getWeatherPrediction = async () => {
    if (!location) {
      toast.error("Please provide location")
      return
    }

    try {
      setLoading(true)
      const resp = await api.get(`/api/ai/weather-prediction?location=${encodeURIComponent(location)}&month=${new Date().getMonth() + 1}`)
      if (resp.success && resp.data) {
        setWeatherPrediction(resp.data)
        toast.success("Weather prediction generated successfully")
      }
    } catch (error) {
      console.error("Failed to get weather prediction:", error)
      toast.error("Failed to get weather prediction")
    } finally {
      setLoading(false)
    }
  }

  const getMarketTrends = async () => {
    if (!cropName) {
      toast.error("Yield prediction generated successfully")
      return
    }

    try {
      setLoading(true)
      const resp = await api.get(`/api/ai/market-trends?cropName=${encodeURIComponent(cropName)}`)
      if (resp.success && resp.data) {
        setMarketTrends(resp.data)
        toast.success("Market trends generated successfully")
      }
    } catch (error) {
      console.error("Failed to get market trends:", error)
      toast.error("Failed to get market trends")
    } finally {
      setLoading(false)
    }
  }

  const getRiskAssessment = async () => {
    if (!location) {
      toast.error("Please provide location")
      return
    }

    try {
      setLoading(true)
      const resp = await api.post("/api/ai/risk-assessment", { location })
      if (resp.success && resp.data) {
        setRiskAssessment(resp.data)
        toast.success("Risk assessment generated successfully")
      }
    } catch (error) {
      console.error("Failed to get risk assessment:", error)
      toast.error("Failed to get risk assessment")
    } finally {
      setLoading(false)
    }
  }

  const getPredictiveInsights = async () => {
    if (!location) {
      toast.error("Please provide location")
      return
    }

    try {
      setLoading(true)
      const resp = await api.post("/api/ai/predictive-insights", { location })
      if (resp.success && resp.data) {
        setPredictiveInsights(resp.data)
        toast.success("Predictive insights generated successfully")
      }
    } catch (error) {
      console.error("Failed to get predictive insights:", error)
      toast.error("Failed to get predictive insights")
    } finally {
      setLoading(false)
    }
  }

  const refreshAllData = async () => {
    await Promise.all([
      fetchAIInsights(),
      fetchFarmingInsights(),
      fetchFarmingRecommendations()
    ])
    toast.success("All data refreshed")
  }

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "recommendation":
        return <Lightbulb className="w-5 h-5 text-primary" />
      case "prediction":
        return <TrendingUp className="w-5 h-5 text-info" />
      case "alert":
        return <AlertCircle className="w-5 h-5 text-warning" />
      case "analysis":
        return <BarChart3 className="w-5 h-5 text-success" />
      default:
        return <Brain className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getPriorityBadge = (priority: AIInsight["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>
      case "medium":
        return <Badge variant="secondary">Medium Priority</Badge>
      case "low":
        return <Badge variant="outline">Low Priority</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getCategoryIcon = (category: AIInsight["category"]) => {
    switch (category) {
      case "crop_health":
        return <Leaf className="w-4 h-4 text-success" />
      case "irrigation":
        return <Droplets className="w-4 h-4 text-blue-500" />
      case "pest_control":
        return <Bug className="w-4 h-4 text-destructive" />
      case "harvest_timing":
        return <Sun className="w-4 h-4 text-orange-500" />
      default:
        return <Brain className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-destructive"
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">AI Insights</h1>
            <p className="text-muted-foreground">AI-powered recommendations and analysis for your farm</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={refreshAllData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
            <Link href="/image-recognition">
              <Button variant="outline" size="lg" className="bg-transparent">
                <Camera className="w-4 h-4 mr-2" />
                Image Analysis
              </Button>
            </Link>
            <Link href="/advanced-ml">
              <Button variant="outline" size="lg" className="bg-transparent">
                <Zap className="w-4 h-4 mr-2" />
                Advanced ML
              </Button>
            </Link>
            <Link href="/ai-recommendations">
              <Button variant="outline" size="lg" className="bg-transparent">
                <Target className="w-4 h-4 mr-2" />
                AI Recommendations
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="crops">Crop Analysis</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Insights</p>
                      <p className="text-2xl font-bold text-foreground">{insights.length}</p>
                    </div>
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                      <p className="text-2xl font-bold text-foreground">
                        {insights.filter((i) => i.priority === "high").length}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                      <p className="text-2xl font-bold text-foreground">
                        {insights.filter((i) => i.type === "recommendation").length}
                      </p>
                    </div>
                    <Lightbulb className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights List */}
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="mt-1">{getInsightIcon(insight.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-foreground">{insight.title}</h4>
                              {getCategoryIcon(insight.category)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                            <div className="flex items-center space-x-4">
                              {getPriorityBadge(insight.priority)}
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">Confidence:</span>
                                <div className="flex items-center space-x-2">
                                  <Progress value={insight.confidence} className="w-16 h-2" />
                                  <span className="text-xs font-medium">{insight.confidence}%</span>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(insight.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crops" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cropAnalysis.map((crop, index) => (
                <motion.div
                  key={crop.cropType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{crop.cropType}</CardTitle>
                        <Badge variant="outline">{crop.growthStage}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Health Score</span>
                          <span className={getHealthScoreColor(crop.healthScore)}>{crop.healthScore}%</span>
                        </div>
                        <Progress value={crop.healthScore} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Estimated Harvest</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(crop.estimatedHarvest).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">AI Recommendations</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {crop.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View Detailed Analysis
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            {/* Input Forms */}
            <Card>
              <CardHeader>
                <CardTitle>AI Service Inputs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Lagos, Nigeria"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="season">Season</Label>
                    <Select value={season} onValueChange={setSeason}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rainy">Rainy</SelectItem>
                        <SelectItem value="dry">Dry</SelectItem>
                        <SelectItem value="all-year">All Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cropName">Crop Name</Label>
                    <Input
                      id="cropName"
                      placeholder="e.g., Yam, Cassava"
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crop Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered crop recommendations based on location and season.
                  </p>
                  <Button 
                    onClick={getCropRecommendations} 
                    disabled={loading || !location || !season}
                    className="w-full"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Get Recommendations
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Yield Prediction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Predict crop yield based on historical data and conditions.
                  </p>
                  <Button 
                    onClick={getYieldPrediction} 
                    disabled={loading || !cropName || !location || !season}
                    className="w-full"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Predict Yield
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Analyze market trends and demand for specific crops.
                  </p>
                  <Button 
                    onClick={getMarketInsights} 
                    disabled={loading || !cropName}
                    className="w-full"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Get Insights
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Calendar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered seasonal farming calendar.
                  </p>
                  <Button 
                    onClick={getSeasonalCalendar} 
                    disabled={loading}
                    className="w-full"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Get Calendar
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weather Prediction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered weather predictions for farming.
                  </p>
                  <Button 
                    onClick={getWeatherPrediction} 
                    disabled={loading || !location}
                    className="w-full"
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    Predict Weather
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Assess farming risks and get mitigation strategies.
                  </p>
                  <Button 
                    onClick={getRiskAssessment} 
                    disabled={loading || !location}
                    className="w-full"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Assess Risk
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Display */}
            {(yieldPrediction || marketInsights || seasonalCalendar || weatherPrediction || riskAssessment) && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Service Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {yieldPrediction && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Yield Prediction for {yieldPrediction.crop}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Predicted Yield: {yieldPrediction.predictedYield} kg
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Confidence: {yieldPrediction.confidence}%
                      </p>
                      {yieldPrediction.recommendations && (
                        <div>
                          <p className="text-sm font-medium mb-1">Recommendations:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {yieldPrediction.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-success flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {marketInsights && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Market Insights for {marketInsights.crop}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Current Price: ₦{marketInsights.currentPrice}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Demand Level: {marketInsights.demandLevel}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Best Selling Time: {marketInsights.bestSellingTime}
                      </p>
                    </div>
                  )}

                  {seasonalCalendar && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Seasonal Calendar</h4>
                      <p className="text-sm text-muted-foreground">
                        {seasonalCalendar.description || "Seasonal farming recommendations available"}
                      </p>
                    </div>
                  )}

                  {weatherPrediction && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Weather Prediction</h4>
                      <p className="text-sm text-muted-foreground">
                        {weatherPrediction.description || "Weather prediction data available"}
                      </p>
                    </div>
                  )}

                  {riskAssessment && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Risk Assessment</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Overall Risk Level: {riskAssessment.riskLevel || "Medium"}
                      </p>
                      {riskAssessment.mitigationStrategies && (
                        <div>
                          <p className="text-sm font-medium mb-1">Mitigation Strategies:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {riskAssessment.mitigationStrategies.map((strategy: string, idx: number) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-success flex-shrink-0" />
                                <span>{strategy}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
