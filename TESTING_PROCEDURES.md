# Partners Dashboard - Testing Procedures

## Overview

This document outlines comprehensive testing procedures for the Partners Dashboard integration, including unit tests, integration tests, end-to-end tests, and performance testing.

## Test Categories

### 1. Unit Tests
Test individual components and functions in isolation.

### 2. Integration Tests
Test interaction between different parts of the system.

### 3. End-to-End Tests
Test complete user workflows from frontend to backend.

### 4. Performance Tests
Test system performance under various loads.

---

## Backend Unit Tests

### Setup
```javascript
// backend/tests/setup.js
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
})
```

### Partner Controller Tests
```javascript
// backend/tests/controllers/partner.controller.test.js
const request = require('supertest')
const app = require('../../app')
const Partner = require('../../models/partner.model')
const User = require('../../models/user.model')
const jwt = require('jsonwebtoken')

describe('Partner Controller', () => {
  let partnerToken
  let partnerId
  let farmerId

  beforeEach(async () => {
    // Create test partner
    const partner = await Partner.create({
      name: 'Test Partner',
      email: 'partner@test.com',
      phone: '+2348012345678',
      organization: 'Test Organization',
      type: 'cooperative',
      location: 'Lagos',
      status: 'active',
      commissionRate: 0.05
    })

    partnerId = partner._id

    // Create test farmer
    const farmer = await User.create({
      name: 'Test Farmer',
      email: 'farmer@test.com',
      phone: '+2348087654321',
      password: 'hashedpassword',
      role: 'farmer',
      status: 'active',
      partner: partnerId
    })

    farmerId = farmer._id

    // Generate JWT token
    partnerToken = jwt.sign(
      { id: partnerId, email: 'partner@test.com', role: 'partner' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
  })

  describe('GET /api/partners/dashboard', () => {
    it('should return partner dashboard data', async () => {
      const response = await request(app)
        .get('/api/partners/dashboard')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('totalFarmers')
      expect(response.body.data).toHaveProperty('activeFarmers')
      expect(response.body.data).toHaveProperty('totalCommission')
      expect(typeof response.body.data.totalFarmers).toBe('number')
    })

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/partners/dashboard')
        .expect(401)

      expect(response.body.status).toBe('error')
    })

    it('should return 404 for non-existent partner', async () => {
      // Delete the partner
      await Partner.findByIdAndDelete(partnerId)

      const response = await request(app)
        .get('/api/partners/dashboard')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(404)

      expect(response.body.status).toBe('error')
      expect(response.body.message).toContain('Partner profile not found')
    })
  })

  describe('GET /api/partners/farmers', () => {
    it('should return paginated farmers list', async () => {
      const response = await request(app)
        .get('/api/partners/farmers')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('farmers')
      expect(response.body.data).toHaveProperty('total')
      expect(response.body.data).toHaveProperty('page')
      expect(Array.isArray(response.body.data.farmers)).toBe(true)
    })

    it('should filter farmers by status', async () => {
      const response = await request(app)
        .get('/api/partners/farmers?status=active')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      response.body.data.farmers.forEach(farmer => {
        expect(farmer.status).toBe('active')
      })
    })

    it('should search farmers by name', async () => {
      const response = await request(app)
        .get('/api/partners/farmers?search=Test')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data.farmers.length).toBeGreaterThan(0)
      response.body.data.farmers.forEach(farmer => {
        expect(farmer.name.toLowerCase()).toContain('test')
      })
    })

    it('should handle pagination correctly', async () => {
      // Create additional farmers for pagination test
      for (let i = 0; i < 5; i++) {
        await User.create({
          name: `Farmer ${i}`,
          email: `farmer${i}@test.com`,
          phone: `+234808765432${i}`,
          password: 'hashedpassword',
          role: 'farmer',
          status: 'active',
          partner: partnerId
        })
      }

      const response = await request(app)
        .get('/api/partners/farmers?page=1&limit=3')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      expect(response.body.data.farmers).toHaveLength(3)
      expect(response.body.data.page).toBe(1)
      expect(response.body.data.total).toBeGreaterThan(3)
    })
  })

  describe('GET /api/partners/metrics', () => {
    it('should return partner performance metrics', async () => {
      const response = await request(app)
        .get('/api/partners/metrics')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('totalFarmers')
      expect(response.body.data).toHaveProperty('activeFarmers')
      expect(response.body.data).toHaveProperty('commissionRate')
      expect(response.body.data).toHaveProperty('performanceMetrics')
    })

    it('should calculate correct farmer counts', async () => {
      // Create farmers with different statuses
      await User.create({
        name: 'Inactive Farmer',
        email: 'inactive@test.com',
        phone: '+2348087654322',
        password: 'hashedpassword',
        role: 'farmer',
        status: 'inactive',
        partner: partnerId
      })

      const response = await request(app)
        .get('/api/partners/metrics')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      expect(response.body.data.totalFarmers).toBe(2) // Original + new farmer
      expect(response.body.data.activeFarmers).toBe(1)
      expect(response.body.data.inactiveFarmers).toBe(1)
    })
  })

  describe('GET /api/partners/commission', () => {
    it('should return partner commission summary', async () => {
      const response = await request(app)
        .get('/api/partners/commission')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('totalEarned')
      expect(response.body.data).toHaveProperty('commissionRate')
      expect(response.body.data).toHaveProperty('pendingAmount')
      expect(response.body.data).toHaveProperty('paidAmount')
    })
  })
})
```

### Commission Controller Tests
```javascript
// backend/tests/controllers/commission.controller.test.js
describe('Commission Controller', () => {
  let partnerToken
  let partnerId
  let commissionId

  beforeEach(async () => {
    // Setup test data similar to partner tests
    // Create partner, farmer, and commission records
  })

  describe('GET /api/commissions', () => {
    it('should return paginated commissions list', async () => {
      const response = await request(app)
        .get('/api/commissions')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('commissions')
      expect(response.body.data).toHaveProperty('pagination')
    })

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/commissions?status=pending')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      response.body.data.commissions.forEach(commission => {
        expect(commission.status).toBe('pending')
      })
    })
  })

  describe('POST /api/commissions/payout', () => {
    it('should process commission payout', async () => {
      const payoutData = {
        commissionIds: [commissionId],
        payoutMethod: 'bank_transfer',
        payoutDetails: {
          bankName: 'Access Bank',
          accountNumber: '1234567890',
          accountName: 'Test Partner'
        }
      }

      const response = await request(app)
        .post('/api/commissions/payout')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send(payoutData)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('payoutId')
      expect(response.body.data).toHaveProperty('totalAmount')
    })
  })
})
```

---

## Frontend Unit Tests

### API Service Tests
```typescript
// client/__tests__/lib/api.test.ts
import { api } from '@/lib/api'

// Mock fetch globally
global.fetch = jest.fn()

describe('API Service - Partner Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('getPartnerDashboard', () => {
    it('makes correct API call and returns data', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          totalFarmers: 150,
          activeFarmers: 120,
          monthlyCommission: 75000
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await api.getPartnerDashboard()

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/partners/dashboard',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('handles API errors correctly', async () => {
      const errorResponse = {
        status: 'error',
        message: 'Partner profile not found'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => errorResponse
      })

      await expect(api.getPartnerDashboard()).rejects.toThrow('Partner profile not found')
    })
  })

  describe('getPartnerFarmers', () => {
    it('handles query parameters correctly', async () => {
      const mockResponse = {
        status: 'success',
        data: { farmers: [], total: 0, page: 1, pages: 1 }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await api.getPartnerFarmers({ page: 2, status: 'active', search: 'john' })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/partners/farmers?page=2&status=active&search=john',
        expect.any(Object)
      )
    })
  })

  describe('uploadPartnerCSV', () => {
    it('handles file upload correctly', async () => {
      const mockFile = new File(['test,csv,data'], 'test.csv', { type: 'text/csv' })
      const mockResponse = {
        status: 'success',
        data: {
          totalRows: 100,
          successfulRows: 95,
          failedRows: 5
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await api.uploadPartnerCSV(mockFile)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/partners/upload-csv',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })
})
```

### Component Tests
```typescript
// client/__tests__/components/PartnerDashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { PartnerDashboard } from '@/components/dashboard/partner-dashboard'
import { api } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api')
const mockApi = api as jest.Mocked<typeof api>

describe('PartnerDashboard', () => {
  beforeEach(() => {
    mockApi.getPartnerDashboard.mockResolvedValue({
      status: 'success',
      data: {
        totalFarmers: 150,
        activeFarmers: 120,
        pendingApprovals: 5,
        monthlyCommission: 75000,
        totalCommission: 285000,
        approvalRate: 92.5,
        recentActivity: []
      }
    })
  })

  it('renders dashboard with correct metrics', async () => {
    render(<PartnerDashboard />)

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('₦75,000')).toBeInTheDocument()
      expect(screen.getByText('92.5%')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<PartnerDashboard />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    mockApi.getPartnerDashboard.mockRejectedValue(new Error('API Error'))

    render(<PartnerDashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard/i)).toBeInTheDocument()
    })
  })
})
```

### Store Tests
```typescript
// client/__tests__/hooks/use-partner-store.test.ts
import { renderHook, act } from '@testing-library/react'
import { usePartnerStore } from '@/hooks/use-partner-store'
import { api } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api')
const mockApi = api as jest.Mocked<typeof api>

describe('usePartnerStore', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => usePartnerStore())
    act(() => {
      result.current.clearError()
    })
  })

  describe('fetchDashboard', () => {
    it('fetches and stores dashboard data', async () => {
      const mockData = {
        totalFarmers: 150,
        activeFarmers: 120,
        monthlyCommission: 75000
      }

      mockApi.getPartnerDashboard.mockResolvedValue({
        status: 'success',
        data: mockData
      })

      const { result } = renderHook(() => usePartnerStore())

      await act(async () => {
        await result.current.fetchDashboard()
      })

      expect(result.current.dashboard).toEqual(mockData)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('handles errors correctly', async () => {
      const errorMessage = 'Failed to fetch dashboard'
      mockApi.getPartnerDashboard.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => usePartnerStore())

      await act(async () => {
        await result.current.fetchDashboard()
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('fetchFarmers', () => {
    it('fetches farmers with pagination', async () => {
      const mockData = {
        farmers: [
          { _id: '1', name: 'John Farmer', status: 'active' }
        ],
        total: 1,
        page: 1,
        pages: 1
      }

      mockApi.getPartnerFarmers.mockResolvedValue({
        status: 'success',
        data: mockData
      })

      const { result } = renderHook(() => usePartnerStore())

      await act(async () => {
        await result.current.fetchFarmers({ page: 1, limit: 20 })
      })

      expect(result.current.farmers).toEqual(mockData.farmers)
      expect(result.current.farmersPagination).toEqual({
        page: 1,
        pages: 1,
        total: 1
      })
    })
  })
})
```

---

## Integration Tests

### Backend-Frontend Integration
```typescript
// client/__tests__/integration/partners.integration.test.ts
import { render, screen, waitFor } from '@testing-library/react'
import { PartnersPage } from '@/app/partners/page'
import { api } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api')
const mockApi = api as jest.Mocked<typeof api>

describe('Partners Page Integration', () => {
  beforeEach(() => {
    // Setup mock API responses
    mockApi.getPartnerDashboard.mockResolvedValue({
      status: 'success',
      data: {
        totalFarmers: 150,
        activeFarmers: 120,
        pendingApprovals: 5,
        monthlyCommission: 75000,
        totalCommission: 285000,
        approvalRate: 92.5,
        recentActivity: []
      }
    })

    mockApi.getPartnerFarmers.mockResolvedValue({
      status: 'success',
      data: {
        farmers: [
          {
            _id: '1',
            name: 'John Farmer',
            email: 'john@example.com',
            phone: '+2348012345678',
            location: 'Lagos, Nigeria',
            status: 'active',
            joinedDate: '2024-01-15T10:30:00Z',
            totalHarvests: 5,
            totalSales: 150000
          }
        ],
        total: 1,
        page: 1,
        pages: 1
      }
    })
  })

  it('loads and displays partner data correctly', async () => {
    render(<PartnersPage />)

    // Check loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('120')).toBeInTheDocument()
      expect(screen.getByText('₦75,000')).toBeInTheDocument()
    })

    // Check farmers table
    expect(screen.getByText('John Farmer')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    mockApi.getPartnerDashboard.mockRejectedValue(new Error('Network error'))

    render(<PartnersPage />)

    await waitFor(() => {
      expect(screen.getByText(/error loading partner data/i)).toBeInTheDocument()
    })
  })

  it('supports search and filtering', async () => {
    render(<PartnersPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search farmers/i)).toBeInTheDocument()
    })

    // Test search functionality
    const searchInput = screen.getByPlaceholderText(/search farmers/i)
    fireEvent.change(searchInput, { target: { value: 'john' } })

    await waitFor(() => {
      expect(mockApi.getPartnerFarmers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'john' })
      )
    })
  })
})
```

---

## End-to-End Tests

### Cypress Tests
```typescript
// client/cypress/e2e/partners-dashboard.cy.ts
describe('Partners Dashboard E2E', () => {
  beforeEach(() => {
    // Login as partner before each test
    cy.login('partner@example.com', 'password123')
    cy.visit('/partners')
  })

  it('displays partner dashboard correctly', () => {
    // Check main metrics cards
    cy.get('[data-testid="total-farmers-card"]').should('contain', '150')
    cy.get('[data-testid="active-farmers-card"]').should('contain', '120')
    cy.get('[data-testid="monthly-commission-card"]').should('contain', '₦75,000')
    cy.get('[data-testid="total-commission-card"]').should('contain', '₦285,000')

    // Check navigation tabs
    cy.get('[data-testid="farmers-tab"]').should('be.visible')
    cy.get('[data-testid="approvals-tab"]').should('be.visible')
    cy.get('[data-testid="analytics-tab"]').should('be.visible')
  })

  it('displays farmers list with pagination', () => {
    // Switch to farmers tab
    cy.get('[data-testid="farmers-tab"]').click()

    // Check farmers table
    cy.get('[data-testid="farmers-table"]').should('be.visible')
    cy.get('[data-testid="farmer-row"]').should('have.length.greaterThan', 0)

    // Check table columns
    cy.get('[data-testid="farmer-name"]').first().should('not.be.empty')
    cy.get('[data-testid="farmer-email"]').first().should('not.be.empty')
    cy.get('[data-testid="farmer-status"]').first().should('not.be.empty')

    // Test pagination
    cy.get('[data-testid="next-page-btn"]').should('be.visible')
    cy.get('[data-testid="prev-page-btn"]').should('be.disabled')
  })

  it('handles farmer search correctly', () => {
    cy.get('[data-testid="farmers-tab"]').click()

    // Type in search box
    cy.get('[data-testid="farmer-search"]').type('john')

    // Check that API is called with search parameter
    cy.intercept('GET', '/api/partners/farmers*', (req) => {
      expect(req.url).to.include('search=john')
    }).as('searchFarmers')

    cy.wait('@searchFarmers')
  })

  it('displays error states correctly', () => {
    // Simulate network error
    cy.intercept('GET', '/api/partners/dashboard', { statusCode: 500 }).as('dashboardError')

    cy.reload()

    cy.wait('@dashboardError')

    // Check error message is displayed
    cy.get('[data-testid="error-message"]').should('be.visible')
    cy.get('[data-testid="error-message"]').should('contain', 'Failed to load dashboard')
  })

  it('handles bulk farmer onboarding', () => {
    // Navigate to bulk upload page
    cy.get('[data-testid="bulk-upload-btn"]').click()
    cy.url().should('include', '/partners/bulk-onboard')

    // Upload CSV file
    cy.get('[data-testid="csv-upload"]').selectFile('cypress/fixtures/farmers.csv')

    // Check upload progress
    cy.get('[data-testid="upload-btn"]').click()
    cy.get('[data-testid="progress-bar"]').should('be.visible')

    // Wait for upload to complete
    cy.get('[data-testid="success-message"]').should('be.visible')
    cy.get('[data-testid="successful-count"]').should('contain', '95')
    cy.get('[data-testid="failed-count"]').should('contain', '5')
  })

  it('validates user permissions', () => {
    // Try to access partner routes as farmer
    cy.login('farmer@example.com', 'password123')

    cy.visit('/partners')

    // Should redirect or show access denied
    cy.url().should('not.include', '/partners')
    cy.get('[data-testid="access-denied"]').should('be.visible')
  })

  it('maintains state after page refresh', () => {
    // Perform some actions
    cy.get('[data-testid="farmers-tab"]').click()
    cy.get('[data-testid="farmer-search"]').type('test')

    // Refresh page
    cy.reload()

    // Check state is maintained or properly reset
    cy.get('[data-testid="farmers-tab"]').should('have.class', 'active')
  })
})
```

### Playwright Tests
```typescript
// client/e2e/partners-dashboard.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Partners Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as partner
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'partner@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-btn"]')
    await page.waitForURL('/partners')
  })

  test('displays dashboard metrics', async ({ page }) => {
    // Check main metrics
    await expect(page.locator('[data-testid="total-farmers-card"]')).toContainText('150')
    await expect(page.locator('[data-testid="active-farmers-card"]')).toContainText('120')
    await expect(page.locator('[data-testid="monthly-commission-card"]')).toContainText('₦75,000')
  })

  test('handles farmer search and filtering', async ({ page }) => {
    // Switch to farmers tab
    await page.click('[data-testid="farmers-tab"]')

    // Search for farmers
    await page.fill('[data-testid="farmer-search"]', 'john')
    await page.click('[data-testid="search-btn"]')

    // Wait for API call
    await page.waitForResponse(response =>
      response.url().includes('/api/partners/farmers') &&
      response.url().includes('search=john')
    )

    // Check results
    await expect(page.locator('[data-testid="farmer-row"]')).toHaveCount(1)
  })

  test('performs bulk farmer upload', async ({ page }) => {
    // Navigate to bulk upload
    await page.click('[data-testid="bulk-upload-btn"]')
    await page.waitForURL('/partners/bulk-onboard')

    // Upload file
    await page.setInputFiles('[data-testid="csv-upload"]', 'e2e/fixtures/farmers.csv')

    // Start upload
    await page.click('[data-testid="upload-btn"]')

    // Check progress and results
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('handles network errors gracefully', async ({ page }) => {
    // Intercept API calls
    await page.route('/api/partners/dashboard', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'error',
          message: 'Internal server error'
        })
      })
    })

    // Reload page
    await page.reload()

    // Check error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible()
  })

  test('maintains responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check mobile layout
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    // Check tablet layout
    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible()
  })
})
```

---

## Performance Tests

### Load Testing
```javascript
// backend/tests/performance/partner-endpoints.test.js
const autocannon = require('autocannon')
const { promisify } = require('util')

describe('Partner Endpoints Performance', () => {
  const baseUrl = 'http://localhost:5000'
  const headers = {
    'Authorization': 'Bearer test_token'
  }

  it('should handle 100 concurrent dashboard requests', async () => {
    const result = await promisify(autocannon)({
      url: `${baseUrl}/api/partners/dashboard`,
      headers,
      connections: 100,
      duration: 10,
      headers: headers
    })

    console.log('Dashboard endpoint performance:', result)

    expect(result.requests.average).toBeGreaterThan(500) // 500 req/sec
    expect(result.latency.average).toBeLessThan(100) // < 100ms avg latency
    expect(result.errors).toBe(0)
  })

  it('should handle farmers list pagination under load', async () => {
    const result = await promisify(autocannon)({
      url: `${baseUrl}/api/partners/farmers?page=1&limit=20`,
      headers,
      connections: 50,
      duration: 10
    })

    expect(result.requests.average).toBeGreaterThan(300)
    expect(result.latency.p99).toBeLessThan(200) // 99th percentile < 200ms
  })

  it('should handle bulk upload processing', async () => {
    // Test file upload performance
    const result = await promisify(autocannon)({
      url: `${baseUrl}/api/partners/upload-csv`,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data'
      },
      connections: 10,
      duration: 5,
      body: createLargeCSVFormData() // Helper to create test CSV
    })

    expect(result.requests.average).toBeGreaterThan(50)
    expect(result.latency.average).toBeLessThan(500) // File upload can be slower
  })
})

function createLargeCSVFormData() {
  // Create a FormData with a large CSV file for testing
  const formData = new FormData()

  // Generate 1000 farmer records
  let csvContent = 'name,email,phone,location\n'
  for (let i = 0; i < 1000; i++) {
    csvContent += `Farmer ${i},farmer${i}@test.com,+2348012345${i.toString().padStart(3, '0')},Lagos\n`
  }

  const blob = new Blob([csvContent], { type: 'text/csv' })
  formData.append('csvFile', blob, 'large_farmers.csv')

  return formData
}
```

### Memory and Resource Testing
```javascript
// backend/tests/performance/memory-leak.test.js
const { fork } = require('child_process')
const path = require('path')

describe('Memory Leak Tests', () => {
  it('should not have memory leaks during sustained load', (done) => {
    const child = fork(path.join(__dirname, 'memory-test-worker.js'))

    let initialMemory
    let finalMemory

    child.on('message', (message) => {
      if (message.type === 'initial_memory') {
        initialMemory = message.memory
      } else if (message.type === 'final_memory') {
        finalMemory = message.memory

        // Check memory growth (should be < 50MB)
        const memoryGrowth = finalMemory - initialMemory
        expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024) // 50MB

        child.kill()
        done()
      }
    })

    child.send({ type: 'start_load_test' })
  }, 60000) // 60 second timeout
})

// memory-test-worker.js
const autocannon = require('autocannon')

process.on('message', async (message) => {
  if (message.type === 'start_load_test') {
    // Record initial memory
    process.send({
      type: 'initial_memory',
      memory: process.memoryUsage().heapUsed
    })

    // Run sustained load test
    await autocannon({
      url: 'http://localhost:5000/api/partners/dashboard',
      headers: { 'Authorization': 'Bearer test_token' },
      connections: 20,
      duration: 30 // 30 seconds
    })

    // Record final memory
    setTimeout(() => {
      process.send({
        type: 'final_memory',
        memory: process.memoryUsage().heapUsed
      })
    }, 1000)
  }
})
```

### Database Performance Tests
```javascript
// backend/tests/performance/database.test.js
const mongoose = require('mongoose')
const { performance } = require('perf_hooks')

describe('Database Performance Tests', () => {
  beforeAll(async () => {
    // Create test data
    await createTestData()
  })

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData()
  })

  it('should query farmers efficiently', async () => {
    const startTime = performance.now()

    const farmers = await mongoose.model('User').find({
      role: 'farmer',
      partner: testPartnerId
    }).limit(1000)

    const endTime = performance.now()
    const queryTime = endTime - startTime

    console.log(`Query time for 1000 farmers: ${queryTime}ms`)
    expect(queryTime).toBeLessThan(100) // Should complete in < 100ms
    expect(farmers).toHaveLength(1000)
  })

  it('should handle concurrent partner queries', async () => {
    const promises = []

    // Create 50 concurrent queries
    for (let i = 0; i < 50; i++) {
      promises.push(
        mongoose.model('User').countDocuments({
          role: 'farmer',
          partner: testPartnerId
        })
      )
    }

    const startTime = performance.now()
    const results = await Promise.all(promises)
    const endTime = performance.now()

    const totalTime = endTime - startTime
    const avgTime = totalTime / 50

    console.log(`Concurrent queries: total ${totalTime}ms, avg ${avgTime}ms`)
    expect(avgTime).toBeLessThan(50) // Each query < 50ms on average
    expect(results.every(count => count >= 0)).toBe(true)
  })

  it('should optimize commission aggregations', async () => {
    const startTime = performance.now()

    const result = await mongoose.model('Commission').aggregate([
      { $match: { partner: testPartnerId } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ])

    const endTime = performance.now()
    const queryTime = endTime - startTime

    console.log(`Commission aggregation time: ${queryTime}ms`)
    expect(queryTime).toBeLessThan(200) // Aggregation should be fast
    expect(result).toHaveLength(1)
  })
})

async function createTestData() {
  // Create test partner
  const Partner = mongoose.model('Partner')
  const testPartner = await Partner.create({
    name: 'Performance Test Partner',
    email: 'perf@test.com',
    organization: 'Performance Tests',
    type: 'cooperative',
    location: 'Test City'
  })

  global.testPartnerId = testPartner._id

  // Create 1000 test farmers
  const User = mongoose.model('User')
  const farmerPromises = []

  for (let i = 0; i < 1000; i++) {
    farmerPromises.push(
      User.create({
        name: `Test Farmer ${i}`,
        email: `farmer${i}@test.com`,
        phone: `+2348012345${i.toString().padStart(3, '0')}`,
        password: 'hashedpassword',
        role: 'farmer',
        status: 'active',
        partner: testPartner._id
      })
    )
  }

  await Promise.all(farmerPromises)

  // Create test commissions
  const Commission = mongoose.model('Commission')
  const commissionPromises = []

  for (let i = 0; i < 100; i++) {
    commissionPromises.push(
      Commission.create({
        partner: testPartner._id,
        farmer: `farmer_${i % 1000}`,
        order: `order_${i}`,
        amount: Math.random() * 10000,
        rate: 0.05,
        status: 'paid'
      })
    )
  }

  await Promise.all(commissionPromises)
}

async function cleanupTestData() {
  await mongoose.model('Commission').deleteMany({ partner: global.testPartnerId })
  await mongoose.model('User').deleteMany({ partner: global.testPartnerId })
  await mongoose.model('Partner').deleteMany({ _id: global.testPartnerId })
}
```

---

## Test Automation

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:4.4
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install
        working-directory: backend

      - name: Run unit tests
        run: npm test
        working-directory: backend

      - name: Run integration tests
        run: npm run test:integration
        working-directory: backend

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install
        working-directory: client

      - name: Run unit tests
        run: npm test
        working-directory: client

      - name: Run E2E tests
        run: npm run test:e2e
        working-directory: client

  performance-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:4.4
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install
        working-directory: backend

      - name: Run performance tests
        run: npm run test:performance
        working-directory: backend
```

### Test Scripts
```json
// backend/package.json
{
  "scripts": {
    "test": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:performance": "jest --testPathPattern=performance",
    "test:all": "npm run test && npm run test:integration && npm run test:performance",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

```json
// client/package.json
{
  "scripts": {
    "test": "jest",
    "test:e2e": "cypress run",
    "test:e2e:ui": "cypress open",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

---

## Test Data Management

### Test Data Factory
```javascript
// backend/tests/factories/partner.factory.js
const { faker } = require('@faker-js/faker')
const Partner = require('../../models/partner.model')
const User = require('../../models/user.model')
const Commission = require('../../models/commission.model')

class PartnerFactory {
  static async createPartner(overrides = {}) {
    const partnerData = {
      name: faker.company.name(),
      email: faker.internet.email(),
      phone: faker.phone.number('+23480########'),
      organization: faker.company.name(),
      type: faker.helpers.arrayElement(['cooperative', 'extension_agency', 'ngo', 'aggregator']),
      location: faker.address.city(),
      status: 'active',
      commissionRate: 0.05,
      ...overrides
    }

    return await Partner.create(partnerData)
  }

  static async createFarmer(partnerId, overrides = {}) {
    const farmerData = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number('+23480########'),
      password: await bcrypt.hash('testpassword', 10),
      role: 'farmer',
      status: 'active',
      partner: partnerId,
      location: faker.address.city(),
      ...overrides
    }

    return await User.create(farmerData)
  }

  static async createCommission(partnerId, farmerId, overrides = {}) {
    const commissionData = {
      partner: partnerId,
      farmer: farmerId,
      order: faker.datatype.uuid(),
      listing: faker.datatype.uuid(),
      amount: faker.datatype.number({ min: 1000, max: 50000 }),
      rate: 0.05,
      status: faker.helpers.arrayElement(['pending', 'approved', 'paid', 'cancelled']),
      orderAmount: faker.datatype.number({ min: 20000, max: 100000 }),
      orderDate: faker.date.recent(),
      ...overrides
    }

    return await Commission.create(commissionData)
  }

  static async createTestScenario() {
    // Create partner with farmers and commissions
    const partner = await this.createPartner()
    const farmers = []

    // Create 10 farmers
    for (let i = 0; i < 10; i++) {
      const farmer = await this.createFarmer(partner._id)
      farmers.push(farmer)

      // Create 5 commissions per farmer
      for (let j = 0; j < 5; j++) {
        await this.createCommission(partner._id, farmer._id)
      }
    }

    return { partner, farmers }
  }
}

module.exports = PartnerFactory
```

---

## Monitoring & Reporting

### Test Results Dashboard
```javascript
// backend/tests/utils/test-reporter.js
const { TestResultsProcessor } = require('jest-results-processor')

class PartnerTestReporter {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, duration: 0 },
      integration: { passed: 0, failed: 0, duration: 0 },
      e2e: { passed: 0, failed: 0, duration: 0 },
      performance: { passed: 0, failed: 0, duration: 0 }
    }
  }

  onTestResult(test, testResult) {
    const testType = this.getTestType(test.path)

    testResult.testResults.forEach(result => {
      if (result.status === 'passed') {
        this.results[testType].passed++
      } else {
        this.results[testType].failed++
      }
    })

    this.results[testType].duration += testResult.perfStats.runtime
  }

  getTestType(path) {
    if (path.includes('unit')) return 'unit'
    if (path.includes('integration')) return 'integration'
    if (path.includes('e2e')) return 'e2e'
    if (path.includes('performance')) return 'performance'
    return 'unit'
  }

  generateReport() {
    console.log('\n=== Partners Dashboard Test Report ===\n')

    Object.entries(this.results).forEach(([type, stats]) => {
      const total = stats.passed + stats.failed
      const passRate = total > 0 ? (stats.passed / total * 100).toFixed(2) : '0.00'

      console.log(`${type.toUpperCase()} Tests:`)
      console.log(`  Passed: ${stats.passed}`)
      console.log(`  Failed: ${stats.failed}`)
      console.log(`  Pass Rate: ${passRate}%`)
      console.log(`  Duration: ${(stats.duration / 1000).toFixed(2)}s`)
      console.log('')
    })

    const overall = Object.values(this.results).reduce(
      (acc, curr) => ({
        passed: acc.passed + curr.passed,
        failed: acc.failed + curr.failed,
        duration: acc.duration + curr.duration
      }),
      { passed: 0, failed: 0, duration: 0 }
    )

    const overallPassRate = (overall.passed / (overall.passed + overall.failed) * 100).toFixed(2)

    console.log('OVERALL:')
    console.log(`  Total Tests: ${overall.passed + overall.failed}`)
    console.log(`  Overall Pass Rate: ${overallPassRate}%`)
    console.log(`  Total Duration: ${(overall.duration / 1000).toFixed(2)}s`)
  }
}

module.exports = PartnerTestReporter
```

---

## Summary

This comprehensive testing guide covers:

✅ **Unit Tests**: Backend controllers, API services, components, stores
✅ **Integration Tests**: Backend-frontend communication, data flow
✅ **End-to-End Tests**: Complete user workflows with Cypress and Playwright
✅ **Performance Tests**: Load testing, memory usage, database optimization
✅ **Test Automation**: CI/CD pipeline, automated reporting
✅ **Test Data Management**: Factories for consistent test data

**Key Testing Metrics:**
- Unit test coverage: > 80%
- Integration test pass rate: > 95%
- E2E test reliability: > 90%
- Performance benchmarks: < 100ms average response time
- Memory usage: < 50MB growth under load

**Test Execution Commands:**
```bash
# Backend tests
npm run test:all                    # Run all backend tests
npm run test:performance           # Performance tests only

# Frontend tests
npm test                           # Unit tests
npm run test:e2e                   # E2E tests

# Full test suite
npm run test:full                  # All tests across stack
```

This testing framework ensures the Partners Dashboard maintains high quality, performance, and reliability as features are added and the system scales.
