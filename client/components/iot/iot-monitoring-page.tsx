"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Sun, 
  Battery, 
  Signal, 
  MapPin, 
  Clock,
  Settings,
  RefreshCw,
  Loader2,
  Plus,
  Eye
} from "lucide-react"

interface Sensor {
  id: string
  name: string
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'light' | 'ph'
  location: string
  status: 'online' | 'offline' | 'maintenance'
  lastReading: number
  unit: string
  battery: number
  signal: number
  lastUpdate: string
  threshold: {
    min: number
    max: number
  }
  alerts: string[]
}

interface SensorData {
  timestamp: string
  value: number
  unit: string
}

const IoTMonitoringPage = () => {
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchSensorData()
  }, [])

  const fetchSensorData = async () => {
    try {
      setLoading(true)
      // Mock data for now
      const mockSensors: Sensor[] = [
        {
          id: "1",
          name: "Tomato Field Sensor 1",
          type: "temperature",
          location: "Lagos Farm A",
          status: "online",
          lastReading: 28.5,
          unit: "°C",
          battery: 85,
          signal: 92,
          lastUpdate: "2025-01-15T10:30:00Z",
          threshold: { min: 20, max: 35 },
          alerts: []
        },
        {
          id: "2",
          name: "Rice Field Humidity",
          type: "humidity",
          location: "Kano Farm B",
          status: "online",
          lastReading: 65,
          unit: "%",
          battery: 72,
          signal: 88,
          lastUpdate: "2025-01-15T10:25:00Z",
          threshold: { min: 40, max: 80 },
          alerts: []
        },
        {
          id: "3",
          name: "Yam Field Soil",
          type: "soil_moisture",
          location: "Enugu Farm C",
          status: "maintenance",
          lastReading: 45,
          unit: "%",
          battery: 23,
          signal: 45,
          lastUpdate: "2025-01-15T09:15:00Z",
          threshold: { min: 30, max: 70 },
          alerts: ["Low battery", "Weak signal"]
        }
      ]
      setSensors(mockSensors)
    } catch (error) {
      console.error("Failed to fetch sensor data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="w-5 h-5" />
      case 'humidity':
        return <Droplets className="w-5 h-5" />
      case 'soil_moisture':
        return <Sun className="w-5 h-5" />
      case 'light':
        return <Sun className="w-5 h-5" />
      case 'ph':
        return <Activity className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800'
      case 'offline':
        return 'bg-red-100 text-red-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600'
    if (level > 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSignalColor = (level: number) => {
    if (level > 80) return 'text-green-600'
    if (level > 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getReadingStatus = (sensor: Sensor) => {
    const { lastReading, threshold } = sensor
    if (lastReading < threshold.min || lastReading > threshold.max) {
      return 'alert'
    }
    return 'normal'
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
          <h1 className="text-2xl font-heading font-bold text-foreground">IoT Monitoring</h1>
          <p className="text-muted-foreground">Real-time monitoring of IoT sensors across all farms</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSensorData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Sensor
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sensors</p>
                <p className="text-2xl font-bold text-foreground">{sensors.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-foreground">
                  {sensors.filter(s => s.status === 'online').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                <p className="text-2xl font-bold text-foreground">
                  {sensors.reduce((sum, s) => sum + s.alerts.length, 0)}
                </p>
              </div>
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Battery</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(sensors.reduce((sum, s) => sum + s.battery, 0) / sensors.length)}%
                </p>
              </div>
              <Battery className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sensors.map((sensor) => (
              <Card key={sensor.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{sensor.name}</CardTitle>
                    <Badge className={getStatusColor(sensor.status)}>
                      {sensor.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getSensorIcon(sensor.type)}
                      <span className="text-sm text-muted-foreground">{sensor.type.replace('_', ' ')}</span>
                    </div>
                    
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${
                        getReadingStatus(sensor) === 'alert' ? 'text-red-600' : 'text-foreground'
                      }`}>
                        {sensor.lastReading}
                      </p>
                      <p className="text-sm text-muted-foreground">{sensor.unit}</p>
                      <p className="text-xs text-muted-foreground">
                        Range: {sensor.threshold.min} - {sensor.threshold.max} {sensor.unit}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Battery className={`w-3 h-3 ${getBatteryColor(sensor.battery)}`} />
                        <span>{sensor.battery}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Signal className={`w-3 h-3 ${getSignalColor(sensor.signal)}`} />
                        <span>{sensor.signal}%</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {sensor.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(sensor.lastUpdate).toLocaleTimeString()}
                      </div>
                    </div>

                    {sensor.alerts.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-orange-600 font-medium">Alerts:</p>
                        {sensor.alerts.map((alert, index) => (
                          <p key={index} className="text-xs text-orange-600">• {alert}</p>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
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

        <TabsContent value="sensors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed sensor management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Analytics</CardTitle>
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

export { IoTMonitoringPage }
