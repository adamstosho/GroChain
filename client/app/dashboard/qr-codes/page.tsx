"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  QrCode,
  Plus,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  Package,
  Leaf,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface QRCode {
  id: string
  code: string
  harvestId: string
  cropType: string
  quantity: number
  quality: string
  harvestDate: string
  location: string
  status: 'active' | 'expired' | 'revoked' | 'verified'
  createdAt: string
  lastScanned?: string
  scanCount: number
  metadata: {
    farmerId: string
    farmName: string
    coordinates?: string
    batchNumber: string
  }
}

interface QRStats {
  totalCodes: number
  activeCodes: number
  verifiedCodes: number
  revokedCodes: number
  totalScans: number
  monthlyTrend: {
    month: string
    generated: number
    scanned: number
    verified: number
  }[]
}

const qrStatuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'verified', label: 'Verified' }
]

const statusColors = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  expired: 'bg-amber-100 text-amber-800 border-amber-200',
  revoked: 'bg-red-100 text-red-800 border-red-200',
  verified: 'bg-blue-100 text-blue-800 border-blue-200'
}

const statusIcons = {
  active: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  expired: <Clock className="h-4 w-4 text-amber-500" />,
  revoked: <XCircle className="h-4 w-4 text-red-500" />,
  verified: <CheckCircle className="h-4 w-4 text-blue-500" />
}

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([])
  const [stats, setStats] = useState<QRStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    cropType: 'all',
    search: ''
  })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const { toast } = useToast()

  useEffect(() => {
    fetchQRCodes()
  }, [filters, sortBy, sortOrder])

  const fetchQRCodes = async () => {
    try {
      setLoading(true)
      
      // Mock data for now - replace with actual API call
      const mockQRCodes: QRCode[] = [
        {
          id: '1',
          code: 'QR-001-2024-MAIZE-500KG',
          harvestId: 'H001',
          cropType: 'Maize',
          quantity: 500,
          quality: 'A',
          harvestDate: '2024-01-15',
          location: 'Lagos Farm',
          status: 'active',
          createdAt: '2024-01-15T10:30:00Z',
          lastScanned: '2024-01-20T14:25:00Z',
          scanCount: 3,
          metadata: {
            farmerId: 'F001',
            farmName: 'Green Acres Farm',
            coordinates: '6.5244°N, 3.3792°E',
            batchNumber: 'B001-2024'
          }
        },
        {
          id: '2',
          code: 'QR-002-2024-CASSAVA-300KG',
          harvestId: 'H002',
          cropType: 'Cassava',
          quantity: 300,
          quality: 'B',
          harvestDate: '2024-01-10',
          location: 'Ibadan Farm',
          status: 'verified',
          createdAt: '2024-01-10T09:15:00Z',
          lastScanned: '2024-01-18T11:45:00Z',
          scanCount: 5,
          metadata: {
            farmerId: 'F001',
            farmName: 'Green Acres Farm',
            coordinates: '7.3961°N, 3.8969°E',
            batchNumber: 'B002-2024'
          }
        },
        {
          id: '3',
          code: 'QR-003-2024-TOMATO-400KG',
          harvestId: 'H003',
          cropType: 'Tomatoes',
          quantity: 400,
          quality: 'A',
          harvestDate: '2024-01-08',
          location: 'Abuja Farm',
          status: 'active',
          createdAt: '2024-01-08T08:45:00Z',
          lastScanned: '2024-01-22T16:30:00Z',
          scanCount: 2,
          metadata: {
            farmerId: 'F001',
            farmName: 'Green Acres Farm',
            coordinates: '9.0820°N, 8.6753°E',
            batchNumber: 'B003-2024'
          }
        },
        {
          id: '4',
          code: 'QR-004-2024-BEANS-200KG',
          harvestId: 'H004',
          cropType: 'Beans',
          quantity: 200,
          quality: 'B',
          harvestDate: '2024-01-05',
          location: 'Kano Farm',
          status: 'expired',
          createdAt: '2024-01-05T12:20:00Z',
          lastScanned: '2024-01-15T10:15:00Z',
          scanCount: 1,
          metadata: {
            farmerId: 'F001',
            farmName: 'Green Acres Farm',
            coordinates: '11.9914°N, 8.5313°E',
            batchNumber: 'B004-2024'
          }
        }
      ]

      const mockStats: QRStats = {
        totalCodes: 4,
        activeCodes: 2,
        verifiedCodes: 1,
        revokedCodes: 0,
        totalScans: 11,
        monthlyTrend: [
          { month: 'Dec 2023', generated: 3, scanned: 8, verified: 2 },
          { month: 'Jan 2024', generated: 4, scanned: 11, verified: 1 }
        ]
      }

      setQRCodes(mockQRCodes)
      setStats(mockStats)
    } catch (error) {
      console.error("Failed to fetch QR codes:", error)
      toast({
        title: "Error",
        description: "Failed to load QR code data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQR = () => {
    // Navigate to QR generation form
    toast({
      title: "Generate QR Code",
      description: "Redirecting to QR code generation form...",
      variant: "default"
    })
  }

  const handleDownloadQR = async (qrCode: QRCode) => {
    try {
      // Mock download - replace with actual API call
      console.log('Downloading QR code:', qrCode.code)
      
      toast({
        title: "Download Started",
        description: `QR code ${qrCode.code} is being prepared for download.`,
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download QR code. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleRevokeQR = async (qrCode: QRCode) => {
    try {
      // Mock revoke - replace with actual API call
      console.log('Revoking QR code:', qrCode.code)
      
      // Update local state
      setQRCodes(prev => prev.map(qr => 
        qr.id === qrCode.id ? { ...qr, status: 'revoked' as const } : qr
      ))
      
      toast({
        title: "QR Code Revoked",
        description: `QR code ${qrCode.code} has been successfully revoked.`,
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Revoke Failed",
        description: "Failed to revoke QR code. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const filteredQRCodes = qrCodes.filter(qrCode => {
    if (filters.status !== 'all' && qrCode.status !== filters.status) return false
    if (filters.cropType !== 'all' && qrCode.cropType !== filters.cropType) return false
    if (filters.search && !qrCode.code.toLowerCase().includes(filters.search.toLowerCase()) && 
        !qrCode.cropType.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const sortedQRCodes = [...filteredQRCodes].sort((a, b) => {
    let aValue: any = a[sortBy as keyof QRCode]
    let bValue: any = b[sortBy as keyof QRCode]
    
    if (sortBy === 'createdAt' || sortBy === 'harvestDate' || sortBy === 'lastScanned') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const cropTypes = Array.from(new Set(qrCodes.map(qr => qr.cropType)))

  if (loading) {
    return (
      <DashboardLayout pageTitle="QR Codes">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="QR Codes">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900">QR Codes</h1>
            <p className="text-gray-600">
              Manage and track your harvest QR codes for provenance verification
            </p>
          </div>
          
          <Button onClick={handleGenerateQR}>
            <Plus className="h-4 w-4 mr-2" />
            Generate QR Code
          </Button>
        </div>

        {/* QR Code Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total QR Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalCodes}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600">+1 from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Active Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.activeCodes}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600">Ready for scanning</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Verified Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.verifiedCodes}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600">Successfully verified</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalScans}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Eye className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-purple-600">Across all codes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-medium">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qrStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Crop Type</label>
                <Select value={filters.cropType} onValueChange={(value) => setFilters(prev => ({ ...prev, cropType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Crops</SelectItem>
                    {cropTypes.map((crop) => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search QR codes..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Codes List */}
        <Card className="border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">QR Code Management</CardTitle>
                <CardDescription>
                  {filteredQRCodes.length} QR codes found
                </CardDescription>
              </div>
              <Button variant="outline" onClick={fetchQRCodes}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center gap-2 hover:text-gray-900"
                      >
                        Generated
                        {sortBy === 'createdAt' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">QR Code</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Harvest Details</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Scans</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedQRCodes.map((qrCode) => (
                    <tr key={qrCode.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">
                          {new Date(qrCode.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(qrCode.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="font-mono text-sm font-medium">{qrCode.code}</div>
                          <div className="text-xs text-gray-500">Batch: {qrCode.metadata.batchNumber}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">{qrCode.cropType}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {qrCode.quantity}kg • Quality: {qrCode.quality}
                          </div>
                          <div className="text-xs text-gray-500">
                            Harvest: {new Date(qrCode.harvestDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">{qrCode.location}</span>
                          </div>
                          <div className="text-xs text-gray-500">{qrCode.metadata.farmName}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[qrCode.status]} variant="outline">
                          {statusIcons[qrCode.status]}
                          <span className="ml-1 capitalize">{qrCode.status}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{qrCode.scanCount}</div>
                          {qrCode.lastScanned && (
                            <div className="text-xs text-gray-500">
                              Last: {new Date(qrCode.lastScanned).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadQR(qrCode)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {qrCode.status === 'active' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRevokeQR(qrCode)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {sortedQRCodes.length === 0 && (
          <Card className="border border-gray-200">
            <CardContent className="text-center py-12">
              <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No QR Codes Found</h3>
              <p className="text-gray-600 mb-4">
                {filters.status !== 'all' || filters.cropType !== 'all' || filters.search
                  ? "Try adjusting your filters to see more QR codes."
                  : "You don't have any QR codes yet."}
              </p>
              {!filters.status && !filters.cropType && !filters.search && (
                <Button onClick={handleGenerateQR}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Your First QR Code
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}



