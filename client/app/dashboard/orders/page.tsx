"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
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

  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface OrderItem {
  _id: string
  listing: string
  cropName: string
  quantity: number
  unit: string
  price: number
  total: number
  image: string
}

interface Order {
  _id: string
  orderNumber: string
  buyer: string
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
  estimatedDelivery: Date
  actualDelivery?: Date
  trackingNumber?: string
  createdAt: Date
  updatedAt: Date
  sellerInfo: {
    name: string
    phone: string
    email: string
    rating: number
    verified: boolean
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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [filters, setFilters] = useState<OrderFilters>({
    status: "all",
    paymentStatus: "all",
    dateRange: "all",
    searchQuery: ""
  })
  const { toast } = useToast()
  const { fetchOrders } = useBuyerStore()

  // Mock data for development - replace with API calls
  const mockOrders: Order[] = [
    {
      _id: "1",
      orderNumber: "ORD-2024-001",
      buyer: "buyer_id",
      seller: "seller_id",
      items: [
        {
          _id: "item1",
          listing: "listing1",
          cropName: "Premium Maize",
          quantity: 100,
          unit: "kg",
          price: 2500,
          total: 250000,
          image: "/placeholder.svg"
        }
      ],
      total: 252500,
      subtotal: 250000,
      tax: 1500,
      shipping: 1000,
      discount: 0,
      status: "delivered",
      paymentStatus: "paid",
      paymentMethod: "paystack",
      shippingAddress: {
        street: "123 Buyer Street",
        city: "Lagos",
        state: "Lagos",
        country: "Nigeria",
        postalCode: "100001",
        phone: "+2348012345678"
      },
      deliveryInstructions: "Leave at gate if no one is home",
      estimatedDelivery: new Date("2024-01-20"),
      actualDelivery: new Date("2024-01-18"),
      trackingNumber: "TRK-001-2024",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-18"),
      sellerInfo: {
        name: "Ahmed Hassan",
        phone: "+2348098765432",
        email: "ahmed@farm.com",
        rating: 4.9,
        verified: true
      }
    },
    {
      _id: "2",
      orderNumber: "ORD-2024-002",
      buyer: "buyer_id",
      seller: "seller_id",
      items: [
        {
          _id: "item2",
          listing: "listing2",
          cropName: "Sweet Cassava",
          quantity: 50,
          unit: "kg",
          price: 1800,
          total: 90000,
          image: "/placeholder.svg"
        }
      ],
      total: 92500,
      subtotal: 90000,
      tax: 1500,
      shipping: 1000,
      discount: 0,
      status: "shipped",
      paymentStatus: "paid",
      paymentMethod: "paystack",
      shippingAddress: {
        street: "123 Buyer Street",
        city: "Lagos",
        state: "Lagos",
        country: "Nigeria",
        postalCode: "100001",
        phone: "+2348012345678"
      },
      deliveryInstructions: "Call before delivery",
      estimatedDelivery: new Date("2024-01-25"),
      createdAt: new Date("2024-01-16"),
      updatedAt: new Date("2024-01-22"),
      sellerInfo: {
        name: "Fatima Adebayo",
        phone: "+2348076543210",
        email: "fatima@farm.com",
        rating: 4.7,
        verified: true
      }
    },
    {
      _id: "3",
      orderNumber: "ORD-2024-003",
      buyer: "buyer_id",
      seller: "seller_id",
      items: [
        {
          _id: "item3",
          listing: "listing3",
          cropName: "Organic Tomatoes",
          quantity: 25,
          unit: "kg",
          price: 1200,
          total: 30000,
          image: "/placeholder.svg"
        }
      ],
      total: 32000,
      subtotal: 30000,
      tax: 1000,
      shipping: 1000,
      discount: 0,
      status: "processing",
      paymentStatus: "paid",
      paymentMethod: "paystack",
      shippingAddress: {
        street: "123 Buyer Street",
        city: "Lagos",
        state: "Lagos",
        country: "Nigeria",
        postalCode: "100001",
        phone: "+2348012345678"
      },
      deliveryInstructions: "Ring doorbell twice",
      estimatedDelivery: new Date("2024-01-28"),
      createdAt: new Date("2024-01-17"),
      updatedAt: new Date("2024-01-20"),
      sellerInfo: {
        name: "Yusuf Bello",
        phone: "+2348065432109",
        email: "yusuf@farm.com",
        rating: 4.8,
        verified: true
      }
    },
    {
      _id: "4",
      orderNumber: "ORD-2024-004",
      buyer: "buyer_id",
      seller: "seller_id",
      items: [
        {
          _id: "item4",
          listing: "listing4",
          cropName: "Quality Rice",
          quantity: 80,
          unit: "kg",
          price: 3200,
          total: 256000,
          image: "/placeholder.svg"
        }
      ],
      total: 259000,
      subtotal: 256000,
      tax: 2000,
      shipping: 1000,
      discount: 0,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "paystack",
      shippingAddress: {
        street: "123 Buyer Street",
        city: "Lagos",
        state: "Lagos",
        country: "Nigeria",
        postalCode: "100001",
        phone: "+2348012345678"
      },
      deliveryInstructions: "Weekend delivery preferred",
      estimatedDelivery: new Date("2024-02-05"),
      createdAt: new Date("2024-01-18"),
      updatedAt: new Date("2024-01-18"),
      sellerInfo: {
        name: "Hassan Ibrahim",
        phone: "+2348054321098",
        email: "hassan@farm.com",
        rating: 4.6,
        verified: true
      }
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders)
      setFilteredOrders(mockOrders)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    filterOrders()
  }, [filters, orders, activeTab])

  const filterOrders = () => {
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
        order.orderNumber.toLowerCase().includes(query) ||
        order.items.some(item => item.cropName.toLowerCase().includes(query)) ||
        order.sellerInfo.name.toLowerCase().includes(query)
      )
    }

    setFilteredOrders(filtered)
  }

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

  const getOrderStats = () => {
    const total = orders.length
    const pending = orders.filter(o => o.status === 'pending').length
    const processing = orders.filter(o => o.status === 'processing').length
    const shipped = orders.filter(o => o.status === 'shipped').length
    const delivered = orders.filter(o => o.status === 'delivered').length
    const totalSpent = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0)

    return { total, pending, processing, shipped, delivered, totalSpent }
  }

  if (loading) {
    return (
      <DashboardLayout pageTitle="My Orders">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Loading orders...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const stats = getOrderStats()

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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
            <Button size="sm">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
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
          <Card>
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold">{stats.shipped}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
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
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="processing">Processing ({stats.processing})</TabsTrigger>
                <TabsTrigger value="shipped">Shipped ({stats.shipped})</TabsTrigger>
                <TabsTrigger value="delivered">Delivered ({stats.delivered})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
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
                      onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
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
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground mb-4">
                      {activeTab === "all" 
                        ? "You haven't placed any orders yet."
                        : `No orders with status "${activeTab}" found.`
                      }
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/products">
                        Browse Products
                      </Link>
                    </Button>
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Order Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <Badge className={`${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Order:</span>
            <span className="font-mono font-medium">{order.orderNumber}</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3 mb-4">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.cropName}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground">{item.cropName}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} {item.unit} × {formatPrice(item.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(item.total)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Seller Info */}
          <div className="space-y-2">
            <h5 className="font-medium text-sm text-muted-foreground">Seller Information</h5>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{order.sellerInfo.name}</span>
                {order.sellerInfo.verified && (
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{order.sellerInfo.rating}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{order.sellerInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{order.sellerInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-2">
            <h5 className="font-medium text-sm text-muted-foreground">Delivery Information</h5>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Est. Delivery: {formatDate(order.estimatedDelivery)}
                </span>
              </div>
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
                    Delivered: {formatDate(order.actualDelivery)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-2">
            <h5 className="font-medium text-sm text-muted-foreground">Order Summary</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping:</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="text-green-600">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="border-t pt-1">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span className="text-lg">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/orders/${order._id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          {order.status === 'shipped' && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/orders/${order._id}/tracking`}>
                <Truck className="h-4 w-4 mr-2" />
                Track Shipment
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
            <Button variant="outline" size="sm">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          )}
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
