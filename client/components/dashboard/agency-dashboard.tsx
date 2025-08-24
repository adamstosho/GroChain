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
  Package,
  Truck,
  Clock,
  Search
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"
import { DashboardLayout } from "./dashboard-layout"

interface AgencyDashboardData {
  stats: {
    totalFarmers: number
    activeFarmers: number
    totalCommission: number
    monthlyCommission: number
    farmersThisMonth: number
    conversionRate: number
    totalHarvests: number
    totalShipments: number
    pendingCommissions: number
    monthlyGrowth: number
  }
  recentFarmers: Array<{
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
  }>
  commissionStats: Array<{
    _id: string
    farmerId: string
    farmerName: string
    amount: number
    status: 'pending' | 'paid' | 'cancelled'
    transactionId?: string
    createdAt: string
    paidAt?: string
    description: string
  }>
  shipmentStats: Array<{
    _id: string
    farmerId: string
    farmerName: string
    destination: string
    status: 'pending' | 'in-transit' | 'delivered' | 'cancelled'
    createdAt: string
    deliveredAt?: string
    trackingNumber: string
  }>
  recentActivities: Array<{
    id: string
    type: 'farmer_onboarded' | 'commission_paid' | 'shipment_delivered' | 'harvest_completed'
    title: string
    description: string
    time: string
    status: 'success' | 'pending' | 'error'
    metadata?: any
  }>
}

const AgencyDashboard = () => {
  const { user: authUser } = useAuth()
  const [dashboardData, setDashboardData] = useState<AgencyDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    if (!authUser?.id) return
    
    try {
      setLoading(true)
      setError("")
      
      const response = await api.getAgencyDashboard(authUser.id)
      
      if (response.success) {
        setDashboardData(response.data)
        setLastUpdated(new Date())
      } else {
        setError(response.message || 'Failed to load dashboard data')
        toast.error(response.message || 'Failed to load dashboard data')
      }
    } catch (err: any) {
      console.error('Failed to fetch agency dashboard data:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!authUser?.id) return
    
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  useEffect(() => {
    if (authUser?.id) {
      fetchDashboardData()
    }
  }, [authUser?.id])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'cancelled':
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'in-transit':
        return <Truck className="w-4 h-4 text-blue-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
      case 'active':
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

  const filteredFarmers = dashboardData?.recentFarmers.filter(farmer => {
    const matchesSearch = farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         farmer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         farmer.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || farmer.status === filterStatus
    return matchesSearch && matchesStatus
  }) || []

  const filteredCommissions = dashboardData?.commissionStats.filter(commission => {
    const matchesSearch = commission.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || commission.status === filterStatus
    return matchesSearch && matchesStatus
  }) || []

  const filteredShipments = dashboardData?.shipmentStats.filter(shipment => {
    const matchesSearch = shipment.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.destination.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus
    return matchesSearch && matchesStatus
  }) || []

  if (loading && !dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading agency dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error && !dashboardData) {
    return (
      <DashboardLayout>
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

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No dashboard data available</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { stats, recentFarmers, commissionStats, shipmentStats, recentActivities } = dashboardData

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Agency Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {authUser?.name || 'Agency User'}! Manage your farmer network, track commissions, and oversee logistics.
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
              Add Farmers
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
              change: `${stats.pendingCommissions} pending`,
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
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 
                          activity.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        </div>
                        <Badge variant="secondary">{activity.time}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No recent activities</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Performing Farmers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Farmers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentFarmers.length > 0 ? (
                    recentFarmers
                      .sort((a, b) => b.totalEarnings - a.totalEarnings)
                      .slice(0, 3)
                      .map((farmer, index) => (
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
                          <Badge variant="default">₦{farmer.totalEarnings.toLocaleString()}</Badge>
                        </div>
                      ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No farmers available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="farmers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Farmer Network</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search farmers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredFarmers.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFarmers.map((farmer) => (
                      <div key={farmer._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {farmer.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{farmer.name}</p>
                            <p className="text-sm text-muted-foreground">{farmer.email}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {farmer.location}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(farmer.joinedDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(farmer.status)}>
                            {farmer.status}
                          </Badge>
                          <div className="text-right">
                            <p className="text-sm font-medium">₦{farmer.totalEarnings.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{farmer.totalHarvests} harvests</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No farmers found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Management</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search commissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredCommissions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCommissions.map((commission) => (
                      <div key={commission._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">{commission.farmerName}</p>
                            <p className="text-sm text-muted-foreground">{commission.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(commission.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getCommissionStatusColor(commission.status)}>
                            {commission.status}
                          </Badge>
                          <div className="text-right">
                            <p className="text-lg font-bold">₦{commission.amount.toLocaleString()}</p>
                            {commission.paidAt && (
                              <p className="text-xs text-muted-foreground">
                                Paid: {new Date(commission.paidAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No commissions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logistics Overview</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search shipments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredShipments.length > 0 ? (
                  <div className="space-y-4">
                    {filteredShipments.map((shipment) => (
                      <div key={shipment._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{shipment.farmerName}</p>
                            <p className="text-sm text-muted-foreground">To: {shipment.destination}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(shipment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(shipment.status)}>
                            {shipment.status}
                          </Badge>
                          <div className="text-right">
                            <p className="text-sm font-medium">#{shipment.trackingNumber}</p>
                            {shipment.deliveredAt && (
                              <p className="text-xs text-muted-foreground">
                                Delivered: {new Date(shipment.deliveredAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No shipments found</p>
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

export { AgencyDashboard }