"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Download,
  FileText,
  BarChart3,
  Calendar,
  MapPin,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Plus,
  Settings,
  Filter,
  Search,
  Archive,
  Share2,
  Printer,
  Mail
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'financial' | 'operational' | 'analytical' | 'compliance'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on-demand'
  lastGenerated: string
  nextScheduled: string
  status: 'active' | 'inactive' | 'draft'
}

interface GeneratedReport {
  id: string
  templateId: string
  templateName: string
  generatedAt: string
  format: 'pdf' | 'excel' | 'csv' | 'json'
  size: string
  status: 'completed' | 'processing' | 'failed'
  downloadUrl?: string
  filters: Record<string, any>
}

interface ExportRequest {
  dataType: 'farmers' | 'transactions' | 'harvests' | 'marketplace' | 'fintech' | 'impact' | 'partners' | 'weather' | 'all'
  format: 'json' | 'csv' | 'excel' | 'pdf'
  filters: {
    startDate: string
    endDate: string
    region: string
    period: string
    includeCharts: boolean
    includeMetadata: boolean
  }
  customFields: string[]
}

export function ExportReportsPage() {
  const { user } = useAuth()
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("templates")
  const [exportRequest, setExportRequest] = useState<ExportRequest>({
    dataType: "all",
    format: "excel",
    filters: {
      startDate: "",
      endDate: "",
      region: "",
      period: "monthly",
      includeCharts: true,
      includeMetadata: true
    },
    customFields: []
  })
  const [generatingReport, setGeneratingReport] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [customReportName, setCustomReportName] = useState("")
  const [customReportDescription, setCustomReportDescription] = useState("")

  const DATA_TYPES = [
    { value: "all", label: "All Data", icon: BarChart3 },
    { value: "farmers", label: "Farmers", icon: BarChart3 },
    { value: "transactions", label: "Transactions", icon: BarChart3 },
    { value: "harvests", label: "Harvests", icon: BarChart3 },
    { value: "marketplace", label: "Marketplace", icon: BarChart3 },
    { value: "fintech", label: "Fintech", icon: BarChart3 },
    { value: "impact", label: "Impact", icon: BarChart3 },
    { value: "partners", label: "Partners", icon: BarChart3 },
    { value: "weather", label: "Weather", icon: BarChart3 }
  ]

  const FORMATS = [
    { value: "excel", label: "Excel (.xlsx)", icon: FileText },
    { value: "csv", label: "CSV (.csv)", icon: FileText },
    { value: "pdf", label: "PDF (.pdf)", icon: FileText },
    { value: "json", label: "JSON (.json)", icon: FileText }
  ]

  const PERIODS = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" }
  ]

  useEffect(() => {
    if (user) {
      fetchReportTemplates()
      fetchGeneratedReports()
    }
  }, [user])

  const fetchReportTemplates = async () => {
    try {
      const response = await api.get("/api/analytics/reports")
      if (response.success) {
        setReportTemplates(response.data || [])
      } else {
        throw new Error(response.error || "Failed to fetch report templates")
      }
    } catch (error) {
      console.error("Report templates error:", error)
      // Set default templates for demo
      setReportTemplates(getDefaultTemplates())
    }
  }

  const fetchGeneratedReports = async () => {
    try {
      const response = await api.get("/api/analytics/reports/generated")
      if (response.success) {
        setGeneratedReports(response.data || [])
      } else {
        throw new Error(response.error || "Failed to fetch generated reports")
      }
    } catch (error) {
      console.error("Generated reports error:", error)
      setGeneratedReports([])
    } finally {
      setLoading(false)
    }
  }

  const getDefaultTemplates = (): ReportTemplate[] => {
    return [
      {
        id: "1",
        name: "Monthly Financial Summary",
        description: "Comprehensive financial overview including revenue, transactions, and market performance",
        category: "financial",
        frequency: "monthly",
        lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: "active"
      },
      {
        id: "2",
        name: "Farmer Performance Report",
        description: "Detailed analysis of farmer activities, productivity, and regional performance",
        category: "operational",
        frequency: "weekly",
        lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextScheduled: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active"
      },
      {
        id: "3",
        name: "Market Insights Report",
        description: "AI-powered market analysis, trends, and predictive insights",
        category: "analytical",
        frequency: "weekly",
        lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        nextScheduled: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active"
      },
      {
        id: "4",
        name: "Impact Assessment Report",
        description: "Social and economic impact metrics for stakeholders and partners",
        category: "compliance",
        frequency: "quarterly",
        lastGenerated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextScheduled: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active"
      }
    ]
  }

  const generateReport = async () => {
    try {
      setGeneratingReport(true)

      const response = await api.post("/api/analytics/report", {
        templateId: selectedTemplate,
        format: exportRequest.format,
        filters: exportRequest.filters,
        customFields: exportRequest.customFields
      })

      if (response.success) {
        toast.success("Report generation started successfully!")
        // Refresh the generated reports list
        setTimeout(() => {
          fetchGeneratedReports()
        }, 2000)
      } else {
        throw new Error(response.error || "Failed to generate report")
      }
    } catch (error) {
      console.error("Report generation error:", error)
      toast.error("Failed to generate report")
    } finally {
      setGeneratingReport(false)
    }
  }

  const exportData = async () => {
    try {
      const response = await api.get("/api/analytics/export", { 
        params: { 
          dataType: exportRequest.dataType,
          format: exportRequest.format,
          ...exportRequest.filters
        }
      })
      
      if (response.success) {
        // Handle file download
        const blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `grochain-${exportRequest.dataType}-${new Date().toISOString().split('T')[0]}.${exportRequest.format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Data exported successfully!")
      } else {
        throw new Error(response.error || "Failed to export data")
      }
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export data")
    }
  }

  const downloadReport = async (report: GeneratedReport) => {
    try {
      if (report.downloadUrl) {
        window.open(report.downloadUrl, '_blank')
      } else {
        // Generate download URL
        const response = await api.get(`/api/analytics/reports/${report.id}/download`)
        if (response.success) {
          window.open(response.data.downloadUrl, '_blank')
        } else {
          throw new Error("Failed to get download URL")
        }
      }
      toast.success("Report download started!")
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Failed to download report")
    }
  }

  const deleteReport = async (reportId: string) => {
    try {
      const response = await api.delete(`/api/analytics/reports/${reportId}`)
      if (response.success) {
        setGeneratedReports(prev => prev.filter(r => r.id !== reportId))
        toast.success("Report deleted successfully!")
      } else {
        throw new Error(response.error || "Failed to delete report")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete report")
    }
  }

  const handleFilterChange = (key: string, value: string | boolean) => {
    setExportRequest(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value
      }
    }))
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      financial: "bg-green-100 text-green-800",
      operational: "bg-blue-100 text-blue-800",
      analytical: "bg-purple-100 text-purple-800",
      compliance: "bg-orange-100 text-orange-800"
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      processing: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800"
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading reports and templates...</p>
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
            <h1 className="text-3xl font-bold">Export & Reports</h1>
            <p className="text-muted-foreground">
              Generate comprehensive reports and export data in multiple formats
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchGeneratedReports}>
              <RefreshCw className="w-4 h-4 mr-2" />
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
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="templates" className="text-xs sm:text-sm">Report Templates</TabsTrigger>
            <TabsTrigger value="export" className="text-xs sm:text-sm">Data Export</TabsTrigger>
            <TabsTrigger value="generated" className="text-xs sm:text-sm">Generated Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-lg">{template.name}</span>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Frequency:</span>
                            <span className="font-medium capitalize">{template.frequency}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Last Generated:</span>
                            <span className="font-medium">
                              {new Date(template.lastGenerated).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Next Scheduled:</span>
                            <span className="font-medium">
                              {new Date(template.nextScheduled).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={template.status === 'active' ? 'border-green-200 text-green-700' : ''}>
                            {template.status}
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedTemplate(template.id)
                              setActiveTab("export")
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Generate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Export Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Data Export Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataType">Data Type</Label>
                      <Select value={exportRequest.dataType} onValueChange={(value: any) => setExportRequest(prev => ({ ...prev, dataType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DATA_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="format">Export Format</Label>
                      <Select value={exportRequest.format} onValueChange={(value: any) => setExportRequest(prev => ({ ...prev, format: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="period">Time Period</Label>
                      <Select value={exportRequest.filters.period} onValueChange={(value) => handleFilterChange("period", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PERIODS.map((period) => (
                            <SelectItem key={period.value} value={period.value}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          type="date"
                          value={exportRequest.filters.startDate}
                          onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          type="date"
                          value={exportRequest.filters.endDate}
                          onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region">Region (Optional)</Label>
                      <Input
                        placeholder="All regions"
                        value={exportRequest.filters.region}
                        onChange={(e) => handleFilterChange("region", e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="includeCharts"
                          checked={exportRequest.filters.includeCharts}
                          onChange={(e) => handleFilterChange("includeCharts", e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="includeCharts">Include Charts & Visualizations</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="includeMetadata"
                          checked={exportRequest.filters.includeMetadata}
                          onChange={(e) => handleFilterChange("includeMetadata", e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="includeMetadata">Include Metadata & Documentation</Label>
                      </div>
                    </div>

                    <Button onClick={exportData} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Report Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Generate Custom Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template">Report Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reportName">Custom Report Name (Optional)</Label>
                      <Input
                        placeholder="Enter custom report name"
                        value={customReportName}
                        onChange={(e) => setCustomReportName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reportDescription">Description (Optional)</Label>
                      <Textarea
                        placeholder="Enter custom report description"
                        value={customReportDescription}
                        onChange={(e) => setCustomReportDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="format">Report Format</Label>
                      <Select value={exportRequest.format} onValueChange={(value: any) => setExportRequest(prev => ({ ...prev, format: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={generateReport} 
                      disabled={generatingReport || !selectedTemplate}
                      className="w-full"
                    >
                      {generatingReport ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="generated" className="space-y-6">
            <div className="space-y-4">
              {generatedReports.length > 0 ? (
                generatedReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{report.templateName}</h3>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status}
                              </Badge>
                              <Badge variant="outline">
                                {report.format.toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Generated:</span> {new Date(report.generatedAt).toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Size:</span> {report.size}
                              </div>
                              <div>
                                <span className="font-medium">ID:</span> {report.id}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {report.status === 'completed' && (
                              <Button size="sm" onClick={() => downloadReport(report)}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => deleteReport(report.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Reports Generated Yet</h2>
                    <p className="text-muted-foreground mb-4">
                      Generate your first report using the templates or create custom exports.
                    </p>
                    <Button onClick={() => setActiveTab("templates")}>
                      <Plus className="w-4 h-4 mr-2" />
                      View Templates
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
