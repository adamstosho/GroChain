"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  BarChart3,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Calendar,
  Users,
  Activity,
  Lock,
  Globe,
  Database
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface ComplianceReport {
  id: string
  title: string
  type: 'regulatory' | 'audit' | 'risk' | 'performance'
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  complianceScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  submittedBy: string
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  dueDate: string
  requirements: string[]
  findings: string[]
  recommendations: string[]
}

interface AuditTrail {
  id: string
  action: string
  entity: string
  entityId: string
  userId: string
  userName: string
  timestamp: string
  details: string
  ipAddress: string
  userAgent: string
  changes?: {
    field: string
    oldValue: string
    newValue: string
  }[]
}

interface ComplianceMetric {
  name: string
  currentValue: number
  targetValue: number
  unit: string
  trend: 'improving' | 'declining' | 'stable'
  status: 'compliant' | 'non_compliant' | 'at_risk'
}

interface RegulatoryRequirement {
  id: string
  name: string
  description: string
  category: 'kyc' | 'aml' | 'data_protection' | 'financial' | 'operational'
  status: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable'
  dueDate: string
  lastReview: string
  nextReview: string
  documents: string[]
  notes: string
}

export function ComplianceDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([])
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([])
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([])
  const [regulatoryRequirements, setRegulatoryRequirements] = useState<RegulatoryRequirement[]>([])
  
  // Filter states
  const [reportTypeFilter, setReportTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateRange, setDateRange] = useState("")

  useEffect(() => {
    fetchComplianceData()
  }, [])

  const fetchComplianceData = async () => {
    try {
      setLoading(true)
      
      // TODO: Replace with actual API calls when backend endpoints are implemented
      // const [reportsRes, auditRes, metricsRes, requirementsRes] = await Promise.all([
      //   api.get("/api/compliance/reports"),
      //   api.get("/api/compliance/audit-trails"),
      //   api.get("/api/compliance/metrics"),
      //   api.get("/api/compliance/regulatory-requirements")
      // ])

      // For now, use mock data
      const mockReports: ComplianceReport[] = [
        {
          id: "report_001",
          title: "Q1 2025 Compliance Report",
          type: "regulatory",
          status: "approved",
          complianceScore: 92,
          riskLevel: "low",
          submittedBy: "Compliance Officer",
          submittedAt: "2025-01-15T10:30:00Z",
          dueDate: "2025-01-31T00:00:00Z",
          requirements: ["Data Protection", "Financial Reporting", "Environmental Standards"],
          findings: ["All requirements met", "Minor documentation updates needed"],
          recommendations: ["Continue current practices", "Update documentation by Q2"]
        }
      ]
      
      const mockAuditTrails: AuditTrail[] = [
        {
          id: "audit_001",
          action: "Compliance Report Generated",
          entity: "Q1 2025 Report",
          entityId: "report_001",
          userId: "user_001",
          userName: "Compliance Officer",
          timestamp: "2025-01-15T10:30:00Z",
          details: "Report generated successfully",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36"
        }
      ]
      
      const mockMetrics: ComplianceMetric[] = [
        {
          name: "Overall Compliance Score",
          currentValue: 92,
          targetValue: 90,
          unit: "%",
          trend: "improving",
          status: "compliant"
        }
      ]
      
      const mockRequirements: RegulatoryRequirement[] = [
        {
          id: "req_001",
          name: "Data Protection Regulation",
          description: "Ensure all user data is properly protected",
          category: "data_protection",
          status: "compliant",
          dueDate: "2025-12-31T00:00:00Z",
          lastReview: "2025-01-01T00:00:00Z",
          nextReview: "2026-01-01T00:00:00Z",
          documents: ["Privacy Policy", "Terms of Service"],
          notes: "No notes"
        }
      ]

      setComplianceReports(mockReports)
      setAuditTrails(mockAuditTrails)
      setComplianceMetrics(mockMetrics)
      setRegulatoryRequirements(mockRequirements)
    } catch (error) {
      console.error("Failed to fetch compliance data:", error)
      toast.error("Failed to load compliance data")
    } finally {
      setLoading(false)
    }
  }

  const generateComplianceReport = async () => {
    try {
      setLoading(true)
      
      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await api.post("/api/compliance/generate-report", {
      //   type: reportTypeFilter || 'regulatory',
      //   dateRange: dateRange || 'monthly'
      // })

      // For now, simulate successful generation
      toast.success("Compliance report generated successfully!")
      
      // Add to local state for demo purposes
      const newReport: ComplianceReport = {
        id: `report_${Date.now()}`,
        title: `${reportTypeFilter || 'regulatory'} Report - ${new Date().toLocaleDateString()}`,
        type: (reportTypeFilter as any) || 'regulatory',
        status: 'pending',
        complianceScore: Math.floor(Math.random() * 20) + 80,
        riskLevel: 'low',
        submittedBy: 'Current User',
        submittedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: ['Standard Compliance', 'Quality Assurance'],
        findings: ['Report generated successfully'],
        recommendations: ['Review and approve']
      }
      
      setComplianceReports(prev => [newReport, ...prev])
    } catch (error) {
      console.error("Failed to generate report:", error)
      toast.error("Failed to generate compliance report")
    } finally {
      setLoading(false)
    }
  }

  const exportComplianceData = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setLoading(true)
      
      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await api.get(`/api/compliance/export?format=${format}`)
      
      // For now, simulate export
      const exportData = {
        reports: complianceReports,
        metrics: complianceMetrics,
        exportedAt: new Date().toISOString(),
        format
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success(`${format.toUpperCase()} report exported successfully!`)
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Failed to export compliance data")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    }
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getRiskBadge = (risk: string) => {
    const variants = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    }
    return variants[risk as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600'
      case 'non_compliant': return 'text-red-600'
      case 'at_risk': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'declining': return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />
      case 'stable': return <BarChart3 className="w-4 h-4 text-blue-600" />
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
          <p className="text-muted-foreground">
            Regulatory compliance, audit trails, and risk management
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchComplianceData} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => generateComplianceReport()} disabled={loading}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="regulatory">Regulatory</SelectItem>
                  <SelectItem value="audit">Audit</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Export</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportComplianceData('pdf')}
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportComplianceData('excel')}
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                    <p className="text-2xl font-bold">{complianceReports.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                    <p className="text-2xl font-bold text-green-600">
                      {complianceMetrics.length > 0 
                        ? Math.round(complianceMetrics.reduce((acc, m) => acc + m.currentValue, 0) / complianceMetrics.length)
                        : 0}%
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High Risk Items</p>
                    <p className="text-2xl font-bold text-red-600">
                      {complianceReports.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {complianceReports.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complianceMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{metric.name}</h4>
                      {getTrendIcon(metric.trend)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current: {metric.currentValue}{metric.unit}</span>
                        <span>Target: {metric.targetValue}{metric.unit}</span>
                      </div>
                      <Progress 
                        value={(metric.currentValue / metric.targetValue) * 100} 
                        className="h-2" 
                      />
                    </div>
                    
                    <Badge className={getComplianceStatusColor(metric.status)}>
                      {metric.status.replace('_', ' ')}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="space-y-4">
            {complianceReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <Badge className={getStatusBadge(report.status)}>
                          {report.status}
                        </Badge>
                        <Badge className={getRiskBadge(report.riskLevel)}>
                          {report.riskLevel} Risk
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Compliance Score</p>
                        <div className="flex items-center gap-2">
                          <Progress value={report.complianceScore} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{report.complianceScore}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Due Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Submitted By</p>
                        <p className="text-sm text-muted-foreground">{report.submittedBy}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Key Requirements</p>
                      <div className="flex flex-wrap gap-2">
                        {report.requirements.slice(0, 3).map((req, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditTrails.map((trail, index) => (
                  <motion.div
                    key={trail.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{trail.action}</h4>
                        <Badge variant="outline">{trail.entity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{trail.details}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>User: {trail.userName}</span>
                        <span>Time: {new Date(trail.timestamp).toLocaleString()}</span>
                        <span>IP: {trail.ipAddress}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regulatoryRequirements.map((req, index) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{req.name}</CardTitle>
                      <Badge className={getComplianceStatusColor(req.status)}>
                        {req.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Category</span>
                        <Badge variant="outline" className="capitalize">
                          {req.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Due Date</span>
                        <span className="text-muted-foreground">
                          {new Date(req.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Next Review</span>
                        <span className="text-muted-foreground">
                          {new Date(req.nextReview).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Required Documents</p>
                      <div className="flex flex-wrap gap-2">
                        {req.documents.map((doc, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Update Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
