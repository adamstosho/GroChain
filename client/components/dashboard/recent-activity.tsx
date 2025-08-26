"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Leaf, ShoppingCart, Users, DollarSign } from "lucide-react"

interface Activity {
  _id: string
  type: "harvest" | "order" | "payment" | "user"
  description: string
  timestamp: Date
  user?: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Mock activity data
    setActivities([
      {
        _id: "1",
        type: "harvest",
        description: "New harvest submitted for approval",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        user: "John Farmer",
      },
      {
        _id: "2",
        type: "order",
        description: "Order #12345 completed",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        user: "Jane Buyer",
      },
      {
        _id: "3",
        type: "payment",
        description: "Payment of ₦25,000 processed",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        user: "Mike Partner",
      },
      {
        _id: "4",
        type: "user",
        description: "New farmer registered",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        user: "Sarah Farmer",
      },
    ])
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "harvest":
        return Leaf
      case "order":
        return ShoppingCart
      case "payment":
        return DollarSign
      case "user":
        return Users
      default:
        return Leaf
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "harvest":
        return "bg-primary/10 text-primary"
      case "order":
        return "bg-secondary/10 text-secondary"
      case "payment":
        return "bg-success/10 text-success"
      case "user":
        return "bg-accent/10 text-accent"
      default:
        return "bg-muted/10 text-muted-foreground"
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest platform activities</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={activity._id} className="flex items-start space-x-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center space-x-2">
                      {activity.user && (
                        <Badge variant="outline" className="text-xs">
                          {activity.user}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
