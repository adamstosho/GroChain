"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  DollarSign, 
  FileText, 
  Plus, 
  Eye, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Calculator,
  TrendingUp,
  Calendar,
  User,
  Building2
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface LoanApplication {
  id: string
  amount: number
  purpose: string
  term: number
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'repaid'
  interestRate: number
  monthlyPayment: number
  totalRepayment: number
  createdAt: string
  updatedAt: string
  documents: Array<{
    id: string
    name: string
    type: string
    uploadedAt: string
    status: 'pending' | 'verified' | 'rejected'
  }>
  farmer: {
    id: string
    name: string
    phone: string
    location: string
  }
  partner?: {
    id: string
    name: string
    type: string
  }
}

interface LoanStats {
  totalApplications: number
  approved: number
  pending: number
  rejected: number
  totalDisbursed: number
  totalRepaid: number
  averageInterestRate: number
  repaymentRate: number
}

interface LoanApplicationForm {
  amount: string;
  purpose: string;
  term: number;
  description: string;
}

export function LoanManagement() {
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [loanStats, setLoanStats] = useState<LoanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    term: 12,
    description: ""
  })

  const { user } = useAuth();

  useEffect(() => {
    fetchLoanData();
  }, []);

  const fetchLoanData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the correct API methods that exist in the API client
      const [applicationsResponse, statsResponse] = await Promise.all([
        api.getLoanApplications(user?.id),
        api.getLoanStats()
      ]);

      if (applicationsResponse.success) {
        setLoanApplications(applicationsResponse.data.applications || []);
      }

      if (statsResponse.success) {
        setLoanStats(statsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching loan data:', err);
      setError('Failed to fetch loan data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async (formData: LoanApplicationForm) => {
    try {
      setLoading(true);
      setError(null);

      // Use the correct API method that exists in the API client
      const response = await api.submitLoanApplication({
        ...formData,
        farmerId: user?.id || '',
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        term: formData.term,
        description: formData.description
      });

      if (response.success) {
        // Refresh the loan applications list
        await fetchLoanData();
        
        // Reset form
        setFormData({
          amount: '',
          purpose: '',
          term: 12,
          description: ''
        });
        
        // Show success message
        toast.success('Loan application submitted successfully!');
      } else {
        setError(response.message || 'Failed to submit loan application');
      }
    } catch (err) {
      console.error('Error submitting loan application:', err);
      setError('Failed to submit loan application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      disbursed: "bg-purple-100 text-purple-800",
      repaid: "bg-gray-100 text-gray-800"
    }
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading loan data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Loan Management</h2>
          <p className="text-muted-foreground">Manage loan applications and track financial assistance</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Button>
      </div>

      {/* Stats Overview */}
      {loanStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{loanStats.totalApplications}</p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{loanStats.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">₦{loanStats.totalDisbursed.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Disbursed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{loanStats.repaymentRate}%</p>
                  <p className="text-sm text-muted-foreground">Repayment Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loanApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No loan applications yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start by submitting your first loan application
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Apply for Loan
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {loanApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">₦{application.amount.toLocaleString()}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{application.purpose}</span>
                        <span>{application.term} months</span>
                        <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <User className="w-3 h-3" />
                        <span>{application.farmer.name}</span>
                        {application.partner && (
                          <>
                            <span>•</span>
                            <Building2 className="w-3 h-3" />
                            <span>{application.partner.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusBadge(application.status)}>
                      {application.status.replace('_', ' ')}
                    </Badge>
                    {application.status === 'approved' && (
                      <div className="text-right text-sm">
                        <p className="font-medium">₦{application.monthlyPayment?.toLocaleString()}/month</p>
                        <p className="text-muted-foreground">{application.interestRate}% APR</p>
                      </div>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan Application Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">New Loan Application</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Loan Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter loan amount"
                />
              </div>
              
              <div>
                <Label htmlFor="purpose">Loan Purpose</Label>
                <Select value={formData.purpose} onValueChange={(value) => setFormData({ ...formData, purpose: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Equipment Purchase</SelectItem>
                    <SelectItem value="seeds">Seeds & Fertilizers</SelectItem>
                    <SelectItem value="expansion">Farm Expansion</SelectItem>
                    <SelectItem value="working_capital">Working Capital</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="term">Loan Term (months)</Label>
                <Select value={formData.term.toString()} onValueChange={(value) => setFormData({ ...formData, term: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="18">18 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe how you plan to use the loan"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => handleSubmitApplication(formData)} className="flex-1">
                  Submit Application
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
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
