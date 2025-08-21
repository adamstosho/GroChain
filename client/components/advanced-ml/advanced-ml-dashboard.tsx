"use client"

import { useEffect, useState } from "react"
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
import {
  Brain,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  Settings,
  BarChart3,
  Leaf,
  Droplets,
  Sun,
  Bug,
  Zap,
  Activity,
  Gauge,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wifi,
  RefreshCw,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

interface SensorHealth {
  sensorId: string
  sensorName: string
  healthScore: number
  lastMaintenance: string
  nextMaintenance: string
  anomalies: number
  status: "healthy" | "warning" | "critical"
}

interface OptimizationResult {
  type: "irrigation" | "fertilizer" | "harvest"
  currentEfficiency: number
  optimizedEfficiency: number
  recommendations: string[]
  estimatedSavings: number
  implementationTime: string
}

interface EfficiencyScore {
  overall: number
  irrigation: number
  fertilizer: number
  harvest: number
  pestControl: number
  weatherAdaptation: number
}

interface PredictiveInsight {
  type: "maintenance" | "optimization" | "risk"
  title: string
  description: string
  confidence: number
  timeframe: string
  impact: "high" | "medium" | "low"
}

interface MLModelPerformance {
  modelName: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  lastUpdated: string
  status: "active" | "training" | "deprecated"
}

export function AdvancedMLDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedSensor, setSelectedSensor] = useState<string>("")
  const [sensors, setSensors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // State for different ML services
  const [sensorHealth, setSensorHealth] = useState<SensorHealth[]>([])
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([])
  const [efficiencyScore, setEfficiencyScore] = useState<EfficiencyScore | null>(null)
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([])
  const [modelPerformance, setModelPerformance] = useState<MLModelPerformance[]>([])

  // Fetch sensors on component mount
  useEffect(() => {
    fetchSensors()
  }, [])

  const fetchSensors = async () => {
    try {
      setLoading(true)
      const resp = await api.getSensors()
      if (resp.success && resp.data) {
        const sensorsList: any[] = ((resp.data as any).data || resp.data) as any[]
        setSensors(sensorsList)
        if (sensorsList.length > 0) {
          setSelectedSensor(sensorsList[0]._id || sensorsList[0].id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch sensors:", error)
      toast.error("Failed to load sensors")
    } finally {
      setLoading(false)
    }
  }

  const fetchSensorHealth = async () => {
    if (!selectedSensor) return
    
    try {
      setLoading(true)
      const resp = await api.get(`/api/advanced-ml/sensors/${selectedSensor}/maintenance`)
      if (resp.success && resp.data) {
        setSensorHealth([resp.data])
      }
      
      const anomaliesResp = await api.get(`/api/advanced-ml/sensors/${selectedSensor}/anomalies`)
      if (anomaliesResp.success && anomaliesResp.data) {
        // Update sensor health with anomalies data
        setSensorHealth(prev => prev.map(health => ({
          ...health,
          anomalies: anomaliesResp.data.anomalies?.length || 0
        })))
      }
    } catch (error) {
      console.error("Failed to fetch sensor health:", error)
      toast.error("Failed to load sensor health data")
    } finally {
      setLoading(false)
    }
  }

  const fetchOptimizationResults = async () => {
    try {
      setLoading(true)
      
      // Fetch irrigation optimization
      const irrigationResp = await api.get(`/api/advanced-ml/optimize/irrigation`)
      if (irrigationResp.success && irrigationResp.data) {
        setOptimizationResults(prev => [...prev.filter(r => r.type !== 'irrigation'), irrigationResp.data])
      }
      
      // Fetch fertilizer optimization
      const fertilizerResp = await api.get(`/api/advanced-ml/optimize/fertilizer`)
      if (fertilizerResp.success && fertilizerResp.data) {
        setOptimizationResults(prev => [...prev.filter(r => r.type !== 'fertilizer'), fertilizerResp.data])
      }
      
      // Fetch harvest optimization
      const harvestResp = await api.get(`/api/advanced-ml/optimize/harvest`)
      if (harvestResp.success && harvestResp.data) {
        setOptimizationResults(prev => [...prev.filter(r => r.type !== 'harvest'), harvestResp.data])
      }
    } catch (error) {
      console.error("Failed to fetch optimization results:", error)
      toast.error("Failed to load optimization data")
    } finally {
      setLoading(false)
    }
  }

  const fetchEfficiencyScore = async () => {
    try {
      setLoading(true)
      const resp = await api.get(`/api/advanced-ml/insights/efficiency-score`)
      if (resp.success && resp.data) {
        setEfficiencyScore(resp.data)
      }
    } catch (error) {
      console.error("Failed to fetch efficiency score:", error)
      toast.error("Failed to load efficiency data")
    } finally {
      setLoading(false)
    }
  }

  const fetchPredictiveInsights = async () => {
    try {
      setLoading(true)
      const resp = await api.get(`/api/advanced-ml/insights/predictive`)
      if (resp.success && resp.data) {
        setPredictiveInsights(resp.data.insights || [])
      }
    } catch (error) {
      console.error("Failed to fetch predictive insights:", error)
      toast.error("Failed to load predictive insights")
    } finally {
      setLoading(false)
    }
  }

  const fetchModelPerformance = async () => {
    try {
      setLoading(true)
      const resp = await api.get(`/api/advanced-ml/models/performance`)
      if (resp.success && resp.data) {
        setModelPerformance(resp.data.models || [])
      }
    } catch (error) {
      console.error("Failed to fetch model performance:", error)
      toast.error("Failed to load model performance data")
    } finally {
      setLoading(false)
    }
  }

  const handleSensorChange = (sensorId: string) => {
    setSelectedSensor(sensorId)
    if (sensorId) {
      fetchSensorHealth()
    }
  }

  const refreshAllData = async () => {
    await Promise.all([
      fetchSensorHealth(),
      fetchOptimizationResults(),
      fetchEfficiencyScore(),
      fetchPredictiveInsights(),
      fetchModelPerformance()
    ])
    toast.success("All data refreshed")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-success"
      case "warning": return "text-warning"
      case "critical": return "text-destructive"
      default: return "text-muted-foreground"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy": return <Badge variant="default">Healthy</Badge>
      case "warning": return <Badge variant="secondary">Warning</Badge>
      case "critical": return <Badge variant="destructive">Critical</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-destructive"
      case "medium": return "text-warning"
      case "low": return "text-success"
      default: return "text-muted-foreground"
    }
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Advanced ML Services</h1>
            <p className="text-muted-foreground">Machine learning-powered precision agriculture and optimization</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={refreshAllData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
            <Link href="/ai">
              <Button variant="outline" size="lg" className="bg-transparent">
                <Brain className="w-4 h-4 mr-2" />
                AI Insights
              </Button>
            </Link>
            <Link href="/image-recognition">
              <Button variant="outline" size="lg" className="bg-transparent">
                <Activity className="w-4 h-4 mr-2" />
                Image Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Sensor Selection */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="sensor-select">Select Sensor:</Label>
              <Select value={selectedSensor} onValueChange={handleSensorChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose a sensor" />
                </SelectTrigger>
                <SelectContent>
                  {sensors.map((sensor) => (
                    <SelectItem key={sensor._id || sensor.id} value={sensor._id || sensor.id}>
                      {sensor.metadata?.model || sensor.sensorId || 'Sensor'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSensor && (
                <Button onClick={fetchSensorHealth} disabled={loading}>
                  Analyze Sensor
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sensor-health">Sensor Health</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
            <TabsTrigger value="models">ML Models</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Sensors</p>
                      <p className="text-2xl font-bold text-foreground">{sensors.length}</p>
                    </div>
                    <Wifi className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ML Models</p>
                      <p className="text-2xl font-bold text-foreground">{modelPerformance.length}</p>
                    </div>
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Optimizations</p>
                      <p className="text-2xl font-bold text-foreground">{optimizationResults.length}</p>
                    </div>
                    <Target className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Predictive Insights</p>
                      <p className="text-2xl font-bold text-foreground">{predictiveInsights.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-info" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={fetchOptimizationResults}
                    disabled={loading}
                  >
                    <Zap className="w-8 h-8 mb-2" />
                    <span>Run Optimization</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={fetchEfficiencyScore}
                    disabled={loading}
                  >
                    <Gauge className="w-8 h-8 mb-2" />
                    <span>Calculate Efficiency</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={fetchPredictiveInsights}
                    disabled={loading}
                  >
                    <TrendingUp className="w-8 h-8 mb-2" />
                    <span>Generate Insights</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sensor-health" className="space-y-6">
            <div className="space-y-4">
              {sensorHealth.length > 0 ? (
                sensorHealth.map((health, index) => (
                  <motion.div
                    key={health.sensorId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{health.sensorName}</CardTitle>
                          {getStatusBadge(health.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Health Score</span>
                              <span className={getStatusColor(health.status)}>{health.healthScore}%</span>
                            </div>
                            <Progress value={health.healthScore} className="h-2" />
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm font-medium">Anomalies Detected</p>
                            <p className="text-2xl font-bold text-warning">{health.anomalies}</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm font-medium">Next Maintenance</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(health.nextMaintenance).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Schedule Maintenance
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Wifi className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a sensor to view health analysis</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {optimizationResults.length > 0 ? (
                optimizationResults.map((result, index) => (
                  <motion.div
                    key={result.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg capitalize">{result.type} Optimization</CardTitle>
                          <Badge variant="outline">{result.implementationTime}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current Efficiency</span>
                            <span className="text-muted-foreground">{result.currentEfficiency}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Optimized Efficiency</span>
                            <span className="text-success font-medium">{result.optimizedEfficiency}%</span>
                          </div>
                          <Progress 
                            value={result.optimizedEfficiency} 
                            className="h-2" 
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Estimated Savings</p>
                          <p className="text-lg font-bold text-success">₦{result.estimatedSavings.toLocaleString()}</p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Recommendations</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {result.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-success flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button variant="outline" size="sm" className="w-full">
                          Implement Changes
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="col-span-3">
                  <CardContent className="p-8 text-center">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No optimization results available</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click "Run Optimization" to generate recommendations
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-6">
            {efficiencyScore ? (
              <div className="space-y-6">
                {/* Overall Efficiency Score */}
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Farming Efficiency Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-6xl font-bold text-primary">{efficiencyScore.overall}%</div>
                      <Progress value={efficiencyScore.overall} className="h-3" />
                      <p className="text-muted-foreground">
                        Your farm is performing {efficiencyScore.overall >= 80 ? 'excellently' : 
                         efficiencyScore.overall >= 60 ? 'well' : 'below average'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Efficiency Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(efficiencyScore).filter(([key]) => key !== 'overall').map(([key, value]) => (
                    <Card key={key}>
                      <CardHeader>
                        <CardTitle className="text-lg capitalize">{key.replace(/([A-Z])/g, ' $1')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-bold text-foreground">{value}%</div>
                          <Progress value={value} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {value >= 80 ? 'Excellent' : value >= 60 ? 'Good' : 'Needs Improvement'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gauge className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No efficiency data available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click "Calculate Efficiency" to generate your farm's efficiency score
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div className="space-y-4">
              {modelPerformance.length > 0 ? (
                modelPerformance.map((model, index) => (
                  <motion.div
                    key={model.modelName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{model.modelName}</CardTitle>
                          <Badge variant={model.status === 'active' ? 'default' : 
                                       model.status === 'training' ? 'secondary' : 'outline'}>
                            {model.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-sm font-medium">Accuracy</p>
                            <p className="text-2xl font-bold text-success">{model.accuracy}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">Precision</p>
                            <p className="text-2xl font-bold text-primary">{model.precision}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">Recall</p>
                            <p className="text-2xl font-bold text-info">{model.recall}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">F1 Score</p>
                            <p className="text-2xl font-bold text-warning">{model.f1Score}%</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Last Updated</span>
                            <span>{new Date(model.lastUpdated).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No ML model performance data available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
