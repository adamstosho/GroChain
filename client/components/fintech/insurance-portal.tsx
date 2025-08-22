"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/Progress"
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Eye, 
  Download, 
  Clock, 
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
  Leaf,
  Droplets,
  Sun,
  Thermometer,
  FileText
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface InsurancePolicy {
  id: string
  type: 'crop' | 'livestock' | 'equipment' | 'liability'
  coverage: number
  premium: number
  deductible: number
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  startDate: string
  endDate: string
  claims: Array<{
    id: string
    amount: number
    status: 'pending' | 'approved' | 'rejected'
    description: string
    filedAt: string
    processedAt?: string
  }>
  farmer: {
    id: string
    name: string
    location: string
  }
  crops?: Array<{
    name: string
    area: number
    coverage: number
  }>
  livestock?: Array<{
    type: string
    count: number
    coverage: number
  }>
}

interface InsuranceQuote {
  type: string
  coverage: number
  premium: number
  deductible: number
  benefits: string[]
  exclusions: string[]
  terms: string[]
}

interface InsuranceStats {
  totalPolicies: number
  activePolicies: number
  totalCoverage: number
  totalPremiums: number
  totalClaims: number
  claimsPaid: number
  averageProcessingTime: number
}

export function InsurancePortal() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [stats, setStats] = useState<InsuranceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [quoteFormData, setQuoteFormData] = useState({
    type: "",
    coverage: "",
    description: "",
    location: ""
  })
  const [claimFormData, setClaimFormData] = useState({
    policyId: "",
    amount: "",
    description: "",
    incidentDate: ""
  })
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null)

  useEffect(() => {
    fetchInsuranceData()
  }, [])

  const fetchInsuranceData = async () => {
    try {
      setLoading(true)
      // Since the backend doesn't have these specific endpoints yet, we'll use mock data
      // TODO: Replace with actual API calls when backend endpoints are implemented
      const mockPolicies: InsurancePolicy[] = [
        {
          id: "policy_001",
          type: "crop",
          coverage: 1000000,
          premium: 50000,
          deductible: 100000,
          status: "active",
          startDate: "2025-01-01T00:00:00Z",
          endDate: "2025-12-31T00:00:00Z",
          claims: [],
          farmer: {
            id: "farmer_001",
            name: "John Doe",
            location: "Lagos, Nigeria"
          },
          crops: [
            {
              name: "Tomatoes",
              area: 2.5,
              coverage: 500000
            }
          ]
        }
      ]
      
      const mockStats: InsuranceStats = {
        totalPolicies: 25,
        activePolicies: 20,
        totalCoverage: 25000000,
        totalPremiums: 1250000,
        totalClaims: 5,
        claimsPaid: 3,
        averageProcessingTime: 48
      }

      setPolicies(mockPolicies)
      setStats(mockStats)
    } catch (error) {
      console.error("Insurance data fetch error:", error)
      toast.error("Failed to load insurance data")
    } finally {
      setLoading(false)
    }
  }

  const submitQuoteRequest = async () => {
    try {
      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await api.post("/api/fintech/insurance-quotes", quoteFormData)
      
      toast.success("Insurance quote request submitted successfully!")
      setShowQuoteForm(false)
      setQuoteFormData({ type: "", coverage: "", description: "", location: "" })
    } catch (error) {
      toast.error("Failed to submit quote request")
    }
  }

  const submitClaim = async () => {
    try {
      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await api.post("/api/fintech/insurance-claims", claimFormData)
      
      toast.success("Insurance claim submitted successfully!")
      setShowClaimForm(false)
      setClaimFormData({ policyId: "", amount: "", description: "", incidentDate: "" })
      
      // Refresh data
      fetchInsuranceData()
    } catch (error) {
      toast.error("Failed to submit claim")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800"
    }
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      crop: Leaf,
      livestock: Sun,
      equipment: Thermometer,
      liability: Shield
    }
    return icons[type as keyof typeof icons] || Shield
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading insurance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Insurance Portal</h2>
          <p className="text-muted-foreground">Manage insurance policies and file claims</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowClaimForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            File Claim
          </Button>
          <Button onClick={() => setShowQuoteForm(true)}>
            <Shield className="w-4 h-4 mr-2" />
            Get Quote
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalPolicies}</p>
                  <p className="text-sm text-muted-foreground">Total Policies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.activePolicies}</p>
                  <p className="text-sm text-muted-foreground">Active Policies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">₦{stats.totalCoverage.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Coverage</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">₦{stats.claimsPaid.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Claims Paid</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Active Insurance Policies</CardTitle>
        </CardHeader>
        <CardContent>
          {policies.filter(p => p.status === 'active').length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No active insurance policies</p>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by requesting an insurance quote
              </p>
              <Button onClick={() => setShowQuoteForm(true)}>
                <Shield className="w-4 h-4 mr-2" />
                Get Insurance Quote
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {policies.filter(p => p.status === 'active').map((policy) => {
                const TypeIcon = getTypeIcon(policy.type)
                return (
                  <div
                    key={policy.id}
                    className="p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <TypeIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium capitalize">{policy.type} Insurance</h4>
                          <p className="text-sm text-muted-foreground">{policy.farmer.name} • {policy.farmer.location}</p>
                        </div>
                      </div>
                      <Badge className={getStatusBadge(policy.status)}>
                        {policy.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Coverage</p>
                        <p className="font-medium">₦{policy.coverage.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Premium</p>
                        <p className="font-medium">₦{policy.premium.toLocaleString()}/month</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deductible</p>
                        <p className="font-medium">₦{policy.deductible.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expires</p>
                        <p className="font-medium">{new Date(policy.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {policy.claims.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-2">
                          Claims: {policy.claims.length} filed, {policy.claims.filter(c => c.status === 'approved').length} approved
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insurance Quote Form Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Get Insurance Quote</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Insurance Type</Label>
                <Select value={quoteFormData.type} onValueChange={(value) => setQuoteFormData({ ...quoteFormData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crop">Crop Insurance</SelectItem>
                    <SelectItem value="livestock">Livestock Insurance</SelectItem>
                    <SelectItem value="equipment">Equipment Insurance</SelectItem>
                    <SelectItem value="liability">Liability Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="coverage">Desired Coverage (₦)</Label>
                <Input
                  id="coverage"
                  type="number"
                  value={quoteFormData.coverage}
                  onChange={(e) => setQuoteFormData({ ...quoteFormData, coverage: e.target.value })}
                  placeholder="Enter coverage amount"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={quoteFormData.location}
                  onChange={(e) => setQuoteFormData({ ...quoteFormData, location: e.target.value })}
                  placeholder="Enter your location"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={quoteFormData.description}
                  onChange={(e) => setQuoteFormData({ ...quoteFormData, description: e.target.value })}
                  placeholder="Describe what you want to insure"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={submitQuoteRequest} className="flex-1">
                  Request Quote
                </Button>
                <Button variant="outline" onClick={() => setShowQuoteForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Form Modal */}
      {showClaimForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">File Insurance Claim</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="policy">Select Policy</Label>
                <Select value={claimFormData.policyId} onValueChange={(value) => setClaimFormData({ ...claimFormData, policyId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.filter(p => p.status === 'active').map((policy) => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.type} - ₦{policy.coverage.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Claim Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={claimFormData.amount}
                  onChange={(e) => setClaimFormData({ ...claimFormData, amount: e.target.value })}
                  placeholder="Enter claim amount"
                />
              </div>
              
              <div>
                <Label htmlFor="incidentDate">Incident Date</Label>
                <Input
                  id="incidentDate"
                  type="date"
                  value={claimFormData.incidentDate}
                  onChange={(e) => setClaimFormData({ ...claimFormData, incidentDate: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="claimDescription">Description</Label>
                <Textarea
                  id="claimDescription"
                  value={claimFormData.description}
                  onChange={(e) => setClaimFormData({ ...claimFormData, description: e.target.value })}
                  placeholder="Describe the incident and damage"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={submitClaim} className="flex-1">
                  Submit Claim
                </Button>
                <Button variant="outline" onClick={() => setShowClaimForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy Details Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Policy Details</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedPolicy(null)}>
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Policy Type</Label>
                  <p className="font-medium capitalize">{selectedPolicy.type}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge className={getStatusBadge(selectedPolicy.status)}>
                    {selectedPolicy.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Coverage</Label>
                  <p className="font-medium">₦{selectedPolicy.coverage.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Premium</Label>
                  <p className="font-medium">₦{selectedPolicy.premium.toLocaleString()}/month</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Coverage Period</Label>
                <p className="font-medium">
                  {new Date(selectedPolicy.startDate).toLocaleDateString()} - {new Date(selectedPolicy.endDate).toLocaleDateString()}
                </p>
              </div>
              
              {selectedPolicy.claims.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Claims History</Label>
                  <div className="space-y-2 mt-2">
                    {selectedPolicy.claims.map((claim) => (
                      <div key={claim.id} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">₦{claim.amount.toLocaleString()}</span>
                          <Badge variant={claim.status === 'approved' ? 'default' : claim.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {claim.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{claim.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Filed: {new Date(claim.filedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
