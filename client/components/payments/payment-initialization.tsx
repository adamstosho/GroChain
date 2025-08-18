"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Shield, Clock, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface PaymentItem {
  id: string
  name: string
  quantity: string
  price: number
  farmer: string
}

interface PaymentInitializationProps {
  items: PaymentItem[]
  totalAmount: number
  orderId: string
}

export function PaymentInitialization({ items, totalAmount, orderId }: PaymentInitializationProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const userEmail = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user_data') || '{}')?.email || '') : ''

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // Initialize payment via backend API client
      const resp = await api.initializePayment({ orderId, email: userEmail || "user@example.com" })

      if (resp.success && resp.data) {
        const data: any = resp.data
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl
        } else if (data.paymentId) {
          router.push(`/payments/${data.paymentId}`)
        } else {
          router.push(`/payments/${orderId}`)
        }
      } else {
        throw new Error(resp.error || "Payment initialization failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      // Handle error - show toast or error message
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-primary" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between py-3"
            >
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{item.name}</h4>
                <p className="text-sm text-muted-foreground">
                  from {item.farmer} • {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">₦{item.price.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}

          <Separator />

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total Amount</span>
            <span className="text-primary">₦{totalAmount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Security */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-primary" />
              Secure Payment
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-primary" />
              Instant Processing
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-primary" />
              Verified Farmers
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Card>
        <CardContent className="pt-6">
          <Button onClick={handlePayment} disabled={isProcessing} size="lg" className="w-full">
            {isProcessing ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ₦{totalAmount.toLocaleString()}
              </div>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-3">
            By proceeding, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
