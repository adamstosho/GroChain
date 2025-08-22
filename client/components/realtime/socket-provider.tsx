"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/components/notifications/notification-context"

interface SocketContextValue {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false })

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
    const s = io(base, { withCredentials: true, transports: ["websocket"] })
    setSocket(s)
    s.on("connect", () => setConnected(true))
    s.on("disconnect", () => setConnected(false))
    return () => { s.disconnect() }
  }, [])

  useEffect(() => {
    if (!socket) return
    if (user?.id) socket.emit("join-user-room", user.id)
    const asAny = user as any
    if (asAny?.partnerId) socket.emit("join-partner-room", asAny.partnerId)
    if (asAny?.farmerId) socket.emit("join-farmer-room", asAny.farmerId)
  }, [socket, user?.id])

  useEffect(() => {
    if (!socket) return
    const handlePaymentCompleted = (payload: any) => {
      addNotification({
        type: "payment",
        title: "Payment Completed",
        message: `Order ${payload?.orderId || ''} paid successfully`,
      })
    }
    const handleOrderPaid = (payload: any) => {
      addNotification({
        type: "order",
        title: "Order Paid",
        message: `Order ${payload?.orderId || ''} marked as paid`,
      })
    }
    const handleHarvestCreated = (payload: any) => {
      addNotification({
        type: "partner",
        title: "New Harvest Logged",
        message: `${payload?.cropType || 'Harvest'} created (${payload?.quantity || ''})`,
      })
    }
    socket.on("payment_completed", handlePaymentCompleted)
    socket.on("order_paid", handleOrderPaid)
    socket.on("harvest_created", handleHarvestCreated)
    return () => {
      socket.off("payment_completed", handlePaymentCompleted)
      socket.off("order_paid", handleOrderPaid)
      socket.off("harvest_created", handleHarvestCreated)
    }
  }, [socket])

  const value = useMemo(() => ({ socket, connected }), [socket, connected])
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}


