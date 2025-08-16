"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, DollarSign, UserPlus, BarChart3, Calendar } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface PartnerDashboardProps {
  user: User
}

export function PartnerDashboard({ user }: PartnerDashboardProps) {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    activeOrders: 0,
    monthlyCommission: 0,
    conversionRate: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.get("/partners/stats"),
          api.get("/partners/activities"),
        ])

        setStats(
          statsRes.data || {
            totalFarmers: 45,
            activeOrders: 12,
            monthlyCommission: 25000,
            conversionRate: 78,
          },
        )
        setRecentActivities(activitiesRes.data || [])
      } catch (error) {
        console.error("Failed to fetch partner dashboard data:", error)
        // Mock data for development
        setStats({
          totalFarmers: 45,
          activeOrders: 12,
          monthlyCommission: 25000,
          conversionRate: 78,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const quickActions = [
    {
      title: "Onboard Farmer",
      description: "Add new farmer to platform",
      href: "/partners/onboard",
      icon: UserPlus,
      color: "bg-green-500",
    },
    {
      title: "View Farmers",
      description: "Manage your farmers",
      href: "/partners",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Commission Report",
      description: "View earnings",
      href: "/commissions",
      icon: DollarSign,
      color: "bg-amber-500",
    },
    {
      title: "Analytics",
      description: "Performance metrics",
      href: "/analytics",
      icon: BarChart3,
      color: "bg-purple-500",
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">
            {user.role === "partner" ? "Partner" : "Aggregator"} Dashboard - Manage your network and earnings
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {user.role === "partner" ? "Partner" : "Aggregator"} Account
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Farmers</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalFarmers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeOrders}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Commission</p>
                <p className="text-2xl font-bold text-foreground">₦{stats.monthlyCommission.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity: any, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activities</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PartnerDashboard
