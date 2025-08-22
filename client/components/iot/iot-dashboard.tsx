"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Progress } from "@/components/ui/Progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Wifi,
  WifiOff,
  AlertTriangle,
  TrendingUp,
  Settings,
  Plus,
  Bell,
  BellOff,
  Zap,
  Battery,
  Signal,
  MapPin,
  Clock,
  RefreshCw,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Activity,
  Gauge,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import Link from "next/link"

interface Sensor {
  id: string
  name: string
  type: "temperature" | "humidity" | "soil_moisture" | "ph" | "light" | "wind_speed" | "rainfall"
  location: string
  coordinates?: {
    lat: number
    lng: number
  }
  status: "online" | "offline" | "warning" | "maintenance"
  lastReading: {
    value: number
    unit: string
    timestamp: string
  }
  batteryLevel: number
  signalStrength: number
  alerts: Alert[]
  thresholds: {
    min: number
    max: number
    critical: number
  }
  isActive: boolean
}

interface Alert {
  id: string
  type: "warning" | "critical" | "info"
  message: string
  timestamp: string
  acknowledged: boolean
  sensorId: string
}

interface SensorReading {
  id: string
  sensorId: string
  value: number
  unit: string
  timestamp: string
  location: string
}

interface SensorStats {
  totalSensors: number
  onlineSensors: number
  offlineSensors: number
  warningSensors: number
  averageBatteryLevel: number
  totalAlerts: number
  unacknowledgedAlerts: number
  dataPointsToday: number
}

const mockSensors: Sensor[] = [
  {
    id: "sensor_1",
    name: "Temperature Sensor A",
    type: "temperature",
    location: "Field A - North Section",
    status: "online",
    lastReading: {
      value: 28.5,
      unit: "°C",
      timestamp: "2025-01-16T10:30:00Z",
    },
    batteryLevel: 85,
    signalStrength: 95,
    alerts: [],
    thresholds: { min: 20, max: 30, critical: 25 },
    isActive: true
  },
  {
    id: "sensor_2",
    name: "Soil Moisture B",
    type: "soil_moisture",
    location: "Field B - South Section",
    status: "warning",
    lastReading: {
      value: 35,
      unit: "%",
      timestamp: "2025-01-16T10:25:00Z",
    },
    batteryLevel: 20,
    signalStrength: 70,
    alerts: [],
    thresholds: { min: 20, max: 40, critical: 30 },
    isActive: true
  },
  {
    id: "sensor_3",
    name: "Humidity Monitor",
    type: "humidity",
    location: "Greenhouse 1",
    status: "online",
    lastReading: {
      value: 65,
      unit: "%",
      timestamp: "2025-01-16T10:32:00Z",
    },
    batteryLevel: 92,
    signalStrength: 98,
    alerts: [],
    thresholds: { min: 50, max: 70, critical: 60 },
    isActive: true
  },
  {
    id: "sensor_4",
    name: "pH Sensor C",
    type: "ph",
    location: "Field C - Center",
    status: "offline",
    lastReading: {
      value: 6.8,
      unit: "pH",
      timestamp: "2025-01-15T18:45:00Z",
    },
    batteryLevel: 0,
    signalStrength: 50,
    alerts: [],
    thresholds: { min: 6.0, max: 7.5, critical: 6.5 },
    isActive: false
  },
]

export function IoTDashboard() {
  const { user } = useAuth()
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [stats, setStats] = useState<SensorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddSensor, setShowAddSensor] = useState(false)
  const [showSensorConfig, setShowSensorConfig] = useState(false)
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)
  const [realTimeMode, setRealTimeMode] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000) // 5 seconds
  const [newSensorData, setNewSensorData] = useState({
    name: "",
    type: "",
    location: "",
    lat: "",
    lng: ""
  })
  const [configData, setConfigData] = useState({
    minThreshold: "",
    maxThreshold: "",
    criticalThreshold: "",
    alertEnabled: true,
    autoCalibration: false
  })
  
  const realTimeIntervalRef = useRef<NodeJS.Timeout>()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (user) {
      fetchIoTData()
      setupWebSocket()
    }
    
    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [user])

  // Real-time data updates
  useEffect(() => {
    if (autoRefresh && realTimeMode) {
      realTimeIntervalRef.current = setInterval(() => {
        fetchIoTData()
      }, refreshInterval)
    } else if (realTimeIntervalRef.current) {
      clearInterval(realTimeIntervalRef.current)
    }

    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current)
      }
    }
  }, [autoRefresh, realTimeMode, refreshInterval])

  const setupWebSocket = () => {
    try {
      // Connect to WebSocket for real-time sensor data
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/iot')
      
      ws.onopen = () => {
        console.log('WebSocket connected for IoT data')
        toast.success("Real-time IoT monitoring connected")
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'sensor_reading') {
            updateSensorReading(data.data)
          } else if (data.type === 'alert') {
            handleNewAlert(data.data)
          }
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        toast.error("Real-time connection failed")
      }
      
      ws.onclose = () => {
        console.log('WebSocket disconnected')
        toast.info("Real-time connection lost")
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('WebSocket setup error:', error)
    }
  }

  const updateSensorReading = (reading: SensorReading) => {
    setReadings(prev => {
      const filtered = prev.filter(r => r.sensorId !== reading.sensorId)
      return [reading, ...filtered].slice(0, 100) // Keep last 100 readings
    })
    
    setSensors(prev => prev.map(sensor => {
      if (sensor.id === reading.sensorId) {
        return {
          ...sensor,
          lastReading: {
            value: reading.value,
            unit: reading.unit,
            timestamp: reading.timestamp
          }
        }
      }
      return sensor
    }))
  }

  const handleNewAlert = (alert: Alert) => {
    setSensors(prev => prev.map(sensor => {
      if (sensor.id === alert.sensorId) {
        return {
          ...sensor,
          alerts: [alert, ...sensor.alerts].slice(0, 10) // Keep last 10 alerts
        }
      }
      return sensor
    }))
    
    // Show toast notification
    if (alert.type === 'critical') {
      toast.error(`🚨 CRITICAL: ${alert.message}`)
    } else if (alert.type === 'warning') {
      toast.warning(`⚠️ WARNING: ${alert.message}`)
    } else {
      toast.info(`ℹ️ INFO: ${alert.message}`)
    }
  }

  const fetchIoTData = async () => {
    try {
      setLoading(true)
      
      // Fetch sensors from existing endpoint
      const sensorsRes = await api.get("/api/iot/sensors")
      
      // For missing endpoints, use mock data
      // TODO: Replace with actual API calls when backend endpoints are implemented
      const mockReadings: SensorReading[] = [
        {
          id: "reading_001",
          sensorId: "sensor_1",
          value: 28.5,
          unit: "°C",
          timestamp: new Date().toISOString(),
          type: "temperature",
          location: "Field A - North Section",
          metadata: { humidity: 65, pressure: 1013 }
        }
      ]
      
      const mockStats: SensorStats = {
        totalSensors: 12,
        onlineSensors: 10,
        offlineSensors: 2,
        warningSensors: 1,
        averageBatteryLevel: 78,
        totalAlerts: 3,
        unacknowledgedAlerts: 1,
        dataPointsToday: 1440
      }

      if (sensorsRes.success) {
        setSensors(sensorsRes.data || mockSensors)
      } else {
        setSensors(mockSensors)
      }
      
      setReadings(mockReadings)
      setStats(mockStats)
    } catch (error) {
      console.error("IoT data fetch error:", error)
      toast.error("Failed to load IoT data")
      // Fallback to mock data
      setSensors(mockSensors)
      setReadings([])
      setStats({
        totalSensors: 12,
        onlineSensors: 10,
        offlineSensors: 2,
        warningSensors: 1,
        averageBatteryLevel: 78,
        totalAlerts: 3,
        unacknowledgedAlerts: 1,
        dataPointsToday: 1440
      })
    } finally {
      setLoading(false)
    }
  }

  const addSensor = async () => {
    try {
      const response = await api.post("/api/iot/sensors", {
        ...newSensorData,
        coordinates: newSensorData.lat && newSensorData.lng ? {
          lat: parseFloat(newSensorData.lat),
          lng: parseFloat(newSensorData.lng)
        } : undefined
      })
      
      if (response.success) {
        toast.success("Sensor added successfully!")
        setShowAddSensor(false)
        setNewSensorData({ name: "", type: "", location: "", lat: "", lng: "" })
        fetchIoTData()
      }
    } catch (error) {
      toast.error("Failed to add sensor")
    }
  }

  const updateSensorConfig = async () => {
    if (!selectedSensor) return
    
    try {
      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await api.put(`/api/iot/sensors/${selectedSensor.id}/config`, configData)
      
      // For now, simulate successful update
      toast.success("Sensor configuration updated!")
      setShowSensorConfig(false)
      setSelectedSensor(null)
      
      // Update local state for demo purposes
      setSensors(prev => prev.map(sensor => 
        sensor.id === selectedSensor.id 
          ? {
              ...sensor,
              thresholds: {
                min: parseFloat(configData.minThreshold) || sensor.thresholds.min,
                max: parseFloat(configData.maxThreshold) || sensor.thresholds.max,
                critical: parseFloat(configData.criticalThreshold) || sensor.thresholds.critical
              }
            }
          : sensor
      ))
    } catch (error) {
      toast.error("Failed to update sensor configuration")
    }
  }

  const toggleSensorStatus = async (sensorId: string, isActive: boolean) => {
    try {
      const response = await api.patch(`/api/iot/sensors/${sensorId}/status`, { isActive })
      
      if (response.success) {
        toast.success(`Sensor ${isActive ? 'activated' : 'deactivated'}`)
        fetchIoTData()
      }
    } catch (error) {
      toast.error("Failed to update sensor status")
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await api.patch(`/api/iot/alerts/${alertId}/acknowledge`)
      
      if (response.success) {
        toast.success("Alert acknowledged")
        fetchIoTData()
      }
    } catch (error) {
      toast.error("Failed to acknowledge alert")
    }
  }

  const getSensorIcon = (type: string) => {
    const icons = {
      temperature: Thermometer,
      humidity: Droplets,
      soil_moisture: Droplets,
      ph: Activity,
      light: Sun,
      wind_speed: Wind,
      rainfall: Droplets
    }
    return icons[type as keyof typeof icons] || Activity
  }

  const getStatusColor = (status: string) => {
    const colors = {
      online: "bg-green-100 text-green-800",
      offline: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
      maintenance: "bg-blue-100 text-blue-800"
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getAlertIcon = (type: string) => {
    if (type === 'critical') return <XCircle className="w-4 h-4 text-red-600" />
    if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    return <AlertCircle className="w-4 h-4 text-blue-600" />
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return "text-green-600"
    if (level > 30) return "text-yellow-600"
    return "text-red-600"
  }

  const getSignalColor = (strength: number) => {
    if (strength > 80) return "text-green-600"
    if (strength > 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">IoT & Sensor Management</h1>
            <p className="text-muted-foreground">Real-time monitoring and management of farm sensors and environmental conditions</p>
            {stats && (
              <p className="text-sm text-muted-foreground mt-1">
                {stats.onlineSensors} of {stats.totalSensors} sensors online • {stats.unacknowledgedAlerts} unacknowledged alerts
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Real-time Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={realTimeMode ? "default" : "outline"}
                size="sm"
                onClick={() => setRealTimeMode(!realTimeMode)}
                className="flex items-center gap-2"
              >
                {realTimeMode ? (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Real-time
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Manual
                  </>
                )}
              </Button>
              
              {realTimeMode && (
                <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2000">2s</SelectItem>
                    <SelectItem value="5000">5s</SelectItem>
                    <SelectItem value="10000">10s</SelectItem>
                    <SelectItem value="30000">30s</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Action Buttons */}
            <Button variant="outline" onClick={fetchIoTData} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
            
            <Button onClick={() => setShowAddSensor(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Sensor
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Sensors</p>
                        <p className="text-2xl font-bold text-foreground">{stats?.totalSensors || 0}</p>
                      </div>
                      <Settings className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Online</p>
                        <p className="text-2xl font-bold text-foreground">{stats?.onlineSensors || 0}</p>
                      </div>
                      <Wifi className="w-8 h-8 text-success" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                        <p className="text-2xl font-bold text-foreground">{stats?.totalAlerts || 0}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-warning" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Battery</p>
                        <p className="text-2xl font-bold text-foreground">{stats?.averageBatteryLevel || 0}%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Current Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Current Environmental Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <Thermometer className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">28.5°C</p>
                    <p className="text-sm text-muted-foreground">Temperature</p>
                  </div>
                  <div className="text-center">
                    <Droplets className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">65%</p>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                  </div>
                  <div className="text-center">
                    <Droplets className="w-12 h-12 text-brown-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">35%</p>
                    <p className="text-sm text-muted-foreground">Soil Moisture</p>
                  </div>
                  <div className="text-center">
                    <Wind className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">6.8</p>
                    <p className="text-sm text-muted-foreground">pH Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-warning/20 bg-warning/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      <div>
                        <h4 className="font-medium text-foreground">Low Battery Warning</h4>
                        <p className="text-sm text-muted-foreground">Soil Moisture B - Battery at 20%</p>
                      </div>
                    </div>
                    <Badge variant="secondary">2 hours ago</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <WifiOff className="w-5 h-5 text-destructive" />
                      <div>
                        <h4 className="font-medium text-foreground">Sensor Offline</h4>
                        <p className="text-sm text-muted-foreground">pH Sensor C - No data received</p>
                      </div>
                    </div>
                    <Badge variant="destructive">5 hours ago</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-info/20 bg-info/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Droplets className="w-5 h-5 text-info" />
                      <div>
                        <h4 className="font-medium text-foreground">Soil Moisture Low</h4>
                        <p className="text-sm text-muted-foreground">Field A - Consider irrigation</p>
                      </div>
                    </div>
                    <Badge variant="outline">1 day ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sensors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sensors.map((sensor, index) => (
                <motion.div
                  key={sensor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getSensorIcon(sensor.type)}
                          <div>
                            <CardTitle className="text-lg">{sensor.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{sensor.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusColor(sensor.status)}
                          {getStatusColor(sensor.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {sensor.lastReading.value}
                            {sensor.lastReading.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last reading: {new Date(sensor.lastReading.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Battery Level</span>
                          <span className={getBatteryColor(sensor.batteryLevel)}>{sensor.batteryLevel}%</span>
                        </div>
                        <Progress value={sensor.batteryLevel} className="h-2" />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Link href={`/iot/sensors/${sensor.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              {/* Sensor Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Sensor Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-success mb-2">
                        {sensors.filter(s => s.status === 'online').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Online Sensors</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sensors.length > 0 ? Math.round((sensors.filter(s => s.status === 'online').length / sensors.length) * 100) : 0}% uptime
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-warning mb-2">
                        {sensors.filter(s => s.batteryLevel < 30).length}
                      </div>
                      <p className="text-sm text-muted-foreground">Low Battery</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sensors needing attention
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-2">
                        {sensors.length > 0 ? Math.round(sensors.reduce((acc, s) => acc + s.batteryLevel, 0) / sensors.length) : 0}%
                      </div>
                      <p className="text-sm text-muted-foreground">Avg Battery</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Overall system health
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sensor Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sensor Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {['temperature', 'humidity', 'soil_moisture', 'ph', 'light'].map((type) => {
                      const count = sensors.filter(s => s.type === type).length
                      return (
                        <div key={type} className="text-center p-3 border rounded-lg">
                          <div className="text-lg font-bold text-foreground mb-1">{count}</div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {type.replace('_', ' ')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/iot/monitoring">
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                        <Activity className="w-8 h-8 mb-2" />
                        <span>Live Monitoring</span>
                      </Button>
                    </Link>
                    <Link href="/iot/alerts">
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                        <AlertTriangle className="w-8 h-8 mb-2" />
                        <span>View Alerts</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Sensor Modal */}
        {showAddSensor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Add New Sensor</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sensorName">Sensor Name</Label>
                  <Input
                    id="sensorName"
                    value={newSensorData.name}
                    onChange={(e) => setNewSensorData({ ...newSensorData, name: e.target.value })}
                    placeholder="e.g., Temperature Sensor A"
                  />
                </div>

                <div>
                  <Label htmlFor="sensorType">Sensor Type</Label>
                  <Select value={newSensorData.type} onValueChange={(value) => setNewSensorData({ ...newSensorData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sensor type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="humidity">Humidity</SelectItem>
                      <SelectItem value="soil_moisture">Soil Moisture</SelectItem>
                      <SelectItem value="ph">pH Level</SelectItem>
                      <SelectItem value="light">Light Intensity</SelectItem>
                      <SelectItem value="wind_speed">Wind Speed</SelectItem>
                      <SelectItem value="rainfall">Rainfall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sensorLocation">Location</Label>
                  <Input
                    id="sensorLocation"
                    value={newSensorData.location}
                    onChange={(e) => setNewSensorData({ ...newSensorData, location: e.target.value })}
                    placeholder="e.g., Field A - North Section"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude (optional)</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      value={newSensorData.lat}
                      onChange={(e) => setNewSensorData({ ...newSensorData, lat: e.target.value })}
                      placeholder="6.5244"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude (optional)</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      value={newSensorData.lng}
                      onChange={(e) => setNewSensorData({ ...newSensorData, lng: e.target.value })}
                      placeholder="3.3792"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addSensor} className="flex-1">
                    Add Sensor
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddSensor(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sensor Configuration Modal */}
        {showSensorConfig && selectedSensor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Configure Sensor: {selectedSensor.name}</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="minThreshold">Minimum Threshold</Label>
                  <Input
                    id="minThreshold"
                    type="number"
                    value={configData.minThreshold}
                    onChange={(e) => setConfigData({ ...configData, minThreshold: e.target.value })}
                    placeholder={selectedSensor.thresholds.min.toString()}
                  />
                </div>

                <div>
                  <Label htmlFor="maxThreshold">Maximum Threshold</Label>
                  <Input
                    id="maxThreshold"
                    type="number"
                    value={configData.maxThreshold}
                    onChange={(e) => setConfigData({ ...configData, maxThreshold: e.target.value })}
                    placeholder={selectedSensor.thresholds.max.toString()}
                  />
                </div>

                <div>
                  <Label htmlFor="criticalThreshold">Critical Threshold</Label>
                  <Input
                    id="criticalThreshold"
                    type="number"
                    value={configData.criticalThreshold}
                    onChange={(e) => setConfigData({ ...configData, criticalThreshold: e.target.value })}
                    placeholder={selectedSensor.thresholds.critical.toString()}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="alertEnabled">Enable Alerts</Label>
                  <Switch
                    id="alertEnabled"
                    checked={configData.alertEnabled}
                    onCheckedChange={(checked) => setConfigData({ ...configData, alertEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoCalibration">Auto Calibration</Label>
                  <Switch
                    id="autoCalibration"
                    checked={configData.autoCalibration}
                    onCheckedChange={(checked) => setConfigData({ ...configData, autoCalibration: checked })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={updateSensorConfig} className="flex-1">
                    Update Configuration
                  </Button>
                  <Button variant="outline" onClick={() => setShowSensorConfig(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
