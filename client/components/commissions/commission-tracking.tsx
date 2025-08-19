"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  Loader2,
  RefreshCw,
  BarChart3,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingDown
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Commission {
  _id: string
  partner: {
    _id: string
    name: string
    email: string
    phone: string
  }
  farmer: {
    _id: string
    name: string
    location: string
  }
  harvest: {
    _id: string
    cropType: string
    quantity: number
    unit: string
    totalValue: number
  }
  commissionAmount: number
  commissionRate: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  paymentMethod: 'bank_transfer' | 'mobile_money' | 'cash'
  paymentReference?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
  notes?: string
}

interface CommissionStats {
  totalCommissions: number
  totalEarnings: number
  pendingCommissions: number
  paidCommissions: number
  monthlyEarnings: number
  totalFarmers: number
  activeFarmers: number
  conversionRate: number
}

interface Filters {
  search: string
  status: string
  dateRange: string
  partner: string
  sortBy: string
}

const commissionStatuses = [
  "All",
  "Pending",
  "Approved",
  "Paid",
  "Rejected"
]

const dateRanges = [
  "All",
  "Today",
  "Last 7 days",
  "Last 30 days",
  "Last 3 months",
  "Last year"
]

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount_high", label: "Amount: High to Low" },
  { value: "amount_low", label: "Amount: Low to High" },
  { value: "status", label: "By Status" }
]

export function CommissionTracking() {
  const { user } = useAuth()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [stats, setStats] = useState<CommissionStats>({
    totalCommissions: 0,
    totalEarnings: 0,
    pendingCommissions: 0,
    paidCommissions: 0,
    monthlyEarnings: 0,
    totalFarmers: 0,
    activeFarmers: 0,
    conversionRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "All",
    dateRange: "All",
    partner: "",
    sortBy: "newest"
  })
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchCommissions()
    fetchStats()
  }, [filters, page])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      setError("")

      const params: any = {
        page,
        limit: 20
      }

      if (filters.search) params.search = filters.search
      if (filters.status !== "All") params.status = filters.status.toLowerCase()
      if (filters.sortBy) params.sortBy = filters.sortBy

      // Determine date range
      if (filters.dateRange !== "All") {
        const now = new Date()
        let startDate = new Date()
        
        switch (filters.dateRange) {
          case "Today":
            startDate.setHours(0, 0, 0, 0)
            break
          case "Last 7 days":
            startDate.setDate(now.getDate() - 7)
            break
          case "Last 30 days":
            startDate.setDate(now.getDate() - 30)
            break
          case "Last 3 months":
            startDate.setMonth(now.getMonth() - 3)
            break
          case "Last year":
            startDate.setFullYear(now.getFullYear() - 1)
            break
        }
        params.startDate = startDate.toISOString()
        params.endDate = now.toISOString()
      }

      const response = await api.getCommissionsHistory(params)

      if (response.success && response.data) {
        const newCommissions = response.data.commissions || response.data
        if (page === 1) {
          setCommissions(newCommissions)
        } else {
          setCommissions(prev => [...prev, ...newCommissions])
        }
        setHasMore(newCommissions.length === 20)
      } else {
        throw new Error(response.error || "Failed to fetch commissions")
      }
    } catch (error) {
      console.error("Failed to fetch commissions:", error)
      setError("Failed to load commissions")
      
      // Mock data fallback
      setCommissions(getMockCommissions())
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.getPartnerMetrics()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      // Use mock stats
      setStats(getMockStats())
    }
  }

  const getMockCommissions = (): Commission[] => [
    {
      _id: "1",
      partner: {
        _id: "partner1",
        name: "Adunni Okafor",
        email: "adunni@example.com",
        phone: "+2348012345678"
      },
      farmer: {
        _id: "farmer1",
        name: "Ibrahim Mohammed",
        location: "Kano State"
      },
      harvest: {
        _id: "harvest1",
        cropType: "Tomatoes",
        quantity: 50,
        unit: "kg",
        totalValue: 750000
      },
      commissionAmount: 37500,
      commissionRate: 5,
      status: "paid",
      paymentMethod: "bank_transfer",
      paymentReference: "PAY-123456",
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2025-01-16T14:00:00Z",
      paidAt: "2025-01-16T14:00:00Z"
    },
    {
      _id: "2",
      partner: {
        _id: "partner1",
        name: "Adunni Okafor",
        email: "adunni@example.com",
        phone: "+2348012345678"
      },
      farmer: {
        _id: "farmer2",
        name: "Choma Ezeh",
        location: "Enugu State"
      },
      harvest: {
        _id: "harvest2",
        cropType: "Yam",
        quantity: 20,
        unit: "tubers",
        totalValue: 160000
      },
      commissionAmount: 8000,
      commissionRate: 5,
      status: "approved",
      paymentMethod: "bank_transfer",
      createdAt: "2025-01-14T15:00:00Z",
      updatedAt: "2025-01-15T09:00:00Z"
    },
    {
      _id: "3",
      partner: {
        _id: "partner1",
        name: "Adunni Okafor",
        email: "adunni@example.com",
        phone: "+2348012345678"
      },
      farmer: {
        _id: "farmer3",
        name: "Aisha Bello",
        location: "Lagos State"
      },
      harvest: {
        _id: "harvest3",
        cropType: "Cassava",
        quantity: 100,
        unit: "kg",
        totalValue: 600000
      },
      commissionAmount: 30000,
      commissionRate: 5,
      status: "pending",
      paymentMethod: "bank_transfer",
      createdAt: "2025-01-13T09:00:00Z",
      updatedAt: "2025-01-13T09:00:00Z"
    }
  ]

  const getMockStats = (): CommissionStats => ({
    totalCommissions: 15,
    totalEarnings: 125000,
    pendingCommissions: 3,
    paidCommissions: 12,
    monthlyEarnings: 45000,
    totalFarmers: 25,
    activeFarmers: 18,
    conversionRate: 72
  })

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "All",
      dateRange: "All",
      partner: "",
      sortBy: "newest"
    })
    setPage(1)
  }

  const loadMore = () => {
    setPage(prev => prev + 1)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'paid':
        return <DollarSign className="w-4 h-4" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const exportCommissions = () => {
    // In a real app, this would generate and download a CSV file
    toast.success("Exporting commissions data...")
  }

  const filteredCommissions = commissions.filter(commission => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        commission.farmer.name.toLowerCase().includes(searchTerm) ||
        commission.harvest.cropType.toLowerCase().includes(searchTerm) ||
        commission.partner.name.toLowerCase().includes(searchTerm)
      )
    }
    return true
  })

  if (loading && commissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading commissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Commission Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your earnings and partner performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
          <Button variant="outline" onClick={exportCommissions}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={fetchCommissions} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.totalEarnings)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats.monthlyEarnings > 0 ? Math.round((stats.monthlyEarnings / stats.totalEarnings) * 100) : 0}% this month
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
                  <p className="text-2xl font-bold">{stats.totalCommissions}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-blue-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                {stats.paidCommissions} paid
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Farmers</p>
                  <p className="text-2xl font-bold">{stats.activeFarmers}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-purple-600">
                <BarChart3 className="w-4 h-4 mr-1" />
                {stats.conversionRate}% conversion
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.pendingCommissions * 5000)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-yellow-600">
                <Clock className="w-4 h-4 mr-1" />
                {stats.pendingCommissions} pending
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search commissions by farmer, crop, or partner..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg"
          >
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {commissionStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => handleFilterChange('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {/* Active Filters */}
        {(filters.status !== "All" || filters.dateRange !== "All") && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.status !== "All" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.status}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('status', 'All')}
                />
              </Badge>
            )}
            {filters.dateRange !== "All" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.dateRange}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('dateRange', 'All')}
                />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredCommissions.length} commission{filteredCommissions.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Commissions List */}
      {filteredCommissions.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No commissions found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCommissions.map((commission, index) => (
            <motion.div
              key={commission._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Commission Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {commission.harvest.cropType} - {commission.farmer.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Partner: {commission.partner.name} • {new Date(commission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(commission.commissionAmount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {commission.commissionRate}% of {formatPrice(commission.harvest.totalValue)}
                          </p>
                        </div>
                      </div>

                      {/* Harvest Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>
                          <p className="font-medium">{commission.harvest.quantity} {commission.harvest.unit}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="font-medium">{commission.farmer.location}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Payment Method:</span>
                          <p className="font-medium capitalize">{commission.paymentMethod.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={`ml-2 ${getStatusColor(commission.status)}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(commission.status)}
                              {commission.status}
                            </div>
                          </Badge>
                        </div>
                      </div>

                      {/* Payment Reference */}
                      {commission.paymentReference && (
                        <div className="text-sm text-muted-foreground">
                          Payment Ref: {commission.paymentReference}
                        </div>
                      )}

                      {/* Notes */}
                      {commission.notes && (
                        <div className="text-sm text-muted-foreground">
                          Notes: {commission.notes}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <Link href={`/commissions/${commission._id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      
                      {commission.status === 'pending' && (
                        <Button size="sm" className="w-full">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      )}
                      
                      {commission.status === 'approved' && (
                        <Button size="sm" className="w-full">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Commissions"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
