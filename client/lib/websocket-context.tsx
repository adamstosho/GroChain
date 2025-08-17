"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { toast } from "sonner"
import { useAuth } from "./auth-context"

interface WebSocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  sendMessage: (message: any) => void
}

// Mock WebSocket interface for development
interface MockWebSocket {
  readyState: number
  send: (data: any) => void
  close: () => void
  onmessage: ((event: MessageEvent) => void) | null
  onopen: ((event: Event) => void) | null
  onclose: ((event: CloseEvent) => void) | null
  onerror: ((event: Event) => void) | null
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

        // In development, we'll use a mock WebSocket connection for testing
    // You can override this by setting NEXT_PUBLIC_USE_REAL_WEBSOCKET=true
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_WEBSOCKET !== 'true') {
      console.log('🔧 Development mode: Using mock WebSocket connection for testing')
      
      // Create a mock WebSocket-like object for development
      const mockSocket: MockWebSocket = {
        readyState: 1, // OPEN
        send: (data: any) => {
          console.log('🔧 Mock WebSocket: Message sent:', data)
          // Simulate receiving a response
          setTimeout(() => {
            const mockResponse = {
              type: 'mock_response',
              data: { message: 'Mock response received', timestamp: Date.now() }
            }
            // Trigger a mock message event
            if (mockSocket.onmessage) {
              mockSocket.onmessage({ data: JSON.stringify(mockResponse) } as MessageEvent)
            }
          }, 100)
        },
        close: () => {
          console.log('🔧 Mock WebSocket: Connection closed')
          setIsConnected(false)
        },
        onmessage: null,
        onopen: null,
        onclose: null,
        onerror: null
      }

      // Simulate connection
      setTimeout(() => {
        setIsConnected(true)
        if (mockSocket.onopen) {
          mockSocket.onopen({} as Event)
        }
        console.log('🔧 Mock WebSocket: Connected successfully')
      }, 500)

      setSocket(mockSocket as any)
      return
    }

    // Production: Use real WebSocket connection
    console.log('🚀 Production mode: Establishing real WebSocket connection')
    
    // Note: For Socket.IO integration, you would use:
    // import { io } from 'socket.io-client'
    // const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000')

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
