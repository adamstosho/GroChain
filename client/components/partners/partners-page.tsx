"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Users, UserPlus, Search, Filter, Eye, MapPin, Calendar, TrendingUp, Upload } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"

interface Partner {
  id: string
  name: string
  email: string
  phone: string
  location: string
  joinDate: string
  status: "active" | "pending" | "inactive"
  productsCount: number
  totalSales: number
  commission: number
  lastActive: string
}

const mockPartners: Partner[] = [
  {
    id: "1",
    name: "Adunni Adebayo",
    email: "adunni@example.com",
    phone: "+234 801 234 5678",
    location: "Lagos State",
    joinDate: "2025-01-15",
    status: "active",
    productsCount: 8,
    totalSales: 125000,
    commission: 6250,
    lastActive: "2025-01-16T10:30:00Z",
  },
  {
    id: "2",
    name: "Ibrahim Musa",
    email: "ibrahim@example.com",
    phone: "+234 802 345 6789",
    location: "Kano State",
    joinDate: "2025-01-12",
    status: "pending",
    productsCount: 0,
    totalSales: 0,
    commission: 0,
    lastActive: "2025-01-12T14:20:00Z",
  },
  {
    id: "3",
    name: "Grace Okafor",
    email: "grace@example.com",
    phone: "+234 803 456 7890",
    location: "Ogun State",
    joinDate: "2025-01-10",
    status: "active",
    productsCount: 12,
    totalSales: 180000,
    commission: 9000,
    lastActive: "2025-01-16T08:45:00Z",
  },
  {
    id: "4",
    name: "Chinedu Okwu",
    email: "chinedu@example.com",
    phone: "+234 804 567 8901",
    location: "Anambra State",
    joinDate: "2025-01-08",
    status: "inactive",
    productsCount: 5,
    totalSales: 45000,
    commission: 2250,
    lastActive: "2025-01-14T16:15:00Z",
  },
]

const mockStats = {
  totalPartners: 156,
  activePartners: 142,
  pendingPartners: 8,
  totalCommission: 45000,
}

export function PartnersPage() {
  const { user } = useAuth()

  const [partners, setPartners] = useState<Partner[]>(mockPartners)
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>(mockPartners)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("partners")

  useEffect(() => {
    let filtered = partners

    if (searchTerm) {
      filtered = filtered.filter(
        (partner) =>
          partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          partner.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((partner) => partner.status === statusFilter)
    }

    setFilteredPartners(filtered)
  }, [partners, searchTerm, statusFilter])

  const getStatusBadge = (status: Partner["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Partner Management</h1>
            <p className="text-muted-foreground">Manage your farmer network and track performance</p>
          </div>
          <div className="flex gap-2">
            <Link href="/partners/bulk">
              <Button variant="outline" size="lg" className="bg-transparent">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </Link>
            <Link href="/partners/onboard">
              <Button size="lg">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-6">
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
                        <p className="text-sm font-medium text-muted-foreground">Total Partners</p>
                        <p className="text-2xl font-bold text-foreground">{mockStats.totalPartners}</p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
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
                        <p className="text-sm font-medium text-muted-foreground">Active Partners</p>
                        <p className="text-2xl font-bold text-foreground">{mockStats.activePartners}</p>
                      </div>
                      <UserPlus className="w-8 h-8 text-success" />
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
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-foreground">{mockStats.pendingPartners}</p>
                      </div>
                      <Users className="w-8 h-8 text-warning" />
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
                        <p className="text-sm font-medium text-muted-foreground">Total Commission</p>
                        <p className="text-2xl font-bold text-foreground">
                          ₦{mockStats.totalCommission.toLocaleString()}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search partners by name, email, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Partners List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  Partners ({filteredPartners.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPartners.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No partners found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Start by onboarding your first partner"}
                    </p>
                    <Link href="/partners/onboard">
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Partner
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPartners.map((partner, index) => (
                      <motion.div
                        key={partner.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{partner.name}</h4>
                            <p className="text-sm text-muted-foreground">{partner.email}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {partner.location}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(partner.joinDate).toLocaleDateString()}
                              </span>
                              <span>{partner.productsCount} products</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-medium text-foreground">₦{partner.commission.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              ₦{partner.totalSales.toLocaleString()} sales
                            </p>
                            {getStatusBadge(partner.status)}
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Partner Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed analytics and performance metrics will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
