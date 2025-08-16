"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Plus, Edit, Trash2, Wifi, WifiOff, AlertTriangle, ArrowLeft } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import Link from "next/link"

interface Sensor {
  id: string
  name: string
  type: "temperature" | "humidity" | "soil_moisture" | "ph" | "light"
  location: string
  status: "online" | "offline" | "warning"
  enabled: boolean
  alertsEnabled: boolean
  thresholds: {
    min: number
    max: number
  }
}

const mockSensors: Sensor[] = [
  {
    id: "sensor_1",
    name: "Temperature Sensor A",
    type: "temperature",
    location: "Field A - North Section",
    status: "online",
    enabled: true,
    alertsEnabled: true,
    thresholds: { min: 15, max: 35 },
  },
  {
    id: "sensor_2",
    name: "Soil Moisture B",
    type: "soil_moisture",
    location: "Field B - South Section",
    status: "warning",
    enabled: true,
    alertsEnabled: true,
    thresholds: { min: 30, max: 80 },
  },
  {
    id: "sensor_3",
    name: "Humidity Monitor",
    type: "humidity",
    location: "Greenhouse 1",
    status: "online",
    enabled: true,
    alertsEnabled: false,
    thresholds: { min: 40, max: 80 },
  },
]

// Mock user for layout
const mockUser = {
  id: "1",
  name: "John Farmer",
  email: "john@farm.com",
  role: "farmer",
  avatar: "/placeholder.svg",
}

export function SensorManagement() {
  const [sensors, setSensors] = useState<Sensor[]>(mockSensors)
  const [activeTab, setActiveTab] = useState("sensors")
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null)

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

  const toggleSensorEnabled = (sensorId: string) => {
    setSensors((prev) =>
      prev.map((sensor) => (sensor.id === sensorId ? { ...sensor, enabled: !sensor.enabled } : sensor)),
    )
  }

  const toggleAlertsEnabled = (sensorId: string) => {
    setSensors((prev) =>
      prev.map((sensor) => (sensor.id === sensorId ? { ...sensor, alertsEnabled: !sensor.alertsEnabled } : sensor)),
    )
  }

  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/iot">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to IoT Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Sensor Management</h1>
            <p className="text-muted-foreground">Configure and manage your IoT sensors</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
            <TabsTrigger value="add">Add Sensor</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="sensors" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("add")}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Sensor
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {sensors.map((sensor, index) => (
                <motion.div
                  key={sensor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(sensor.status)}
                          <div>
                            <CardTitle className="text-lg">{sensor.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {sensor.type.replace("_", " ").toUpperCase()} • {sensor.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(sensor.status)}
                          <Button variant="ghost" size="sm" onClick={() => setEditingSensor(sensor)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`enabled-${sensor.id}`}>Sensor Enabled</Label>
                          <Switch
                            id={`enabled-${sensor.id}`}
                            checked={sensor.enabled}
                            onCheckedChange={() => toggleSensorEnabled(sensor.id)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`alerts-${sensor.id}`}>Alerts Enabled</Label>
                          <Switch
                            id={`alerts-${sensor.id}`}
                            checked={sensor.alertsEnabled}
                            onCheckedChange={() => toggleAlertsEnabled(sensor.id)}
                          />
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Thresholds</p>
                          <p className="font-medium">
                            {sensor.thresholds.min} - {sensor.thresholds.max}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-primary" />
                  Add New Sensor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sensor-name">Sensor Name</Label>
                    <Input id="sensor-name" placeholder="e.g., Temperature Sensor A" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sensor-type">Sensor Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sensor type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temperature">Temperature</SelectItem>
                        <SelectItem value="humidity">Humidity</SelectItem>
                        <SelectItem value="soil_moisture">Soil Moisture</SelectItem>
                        <SelectItem value="ph">pH Level</SelectItem>
                        <SelectItem value="light">Light Intensity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sensor-location">Location</Label>
                  <Input id="sensor-location" placeholder="e.g., Field A - North Section" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-threshold">Minimum Threshold</Label>
                    <Input id="min-threshold" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-threshold">Maximum Threshold</Label>
                    <Input id="max-threshold" type="number" placeholder="100" />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setActiveTab("sensors")}>
                    Cancel
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sensor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-primary" />
                  Global Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-sync Enabled</h4>
                      <p className="text-sm text-muted-foreground">Automatically sync sensor data every 5 minutes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Alerts</h4>
                      <p className="text-sm text-muted-foreground">Receive email notifications for sensor alerts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS Alerts</h4>
                      <p className="text-sm text-muted-foreground">Receive SMS notifications for critical alerts</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Retention</h4>
                      <p className="text-sm text-muted-foreground">Keep sensor data for analysis</p>
                    </div>
                    <Select defaultValue="90">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">6 months</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
