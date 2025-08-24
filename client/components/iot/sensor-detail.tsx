"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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
  Edit,
  Download,
  AlertTriangle,
  CheckCircle
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
  description: string
  installationDate: string
  manufacturer: string
  model: string
  firmware: string
}

interface SensorData {
  timestamp: string
  value: number
  unit: string
}

const SensorDetail = () => {
  const params = useParams()
  const sensorId = params.id as string
  const [sensor, setSensor] = useState<Sensor | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (sensorId) {
      fetchSensorData()
    }
  }, [sensorId])

  const fetchSensorData = async () => {
    try {
      setLoading(true)
      // Mock data for now
      const mockSensor: Sensor = {
        id: sensorId,
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
        alerts: [],
        description: "High-precision temperature sensor for monitoring tomato field conditions",
        installationDate: "2024-06-15",
        manufacturer: "AgriTech Solutions",
        model: "ATS-TEMP-2024",
        firmware: "v2.1.3"
      }
      setSensor(mockSensor)
    } catch (error) {
      console.error("Failed to fetch sensor data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="w-6 h-6" />
      case 'humidity':
        return <Droplets className="w-6 h-6" />
      case 'soil_moisture':
        return <Sun className="w-6 h-6" />
      case 'light':
        return <Sun className="w-6 h-6" />
      case 'ph':
        return <Activity className="w-6 h-6" />
      default:
        return <Activity className="w-6 h-6" />
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

  if (!sensor) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Sensor Not Found</h2>
        <p className="text-muted-foreground">The requested sensor could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {getSensorIcon(sensor.type)}
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{sensor.name}</h1>
            <p className="text-muted-foreground">{sensor.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSensorData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Reading</p>
                <p className={`text-2xl font-bold ${
                  getReadingStatus(sensor) === 'alert' ? 'text-red-600' : 'text-foreground'
                }`}>
                  {sensor.lastReading} {sensor.unit}
                </p>
                <p className="text-xs text-muted-foreground">
                  Range: {sensor.threshold.min} - {sensor.threshold.max} {sensor.unit}
                </p>
              </div>
              {getReadingStatus(sensor) === 'alert' ? (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={getStatusColor(sensor.status)}>
                  {sensor.status}
                </Badge>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                sensor.status === 'online' ? 'bg-green-500' :
                sensor.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Battery</p>
                <p className={`text-2xl font-bold ${getBatteryColor(sensor.battery)}`}>
                  {sensor.battery}%
                </p>
              </div>
              <Battery className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Signal</p>
                <p className={`text-2xl font-bold ${getSignalColor(sensor.signal)}`}>
                  {sensor.signal}%
                </p>
              </div>
              <Signal className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sensor Information */}
            <Card>
              <CardHeader>
                <CardTitle>Sensor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{sensor.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{sensor.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Manufacturer</p>
                    <p className="font-medium">{sensor.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Model</p>
                    <p className="font-medium">{sensor.model}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Firmware</p>
                    <p className="font-medium">{sensor.firmware}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Installation Date</p>
                    <p className="font-medium">{new Date(sensor.installationDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Reading</span>
                    <span className="font-medium">{sensor.lastReading} {sensor.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Update</span>
                    <span className="font-medium">{new Date(sensor.lastUpdate).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Threshold Range</span>
                    <span className="font-medium">{sensor.threshold.min} - {sensor.threshold.max} {sensor.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Battery Level</span>
                    <span className="font-medium">{sensor.battery}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Signal Strength</span>
                    <span className="font-medium">{sensor.signal}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Section */}
          {sensor.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sensor.alerts.map((alert, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="text-orange-800">{alert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Data visualization and historical charts coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configuration and threshold settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Maintenance logs and scheduling coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { SensorDetail }
