"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  User,
  Building,
  ShoppingCart,
  Download,
  Upload,
  RefreshCw,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban
} from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  role: 'farmer' | 'buyer' | 'partner' | 'admin'
  status: 'active' | 'suspended' | 'pending' | 'verified'
  emailVerified: boolean
  phone?: string
  location?: string
  createdAt: string
  lastLogin?: string
  totalHarvests?: number
  totalOrders?: number
  totalRevenue?: number
}

interface UserFilters {
  search: string
  role: 'all' | 'farmer' | 'buyer' | 'partner' | 'admin'
  status: 'all' | 'active' | 'suspended' | 'pending' | 'verified'
  emailVerified: 'all' | 'verified' | 'unverified'
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year'
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    emailVerified: 'all',
    dateRange: 'all'
  })
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(20)
  const [activeTab, setActiveTab] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual API call
      const mockUsers: User[] = [
        {
          _id: '1',
          name: 'John Farmer',
          email: 'john@example.com',
          role: 'farmer',
          status: 'active',
          emailVerified: true,
          phone: '+2348012345678',
          location: 'Lagos, Nigeria',
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: '2024-01-20T14:20:00Z',
          totalHarvests: 12,
          totalRevenue: 150000
        },
        {
          _id: '2',
          name: 'Jane Buyer',
          email: 'jane@example.com',
          role: 'buyer',
          status: 'active',
          emailVerified: true,
          phone: '+2348098765432',
          location: 'Abuja, Nigeria',
          createdAt: '2024-01-10T09:15:00Z',
          lastLogin: '2024-01-20T16:45:00Z',
          totalOrders: 8,
          totalRevenue: 250000
        },
        {
          _id: '3',
          name: 'Mike Partner',
          email: 'mike@example.com',
          role: 'partner',
          status: 'pending',
          emailVerified: false,
          phone: '+2348055555555',
          location: 'Kano, Nigeria',
          createdAt: '2024-01-18T11:00:00Z',
          totalHarvests: 0,
          totalRevenue: 0
        },
        {
          _id: '4',
          name: 'Sarah Admin',
          email: 'sarah@example.com',
          role: 'admin',
          status: 'active',
          emailVerified: true,
          phone: '+2348077777777',
          location: 'Port Harcourt, Nigeria',
          createdAt: '2024-01-01T08:00:00Z',
          lastLogin: '2024-01-20T10:30:00Z'
        }
      ]
      
      setUsers(mockUsers)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.location?.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Role filter
    if (filters.role && filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role)
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status)
    }

    // Email verification filter
    if (filters.emailVerified && filters.emailVerified !== 'all') {
      filtered = filtered.filter(user => 
        filters.emailVerified === 'verified' ? user.emailVerified : !user.emailVerified
      )
    }

    // Tab filter
    if (activeTab === 'farmers') {
      filtered = filtered.filter(user => user.role === 'farmer')
    } else if (activeTab === 'buyers') {
      filtered = filtered.filter(user => user.role === 'buyer')
    } else if (activeTab === 'partners') {
      filtered = filtered.filter(user => user.role === 'partner')
    } else if (activeTab === 'admins') {
      filtered = filtered.filter(user => user.role === 'admin')
    }

    setFilteredUsers(filtered)
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select users to perform bulk actions.",
        variant: "destructive"
      })
      return
    }

    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let message = ''
      switch (action) {
        case 'activate':
          message = `${selectedUsers.length} users activated successfully`
          break
        case 'suspend':
          message = `${selectedUsers.length} users suspended successfully`
          break
        case 'delete':
          message = `${selectedUsers.length} users deleted successfully`
          break
      }

      toast({
        title: "Success",
        description: message,
        variant: "default"
      })

      setSelectedUsers([])
      fetchUsers() // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let message = ''
      switch (action) {
        case 'activate':
          message = 'User activated successfully'
          break
        case 'suspend':
          message = 'User suspended successfully'
          break
        case 'delete':
          message = 'User deleted successfully'
          break
      }

      toast({
        title: "Success",
        description: message,
        variant: "default"
      })

      fetchUsers() // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform action. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'farmer':
        return <User className="h-4 w-4 text-green-600" />
      case 'buyer':
        return <ShoppingCart className="h-4 w-4 text-blue-600" />
      case 'partner':
        return <Building className="h-4 w-4 text-purple-600" />
      case 'admin':
        return <Shield className="h-4 w-4 text-red-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800"><Ban className="h-3 w-3 mr-1" />Suspended</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'verified':
        return <Badge className="bg-blue-100 text-blue-800"><UserCheck className="h-3 w-3 mr-1" />Verified</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      farmer: 'bg-green-100 text-green-800',
      buyer: 'bg-blue-100 text-blue-800',
      partner: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    }
    return <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{role}</Badge>
  }

  if (loading) {
    return (
      <DashboardLayout pageTitle="Users Management">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Users Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900">Users Management</h1>
            <p className="text-gray-600">Manage all platform users, roles, and permissions</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-600 mt-1">All platform users</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Currently active</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Awaiting approval</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Suspended Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'suspended').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Account suspended</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
            <CardDescription>Find specific users using filters and search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="farmer">Farmers</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                  <SelectItem value="partner">Partners</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.emailVerified} onValueChange={(value) => setFilters({ ...filters, emailVerified: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Email Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} user(s) selected
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('suspend')}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Suspend All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="farmers">Farmers</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Users List */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <Checkbox
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUsers(filteredUsers.map(u => u._id))
                              } else {
                                setSelectedUsers([])
                              }
                            }}
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Checkbox
                              checked={selectedUsers.includes(user._id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUsers([...selectedUsers, user._id])
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user._id))
                                }
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                {getRoleIcon(user.role)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                {user.phone && (
                                  <div className="text-xs text-gray-400">{user.phone}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.location || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user.status === 'active' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUserAction(user._id, 'suspend')}
                                  className="text-yellow-600 hover:text-yellow-700"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUserAction(user._id, 'activate')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUserAction(user._id, 'delete')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search criteria.
                    </p>
                    <Button variant="outline" onClick={() => setFilters({
                      search: '',
                      role: 'all',
                      status: 'all',
                      emailVerified: 'all',
                      dateRange: 'all'
                    })}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
