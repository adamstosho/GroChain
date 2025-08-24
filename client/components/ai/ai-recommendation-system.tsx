"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  Settings
} from "lucide-react"

interface Recommendation {
  id: string
  type: 'crop_selection' | 'fertilizer' | 'irrigation' | 'pest_control' | 'harvest_timing'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  status: 'implemented' | 'pending' | 'rejected'
  createdAt: string
  farmerId: string
  farmerName: string
  estimatedBenefit: string
}

interface RecommendationStats {
  totalRecommendations: number
  implementedCount: number
  pendingCount: number
  averageConfidence: number
  totalBenefit: string
}

const AIRecommendationSystem = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [stats, setStats] = useState<RecommendationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      // Mock data for now
      const mockRecommendations: Recommendation[] = [
        {
          id: "1",
          type: "crop_selection",
          title: "Switch to Drought-Resistant Varieties",
          description: "Based on weather patterns, consider planting drought-resistant rice varieties for better yield stability.",
          confidence: 94.2,
          impact: "high",
          status: "implemented",
          createdAt: "2025-01-15T10:00:00Z",
          farmerId: "farmer1",
          farmerName: "Adunni Adebayo",
          estimatedBenefit: "25% yield increase"
        },
        {
          id: "2",
          type: "fertilizer",
          title: "Optimize NPK Application",
          description: "Soil analysis shows optimal NPK ratio should be 15:15:15 for current crop stage.",
          confidence: 89.7,
          impact: "medium",
          status: "pending",
          createdAt: "2025-01-14T14:30:00Z",
          farmerId: "farmer2",
          farmerName: "Ibrahim Okafor",
          estimatedBenefit: "15% cost reduction"
        },
        {
          id: "3",
          type: "irrigation",
          title: "Implement Drip Irrigation",
          description: "Water usage analysis suggests drip irrigation could reduce water consumption by 40%.",
          confidence: 91.3,
          impact: "high",
          status: "pending",
          createdAt: "2025-01-13T09:15:00Z",
          farmerId: "farmer3",
          farmerName: "Choma Ezeh",
          estimatedBenefit: "40% water savings"
        }
      ]

      const mockStats: RecommendationStats = {
        totalRecommendations: mockRecommendations.length,
        implementedCount: mockRecommendations.filter(r => r.status === 'implemented').length,
        pendingCount: mockRecommendations.filter(r => r.status === 'pending').length,
        averageConfidence: Math.round(mockRecommendations.reduce((sum, r) => sum + r.confidence, 0) / mockRecommendations.length),
        totalBenefit: "₦2.5M estimated savings"
      }

      setRecommendations(mockRecommendations)
      setStats(mockStats)
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crop_selection':
        return <Target className="w-5 h-5" />
      case 'fertilizer':
        return <TrendingUp className="w-5 h-5" />
      case 'irrigation':
        return <Lightbulb className="w-5 h-5" />
      case 'pest_control':
        return <AlertTriangle className="w-5 h-5" />
      case 'harvest_timing':
        return <Clock className="w-5 h-5" />
      default:
        return <Brain className="w-5 h-5" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">AI Recommendation System</h1>
          <p className="text-muted-foreground">Smart farming recommendations powered by AI and data analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRecommendations} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Generate New
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Recommendations</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalRecommendations}</p>
                </div>
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Implemented</p>
                  <p className="text-2xl font-bold text-foreground">{stats.implementedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                  <p className="text-2xl font-bold text-foreground">{stats.averageConfidence}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">All Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{recommendation.title}</CardTitle>
                    <Badge className={getStatusColor(recommendation.status)}>
                      {recommendation.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(recommendation.type)}
                      <span className="text-sm text-muted-foreground">{recommendation.type.replace('_', ' ')}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{recommendation.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <p className="font-semibold">{recommendation.confidence}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Impact</p>
                        <Badge className={getImpactColor(recommendation.impact)}>
                          {recommendation.impact}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(recommendation.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {recommendation.estimatedBenefit}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Farmer:</p>
                      <p className="text-sm font-medium">{recommendation.farmerName}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed recommendation management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics and reporting features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { AIRecommendationSystem }
