"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, Package } from "lucide-react"

interface OrderItem {
  listing: string
  quantity: number
}

interface OrderSummary {
  id: string
  status: string
  createdAt: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && user) {
      fetchOrders(user.id)
    }
  }, [loading, user])

  const fetchOrders = async (buyerId: string) => {
    setIsLoading(true)
    try {
      const resp = await api.getBuyerOrders(buyerId)
      if (resp.success && resp.data) {
        const payload: any = resp.data
        const list = payload.data || payload
        setOrders((list || []).map((o: any) => ({
          id: o._id || o.id,
          status: o.status,
          createdAt: o.createdAt,
          items: o.items || [],
        })))
      } else {
        setOrders([])
      }
    } catch (e) {
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Package className="w-5 h-5 mr-2" /> My Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">Order {o.id.slice(-6).toUpperCase()}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()} • {o.items.length} items</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-muted">{o.status}</span>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/payments/${o.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}


