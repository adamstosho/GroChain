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
    return this.request<{ message: string }>("/api/auth/verify-email", {
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
}

export const apiService = new ApiService()

export const api = apiService
