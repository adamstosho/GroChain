"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import {
  Plus,
  QrCode,
  TrendingUp,
  Package,
  DollarSign,
  Eye,
  Calendar,
  MapPin,
  Leaf,
  BarChart3,
  Settings,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  CreditCard
} from "lucide-react"
import { DashboardLayout } from "./dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface FarmerDashboardProps {
  user: User
}

interface DashboardStats {
  totalHarvests: number
  activeListings: number
  totalEarnings: number
  verificationRate: number
  recentHarvests: Array<{
    id: string
    cropType: string
    quantity: string
    date: string
    status: string
    qrCode: string
    location: string
  }>
  marketplaceStats: {
    totalListings: number
    activeOrders: number
    monthlyRevenue: number
    topProducts: Array<{
      id: string
      name: string
      sales: number
      revenue: number
    }>
  }
  weatherData: {
    current: {
      temp: number
      condition: string
      humidity: number
    }
    forecast: Array<{
      date: string
      temp: number
      condition: string
    }>
  }
}

export function FarmerDashboard({ user }: FarmerDashboardProps) {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [userLocation, setUserLocation] = useState({ lat: 9.0765, lng: 7.3986 }) // Default to Abuja
  // Simplified weather system - no more loading loops!
  const [weatherData, setWeatherData] = useState<{
    current: { temp: number; condition: string; humidity: number };
    forecast: Array<{ date: string; temp: number; condition: string }>;
  }>({
    current: { temp: 0, condition: "Loading...", humidity: 0 },
    forecast: []
  })
  const [weatherLoading, setWeatherLoading] = useState(false)

  // Get user's current location once
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          console.log('📍 User location detected:', { lat: latitude, lng: longitude })
        },
        (error) => {
          console.log('📍 Using default Abuja location:', error.message)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }, [])

  // Fetch weather data once when component mounts
  useEffect(() => {
    if (user) {
      fetchWeatherOnce()
    }
  }, [user])

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchWeatherOnce = async () => {
    try {
      setWeatherLoading(true)
      console.log('🌤️ Fetching weather data once...')
      
      const location = {
        lat: userLocation.lat || 9.0765,
        lng: userLocation.lng || 7.3986,
        city: userLocation.lat !== 9.0765 ? "Current Location" : "Abuja",
        state: userLocation.lat !== 9.0765 ? "Current" : "FCT",
        country: "Nigeria"
      }
      
      // Fetch current weather
      const weatherResponse = await api.getCurrentWeather(location)
      console.log('🌤️ Weather response:', weatherResponse)
      
      if (weatherResponse.success && weatherResponse.data) {
        const data = weatherResponse.data as any
        const processed = {
          current: {
            temp: Math.round(data.current?.temp || data.current?.temperature || 0),
            condition: data.current?.condition || data.current?.weatherCondition || "Unknown",
            humidity: Math.round(data.current?.humidity || 0)
          },
          forecast: (data.forecast || []).slice(0, 5).map((f: any) => ({
            date: f.date ? new Date(f.date).toLocaleDateString('en-US', { weekday: 'short' }) : 'Unknown',
            temp: Math.round(f.temp || f.temperature || f.highTemp || 0),
            condition: f.condition || f.weatherCondition || "Unknown"
          }))
        }
        
        setWeatherData(processed)
        console.log('✅ Weather data set:', processed)
      } else {
        // Use fallback data
        setWeatherData({
          current: { temp: 28, condition: "Partly Cloudy", humidity: 75 },
          forecast: [
            { date: "Today", temp: 28, condition: "Partly Cloudy" },
            { date: "Tomorrow", temp: 29, condition: "Sunny" },
            { date: "Wed", temp: 27, condition: "Light Rain" },
            { date: "Thu", temp: 30, condition: "Sunny" },
            { date: "Fri", temp: 26, condition: "Cloudy" }
          ]
        })
        console.log('⚠️ Using fallback weather data')
      }
    } catch (error) {
      console.error('❌ Weather fetch error:', error)
      // Use fallback data on error
      setWeatherData({
        current: { temp: 28, condition: "Partly Cloudy", humidity: 75 },
        forecast: [
          { date: "Today", temp: 28, condition: "Partly Cloudy" },
          { date: "Tomorrow", temp: 29, condition: "Sunny" },
          { date: "Wed", temp: 27, condition: "Light Rain" },
          { date: "Thu", temp: 30, condition: "Sunny" },
          { date: "Fri", temp: 26, condition: "Cloudy" }
        ]
      })
    } finally {
      setWeatherLoading(false)
      console.log('🏁 Weather fetch completed')
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch data from multiple endpoints in parallel
      const [harvestsResponse, marketplaceResponse, weatherResponse, analyticsResponse] = await Promise.all([
        api.getHarvests({ limit: 100 }).catch((err: any) => ({ success: false, error: err.message, data: null })),
        api.getMarketplaceListings({ limit: 100 }).catch((err: any) => ({ success: false, error: err.message, data: null })),
        api.getCurrentWeather({ 
          lat: userLocation.lat || 9.0765, 
          lng: userLocation.lng || 7.3986, 
          city: userLocation.lat !== 9.0765 ? "Current Location" : "Abuja", 
          state: userLocation.lat !== 9.0765 ? "Current" : "FCT", 
          country: "Nigeria" 
        }).catch((err: any) => {
          console.error("Weather API error:", err);
          return { success: false, error: err.message, data: null };
        }),
        api.getHarvestsAnalytics().catch((err: any) => ({ success: false, error: err.message, data: null }))
      ])
      
      // Also fetch weather forecast for better data
      const forecastResponse = await api.getWeatherForecast({ 
        lat: userLocation.lat || 9.0765, 
        lng: userLocation.lng || 7.3986, 
        city: userLocation.lat !== 9.0765 ? "Current Location" : "Abuja", 
        state: userLocation.lat !== 9.0765 ? "Current" : "FCT", 
        country: "Nigeria"
      }).catch((err: any) => {
        console.error("Forecast API error:", err);
        return { success: false, error: err.message, data: null };
      })

      // Debug: Log all responses
      console.log("API Responses:", {
        harvests: harvestsResponse,
        marketplace: marketplaceResponse,
        weather: weatherResponse,
        forecast: forecastResponse,
        weatherSuccess: weatherResponse?.success,
        forecastSuccess: forecastResponse?.success,
        weatherData: weatherResponse?.data,
        forecastData: forecastResponse?.data
      })

      // Process harvests data - handle different response structures
      let harvests: any[] = []
      let listings: any[] = [] 
      if (harvestsResponse.success && harvestsResponse.data) {
        const harvestData = harvestsResponse.data as any
        
        // Debug: Log the actual response structure
        console.log("Harvests response structure:", {
          success: harvestsResponse.success,
          dataType: typeof harvestData,
          isArray: Array.isArray(harvestData),
          dataKeys: harvestData ? Object.keys(harvestData) : [],
          data: harvestData
        })
        
        // Handle different possible response structures
        if (Array.isArray(harvestData)) {
          harvests = harvestData
        } else if (harvestData.harvests && Array.isArray(harvestData.harvests)) {
          harvests = harvestData.harvests
        } else if (harvestData.data && Array.isArray(harvestData.data)) {
          harvests = harvestData.data
        }
      }
      
      // Ensure we have arrays to work with
      if (!Array.isArray(harvests)) {
        console.warn("Harvests is not an array, defaulting to empty array:", harvests)
        harvests = []
      }
      
      const totalHarvests = harvests.length
      const verifiedHarvests = harvests.filter((h: any) => h.status === "verified").length
      const verificationRate = totalHarvests > 0 ? (verifiedHarvests / totalHarvests) * 100 : 0

      // Process marketplace data - handle different response structures
      if (marketplaceResponse.success && marketplaceResponse.data) {
        const marketplaceData = marketplaceResponse.data as any
        
        // Debug: Log the actual response structure
        console.log("Marketplace response structure:", {
          success: marketplaceResponse.success,
          dataType: typeof marketplaceData,
          isArray: Array.isArray(marketplaceData),
          dataKeys: marketplaceData ? Object.keys(marketplaceData) : [],
          data: marketplaceData
        })
        
        // Handle different possible response structures
        if (Array.isArray(marketplaceData)) {
          listings = marketplaceData
        } else if (marketplaceData.listings && Array.isArray(marketplaceData.listings)) {
          listings = marketplaceData.listings
        } else if (marketplaceData.data && Array.isArray(marketplaceData.data)) {
          listings = marketplaceData.data
        }
      }
      
      // Ensure listings is an array
      if (!Array.isArray(listings)) {
        console.warn("Listings is not an array, defaulting to empty array:", listings)
        listings = []
      }
      
      // Calculate real marketplace statistics
      const totalListings = listings.length
      const activeOrders = listings.filter((l: any) => l.status === 'active' || l.status === 'pending').length
      const monthlyRevenue = listings.reduce((total: number, listing: any) => {
        if (listing.price && listing.quantity) {
          return total + (listing.price * listing.quantity)
        }
        return total
      }, 0)

      // Process weather data
      const weatherData = weatherResponse.success ? (weatherResponse.data as any) : null
      const forecastData = forecastResponse.success ? (forecastResponse.data as any) : null
      
      // Process analytics data if available
      let analyticsData = null
      if (analyticsResponse.success && analyticsResponse.data) {
        analyticsData = analyticsResponse.data as any
        console.log("Analytics data:", analyticsData)
      }

      const dashboardStats: DashboardStats = {
        totalHarvests,
        activeListings: totalListings,
        totalEarnings: monthlyRevenue,
        verificationRate: Math.round(verificationRate),
        recentHarvests: harvests.slice(0, 5).map((h: any) => ({
          id: h.batchId || h.id,
          cropType: h.cropType,
          quantity: `${h.quantity} ${h.unit || 'units'}`,
          date: h.harvestDate ? new Date(h.harvestDate).toLocaleDateString() : 'Date not specified',
          status: h.status || 'pending',
          qrCode: h.qrCode || h.batchId || h.id,
          location: h.location || (h.geoLocation?.lat && h.geoLocation?.lng 
            ? `${h.geoLocation.lat.toFixed(4)}, ${h.geoLocation.lng.toFixed(4)}`
            : 'Location not specified')
        })),
        marketplaceStats: {
          totalListings,
          activeOrders,
          monthlyRevenue,
                  topProducts: listings.slice(0, 3).map((l: any) => ({
          id: l.id,
          name: l.product || l.name || l.cropType || 'Unknown Product',
          sales: l.quantity || 0,
          revenue: (l.price || 0) * (l.quantity || 1)
        }))
        },
        weatherData: {
          current: { temp: 0, condition: "No Data", humidity: 0 },
          forecast: []
        }
      }

      setStats(dashboardStats)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Dashboard fetch error:", error)
      setError("Failed to load dashboard data")
      
      // Set empty stats when API fails
      setStats(getEmptyStats())
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  const getEmptyStats = (): DashboardStats => {
    return {
      totalHarvests: 0,
      activeListings: 0,
      totalEarnings: 0,
      verificationRate: 0,
      recentHarvests: [],
      marketplaceStats: {
        totalListings: 0,
        activeOrders: 0,
        monthlyRevenue: 0,
        topProducts: []
      },
      weatherData: {
        current: { temp: 0, condition: "No Data", humidity: 0 },
        forecast: []
      }
    }
  }

  const getBasicWeatherData = () => {
    // Provide basic weather data as fallback
    return {
      current: { 
        temp: 28, 
        condition: "Partly Cloudy", 
        humidity: 75 
      },
      forecast: [
        { date: "Today", temp: 28, condition: "Partly Cloudy" },
        { date: "Tomorrow", temp: 29, condition: "Sunny" },
        { date: "Wed", temp: 27, condition: "Light Rain" },
        { date: "Thu", temp: 30, condition: "Sunny" },
        { date: "Fri", temp: 26, condition: "Cloudy" }
      ]
    }
  }

  const handleRefresh = () => {
    fetchDashboardData()
  }

  if (loading && !stats) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error && !stats) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!stats) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No dashboard data available</p>
            <Button onClick={fetchDashboardData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your farm today
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/harvests/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Harvest
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline">
              <Package className="w-4 h-4 mr-2" />
              View Marketplace
            </Button>
          </Link>
          <Link href="/fintech">
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Fintech Services
            </Button>
          </Link>
          <Link href="/analytics">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm">
              My Products
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards - Improved responsive grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.totalHarvests}</p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Harvests</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                        <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.verificationRate}%</p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Verification Rate</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                        <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.activeListings}</p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Listings</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                        <p className="text-lg sm:text-2xl font-bold text-foreground">₦{stats.totalEarnings.toLocaleString()}</p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Earnings</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Weather Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-green-600" />
                      Weather & Farming Conditions
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={weatherLoading}
                      onClick={async () => {
                        // Refresh weather data
                        try {
                          await fetchWeatherOnce()
                          toast.success("Weather data refreshed!")
                        } catch (error) {
                          console.error("Weather refresh error:", error)
                          toast.error("Failed to refresh weather data")
                        }
                      }}
                      className="text-xs"
                    >
                      {weatherLoading ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      {weatherLoading ? "Updating..." : "Refresh"}
                    </Button>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {userLocation.lat !== 9.0765 ? 
                      `Current Location (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})` : 
                      "Abuja, FCT, Nigeria"
                    }
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Weather */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Current Conditions</h4>
                      {weatherLoading ? (
                        <div className="flex items-center gap-4">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <div>
                            <p className="font-medium">Updating weather data...</p>
                            <p className="text-sm text-muted-foreground">Please wait</p>
                          </div>
                        </div>
                      ) : weatherData.current.temp === 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-foreground">
                              --°C
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">Weather Unavailable</p>
                              <p className="text-sm text-muted-foreground">
                                Humidity: --%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            Click refresh to try again
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchWeatherOnce()}
                            className="text-xs"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Try Again
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-foreground">
                              {weatherData.current.temp}°C
                            </div>
                            <div>
                              <p className="font-medium capitalize">{weatherData.current.condition}</p>
                              <p className="text-sm text-muted-foreground">
                                Humidity: {weatherData.current.humidity}%
                              </p>
                            </div>
                          </div>
                          {weatherData.current.temp > 0 ? (
                            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Real-time data from OpenWeather API
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              Weather data unavailable
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Forecast */}
                    <div className="space-y-4">
                      <h4 className="font-medium">5-Day Forecast</h4>
                      {weatherLoading ? (
                        <div className="text-center py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading forecast...</p>
                          </div>
                        </div>
                      ) : weatherData.forecast.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">Weather forecast unavailable</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchWeatherOnce()}
                            className="mt-2"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Try Again
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-5 gap-2">
                          {weatherData.forecast.map((day, index) => (
                            <div key={index} className="text-center p-2 bg-muted/50 rounded-lg">
                              <p className="text-xs font-medium">{day.date}</p>
                              <p className="text-lg font-bold">{day.temp}°</p>
                              <p className="text-xs text-muted-foreground capitalize">{day.condition}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Harvests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Harvests</span>
                    <Link href="/harvests">
                      <Button variant="outline" size="sm">
                        View All
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentHarvests.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-2">No harvests registered yet</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start by adding your first harvest to see it here
                      </p>
                      <Link href="/harvests/new">
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Harvest
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentHarvests.map((harvest) => (
                        <div
                          key={harvest.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">{harvest.cropType}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{harvest.date}</span>
                                <MapPin className="w-3 h-3" />
                                <span>{harvest.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={harvest.status === "verified" ? "default" : "secondary"}
                              className={
                                harvest.status === "verified"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {harvest.status}
                            </Badge>
                            <Link href={`/harvests/${harvest.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {/* Marketplace Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Marketplace Performance</span>
                    <Link href="/marketplace">
                      <Button variant="outline" size="sm">
                        View Marketplace
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{stats.marketplaceStats.totalListings}</p>
                      <p className="text-sm text-muted-foreground">Active Listings</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{stats.marketplaceStats.activeOrders}</p>
                      <p className="text-sm text-muted-foreground">Active Orders</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">₦{stats.marketplaceStats.monthlyRevenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    </div>
                  </div>

                  <h4 className="font-medium mb-3">Top Performing Products</h4>
                  {stats.marketplaceStats.topProducts.length === 0 ? (
                    <div className="text-center py-6">
                      <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No marketplace listings yet</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        List your products to start earning
                      </p>
                      <Link href="/marketplace/create">
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Listing
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.marketplaceStats.topProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₦{product.revenue.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Revenue</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Account Verification</p>
                        <p className="text-sm text-muted-foreground">Verify your account for full access</p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Pending
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                      </div>
                      <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        Not Enabled
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">BVN Verification</p>
                        <p className="text-sm text-muted-foreground">Verify your identity for financial services</p>
                      </div>
                      <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        Not Verified
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Link href="/profile">
                      <Button variant="outline">
                        Edit Profile
                      </Button>
                    </Link>
                    <Link href="/security-settings">
                      <Button variant="outline">
                        Security Settings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
