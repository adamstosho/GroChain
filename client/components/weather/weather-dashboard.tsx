"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Cloud, 
  Sun, 
  Droplets, 
  Wind, 
  Thermometer, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"

interface WeatherData {
  location: {
    lat: number
    lng: number
    city: string
    state: string
    country: string
  }
  current: {
    temperature: number
    humidity: number
    windSpeed: number
    windDirection: string
    pressure: number
    visibility: number
    uvIndex: number
    weatherCondition: string
    weatherDescription: string
    weatherIcon: string
    feelsLike: number
    dewPoint: number
    cloudCover: number
    precipitation: number
  }
  forecast: Array<{
    date: string
    highTemp: number
    lowTemp: number
    humidity: number
    windSpeed: number
    precipitation: number
    weatherCondition: string
    weatherDescription: string
    weatherIcon: string
    uvIndex: number
  }>
  alerts: Array<{
    type: string
    severity: string
    title: string
    description: string
    startTime: string
    endTime: string
    affectedCrops: string[]
  }>
  agricultural: {
    soilMoisture: number
    soilTemperature: number
    growingDegreeDays: number
    frostRisk: string
    droughtIndex: number
    pestRisk: string
    diseaseRisk: string
    plantingSuitability: string
    plantingRecommendation: string
    irrigationAdvice: string
    pestControlAdvice: string
    diseasePreventionAdvice: string
  }
  metadata: {
    source: string
    lastUpdated: string
    dataQuality: string
    nextUpdate: string
  }
}

interface WeatherDashboardProps {
  location?: {
    lat: number
    lng: number
    city: string
    state: string
  }
  onLocationChange?: (location: { lat: number; lng: number; city: string; state: string }) => void
}

export function WeatherDashboard({ location, onLocationChange }: WeatherDashboardProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState(location)

  const { toast } = useToast()

  // Default locations for Nigeria
  const defaultLocations = [
    { name: 'Lagos', lat: 6.5244, lng: 3.3792, state: 'Lagos' },
    { name: 'Abuja', lat: 9.0820, lng: 7.3986, state: 'FCT' },
    { name: 'Kano', lat: 11.9914, lng: 8.5311, state: 'Kano' },
    { name: 'Port Harcourt', lat: 4.8156, lng: 7.0498, state: 'Rivers' }
  ]

  useEffect(() => {
    if (selectedLocation) {
      fetchWeatherData()
    }
  }, [selectedLocation])

  const fetchWeatherData = async () => {
    if (!selectedLocation) return

    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getCurrentWeather(
        selectedLocation.lat,
        selectedLocation.lng,
        selectedLocation.city || 'Unknown',
        selectedLocation.state || 'Unknown',
        'Nigeria'
      )

      if (response.status === 'success') {
        setWeatherData(response.data)
      } else {
        throw new Error(response.message || 'Failed to fetch weather data')
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err)
      setError(err.message || 'Failed to fetch weather data')
      toast({
        title: "Weather Error",
        description: err.message || 'Failed to fetch weather data',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = (location: typeof defaultLocations[0]) => {
    const newLocation = {
      lat: location.lat,
      lng: location.lng,
      city: location.name,
      state: location.state
    }
    setSelectedLocation(newLocation)
    onLocationChange?.(newLocation)
  }

  const getWeatherIcon = (condition: string, icon: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Clear': <Sun className="h-8 w-8 text-yellow-500" />,
      'Clouds': <Cloud className="h-8 w-8 text-gray-500" />,
      'Rain': <Droplets className="h-8 w-8 text-blue-500" />,
      'Snow': <Droplets className="h-8 w-8 text-blue-200" />,
      'Thunderstorm': <Cloud className="h-8 w-8 text-purple-500" />,
      'Mist': <Cloud className="h-8 w-8 text-gray-400" />,
      'Fog': <Cloud className="h-8 w-8 text-gray-300" />
    }
    return iconMap[condition] || <Cloud className="h-8 w-8 text-gray-500" />
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800 border-green-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'critical': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[severity as keyof typeof colors] || colors.low
  }

  const getRiskColor = (risk: string) => {
    const colors = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-red-600'
    }
    return colors[risk as keyof typeof colors] || colors.low
  }

  if (!selectedLocation) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Select Your Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {defaultLocations.map((location) => (
            <Card 
              key={location.name}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleLocationSelect(location)}
            >
              <CardContent className="p-4 text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold">{location.name}</h3>
                <p className="text-sm text-gray-600">{location.state}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Weather Dashboard</h2>
          <p className="text-gray-600">
            {selectedLocation.city}, {selectedLocation.state}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWeatherData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Location Selector */}
      <div className="flex flex-wrap gap-2">
        {defaultLocations.map((location) => (
          <Button
            key={location.name}
            variant={selectedLocation.city === location.name ? "default" : "outline"}
            size="sm"
            onClick={() => handleLocationSelect(location)}
          >
            {location.name}
          </Button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Loading weather data...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {weatherData && (
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Current Weather</TabsTrigger>
            <TabsTrigger value="forecast">5-Day Forecast</TabsTrigger>
            <TabsTrigger value="agricultural">Agricultural Insights</TabsTrigger>
            <TabsTrigger value="alerts">Weather Alerts</TabsTrigger>
          </TabsList>

          {/* Current Weather Tab */}
          <TabsContent value="current" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Main Weather Card */}
              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-4">
                        {getWeatherIcon(weatherData.current.weatherCondition, weatherData.current.weatherIcon)}
                        <div>
                          <h3 className="text-3xl font-bold">
                            {Math.round(weatherData.current.temperature)}°C
                          </h3>
                          <p className="text-gray-600 capitalize">
                            {weatherData.current.weatherDescription}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Feels like {Math.round(weatherData.current.feelsLike)}°C
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Last updated</p>
                      <p className="text-xs text-gray-400">
                        {new Date(weatherData.metadata.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Droplets className="h-4 w-4 mr-2" />
                    Humidity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{weatherData.current.humidity}%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Wind className="h-4 w-4 mr-2" />
                    Wind
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{weatherData.current.windSpeed} m/s</p>
                  <p className="text-xs text-gray-500">{weatherData.current.windDirection}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Visibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {Math.round(weatherData.current.visibility / 1000)} km
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Thermometer className="h-4 w-4 mr-2" />
                    Pressure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{weatherData.current.pressure} hPa</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {weatherData.forecast.map((day, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-center">
                      {getWeatherIcon(day.weatherCondition, day.weatherIcon)}
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{Math.round(day.highTemp)}°</p>
                      <p className="text-sm text-gray-500">{Math.round(day.lowTemp)}°</p>
                    </div>
                    <div className="text-center text-xs text-gray-500">
                      <p>{day.humidity}% humidity</p>
                      <p>{day.windSpeed} m/s wind</p>
                      {day.precipitation > 0 && (
                        <p>{day.precipitation}mm rain</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Agricultural Insights Tab */}
          <TabsContent value="agricultural" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Soil Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Moisture:</span>
                    <span className={getRiskColor(weatherData.agricultural.soilMoisture > 50 ? 'low' : 'high')}>
                      {Math.round(weatherData.agricultural.soilMoisture)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temperature:</span>
                    <span>{Math.round(weatherData.agricultural.soilTemperature)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Growing Degree Days:</span>
                    <span>{Math.round(weatherData.agricultural.growingDegreeDays)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Frost Risk:</span>
                    <span className={getRiskColor(weatherData.agricultural.frostRisk)}>
                      {weatherData.agricultural.frostRisk}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pest Risk:</span>
                    <span className={getRiskColor(weatherData.agricultural.pestRisk)}>
                      {weatherData.agricultural.pestRisk}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disease Risk:</span>
                    <span className={getRiskColor(weatherData.agricultural.diseaseRisk)}>
                      {weatherData.agricultural.diseaseRisk}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Planting Suitability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Badge 
                      className={
                        weatherData.agricultural.plantingSuitability === 'good' 
                          ? 'bg-green-100 text-green-800' 
                          : weatherData.agricultural.plantingSuitability === 'fair'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {weatherData.agricultural.plantingSuitability}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-sm">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Planting</h4>
                    <p className="text-sm text-gray-600">{weatherData.agricultural.plantingRecommendation}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Irrigation</h4>
                    <p className="text-sm text-gray-600">{weatherData.agricultural.irrigationAdvice}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Pest Control</h4>
                    <p className="text-sm text-gray-600">{weatherData.agricultural.pestControlAdvice}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Disease Prevention</h4>
                    <p className="text-sm text-gray-600">{weatherData.agricultural.diseasePreventionAdvice}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Weather Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {weatherData.alerts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                  <p className="text-gray-600">There are no weather alerts for your area at this time.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {weatherData.alerts.map((alert, index) => (
                  <Alert key={index} className={getSeverityColor(alert.severity)}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription className="mt-2">
                      <p>{alert.description}</p>
                      {alert.affectedCrops.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Affected Crops:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {alert.affectedCrops.map((crop, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {crop}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Valid: {new Date(alert.startTime).toLocaleString()} - {new Date(alert.endTime).toLocaleString()}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
