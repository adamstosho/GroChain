"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertTriangle, 
  TrendingUp,
  MapPin,
  Calendar,
  RefreshCw,
  Download
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface WeatherData {
  location: {
    name: string
    country: string
    lat: number
    lon: number
  }
  current: {
    temp_c: number
    temp_f: number
    condition: {
      text: string
      icon: string
    }
    wind_kph: number
    humidity: number
    pressure_mb: number
    uv: number
  }
}

interface ForecastData {
  date: string
  day: {
    maxtemp_c: number
    mintemp_c: number
    condition: {
      text: string
      icon: string
    }
    chance_of_rain: number
  }
}

interface AgriculturalInsight {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high"
  category: "irrigation" | "planting" | "harvesting" | "pest_control"
  recommendations: string[]
}

interface WeatherAlert {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  validFrom: string
  validTo: string
  regions: string[]
}

export function WeatherDashboard() {
  const { user } = useAuth()
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [insights, setInsights] = useState<AgriculturalInsight[]>([])
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState({ lat: 9.0765, lng: 7.3986 }) // Default to Abuja
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("FCT")

  const nigerianStates = [
    "FCT", "Lagos", "Kano", "Kaduna", "Rivers", "Ogun", "Oyo", "Delta", 
    "Anambra", "Edo", "Imo", "Plateau", "Cross River", "Akwa Ibom", "Sokoto"
  ]

  useEffect(() => {
    fetchWeatherData()
  }, [location, selectedRegion])

  const fetchWeatherData = async () => {
    setLoading(true)
    try {
      // Fetch current weather
      const currentResponse = await apiClient.getCurrentWeather({
        lat: location.lat,
        lng: location.lng,
        country: "Nigeria"
      })

      if (currentResponse.success) {
        setCurrentWeather(currentResponse.data)
      }

      // Fetch forecast
      const forecastResponse = await apiClient.getWeatherForecast({
        lat: location.lat,
        lng: location.lng,
        country: "Nigeria",
        days: 7
      })

      if (forecastResponse.success) {
        setForecast(forecastResponse.data?.forecast || [])
      }

      // Fetch agricultural insights
      const insightsResponse = await apiClient.getAgriculturalInsights({
        lat: location.lat,
        lng: location.lng,
        country: "Nigeria"
      })

      if (insightsResponse.success) {
        setInsights(insightsResponse.data?.insights || mockInsights)
      }

      // Fetch weather alerts
      const alertsResponse = await apiClient.getWeatherAlerts({
        lat: location.lat,
        lng: location.lng,
        country: "Nigeria"
      })

      if (alertsResponse.success) {
        setAlerts(alertsResponse.data?.alerts || mockAlerts)
      }

    } catch (error) {
      console.error("Error fetching weather data:", error)
      // Use mock data for demo
      setCurrentWeather(mockCurrentWeather)
      setForecast(mockForecast)
      setInsights(mockInsights)
      setAlerts(mockAlerts)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) return
    
    try {
      // You could implement geocoding here or use a simpler approach
      // For now, we'll use some common Nigerian cities
      const cities: Record<string, { lat: number, lng: number }> = {
        "lagos": { lat: 6.5244, lng: 3.3792 },
        "abuja": { lat: 9.0765, lng: 7.3986 },
        "kano": { lat: 12.0022, lng: 8.5920 },
        "port harcourt": { lat: 4.8156, lng: 7.0498 },
        "ibadan": { lat: 7.3775, lng: 3.9470 }
      }
      
      const cityKey = searchLocation.toLowerCase()
      if (cities[cityKey]) {
        setLocation(cities[cityKey])
      }
    } catch (error) {
      console.error("Error searching location:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "medium": return "bg-yellow-500"
      case "low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getWeatherIcon = (condition: string) => {
    if (condition.includes("sun") || condition.includes("clear")) return <Sun className="h-8 w-8 text-yellow-500" />
    if (condition.includes("rain")) return <CloudRain className="h-8 w-8 text-blue-500" />
    if (condition.includes("cloud")) return <Cloud className="h-8 w-8 text-gray-500" />
    return <Sun className="h-8 w-8 text-yellow-500" />
  }

  // Mock data for demo
  const mockCurrentWeather: WeatherData = {
    location: { name: "Abuja", country: "Nigeria", lat: 9.0765, lon: 7.3986 },
    current: {
      temp_c: 28,
      temp_f: 82,
      condition: { text: "Partly cloudy", icon: "partly-cloudy" },
      wind_kph: 15,
      humidity: 65,
      pressure_mb: 1013,
      uv: 7
    }
  }

  const mockForecast: ForecastData[] = [
    { date: "2025-01-17", day: { maxtemp_c: 32, mintemp_c: 22, condition: { text: "Sunny", icon: "sunny" }, chance_of_rain: 10 }},
    { date: "2025-01-18", day: { maxtemp_c: 30, mintemp_c: 21, condition: { text: "Partly cloudy", icon: "partly-cloudy" }, chance_of_rain: 20 }},
    { date: "2025-01-19", day: { maxtemp_c: 29, mintemp_c: 20, condition: { text: "Light rain", icon: "rain" }, chance_of_rain: 70 }},
    { date: "2025-01-20", day: { maxtemp_c: 31, mintemp_c: 23, condition: { text: "Sunny", icon: "sunny" }, chance_of_rain: 5 }},
    { date: "2025-01-21", day: { maxtemp_c: 33, mintemp_c: 24, condition: { text: "Hot", icon: "sunny" }, chance_of_rain: 0 }},
  ]

  const mockInsights: AgriculturalInsight[] = [
    {
      id: "1",
      title: "Optimal Irrigation Window",
      description: "Current humidity levels suggest reduced irrigation needs for the next 3 days.",
      severity: "medium",
      category: "irrigation",
      recommendations: ["Reduce watering frequency by 30%", "Monitor soil moisture levels", "Schedule next irrigation for Thursday"]
    },
    {
      id: "2",
      title: "Pest Risk Alert",
      description: "High humidity and temperature conditions favor aphid development.",
      severity: "high",
      category: "pest_control",
      recommendations: ["Inspect crops daily", "Apply organic pest control", "Increase air circulation"]
    }
  ]

  const mockAlerts: WeatherAlert[] = [
    {
      id: "1",
      title: "Heavy Rainfall Warning",
      description: "Expect heavy rainfall in the next 24-48 hours. Take protective measures for crops.",
      severity: "high",
      validFrom: "2025-01-17T12:00:00Z",
      validTo: "2025-01-19T06:00:00Z",
      regions: ["FCT", "Niger", "Kaduna"]
    }
  ]

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading weather data...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold">Weather Services</h1>
            <p className="text-muted-foreground">
              Real-time weather data and agricultural insights for smart farming
            </p>
          </div>
          
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Search location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                className="w-48"
              />
              <Button onClick={handleLocationSearch} size="sm">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {nigerianStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={fetchWeatherData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Current Weather */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Current Weather - {currentWeather?.location.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-4">
                  {getWeatherIcon(currentWeather?.current.condition.text || "")}
                  <div>
                    <p className="text-3xl font-bold">{currentWeather?.current.temp_c}°C</p>
                    <p className="text-sm text-muted-foreground">{currentWeather?.current.condition.text}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Wind className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">{currentWeather?.current.wind_kph} km/h</p>
                    <p className="text-sm text-muted-foreground">Wind Speed</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">{currentWeather?.current.humidity}%</p>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-semibold">{currentWeather?.current.pressure_mb} mb</p>
                    <p className="text-sm text-muted-foreground">Pressure</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for different views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="forecast" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
              <TabsTrigger value="insights">Agricultural Insights</TabsTrigger>
              <TabsTrigger value="alerts">Weather Alerts</TabsTrigger>
              <TabsTrigger value="statistics">Regional Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="forecast" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {forecast.map((day, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <p className="font-semibold">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        {getWeatherIcon(day.day.condition.text)}
                        <div>
                          <p className="text-lg font-bold">{day.day.maxtemp_c}°</p>
                          <p className="text-sm text-muted-foreground">{day.day.mintemp_c}°</p>
                        </div>
                        <p className="text-xs">{day.day.condition.text}</p>
                        <div className="flex items-center justify-center space-x-1">
                          <Droplets className="h-3 w-3 text-blue-500" />
                          <span className="text-xs">{day.day.chance_of_rain}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {insights.map((insight) => (
                  <Card key={insight.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <Badge className={getSeverityColor(insight.severity)}>
                          {insight.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{insight.description}</p>
                      <div className="space-y-2">
                        <p className="font-semibold text-sm">Recommendations:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-muted-foreground">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className="border-l-4 border-orange-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <span>{alert.title}</span>
                          </CardTitle>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{alert.description}</p>
                        <div className="flex flex-col space-y-2 text-sm">
                          <p><strong>Valid:</strong> {new Date(alert.validFrom).toLocaleString()} - {new Date(alert.validTo).toLocaleString()}</p>
                          <p><strong>Affected Regions:</strong> {alert.regions.join(", ")}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No active weather alerts for your region</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Regional Temperature</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Average</span>
                        <span className="font-semibold">26°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maximum</span>
                        <span className="font-semibold">35°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minimum</span>
                        <span className="font-semibold">18°C</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rainfall Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>This Month</span>
                        <span className="font-semibold">120mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Month</span>
                        <span className="font-semibold">85mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Average</span>
                        <span className="font-semibold">1,200mm</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Growing Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Soil Moisture</span>
                        <Badge className="bg-green-500">Optimal</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>UV Index</span>
                        <Badge className="bg-yellow-500">Moderate</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Wind Speed</span>
                        <Badge className="bg-green-500">Good</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
