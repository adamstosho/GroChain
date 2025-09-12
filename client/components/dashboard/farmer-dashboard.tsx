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

// Helper function to determine credit score status
const getCreditScoreStatus = (score: number): string => {
  if (score >= 740) return "Excellent standing"
  if (score >= 670) return "Good standing"
  if (score >= 580) return "Fair standing"
  if (score >= 300) return "Poor standing"
  return "Very poor standing"
}

export function FarmerDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recentHarvests, setRecentHarvests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [credit, setCredit] = useState<any>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)

        // Fetch all dashboard data in parallel
        const [dashboardResponse, harvestsResponse, creditResp, farmerAnalytics] = await Promise.all([
          apiService.getDashboard(),
          apiService.getHarvests({ limit: 5 }),
          apiService.getMyCreditScore().catch(() => ({
            data: { score: "N/A", status: "Calculating..." }
          })),
          apiService.getFarmerAnalytics().catch(() => ({ data: {} }))
        ])

        // Handle dashboard stats
        if (dashboardResponse.status === 'success') {
          console.log('📊 Dashboard Response Data:', dashboardResponse.data)
          console.log('📊 Dashboard Total Revenue:', dashboardResponse.data?.totalRevenue)
          console.log('📊 Dashboard Monthly Revenue:', dashboardResponse.data?.monthlyRevenue)
          setStats(dashboardResponse.data)
        }

        // Handle harvests data
        if (harvestsResponse.status === 'success') {
          const harvestData = harvestsResponse.harvests || harvestsResponse.data || []
          setRecentHarvests(Array.isArray(harvestData) ? harvestData : [])
        }

        // Handle credit score data
        if (creditResp && creditResp.data) {
          console.log('📊 Credit score data received:', creditResp.data)
          setCredit(creditResp.data)
        } else {
          console.log('⚠️  No credit score data received, will retry...')
          // Try to get credit score from dashboard data as fallback
          if (dashboardResponse.data && dashboardResponse.data.creditScore) {
            setCredit(dashboardResponse.data.creditScore)
          }
        }

        // Update stats with farmer analytics data for accurate revenue
        console.log('🔍 Raw Farmer Analytics Response:', farmerAnalytics)
        console.log('🔍 Farmer Analytics Status:', farmerAnalytics?.status)
        console.log('🔍 Farmer Analytics Data:', farmerAnalytics?.data)
        
        if (farmerAnalytics.status === 'success' && farmerAnalytics.data) {
          const analyticsData = farmerAnalytics.data
          console.log('🔍 Farmer Analytics Data:', analyticsData)
          console.log('💰 Total Revenue from Analytics:', analyticsData.totalRevenue)
          console.log('📊 Monthly Trends:', analyticsData.monthlyTrends)
          
          setStats(prevStats => {
            const updatedStats = {
              ...prevStats,
              totalRevenue: analyticsData.totalRevenue || 0,
              monthlyRevenue: analyticsData.monthlyTrends?.length > 0 
                ? analyticsData.monthlyTrends[analyticsData.monthlyTrends.length - 1]?.revenue || 0
                : 0,
              totalOrders: analyticsData.totalOrders || 0,
              activeListings: analyticsData.totalListings || 0
            }
            console.log('📊 Updated stats with analytics:', updatedStats)
            return updatedStats
          })
          
          console.log('✅ Stats updated with analytics data')
        } else {
          console.warn('⚠️ Farmer Analytics not available:', farmerAnalytics)
          console.log('📊 Using fallback stats from dashboard response')
        }

      } catch (error: any) {
        console.error('Dashboard fetch error:', error)
        toast({
          title: "Error loading dashboard",
          description: error.message || "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })

        // Set fallback data
        setStats({
          totalHarvests: 0,
          pendingApprovals: 0,
          activeListings: 0,
          monthlyRevenue: 0,
          totalRevenue: 0,
          totalOrders: 0
        })
        setRecentHarvests([])
        setCredit(null)
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
    // {
    //   title: "View QR Codes",
    //   description: "Manage your QR codes",
    //   icon: QrCode,
    //   href: "/dashboard/qr-codes",
    //   color: "bg-secondary/10 text-secondary",
    // },
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
    // Handle different date formats from backend
    let harvestDate: Date
    try {
      if (harvest.harvestDate) {
        harvestDate = new Date(harvest.harvestDate)
      } else if (harvest.date) {
        harvestDate = new Date(harvest.date)
      } else if (harvest.createdAt) {
        harvestDate = new Date(harvest.createdAt)
      } else {
        harvestDate = new Date()
      }
    } catch (error) {
      harvestDate = new Date()
    }

    return {
      id: String(harvest._id || harvest.id),
      farmerName: harvest.farmerName || harvest.farmer?.name || "You",
      cropType: harvest.cropType || "Unknown Crop",
      variety: harvest.variety || "Standard",
      harvestDate,
      quantity: harvest.quantity || 0,
      unit: harvest.unit || "kg",
      location: harvest.location || "Unknown Location",
      quality: harvest.quality || "good",
      status: harvest.status || "pending",
      qrCode: harvest.batchId || harvest.qrCode || `HARVEST_${harvest._id || harvest.id}`,
      price: harvest.price || 0,
      organic: harvest.organic || false,
      moistureContent: harvest.moistureContent || 15,
      grade: harvest.grade || harvest.qualityGrade || "B"
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Harvests"
          value={stats?.totalHarvests || 0}
          description="All time harvests"
          icon={Leaf}
          trend={stats?.totalHarvests > 0 ? { value: 12, isPositive: true } : undefined}
        />
        <StatsCard
          title="Pending Approvals"
          value={stats?.pendingApprovals || 0}
          description="Awaiting verification"
          icon={Package}
          trend={stats?.pendingApprovals > 0 ? { value: 2, isPositive: false } : undefined}
        />
        <StatsCard
          title="Active Listings"
          value={stats?.activeListings || 0}
          description="In marketplace"
          icon={TrendingUp}
          trend={stats?.activeListings > 0 ? { value: 8, isPositive: true } : undefined}
        />
        <StatsCard
          title="Revenue This Month"
          value={stats?.monthlyRevenue ? `₦${stats.monthlyRevenue.toLocaleString()}` : "₦0"}
          description="From sales"
          icon={DollarSign}
          trend={stats?.monthlyRevenue > 0 ? { value: 15, isPositive: true } : undefined}
        />
        <StatsCard
          title="Total Revenue"
          value={stats?.totalRevenue ? `₦${stats.totalRevenue.toLocaleString()}` : "₦0"}
          description="All time earnings"
          icon={DollarSign}
          trend={stats?.totalRevenue > 0 ? { value: 25, isPositive: true } : undefined}
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
              <CardDescription>Your farming metrics and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Harvest Quality */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Harvest Quality</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.totalHarvests > 0 ? '85%' : 'N/A'}
                    </span>
                  </div>
                  {stats?.totalHarvests > 0 && (
                    <Progress value={85} className="h-2" />
                  )}
                </div>

                {/* Market Success */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Market Success</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.activeListings > 0 ? '72%' : 'N/A'}
                    </span>
                  </div>
                  {stats?.activeListings > 0 && (
                    <Progress value={72} className="h-2" />
                  )}
                </div>

                {/* Revenue Growth */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Revenue Growth</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.monthlyRevenue > 0 ? '+15%' : 'N/A'}
                    </span>
                  </div>
                  {stats?.monthlyRevenue > 0 && (
                    <Progress value={65} className="h-2" />
                  )}
                </div>

                {/* Activity Level */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Activity Level</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.totalHarvests > 0 ? 'Active' : 'Getting Started'}
                    </span>
                  </div>
                  <Progress
                    value={stats?.totalHarvests > 0 ? 80 : 20}
                    className="h-2"
                  />
                </div>
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
          <Card>
            <CardHeader>
              <CardTitle>Credit Score</CardTitle>
              <CardDescription>Your financial standing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {credit && credit.score !== "N/A" ? (
                  <>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {credit.score || "N/A"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getCreditScoreStatus(credit.score)}
                    </p>
                    {credit.factors && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Payment History</span>
                          <span>{credit.factors.paymentHistory || credit.factors.paymentHistory || 0}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Harvest Consistency</span>
                          <span>{credit.factors.harvestConsistency || credit.factors.consistency || 0}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Business Stability</span>
                          <span>{credit.factors.businessStability || credit.factors.stability || 0}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Market Reputation</span>
                          <span>{credit.factors.marketReputation || credit.factors.reputation || 0}%</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-muted-foreground mb-2">
                      N/A
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Calculating your credit score...
                    </p>
                  </>
                )}
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
