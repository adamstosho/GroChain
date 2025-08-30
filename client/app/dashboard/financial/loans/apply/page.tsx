"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, CreditCard, Calculator, FileText, CheckCircle, AlertCircle, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface LoanApplicationForm {
  amount: number
  purpose: string
  term: number
  description: string
  collateral: string
  monthlyIncome: number
  existingLoans: number
}

const loanPurposes = [
  "Working Capital",
  "Equipment Purchase",
  "Farm Expansion",
  "Input Purchase",
  "Infrastructure Development",
  "Emergency Funds",
  "Seasonal Operations",
  "Technology Investment"
]

const loanTerms = [3, 6, 12, 18, 24, 36, 48, 60]

export default function LoanApplicationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<LoanApplicationForm>({
    amount: 0,
    purpose: "",
    term: 12,
    description: "",
    collateral: "",
    monthlyIncome: 0,
    existingLoans: 0
  })
  
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.purpose || !formData.term) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      const response = await apiService.createLoanApplication({
        amount: formData.amount,
        purpose: formData.purpose,
        term: formData.term,
        description: formData.description
      })
      
      toast({
        title: "Loan Application Submitted! 🎉",
        description: "Your application has been received and is under review.",
        variant: "default"
      })
      
      router.push("/dashboard/financial/loans")
    } catch (error) {
      console.error("Failed to submit loan application:", error)
      toast({
        title: "Application Failed",
        description: (error as any)?.message || "Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyPayment = () => {
    if (!formData.amount || !formData.term) return 0
    
    // Simple interest calculation (replace with actual loan calculator)
    const annualInterestRate = 0.15 // 15% APR
    const monthlyInterestRate = annualInterestRate / 12
    const totalInterest = formData.amount * annualInterestRate * (formData.term / 12)
    const totalAmount = formData.amount + totalInterest
    
    return Math.round(totalAmount / formData.term)
  }

  const getLoanEligibility = () => {
    if (!formData.monthlyIncome || !formData.amount) return "unknown"
    
    const monthlyPayment = calculateMonthlyPayment()
    const debtToIncomeRatio = (monthlyPayment + formData.existingLoans) / formData.monthlyIncome
    
    if (debtToIncomeRatio <= 0.3) return "excellent"
    if (debtToIncomeRatio <= 0.4) return "good"
    if (debtToIncomeRatio <= 0.5) return "fair"
    return "poor"
  }

  const getEligibilityColor = (eligibility: string) => {
    switch (eligibility) {
      case "excellent": return "text-emerald-600"
      case "good": return "text-blue-600"
      case "fair": return "text-amber-600"
      case "poor": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getEligibilityLabel = (eligibility: string) => {
    switch (eligibility) {
      case "excellent": return "Excellent"
      case "good": return "Good"
      case "fair": return "Fair"
      case "poor": return "Poor"
      default: return "Unknown"
    }
  }

  return (
    <DashboardLayout pageTitle="Apply for Loan">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
                <Link href="/dashboard/financial" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Financial Services
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Apply for Loan</h1>
            <p className="text-gray-600">
              Access affordable financing to grow your farming business
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loan Application Form */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  Loan Application Details
                </CardTitle>
                <CardDescription>
                  Fill in your loan requirements and personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Loan Amount (NGN) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        placeholder="e.g., 500000"
                        min="10000"
                        step="10000"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Loan Purpose *</Label>
                      <Select 
                        value={formData.purpose} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          {loanPurposes.map((purpose) => (
                            <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="term">Loan Term (Months) *</Label>
                      <Select 
                        value={formData.term.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, term: Number(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {loanTerms.map((term) => (
                            <SelectItem key={term} value={term.toString()}>{term} months</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">Monthly Income (NGN)</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        value={formData.monthlyIncome}
                        onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
                        placeholder="e.g., 150000"
                        min="0"
                        step="10000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Explain how you plan to use this loan and how it will benefit your farming business..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collateral">Collateral (Optional)</Label>
                      <Input
                        id="collateral"
                        value={formData.collateral}
                        onChange={(e) => setFormData(prev => ({ ...prev, collateral: e.target.value }))}
                        placeholder="e.g., Farm equipment, land title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="existingLoans">Existing Monthly Loan Payments (NGN)</Label>
                      <Input
                        id="existingLoans"
                        type="number"
                        value={formData.existingLoans}
                        onChange={(e) => setFormData(prev => ({ ...prev, existingLoans: Number(e.target.value) }))}
                        placeholder="e.g., 25000"
                        min="0"
                        step="1000"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => router.push("/dashboard/financial")} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Loan Calculator & Eligibility */}
          <div className="space-y-6">
            {/* Loan Calculator */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Calculator className="h-4 w-4 text-green-500" />
                  Loan Calculator
                </CardTitle>
                <CardDescription>Estimate your monthly payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Loan Amount:</span>
                    <span className="font-medium">₦{formData.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Term:</span>
                    <span className="font-medium">{formData.term} months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="font-medium">15% APR</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Estimated Monthly Payment:</span>
                      <span className="text-green-600">₦{calculateMonthlyPayment().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eligibility Checker */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Eligibility Checker
                </CardTitle>
                <CardDescription>Quick assessment of your loan eligibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {formData.monthlyIncome > 0 && formData.amount > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Debt-to-Income Ratio:</span>
                      <span className="font-medium">
                        {((calculateMonthlyPayment() + formData.existingLoans) / formData.monthlyIncome * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Eligibility:</span>
                      <span className={`font-medium ${getEligibilityColor(getLoanEligibility())}`}>
                        {getEligibilityLabel(getLoanEligibility())}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Enter your monthly income and loan amount to check eligibility.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Loan Benefits */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Info className="h-4 w-4 text-blue-500" />
                  Why Choose Our Loans?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Competitive interest rates starting at 15% APR</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Quick approval process within 48 hours</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Flexible repayment terms up to 5 years</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>No hidden fees or prepayment penalties</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Required Documents */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <FileText className="h-4 w-4 text-amber-500" />
                  Required Documents
                </CardTitle>
                <CardDescription>Documents needed for loan processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Valid government ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Proof of income (bank statements)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Farm registration documents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Business plan (for large amounts)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
