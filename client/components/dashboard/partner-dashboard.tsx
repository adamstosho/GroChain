"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Users, Shield, TrendingUp, DollarSign, UserPlus, FileCheck, BarChart3, Upload } from "lucide-react"
import Link from "next/link"

export function PartnerDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])
  const [recentFarmers, setRecentFarmers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse] = await Promise.all([apiService.getDashboard()])

        setStats(dashboardResponse.data)
        // Mock data for demo
        setPendingApprovals([
          {
            _id: "1",
            farmer: { name: "John Doe" },
            cropType: "Tomatoes",
            quantity: 50,
            unit: "kg",
            date: new Date(),
            status: "pending",
          },
        ])
        setRecentFarmers([
          {
            _id: "1",
            name: "Jane Smith",
            location: "Lagos",
            joinedAt: new Date(),
            status: "active",
          },
        ])
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
      title: "Onboard Farmers",
      description: "Add new farmers to platform",
      icon: UserPlus,
      href: "/dashboard/onboarding",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Bulk Upload",
      description: "CSV farmer onboarding",
      icon: Upload,
      href: "/dashboard/onboarding/bulk",
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Pending Approvals",
      description: "Review harvest submissions",
      icon: FileCheck,
      href: "/dashboard/approvals",
      color: "bg-accent/10 text-accent",
    },
    {
      title: "View Analytics",
      description: "Performance insights",
      icon: BarChart3,
      href: "/dashboard/analytics",
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
          title="Total Farmers"
          value={stats?.totalFarmers || 0}
          description="Under your partnership"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pending Approvals"
          value={stats?.pendingApprovals || 0}
          description="Awaiting your review"
          icon={Shield}
          trend={{ value: 3, isPositive: false }}
        />
        <StatsCard
          title="Commission Earned"
          value={`₦${(stats?.commissionEarned || 0).toLocaleString()}`}
          description="This month"
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Active Partnerships"
          value={stats?.activePartnerships || 0}
          description="Ongoing collaborations"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <QuickActions actions={quickActions} />

          {/* Pending Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Harvest submissions awaiting your review</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/approvals">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.length > 0 ? (
                  pendingApprovals.map((harvest) => (
                    <div key={harvest._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">{harvest.cropType}</p>
                          <p className="text-sm text-muted-foreground">
                            {harvest.farmer?.name} • {harvest.quantity} {harvest.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Pending</Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/approvals/${harvest._id}`}>Review</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Farmers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recently Onboarded Farmers</CardTitle>
                <CardDescription>New farmers in your network</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/farmers">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFarmers.length > 0 ? (
                  recentFarmers.map((farmer) => (
                    <div key={farmer._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{farmer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {typeof farmer.location === 'string' ? farmer.location : `${farmer.location?.city || 'Unknown'}, ${farmer.location?.state || 'Unknown State'}`} • Joined {new Date(farmer.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Active</Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/farmers/${farmer._id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent farmers</p>
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/onboarding">Onboard Farmers</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Your partnership performance this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Farmers Onboarded</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Approval Rate</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Commission Target</span>
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
          <RecentActivity />

          {/* Commission Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Summary</CardTitle>
              <CardDescription>Your earnings breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">This Month</span>
                  <span className="font-medium">₦45,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Month</span>
                  <span className="font-medium">₦38,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Earned</span>
                  <span className="font-medium">₦285,000</span>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Active Farmers</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Reviews</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span>Approved Today</span>
                  <span className="font-medium">7</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate</span>
                  <span className="font-medium">94%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
