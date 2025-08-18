"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Plus,
  Download,
  Upload,
  UserPlus
} from "lucide-react"
import { User } from "@/types/api"
import { api } from "@/lib/api"

interface AgencyDashboardProps {
  user: User
}

interface AgencyStats {
  totalFarmers: number
  activeFarmers: number
  totalCommission: number
  monthlyCommission: number
  farmersThisMonth: number
  conversionRate: number
}

export function AgencyDashboard({ user }: AgencyDashboardProps) {
  const [stats, setStats] = useState<AgencyStats>({
    totalFarmers: 0,
    activeFarmers: 0,
    totalCommission: 0,
    monthlyCommission: 0,
    farmersThisMonth: 0,
    conversionRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch partner metrics
        const response = await api.getPartnerMetrics(user.id)
        if (response.success && response.data) {
          setStats(response.data)
        }
      } catch (error) {
        console.error("Error fetching agency stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user.id])

  const statCards = [
    {
      title: "Total Farmers",
      value: stats.totalFarmers,
      change: `+${stats.farmersThisMonth} this month`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Farmers",
      value: stats.activeFarmers,
      change: `${stats.conversionRate}% conversion rate`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Total Commission",
      value: `₦${stats.totalCommission.toLocaleString()}`,
      change: `₦${stats.monthlyCommission.toLocaleString()} this month`,
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Performance",
      value: `${stats.conversionRate}%`,
      change: "Above average",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Agency Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.firstName || user.name}! Manage your farmer network and track commissions.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Farmers
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="farmers">Farmers</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New farmer registered</p>
                      <p className="text-xs text-muted-foreground">John Okafor joined your network</p>
                    </div>
                    <Badge variant="secondary">2h ago</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Commission earned</p>
                      <p className="text-xs text-muted-foreground">₦500 from tomato harvest</p>
                    </div>
                    <Badge variant="secondary">5h ago</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Training completed</p>
                      <p className="text-xs text-muted-foreground">15 farmers completed QR training</p>
                    </div>
                    <Badge variant="secondary">1d ago</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Farmers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Farmers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-700">AO</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Adunni Okafor</p>
                        <p className="text-xs text-muted-foreground">12 harvests</p>
                      </div>
                    </div>
                    <Badge variant="default">₦2,400</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700">CE</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Choma Ezeh</p>
                        <p className="text-xs text-muted-foreground">8 harvests</p>
                      </div>
                    </div>
                    <Badge variant="default">₦1,600</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-700">IO</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Ibrahim Okafor</p>
                        <p className="text-xs text-muted-foreground">6 harvests</p>
                      </div>
                    </div>
                    <Badge variant="default">₦1,200</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="farmers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Farmer Network</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Farmer
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage your farmer network, track their progress, and provide support.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track your commission earnings and withdrawal history.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Bulk Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload multiple farmers at once using CSV file
                  </p>
                  <Button>Upload CSV</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate performance and commission reports
                  </p>
                  <Button variant="outline">Generate Report</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}