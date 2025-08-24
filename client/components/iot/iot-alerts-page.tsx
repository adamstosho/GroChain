"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Sun,
  Battery,
  Signal,
  Settings,
  RefreshCw,
  Loader2
} from "lucide-react"

interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  sensorId: string
  sensorName: string
  location: string
  timestamp: string
  status: 'active' | 'acknowledged' | 'resolved'
  value: number
  unit: string
  threshold: number
  sensorType: 'temperature' | 'humidity' | 'soil_moisture' | 'light' | 'battery' | 'signal'
}

const IoTAlertsPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      // Mock data for now
      const mockAlerts: Alert[] = [
        {
          id: "1",
          type: "critical",
          title: "High Temperature Alert",
          description: "Temperature exceeds safe threshold for tomato plants",
          sensorId: "sensor1",
          sensorName: "Tomato Field Sensor 1",
          location: "Lagos Farm A",
          timestamp: "2025-01-15T10:30:00Z",
          status: "active",
          value: 38.5,
          unit: "°C",
          threshold: 35.0,
          sensorType: "temperature"
        },
        {
          id: "2",
          type: "warning",
          title: "Low Battery Warning",
          description: "Sensor battery level below 20%",
          sensorId: "sensor2",
          sensorName: "Rice Field Humidity",
          location: "Kano Farm B",
          timestamp: "2025-01-15T09:15:00Z",
          status: "acknowledged",
          value: 18,
          unit: "%",
          threshold: 20,
          sensorType: "battery"
        },
        {
          id: "3",
          type: "warning",
          title: "Weak Signal Strength",
          description: "Signal strength below optimal range",
          sensorId: "sensor3",
          sensorName: "Yam Field Soil",
          location: "Enugu Farm C",
          timestamp: "2025-01-15T08:45:00Z",
          status: "active",
          value: 45,
          unit: "%",
          threshold: 50,
          sensorType: "signal"
        }
      ]
      setAlerts(mockAlerts)
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <Bell className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800'
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="w-4 h-4" />
      case 'humidity':
        return <Droplets className="w-4 h-4" />
      case 'soil_moisture':
        return <Sun className="w-4 h-4" />
      case 'light':
        return <Sun className="w-4 h-4" />
      case 'battery':
        return <Battery className="w-4 h-4" />
      case 'signal':
        return <Signal className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged' as const }
        : alert
    ))
  }

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' as const }
        : alert
    ))
  }

  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === "all") return true
    if (activeTab === "active") return alert.status === "active"
    if (activeTab === "acknowledged") return alert.status === "acknowledged"
    if (activeTab === "resolved") return alert.status === "resolved"
    return true
  })

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
          <h1 className="text-2xl font-heading font-bold text-foreground">IoT Alerts</h1>
          <p className="text-muted-foreground">Monitor and manage system alerts from IoT sensors</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAlerts} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Alert Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">
                  {alerts.filter(a => a.status === 'active').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acknowledged</p>
                <p className="text-2xl font-bold text-foreground">
                  {alerts.filter(a => a.status === 'acknowledged').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-foreground">
                  {alerts.filter(a => a.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No alerts found for this category</p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 border-l-${alert.type === 'critical' ? 'red' : alert.type === 'warning' ? 'yellow' : 'blue'}-500`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <Badge className={getAlertColor(alert.type)}>
                            {alert.type}
                          </Badge>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{alert.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            {getSensorIcon(alert.sensorType)}
                            <span className="text-muted-foreground">Sensor:</span>
                            <span className="font-medium">{alert.sensorName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium">{alert.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Value:</span>
                            <span className="font-medium">{alert.value} {alert.unit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Threshold:</span>
                            <span className="font-medium">{alert.threshold} {alert.unit}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-3">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {alert.status === 'active' && (
                        <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(alert.id)}>
                          Acknowledge
                        </Button>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { IoTAlertsPage }
