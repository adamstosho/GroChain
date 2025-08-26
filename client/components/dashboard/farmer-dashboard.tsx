"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Leaf, Package, TrendingUp, DollarSign, Plus, Eye, QrCode, BarChart3 } from "lucide-react"
import Link from "next/link"

export function FarmerDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recentHarvests, setRecentHarvests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse, harvestsResponse] = await Promise.all([
          apiService.getDashboard(),
          apiService.getHarvests({ limit: 5 }),
        ])

        setStats(dashboardResponse.data)
        setRecentHarvests(harvestsResponse.data || [])
      } catch (error: any) {
        toast({
          title: "Error loading dashboard",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  const quickActions = [
    {
      title: "Add New Harvest",
      description: "Record a new harvest batch",
      icon: Plus,
      href: "/dashboard/harvests/new",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "View QR Codes",
      description: "Manage your QR codes",
      icon: QrCode,
      href: "/dashboard/qr-codes",
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Check Analytics",
      description: "View your performance",
      icon: BarChart3,
      href: "/dashboard/analytics",
      color: "bg-accent/10 text-accent",
    },
    {
      title: "Browse Marketplace",
      description: "See your listings",
      icon: Eye,
      href: "/dashboard/marketplace",
      color: "bg-success/10 text-success",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Harvests"
          value={stats?.totalHarvests || 0}
          description="All time harvests"
          icon={Leaf}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Pending Approvals"
          value={stats?.pendingApprovals || 0}
          description="Awaiting verification"
          icon={Package}
          trend={{ value: 2, isPositive: false }}
        />
        <StatsCard
          title="Active Listings"
          value={stats?.activeListings || 0}
          description="In marketplace"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Revenue This Month"
          value={`₦${(stats?.monthlyRevenue || 0).toLocaleString()}`}
          description="From sales"
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <QuickActions actions={quickActions} />

          {/* Recent Harvests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Harvests</CardTitle>
                <CardDescription>Your latest harvest records</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/harvests">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentHarvests.length > 0 ? (
                  recentHarvests.map((harvest) => (
                    <div key={harvest._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Leaf className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{harvest.cropType}</p>
                          <p className="text-sm text-muted-foreground">
                            {harvest.quantity} {harvest.unit} • {new Date(harvest.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            harvest.status === "approved"
                              ? "default"
                              : harvest.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {harvest.status}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/harvests/${harvest._id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No harvests recorded yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/harvests/new">Add Your First Harvest</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Your farming metrics this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Harvest Goal</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Quality Score</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Market Presence</span>
                    <span>68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <WeatherWidget />
          <RecentActivity />

          {/* Credit Score */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Score</CardTitle>
              <CardDescription>Your farming credit rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-primary">750</div>
                <div className="text-sm text-muted-foreground">Excellent</div>
                <Progress value={75} className="h-2" />
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/financial">View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
