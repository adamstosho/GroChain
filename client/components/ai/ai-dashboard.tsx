"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Progress } from "@/components/ui/Progress"
import { Brain, TrendingUp, Lightbulb, AlertCircle, Camera, BarChart3, Leaf, Droplets, Sun, Bug } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
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
  const [insights] = useState<AIInsight[]>(mockInsights)
  const [cropAnalysis] = useState<CropAnalysis[]>(mockCropAnalysis)
  const [activeTab, setActiveTab] = useState("insights")

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
    <DashboardLayout user={mockUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">AI Insights</h1>
            <p className="text-muted-foreground">AI-powered recommendations and analysis for your farm</p>
          </div>
          <div className="flex gap-2">
            <Link href="/image-recognition">
              <Button variant="outline" size="lg" className="bg-transparent">
                <Camera className="w-4 h-4 mr-2" />
                Image Analysis
              </Button>
            </Link>
            <Button size="lg">
              <Brain className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
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

          <TabsContent value="predictions">
            <Card>
              <CardHeader>
                <CardTitle>AI Predictions & Forecasts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced AI predictions and forecasting models will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
