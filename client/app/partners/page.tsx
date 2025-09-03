"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Upload, Plus, Search, Download, TrendingUp, DollarSign, CheckCircle, Clock } from "lucide-react"
import { api } from "@/lib/api"
import Link from "next/link"

interface PartnerStats {
  totalFarmers: number
  activeFarmers: number
  pendingApprovals: number
  monthlyCommission: number
  totalCommission: number
  approvalRate: number
}

interface Farmer {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  status: "active" | "inactive" | "pending"
  joinedDate: string
  totalHarvests: number
  totalSales: number
}

export default function PartnersPage() {
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchPartnerData()
  }, [])

  const fetchPartnerData = async () => {
    try {
      setLoading(true)
      const [statsResponse, farmersResponse] = await Promise.all([
        api.request("/api/partners/metrics"),
        api.request("/api/partners/farmers"),
      ])
      setStats(statsResponse.data)
      setFarmers(farmersResponse.data)
    } catch (error) {
      console.error("Failed to fetch partner data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFarmers = farmers.filter((farmer) => {
    const matchesSearch =
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || farmer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
          <p className="text-gray-600">Manage your farmer network and track performance</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/partners/bulk-onboard">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Link>
          </Button>
          <Button asChild>
            <Link href="/partners/onboard-farmer">
              <Plus className="h-4 w-4 mr-2" />
              Add Farmer
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFarmers}</div>
              <p className="text-xs text-muted-foreground">{stats.activeFarmers} active farmers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">{stats.approvalRate}% approval rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.monthlyCommission.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">₦{stats.totalCommission.toLocaleString()} total earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvalRate}%</div>
              <p className="text-xs text-muted-foreground">Approval rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="farmers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="farmers">Farmers</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="farmers" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Farmers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Farmers ({filteredFarmers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Contact</th>
                      <th className="text-left py-3 px-4">Location</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Harvests</th>
                      <th className="text-left py-3 px-4">Sales</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFarmers.map((farmer) => (
                      <tr key={farmer._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{farmer.name}</p>
                            <p className="text-sm text-gray-500">
                              Joined {new Date(farmer.joinedDate).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm">{farmer.email}</p>
                            <p className="text-sm text-gray-500">{farmer.phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{typeof farmer.location === 'string' ? farmer.location : `${farmer.location?.city || 'Unknown'}, ${farmer.location?.state || 'Unknown State'}`}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              farmer.status === "active"
                                ? "default"
                                : farmer.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {farmer.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{farmer.totalHarvests}</td>
                        <td className="py-3 px-4">₦{farmer.totalSales.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/partners/farmers/${farmer._id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Harvest Approvals</CardTitle>
              <CardDescription>Review and approve farmer harvests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending approvals at the moment</p>
                <Button asChild className="mt-4">
                  <Link href="/harvests">View All Harvests</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Commission analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
