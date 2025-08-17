"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  ShoppingCart, 
  Package, 
  Star, 
  Eye, 
  Calendar, 
  MapPin, 
  QrCode, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Filter,
  Download,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield
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

interface Favorite {
  _id: string
  product: string
  price: number
  images: string[]
  farmer: {
    name: string
    email: string
  }
}

export function BuyerDashboard({ user }: BuyerDashboardProps) {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<BuyerStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [orderFilters, setOrderFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10
  })
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders()
    } else if (activeTab === "favorites") {
      fetchFavorites()
    }
  }, [activeTab, orderFilters])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch orders for stats calculation
      const ordersResponse = await api.getBuyerOrders(user.id, { limit: 100 })
      
      if (ordersResponse.success) {
        const ordersData = ordersResponse.data.orders || []
        setOrders(ordersData)
        
        // Calculate stats from orders data
        const calculatedStats = calculateStats(ordersData)
        setStats(calculatedStats)
      } else {
        throw new Error(ordersResponse.error || "Failed to fetch orders")
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Dashboard fetch error:", error)
      setError("Failed to load dashboard data")
      setStats(getMockStats())
      setOrders(getMockOrders())
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await api.getBuyerOrders(user.id, orderFilters)
      
      if (response.success) {
        setOrders(response.data.orders || [])
      } else {
        throw new Error(response.error || "Failed to fetch orders")
      }
    } catch (error) {
      console.error("Orders fetch error:", error)
      setError("Failed to fetch orders")
    }
  }

  const fetchFavorites = async () => {
    try {
      const response = await api.getFavorites(user.id)
      
      if (response.success) {
        setFavorites(response.data.favorites || [])
      } else {
        throw new Error(response.error || "Failed to fetch favorites")
      }
    } catch (error) {
      console.error("Favorites fetch error:", error)
      setError("Failed to fetch favorites")
      setFavorites(getMockFavorites())
    }
  }

  const calculateStats = (ordersData: Order[]): BuyerStats => {
    const totalOrders = ordersData.length
    const activeOrders = ordersData.filter(order => 
      ['pending', 'paid'].includes(order.status)
    ).length
    const totalSpent = ordersData
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
    
    // Calculate monthly growth (mock for now)
    const monthlyGrowth = 12.5

    return {
      totalOrders,
      activeOrders,
      totalSpent,
      savedProducts: 0, // Will be updated when favorites are fetched
      monthlyGrowth,
      averageOrderValue
    }
  }

  const handleOrderFilterChange = (key: string, value: string) => {
    setOrderFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await api.cancelOrder(orderId)
      
      if (response.success) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order._id === orderId 
            ? { ...order, status: 'cancelled' as const }
            : order
        ))
        
        // Refresh stats
        fetchDashboardData()
      } else {
        throw new Error(response.error || "Failed to cancel order")
      }
    } catch (error) {
      console.error("Cancel order error:", error)
      setError("Failed to cancel order")
    }
  }

  const handleRemoveFavorite = async (listingId: string) => {
    try {
      const response = await api.removeFromFavorites(user.id, listingId)
      
      if (response.success) {
        setFavorites(prev => prev.filter(fav => fav._id !== listingId))
        
        // Update stats
        if (stats) {
          setStats(prev => prev ? { ...prev, savedProducts: prev.savedProducts - 1 } : null)
        }
      } else {
        throw new Error(response.error || "Failed to remove from favorites")
      }
    } catch (error) {
      console.error("Remove favorite error:", error)
      setError("Failed to remove from favorites")
    }
  }

  const getMockStats = (): BuyerStats => ({
    totalOrders: 12,
    activeOrders: 3,
    totalSpent: 85000,
    savedProducts: 15,
    monthlyGrowth: 12.5,
    averageOrderValue: 7083
  })

  const getMockOrders = (): Order[] => [
    {
      _id: "1",
      items: [{
        listing: {
          _id: "listing1",
          product: "Fresh Tomatoes",
          price: 15000,
          images: []
        },
        quantity: 50,
        price: 15000
      }],
      total: 15000,
      status: "delivered",
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2025-01-15T10:00:00Z"
    },
    {
      _id: "2",
      items: [{
        listing: {
          _id: "listing2",
          product: "Organic Yam",
          price: 8000,
          images: []
        },
        quantity: 20,
        price: 8000
      }],
      total: 8000,
      status: "in-transit",
      createdAt: "2025-01-12T10:00:00Z",
      updatedAt: "2025-01-12T10:00:00Z"
    }
  ]

  const getMockFavorites = (): Favorite[] => [
    {
      _id: "fav1",
      product: "Fresh Tomatoes",
      price: 15000,
      images: [],
      farmer: {
        name: "Adunni Farms",
        email: "adunni@farms.com"
      }
    },
    {
      _id: "fav2",
      product: "Organic Yam",
      price: 8000,
      images: [],
      farmer: {
        name: "Ibrahim Agro",
        email: "ibrahim@agro.com"
      }
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'in-transit':
        return <Truck className="w-4 h-4 text-purple-600" />
      default:
        return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'paid':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'in-transit':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
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
                              {Math.abs(stats.monthlyGrowth)}%
                            </span>
                          </div>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-primary" />
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
                          <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                          <p className="text-2xl font-bold text-foreground">{stats.activeOrders}</p>
                        </div>
                        <Package className="w-8 h-8 text-primary" />
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
                          <p className="text-sm font-medium text-muted-foreground">Saved Products</p>
                          <p className="text-2xl font-bold text-foreground">{stats.savedProducts}</p>
                        </div>
                        <Star className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
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
                    onClick={fetchDashboardData}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order, index) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
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
                          <Badge className={getStatusColor(order.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status}
                            </div>
                          </Badge>
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
                <div className="mt-4 text-center">
                  <Link href="/orders">
                    <Button variant="outline">View All Orders</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            {/* Order Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Order Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                      value={orderFilters.status}
                      onValueChange={(value) => handleOrderFilterChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={orderFilters.startDate}
                      onChange={(e) => handleOrderFilterChange('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={orderFilters.endDate}
                      onChange={(e) => handleOrderFilterChange('endDate', e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOrderFilters({
                          status: "",
                          startDate: "",
                          endDate: "",
                          page: 1,
                          limit: 10
                        })
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order History</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchOrders}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders found</p>
                    <Link href="/marketplace">
                      <Button className="mt-2">Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Order #{order._id.slice(-8)}
                            </span>
                            <Badge className={getStatusColor(order.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(order.status)}
                                {order.status}
                              </div>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            {order.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelOrder(order._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Package className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{item.listing.product}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.quantity} units × {formatCurrency(item.price)}
                                  </p>
                                </div>
                              </div>
                              <span className="font-medium">
                                {formatCurrency(item.quantity * item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                          <span className="text-sm text-muted-foreground">
                            Total: {formatCurrency(order.total)}
                          </span>
                          <div className="flex gap-2">
                            <Link href={`/orders/${order._id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/orders/${order._id}/tracking`}>
                              <Button variant="outline" size="sm">
                                <Truck className="w-4 h-4 mr-2" />
                                Track
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Saved Products
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchFavorites}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No saved products yet</p>
                    <Link href="/marketplace">
                      <Button className="mt-2">Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((favorite) => (
                      <Card key={favorite._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-primary" />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFavorite(favorite._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <h4 className="font-medium mb-2">{favorite.product}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            from {favorite.farmer.name}
                          </p>
                          <p className="text-lg font-bold text-primary mb-3">
                            {formatCurrency(favorite.price)}
                          </p>
                          
                          <div className="flex gap-2">
                            <Link href={`/marketplace/${favorite._id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </Link>
                            <Button size="sm" className="flex-1">
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Buy Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
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
                    <Link href="/security-settings">
                      <Button variant="outline">
                        <Shield className="w-4 h-4 mr-2" />
                        Security Settings
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
