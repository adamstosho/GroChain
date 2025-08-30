"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useFarmers } from "@/hooks/use-farmers"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Upload
} from "lucide-react"
import Link from "next/link"

interface Farmer {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  status: 'active' | 'inactive' | 'suspended'
  joinedAt: Date
  lastActivity: Date
  totalHarvests: number
  totalEarnings: number
  partner: string
}

export default function FarmersPage() {
  const {
    farmers,
    filteredFarmers,
    isLoading,
    filters,
    pagination,
    updateFilters,
    addFarmer,
    updateFarmer,
    deleteFarmer,
    refreshData,
    activeFarmers,
    inactiveFarmers,
    suspendedFarmers,
    totalFarmers,
    totalActiveFarmers
  } = useFarmers()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const { toast } = useToast()

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage)

  useEffect(() => {
    // Update filters when local state changes
    updateFilters({
      searchTerm: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      location: locationFilter !== 'all' ? locationFilter : undefined
    })
  }, [searchTerm, statusFilter, locationFilter, updateFilters])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, locationFilter])

  // Functions now handled by the useFarmers hook

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case "inactive":
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Inactive</Badge>
      case "suspended":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Suspended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaginatedFarmers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredFarmers.slice(startIndex, endIndex)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Farmers Management">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Farmers Management</h1>
              <p className="text-muted-foreground">Manage your partner farmers</p>
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
    <DashboardLayout pageTitle="Farmers Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Farmers Management</h1>
            <p className="text-muted-foreground">Manage your partner farmers and track their performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button asChild>
              <Link href="/dashboard/farmers/bulk">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/farmers/add">
                <Plus className="w-4 h-4 mr-2" />
                Add Farmer
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFarmers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActiveFarmers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Harvests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farmers.reduce((sum, f) => sum + f.totalHarvests, 0)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{farmers.reduce((sum, f) => sum + f.totalEarnings, 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+22%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
            <CardDescription>Find specific farmers or filter by criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Abuja">Abuja</SelectItem>
                  <SelectItem value="Kano">Kano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Farmers List */}
        <Card>
          <CardHeader>
            <CardTitle>Farmers List</CardTitle>
            <CardDescription>
              Showing {getPaginatedFarmers().length} of {filteredFarmers.length} farmers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPaginatedFarmers().map((farmer) => (
                <div key={farmer._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${farmer.name}`} />
                      <AvatarFallback>{farmer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{farmer.name}</p>
                        {getStatusBadge(farmer.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{farmer.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{farmer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{farmer.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Joined: {new Date(farmer.joinedAt).toLocaleDateString()}</span>
                        <span>Harvests: {farmer.totalHarvests}</span>
                        <span>Earnings: ₦{farmer.totalEarnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/farmers/${farmer._id}`}>View Details</Link>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Farmer Actions</DialogTitle>
                          <DialogDescription>Choose an action for {farmer.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Message
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            View Performance
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Training
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
              
              {getPaginatedFarmers().length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No farmers found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
