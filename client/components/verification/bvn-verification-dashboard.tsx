"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { 
  Shield, 
  UserCheck, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Eye,
  Upload,
  Download,
  RefreshCw,
  Calendar,
  Phone,
  CreditCard,
  Loader2,
  AlertTriangle,
  Info,
  Lock,
  CheckSquare,
  Square
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface BVNVerification {
  id: string
  bvn: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  phoneNumber: string
  documentType: 'national_id' | 'passport' | 'drivers_license' | 'voter_card'
  documentNumber?: string
  bankName?: string
  accountNumber?: string
  verificationStatus: 'pending' | 'verified' | 'failed' | 'manual_review'
  verificationMethod: 'online' | 'offline' | 'manual'
  verificationId: string
  adminNotes?: string
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  attemptsCount: number
  lastAttempt: string
  verifiedAt?: string
  user: string
  partner?: string
}

interface VerificationFormData {
  bvn: string
  firstName: string
  lastName: string
  middleName: string
  dateOfBirth: string
  phoneNumber: string
  documentType: 'national_id' | 'passport' | 'drivers_license' | 'voter_card'
  documentNumber: string
  bankName: string
  accountNumber: string
}

interface VerificationStats {
  totalVerifications: number
  verified: number
  pending: number
  failed: number
  manualReview: number
  successRate: number
  averageProcessingTime: number
}

export function BVNVerificationDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [verifications, setVerifications] = useState<BVNVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [verificationStats, setVerificationStats] = useState<VerificationStats>({
    totalVerifications: 0,
    verified: 0,
    pending: 0,
    failed: 0,
    manualReview: 0,
    successRate: 0,
    averageProcessingTime: 0
  })
  const [formData, setFormData] = useState<VerificationFormData>({
    bvn: "",
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    phoneNumber: "",
    documentType: "national_id",
    documentNumber: "",
    bankName: "",
    accountNumber: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (user) {
      fetchVerificationData()
    }
  }, [user])

  const fetchVerificationData = async () => {
    try {
      setLoading(true)
      setError("")

      // Since backend has limited verification endpoints, we'll use mock data for now
      // In production: const response = await api.getVerificationStatus(user.id)
      
      const mockVerifications = generateMockVerifications()
      setVerifications(mockVerifications)
      calculateVerificationStats(mockVerifications)
    } catch (error) {
      console.error("Verification fetch error:", error)
      setError("Failed to load verification data")
      toast.error("Failed to load verification data")
    } finally {
      setLoading(false)
    }
  }

  const generateMockVerifications = (): BVNVerification[] => {
    const statuses: BVNVerification['verificationStatus'][] = ['pending', 'verified', 'failed', 'manual_review']
    const methods: BVNVerification['verificationMethod'][] = ['online', 'offline', 'manual']
    const documentTypes: BVNVerification['documentType'][] = ['national_id', 'passport', 'drivers_license', 'voter_card']
    const names = ['Adunni', 'Ibrahim', 'Grace', 'John', 'Kemi', 'Bello', 'Fatima', 'Emeka', 'Tunde', 'Aisha']
    
    return Array.from({ length: 15 }, (_, index) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      const reviewedDate = status !== 'pending' ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined
      
      return {
        id: `ver_${String(index + 1).padStart(3, '0')}`,
        bvn: `${Math.floor(Math.random() * 90000000000) + 10000000000}`,
        firstName: names[Math.floor(Math.random() * names.length)],
        lastName: names[Math.floor(Math.random() * names.length)],
        middleName: Math.random() > 0.5 ? names[Math.floor(Math.random() * names.length)] : undefined,
        dateOfBirth: new Date(1980 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        phoneNumber: `+234${Math.floor(Math.random() * 900000000) + 700000000}`,
        documentType: documentTypes[Math.floor(Math.random() * documentTypes.length)],
        documentNumber: Math.random() > 0.3 ? `${Math.floor(Math.random() * 900000000) + 100000000}` : undefined,
        bankName: Math.random() > 0.4 ? ['First Bank', 'GT Bank', 'Zenith Bank', 'Access Bank', 'UBA'][Math.floor(Math.random() * 5)] : undefined,
        accountNumber: Math.random() > 0.4 ? `${Math.floor(Math.random() * 9000000000) + 1000000000}` : undefined,
        verificationStatus: status,
        verificationMethod: methods[Math.floor(Math.random() * methods.length)],
        verificationId: `VER_${Date.now().toString().slice(-6)}${String(index + 1).padStart(3, '0')}`,
        adminNotes: status === 'manual_review' ? 'Requires additional document verification' : undefined,
        submittedAt: createdDate.toISOString(),
        reviewedAt: reviewedDate?.toISOString(),
        reviewedBy: status !== 'pending' ? 'Admin User' : undefined,
        attemptsCount: Math.floor(Math.random() * 3) + 1,
        lastAttempt: new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        verifiedAt: status === 'verified' ? reviewedDate?.toISOString() : undefined,
        user: `user_${index + 1}`,
        partner: Math.random() > 0.7 ? `partner_${Math.floor(Math.random() * 5) + 1}` : undefined
      }
    })
  }

  const calculateVerificationStats = (verificationList: BVNVerification[]) => {
    const stats: VerificationStats = {
      totalVerifications: verificationList.length,
      verified: verificationList.filter(v => v.verificationStatus === 'verified').length,
      pending: verificationList.filter(v => v.verificationStatus === 'pending').length,
      failed: verificationList.filter(v => v.verificationStatus === 'failed').length,
      manualReview: verificationList.filter(v => v.verificationStatus === 'manual_review').length,
      successRate: 0,
      averageProcessingTime: 0
    }

    stats.successRate = Math.round((stats.verified / stats.totalVerifications) * 100)

    // Calculate average processing time for completed verifications
    const completedVerifications = verificationList.filter(v => v.reviewedAt && v.submittedAt)
    if (completedVerifications.length > 0) {
      const totalTime = completedVerifications.reduce((sum, v) => {
        const submitted = new Date(v.submittedAt).getTime()
        const reviewed = new Date(v.reviewedAt!).getTime()
        return sum + (reviewed - submitted)
      }, 0)
      stats.averageProcessingTime = Math.round(totalTime / completedVerifications.length / (1000 * 60 * 60 * 24)) // days
    }

    setVerificationStats(stats)
  }

  const handleInputChange = (field: keyof VerificationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      toast.success(`Document selected: ${file.name}`)
    }
  }

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.bvn || !formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.phoneNumber) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.bvn.length !== 11 || !/^\d+$/.test(formData.bvn)) {
      toast.error("BVN must be exactly 11 digits")
      return
    }

    try {
      setSubmitting(true)

      // In production: const response = await api.verifyBVN(formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success("BVN verification submitted successfully!")
      
      // Reset form
      setFormData({
        bvn: "",
        firstName: "",
        lastName: "",
        middleName: "",
        dateOfBirth: "",
        phoneNumber: "",
        documentType: "national_id",
        documentNumber: "",
        bankName: "",
        accountNumber: ""
      })
      setSelectedFile(null)
      
      // Refresh verification data
      fetchVerificationData()
    } catch (error) {
      console.error("Verification submission error:", error)
      toast.error("Failed to submit verification. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: BVNVerification['verificationStatus']) => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-500">Verified</Badge>
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>
      case "manual_review":
        return <Badge variant="secondary" className="bg-blue-500">Manual Review</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: BVNVerification['verificationStatus']) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "manual_review":
        return <Eye className="h-4 w-4 text-blue-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (!user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading verification dashboard...</p>
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
            <h1 className="text-3xl font-bold">BVN Verification & Compliance</h1>
            <p className="text-muted-foreground">
              Manage identity verification, KYC compliance, and regulatory requirements
            </p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={fetchVerificationData} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Verification Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verificationStats.totalVerifications}</div>
              <p className="text-xs text-muted-foreground">
                All time verifications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{verificationStats.verified}</div>
              <p className="text-xs text-muted-foreground">
                Successfully verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{verificationStats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Verification success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{verificationStats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="verify">Verify BVN</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Verifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {verifications.slice(0, 5).map((verification) => (
                        <div key={verification.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(verification.verificationStatus)}
                            <div>
                              <p className="font-medium">{verification.firstName} {verification.lastName}</p>
                              <p className="text-sm text-muted-foreground">
                                BVN: {verification.bvn.slice(0, 4)}***{verification.bvn.slice(-4)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(verification.verificationStatus)}
                            <Button asChild size="sm" variant="outline">
                              <span>
                                <Eye className="h-4 w-4" />
                              </span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Manual Review Required</span>
                        <span className="text-sm font-bold text-blue-600">{verificationStats.manualReview}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Failed Verifications</span>
                        <span className="text-sm font-bold text-red-600">{verificationStats.failed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Avg Processing Time</span>
                        <span className="text-sm font-bold">{verificationStats.averageProcessingTime} days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="verify" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>BVN Verification Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitVerification} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bvn">BVN Number *</Label>
                        <Input
                          id="bvn"
                          type="text"
                          placeholder="Enter 11-digit BVN"
                          value={formData.bvn}
                          onChange={(e) => handleInputChange('bvn', e.target.value)}
                          maxLength={11}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Your 11-digit Bank Verification Number
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Enter first name"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Enter last name"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="middleName">Middle Name</Label>
                        <Input
                          id="middleName"
                          type="text"
                          placeholder="Enter middle name (optional)"
                          value={formData.middleName}
                          onChange={(e) => handleInputChange('middleName', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Must be 18 years or older
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="+2348012345678"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="documentType">Document Type</Label>
                        <Select value={formData.documentType} onValueChange={(value) => handleInputChange('documentType', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="national_id">National ID Card</SelectItem>
                            <SelectItem value="passport">International Passport</SelectItem>
                            <SelectItem value="drivers_license">Driver's License</SelectItem>
                            <SelectItem value="voter_card">Voter's Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="documentNumber">Document Number</Label>
                        <Input
                          id="documentNumber"
                          type="text"
                          placeholder="Enter document number"
                          value={formData.documentNumber}
                          onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          type="text"
                          placeholder="Enter bank name"
                          value={formData.bankName}
                          onChange={(e) => handleInputChange('bankName', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          type="text"
                          placeholder="Enter account number"
                          value={formData.accountNumber}
                          onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document">Upload Supporting Document</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                        </p>
                        <input
                          type="file"
                          id="document"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('document')?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: PDF, JPG, JPEG, PNG (Max 5MB)
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CheckSquare className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">
                        I confirm that all information provided is accurate and complete
                      </span>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Submit Verification
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : verifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No verifications found</p>
                      </div>
                    ) : (
                      verifications.map((verification) => (
                        <div key={verification.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-muted rounded-lg">
                                {getStatusIcon(verification.verificationStatus)}
                              </div>
                              <div>
                                <h3 className="font-medium">{verification.firstName} {verification.lastName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  BVN: {verification.bvn.slice(0, 4)}***{verification.bvn.slice(-4)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Method: {verification.verificationMethod}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(verification.verificationStatus)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium mb-2">Contact Information</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Phone:</span> {verification.phoneNumber}</p>
                                <p><span className="font-medium">DOB:</span> {new Date(verification.dateOfBirth).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Verification Details</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">ID:</span> {verification.verificationId}</p>
                                <p><span className="font-medium">Attempts:</span> {verification.attemptsCount}</p>
                                <p><span className="font-medium">Submitted:</span> {new Date(verification.submittedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Status Information</h4>
                              <div className="space-y-1 text-sm">
                                {verification.reviewedAt && (
                                  <p><span className="font-medium">Reviewed:</span> {new Date(verification.reviewedAt).toLocaleDateString()}</p>
                                )}
                                {verification.reviewedBy && (
                                  <p><span className="font-medium">By:</span> {verification.reviewedBy}</p>
                                )}
                                {verification.adminNotes && (
                                  <p><span className="font-medium">Notes:</span> {verification.adminNotes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Comprehensive compliance reporting and regulatory monitoring
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Coming soon: Regulatory reports, audit trails, and compliance analytics
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
