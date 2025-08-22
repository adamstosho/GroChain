"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Alert, AlertDescription } from "@/components/ui/Alert"
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
  BarChart3,
  Zap
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"
import { LoanManagement } from "./loan-management"
import { InsurancePortal } from "./insurance-portal"
import { AdvancedFinancialTools } from "./advanced-financial-tools"

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

  useEffect(() => {
    if (user) {
      fetchFintechData()
    }
  }, [user])

  const fetchFintechData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch credit score data using proper API client method
      const creditResponse = await api.getCreditScore(user?.id || "")
      if (creditResponse.success && creditResponse.data) {
        setCreditScore(creditResponse.data)
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
              Access credit scores, loans, insurance, and financial services for your farming business
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="credit" className="text-xs sm:text-sm">
              Credit Score
            </TabsTrigger>
            <TabsTrigger value="loans" className="text-xs sm:text-sm">
              Loans
            </TabsTrigger>
            <TabsTrigger value="insurance" className="text-xs sm:text-sm">
              Insurance
            </TabsTrigger>
            <TabsTrigger value="financial-tools" className="text-xs sm:text-sm">
              Financial Tools
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
                          {creditScore.history.length}
                        </div>
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {new Date(creditScore.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          ₦{creditScore.history.reduce((total, tx) => total + tx.amount, 0).toLocaleString()}
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

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => setActiveTab("loans")}
                    >
                      <Plus className="w-6 h-6" />
                      <span>Apply for Loan</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => setActiveTab("insurance")}
                    >
                      <Shield className="w-6 h-6" />
                      <span>Get Insurance</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => setActiveTab("financial-tools")}
                    >
                      <Calculator className="w-6 h-6" />
                      <span>Financial Tools</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => setActiveTab("credit")}
                    >
                      <CreditCard className="w-6 h-6" />
                      <span>Credit Score</span>
                    </Button>
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
                        <div className={`text-6xl font-bold ${getCreditScoreColor(creditScore.score)}`}>
                          {creditScore.score}
                        </div>
                        <p className="text-xl text-muted-foreground mt-2">
                          {getCreditScoreRating(creditScore.score)} Credit Rating
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Last updated: {new Date(creditScore.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Transaction History */}
                      <div>
                        <h4 className="font-medium mb-3">Transaction History</h4>
                        <div className="space-y-2">
                          {creditScore.history.map((transaction, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                              <span className="text-sm">{new Date(transaction.date).toLocaleDateString()}</span>
                              <span className="font-medium">₦{transaction.amount.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground">ID: {transaction.transactionId}</span>
                            </div>
                          ))}
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
            <LoanManagement />
          </TabsContent>

          <TabsContent value="insurance" className="space-y-6">
            <InsurancePortal />
          </TabsContent>

          <TabsContent value="financial-tools" className="space-y-6">
            <AdvancedFinancialTools />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
