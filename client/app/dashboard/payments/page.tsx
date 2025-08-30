"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Eye, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard as CreditCardIcon,
  Building2,
  Phone
} from "lucide-react"
import { useBuyerStore } from "@/hooks/use-buyer-store"

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("methods")
  const { profile } = useBuyerStore()

  // Mock data for payment methods
  const paymentMethods = [
    {
      _id: "1",
      name: "Visa ending in 4242",
      type: "card",
      isDefault: true,
      security: { isVerified: true, lastUsed: "2024-01-15" },
      details: { last4: "4242", expiry: "12/26", brand: "Visa" }
    },
    {
      _id: "2",
      name: "GT Bank Account",
      type: "bank_account",
      isDefault: false,
      security: { isVerified: true, lastUsed: "2024-01-10" },
      details: { bankName: "GT Bank", accountNumber: "0123456789", accountType: "Savings" }
    },
    {
      _id: "3",
      name: "MTN Mobile Money",
      type: "mobile_money",
      isDefault: false,
      security: { isVerified: false, lastUsed: "2024-01-05" },
      details: { phoneNumber: "+2348012345678", provider: "MTN" }
    }
  ]

  // Mock data for transactions
  const transactions = [
    {
      _id: "1",
      reference: "TXN_001",
      amount: 25000,
      type: "purchase",
      status: "successful",
      method: "card",
      description: "Maize purchase from Farmer John",
      date: "2024-01-15T10:30:00Z",
      orderId: "ORD_001"
    },
    {
      _id: "2",
      reference: "TXN_002",
      amount: 15000,
      type: "purchase",
      status: "pending",
      method: "bank_transfer",
      description: "Cassava purchase from Green Farms",
      date: "2024-01-14T14:20:00Z",
      orderId: "ORD_002"
    },
    {
      _id: "3",
      reference: "TXN_003",
      amount: 8000,
      type: "refund",
      status: "successful",
      method: "card",
      description: "Refund for damaged vegetables",
      date: "2024-01-13T09:15:00Z",
      orderId: "ORD_003"
    },
    {
      _id: "4",
      reference: "TXN_004",
      amount: 30000,
      type: "purchase",
      status: "failed",
      method: "mobile_money",
      description: "Rice purchase from Rice Valley",
      date: "2024-01-12T16:45:00Z",
      orderId: "ORD_004"
    }
  ]

  // Mock data for billing
  const billingHistory = [
    {
      _id: "1",
      invoiceNumber: "INV_001",
      orderNumber: "ORD_001",
      amount: 25000,
      status: "paid",
      dueDate: "2024-01-20",
      issuedDate: "2024-01-15",
      items: [
        { name: "Maize", quantity: "100kg", price: 250, total: 25000 }
      ]
    },
    {
      _id: "2",
      invoiceNumber: "INV_002",
      orderNumber: "ORD_002",
      amount: 15000,
      status: "pending",
      dueDate: "2024-01-25",
      issuedDate: "2024-01-14",
      items: [
        { name: "Cassava", quantity: "50kg", price: 300, total: 15000 }
      ]
    },
    {
      _id: "3",
      invoiceNumber: "INV_003",
      orderNumber: "ORD_003",
      amount: 8000,
      status: "refunded",
      dueDate: "2024-01-18",
      issuedDate: "2024-01-10",
      items: [
        { name: "Vegetables", quantity: "20kg", price: 400, total: 8000 }
      ]
    }
  ]

  // Mock data for refunds
  const refunds = [
    {
      _id: "1",
      refundNumber: "REF_001",
      orderNumber: "ORD_003",
      amount: 8000,
      reason: "Product quality issues",
      status: "approved",
      requestedDate: "2024-01-12",
      processedDate: "2024-01-13",
      method: "card",
      description: "Damaged vegetables received"
    },
    {
      _id: "2",
      refundNumber: "REF_002",
      orderNumber: "ORD_004",
      amount: 30000,
      reason: "Payment failure",
      status: "pending",
      requestedDate: "2024-01-12",
      processedDate: null,
      method: "mobile_money",
      description: "Payment failed during processing"
    },
    {
      _id: "3",
      refundNumber: "REF_003",
      orderNumber: "ORD_005",
      amount: 12000,
      reason: "Order cancellation",
      status: "approved",
      requestedDate: "2024-01-10",
      processedDate: "2024-01-11",
      method: "bank_transfer",
      description: "Order cancelled before shipping"
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "card":
        return <CreditCardIcon className="h-8 w-8 text-blue-600" />
      case "bank_account":
        return <Building2 className="h-8 w-8 text-green-600" />
      case "mobile_money":
        return <Phone className="h-8 w-8 text-orange-600" />
      default:
        return <Banknote className="h-8 w-8 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "successful":
      case "paid":
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "refunded":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "successful":
      case "paid":
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "refunded":
        return <ArrowDownRight className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date))
  }

  const calculateStats = () => {
    const totalTransactions = transactions.length
    const successfulTransactions = transactions.filter(t => t.status === "successful").length
    const pendingTransactions = transactions.filter(t => t.status === "pending").length
    const failedTransactions = transactions.filter(t => t.status === "failed").length
    const totalAmount = transactions.filter(t => t.status === "successful").reduce((sum, t) => sum + t.amount, 0)

    return {
      total: totalTransactions,
      successful: successfulTransactions,
      pending: pendingTransactions,
      failed: failedTransactions,
      totalAmount
    }
  }

  const stats = calculateStats()

  return (
    <DashboardLayout pageTitle="Payment Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
            <p className="text-muted-foreground">
              Manage your payment methods, view transactions, and handle billing
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="refunds">Refunds</TabsTrigger>
          </TabsList>

          {/* Payment Methods Tab */}
          <TabsContent value="methods" className="mt-6">
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card key={method._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getTypeIcon(method.type)}
                        <div>
                          <h4 className="font-semibold text-foreground">{method.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {method.type === 'card' ? `**** **** **** ${method.details.last4}` : 
                             method.type === 'bank_account' ? `Bank: ${method.details.bankName} - ${method.details.accountNumber}` : 
                             method.type === 'mobile_money' ? `Phone: ${method.details.phoneNumber}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {method.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                        {method.security.isVerified && <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Verified</Badge>}
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button className="w-full"><Plus className="h-4 w-4 mr-2" />Add New Method</Button>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Successful</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Failed</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input placeholder="Search transactions..." className="max-w-sm" />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{transaction.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {transaction.reference} • {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatPrice(transaction.amount)}</p>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="mt-6">
            {/* Billing Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Invoices</span>
                  </div>
                  <p className="text-2xl font-bold">{billingHistory.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Paid</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {billingHistory.filter(b => b.status === 'paid').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {billingHistory.filter(b => b.status === 'pending').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Billing History */}
            <div className="space-y-4">
              {billingHistory.map((invoice) => (
                <Card key={invoice._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-foreground">Invoice #{invoice.invoiceNumber}</h4>
                        <p className="text-sm text-muted-foreground">
                          Order: {invoice.orderNumber} • Due: {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{formatPrice(invoice.amount)}</p>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Invoice Items */}
                    <div className="border-t pt-4">
                      {invoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <span className="text-sm">{item.name} ({item.quantity})</span>
                          <span className="text-sm font-medium">{formatPrice(item.total)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-4 border-t">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Invoice
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      {invoice.status === 'pending' && (
                        <Button size="sm">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds" className="mt-6">
            {/* Refund Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Refunds</span>
                  </div>
                  <p className="text-2xl font-bold">{refunds.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Approved</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {refunds.filter(r => r.status === 'approved').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {refunds.filter(r => r.status === 'pending').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Refunds List */}
            <div className="space-y-4">
              {refunds.map((refund) => (
                <Card key={refund._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-foreground">Refund #{refund.refundNumber}</h4>
                        <p className="text-sm text-muted-foreground">
                          Order: {refund.orderNumber} • Requested: {formatDate(refund.requestedDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{formatPrice(refund.amount)}</p>
                        <Badge className={getStatusColor(refund.status)}>
                          {refund.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Reason:</p>
                      <p className="text-sm font-medium">{refund.reason}</p>
                      <p className="text-sm text-muted-foreground mt-1">{refund.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-4 border-t">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Download Receipt
                      </Button>
                      {refund.status === 'pending' && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Update Request
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
