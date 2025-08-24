import { ApiResponse, User, LoginRequest, LoginResponse, RegisterRequest, Harvest, MarketplaceListing } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

class ApiClient {
  private baseURL: string
  private token: string | null = null
  private isRefreshing: boolean = false
  private refreshPromise: Promise<string | null> | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.loadTokenFromStorage()
    }
  }

  private loadTokenFromStorage() {
    const storedToken = localStorage.getItem("auth_token")
    if (storedToken) {
      this.token = storedToken
      console.log('🔐 API - Token loaded from localStorage:', storedToken.substring(0, 20) + '...')
    } else {
      console.log('🔐 API - No token found in localStorage')
    }
  }

  // Generic HTTP methods for flexibility
  async get(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const url = `${endpoint}${queryParams.toString() ? `?${queryParams}` : ""}`
    return this.request(url)
  }

  async post(endpoint: string, data?: any): Promise<ApiResponse<any>> {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put(endpoint: string, data?: any): Promise<ApiResponse<any>> {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async patch(endpoint: string, data?: any): Promise<ApiResponse<any>> {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint: string): Promise<ApiResponse<any>> {
    return this.request(endpoint, {
      method: "DELETE",
    })
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  refreshTokenFromStorage() {
    this.loadTokenFromStorage()
  }

  private setAuthCookie(token: string) {
    try {
      const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
      document.cookie = `auth_token=${token}; Path=/; Max-Age=86400; SameSite=Lax${secure}`
    } catch {}
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      console.log('🔐 API - Token refresh already in progress, waiting...')
      return this.refreshPromise
    }
    
    this.isRefreshing = true
    this.refreshPromise = (async () => {
      try {
        console.log('🔐 API - Starting token refresh...')
        const storedRefresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null
        
        if (!storedRefresh) {
          console.log('🔐 API - No refresh token found')
          return null
        }

        console.log('🔐 API - Attempting refresh with stored refresh token')
        const resp = await fetch(`${this.baseURL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ refreshToken: storedRefresh })
        })
        
        console.log('🔐 API - Refresh response status:', resp.status)
        
        if (!resp.ok) {
          console.log('🔐 API - Refresh request failed with status:', resp.status)
          return null
        }
        
        const data = await resp.json()
        console.log('🔐 API - Refresh response data:', data)
        
        if (data && data.status === 'success' && data.accessToken) {
          const newAccess = data.accessToken as string
          const newRefresh = data.refreshToken as string | undefined
          
          console.log('🔐 API - Setting new tokens')
          this.token = newAccess
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', newAccess)
            if (newRefresh) {
              localStorage.setItem('refresh_token', newRefresh)
              console.log('🔐 API - New refresh token stored')
            }
          }
          
          this.setAuthCookie(newAccess)
          console.log('🔐 API - Token refresh successful')
          return newAccess
        }
        
        console.log('🔐 API - Invalid refresh response format')
        return null
      } catch (error) {
        console.error('🔐 API - Error during token refresh:', error)
        return null
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()
    
    return this.refreshPromise
  }

  private async request<T>(endpoint: string, options: (RequestInit & { _retry?: boolean }) = {}): Promise<ApiResponse<T>> {
    // Always try to load the latest token from storage before making a request
    if (typeof window !== "undefined" && !this.token) {
      this.loadTokenFromStorage()
    }
    
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(options.headers as Record<string, string> || {}),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
      console.log('🔐 API - Using token:', this.token.substring(0, 20) + '...')
    } else {
      console.log('🔐 API - No token available for request')
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', 
      mode: 'cors', 
    }

    try {
      console.log('🔐 API - Making request to:', url)
      console.log('🔐 API - Request options:', {
        method: requestOptions.method,
        headers: requestOptions.headers,
        hasBody: !!requestOptions.body,
        hasAuth: !!headers.Authorization
      })
      
      const response = await fetch(url, requestOptions)

      console.log('🔐 API - Response status:', response.status)
      console.log('🔐 API - Response ok:', response.ok)
      console.log('🔐 API - Response headers:', Object.fromEntries(response.headers.entries()))

      // Handle Unauthorized or Forbidden: attempt token refresh once
      if ((response.status === 401 || response.status === 403) && !options._retry) {
        console.log('🔐 API - Token expired or invalid, attempting refresh...')
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          console.log('🔐 API - Token refreshed successfully, retrying request...')
          headers.Authorization = `Bearer ${refreshed}`
          const retryOptions: RequestInit & { _retry?: boolean } = { ...options, headers, _retry: true }
          const retryResp = await fetch(url, {
            ...retryOptions,
            credentials: 'include',
            mode: 'cors',
          })
          const retryData = await retryResp.json().catch(() => ({}))
          const retrySuccess = retryResp.ok && (retryData.status === 'success' || retryData.status === undefined)
          if (retrySuccess) {
            console.log('🔐 API - Retry successful after token refresh')
            return { success: true, data: retryData }
          }
          console.log('🔐 API - Retry failed after token refresh')
          return { success: false, error: retryData.message || `HTTP ${retryResp.status}` }
        } else {
          console.log('🔐 API - Token refresh failed, clearing auth data')
          // Clear invalid tokens
          this.clearToken()
          if (typeof window !== 'undefined') {
            localStorage.removeItem('refresh_token')
            // Emit event for auth context to handle
            window.dispatchEvent(new CustomEvent('auth:token-expired'))
          }
          return { success: false, error: 'Authentication failed. Please log in again.' }
        }
      }

      // Handle CORS errors
      if (response.type === 'opaque') {
        console.error('🔐 API - CORS error detected')
        return {
          success: false,
          error: "CORS error: Unable to access the resource",
        }
      }

      const data = await response.json()
      console.log('🔐 API - Response data:', data)

      // Check if the response indicates success (either HTTP 2xx or backend status: 'success')
      const isSuccess = response.ok && (data.status === 'success' || data.status === undefined)

      if (!isSuccess) {
        console.error('🔐 API - Request failed:', {
          status: response.status,
          ok: response.ok,
          data: data
        })
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
        }
      }

      console.log('🔐 API - Request successful')
      return {
        success: true,
        data,
      }
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: "Network error: Unable to connect to the server",
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  // Authentication - Updated to match backend endpoints
  async register(userData: {
    name: string
    email: string
    phone: string
    password: string
    role: string
  }) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string }) {
    // Temporarily clear any existing token for login request
    const oldToken = this.token
    this.token = null
    
    console.log('🔐 API - Making login request without token')
    
    const result = await this.request<{ 
      status: string;
      accessToken: string; 
      refreshToken: string; 
      user: any;
      data?: {
        accessToken: string;
        refreshToken: string;
        user: any;
      }
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
    
    // Restore old token if login failed
    if (!result.success) {
      this.token = oldToken
    }
    
    console.log('🔐 API - Login request result:', result)
    
    return result
  }

  async refreshToken() {
    const storedRefresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null
    return this.request("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: storedRefresh }),
    })
  }

  // Logout - Clear token locally (backend doesn't have logout endpoint)
  async logout() {
    this.clearToken()
    return { success: true, data: { message: 'Logged out successfully' } }
  }

  // Forgot Password
  async forgotPassword(data: { email: string }) {
    return this.request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Reset Password
  async resetPassword(data: { token: string; password: string }) {
    return this.request("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Verify Email
  async verifyEmail(data: { token: string }) {
    return this.request("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Resend Verification Email
  async resendVerificationEmail(data: { email: string }) {
    return this.request("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async sendSmsOtp(phoneNumber: string) {
    return this.request("/api/auth/send-sms-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    })
  }

  async verifySmsOtp(phoneNumber: string, otp: string) {
    return this.request("/api/auth/verify-sms-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, otp }),
    })
  }

  // Harvests - Updated endpoints
  async getHarvests(params?: {
    farmer?: string
    cropType?: string
    startDate?: string
    endDate?: string
    minQuantity?: number
    maxQuantity?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/api/harvests${queryParams.toString() ? `?${queryParams}` : ""}`
    return this.request(endpoint)
  }

  async createHarvest(harvestData: {
    farmer: string
    cropType: string
    quantity: number
    date: string | Date
    geoLocation: { lat: number; lng: number }
  }) {
    return this.request("/api/harvests", {
      method: "POST",
      body: JSON.stringify(harvestData),
    })
  }

  async getHarvest(batchId: string) {
    return this.request(`/api/harvests/${batchId}`)
  }

  async getHarvestProvenance(batchId: string) {
    return this.request(`/api/harvests/provenance/${batchId}`)
  }

  async verifyHarvest(batchId: string) {
    return this.request(`/api/harvests/verify/${batchId}`)
  }

  // Marketplace - Updated to match backend endpoints
  async getMarketplaceListings(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    location?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/api/marketplace/listings${queryParams.toString() ? `?${queryParams}` : ""}`
    return this.request(endpoint)
  }

  // Add missing marketplace methods for backward compatibility
  async getMarketplaceProducts(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    location?: string
  }) {
    return this.getMarketplaceListings(params)
  }

  async getMarketplaceProduct(id: string) {
    return this.request(`/api/marketplace/listings/${id}`)
  }

  async getSearchSuggestions(query: string) {
    return this.request(`/api/marketplace/search-suggestions?q=${encodeURIComponent(query)}`)
  }

  async updateMarketplaceListing(listingId: string, updates: Partial<{ product: string; price: number; quantity: number; images: string[] }>) {
    return this.request(`/api/marketplace/listings/${listingId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }

  async unpublishMarketplaceListing(listingId: string) {
    return this.request(`/api/marketplace/listings/${listingId}/unpublish`, {
      method: "PATCH",
    })
  }

  async createMarketplaceListing(listingData: {
    product: string
    price: number
    quantity: number
    farmer: string
    partner: string
    images?: string[]
  }) {
    return this.request("/api/marketplace/listings", {
      method: "POST",
      body: JSON.stringify(listingData),
    })
  }

  async createMarketplaceOrder(orderData: {
    buyer: string
    items: Array<{ listing: string; quantity: number }>
  }) {
    return this.request("/api/marketplace/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/api/marketplace/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  }

  async uploadMarketplaceImage(imageData: FormData) {
    return this.request("/api/marketplace/upload-image", {
      method: "POST",
      body: imageData,
      headers: {}, // Let browser set content-type for FormData
    })
  }



  async getOrderDetails(orderId: string) {
    return this.request(`/api/marketplace/orders/${orderId}`)
  }

  async cancelOrder(orderId: string) {
    return this.request(`/api/marketplace/orders/${orderId}/cancel`, {
      method: "PATCH",
    })
  }

  async getOrderTracking(orderId: string) {
    return this.request(`/api/marketplace/orders/${orderId}/tracking`)
  }

  // Websocket status
  async getWebsocketStatus() {
    return this.request(`/api/websocket/status`)
  }

  // Favorites/Wishlist
  async getFavorites(userId: string) {
    return this.request(`/api/marketplace/favorites/${userId}`)
  }

  async addToFavorites(userId: string, listingId: string) {
    return this.request("/api/marketplace/favorites", {
      method: "POST",
      body: JSON.stringify({ userId, listingId }),
    })
  }

  async removeFromFavorites(userId: string, listingId: string) {
    return this.request(`/api/marketplace/favorites/${userId}/${listingId}`, {
      method: "DELETE",
    })
  }

  // Payments - Updated endpoints
  async initializePayment(paymentData: {
    orderId: string
    email: string
  }) {
    return this.request("/api/payments/initialize", {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  // Add missing payment method for backward compatibility
  async initiatePayment(paymentData: {
    orderId: string
    email: string
  }) {
    return this.request("/api/payments/initialize", {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  // Analytics - Complete analytics endpoints
  async getDashboardAnalytics() {
    return this.request("/api/analytics/dashboard")
  }

  async getFarmersAnalytics() {
    return this.request("/api/analytics/farmers")
  }

  async getTransactionsAnalytics() {
    return this.request("/api/analytics/transactions")
  }

  async getHarvestsAnalytics() {
    return this.request("/api/analytics/harvests")
  }

  async getMarketplaceAnalytics() {
    return this.request("/api/analytics/marketplace")
  }

  async getFintechAnalytics() {
    return this.request("/api/analytics/fintech")
  }

  async getImpactAnalytics() {
    return this.request("/api/analytics/impact")
  }

  async getRegionalAnalytics(regionData: any) {
    return this.request("/api/analytics/regional", {
      method: "POST",
      body: JSON.stringify(regionData),
    })
  }

  async getWeatherAnalytics() {
    return this.request("/api/analytics/weather")
  }

  async getPartnersAnalytics() {
    return this.request("/api/analytics/partners")
  }

  async getPredictiveAnalytics() {
    return this.request("/api/analytics/predictive")
  }

  async getAnalyticsSummary() {
    return this.request("/api/analytics/summary")
  }

  async generateAnalyticsReport(reportData: any) {
    return this.request("/api/analytics/report", {
      method: "POST",
      body: JSON.stringify(reportData),
    })
  }

  async compareAnalytics(compareData: any) {
    return this.request("/api/analytics/compare", {
      method: "POST",
      body: JSON.stringify(compareData),
    })
  }

  async exportAnalytics(params?: { format?: 'json' | 'csv' | 'excel'; period?: string; region?: string; startDate?: string; endDate?: string }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString())
      })
    }
    const url = `${this.baseURL}/api/analytics/export${queryParams.toString() ? `?${queryParams}` : ''}`
    const headers: Record<string, string> = {
      Accept: params?.format === 'csv' ? 'text/csv' : 'application/json',
    }
    if (this.token) headers.Authorization = `Bearer ${this.token}`
    try {
      const resp = await fetch(url, { headers, credentials: 'include', mode: 'cors' })
      if (!resp.ok) return { success: false, error: `HTTP ${resp.status}` }
      if (params?.format === 'csv') {
        const text = await resp.text()
        return { success: true, data: text }
      }
      const data = await resp.json()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' }
    }
  }

  // Fintech
  async getCreditScore(farmerId: string) {
    return this.request(`/api/fintech/credit-score/${farmerId}`)
  }

  async createLoanReferral(referralData: any) {
    return this.request("/api/fintech/loan-referrals", {
      method: "POST",
      body: JSON.stringify(referralData),
    })
  }

  // Add missing fintech methods for loan management
  async getLoanApplications(farmerId?: string) {
    const endpoint = farmerId ? `/api/fintech/loan-applications?farmerId=${farmerId}` : '/api/fintech/loan-applications'
    return this.request(endpoint)
  }

  async getLoanStats() {
    return this.request("/api/fintech/loan-stats")
  }

  async submitLoanApplication(applicationData: any) {
    return this.request("/api/fintech/loan-applications", {
      method: "POST",
      body: JSON.stringify(applicationData),
    })
  }

  // Partners
  async bulkOnboardPartners(partnersData: any) {
    return this.request("/api/partners/bulk-onboard", {
      method: "POST",
      body: JSON.stringify(partnersData),
    })
  }

  async uploadPartnersCSV(csvData: FormData) {
    return this.request("/api/partners/upload-csv", {
      method: "POST",
      body: csvData,
      headers: {},
    })
  }

  async getPartnerMetrics(partnerId?: string) {
    const endpoint = partnerId ? `/api/partners/${partnerId}/metrics` : '/api/partners/metrics'
    return this.request(endpoint)
  }

  // Referrals
  async completeReferral(farmerId: string) {
    return this.request(`/api/referrals/${farmerId}/complete`, {
      method: "POST",
    })
  }

  // Commissions - Updated to use plural endpoints
  async getCommissionsSummary() {
    return this.request("/api/commissions/summary")
  }

  async getCommissionsHistory() {
    return this.request("/api/commissions/history")
  }

  async withdrawCommissions(withdrawalData: any) {
    return this.request("/api/commissions/withdraw", {
      method: "POST",
      body: JSON.stringify(withdrawalData),
    })
  }

  async getAllCommissions() {
    return this.request("/api/commissions/all")
  }

  async processCommissionPayment(paymentData: any) {
    return this.request("/api/commissions/process-payment", {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  // AI Services - Complete AI endpoints
  async getCropRecommendations(data: any) {
    return this.request("/api/ai/crop-recommendations", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getYieldPrediction(data: any) {
    return this.request("/api/ai/yield-prediction", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getMarketInsights() {
    return this.request("/api/ai/market-insights")
  }

  async getFarmingInsights() {
    return this.request("/api/ai/farming-insights")
  }

  async getFarmingRecommendations() {
    return this.request("/api/ai/farming-recommendations")
  }

  async getAIAnalyticsDashboard() {
    return this.request("/api/ai/analytics-dashboard")
  }

  async getSeasonalCalendar() {
    return this.request("/api/ai/seasonal-calendar")
  }

  async getWeatherPrediction() {
    return this.request("/api/ai/weather-prediction")
  }

  async getMarketTrends() {
    return this.request("/api/ai/market-trends")
  }

  async getRiskAssessment(data: any) {
    return this.request("/api/ai/risk-assessment", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getPredictiveInsights(data: any) {
    return this.request("/api/ai/predictive-insights", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Advanced ML Services
  async getSensorMaintenance(sensorId: string) {
    return this.request(`/api/advanced-ml/sensors/${sensorId}/maintenance`)
  }

  async getSensorAnomalies(sensorId: string) {
    return this.request(`/api/advanced-ml/sensors/${sensorId}/anomalies`)
  }

  async getIrrigationOptimization() {
    return this.request("/api/advanced-ml/optimize/irrigation")
  }

  async getFertilizerOptimization() {
    return this.request("/api/advanced-ml/optimize/fertilizer")
  }

  async getHarvestOptimization() {
    return this.request("/api/advanced-ml/optimize/harvest")
  }

  async getOptimizationReport() {
    return this.request("/api/advanced-ml/optimize/report")
  }

  async getSensorHealthInsights() {
    return this.request("/api/advanced-ml/insights/sensor-health")
  }

  async getEfficiencyScore() {
    return this.request("/api/advanced-ml/insights/efficiency-score")
  }

  async getMLPredictiveInsights() {
    return this.request("/api/advanced-ml/insights/predictive")
  }

  async getMLModelsPerformance() {
    return this.request("/api/advanced-ml/models/performance")
  }

  // Image Recognition - Complete endpoints
  async analyzeImage(imageData: FormData) {
    return this.request("/api/image-recognition/analyze", {
      method: "POST",
      body: imageData,
      headers: {},
    })
  }

  async getImageAnalyses() {
    return this.request("/api/image-recognition/analyses")
  }

  async getImageAnalysis(analysisId: string) {
    return this.request(`/api/image-recognition/analyses/${analysisId}`)
  }

  async getImageAnalysesByCrop(cropType: string) {
    return this.request(`/api/image-recognition/analyses/crop/${cropType}`)
  }

  async getHighRiskAnalyses() {
    return this.request("/api/image-recognition/analyses/risk/high")
  }

  async updateAnalysisStatus(analysisId: string, status: string) {
    return this.request(`/api/image-recognition/analyses/${analysisId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  }

  async addAnalysisRecommendations(analysisId: string, recommendations: any) {
    return this.request(`/api/image-recognition/analyses/${analysisId}/recommendations`, {
      method: "POST",
      body: JSON.stringify(recommendations),
    })
  }

  async deleteImageAnalysis(analysisId: string) {
    return this.request(`/api/image-recognition/analyses/${analysisId}`, {
      method: "DELETE",
    })
  }

  // IoT Services - Complete endpoints
  async createSensor(sensorData: any) {
    return this.request("/api/iot/sensors", {
      method: "POST",
      body: JSON.stringify(sensorData),
    })
  }

  async getSensors() {
    return this.request("/api/iot/sensors")
  }

  async getSensor(sensorId: string) {
    return this.request(`/api/iot/sensors/${sensorId}`)
  }

  async updateSensorData(sensorId: string, data: any) {
    return this.request(`/api/iot/sensors/${sensorId}/data`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async getSensorReadings(
    sensorId: string,
    params?: { startDate?: string; endDate?: string; limit?: number }
  ) {
    const qs = new URLSearchParams()
    if (params?.startDate) qs.append('startDate', params.startDate)
    if (params?.endDate) qs.append('endDate', params.endDate)
    if (params?.limit !== undefined) qs.append('limit', String(params.limit))
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return this.request(`/api/iot/sensors/${sensorId}/readings${suffix}`)
  }

  async getSensorAlerts(sensorId: string) {
    return this.request(`/api/iot/sensors/${sensorId}/alerts`)
  }

  async resolveSensorAlert(sensorId: string, alertIndex: number) {
    return this.request(`/api/iot/sensors/${sensorId}/alerts/${alertIndex}/resolve`, {
      method: "PUT",
    })
  }

  async updateSensorStatus(sensorId: string, status: string) {
    return this.request(`/api/iot/sensors/${sensorId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  }

  async deleteSensor(sensorId: string) {
    return this.request(`/api/iot/sensors/${sensorId}`, {
      method: "DELETE",
    })
  }

  async getSensorHealthSummary() {
    return this.request("/api/iot/sensors/health/summary")
  }

  // BVN Verification
  async verifyBVN(bvnData: {
    bvn: string
    firstName: string
    lastName: string
    dateOfBirth: string
    phoneNumber: string
  }) {
    return this.request("/api/verification/bvn", {
      method: "POST",
      body: JSON.stringify(bvnData),
    })
  }

  async getVerificationStatus(userId: string) {
    return this.request(`/api/verification/status/${userId}`)
  }

  async offlineBVNVerification(bvnData: any) {
    return this.request("/api/verification/bvn/offline", {
      method: "POST",
      body: JSON.stringify(bvnData),
    })
  }

  async resendBVNVerification(bvnData: { bvn: string; phoneNumber: string }) {
    return this.request("/api/verification/bvn/resend", {
      method: "POST",
      body: JSON.stringify(bvnData),
    })
  }

  // Weather Services - Complete endpoints
  async getCurrentWeather(params: {
    lat?: number
    lng?: number
    city?: string
    state?: string
    country?: string
  }) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/api/weather/current?${queryParams}`)
  }

  async getWeatherForecast(params: {
    lat?: number
    lng?: number
    city?: string
    state?: string
    country?: string
    days?: number
  }) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/api/weather/forecast?${queryParams}`)
  }

  async getAgriculturalInsights(params: {
    lat?: number
    lng?: number
    city?: string
    state?: string
    country?: string
  }) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/api/weather/agricultural-insights?${queryParams}`)
  }

  async getWeatherAlerts(params: {
    lat?: number
    lng?: number
    city?: string
    state?: string
    country?: string
  }) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/api/weather/alerts?${queryParams}`)
  }

  async getWeatherByCoordinates(lat: number, lng: number) {
    return this.request(`/api/weather/coordinates/${lat}/${lng}`)
  }

  async getWeatherStatistics(region: string) {
    return this.request(`/api/weather/statistics/${region}`)
  }

  async getRegionalWeatherAlerts(region: string) {
    return this.request(`/api/weather/regional-alerts?region=${region}`)
  }

  async getHistoricalWeather(params: {
    lat?: number
    lng?: number
    city?: string
    state?: string
    country?: string
    startDate: string
    endDate: string
  }) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    return this.request(`/api/weather/historical?${queryParams}`)
  }

  // Notifications - Complete endpoints
  async getNotificationPreferences() {
    return this.request("/api/notifications/preferences")
  }

  async updateNotificationPreferences(preferences: any) {
    return this.request("/api/notifications/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    })
  }

  async setPushToken(token: string) {
    return this.request("/api/notifications/push-token", {
      method: "PUT",
      body: JSON.stringify({ token }),
    })
  }

  async sendNotification(notificationData: any) {
    return this.request("/api/notifications/send", {
      method: "POST",
      body: JSON.stringify(notificationData),
    })
  }

  async sendBulkNotifications(notificationsData: any) {
    return this.request("/api/notifications/send-bulk", {
      method: "POST",
      body: JSON.stringify(notificationsData),
    })
  }

  async sendTransactionNotification(transactionData: any) {
    return this.request("/api/notifications/transaction", {
      method: "POST",
      body: JSON.stringify(transactionData),
    })
  }

  async sendHarvestNotification(harvestData: any) {
    return this.request("/api/notifications/harvest", {
      method: "POST",
      body: JSON.stringify(harvestData),
    })
  }

  async sendMarketplaceNotification(marketplaceData: any) {
    return this.request("/api/notifications/marketplace", {
      method: "POST",
      body: JSON.stringify(marketplaceData),
    })
  }

  // Sync Services
  async uploadOfflineData(data: any) {
    return this.request("/api/sync/offline-data", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async syncUser(userData: any) {
    return this.request("/api/sync/sync-user", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async getSyncStatus(userId: string) {
    return this.request(`/api/sync/status/${userId}`)
  }

  async forceSync(userId: string) {
    return this.request("/api/sync/force-sync", {
      method: "POST",
      body: JSON.stringify({ userId }),
    })
  }

  async getSyncHistory(userId: string) {
    return this.request(`/api/sync/history/${userId}`)
  }

  async clearFailedSync(userId: string) {
    return this.request(`/api/sync/clear-failed/${userId}`, {
      method: "DELETE",
    })
  }

  async getSyncStats() {
    return this.request("/api/sync/stats")
  }

  // Shipments
  async createShipment(shipmentData: any) {
    return this.request("/api/shipments", {
      method: "POST",
      body: JSON.stringify(shipmentData),
    })
  }

  // Public endpoints
  async verifyProduct(batchId: string) {
    return this.request(`/api/verify/${batchId}`)
  }

  async getHealth() {
    return this.request("/health")
  }

  // PWA Services
  async getPWAManifest() {
    return this.request("/api/pwa/manifest")
  }

  async getPWAServiceWorker() {
    return this.request("/api/pwa/service-worker")
  }

  async getPWAOffline() {
    return this.request("/api/pwa/offline")
  }

  async getPWAInstall() {
    return this.request("/api/pwa/install")
  }

  // Farmer Dashboard Services
  async getFarmerDashboard(farmerId: string, filters?: {
    startDate?: string
    endDate?: string
    period?: string
    region?: string
  }): Promise<ApiResponse<{
    stats: {
      totalHarvests: number
      activeListings: number
      totalEarnings: number
      verificationRate: number
      monthlyGrowth: number
      averageHarvestValue: number
    }
    recentHarvests: Array<{
      _id: string
      cropType: string
      quantity: number
      unit: string
      harvestDate: string
      status: string
      qrCode: string
      location: string
      geoLocation?: {
        lat: number
        lng: number
      }
    }>
    marketplaceStats: {
      totalListings: number
      activeOrders: number
      monthlyRevenue: number
      topProducts: Array<{
        _id: string
        product: string
        sales: number
        revenue: number
      }>
    }
    weatherData: {
      current: {
        temp: number
        condition: string
        humidity: number
      }
      forecast: Array<{
        date: string
        temp: number
        condition: string
      }>
    }
  }>> {
    console.log('🌾 API: Fetching farmer dashboard for:', farmerId, 'with filters:', filters)
    
    const queryParams = new URLSearchParams()
    if (filters?.startDate) queryParams.append('startDate', filters.startDate)
    if (filters?.endDate) queryParams.append('endDate', filters.endDate)
    if (filters?.period) queryParams.append('period', filters.period)
    if (filters?.region) queryParams.append('region', filters.region)
    
    const endpoint = `/api/analytics/farmer/${farmerId}${queryParams.toString() ? `?${queryParams}` : ""}`
    console.log('🌾 API: Making request to:', endpoint)
    
    const result = await this.request<{
      stats: {
        totalHarvests: number
        activeListings: number
        totalEarnings: number
        verificationRate: number
        monthlyGrowth: number
        averageHarvestValue: number
      }
      recentHarvests: Array<{
        _id: string
        cropType: string
        quantity: number
        unit: string
        harvestDate: string
        status: string
        qrCode: string
        location: string
        geoLocation?: {
          lat: number
          lng: number
        }
      }>
      marketplaceStats: {
        totalListings: number
        activeOrders: number
        monthlyRevenue: number
        topProducts: Array<{
          _id: string
          product: string
          sales: number
          revenue: number
        }>
      }
      weatherData: {
        current: {
          temp: number
          condition: string
          humidity: number
        }
        forecast: Array<{
          date: string
          temp: number
          condition: string
        }>
      }
    }>(endpoint)
    console.log('🌾 API: Farmer dashboard response:', result)
    
    return result
  }

  async getFarmerStats(farmerId: string): Promise<ApiResponse<{
    totalHarvests: number
    activeListings: number
    totalEarnings: number
    verificationRate: number
    monthlyGrowth: number
    averageHarvestValue: number
    harvestCategories: Array<{
      category: string
      count: number
      totalValue: number
    }>
    recentActivity: Array<{
      type: 'harvest' | 'listing' | 'verification' | 'sale'
      description: string
      date: string
      amount?: number
    }>
  }>> {
    return this.request(`/api/analytics/farmer/${farmerId}/stats`)
  }

  async getFarmerHarvests(farmerId: string, params?: {
    page?: number
    limit?: number
    status?: string
    cropType?: string
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<{
    harvests: Array<{
      _id: string
      cropType: string
      quantity: number
      unit: string
      harvestDate: string
      status: string
      qrCode: string
      location: string
      geoLocation?: {
        lat: number
        lng: number
      }
      estimatedValue: number
      createdAt: string
      updatedAt: string
    }>
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.cropType) queryParams.append('cropType', params.cropType)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    
    const endpoint = `/api/harvests/farmer/${farmerId}${queryParams.toString() ? `?${queryParams}` : ""}`
    return this.request(endpoint)
  }

  async getFarmerListings(farmerId: string, params?: {
    page?: number
    limit?: number
    status?: string
    product?: string
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<{
    listings: Array<{
      _id: string
      product: string
      price: number
      quantity: number
      unit: string
      status: 'active' | 'pending' | 'sold' | 'expired'
      images: string[]
      description: string
      location: string
      createdAt: string
      updatedAt: string
    }>
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.product) queryParams.append('product', params.product)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    
    const endpoint = `/api/marketplace/farmer/${farmerId}${queryParams.toString() ? `?${queryParams}` : ""}`
    return this.request(endpoint)
  }

  // Buyer Dashboard Services
  async getBuyerDashboard(buyerId: string, filters?: {
    startDate?: string
    endDate?: string
    status?: string
  }): Promise<ApiResponse<{
    stats: {
      totalOrders: number
      activeOrders: number
      totalSpent: number
      savedProducts: number
      monthlyGrowth: number
      averageOrderValue: number
    }
    recentOrders: Array<{
      _id: string
      items: Array<{
        listing: {
          _id: string
          product: string
          price: number
          images: string[]
        }
        quantity: number
        price: number
      }>
      total: number
      status: 'pending' | 'paid' | 'delivered' | 'cancelled' | 'completed'
      createdAt: string
      updatedAt: string
    }>
    topProducts: Array<{
      _id: string
      product: string
      totalSpent: number
      orderCount: number
      lastOrderDate: string
    }>
    spendingTrend: Array<{
      date: string
      amount: number
      orderCount: number
    }>
  }>> {
    const queryParams = new URLSearchParams()
    if (filters?.startDate) queryParams.append('startDate', filters.startDate)
    if (filters?.endDate) queryParams.append('endDate', filters.endDate)
    if (filters?.status) queryParams.append('status', filters.status)
    
    const endpoint = `/api/analytics/buyer/${buyerId}${queryParams.toString() ? `?${queryParams}` : ""}`
    return this.request(endpoint)
  }

  async getBuyerStats(buyerId: string): Promise<ApiResponse<{
    totalOrders: number
    activeOrders: number
    totalSpent: number
    savedProducts: number
    monthlyGrowth: number
    averageOrderValue: number
    favoriteCategories: Array<{
      category: string
      count: number
      totalSpent: number
    }>
    recentActivity: Array<{
      type: 'order' | 'favorite' | 'verification' | 'payment'
      description: string
      date: string
      amount?: number
    }>
  }>> {
    return this.request(`/api/analytics/buyer/${buyerId}/stats`)
  }

  async getBuyerOrders(buyerId: string, params?: {
    page?: number
    limit?: number
    status?: string
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<{
    orders: Array<{
      _id: string
      items: Array<{
        listing: {
          _id: string
          product: string
          price: number
          images: string[]
          farmer: {
            _id: string
            name: string
            location: string
            rating: number
          }
        }
        quantity: number
        price: number
      }>
      total: number
      status: 'pending' | 'paid' | 'delivered' | 'cancelled' | 'completed'
      createdAt: string
      updatedAt: string
      paymentStatus: 'pending' | 'paid' | 'failed'
      deliveryAddress?: string
      estimatedDelivery?: string
    }>
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    
    const endpoint = `/api/marketplace/orders/buyer/${buyerId}${queryParams.toString() ? `?${queryParams}` : ""}`
    return this.request(endpoint)
  }

  async getBuyerFavorites(buyerId: string, params?: {
    page?: number
    limit?: number
    category?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<{
    favorites: Array<{
      _id: string
      listing: {
        _id: string
        product: string
        price: number
        images: string[]
        farmer: {
          _id: string
          name: string
          location: string
          rating: number
        }
        status: 'available' | 'out_of_stock' | 'harvested'
        createdAt: string
      }
      addedAt: string
    }>
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.category) queryParams.append('category', params.category)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    
    const endpoint = `/api/marketplace/favorites/${buyerId}${queryParams.toString() ? `?${queryParams}` : ""}`
    return this.request(endpoint)
  }

  // Partner Dashboard Services
  async getPartnerDashboard(partnerId: string, filters?: {
    startDate?: string
    endDate?: string
    period?: string
    region?: string
  }): Promise<ApiResponse<{
    stats: {
      totalFarmers: number
      activeFarmers: number
      totalCommission: number
      monthlyCommission: number
      farmersThisMonth: number
      conversionRate: number
      totalHarvests: number
      totalShipments: number
      pendingCommissions: number
      performanceScore: number
    }
    recentFarmers: Array<{
      _id: string
      name: string
      email: string
      phone: string
      location: string
      status: 'active' | 'inactive' | 'pending'
      joinedDate: string
      totalHarvests: number
      totalEarnings: number
      lastActivity: string
      partnerId: string
    }>
    commissionStats: {
      totalEarned: number
      pendingAmount: number
      monthlyTrend: Array<{
        month: string
        amount: number
      }>
      topEarners: Array<{
        _id: string
        farmerName: string
        amount: number
        status: string
      }>
    }
    networkGrowth: {
      monthlyGrowth: number
      regionalDistribution: Record<string, number>
      farmerCategories: Array<{
        category: string
        count: number
      }>
    }
  }>> {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const url = `/api/analytics/partner/${partnerId}${queryParams.toString() ? `?${queryParams}` : ""}`
    return this.request(url)
  }

  // Agency Dashboard Services
  async getAgencyDashboard(agencyId: string, filters?: {
    startDate?: string
    endDate?: string
    period?: string
    region?: string
  }): Promise<ApiResponse<{
    stats: {
      totalFarmers: number
      activeFarmers: number
      totalCommission: number
      monthlyCommission: number
      farmersThisMonth: number
      conversionRate: number
      totalHarvests: number
      totalShipments: number
      pendingCommissions: number
    }
    recentFarmers: Array<{
      _id: string
      name: string
      email: string
      phone: string
      location: string
      status: 'active' | 'inactive' | 'pending'
      joinedDate: string
      totalHarvests: number
      totalEarnings: number
      lastActivity: string
      partnerId: string
    }>
    commissionStats: Array<{
      _id: string
      farmerId: string
      farmerName: string
      amount: number
      status: 'pending' | 'paid' | 'cancelled'
      transactionId?: string
      createdAt: string
      paidAt?: string
      description: string
    }>
    shipmentStats: Array<{
      _id: string
      farmerId: string
      farmerName: string
      destination: string
      status: 'pending' | 'in-transit' | 'delivered' | 'cancelled'
      createdAt: string
      deliveredAt?: string
      trackingNumber: string
    }>
    recentActivities: Array<{
      id: string
      title: string
      description: string
      time: string
      status: 'success' | 'info' | 'warning' | 'error'
    }>
    monthlyGrowth: number
  }>> {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const url = `/api/analytics/agency/${agencyId}${queryParams.toString() ? `?${queryParams}` : ""}`
    return this.request(url)
  }

  async getAgencyStats(agencyId: string): Promise<ApiResponse<{
    stats: {
      totalFarmers: number
      activeFarmers: number
      totalCommission: number
      monthlyCommission: number
      farmersThisMonth: number
      conversionRate: number
      totalHarvests: number
      totalShipments: number
      pendingCommissions: number
    }
    monthlyGrowth: number
  }>> {
    return this.request(`/api/analytics/agency/${agencyId}/stats`)
  }

  // USSD Services
  async getUSSDInfo() {
    return this.request("/api/ussd/info")
  }

  async getUSSDStats() {
    return this.request("/api/ussd/stats")
  }

  async getUSSDSessions() {
    return this.request("/api/ussd/sessions")
  }

  async testUSSD(payload: { phoneNumber: string; text: string }) {
    return this.request("/api/ussd/test", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async registerUSSD(payload: { provider: string; serviceCode?: string; callbackUrl: string }) {
    return this.request("/api/ussd/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  // QR Code Services
  async getUserQRCodes() {
    return this.request("/api/qr-codes")
  }

  async generateNewQRCode(payload: { harvestId: string; customData?: string }) {
    return this.request("/api/qr-codes", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async getQRCodeStats() {
    return this.request("/api/qr-codes/stats")
  }

  // Language Services
  async getSupportedLanguages() {
    return this.request("/api/language")
  }

  async getTranslations(language: string) {
    return this.request(`/api/language/translations/${language}`)
  }

  async updateLanguagePreference(payload: { language: string }) {
    return this.request("/api/language/preference", {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  }

  // Check if current token is valid
  async validateToken(): Promise<boolean> {
    if (!this.token) {
      console.log('🔐 API - No token to validate')
      return false
    }

    try {
      // Use the request method to ensure proper error handling and token refresh
      const response = await this.request('/api/auth/me')
      return response.success
    } catch (error) {
      console.error('🔐 API - Error validating token:', error)
      return false
    }
  }

  // Debug method to check current authentication state
  debugAuthState() {
    const token = this.token
    const hasLocalToken = typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false
    const hasRefreshToken = typeof window !== 'undefined' ? !!localStorage.getItem('refresh_token') : false
    
    console.log('🔐 API - Debug Auth State:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      hasLocalToken,
      hasRefreshToken,
      baseURL: this.baseURL
    })
    
    return { hasToken: !!token, hasLocalToken, hasRefreshToken }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export const api = apiClient
export default apiClient
