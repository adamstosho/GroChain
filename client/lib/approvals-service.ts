import { apiService } from "./api"
import { 
  HarvestApproval, 
  ApprovalStats, 
  ApprovalFilters, 
  ApprovalAction, 
  BatchApprovalAction,
  QualityAssessment,
  ApprovalMetrics
} from "./types/approvals"

export class ApprovalsService {
  private static instance: ApprovalsService
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ApprovalsService {
    if (!ApprovalsService.instance) {
      ApprovalsService.instance = new ApprovalsService()
    }
    return ApprovalsService.instance
  }

  private getCacheKey(key: string): string {
    return `approvals-${key}`
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data
    }
    return null
  }

  // Fetch all approvals with filters
  async getApprovals(filters: ApprovalFilters = {}): Promise<HarvestApproval[]> {
    const cacheKey = this.getCacheKey(`approvals-${JSON.stringify(filters)}`)
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      // Temporary mock data - replace with actual API call
      const { mockApprovals } = await import('./mock-data/approvals')
      let filteredApprovals = [...mockApprovals]
      
      // Apply filters
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase()
        filteredApprovals = filteredApprovals.filter(approval =>
          approval.farmer.name.toLowerCase().includes(searchTerm) ||
          approval.harvest.cropType.toLowerCase().includes(searchTerm) ||
          approval.farmer.location.toLowerCase().includes(searchTerm)
        )
      }
      
      if (filters.status && filters.status !== 'all') {
        filteredApprovals = filteredApprovals.filter(approval => approval.status === filters.status)
      }
      
      if (filters.priority && filters.priority !== 'all') {
        filteredApprovals = filteredApprovals.filter(approval => approval.priority === filters.priority)
      }
      
      if (filters.cropType && filters.cropType !== 'all') {
        filteredApprovals = filteredApprovals.filter(approval => approval.harvest.cropType === filters.cropType)
      }
      
      this.setCache(cacheKey, filteredApprovals)
      return filteredApprovals
    } catch (error) {
      console.error('Error fetching approvals:', error)
      throw error
    }
  }

  // Fetch approval statistics
  async getApprovalStats(): Promise<ApprovalStats> {
    const cacheKey = this.getCacheKey('stats')
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      // Temporary mock data - replace with actual API call
      const { mockApprovalStats } = await import('./mock-data/approvals')
      this.setCache(cacheKey, mockApprovalStats)
      return mockApprovalStats
    } catch (error) {
      console.error('Error fetching approval stats:', error)
      throw error
    }
  }

  // Fetch single approval by ID
  async getApprovalById(approvalId: string): Promise<HarvestApproval> {
    try {
      const response = await apiService.getApprovalById(approvalId)
      return response.data
    } catch (error) {
      console.error('Error fetching approval:', error)
      throw error
    }
  }

  // Approve a harvest
  async approveHarvest(approvalId: string, notes?: string, qualityAssessment?: QualityAssessment): Promise<HarvestApproval> {
    try {
      // For now, simulate approval with mock data
      const { mockApprovals } = await import('./mock-data/approvals')
      const approval = mockApprovals.find(a => a._id === approvalId)
      
      if (!approval) {
        throw new Error('Approval not found')
      }
      
      // Update the approval status
      approval.status = 'approved'
      approval.approvalNotes = notes
      approval.reviewedAt = new Date()
      approval.reviewedBy = 'partner_user'
      
      if (qualityAssessment) {
        approval.qualityAssessment = qualityAssessment
      }
      
      this.clearCache() // Clear cache after approval
      return approval
    } catch (error) {
      console.error('Error approving harvest:', error)
      throw error
    }
  }

  // Reject a harvest
  async rejectHarvest(approvalId: string, reason: string, notes?: string): Promise<HarvestApproval> {
    try {
      // For now, simulate rejection with mock data
      const { mockApprovals } = await import('./mock-data/approvals')
      const approval = mockApprovals.find(a => a._id === approvalId)
      
      if (!approval) {
        throw new Error('Approval not found')
      }
      
      // Update the approval status
      approval.status = 'rejected'
      approval.rejectionReason = reason
      approval.approvalNotes = notes
      approval.reviewedAt = new Date()
      approval.reviewedBy = 'partner_user'
      
      this.clearCache() // Clear cache after rejection
      return approval
    } catch (error) {
      console.error('Error rejecting harvest:', error)
      throw error
    }
  }

  // Mark harvest for review
  async markForReview(approvalId: string, notes?: string): Promise<HarvestApproval> {
    try {
      const response = await apiService.markForReview(approvalId, { notes })
      this.clearCache() // Clear cache after status change
      return response.data
    } catch (error) {
      console.error('Error marking for review:', error)
      throw error
    }
  }

  // Batch approve/reject multiple harvests
  async batchProcessApprovals(batchAction: BatchApprovalAction): Promise<{ success: number; failed: number }> {
    try {
      // For now, simulate batch processing with mock data
      const { mockApprovals } = await import('./mock-data/approvals')
      let success = 0
      let failed = 0
      
      for (const approvalId of batchAction.approvalIds) {
        try {
          const approval = mockApprovals.find(a => a._id === approvalId)
          if (approval) {
            if (batchAction.action === 'approve') {
              approval.status = 'approved'
              approval.approvalNotes = batchAction.notes
            } else {
              approval.status = 'rejected'
              approval.rejectionReason = batchAction.reason
              approval.approvalNotes = batchAction.notes
            }
            approval.reviewedAt = new Date()
            approval.reviewedBy = 'partner_user'
            success++
          } else {
            failed++
          }
        } catch (error) {
          failed++
        }
      }
      
      this.clearCache() // Clear cache after batch processing
      return { success, failed }
    } catch (error) {
      console.error('Error processing batch approvals:', error)
      throw error
    }
  }

  // Get approval metrics
  async getApprovalMetrics(filters?: ApprovalFilters): Promise<ApprovalMetrics> {
    const cacheKey = this.getCacheKey(`metrics-${JSON.stringify(filters)}`)
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const response = await apiService.getApprovalMetrics(filters)
      this.setCache(cacheKey, response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching approval metrics:', error)
      throw error
    }
  }

  // Get approval history
  async getApprovalHistory(approvalId: string): Promise<any[]> {
    try {
      const response = await apiService.getApprovalHistory(approvalId)
      return response.data
    } catch (error) {
      console.error('Error fetching approval history:', error)
      throw error
    }
  }

  // Export approvals data
  async exportApprovals(filters: ApprovalFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await apiService.exportApprovals(filters, format)
      return response
    } catch (error) {
      console.error('Error exporting approvals:', error)
      throw error
    }
  }

  // Export data method for the hook
  async exportData(filters: ApprovalFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      // For now, return a mock CSV blob
      const csvContent = this.generateMockCSV(filters)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      return blob
    } catch (error) {
      console.error('Error exporting data:', error)
      throw error
    }
  }

  // Generate mock CSV for export
  private generateMockCSV(filters: ApprovalFilters): string {
    // Import mock data dynamically
    const mockData = require('./mock-data/approvals')
    let filteredApprovals = [...mockData.mockApprovals]
    
    // Apply filters
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      filteredApprovals = filteredApprovals.filter(approval =>
        approval.farmer.name.toLowerCase().includes(searchTerm) ||
        approval.harvest.cropType.toLowerCase().includes(searchTerm) ||
        approval.farmer.location.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters.status && filters.status !== 'all') {
      filteredApprovals = filteredApprovals.filter(approval => approval.status === filters.status)
    }
    
    if (filters.priority && filters.priority !== 'all') {
      filteredApprovals = filteredApprovals.filter(approval => approval.priority === filters.priority)
    }
    
    if (filters.cropType && filters.cropType !== 'all') {
      filteredApprovals = filteredApprovals.filter(approval => approval.harvest.cropType === filters.cropType)
    }
    
    // Generate CSV content
    const headers = ['Farmer Name', 'Email', 'Crop Type', 'Quantity', 'Unit', 'Status', 'Priority', 'Estimated Value', 'Location', 'Submitted Date']
    const rows = filteredApprovals.map(approval => [
      approval.farmer.name,
      approval.farmer.email,
      approval.harvest.cropType,
      approval.harvest.quantity,
      approval.harvest.unit,
      approval.status,
      approval.priority,
      approval.estimatedValue,
      approval.location,
      new Date(approval.submittedAt).toLocaleDateString()
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    return csvContent
  }

  // Utility methods for data processing
  filterApprovals(approvals: HarvestApproval[], filters: ApprovalFilters): HarvestApproval[] {
    let filtered = [...approvals]

    // Search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(approval =>
        approval.farmer.name.toLowerCase().includes(searchTerm) ||
        approval.harvest.cropType.toLowerCase().includes(searchTerm) ||
        approval.farmer.location.toLowerCase().includes(searchTerm) ||
        approval.harvest.description.toLowerCase().includes(searchTerm)
      )
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(approval => approval.status === filters.status)
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(approval => approval.priority === filters.priority)
    }

    // Crop type filter
    if (filters.cropType && filters.cropType !== 'all') {
      filtered = filtered.filter(approval => approval.harvest.cropType === filters.cropType)
    }

    // Location filter
    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(approval => approval.location === filters.location)
    }

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(approval => {
        const submittedDate = new Date(approval.submittedAt)
        return submittedDate >= filters.dateRange!.start && submittedDate <= filters.dateRange!.end
      })
    }

    return filtered
  }

  sortApprovals(approvals: HarvestApproval[], sortBy: string = 'submittedAt', sortOrder: 'asc' | 'desc' = 'desc'): HarvestApproval[] {
    const sorted = [...approvals]

    sorted.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'submittedAt':
          aValue = new Date(a.submittedAt)
          bValue = new Date(b.submittedAt)
          break
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder]
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder]
          break
        case 'estimatedValue':
          aValue = a.estimatedValue
          bValue = b.estimatedValue
          break
        case 'farmerName':
          aValue = a.farmer.name.toLowerCase()
          bValue = b.farmer.name.toLowerCase()
          break
        case 'cropType':
          aValue = a.harvest.cropType.toLowerCase()
          bValue = b.harvest.cropType.toLowerCase()
          break
        default:
          aValue = a[sortBy as keyof HarvestApproval]
          bValue = b[sortBy as keyof HarvestApproval]
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }

  paginateApprovals(approvals: HarvestApproval[], page: number, pageSize: number): {
    data: HarvestApproval[]
    total: number
    totalPages: number
    currentPage: number
    hasNext: boolean
    hasPrev: boolean
  } {
    const total = approvals.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const data = approvals.slice(startIndex, endIndex)

    return {
      data,
      total,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }

  // Calculate approval statistics from data
  calculateStats(approvals: HarvestApproval[]): ApprovalStats {
    const total = approvals.length
    const pending = approvals.filter(a => a.status === 'pending').length
    const approved = approvals.filter(a => a.status === 'approved').length
    const rejected = approvals.filter(a => a.status === 'rejected').length
    const underReview = approvals.filter(a => a.status === 'under_review').length
    
    const qualityScores = approvals
      .filter(a => a.harvest.qualityScore)
      .map(a => a.harvest.qualityScore!)
    
    const averageQualityScore = qualityScores.length > 0 
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
      : 0
    
    const totalValue = approvals
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + a.estimatedValue, 0)
    
    // Calculate weekly trend (mock data for now)
    const weeklyTrend = 12.5

    return {
      total,
      pending,
      approved,
      rejected,
      underReview,
      averageQualityScore: Math.round(averageQualityScore * 10) / 10,
      totalValue,
      weeklyTrend
    }
  }

  // Get quality score color based on score
  getQualityScoreColor(score: number): string {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  // Get quality score label
  getQualityScoreLabel(score: number): string {
    if (score >= 8) return "Excellent"
    if (score >= 6) return "Good"
    if (score >= 4) return "Average"
    return "Poor"
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const approvalsService = ApprovalsService.getInstance()
