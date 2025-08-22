"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Search, Filter, Eye, Download } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
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
  }>
}

const mockPayments: Payment[] = [
  {
    id: "pay_001",
    orderId: "ord_001",
    amount: 25000,
    status: "completed",
    createdAt: "2025-01-15T10:30:00Z",
    items: [
      { name: "Fresh Tomatoes", farmer: "Adunni Farms" },
      { name: "Organic Yam", farmer: "Ibrahim Agro" },
    ],
  },
  {
    id: "pay_002",
    orderId: "ord_002",
    amount: 12500,
    status: "processing",
    createdAt: "2025-01-14T14:20:00Z",
    items: [{ name: "Cassava Flour", farmer: "Grace Farms" }],
  },
  {
    id: "pay_003",
    orderId: "ord_003",
    amount: 8000,
    status: "failed",
    createdAt: "2025-01-13T09:15:00Z",
    items: [{ name: "Sweet Potatoes", farmer: "John's Farm" }],
  },
]

import { useAuth } from "@/lib/auth-context"

export function PaymentHistory() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(mockPayments)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    let filtered = payments

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    setFilteredPayments(filtered)
  }, [payments, searchTerm, statusFilter])

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "processing":
        return <Badge variant="secondary">Processing</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Payment History</h1>
            <p className="text-muted-foreground">Track all your payment transactions</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order ID, product, or farmer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
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
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payment List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-primary" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
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
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Order #{payment.orderId}</h4>
                        <p className="text-sm text-muted-foreground">
                          {payment.items.map((item) => item.name).join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()} at{" "}
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-medium text-foreground">₦{payment.amount.toLocaleString()}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                      <Link href={`/payments/${payment.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
