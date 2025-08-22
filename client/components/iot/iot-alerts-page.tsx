"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  Settings,
  Trash2,
  ArrowLeft,
  Wifi,
  WifiOff,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Zap,
  Activity,
  Eye,
  EyeOff,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { toast } from "sonner"

interface SensorAlert {
  id: string
  sensorId: string
  sensorName: string
  sensorType: string
  alertType: "critical" | "warning" | "info"
  message: string
  value: number
  threshold: number
  timestamp: string
  status: "active" | "resolved" | "acknowledged"
  priority: "high" | "medium" | "low"
}

interface AlertSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  criticalAlerts: boolean
  warningAlerts: boolean
  infoAlerts: boolean
  quietHours: boolean
  quietStart: string
  quietEnd: string
}

const mockAlerts: SensorAlert[] = [
  {
    id: "alert_1",
    sensorId: "sensor_1",
    sensorName: "Temperature Sensor A",
    sensorType: "temperature",
    alertType: "critical",
    message: "Temperature exceeded critical threshold",
    value: 38.5,
    threshold: 35,
    timestamp: "2025-01-16T10:30:00Z",
    status: "active",
    priority: "high"
  },
  {
    id: "alert_2",
    sensorId: "sensor_2",
    sensorName: "Soil Moisture B",
    sensorType: "soil_moisture",
    alertType: "warning",
    message: "Low battery level",
    value: 20,
    threshold: 25,
    timestamp: "2025-01-16T10:25:00Z",
    status: "active",
    priority: "medium"
  },
  {
    id: "alert_3",
    sensorId: "sensor_3",
    sensorName: "pH Sensor C",
    sensorType: "ph",
    alertType: "warning",
    message: "Sensor offline for extended period",
    value: 0,
    threshold: 0,
    timestamp: "2025-01-16T08:15:00Z",
    status: "acknowledged",
    priority: "medium"
  }
]

export function IoTAlertsPage() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<SensorAlert[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    emailNotifications: true,
    pushNotifications: true,
    criticalAlerts: true,
    warningAlerts: true,
    infoAlerts: false,
    quietHours: false,
    quietStart: "22:00",
    quietEnd: "06:00"
  })

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      // In a real implementation, this would fetch from the API
      // For now, we'll use mock data but structure it for easy API integration
      setAlerts(mockAlerts)
      
      // Example of how to fetch real alerts when API is ready:
      // const resp = await api.getSensorAlerts("all")
      // if (resp.success && resp.data) {
      //   setAlerts(resp.data)
      // }
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
      toast.error("Failed to load alerts")
    } finally {
      setLoading(false)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      // In a real implementation, this would call the API
      // await api.resolveSensorAlert(sensorId, alertIndex)
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved' as const }
          : alert
      ))
      toast.success("Alert resolved successfully")
    } catch (error) {
      console.error("Failed to resolve alert:", error)
      toast.error("Failed to resolve alert")
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'acknowledged' as const }
          : alert
      ))
      toast.success("Alert acknowledged")
    } catch (error) {
      console.error("Failed to acknowledge alert:", error)
      toast.error("Failed to acknowledge alert")
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      toast.success("Alert deleted")
    } catch (error) {
      console.error("Failed to delete alert:", error)
      toast.error("Failed to delete alert")
    }
  }

  const updateAlertSettings = (key: keyof AlertSettings, value: boolean | string) => {
    setAlertSettings(prev => ({ ...prev, [key]: value }))
    toast.success("Alert settings updated")
  }

  const getFilteredAlerts = () => {
    let filtered = alerts

    if (filterType !== "all") {
      filtered = filtered.filter(alert => alert.alertType === filterType)
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter(alert => alert.priority === filterPriority)
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(alert => alert.status === filterStatus)
    }

    return filtered
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "temperature":
        return <Thermometer className="w-4 h-4 text-orange-500" />
      case "humidity":
        return <Droplets className="w-4 h-4 text-blue-500" />
      case "soil_moisture":
        return <Droplets className="w-4 h-4 text-brown-500" />
      case "ph":
        return <Wind className="w-4 h-4 text-purple-500" />
      case "light":
        return <Sun className="w-4 h-4 text-yellow-500" />
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getAlertTypeBadge = (type: SensorAlert["alertType"]) => {
    switch (type) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "warning":
        return <Badge variant="secondary">Warning</Badge>
      case "info":
        return <Badge variant="outline">Info</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getPriorityBadge = (priority: SensorAlert["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="secondary">Medium</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: SensorAlert["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="destructive">Active</Badge>
      case "acknowledged":
        return <Badge variant="secondary">Acknowledged</Badge>
      case "resolved":
        return <Badge variant="default">Resolved</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAlertCount = (type: string) => {
    return alerts.filter(alert => alert.alertType === type).length
  }

  const getActiveAlertCount = () => {
    return alerts.filter(alert => alert.status === "active").length
  }

  const filteredAlerts = getFilteredAlerts()

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
              <h1 className="text-2xl font-heading font-bold text-foreground">IoT Alerts</h1>
              <p className="text-muted-foreground">Manage sensor alerts and notifications</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchAlerts}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                    <p className="text-2xl font-bold text-destructive">{getActiveAlertCount()}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-destructive" />
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
                    <p className="text-sm font-medium text-muted-foreground">Critical</p>
                    <p className="text-2xl font-bold text-destructive">{getAlertCount("critical")}</p>
                  </div>
                  <Zap className="w-8 h-8 text-destructive" />
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
                    <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                    <p className="text-2xl font-bold text-warning">{getAlertCount("warning")}</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
                  </div>
                  <Bell className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="type-filter">Type:</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="priority-filter">Priority:</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="status-filter">Status:</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Alerts ({alerts.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({getActiveAlertCount()})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={`border-l-4 ${
                    alert.alertType === 'critical' ? 'border-l-destructive' :
                    alert.alertType === 'warning' ? 'border-l-warning' :
                    'border-l-primary'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {getAlertIcon(alert.sensorType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-foreground">{alert.sensorName}</h4>
                              {getAlertTypeBadge(alert.alertType)}
                              {getPriorityBadge(alert.priority)}
                              {getStatusBadge(alert.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Value: {alert.value}</span>
                              <span>Threshold: {alert.threshold}</span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(alert.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {alert.status === 'active' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => acknowledgeAlert(alert.id)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Acknowledge
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => resolveAlert(alert.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Resolve
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAlert(alert.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No alerts found with the current filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {alerts.filter(alert => alert.status === 'active').length > 0 ? (
              alerts
                .filter(alert => alert.status === 'active')
                .map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className={`border-l-4 ${
                      alert.alertType === 'critical' ? 'border-l-destructive' :
                      alert.alertType === 'warning' ? 'border-l-warning' :
                      'border-l-primary'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {getAlertIcon(alert.sensorType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-foreground">{alert.sensorName}</h4>
                                {getAlertTypeBadge(alert.alertType)}
                                {getPriorityBadge(alert.priority)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>Value: {alert.value}</span>
                                <span>Threshold: {alert.threshold}</span>
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(alert.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Acknowledge
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <p className="text-muted-foreground">No active alerts</p>
                  <p className="text-sm text-muted-foreground mt-2">All alerts have been resolved or acknowledged</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={alertSettings.emailNotifications}
                      onCheckedChange={(checked) => updateAlertSettings('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts via push notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={alertSettings.pushNotifications}
                      onCheckedChange={(checked) => updateAlertSettings('pushNotifications', checked)}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Alert Types</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="critical-alerts">Critical Alerts</Label>
                        <p className="text-sm text-muted-foreground">Immediate action required</p>
                      </div>
                      <Switch
                        id="critical-alerts"
                        checked={alertSettings.criticalAlerts}
                        onCheckedChange={(checked) => updateAlertSettings('criticalAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="warning-alerts">Warning Alerts</Label>
                        <p className="text-sm text-muted-foreground">Attention needed soon</p>
                      </div>
                      <Switch
                        id="warning-alerts"
                        checked={alertSettings.warningAlerts}
                        onCheckedChange={(checked) => updateAlertSettings('warningAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="info-alerts">Info Alerts</Label>
                        <p className="text-sm text-muted-foreground">Informational only</p>
                      </div>
                      <Switch
                        id="info-alerts"
                        checked={alertSettings.infoAlerts}
                        onCheckedChange={(checked) => updateAlertSettings('infoAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Quiet Hours</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
                        <p className="text-sm text-muted-foreground">Reduce notifications during specified hours</p>
                      </div>
                      <Switch
                        id="quiet-hours"
                        checked={alertSettings.quietHours}
                        onCheckedChange={(checked) => updateAlertSettings('quietHours', checked)}
                      />
                    </div>

                    {alertSettings.quietHours && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="quiet-start">Start Time</Label>
                          <input
                            type="time"
                            id="quiet-start"
                            value={alertSettings.quietStart}
                            onChange={(e) => updateAlertSettings('quietStart', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="quiet-end">End Time</Label>
                          <input
                            type="time"
                            id="quiet-end"
                            value={alertSettings.quietEnd}
                            onChange={(e) => updateAlertSettings('quietEnd', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    )}
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
