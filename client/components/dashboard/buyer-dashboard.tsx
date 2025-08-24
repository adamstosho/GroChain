"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  ShoppingCart, 
  Package, 
  Star, 
  Eye, 
  Calendar, 
  QrCode, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Loader2,
  AlertCircle,
  X,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { DashboardLayout } from "./dashboard-layout"
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

interface BuyerDashboardProps {
  user: User
}

interface BuyerStats {
  totalOrders: number
  activeOrders: number
  totalSpent: number
  savedProducts: number
  monthlyGrowth: number
  averageOrderValue: number
}

interface Order {
  _id: string
  items: Array<{
    listing: {
      _id: string
      product: string
      price: number
      images: string[]
    }
    quantity: number
    price: number
  }>
  total: number
  status: 'pending' | 'paid' | 'delivered' | 'cancelled' | 'completed'
  createdAt: string
  updatedAt: string
}

export function BuyerDashboard({ user }: BuyerDashboardProps) {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<BuyerStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (authUser?.id) {
      fetchDashboardData()
    }
  }, [authUser?.id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch buyer dashboard data from API
      const [dashboardResponse, ordersResponse] = await Promise.all([
        api.getBuyerDashboard(authUser?.id || ''),
        api.getBuyerOrders(authUser?.id || '', { limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
      ])

      if (dashboardResponse.success && dashboardResponse.data) {
        setStats(dashboardResponse.data.stats)
        setOrders(dashboardResponse.data.recentOrders || [])
      } else {
        throw new Error(dashboardResponse.message || 'Failed to fetch dashboard data')
      }

      if (ordersResponse.success && ordersResponse.data) {
        setOrders(ordersResponse.data.orders || [])
      }

      setLastUpdated(new Date())
      toast.success("Dashboard data updated successfully")
    } catch (error) {
      console.error("Dashboard fetch error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load dashboard data"
      setError(errorMessage)
      toast.error(errorMessage)
      
      // Set default empty stats on error
      setStats({
        totalOrders: 0,
        activeOrders: 0,
        totalSpent: 0,
        savedProducts: 0,
        monthlyGrowth: 0,
        averageOrderValue: 0
      })
      setOrders([])
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

  if (loading && !stats) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Welcome back, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">Discover and purchase verified Nigerian produce</p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href="/verify">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                <QrCode className="w-4 h-4 mr-2" />
                Verify Product
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError("")}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                        <div className="flex items-center gap-1 mt-1">
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
                      <ShoppingCart className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                        <p className="text-2xl font-bold text-foreground">{stats.activeOrders}</p>
                      </div>
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalSpent)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Avg: {formatCurrency(stats.averageOrderValue)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Saved Products</p>
                        <p className="text-2xl font-bold text-foreground">{stats.savedProducts}</p>
                      </div>
                      <Star className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/marketplace">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
                    >
                      <Search className="w-6 h-6" />
                      <span>Browse Products</span>
                    </Button>
                  </Link>
                  <Link href="/verify">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
                    >
                      <QrCode className="w-6 h-6" />
                      <span>Verify Product</span>
                    </Button>
                  </Link>
                  <Link href="/orders">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
                    >
                      <Package className="w-6 h-6" />
                      <span>My Orders</span>
                    </Button>
                  </Link>
                  <Link href="/favorites">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
                    >
                      <Star className="w-6 h-6" />
                      <span>Favorites</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order, index) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              {order.items[0]?.listing.product || 'Product'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Package className="w-3 h-3 mr-1" />
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-medium text-foreground">{formatCurrency(order.total)}</p>
                            <Badge variant="secondary">{order.status}</Badge>
                          </div>
                          <Link href={`/orders/${order._id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start shopping to see your orders here
                    </p>
                    <Link href="/marketplace">
                      <Button>
                        <Search className="w-4 h-4 mr-2" />
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                )}
                {orders.length > 0 && (
                  <div className="mt-4 text-center">
                    <Link href="/orders">
                      <Button variant="outline">View All Orders</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Order management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Favorites management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Manage your profile and account settings.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/profile">
                      <Button variant="outline">
                        <Users className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
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