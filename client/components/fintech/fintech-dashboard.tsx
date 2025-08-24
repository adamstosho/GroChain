"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  Shield,
  FileText,
  Calculator,
  ArrowRight,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
  PiggyBank,
  Target,
  BarChart3
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface CreditScore {
  score: number
  history: Array<{
    transactionId: string
    amount: number
    date: string
  }>
  updatedAt: string
}

interface LoanReferral {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid'
  createdAt: string
  updatedAt: string
}

export function FintechDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null)
  const [loanReferrals, setLoanReferrals] = useState<LoanReferral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [financialHealth, setFinancialHealth] = useState<any>(null)
  const [loanApplications, setLoanApplications] = useState<any[]>([])
  const [showLoanModal, setShowLoanModal] = useState(false)
  const [applyingLoan, setApplyingLoan] = useState(false)
  const [loanForm, setLoanForm] = useState({
    amount: '',
    purpose: '',
    duration: '',
    collateral: '',
    description: ''
  })

  useEffect(() => {
    if (user) {
      fetchFintechData()
    }
  }, [user])

  const fetchFintechData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch credit score data
      const creditResponse = await api.getCreditScore(user?.id || '');
      if (creditResponse.success) {
        setCreditScore(creditResponse.data);
      }

      // Fetch financial health data
      try {
        const healthResponse = await api.get("/api/fintech/financial-health")
        if (healthResponse.success) {
          setFinancialHealth(healthResponse.data)
        }
      } catch (error) {
        console.log("Financial health not available yet")
      }

      // Fetch loan applications
      try {
        const loansResponse = await api.getLoanApplications(user?.id)
        if (loansResponse.success) {
          setLoanApplications(loansResponse.data || [])
        }
      } catch (error) {
        console.log("Loan applications not available yet")
        setLoanApplications([])
      }

      // Note: Backend doesn't have loan-applications endpoint yet
      // We'll show a message that this feature is coming soon
      setLoanReferrals([])

    } catch (error) {
      console.error("Fintech data fetch error:", error)
      setError("Failed to load financial data. Some features may not be available yet.")
    } finally {
      setLoading(false)
    }
  }

  const applyForLoan = async () => {
    try {
      setApplyingLoan(true)
      
      const response = await api.submitLoanApplication({
        farmerId: user?.id,
        amount: parseFloat(loanForm.amount),
        purpose: loanForm.purpose,
        duration: loanForm.duration,
        collateral: loanForm.collateral,
        description: loanForm.description
      })

      if (response.success) {
        toast.success("Loan application submitted successfully!")
        setShowLoanModal(false)
        setLoanForm({
          amount: '',
          purpose: '',
          duration: '',
          collateral: '',
          description: ''
        })
        fetchFintechData() // Refresh data
      } else {
        toast.error(response.error || "Failed to submit loan application")
      }
    } catch (error) {
      console.error("Loan application error:", error)
      toast.error("Failed to submit loan application")
    } finally {
      setApplyingLoan(false)
    }
  }

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return "text-green-600"
    if (score >= 700) return "text-blue-600"
    if (score >= 650) return "text-yellow-600"
    if (score >= 600) return "text-orange-600"
    return "text-red-600"
  }

  const getCreditScoreRating = (score: number) => {
    if (score >= 750) return "Excellent"
    if (score >= 700) return "Good"
    if (score >= 650) return "Fair"
    if (score >= 600) return "Poor"
    return "Very Poor"
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      disbursed: "bg-blue-100 text-blue-800",
      repaid: "bg-gray-100 text-gray-800"
    }
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading financial data...</p>
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
            <h1 className="text-3xl font-bold">Fintech Services</h1>
            <p className="text-muted-foreground">
              Access credit scores and financial services for your farming business
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchFintechData} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/fintech/credit-score">
            <Button>
              <CreditCard className="w-4 h-4 mr-2" />
              View Credit Score
            </Button>
          </Link>
          <Link href="/fintech/apply-loan">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Apply for Loan Referral
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="credit" className="text-xs sm:text-sm">
              Credit Score
            </TabsTrigger>
            <TabsTrigger value="loans" className="text-xs sm:text-sm">
              Loan Referrals
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs sm:text-sm">
              Financial Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Credit Score Overview */}
            {creditScore ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Credit Score Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getCreditScoreColor(creditScore.score)}`}>
                          {creditScore.score}
                        </div>
                        <p className="text-sm text-muted-foreground">Current Score</p>
                        <Badge className="mt-2">{getCreditScoreRating(creditScore.score)}</Badge>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {creditScore.history?.length || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {creditScore.updatedAt ? new Date(creditScore.updatedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          ₦{(creditScore.history?.reduce((total, tx) => total + (tx.amount || 0), 0) || 0).toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Volume</p>
                        <p className="text-xs text-muted-foreground">
                          Based on transaction history
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No credit score available yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your credit score will be calculated based on your transaction history
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Loan Referrals Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Loan Referrals Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{loanReferrals?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Referrals</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {loanReferrals?.filter(l => l.status === 'approved')?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Approved</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {loanReferrals?.filter(l => l.status === 'pending')?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        ₦{(loanReferrals?.reduce((total, referral) => total + (referral.amount || 0), 0) || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Requested</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Coming Soon Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Coming Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Financial Health Dashboard</h4>
                      <p className="text-sm text-muted-foreground">
                        Track your net worth, savings rate, and debt-to-income ratio
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium mb-2">Direct Loan Applications</h4>
                      <p className="text-sm text-muted-foreground">
                        Apply directly for loans through our partner financial institutions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="credit" className="space-y-6">
            {creditScore ? (
              <div className="space-y-6">
                {/* Credit Score Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Credit Score Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Score Display */}
                      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                        <div className={`text-6xl font-bold ${getCreditScoreColor(creditScore?.score || 0)}`}>
                          {creditScore?.score || 0}
                        </div>
                        <p className="text-xl text-muted-foreground mt-2">
                          {getCreditScoreRating(creditScore?.score || 0)} Credit Rating
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Last updated: {creditScore?.updatedAt ? new Date(creditScore.updatedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>

                      {/* Transaction History */}
                      <div>
                        <h4 className="font-medium mb-3">Transaction History</h4>
                        <div className="space-y-2">
                          {creditScore?.history?.map((transaction, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                              <span className="text-sm">{new Date(transaction.date).toLocaleDateString()}</span>
                              <span className="font-medium">₦{(transaction.amount || 0).toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground">ID: {transaction.transactionId}</span>
                            </div>
                          )) || (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No transaction history available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-2">No credit score data available</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your credit score will be calculated based on your farming activities and transaction history
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="loans" className="space-y-6">
            <div className="space-y-6">
              {/* Loan Referrals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Loan Referrals</span>
                    <Link href="/fintech/apply-loan">
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Apply for Referral
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loanReferrals?.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-2">No loan referrals yet</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Apply for your first loan referral to get started with financial services
                      </p>
                      <Link href="/fintech/apply-loan">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Apply for Loan Referral
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {loanReferrals?.map((referral) => (
                        <div
                          key={referral.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <DollarSign className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Loan Referral</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>₦{(referral.amount || 0).toLocaleString()}</span>
                                <span>{referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusBadge(referral.status)}>
                              {referral.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            {financialHealth ? (
              <div className="space-y-6">
                {/* Financial Health Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Financial Health Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {financialHealth.netWorth ? `₦${financialHealth.netWorth.toLocaleString()}` : 'N/A'}
                        </div>
                        <p className="text-sm text-blue-700">Net Worth</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {financialHealth.savingsRate ? `${financialHealth.savingsRate}%` : 'N/A'}
                        </div>
                        <p className="text-sm text-green-700">Savings Rate</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {financialHealth.debtToIncome ? `${financialHealth.debtToIncome}%` : 'N/A'}
                        </div>
                        <p className="text-sm text-purple-700">Debt-to-Income</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Monthly Income</span>
                        <span className="font-medium">₦{(financialHealth.monthlyIncome || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Monthly Expenses</span>
                        <span className="font-medium">₦{(financialHealth.monthlyExpenses || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Savings</span>
                        <span className="font-medium">₦{(financialHealth.totalSavings || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Debt</span>
                        <span className="font-medium">₦{(financialHealth.totalDebt || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-2">Financial health data not available</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete more transactions to build your financial health profile
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

        {/* Loan Application Modal */}
        <Dialog open={showLoanModal} onOpenChange={setShowLoanModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Apply for Loan Referral</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Loan Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={loanForm.amount}
                    onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Loan Duration</Label>
                  <Select value={loanForm.duration} onValueChange={(value) => setLoanForm({ ...loanForm, duration: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="purpose">Loan Purpose</Label>
                <Select value={loanForm.purpose} onValueChange={(value) => setLoanForm({ ...loanForm, purpose: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Farm Equipment</SelectItem>
                    <SelectItem value="seeds">Seeds & Fertilizers</SelectItem>
                    <SelectItem value="expansion">Farm Expansion</SelectItem>
                    <SelectItem value="storage">Storage Facilities</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="collateral">Collateral (Optional)</Label>
                <Input
                  id="collateral"
                  placeholder="Describe any collateral"
                  value={loanForm.collateral}
                  onChange={(e) => setLoanForm({ ...loanForm, collateral: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide additional details about your loan request"
                  value={loanForm.description}
                  onChange={(e) => setLoanForm({ ...loanForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowLoanModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={applyForLoan}
                  disabled={applyingLoan || !loanForm.amount || !loanForm.purpose || !loanForm.duration}
                >
                  {applyingLoan ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </DashboardLayout>
  )
}
