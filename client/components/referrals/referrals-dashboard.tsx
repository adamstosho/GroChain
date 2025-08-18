"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { 
  Users,
  Share,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  UserPlus,
  Gift,
  Calendar,
  Award,
  RefreshCw,
  Download
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  totalEarnings: number
  pendingEarnings: number
  conversionRate: number
  averageEarningPerReferral: number
}

interface Referral {
  id: string
  farmerId: string
  farmerName: string
  farmerPhone: string
  referredBy: string
  referredByName: string
  status: "pending" | "active" | "completed" | "inactive"
  joinDate: string
  firstTransaction?: string
  totalTransactions: number
  totalVolume: number
  commission: number
  commissionPaid: number
}

interface ReferralCode {
  code: string
  createdAt: string
  expiresAt?: string
  usageLimit?: number
  usageCount: number
  isActive: boolean
}

interface ReferralBonusHistory {
  id: string
  farmerId: string
  farmerName: string
  bonusAmount: number
  bonusType: "signup" | "first_transaction" | "milestone" | "loyalty"
  earnedAt: string
  paidAt?: string
  status: "pending" | "paid" | "cancelled"
}

export function ReferralsDashboard() {
  const { user } = useAuth()
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([])
  const [bonusHistory, setBonusHistory] = useState<ReferralBonusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [newReferralCode, setNewReferralCode] = useState("")

  const isPartnerOrAdmin = user && (user.role === "partner" || user.role === "admin")

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    setLoading(true)
    try {
      // Use mock data since backend endpoints are limited
      setReferralStats(mockReferralStats)
      setReferrals(mockReferrals)
      setReferralCodes(mockReferralCodes)
      setBonusHistory(mockBonusHistory)
    } catch (error) {
      console.error("Error fetching referral data:", error)
      setReferralStats(mockReferralStats)
      setReferrals(mockReferrals)
      setReferralCodes(mockReferralCodes)
      setBonusHistory(mockBonusHistory)
    } finally {
      setLoading(false)
    }
  }

  const generateReferralCode = async () => {
    try {
      // This would use actual API endpoint
      const newCode = {
        code: newReferralCode || `REF${Date.now()}`,
        createdAt: new Date().toISOString(),
        usageLimit: 100,
        usageCount: 0,
        isActive: true
      }
      setReferralCodes(prev => [newCode, ...prev])
      setNewReferralCode("")
    } catch (error) {
      console.error("Error generating referral code:", error)
    }
  }

  const completeReferral = async (farmerId: string) => {
    try {
      const response = await api.completeReferral(farmerId)
      if (response.success) {
        fetchReferralData()
      }
    } catch (error) {
      console.error("Error completing referral:", error)
    }
  }

  const copyToClipboard = async (text: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(codeId)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error("Error copying to clipboard:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": case "completed": case "paid": return "bg-green-500"
      case "pending": return "bg-yellow-500"
      case "inactive": case "cancelled": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getBonusTypeIcon = (type: string) => {
    switch (type) {
      case "signup": return <UserPlus className="h-4 w-4" />
      case "first_transaction": return <DollarSign className="h-4 w-4" />
      case "milestone": return <Award className="h-4 w-4" />
      case "loyalty": return <Gift className="h-4 w-4" />
      default: return <Gift className="h-4 w-4" />
    }
  }

  // Mock data
  const mockReferralStats: ReferralStats = {
    totalReferrals: 156,
    activeReferrals: 123,
    totalEarnings: 234500,
    pendingEarnings: 45600,
    conversionRate: 78.8,
    averageEarningPerReferral: 1500
  }

  const mockReferrals: Referral[] = [
    {
      id: "ref_001",
      farmerId: "farmer_001",
      farmerName: "Musa Ibrahim",
      farmerPhone: "+2348012345678",
      referredBy: user?.id || "partner_001",
      referredByName: user?.name || "Partner Agency",
      status: "active",
      joinDate: "2025-01-10T09:00:00Z",
      firstTransaction: "2025-01-12T14:30:00Z",
      totalTransactions: 8,
      totalVolume: 250000,
      commission: 7500,
      commissionPaid: 7500
    },
    {
      id: "ref_002",
      farmerId: "farmer_002",
      farmerName: "Fatima Usman",
      farmerPhone: "+2348087654321",
      referredBy: user?.id || "partner_001",
      referredByName: user?.name || "Partner Agency",
      status: "pending",
      joinDate: "2025-01-14T16:20:00Z",
      totalTransactions: 0,
      totalVolume: 0,
      commission: 0,
      commissionPaid: 0
    },
    {
      id: "ref_003",
      farmerId: "farmer_003",
      farmerName: "Ahmed Bello",
      farmerPhone: "+2348098765432",
      referredBy: user?.id || "partner_001",
      referredByName: user?.name || "Partner Agency",
      status: "completed",
      joinDate: "2024-12-15T11:45:00Z",
      firstTransaction: "2024-12-20T10:00:00Z",
      totalTransactions: 15,
      totalVolume: 450000,
      commission: 13500,
      commissionPaid: 13500
    }
  ]

  const mockReferralCodes: ReferralCode[] = [
    {
      code: "GROCHAIN2025",
      createdAt: "2025-01-01T00:00:00Z",
      expiresAt: "2025-12-31T23:59:59Z",
      usageLimit: 500,
      usageCount: 67,
      isActive: true
    },
    {
      code: "NEWFARMER100",
      createdAt: "2025-01-15T10:00:00Z",
      usageLimit: 100,
      usageCount: 23,
      isActive: true
    }
  ]

  const mockBonusHistory: ReferralBonusHistory[] = [
    {
      id: "bonus_001",
      farmerId: "farmer_001",
      farmerName: "Musa Ibrahim",
      bonusAmount: 5000,
      bonusType: "first_transaction",
      earnedAt: "2025-01-12T14:30:00Z",
      paidAt: "2025-01-13T09:00:00Z",
      status: "paid"
    },
    {
      id: "bonus_002",
      farmerId: "farmer_003",
      farmerName: "Ahmed Bello",
      bonusAmount: 10000,
      bonusType: "milestone",
      earnedAt: "2025-01-10T16:45:00Z",
      paidAt: "2025-01-11T11:30:00Z",
      status: "paid"
    },
    {
      id: "bonus_003",
      farmerId: "farmer_002",
      farmerName: "Fatima Usman",
      bonusAmount: 2500,
      bonusType: "signup",
      earnedAt: "2025-01-14T16:20:00Z",
      status: "pending"
    }
  ]

  if (loading) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Share className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading referral data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold">Referral System</h1>
            <p className="text-muted-foreground">
              Manage farmer referrals and track commission earnings
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={fetchReferralData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{referralStats?.totalReferrals}</p>
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{referralStats?.activeReferrals}</p>
                    <p className="text-sm text-muted-foreground">Active Referrals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">₦{referralStats?.totalEarnings.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">₦{referralStats?.pendingEarnings.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Pending Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{referralStats?.conversionRate}%</p>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Award className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">₦{referralStats?.averageEarningPerReferral.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Avg per Referral</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="referrals" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="referrals">My Referrals</TabsTrigger>
              <TabsTrigger value="codes">Referral Codes</TabsTrigger>
              <TabsTrigger value="bonuses">Bonus History</TabsTrigger>
              <TabsTrigger value="overview">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="referrals" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {referrals.map((referral) => (
                  <Card key={referral.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{referral.farmerName}</CardTitle>
                        <Badge className={getStatusColor(referral.status)}>
                          {referral.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium">{referral.farmerPhone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Join Date</p>
                          <p className="font-medium">{new Date(referral.joinDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Transactions</p>
                          <p className="font-bold text-blue-600">{referral.totalTransactions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Volume</p>
                          <p className="font-bold text-green-600">₦{referral.totalVolume.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Commission Earned</p>
                          <p className="font-bold text-green-600">₦{referral.commission.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Commission Paid</p>
                          <p className="font-bold">₦{referral.commissionPaid.toLocaleString()}</p>
                        </div>
                      </div>

                      {referral.firstTransaction && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">First Transaction</p>
                          <p className="font-medium">{new Date(referral.firstTransaction).toLocaleDateString()}</p>
                        </div>
                      )}

                      {isPartnerOrAdmin && referral.status === "pending" && (
                        <Button 
                          onClick={() => completeReferral(referral.farmerId)}
                          size="sm"
                          className="w-full"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Complete Referral
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="codes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generate New Referral Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter custom code (optional)"
                      value={newReferralCode}
                      onChange={(e) => setNewReferralCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={generateReferralCode}>
                      Generate Code
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {referralCodes.map((code) => (
                  <Card key={code.code}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-mono">{code.code}</CardTitle>
                        <Badge className={code.isActive ? "bg-green-500" : "bg-gray-500"}>
                          {code.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-medium">{new Date(code.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Usage</p>
                          <p className="font-medium">{code.usageCount} / {code.usageLimit || "∞"}</p>
                        </div>
                      </div>

                      {code.expiresAt && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">Expires</p>
                          <p className="font-medium">{new Date(code.expiresAt).toLocaleDateString()}</p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => copyToClipboard(code.code, code.code)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          {copiedCode === code.code ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          {copiedCode === code.code ? "Copied!" : "Copy Code"}
                        </Button>
                        <Button
                          onClick={() => copyToClipboard(`${window.location.origin}/register?ref=${code.code}`, `${code.code}-link`)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          {copiedCode === `${code.code}-link` ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <Share className="h-4 w-4 mr-2" />
                          )}
                          {copiedCode === `${code.code}-link` ? "Copied!" : "Share Link"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bonuses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Referral Bonus History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bonusHistory.map((bonus) => (
                      <div key={bonus.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getBonusTypeIcon(bonus.bonusType)}
                            <p className="font-semibold">{bonus.farmerName}</p>
                          </div>
                          <Badge className={getStatusColor(bonus.status)}>
                            {bonus.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Bonus Type</p>
                            <p className="font-medium capitalize">{bonus.bonusType.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-bold text-green-600">₦{bonus.bonusAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Earned</p>
                            <p className="font-medium">{new Date(bonus.earnedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        {bonus.paidAt && (
                          <div className="mt-2 text-sm">
                            <p className="text-muted-foreground">Paid on: {new Date(bonus.paidAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Referral Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Signup Conversion</span>
                        <span className="font-bold">78.8%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Transaction Conversion</span>
                        <span className="font-bold">65.4%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Average Time to First Transaction</span>
                        <span className="font-bold">3.2 days</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Retention Rate (30 days)</span>
                        <span className="font-bold">82.1%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>January Referrals</span>
                        <span className="font-bold">45</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>January Earnings</span>
                        <span className="font-bold text-green-600">₦67,500</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Best Performing Code</span>
                        <span className="font-bold">GROCHAIN2025</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Top Referral Volume</span>
                        <span className="font-bold">₦450,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
