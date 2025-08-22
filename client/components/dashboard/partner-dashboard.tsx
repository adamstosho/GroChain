"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  UserPlus, 
  BarChart3, 
  Calendar,
  Upload,
  Download,
  Eye,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Star,
  Wifi,
  Activity,
  Shield,
  Brain
} from "lucide-react"
// import { DashboardLayout } from "./dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"

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
  pendingCommissions: number
  totalHarvests: number
}

interface Farmer {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  status: 'active' | 'inactive' | 'pending'
  joinedDate: string
  totalHarvests: number
  totalEarnings: number
  lastActivity: string
}

interface Commission {
  _id: string
  farmerId: string
  farmerName: string
  amount: number
  status: 'pending' | 'paid' | 'cancelled'
  transactionId?: string
  createdAt: string
  paidAt?: string
  description: string
}

export function PartnerDashboard({ user }: PartnerDashboardProps) {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === "farmers") {
      fetchFarmers()
    } else if (activeTab === "commissions") {
      fetchCommissions()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch partner metrics and analytics
      const [metricsResponse, analyticsResponse, commissionsResponse] = await Promise.all([
        api.getPartnerMetrics(user.id),
        api.getPartnersAnalytics(),
        api.getCommissionsSummary()
      ])

      let dashboardStats: PartnerStats

      if (metricsResponse.success && analyticsResponse.success && commissionsResponse.success) {
        const metrics = metricsResponse.data as any
        const analytics = analyticsResponse.data as any
        const commissions = commissionsResponse.data as any

        dashboardStats = {
          totalFarmers: metrics.totalFarmers || 0,
          activeFarmers: metrics.activeFarmers || 0,
          totalCommission: commissions.totalEarned || 0,
          monthlyCommission: commissions.monthlyEarned || 0,
          farmersThisMonth: metrics.farmersThisMonth || 0,
          conversionRate: metrics.conversionRate || 0,
          pendingCommissions: commissions.pendingAmount || 0,
          totalHarvests: metrics.totalHarvests || 0
        }
      } else {
        // Fallback to mock data if API fails
        dashboardStats = getMockStats()
      }

      setStats(dashboardStats)
      setLastUpdated(new Date())

      // Generate mock recent activities
      setRecentActivities(generateMockActivities())

    } catch (error) {
      console.error("Dashboard fetch error:", error)
      setError("Failed to load dashboard data")
      setStats(getMockStats())
      setRecentActivities(generateMockActivities())
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  const fetchFarmers = async () => {
    try {
      // This would be a partner-specific endpoint to get their farmers
      // For now, we'll use mock data
      const mockFarmers: Farmer[] = [
        {
          _id: "1",
          name: "Adunni Okafor",
          email: "adunni@farms.com",
          phone: "+2348012345678",
          location: "Lagos State",
          status: "active",
          joinedDate: "2024-12-01",
          totalHarvests: 12,
          totalEarnings: 240000,
          lastActivity: "2025-01-15"
        },
        {
          _id: "2",
          name: "Ibrahim Mohammed",
          email: "ibrahim@agro.com",
          phone: "+2348023456789",
          location: "Kano State",
          status: "active",
          joinedDate: "2024-11-15",
          totalHarvests: 8,
          totalEarnings: 160000,
          lastActivity: "2025-01-14"
        },
        {
          _id: "3",
          name: "Choma Ezeh",
          email: "choma@farms.com",
          phone: "+2348034567890",
          location: "Enugu State",
          status: "pending",
          joinedDate: "2025-01-01",
          totalHarvests: 0,
          totalEarnings: 0,
          lastActivity: "2025-01-01"
        }
      ]
      setFarmers(mockFarmers)
    } catch (error) {
      console.error("Failed to fetch farmers:", error)
      toast.error("Failed to load farmers")
    }
  }

  const fetchCommissions = async () => {
    try {
      const response = await api.getCommissionsHistory()
      if (response.success && response.data) {
        setCommissions((response.data as any).commissions || [])
      } else {
        // Mock data fallback
        setCommissions(generateMockCommissions())
      }
    } catch (error) {
      console.error("Failed to fetch commissions:", error)
      setCommissions(generateMockCommissions())
    }
  }

  const getMockStats = (): PartnerStats => ({
    totalFarmers: 45,
    activeFarmers: 38,
    totalCommission: 125000,
    monthlyCommission: 25000,
    farmersThisMonth: 5,
    conversionRate: 78,
    pendingCommissions: 15000,
    totalHarvests: 156
  })

  const generateMockActivities = () => [
    {
      id: "1",
      type: "farmer_joined",
      title: "New farmer registered",
      description: "Adunni Okafor joined your network",
      time: "2 hours ago",
      status: "success"
    },
    {
      id: "2",
      type: "commission_earned",
      title: "Commission earned",
      description: "₦500 from tomato harvest",
      time: "5 hours ago",
      status: "success"
    },
    {
      id: "3",
      type: "training_completed",
      title: "Training completed",
      description: "15 farmers completed QR training",
      time: "1 day ago",
      status: "success"
    },
    {
      id: "4",
      type: "harvest_verified",
      title: "Harvest verified",
      description: "Yam harvest from Ibrahim verified",
      time: "2 days ago",
      status: "success"
    }
  ]

  const generateMockCommissions = (): Commission[] => [
    {
      _id: "1",
      farmerId: "farmer1",
      farmerName: "Adunni Okafor",
      amount: 500,
      status: "paid",
      transactionId: "txn_001",
      createdAt: "2025-01-15T10:00:00Z",
      paidAt: "2025-01-15T10:30:00Z",
      description: "Commission from tomato harvest"
    },
    {
      _id: "2",
      farmerId: "farmer2",
      farmerName: "Ibrahim Mohammed",
      amount: 300,
      status: "pending",
      createdAt: "2025-01-14T15:00:00Z",
      description: "Commission from yam harvest"
    },
    {
      _id: "3",
      farmerId: "farmer3",
      farmerName: "Choma Ezeh",
      amount: 200,
      status: "paid",
      transactionId: "txn_002",
      createdAt: "2025-01-13T09:00:00Z",
      paidAt: "2025-01-13T09:15:00Z",
      description: "Commission from cassava harvest"
    }
  ]

  const handleRefresh = () => {
    fetchDashboardData()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCommissionStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error && !stats) {
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

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No dashboard data available</p>
        </div>
      </div>
    )
  }

  return (
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
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              {loading ? (
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="farmers">My Farmers</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Farmers</p>
                        <p className="text-2xl font-bold text-foreground">{stats.totalFarmers}</p>
                        <p className="text-xs text-muted-foreground">+{stats.farmersThisMonth} this month</p>
                      </div>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Farmers</p>
                        <p className="text-2xl font-bold text-foreground">{stats.activeFarmers}</p>
                        <p className="text-xs text-muted-foreground">{stats.conversionRate}% conversion rate</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Monthly Commission</p>
                        <p className="text-2xl font-bold text-foreground">₦{stats.monthlyCommission.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">₦{stats.pendingCommissions.toLocaleString()} pending</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Harvests</p>
                        <p className="text-2xl font-bold text-foreground">{stats.totalHarvests}</p>
                        <p className="text-xs text-muted-foreground">From your network</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Activities & Top Farmers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Recent Activities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                          </div>
                          <Badge variant="secondary">{activity.time}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Performing Farmers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Top Performing Farmers</span>
                      <Link href="/partners">
                        <Button variant="outline" size="sm">
                          View All
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {farmers.slice(0, 3).map((farmer, index) => (
                        <div key={farmer._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-orange-100'
                            }`}>
                              <span className={`text-sm font-semibold ${
                                index === 0 ? 'text-yellow-700' : index === 1 ? 'text-gray-700' : 'text-orange-700'
                              }`}>
                                {farmer.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{farmer.name}</p>
                              <p className="text-xs text-muted-foreground">{farmer.totalHarvests} harvests</p>
                            </div>
                          </div>
                          <Badge variant="default">₦{(farmer.totalEarnings / 100).toLocaleString()}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="farmers" className="space-y-6">
            {/* Farmers Management */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Farmer Network</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search farmers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {farmers
                    .filter(farmer => 
                      farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                      (filterStatus === 'all' || farmer.status === filterStatus)
                    )
                    .map((farmer) => (
                      <div
                        key={farmer._id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{farmer.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {farmer.email}
                              </span>
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {farmer.phone}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {farmer.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">{farmer.totalHarvests} harvests</p>
                            <p className="text-xs text-muted-foreground">₦{(farmer.totalEarnings / 100).toLocaleString()}</p>
                          </div>
                          <Badge className={getStatusColor(farmer.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(farmer.status)}
                              {farmer.status}
                            </div>
                          </Badge>
                          <Link href={`/partners/${farmer._id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            {/* Commission History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Commission History</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchCommissions}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissions.map((commission) => (
                    <div
                      key={commission._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{commission.farmerName}</h4>
                          <p className="text-sm text-muted-foreground">{commission.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(commission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">₦{commission.amount.toLocaleString()}</p>
                          <Badge className={getCommissionStatusColor(commission.status)}>
                            {commission.status}
                          </Badge>
                        </div>
                        {commission.status === 'paid' && (
                          <div className="text-xs text-muted-foreground">
                            Paid: {new Date(commission.paidAt!).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            {/* Partner Tools */}
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-cyan-600" />
                    IoT & Sensors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monitor IoT sensors and environmental conditions for your farmer network.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/iot">
                      <Button>
                        <Wifi className="w-4 h-4 mr-2" />
                        Manage Sensors
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI & ML Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access AI-powered crop analysis and predictive analytics for your farmers.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/ai">
                      <Button>
                        <Brain className="w-4 h-4 mr-2" />
                        AI Dashboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Quality Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monitor quality standards and compliance for products from your farmer network.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/quality">
                      <Button>
                        <Shield className="w-4 h-4 mr-2" />
                        Quality Dashboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default PartnerDashboard
