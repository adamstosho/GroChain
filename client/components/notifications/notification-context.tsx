"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface Notification {
  id: string
  type: "order" | "payment" | "weather" | "system" | "partner"
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
    })
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  // Setup push notifications
  useEffect(() => {
    const setupPushNotifications = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.log("[v0] Push notifications not supported")
        return
      }

      // Check if VAPID key is available
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey || vapidKey === "your_vapid_public_key_here" || vapidKey.length < 50) {
        console.log("[v0] VAPID public key not properly configured, skipping push notification setup")
        console.log("[v0] Current VAPID key:", vapidKey ? `${vapidKey.substring(0, 20)}...` : "undefined")
        return
      }

      try {
        // Request notification permission
        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission()
          if (permission !== "granted") {
            console.log("[v0] Notification permission denied")
            return
          }
        }

        // Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready

        // Check if already subscribed
        const existingSubscription = await registration.pushManager.getSubscription()
        if (existingSubscription) {
          console.log("[v0] Already subscribed to push notifications")
          return
        }

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        })

        // Send subscription to server
        await api.setPushToken(JSON.stringify(subscription))

        console.log("[v0] Successfully subscribed to push notifications")
      } catch (error) {
        console.log("[v0] Push notification setup failed:", error)
        // Don't throw error, just log it - app should continue working
      }
    }

    setupPushNotifications()
  }, [])

  // Listen for real-time notifications (Socket.IO would go here)
  useEffect(() => {
    // Mock real-time notifications for demo
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        // 5% chance every 10 seconds
        const mockNotifications = [
          {
            type: "order" as const,
            title: "Order Update",
            message: "Your order status has been updated",
          },
          {
            type: "payment" as const,
            title: "Payment Received",
            message: "A new payment has been processed",
          },
          {
            type: "weather" as const,
            title: "Weather Alert",
            message: "Weather conditions may affect your crops",
          },
        ]

        const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)]
        addNotification(randomNotification)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
