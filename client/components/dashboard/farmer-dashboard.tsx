"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  QrCode,
  TrendingUp,
  TrendingDown,
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
  CreditCard,
  Users
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
  monthlyGrowth: number
  averageHarvestValue: number
}

interface RecentHarvest {
  _id: string
  cropType: string
  quantity: number
  unit: string
  harvestDate: string
  status: string
  qrCode: string
  location: string
  geoLocation?: {
    lat: number
    lng: number
  }
}

interface MarketplaceStats {
  totalListings: number
  activeOrders: number
  monthlyRevenue: number
  topProducts: Array<{
    _id: string
    product: string
    sales: number
    revenue: number
  }>
}

interface WeatherData {
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

export function FarmerDashboard({ user }: FarmerDashboardProps) {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  
  // Initialize with sample data so dashboard is never empty
  const [stats, setStats] = useState<DashboardStats>({
    totalHarvests: 5,
    activeListings: 3,
    totalEarnings: 150000,
    verificationRate: 80,
    monthlyGrowth: 25,
    averageHarvestValue: 30000
  })
  
  const [recentHarvests, setRecentHarvests] = useState<RecentHarvest[]>([
    {
      _id: 'sample-1',
      cropType: 'Maize',
      quantity: 500,
      unit: 'kg',
      harvestDate: new Date().toISOString(),
      status: 'verified',
      qrCode: 'QR-MAIZE-001',
      location: 'Farm A',
      geoLocation: { lat: 9.0765, lng: 7.3986 }
    },
    {
      _id: 'sample-2',
      cropType: 'Rice',
      quantity: 300,
      unit: 'kg',
      harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      qrCode: 'QR-RICE-001',
      location: 'Farm B',
      geoLocation: { lat: 9.0765, lng: 7.3986 }
    }
  ])
  
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats>({
    totalListings: 3,
    activeOrders: 1,
    monthlyRevenue: 45000,
    topProducts: [
      { _id: '1', product: 'Maize', sales: 500, revenue: 30000 },
      { _id: '2', product: 'Rice', sales: 300, revenue: 15000 }
    ]
  })
  
  const [weatherData, setWeatherData] = useState<WeatherData>({
    current: { temp: 0, condition: "No Data", humidity: 0 },
    forecast: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [userLocation, setUserLocation] = useState({ lat: 9.0765, lng: 7.3986 }) // Default to Abuja
  const [isSampleData, setIsSampleData] = useState(true) // Track if we're showing sample data

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

  // Fetch dashboard data
  useEffect(() => {
    if (authUser?.id) {
      fetchDashboardData()
    }
  }, [authUser?.id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      console.log('🌾 Fetching farmer dashboard data for user:', authUser?.id)

      // Fetch farmer dashboard data from API
      const [dashboardResponse, weatherResponse] = await Promise.all([
        api.getFarmerDashboard(authUser?.id || ''),
        api.getCurrentWeather({ 
          lat: userLocation.lat || 9.0765, 
          lng: userLocation.lng || 7.3986, 
          city: userLocation.lat !== 9.0765 ? "Current Location" : "Abuja", 
          state: userLocation.lat !== 9.0765 ? "Current" : "FCT", 
          country: "Nigeria"
        }).catch(() => ({ success: false, data: null }))
      ])

      console.log('🌾 Dashboard response:', dashboardResponse)
      console.log('🌾 Weather response:', weatherResponse)

      if (dashboardResponse.success && dashboardResponse.data) {
        console.log('🌾 Setting dashboard data:', dashboardResponse.data)
        setStats(dashboardResponse.data.stats)
        setRecentHarvests(dashboardResponse.data.recentHarvests || [])
        setMarketplaceStats(dashboardResponse.data.marketplaceStats || {
          totalListings: 0,
          activeOrders: 0,
          monthlyRevenue: 0,
          topProducts: []
        })
      } else {
        console.log('🌾 Dashboard response failed, using fallback data')
        // Set sample data for demonstration
        setStats({
          totalHarvests: 5,
          activeListings: 3,
          totalEarnings: 150000,
          verificationRate: 80,
          monthlyGrowth: 25,
          averageHarvestValue: 30000
        })
        setRecentHarvests([
          {
            _id: 'sample-1',
            cropType: 'Maize',
            quantity: 500,
            unit: 'kg',
            harvestDate: new Date().toISOString(),
            status: 'verified',
            qrCode: 'QR-MAIZE-001',
            location: 'Farm A',
            geoLocation: { lat: 9.0765, lng: 7.3986 }
          },
          {
            _id: 'sample-2',
            cropType: 'Rice',
            quantity: 300,
            unit: 'kg',
            harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            qrCode: 'QR-RICE-001',
            location: 'Farm B',
            geoLocation: { lat: 9.0765, lng: 7.3986 }
          }
        ])
        setMarketplaceStats({
          totalListings: 3,
          activeOrders: 1,
          monthlyRevenue: 45000,
          topProducts: [
            { _id: '1', product: 'Maize', sales: 500, revenue: 30000 },
            { _id: '2', product: 'Rice', sales: 300, revenue: 15000 }
          ]
        })
      }

      // Sample data is already initialized, no need for fallback

      // Process weather data if available
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
      }

      setLastUpdated(new Date())
      toast.success("Dashboard data updated successfully")
    } catch (error) {
      console.error("Dashboard fetch error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load dashboard data"
      setError(errorMessage)
      toast.error(errorMessage)
      
      // Keep sample data on error instead of setting empty stats
      console.log('🌾 Error occurred, keeping sample data')
      setIsSampleData(true)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
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

  if (error) {
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
            {isSampleData && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Showing sample data. Connect your farm data to see real-time information.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
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
                      <div className="flex items-center gap-1">
                        {stats.monthlyGrowth >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        )}
                        <span className={`text-xs ${stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(stats.monthlyGrowth).toFixed(1)}%
                        </span>
                      </div>
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
                        <p className="text-lg sm:text-2xl font-bold text-foreground">{formatCurrency(stats.totalEarnings)}</p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Earnings</p>
                      <p className="text-xs text-muted-foreground">
                        Avg: {formatCurrency(stats.averageHarvestValue)}
                      </p>
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
                    <div className="text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {userLocation.lat !== 9.0765 ? 
                        `Current Location (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})` : 
                        "Abuja, FCT, Nigeria"
                      }
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Weather */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Current Conditions</h4>
                      {weatherData.current.temp === 0 ? (
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
                            Weather service temporarily unavailable
                          </div>
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
                          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Real-time weather data
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Forecast */}
                    <div className="space-y-4">
                      <h4 className="font-medium">5-Day Forecast</h4>
                      {weatherData.forecast.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">Weather forecast unavailable</p>
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
                  {recentHarvests.length === 0 ? (
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
                      {recentHarvests.map((harvest) => (
                        <div
                          key={harvest._id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">{harvest.cropType}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(harvest.harvestDate).toLocaleDateString()}</span>
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
                            <Link href={`/harvests/${harvest._id}`}>
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
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{marketplaceStats?.totalListings || 0}</p>
                      <p className="text-sm text-muted-foreground">Active Listings</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{marketplaceStats?.activeOrders || 0}</p>
                      <p className="text-sm text-muted-foreground">Active Orders</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(marketplaceStats?.monthlyRevenue || 0)}</p>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    </div>
                  </div>

                  <h4 className="font-medium mb-3">Top Performing Products</h4>
                  {!marketplaceStats || marketplaceStats.topProducts.length === 0 ? (
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
                      {marketplaceStats.topProducts.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{product.product}</p>
                            <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(product.revenue)}</p>
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
                    <Link href="/settings/security">
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
