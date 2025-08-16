"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { toast } from "sonner"
import { useAuth } from "./auth-context"

interface WebSocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  sendMessage: (message: any) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider')
  }
  return context
}

interface WebSocketProviderProps {
  children: ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000'
    const ws = new WebSocket(`${wsUrl}/ws`)

    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      
      // Join user-specific room
      ws.send(JSON.stringify({
        type: 'join-room',
        data: {
          userId: user.id,
          role: user.role
        }
      }))
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        handleWebSocketMessage(message)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [isAuthenticated, user])

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'notification':
        toast.info(message.data.title, {
          description: message.data.message
        })
        break
      case 'payment_success':
        toast.success('Payment successful!', {
          description: `Your payment of ₦${message.data.amount} has been processed.`
        })
        break
      case 'payment_failed':
        toast.error('Payment failed!', {
          description: message.data.reason || 'Please try again.'
        })
        break
      case 'harvest_verified':
        toast.success('Harvest verified!', {
          description: `Your ${message.data.cropType} harvest has been verified.`
        })
        break
      case 'order_update':
        toast.info('Order update', {
          description: `Your order status: ${message.data.status}`
        })
        break
      case 'commission_earned':
        toast.success('Commission earned!', {
          description: `You earned ₦${message.data.amount} commission.`
        })
        break
      default:
        console.log('Unknown message type:', message.type)
    }
  }

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message))
    }
  }

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  )
}
