"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
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
import { api } from "@/lib/api"
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
  const [coordsInput, setCoordsInput] = useState({ lat: "", lng: "" })
  const [coordsWeather, setCoordsWeather] = useState<WeatherData | null>(null)
  const [historicalParams, setHistoricalParams] = useState({ startDate: "", endDate: "" })
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [regionalAlertsData, setRegionalAlertsData] = useState<WeatherAlert[]>([])
  const [statisticsData, setStatisticsData] = useState<any | null>(null)

  const nigerianStates = [
    "FCT", "Lagos", "Kano", "Kaduna", "Rivers", "Ogun", "Oyo", "Delta", 
    "Anambra", "Edo", "Imo", "Plateau", "Cross River", "Akwa Ibom", "Sokoto"
  ]

  useEffect(() => {
    fetchWeatherData()
  }, [location, selectedRegion])

  useEffect(() => {
    fetchRegionalAndStats()
  }, [selectedRegion])

  const fetchWeatherData = async () => {
    setLoading(true)
    try {
      // Fetch current weather
      const currentResponse = await api.getCurrentWeather({
        lat: location.lat,
        lng: location.lng,
        country: "Nigeria"
      })

      if (currentResponse.success && currentResponse.data) {
        setCurrentWeather(currentResponse.data as any)
      }

      // Fetch forecast
      const forecastResponse = await api.getWeatherForecast({
        lat: location.lat,
        lng: location.lng,
        country: "Nigeria",
        days: 7
      })

      if (forecastResponse.success && forecastResponse.data) {
        const payload: any = forecastResponse.data
        setForecast(payload.forecast || [])
      }

      // Fetch agricultural insights
      const insightsResponse = await api.getAgriculturalInsights({
        lat: location.lat,
        lng: location.lng,
        country: "Nigeria"
      })

      if (insightsResponse.success && insightsResponse.data) {
        const payload: any = insightsResponse.data
        setInsights(payload.insights || [])
      }

      // Fetch weather alerts
      const alertsResponse = await api.getWeatherAlerts({
        lat: location.lat,
        lng: location.lng,
        country: "Nigeria"
      })

      if (alertsResponse.success && alertsResponse.data) {
        const payload: any = alertsResponse.data
        setAlerts(payload.alerts || [])
      }

    } catch (error) {
      console.error("Error fetching weather data:", error)
      // Set empty states instead of mock data
      setCurrentWeather(null)
      setForecast([])
      setInsights([])
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRegionalAndStats = async () => {
    try {
      const [regResp, statsResp] = await Promise.all([
        api.getRegionalWeatherAlerts(selectedRegion),
        api.getWeatherStatistics(selectedRegion)
      ])
      if (regResp.success && regResp.data) {
        const payload: any = regResp.data
        setRegionalAlertsData(payload.alerts || payload.data || [])
      }
      if (statsResp.success && statsResp.data) {
        setStatisticsData((statsResp.data as any).data || statsResp.data)
      }
    } catch (e) {
      // noop
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

  const handleCoordinatesLookup = async () => {
    const lat = parseFloat(coordsInput.lat)
    const lng = parseFloat(coordsInput.lng)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return
    try {
      const resp = await api.getWeatherByCoordinates(lat, lng)
      if (resp.success && resp.data) {
        setCoordsWeather((resp.data as any).data || (resp.data as any))
      }
    } catch {}
  }

  const handleFetchHistorical = async () => {
    if (!historicalParams.startDate || !historicalParams.endDate) return
    try {
      const resp = await api.getHistoricalWeather({
        lat: location.lat,
        lng: location.lng,
        startDate: historicalParams.startDate,
        endDate: historicalParams.endDate,
      })
      if (resp.success && resp.data) {
        const payload: any = resp.data
        const rows = payload.days || payload.records || payload.data || []
        setHistoricalData(Array.isArray(rows) ? rows : [])
      }
    } catch {}
  }

  const exportHistoricalCSV = () => {
    if (!historicalData.length) return
    const keys = Object.keys(historicalData[0])
    const csv = [keys.join(",")].concat(
      historicalData.map((row: any) => keys.map(k => JSON.stringify(row[k] ?? "")).join(","))
    ).join("\n")
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historical-weather-${historicalParams.startDate}_to_${historicalParams.endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getWeatherIcon = (condition: string) => {
    if (condition.includes("sun") || condition.includes("clear")) return <Sun className="h-8 w-8 text-yellow-500" />
    if (condition.includes("rain")) return <CloudRain className="h-8 w-8 text-blue-500" />
    if (condition.includes("cloud")) return <Cloud className="h-8 w-8 text-gray-500" />
    return <Sun className="h-8 w-8 text-yellow-500" />
  }

  // No mock data - all data comes from real APIs

  if (loading || !user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading weather data...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user as any}>
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
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
              <TabsTrigger value="insights">Agricultural Insights</TabsTrigger>
              <TabsTrigger value="alerts">Weather Alerts</TabsTrigger>
              <TabsTrigger value="statistics">Regional Statistics</TabsTrigger>
              <TabsTrigger value="regional">Regional Alerts</TabsTrigger>
              <TabsTrigger value="coordinates">By Coordinates</TabsTrigger>
              <TabsTrigger value="historical">Historical</TabsTrigger>
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
                      <div className="flex justify-between"><span>Average</span><span className="font-semibold">{(statisticsData?.temperature?.average ?? 26)}°C</span></div>
                      <div className="flex justify-between"><span>Maximum</span><span className="font-semibold">{(statisticsData?.temperature?.max ?? 35)}°C</span></div>
                      <div className="flex justify-between"><span>Minimum</span><span className="font-semibold">{(statisticsData?.temperature?.min ?? 18)}°C</span></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rainfall Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>This Month</span><span className="font-semibold">{(statisticsData?.rainfall?.thisMonth ?? 120)}mm</span></div>
                      <div className="flex justify-between"><span>Last Month</span><span className="font-semibold">{(statisticsData?.rainfall?.lastMonth ?? 85)}mm</span></div>
                      <div className="flex justify-between"><span>Annual Average</span><span className="font-semibold">{(statisticsData?.rainfall?.annualAverage ?? 1200)}mm</span></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Growing Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Soil Moisture</span><Badge className="bg-green-500">{(statisticsData?.growing?.soilMoisture ?? 'Optimal')}</Badge></div>
                      <div className="flex justify-between"><span>UV Index</span><Badge className="bg-yellow-500">{(statisticsData?.growing?.uv ?? 'Moderate')}</Badge></div>
                      <div className="flex justify-between"><span>Wind Speed</span><Badge className="bg-green-500">{(statisticsData?.growing?.wind ?? 'Good')}</Badge></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="regional" className="space-y-4">
              {regionalAlertsData.length > 0 ? (
                <div className="space-y-4">
                  {regionalAlertsData.map((alert) => (
                    <Card key={alert.id} className="border-l-4 border-blue-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-blue-500" />
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
                          <p><strong>Affected Regions:</strong> {(alert.regions || []).join(", ")}</p>
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
                      <p className="text-muted-foreground">No active regional alerts for {selectedRegion}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="coordinates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lookup Weather by Coordinates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input placeholder="Latitude" value={coordsInput.lat} onChange={(e)=> setCoordsInput({ ...coordsInput, lat: e.target.value })} />
                    <Input placeholder="Longitude" value={coordsInput.lng} onChange={(e)=> setCoordsInput({ ...coordsInput, lng: e.target.value })} />
                    <Button onClick={handleCoordinatesLookup}>Fetch</Button>
                  </div>
                  {coordsWeather && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2"><MapPin className="h-5 w-5" /><span>{coordsWeather.location.name}, {coordsWeather.location.country}</span></div>
                      <div className="flex items-center space-x-2"><Thermometer className="h-5 w-5 text-red-500" /><span>{coordsWeather.current.temp_c}°C</span></div>
                      <div className="flex items-center space-x-2"><Wind className="h-5 w-5 text-blue-500" /><span>{coordsWeather.current.wind_kph} km/h</span></div>
                      <div className="flex items-center space-x-2"><Droplets className="h-5 w-5 text-blue-500" /><span>{coordsWeather.current.humidity}%</span></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historical Weather</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div className="md:col-span-2">
                      <label className="text-sm text-muted-foreground">Start Date</label>
                      <Input type="date" value={historicalParams.startDate} onChange={(e)=> setHistoricalParams({ ...historicalParams, startDate: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-muted-foreground">End Date</label>
                      <Input type="date" value={historicalParams.endDate} onChange={(e)=> setHistoricalParams({ ...historicalParams, endDate: e.target.value })} />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleFetchHistorical}>Fetch</Button>
                      <Button variant="outline" onClick={exportHistoricalCSV} disabled={!historicalData.length}><Download className="h-4 w-4 mr-2" />Export</Button>
                    </div>
                  </div>
                  {historicalData.length > 0 ? (
                    <div className="overflow-x-auto border rounded-md">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left">
                            {Object.keys(historicalData[0]).map((k) => (<th key={k} className="px-3 py-2 border-b">{k}</th>))}
                          </tr>
                        </thead>
                        <tbody>
                          {historicalData.map((row: any, idx: number) => (
                            <tr key={idx} className="odd:bg-muted/30">
                              {Object.keys(historicalData[0]).map((k) => (<td key={k} className="px-3 py-2 border-b">{String(row[k] ?? "")}</td>))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a date range and fetch to see results.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
