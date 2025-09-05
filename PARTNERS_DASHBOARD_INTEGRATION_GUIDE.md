# GroChain Partners Dashboard - Frontend & Backend Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Backend API Specification](#backend-api-specification)
4. [Frontend Integration](#frontend-integration)
5. [Missing Endpoints & Implementation](#missing-endpoints--implementation)
6. [Step-by-Step Integration Guide](#step-by-step-integration-guide)
7. [Testing Procedures](#testing-procedures)
8. [Troubleshooting](#troubleshooting)
9. [Deployment Checklist](#deployment-checklist)
10. [Performance Optimization](#performance-optimization)

---

## Overview

This comprehensive guide provides detailed instructions for integrating the Partners Dashboard between the GroChain frontend and backend systems. The partners functionality allows agricultural partners (cooperatives, extension agencies, NGOs, etc.) to manage farmer networks, track commissions, and monitor performance.

### Key Features
- **Farmer Management**: Onboard, track, and manage farmer networks
- **Commission Tracking**: Real-time commission calculation and payout management
- **Bulk Operations**: CSV upload for mass farmer onboarding
- **Performance Analytics**: Dashboard with KPIs and performance metrics
- **Referral System**: Track farmer referrals and commission earnings
- **Real-time Updates**: WebSocket integration for live notifications

### Architecture Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Next)  │◄──►│   (Node/Express)│◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ - Partners Page │    │ - Partner API   │    │ - User Model    │
│ - Dashboard     │    │ - Auth System   │    │ - Partner Model │
│ - Bulk Upload   │    │ - Commission API│    │ - Commission    │
│ - Analytics     │    │ - Referral API  │    │ - Referral Model│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Current State Analysis

### ✅ What's Working
1. **Backend Infrastructure**:
   - Partner model and controller exist
   - Commission and referral systems are implemented
   - Authentication middleware is configured
   - Database models are properly structured

2. **Frontend Components**:
   - Partners page structure exists
   - Bulk upload functionality is implemented
   - Basic dashboard components are available
   - API service has some partner methods

### ❌ Critical Issues Identified

#### **Missing Backend Endpoints**
The frontend calls these endpoints that don't exist:
- `GET /api/partners/metrics` - Called by partners dashboard
- `GET /api/partners/farmers` - Called by partners dashboard
- `GET /api/partners/dashboard` - Partner dashboard data
- `GET /api/partners/commission` - Partner commission summary

#### **Frontend Integration Gaps**
1. **API Service Missing Methods**:
   - `getPartnerMetrics()`
   - `getPartnerFarmers()`
   - `getPartnerDashboard()`
   - `getPartnerCommissions()`

2. **Component Issues**:
   - Partner dashboard shows "coming soon" placeholders
   - Analytics tabs are not populated
   - Real-time updates not implemented

#### **Data Flow Issues**
1. **Commission Calculation**: No automatic commission calculation on orders
2. **Farmer Status Tracking**: No automatic status updates
3. **Referral Linking**: Farmers not properly linked to partners
4. **Performance Metrics**: No real-time KPI calculations

---

## Backend API Specification

### 1. Partner Management Endpoints

#### **GET /api/partners/dashboard**
Get partner's main dashboard data.

**Authentication**: Required (Partner/Admin)
**Response**:
```json
{
  "status": "success",
  "data": {
    "totalFarmers": 150,
    "activeFarmers": 120,
    "pendingApprovals": 5,
    "monthlyCommission": 75000,
    "totalCommission": 285000,
    "approvalRate": 92.5,
    "recentActivity": [
      {
        "type": "farmer_onboarded",
        "farmer": "Farmer Name",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### **GET /api/partners/farmers**
Get partner's farmer list with pagination.

**Authentication**: Required (Partner/Admin)
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (active/inactive/pending)
- `search`: Search by name/email/location

**Response**:
```json
{
  "status": "success",
  "data": {
    "farmers": [
      {
        "_id": "farmer_id",
        "name": "John Farmer",
        "email": "john@example.com",
        "phone": "+2348012345678",
        "location": "Lagos, Nigeria",
        "status": "active",
        "joinedDate": "2024-01-15T00:00:00Z",
        "totalHarvests": 5,
        "totalSales": 150000
      }
    ],
    "total": 150,
    "page": 1,
    "pages": 8
  }
}
```

#### **GET /api/partners/metrics**
Get partner's performance metrics.

**Authentication**: Required (Partner/Admin)
**Response**:
```json
{
  "status": "success",
  "data": {
    "totalFarmers": 150,
    "activeFarmers": 120,
    "inactiveFarmers": 15,
    "pendingFarmers": 15,
    "totalCommissions": 285000,
    "monthlyCommissions": 75000,
    "commissionRate": 0.05,
    "approvalRate": 92.5,
    "conversionRate": 85.2,
    "performanceMetrics": {
      "farmersOnboardedThisMonth": 12,
      "commissionsEarnedThisMonth": 75000,
      "averageCommissionPerFarmer": 500
    }
  }
}
```

#### **GET /api/partners/commission**
Get partner's commission summary.

**Authentication**: Required (Partner/Admin)
**Response**:
```json
{
  "status": "success",
  "data": {
    "totalEarned": 285000,
    "commissionRate": 0.05,
    "pendingAmount": 15000,
    "paidAmount": 270000,
    "lastPayout": "2024-01-01T00:00:00Z",
    "monthlyBreakdown": [
      { "month": "2024-01", "amount": 75000 },
      { "month": "2024-02", "amount": 72000 }
    ]
  }
}
```

### 2. Bulk Onboarding Endpoints

#### **POST /api/partners/bulk-onboard**
Upload CSV file for bulk farmer onboarding.

**Authentication**: Required (Partner/Admin)
**Content-Type**: `multipart/form-data`

**Request Body**:
```
FormData: {
  csvFile: File (CSV file)
}
```

**CSV Format**:
```csv
name,email,phone,location,gender,age,education
John Farmer,john@example.com,+2348012345678,Lagos,Male,35,Secondary
Jane Farmer,jane@example.com,+2348012345679,Abuja,Female,28,Tertiary
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "totalRows": 100,
    "successfulRows": 95,
    "failedRows": 5,
    "errors": [
      {
        "row": 5,
        "error": "Invalid email format"
      }
    ]
  }
}
```

### 3. Commission Management Endpoints

#### **GET /api/commissions**
Get commission history with filtering.

**Authentication**: Required (Partner/Admin)
**Query Parameters**:
- `page`, `limit`: Pagination
- `status`: pending/approved/paid/cancelled
- `startDate`, `endDate`: Date range
- `farmerId`: Filter by farmer
- `sortBy`, `sortOrder`: Sorting

#### **POST /api/commissions/payout**
Process commission payout.

**Authentication**: Required (Partner/Admin)
**Request Body**:
```json
{
  "commissionIds": ["commission_id_1", "commission_id_2"],
  "payoutMethod": "bank_transfer",
  "payoutDetails": {
    "bankName": "Access Bank",
    "accountNumber": "1234567890",
    "accountName": "Partner Organization"
  }
}
```

### 4. Referral Management Endpoints

#### **GET /api/referrals**
Get partner's referrals.

**Authentication**: Required (Partner/Admin)
**Query Parameters**:
- `page`, `limit`: Pagination
- `status`: pending/active/completed/cancelled/expired
- `farmerId`: Filter by farmer

#### **GET /api/referrals/stats/overview**
Get referral statistics overview.

#### **GET /api/referrals/stats/performance**
Get performance statistics by period.

---

## Frontend Integration

### 1. API Service Methods

Add these methods to `client/lib/api.ts`:

```typescript
// Partner Dashboard Methods
async getPartnerDashboard() {
  return this.request<{
    totalFarmers: number
    activeFarmers: number
    pendingApprovals: number
    monthlyCommission: number
    totalCommission: number
    approvalRate: number
    recentActivity: any[]
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
    performanceMetrics: any
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
  }>("/api/partners/bulk-onboard", {
    method: "POST",
    body: formData,
    headers: {} // Let browser set Content-Type for FormData
  })
}

// Commission Management
async getCommissions(params?: any) {
  const queryString = params ? new URLSearchParams(params).toString() : ''
  return this.request(`/api/commissions?${queryString}`)
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
async getReferrals(params?: any) {
  const queryString = params ? new URLSearchParams(params).toString() : ''
  return this.request(`/api/referrals?${queryString}`)
}

async getReferralStats() {
  return this.request('/api/referrals/stats/overview')
}

async getReferralPerformanceStats(period: string = 'month') {
  return this.request(`/api/referrals/stats/performance?period=${period}`)
}
```

### 2. TypeScript Interfaces

Add these interfaces to `client/lib/types.ts`:

```typescript
// Partner Types
export interface PartnerDashboardData {
  totalFarmers: number
  activeFarmers: number
  pendingApprovals: number
  monthlyCommission: number
  totalCommission: number
  approvalRate: number
  recentActivity: PartnerActivity[]
}

export interface PartnerActivity {
  type: 'farmer_onboarded' | 'commission_paid' | 'harvest_approved'
  farmer?: string
  amount?: number
  timestamp: string
  description: string
}

export interface PartnerFarmer {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  status: 'active' | 'inactive' | 'pending'
  joinedDate: string
  totalHarvests: number
  totalSales: number
  lastActivity?: string
}

export interface PartnerMetrics {
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
}

export interface PartnerCommission {
  totalEarned: number
  commissionRate: number
  pendingAmount: number
  paidAmount: number
  lastPayout?: string
  monthlyBreakdown: Array<{
    month: string
    amount: number
  }>
}

// Commission Types
export interface Commission {
  _id: string
  partner: string
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
  listing: {
    _id: string
    cropName: string
    price: number
  }
  amount: number
  rate: number
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  orderAmount: number
  orderDate: string
  paidAt?: string
  notes?: string
}

// Referral Types
export interface Referral {
  _id: string
  farmer: {
    _id: string
    name: string
    email: string
    phone: string
    region: string
  }
  partner: {
    _id: string
    name: string
    type: string
    contactEmail: string
  }
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired'
  referralCode: string
  referralDate: string
  activationDate?: string
  completionDate?: string
  commissionRate: number
  commission: number
  commissionStatus: 'pending' | 'calculated' | 'paid' | 'cancelled'
  commissionPaidAt?: string
  performanceMetrics: {
    totalTransactions: number
    totalValue: number
    averageOrderValue: number
    customerRetention: number
  }
  notes?: string
  communicationHistory: Array<{
    type: string
    date: string
    summary: string
    outcome?: string
  }>
  followUpRequired: boolean
  followUpDate?: string
  followUpNotes?: string
  expiresAt: string
  isRenewable: boolean
}
```

### 3. State Management

Create `client/hooks/use-partner-store.ts`:

```typescript
import { create } from 'zustand'
import { api } from '@/lib/api'

interface PartnerState {
  // Dashboard Data
  dashboard: PartnerDashboardData | null
  metrics: PartnerMetrics | null
  commission: PartnerCommission | null

  // Farmers Data
  farmers: PartnerFarmer[]
  farmersLoading: boolean
  farmersPagination: {
    page: number
    pages: number
    total: number
  }

  // Commissions Data
  commissions: Commission[]
  commissionsLoading: boolean

  // Referrals Data
  referrals: Referral[]
  referralsLoading: boolean

  // UI State
  loading: boolean
  error: string | null

  // Actions
  fetchDashboard: () => Promise<void>
  fetchMetrics: () => Promise<void>
  fetchCommission: () => Promise<void>
  fetchFarmers: (params?: any) => Promise<void>
  fetchCommissions: (params?: any) => Promise<void>
  fetchReferrals: (params?: any) => Promise<void>
  uploadCSV: (file: File) => Promise<void>
  clearError: () => void
}

export const usePartnerStore = create<PartnerState>((set, get) => ({
  // Initial State
  dashboard: null,
  metrics: null,
  commission: null,
  farmers: [],
  farmersLoading: false,
  farmersPagination: { page: 1, pages: 0, total: 0 },
  commissions: [],
  commissionsLoading: false,
  referrals: [],
  referralsLoading: false,
  loading: false,
  error: null,

  // Actions
  fetchDashboard: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.getPartnerDashboard()
      set({ dashboard: response.data, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchMetrics: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.getPartnerMetrics()
      set({ metrics: response.data, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchCommission: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.getPartnerCommission()
      set({ commission: response.data, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchFarmers: async (params = {}) => {
    set({ farmersLoading: true, error: null })
    try {
      const response = await api.getPartnerFarmers(params)
      set({
        farmers: response.data.farmers,
        farmersPagination: {
          page: response.data.page,
          pages: response.data.pages,
          total: response.data.total
        },
        farmersLoading: false
      })
    } catch (error: any) {
      set({ error: error.message, farmersLoading: false })
    }
  },

  fetchCommissions: async (params = {}) => {
    set({ commissionsLoading: true, error: null })
    try {
      const response = await api.getCommissions(params)
      set({ commissions: response.data.commissions, commissionsLoading: false })
    } catch (error: any) {
      set({ error: error.message, commissionsLoading: false })
    }
  },

  fetchReferrals: async (params = {}) => {
    set({ referralsLoading: true, error: null })
    try {
      const response = await api.getReferrals(params)
      set({ referrals: response.data.docs, referralsLoading: false })
    } catch (error: any) {
      set({ error: error.message, referralsLoading: false })
    }
  },

  uploadCSV: async (file: File) => {
    set({ loading: true, error: null })
    try {
      await api.uploadPartnerCSV(file)
      // Refresh farmers list after upload
      await get().fetchFarmers()
      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  clearError: () => set({ error: null })
}))
```

---

## Missing Endpoints & Implementation

### Backend Implementation

#### 1. Add Missing Partner Controller Methods

Add these methods to `backend/controllers/partner.controller.js`:

```javascript
// Get Partner Dashboard Data
exports.getPartnerDashboard = async (req, res) => {
  try {
    const userId = req.user.id

    // Find partner by user email
    let partner = await Partner.findOne({ email: req.user.email })

    if (!partner) {
      // Create partner profile if it doesn't exist
      partner = new Partner({
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '+234000000000',
        organization: `${req.user.name} Organization`,
        type: 'cooperative',
        location: req.user.location || 'Nigeria',
        status: 'active',
        commissionRate: 0.05
      })
      await partner.save()
    }

    // Get dashboard metrics
    const [
      totalFarmers,
      activeFarmers,
      pendingApprovals,
      monthlyCommission,
      totalCommission
    ] = await Promise.all([
      User.countDocuments({ partner: partner._id, role: 'farmer' }),
      User.countDocuments({ partner: partner._id, role: 'farmer', status: 'active' }),
      // Add logic for pending approvals based on your harvest approval system
      0, // Placeholder
      Commission.aggregate([
        { $match: { partner: partner._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Commission.aggregate([
        { $match: { partner: partner._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ])

    // Calculate approval rate (placeholder logic)
    const approvalRate = 92.5

    // Get recent activity (placeholder)
    const recentActivity = []

    const dashboard = {
      totalFarmers,
      activeFarmers,
      pendingApprovals,
      monthlyCommission: monthlyCommission[0]?.total || 0,
      totalCommission: totalCommission[0]?.total || 0,
      approvalRate,
      recentActivity
    }

    res.json({ status: 'success', data: dashboard })
  } catch (error) {
    console.error('Partner dashboard error:', error)
    res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Get Partner Farmers
exports.getPartnerFarmers = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 20, status, search } = req.query

    // Find partner
    const partner = await Partner.findOne({ email: req.user.email })
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner profile not found' })
    }

    // Build query
    const query = { partner: partner._id, role: 'farmer' }
    if (status) query.status = status
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [farmers, total] = await Promise.all([
      User.find(query)
        .select('name email phone location status createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ])

    // Add computed fields
    const farmersWithStats = farmers.map(farmer => ({
      ...farmer,
      totalHarvests: 0, // Calculate based on your harvest system
      totalSales: 0, // Calculate based on your sales system
      joinedDate: farmer.createdAt
    }))

    res.json({
      status: 'success',
      data: {
        farmers: farmersWithStats,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Partner farmers error:', error)
    res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Get Partner Metrics
exports.getPartnerMetrics = async (req, res) => {
  try {
    const userId = req.user.id

    // Find partner
    const partner = await Partner.findOne({ email: req.user.email })
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner profile not found' })
    }

    // Get metrics
    const [
      totalFarmers,
      activeFarmers,
      inactiveFarmers,
      pendingFarmers,
      totalCommissions,
      monthlyCommissions
    ] = await Promise.all([
      User.countDocuments({ partner: partner._id, role: 'farmer' }),
      User.countDocuments({ partner: partner._id, role: 'farmer', status: 'active' }),
      User.countDocuments({ partner: partner._id, role: 'farmer', status: 'inactive' }),
      User.countDocuments({ partner: partner._id, role: 'farmer', status: 'pending' }),
      Commission.aggregate([
        { $match: { partner: partner._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Commission.aggregate([
        { $match: {
          partner: partner._id,
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }},
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ])

    const metrics = {
      totalFarmers,
      activeFarmers,
      inactiveFarmers,
      pendingFarmers,
      totalCommissions: totalCommissions[0]?.total || 0,
      monthlyCommissions: monthlyCommissions[0]?.total || 0,
      commissionRate: partner.commissionRate,
      approvalRate: 92.5, // Calculate based on your approval system
      conversionRate: 85.2, // Calculate based on your conversion logic
      performanceMetrics: {
        farmersOnboardedThisMonth: 0, // Calculate based on your onboarding system
        commissionsEarnedThisMonth: monthlyCommissions[0]?.total || 0,
        averageCommissionPerFarmer: totalFarmers > 0 ?
          (totalCommissions[0]?.total || 0) / totalFarmers : 0
      }
    }

    res.json({ status: 'success', data: metrics })
  } catch (error) {
    console.error('Partner metrics error:', error)
    res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Get Partner Commission Summary
exports.getPartnerCommission = async (req, res) => {
  try {
    const userId = req.user.id

    // Find partner
    const partner = await Partner.findOne({ email: req.user.email })
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner profile not found' })
    }

    // Get commission data
    const [
      totalEarned,
      pendingAmount,
      paidAmount,
      lastPayout,
      monthlyBreakdown
    ] = await Promise.all([
      Commission.aggregate([
        { $match: { partner: partner._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Commission.aggregate([
        { $match: { partner: partner._id, status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Commission.aggregate([
        { $match: { partner: partner._id, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Commission.findOne({ partner: partner._id, status: 'paid' })
        .sort({ paidAt: -1 })
        .select('paidAt'),
      Commission.aggregate([
        {
          $match: { partner: partner._id }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            amount: { $sum: '$amount' }
          }
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1 }
        },
        {
          $project: {
            month: { $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: {
                if: { $lt: ['$_id.month', 10] },
                then: { $concat: ['0', { $toString: '$_id.month' }] },
                else: { $toString: '$_id.month' }
              }}
            ]},
            amount: 1
          }
        }
      ])
    ])

    const commission = {
      totalEarned: totalEarned[0]?.total || 0,
      commissionRate: partner.commissionRate,
      pendingAmount: pendingAmount[0]?.total || 0,
      paidAmount: paidAmount[0]?.total || 0,
      lastPayout: lastPayout?.paidAt,
      monthlyBreakdown
    }

    res.json({ status: 'success', data: commission })
  } catch (error) {
    console.error('Partner commission error:', error)
    res.status(500).json({ status: 'error', message: 'Server error' })
  }
}
```

#### 2. Update Partner Routes

Add these routes to `backend/routes/partner.routes.js`:

```javascript
// Add these routes before the existing routes
router.get('/dashboard', authenticate, ctrl.getPartnerDashboard)
router.get('/farmers', authenticate, ctrl.getPartnerFarmers)
router.get('/metrics', authenticate, ctrl.getPartnerMetrics)
router.get('/commission', authenticate, ctrl.getPartnerCommission)
```

---

## Step-by-Step Integration Guide

### Phase 1: Backend Implementation (Week 1)

#### Step 1.1: Add Missing Controller Methods
1. Open `backend/controllers/partner.controller.js`
2. Add the four missing methods: `getPartnerDashboard`, `getPartnerFarmers`, `getPartnerMetrics`, `getPartnerCommission`
3. Copy the implementation from the "Missing Endpoints" section above

#### Step 1.2: Update Routes
1. Open `backend/routes/partner.routes.js`
2. Add the new routes before the existing routes
3. Ensure authentication middleware is applied

#### Step 1.3: Test Backend Endpoints
1. Start the backend server: `npm run dev`
2. Test endpoints using Postman or curl:
```bash
# Test dashboard endpoint
curl -X GET "http://localhost:5000/api/partners/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test farmers endpoint
curl -X GET "http://localhost:5000/api/partners/farmers" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test metrics endpoint
curl -X GET "http://localhost:5000/api/partners/metrics" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test commission endpoint
curl -X GET "http://localhost:5000/api/partners/commission" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Phase 2: Frontend Integration (Week 2)

#### Step 2.1: Update API Service
1. Open `client/lib/api.ts`
2. Add the missing partner API methods
3. Copy the implementation from the "Frontend Integration" section

#### Step 2.2: Add TypeScript Types
1. Open `client/lib/types.ts`
2. Add the partner-related TypeScript interfaces
3. Ensure all types are properly exported

#### Step 2.3: Create State Management Store
1. Create `client/hooks/use-partner-store.ts`
2. Implement the Zustand store with all necessary actions
3. Copy the implementation from the "Frontend Integration" section

#### Step 2.4: Update Partners Page
1. Open `client/app/partners/page.tsx`
2. Replace the mock API calls with real ones
3. Update the component to use the new store

#### Step 2.5: Update Bulk Onboard Page
1. Open `client/app/partners/bulk-onboard/page.tsx`
2. Ensure it uses the correct API endpoint
3. Update error handling and success feedback

### Phase 3: Component Integration (Week 3)

#### Step 3.1: Update Partner Dashboard Component
1. Open `client/components/dashboard/partner-dashboard.tsx`
2. Replace mock data with real API calls
3. Implement proper error handling
4. Add loading states

#### Step 3.2: Implement Analytics Components
1. Create `client/components/analytics/partner-analytics.tsx`
2. Implement charts and graphs for partner metrics
3. Add performance tracking components

#### Step 3.3: Add Real-time Updates
1. Implement WebSocket connections for live updates
2. Add notification system for partner activities
3. Update components to handle real-time data

### Phase 4: Testing & Optimization (Week 4)

#### Step 4.1: Unit Testing
1. Create unit tests for API methods
2. Test component rendering with mock data
3. Test state management logic

#### Step 4.2: Integration Testing
1. Test full user flows from onboarding to commission payout
2. Test bulk operations and error scenarios
3. Verify data consistency across frontend and backend

#### Step 4.3: Performance Testing
1. Test with large datasets (1000+ farmers)
2. Optimize database queries
3. Implement caching where necessary

#### Step 4.4: Security Testing
1. Test authentication and authorization
2. Verify data privacy and access controls
3. Test input validation and sanitization

---

## Testing Procedures

### 1. Backend Testing

#### Unit Tests
```javascript
// backend/tests/partner.controller.test.js
const request = require('supertest')
const app = require('../app')
const Partner = require('../models/partner.model')
const User = require('../models/user.model')

describe('Partner Controller', () => {
  let token

  beforeEach(async () => {
    // Setup test data and authentication
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

    // Get authentication token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'partner@test.com',
        password: 'testpassword'
      })

    token = response.body.token
  })

  describe('GET /api/partners/dashboard', () => {
    it('should return partner dashboard data', async () => {
      const response = await request(app)
        .get('/api/partners/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('totalFarmers')
      expect(response.body.data).toHaveProperty('activeFarmers')
      expect(response.body.data).toHaveProperty('monthlyCommission')
    })
  })

  describe('GET /api/partners/farmers', () => {
    it('should return partner farmers list', async () => {
      const response = await request(app)
        .get('/api/partners/farmers')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('farmers')
      expect(Array.isArray(response.body.data.farmers)).toBe(true)
    })
  })

  describe('GET /api/partners/metrics', () => {
    it('should return partner metrics', async () => {
      const response = await request(app)
        .get('/api/partners/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('totalFarmers')
      expect(response.body.data).toHaveProperty('commissionRate')
      expect(response.body.data).toHaveProperty('performanceMetrics')
    })
  })
})
```

#### API Integration Tests
```javascript
// backend/tests/partner.integration.test.js
describe('Partner Integration Tests', () => {
  let partnerToken
  let farmerId

  beforeAll(async () => {
    // Create test partner
    const partnerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Integration Partner',
        email: 'integration@test.com',
        phone: '+2348012345678',
        password: 'testpassword',
        role: 'partner',
        location: 'Lagos'
      })

    partnerToken = partnerResponse.body.token

    // Create test farmer
    const farmerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Farmer',
        email: 'farmer@test.com',
        phone: '+2348087654321',
        password: 'testpassword',
        role: 'farmer',
        location: 'Lagos'
      })

    farmerId = farmerResponse.body.data.user._id
  })

  describe('Complete Partner Flow', () => {
    it('should onboard farmer and track commissions', async () => {
      // 1. Get initial dashboard
      const dashboardResponse = await request(app)
        .get('/api/partners/dashboard')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      const initialFarmers = dashboardResponse.body.data.totalFarmers

      // 2. Onboard farmer
      await request(app)
        .post(`/api/partners/onboard-farmer`)
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({ farmerId })
        .expect(200)

      // 3. Verify farmer appears in list
      const farmersResponse = await request(app)
        .get('/api/partners/farmers')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      expect(farmersResponse.body.data.total).toBe(initialFarmers + 1)

      // 4. Check updated metrics
      const metricsResponse = await request(app)
        .get('/api/partners/metrics')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200)

      expect(metricsResponse.body.data.totalFarmers).toBe(initialFarmers + 1)
    })
  })
})
```

### 2. Frontend Testing

#### Component Tests
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
      expect(screen.getByText('Error loading dashboard')).toBeInTheDocument()
    })
  })
})
```

#### API Service Tests
```typescript
// client/__tests__/lib/api.test.ts
import { api } from '@/lib/api'

describe('API Service - Partner Methods', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn()
  })

  describe('getPartnerDashboard', () => {
    it('makes correct API call', async () => {
      const mockResponse = {
        status: 'success',
        data: { totalFarmers: 150 }
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
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
  })

  describe('getPartnerFarmers', () => {
    it('handles query parameters correctly', async () => {
      const mockResponse = {
        status: 'success',
        data: { farmers: [], total: 0 }
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      })

      await api.getPartnerFarmers({ page: 2, status: 'active' })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/partners/farmers?page=2&status=active',
        expect.any(Object)
      )
    })
  })
})
```

### 3. End-to-End Testing

#### Cypress Tests
```typescript
// client/cypress/e2e/partner-dashboard.cy.ts
describe('Partner Dashboard E2E', () => {
  beforeEach(() => {
    // Login as partner
    cy.login('partner@example.com', 'password123')
    cy.visit('/partners')
  })

  it('displays partner dashboard correctly', () => {
    // Check main metrics
    cy.get('[data-testid="total-farmers"]').should('contain', '150')
    cy.get('[data-testid="active-farmers"]').should('contain', '120')
    cy.get('[data-testid="monthly-commission"]').should('contain', '₦75,000')

    // Check navigation
    cy.get('[data-testid="farmers-tab"]').click()
    cy.url().should('include', '/partners#farmers')

    // Check farmers list
    cy.get('[data-testid="farmers-table"]').should('be.visible')
    cy.get('[data-testid="farmer-row"]').should('have.length.greaterThan', 0)
  })

  it('handles bulk farmer onboarding', () => {
    // Navigate to bulk upload
    cy.get('[data-testid="bulk-upload-btn"]').click()
    cy.url().should('include', '/partners/bulk-onboard')

    // Upload CSV file
    cy.get('[data-testid="csv-upload"]').attachFile('farmers.csv')

    // Check upload progress
    cy.get('[data-testid="upload-btn"]').click()
    cy.get('[data-testid="progress-bar"]').should('be.visible')

    // Check results
    cy.get('[data-testid="success-message"]').should('be.visible')
    cy.get('[data-testid="successful-rows"]').should('contain', '95')
    cy.get('[data-testid="failed-rows"]').should('contain', '5')
  })

  it('displays commission data correctly', () => {
    // Navigate to commissions
    cy.get('[data-testid="commissions-tab"]').click()

    // Check commission summary
    cy.get('[data-testid="total-earned"]').should('contain', '₦285,000')
    cy.get('[data-testid="pending-amount"]').should('contain', '₦15,000')
    cy.get('[data-testid="commission-rate"]').should('contain', '5%')
  })
})
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. API Authentication Errors
**Problem**: `401 Unauthorized` errors when calling partner endpoints

**Solutions**:
- Check if JWT token is properly stored in localStorage
- Verify token hasn't expired
- Ensure user has `partner` role
- Check middleware configuration in routes

#### 2. Missing Partner Profile
**Problem**: Partner endpoints return "Partner profile not found"

**Solutions**:
- Ensure partner profile is created during registration
- Check if partner email matches user email
- Verify partner status is 'active'
- Add automatic partner profile creation in authentication flow

#### 3. Commission Calculation Issues
**Problem**: Commissions not being calculated or displayed

**Solutions**:
- Check if orders are properly linked to farmers and partners
- Verify commission calculation logic in order model hooks
- Ensure commission rates are properly set
- Check database indexes for performance

#### 4. Real-time Updates Not Working
**Problem**: Dashboard not updating in real-time

**Solutions**:
- Check WebSocket server configuration
- Verify client connection to WebSocket endpoint
- Ensure proper event emission from backend
- Check network connectivity and firewall settings

#### 5. Bulk Upload Failures
**Problem**: CSV upload fails or processes incorrectly

**Solutions**:
- Verify CSV format matches expected structure
- Check file size limits (5MB default)
- Validate email uniqueness
- Ensure proper error handling for failed rows
- Check multer configuration for file uploads

#### 6. Performance Issues
**Problem**: Slow loading times with large datasets

**Solutions**:
- Add database indexes on frequently queried fields
- Implement pagination for large datasets
- Add caching layer (Redis)
- Optimize aggregation queries
- Implement lazy loading for components

#### 7. CORS Issues
**Problem**: Frontend can't connect to backend API

**Solutions**:
- Check CORS configuration in backend
- Verify allowed origins include frontend URL
- Check preflight request handling
- Ensure proper headers are set

---

## Deployment Checklist

### Pre-Deployment

#### Backend
- [ ] All missing endpoints implemented and tested
- [ ] Database indexes created for performance
- [ ] Environment variables configured
- [ ] CORS settings updated for production domain
- [ ] Rate limiting configured
- [ ] SSL/TLS certificates installed
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and logging setup
- [ ] Security headers configured

#### Frontend
- [ ] All API calls updated to use production URLs
- [ ] Environment variables configured
- [ ] Build optimization completed
- [ ] Static asset optimization
- [ ] Service worker configured for PWA
- [ ] Error tracking setup (Sentry)
- [ ] Performance monitoring implemented

### Deployment Steps

#### 1. Database Migration
```bash
# Backup existing data
mongodump --db grochain --out backup-$(date +%Y%m%d)

# Run migration scripts if needed
npm run migrate

# Create new indexes
mongo grochain --eval "db.partners.createIndex({email: 1}, {unique: true})"
mongo grochain --eval "db.commissions.createIndex({partner: 1})"
mongo grochain --eval "db.referrals.createIndex({farmer: 1, partner: 1})"
```

#### 2. Backend Deployment
```bash
# Build and deploy backend
npm run build
npm run start:prod

# Verify health check
curl https://api.grochain.com/api/health
```

#### 3. Frontend Deployment
```bash
# Build optimized production bundle
npm run build

# Deploy to CDN/hosting service
# (Specific commands depend on your hosting provider)

# Verify deployment
curl https://grochain.com/partners
```

#### 4. Post-Deployment Testing
- [ ] Test all partner endpoints with production data
- [ ] Verify bulk upload functionality
- [ ] Test commission calculations
- [ ] Check real-time updates
- [ ] Validate responsive design
- [ ] Test on multiple browsers and devices

### Rollback Plan
1. **Database Rollback**:
   ```bash
   mongorestore backup-$(date +%Y%m%d)/grochain
   ```

2. **Application Rollback**:
   - Deploy previous version from backup
   - Update load balancer to route to previous version
   - Monitor error rates and performance

3. **Frontend Rollback**:
   - Deploy previous build from backup
   - Clear CDN cache if necessary
   - Verify all routes work correctly

---

## Performance Optimization

### Backend Optimizations

#### 1. Database Indexing
```javascript
// Create indexes for better query performance
db.partners.createIndex({ email: 1 }, { unique: true })
db.partners.createIndex({ status: 1 })
db.partners.createIndex({ type: 1 })

db.commissions.createIndex({ partner: 1 })
db.commissions.createIndex({ farmer: 1 })
db.commissions.createIndex({ status: 1 })
db.commissions.createIndex({ createdAt: -1 })

db.referrals.createIndex({ farmer: 1, partner: 1 }, { unique: true })
db.referrals.createIndex({ status: 1 })
db.referrals.createIndex({ expiresAt: 1 })

db.users.createIndex({ partner: 1 })
db.users.createIndex({ role: 1, status: 1 })
```

#### 2. Query Optimization
```javascript
// Use aggregation pipelines efficiently
const dashboardAggregation = [
  { $match: { partner: partnerId } },
  { $group: { _id: null, total: { $sum: '$amount' } } },
  { $project: { _id: 0, total: 1 } }
]

// Use lean queries for read-only operations
const farmers = await User.find(query)
  .select('name email phone location status')
  .lean()
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
```

#### 3. Caching Strategy
```javascript
// Implement Redis caching for frequently accessed data
const cache = require('redis').createClient()

// Cache partner metrics for 5 minutes
app.get('/api/partners/metrics', async (req, res) => {
  const cacheKey = `partner_metrics_${req.user.id}`

  const cachedData = await cache.get(cacheKey)
  if (cachedData) {
    return res.json(JSON.parse(cachedData))
  }

  // Calculate metrics
  const metrics = await calculatePartnerMetrics(req.user.id)

  // Cache for 5 minutes
  await cache.set(cacheKey, JSON.stringify(metrics), 'EX', 300)

  res.json(metrics)
})
```

### Frontend Optimizations

#### 1. Code Splitting
```typescript
// Lazy load partner components
const PartnerDashboard = lazy(() => import('@/components/dashboard/partner-dashboard'))
const BulkOnboard = lazy(() => import('@/app/partners/bulk-onboard/page'))

// Use in routes
<Route path="/partners" element={
  <Suspense fallback={<LoadingSpinner />}>
    <PartnerDashboard />
  </Suspense>
} />
```

#### 2. Data Fetching Optimization
```typescript
// Use React Query for caching and background updates
import { useQuery } from '@tanstack/react-query'

const usePartnerDashboard = () => {
  return useQuery({
    queryKey: ['partner-dashboard'],
    queryFn: api.getPartnerDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  })
}
```

#### 3. Virtualization for Large Lists
```typescript
// Use react-window for large farmer lists
import { FixedSizeList as List } from 'react-window'

const FarmerList = ({ farmers }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <FarmerCard farmer={farmers[index]} />
    </div>
  )

  return (
    <List
      height={400}
      itemCount={farmers.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

### Monitoring & Alerting

#### 1. Performance Monitoring
```typescript
// Add performance monitoring
import { datadogRum } from '@datadog/browser-rum'

datadogRum.init({
  applicationId: 'your-app-id',
  clientToken: 'your-client-token',
  site: 'datadoghq.com',
  service: 'grochain-partners',
  env: 'production',
  version: '1.0.0',
  sampleRate: 100,
  trackInteractions: true,
})
```

#### 2. Error Tracking
```typescript
// Add Sentry for error tracking
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

---

## Conclusion

This comprehensive integration guide provides everything needed to successfully implement the Partners Dashboard in GroChain. The modular approach ensures:

1. **Scalable Architecture**: Clean separation between frontend and backend
2. **Comprehensive Testing**: Unit, integration, and E2E test coverage
3. **Performance Optimization**: Caching, indexing, and code splitting
4. **Security Best Practices**: Authentication, authorization, and data validation
5. **Monitoring & Alerting**: Real-time performance and error tracking
6. **Deployment Readiness**: Complete checklist and rollback procedures

**Key Success Metrics:**
- ✅ All missing endpoints implemented and tested
- ✅ Frontend components fully integrated with backend APIs
- ✅ Comprehensive test coverage (unit, integration, E2E)
- ✅ Performance optimized for 1000+ farmers per partner
- ✅ Real-time updates working correctly
- ✅ Security measures implemented and tested

**Next Steps:**
1. Start with Phase 1 backend implementation
2. Gradually integrate frontend components
3. Conduct thorough testing at each phase
4. Deploy with proper monitoring in place
5. Monitor performance and user feedback post-deployment

This guide serves as a complete roadmap for a production-ready partner management system that can scale with GroChain's growth while maintaining excellent user experience and system reliability.
