"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { 
  Search, 
  Filter, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  MapPin,
  Calendar,
  Loader2,
  RefreshCw,
  X,
  Download,
  Phone,
  MessageSquare
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Order {
  _id: string
  orderNumber: string
  buyer: {
    _id: string
    name: string
    phone: string
    email: string
  }
  seller: {
    _id: string
    name: string
    phone: string
    location: string
  }
  items: Array<{
    product: string
    quantity: number
    unit: string
    price: number
    total: number
  }>
  totalAmount: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: {
    address: string
    city: string
    state: string
    postalCode: string
  }
  createdAt: string
  updatedAt: string
  estimatedDelivery?: string
  trackingNumber?: string
  notes?: string
}

interface Filters {
  search: string
  status: string
  paymentStatus: string
  dateRange: string
  sortBy: string
}

const orderStatuses = [
  "All",
  "Pending",
  "Confirmed", 
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled"
]

const paymentStatuses = [
  "All",
  "Pending",
  "Paid",
  "Failed",
  "Refunded"
]

const dateRanges = [
  "All",
  "Today",
  "Last 7 days",
  "Last 30 days",
  "Last 3 months",
  "Last year"
]

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount_high", label: "Amount: High to Low" },
  { value: "amount_low", label: "Amount: Low to High" },
  { value: "status", label: "By Status" }
]

export function OrderManagement() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "All",
    paymentStatus: "All",
    dateRange: "All",
    sortBy: "newest"
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [filters, page])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError("")

      const params: any = {
        page,
        limit: 20
      }

      if (filters.search) params.search = filters.search
      if (filters.status !== "All") params.status = filters.status.toLowerCase()
      if (filters.paymentStatus !== "All") params.paymentStatus = filters.paymentStatus.toLowerCase()
      if (filters.sortBy) params.sortBy = filters.sortBy

      // Determine date range
      if (filters.dateRange !== "All") {
        const now = new Date()
        let startDate = new Date()
        
        switch (filters.dateRange) {
          case "Today":
            startDate.setHours(0, 0, 0, 0)
            break
          case "Last 7 days":
            startDate.setDate(now.getDate() - 7)
            break
          case "Last 30 days":
            startDate.setDate(now.getDate() - 30)
            break
          case "Last 3 months":
            startDate.setMonth(now.getMonth() - 3)
            break
          case "Last year":
            startDate.setFullYear(now.getFullYear() - 1)
            break
        }
        params.startDate = startDate.toISOString()
        params.endDate = now.toISOString()
      }

      const response = await api.getBuyerOrders(params)

      if (response.success && response.data) {
        const newOrders = response.data.orders || response.data
        if (page === 1) {
          setOrders(newOrders)
        } else {
          setOrders(prev => [...prev, ...newOrders])
        }
        setHasMore(newOrders.length === 20)
      } else {
        throw new Error(response.error || "Failed to fetch orders")
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      setError("Failed to load orders")
      
      // Mock data fallback
      setOrders(getMockOrders())
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const getMockOrders = (): Order[] => [
    {
      _id: "1",
      orderNumber: "ORD-2025-001",
      buyer: {
        _id: "buyer1",
        name: "John Doe",
        phone: "+2348012345678",
        email: "john@example.com"
      },
      seller: {
        _id: "seller1",
        name: "Adunni Okafor",
        phone: "+2348098765432",
        location: "Lagos State"
      },
      items: [
        {
          product: "Fresh Tomatoes",
          quantity: 25,
          unit: "kg",
          price: 15000,
          total: 375000
        }
      ],
      totalAmount: 375000,
      status: "confirmed",
      paymentStatus: "paid",
      shippingAddress: {
        address: "123 Main Street",
        city: "Lagos",
        state: "Lagos State",
        postalCode: "100001"
      },
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2025-01-15T10:00:00Z",
      estimatedDelivery: "2025-01-18T10:00:00Z",
      notes: "Please deliver in the morning"
    },
    {
      _id: "2",
      orderNumber: "ORD-2025-002",
      buyer: {
        _id: "buyer1",
        name: "John Doe",
        phone: "+2348012345678",
        email: "john@example.com"
      },
      seller: {
        _id: "seller2",
        name: "Ibrahim Mohammed",
        phone: "+2348076543210",
        location: "Kano State"
      },
      items: [
        {
          product: "Organic Yam",
          quantity: 10,
          unit: "tubers",
          price: 8000,
          total: 80000
        }
      ],
      totalAmount: 80000,
      status: "shipped",
      paymentStatus: "paid",
      shippingAddress: {
        address: "123 Main Street",
        city: "Lagos",
        state: "Lagos State",
        postalCode: "100001"
      },
      createdAt: "2025-01-14T15:00:00Z",
      updatedAt: "2025-01-16T09:00:00Z",
      estimatedDelivery: "2025-01-17T15:00:00Z",
      trackingNumber: "TRK-123456789"
    },
    {
      _id: "3",
      orderNumber: "ORD-2025-003",
      buyer: {
        _id: "buyer1",
        name: "John Doe",
        phone: "+2348012345678",
        email: "john@example.com"
      },
      seller: {
        _id: "seller3",
        name: "Choma Ezeh",
        phone: "+2348054321098",
        location: "Enugu State"
      },
      items: [
        {
          product: "Premium Cassava",
          quantity: 50,
          unit: "kg",
          price: 6000,
          total: 300000
        }
      ],
      totalAmount: 300000,
      status: "delivered",
      paymentStatus: "paid",
      shippingAddress: {
        address: "123 Main Street",
        city: "Lagos",
        state: "Lagos State",
        postalCode: "100001"
      },
      createdAt: "2025-01-10T09:00:00Z",
      updatedAt: "2025-01-13T14:00:00Z",
      estimatedDelivery: "2025-01-12T10:00:00Z",
      trackingNumber: "TRK-987654321"
    }
  ]

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "All",
      paymentStatus: "All",
      dateRange: "All",
      sortBy: "newest"
    })
    setPage(1)
  }

  const loadMore = () => {
    setPage(prev => prev + 1)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'processing':
        return <Package className="w-4 h-4" />
      case 'shipped':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.seller.name.toLowerCase().includes(searchTerm) ||
        order.items.some(item => item.product.toLowerCase().includes(searchTerm))
      )
    }
    return true
  })

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            Track and manage your product orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
          <Button onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search orders by number, seller, or product..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg"
          >
            <div>
              <Label className="text-sm font-medium">Order Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Payment Status</Label>
              <Select
                value={filters.paymentStatus}
                onValueChange={(value) => handleFilterChange('paymentStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => handleFilterChange('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {/* Active Filters */}
        {(filters.status !== "All" || filters.paymentStatus !== "All" || filters.dateRange !== "All") && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.status !== "All" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.status}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('status', 'All')}
                />
              </Badge>
            )}
            {filters.paymentStatus !== "All" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.paymentStatus}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('paymentStatus', 'All')}
                />
              </Badge>
            )}
            {filters.dateRange !== "All" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.dateRange}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('dateRange', 'All')}
                />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No orders found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                          <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.product}</span>
                            <span className="text-muted-foreground">
                              {item.quantity} {item.unit} × {formatPrice(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Seller Info */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{order.seller.location}</span>
                        </div>
                        <span>by {order.seller.name}</span>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </Badge>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                        {order.trackingNumber && (
                          <Badge variant="outline">
                            Track: {order.trackingNumber}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <Link href={`/orders/${order._id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      
                      {order.status === 'shipped' && (
                        <Button size="sm" className="w-full">
                          <Truck className="w-4 h-4 mr-2" />
                          Track Order
                        </Button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm" className="w-full">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      )}

                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Phone className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1">
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Orders"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
