import { APP_CONFIG } from "./constants"
import type { ApiResponse, User, Harvest, Listing, Order, WeatherData, DashboardStats } from "./types"

class ApiService {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = APP_CONFIG.api.baseUrl
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem(APP_CONFIG.auth.tokenKey)
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    // Normalize incoming headers into a plain record
    if (options.headers) {
      if (Array.isArray(options.headers)) {
        for (const [k, v] of options.headers as any) headers[k] = String(v)
      } else if (options.headers instanceof Headers) {
        (options.headers as Headers).forEach((v, k) => (headers[k] = v))
      } else {
        Object.assign(headers, options.headers as any)
      }
    }

    if (this.token && this.token !== 'undefined') {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    // If sending FormData, let the browser set the correct multipart boundary
    if (options.body instanceof FormData) {
      // @ts-ignore
      delete headers["Content-Type"]
    }

    try {
      console.log("[v0] API Request:", { url, method: options.method || "GET", headers })

      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors",
        credentials: "include",
      })

      console.log("[v0] API Response:", { status: response.status, ok: response.ok })

      let data
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.log("[v0] Non-JSON response:", text)
        data = { message: text || "Unknown error" }
      }

      if (!response.ok) {
        let errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`

        if (response.status === 0 || !response.status) {
          errorMessage =
            "Network error: Unable to connect to server. Please ensure the backend server is running on " + this.baseUrl
        } else if (response.status >= 500) {
          errorMessage = "Server error: " + errorMessage
        } else if (response.status === 404) {
          errorMessage = "Endpoint not found: " + endpoint
        }

        const err: any = new Error(errorMessage)
        err.status = response.status
        err.payload = data
        throw err
      }

      return data
    } catch (error) {
      console.error("[v0] API Error:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `Network error: Unable to connect to ${this.baseUrl}. Please ensure the backend server is running.`,
        )
      }

      throw error
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem(APP_CONFIG.auth.tokenKey, token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem(APP_CONFIG.auth.tokenKey)
      localStorage.removeItem(APP_CONFIG.auth.refreshTokenKey)
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ user: User; token: string; refreshToken: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    name: string
    email: string
    phone: string
    password: string
    role: string
    location?: string
  }) {
    return this.request<{ user: User; token: string; refreshToken: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ token: string; refreshToken: string }>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })
  }

  async logout() {
    try {
      return await this.request("/api/auth/logout", {
        method: "POST",
      })
    } catch (e) {
      // Ignore network errors here; we'll still clear local state
      return { success: true, message: "Logged out" } as any
    }
  }

  // Email verification helpers
  async verifyEmail(token: string) {
    return this.request<{ message: string; user: any }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  }

  async resendVerification(email: string) {
    return this.request<{ message: string }>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  // Password reset helpers
  async forgotPassword(email: string) {
    return this.request<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    })
  }

  // User Management
  async getProfile() {
    return this.request<User>("/api/users/profile/me")
  }

  async updateProfile(userData: Partial<User>) {
    return this.request<User>("/api/users/profile/me", {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  // User Preferences
  async getPreferences() {
    return this.request("/api/users/preferences/me")
  }

  async updatePreferences(notifications: any) {
    return this.request("/api/users/preferences/me", {
      method: "PUT",
      body: JSON.stringify({ notifications }),
    })
  }

  // User Settings
  async getSettings() {
    return this.request("/api/users/settings/me")
  }

  async updateSettings(settings: { security?: any; display?: any; performance?: any }) {
    return this.request("/api/users/settings/me", {
      method: "PUT",
      body: JSON.stringify(settings),
    })
  }

  // Password
  async changePassword(currentPassword: string, newPassword: string) {
    return this.request("/api/users/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async getDashboard() {
    return this.request<DashboardStats>("/api/users/dashboard")
  }

  // Harvest Management
  async getHarvests(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters)
    return this.request<Harvest[]>(`/api/harvests?${params}`)
  }

  async createHarvest(harvestData: Partial<Harvest>) {
    return this.request<Harvest>("/api/harvests", {
      method: "POST",
      body: JSON.stringify(harvestData as any),
    })
  }

  async getHarvestProvenance(batchId: string) {
    return this.request<Harvest>(`/api/harvests/provenance/${batchId}`)
  }

  async verifyHarvest(batchId: string) {
    return this.request<Harvest>(`/api/harvests/verify/${batchId}`)
  }

  // Marketplace
  async getListings(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters)
    return this.request<Listing[]>(`/api/marketplace/listings?${params}`)
  }

  async getListing(id: string) {
    return this.request<Listing>(`/api/marketplace/listings/${id}`)
  }

  async createListing(listingData: Partial<Listing>) {
    return this.request<Listing>("/api/marketplace/listings", {
      method: "POST",
      body: JSON.stringify(listingData),
    })
  }

  async createOrder(orderData: Partial<Order>) {
    return this.request<Order>("/api/marketplace/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  }

  async getOrders(userId?: string) {
    const endpoint = userId ? `/api/marketplace/orders/buyer/${userId}` : "/api/marketplace/orders"
    return this.request<Order[]>(endpoint)
  }

  async getOrder(id: string) {
    return this.request<Order>(`/api/marketplace/orders/${id}`)
  }

  // Harvest approval → create listing from harvest (farmer only)
  async createListingFromHarvest(harvestId: string, price: number, description?: string) {
    return this.request(`/api/harvest-approval/${harvestId}/create-listing`, {
      method: "POST",
      body: JSON.stringify({ price, description }),
    })
  }

  // Weather
  async getCurrentWeather(params?: { lat: number; lng: number; city: string; state: string; country: string }) {
    let query = ""
    if (params) {
      const qs = new URLSearchParams({
        lat: String(params.lat),
        lng: String(params.lng),
        city: params.city,
        state: params.state,
        country: params.country,
      })
      query = `?${qs.toString()}`
    }
    return this.request<WeatherData>(`/api/weather/current${query}`)
  }

  async getWeatherForecast(params?: { lat: number; lng: number; city: string; state: string; country: string; days?: number }) {
    let query = ""
    if (params) {
      const qs = new URLSearchParams({
        lat: String(params.lat),
        lng: String(params.lng),
        city: params.city,
        state: params.state,
        country: params.country,
        ...(params.days ? { days: String(params.days) } : {}),
      })
      query = `?${qs.toString()}`
    }
    return this.request<WeatherData>(`/api/weather/forecast${query}`)
  }

  async getAgriculturalInsights(params?: { lat: number; lng: number; city: string; state: string; country: string }) {
    let query = ""
    if (params) {
      const qs = new URLSearchParams({
        lat: String(params.lat),
        lng: String(params.lng),
        city: params.city,
        state: params.state,
        country: params.country,
      })
      query = `?${qs.toString()}`
    }
    return this.request<WeatherData>(`/api/weather/agricultural-insights${query}`)
  }

  // Analytics
  async getAnalytics(type: string, filters?: Record<string, any>) {
    const params = new URLSearchParams(filters)
    return this.request(`/api/analytics/${type}?${params}`)
  }

  // File Upload
  async uploadImage(file: File) {
    const formData = new FormData()
    formData.append("images", file)
    const res: any = await this.request("/api/marketplace/upload-image", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : "",
      } as any,
    })
    const urls: string[] = res?.urls || res?.data?.urls || []
    return { url: urls[0] }
  }

  async uploadImages(files: File[]) {
    const formData = new FormData()
    files.forEach((f) => formData.append("images", f))
    const res: any = await this.request("/api/marketplace/upload-image", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : "",
      } as any,
    })
    const urls: string[] = res?.urls || res?.data?.urls || []
    return urls
  }

  // Fintech - Credit Score and Loans
  async getMyCreditScore() {
    return this.request(`/api/fintech/credit-score/me`)
  }

  async getLoanApplications(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters)
    return this.request(`/api/fintech/loan-applications?${params.toString()}`)
  }

  async createLoanApplication(data: { amount: number; purpose: string; term: number; description?: string }) {
    return this.request(`/api/fintech/loan-applications`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Harvest delete
  async deleteHarvest(harvestId: string) {
    return this.request(`/api/harvests/${harvestId}`, { method: "DELETE" })
  }

  // Buyer-specific methods
  async getBuyerProfile() {
    return this.request('/api/users/profile/me')
  }

  async updateBuyerProfile(data: any) {
    return this.request('/api/users/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getMarketplaceListings(params: any = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/api/marketplace/listings?${queryString}`)
  }

  async getProductDetails(productId: string) {
    return this.request(`/api/marketplace/listings/${productId}`)
  }

  async addToFavorites(listingId: string, notes?: string) {
    return this.request('/api/marketplace/favorites', {
      method: 'POST',
      body: JSON.stringify({ listingId, notes }),
    })
  }

  async getFavorites(userId: string, params: any = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/api/marketplace/favorites/${userId}?${queryString}`)
  }

  async removeFromFavorites(userId: string, listingId: string) {
    return this.request(`/api/marketplace/favorites/${userId}/${listingId}`, {
      method: 'DELETE',
    })
  }

  async getBuyerOrders(buyerId: string, params: any = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/api/marketplace/orders/buyer/${buyerId}?${queryString}`)
  }

  async getOrderDetails(orderId: string) {
    return this.request(`/api/marketplace/orders/${orderId}`)
  }

  async getOrderTracking(orderId: string) {
    return this.request(`/api/marketplace/orders/${orderId}/tracking`)
  }

  async initializePayment(paymentData: any) {
    return this.request('/api/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  async verifyPayment(reference: string) {
    return this.request(`/api/payments/verify/${reference}`)
  }

  async getTransactionHistory(params: any = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/api/payments/transactions?${queryString}`)
  }

  async getShipmentDetails(shipmentId: string) {
    return this.request(`/api/shipments/${shipmentId}`)
  }

  async reportShipmentIssue(shipmentId: string, issueData: any) {
    return this.request(`/api/shipments/${shipmentId}/issues`, {
      method: 'POST',
      body: JSON.stringify(issueData),
    })
  }

  async getBuyerAnalytics(buyerId: string) {
    return this.request(`/api/analytics/buyers/${buyerId}`)
  }

  async getFarmerAnalytics(farmerId?: string) {
    if (farmerId) {
      return this.request(`/api/analytics/farmers/${farmerId}`)
    }
    return this.request('/api/analytics/farmers/me')
  }

  async getPartnerAnalytics(partnerId?: string) {
    if (partnerId) {
      return this.request(`/api/analytics/partners/${partnerId}`)
    }
    return this.request('/api/analytics/partners/me')
  }

  async getDashboardMetrics() {
    return this.request('/api/analytics/dashboard')
  }

  async generateReport(reportData: any) {
    return this.request('/api/analytics/report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    })
  }

  async getUserNotifications(params: any = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/api/notifications?${queryString}`)
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    })
  }

  async updateNotificationPreferences(preferences: any) {
    return this.request('/api/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify({ notifications: preferences }),
    })
  }

  async exportOrderData(exportData: any) {
    return this.request('/api/export-import/export/orders', {
      method: 'POST',
      body: JSON.stringify(exportData),
    })
  }

  // QR Code Management
  async getQRCodes(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters)
    return this.request(`/api/qr-codes?${params.toString()}`)
  }

  async generateQRCode(data: { type: string; itemId: string; metadata?: Record<string, any> }) {
    return this.request(`/api/qr-codes/generate`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async verifyQRCode(qrData: string) {
    return this.request(`/api/qr-codes/verify`, {
      method: "POST",
      body: JSON.stringify({ qrData }),
    })
  }

  async downloadQRCode(qrCodeId: string, format: 'png' | 'svg' | 'pdf' = 'png') {
    return this.request(`/api/qr-codes/${qrCodeId}/download?format=${format}`)
  }

  async revokeQRCode(qrCodeId: string) {
    return this.request(`/api/qr-codes/${qrCodeId}/revoke`, {
      method: "PUT",
    })
  }

  // Profile Management
  async getFarmerProfile() {
    return this.request('/api/farmers/profile/me')
  }

  async updateFarmerProfile(profileData: any) {
    return this.request('/api/farmers/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async getBuyerProfile() {
    return this.request('/api/users/profile/me')
  }

  async updateBuyerProfile(profileData: any) {
    return this.request('/api/users/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async getPartnerProfile() {
    return this.request('/api/users/profile/me')
  }

  async updatePartnerProfile(profileData: any) {
    return this.request('/api/users/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async getAdminProfile() {
    return this.request('/api/users/profile/me')
  }

  async updateAdminProfile(profileData: any) {
    return this.request('/api/users/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  // Analytics Endpoints
  async getPartnerAnalytics(filters: any = {}): Promise<any> {
    const queryString = new URLSearchParams(filters).toString()
    return this.request<any>(`/api/analytics/partners/me?${queryString}`)
  }

  async getPerformanceAnalytics(filters: any = {}): Promise<any> {
    const queryString = new URLSearchParams(filters).toString()
    return this.request<any>(`/api/analytics/performance?${queryString}`)
  }

  async getGeographicAnalytics(filters: any = {}): Promise<any> {
    const queryString = new URLSearchParams(filters).toString()
    return this.request<any>(`/api/analytics/geographic?${queryString}`)
  }

  async getFinancialAnalytics(filters: any = {}): Promise<any> {
    const queryString = new URLSearchParams(filters).toString()
    return this.request<any>(`/api/analytics/financial?${queryString}`)
  }

  async getTrendAnalytics(filters: any = {}): Promise<any> {
    const queryString = new URLSearchParams(filters).toString()
    return this.request<any>(`/api/analytics/trends?${queryString}`)
  }

  async generateAnalyticsReport(config: any): Promise<any> {
    return this.request<any>("/api/analytics/report", {
      method: "POST",
      body: JSON.stringify(config)
    })
  }

  async exportAnalyticsData(filters: any, format: string = 'csv'): Promise<Blob> {
    const queryString = new URLSearchParams({ ...filters, format }).toString()
    const response = await fetch(`${this.baseUrl}/api/analytics/export?${queryString}`, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }
    
    return response.blob()
  }

  // Approvals Endpoints
  async getApprovals(filters: any = {}): Promise<any> {
    const queryString = new URLSearchParams(filters).toString()
    return this.request<any>(`/api/approvals?${queryString}`)
  }

  async getApprovalById(approvalId: string): Promise<any> {
    return this.request<any>(`/api/approvals/${approvalId}`)
  }

  async getApprovalStats(): Promise<any> {
    return this.request<any>('/api/approvals/stats')
  }

  async approveHarvest(approvalId: string, data: { notes?: string; qualityAssessment?: any }): Promise<any> {
    return this.request<any>(`/api/approvals/${approvalId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async rejectHarvest(approvalId: string, data: { reason: string; notes?: string }): Promise<any> {
    return this.request<any>(`/api/approvals/${approvalId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async markForReview(approvalId: string, data: { notes?: string }): Promise<any> {
    return this.request<any>(`/api/approvals/${approvalId}/review`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async batchProcessApprovals(batchAction: any): Promise<any> {
    return this.request<any>('/api/approvals/batch', {
      method: 'POST',
      body: JSON.stringify(batchAction)
    })
  }

  async getApprovalMetrics(filters: any = {}): Promise<any> {
    const queryString = new URLSearchParams(filters).toString()
    return this.request<any>(`/api/approvals/metrics?${queryString}`)
  }

  async getApprovalHistory(approvalId: string): Promise<any> {
    return this.request<any>(`/api/approvals/${approvalId}/history`)
  }

  async exportApprovals(filters: any, format: string = 'csv'): Promise<Blob> {
    const queryString = new URLSearchParams({ ...filters, format }).toString()
    const response = await fetch(`${this.baseUrl}/api/approvals/export?${queryString}`, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }
    
    return response.blob()
  }

  // Commission Management
  async getCommissions(params?: any): Promise<any> {
    const queryString = new URLSearchParams(params).toString()
    return this.request<any>(`/api/commissions?${queryString}`)
  }

  async getCommissionById(id: string): Promise<any> {
    return this.request<any>(`/api/commissions/${id}`)
  }

  async getCommissionStats(params?: any): Promise<any> {
    const queryString = new URLSearchParams(params).toString()
    return this.request<any>(`/api/commissions/stats?${queryString}`)
  }

  async getPartnerCommissionSummary(partnerId: string): Promise<any> {
    return this.request<any>(`/api/commissions/summary/${partnerId}`)
  }

  async updateCommissionStatus(id: string, data: { status: string; notes?: string }): Promise<any> {
    return this.request<any>(`/api/commissions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async processCommissionPayout(data: { commissionIds: string[]; payoutMethod: string; payoutDetails: any }): Promise<any> {
    return this.request<any>('/api/commissions/payout', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Referral Management
  async getReferrals(params?: any): Promise<any> {
    const queryString = new URLSearchParams(params).toString()
    return this.request<any>(`/api/referrals?${queryString}`)
  }

  async getReferralById(id: string): Promise<any> {
    return this.request<any>(`/api/referrals/${id}`)
  }

  async getReferralStats(): Promise<any> {
    return this.request<any>('/api/referrals/stats/overview')
  }

  async getReferralPerformanceStats(period: string = 'month'): Promise<any> {
    return this.request<any>(`/api/referrals/stats/performance?period=${period}`)
  }

  async createReferral(data: any): Promise<any> {
    return this.request<any>('/api/referrals', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateReferral(id: string, data: any): Promise<any> {
    return this.request<any>(`/api/referrals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteReferral(id: string): Promise<any> {
    return this.request<any>(`/api/referrals/${id}`, {
      method: 'DELETE'
    })
  }
}

export const apiService = new ApiService()

export const api = apiService
