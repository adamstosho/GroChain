"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Download,
  Calendar,
  Filter,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface Commission {
  id: string
  type: "earned" | "withdrawn"
  amount: number
  description: string
  date: string
  status: "completed" | "pending" | "processing"
  partnerId?: string
  partnerName?: string
}

interface CommissionSummary {
  totalEarned: number
  totalWithdrawn: number
  availableBalance: number
  pendingAmount: number
  thisMonth: number
  lastMonth: number
}

const mockCommissions: Commission[] = [
  {
    id: "1",
    type: "earned",
    amount: 2500,
    description: "Commission from Adunni Farms sales",
    date: "2025-01-15T10:30:00Z",
    status: "completed",
    partnerId: "partner_1",
    partnerName: "Adunni Adebayo",
  },
  {
    id: "2",
    type: "withdrawn",
    amount: -15000,
    description: "Withdrawal to bank account",
    date: "2025-01-14T14:20:00Z",
    status: "completed",
  },
  {
    id: "3",
    type: "earned",
    amount: 3200,
    description: "Commission from Grace Farms sales",
    date: "2025-01-13T16:45:00Z",
    status: "completed",
    partnerId: "partner_3",
    partnerName: "Grace Okafor",
  },
  {
    id: "4",
    type: "earned",
    amount: 1800,
    description: "Commission from Ibrahim Agro sales",
    date: "2025-01-12T09:15:00Z",
    status: "pending",
    partnerId: "partner_2",
    partnerName: "Ibrahim Musa",
  },
]

const mockSummary: CommissionSummary = {
  totalEarned: 45000,
  totalWithdrawn: 30000,
  availableBalance: 15000,
  pendingAmount: 1800,
  thisMonth: 8500,
  lastMonth: 12000,
}

export function CommissionsPage() {
  const { user } = useAuth()
  const [commissions, setCommissions] = useState<Commission[]>(mockCommissions)
  const [summary, setSummary] = useState<CommissionSummary>(mockSummary)
  const [activeTab, setActiveTab] = useState("overview")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  async function loadData() {
    try {
      const [sumResp, histResp] = await Promise.all([
        api.getCommissionsSummary(),
        api.getCommissionsHistory(),
      ])
      if (sumResp.success && sumResp.data) {
        const p: any = sumResp.data
        setSummary(p.data || p)
      }
      if (histResp.success && histResp.data) {
        const p: any = histResp.data
        const list = (p.data || p || []).map((r: any, i: number) => ({
          id: r._id || r.id || String(i + 1),
          type: r.amount >= 0 ? 'earned' : 'withdrawn',
          amount: r.amount,
          description: r.description || 'Commission',
          date: r.createdAt || new Date().toISOString(),
          status: r.status || 'completed',
        }))
        setCommissions(list)
      }
    } catch (e) {
      // keep mock fallback
    }
  }

  useState(() => { loadData() })

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawAmount)
    if (!amount || amount <= 0 || amount > summary.availableBalance) {
      alert("Please enter a valid withdrawal amount")
      return
    }

    setIsWithdrawing(true)

    try {
      const resp = await api.withdrawCommissions({ amount })
      if (resp.success) {
        alert("Withdrawal request submitted successfully")
        setWithdrawAmount("")
      } else {
        throw new Error("Withdrawal failed")
      }
    } catch (error) {
      console.error("Withdrawal error:", error)
      alert("Withdrawal failed. Please try again.")
    } finally {
      setIsWithdrawing(false)
    }
  }

  const getCommissionIcon = (type: Commission["type"]) => {
    return type === "earned" ? (
      <ArrowUpRight className="w-4 h-4 text-success" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-destructive" />
    )
  }

  const getStatusBadge = (status: Commission["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "processing":
        return <Badge variant="outline">Processing</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Commissions</h1>
            <p className="text-muted-foreground">Track your earnings and manage withdrawals</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                        <p className="text-2xl font-bold text-foreground">
                          ₦{summary.availableBalance.toLocaleString()}
                        </p>
                      </div>
                      <Wallet className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                        <p className="text-2xl font-bold text-foreground">₦{summary.totalEarned.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-success" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold text-foreground">₦{summary.thisMonth.toLocaleString()}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-foreground">₦{summary.pendingAmount.toLocaleString()}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-warning" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissions.slice(0, 5).map((commission, index) => (
                    <motion.div
                      key={commission.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getCommissionIcon(commission.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{commission.description}</h4>
                          {commission.partnerName && (
                            <p className="text-sm text-muted-foreground">from {commission.partnerName}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(commission.date).toLocaleDateString()} at{" "}
                            {new Date(commission.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p
                            className={`font-medium ${
                              commission.type === "earned" ? "text-success" : "text-destructive"
                            }`}
                          >
                            {commission.type === "earned" ? "+" : ""}₦{Math.abs(commission.amount).toLocaleString()}
                          </p>
                          {getStatusBadge(commission.status)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input placeholder="Search transactions..." />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="earned">Earned</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Full History */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissions.map((commission, index) => (
                    <motion.div
                      key={commission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getCommissionIcon(commission.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{commission.description}</h4>
                          {commission.partnerName && (
                            <p className="text-sm text-muted-foreground">from {commission.partnerName}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(commission.date).toLocaleDateString()} at{" "}
                            {new Date(commission.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p
                            className={`font-medium ${
                              commission.type === "earned" ? "text-success" : "text-destructive"
                            }`}
                          >
                            {commission.type === "earned" ? "+" : ""}₦{Math.abs(commission.amount).toLocaleString()}
                          </p>
                          {getStatusBadge(commission.status)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Withdrawal Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-primary" />
                    Withdraw Funds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Withdrawal Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={summary.availableBalance}
                    />
                    <p className="text-sm text-muted-foreground">
                      Available balance: ₦{summary.availableBalance.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Bank Account</Label>
                    <Select defaultValue="primary">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary Account - **** 1234</SelectItem>
                        <SelectItem value="secondary">Secondary Account - **** 5678</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleWithdraw} disabled={isWithdrawing} className="w-full">
                    {isWithdrawing ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Withdraw Funds
                      </div>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Withdrawals are processed within 1-3 business days. A processing fee may apply.
                  </p>
                </CardContent>
              </Card>

              {/* Withdrawal Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minimum withdrawal:</span>
                      <span className="font-medium">₦1,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing time:</span>
                      <span className="font-medium">1-3 business days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing fee:</span>
                      <span className="font-medium">₦50 or 1% (whichever is higher)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily limit:</span>
                      <span className="font-medium">₦100,000</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Bank Account Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank:</span>
                        <span>First Bank of Nigeria</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account:</span>
                        <span>**** **** **** 1234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>Agency Admin</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
