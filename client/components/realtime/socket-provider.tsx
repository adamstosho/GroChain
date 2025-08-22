"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/components/notifications/notification-context"

interface SocketContextValue {
  socket: Socket | null
  connected: boolean
  reconnect: () => void
  sendMessage: (event: string, data: any) => void
  subscribeToEvent: (event: string, callback: (data: any) => void) => void
  unsubscribeFromEvent: (event: string, callback: (data: any) => void) => void
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
  const [eventSubscriptions, setEventSubscriptions] = useState<Map<string, Set<(data: any) => void>>>(new Map())

  const connectSocket = () => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
    const s = io(base, { 
      withCredentials: true, 
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
    
    s.on("connect", () => {
      setConnected(true)
      console.log("WebSocket connected")
    })
    
    s.on("disconnect", () => {
      setConnected(false)
      console.log("WebSocket disconnected")
    })
    
    s.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error)
      setConnected(false)
    })
    
    s.on("reconnect", (attemptNumber) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`)
      setConnected(true)
    })
    
    setSocket(s)
    return s
  }

  useEffect(() => {
    const s = connectSocket()
    return () => { 
      s.disconnect() 
      setSocket(null)
    }
  }, [])

  useEffect(() => {
    if (!socket || !user?.id) return
    
    // Join user-specific rooms
    socket.emit("join-user-room", user.id)
    
    const asAny = user as any
    if (asAny?.partnerId) socket.emit("join-partner-room", asAny.partnerId)
    if (asAny?.farmerId) socket.emit("join-farmer-room", asAny.farmerId)
    
    console.log(`User ${user.id} joined WebSocket rooms`)
  }, [socket, user?.id])

  useEffect(() => {
    if (!socket) return
    
    // Handle system events
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
    
    const handleReferralCompleted = (payload: any) => {
      addNotification({
        type: "referral",
        title: "Referral Completed",
        message: `Referral for ${payload?.farmerName || 'farmer'} completed successfully`,
      })
    }
    
    const handleCommissionEarned = (payload: any) => {
      addNotification({
        type: "commission",
        title: "Commission Earned",
        message: `₦${payload?.amount || 0} commission earned from referral`,
      })
    }
    
    const handleMarketUpdate = (payload: any) => {
      addNotification({
        type: "market",
        title: "Market Update",
        message: `${payload?.cropType || 'Crop'} price updated: ₦${payload?.price || 0}`,
      })
    }
    
    // Register event handlers
    socket.on("payment_completed", handlePaymentCompleted)
    socket.on("order_paid", handleOrderPaid)
    socket.on("harvest_created", handleHarvestCreated)
    socket.on("referral_completed", handleReferralCompleted)
    socket.on("commission_earned", handleCommissionEarned)
    socket.on("market_update", handleMarketUpdate)
    
    // Handle custom event subscriptions
    eventSubscriptions.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        socket.on(event, callback)
      })
    })
    
    return () => {
      socket.off("payment_completed", handlePaymentCompleted)
      socket.off("order_paid", handleOrderPaid)
      socket.off("harvest_created", handleHarvestCreated)
      socket.off("referral_completed", handleReferralCompleted)
      socket.off("commission_earned", handleCommissionEarned)
      socket.off("market_update", handleMarketUpdate)
      
      // Clean up custom event subscriptions
      eventSubscriptions.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          socket.off(event, callback)
        })
      })
    }
  }, [socket, eventSubscriptions, addNotification])

  const reconnect = () => {
    if (socket) {
      socket.disconnect()
    }
    connectSocket()
  }

  const sendMessage = (event: string, data: any) => {
    if (socket && connected) {
      socket.emit(event, data)
    } else {
      console.warn("Cannot send message: WebSocket not connected")
    }
  }

  const subscribeToEvent = (event: string, callback: (data: any) => void) => {
    setEventSubscriptions(prev => {
      const newSubscriptions = new Map(prev)
      const callbacks = newSubscriptions.get(event) || new Set()
      callbacks.add(callback)
      newSubscriptions.set(event, callbacks)
      return newSubscriptions
    })
    
    if (socket && connected) {
      socket.on(event, callback)
    }
  }

  const unsubscribeFromEvent = (event: string, callback: (data: any) => void) => {
    setEventSubscriptions(prev => {
      const newSubscriptions = new Map(prev)
      const callbacks = newSubscriptions.get(event) || new Set()
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        newSubscriptions.delete(event)
      } else {
        newSubscriptions.set(event, callbacks)
      }
      return newSubscriptions
    })
    
    if (socket) {
      socket.off(event, callback)
    }
  }

  const value = useMemo(() => ({ 
    socket, 
    connected, 
    reconnect, 
    sendMessage, 
    subscribeToEvent, 
    unsubscribeFromEvent 
  }), [socket, connected, reconnect, sendMessage, subscribeToEvent, unsubscribeFromEvent])
  
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}


