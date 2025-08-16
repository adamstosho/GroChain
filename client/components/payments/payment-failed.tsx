"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export function PaymentFailed() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="text-center py-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="mb-6">
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
          <p className="text-muted-foreground mb-8">
            There was an issue processing your payment. This could be due to insufficient funds, network issues, or
            other technical problems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/marketplace" className="flex-1">
              <Button className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
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
