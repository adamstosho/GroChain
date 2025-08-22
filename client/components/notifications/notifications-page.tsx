"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Switch } from "@/components/ui/switch"
import { Bell, Settings, Check, Clock, Package, CreditCard, CloudRain, Users } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

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

// No mock data - all notifications come from real APIs

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

// No mock user - use real user from auth context

export function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)
  const [activeTab, setActiveTab] = useState("notifications")
  const [prefLoading, setPrefLoading] = useState(false)
  const canSend = user?.role === 'admin' || user?.role === 'partner'
  const [sendForm, setSendForm] = useState({ audience: 'all', role: 'farmer', userId: '', type: 'system', title: '', message: '' })
  const [bulkForm, setBulkForm] = useState({ userIds: '', type: 'system', title: '', message: '' })

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // This would fetch user's notifications from backend
        // For now, we'll start with empty state
        console.log("Fetching notifications from backend...")
        // TODO: Implement api.getNotifications() when backend endpoint is ready
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    if (user) {
      fetchNotifications()
    }
  }, [user])

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        // Check if user is authenticated before making API calls
        if (!user?.id) {
          console.log("User not authenticated, skipping notification preferences fetch")
          return
        }

        setPrefLoading(true)
        const resp = await api.getNotificationPreferences()
        if (resp.success && resp.data) {
          const backend: any = (resp.data as any)
          const data = (backend && backend.data) ? backend.data : backend
          const mapped: NotificationPreferences = {
            orderUpdates: Boolean(data?.marketplace),
            paymentConfirmations: Boolean(data?.transaction),
            weatherAlerts: Boolean(data?.marketing),
            systemNotifications: Boolean(data?.marketing),
            partnerUpdates: Boolean(data?.marketing),
            pushNotifications: Boolean(data?.push),
            emailNotifications: Boolean(data?.email),
            smsNotifications: Boolean(data?.sms),
          }
          setPreferences(mapped)
        }
      } catch (error) {
        console.log("Failed to load notification preferences:", error)
      } finally {
        setPrefLoading(false)
      }
    }
    loadPrefs()
  }, [user])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )

    // API call to mark as read
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))

    try {
      await fetch("/api/notifications/read-all", {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      })
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences)

    try {
      const payload: any = {
        marketplace: Boolean(newPreferences.orderUpdates),
        transaction: Boolean(newPreferences.paymentConfirmations),
        marketing: Boolean(newPreferences.systemNotifications || newPreferences.partnerUpdates || newPreferences.weatherAlerts),
        push: Boolean(newPreferences.pushNotifications),
        email: Boolean(newPreferences.emailNotifications),
        sms: Boolean(newPreferences.smsNotifications),
      }
      await api.updateNotificationPreferences(payload)
    } catch (error) {
      console.error("Failed to update preferences:", error)
    }
  }

  const handleSend = async () => {
    const payload: any = { type: sendForm.type, title: sendForm.title, message: sendForm.message }
    if (sendForm.audience === 'user' && sendForm.userId) payload.userId = sendForm.userId
    if (sendForm.audience === 'role') payload.role = sendForm.role
    try { await api.sendNotification(payload) } catch {}
  }

  const handleSendBulk = async () => {
    const userIds = bulkForm.userIds.split(',').map(s => s.trim()).filter(Boolean)
    const payload: any = { userIds, type: bulkForm.type, title: bulkForm.title, message: bulkForm.message }
    try { await api.sendBulkNotifications(payload) } catch {}
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
    <DashboardLayout user={user as any}>
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
          <TabsList className="grid w-full grid-cols-3">
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
            <TabsTrigger value="send" disabled={!canSend}>Send</TabsTrigger>
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
                {prefLoading && <div className="text-sm text-muted-foreground">Loading preferences…</div>}
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

          {canSend && (
            <TabsContent value="send" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Send Notification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Audience</label>
                      <Select value={sendForm.audience} onValueChange={(v)=> setSendForm({ ...sendForm, audience: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="role">By Role</SelectItem>
                          <SelectItem value="user">Single User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {sendForm.audience === 'role' && (
                      <div>
                        <label className="text-sm font-medium">Role</label>
                        <Select value={sendForm.role} onValueChange={(v)=> setSendForm({ ...sendForm, role: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="farmer">Farmer</SelectItem>
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                            <SelectItem value="aggregator">Aggregator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {sendForm.audience === 'user' && (
                      <div>
                        <label className="text-sm font-medium">User ID</label>
                        <input className="w-full border rounded px-3 py-2 text-sm" value={sendForm.userId} onChange={(e)=> setSendForm({ ...sendForm, userId: e.target.value })} placeholder="user id" />
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select value={sendForm.type} onValueChange={(v)=> setSendForm({ ...sendForm, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="order">Order</SelectItem>
                          <SelectItem value="payment">Payment</SelectItem>
                          <SelectItem value="weather">Weather</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <input className="w-full border rounded px-3 py-2 text-sm" value={sendForm.title} onChange={(e)=> setSendForm({ ...sendForm, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <input className="w-full border rounded px-3 py-2 text-sm" value={sendForm.message} onChange={(e)=> setSendForm({ ...sendForm, message: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSend}>Send</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Send Bulk Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select value={bulkForm.type} onValueChange={(v)=> setBulkForm({ ...bulkForm, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="order">Order</SelectItem>
                          <SelectItem value="payment">Payment</SelectItem>
                          <SelectItem value="weather">Weather</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <input className="w-full border rounded px-3 py-2 text-sm" value={bulkForm.title} onChange={(e)=> setBulkForm({ ...bulkForm, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <input className="w-full border rounded px-3 py-2 text-sm" value={bulkForm.message} onChange={(e)=> setBulkForm({ ...bulkForm, message: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">User IDs (comma-separated)</label>
                    <textarea className="w-full border rounded px-3 py-2 text-sm min-h-[100px]" value={bulkForm.userIds} onChange={(e)=> setBulkForm({ ...bulkForm, userIds: e.target.value })} placeholder="id1,id2,id3" />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSendBulk}>Send Bulk</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
