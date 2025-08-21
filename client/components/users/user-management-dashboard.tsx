"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Shield, 
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  CreditCard,
  Truck,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Download,
  Upload,
  RefreshCw,
  Plus,
  User,
  Crown,
  Star,
  TrendingUp,
  Activity
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  middleName?: string
  phoneNumber: string
  role: 'admin' | 'partner' | 'farmer' | 'buyer' | 'logistics' | 'fintech'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  verificationStatus: 'verified' | 'unverified' | 'pending' | 'rejected'
  bvnVerified: boolean
  kycCompleted: boolean
  profileComplete: boolean
  createdAt: string
  lastLogin?: string
  location: {
    state: string
    lga: string
    coordinates?: [number, number]
  }
  businessInfo?: {
    businessName: string
    businessType: string
    registrationNumber?: string
    taxId?: string
  }
  preferences: {
    language: string
    notifications: boolean
    marketing: boolean
    twoFactor: boolean
  }
  stats: {
    totalTransactions: number
    totalAmount: number
    harvestCount: number
    orderCount: number
    rating: number
  }
  documents: {
    id: string
    type: string
    status: string
    uploadedAt: string
  }[]
}

interface UserStats {
  total: number
  active: number
  inactive: number
  suspended: number
  pending: number
  byRole: Record<string, number>
  byVerification: Record<string, number>
  byLocation: Record<string, number>
  recentRegistrations: number
  pendingVerifications: number
}

interface UserFilters {
  search: string
  role: string
  status: string
  verificationStatus: string
  location: string
  dateRange: string
}

export function UserManagementDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    pending: 0,
    byRole: {},
    byVerification: {},
    byLocation: {},
    recentRegistrations: 0,
    pendingVerifications: 0
  })
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: "all",
    status: "all",
    verificationStatus: "all",
    location: "all",
    dateRange: "all"
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  useEffect(() => {
    filterUsers()
  }, [users, filters])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError("")

      // Since backend has limited user management endpoints, we'll use mock data for now
      // In production: const response = await api.getUsers()
      
      const mockUsers = generateMockUsers()
      setUsers(mockUsers)
      calculateUserStats(mockUsers)
    } catch (error) {
      console.error("User fetch error:", error)
      setError("Failed to load users")
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const generateMockUsers = (): User[] => {
    const roles: User['role'][] = ['admin', 'partner', 'farmer', 'buyer', 'logistics', 'fintech']
    const statuses: User['status'][] = ['active', 'inactive', 'suspended', 'pending']
    const verificationStatuses: User['verificationStatus'][] = ['verified', 'unverified', 'pending', 'rejected']
    const states = ['Lagos', 'Kano', 'Kaduna', 'Katsina', 'Oyo', 'Rivers', 'Bauchi', 'Jigawa', 'Anambra', 'Kebbi']
    const lgas = ['Ikeja', 'Victoria Island', 'Surulere', 'Alimosho', 'Oshodi', 'Mushin', 'Ikorodu', 'Epe', 'Badagry', 'Ojo']
    
    const businessTypes = ['Individual', 'SME', 'Corporation', 'Cooperative', 'Partnership']
    
    return Array.from({ length: 50 }, (_, index) => {
      const role = roles[Math.floor(Math.random() * roles.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const verificationStatus = verificationStatuses[Math.floor(Math.random() * verificationStatuses.length)]
      const state = states[Math.floor(Math.random() * states.length)]
      const lga = lgas[Math.floor(Math.random() * lgas.length)]
      const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)]
      
      const createdDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      const lastLogin = Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined
      
      return {
        id: `user_${String(index + 1).padStart(3, '0')}`,
        email: `user${index + 1}@example.com`,
        firstName: `User${index + 1}`,
        lastName: `Last${index + 1}`,
        middleName: Math.random() > 0.5 ? `Middle${index + 1}` : undefined,
        phoneNumber: `+234${Math.floor(Math.random() * 900000000) + 100000000}`,
        role,
        status,
        verificationStatus,
        bvnVerified: Math.random() > 0.3,
        kycCompleted: Math.random() > 0.4,
        profileComplete: Math.random() > 0.6,
        createdAt: createdDate.toISOString(),
        lastLogin: lastLogin?.toISOString(),
        location: {
          state,
          lga,
          coordinates: Math.random() > 0.7 ? [Math.random() * 180 - 90, Math.random() * 360 - 180] : undefined
        },
        businessInfo: Math.random() > 0.3 ? {
          businessName: `Business ${index + 1}`,
          businessType,
          registrationNumber: Math.random() > 0.5 ? `REG${Math.floor(Math.random() * 1000000)}` : undefined,
          taxId: Math.random() > 0.6 ? `TAX${Math.floor(Math.random() * 1000000)}` : undefined
        } : undefined,
        preferences: {
          language: Math.random() > 0.5 ? 'en' : 'ha',
          notifications: Math.random() > 0.2,
          marketing: Math.random() > 0.6,
          twoFactor: Math.random() > 0.7
        },
        stats: {
          totalTransactions: Math.floor(Math.random() * 1000),
          totalAmount: Math.floor(Math.random() * 10000000),
          harvestCount: Math.floor(Math.random() * 50),
          orderCount: Math.floor(Math.random() * 200),
          rating: Math.random() * 5
        },
        documents: Array.from({ length: Math.floor(Math.random() * 5) }, (_, docIndex) => ({
          id: `doc_${index}_${docIndex}`,
          type: ['national_id', 'passport', 'driver_license', 'utility_bill', 'bank_statement'][Math.floor(Math.random() * 5)],
          status: ['approved', 'pending', 'rejected'][Math.floor(Math.random() * 3)],
          uploadedAt: new Date(createdDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }))
      }
    })
  }

  const calculateUserStats = (userList: User[]) => {
    const stats: UserStats = {
      total: userList.length,
      active: userList.filter(u => u.status === 'active').length,
      inactive: userList.filter(u => u.status === 'inactive').length,
      suspended: userList.filter(u => u.status === 'suspended').length,
      pending: userList.filter(u => u.status === 'pending').length,
      byRole: {},
      byVerification: {},
      byLocation: {},
      recentRegistrations: 0,
      pendingVerifications: 0
    }

    // Calculate by role
    userList.forEach(user => {
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1
      stats.byVerification[user.verificationStatus] = (stats.byVerification[user.verificationStatus] || 0) + 1
      stats.byLocation[user.location.state] = (stats.byLocation[user.location.state] || 0) + 1
    })

    // Calculate recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    stats.recentRegistrations = userList.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length

    // Calculate pending verifications
    stats.pendingVerifications = userList.filter(u => u.verificationStatus === 'pending').length

    setUserStats(stats)
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by search term
    if (filters.search) {
      filtered = filtered.filter(u => 
        u.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.phoneNumber.includes(filters.search)
      )
    }

    // Filter by role
    if (filters.role !== "all") {
      filtered = filtered.filter(u => u.role === filters.role)
    }

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(u => u.status === filters.status)
    }

    // Filter by verification status
    if (filters.verificationStatus !== "all") {
      filtered = filtered.filter(u => u.verificationStatus === filters.verificationStatus)
    }

    // Filter by location
    if (filters.location !== "all") {
      filtered = filtered.filter(u => u.location.state === filters.location)
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      const now = new Date()
      let cutoffDate: Date
      
      switch (filters.dateRange) {
        case "today":
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "quarter":
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          cutoffDate = new Date(0)
      }
      
      filtered = filtered.filter(u => new Date(u.createdAt) >= cutoffDate)
    }

    setFilteredUsers(filtered)
  }

  const updateUserStatus = async (userId: string, newStatus: User['status']) => {
    try {
      // In production: await api.updateUserStatus(userId, newStatus)
      
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, status: newStatus } : u)
      )
      
      toast.success(`User status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error("Failed to update user status")
    }
  }

  const updateUserRole = async (userId: string, newRole: User['role']) => {
    try {
      // In production: await api.updateUserRole(userId, newRole)
      
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      )
      
      toast.success(`User role updated to ${newRole}`)
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      // In production: await api.deleteUser(userId)
      
      setUsers(prev => prev.filter(u => u.id !== userId))
      
      toast.success("User deleted successfully")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "partner":
        return <Building className="h-4 w-4 text-blue-500" />
      case "farmer":
        return <Package className="h-4 w-4 text-green-500" />
      case "buyer":
        return <CreditCard className="h-4 w-4 text-purple-500" />
      case "logistics":
        return <Truck className="h-4 w-4 text-orange-500" />
      case "fintech":
        return <TrendingUp className="h-4 w-4 text-indigo-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getVerificationBadge = (status: User['verificationStatus']) => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-500">Verified</Badge>
      case "unverified":
        return <Badge variant="secondary">Unverified</Badge>
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const exportUsers = () => {
    // In production: Implement CSV/Excel export
    toast.success("User data export started")
  }

  const importUsers = () => {
    // In production: Implement CSV/Excel import
    toast.info("User import feature coming soon")
  }

  if (!user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Users className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading user management dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold">User Management & Profiles</h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, permissions, and profile information
            </p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={importUsers} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Users
            </Button>
            <Button onClick={exportUsers} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
            <Button onClick={fetchUserData} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* User Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total}</div>
              <p className="text-xs text-muted-foreground">
                All registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{userStats.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently active accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{userStats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting KYC approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Registrations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{userStats.recentRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">All Users</TabsTrigger>
              <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Users by Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(userStats.byRole).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(role as User['role'])}
                            <span className="capitalize">{role}</span>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Verification Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(userStats.byVerification).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="capitalize">{status}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Location Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Users by Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(userStats.byLocation)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 10)
                        .map(([state, count]) => (
                        <div key={state} className="flex items-center justify-between">
                          <span>{state}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {users
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((user) => (
                        <div key={user.id} className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(user.status)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <UserList 
                users={filteredUsers}
                loading={loading}
                filters={filters}
                setFilters={setFilters}
                onUpdateStatus={updateUserStatus}
                onUpdateRole={updateUserRole}
                onDelete={deleteUser}
                onViewUser={(user) => {
                  setSelectedUser(user)
                  setShowUserModal(true)
                }}
              />
            </TabsContent>

            <TabsContent value="roles" className="space-y-4">
              <RolesAndPermissions />
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              <VerificationManagement users={users} onUpdateStatus={updateUserStatus} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <UserAnalytics users={users} stats={userStats} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <UserManagementSettings />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

interface UserListProps {
  users: User[]
  loading: boolean
  filters: UserFilters
  setFilters: (filters: UserFilters) => void
  onUpdateStatus: (userId: string, status: User['status']) => void
  onUpdateRole: (userId: string, role: User['role']) => void
  onDelete: (userId: string) => void
  onViewUser: (user: User) => void
}

function UserList({
  users,
  loading,
  filters,
  setFilters,
  onUpdateStatus,
  onUpdateRole,
  onDelete,
  onViewUser
}: UserListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full"
            />
          </div>
          <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="farmer">Farmer</SelectItem>
              <SelectItem value="buyer">Buyer</SelectItem>
              <SelectItem value="logistics">Logistics</SelectItem>
              <SelectItem value="fintech">Fintech</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.verificationStatus} onValueChange={(value) => setFilters({ ...filters, verificationStatus: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verification</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(user.status)}
                    {getVerificationBadge(user.verificationStatus)}
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(user.role)}
                      <span className="text-xs text-muted-foreground capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{user.phoneNumber}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{user.location.state}, {user.location.lga}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewUser(user)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Select value={user.status} onValueChange={(value) => onUpdateStatus(user.id, value as User['status'])}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={user.role} onValueChange={(value) => onUpdateRole(user.id, value as User['role'])}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="fintech">Fintech</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RolesAndPermissions() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-medium">Admin</h3>
                <p className="text-sm text-muted-foreground">
                  Full system access, user management, system configuration
                </p>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm">All permissions</span>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium">Partner</h3>
                <p className="text-sm text-muted-foreground">
                  Organization management, farmer onboarding, analytics access
                </p>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Limited admin access</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function VerificationManagement({ users, onUpdateStatus }: { users: User[], onUpdateStatus: (userId: string, status: User['status']) => void }) {
  const pendingUsers = users.filter(u => u.verificationStatus === 'pending')
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingUsers.length === 0 ? (
              <p className="text-muted-foreground">No pending verifications</p>
            ) : (
              pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => onUpdateStatus(user.id, 'active')}>
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(user.id, 'suspended')}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UserAnalytics({ users, stats }: { users: User[], stats: UserStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Total Users</span>
                <span className="font-bold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Users</span>
                <span className="font-bold text-green-600">{stats.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Verification Rate</span>
                <span className="font-bold text-blue-600">
                  {Math.round((stats.byVerification.verified / stats.total) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="capitalize">{role}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UserManagementSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-approval">Auto-approve new registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve new user registrations
                </p>
              </div>
              <Switch id="auto-approval" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-verification">Require email verification</Label>
                <p className="text-sm text-muted-foreground">
                  Users must verify their email before accessing the system
                </p>
              </div>
              <Switch id="email-verification" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor">Require two-factor authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Enforce 2FA for all users
                </p>
              </div>
              <Switch id="two-factor" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
