"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Progress } from "@/components/ui/Progress"
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3, 
  PieChart,
  LineChart,
  Download,
  Upload,
  Eye,
  Plus,
  Minus,
  Percent,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain,
  Leaf,
  Droplets,
  Sun,
  Shield
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface FinancialHealth {
  netWorth: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  debtToIncomeRatio: number
  emergencyFund: number
  investmentPortfolio: number
  goals: Array<{
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    targetDate: string
    priority: 'high' | 'medium' | 'low'
    category: string
  }>
  assets: Array<{
    id: string
    name: string
    value: number
    type: 'liquid' | 'fixed' | 'investment'
    growthRate: number
  }>
  liabilities: Array<{
    id: string
    name: string
    amount: number
    interestRate: number
    monthlyPayment: number
    dueDate: string
  }>
}

interface CropFinancials {
  cropType: string
  investment: number
  expectedRevenue: number
  profitMargin: number
  riskScore: number
  seasonality: string
  marketTrend: 'up' | 'down' | 'stable'
}

interface FinancialProjection {
  month: string
  income: number
  expenses: number
  savings: number
  netWorth: number
}

export function AdvancedFinancialTools() {
  const [financialHealth, setFinancialHealth] = useState<FinancialHealth | null>(null)
  const [cropFinancials, setCropFinancials] = useState<CropFinancials[]>([])
  const [projections, setProjections] = useState<FinancialProjection[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalFormData, setGoalFormData] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    priority: "medium",
    category: ""
  })

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      // Since the backend doesn't have these specific endpoints yet, we'll use mock data
      // TODO: Replace with actual API calls when backend endpoints are implemented
      const mockFinancialHealth: FinancialHealth = {
        netWorth: 2500000,
        monthlyIncome: 450000,
        monthlyExpenses: 280000,
        savingsRate: 37.8,
        debtToIncomeRatio: 0.35,
        emergencyFund: 500000,
        investmentPortfolio: 800000,
        goals: [
          {
            id: "goal_001",
            name: "Farm Expansion",
            targetAmount: 5000000,
            currentAmount: 2000000,
            targetDate: "2025-12-31T00:00:00Z",
            priority: "high",
            category: "investment"
          }
        ],
        assets: [
          {
            id: "asset_001",
            name: "Farm Land",
            value: 1500000,
            type: "fixed",
            growthRate: 8.5
          }
        ],
        liabilities: [
          {
            id: "liability_001",
            name: "Equipment Loan",
            amount: 500000,
            interestRate: 12.5,
            monthlyPayment: 25000,
            dueDate: "2026-06-30T00:00:00Z"
          }
        ]
      }
      
      const mockCropFinancials: CropFinancials[] = [
        {
          cropType: "Tomatoes",
          investment: 150000,
          expectedRevenue: 300000,
          profitMargin: 50,
          riskScore: 25,
          seasonality: "Year-round",
          marketTrend: "up"
        }
      ]
      
      const mockProjections: FinancialProjection[] = [
        {
          month: "Jan 2025",
          income: 450000,
          expenses: 280000,
          savings: 170000,
          netWorth: 2500000
        }
      ]

      setFinancialHealth(mockFinancialHealth)
      setCropFinancials(mockCropFinancials)
      setProjections(mockProjections)
    } catch (error) {
      console.error("Financial data fetch error:", error)
      toast.error("Failed to load financial data")
    } finally {
      setLoading(false)
    }
  }

  const submitGoal = async () => {
    try {
      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await api.post("/api/fintech/financial-goals", goalFormData)
      
      toast.success("Financial goal created successfully!")
      setShowGoalForm(false)
      setGoalFormData({ name: "", targetAmount: "", targetDate: "", priority: "medium", category: "" })
      
      // Add to local state for demo purposes
      const newGoal = {
        id: `goal_${Date.now()}`,
        name: goalFormData.name,
        targetAmount: parseFloat(goalFormData.targetAmount),
        currentAmount: 0,
        targetDate: goalFormData.targetDate,
        priority: goalFormData.priority as 'high' | 'medium' | 'low',
        category: goalFormData.category
      }
      
      setFinancialHealth(prev => prev ? {
        ...prev,
        goals: [...prev.goals, newGoal]
      } : null)
    } catch (error) {
      toast.error("Failed to create financial goal")
    }
  }

  const calculateNetWorth = () => {
    if (!financialHealth) return 0
    const totalAssets = financialHealth.assets.reduce((sum, asset) => sum + asset.value, 0)
    const totalLiabilities = financialHealth.liabilities.reduce((sum, liability) => sum + liability.amount, 0)
    return totalAssets - totalLiabilities
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800"
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getMarketTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />
    return <BarChart3 className="w-4 h-4 text-blue-600" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading financial tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Financial Tools</h2>
          <p className="text-muted-foreground">Comprehensive financial analysis and planning tools</p>
        </div>
        <Button onClick={() => setShowGoalForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Financial Goal
        </Button>
      </div>

      {/* Financial Health Overview */}
      {financialHealth && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">₦{calculateNetWorth().toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Net Worth</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{financialHealth.savingsRate}%</p>
                  <p className="text-sm text-muted-foreground">Savings Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{financialHealth.debtToIncomeRatio}%</p>
                  <p className="text-sm text-muted-foreground">Debt-to-Income</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">₦{financialHealth.emergencyFund.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Emergency Fund</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for different tools */}
      <div className="space-y-6">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "goals"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Financial Goals
          </button>
          <button
            onClick={() => setActiveTab("crops")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "crops"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Crop Financials
          </button>
          <button
            onClick={() => setActiveTab("projections")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "projections"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Projections
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && financialHealth && (
          <div className="space-y-6">
            {/* Assets vs Liabilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {financialHealth.assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            {asset.type === 'liquid' && <DollarSign className="w-4 h-4 text-green-600" />}
                            {asset.type === 'fixed' && <Target className="w-4 h-4 text-green-600" />}
                            {asset.type === 'investment' && <TrendingUp className="w-4 h-4 text-green-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{asset.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₦{asset.value.toLocaleString()}</p>
                          <p className="text-sm text-green-600">+{asset.growthRate}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    Liabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {financialHealth.liabilities.map((liability) => (
                      <div key={liability.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <Minus className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">{liability.name}</p>
                            <p className="text-sm text-muted-foreground">{liability.interestRate}% APR</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₦{liability.amount.toLocaleString()}</p>
                          <p className="text-sm text-red-600">₦{liability.monthlyPayment.toLocaleString()}/mo</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Ratios */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Ratios & Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {financialHealth.savingsRate}%
                    </div>
                    <p className="text-sm text-muted-foreground">Monthly Savings Rate</p>
                    <div className="mt-2">
                      <Progress value={financialHealth.savingsRate} className="w-full" />
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {financialHealth.debtToIncomeRatio}%
                    </div>
                    <p className="text-sm text-muted-foreground">Debt-to-Income Ratio</p>
                    <div className="mt-2">
                      <Progress value={Math.min(financialHealth.debtToIncomeRatio, 100)} className="w-full" />
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {financialHealth.emergencyFund > 0 ? Math.round((financialHealth.emergencyFund / financialHealth.monthlyExpenses) * 100) / 100 : 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Emergency Fund (months)</p>
                    <div className="mt-2">
                      <Progress value={Math.min((financialHealth.emergencyFund / financialHealth.monthlyExpenses) * 100, 100)} className="w-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Goals Tab */}
        {activeTab === "goals" && financialHealth && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {financialHealth.goals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No financial goals set yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set your first financial goal to start planning for the future
                    </p>
                    <Button onClick={() => setShowGoalForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Financial Goal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {financialHealth.goals.map((goal) => (
                      <div key={goal.id} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{goal.name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{goal.category}</p>
                          </div>
                          <Badge className={getPriorityColor(goal.priority)}>
                            {goal.priority} priority
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Target Amount</p>
                            <p className="font-medium">₦{goal.targetAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Current Amount</p>
                            <p className="font-medium">₦{goal.currentAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Progress</p>
                            <p className="font-medium">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Target Date</p>
                            <p className="font-medium">{new Date(goal.targetDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                          </div>
                          <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Crop Financials Tab */}
        {activeTab === "crops" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crop Financial Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {cropFinancials.length === 0 ? (
                  <div className="text-center py-8">
                    <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No crop financial data available</p>
                    <p className="text-sm text-muted-foreground">
                      Crop financial analysis will appear here when you log harvests
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cropFinancials.map((crop, index) => (
                      <div key={index} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Leaf className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{crop.cropType}</h4>
                              <p className="text-sm text-muted-foreground">{crop.seasonality}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getMarketTrendIcon(crop.marketTrend)}
                            <Badge variant={crop.riskScore > 7 ? "destructive" : crop.riskScore > 4 ? "secondary" : "default"}>
                              Risk: {crop.riskScore}/10
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Investment</p>
                            <p className="font-medium">₦{crop.investment.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Expected Revenue</p>
                            <p className="font-medium">₦{crop.expectedRevenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Profit Margin</p>
                            <p className="font-medium">{crop.profitMargin}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">ROI</p>
                            <p className="font-medium">{Math.round(((crop.expectedRevenue - crop.investment) / crop.investment) * 100)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projections Tab */}
        {activeTab === "projections" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>12-Month Financial Projections</CardTitle>
              </CardHeader>
              <CardContent>
                {projections.length === 0 ? (
                  <div className="text-center py-8">
                    <LineChart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No projection data available</p>
                    <p className="text-sm text-muted-foreground">
                      Financial projections will appear here based on your historical data
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projections.map((projection, index) => (
                      <div key={index} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{projection.month}</h4>
                          <Badge variant="outline">
                            Net: ₦{(projection.income - projection.expenses).toLocaleString()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Income</p>
                            <p className="font-medium text-green-600">₦{projection.income.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Expenses</p>
                            <p className="font-medium text-red-600">₦{projection.expenses.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Savings</p>
                            <p className="font-medium text-blue-600">₦{projection.savings.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Net Worth</p>
                            <p className="font-medium">₦{projection.netWorth.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add Financial Goal Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Financial Goal</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  value={goalFormData.name}
                  onChange={(e) => setGoalFormData({ ...goalFormData, name: e.target.value })}
                  placeholder="e.g., Emergency Fund, Farm Equipment"
                />
              </div>
              
              <div>
                <Label htmlFor="targetAmount">Target Amount (₦)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={goalFormData.targetAmount}
                  onChange={(e) => setGoalFormData({ ...goalFormData, targetAmount: e.target.value })}
                  placeholder="Enter target amount"
                />
              </div>
              
              <div>
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={goalFormData.targetDate}
                  onChange={(e) => setGoalFormData({ ...goalFormData, targetDate: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={goalFormData.priority} onValueChange={(value) => setGoalFormData({ ...goalFormData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={goalFormData.category} onValueChange={(value) => setGoalFormData({ ...goalFormData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency Fund</SelectItem>
                    <SelectItem value="equipment">Farm Equipment</SelectItem>
                    <SelectItem value="expansion">Farm Expansion</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={submitGoal} className="flex-1">
                  Create Goal
                </Button>
                <Button variant="outline" onClick={() => setShowGoalForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
