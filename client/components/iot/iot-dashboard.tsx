"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Progress } from "@/components/ui/Progress"
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
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

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
  timestamp: string
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
  },
]

const mockStats = {
  totalSensors: 12,
  onlineSensors: 9,
  alertsCount: 3,
  avgBattery: 74,
}

export function IoTDashboard() {
  const { user } = useAuth()
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState(mockStats)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
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
            lastReading: { value: s.readings?.[s.readings.length-1]?.value ?? 0, unit: s.readings?.[s.readings.length-1]?.unit ?? '', timestamp: s.readings?.[s.readings.length-1]?.timestamp ?? new Date().toISOString() },
            batteryLevel: s.batteryLevel ?? 100,
          }))
          setSensors(mapped)
          setStats({
            totalSensors: mapped.length,
            onlineSensors: mapped.filter(x=> x.status==='online').length,
            alertsCount: 0,
            avgBattery: Math.round(mapped.reduce((a,b)=> a + (b.batteryLevel||0),0)/Math.max(mapped.length,1)),
          })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
        return <Settings className="w-5 h-5 text-muted-foreground" />
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
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">IoT Dashboard</h1>
            <p className="text-muted-foreground">Monitor your farm sensors and environmental conditions</p>
          </div>
          <div className="flex gap-2">
            <Link href="/iot/monitoring">
              <Button variant="outline" size="lg" className="bg-transparent">
                <Activity className="w-4 h-4 mr-2" />
                Live Monitoring
              </Button>
            </Link>
            <Link href="/iot/alerts">
              <Button variant="outline" size="lg" className="bg-transparent">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Alerts
              </Button>
            </Link>
            <Link href="/iot/sensors">
              <Button variant="outline" size="lg" className="bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                Manage Sensors
              </Button>
            </Link>
            <Button size="lg">
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
                        <p className="text-2xl font-bold text-foreground">{stats.totalSensors}</p>
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
                        <p className="text-2xl font-bold text-foreground">{stats.onlineSensors}</p>
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
                        <p className="text-2xl font-bold text-foreground">{stats.alertsCount}</p>
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
                        <p className="text-2xl font-bold text-foreground">{stats.avgBattery}%</p>
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
      </div>
    </DashboardLayout>
  )
}
