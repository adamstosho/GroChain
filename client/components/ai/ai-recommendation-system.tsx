"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/Progress"
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Calendar, 
  MapPin, 
  Leaf, 
  Droplets, 
  Sun, 
  Thermometer,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Zap,
  Clock,
  DollarSign,
  Users,
  Globe
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Recommendation {
  id: string
  type: 'crop_selection' | 'irrigation' | 'fertilizer' | 'pest_control' | 'harvest_timing' | 'market_timing'
  title: string
  description: string
  confidence: number
  priority: 'high' | 'medium' | 'low'
  impact: 'high' | 'medium' | 'low'
  implementationTime: string
  estimatedCost: number
  expectedBenefit: number
  category: string
  createdAt: string
}

interface CropRecommendation {
  cropName: string
  variety: string
  plantingSeason: string
  expectedYield: number
  marketPrice: number
  confidence: number
  reasons: string[]
  risks: string[]
  alternatives: string[]
}

interface MarketInsight {
  cropName: string
  currentPrice: number
  priceTrend: 'rising' | 'falling' | 'stable'
  demandLevel: 'high' | 'medium' | 'low'
  supplyLevel: 'high' | 'medium' | 'low'
  bestSellingTime: string
  marketSize: number
  competition: 'low' | 'medium' | 'high'
  exportPotential: boolean
}

interface WeatherRecommendation {
  location: string
  forecast: string
  recommendations: string[]
  risks: string[]
  preparationSteps: string[]
  timeline: string
}

export function AIRecommendationSystem() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([])
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([])
  const [weatherRecommendations, setWeatherRecommendations] = useState<WeatherRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Form states
  const [location, setLocation] = useState("")
  const [soilType, setSoilType] = useState("")
  const [climate, setClimate] = useState("")
  const [farmSize, setFarmSize] = useState("")
  const [experience, setExperience] = useState("")
  const [budget, setBudget] = useState("")
  const [cropInterest, setCropInterest] = useState("")

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      
      // TODO: Replace with actual API calls when backend endpoints are implemented
      // const [recsRes, cropsRes, marketRes, weatherRes] = await Promise.all([
      //   api.get("/api/ai/recommendations"),
      //   api.get("/api/ai/crop-recommendations"),
      //   api.get("/api/ai/market-insights"),
      //   api.get("/api/ai/weather-recommendations")
      // ])

      // For now, use mock data
      const mockRecommendations = [
        {
          id: "rec_001",
          type: "crop_selection",
          title: "Optimal Crop Selection",
          description: "Based on your soil type and climate, consider planting cassava and yam this season",
          confidence: 92,
          priority: "high",
          impact: "high",
          category: "crop_planning"
        }
      ]
      
      const mockCropRecommendations = [
        {
          id: "crop_001",
          name: "Cassava",
          confidence: 95,
          reasons: ["Drought resistant", "High yield potential", "Good market demand"],
          season: "Year-round",
          expectedYield: "25-30 tons/ha"
        }
      ]
      
      const mockMarketInsights = [
        {
          id: "market_001",
          crop: "Tomatoes",
          price: 450,
          trend: "rising",
          demand: "high",
          supply: "moderate",
          recommendation: "Consider increasing production"
        }
      ]
      
      const mockWeatherRecommendations = [
        {
          id: "weather_001",
          location: "Lagos",
          forecast: "Moderate rainfall expected",
          recommendation: "Prepare for planting season",
          risk: "low"
        }
      ]

      setRecommendations(mockRecommendations)
      setCropRecommendations(mockCropRecommendations)
      setMarketInsights(mockMarketInsights)
      setWeatherRecommendations(mockWeatherRecommendations)
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
      toast.error("Failed to load AI recommendations")
    } finally {
      setLoading(false)
    }
  }

  const generatePersonalizedRecommendations = async () => {
    if (!location || !soilType || !climate || !farmSize) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      
      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await api.post("/api/ai/personalized-recommendations", {
      //   location,
      //   soilType,
      //   climate,
      //   farmSize: parseFloat(farmSize),
      //   experience,
      //   budget: parseFloat(budget),
      //   cropInterest
      // })

      // For now, simulate successful generation
      toast.success("Personalized recommendations generated successfully!")
      
      // Generate mock personalized recommendations
      const personalizedRecs = [
        {
          id: "personal_001",
          type: "crop_selection",
          title: "Personalized Crop Plan",
          description: `Based on your ${farmSize} hectare farm in ${location} with ${soilType} soil and ${climate} climate`,
          confidence: 88,
          priority: "high",
          impact: "high",
          category: "personalized"
        }
      ]
      
      setRecommendations(prev => [...personalizedRecs, ...prev])
    } catch (error) {
      console.error("Failed to generate recommendations:", error)
      toast.error("Failed to generate personalized recommendations")
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600"
      case "medium": return "text-yellow-600"
      case "low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-blue-100 text-blue-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriceTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising": return <TrendingUp className="w-4 h-4 text-green-600" />
      case "falling": return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />
      case "stable": return <BarChart3 className="w-4 h-4 text-blue-600" />
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">AI Recommendation System</h2>
          <p className="text-muted-foreground">
            Get personalized AI-powered recommendations for your farming operations
          </p>
        </div>
        <Button onClick={fetchRecommendations} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Personalized Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Lagos, Nigeria"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="soilType">Soil Type *</Label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loamy">Loamy</SelectItem>
                  <SelectItem value="clay">Clay</SelectItem>
                  <SelectItem value="sandy">Sandy</SelectItem>
                  <SelectItem value="silt">Silt</SelectItem>
                  <SelectItem value="peat">Peat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="climate">Climate *</Label>
              <Select value={climate} onValueChange={setClimate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select climate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tropical">Tropical</SelectItem>
                  <SelectItem value="subtropical">Subtropical</SelectItem>
                  <SelectItem value="temperate">Temperate</SelectItem>
                  <SelectItem value="arid">Arid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="farmSize">Farm Size (acres) *</Label>
              <Input
                id="farmSize"
                type="number"
                placeholder="e.g., 10"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Farming Experience</Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (₦)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 500000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="cropInterest">Crop of Interest</Label>
            <Input
              id="cropInterest"
              placeholder="e.g., Tomatoes, Yam, Cassava"
              value={cropInterest}
              onChange={(e) => setCropInterest(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={generatePersonalizedRecommendations} 
            disabled={loading || !location || !soilType || !climate || !farmSize}
            className="mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium ${
              activeTab === "overview" 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("crops")}
            className={`px-4 py-2 font-medium ${
              activeTab === "crops" 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground"
            }`}
          >
            Crop Recommendations
          </button>
          <button
            onClick={() => setActiveTab("market")}
            className={`px-4 py-2 font-medium ${
              activeTab === "market" 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground"
            }`}
          >
            Market Insights
          </button>
          <button
            onClick={() => setActiveTab("weather")}
            className={`px-4 py-2 font-medium ${
              activeTab === "weather" 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground"
            }`}
          >
            Weather & Climate
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Recommendations</p>
                      <p className="text-2xl font-bold">{recommendations.length}</p>
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
                      <p className="text-2xl font-bold text-red-600">
                        {recommendations.filter(r => r.priority === 'high').length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">High Impact</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {recommendations.filter(r => r.impact === 'high').length}
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                      <p className="text-2xl font-bold text-green-600">
                        {recommendations.length > 0 
                          ? Math.round(recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length)
                          : 0}%
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.slice(0, 5).map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          <Badge className={getImpactColor(rec.impact)}>
                            {rec.impact} Impact
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                            {rec.priority} Priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Confidence: {rec.confidence}%</span>
                          <span>Implementation: {rec.implementationTime}</span>
                          <span>Cost: ₦{rec.estimatedCost.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Crop Recommendations Tab */}
        {activeTab === "crops" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cropRecommendations.map((crop, index) => (
                <motion.div
                  key={crop.cropName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{crop.cropName}</CardTitle>
                        <Badge variant="outline">{crop.variety}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Expected Yield</span>
                          <span className="font-medium">{crop.expectedYield} tons/ha</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Market Price</span>
                          <span className="font-medium">₦{crop.marketPrice.toLocaleString()}/kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Confidence</span>
                          <span className="font-medium">{crop.confidence}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Planting Season</p>
                        <p className="text-sm text-muted-foreground">{crop.plantingSeason}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Key Reasons</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {crop.reasons.slice(0, 3).map((reason, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        View Full Analysis
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Market Insights Tab */}
        {activeTab === "market" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketInsights.map((insight, index) => (
                <motion.div
                  key={insight.cropName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{insight.cropName}</CardTitle>
                        {getPriceTrendIcon(insight.priceTrend)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current Price</span>
                          <span className="font-medium">₦{insight.currentPrice.toLocaleString()}/kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Price Trend</span>
                          <Badge variant="outline" className="capitalize">
                            {insight.priceTrend}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Demand Level</span>
                          <Badge variant="outline" className="capitalize">
                            {insight.demandLevel}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Best Selling Time</p>
                        <p className="text-sm text-muted-foreground">{insight.bestSellingTime}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Market Analysis</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span>Market Size:</span>
                          <Badge variant="outline">₦{insight.marketSize.toLocaleString()}M</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>Competition:</span>
                          <Badge variant="outline" className="capitalize">{insight.competition}</Badge>
                        </div>
                        {insight.exportPotential && (
                          <Badge className="bg-green-100 text-green-800">
                            Export Potential
                          </Badge>
                        )}
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        View Market Report
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === "weather" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {weatherRecommendations.map((weather, index) => (
                <motion.div
                  key={weather.location}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{weather.location}</CardTitle>
                        <Badge variant="outline">{weather.timeline}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Weather Forecast</p>
                        <p className="text-sm text-muted-foreground">{weather.forecast}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recommendations</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {weather.recommendations.slice(0, 3).map((rec, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Preparation Steps</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {weather.preparationSteps.slice(0, 2).map((step, idx) => (
                            <li key={idx} className="flex items-start">
                              <Clock className="w-3 h-3 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        View Full Forecast
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
