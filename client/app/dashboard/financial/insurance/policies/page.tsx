"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Shield,
  Plus,
  Eye,
  FileText,
  Download,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Leaf,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Cloud,
  Zap,
  ChevronDown,
  ChevronUp,
  Minus
} from "lucide-react"

interface InsurancePolicy {
  id: string
  policyNumber: string
  type: 'crop' | 'livestock' | 'equipment' | 'health' | 'life'
  provider: string
  coverage: {
    amount: number
    currency: string
    details: string
  }
  premium: {
    amount: number
    frequency: 'monthly' | 'quarterly' | 'annually'
    nextDue: string
  }
  status: 'active' | 'expired' | 'pending' | 'cancelled' | 'claimed'
  startDate: string
  endDate: string
  crops?: string[]
  livestock?: string[]
  equipment?: string[]
  riskFactors: Array<{
    factor: string
    level: 'low' | 'medium' | 'high'
    description: string
  }>
  claims: Array<{
    id: string
    date: string
    amount: number
    status: 'pending' | 'approved' | 'rejected'
    description: string
  }>
  documents: Array<{
    name: string
    type: string
    url: string
    uploadedAt: string
  }>
}

interface InsuranceStats {
  totalPolicies: number
  activePolicies: number
  totalCoverage: number
  totalPremium: number
  pendingClaims: number
  claimsValue: number
  monthlyTrend: {
    month: string
    policies: number
    coverage: number
    premium: number
  }[]
}

const policyTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'crop', label: 'Crop Insurance' },
  { value: 'livestock', label: 'Livestock Insurance' },
  { value: 'equipment', label: 'Equipment Insurance' },
  { value: 'health', label: 'Health Insurance' },
  { value: 'life', label: 'Life Insurance' }
]

const policyStatuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'claimed', label: 'Claimed' }
]

const riskLevelColors = {
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-red-100 text-red-800 border-red-200'
}

const statusColors = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  claimed: 'bg-blue-100 text-blue-800 border-blue-200'
}

export default function InsurancePoliciesPage() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [stats, setStats] = useState<InsuranceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  })
  const [sortBy, setSortBy] = useState('startDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const { toast } = useToast()

  useEffect(() => {
    fetchPolicies()
  }, [filters, sortBy, sortOrder])

  const fetchPolicies = async () => {
    try {
      setLoading(true)
      
      // Mock data for now - replace with actual API call
      const mockPolicies: InsurancePolicy[] = [
        {
          id: '1',
          policyNumber: 'POL-001-2024',
          type: 'crop',
          provider: 'Nigerian Agricultural Insurance Corporation',
          coverage: {
            amount: 2000000,
            currency: 'NGN',
            details: 'Comprehensive crop insurance covering drought, flood, pests, and diseases'
          },
          premium: {
            amount: 45000,
            frequency: 'annually',
            nextDue: '2025-01-15'
          },
          status: 'active',
          startDate: '2024-01-15',
          endDate: '2024-12-31',
          crops: ['Maize', 'Cassava', 'Tomatoes', 'Beans'],
          riskFactors: [
            {
              factor: 'Drought Risk',
              level: 'medium',
              description: 'Moderate risk of drought during dry season'
            },
            {
              factor: 'Flood Risk',
              level: 'low',
              description: 'Low risk of flooding in current location'
            },
            {
              factor: 'Pest Risk',
              level: 'high',
              description: 'High risk of pest infestation during growing season'
            }
          ],
          claims: [
            {
              id: 'CLM-001',
              date: '2024-06-15',
              amount: 150000,
              status: 'approved',
              description: 'Crop damage due to pest infestation'
            }
          ],
          documents: [
            {
              name: 'Policy Document',
              type: 'PDF',
              url: '/documents/policy-001.pdf',
              uploadedAt: '2024-01-15'
            },
            {
              name: 'Terms & Conditions',
              type: 'PDF',
              url: '/documents/terms-001.pdf',
              uploadedAt: '2024-01-15'
            }
          ]
        },
        {
          id: '2',
          policyNumber: 'POL-002-2024',
          type: 'equipment',
          provider: 'Allianz Insurance Nigeria',
          coverage: {
            amount: 1500000,
            currency: 'NGN',
            details: 'Equipment insurance covering tractors, harvesters, and irrigation systems'
          },
          premium: {
            amount: 25000,
            frequency: 'quarterly',
            nextDue: '2024-04-15'
          },
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          equipment: ['Tractor', 'Harvester', 'Irrigation System'],
          riskFactors: [
            {
              factor: 'Mechanical Failure',
              level: 'medium',
              description: 'Standard risk of mechanical breakdown'
            },
            {
              factor: 'Theft Risk',
              level: 'low',
              description: 'Low risk of equipment theft'
            }
          ],
          claims: [],
          documents: [
            {
              name: 'Equipment Policy',
              type: 'PDF',
              url: '/documents/equipment-policy.pdf',
              uploadedAt: '2024-01-01'
            }
          ]
        },
        {
          id: '3',
          policyNumber: 'POL-003-2024',
          type: 'livestock',
          provider: 'Leadway Assurance',
          coverage: {
            amount: 800000,
            currency: 'NGN',
            details: 'Livestock insurance covering cattle, poultry, and other farm animals'
          },
          premium: {
            amount: 18000,
            frequency: 'annually',
            nextDue: '2025-01-01'
          },
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          livestock: ['Cattle', 'Poultry', 'Goats'],
          riskFactors: [
            {
              factor: 'Disease Risk',
              level: 'high',
              description: 'High risk of livestock diseases'
            },
            {
              factor: 'Weather Risk',
              level: 'medium',
              description: 'Medium risk from extreme weather conditions'
            }
          ],
          claims: [
            {
              id: 'CLM-002',
              date: '2024-05-20',
              amount: 75000,
              status: 'pending',
              description: 'Livestock loss due to disease outbreak'
            }
          ],
          documents: [
            {
              name: 'Livestock Policy',
              type: 'PDF',
              url: '/documents/livestock-policy.pdf',
              uploadedAt: '2024-01-01'
            }
          ]
        }
      ]

      const mockStats: InsuranceStats = {
        totalPolicies: 3,
        activePolicies: 3,
        totalCoverage: 4300000,
        totalPremium: 88000,
        pendingClaims: 1,
        claimsValue: 225000,
        monthlyTrend: [
          { month: 'Dec 2023', policies: 2, coverage: 2800000, premium: 60000 },
          { month: 'Jan 2024', policies: 3, coverage: 4300000, premium: 88000 }
        ]
      }

      setPolicies(mockPolicies)
      setStats(mockStats)
    } catch (error) {
      console.error("Failed to fetch policies:", error)
      toast({
        title: "Error",
        description: "Failed to load insurance policies. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNewPolicy = () => {
    // Navigate to new policy application
    toast({
      title: "New Policy",
      description: "Redirecting to policy application form...",
      variant: "default"
    })
  }

  const handleExport = async () => {
    try {
      // Mock export - replace with actual API call
      console.log('Exporting insurance policies...')
      
      toast({
        title: "Export Started",
        description: "Your insurance report is being prepared for download.",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export insurance policies. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'desc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'crop': return <Leaf className="h-4 w-4 text-green-500" />
      case 'livestock': return <Shield className="h-4 w-4 text-blue-500" />
      case 'equipment': return <Zap className="h-4 w-4 text-purple-500" />
      case 'health': return <Shield className="h-4 w-4 text-emerald-500" />
      case 'life': return <Shield className="h-4 w-4 text-red-500" />
      default: return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getPolicyTypeColor = (type: string) => {
    switch (type) {
      case 'crop': return 'bg-green-100 text-green-800 border-green-200'
      case 'livestock': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'equipment': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'health': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'life': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredPolicies = policies.filter(policy => {
    if (filters.type !== 'all' && policy.type !== filters.type) return false
    if (filters.status !== 'all' && policy.status !== filters.status) return false
    if (filters.search && !policy.policyNumber.toLowerCase().includes(filters.search.toLowerCase()) && 
        !policy.provider.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const sortedPolicies = [...filteredPolicies].sort((a, b) => {
    let aValue: any = a[sortBy as keyof InsurancePolicy]
    let bValue: any = b[sortBy as keyof InsurancePolicy]
    
    if (sortBy === 'startDate' || sortBy === 'endDate') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  if (loading) {
    return (
      <DashboardLayout pageTitle="Insurance Policies">
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
    <DashboardLayout pageTitle="Insurance Policies">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900">Insurance Policies</h1>
            <p className="text-gray-600">
              Manage your insurance coverage and claims
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={handleNewPolicy}>
              <Plus className="h-4 w-4 mr-2" />
              New Policy
            </Button>
          </div>
        </div>

        {/* Insurance Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalPolicies}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600">+1 from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  ₦{(stats.totalCoverage / 1000000).toFixed(1)}M
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600">+53.6% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  ₦{(stats.totalPremium / 1000).toFixed(0)}K
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-600">+46.7% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.pendingClaims}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">₦{(stats.claimsValue / 1000).toFixed(0)}K value</span>
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
                <label className="text-sm font-medium">Policy Type</label>
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {policyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {policyStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search policies..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policies List */}
        <div className="space-y-4">
          {sortedPolicies.map((policy) => (
            <Card key={policy.id} className="border border-gray-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {getPolicyTypeIcon(policy.type)}
                      <div>
                        <CardTitle className="text-lg font-medium">{policy.policyNumber}</CardTitle>
                        <CardDescription className="text-base">
                          {policy.provider}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getPolicyTypeColor(policy.type)} variant="outline">
                        {policy.type.charAt(0).toUpperCase() + policy.type.slice(1)} Insurance
                      </Badge>
                      <Badge className={statusColors[policy.status]} variant="outline">
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Coverage Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-900">Coverage Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Coverage Amount:</span>
                        <span className="text-sm font-medium">₦{(policy.coverage.amount / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Premium:</span>
                        <span className="text-sm font-medium">₦{(policy.premium.amount / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Frequency:</span>
                        <span className="text-sm font-medium capitalize">{policy.premium.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Next Due:</span>
                        <span className="text-sm font-medium">
                          {new Date(policy.premium.nextDue).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Policy Period */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-900">Policy Period</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Start Date:</span>
                        <span className="text-sm font-medium">
                          {new Date(policy.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">End Date:</span>
                        <span className="text-sm font-medium">
                          {new Date(policy.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Days Remaining:</span>
                        <span className="text-sm font-medium">
                          {Math.ceil((new Date(policy.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-900">Risk Assessment</h4>
                    <div className="space-y-2">
                      {policy.riskFactors.slice(0, 3).map((risk, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">{risk.factor}</span>
                          <Badge className={riskLevelColors[risk.level]} variant="outline" size="sm">
                            {risk.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Claims Summary */}
                {policy.claims.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-sm text-gray-900 mb-3">Recent Claims</h4>
                    <div className="space-y-2">
                      {policy.claims.map((claim) => (
                        <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium">{claim.description}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(claim.date).toLocaleDateString()} • ₦{claim.amount.toLocaleString()}
                            </div>
                          </div>
                          <Badge className={statusColors[claim.status]} variant="outline">
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedPolicies.length === 0 && (
          <Card className="border border-gray-200">
            <CardContent className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies Found</h3>
              <p className="text-gray-600 mb-4">
                {filters.type !== 'all' || filters.status !== 'all' || filters.search
                  ? "Try adjusting your filters to see more policies."
                  : "You don't have any insurance policies yet."}
              </p>
              {!filters.type && !filters.status && !filters.search && (
                <Button onClick={handleNewPolicy}>
                  <Plus className="h-4 w-4 mr-2" />
                  Get Your First Policy
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
