"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, CreditCard, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface PaymentStatusProps {
  paymentId: string
}

interface PaymentData {
  id: string
  orderId: string
  amount: number
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  createdAt: string
  updatedAt: string
  items: Array<{
    name: string
    quantity: string
    price: number
    farmer: string
  }>
}

export function PaymentStatus({ paymentId }: PaymentStatusProps) {
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}/status`)
        const data = await response.json()

        if (data.success) {
          setPayment(data.payment)
        }
      } catch (error) {
        console.error("Failed to fetch payment status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentStatus()

    // Poll for status updates if payment is pending/processing
    const interval = setInterval(() => {
      if (payment?.status === "pending" || payment?.status === "processing") {
        fetchPaymentStatus()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [paymentId, payment?.status])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The payment you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (payment.status) {
      case "completed":
        return <CheckCircle className="w-12 h-12 text-success" />
      case "failed":
      case "cancelled":
        return <XCircle className="w-12 h-12 text-destructive" />
      default:
        return <Clock className="w-12 h-12 text-warning" />
    }
  }

  const getStatusMessage = () => {
    switch (payment.status) {
      case "completed":
        return {
          title: "Payment Successful!",
          description: "Your order has been confirmed and the farmer has been notified.",
        }
      case "failed":
        return {
          title: "Payment Failed",
          description: "There was an issue processing your payment. Please try again.",
        }
      case "cancelled":
        return {
          title: "Payment Cancelled",
          description: "The payment was cancelled. You can try again if needed.",
        }
      case "processing":
        return {
          title: "Processing Payment",
          description: "Your payment is being processed. Please wait...",
        }
      default:
        return {
          title: "Payment Pending",
          description: "Waiting for payment confirmation...",
        }
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Payment Status */}
      <Card>
        <CardContent className="text-center py-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="mb-6">
            {getStatusIcon()}
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">{statusMessage.title}</h2>
          <p className="text-muted-foreground mb-6">{statusMessage.description}</p>

          <Badge
            variant={
              payment.status === "completed"
                ? "default"
                : payment.status === "failed" || payment.status === "cancelled"
                  ? "destructive"
                  : "secondary"
            }
            className="text-sm px-3 py-1"
          >
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </Badge>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-primary" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Payment ID</p>
              <p className="font-medium">{payment.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Order ID</p>
              <p className="font-medium">{payment.orderId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">₦{payment.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{new Date(payment.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium">Order Items</h4>
            {payment.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    from {item.farmer} • {item.quantity}
                  </p>
                </div>
                <p className="font-medium">₦{item.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {payment.status === "completed" && (
          <Link href="/orders" className="flex-1">
            <Button className="w-full">View Orders</Button>
          </Link>
        )}

        {(payment.status === "failed" || payment.status === "cancelled") && (
          <Link href="/marketplace" className="flex-1">
            <Button className="w-full">Try Again</Button>
          </Link>
        )}

        <Link href="/payments" className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            Payment History
          </Button>
        </Link>
      </div>
    </div>
  )
}
