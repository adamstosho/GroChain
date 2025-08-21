"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { 
  Bell, 
  BellOff, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Filter,
  Search,
  Loader2,
  Clock,
  User,
  Package,
  CreditCard,
  Truck,
  Shield,
  Globe,
  Volume2,
  VolumeX
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'system'
  category: 'marketplace' | 'payments' | 'shipments' | 'verification' | 'fintech' | 'system' | 'security'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  read: boolean
  createdAt: string
  scheduledFor?: string
  expiresAt?: string
  userId: string
  metadata?: {
    actionUrl?: string
    actionText?: string
    imageUrl?: string
    relatedId?: string
  }
}

interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  inApp: boolean
  categories: {
    marketplace: boolean
    payments: boolean
    shipments: boolean
    verification: boolean
    fintech: boolean
    system: boolean
    security: boolean
  }
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

interface NotificationStats {
  total: number
  unread: number
  read: number
  byType: Record<string, number>
  byCategory: Record<string, number>
  byPriority: Record<string, number>
}

export function NotificationDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notificationStats, setNotificationStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    read: 0,
    byType: {},
    byCategory: {},
    byPriority: {}
  })
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    sms: true,
    push: true,
    inApp: true,
    categories: {
      marketplace: true,
      payments: true,
      shipments: true,
      verification: true,
      fintech: true,
      system: true,
      security: true
    },
    frequency: 'immediate',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")

  useEffect(() => {
    if (user) {
      fetchNotificationData()
      fetchNotificationPreferences()
    }
  }, [user])

  useEffect(() => {
    filterNotifications()
  }, [notifications, searchTerm, selectedCategory, selectedPriority, activeTab])

  const fetchNotificationData = async () => {
    try {
      setLoading(true)
      setError("")

      // Since backend has limited notification endpoints, we'll use mock data for now
      // In production: const response = await api.getNotifications()
      
      const mockNotifications = generateMockNotifications()
      setNotifications(mockNotifications)
      calculateNotificationStats(mockNotifications)
    } catch (error) {
      console.error("Notification fetch error:", error)
      setError("Failed to load notifications")
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const fetchNotificationPreferences = async () => {
    try {
      // In production: const response = await api.getNotificationPreferences()
      // For now, use default preferences
    } catch (error) {
      console.error("Preferences fetch error:", error)
    }
  }

  const generateMockNotifications = (): Notification[] => {
    const types: Notification['type'][] = ['info', 'success', 'warning', 'error', 'system']
    const categories: Notification['category'][] = ['marketplace', 'payments', 'shipments', 'verification', 'fintech', 'system', 'security']
    const priorities: Notification['priority'][] = ['low', 'medium', 'high', 'urgent']
    
    const notificationTemplates = [
      { title: "Payment Successful", message: "Your payment of ₦25,000 has been processed successfully", category: 'payments' as const, type: 'success' as const },
      { title: "Shipment Update", message: "Your shipment GC123456001 is out for delivery", category: 'shipments' as const, type: 'info' as const },
      { title: "Verification Complete", message: "Your BVN verification has been approved", category: 'verification' as const, type: 'success' as const },
      { title: "New Order", message: "You have received a new order for Fresh Tomatoes", category: 'marketplace' as const, type: 'info' as const },
      { title: "Credit Score Update", message: "Your credit score has increased by 15 points", category: 'fintech' as const, type: 'success' as const },
      { title: "System Maintenance", message: "Scheduled maintenance on Sunday 2:00 AM - 4:00 AM", category: 'system' as const, type: 'warning' as const },
      { title: "Security Alert", message: "New login detected from Lagos, Nigeria", category: 'security' as const, type: 'warning' as const },
      { title: "Payment Failed", message: "Payment attempt failed. Please check your card details", category: 'payments' as const, type: 'error' as const },
      { title: "Harvest Ready", message: "Your cassava harvest is ready for collection", category: 'marketplace' as const, type: 'info' as const },
      { title: "Loan Approved", message: "Your loan application has been approved for ₦100,000", category: 'fintech' as const, type: 'success' as const }
    ]
    
    return Array.from({ length: 25 }, (_, index) => {
      const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)]
      const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      const read = Math.random() > 0.3
      
      return {
        id: `notif_${String(index + 1).padStart(3, '0')}`,
        title: template.title,
        message: template.message,
        type: template.type,
        category: template.category,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        read,
        createdAt: createdDate.toISOString(),
        scheduledFor: Math.random() > 0.8 ? new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
        expiresAt: Math.random() > 0.7 ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        userId: `user_${index + 1}`,
        metadata: {
          actionUrl: Math.random() > 0.5 ? `/notifications/${index + 1}` : undefined,
          actionText: Math.random() > 0.5 ? 'View Details' : undefined,
          relatedId: Math.random() > 0.6 ? `item_${Math.floor(Math.random() * 1000)}` : undefined
        }
      }
    })
  }

  const calculateNotificationStats = (notificationList: Notification[]) => {
    const stats: NotificationStats = {
      total: notificationList.length,
      unread: notificationList.filter(n => !n.read).length,
      read: notificationList.filter(n => n.read).length,
      byType: {},
      byCategory: {},
      byPriority: {}
    }

    // Calculate by type
    notificationList.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1
      stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1
    })

    setNotificationStats(stats)
  }

  const filterNotifications = () => {
    let filtered = notifications

    // Filter by tab
    if (activeTab === "unread") {
      filtered = filtered.filter(n => !n.read)
    } else if (activeTab === "read") {
      filtered = filtered.filter(n => n.read)
    } else if (activeTab !== "all") {
      filtered = filtered.filter(n => n.category === activeTab)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(n => n.category === selectedCategory)
    }

    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter(n => n.priority === selectedPriority)
    }

    setFilteredNotifications(filtered)
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // In production: await api.markNotificationAsRead(notificationId)
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      
      toast.success("Notification marked as read")
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast.error("Failed to mark notification as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      // In production: await api.markAllNotificationsAsRead()
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
      
      toast.success("All notifications marked as read")
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast.error("Failed to mark all notifications as read")
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      // In production: await api.deleteNotification(notificationId)
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      toast.success("Notification deleted")
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Failed to delete notification")
    }
  }

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences }
      setPreferences(updatedPreferences)
      
      // In production: await api.updateNotificationPreferences(updatedPreferences)
      
      toast.success("Notification preferences updated")
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast.error("Failed to update preferences")
    }
  }

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>
      case "high":
        return <Badge variant="default" className="bg-red-500">High</Badge>
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-500">Medium</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case "marketplace":
        return <Package className="h-4 w-4" />
      case "payments":
        return <CreditCard className="h-4 w-4" />
      case "shipments":
        return <Truck className="h-4 w-4" />
      case "verification":
        return <Shield className="h-4 w-4" />
      case "fintech":
        return <CreditCard className="h-4 w-4" />
      case "system":
        return <Settings className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  if (!user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Bell className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading notification dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold">Notifications & Alerts</h1>
            <p className="text-muted-foreground">
              Manage your notifications, preferences, and alert settings
            </p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={markAllAsRead} disabled={notificationStats.unread === 0} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button onClick={fetchNotificationData} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Notification Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationStats.total}</div>
              <p className="text-xs text-muted-foreground">
                All time notifications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <BellOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{notificationStats.unread}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {(notificationStats.byPriority.high || 0) + (notificationStats.byPriority.urgent || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                High & urgent priority
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter(n => {
                  const today = new Date()
                  const created = new Date(n.createdAt)
                  return today.toDateString() === created.toDateString()
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Notifications today
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="shipments">Shipments</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="fintech">Fintech</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <NotificationList 
                notifications={filteredNotifications}
                loading={loading}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
              />
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              <NotificationList 
                notifications={filteredNotifications}
                loading={loading}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
              />
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-4">
              <NotificationList 
                notifications={filteredNotifications}
                loading={loading}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
              />
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <NotificationList 
                notifications={filteredNotifications}
                loading={loading}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
              />
            </TabsContent>

            <TabsContent value="shipments" className="space-y-4">
              <NotificationList 
                notifications={filteredNotifications}
                loading={loading}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
              />
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              <NotificationList 
                notifications={filteredNotifications}
                loading={loading}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
              />
            </TabsContent>

            <TabsContent value="fintech" className="space-y-4">
              <NotificationList 
                notifications={filteredNotifications}
                loading={loading}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
              />
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <NotificationList 
                notifications={filteredNotifications}
                loading={loading}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
              />
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <NotificationList 
                notifications={filteredNotifications}
                loading={loading}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
              />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Delivery Methods</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={preferences.email}
                        onCheckedChange={(checked) => updatePreferences({ email: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={preferences.sms}
                        onCheckedChange={(checked) => updatePreferences({ sms: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={preferences.push}
                        onCheckedChange={(checked) => updatePreferences({ push: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <Label htmlFor="inapp-notifications">In-App Notifications</Label>
                      </div>
                      <Switch
                        id="inapp-notifications"
                        checked={preferences.inApp}
                        onCheckedChange={(checked) => updatePreferences({ inApp: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Notification Categories</h3>
                  <div className="space-y-3">
                    {Object.entries(preferences.categories).map(([category, enabled]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category as Notification['category'])}
                          <Label htmlFor={`${category}-category`} className="capitalize">
                            {category.replace('_', ' ')}
                          </Label>
                        </div>
                        <Switch
                          id={`${category}-category`}
                          checked={enabled}
                          onCheckedChange={(checked) => 
                            updatePreferences({ 
                              categories: { 
                                ...preferences.categories, 
                                [category]: checked 
                              } 
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Frequency</h3>
                  <Select value={preferences.frequency} onValueChange={(value) => updatePreferences({ frequency: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Quiet Hours</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
                      <Switch
                        id="quiet-hours"
                        checked={preferences.quietHours.enabled}
                        onCheckedChange={(checked) => 
                          updatePreferences({ 
                            quietHours: { ...preferences.quietHours, enabled: checked } 
                          })
                        }
                      />
                    </div>
                    {preferences.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="quiet-start">Start Time</Label>
                          <Input
                            id="quiet-start"
                            type="time"
                            value={preferences.quietHours.start}
                            onChange={(e) => 
                              updatePreferences({ 
                                quietHours: { ...preferences.quietHours, start: e.target.value } 
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="quiet-end">End Time</Label>
                          <Input
                            id="quiet-end"
                            type="time"
                            value={preferences.quietHours.end}
                            onChange={(e) => 
                              updatePreferences({ 
                                quietHours: { ...preferences.quietHours, end: e.target.value } 
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

interface NotificationListProps {
  notifications: Notification[]
  loading: boolean
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedPriority: string
  setSelectedPriority: (priority: string) => void
}

function NotificationList({
  notifications,
  loading,
  onMarkAsRead,
  onDelete,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority
}: NotificationListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="payments">Payments</SelectItem>
              <SelectItem value="shipments">Shipments</SelectItem>
              <SelectItem value="verification">Verification</SelectItem>
              <SelectItem value="fintech">Fintech</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No notifications found</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className={`border rounded-lg p-4 transition-colors ${notification.read ? 'bg-muted/30' : 'bg-background hover:bg-muted/50'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div>
                      <h3 className={`font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(notification.priority)}
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(notification.category)}
                      <span className="text-xs text-muted-foreground capitalize">
                        {notification.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    {notification.scheduledFor && (
                      <span>Scheduled: {new Date(notification.scheduledFor).toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkAsRead(notification.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Mark Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
