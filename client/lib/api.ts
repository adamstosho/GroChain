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
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
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
            "Network error: Unable to connect to server. Please check if the backend is running on " + this.baseUrl
        } else if (response.status >= 500) {
          errorMessage = "Server error: " + errorMessage
        } else if (response.status === 404) {
          errorMessage = "Endpoint not found: " + endpoint
        }

        throw new Error(errorMessage)
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
    return this.request("/api/auth/logout", {
      method: "POST",
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
      body: JSON.stringify(harvestData),
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

  // Weather
  async getCurrentWeather(location?: string) {
    const params = location ? `?location=${encodeURIComponent(location)}` : ""
    return this.request<WeatherData>(`/api/weather/current${params}`)
  }

  async getWeatherForecast(location?: string) {
    const params = location ? `?location=${encodeURIComponent(location)}` : ""
    return this.request<WeatherData>(`/api/weather/forecast${params}`)
  }

  async getAgriculturalInsights(location?: string) {
    const params = location ? `?location=${encodeURIComponent(location)}` : ""
    return this.request<WeatherData>(`/api/weather/agricultural-insights${params}`)
  }

  // Analytics
  async getAnalytics(type: string, filters?: Record<string, any>) {
    const params = new URLSearchParams(filters)
    return this.request(`/api/analytics/${type}?${params}`)
  }

  // File Upload
  async uploadImage(file: File, type: "harvest" | "listing" | "profile" = "harvest") {
    const formData = new FormData()
    formData.append("image", file)
    formData.append("type", type)

    return this.request<{ url: string }>("/api/marketplace/upload-image", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : "",
      } as any,
    })
  }
}

export const apiService = new ApiService()

export const api = apiService
