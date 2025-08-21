"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calculator,
  FileText,
  DollarSign,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  Shield,
  Clock
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"

interface LoanReferralRequest {
  amount: number
  purpose: string
  description: string
  farmSize: number
  cropType: string
  season: string
  expectedReturn: number
}

const LOAN_PURPOSES = [
  "Equipment Purchase",
  "Seed & Fertilizer",
  "Irrigation System",
  "Storage Facilities",
  "Land Expansion",
  "Livestock Purchase",
  "Processing Equipment",
  "Transportation",
  "Other"
]

const CROP_TYPES = [
  "Maize",
  "Rice",
  "Cassava",
  "Yam",
  "Sorghum",
  "Millet",
  "Groundnut",
  "Soybean",
  "Vegetables",
  "Fruits",
  "Other"
]

const SEASONS = [
  "Early Rainy Season",
  "Late Rainy Season",
  "Dry Season",
  "Year-round"
]

export function LoanApplicationForm() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<LoanReferralRequest>({
    amount: 0,
    purpose: "",
    description: "",
    farmSize: 0,
    cropType: "",
    season: "",
    expectedReturn: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [referralId, setReferralId] = useState("")

  const handleInputChange = (field: keyof LoanReferralRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateMonthlyPayment = () => {
    if (formData.amount === 0) return 0
    
    // Simple interest calculation (12% annual rate)
    const annualRate = 0.12
    const monthlyRate = annualRate / 12
    const totalInterest = formData.amount * annualRate
    const totalAmount = formData.amount + totalInterest
    
    return totalAmount / 12 // Assuming 12 months
  }

  const calculateTotalInterest = () => {
    if (formData.amount === 0) return 0
    
    const annualRate = 0.12
    return formData.amount * annualRate
  }

  const validateForm = () => {
    if (formData.amount < 50000) {
      setError("Minimum loan amount is ₦50,000")
      return false
    }
    if (formData.amount > 5000000) {
      setError("Maximum loan amount is ₦5,000,000")
      return false
    }
    if (!formData.purpose) {
      setError("Please select a loan purpose")
      return false
    }
    if (!formData.description) {
      setError("Please provide a detailed description")
      return false
    }
    if (formData.farmSize === 0) {
      setError("Please enter your farm size")
      return false
    }
    if (!formData.cropType) {
      setError("Please select a crop type")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      setError("")

      const response = await api.post("/api/fintech/loan-referrals", {
        farmer: user?.id,
        amount: formData.amount
      })

      if (response.success) {
        setSuccess(true)
        setReferralId(response.referral?.id || "REF-" + Date.now())
        toast.success("Loan referral submitted successfully!")
      } else {
        setError(response.error || "Failed to submit loan referral")
      }
    } catch (error) {
      console.error("Loan referral error:", error)
      setError("Failed to submit loan referral. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <DashboardLayout user={user}>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Referral Submitted Successfully!
              </h2>
              <p className="text-green-700 mb-4">
                Your loan referral has been received and is under review.
              </p>
              
              <div className="bg-white p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">Referral ID</p>
                <p className="font-mono font-bold text-lg">{referralId}</p>
              </div>

              <div className="space-y-3 text-left bg-white p-4 rounded-lg mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Amount:</span>
                  <span className="font-semibold">₦{formData.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Purpose:</span>
                  <span className="font-semibold">{formData.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Farm Size:</span>
                  <span className="font-semibold">{formData.farmSize} hectares</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-green-700">
                  We'll review your referral and contact you within 2-3 business days.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/fintech">
                    <Button variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Fintech
                    </Button>
                  </Link>
                  <Link href="/fintech">
                    <Button>
                      View Referrals
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/fintech">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Apply for Loan Referral</h1>
            <p className="text-muted-foreground">
              Get referred to our partner financial institutions for agricultural loans
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Loan Referral Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Loan Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Loan Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="500,000"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", parseInt(e.target.value) || 0)}
                      min="50000"
                      max="5000000"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum: ₦50,000 | Maximum: ₦5,000,000
                    </p>
                  </div>

                  {/* Loan Purpose */}
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Loan Purpose</Label>
                    <Select value={formData.purpose} onValueChange={(value) => handleInputChange("purpose", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOAN_PURPOSES.map((purpose) => (
                          <SelectItem key={purpose} value={purpose}>
                            {purpose}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Farm Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="farmSize">Farm Size (hectares)</Label>
                      <Input
                        id="farmSize"
                        type="number"
                        placeholder="5"
                        value={formData.farmSize}
                        onChange={(e) => handleInputChange("farmSize", parseFloat(e.target.value) || 0)}
                        min="0.1"
                        step="0.1"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cropType">Primary Crop</Label>
                      <Select value={formData.cropType} onValueChange={(value) => handleInputChange("cropType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CROP_TYPES.map((crop) => (
                            <SelectItem key={crop} value={crop}>
                              {crop}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Season */}
                  <div className="space-y-2">
                    <Label htmlFor="season">Growing Season</Label>
                    <Select value={formData.season} onValueChange={(value) => handleInputChange("season", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select growing season" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEASONS.map((season) => (
                          <SelectItem key={season} value={season}>
                            {season}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Expected Return */}
                  <div className="space-y-2">
                    <Label htmlFor="expectedReturn">Expected Monthly Return (₦)</Label>
                    <Input
                      id="expectedReturn"
                      type="number"
                      placeholder="75,000"
                      value={formData.expectedReturn}
                      onChange={(e) => handleInputChange("expectedReturn", parseInt(e.target.value) || 0)}
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Estimate your expected monthly income from this investment
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide a detailed description of how you plan to use the loan and your farming experience..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Explain your farming plan, experience, and how the loan will help your business
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting Referral...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Submit Loan Referral
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Loan Calculator & Info */}
          <div className="space-y-6">
            {/* Loan Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Loan Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Loan Amount:</span>
                    <span className="font-medium">₦{formData.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Interest Rate:</span>
                    <span className="font-medium">12% per year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Term:</span>
                    <span className="font-medium">12 months</span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Interest:</span>
                    <span className="font-medium">₦{calculateTotalInterest().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Repayment:</span>
                    <span className="font-medium">₦{(formData.amount + calculateTotalInterest()).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Payment:</span>
                    <span className="font-medium">₦{calculateMonthlyPayment().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Referral Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Minimum farming experience: 1 year</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Valid identification documents</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Proof of land ownership/lease</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Business plan or farming plan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Credit score above 600</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2-3</div>
                    <p className="text-sm text-blue-700">Business Days</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    We'll review your referral and contact you within 2-3 business days with next steps.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
