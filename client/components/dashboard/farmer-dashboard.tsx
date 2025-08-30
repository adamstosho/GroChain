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
import { HarvestCard, type HarvestData } from "@/components/agricultural"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Leaf, Package, TrendingUp, DollarSign, Plus, Eye, QrCode, BarChart3 } from "lucide-react"
import Link from "next/link"

export function FarmerDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recentHarvests, setRecentHarvests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [credit, setCredit] = useState<any>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse, harvestsResponse, creditResp] = await Promise.all([
          apiService.getDashboard(),
          apiService.getHarvests({ limit: 5 }),
          apiService.getMyCreditScore(),
        ])

        setStats(dashboardResponse.data)
        setRecentHarvests(harvestsResponse.data || [])
        setCredit((creditResp as any)?.data || creditResp)
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

  // Convert harvest data to our component format
  const convertToHarvestData = (harvest: any): HarvestData => {
    return {
      id: String(harvest._id || harvest.id),
      farmerName: harvest.farmerName || "You",
      cropType: harvest.cropType,
      variety: harvest.variety || "Standard",
      harvestDate: new Date(harvest.date || harvest.harvestDate || Date.now()),
      quantity: harvest.quantity,
      unit: harvest.unit,
      location: harvest.location,
      quality: harvest.quality || "good",
      status: harvest.status || "pending",
      qrCode: harvest.qrCode || `HARVEST_${Date.now()}`,
      price: harvest.price || 0,
      organic: harvest.organic || false,
      moistureContent: harvest.moistureContent || 15,
      grade: harvest.qualityGrade || "B"
    }
  }

  const handleHarvestAction = (action: string, harvestId: string) => {
    switch (action) {
      case "view":
        window.location.href = `/dashboard/harvests/${harvestId}`
        break
      case "edit":
        window.location.href = `/dashboard/harvests/${harvestId}/edit`
        break
      case "approve":
        console.log("Approving harvest:", harvestId)
        break
      case "reject":
        console.log("Rejecting harvest:", harvestId)
        break
    }
  }

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentHarvests.slice(0, 4).map((harvest) => (
                      <HarvestCard
                        key={harvest._id}
                        harvest={convertToHarvestData(harvest)}
                        variant="compact"
                        onView={(id) => handleHarvestAction("view", id)}
                        onEdit={(id) => handleHarvestAction("edit", id)}
                      />
                    ))}
                  </div>
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
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Harvest Quality</span>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Market Success</span>
                  <span className="text-sm text-muted-foreground">72%</span>
                </div>
                <Progress value={72} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-sm text-muted-foreground">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <WeatherWidget />

          {/* Recent Activity */}
          <RecentActivity />

          {/* Credit Score */}
          {credit && (
            <Card>
              <CardHeader>
                <CardTitle>Credit Score</CardTitle>
                <CardDescription>Your financial standing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {credit.score || "N/A"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {credit.status || "Good standing"}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
