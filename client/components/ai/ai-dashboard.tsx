"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Loader2,
  Play,
  Pause,
  Settings,
  Download,
  Upload,
  RefreshCw
} from "lucide-react"

interface AIModel {
  id: string
  name: string
  type: 'crop_analysis' | 'yield_prediction' | 'disease_detection' | 'weather_forecast'
  status: 'active' | 'training' | 'inactive' | 'error'
  accuracy: number
  lastTraining: string
  nextTraining: string
  performance: number
  version: string
}

interface Prediction {
  id: string
  model: string
  input: string
  output: string
  confidence: number
  timestamp: string
  status: 'success' | 'processing' | 'failed'
}

const AIDashboard = () => {
  const [models, setModels] = useState<AIModel[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchAIData()
  }, [])

  const fetchAIData = async () => {
    try {
      setLoading(true)
      // Mock data for now
      const mockModels: AIModel[] = [
        {
          id: "1",
          name: "Crop Health Analyzer",
          type: "crop_analysis",
          status: "active",
          accuracy: 94.2,
          lastTraining: "2025-01-14T10:00:00Z",
          nextTraining: "2025-01-21T10:00:00Z",
          performance: 98.5,
          version: "2.1.0"
        },
        {
          id: "2",
          name: "Yield Predictor Pro",
          type: "yield_prediction",
          status: "training",
          accuracy: 89.7,
          lastTraining: "2025-01-15T08:00:00Z",
          nextTraining: "2025-01-22T08:00:00Z",
          performance: 92.3,
          version: "1.8.2"
        },
        {
          id: "3",
          name: "Disease Detection ML",
          type: "disease_detection",
          status: "active",
          accuracy: 96.8,
          lastTraining: "2025-01-13T14:00:00Z",
          nextTraining: "2025-01-20T14:00:00Z",
          performance: 97.1,
          version: "3.0.1"
        }
      ]

      const mockPredictions: Prediction[] = [
        {
          id: "1",
          model: "Crop Health Analyzer",
          input: "Tomato leaf image",
          output: "Healthy - No disease detected",
          confidence: 98.5,
          timestamp: "2025-01-15T10:30:00Z",
          status: "success"
        },
        {
          id: "2",
          model: "Yield Predictor Pro",
          input: "Rice field data",
          output: "Expected yield: 2.8 tons/hectare",
          confidence: 89.2,
          timestamp: "2025-01-15T09:15:00Z",
          status: "success"
        }
      ]

      setModels(mockModels)
      setPredictions(mockPredictions)
    } catch (error) {
      console.error("Failed to fetch AI data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'crop_analysis':
        return <Activity className="w-5 h-5" />
      case 'yield_prediction':
        return <TrendingUp className="w-5 h-5" />
      case 'disease_detection':
        return <Target className="w-5 h-5" />
      case 'weather_forecast':
        return <Zap className="w-5 h-5" />
      default:
        return <Brain className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'training':
        return 'bg-blue-100 text-blue-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPredictionStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
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
          <h1 className="text-2xl font-heading font-bold text-foreground">AI & ML Dashboard</h1>
          <p className="text-muted-foreground">Monitor AI models, predictions, and system performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAIData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Deploy Model
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Models</p>
                <p className="text-2xl font-bold text-foreground">
                  {models.filter(m => m.status === 'active').length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Accuracy</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Predictions</p>
                <p className="text-2xl font-bold text-foreground">
                  {predictions.filter(p => 
                    new Date(p.timestamp).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold text-foreground">98%</p>
                <p className="text-xs text-muted-foreground">All models operational</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => (
              <Card key={model.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{model.name}</CardTitle>
                    <Badge className={getStatusColor(model.status)}>
                      {model.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getModelIcon(model.type)}
                      <span className="text-sm text-muted-foreground">{model.type.replace('_', ' ')}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Accuracy</p>
                        <p className="font-semibold">{model.accuracy}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Performance</p>
                        <p className="font-semibold">{model.performance}%</p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last trained: {new Date(model.lastTraining).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        v{model.version}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Play className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed model management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((prediction) => (
                  <div key={prediction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{prediction.model}</p>
                      <p className="text-sm text-muted-foreground">{prediction.input}</p>
                      <p className="text-sm">{prediction.output}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getPredictionStatusColor(prediction.status)}>
                        {prediction.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {prediction.confidence}% confidence
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(prediction.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { AIDashboard }
