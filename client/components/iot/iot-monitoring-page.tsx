"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  RefreshCw,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Clock,
  Activity,
  Zap,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { toast } from "sonner"

interface Sensor {
  id: string
  name: string
  type: "temperature" | "humidity" | "soil_moisture" | "ph" | "light"
  location: string
  status: "online" | "offline" | "warning"
  lastReading: {
    value: number
    unit: string
    timestamp: string
  }
  batteryLevel: number
}

interface SensorReading {
  id: string
  sensorId: string
  value: number
  unit: string
  timestamp: string
}

interface EnvironmentalData {
  temperature: number
  humidity: number
  soilMoisture: number
  phLevel: number
  lightIntensity: number
  timestamp: string
}

export function IoTMonitoringPage() {
  const { user } = useAuth()
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedSensor, setSelectedSensor] = useState<string>("all")
  const [timeRange, setTimeRange] = useState("1h")
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData>({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    phLevel: 0,
    lightIntensity: 0,
    timestamp: new Date().toISOString()
  })
  const [readings, setReadings] = useState<SensorReading[]>([])

  // Fetch sensors on component mount
  useEffect(() => {
    fetchSensors()
  }, [])

  // Real-time updates when live mode is enabled
  useEffect(() => {
    if (!isLiveMode) return

    const interval = setInterval(() => {
      fetchEnvironmentalData()
      if (selectedSensor !== "all") {
        fetchSensorReadings(selectedSensor)
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [isLiveMode, selectedSensor])

  const fetchSensors = async () => {
    try {
      setLoading(true)
      const resp = await api.getSensors()
      if (resp.success && resp.data) {
        const list: any[] = ((resp.data as any).data || resp.data) as any[]
        const mapped: Sensor[] = list.map((s: any) => ({
          id: s._id || s.id,
          name: s.metadata?.model || s.sensorId || 'Sensor',
          type: (s.sensorType === 'soil' ? 'soil_moisture' : s.sensorType) as Sensor['type'],
          location: `${s.location?.latitude ?? ''}, ${s.location?.longitude ?? ''}`,
          status: (s.status === 'active' ? 'online' : (s.status === 'inactive' ? 'offline' : 'warning')) as Sensor['status'],
          lastReading: { 
            value: s.readings?.[s.readings.length-1]?.value ?? 0, 
            unit: s.readings?.[s.readings.length-1]?.unit ?? '', 
            timestamp: s.readings?.[s.readings.length-1]?.timestamp ?? new Date().toISOString() 
          },
          batteryLevel: s.batteryLevel ?? 100,
        }))
        setSensors(mapped)
        
        // Set initial environmental data from first sensor
        if (mapped.length > 0) {
          setEnvironmentalData({
            temperature: mapped.find(s => s.type === 'temperature')?.lastReading.value ?? 0,
            humidity: mapped.find(s => s.type === 'humidity')?.lastReading.value ?? 0,
            soilMoisture: mapped.find(s => s.type === 'soil_moisture')?.lastReading.value ?? 0,
            phLevel: mapped.find(s => s.type === 'ph')?.lastReading.value ?? 0,
            lightIntensity: mapped.find(s => s.type === 'light')?.lastReading.value ?? 0,
            timestamp: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch sensors:", error)
      toast.error("Failed to load sensors")
    } finally {
      setLoading(false)
    }
  }

  const fetchEnvironmentalData = async () => {
    try {
      // Simulate real-time environmental data updates
      const now = new Date()
      setEnvironmentalData(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 2,
        humidity: Math.max(0, Math.min(100, prev.humidity + (Math.random() - 0.5) * 5)),
        soilMoisture: Math.max(0, Math.min(100, prev.soilMoisture + (Math.random() - 0.5) * 3)),
        phLevel: Math.max(0, Math.min(14, prev.phLevel + (Math.random() - 0.5) * 0.2)),
        lightIntensity: Math.max(0, prev.lightIntensity + (Math.random() - 0.5) * 10),
        timestamp: now.toISOString()
      }))
    } catch (error) {
      console.error("Failed to fetch environmental data:", error)
    }
  }

  const fetchSensorReadings = async (sensorId: string) => {
    try {
      const resp = await api.getSensorReadings(sensorId, { limit: 50 })
      if (resp.success && resp.data) {
        const readingsList: any[] = resp.data as any[]
        const mapped: SensorReading[] = readingsList.map((r: any) => ({
          id: r._id || r.id,
          sensorId: r.sensorId,
          value: r.value,
          unit: r.unit || '',
          timestamp: r.timestamp
        }))
        setReadings(mapped)
      }
    } catch (error) {
      console.error("Failed to fetch sensor readings:", error)
    }
  }

  const handleSensorChange = (sensorId: string) => {
    setSelectedSensor(sensorId)
    if (sensorId !== "all") {
      fetchSensorReadings(sensorId)
    }
  }

  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode)
    if (!isLiveMode) {
      toast.success("Live monitoring enabled")
    } else {
      toast.info("Live monitoring paused")
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      toast.success("Fullscreen mode enabled")
    } else {
      toast.info("Fullscreen mode disabled")
    }
  }

  const refreshData = () => {
    fetchSensors()
    fetchEnvironmentalData()
    if (selectedSensor !== "all") {
      fetchSensorReadings(selectedSensor)
    }
    toast.success("Data refreshed")
  }

  const getSensorIcon = (type: Sensor["type"]) => {
    switch (type) {
      case "temperature":
        return <Thermometer className="w-5 h-5 text-orange-500" />
      case "humidity":
        return <Droplets className="w-5 h-5 text-blue-500" />
      case "soil_moisture":
        return <Droplets className="w-5 h-5 text-brown-500" />
      case "ph":
        return <Wind className="w-5 h-5 text-purple-500" />
      case "light":
        return <Sun className="w-5 h-5 text-yellow-500" />
      default:
        return <Settings className="w-5 h-4 text-muted-foreground" />
    }
  }

  const getStatusIcon = (status: Sensor["status"]) => {
    switch (status) {
      case "online":
        return <Wifi className="w-4 h-4 text-success" />
      case "offline":
        return <WifiOff className="w-4 h-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />
      default:
        return <WifiOff className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: Sensor["status"]) => {
    switch (status) {
      case "online":
        return <Badge variant="default">Online</Badge>
      case "offline":
        return <Badge variant="destructive">Offline</Badge>
      case "warning":
        return <Badge variant="secondary">Warning</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-success"
    if (level > 20) return "text-warning"
    return "text-destructive"
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/iot">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to IoT
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">IoT Monitoring</h1>
              <p className="text-muted-foreground">Real-time sensor monitoring and environmental data</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isLiveMode ? "default" : "outline"}
              size="sm"
              onClick={toggleLiveMode}
            >
              {isLiveMode ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isLiveMode ? "Live" : "Paused"}
            </Button>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
              {isFullscreen ? "Exit" : "Fullscreen"}
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="sensor-select">Sensor:</Label>
                <Select value={selectedSensor} onValueChange={handleSensorChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select sensor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sensors</SelectItem>
                    {sensors.map((sensor) => (
                      <SelectItem key={sensor.id} value={sensor.id}>
                        {sensor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="time-range">Time Range:</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="6h">6 Hours</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="live-mode"
                  checked={isLiveMode}
                  onCheckedChange={setIsLiveMode}
                />
                <Label htmlFor="live-mode">Live Updates</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
            <TabsTrigger value="readings">Readings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Real-time Environmental Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  Real-time Environmental Conditions
                  {isLiveMode && (
                    <div className="ml-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">Live</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <motion.div
                    className="text-center p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-orange-100"
                    animate={{ scale: isLiveMode ? [1, 1.02, 1] : 1 }}
                    transition={{ duration: 2, repeat: isLiveMode ? Infinity : 0 }}
                  >
                    <Thermometer className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {environmentalData.temperature.toFixed(1)}°C
                    </p>
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(environmentalData.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>

                  <motion.div
                    className="text-center p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100"
                    animate={{ scale: isLiveMode ? [1, 1.02, 1] : 1 }}
                    transition={{ duration: 2, repeat: isLiveMode ? Infinity : 0, delay: 0.4 }}
                  >
                    <Droplets className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {environmentalData.humidity.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(environmentalData.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>

                  <motion.div
                    className="text-center p-4 border rounded-lg bg-gradient-to-br from-brown-50 to-brown-100"
                    animate={{ scale: isLiveMode ? [1, 1.02, 1] : 1 }}
                    transition={{ duration: 2, repeat: isLiveMode ? Infinity : 0, delay: 0.8 }}
                  >
                    <Droplets className="w-12 h-12 text-brown-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {environmentalData.soilMoisture.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Soil Moisture</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(environmentalData.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>

                  <motion.div
                    className="text-center p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100"
                    animate={{ scale: isLiveMode ? [1, 1.02, 1] : 1 }}
                    transition={{ duration: 2, repeat: isLiveMode ? Infinity : 0, delay: 1.2 }}
                  >
                    <Wind className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {environmentalData.phLevel.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">pH Level</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(environmentalData.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>

                  <motion.div
                    className="text-center p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100"
                    animate={{ scale: isLiveMode ? [1, 1.02, 1] : 1 }}
                    transition={{ duration: 2, repeat: isLiveMode ? Infinity : 0, delay: 1.6 }}
                  >
                    <Sun className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {environmentalData.lightIntensity.toFixed(0)} lux
                    </p>
                    <p className="text-sm text-muted-foreground">Light Intensity</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(environmentalData.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-primary" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-success mb-2">
                      {sensors.filter(s => s.status === 'online').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Online Sensors</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-warning mb-2">
                      {sensors.filter(s => s.status === 'warning').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Warning Sensors</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-destructive mb-2">
                      {sensors.filter(s => s.status === 'offline').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Offline Sensors</p>
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
                          {getStatusIcon(sensor.status)}
                          {getStatusBadge(sensor.status)}
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
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              sensor.batteryLevel > 50 ? 'bg-green-500' : 
                              sensor.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${sensor.batteryLevel}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Link href={`/iot/sensors/${sensor.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
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

          <TabsContent value="readings" className="space-y-6">
            {selectedSensor === "all" ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a specific sensor to view detailed readings</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Sensor Readings - {sensors.find(s => s.id === selectedSensor)?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {readings.length > 0 ? (
                      readings.map((reading, index) => (
                        <div key={reading.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            <div>
                              <p className="font-medium">
                                {reading.value} {reading.unit}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(reading.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No readings available for this sensor</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Sensor Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Advanced analytics and historical data visualization will be implemented in the next phase.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      This will include trend analysis, predictive insights, and performance metrics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

