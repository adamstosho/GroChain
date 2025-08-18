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
  ArrowRight
} from "lucide-react"
import { DashboardLayout } from "./dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"

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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch data from multiple endpoints in parallel
      const [harvestsResponse, marketplaceResponse, weatherResponse] = await Promise.all([
        api.getHarvests({ farmer: user.id, limit: 5 }),
        api.getMarketplaceListings({ farmer: user.id, limit: 5 }),
        api.getCurrentWeather({ lat: 9.0765, lng: 7.3986, city: "Abuja", state: "FCT", country: "Nigeria" })
      ])

      // Process harvests data
      const harvests = harvestsResponse.success ? harvestsResponse.data : []
      const totalHarvests = harvests.length
      const verifiedHarvests = harvests.filter((h: any) => h.status === "verified").length
      const verificationRate = totalHarvests > 0 ? (verifiedHarvests / totalHarvests) * 100 : 0

      // Process marketplace data
      const listings = marketplaceResponse.success ? marketplaceResponse.data : []
      const totalListings = listings.length
      const activeOrders = 0 // This would come from orders endpoint
      const monthlyRevenue = 0 // This would be calculated from orders

      // Process weather data
      const weatherData = weatherResponse.success ? weatherResponse.data : null

      const dashboardStats: DashboardStats = {
        totalHarvests,
        activeListings: totalListings,
        totalEarnings: monthlyRevenue,
        verificationRate: Math.round(verificationRate),
        recentHarvests: harvests.slice(0, 5).map((h: any) => ({
          id: h.batchId || h.id,
          cropType: h.cropType,
          quantity: `${h.quantity} ${h.unit}`,
          date: new Date(h.harvestDate).toLocaleDateString(),
          status: h.status,
          qrCode: h.qrCode || `QR${h.batchId || h.id}`,
          location: h.location || "Unknown"
        })),
        marketplaceStats: {
          totalListings,
          activeOrders,
          monthlyRevenue,
          topProducts: listings.slice(0, 3).map((l: any) => ({
            id: l.id,
            name: l.product || l.name,
            sales: 0, // This would come from orders
            revenue: l.price || 0
          }))
        },
        weatherData: weatherData ? {
          current: {
            temp: weatherData.current?.temp_c || 28,
            condition: weatherData.current?.condition?.text || "Sunny",
            humidity: weatherData.current?.humidity || 65
          },
          forecast: weatherData.forecast?.slice(0, 5).map((f: any) => ({
            date: new Date(f.date).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: f.day?.avgtemp_c || 28,
            condition: f.day?.condition?.text || "Sunny"
          })) || []
        } : {
          current: { temp: 28, condition: "Sunny", humidity: 65 },
          forecast: []
        }
      }

      setStats(dashboardStats)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Dashboard fetch error:", error)
      setError("Failed to load dashboard data")
      
      // Set mock data for development/demo purposes
      setStats(getMockStats())
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  const getMockStats = (): DashboardStats => {
    return {
      totalHarvests: 24,
      activeListings: 8,
      totalEarnings: 125000,
      verificationRate: 98,
      recentHarvests: [
        {
          id: "1",
          cropType: "Tomatoes",
          quantity: "500kg",
          date: "2025-01-15",
          status: "verified",
          qrCode: "QR001",
          location: "Lagos State",
        },
        {
          id: "2",
          cropType: "Yam",
          quantity: "200 tubers",
          date: "2025-01-12",
          status: "pending",
          qrCode: "QR002",
          location: "Ogun State",
        },
        {
          id: "3",
          cropType: "Cassava",
          quantity: "300kg",
          date: "2025-01-10",
          status: "verified",
          qrCode: "QR003",
          location: "Lagos State",
        },
      ],
      marketplaceStats: {
        totalListings: 8,
        activeOrders: 3,
        monthlyRevenue: 125000,
        topProducts: [
          { id: "1", name: "Fresh Tomatoes", sales: 45, revenue: 67500 },
          { id: "2", name: "Organic Yam", sales: 32, revenue: 48000 },
          { id: "3", name: "Premium Cassava", sales: 28, revenue: 42000 }
        ]
      },
      weatherData: {
        current: { temp: 28, condition: "Sunny", humidity: 65 },
        forecast: [
          { date: "Mon", temp: 29, condition: "Sunny" },
          { date: "Tue", temp: 27, condition: "Partly Cloudy" },
          { date: "Wed", temp: 26, condition: "Cloudy" },
          { date: "Thu", temp: 28, condition: "Sunny" },
          { date: "Fri", temp: 30, condition: "Sunny" }
        ]
      }
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
            <p className="text-muted-foreground">No dashboard data available</p>
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
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    Weather & Farming Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Weather */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Current Conditions</h4>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-foreground">
                          {stats.weatherData.current.temp}°C
                        </div>
                        <div>
                          <p className="font-medium capitalize">{stats.weatherData.current.condition}</p>
                          <p className="text-sm text-muted-foreground">
                            Humidity: {stats.weatherData.current.humidity}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Forecast */}
                    <div className="space-y-4">
                      <h4 className="font-medium">5-Day Forecast</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {stats.weatherData.forecast.map((day, index) => (
                          <div key={index} className="text-center p-2 bg-muted/50 rounded-lg">
                            <p className="text-xs font-medium">{day.date}</p>
                            <p className="text-lg font-bold">{day.temp}°</p>
                            <p className="text-xs text-muted-foreground capitalize">{day.condition}</p>
                          </div>
                        ))}
                      </div>
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
