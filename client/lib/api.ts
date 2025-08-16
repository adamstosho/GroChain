import { ApiResponse, User, LoginRequest, LoginResponse, RegisterRequest, Harvest, MarketplaceListing } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  // Authentication - Updated to match backend endpoints
  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: string
    phoneNumber: string
  }) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async logout() {
    const response = await this.request("/api/auth/logout", {
      method: "POST",
    })
    this.clearToken()
    return response
  }

  async refreshToken() {
    return this.request("/api/auth/refresh", {
      method: "POST",
    })
  }

  async forgotPassword(email: string) {
    return this.request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    })
  }

  async verifyEmail(token: string) {
    return this.request("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
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

    const endpoint = `/api/harvests${queryParams.toString() ? `?${queryParams}` : ""}`
    return this.request(endpoint)
  }

  async createHarvest(harvestData: any) {
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

  async getSearchSuggestions(query: string) {
    return this.request(`/api/marketplace/search-suggestions?q=${encodeURIComponent(query)}`)
  }

  async createMarketplaceListing(listingData: any) {
    return this.request("/api/marketplace/listings", {
      method: "POST",
      body: JSON.stringify(listingData),
    })
  }

  async createMarketplaceOrder(orderData: any) {
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

  // Payments - Updated endpoints
  async initializePayment(paymentData: {
    amount: number
    currency: string
    productId: string
    buyerId: string
    sellerId: string
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

  async getPartnersAnalytics() {
    return this.request("/api/analytics/partners")
  }

  async getWeatherAnalytics() {
    return this.request("/api/analytics/weather")
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

  async getRegionalAnalytics(regionData: any) {
    return this.request("/api/analytics/regional", {
      method: "POST",
      body: JSON.stringify(regionData),
    })
  }

  async exportAnalytics() {
    return this.request("/api/analytics/export")
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

  async getPartnerMetrics(partnerId: string) {
    return this.request(`/api/partners/${partnerId}/metrics`)
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

  async getSensorReadings(sensorId: string) {
    return this.request(`/api/iot/sensors/${sensorId}/readings`)
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
}

export const apiClient = new ApiClient(API_BASE_URL)
export const api = apiClient
export default apiClient
