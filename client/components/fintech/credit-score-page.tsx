"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import {
  ArrowLeft,
  CreditCard,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  BarChart3,
  RefreshCw,
  Loader2,
  AlertCircle,
  Info,
  Shield,
  Zap
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"

interface CreditScore {
  score: number
  history: Array<{
    transactionId: string
    amount: number
    date: string
  }>
  updatedAt: string
}

export function CreditScorePage() {
  const { user } = useAuth()
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      fetchCreditScore()
    }
  }, [user])

  const fetchCreditScore = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get(`/api/fintech/credit-score/${user?.id}`)
      if (response.success) {
        setCreditScore(response.creditScore)
      } else {
        throw new Error(response.error || "Failed to fetch credit score")
      }
    } catch (error) {
      console.error("Credit score fetch error:", error)
      setError("Failed to load credit score data")
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

  const getScoreRange = (score: number) => {
    if (score >= 750) return { min: 750, max: 850, color: "bg-green-500" }
    if (score >= 700) return { min: 700, max: 749, color: "bg-blue-500" }
    if (score >= 650) return { min: 650, max: 699, color: "bg-yellow-500" }
    if (score >= 600) return { min: 600, max: 649, color: "bg-orange-500" }
    return { min: 300, max: 599, color: "bg-red-500" }
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading credit score data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!creditScore) {
    return (
      <DashboardLayout user={user}>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Credit Score Available</h2>
              <p className="text-muted-foreground mb-4">
                Your credit score will be calculated based on your farming activities and transaction history.
              </p>
              <Link href="/fintech">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Fintech
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const scoreRange = getScoreRange(creditScore.score)
  const progressPercentage = ((creditScore.score - scoreRange.min) / (scoreRange.max - scoreRange.min)) * 100

  return (
    <DashboardLayout user={user}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/fintech">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Credit Score</h1>
            <p className="text-muted-foreground">
              Your financial health and creditworthiness assessment
            </p>
          </div>
          
          <div className="ml-auto">
            <Button variant="outline" onClick={fetchCreditScore} disabled={loading}>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Credit Score Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Credit Score Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-6">
                  {/* Main Score Display */}
                  <div className="space-y-4">
                    <div className={`text-7xl font-bold ${getCreditScoreColor(creditScore.score)}`}>
                      {creditScore.score}
                    </div>
                    <div className="space-y-2">
                      <Badge className="text-lg px-4 py-2">
                        {getCreditScoreRating(creditScore.score)} Credit Rating
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(creditScore.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Score Range Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Score Range</span>
                      <span className="font-medium">{scoreRange.min} - {scoreRange.max}</span>
                    </div>
                    <div className="relative">
                      <Progress value={progressPercentage} className="h-3" />
                      <div 
                        className={`absolute top-0 left-0 w-3 h-3 rounded-full ${scoreRange.color} -mt-1`}
                        style={{ left: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your score is in the {getCreditScoreRating(creditScore.score).toLowerCase()} range
                    </p>
                  </div>

                  {/* Transaction Summary */}
                  <div className="flex items-center justify-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">
                      Based on <span className="font-medium">{creditScore.history.length}</span> transactions
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Transaction History
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  These transactions contribute to your credit score calculation
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {creditScore.history.length > 0 ? (
                    creditScore.history.map((transaction, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                          <div className="text-lg font-bold">₦{transaction.amount.toLocaleString()}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {transaction.transactionId}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No transaction history available</p>
                      <p className="text-sm text-muted-foreground">
                        Your credit score will be calculated once you have transaction activity
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score Rating Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Score Rating Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">750-850</span>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm">700-749</span>
                    <Badge className="bg-blue-100 text-blue-800">Good</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm">650-699</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <span className="text-sm">600-649</span>
                    <Badge className="bg-orange-100 text-orange-800">Poor</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm">300-599</span>
                    <Badge className="bg-red-100 text-red-800">Very Poor</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How Credit Score Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Transaction History</p>
                        <p className="text-xs text-muted-foreground">
                          Your credit score is calculated based on your marketplace transactions and payment history
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Regular Activity</p>
                        <p className="text-xs text-muted-foreground">
                          Consistent marketplace activity and timely payments improve your score
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Trust Building</p>
                        <p className="text-xs text-muted-foreground">
                          Higher scores unlock better financial services and loan opportunities
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/fintech/apply-loan">
                    <Button className="w-full" variant="outline">
                      Apply for Loan Referral
                    </Button>
                  </Link>
                  <Link href="/fintech">
                    <Button className="w-full" variant="outline">
                      Back to Fintech
                    </Button>
                  </Link>
                  <Link href="/marketplace">
                    <Button className="w-full" variant="outline">
                      Visit Marketplace
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
