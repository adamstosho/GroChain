"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { apiService } from "@/lib/api"
import { useAuthStore } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useGeolocation } from "@/hooks/useGeolocation"
import { Cloud, Sun, CloudRain, Wind, Droplets, Calendar, Thermometer, Droplets as HumidityIcon, Navigation, RefreshCw, MapPin } from "lucide-react"

export function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isForecastLoading, setIsForecastLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<string>("")
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { location: geoLocation, loading: geoLoading, error: geoError, requestLocation } = useGeolocation()

  // Helper function to parse and normalize location
  const parseLocation = (userObj: any) => {
    let lat = 6.5244 // Default to Lagos
    let lng = 3.3792
    let city = "Lagos"
    let state = "Lagos"
    let country = "Nigeria"

    if (userObj) {
      // Priority 1: Check profile.coordinates (most accurate)
      if (userObj.profile?.coordinates?.lat && userObj.profile?.coordinates?.lng) {
        lat = userObj.profile.coordinates.lat
        lng = userObj.profile.coordinates.lng
        city = userObj.profile.city || "Current Location"
        state = userObj.profile.state || "Nigeria"
        country = userObj.profile.country || "Nigeria"
        console.log('📍 Using profile coordinates:', { lat, lng, city, state })
        return { lat, lng, city, state, country }
      }

      // Priority 2: Check profile location fields
      if (userObj.profile?.city || userObj.profile?.state) {
        city = userObj.profile.city || city
        state = userObj.profile.state || state
        country = userObj.profile.country || "Nigeria"

        // Try to get coordinates for the city
        const cityCoordinates: { [key: string]: [number, number] } = {
          'Lagos': [6.5244, 3.3792],
          'Abuja': [9.0820, 7.3986],
          'Kano': [11.9914, 8.5311],
          'Ibadan': [7.3775, 3.9470],
          'Port Harcourt': [4.8156, 7.0498],
          'Benin City': [6.3350, 5.6037],
          'Kaduna': [10.5105, 7.4165],
          'Enugu': [6.4584, 7.5464],
          'Ilorin': [8.4966, 4.5421],
          'Abeokuta': [7.1604, 3.3480],
          'Jos': [9.8965, 8.8583],
          'Ile-Ife': [7.4824, 4.5603],
          'Ogbomosho': [8.1337, 4.1713],
          'Iseyin': [7.9667, 3.6000],
          'Iwo': [7.6333, 4.1833]
        }

        if (cityCoordinates[city]) {
          [lat, lng] = cityCoordinates[city]
        }
        console.log('📍 Using profile location:', { lat, lng, city, state })
        return { lat, lng, city, state, country }
      }

      // Priority 3: Check simple location field
      if (userObj.location) {
        const trimmedLocation = userObj.location.trim()

        // Check if location contains coordinates (lat,lng format)
        const coordMatch = trimmedLocation.match(/(-?\d+\.?\d*),?\s*(-?\d+\.?\d*)/)
        if (coordMatch) {
          lat = parseFloat(coordMatch[1])
          lng = parseFloat(coordMatch[2])
          city = "Current Location"
          state = "Nigeria"
          console.log('📍 Using location coordinates:', { lat, lng, city, state })
          return { lat, lng, city, state, country }
        } else {
          // Parse city, state format
          const parts = trimmedLocation.split(',').map(p => p.trim())
          if (parts.length >= 2) {
            city = parts[0]
            state = parts[1]
          } else if (parts.length === 1) {
            city = parts[0]
            // Try to infer state from major Nigerian cities
            const cityToState: { [key: string]: string } = {
              'Lagos': 'Lagos',
              'Abuja': 'FCT',
              'Kano': 'Kano',
              'Ibadan': 'Oyo',
              'Port Harcourt': 'Rivers',
              'Benin City': 'Edo',
              'Kaduna': 'Kaduna',
              'Enugu': 'Enugu',
              'Ilorin': 'Kwara',
              'Abeokuta': 'Ogun',
              'Jos': 'Plateau',
              'Ile-Ife': 'Osun',
              'Ogbomosho': 'Oyo',
              'Iseyin': 'Oyo',
              'Iwo': 'Osun'
            }
            state = cityToState[city] || city
          }

          // Get coordinates for the city
          const cityCoordinates: { [key: string]: [number, number] } = {
            'Lagos': [6.5244, 3.3792],
            'Abuja': [9.0820, 7.3986],
            'Kano': [11.9914, 8.5311],
            'Ibadan': [7.3775, 3.9470],
            'Port Harcourt': [4.8156, 7.0498],
            'Benin City': [6.3350, 5.6037],
            'Kaduna': [10.5105, 7.4165],
            'Enugu': [6.4584, 7.5464],
            'Ilorin': [8.4966, 4.5421],
            'Abeokuta': [7.1604, 3.3480],
            'Jos': [9.8965, 8.8583],
            'Ile-Ife': [7.4824, 4.5603],
            'Ogbomosho': [8.1337, 4.1713],
            'Iseyin': [7.9667, 3.6000],
            'Iwo': [7.6333, 4.1833]
          }

          if (cityCoordinates[city]) {
            [lat, lng] = cityCoordinates[city]
          }
          console.log('📍 Using simple location:', { lat, lng, city, state })
          return { lat, lng, city, state, country }
        }
      }
    }

    console.log('📍 Using default location:', { lat, lng, city, state })
    return { lat, lng, city, state, country }
  }

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoading(true)

        // Priority 1: Use actual current location from geolocation API
        let locationData: any = null

        if (geoLocation && !geoLoading && !geoError) {
          console.log('🎯 Using actual current location from geolocation:', geoLocation)
          locationData = {
            lat: geoLocation.lat,
            lng: geoLocation.lng,
            city: geoLocation.city || 'Current Location',
            state: geoLocation.state || 'Unknown State',
            country: geoLocation.country || 'Nigeria'
          }
        } else {
          // Priority 2: Fall back to stored profile data
          console.log('📁 Falling back to stored location data')
          console.log('👤 User data:', {
            id: user?.id || user?._id,
            name: user?.name,
            location: user?.location,
            profile: user?.profile ? {
              city: user.profile.city,
              state: user.profile.state,
              country: user.profile.country,
              coordinates: user.profile.coordinates
            } : 'No profile data',
            hasLocation: !!user?.location,
            hasProfileLocation: !!(user?.profile?.city || user?.profile?.state)
          })

          // Parse user's stored location
          locationData = parseLocation(user)
        }

        console.log('📍 Final location data:', locationData)

        const { lat, lng, city, state, country } = locationData

        // Store current location for comparison
        const locationKey = `${lat},${lng},${city},${state}`
        setCurrentLocation(locationKey)

        console.log('🌤️ Fetching weather for:', { lat, lng, city, state, country })

        const response = await apiService.getCurrentWeather(lat, lng, city, state, country)

        if (response.status === 'success' && response.data) {
          const d = response.data
          console.log('🌤️ Weather data received:', d)

        const mapped = {
          location: `${d.location?.city || city}, ${d.location?.state || state}, ${d.location?.country || country}`,
          current: {
              temperature: Math.round(d.current?.temperature ?? 0),
            humidity: d.current?.humidity ?? 0,
              windSpeed: Math.round(d.current?.windSpeed ?? 0),
              description: d.current?.weatherCondition || d.current?.condition || "Clear",
              weatherIcon: d.current?.weatherIcon || "",
              feelsLike: Math.round(d.current?.feelsLike ?? 0),
          },
          agriculturalInsights: {
              plantingRecommendations: d.agricultural?.plantingRecommendation ?
                [d.agricultural.plantingRecommendation] : [],
            harvestingRecommendations: [],
            irrigationAdvice: d.agricultural?.irrigationAdvice || "",
            pestWarnings: [],
          },
        }
        setWeather(mapped)
        } else {
          throw new Error('Weather API returned unsuccessful response')
        }
      } catch (error: any) {
        console.error('❌ Weather fetch failed:', error)

        // Show user-friendly error message
        const locationData = parseLocation(user?.location || "")
        setWeather({
          location: user?.location ? `${locationData.city}, ${locationData.state}, Nigeria` : "Lagos, Lagos, Nigeria",
          current: {
            temperature: 0,
            humidity: 0,
            windSpeed: 0,
            description: "Weather data unavailable",
            weatherIcon: "",
            feelsLike: 0,
          },
          agriculturalInsights: {
            plantingRecommendations: ["Weather data currently unavailable. Please check your connection."],
            harvestingRecommendations: [],
            irrigationAdvice: "Unable to provide irrigation advice at this time",
            pestWarnings: [],
          },
        })

        toast({
          title: "Weather Data Unavailable",
          description: "Unable to fetch current weather data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if user data is available or we have geolocation
    if (user || geoLocation) {
      console.log('🌤️ Starting weather fetch:', {
        hasUser: !!user,
        hasGeoLocation: !!geoLocation,
        geoLoading,
        geoError
      })
    fetchWeather()
    } else {
      console.log('🌤️ No user data or geolocation available for weather fetch')
    }
  }, [user?.id, user?.location, geoLocation, geoLoading, geoError, toast])

  const fetchForecast = async () => {
    // Check if we have any location data
    if (!user && !geoLocation) {
      toast({
        title: "Location Required",
        description: "Unable to determine your location for weather forecast.",
        variant: "destructive",
      })
      return
    }

    setIsForecastLoading(true)
    try {
      // Use same location priority as main weather fetch
      let locationData: any = null

      if (geoLocation && !geoLoading && !geoError) {
        console.log('🎯 Using actual current location for forecast:', geoLocation)
        locationData = {
          lat: geoLocation.lat,
          lng: geoLocation.lng,
          city: geoLocation.city || 'Current Location',
          state: geoLocation.state || 'Unknown State',
          country: geoLocation.country || 'Nigeria'
        }
      } else {
        console.log('📁 Using stored location data for forecast')
        locationData = parseLocation(user)
      }

      const { lat, lng, city, state, country } = locationData

      console.log('🌤️ Fetching forecast for:', { lat, lng, city, state, country })

      const response = await apiService.getWeatherForecast(lat, lng, 5)

      if (response.status === 'success' && response.data) {
        console.log('🌤️ Forecast data received:', response.data)
        const forecastData = response.data.forecast || response.data || []
        setForecast(Array.isArray(forecastData) ? forecastData.slice(0, 5) : [])
      } else {
        throw new Error('Forecast API returned unsuccessful response')
      }
    } catch (error: any) {
      console.error('❌ Forecast fetch failed:', error)
      setForecast([]) // Clear any existing forecast data
      toast({
        title: "Forecast Unavailable",
        description: error.message || "Unable to fetch weather forecast data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsForecastLoading(false)
    }
  }

  const getWeatherIcon = (description: string) => {
    const desc = description?.toLowerCase() || ""
    if (desc.includes("rain") || desc.includes("drizzle")) return CloudRain
    if (desc.includes("cloud")) return Cloud
    if (desc.includes("sun") || desc.includes("clear")) return Sun
    return Cloud
  }

  const formatDayName = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"

    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const WeatherIcon = getWeatherIcon(weather?.current?.description || "")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Weather
              {geoLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {geoLocation ? (
                <>
                  <Navigation className="h-3 w-3 text-green-500" />
                  {weather?.location} (Live Location)
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {weather?.location} (Stored Location)
                </>
              )}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={requestLocation}
            disabled={geoLoading}
            title="Refresh location"
          >
            <RefreshCw className={`h-4 w-4 ${geoLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Weather */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <WeatherIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{weather?.current?.temperature}°C</div>
                <div className="text-sm text-muted-foreground capitalize">{weather?.current?.description}</div>
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <span>{weather?.current?.humidity}% humidity</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <span>{weather?.current?.windSpeed} km/h</span>
            </div>
          </div>

          {/* Agricultural Insights */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Farming Insights</h4>
            <div className="space-y-1">
              {weather?.current?.temperature > 0 ? (
                // Generate intelligent insights based on real weather data
                <>
                  <div className="text-xs text-muted-foreground flex items-start space-x-1">
                    <div className="h-1 w-1 rounded-full bg-primary mt-2" />
                    <span>
                      {weather.current.temperature > 30
                        ? "🔥 High temperatures - provide shade and increase irrigation"
                        : weather.current.temperature > 25
                        ? "🌡️ Warm conditions - monitor for heat stress in sensitive crops"
                        : weather.current.temperature < 15
                        ? "❄️ Cool temperatures - protect frost-sensitive crops"
                        : "✅ Optimal temperatures for most crop growth"
                      }
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-start space-x-1">
                    <div className="h-1 w-1 rounded-full bg-primary mt-2" />
                    <span>
                      {weather.current.humidity > 80
                        ? "💧 High humidity - monitor for fungal diseases and ensure ventilation"
                        : weather.current.humidity > 70
                        ? "💧 Elevated humidity - watch for pest activity"
                        : weather.current.humidity < 40
                        ? "🏜️ Low humidity - increase irrigation frequency"
                        : "✅ Good humidity levels for crop health"
                      }
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-start space-x-1">
                  <div className="h-1 w-1 rounded-full bg-primary mt-2" />
                    <span>
                      {weather.current.windSpeed > 15
                        ? "🌪️ Strong winds - secure young plants and protect from wind damage"
                        : weather.current.windSpeed > 8
                        ? "💨 Moderate winds - good for natural pest control"
                        : "🌬️ Light winds - ideal conditions for most farming activities"
                      }
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted-foreground flex items-start space-x-1">
                  <div className="h-1 w-1 rounded-full bg-muted mt-2" />
                  <span>Weather data required for farming insights</span>
                </div>
              )}
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={fetchForecast}
                disabled={isForecastLoading}
              >
                {isForecastLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
            View Forecast
                  </>
                )}
          </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>5-Day Weather Forecast</DialogTitle>
                <DialogDescription>
                  Weather forecast for {weather?.location || "your location"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-5">
                {forecast.map((day: any, index: number) => {
                  const WeatherIcon = getWeatherIcon(day.weatherCondition || day.weatherIcon)
                  const dayDate = new Date(day.date || Date.now() + index * 24 * 60 * 60 * 1000)

                  return (
                    <Card key={index} className="text-center">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {formatDayName(dayDate)}
                        </CardTitle>
                        <div className="flex justify-center">
                          <WeatherIcon className="h-8 w-8 text-primary" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <Thermometer className="h-4 w-4 text-red-500" />
                            <span className="font-medium">
                              {Math.round(day.temperature?.max || day.highTemp || 25)}°
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <Thermometer className="h-4 w-4 text-blue-500" />
                            <span className="text-muted-foreground">
                              {Math.round(day.temperature?.min || day.lowTemp || 20)}°
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <HumidityIcon className="h-4 w-4 text-blue-400" />
                            <span className="text-muted-foreground">
                              {day.humidity || 65}%
                            </span>
                          </div>
                          {day.precipitation > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <CloudRain className="h-4 w-4 text-blue-600" />
                              <span className="text-muted-foreground">
                                {Math.round(day.precipitation)}mm
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground capitalize">
                          {day.weatherCondition || "Clear"}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {forecast.length === 0 && !isForecastLoading && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No forecast data available</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
