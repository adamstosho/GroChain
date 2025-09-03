"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Leaf, ShoppingCart, Users, DollarSign, Loader2 } from "lucide-react"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Activity {
  _id: string
  type: "harvest" | "order" | "payment" | "user"
  description: string
  timestamp: Date
  user?: string
  metadata?: any
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.getRecentActivities(5)

        if (response.status === 'success') {
          const activityData = response.data || []
          setActivities(activityData.map(activity => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          })))
        }
      } catch (error: any) {
        console.error('Failed to fetch activities:', error)

        // Fallback to mock data if API fails
        setActivities([
          {
            _id: "1",
            type: "harvest",
            description: "New harvest submitted for approval",
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            user: "You",
          },
          {
            _id: "2",
            type: "order",
            description: "Order #12345 completed",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            user: "Jane Buyer",
          },
          {
            _id: "3",
            type: "payment",
            description: "Payment of ₦25,000 processed",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
            user: "Mike Partner",
          },
        ])

        toast({
          title: "Failed to load recent activities",
          description: "Showing sample data instead",
          variant: "default",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [toast])

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
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : activities.length === 0 ? (
            <div className="flex items-center justify-center h-[200px]">
              <div className="text-center text-muted-foreground">
                <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No recent activities</p>
              </div>
            </div>
          ) : (
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
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
