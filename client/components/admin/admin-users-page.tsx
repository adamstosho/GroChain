"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  UserCheck,
  UserX,
  MoreHorizontal,
  Download,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: 'farmer' | 'buyer' | 'partner' | 'aggregator' | 'agency' | 'admin'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  phoneNumber?: string
  location?: string
  createdAt: string
  lastLogin?: string
  isVerified: boolean
  profileComplete: boolean
}

export function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError("")
      
      // For now, use mock data since the backend doesn't have admin users endpoint yet
      const mockUsers: User[] = [
        {
          _id: "1",
          email: "farmer@example.com",
          firstName: "Adunni",
          lastName: "Oke",
          role: "farmer",
          status: "active",
          phoneNumber: "+2348012345678",
          location: "Lagos",
          createdAt: "2025-01-15T10:00:00Z",
          lastLogin: "2025-01-22T15:30:00Z",
          isVerified: true,
          profileComplete: true
        },
        {
          _id: "2",
          email: "buyer@example.com",
          firstName: "Ibrahim",
          lastName: "Bello",
          role: "buyer",
          status: "active",
          phoneNumber: "+2348098765432",
          location: "Kano",
          createdAt: "2025-01-10T10:00:00Z",
          lastLogin: "2025-01-22T14:20:00Z",
          isVerified: true,
          profileComplete: true
        },
        {
          _id: "3",
          email: "partner@example.com",
          firstName: "Kemi",
          lastName: "Adebayo",
          role: "partner",
          status: "active",
          phoneNumber: "+2348055555555",
          location: "Kebbi",
          createdAt: "2025-01-08T10:00:00Z",
          lastLogin: "2025-01-22T12:45:00Z",
          isVerified: true,
          profileComplete: true
        },
        {
          _id: "4",
          email: "newfarmer@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "farmer",
          status: "pending",
          phoneNumber: "+2348066666666",
          location: "Abuja",
          createdAt: "2025-01-22T09:00:00Z",
          lastLogin: undefined,
          isVerified: false,
          profileComplete: false
        },
        {
          _id: "5",
          email: "suspended@example.com",
          firstName: "Jane",
          lastName: "Smith",
          role: "buyer",
          status: "suspended",
          phoneNumber: "+2348077777777",
          location: "Port Harcourt",
          createdAt: "2025-01-05T10:00:00Z",
          lastLogin: "2025-01-20T10:00:00Z",
          isVerified: true,
          profileComplete: true
        }
      ]
      
      setUsers(mockUsers)
    } catch (err) {
      console.error("Failed to fetch users:", err)
      setError("Failed to load users")
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, newStatus: User['status']) => {
    try {
      // TODO: Implement API call to update user status
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ))
      toast.success(`User status updated to ${newStatus}`)
    } catch (err) {
      console.error("Failed to update user status:", err)
      toast.error("Failed to update user status")
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      // TODO: Implement API call to delete user
      setUsers(prev => prev.filter(user => user._id !== userId))
      toast.success("User deleted successfully")
    } catch (err) {
      console.error("Failed to delete user:", err)
      toast.error("Failed to delete user")
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'partner':
        return 'bg-blue-100 text-blue-800'
      case 'aggregator':
        return 'bg-purple-100 text-purple-800'
      case 'agency':
        return 'bg-indigo-100 text-indigo-800'
      case 'farmer':
        return 'bg-green-100 text-green-800'
      case 'buyer':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.location?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleDisplayName = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  const getStatusDisplayName = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load users</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchUsers}>Try Again</Button>
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
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              {users.length} total users • Manage roles, permissions, and user status
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Users
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">Total Users</span>
              </div>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Active Users</span>
              </div>
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-muted-foreground">Pending</span>
              </div>
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <UserX className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-muted-foreground">Suspended</span>
              </div>
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'suspended').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="farmer">Farmers</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                  <SelectItem value="partner">Partners</SelectItem>
                  <SelectItem value="aggregator">Aggregators</SelectItem>
                  <SelectItem value="agency">Agencies</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                        <Badge className={getStatusColor(user.status)}>
                          {getStatusDisplayName(user.status)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">
                        {user.firstName} {user.lastName}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user._id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user._id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'active' && (
                          <DropdownMenuItem 
                            onClick={() => updateUserStatus(user._id, 'suspended')}
                            className="text-red-600"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        )}
                        {user.status === 'suspended' && (
                          <DropdownMenuItem 
                            onClick={() => updateUserStatus(user._id, 'active')}
                            className="text-green-600"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                        {user.status === 'pending' && (
                          <DropdownMenuItem 
                            onClick={() => updateUserStatus(user._id, 'active')}
                            className="text-green-600"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Approve User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deleteUser(user._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{user.email}</span>
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{user.phoneNumber}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      {user.isVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.lastLogin ? (
                        `Last: ${new Date(user.lastLogin).toLocaleDateString()}`
                      ) : (
                        'Never logged in'
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || filterRole !== "all" || filterStatus !== "all" 
                  ? "No users match your criteria" 
                  : "No users found"
                }
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || filterRole !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start by adding your first user"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
