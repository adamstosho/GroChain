import { APP_CONFIG } from "./constants"
import type { ApiResponse, User, Harvest, Listing, Order, WeatherData, DashboardStats } from "./types"

class ApiService {
  private baseUrl: string
  private token: string | null = null
  private isRefreshing: boolean = false

  constructor() {
    this.baseUrl = APP_CONFIG.api.baseUrl
    this.loadTokenFromStorage()
  }

  private safeStringify(obj: any): string {
    try {
      return JSON.stringify(obj, null, 2)
    } catch (error) {
      // Handle circular references
      const seen = new WeakSet()
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular Reference]'
          }
          seen.add(value)
        }
        return value
      }, 2)
    }
  }

  private loadTokenFromStorage() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem(APP_CONFIG.auth.tokenKey)
      console.log('🔑 API Service - Token loaded from localStorage:', !!this.token)
    }
  }

  // Public method to manually set token
  setToken(token: string | null) {
    this.token = token
  }

  // Public method to get current token
  getToken() {
    return this.token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Load token from storage before each request to ensure it's up to date
    // Skip for auth endpoints and refresh-related calls to prevent infinite loops
    if (!endpoint.includes('/auth/') && !endpoint.includes('refresh')) {
      this.loadTokenFromStorage()
    }

    // Add cache buster for non-GET requests to prevent caching issues
    let url = `${this.baseUrl}${endpoint}`

    if (options.method && options.method !== 'GET') {
      const separator = endpoint.includes('?') ? '&' : '?'
      url += `${separator}_t=${Date.now()}`
    }
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
      console.log('🔑 Token included in request:', this.token.substring(0, 20) + '...')
    } else {
      console.log('❌ No token available for request to:', endpoint)
      console.log('⚠️ No token found for request - this will cause 401 errors')
      console.log('Current token value:', this.token)
      console.log('Token from localStorage:', typeof window !== 'undefined' ? localStorage.getItem(APP_CONFIG.auth.tokenKey) : 'N/A')
      console.log('Attempting to load token from storage...')
      this.loadTokenFromStorage()
      if (this.token && this.token !== 'undefined') {
        headers["Authorization"] = `Bearer ${this.token}`
        console.log('✅ Token recovered and added to request')
      }
    }

    // If sending FormData, let the browser set the correct multipart boundary
    if (options.body instanceof FormData) {
      // @ts-ignore
      delete headers["Content-Type"]
    }

    try {
      console.log("[v0] API Request:", {
        url,
        method: options.method || "GET",
        hasAuth: !!headers.Authorization,
        endpoint: endpoint
      })

      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors",
        credentials: "include",
        signal: controller.signal
      })

      clearTimeout(timeoutId)

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

        // Add more detailed error information for debugging
        console.error(`❌ API Error [${response.status}]:`, {
          endpoint,
          method: options.method || 'GET',
          errorMessage,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          responseData: this.safeStringify(data),
          hasAuth: !!headers.Authorization
        })

        if (response.status === 0 || !response.status) {
          errorMessage =
            "Network error: Unable to connect to server. Please ensure the backend server is running on " + this.baseUrl
        } else if (response.status >= 500) {
          errorMessage = "Server error: " + errorMessage
        } else if (response.status === 404) {
          errorMessage = "Endpoint not found: " + endpoint
        } else if (response.status === 401) {
          errorMessage = "Authentication error: " + (data.message || "Please log in again")
        } else if (response.status === 403) {
          errorMessage = "Authorization error: " + (data.message || "Access denied")
        }

        const err: any = new Error(errorMessage)
        err.status = response.status
        err.payload = this.safeStringify(data)
        err.endpoint = endpoint
        throw err
      }

      return data
    } catch (error) {
      console.error("[v0] API Error:", error)

      // Handle timeout/abort errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout: The server took too long to respond. Please try again.')
        }

        if (error instanceof TypeError && error.message.includes("fetch")) {
          throw new Error(
            `Network error: Unable to connect to ${this.baseUrl}. Please ensure the backend server is running.`,
          )
        }
      }

      throw error
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem(APP_CONFIG.auth.tokenKey)
      localStorage.removeItem(APP_CONFIG.auth.refreshTokenKey)
      // Also clear the auth store keys for consistency
      localStorage.removeItem('grochain-auth')
    }
  }

  // Check if token exists and is valid
  hasValidToken(): boolean {
    if (!this.token || this.token === 'undefined') {
      // Try to load from localStorage
      if (typeof window !== "undefined") {
        this.token = localStorage.getItem(APP_CONFIG.auth.tokenKey)
      }
    }
    return !!(this.token && this.token !== 'undefined')
  }

  // Refresh token if needed
  async refreshTokenIfNeeded(): Promise<boolean> {
    try {
      const refreshToken = typeof window !== "undefined" ?
        localStorage.getItem(APP_CONFIG.auth.refreshTokenKey) : null

      if (!refreshToken) {
        console.log('⚠️ No refresh token available')
        return false
      }

      if (this.isRefreshing) {
        console.log('🔄 Token refresh already in progress, skipping')
        return false
      }

      this.isRefreshing = true
      console.log('🔄 Starting token refresh...')

      // Use the async refreshToken method directly to avoid recursion through request()
      const response = await this.refreshToken(refreshToken)

      this.isRefreshing = false

      const envelope: any = response || {}
      const data = envelope.data || envelope
      const newAccessToken = data.accessToken || data.token || envelope.accessToken || envelope.token
      const newRefreshToken = data.refreshToken || envelope.refreshToken

      if (newAccessToken) {
        this.setToken(newAccessToken)
        if (newRefreshToken && typeof window !== "undefined") {
          localStorage.setItem(APP_CONFIG.auth.refreshTokenKey, newRefreshToken)
        }
        console.log('✅ Token refreshed successfully')
        return true
      }

      return false
    } catch (error: any) {
      console.log('❌ Token refresh failed:', error.message)
      this.isRefreshing = false
      this.clearToken()
      return false
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
    // Prevent concurrent refresh calls
    if (this.isRefreshing) {
      console.log('🔄 Refresh already in progress, waiting...')
      // Wait for current refresh to complete
      while (this.isRefreshing) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return { success: true, message: 'Refresh completed by another call' }
    }

    this.isRefreshing = true

    try {
      const response = await this.request<{ token: string; refreshToken: string }>("/api/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      })

      return response
    } finally {
      this.isRefreshing = false
    }
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

  async getRecentActivities(limit?: number) {
    const params = limit ? `?limit=${limit}` : ''
    return this.request("/api/users/recent-activities" + params)
  }

  async getDashboardMetrics() {
    return this.request("/api/analytics/dashboard")
  }

  // Harvest Management
  async getHarvests(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters || {})
    return this.request<Harvest[]>(`/api/harvests?${params}`)
  }

  async getHarvestAnalytics(filters?: Record<string, any>) {
    console.log("🔍 API: Getting harvest analytics with filters:", filters)
    const params = new URLSearchParams(filters || {})
    const url = `/api/harvests/analytics?${params}`
    console.log("🔗 API: Analytics URL:", url)

    try {
      const response = await this.request(url)
      console.log("📊 API: Analytics response received:", response)
      return response
    } catch (error) {
      console.error("❌ API: Analytics request failed:", error)
      throw error
    }
  }

  async getHarvestStats() {
    console.log("📊 API: Getting harvest stats")
    try {
      const response = await this.request('/api/harvests/stats')
      console.log("📈 API: Stats response received:", response)
      return response
    } catch (error) {
      console.error("❌ API: Stats request failed:", error)
      throw error
    }
  }

  async createHarvest(harvestData: Partial<Harvest>) {
    return this.request<Harvest>("/api/harvests", {
      method: "POST",
      body: JSON.stringify(harvestData as any),
    })
  }

  async getHarvestById(id: string) {
    return this.request<Harvest>(`/api/harvests/id/${id}`)
  }

  async updateHarvest(id: string, harvestData: Partial<Harvest>) {
    return this.request<Harvest>(`/api/harvests/${id}`, {
      method: "PUT",
      body: JSON.stringify(harvestData as any),
    })
  }

  async getHarvestProvenance(batchId: string) {
    return this.request<Harvest>(`/api/harvests/provenance/${batchId}`)
  }

  async verifyHarvest(batchId: string) {
    return this.request<Harvest>(`/api/harvests/verification/${batchId}`)
  }

  // Marketplace
  async getListings(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters)
    return this.request<Listing[]>(`/api/marketplace/listings?${params}`)
  }

  async getListing(id: string) {
    return this.request<Listing>(`/api/marketplace/listings/${id}`)
  }

  async updateListing(id: string, listingData: Partial<Listing>) {
    return this.request<Listing>(`/api/marketplace/listings/${id}`, {
      method: "PUT",
      body: JSON.stringify(listingData),
    })
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

  async getMarketplaceAnalytics(params?: string, userId?: string) {
    const endpoint = userId ? `/api/analytics/farmers/${userId}` : '/api/analytics/marketplace'
    const url = params ? `${endpoint}${params}` : endpoint
    return this.request(url)
  }

  async getMarketplaceStats() {
    return this.request('/api/analytics/marketplace')
  }

  async updateListingStatus(id: string, status: string, data?: any) {
    return this.request(`/api/marketplace/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...data })
    })
  }

  async unpublishListing(id: string) {
    return this.request(`/api/marketplace/listings/${id}/unpublish`, {
      method: 'PATCH'
    })
  }



  // Harvest approval → create listing from harvest (farmer only)
  async createListingFromHarvest(harvestId: string, price: number, description?: string, quantity?: number, unit?: string) {
    return this.request(`/api/harvest-approval/${harvestId}/create-listing`, {
      method: "POST",
      body: JSON.stringify({ price, description, quantity, unit }),
    })
  }

  // Weather
  async getCurrentWeather(params?: { lat: number; lng: number; city: string; state: string; country: string }) {
    // Use coordinates as location identifier
    const location = params ? `${params.lat},${params.lng}` : 'default'
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
    return this.request<WeatherData>(`/api/weather/current/${location}${query}`)
  }

  async getWeatherForecast(params?: { lat: number; lng: number; city: string; state: string; country: string; days?: number }) {
    // Use coordinates as location identifier
    const location = params ? `${params.lat},${params.lng}` : 'default'
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
    return this.request<WeatherData>(`/api/weather/forecast/${location}${query}`)
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

  // Avatar Upload
  async uploadAvatar(avatarFile: File) {
    const formData = new FormData()
    formData.append('avatar', avatarFile)

    const res: any = await this.request("/api/users/upload-avatar", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : "",
      } as any,
    })
    return res
  }

  // Fintech - Credit Score and Loans
  async getMyCreditScore() {
    return this.request(`/api/fintech/credit-score/me`);
  }

  async getLoanApplications(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters || {})
    return this.request(`/api/fintech/loan-applications?${params.toString()}`)
  }

  async createLoanApplication(data: { amount: number; purpose: string; term: number; description?: string }) {
    return this.request(`/api/fintech/loan-applications`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getFinancialDashboard() {
    return this.request('/api/fintech/dashboard');
  }

  async getFinancialGoals() {
    return this.request('/api/fintech/financial-goals/me');
  }

  async createFinancialGoal(data: {
    title: string;
    description?: string;
    type: string;
    targetAmount: number;
    targetDate: string;
    priority?: string;
  }) {
    return this.request('/api/fintech/financial-goals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateFinancialGoal(id: string, data: Partial<{
    title: string;
    description: string;
    currentAmount: number;
    status: string;
  }>) {
    return this.request(`/api/fintech/financial-goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }



  async getInsurancePolicies() {
    return this.request('/api/fintech/insurance-policies/me');
  }

  async getInsuranceQuotes(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters || {})
    return this.request(`/api/fintech/insurance-quotes?${params.toString()}`);
  }

  async getFinancialHealth() {
    return this.request('/api/fintech/financial-health/me');
  }

  async getMyProfile() {
    return this.request('/api/users/profile/me');
  }

  async updateMyProfile(data: any) {
    return this.request('/api/users/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getMyPreferences() {
    return this.request('/api/users/preferences/me');
  }

  async updateMyPreferences(data: { notifications: Record<string, boolean> }) {
    return this.request('/api/users/preferences/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getMySettings() {
    return this.request('/api/users/settings/me');
  }

  async updateMySettings(data: any) {
    return this.request('/api/users/settings/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteHarvest(harvestId: string) {
    return this.request(`/api/harvests/${harvestId}`, { method: "DELETE" })
  }

  async exportHarvests(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters || {})
    const url = `/api/harvests/export?${params}`
    // Create a temporary link to download the file
    const link = document.createElement('a')
    link.href = url
    link.download = `harvests-export.${(filters || {}).format || 'json'}`
    link.click()
    return { success: true }
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

  async getFavorites(userId?: string, params: any = {}) {
    console.log('🔍 API: getFavorites called with userId:', userId)
    console.log('🔑 API: Current token:', this.token ? 'Present' : 'Missing')
    console.log('🔑 API: Token from localStorage:', typeof window !== 'undefined' ? localStorage.getItem('grochain_auth_token') ? 'Present' : 'Missing' : 'N/A')

    if (userId && userId !== 'undefined' && userId !== 'null') {
      console.log('📋 API: Using userId parameter:', userId)
      const queryString = new URLSearchParams(params).toString()
      return this.request(`/api/marketplace/favorites/${userId}?${queryString}`)
    } else {
      console.log('🔄 API: Using current user fallback')
      // Fallback: get favorites for current authenticated user
      const queryString = new URLSearchParams(params).toString()
      return this.request(`/api/marketplace/favorites/current?${queryString}`)
    }
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

  // Payment Methods Management
  async getPaymentMethods() {
    return this.request('/api/payments/methods')
  }

  async addPaymentMethod(data: { type: string; details: any }) {
    return this.request('/api/payments/methods', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePaymentMethod(id: string, data: any) {
    return this.request(`/api/payments/methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePaymentMethod(id: string) {
    return this.request(`/api/payments/methods/${id}`, {
      method: 'DELETE',
    })
  }

  async setDefaultPaymentMethod(id: string) {
    return this.request(`/api/payments/methods/${id}/default`, {
      method: 'PATCH',
    })
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

  // Order Management
  async getBuyerAnalytics(buyerId?: string) {
    const endpoint = buyerId ? `/api/analytics/buyers/${buyerId}` : `/api/analytics/buyers/me`
    return this.request(endpoint)
  }

  async getBuyerAnalyticsWithPeriod(buyerId?: string, period: string = '30d') {
    const endpoint = buyerId ? `/api/analytics/buyers/${buyerId}` : `/api/analytics/buyers/me`
    return this.request(`${endpoint}?period=${period}`)
  }

  async searchSuggestions(q: string, limit: number = 10) {
    return this.request(`/api/marketplace/search-suggestions?q=${encodeURIComponent(q)}&limit=${limit}`)
  }

  async getUserOrders(params: any = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/api/marketplace/orders?${queryString}` : '/api/marketplace/orders'
    return this.request(url)
  }



  async getWeatherData(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : ''
    return this.request(`/api/weather${queryString ? '?' + queryString : ''}`)
  }

  async getHealthCheck() {
    return this.request('/api/health')
  }

  async getSupportedFormats() {
    return this.request('/api/export-import/formats')
  }

  async getNotificationPreferences() {
    return this.request('/api/notifications/preferences')
  }

  async markAllNotificationsAsRead() {
    return this.request('/api/notifications/mark-all-read', {
      method: 'PATCH',
    })
  }

  async updatePushToken(token: string) {
    return this.request('/api/notifications/push-token', {
      method: 'PUT',
      body: JSON.stringify({ token }),
    })
  }

  async getFarmerAnalytics(farmerId?: string) {
    if (farmerId) {
      return this.request(`/api/analytics/farmers/${farmerId}`)
    }
    return this.request('/api/analytics/farmers/me')
  }

  // Partner Dashboard Methods
  async getPartnerDashboard() {
    return this.request<{
      totalFarmers: number
      activeFarmers: number
      pendingApprovals: number
      monthlyCommission: number
      totalCommission: number
      approvalRate: number
      recentActivity: Array<{
        type: string
        farmer?: string
        amount?: number
        timestamp: string
        description: string
      }>
    }>("/api/partners/dashboard")
  }

  async getPartnerFarmers(params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }) {
    const queryString = params ? new URLSearchParams(params).toString() : ''
    return this.request<{
      farmers: Array<{
        _id: string
        name: string
        email: string
        phone: string
        location: string
        status: 'active' | 'inactive' | 'pending'
        joinedDate: string
        totalHarvests: number
        totalSales: number
      }>
      total: number
      page: number
      pages: number
    }>(`/api/partners/farmers?${queryString}`)
  }

  async getPartnerMetrics() {
    return this.request<{
      totalFarmers: number
      activeFarmers: number
      inactiveFarmers: number
      pendingFarmers: number
      totalCommissions: number
      monthlyCommissions: number
      commissionRate: number
      approvalRate: number
      conversionRate: number
      performanceMetrics: {
        farmersOnboardedThisMonth: number
        commissionsEarnedThisMonth: number
        averageCommissionPerFarmer: number
      }
    }>("/api/partners/metrics")
  }

  async getPartnerCommission() {
    return this.request<{
      totalEarned: number
      commissionRate: number
      pendingAmount: number
      paidAmount: number
      lastPayout?: string
      monthlyBreakdown: Array<{
        month: string
        amount: number
      }>
    }>("/api/partners/commission")
  }

  async uploadPartnerCSV(file: File) {
    const formData = new FormData()
    formData.append('csvFile', file)

    return this.request<{
      totalRows: number
      successfulRows: number
      failedRows: number
      errors: Array<{
        row: number
        error: string
      }>
    }>("/api/partners/upload-csv", {
      method: "POST",
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    })
  }

  // Commission Management
  async getCommissions(params?: {
    page?: number
    limit?: number
    status?: string
    farmerId?: string
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const queryString = params ? new URLSearchParams(params).toString() : ''
    return this.request<{
      commissions: Array<{
        _id: string
        farmer: {
          _id: string
          name: string
          email: string
        }
        order: {
          _id: string
          orderNumber: string
          total: number
        }
        amount: number
        rate: number
        status: 'pending' | 'approved' | 'paid' | 'cancelled'
        paidAt?: string
        notes?: string
      }>
      pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
        itemsPerPage: number
        hasNextPage: boolean
        hasPrevPage: boolean
      }
    }>(`/api/commissions?${queryString}`)
  }

  async processCommissionPayout(data: {
    commissionIds: string[]
    payoutMethod: string
    payoutDetails: any
  }) {
    return this.request('/api/commissions/payout', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Referral Management
  async getReferrals(params?: {
    page?: number
    limit?: number
    status?: string
    farmerId?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const queryString = params ? new URLSearchParams(params).toString() : ''
    return this.request<{
      docs: Array<{
        _id: string
        farmer: {
          _id: string
          name: string
          email: string
          phone: string
          region: string
        }
        status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired'
        referralCode: string
        commissionRate: number
        commission: number
        commissionStatus: 'pending' | 'calculated' | 'paid' | 'cancelled'
        performanceMetrics: {
          totalTransactions: number
          totalValue: number
          averageOrderValue: number
          customerRetention: number
        }
        expiresAt: string
        isRenewable: boolean
      }>
      totalDocs: number
      limit: number
      page: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }>(`/api/referrals?${queryString}`)
  }

  async createReferral(data: {
    farmerId: string
    commissionRate?: number
    notes?: string
  }) {
    return this.request('/api/referrals', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getReferralStats() {
    return this.request('/api/referrals/stats/overview')
  }

  async getReferralPerformanceStats(period: string = 'month') {
    return this.request(`/api/referrals/stats/performance?period=${period}`)
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
  async getQRCodes(filters?: {
    page?: number
    limit?: number
    status?: string
    cropType?: string
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    return this.request(`/api/qr-codes?${params.toString()}`)
  }

  async generateQRCodeForHarvest(harvestId: string, customData?: Record<string, any>) {
    return this.request('/api/qr-codes', {
      method: 'POST',
      body: JSON.stringify({ harvestId, customData }),
    })
  }

  async getQRCodeById(id: string) {
    return this.request(`/api/qr-codes/${id}`)
  }

  async downloadQRCode(id: string) {
    const url = `${this.baseUrl}/api/qr-codes/${id}/download`
    const headers: Record<string, string> = {}

    if (this.token && this.token !== 'undefined') {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    try {
      console.log("[v0] Download Request:", { url, hasAuth: !!headers.Authorization })

      const response = await fetch(url, {
        method: "GET",
        headers,
        mode: "cors",
        credentials: "include",
      })

      console.log("[v0] Download Response:", { status: response.status, ok: response.ok })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        if (response.status === 404) {
          errorMessage = "QR code not found"
        } else if (response.status === 401) {
          errorMessage = "Authentication error: Please log in again"
        }

        const err: any = new Error(errorMessage)
        err.status = response.status
        throw err
      }

      // Return the response directly for binary data
      return response
    } catch (error) {
      console.error("[v0] Download Error:", error)
      throw error
    }
  }

  async revokeQRCode(id: string) {
    return this.request(`/api/qr-codes/${id}/revoke`, {
      method: 'PATCH',
    })
  }

  async deleteQRCode(id: string) {
    return this.request(`/api/qr-codes/${id}`, {
      method: 'DELETE',
    })
  }

  async getQRCodeStats() {
    return this.request('/api/qr-codes/stats')
  }

  async recordQRScan(qrCodeId: string, scanData?: {
    name?: string
    location?: string
    coordinates?: { lat: number; lng: number }
    verificationResult?: 'success' | 'failed' | 'tampered'
    notes?: string
  }) {
    return this.request('/api/qr-codes/scan', {
      method: 'POST',
      body: JSON.stringify({ qrCodeId, scanData }),
    })
  }

  async getFarmerProfile() {
    return this.request('/api/farmers/profile/me')
  }

  async updateFarmerProfile(profileData: any) {
    return this.request('/api/farmers/profile/me', {
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

  async exportAnalyticsData(type: string = 'user', period: string = '30d', format: string = 'csv'): Promise<void> {
    const requestBody = {
      type,
      period,
      format,
      filename: `farmer-analytics-${period}-${new Date().toISOString().split('T')[0]}`
    }

    const response = await fetch(`${this.baseUrl}/api/analytics/report`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    // Handle file download
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    // Get filename from response headers or use default
    const contentDisposition = response.headers.get('content-disposition')
    let filename = `farmer-analytics-${period}-${new Date().toISOString().split('T')[0]}.${format}`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

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

  // QR Code Verification Methods
  async verifyQRCode(batchId: string) {
    return this.request<{
      verified: boolean
      batchId: string
      cropType: string
      harvestDate: string
      quantity: number
      unit: string
      quality: string
      location: any
      farmer: string
      status: string
      message?: string
    }>(`/api/verify/${batchId}`)
  }

  async getQRProvenance(batchId: string) {
    return this.request<any>(`/api/verify/harvest/${batchId}`)
  }

  async getProductProvenance(productId: string) {
    return this.request<any>(`/api/verify/product/${productId}`)
  }

  async recordQRScan(qrCodeId: string, scanData: any) {
    return this.request<{ status: string; message: string }>('/api/qr-codes/scan', {
      method: 'POST',
      body: JSON.stringify({ qrCodeId, scanData })
    })
  }

  async getQRCodeStats() {
    return this.request<{
      totalCodes: number
      activeCodes: number
      verifiedCodes: number
      revokedCodes: number
      expiredCodes: number
      totalScans: number
      totalDownloads: number
      monthlyGrowth: number
      monthlyTrend: any[]
      recentActivity: any[]
      lastUpdated: string
    }>('/api/qr-codes/stats')
  }
}

export const apiService = new ApiService()

export const api = apiService
