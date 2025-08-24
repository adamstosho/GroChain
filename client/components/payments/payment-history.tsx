"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CreditCard, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Plus,
  Wallet,
  Banknote,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
  Receipt,
  QrCode,
  Shield,
  TrendingUp
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"

interface Payment {
  id: string
  orderId: string
  amount: number
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded"
  paymentMethod: "card" | "bank_transfer" | "mobile_money" | "wallet" | "cash"
  reference: string
  createdAt: string
  updatedAt: string
  items: Array<{
    name: string
    farmer: string
    quantity: number
    price: number
  }>
  buyer: {
    name: string
    email: string
    phone: string
  }
  metadata?: {
    transactionId?: string
    gatewayResponse?: string
    failureReason?: string
    refundReason?: string
  }
}

interface PaymentMethod {
  id: string
  type: "card" | "bank_transfer" | "mobile_money" | "wallet"
  name: string
  last4?: string
  bankName?: string
  accountNumber?: string
  phoneNumber?: string
  isDefault: boolean
  isActive: boolean
}

interface PaymentStats {
  totalPayments: number
  totalAmount: number
  pendingAmount: number
  completedAmount: number
  failedAmount: number
  refundedAmount: number
  monthlyGrowth: number
}

export function PaymentHistory() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("payments")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    if (user) {
      fetchPaymentData()
    }
  }, [user])

  useEffect(() => {
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

    if (methodFilter !== "all") {
      filtered = filtered.filter((payment) => payment.paymentMethod === methodFilter)
    }

    setFilteredPayments(filtered)
  }, [payments, searchTerm, statusFilter, methodFilter])

  const fetchPaymentData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch payments from backend
      const paymentsResponse = await api.get("/api/payments")
      if (paymentsResponse.success && paymentsResponse.data) {
        const paymentData = paymentsResponse.data.data || paymentsResponse.data
        setPayments(paymentData)
      }

      // Fetch payment statistics
      const statsResponse = await api.get("/api/payments/stats")
      if (statsResponse.success && statsResponse.data) {
        setPaymentStats(statsResponse.data)
      }

      // Fetch payment methods
      const methodsResponse = await api.get("/api/payments/methods")
      if (methodsResponse.success && methodsResponse.data) {
        setPaymentMethods(methodsResponse.data)
      }

    } catch (error) {
      console.error("Payment data fetch error:", error)
      setError("Failed to load payment data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const processPayment = async (paymentId: string, method: string) => {
    try {
      setProcessingPayment(true)
      
      const response = await api.post(`/api/payments/${paymentId}/process`, {
        paymentMethod: method
      })

      if (response.success) {
        toast.success("Payment processed successfully!")
        fetchPaymentData() // Refresh data
        setShowPaymentModal(false)
      } else {
        toast.error(response.error || "Failed to process payment")
      }
    } catch (error) {
      console.error("Payment processing error:", error)
      toast.error("Failed to process payment")
    } finally {
      setProcessingPayment(false)
    }
  }

  const refundPayment = async (paymentId: string, reason: string) => {
    try {
      const response = await api.post(`/api/payments/${paymentId}/refund`, {
        reason
      })

      if (response.success) {
        toast.success("Refund initiated successfully!")
        fetchPaymentData() // Refresh data
      } else {
        toast.error(response.error || "Failed to initiate refund")
      }
    } catch (error) {
      console.error("Refund error:", error)
      toast.error("Failed to initiate refund")
    }
  }

  const getStatusBadge = (status: Payment["status"]) => {
    const variants = {
      completed: "bg-green-100 text-green-800",
      processing: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      refunded: "bg-purple-100 text-purple-800"
    }
    return variants[status] || "bg-gray-100 text-gray-800"
  }

  const getMethodIcon = (method: Payment["paymentMethod"]) => {
    switch (method) {
      case "card":
        return <CreditCard className="w-4 h-4" />
      case "bank_transfer":
        return <Banknote className="w-4 h-4" />
      case "mobile_money":
        return <Smartphone className="w-4 h-4" />
      case "wallet":
        return <Wallet className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const getMethodLabel = (method: Payment["paymentMethod"]) => {
    switch (method) {
      case "card":
        return "Credit/Debit Card"
      case "bank_transfer":
        return "Bank Transfer"
      case "mobile_money":
        return "Mobile Money"
      case "wallet":
        return "Digital Wallet"
      case "cash":
        return "Cash"
      default:
        return method
    }
  }

  const exportPayments = async (format: 'csv' | 'excel' | 'json') => {
    try {
      const response = await api.exportAnalytics({
        format,
        period: 'all',
        type: 'payments'
      })

      if (response.success) {
        // Handle file download
        const blob = new Blob([response.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `grochain-payments-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Payments exported successfully!")
      } else {
        throw new Error(response.error || "Failed to export payments")
      }
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export payments")
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payment data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Payment Management</h1>
            <p className="text-muted-foreground">Track and manage all payment transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportPayments('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => exportPayments('excel')}>
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

        {/* Payment Statistics */}
        {paymentStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                    <p className="text-2xl font-bold text-foreground">{paymentStats.totalPayments}</p>
                  </div>
                  <Receipt className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold text-foreground">₦{paymentStats.totalAmount?.toLocaleString()}</p>
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
                    <p className="text-2xl font-bold text-foreground">₦{paymentStats.pendingAmount?.toLocaleString()}</p>
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
                    <p className="text-2xl font-bold text-foreground">{paymentStats.monthlyGrowth || 0}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by order ID, reference, product, or farmer..."
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
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Payment List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-primary" />
                    Recent Payments ({filteredPayments.length})
                  </span>
                  <Button variant="outline" size="sm" onClick={fetchPaymentData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || methodFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "You haven't made any payments yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPayments.map((payment, index) => (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            {getMethodIcon(payment.paymentMethod)}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">Order #{payment.orderId}</h4>
                            <p className="text-sm text-muted-foreground">
                              {payment.items.map((item) => item.name).join(", ")}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <FileText className="w-3 h-3 mr-1" />
                                Ref: {payment.reference}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                {getMethodIcon(payment.paymentMethod)}
                                {getMethodLabel(payment.paymentMethod)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-medium text-foreground">₦{payment.amount.toLocaleString()}</p>
                            <Badge className={getStatusBadge(payment.status)}>
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment)
                                setShowPaymentModal(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {payment.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => processPayment(payment.id, payment.paymentMethod)}
                                disabled={processingPayment}
                              >
                                {processingPayment ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            {payment.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refundPayment(payment.id, 'Customer request')}
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

          <TabsContent value="methods" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Payment Methods</span>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Method
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No payment methods added</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add a payment method to make transactions faster
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <Card key={method.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              {getMethodIcon(method.type as any)}
                            </div>
                            <div>
                              <h4 className="font-medium">{method.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {method.type === 'card' && method.last4 && `•••• ${method.last4}`}
                                {method.type === 'bank_transfer' && method.accountNumber && `****${method.accountNumber.slice(-4)}`}
                                {method.type === 'mobile_money' && method.phoneNumber && method.phoneNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {method.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                            <Badge variant={method.isActive ? "default" : "outline"}>
                              {method.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed payment analytics and insights will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Details Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Order ID</Label>
                    <p className="font-medium">{selectedPayment.orderId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Reference</Label>
                    <p className="font-medium">{selectedPayment.reference}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                    <p className="font-medium text-lg">₦{selectedPayment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge className={getStatusBadge(selectedPayment.status)}>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
                    <p className="font-medium">{getMethodLabel(selectedPayment.paymentMethod)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p className="font-medium">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Items</Label>
                  <div className="space-y-2 mt-2">
                    {selectedPayment.items.map((item, index) => (
                      <div key={index} className="flex justify-between p-2 bg-muted/30 rounded">
                        <span>{item.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.quantity} × ₦{item.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Buyer Information</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedPayment.buyer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedPayment.buyer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedPayment.buyer.phone}</p>
                    </div>
                  </div>
                </div>

                {selectedPayment.metadata && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Additional Information</Label>
                    <div className="space-y-2 mt-2">
                      {selectedPayment.metadata.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Transaction ID:</span>
                          <span className="font-medium text-sm">{selectedPayment.metadata.transactionId}</span>
                        </div>
                      )}
                      {selectedPayment.metadata.failureReason && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Failure Reason:</span>
                          <span className="font-medium text-sm text-red-600">{selectedPayment.metadata.failureReason}</span>
                        </div>
                      )}
                      {selectedPayment.metadata.refundReason && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Refund Reason:</span>
                          <span className="font-medium text-sm text-purple-600">{selectedPayment.metadata.refundReason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                    Close
                  </Button>
                  {selectedPayment.status === 'pending' && (
                    <Button
                      onClick={() => processPayment(selectedPayment.id, selectedPayment.paymentMethod)}
                      disabled={processingPayment}
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Process Payment
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
    </DashboardLayout>
  )
}
