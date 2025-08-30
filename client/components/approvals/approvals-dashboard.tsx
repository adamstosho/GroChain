"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useApprovals } from "@/hooks/use-approvals"
import { HarvestApproval, ApprovalFilters } from "@/lib/types/approvals"
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  MapPin,
  Package,
  Scale,
  Star,
  RefreshCw,
  Download,
  Upload,
  Users,
  TrendingUp,
  FileText
} from "lucide-react"

interface ApprovalsDashboardProps {
  className?: string
}

export function ApprovalsDashboard({ className }: ApprovalsDashboardProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [cropFilter, setCropFilter] = useState<string>("all")
  const [selectedApproval, setSelectedApproval] = useState<HarvestApproval | null>(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false)
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [rejectionReason, setRejectionReason] = useState("")
  const [approvalNotes, setApprovalNotes] = useState("")

  const { 
    approvals, 
    stats, 
    isLoading, 
    error, 
    filters, 
    setFilters, 
    refreshData, 
    approveHarvest, 
    rejectHarvest, 
    markForReview, 
    batchProcess, 
    exportData, 
    clearCache 
  } = useApprovals()

  useEffect(() => {
    // Apply filters when they change
    const newFilters: ApprovalFilters = {
      searchTerm: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      cropType: cropFilter !== 'all' ? cropFilter : undefined,
    }
    setFilters(newFilters)
  }, [searchTerm, statusFilter, priorityFilter, cropFilter, setFilters])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case "under_review":
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" />Under Review</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="default">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getQualityScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const handleApprove = async (approvalId: string) => {
    try {
      await approveHarvest(approvalId, approvalNotes)
      setIsApprovalDialogOpen(false)
      setApprovalNotes("")
      setSelectedApproval(null)
      // Refresh data to show updated status
      refreshData()
    } catch (error) {
      console.error('Error approving harvest:', error)
      // Show error to user
      alert('Failed to approve harvest. Please try again.')
    }
  }

  const handleReject = async (approvalId: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }

    try {
      await rejectHarvest(approvalId, rejectionReason, approvalNotes)
      setIsApprovalDialogOpen(false)
      setRejectionReason("")
      setApprovalNotes("")
      setSelectedApproval(null)
      // Refresh data to show updated status
      refreshData()
    } catch (error) {
      console.error('Error rejecting harvest:', error)
      // Show error to user
      alert('Failed to reject harvest. Please try again.')
    }
  }

  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedApprovals.length === 0) {
      alert("Please select approvals to process")
      return
    }

    try {
      if (action === 'approve') {
        await batchProcess('approve', selectedApprovals, approvalNotes)
      } else {
        if (!rejectionReason.trim()) {
          alert("Please provide a rejection reason")
          return
        }
        await batchProcess('reject', selectedApprovals, approvalNotes, rejectionReason)
      }
      
      setSelectedApprovals([])
      setIsBatchDialogOpen(false)
      setApprovalNotes("")
      setRejectionReason("")
    } catch (error) {
      console.error(`Error in batch ${action}:`, error)
    }
  }

  const toggleApprovalSelection = (approvalId: string) => {
    setSelectedApprovals(prev => 
      prev.includes(approvalId)
        ? prev.filter(id => id !== approvalId)
        : [...prev, approvalId]
    )
  }

  const getCurrentTabApprovals = () => {
    if (activeTab === "all") return approvals
    return approvals.filter(approval => approval.status === activeTab)
  }

  const getPaginatedApprovals = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return getCurrentTabApprovals().slice(startIndex, endIndex)
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-medium text-red-900">Error Loading Approvals</h3>
            <p className="text-red-700">{error}</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !stats) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-6 bg-muted rounded w-48" />
                <div className="h-4 bg-muted rounded w-32" />
              </div>
              <div className="h-10 bg-muted rounded w-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-8 bg-muted rounded w-16" />
                  <div className="h-3 bg-muted rounded w-32" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Harvest Approvals</h2>
          <p className="text-muted-foreground">Manage and review farmer harvest submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsBatchDialogOpen(true)} 
            disabled={selectedApprovals.length === 0}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            Batch Approve ({selectedApprovals.length})
          </Button>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.weeklyTrend}%</span> from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending > 0 ? "Requires attention" : "All caught up"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              ₦{stats.totalValue.toLocaleString()} total value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality Score</CardTitle>
            <Star className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageQualityScore}/10</div>
            <p className="text-xs text-muted-foreground">
              Quality benchmark met
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Find specific approvals or filter by criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search farmers, crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cropFilter} onValueChange={setCropFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Crop Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                <SelectItem value="Tomatoes">Tomatoes</SelectItem>
                <SelectItem value="Cassava">Cassava</SelectItem>
                <SelectItem value="Maize">Maize</SelectItem>
                <SelectItem value="Rice">Rice</SelectItem>
                <SelectItem value="Yam">Yam</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearCache}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approvals Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Harvest Submissions</CardTitle>
          <CardDescription>Review and manage farmer harvest submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({approvals.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
              <TabsTrigger value="under_review">Review ({stats.underReview})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {/* Approvals List */}
              <div className="space-y-4">
                {getPaginatedApprovals().map((approval) => (
                  <Card key={approval._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Checkbox for batch selection */}
                          <input
                            type="checkbox"
                            checked={selectedApprovals.includes(approval._id)}
                            onChange={() => toggleApprovalSelection(approval._id)}
                            className="mt-2 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          
                          {/* Farmer Info */}
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={approval.farmer.avatar} />
                            <AvatarFallback>
                              {approval.farmer.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{approval.farmer.name}</h3>
                                <p className="text-sm text-muted-foreground">{approval.farmer.email}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(approval.status)}
                                {getPriorityBadge(approval.priority)}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center space-x-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {approval.harvest.cropType} - {approval.harvest.quantity} {approval.harvest.unit}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {new Date(approval.harvest.harvestDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{approval.location}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Scale className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">₦{approval.estimatedValue.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            {approval.harvest.description && (
                              <p className="text-sm text-muted-foreground">
                                {approval.harvest.description}
                              </p>
                            )}
                            
                            {/* Quality Score */}
                            {approval.harvest.qualityScore && (
                              <div className="flex items-center space-x-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className={`text-sm font-medium ${getQualityScoreColor(approval.harvest.qualityScore)}`}>
                                  Quality Score: {approval.harvest.qualityScore}/10
                                </span>
                              </div>
                            )}
                            
                            {/* Approval Notes or Rejection Reason */}
                            {approval.approvalNotes && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-sm text-green-800">
                                  <strong>Approval Notes:</strong> {approval.approvalNotes}
                                </p>
                              </div>
                            )}
                            
                            {approval.rejectionReason && (
                              <div className="bg-red-50 p-3 rounded-lg">
                                <p className="text-sm text-red-800">
                                  <strong>Rejection Reason:</strong> {approval.rejectionReason}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApproval(approval)
                              setIsApprovalDialogOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                          
                          {approval.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(approval._id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedApproval(approval)
                                  setIsApprovalDialogOpen(true)
                                }}
                              >
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {getPaginatedApprovals().length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No approvals found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {getCurrentTabApprovals().length > itemsPerPage && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getCurrentTabApprovals().length)} of {getCurrentTabApprovals().length} approvals
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(getCurrentTabApprovals().length / itemsPerPage)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Harvest Submission</DialogTitle>
            <DialogDescription>
              Review the harvest details and make your decision
            </DialogDescription>
          </DialogHeader>
          
          {selectedApproval && (
            <div className="space-y-6">
              {/* Harvest Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Farmer Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedApproval.farmer.name}</p>
                    <p><strong>Email:</strong> {selectedApproval.farmer.email}</p>
                    <p><strong>Phone:</strong> {selectedApproval.farmer.phone}</p>
                    <p><strong>Location:</strong> {selectedApproval.location}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Harvest Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Crop:</strong> {selectedApproval.harvest.cropType}</p>
                    <p><strong>Quantity:</strong> {selectedApproval.harvest.quantity} {selectedApproval.harvest.unit}</p>
                    <p><strong>Harvest Date:</strong> {new Date(selectedApproval.harvest.harvestDate).toLocaleDateString()}</p>
                    <p><strong>Estimated Value:</strong> ₦{selectedApproval.estimatedValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Photos */}
              {selectedApproval.harvest.photos.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Harvest Photos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedApproval.harvest.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Harvest photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Description */}
              {selectedApproval.harvest.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedApproval.harvest.description}</p>
                </div>
              )}
              
              {/* Notes Input */}
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <Textarea
                  placeholder="Add your notes here..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              {/* Rejection Reason Input */}
              <div>
                <h4 className="font-medium mb-2">Rejection Reason (if rejecting)</h4>
                <Textarea
                  placeholder="Provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsApprovalDialogOpen(false)
                    setApprovalNotes("")
                    setRejectionReason("")
                    setSelectedApproval(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedApproval._id)}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedApproval._id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Batch Action Dialog */}
      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Action</DialogTitle>
            <DialogDescription>
              Process multiple approvals at once
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have selected <strong>{selectedApprovals.length}</strong> approval{selectedApprovals.length !== 1 ? 's' : ''} for batch processing.
            </p>
            
            {/* Notes Input */}
            <div>
              <h4 className="font-medium mb-2">Notes (optional)</h4>
              <Textarea
                placeholder="Add notes for the batch action..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={2}
              />
            </div>
            
            {/* Rejection Reason Input */}
            <div>
              <h4 className="font-medium mb-2">Rejection Reason (if rejecting)</h4>
              <Textarea
                placeholder="Provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleBatchAction('approve')}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Batch Approve All
              </Button>
              
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleBatchAction('reject')}
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Batch Reject All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
