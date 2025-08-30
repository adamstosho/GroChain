"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useCommission } from "@/hooks/use-commission"
import { useToast } from "@/hooks/use-toast"
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download,
  Filter,
  Calendar,
  BarChart3,
  Wallet,
  RefreshCw
} from "lucide-react"

interface Commission {
  _id: string
  farmer: {
    name: string
    id: string
  }
  order: {
    id: string
    amount: number
    date: Date
  }
  amount: number
  rate: number
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  orderAmount: number
  orderDate: Date
  paidAt?: Date
  withdrawalId?: string
}

interface CommissionSummary {
  totalEarned: number
  commissionRate: number
  pendingAmount: number
  paidAmount: number
  lastPayout?: Date
  monthlyEarnings: number[]
  totalTransactions: number
  averageCommission: number
}

export default function CommissionsPage() {
  const {
    commissions,
    summary,
    stats,
    isLoading,
    isRefreshing,
    refreshData,
    processPayout,
    pendingCommissions,
    approvedCommissions,
    paidCommissions,
    totalPendingAmount,
    totalPaidAmount
  } = useCommission()

  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case "approved":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case "paid":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleRequestPayout = async () => {
    try {
      if (totalPendingAmount === 0) {
        toast({
          title: "No pending commissions",
          description: "You have no pending commissions to withdraw",
          variant: "destructive",
        })
        return
      }

      const pendingCommissionIds = pendingCommissions.map(c => c._id)
      
      await processPayout(
        pendingCommissionIds,
        'bank_transfer',
        { accountNumber: '1234567890', bankName: 'Sample Bank' }
      )
      
      toast({
        title: "Payout request submitted",
        description: `₦${totalPendingAmount.toLocaleString()} payout request has been submitted`,
      })
    } catch (error: any) {
      toast({
        title: "Payout request failed",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    }
  }

  const exportCommissions = () => {
    // TODO: Implement real export functionality
    toast({
      title: "Export started",
      description: "Your commission report is being prepared for download",
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Commission Management">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Commission Management</h1>
              <p className="text-muted-foreground">Track your earnings and manage payouts</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-0 pb-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Commission Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Commission Management</h1>
            <p className="text-muted-foreground">Track your earnings and manage payouts</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportCommissions}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={handleRequestPayout} disabled={totalPendingAmount === 0}>
              <Wallet className="w-4 h-4 mr-2" />
              Request Payout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{(summary?.summary.totalAmount || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalPendingAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payout
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5.0%</div>
              <p className="text-xs text-muted-foreground">
                Per transaction
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.summary.totalCommissions || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Commission Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Overview</CardTitle>
            <CardDescription>Your earnings breakdown and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Earnings Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Earned</span>
                    <span className="font-medium">₦{(summary?.summary.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Paid Out</span>
                    <span className="font-medium">₦{(summary?.summary.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <span className="font-medium text-yellow-600">₦{totalPendingAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Commission</span>
                    <span className="font-medium">₦{(stats?.averageCommission || 0).toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Last payout information removed - not available in current data structure */}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Monthly Performance</h3>
                <div className="space-y-3">
                  {stats?.monthlyBreakdown.map((month, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{new Date(month._id.year, month._id.month - 1, 1).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span>₦{month.totalAmount.toLocaleString()}</span>
                      </div>
                      <Progress value={(month.totalAmount / (stats.totalAmount || 1)) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Details</CardTitle>
            <CardDescription>View and manage your commission transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-4">
                  {commissions.slice(0, 5).map((commission) => (
                    <div key={commission._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{commission.farmer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Order #{commission.order.orderNumber} • ₦{commission.order.total.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(commission.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">₦{commission.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {(commission.rate * 100).toFixed(1)}% commission
                          </p>
                        </div>
                        {getStatusBadge(commission.status)}
                      </div>
                    </div>
                  ))}
                  
                  {commissions.length === 0 && (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No commissions found</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <div className="space-y-4">
                  {pendingCommissions.map((commission) => (
                    <div key={commission._id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">{commission.farmer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Order #{commission.order.orderNumber} • ₦{commission.order.total.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(commission.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">₦{commission.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {(commission.rate * 100).toFixed(1)}% commission
                          </p>
                        </div>
                        {getStatusBadge(commission.status)}
                      </div>
                    </div>
                  ))}
                  
                  {pendingCommissions.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending commissions</p>
                      <p className="text-sm text-muted-foreground">All your commissions have been processed</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-4">
                  {paidCommissions.map((commission) => (
                    <div key={commission._id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{commission.farmer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Order #{commission.order.orderNumber} • ₦{commission.order.total.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Paid on {commission.paidAt ? new Date(commission.paidAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">₦{commission.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {(commission.rate * 100).toFixed(1)}% commission
                          </p>
                        </div>
                        {getStatusBadge(commission.status)}
                      </div>
                    </div>
                  ))}
                  
                  {paidCommissions.length === 0 && (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No payment history</p>
                      <p className="text-sm text-muted-foreground">Your commission payments will appear here</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common commission management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-20 flex-col space-y-2" onClick={handleRequestPayout}>
                <Wallet className="h-6 w-6" />
                <span>Request Payout</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" onClick={exportCommissions}>
                <Download className="h-6 w-6" />
                <span>Export Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" onClick={refreshData} disabled={isRefreshing}>
                <RefreshCw className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
