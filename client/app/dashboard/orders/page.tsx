"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useBuyerStore } from "@/hooks/use-buyer-store"
import {
  Package,
  Search,
  Filter,
  MapPin,
  Star,
  Eye,
  Calendar,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Loader2,
  Receipt,
  User,
  Building
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface OrderItem {
  _id: string
  listing: {
    _id: string
    cropName: string
    images: string[]
    category: string
    unit: string
    farmer: {
      _id: string
      name: string
      email: string
      profile: {
        phone: string
        farmName: string
      }
    }
  }
  quantity: number
  price: number
  unit: string
  total: number
}

interface Order {
  _id: string
  orderNumber: string
  buyer: {
    _id: string
    name: string
    email: string
    profile: {
      phone: string
      avatar: string
    }
  }
  seller: string
  items: OrderItem[]
  total: number
  subtotal: number
  tax: number
  shipping: number
  discount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  shippingAddress: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
    phone: string
  }
  deliveryInstructions: string
  estimatedDelivery: string
  actualDelivery?: string
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

interface OrderStats {
  total: number
  pending: number
  confirmed: number
  shipped: number
  delivered: number
  cancelled: number
  totalSpent: number
}

interface OrdersResponse {
  orders: Order[]
  stats: OrderStats
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

interface OrderFilters {
  status: "all" | OrderStatus
  paymentStatus: "all" | PaymentStatus
  dateRange: "all" | "today" | "week" | "month" | "quarter" | "year"
  searchQuery: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalSpent: 0
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [filters, setFilters] = useState<OrderFilters>({
    status: "all",
    paymentStatus: "all",
    dateRange: "all",
    searchQuery: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchOrdersData()
  }, [])

  const fetchOrdersData = async (page = 1, status?: string, paymentStatus?: string) => {
    try {
      setLoading(true)
      console.log('📦 Fetching orders from backend...')

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      if (status && status !== 'all') queryParams.append('status', status)
      if (paymentStatus && paymentStatus !== 'all') queryParams.append('paymentStatus', paymentStatus)

      const response = await apiService.getUserOrders({
        page: page.toString(),
        limit: '20',
        ...(status && status !== 'all' && { status }),
        ...(paymentStatus && paymentStatus !== 'all' && { paymentStatus })
      })
      console.log('📋 Orders API Response:', response)

      if (response?.status === 'success' && response?.data) {
        // Handle the structured response from backend
        const ordersData = response.data.orders || []
        const statsData = response.data.stats || {
          total: 0,
          pending: 0,
          confirmed: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          totalSpent: 0
        }
        const paginationData = response.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }

        setOrders(ordersData)
        setStats(statsData)
        setPagination(paginationData)

        console.log('✅ Orders loaded successfully:', ordersData?.length || 0, 'orders')
        console.log('📊 Stats:', statsData)
      } else {
        console.warn('⚠️ Orders response not in expected format:', response)
        setOrders([])
        setStats({
          total: 0,
          pending: 0,
          confirmed: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          totalSpent: 0
        })
      }
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error)
      toast({
        title: "Error Loading Orders",
        description: "Failed to load your orders. Please try again.",
        variant: "destructive",
      })
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await fetchOrdersData(1, filters.status, filters.paymentStatus)
      toast({
        title: "Refreshed",
        description: "Orders data has been updated",
      })
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }

    // Use useMemo for filtered orders to prevent infinite loops
  const filteredOrders = useMemo(() => {
    let filtered = [...orders]

    // Tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(order => order.status === activeTab)
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(order => order.status === filters.status)
    }

    // Payment status filter
    if (filters.paymentStatus !== "all") {
      filtered = filtered.filter(order => order.paymentStatus === filters.paymentStatus)
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      switch (filters.dateRange) {
        case "today":
          filtered = filtered.filter(order =>
            new Date(order.createdAt).toDateString() === today.toDateString()
          )
          break
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(order => new Date(order.createdAt) >= weekAgo)
          break
        case "month":
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
          filtered = filtered.filter(order => new Date(order.createdAt) >= monthAgo)
          break
        case "quarter":
          const quarterAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
          filtered = filtered.filter(order => new Date(order.createdAt) >= quarterAgo)
          break
        case "year":
          const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
          filtered = filtered.filter(order => new Date(order.createdAt) >= yearAgo)
          break
      }
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(query) ||
        order.items.some(item => item.listing?.cropName?.toLowerCase().includes(query)) ||
        order.items.some(item => item.listing?.farmer?.name?.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [orders, filters, activeTab])



  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <RefreshCw className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      case 'refunded': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }



  if (loading) {
    return (
      <DashboardLayout pageTitle="My Orders">
        <div className="space-y-6">
          {/* Loading Header */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* Loading Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Loading Filters */}
          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <Skeleton className="h-10 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>

          {/* Loading Orders */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="My Orders">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <p className="text-muted-foreground">
              Track your orders, view delivery status, and manage your purchases
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard/marketplace">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Shipped</p>
                  <p className="text-2xl font-bold">{stats.shipped}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>
              View and manage your orders by status and filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed ({stats.confirmed})</TabsTrigger>
                <TabsTrigger value="shipped">Shipped ({stats.shipped})</TabsTrigger>
                <TabsTrigger value="delivered">Delivered ({stats.delivered})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({stats.cancelled})</TabsTrigger>
                <TabsTrigger value="refunded">Refunded</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search orders, products, or sellers..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                      className="max-w-md"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={filters.status} 
                      onValueChange={(value) => setFilters({ ...filters, status: value as OrderStatus })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={filters.paymentStatus} 
                      onValueChange={(value) => setFilters({ ...filters, paymentStatus: value as PaymentStatus })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Payment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Payments</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.dateRange}
                      onValueChange={(value) => setFilters({ ...filters, dateRange: value as OrderFilters['dateRange'] })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Date Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                      {stats.total === 0 ? (
                        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                      ) : (
                        <Package className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {stats.total === 0
                        ? "No orders yet"
                        : `No ${activeTab !== "all" ? activeTab : ""} orders found`
                      }
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {stats.total === 0
                        ? "You haven't placed any orders yet. Start shopping to see your orders here."
                        : activeTab === "all"
                          ? "No orders match your current filters. Try adjusting your search criteria."
                          : `You don't have any orders with "${activeTab}" status.`
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {stats.total === 0 ? (
                        <Button asChild size="lg">
                          <Link href="/dashboard/marketplace">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Start Shopping
                          </Link>
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setFilters({
                                status: "all",
                                paymentStatus: "all",
                                dateRange: "all",
                                searchQuery: ""
                              })
                              setActiveTab("all")
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear Filters
                          </Button>
                          <Button asChild>
                            <Link href="/dashboard/marketplace">
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              Browse More Products
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <OrderCard 
                        key={order._id} 
                        order={order}
                        getStatusColor={getStatusColor}
                        getPaymentStatusColor={getPaymentStatusColor}
                        getStatusIcon={getStatusIcon}
                        formatPrice={formatPrice}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

interface OrderCardProps {
  order: Order
  getStatusColor: (status: OrderStatus) => string
  getPaymentStatusColor: (status: PaymentStatus) => string
  getStatusIcon: (status: OrderStatus) => React.ReactNode
  formatPrice: (price: number) => string
  formatDate: (date: Date) => string
}

function OrderCard({
  order,
  getStatusColor,
  getPaymentStatusColor,
  getStatusIcon,
  formatPrice,
  formatDate
}: OrderCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20">
      <CardContent className="p-6">
        {/* Order Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <Badge className={`${getStatusColor(order.status)} font-medium`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`${getPaymentStatusColor(order.paymentStatus)} font-medium`}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Order:</span>
            <span className="font-mono font-semibold text-primary">{order.orderNumber || `ORD-${order._id.slice(-6).toUpperCase()}`}</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{formatDate(new Date(order.createdAt))}</span>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3 mb-4">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={item.listing?.images?.[0] || "/placeholder.svg"}
                  alt={item.listing?.cropName || 'Product'}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">{item.listing?.cropName || 'Unknown Product'}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} {item.unit} × {formatPrice(item.price)}
                </p>
                {item.listing?.farmer?.name && (
                  <p className="text-xs text-muted-foreground">
                    Sold by: {item.listing.farmer.name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">{formatPrice(item.total)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Seller Info */}
          <div className="space-y-3">
            <h5 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Seller Information
            </h5>
            <div className="space-y-2">
              {order.items[0]?.listing?.farmer ? (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{order.items[0].listing.farmer.name}</span>
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Building className="h-3 w-3" />
                    <span>{order.items[0].listing.farmer.profile?.farmName || 'Farm'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{order.items[0].listing.farmer.profile?.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{order.items[0].listing.farmer.email}</span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Seller information not available
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-3">
            <h5 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Information
            </h5>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}
                </span>
              </div>
              {order.estimatedDelivery && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Est. Delivery: {formatDate(new Date(order.estimatedDelivery))}
                  </span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex items-center space-x-2 text-sm">
                  <Truck className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Tracking: {order.trackingNumber}
                  </span>
                </div>
              )}
              {order.actualDelivery && (
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    Delivered: {formatDate(new Date(order.actualDelivery!))}
                  </span>
                </div>
              )}
              {order.deliveryInstructions && (
                <div className="text-sm text-muted-foreground">
                  <strong>Instructions:</strong> {order.deliveryInstructions}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-3">
            <h5 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Order Summary
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              {order.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span className="font-medium">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/orders/${order._id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Full Details
            </Link>
          </Button>

          {order.trackingNumber && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/orders/${order._id}/tracking`}>
                <Truck className="h-4 w-4 mr-2" />
                Track Package
              </Link>
            </Button>
          )}

          {order.status === 'delivered' && (
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Seller
            </Button>
          )}

          {order.status === 'pending' && (
            <Button variant="destructive" size="sm">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          )}

          {order.status === 'shipped' && !order.trackingNumber && (
            <Button variant="outline" size="sm">
              <Truck className="h-4 w-4 mr-2" />
              Request Tracking
            </Button>
          )}

          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
