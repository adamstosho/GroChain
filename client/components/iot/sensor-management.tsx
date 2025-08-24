"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Sun, 
  Battery, 
  Signal, 
  MapPin, 
  Plus,
  Search,
  Filter,
  Settings,
  RefreshCw,
  Loader2,
  Edit,
  Trash2
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

const SensorManagement = () => {
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    fetchSensors()
  }, [])

  const fetchSensors = async () => {
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
      console.error("Failed to fetch sensors:", error)
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

  const filteredSensors = sensors.filter(sensor => {
    const matchesSearch = sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sensor.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || sensor.type === filterType
    return matchesSearch && matchesFilter
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
          <h1 className="text-2xl font-heading font-bold text-foreground">Sensor Management</h1>
          <p className="text-muted-foreground">Manage and configure IoT sensors across all farms</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSensors} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Sensor
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search sensors by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All Types</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="soil_moisture">Soil Moisture</option>
                <option value="light">Light</option>
                <option value="ph">pH</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensors List */}
      <div className="space-y-4">
        {filteredSensors.map((sensor) => (
          <Card key={sensor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {getSensorIcon(sensor.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{sensor.name}</h3>
                      <Badge className={getStatusColor(sensor.status)}>
                        {sensor.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {sensor.type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{sensor.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Reading:</span>
                        <span className="font-medium">{sensor.lastReading} {sensor.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Battery className={`w-4 h-4 ${getBatteryColor(sensor.battery)}`} />
                        <span className="text-muted-foreground">Battery:</span>
                        <span className="font-medium">{sensor.battery}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Signal className={`w-4 h-4 ${getSignalColor(sensor.signal)}`} />
                        <span className="text-muted-foreground">Signal:</span>
                        <span className="font-medium">{sensor.signal}%</span>
                      </div>
                    </div>

                    {sensor.alerts.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-orange-600 font-medium">Alerts:</p>
                        {sensor.alerts.map((alert, index) => (
                          <p key={index} className="text-xs text-orange-600">• {alert}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSensors.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No sensors found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { SensorManagement }
