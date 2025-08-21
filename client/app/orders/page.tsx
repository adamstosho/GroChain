"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import Link from "next/link"
import { 
  Loader2, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  CreditCard,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "sonner"

interface OrderItem {
  listing: string
  quantity: number
  unit: string
  price: number
  total: number
  product: string
  farmer: string
}

interface OrderSummary {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  buyer: {
    name: string
    email: string
    phone: string
  }
  seller: {
    name: string
    location: string
  }
  shippingAddress?: {
    address: string
    city: string
    state: string
  }
  estimatedDelivery?: string
  trackingNumber?: string
}

interface OrderFilters {
  search: string
  status: string
  paymentStatus: string
  dateRange: string
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [filters, setFilters] = useState<OrderFilters>({
    search: "",
    status: "all",
    paymentStatus: "all",
    dateRange: "all"
  })

  useEffect(() => {
    if (!loading && user) {
      fetchOrders(user.id)
    }
  }, [loading, user])

  useEffect(() => {
    filterOrders()
  }, [orders, filters])

  const fetchOrders = async (buyerId: string) => {
    setIsLoading(true)
    try {
      const resp = await api.getBuyerOrders(buyerId)
      if (resp.success && resp.data) {
        const payload: any = resp.data
        const list = payload.data || payload
        const transformedOrders: OrderSummary[] = (list || []).map((o: any) => ({
          id: o._id || o.id,
          orderNumber: o.orderNumber || `ORD-${(o._id || o.id).slice(-6).toUpperCase()}`,
          status: o.status || "pending",
          paymentStatus: o.paymentStatus || "pending",
          totalAmount: o.totalAmount || o.total || 0,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt || o.createdAt,
          items: o.items || [],
          buyer: o.buyer || { name: "Unknown", email: "", phone: "" },
          seller: o.seller || { name: "Unknown", location: "Unknown" },
          shippingAddress: o.shippingAddress,
          estimatedDelivery: o.estimatedDelivery,
          trackingNumber: o.trackingNumber
        }))
        setOrders(transformedOrders)
      } else {
        setOrders([])
      }
    } catch (e) {
      console.error("Error fetching orders:", e)
      setOrders([])
      toast.error("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (filters.search) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
          order.items.some(item => 
            item.product.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.farmer.toLowerCase().includes(filters.search.toLowerCase())
          )
      )
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((order) => order.status === filters.status)
    }

    if (filters.paymentStatus !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === filters.paymentStatus)
    }

    if (filters.dateRange !== "all") {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter((order) => new Date(order.createdAt) >= filterDate)
    }

    setFilteredOrders(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="default" className="bg-green-500">Delivered</Badge>
      case "shipped":
        return <Badge variant="secondary" className="bg-blue-500">Shipped</Badge>
      case "processing":
        return <Badge variant="secondary" className="bg-yellow-500">Processing</Badge>
      case "confirmed":
        return <Badge variant="outline" className="border-green-500 text-green-600">Confirmed</Badge>
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-500">Paid</Badge>
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "refunded":
        return <Badge variant="outline" className="border-gray-500 text-gray-600">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const handleRefresh = () => {
    if (user) {
      fetchOrders(user.id)
      toast.success("Orders refreshed")
    }
  }

  if (loading || isLoading) {
    return (
      <DashboardLayout user={user as any}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
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
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-muted-foreground">
              Track your orders, manage deliveries, and view order history
            </p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/marketplace">
                <Package className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Order Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === "processing" || o.status === "shipped").length}
              </div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === "delivered").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" /> My Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search orders..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Order Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.paymentStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    {filters.search || filters.status !== "all" || filters.paymentStatus !== "all" || filters.dateRange !== "all"
                      ? "No orders match your filters"
                      : "No orders yet."}
                  </p>
                  {!filters.search && filters.status === "all" && filters.paymentStatus === "all" && filters.dateRange === "all" && (
                    <Button asChild>
                      <Link href="/marketplace">
                        <Package className="h-4 w-4 mr-2" />
                        Browse Products
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-muted rounded-lg">
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <h3 className="font-medium">{order.orderNumber}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium mb-2">Order Details</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Total:</span> ₦{order.totalAmount.toLocaleString()}</p>
                            <p><span className="font-medium">Seller:</span> {order.seller.name}</p>
                            <p><span className="font-medium">Location:</span> {order.seller.location}</p>
                            {order.estimatedDelivery && (
                              <p><span className="font-medium">Est. Delivery:</span> {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Items</h4>
                          <div className="space-y-1 text-sm">
                            {order.items.slice(0, 3).map((item, index) => (
                              <p key={index}>
                                {item.product} - {item.quantity} {item.unit} @ ₦{item.price}
                              </p>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-muted-foreground">+{order.items.length - 3} more items</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Updated: {new Date(order.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/payments/${order.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                          {order.paymentStatus === "pending" && (
                            <Button asChild size="sm">
                              <Link href={`/payments/process?orderId=${order.id}`}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay Now
                              </Link>
                              </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}



