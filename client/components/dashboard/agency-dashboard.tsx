"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
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
  Package,
  Truck,
  Clock
} from "lucide-react"
import { DashboardLayout } from "./dashboard-layout"
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
  totalHarvests: number
  totalShipments: number
  pendingCommissions: number
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
  partnerId: string
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

interface Shipment {
  _id: string
  farmerId: string
  farmerName: string
  destination: string
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled'
  createdAt: string
  deliveredAt?: string
  trackingNumber: string
}

export function AgencyDashboard({ user }: AgencyDashboardProps) {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<AgencyStats | null>(null)
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])
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
    } else if (activeTab === "logistics") {
      fetchShipments()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch agency metrics and analytics
      const [metricsResponse, analyticsResponse, commissionsResponse] = await Promise.all([
        api.getPartnerMetrics(user.id),
        api.getPartnersAnalytics(),
        api.getCommissionsSummary()
      ])

      let dashboardStats: AgencyStats

      if (metricsResponse.success && analyticsResponse.success && commissionsResponse.success) {
        const metrics = metricsResponse.data
        const analytics = analyticsResponse.data
        const commissions = commissionsResponse.data

        dashboardStats = {
          totalFarmers: metrics.totalFarmers || 0,
          activeFarmers: metrics.activeFarmers || 0,
          totalCommission: commissions.totalEarned || 0,
          monthlyCommission: commissions.monthlyEarned || 0,
          farmersThisMonth: metrics.farmersThisMonth || 0,
          conversionRate: metrics.conversionRate || 0,
          totalHarvests: metrics.totalHarvests || 0,
          totalShipments: 0, // Will be fetched separately
          pendingCommissions: commissions.pendingAmount || 0
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
      // This would be an agency-specific endpoint to get their farmers
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
          lastActivity: "2025-01-15",
          partnerId: "partner1"
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
          lastActivity: "2025-01-14",
          partnerId: "partner2"
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
          lastActivity: "2025-01-01",
          partnerId: "partner3"
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
        setCommissions(response.data.commissions || [])
      } else {
        // Mock data fallback
        setCommissions(generateMockCommissions())
      }
    } catch (error) {
      console.error("Failed to fetch commissions:", error)
      setCommissions(generateMockCommissions())
    }
  }

  const fetchShipments = async () => {
    try {
      // Mock shipments data for now
      const mockShipments: Shipment[] = [
        {
          _id: "1",
          farmerId: "farmer1",
          farmerName: "Adunni Okafor",
          destination: "Lagos Market",
          status: "in-transit",
          createdAt: "2025-01-15T10:00:00Z",
          trackingNumber: "TRK001"
        },
        {
          _id: "2",
          farmerId: "farmer2",
          farmerName: "Ibrahim Mohammed",
          destination: "Kano Market",
          status: "delivered",
          createdAt: "2025-01-14T15:00:00Z",
          deliveredAt: "2025-01-15T09:00:00Z",
          trackingNumber: "TRK002"
        },
        {
          _id: "3",
          farmerId: "farmer3",
          farmerName: "Choma Ezeh",
          destination: "Enugu Market",
          status: "pending",
          createdAt: "2025-01-13T09:00:00Z",
          trackingNumber: "TRK003"
        }
      ]
      setShipments(mockShipments)
    } catch (error) {
      console.error("Failed to fetch shipments:", error)
      toast.error("Failed to load shipments")
    }
  }

  const getMockStats = (): AgencyStats => ({
    totalFarmers: 156,
    activeFarmers: 142,
    totalCommission: 450000,
    monthlyCommission: 75000,
    farmersThisMonth: 12,
    conversionRate: 91,
    totalHarvests: 892,
    totalShipments: 234,
    pendingCommissions: 25000
  })

  const generateMockActivities = () => [
    {
      id: "1",
      type: "farmer_joined",
      title: "New farmer registered",
      description: "John Okafor joined your network",
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
      type: "shipment_delivered",
      title: "Shipment delivered",
      description: "Yam shipment to Lagos Market",
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
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'inactive':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'in-transit':
        return <Truck className="w-4 h-4 text-blue-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'in-transit':
        return 'bg-blue-100 text-blue-800'
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
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error && !stats) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!stats) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No dashboard data available</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Agency Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name}! Manage your farmer network, track commissions, and oversee logistics.
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
              Add Farmers
            </Link>
          </Link>
          <Link href="/partners/bulk">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Link>
          </Link>
          <Link href="/commissions">
            <Button variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              View Commissions
            </Link>
          </Link>
          <Link href="/analytics">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Link>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
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
              title: "Total Shipments",
              value: stats.totalShipments,
              change: "Logistics tracking",
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="farmers">Farmers</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="logistics">Logistics</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        </div>
                        <Badge variant="secondary">{activity.time}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Performing Farmers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Farmers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {farmers.slice(0, 3).map((farmer, index) => (
                      <div key={farmer._id} className="flex items-center justify-between">
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

          <TabsContent value="logistics" className="space-y-6">
            {/* Logistics Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Shipment Tracking</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchShipments}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipments.map((shipment) => (
                    <div
                      key={shipment._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{shipment.farmerName}</h4>
                          <p className="text-sm text-muted-foreground">To: {shipment.destination}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Package className="w-3 h-3 mr-1" />
                              {shipment.trackingNumber}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(shipment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(shipment.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(shipment.status)}
                            {shipment.status}
                          </div>
                        </Badge>
                        {shipment.status === 'delivered' && (
                          <div className="text-xs text-muted-foreground">
                            Delivered: {new Date(shipment.deliveredAt!).toLocaleDateString()}
                          </div>
                        )}
                        <Link href={`/shipments/${shipment._id}`}>
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

          <TabsContent value="tools" className="space-y-6">
            {/* Agency Tools */}
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

export default AgencyDashboard