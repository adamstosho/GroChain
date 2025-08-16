"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  Settings,
  Download,
  RefreshCw,
  Target,
  BarChart3,
  Activity,
  Cpu,
  Database
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface SensorMaintenance {
  sensorId: string
  sensorName: string
  maintenanceSchedule: {
    nextMaintenance: string
    maintenanceType: string
    urgency: "low" | "medium" | "high"
  }
  healthScore: number
  recommendations: string[]
}

interface SensorAnomaly {
  sensorId: string
  sensorName: string
  anomalies: Array<{
    timestamp: string
    type: "drift" | "spike" | "dropout" | "noise"
    severity: "low" | "medium" | "high"
    description: string
    confidence: number
  }>
}

interface OptimizationResult {
  type: "irrigation" | "fertilizer" | "harvest"
  recommendations: Array<{
    field: string
    action: string
    timing: string
    expectedBenefit: string
    confidence: number
  }>
  potentialSavings: {
    water: number
    fertilizer: number
    time: number
    cost: number
  }
}

interface MLModelPerformance {
  modelName: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  lastUpdated: string
  dataPoints: number
  status: "active" | "training" | "deprecated"
}

interface EfficiencyScore {
  overall: number
  irrigation: number
  fertilizer: number
  harvest: number
  trends: Array<{
    date: string
    score: number
  }>
}

export function AdvancedMLDashboard() {
  const { user } = useAuth()
  const [sensorMaintenance, setSensorMaintenance] = useState<SensorMaintenance[]>([])
  const [sensorAnomalies, setSensorAnomalies] = useState<SensorAnomaly[]>([])
  const [optimization, setOptimization] = useState<OptimizationResult[]>([])
  const [modelPerformance, setModelPerformance] = useState<MLModelPerformance[]>([])
  const [efficiencyScore, setEfficiencyScore] = useState<EfficiencyScore | null>(null)
  const [sensorHealth, setSensorHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSensor, setSelectedSensor] = useState<string>("")
  const [optimizationType, setOptimizationType] = useState<string>("irrigation")

  useEffect(() => {
    fetchAdvancedMLData()
  }, [selectedSensor])

  const fetchAdvancedMLData = async () => {
    setLoading(true)
    try {
      // Fetch sensor health insights
      const healthResponse = await apiClient.getSensorHealthInsights()
      if (healthResponse.success) {
        setSensorHealth(healthResponse.data)
      }

      // Fetch efficiency score
      const efficiencyResponse = await apiClient.getEfficiencyScore()
      if (efficiencyResponse.success) {
        setEfficiencyScore(efficiencyResponse.data)
      } else {
        setEfficiencyScore(mockEfficiencyScore)
      }

      // Fetch ML model performance
      const modelsResponse = await apiClient.getMLModelsPerformance()
      if (modelsResponse.success) {
        setModelPerformance(modelsResponse.data?.models || mockModels)
      } else {
        setModelPerformance(mockModels)
      }

      // Fetch optimization recommendations
      const irrigationOpt = await apiClient.getIrrigationOptimization()
      const fertilizerOpt = await apiClient.getFertilizerOptimization()
      const harvestOpt = await apiClient.getHarvestOptimization()

      const optimizations = []
      if (irrigationOpt.success) optimizations.push(irrigationOpt.data)
      if (fertilizerOpt.success) optimizations.push(fertilizerOpt.data)
      if (harvestOpt.success) optimizations.push(harvestOpt.data)
      
      if (optimizations.length === 0) {
        setOptimization(mockOptimizations)
      } else {
        setOptimization(optimizations)
      }

      // Fetch sensor-specific data if sensor selected
      if (selectedSensor) {
        const maintenanceResponse = await apiClient.getSensorMaintenance(selectedSensor)
        const anomalyResponse = await apiClient.getSensorAnomalies(selectedSensor)
        
        if (maintenanceResponse.success) {
          setSensorMaintenance([maintenanceResponse.data])
        }
        if (anomalyResponse.success) {
          setSensorAnomalies([anomalyResponse.data])
        }
      } else {
        // Mock data for demo
        setSensorMaintenance(mockSensorMaintenance)
        setSensorAnomalies(mockSensorAnomalies)
      }

    } catch (error) {
      console.error("Error fetching advanced ML data:", error)
      // Use mock data
      setEfficiencyScore(mockEfficiencyScore)
      setModelPerformance(mockModels)
      setOptimization(mockOptimizations)
      setSensorMaintenance(mockSensorMaintenance)
      setSensorAnomalies(mockSensorAnomalies)
    } finally {
      setLoading(false)
    }
  }

  const runOptimization = async (type: string) => {
    try {
      let response
      switch (type) {
        case "irrigation":
          response = await apiClient.getIrrigationOptimization()
          break
        case "fertilizer":
          response = await apiClient.getFertilizerOptimization()
          break
        case "harvest":
          response = await apiClient.getHarvestOptimization()
          break
        default:
          return
      }

      if (response.success) {
        // Update optimization results
        fetchAdvancedMLData()
      }
    } catch (error) {
      console.error("Error running optimization:", error)
    }
  }

  const generateOptimizationReport = async () => {
    try {
      const response = await apiClient.getOptimizationReport()
      if (response.success) {
        // Trigger download or display report
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `optimization-report-${new Date().toISOString().split('T')[0]}.json`
        a.click()
      }
    } catch (error) {
      console.error("Error generating report:", error)
    }
  }

  // Mock data
  const mockEfficiencyScore: EfficiencyScore = {
    overall: 87,
    irrigation: 92,
    fertilizer: 85,
    harvest: 84,
    trends: [
      { date: "2025-01-10", score: 85 },
      { date: "2025-01-11", score: 86 },
      { date: "2025-01-12", score: 87 },
      { date: "2025-01-13", score: 88 },
      { date: "2025-01-14", score: 87 },
    ]
  }

  const mockModels: MLModelPerformance[] = [
    {
      modelName: "Crop Yield Predictor",
      accuracy: 94.2,
      precision: 92.8,
      recall: 95.1,
      f1Score: 93.9,
      lastUpdated: "2025-01-15T10:30:00Z",
      dataPoints: 15420,
      status: "active"
    },
    {
      modelName: "Irrigation Optimizer",
      accuracy: 89.7,
      precision: 91.2,
      recall: 88.3,
      f1Score: 89.7,
      lastUpdated: "2025-01-14T14:20:00Z",
      dataPoints: 8930,
      status: "active"
    },
    {
      modelName: "Pest Detection",
      accuracy: 96.5,
      precision: 97.1,
      recall: 95.8,
      f1Score: 96.4,
      lastUpdated: "2025-01-13T09:15:00Z",
      dataPoints: 12340,
      status: "training"
    }
  ]

  const mockOptimizations: OptimizationResult[] = [
    {
      type: "irrigation",
      recommendations: [
        {
          field: "Field A - North",
          action: "Reduce irrigation frequency",
          timing: "Next 5 days",
          expectedBenefit: "Save 30% water",
          confidence: 92
        },
        {
          field: "Field B - South",
          action: "Increase irrigation duration",
          timing: "Today evening",
          expectedBenefit: "Improve crop health",
          confidence: 88
        }
      ],
      potentialSavings: { water: 30, fertilizer: 0, time: 15, cost: 1200 }
    },
    {
      type: "fertilizer",
      recommendations: [
        {
          field: "Field C - East",
          action: "Apply nitrogen fertilizer",
          timing: "Tomorrow morning",
          expectedBenefit: "Increase yield by 15%",
          confidence: 85
        }
      ],
      potentialSavings: { water: 0, fertilizer: 20, time: 10, cost: 800 }
    }
  ]

  const mockSensorMaintenance: SensorMaintenance[] = [
    {
      sensorId: "sensor_001",
      sensorName: "Soil Moisture A1",
      maintenanceSchedule: {
        nextMaintenance: "2025-01-20",
        maintenanceType: "Calibration",
        urgency: "medium"
      },
      healthScore: 85,
      recommendations: ["Clean sensor housing", "Check battery level", "Calibrate readings"]
    }
  ]

  const mockSensorAnomalies: SensorAnomaly[] = [
    {
      sensorId: "sensor_002",
      sensorName: "Temperature B2",
      anomalies: [
        {
          timestamp: "2025-01-16T14:30:00Z",
          type: "spike",
          severity: "medium",
          description: "Unexpected temperature spike detected",
          confidence: 78
        }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500"
      case "training": return "bg-blue-500"
      case "deprecated": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-500"
      case "medium": return "bg-yellow-500"
      case "low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Brain className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading advanced ML analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold">Advanced ML Services</h1>
            <p className="text-muted-foreground">
              AI-powered optimization and predictive analytics for smart farming
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={generateOptimizationReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={fetchAdvancedMLData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Efficiency Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Efficiency</p>
                    <p className="text-3xl font-bold">{efficiencyScore?.overall}%</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
                <Progress value={efficiencyScore?.overall} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Irrigation Efficiency</p>
                    <p className="text-3xl font-bold">{efficiencyScore?.irrigation}%</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
                <Progress value={efficiencyScore?.irrigation} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Fertilizer Efficiency</p>
                    <p className="text-3xl font-bold">{efficiencyScore?.fertilizer}%</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={efficiencyScore?.fertilizer} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Harvest Efficiency</p>
                    <p className="text-3xl font-bold">{efficiencyScore?.harvest}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
                <Progress value={efficiencyScore?.harvest} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="optimization" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
              <TabsTrigger value="sensors">Sensor Analytics</TabsTrigger>
              <TabsTrigger value="models">ML Models</TabsTrigger>
              <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="optimization" className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <Select value={optimizationType} onValueChange={setOptimizationType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="irrigation">Irrigation</SelectItem>
                    <SelectItem value="fertilizer">Fertilizer</SelectItem>
                    <SelectItem value="harvest">Harvest</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => runOptimization(optimizationType)}>
                  <Brain className="h-4 w-4 mr-2" />
                  Run Optimization
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {optimization.map((opt, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>{opt.type.charAt(0).toUpperCase() + opt.type.slice(1)} Optimization</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="font-bold text-blue-600">{opt.potentialSavings.water}%</p>
                          <p className="text-xs">Water Savings</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="font-bold text-green-600">₦{opt.potentialSavings.cost}</p>
                          <p className="text-xs">Cost Savings</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="font-semibold text-sm">Recommendations:</p>
                        {opt.recommendations.map((rec, idx) => (
                          <div key={idx} className="border-l-4 border-blue-500 pl-3 py-2">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{rec.field}</p>
                              <Badge variant="outline">{rec.confidence}% confidence</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{rec.action}</p>
                            <p className="text-xs text-blue-600">{rec.timing} • {rec.expectedBenefit}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sensors" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sensor Maintenance Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sensorMaintenance.map((sensor) => (
                        <div key={sensor.sensorId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">{sensor.sensorName}</p>
                            <Badge className={getUrgencyColor(sensor.maintenanceSchedule.urgency)}>
                              {sensor.maintenanceSchedule.urgency}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><strong>Next Maintenance:</strong> {sensor.maintenanceSchedule.nextMaintenance}</p>
                            <p><strong>Type:</strong> {sensor.maintenanceSchedule.maintenanceType}</p>
                            <p><strong>Health Score:</strong> {sensor.healthScore}%</p>
                            <Progress value={sensor.healthScore} className="mt-2" />
                          </div>
                          <div className="mt-3">
                            <p className="font-semibold text-xs">Recommendations:</p>
                            <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                              {sensor.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-muted-foreground">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Anomaly Detection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sensorAnomalies.map((sensor) => (
                        <div key={sensor.sensorId} className="border rounded-lg p-4">
                          <p className="font-semibold mb-2">{sensor.sensorName}</p>
                          <div className="space-y-2">
                            {sensor.anomalies.map((anomaly, idx) => (
                              <div key={idx} className="border-l-4 border-orange-500 pl-3 py-2">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm">{anomaly.type.toUpperCase()}</p>
                                  <Badge className={getUrgencyColor(anomaly.severity)}>
                                    {anomaly.severity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                                <p className="text-xs">
                                  {new Date(anomaly.timestamp).toLocaleString()} • {anomaly.confidence}% confidence
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="models" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {modelPerformance.map((model) => (
                  <Card key={model.modelName}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{model.modelName}</CardTitle>
                        <Badge className={getStatusColor(model.status)}>
                          {model.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Accuracy</p>
                          <p className="font-bold">{model.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Precision</p>
                          <p className="font-bold">{model.precision}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Recall</p>
                          <p className="font-bold">{model.recall}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">F1 Score</p>
                          <p className="font-bold">{model.f1Score}%</p>
                        </div>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <p><strong>Data Points:</strong> {model.dataPoints.toLocaleString()}</p>
                        <p><strong>Last Updated:</strong> {new Date(model.lastUpdated).toLocaleDateString()}</p>
                      </div>

                      <div className="space-y-2">
                        <Progress value={model.accuracy} className="h-2" />
                        <p className="text-xs text-center text-muted-foreground">Overall Performance</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Predictive Analytics Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-semibold">Yield Forecast</p>
                          <p className="text-sm text-muted-foreground">Next harvest predictions</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+12%</p>
                          <p className="text-xs">vs last season</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-semibold">Risk Assessment</p>
                          <p className="text-sm text-muted-foreground">Weather & pest risks</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-yellow-500">Medium</Badge>
                          <p className="text-xs">Risk Level</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-semibold">Market Timing</p>
                          <p className="text-sm text-muted-foreground">Optimal selling window</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">3-5 days</p>
                          <p className="text-xs">from now</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resource Optimization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">Water Usage</p>
                          <Badge className="bg-blue-500">Optimized</Badge>
                        </div>
                        <Progress value={85} className="mb-2" />
                        <p className="text-sm text-muted-foreground">Current efficiency: 85%</p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">Fertilizer Application</p>
                          <Badge className="bg-green-500">Optimal</Badge>
                        </div>
                        <Progress value={92} className="mb-2" />
                        <p className="text-sm text-muted-foreground">Current efficiency: 92%</p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">Labor Allocation</p>
                          <Badge className="bg-yellow-500">Needs Attention</Badge>
                        </div>
                        <Progress value={68} className="mb-2" />
                        <p className="text-sm text-muted-foreground">Current efficiency: 68%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
