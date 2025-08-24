"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Plus,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  TrendingUp,
  BarChart3,
  QrCode,
  Shield,
  Star
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import Link from "next/link"
import { toast } from "sonner"

interface OrderItem {
  listing: {
    _id: string
    product: string
    price: number
    images: string[]
    farmer: {
      _id: string
      name: string
      location: string
      rating: number
    }
  }
  quantity: number
  price: number
}

interface Order {
  _id: string
  buyer: {
    _id: string
    name: string
    email: string
    phone: string
    address: string
  }
  items: OrderItem[]
  total: number
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  deliveryAddress: string
  estimatedDelivery?: string
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
  paymentMethod?: string
  commission?: number
}

interface OrderStats {
  totalOrders: number
  totalValue: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  monthlyGrowth: number
  averageOrderValue: number
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("orders")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")
  const [trackingNumber, setTrackingNumber] = useState<string>("")
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>("")
  const [orderNotes, setOrderNotes] = useState<string>("")

  useEffect(() => {
    if (!loading && user) {
      fetchOrders(user.id)
      fetchOrderStats()
    }
  }, [loading, user])

  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some(
            (item) =>
              item.listing.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.listing.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === paymentFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter, paymentFilter])

  const fetchOrders = async (buyerId: string) => {
    setIsLoading(true)
    try {
      const resp = await api.getBuyerOrders(buyerId)
      if (resp.success && resp.data) {
        const payload: any = resp.data
        const list = payload.data || payload
        setOrders(list || [])
      } else {
        setOrders([])
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrderStats = async () => {
    try {
      const resp = await api.get("/api/analytics/orders/stats")
      if (resp.success && resp.data) {
        setOrderStats(resp.data)
      }
    } catch (error) {
      console.error("Failed to fetch order stats:", error)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string, additionalData?: any) => {
    try {
      setUpdatingStatus(true)
      
      const updateData: any = { status }
      if (additionalData?.trackingNumber) updateData.trackingNumber = additionalData.trackingNumber
      if (additionalData?.estimatedDelivery) updateData.estimatedDelivery = additionalData.estimatedDelivery
      if (additionalData?.notes) updateData.notes = additionalData.notes

      const response = await api.updateOrderStatus(orderId, status)
      
      if (response.success) {
        toast.success("Order status updated successfully!")
        fetchOrders(user?.id || '')
        setShowOrderModal(false)
        setNewStatus("")
        setTrackingNumber("")
        setEstimatedDelivery("")
        setOrderNotes("")
      } else {
        toast.error(response.error || "Failed to update order status")
      }
    } catch (error) {
      console.error("Order status update error:", error)
      toast.error("Failed to update order status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const cancelOrder = async (orderId: string, reason: string) => {
    try {
      const response = await api.cancelOrder(orderId)
      
      if (response.success) {
        toast.success("Order cancelled successfully!")
        fetchOrders(user?.id || '')
      } else {
        toast.error(response.error || "Failed to cancel order")
      }
    } catch (error) {
      console.error("Order cancellation error:", error)
      toast.error("Failed to cancel order")
    }
  }

  const getStatusBadge = (status: Order["status"]) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800"
    }
    return variants[status] || "bg-gray-100 text-gray-800"
  }

  const getPaymentStatusBadge = (status: Order["paymentStatus"]) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-purple-100 text-purple-800"
    }
    return variants[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "shipped":
        return <Truck className="w-4 h-4 text-blue-600" />
      case "processing":
        return <Package className="w-4 h-4 text-purple-600" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const exportOrders = async (format: 'csv' | 'excel' | 'json') => {
    try {
      const response = await api.exportAnalytics({
        format,
        period: 'all',
        type: 'orders'
      })

      if (response.success) {
        // Handle file download
        const blob = new Blob([response.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `grochain-orders-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Orders exported successfully!")
      } else {
        throw new Error(response.error || "Failed to export orders")
      }
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export orders")
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Track and manage all your marketplace orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportOrders('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportOrders('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
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

      {/* Order Statistics */}
      {orderStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{orderStats.totalOrders}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-foreground">₦{orderStats.totalValue?.toLocaleString()}</p>
                </div>
                <CreditCard className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{orderStats.pendingOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Growth</p>
                  <p className="text-2xl font-bold text-foreground">{orderStats.monthlyGrowth || 0}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by order ID, buyer, product, or farmer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Package className="w-5 h-5 mr-2 text-primary" />
                  Recent Orders ({filteredOrders.length})
                </span>
                <Button variant="outline" size="sm" onClick={() => fetchOrders(user?.id || '')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "You haven't placed any orders yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order, index) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">Order #{order._id.slice(-6).toUpperCase()}</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.items.map((item) => item.listing.product).join(", ")}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {order.buyer.name}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Package className="w-3 h-3 mr-1" />
                              {order.items.length} items
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-medium text-foreground">₦{order.total.toLocaleString()}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge className={getStatusBadge(order.status)}>
                              {order.status}
                            </Badge>
                            <Badge className={getPaymentStatusBadge(order.paymentStatus)}>
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowOrderModal(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order._id, 'processing')}
                              disabled={updatingStatus}
                            >
                              {updatingStatus ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          {order.status === 'processing' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order._id, 'shipped')}
                              disabled={updatingStatus}
                            >
                              <Truck className="w-4 h-4" />
                            </Button>
                          )}
                          {order.status === 'shipped' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order._id, 'delivered')}
                              disabled={updatingStatus}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {['pending', 'paid', 'processing'].includes(order.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelOrder(order._id, 'Customer request')}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track your orders in real-time and get delivery updates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed order analytics and insights will be implemented in the next phase.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Order ID</Label>
                  <p className="font-medium">{selectedOrder._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusBadge(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Payment</Label>
                  <Badge className={getPaymentStatusBadge(selectedOrder.paymentStatus)}>
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total</Label>
                  <p className="font-medium text-lg">₦{selectedOrder.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Buyer Information */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Buyer Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedOrder.buyer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedOrder.buyer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedOrder.buyer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedOrder.buyer.address}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Order Items</Label>
                <div className="space-y-3 mt-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.listing.product}</p>
                          <p className="text-sm text-muted-foreground">
                            Farmer: {item.listing.farmer.name} • {item.listing.farmer.location}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              ₦{item.listing.price.toLocaleString()} each
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </span>
                            {item.listing.farmer.rating > 0 && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs">{item.listing.farmer.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Information */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Delivery Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Address</p>
                    <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                    <p className="font-medium">
                      {selectedOrder.estimatedDelivery 
                        ? new Date(selectedOrder.estimatedDelivery).toLocaleDateString()
                        : 'Not set'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-medium">
                      {selectedOrder.trackingNumber || 'Not available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-muted-foreground mb-3 block">Update Order</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm">New Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Tracking Number</Label>
                    <Input
                      placeholder="Enter tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Estimated Delivery</Label>
                    <Input
                      type="date"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-sm">Notes</Label>
                  <Textarea
                    placeholder="Add order notes..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowOrderModal(false)}>
                  Close
                </Button>
                {newStatus && (
                  <Button
                    onClick={() => updateOrderStatus(selectedOrder._id, newStatus, {
                      trackingNumber,
                      estimatedDelivery,
                      notes: orderNotes
                    })}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Update Order
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}



