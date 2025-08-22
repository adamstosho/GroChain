"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Plus, Package, Calendar, MapPin, Eye, QrCode, Download, MoreHorizontal, Loader2, AlertCircle, Edit, Share2, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Harvest {
  id: string
  batchId?: string
  cropType: string
  quantity: number
  unit?: string
  harvestDate?: string
  date?: string
  location?: string
  status?: string
  qrCode?: string
  images?: string[]
  description?: string
  geoLocation?: { lat: number; lng: number }
  farmer?: string
  createdAt?: string
}

const statusColors = {
  verified: "default",
  pending: "secondary",
  rejected: "destructive",
  default: "secondary", // fallback for undefined status
} as const

export function HarvestList() {
  const { user } = useAuth()
  const [harvests, setHarvests] = useState<Harvest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [deletedHarvestIds, setDeletedHarvestIds] = useState<Set<string>>(() => {
    // Load deleted IDs from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deleted_harvest_ids')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })
  // Add this state for better error handling
  const [showAuthError, setShowAuthError] = useState(false)

  // Fetch real harvest data
  useEffect(() => {
    if (user?.id) {
      fetchHarvests()
    }
  }, [user?.id])

  const handleAuthError = () => {
    setShowAuthError(true)
    setError("Authentication required. Please log in again.")
  }

  const goToLogin = () => {
    window.location.href = '/login'
  }

  const retryAuth = async () => {
    try {
      // Try to refresh the token first
      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken) {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'success' && data.accessToken) {
            localStorage.setItem("auth_token", data.accessToken)
            if (data.refreshToken) {
              localStorage.setItem("refresh_token", data.refreshToken)
            }
            // Retry fetching harvests
            fetchHarvests()
            setShowAuthError(false)
            return
          }
        }
      }
      
      // If refresh failed, redirect to login
      goToLogin()
    } catch (error) {
      console.error("Failed to refresh token:", error)
      goToLogin()
    }
  }

  const fetchHarvests = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Check if user is authenticated
      if (!user?.id) {
        console.log("🔍 User not authenticated, skipping harvest fetch")
        setHarvests([])
        return
      }
      
      // Check if we have a valid token
      const token = localStorage.getItem("auth_token")
      if (!token) {
        console.log("🔍 No auth token found, redirecting to login")
        setError("Authentication required")
        // The auth context should handle this, but just in case
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
        return
      }
      
      console.log("🔍 Fetching harvests for user:", user?.id)
      const response = await api.getHarvests()
      console.log("🔍 Harvests response:", response)
      
      if (response.success && response.data) {
        const data = response.data as any
        let harvestsData: Harvest[] = []
        
        // Handle different response structures
        if (Array.isArray(data)) {
          harvestsData = data
        } else if (data.harvests && Array.isArray(data.harvests)) {
          harvestsData = data.harvests
        } else if (data.data && Array.isArray(data.data)) {
          harvestsData = data.data
        }
        
        console.log("🔍 Processed harvests data:", harvestsData)
        
        // Filter out any harvests that were previously deleted
        const filteredHarvestsData = harvestsData.filter(harvest => {
          const harvestId = harvest.id || harvest.batchId || harvest._id
          return !deletedHarvestIds.has(harvestId || '')
        })
        
        setHarvests(filteredHarvestsData)
      } else {
        // Handle authentication errors specifically
        if (response.error === 'Invalid token' || response.error?.includes('token') || response.error?.includes('auth')) {
          console.log("🔍 Authentication error, clearing auth data")
          localStorage.removeItem("auth_token")
          localStorage.removeItem("refresh_token")
          localStorage.removeItem("user_data")
          handleAuthError()
          return
        }
        
        throw new Error(response.error || "Failed to fetch harvests")
      }
    } catch (error) {
      console.error("🔍 Error fetching harvests:", error)
      
      // Handle network or authentication errors
      if (error instanceof Error) {
        if (error.message.includes('token') || error.message.includes('auth')) {
          setError("Authentication error. Please log in again.")
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
          return
        }
        setError(error.message)
      } else {
        setError("Failed to fetch harvests")
      }
      
      toast.error("Failed to load harvests")
    } finally {
      setLoading(false)
    }
  }

  // Handler functions for dropdown menu actions
  const handleEditHarvest = (harvest: Harvest) => {
    // Navigate to edit page or open edit modal
    toast.info(`Edit functionality for ${harvest.cropType} coming soon!`)
    console.log("Edit harvest:", harvest)
  }

  // Function to get readable location from harvest data
  const getReadableLocation = (harvest: Harvest): string => {
    if (harvest.location && harvest.location.trim() !== "") {
      return harvest.location
    }
    
    if (harvest.geoLocation?.lat && harvest.geoLocation?.lng) {
      // Convert coordinates to readable location
      const lat = harvest.geoLocation.lat
      const lng = harvest.geoLocation.lng
      
      // Simple coordinate display
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
    
    return "Location not specified"
  }

  const handleShareQRCode = async (harvest: Harvest) => {
    try {
      // Generate QR code data
      const qrData = `GROCHAIN_${harvest.batchId || harvest.id}_${harvest.cropType}_${harvest.quantity}_${harvest.location || 'Unknown Location'}`
      
      // Create QR code image
      const QRCodeLib = await import('qrcode')
      const qrImageDataUrl = await QRCodeLib.toDataURL(qrData, {
        width: 250,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      })
      
      // Download QR code
      const link = document.createElement('a')
      link.href = qrImageDataUrl
      link.download = `QR_${harvest.cropType}_${harvest.batchId || harvest.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`QR Code for ${harvest.cropType} downloaded successfully!`)
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error("Failed to generate QR code")
    }
  }

  const handleDeleteHarvest = async (harvest: Harvest) => {
    if (confirm(`Are you sure you want to delete ${harvest.cropType}? This action cannot be undone.`)) {
      try {
        // Get the unique identifier for this harvest
        const harvestId = harvest.id || harvest.batchId || harvest._id
        
        if (!harvestId) {
          toast.error("Cannot delete harvest: Missing ID")
          return
        }
        
        // Try to delete from database first
        try {
          // Check if deleteHarvest API exists
          if (typeof api.deleteHarvest === 'function') {
            const response = await api.deleteHarvest(harvestId)
            if (response.success) {
              toast.success(`${harvest.cropType} deleted from database successfully!`)
            } else {
              throw new Error(response.error || "Failed to delete from database")
            }
          } else {
            // If API doesn't exist, show info message
            toast.info("Delete API not implemented yet - removing from local list only")
          }
        } catch (apiError) {
          console.error("Database delete failed:", apiError)
          toast.warning("Database delete failed, but removed from local list")
        }
        
        // Remove from local state regardless of API success
        setHarvests(prev => prev.filter(h => {
          const hId = h.id || h.batchId || h._id
          return hId !== harvestId
        }))
        
        // Add to deleted IDs set to persist deletion across refreshes
        const newDeletedIds = new Set([...deletedHarvestIds, harvestId])
        setDeletedHarvestIds(newDeletedIds)
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('deleted_harvest_ids', JSON.stringify([...newDeletedIds]))
        }
        
      } catch (error) {
        console.error("Error deleting harvest:", error)
        toast.error("Failed to delete harvest")
      }
    }
  }

  // Debug function to check authentication state
  const debugAuth = () => {
    console.log('🔍 Debug Auth State:')
    console.log('User:', user)
    console.log('Local Storage:', {
      auth_token: localStorage.getItem('auth_token')?.substring(0, 20) + '...',
      refresh_token: localStorage.getItem('refresh_token')?.substring(0, 20) + '...',
      user_data: localStorage.getItem('user_data')
    })
    console.log('Cookies:', document.cookie)
    
    // Test API client state
    api.debugAuthState()
    
    // Test token validation
    api.validateToken().then(isValid => {
      console.log('🔍 Token validation result:', isValid)
    })
  }

  const filteredHarvests = harvests
    .filter((harvest) => {
      const matchesSearch =
        (harvest.cropType && harvest.cropType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (harvest.location && harvest.location.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === "all" || (harvest.status && harvest.status === statusFilter)
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = a.date || a.harvestDate || a.createdAt || ""
        const dateB = b.date || b.harvestDate || b.createdAt || ""
        if (!dateA || !dateB) return 0 // Skip sorting if dates are missing
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      }
      if (sortBy === "crop") {
        if (!a.cropType || !b.cropType) return 0 // Skip sorting if crop types are missing
        return a.cropType.localeCompare(b.cropType)
      }
      return 0
    })

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">My Products</h1>
              <p className="text-muted-foreground">Manage your registered harvests and QR codes</p>
            </div>
            <Link href="/harvests/new">
              <Button size="lg" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>

          {/* Authentication Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${user?.id ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {user?.id ? `Authenticated as ${user.name} (${user.role})` : 'Not authenticated'}
                </span>
              </div>
              {user?.id && (
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  View Profile
                </button>
              )}
            </div>
          </div>

          {/* Harvest List Header */}
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by crop type or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="crop">Crop Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your harvests...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">{harvests.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Verified</p>
                    <p className="text-2xl font-bold text-success">
                      {harvests.filter((h) => h.status === "verified").length}
                    </p>
                  </div>
                  <Badge className="w-8 h-8 rounded-full p-0 bg-success">✓</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-warning">
                      {harvests.filter((h) => h.status === "pending").length}
                    </p>
                  </div>
                  <Badge className="w-8 h-8 rounded-full p-0 bg-warning">⏳</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-destructive">
                      {harvests.filter((h) => h.status === "rejected").length}
                    </p>
                  </div>
                  <Badge className="w-8 h-8 rounded-full p-0 bg-destructive">✗</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product List */}
          <div className="space-y-4">
            {filteredHarvests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Start by adding your first harvest"}
                  </p>
                  <Link href="/harvests/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Product
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredHarvests.map((harvest, index) => (
                <motion.div
                  key={harvest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Image */}
                        <div className="w-full lg:w-24 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {harvest.images && harvest.images.length > 0 && harvest.images[0] ? (
                            <Image
                              src={harvest.images[0]}
                              alt={harvest.cropType}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">{harvest.cropType}</h3>
                              <p className="text-sm text-muted-foreground">
                                {harvest.quantity || 0} {harvest.unit || "units"}
                              </p>
                            </div>
                            <Badge variant={statusColors[harvest.status as keyof typeof statusColors] || "default"}>
                              {harvest.status || "pending"}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(harvest.date || harvest.harvestDate || harvest.createdAt || "").toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {getReadableLocation(harvest)}
                            </span>
                            <span className="flex items-center">
                              <QrCode className="w-3 h-3 mr-1" />
                              {harvest.qrCode || harvest.batchId || harvest.id}
                            </span>
                          </div>

                          {harvest.description && harvest.description.trim() !== "" && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{harvest.description}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link href={`/harvests/${harvest.id || harvest.batchId || harvest._id}`}>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          {harvest.status === "verified" && (
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Download className="w-4 h-4 mr-2" />
                              QR Code
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditHarvest(harvest)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShareQRCode(harvest)}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share QR Code
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteHarvest(harvest)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
            </>
          )}
        </motion.div>
      </div>
      {/* Authentication Error Modal */}
      {showAuthError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Authentication Required</h3>
            <p className="text-gray-700 mb-6">
              Your session has expired. Please log in again to continue.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={retryAuth}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
              <button
                onClick={goToLogin}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
