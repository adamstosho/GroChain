"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Bell, Package, CreditCard, CloudRain, Users, Eye } from "lucide-react"
import { useNotifications } from "./notification-context"
import Link from "next/link"

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const recentNotifications = notifications.slice(0, 5)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="w-4 h-4 text-primary" />
      case "payment":
        return <CreditCard className="w-4 h-4 text-success" />
      case "weather":
        return <CloudRain className="w-4 h-4 text-info" />
      case "partner":
        return <Users className="w-4 h-4 text-accent" />
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 z-50"
            >
              <Card className="shadow-lg border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {unreadCount} new
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {recentNotifications.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No notifications</p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {recentNotifications.map((notification, index) => (
                        <div key={notification.id}>
                          <div
                            className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                              !notification.read ? "bg-primary/5" : ""
                            }`}
                            onClick={() => {
                              markAsRead(notification.id)
                              setIsOpen(false)
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-medium text-foreground truncate">{notification.title}</h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          {index < recentNotifications.length - 1 && <Separator />}
                        </div>
                      ))}
                    </div>
                  )}

                  {recentNotifications.length > 0 && (
                    <>
                      <Separator />
                      <div className="p-3">
                        <Link href="/notifications" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View All Notifications
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell
