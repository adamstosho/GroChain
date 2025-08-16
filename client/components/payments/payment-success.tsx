"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Home } from "lucide-react"
import Link from "next/link"

export function PaymentSuccess() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="text-center py-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="mb-6">
            <CheckCircle className="w-16 h-16 text-success mx-auto" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground mb-8">
            Your order has been confirmed and the farmer has been notified. You'll receive updates on your order status.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/orders" className="flex-1">
              <Button className="w-full">
                <Package className="w-4 h-4 mr-2" />
                View Orders
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
