"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Bell, Settings, Check, Clock, Package, CreditCard, CloudRain, Users } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

interface Notification {
  id: string
  type: "order" | "payment" | "weather" | "system" | "partner"
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface NotificationPreferences {
  orderUpdates: boolean
  paymentConfirmations: boolean
  weatherAlerts: boolean
  systemNotifications: boolean
  partnerUpdates: boolean
  pushNotifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "Order Delivered",
    message: "Your order of Fresh Tomatoes from Adunni Farms has been delivered successfully.",
    read: false,
    createdAt: "2025-01-15T10:30:00Z",
    actionUrl: "/orders/ord_001",
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Confirmed",
    message: "Your payment of ₦25,000 has been processed successfully.",
    read: false,
    createdAt: "2025-01-15T09:15:00Z",
    actionUrl: "/payments/pay_001",
  },
  {
    id: "3",
    type: "weather",
    title: "Weather Alert",
    message: "Heavy rainfall expected in Lagos State. Protect your crops and harvests.",
    read: true,
    createdAt: "2025-01-14T18:45:00Z",
  },
  {
    id: "4",
    type: "system",
    title: "Profile Updated",
    message: "Your profile information has been updated successfully.",
    read: true,
    createdAt: "2025-01-14T14:20:00Z",
  },
  {
    id: "5",
    type: "partner",
    title: "New Farmer Onboarded",
    message: "Ibrahim Musa has been successfully onboarded to your network.",
    read: true,
    createdAt: "2025-01-13T16:30:00Z",
    actionUrl: "/partners",
  },
]

const defaultPreferences: NotificationPreferences = {
  orderUpdates: true,
  paymentConfirmations: true,
  weatherAlerts: true,
  systemNotifications: true,
  partnerUpdates: true,
  pushNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
}

// Mock user for layout
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  role: "farmer",
  avatar: "/placeholder.svg",
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)
  const [activeTab, setActiveTab] = useState("notifications")

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )

    // API call to mark as read
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      })
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))

    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
      })
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences)

    try {
      await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPreferences),
      })
    } catch (error) {
      console.error("Failed to update preferences:", error)
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return <Package className="w-5 h-5 text-primary" />
      case "payment":
        return <CreditCard className="w-5 h-5 text-success" />
      case "weather":
        return <CloudRain className="w-5 h-5 text-info" />
      case "partner":
        return <Users className="w-5 h-5 text-accent" />
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getNotificationBadge = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return <Badge variant="default">Order</Badge>
      case "payment":
        return (
          <Badge variant="outline" className="border-success text-success">
            Payment
          </Badge>
        )
      case "weather":
        return (
          <Badge variant="outline" className="border-info text-info">
            Weather
          </Badge>
        )
      case "partner":
        return (
          <Badge variant="outline" className="border-accent text-accent">
            Partner
          </Badge>
        )
      default:
        return <Badge variant="secondary">System</Badge>
    }
  }

  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground flex items-center">
              <Bell className="w-6 h-6 mr-2 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Stay updated with your GroChain activities</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground">You're all caught up! Check back later for updates.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        !notification.read ? "border-primary/50 bg-primary/5" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-foreground">{notification.title}</h4>
                                {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                              <div className="flex items-center space-x-2">
                                {getNotificationBadge(notification.type)}
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                                  {new Date(notification.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {notification.actionUrl && (
                            <Button variant="ghost" size="sm" className="ml-2">
                              View
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Order Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified about order status changes, deliveries, and confirmations
                    </p>
                  </div>
                  <Switch
                    checked={preferences.orderUpdates}
                    onCheckedChange={(checked) => updatePreferences({ ...preferences, orderUpdates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Payment Confirmations</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for successful payments and transaction updates
                    </p>
                  </div>
                  <Switch
                    checked={preferences.paymentConfirmations}
                    onCheckedChange={(checked) => updatePreferences({ ...preferences, paymentConfirmations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Weather Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Get weather warnings and agricultural advisories for your region
                    </p>
                  </div>
                  <Switch
                    checked={preferences.weatherAlerts}
                    onCheckedChange={(checked) => updatePreferences({ ...preferences, weatherAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">System Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Important system updates, maintenance notices, and security alerts
                    </p>
                  </div>
                  <Switch
                    checked={preferences.systemNotifications}
                    onCheckedChange={(checked) => updatePreferences({ ...preferences, systemNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Partner Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Notifications about farmer onboarding, commissions, and network activities
                    </p>
                  </div>
                  <Switch
                    checked={preferences.partnerUpdates}
                    onCheckedChange={(checked) => updatePreferences({ ...preferences, partnerUpdates: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive instant notifications on your device even when the app is closed
                    </p>
                  </div>
                  <Switch
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => updatePreferences({ ...preferences, pushNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Get important updates and summaries delivered to your email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => updatePreferences({ ...preferences, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive critical alerts and confirmations via text message
                    </p>
                  </div>
                  <Switch
                    checked={preferences.smsNotifications}
                    onCheckedChange={(checked) => updatePreferences({ ...preferences, smsNotifications: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
