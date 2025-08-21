"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { 
  CreditCard, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  Calendar,
  User,
  Phone,
  Mail
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

interface Payment {
  id: string
  orderId: string
  amount: number
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  createdAt: string
  items: Array<{
    name: string
    farmer: string
    quantity: number
    unit: string
    price: number
  }>
  paymentMethod: string
  reference: string
  buyer: {
    name: string
    email: string
    phone: string
  }
}

interface PaymentStats {
  totalPayments: number
  totalAmount: number
  pendingPayments: number
  completedPayments: number
  failedPayments: number
  averageAmount: number
}

export function PaymentDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalAmount: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0,
    averageAmount: 0
  })

  useEffect(() => {
    if (user) {
      fetchPaymentData()
    }
  }, [user])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter, dateFilter])

  const fetchPaymentData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch payment history from backend
      const response = await api.getPaymentHistory()
      if (response.success && response.data) {
        const paymentData = response.data.payments || response.data || []
        setPayments(paymentData)
        calculatePaymentStats(paymentData)
      } else {
        // Fallback to mock data for now
        setPayments(mockPayments)
        calculatePaymentStats(mockPayments)
      }
    } catch (error) {
      console.error("Payment fetch error:", error)
      setError("Failed to load payment data")
      // Fallback to mock data
      setPayments(mockPayments)
      calculatePaymentStats(mockPayments)
    } finally {
      setLoading(false)
    }
  }

  const calculatePaymentStats = (paymentList: Payment[]) => {
    const stats: PaymentStats = {
      totalPayments: paymentList.length,
      totalAmount: paymentList.reduce((sum, p) => sum + p.amount, 0),
      pendingPayments: paymentList.filter(p => p.status === "pending").length,
      completedPayments: paymentList.filter(p => p.status === "completed").length,
      failedPayments: paymentList.filter(p => p.status === "failed").length,
      averageAmount: paymentList.length > 0 ? paymentList.reduce((sum, p) => sum + p.amount, 0) / paymentList.length : 0
    }
    setPaymentStats(stats)
  }

  const filterPayments = () => {
    let filtered = payments

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.items.some(
            (item) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.farmer.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter)
    }

    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
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
      
      filtered = filtered.filter((payment) => new Date(payment.createdAt) >= filterDate)
    }

    setFilteredPayments(filtered)
  }

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case "processing":
        return <Badge variant="secondary" className="bg-blue-500">Processing</Badge>
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "cancelled":
        return <Badge variant="outline" className="border-gray-500 text-gray-600">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "cancelled":
        return <X className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const handleRefresh = () => {
    fetchPaymentData()
    toast.success("Payment data refreshed")
  }

  const handleExportPayments = () => {
    // Export functionality would be implemented here
    toast.info("Export functionality coming soon")
  }

  if (!user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <CreditCard className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading payment dashboard...</p>
          </div>
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
            <h1 className="text-3xl font-bold">Payment Dashboard</h1>
            <p className="text-muted-foreground">
              Manage payments, track transactions, and view payment history
            </p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleRefresh} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleExportPayments} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button asChild>
              <Link href="/marketplace">
                <Package className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Payment Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentStats.totalPayments}</div>
              <p className="text-xs text-muted-foreground">
                All time payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{paymentStats.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total value processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{paymentStats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {paymentStats.totalPayments > 0 
                  ? Math.round((paymentStats.completedPayments / paymentStats.totalPayments) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Successful payments
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredPayments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(payment.status)}
                            <div>
                              <p className="font-medium">₦{payment.amount.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">
                                {payment.items.length} items • {new Date(payment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(payment.status)}
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/payments/${payment.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button asChild className="w-full">
                        <Link href="/marketplace">
                          <Package className="h-4 w-4 mr-2" />
                          Browse Products
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/orders">
                          <Truck className="h-4 w-4 mr-2" />
                          View Orders
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/fintech">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Fintech Services
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Input
                        placeholder="Search payments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
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

                  {/* Payment List */}
                  <div className="space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : filteredPayments.length === 0 ? (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No payments found</p>
                      </div>
                    ) : (
                      filteredPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-muted rounded-lg">
                              {getStatusIcon(payment.status)}
                            </div>
                            <div>
                              <p className="font-medium">₦{payment.amount.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">
                                Order: {payment.orderId.slice(-6).toUpperCase()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {payment.items.length} items • {new Date(payment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(payment.status)}
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/payments/${payment.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Manage your orders and track their status
                    </p>
                    <Button asChild>
                      <Link href="/orders">
                        <Truck className="h-4 w-4 mr-2" />
                        Go to Orders
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Detailed payment analytics and insights
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Coming soon: Charts, trends, and detailed analysis
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

// Mock data for development
const mockPayments: Payment[] = [
  {
    id: "pay_001",
    orderId: "ord_001",
    amount: 25000,
    status: "completed",
    createdAt: "2025-01-15T10:30:00Z",
    items: [
      { name: "Fresh Tomatoes", farmer: "Adunni Farms", quantity: 10, unit: "kg", price: 2500 },
      { name: "Organic Yam", farmer: "Ibrahim Agro", quantity: 5, unit: "kg", price: 5000 },
    ],
    paymentMethod: "card",
    reference: "GROCHAIN_001",
    buyer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+2348012345678"
    }
  },
  {
    id: "pay_002",
    orderId: "ord_002",
    amount: 12500,
    status: "processing",
    createdAt: "2025-01-14T14:20:00Z",
    items: [{ name: "Cassava Flour", farmer: "Grace Farms", quantity: 25, unit: "kg", price: 500 }],
    paymentMethod: "bank_transfer",
    reference: "GROCHAIN_002",
    buyer: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+2348098765432"
    }
  },
  {
    id: "pay_003",
    orderId: "ord_003",
    amount: 8000,
    status: "failed",
    createdAt: "2025-01-13T09:15:00Z",
    items: [{ name: "Sweet Potatoes", farmer: "John's Farm", quantity: 8, unit: "kg", price: 1000 }],
    paymentMethod: "ussd",
    reference: "GROCHAIN_003",
    buyer: {
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+2348055555555"
    }
  },
]
