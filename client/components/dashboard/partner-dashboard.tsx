"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Plus,
  Download,
  Upload,
  UserPlus,
  Eye,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"
import { DashboardLayout } from "./dashboard-layout"

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface PartnerDashboardProps {
  user: User
}

interface PartnerStats {
  totalFarmers: number
  activeFarmers: number
  totalCommission: number
  monthlyCommission: number
  farmersThisMonth: number
  conversionRate: number
  totalHarvests: number
  totalShipments: number
  pendingCommissions: number
  performanceScore: number
}

interface Farmer {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  status: string
  joinedDate: string
  totalHarvests: number
  totalEarnings: number
  lastActivity: string
}

interface CommissionStats {
  totalEarned: number
  pendingAmount: number
  monthlyTrend: Array<{
    month: string
    amount: number
    farmerCount: number
  }>
  topEarners: Array<{
    farmerId: string
    farmerName: string
    totalCommission: number
    harvestCount: number
  }>
}

interface NetworkGrowth {
  monthlyGrowth: number
  regionalDistribution: Record<string, number>
  farmerCategories: Array<{
    category: string
    count: number
    totalValue: number
  }>
}

interface PartnerDashboardData {
  stats: PartnerStats
  recentFarmers: Farmer[]
  commissionStats: CommissionStats
  networkGrowth: NetworkGrowth
}

const PartnerDashboard = ({ user }: PartnerDashboardProps) => {
  const { user: authUser } = useAuth()
  const [dashboardData, setDashboardData] = useState<PartnerDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      if (!authUser?.id) {
        throw new Error("User not authenticated")
      }

      console.log('🔍 Auth user object:', authUser)
      console.log('🔍 User role:', authUser.role)
      console.log('🔍 User ID:', authUser.id)
      
      // Check if user has partner role
      if (authUser.role !== 'partner' && authUser.role !== 'admin') {
        throw new Error("User does not have partner access")
      }

      console.log('🔍 Fetching partner dashboard data for user:', authUser.id)
      const response = await api.getPartnerDashboard(authUser.id)
      console.log('🔍 Partner dashboard API response:', response)
      
      if (response.success && response.data) {
        setDashboardData(response.data)
        setLastUpdated(new Date())
        toast.success("Dashboard data updated successfully")
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data')
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data'
      setError(errorMessage)
      toast.error(errorMessage)
      
      // Set empty fallback data
      setDashboardData({
        stats: {
          totalFarmers: 0,
          activeFarmers: 0,
          totalCommission: 0,
          monthlyCommission: 0,
          farmersThisMonth: 0,
          conversionRate: 0,
          totalHarvests: 0,
          totalShipments: 0,
          pendingCommissions: 0,
          performanceScore: 0
        },
        recentFarmers: [],
        commissionStats: {
          totalEarned: 0,
          pendingAmount: 0,
          monthlyTrend: [],
          topEarners: []
        },
        networkGrowth: {
          monthlyGrowth: 0,
          regionalDistribution: {},
          farmerCategories: []
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authUser?.id) {
      fetchDashboardData()
    }
  }, [authUser?.id])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load dashboard</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No dashboard data available</p>
        </div>
      </div>
    )
  }

  // Safely destructure with fallback values
  const { 
    stats = {
      totalFarmers: 0,
      activeFarmers: 0,
      totalCommission: 0,
      monthlyCommission: 0,
      farmersThisMonth: 0,
      conversionRate: 0,
      totalHarvests: 0,
      totalShipments: 0,
      pendingCommissions: 0,
      performanceScore: 0
    }, 
    recentFarmers = [], 
    commissionStats = {
      totalEarned: 0,
      pendingAmount: 0,
      monthlyTrend: [],
      topEarners: []
    }, 
    networkGrowth = {
      monthlyGrowth: 0,
      regionalDistribution: {},
      farmerCategories: []
    } 
  } = dashboardData || {}

  // Ensure stats object exists and has all required properties
  const safeStats = {
    totalFarmers: stats?.totalFarmers || 0,
    activeFarmers: stats?.activeFarmers || 0,
    totalCommission: stats?.totalCommission || 0,
    monthlyCommission: stats?.monthlyCommission || 0,
    farmersThisMonth: stats?.farmersThisMonth || 0,
    conversionRate: stats?.conversionRate || 0,
    totalHarvests: stats?.totalHarvests || 0,
    totalShipments: stats?.totalShipments || 0,
    pendingCommissions: stats?.pendingCommissions || 0,
    performanceScore: stats?.performanceScore || 0
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground">
              {user.role === "partner" ? "Partner" : "Aggregator"} Dashboard - Manage your network and earnings
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError("")}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/partners/onboard">
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Onboard Farmer
            </Button>
          </Link>
          <Link href="/partners/bulk">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          </Link>
          <Link href="/commissions">
            <Button variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              View Commissions
            </Button>
          </Link>
          <Link href="/analytics">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Farmers",
              value: safeStats.totalFarmers,
              change: `+${safeStats.farmersThisMonth} this month`,
              icon: Users,
              color: "text-blue-600",
              bgColor: "bg-blue-50"
            },
            {
              title: "Active Farmers",
              value: safeStats.activeFarmers,
              change: `${safeStats.conversionRate}% conversion rate`,
              icon: TrendingUp,
              color: "text-green-600",
              bgColor: "bg-green-50"
            },
            {
              title: "Total Commission",
              value: formatCurrency(safeStats.totalCommission),
              change: formatCurrency(safeStats.monthlyCommission) + " this month",
              icon: DollarSign,
              color: "text-amber-600",
              bgColor: "bg-amber-50"
            },
            {
              title: "Total Harvests",
              value: safeStats.totalHarvests,
              change: "Network activity",
              icon: Package,
              color: "text-purple-600",
              bgColor: "bg-purple-50"
            }
          ].map((stat, index) => (
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="farmers">My Farmers</TabsTrigger>
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
                  {recentFarmers.length > 0 ? (
                    recentFarmers.slice(0, 5).map((farmer) => (
                      <div key={farmer._id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New farmer onboarded</p>
                          <p className="text-xs text-muted-foreground">{farmer.name} joined your network</p>
                        </div>
                        <Badge variant="secondary">
                          {new Date(farmer.joinedDate).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No recent activity</p>
                      <p className="text-sm text-muted-foreground">Start onboarding farmers to see activity here</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Performing Farmers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Farmers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {commissionStats.topEarners.length > 0 ? (
                    commissionStats.topEarners.slice(0, 3).map((earner, index) => (
                      <div key={earner.farmerId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-orange-100'
                          }`}>
                            <span className={`text-sm font-semibold ${
                              index === 0 ? 'text-yellow-700' : index === 1 ? 'text-gray-700' : 'text-orange-700'
                            }`}>
                              {earner.farmerName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{earner.farmerName}</p>
                            <p className="text-xs text-muted-foreground">{earner.harvestCount} harvests</p>
                          </div>
                        </div>
                        <Badge variant="default">{formatCurrency(earner.totalCommission)}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No performance data yet</p>
                      <p className="text-sm text-muted-foreground">Farmers will appear here as they generate commissions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="farmers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Farmer Network</CardTitle>
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Search farmers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {recentFarmers.length > 0 ? (
                  <div className="space-y-4">
                    {recentFarmers
                      .filter(farmer => 
                        farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                        (filterStatus === 'all' || farmer.status === filterStatus)
                      )
                      .map((farmer) => (
                        <div key={farmer._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {farmer.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{farmer.name}</p>
                              <p className="text-sm text-muted-foreground">{farmer.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{farmer.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(farmer.status)}>
                              {farmer.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              Joined {new Date(farmer.joinedDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No farmers in your network yet</p>
                    <p className="text-sm text-muted-foreground">Start onboarding farmers to build your network</p>
                    <Link href="/partners/onboard">
                      <Button className="mt-4">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Onboard First Farmer
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Management</CardTitle>
              </CardHeader>
              <CardContent>
                {commissionStats.totalEarned > 0 ? (
                  <div className="space-y-6">
                    {/* Commission Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Earned</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(commissionStats.totalEarned)}
                        </p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {formatCurrency(commissionStats.pendingAmount)}
                        </p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Performance Score</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {safeStats.performanceScore}
                        </p>
                      </div>
                    </div>

                    {/* Monthly Trend */}
                    {commissionStats.monthlyTrend.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Monthly Commission Trend</h4>
                        <div className="space-y-2">
                          {commissionStats.monthlyTrend.map((trend) => (
                            <div key={trend.month} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="font-medium">{trend.month}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">
                                  {trend.farmerCount} farmers
                                </span>
                                <span className="font-semibold">
                                  {formatCurrency(trend.amount)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No commission data yet</p>
                    <p className="text-sm text-muted-foreground">Commissions will appear here as your farmers make transactions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Bulk Farmer Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload multiple farmers at once using CSV file. Download the template to get started.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                    <Link href="/partners/bulk">
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload CSV
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Performance Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate detailed performance and commission reports for your network.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Link href="/analytics">
                      <Button>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export { PartnerDashboard }