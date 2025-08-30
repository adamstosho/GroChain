"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useReferrals } from "@/hooks/use-referrals"
import { 
  Users, 
  TrendingUp, 
  UserPlus, 
  Target, 
  Download,
  Filter,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react"

export default function ReferralsPage() {
  const {
    referrals,
    stats,
    isLoading,
    isRefreshing,
    refreshData,
    createReferral,
    updateReferral,
    deleteReferral,
    pendingReferrals,
    activeReferrals,
    completedReferrals
  } = useReferrals()

  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredReferrals = referrals.filter(referral => 
    referral.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.farmer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateReferral = () => {
    // TODO: Open create referral modal
    console.log("Create referral")
  }

  const handleExportReferrals = () => {
    // TODO: Implement export functionality
    console.log("Export referrals")
  }

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Referral Management">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Referral Management</h1>
              <p className="text-muted-foreground">Manage farmer referrals and track performance</p>
            </div>
          </div>
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
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Referral Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Referral Management</h1>
            <p className="text-muted-foreground">Manage farmer referrals and track performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportReferrals}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleCreateReferral}>
              <Plus className="w-4 h-4 mr-2" />
              Add Referral
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeReferrals || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Success rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats?.monthlyGrowth || 0}</div>
              <p className="text-xs text-muted-foreground">
                New referrals this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
            <CardDescription>Find specific referrals or filter by criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by farmer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Details</CardTitle>
            <CardDescription>View and manage your farmer referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-4">
                  {filteredReferrals.slice(0, 10).map((referral) => (
                    <div key={referral._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{referral.farmer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {referral.farmer.email} • {referral.farmer.phone}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Referred on {new Date(referral.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Commission Rate: {(referral.commissionRate * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {referral.notes}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                            {referral.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredReferrals.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No referrals found</p>
                      <p className="text-sm text-muted-foreground">Start by adding your first farmer referral</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <div className="space-y-4">
                  {pendingReferrals.map((referral) => (
                    <div key={referral._id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <Target className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">{referral.farmer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {referral.farmer.email} • {referral.farmer.phone}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Pending since {new Date(referral.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm">
                          Activate
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {pendingReferrals.length === 0 && (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending referrals</p>
                      <p className="text-sm text-muted-foreground">All your referrals are active or completed</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                <div className="space-y-4">
                  {activeReferrals.map((referral) => (
                    <div key={referral._id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{referral.farmer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {referral.farmer.email} • {referral.farmer.phone}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Active since {new Date(referral.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Commission Rate: {(referral.commissionRate * 100).toFixed(1)}%
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {activeReferrals.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No active referrals</p>
                      <p className="text-sm text-muted-foreground">Activate pending referrals to see them here</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <div className="space-y-4">
                  {completedReferrals.map((referral) => (
                    <div key={referral._id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{referral.farmer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {referral.farmer.email} • {referral.farmer.phone}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Completed on {new Date(referral.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Commission Rate: {(referral.commissionRate * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Commission: ₦{referral.commission?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {completedReferrals.length === 0 && (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No completed referrals</p>
                      <p className="text-sm text-muted-foreground">Complete active referrals to see them here</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Track your referral performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Referral Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Referrals</span>
                    <span className="font-medium">{stats?.totalReferrals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <span className="font-medium text-yellow-600">{stats?.pendingReferrals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-medium text-blue-600">{stats?.activeReferrals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="font-medium text-green-600">{stats?.completedReferrals || 0}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Conversion Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium">{stats?.conversionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Growth</span>
                    <span className="font-medium text-green-600">+{stats?.monthlyGrowth || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Commission</span>
                    <span className="font-medium">₦{stats?.averageCommission?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
