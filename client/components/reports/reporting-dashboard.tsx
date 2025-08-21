"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/textarea"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users,
  Truck,
  CreditCard,
  FileText,
  Download,
  Upload,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Plus,
  Settings,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  PieChart,
  LineChart,
  BarChart,
  Activity,
  Target,
  Award,
  Zap,
  Globe,
  MapPin,
  Building,
  Leaf,
  ShoppingCart,
  Loader2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface AnalyticsData {
  metric: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  timeframe: string
  trend: number[]
  comparison?: {
    previous: number
    current: number
    percentage: number
  }
}

interface Report {
  id: string
  name: string
  type: string
  status: 'completed' | 'processing' | 'failed' | 'scheduled'
  createdAt: string
  completedAt?: string
  parameters: any
  format: 'pdf' | 'excel' | 'csv'
  size?: string
  downloadUrl?: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: string
  parameters: any
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface ScheduledReport {
  id: string
  name: string
  type: string
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    time: string
    dayOfWeek?: number
    dayOfMonth?: number
    recipients: string[]
  }
  lastRun?: string
  nextRun: string
  status: 'active' | 'paused' | 'failed'
}

interface ReportFilters {
  dateRange: string
  category: string
  metric: string
  location: string
  userType: string
}

export function ReportingDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: "30d",
    category: "all",
    metric: "all",
    location: "all",
    userType: "all"
  })
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d")
  const [showCreateReport, setShowCreateReport] = useState(false)
  const [showScheduleReport, setShowScheduleReport] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
      fetchReports()
      fetchTemplates()
      fetchScheduledReports()
    }
  }, [user, selectedTimeframe])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError("")

      // Since backend has limited analytics endpoints, we'll use mock data for now
      // In production: const response = await api.getAnalyticsOverview()
      
      const mockData = generateMockAnalyticsData()
      setAnalyticsData(mockData)
    } catch (error) {
      console.error("Analytics fetch error:", error)
      setError("Failed to load analytics data")
      toast.error("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const generateMockAnalyticsData = (): AnalyticsData[] => {
    const metrics = [
      { name: "Total Revenue", icon: DollarSign, color: "text-green-600" },
      { name: "Active Users", icon: Users, color: "text-blue-600" },
      { name: "Products Sold", icon: Package, color: "text-purple-600" },
      { name: "Shipments", icon: Truck, color: "text-orange-600" },
      { name: "Transactions", icon: CreditCard, color: "text-indigo-600" },
      { name: "Market Growth", icon: TrendingUp, color: "text-emerald-600" }
    ]

    return metrics.map((metric, index) => {
      const baseValue = Math.floor(Math.random() * 1000000) + 100000
      const change = Math.floor(Math.random() * 20000) - 10000
      const changeType = change > 0 ? 'increase' as const : 'decrease' as const
      
      // Generate trend data (last 30 days)
      const trend = Array.from({ length: 30 }, () => 
        baseValue + Math.floor(Math.random() * 100000) - 50000
      )

      return {
        metric: metric.name,
        value: baseValue,
        change: Math.abs(change),
        changeType,
        timeframe: selectedTimeframe,
        trend,
        comparison: {
          previous: baseValue - change,
          current: baseValue,
          percentage: Math.round((change / (baseValue - change)) * 100)
        }
      }
    })
  }

  const fetchReports = async () => {
    try {
      // In production: const response = await api.getReportHistory()
      const mockReports = generateMockReports()
      setReports(mockReports)
    } catch (error) {
      console.error("Reports fetch error:", error)
    }
  }

  const generateMockReports = (): Report[] => {
    const reportTypes = ['Financial', 'Operational', 'User Analytics', 'Market Performance', 'Inventory', 'Logistics']
    const statuses: Report['status'][] = ['completed', 'processing', 'failed', 'scheduled']
    const formats: Report['format'][] = ['pdf', 'excel', 'csv']
    
    return Array.from({ length: 15 }, (_, index) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      const completedDate = status === 'completed' ? new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined
      
      return {
        id: `report_${String(index + 1).padStart(3, '0')}`,
        name: `${reportTypes[Math.floor(Math.random() * reportTypes.length)]} Report ${index + 1}`,
        type: reportTypes[Math.floor(Math.random() * reportTypes.length)],
        status,
        createdAt: createdDate.toISOString(),
        completedAt: completedDate?.toISOString(),
        parameters: {
          dateRange: selectedTimeframe,
          category: 'all',
          metrics: ['revenue', 'users', 'transactions']
        },
        format: formats[Math.floor(Math.random() * formats.length)],
        size: status === 'completed' ? `${Math.floor(Math.random() * 5000) + 100}KB` : undefined,
        downloadUrl: status === 'completed' ? `/api/reports/${index + 1}/download` : undefined
      }
    })
  }

  const fetchTemplates = async () => {
    try {
      // In production: const response = await api.getReportTemplates()
      const mockTemplates = generateMockTemplates()
      setTemplates(mockTemplates)
    } catch (error) {
      console.error("Templates fetch error:", error)
    }
  }

  const generateMockTemplates = (): ReportTemplate[] => {
    const templateTypes = ['Financial Summary', 'User Growth', 'Market Analysis', 'Inventory Report', 'Performance Metrics']
    
    return templateTypes.map((type, index) => ({
      id: `template_${index + 1}`,
      name: type,
      description: `Standard ${type.toLowerCase()} report template`,
      type: type.toLowerCase().replace(' ', '_'),
      parameters: {
        dateRange: '30d',
        category: 'all',
        metrics: ['revenue', 'users', 'transactions'],
        format: 'pdf'
      },
      isDefault: index === 0,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }))
  }

  const fetchScheduledReports = async () => {
    try {
      // In production: const response = await api.getScheduledReports()
      const mockScheduled = generateMockScheduledReports()
      setScheduledReports(mockScheduled)
    } catch (error) {
      console.error("Scheduled reports fetch error:", error)
    }
  }

  const generateMockScheduledReports = (): ScheduledReport[] => {
    const frequencies: ScheduledReport['schedule']['frequency'][] = ['daily', 'weekly', 'monthly', 'quarterly']
    const statuses: ScheduledReport['status'][] = ['active', 'paused', 'failed']
    
    return Array.from({ length: 8 }, (_, index) => {
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const lastRun = Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined
      const nextRun = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      
      return {
        id: `scheduled_${index + 1}`,
        name: `Scheduled Report ${index + 1}`,
        type: 'Financial Summary',
        schedule: {
          frequency,
          time: '09:00',
          dayOfWeek: frequency === 'weekly' ? Math.floor(Math.random() * 7) : undefined,
          dayOfMonth: frequency === 'monthly' ? Math.floor(Math.random() * 28) + 1 : undefined,
          recipients: [`user${index + 1}@example.com`]
        },
        lastRun: lastRun?.toISOString(),
        nextRun: nextRun.toISOString(),
        status
      }
    })
  }

  const generateReport = async (reportType: string, parameters: any) => {
    try {
      // In production: await api.generateReport(reportType, parameters)
      toast.success("Report generation started")
      
      // Simulate report creation
      const newReport: Report = {
        id: `report_${Date.now()}`,
        name: `${reportType} Report`,
        type: reportType,
        status: 'processing',
        createdAt: new Date().toISOString(),
        parameters,
        format: 'pdf'
      }
      
      setReports(prev => [newReport, ...prev])
      
      // Simulate completion after 3 seconds
      setTimeout(() => {
        setReports(prev => 
          prev.map(r => r.id === newReport.id ? { ...r, status: 'completed' as const } : r)
        )
        toast.success("Report generated successfully")
      }, 3000)
      
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Failed to generate report")
    }
  }

  const downloadReport = async (reportId: string, format: string) => {
    try {
      // In production: await api.downloadReport(reportId, format)
      toast.success(`Downloading report in ${format.toUpperCase()} format`)
    } catch (error) {
      console.error("Error downloading report:", error)
      toast.error("Failed to download report")
    }
  }

  const scheduleReport = async (reportType: string, schedule: any) => {
    try {
      // In production: await api.scheduleReport(reportType, schedule)
      toast.success("Report scheduled successfully")
      
      const newScheduled: ScheduledReport = {
        id: `scheduled_${Date.now()}`,
        name: `Scheduled ${reportType}`,
        type: reportType,
        schedule,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      }
      
      setScheduledReports(prev => [newScheduled, ...prev])
    } catch (error) {
      console.error("Error scheduling report:", error)
      toast.error("Failed to schedule report")
    }
  }

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case "processing":
        return <Badge variant="secondary">Processing</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMetricIcon = (metricName: string) => {
    if (metricName.includes("Revenue")) return <DollarSign className="h-4 w-4" />
    if (metricName.includes("Users")) return <Users className="h-4 w-4" />
    if (metricName.includes("Products")) return <Package className="h-4 w-4" />
    if (metricName.includes("Shipments")) return <Truck className="h-4 w-4" />
    if (metricName.includes("Transactions")) return <CreditCard className="h-4 w-4" />
    if (metricName.includes("Growth")) return <TrendingUp className="h-4 w-4" />
    return <BarChart3 className="h-4 w-4" />
  }

  const getChangeIcon = (changeType: 'increase' | 'decrease') => {
    return changeType === 'increase' 
      ? <TrendingUp className="h-4 w-4 text-green-500" />
      : <TrendingDown className="h-4 w-4 text-red-500" />
  }

  if (!user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading reporting dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive business intelligence, reporting, and data analytics
            </p>
          </div>

          <div className="flex space-x-2">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateReport(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
            <Button onClick={() => setShowScheduleReport(true)} variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
            <Button onClick={fetchAnalyticsData} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Analytics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {analyticsData.map((metric, index) => (
            <Card key={metric.metric}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                <div className="p-2 bg-muted rounded-lg">
                  {getMetricIcon(metric.metric)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦{metric.value.toLocaleString()}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {getChangeIcon(metric.changeType)}
                  <span className={`text-sm ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.changeType === 'increase' ? '+' : '-'}₦{metric.change.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs previous {selectedTimeframe}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Revenue trend visualization</p>
                        <p className="text-sm text-muted-foreground">Chart component integration</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">User Engagement</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                          <span className="text-sm font-medium">75%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Conversion Rate</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                          </div>
                          <span className="text-sm font-medium">68%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Customer Satisfaction</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                          </div>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <ReportsList 
                reports={reports}
                onGenerateReport={generateReport}
                onDownloadReport={downloadReport}
              />
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <TemplatesList 
                templates={templates}
                onUseTemplate={(template) => {
                  setShowCreateReport(true)
                  // In production: Pre-fill form with template parameters
                }}
              />
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-4">
              <ScheduledReportsList 
                scheduledReports={scheduledReports}
                onUpdateSchedule={(scheduleId, updates) => {
                  // In production: await api.updateScheduledReport(scheduleId, updates)
                  toast.success("Schedule updated")
                }}
                onDeleteSchedule={(scheduleId) => {
                  // In production: await api.deleteScheduledReport(scheduleId)
                  setScheduledReports(prev => prev.filter(s => s.id !== scheduleId))
                  toast.success("Schedule deleted")
                }}
              />
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <DataInsights />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

interface ReportsListProps {
  reports: Report[]
  onGenerateReport: (type: string, parameters: any) => void
  onDownloadReport: (reportId: string, format: string) => void
}

function ReportsList({ reports, onGenerateReport, onDownloadReport }: ReportsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No reports generated yet</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(report.status)}
                    <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {report.status === 'completed' && report.size && (
                      <span>Size: {report.size}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {report.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadReport(report.id, report.format)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    {report.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onGenerateReport(report.type, report.parameters)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface TemplatesListProps {
  templates: ReportTemplate[]
  onUseTemplate: (template: ReportTemplate) => void
}

function TemplatesList({ templates, onUseTemplate }: TemplatesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={template.isDefault ? "default" : "outline"}>
                    {template.isDefault ? "Default" : "Custom"}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => onUseTemplate(template)}
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface ScheduledReportsListProps {
  scheduledReports: ScheduledReport[]
  onUpdateSchedule: (scheduleId: string, updates: any) => void
  onDeleteSchedule: (scheduleId: string) => void
}

function ScheduledReportsList({ scheduledReports, onUpdateSchedule, onDeleteSchedule }: ScheduledReportsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scheduledReports.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No scheduled reports</p>
            </div>
          ) : (
            scheduledReports.map((scheduled) => (
              <div key={scheduled.id} className="border rounded-lg p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{scheduled.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {scheduled.type} • {scheduled.schedule.frequency}
                    </p>
                  </div>
                  <Badge variant={scheduled.status === 'active' ? 'default' : 'secondary'}>
                    {scheduled.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <div>Next run: {new Date(scheduled.nextRun).toLocaleString()}</div>
                    {scheduled.lastRun && (
                      <div>Last run: {new Date(scheduled.lastRun).toLocaleString()}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateSchedule(scheduled.id, { status: 'paused' })}
                    >
                      Pause
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteSchedule(scheduled.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function DataInsights() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Revenue Growth</h4>
                  <p className="text-sm text-muted-foreground">
                    Revenue increased by 15% compared to last month
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">User Engagement</h4>
                  <p className="text-sm text-muted-foreground">
                    Active users increased by 23% this quarter
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Package className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium">Product Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Top 3 products account for 45% of total sales
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Focus on High-Value Users</h4>
                  <p className="text-sm text-muted-foreground">
                    Implement targeted marketing for users with high transaction values
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Zap className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium">Optimize Supply Chain</h4>
                  <p className="text-sm text-muted-foreground">
                    Reduce delivery times by 20% to improve customer satisfaction
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Award className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-medium">Expand Product Range</h4>
                  <p className="text-sm text-muted-foreground">
                    Add 5 new product categories to increase market coverage
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
