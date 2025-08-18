"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, MapPinned, RefreshCw, XCircle, CheckCircle, PackageOpen } from "lucide-react"
import { api } from "@/lib/api"
import { useSocket } from "@/components/realtime/socket-provider"

interface OrderDetails {
  id: string
  status: string
  items: Array<{ listing: string; quantity: number }>
  createdAt: string
}

interface TrackingEvent {
  timestamp: string
  status: string
  location?: string
  note?: string
}

export default function PaymentDetailPage() {
  const params = useParams()
  const orderId = params?.id as string
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [tracking, setTracking] = useState<TrackingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { socket } = useSocket()

  const fetchData = async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const [orderResp, trackingResp] = await Promise.all([
        api.getOrderDetails(orderId),
        api.getOrderTracking(orderId),
      ])
      if (orderResp.success && orderResp.data) {
        const payload: any = orderResp.data
        const o = payload.data || payload
        setOrder({
          id: o._id || o.id,
          status: o.status,
          items: o.items || [],
          createdAt: o.createdAt,
        })
      }
      if (trackingResp.success && trackingResp.data) {
        const payload: any = trackingResp.data
        setTracking(payload.data || payload || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!orderId) return
    try {
      const resp = await api.cancelOrder(orderId)
      if (resp.success) {
        await fetchData()
      }
    } catch {}
  }

  useEffect(() => { fetchData() }, [orderId])
  useEffect(() => {
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [orderId])

  useEffect(() => {
    if (!socket || !orderId) return
    const onPayment = (payload: any) => {
      if (payload?.orderId && String(payload.orderId) === String(orderId)) fetchData()
    }
    const onOrderEvent = (payload: any) => {
      if (payload?.orderId && String(payload.orderId) === String(orderId)) fetchData()
    }
    socket.on('payment_completed', onPayment)
    socket.on('order_paid', onOrderEvent)
    socket.on('order_delivered', onOrderEvent)
    return () => {
      socket.off('payment_completed', onPayment)
      socket.off('order_paid', onOrderEvent)
      socket.off('order_delivered', onOrderEvent)
    }
  }, [socket, orderId])

  if (loading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order {order.id.slice(-6).toUpperCase()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="text-sm px-2 py-1 rounded bg-muted">{order.status}</div>
          </div>
          <div>
            <div className="font-medium mb-1">Items</div>
            <ul className="text-sm list-disc ml-5">
              {order.items.map((i, idx) => (
                <li key={idx}>Listing: {i.listing} • Qty: {i.quantity}</li>
              ))}
            </ul>
          </div>
          <div className="text-xs text-muted-foreground">
            Created: {new Date(order.createdAt).toLocaleString()}
          </div>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button variant="destructive" size="sm" className="ml-2" onClick={handleCancel}>
              <XCircle className="w-4 h-4 mr-2" /> Cancel Order
            </Button>
            <Button size="sm" className="ml-2" disabled={updating} onClick={async ()=>{ setUpdating(true); await api.updateOrderStatus(order.id, 'paid'); await fetchData(); setUpdating(false) }}>
              <CheckCircle className="w-4 h-4 mr-2" /> Mark Paid
            </Button>
            <Button size="sm" className="ml-2" variant="outline" disabled={updating} onClick={async ()=>{ setUpdating(true); await api.updateOrderStatus(order.id, 'delivered'); await fetchData(); setUpdating(false) }}>
              <PackageOpen className="w-4 h-4 mr-2" /> Mark Delivered
            </Button>
            <Button asChild size="sm" className="ml-2">
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><MapPinned className="w-4 h-4 mr-2" /> Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tracking.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tracking events yet.</p>
          ) : (
            tracking.map((t, idx) => (
              <div key={idx} className="border rounded p-3">
                <div className="text-sm font-medium">{t.status}</div>
                <div className="text-xs text-muted-foreground">{new Date(t.timestamp).toLocaleString()}</div>
                {t.location && <div className="text-xs">Location: {t.location}</div>}
                {t.note && <div className="text-xs">Note: {t.note}</div>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

 
