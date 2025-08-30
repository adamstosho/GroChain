import { apiService } from './api'

export interface Commission {
  _id: string
  partner: {
    _id: string
    name: string
    organization: string
  }
  farmer: {
    _id: string
    name: string
    email: string
    phone: string
  }
  order: {
    _id: string
    orderNumber: string
    total: number
    status: string
  }
  listing: {
    _id: string
    cropName: string
    price: number
  }
  amount: number
  rate: number
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  orderAmount: number
  orderDate: Date
  paidAt?: Date
  withdrawalId?: string
  notes?: string
  metadata?: any
  createdAt: Date
  updatedAt: Date
}

export interface CommissionStats {
  totalCommissions: number
  totalAmount: number
  statusBreakdown: Array<{
    _id: string
    count: number
    totalAmount: number
  }>
  monthlyBreakdown: Array<{
    _id: {
      year: number
      month: number
    }
    count: number
    totalAmount: number
  }>
  averageCommission: number
}

export interface CommissionSummary {
  summary: {
    totalCommissions: number
    pendingCommissions: number
    paidCommissions: number
    totalAmount: number
    pendingAmount: number
    paidAmount: number
  }
  recentCommissions: Commission[]
}

export interface CommissionFilters {
  page?: number
  limit?: number
  status?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Mock data for development
const mockCommissions: Commission[] = [
  {
    _id: "1",
    partner: { _id: "partner1", name: "Sample Partner", organization: "Sample Org" },
    farmer: { _id: "farmer1", name: "John Doe", email: "john@example.com", phone: "+2348000000001" },
    order: { _id: "order1", orderNumber: "ORD001", total: 50000, status: "completed" },
    listing: { _id: "listing1", cropName: "Rice", price: 50000 },
    amount: 2500,
    rate: 0.05,
    status: "paid",
    orderAmount: 50000,
    orderDate: new Date("2024-01-20"),
    paidAt: new Date("2024-01-25"),
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-25")
  },
  {
    _id: "2",
    partner: { _id: "partner1", name: "Sample Partner", organization: "Sample Org" },
    farmer: { _id: "farmer2", name: "Jane Smith", email: "jane@example.com", phone: "+2348000000002" },
    order: { _id: "order2", orderNumber: "ORD002", total: 35000, status: "completed" },
    listing: { _id: "listing2", cropName: "Maize", price: 35000 },
    amount: 1750,
    rate: 0.05,
    status: "pending",
    orderAmount: 35000,
    orderDate: new Date("2024-01-18"),
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18")
  },
  {
    _id: "3",
    partner: { _id: "partner1", name: "Sample Partner", organization: "Sample Org" },
    farmer: { _id: "farmer3", name: "Mike Johnson", email: "mike@example.com", phone: "+2348000000003" },
    order: { _id: "order3", orderNumber: "ORD003", total: 42000, status: "completed" },
    listing: { _id: "listing3", cropName: "Cassava", price: 42000 },
    amount: 2100,
    rate: 0.05,
    status: "approved",
    orderAmount: 42000,
    orderDate: new Date("2024-01-15"),
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  }
]

const mockCommissionStats: CommissionStats = {
  totalCommissions: 156,
  totalAmount: 285000,
  statusBreakdown: [
    { _id: 'pending', count: 12, totalAmount: 17500 },
    { _id: 'approved', count: 8, totalAmount: 12000 },
    { _id: 'paid', count: 136, totalAmount: 255500 }
  ],
  monthlyBreakdown: [
    { _id: { year: 2024, month: 1 }, count: 45, totalAmount: 45000 },
    { _id: { year: 2024, month: 2 }, count: 52, totalAmount: 52000 },
    { _id: { year: 2024, month: 3 }, count: 48, totalAmount: 48000 },
    { _id: { year: 2024, month: 4 }, count: 50, totalAmount: 50000 },
    { _id: { year: 2024, month: 5 }, count: 45, totalAmount: 45000 },
    { _id: { year: 2024, month: 6 }, count: 45, totalAmount: 45000 }
  ],
  averageCommission: 1827
}

const mockCommissionSummary: CommissionSummary = {
  summary: {
    totalCommissions: 156,
    pendingCommissions: 12,
    paidCommissions: 136,
    totalAmount: 285000,
    pendingAmount: 17500,
    paidAmount: 255500
  },
  recentCommissions: mockCommissions
}

export class CommissionService {
  private static instance: CommissionService
  private cache: Map<string, any> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): CommissionService {
    if (!CommissionService.instance) {
      CommissionService.instance = new CommissionService()
    }
    return CommissionService.instance
  }

  private getCacheKey(key: string): string {
    return `commission_${key}`
  }

  private getCache(key: string): any {
    const cacheKey = this.getCacheKey(key)
    const expiry = this.cacheExpiry.get(cacheKey)
    
    if (expiry && Date.now() < expiry) {
      return this.cache.get(cacheKey)
    }
    
    // Clear expired cache
    this.cache.delete(cacheKey)
    this.cacheExpiry.delete(cacheKey)
    return null
  }

  private setCache(key: string, data: any): void {
    const cacheKey = this.getCacheKey(key)
    this.cache.set(cacheKey, data)
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION)
  }

  private clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  async getCommissions(filters: CommissionFilters = {}): Promise<{ commissions: Commission[]; pagination: any }> {
    const cacheKey = `commissions_${JSON.stringify(filters)}`
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const response = await apiService.getCommissions(filters)
      const result = {
        commissions: response.data.commissions || [],
        pagination: response.data.pagination || {}
      }
      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      // Fallback to mock data
      const result = {
        commissions: mockCommissions,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: mockCommissions.length,
          itemsPerPage: mockCommissions.length
        }
      }
      this.setCache(cacheKey, result)
      return result
    }
  }

  async getCommissionById(id: string): Promise<Commission> {
    const cacheKey = `commission_${id}`
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const response = await apiService.getCommissionById(id)
      const commission = response.data
      this.setCache(cacheKey, commission)
      return commission
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      // Fallback to mock data
      const commission = mockCommissions.find(c => c._id === id)
      if (commission) {
        this.setCache(cacheKey, commission)
        return commission
      }
      throw new Error('Commission not found')
    }
  }

  async getCommissionStats(filters: any = {}): Promise<CommissionStats> {
    const cacheKey = `stats_${JSON.stringify(filters)}`
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const response = await apiService.getCommissionStats(filters)
      const stats = response.data
      this.setCache(cacheKey, stats)
      return stats
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      // Fallback to mock data
      this.setCache(cacheKey, mockCommissionStats)
      return mockCommissionStats
    }
  }

  async getPartnerCommissionSummary(partnerId: string): Promise<CommissionSummary> {
    const cacheKey = `summary_${partnerId}`
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const response = await apiService.getPartnerCommissionSummary(partnerId)
      const summary = response.data
      this.setCache(cacheKey, summary)
      return summary
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      // Fallback to mock data
      this.setCache(cacheKey, mockCommissionSummary)
      return mockCommissionSummary
    }
  }

  async updateCommissionStatus(id: string, data: { status: string; notes?: string }): Promise<Commission> {
    try {
      const response = await apiService.updateCommissionStatus(id, data)
      // Clear related cache
      this.clearCache()
      return response.data
    } catch (error) {
      console.error('Failed to update commission status:', error)
      throw error
    }
  }

  async processCommissionPayout(data: { commissionIds: string[]; payoutMethod: string; payoutDetails: any }): Promise<any> {
    try {
      const response = await apiService.processCommissionPayout(data)
      // Clear related cache
      this.clearCache()
      return response.data
    } catch (error) {
      console.error('Failed to process commission payout:', error)
      throw error
    }
  }

  // Utility methods
  getCommissionStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  getCommissionStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return '⏳'
      case 'approved': return '✅'
      case 'paid': return '💰'
      case 'cancelled': return '❌'
      default: return '❓'
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  }
}

export const commissionService = CommissionService.getInstance()
