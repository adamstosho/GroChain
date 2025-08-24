"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Cpu, 
  Database, 
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

interface MLModel {
  id: string
  name: string
  type: 'deep_learning' | 'ensemble' | 'neural_network' | 'reinforcement_learning'
  architecture: string
  status: 'training' | 'deployed' | 'evaluating' | 'error'
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  trainingProgress: number
  lastUpdated: string
  version: string
  gpuUsage: number
  memoryUsage: number
}

interface TrainingJob {
  id: string
  modelName: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  startTime: string
  estimatedCompletion: string
  currentEpoch: number
  totalEpochs: number
  loss: number
  validationLoss: number
}

const AdvancedMLDashboard = () => {
  const [models, setModels] = useState<MLModel[]>([])
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchMLData()
  }, [])

  const fetchMLData = async () => {
    try {
      setLoading(true)
      // Mock data for now
      const mockModels: MLModel[] = [
        {
          id: "1",
          name: "Crop Disease CNN",
          type: "deep_learning",
          architecture: "ResNet-50",
          status: "deployed",
          accuracy: 96.8,
          precision: 95.2,
          recall: 97.1,
          f1Score: 96.1,
          trainingProgress: 100,
          lastUpdated: "2025-01-15T10:00:00Z",
          version: "3.2.1",
          gpuUsage: 45,
          memoryUsage: 67
        },
        {
          id: "2",
          name: "Yield Prediction XGBoost",
          type: "ensemble",
          architecture: "XGBoost + Random Forest",
          status: "training",
          accuracy: 89.3,
          precision: 87.6,
          recall: 90.1,
          f1Score: 88.8,
          trainingProgress: 67,
          lastUpdated: "2025-01-15T09:30:00Z",
          version: "2.0.0",
          gpuUsage: 78,
          memoryUsage: 89
        },
        {
          id: "3",
          name: "Soil Analysis Neural Net",
          type: "neural_network",
          architecture: "Multi-layer Perceptron",
          status: "evaluating",
          accuracy: 92.4,
          precision: 91.8,
          recall: 93.2,
          f1Score: 92.5,
          trainingProgress: 100,
          lastUpdated: "2025-01-15T08:45:00Z",
          version: "1.5.3",
          gpuUsage: 23,
          memoryUsage: 34
        }
      ]

      const mockTrainingJobs: TrainingJob[] = [
        {
          id: "1",
          modelName: "Yield Prediction XGBoost",
          status: "running",
          progress: 67,
          startTime: "2025-01-15T08:00:00Z",
          estimatedCompletion: "2025-01-15T16:00:00Z",
          currentEpoch: 134,
          totalEpochs: 200,
          loss: 0.234,
          validationLoss: 0.289
        }
      ]

      setModels(mockModels)
      setTrainingJobs(mockTrainingJobs)
    } catch (error) {
      console.error("Failed to fetch ML data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'deep_learning':
        return <Brain className="w-5 h-5" />
      case 'ensemble':
        return <Cpu className="w-5 h-5" />
      case 'neural_network':
        return <Database className="w-5 h-5" />
      case 'reinforcement_learning':
        return <Zap className="w-5 h-5" />
      default:
        return <Brain className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-100 text-green-800'
      case 'training':
        return 'bg-blue-100 text-blue-800'
      case 'evaluating':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'queued':
        return 'bg-yellow-100 text-yellow-800'
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
          <h1 className="text-2xl font-heading font-bold text-foreground">Advanced ML Dashboard</h1>
          <p className="text-muted-foreground">Monitor deep learning models, training jobs, and system performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMLData} disabled={loading}>
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
                <p className="text-sm font-medium text-muted-foreground">Total Models</p>
                <p className="text-2xl font-bold text-foreground">{models.length}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deployed</p>
                <p className="text-2xl font-bold text-foreground">
                  {models.filter(m => m.status === 'deployed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Training</p>
                <p className="text-2xl font-bold text-foreground">
                  {models.filter(m => m.status === 'training').length}
                </p>
              </div>
              <Loader2 className="h-8 w-8 text-blue-600" />
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
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="training">Training Jobs</TabsTrigger>
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
                    
                    <div className="text-xs text-muted-foreground">
                      <p>Architecture: {model.architecture}</p>
                      <p>Version: {model.version}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Accuracy</p>
                        <p className="font-semibold">{model.accuracy}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">F1 Score</p>
                        <p className="font-semibold">{model.f1Score}</p>
                      </div>
                    </div>

                    {model.status === 'training' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Training Progress</span>
                          <span>{model.trainingProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${model.trainingProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        GPU: {model.gpuUsage}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        RAM: {model.memoryUsage}%
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(model.lastUpdated).toLocaleTimeString()}
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

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Training Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingJobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{job.modelName}</h3>
                      <Badge className={getJobStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Epoch</p>
                          <p className="font-medium">{job.currentEpoch} / {job.totalEpochs}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Loss</p>
                          <p className="font-medium">{job.loss.toFixed(4)}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <p>Started: {new Date(job.startTime).toLocaleString()}</p>
                        <p>ETA: {new Date(job.estimatedCompletion).toLocaleString()}</p>
                      </div>
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

export default AdvancedMLDashboard
