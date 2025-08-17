// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: string
}

// User Types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export type UserRole = 'farmer' | 'buyer' | 'partner' | 'aggregator' | 'admin'

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterRequest {
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
}

// Harvest Types
export interface Harvest {
  id: string
  batchId: string
  farmer: string | User
  cropType: string
  quantity: number
  date: string
  geoLocation: {
    lat: number
    lng: number
  }
  qrData: string
  createdAt: string
  updatedAt: string
}

// Marketplace Types
export interface MarketplaceListing {
  id: string
  product: string
  price: number
  quantity: number
  farmer: string | User
  partner: string | User
  images: string[]
  status: 'active' | 'sold' | 'removed'
  createdAt: string
  updatedAt: string
}

// Payment Types
export interface PaymentRequest {
  amount: number
  currency: string
  productId: string
  buyerId: string
  sellerId: string
  description?: string
}

// Analytics Types
export interface DashboardAnalytics {
  totalFarmers: number
  totalHarvests: number
  totalTransactions: number
  totalRevenue: number
  monthlyGrowth: number
  topCrops: Array<{
    cropType: string
    quantity: number
    revenue: number
  }>
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
  }>
}

// IoT Types
export interface Sensor {
  id: string
  farmerId: string
  farmer: User
  type: 'soil' | 'weather' | 'crop' | 'irrigation'
  location: {
    lat: number
    lng: number
    address: string
  }
  status: 'active' | 'inactive' | 'maintenance'
  lastReading: {
    timestamp: string
    value: number
    unit: string
  }
  createdAt: string
  updatedAt: string
}

// Commission Types
export interface Commission {
  id: string
  partnerId: string
  partner: User
  farmerId: string
  farmer: User
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'cancelled'
  transactionId?: string
  createdAt: string
  paidAt?: string
}

// Error Types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}