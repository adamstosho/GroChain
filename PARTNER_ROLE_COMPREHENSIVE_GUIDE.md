# GroChain Partner Role - Comprehensive Development Guide

## Table of Contents
1. [Overview](#overview)
2. [Partner User Journey](#partner-user-journey)
3. [Frontend Pages & Components](#frontend-pages--components)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Database Models & Relationships](#database-models--relationships)
6. [Integration Guide](#integration-guide)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Checklist](#deployment-checklist)

## Overview

The Partner role in GroChain represents agricultural organizations that facilitate farmer onboarding, provide extension services, and earn commissions from marketplace transactions. Partners include:

- **Agricultural Extension Agencies** (ADP, FADAMA)
- **Cooperatives & Farmer-Based Organizations**
- **NGOs & Development Programs** (USAID, FAO)
- **Market Associations & Aggregators**

Partners earn referral fees per active farmer transaction (₦100 per farmer), receive performance dashboards with weekly scorecards, get milestone-driven discounts on advanced analytics, and participate in a joint steering committee for governance.

## Partner User Journey

### 1. Onboarding Flow
```
Registration → Profile Setup → Organization Verification → First Farmer Onboarding → Regular Operations
```

### 2. Daily Operations
```
Dashboard Review → Farmer Management → Bulk Onboarding → Performance Monitoring → Commission Tracking
```

### 3. Monthly Activities
```
Performance Review → Commission Payouts → Farmer Training → Partnership Meetings → Analytics Review
```

## Frontend Pages & Components

### 1. Main Dashboard (`/dashboard`)
**File**: `client/app/dashboard/page.tsx`

**Components**:
- `PartnerDashboard` - Main dashboard component
- `StatsCard` - Key metrics display
- `FarmerOverview` - Farmer count and status
- `CommissionSummary` - Earnings and payout status
- `RecentActivity` - Latest activities
- `QuickActions` - Common partner actions

**Features**:
- Total farmers count
- Commission earnings summary
- Recent farmer onboarding
- Performance metrics
- Quick action buttons

**Key Metrics Displayed**:
```typescript
interface PartnerDashboardStats {
  totalFarmers: number;
  totalCommissions: number;
  commissionRate: number;
  activeReferrals: number;
  pendingPayouts: number;
  monthlyGrowth: number;
}
```

### 2. Farmer Management (`/dashboard/farmers`)
**File**: `client/app/dashboard/farmers/page.tsx`

**Sub-pages**:
- **All Farmers** (`/dashboard/farmers`) - Farmer list and management
- **Farmer Details** (`/dashboard/farmers/[id]`) - Individual farmer view
- **Bulk Onboarding** (`/dashboard/farmers/bulk`) - CSV upload and processing
- **Farmer Analytics** (`/dashboard/farmers/analytics`) - Performance metrics

**Components**:
- `FarmerList` - Paginated farmer list
- `FarmerCard` - Individual farmer display
- `BulkUploadForm` - CSV upload interface
- `FarmerAnalytics` - Performance charts
- `FarmerActions` - Add, edit, remove farmers

**Farmer Data Structure**:
```typescript
interface Farmer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: Date;
  lastActivity: Date;
  totalHarvests: number;
  totalEarnings: number;
  partner: string;
}
```

### 3. Commission Management (`/dashboard/commissions`)
**File**: `client/app/dashboard/commissions/page.tsx`

**Sub-pages**:
- **Commission Overview** (`/dashboard/commissions`) - Earnings summary
- **Transaction History** (`/dashboard/commissions/history`) - Detailed records
- **Payout Requests** (`/dashboard/commissions/payouts`) - Withdrawal management
- **Analytics** (`/dashboard/commissions/analytics`) - Performance metrics

**Components**:
- `CommissionSummary` - Earnings overview
- `TransactionList` - Commission history
- `PayoutForm` - Withdrawal requests
- `CommissionCharts` - Performance visualization
- `PayoutHistory` - Previous payouts

**Commission Data Structure**:
```typescript
interface Commission {
  id: string;
  farmer: string;
  order: string;
  amount: number;
  rate: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  orderAmount: number;
  orderDate: Date;
  paidAt?: Date;
  withdrawalId?: string;
}

interface CommissionSummary {
  totalEarned: number;
  commissionRate: number;
  pendingAmount: number;
  paidAmount: number;
  lastPayout?: Date;
  monthlyEarnings: number[];
}
```

### 4. Referral Management (`/dashboard/referrals`)
**File**: `client/app/dashboard/referrals/page.tsx`

**Features**:
- Track referral performance
- Generate referral codes
- Monitor conversion rates
- Communication history

**Components**:
- `ReferralList` - Referral tracking
- `ReferralCodeGenerator` - Code creation
- `PerformanceMetrics` - Conversion tracking
- `CommunicationLog` - Interaction history

### 5. Analytics & Reports (`/dashboard/analytics`)
**File**: `client/app/dashboard/analytics/page.tsx`

**Features**:
- Farmer performance analysis
- Commission trends
- Geographic distribution
- Growth metrics

**Components**:
- `PerformanceCharts` - Data visualization
- `GeographicMap` - Location-based insights
- `GrowthMetrics` - Trend analysis
- `CustomReports` - Report generation

### 6. Profile & Settings (`/dashboard/profile`, `/dashboard/settings`)
**Files**: 
- `client/app/dashboard/profile/page.tsx`
- `client/app/dashboard/settings/page.tsx`

**Profile Features**:
- Organization information
- Contact details
- Commission rates
- Verification status

**Settings Features**:
- Notification preferences
- Communication settings
- Data export options
- Security settings

## Backend API Endpoints

### 1. Authentication & User Management

#### User Registration & Login
```http
POST /api/auth/register
Content-Type: application/json
```
**Request Body**:
```json
{
  "name": "John Partner",
  "email": "partner@example.com",
  "phone": "+2348012345678",
  "password": "securePassword123",
  "role": "partner",
  "region": "Lagos"
}
```

```http
POST /api/auth/login
Content-Type: application/json
```
**Request Body**:
```json
{
  "email": "partner@example.com",
  "password": "securePassword123"
}
```

```http
POST /api/auth/verify-email
Content-Type: application/json
```
**Request Body**:
```json
{
  "email": "partner@example.com",
  "verificationCode": "123456"
}
```

```http
POST /api/auth/forgot-password
Content-Type: application/json
```
**Request Body**:
```json
{
  "email": "partner@example.com"
}
```

```http
POST /api/auth/reset-password
Content-Type: application/json
```
**Request Body**:
```json
{
  "token": "reset_token_here",
  "newPassword": "newSecurePassword123"
}
```

#### SMS OTP Authentication
```http
POST /api/auth/send-sms-otp
Content-Type: application/json
```
**Request Body**:
```json
{
  "phone": "+2348012345678"
}
```

```http
POST /api/auth/verify-sms-otp
Content-Type: application/json
```
**Request Body**:
```json
{
  "phone": "+2348012345678",
  "otp": "123456"
}
```

### 2. Partner Profile Management

#### Get My Profile
```http
GET /api/users/profile/me
Authorization: Bearer <token>
```

#### Update My Profile
```http
PUT /api/users/profile/me
Authorization: Bearer <token>
Content-Type: application/json
```

#### Upload Avatar
```http
POST /api/users/upload-avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Form Data**:
- `avatar`: File (image)

#### Get User Preferences
```http
GET /api/users/preferences/me
Authorization: Bearer <token>
```

#### Update User Preferences
```http
PUT /api/users/preferences/me
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get User Settings
```http
GET /api/users/settings/me
Authorization: Bearer <token>
```

#### Update User Settings
```http
PUT /api/users/settings/me
Authorization: Bearer <token>
Content-Type: application/json
```

#### Change Password
```http
POST /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json
```

### 3. Partner Operations

#### Get Partner Dashboard
```http
GET /api/partners/dashboard
Authorization: Bearer <token>
```
**Response**:
```json
{
  "status": "success",
  "data": {
    "totalFarmers": 150,
    "totalCommissions": 75000,
    "commissionRate": 0.05,
    "status": "active",
    "joinedAt": "2024-01-15T00:00:00.000Z",
    "recentActivity": []
  }
}
```

#### Get Partner Farmers
```http
GET /api/partners/farmers
Authorization: Bearer <token>
```
**Response**:
```json
{
  "status": "success",
  "data": {
    "farmers": [
      {
        "_id": "farmer_id",
        "name": "Farmer Name",
        "email": "farmer@example.com",
        "phone": "+2348012345678",
        "location": "Lagos",
        "createdAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "total": 150
  }
}
```

#### Get Partner Commission
```http
GET /api/partners/commission
Authorization: Bearer <token>
```
**Response**:
```json
{
  "status": "success",
  "data": {
    "totalEarned": 75000,
    "commissionRate": 0.05,
    "pendingAmount": 15000,
    "paidAmount": 60000,
    "lastPayout": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Partner Management

#### Get All Partners
```http
GET /api/partners?page=1&limit=10&status=active&type=cooperative&search=organization
```

#### Get Partner by ID
```http
GET /api/partners/:id
```

#### Create Partner
```http
POST /api/partners
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "name": "Partner Organization",
  "email": "partner@org.com",
  "phone": "+2348012345678",
  "organization": "Agricultural Cooperative",
  "type": "cooperative",
  "location": "Lagos",
  "address": "123 Partner Street",
  "description": "Leading agricultural cooperative",
  "website": "https://partner.org",
  "commissionRate": 0.05
}
```

#### Update Partner
```http
PUT /api/partners/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Partner
```http
DELETE /api/partners/:id
Authorization: Bearer <token>
```

#### Get Partner Metrics
```http
GET /api/partners/:id/metrics
Authorization: Bearer <token>
```

### 5. Farmer Onboarding

#### Upload CSV for Bulk Onboarding
```http
POST /api/partners/upload-csv
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Form Data**:
- `file`: File (CSV)

**CSV Format**:
```csv
name,email,phone,location
John Farmer,john@farmer.com,+2348012345678,Lagos
Jane Farmer,jane@farmer.com,+2348012345679,Abuja
```

#### Onboard Individual Farmer
```http
POST /api/partners/onboard-farmer
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "farmerId": "farmer_user_id"
}
```

#### Bulk Onboard Farmers
```http
POST /api/partners/bulk-onboard
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "farmerIds": ["farmer_id_1", "farmer_id_2", "farmer_id_3"]
}
```

### 6. Referral Management

#### Get Referrals
```http
GET /api/referrals
Authorization: Bearer <token>
```

#### Create Referral
```http
POST /api/referrals
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "farmer": "farmer_id",
  "referralCode": "REF123456",
  "notes": "Farmer referred through extension program"
}
```

#### Get Referral by ID
```http
GET /api/referrals/:id
Authorization: Bearer <token>
```

#### Update Referral
```http
PUT /api/referrals/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Referral Statistics
```http
GET /api/referrals/stats/overview
Authorization: Bearer <token>
```

#### Get Performance Statistics
```http
GET /api/referrals/stats/performance
Authorization: Bearer <token>
```

### 7. Commission Management

#### Get Pending Commissions
```http
GET /api/referrals/commissions/pending
Authorization: Bearer <token>
```

#### Get Paid Commissions
```http
GET /api/referrals/commissions/paid
Authorization: Bearer <token>
```

### 8. Analytics & Reporting

#### Get Dashboard Metrics
```http
GET /api/analytics/dashboard
```

#### Get Partner Analytics
```http
GET /api/analytics/partners/:partnerId
Authorization: Bearer <token>
```

#### Generate Report
```http
POST /api/analytics/report
Authorization: Bearer <token>
Content-Type: application/json
```

### 9. Notifications

#### Get User Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

#### Send Notification
```http
POST /api/notifications/send
Authorization: Bearer <token>
Content-Type: application/json
```

#### Send Bulk Notifications
```http
POST /api/notifications/send-bulk
Authorization: Bearer <token>
Content-Type: application/json
```

#### Mark Notification as Read
```http
PATCH /api/notifications/:notificationId/read
Authorization: Bearer <token>
```

#### Mark All Notifications as Read
```http
PATCH /api/notifications/mark-all-read
Authorization: Bearer <token>
```

#### Get Notification Preferences
```http
GET /api/notifications/preferences
Authorization: Bearer <token>
```

#### Update Notification Preferences
```http
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json
```

#### Update Push Token
```http
PUT /api/notifications/push-token
Authorization: Bearer <token>
Content-Type: application/json
```

### 10. Data Export & Import

#### Export Custom Data
```http
POST /api/export-import/export/custom
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "dataType": "farmers",
  "format": "csv",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "filters": {
    "status": ["active"],
    "location": ["Lagos", "Abuja"]
  }
}
```

#### Get Supported Formats
```http
GET /api/export-import/formats
```

#### Get Export Templates
```http
GET /api/export-import/templates
```

#### Validate Export Template
```http
POST /api/export-import/validate-template
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Export Statistics
```http
GET /api/export-import/stats
Authorization: Bearer <token>
```

#### Download Export
```http
GET /api/export-import/download/:filename
Authorization: Bearer <token>
```

### 11. Weather Information

#### Get Weather Data
```http
GET /api/weather
```

### 12. Health & System

#### Health Check
```http
GET /api/health
```

#### Metrics
```http
GET /metrics
```

### 13. Test Routes

#### Partner Test Routes
```http
GET /api/partners/ping
```

```http
GET /api/partners/simple-test
```

```http
GET /api/partners/auth-test
Authorization: Bearer <token>
```

```http
GET /api/partners/test
Authorization: Bearer <token>
```

## Database Models & Relationships

### 1. Partner Model
```javascript
// models/partner.model.js
const PartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  organization: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['cooperative', 'extension_agency', 'ngo', 'aggregator'], 
    required: true 
  },
  location: { type: String, required: true },
  address: { type: String },
  description: { type: String },
  website: { type: String },
  logo: { type: String },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  },
  commissionRate: { type: Number, default: 0.05, min: 0, max: 1 },
  farmers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalFarmers: { type: Number, default: 0 },
  totalCommissions: { type: Number, default: 0 },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  suspensionReason: { type: String },
  suspendedAt: { type: Date },
  suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### 2. Commission Model
```javascript
// models/commission.model.js
const CommissionSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  amount: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0, max: 1 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'paid', 'cancelled'], 
    default: 'pending' 
  },
  orderAmount: { type: Number, required: true },
  orderDate: { type: Date, required: true },
  paidAt: { type: Date },
  withdrawalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  notes: { type: String },
  metadata: { type: Object }
}, { timestamps: true });
```

### 3. Referral Model
```javascript
// models/referral.model.js
const referralSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'cancelled', 'expired'], 
    default: 'pending' 
  },
  referralCode: { type: String, required: true },
  referralDate: { type: Date, default: Date.now },
  activationDate: Date,
  completionDate: Date,
  commissionRate: { type: Number, min: 0, max: 1, default: 0.05 },
  commission: { type: Number, min: 0, default: 0 },
  commissionStatus: { 
    type: String, 
    enum: ['pending', 'calculated', 'paid', 'cancelled'], 
    default: 'pending' 
  },
  commissionPaidAt: Date,
  performanceMetrics: {
    totalTransactions: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    customerRetention: { type: Number, default: 0, min: 0, max: 100 }
  },
  notes: { type: String, maxlength: 500 },
  communicationHistory: [{
    type: { type: String, enum: ['sms', 'email', 'call', 'visit', 'other'] },
    date: { type: Date, default: Date.now },
    summary: String,
    outcome: String
  }],
  followUpRequired: { type: Boolean, default: false },
  followUpDate: Date,
  followUpNotes: String,
  expiresAt: { type: Date },
  isRenewable: { type: Boolean, default: true }
}, { timestamps: true });
```

### 4. User Model (Partner Role)
```javascript
// models/user.model.js - Partner specific fields
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'buyer', 'partner', 'admin'], default: 'farmer' },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  region: { type: String, required: true },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
  createdAt: { type: Date, default: Date.now }
});
```

## Integration Guide

### 1. Frontend-Backend Integration

#### API Service Setup
```typescript
// lib/api.ts - Partner-specific methods
class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Partner Dashboard
  async getPartnerDashboard() {
    return this.request('/partners/dashboard');
  }

  async getPartnerFarmers() {
    return this.request('/partners/farmers');
  }

  async getPartnerCommission() {
    return this.request('/partners/commission');
  }

  // CSV Upload
  async uploadCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/partners/upload-csv', {
      method: 'POST',
      body: formData,
    });
  }

  // Referrals (CORRECTED - these are in /referrals, not /partners)
  async getReferrals() {
    return this.request('/referrals');
  }

  async createReferral(referralData: any) {
    return this.request('/referrals', {
      method: 'POST',
      body: JSON.stringify(referralData),
    });
  }

  async getReferralStats() {
    return this.request('/referrals/stats/overview');
  }

  async getPerformanceStats() {
    return this.request('/referrals/stats/performance');
  }

  // Commissions (CORRECTED - these are in /referrals/commissions)
  async getPendingCommissions() {
    return this.request('/referrals/commissions/pending');
  }

  async getPaidCommissions() {
    return this.request('/referrals/commissions/paid');
  }

  // Partner Management
  async getAllPartners(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/partners?${queryString}`);
  }

  async getPartnerById(partnerId: string) {
    return this.request(`/partners/${partnerId}`);
  }

  async createPartner(partnerData: any) {
    return this.request('/partners', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    });
  }

  async updatePartner(partnerId: string, partnerData: any) {
    return this.request(`/partners/${partnerId}`, {
      method: 'PUT',
      body: JSON.stringify(partnerData),
    });
  }

  async deletePartner(partnerId: string) {
    return this.request(`/partners/${partnerId}`, {
      method: 'DELETE',
    });
  }

  async getPartnerMetrics(partnerId: string) {
    return this.request(`/partners/${partnerId}/metrics`);
  }

  // User Profile Management
  async getUserProfile() {
    return this.request('/users/profile/me');
  }

  async updateUserProfile(data: any) {
    return this.request('/users/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(avatar: File) {
    const formData = new FormData();
    formData.append('avatar', avatar);
    
    return this.request('/users/upload-avatar', {
      method: 'POST',
      body: formData,
    });
  }

  async getUserPreferences() {
    return this.request('/users/preferences/me');
  }

  async updateUserPreferences(data: any) {
    return this.request('/users/preferences/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserSettings() {
    return this.request('/users/settings/me');
  }

  async updateUserSettings(data: any) {
    return this.request('/users/settings/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: any) {
    return this.request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getNotifications(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notifications?${queryString}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  async getNotificationPreferences() {
    return this.request('/notifications/preferences');
  }

  async updateNotificationPreferences(preferences: any) {
    return this.request('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify({ notifications: preferences }),
    });
  }

  async updatePushToken(token: string) {
    return this.request('/notifications/push-token', {
      method: 'PUT',
      body: JSON.stringify({ token }),
    });
  }

  // Data Export
  async exportCustomData(exportData: any) {
    return this.request('/export-import/export/custom', {
      method: 'POST',
      body: JSON.stringify(exportData),
    });
  }

  async getExportFormats() {
    return this.request('/export-import/formats');
  }

  async getExportTemplates() {
    return this.request('/export-import/templates');
  }

  async validateExportTemplate(template: any) {
    return this.request('/export-import/validate-template', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async getExportStats() {
    return this.request('/export-import/stats');
  }

  async downloadExport(filename: string) {
    return this.request(`/export-import/download/${filename}`);
  }

  // Weather
  async getWeatherData() {
    return this.request('/weather');
  }

  // Health Check
  async getHealthCheck() {
    return this.request('/health');
  }

  async getMetrics() {
    return this.request('/metrics');
  }
}

export const apiService = new ApiService();
```

#### State Management
```typescript
// hooks/use-partner-store.ts
import { create } from 'zustand';

interface PartnerState {
  profile: any;
  farmers: any[];
  commissions: any[];
  referrals: any[];
  dashboard: any;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDashboard: () => Promise<void>;
  fetchFarmers: () => Promise<void>;
  fetchCommissions: () => Promise<void>;
  fetchReferrals: () => Promise<void>;
  uploadCSV: (file: File) => Promise<void>;
  createReferral: (referralData: any) => Promise<void>;
  updatePartnerProfile: (data: any) => Promise<void>;
}

export const usePartnerStore = create<PartnerState>((set, get) => ({
  profile: null,
  farmers: [],
  commissions: [],
  referrals: [],
  dashboard: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getPartnerDashboard();
      set({ dashboard: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchFarmers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getPartnerFarmers();
      set({ farmers: response.data.farmers, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchCommissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getPendingCommissions();
      set({ commissions: response.data.commissions, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchReferrals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getReferrals();
      set({ referrals: response.data.referrals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  uploadCSV: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.uploadCSV(file);
      await get().fetchFarmers(); // Refresh farmers list
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createReferral: async (referralData: any) => {
    try {
      await apiService.createReferral(referralData);
      await get().fetchReferrals(); // Refresh referrals list
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updatePartnerProfile: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.updateUserProfile(data);
      set({ profile: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
```

### 2. Real-time Updates

#### WebSocket Integration for Commission Updates
```typescript
// hooks/use-commission-updates.ts
import { useEffect, useRef } from 'react';
import { usePartnerStore } from './use-partner-store';

export const useCommissionUpdates = () => {
  const ws = useRef<WebSocket | null>(null);
  const { commissions, updateCommissionStatus } = usePartnerStore();

  useEffect(() => {
    ws.current = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000');

    ws.current.onopen = () => {
      console.log('WebSocket connected for commission updates');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'commission_update') {
        updateCommissionStatus(data.commissionId, data.status, data.updates);
      } else if (data.type === 'farmer_onboarded') {
        // Handle new farmer onboarding
        console.log('New farmer onboarded:', data.farmer);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [updateCommissionStatus]);

  const subscribeToCommissions = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'subscribe_commissions'
      }));
    }
  };

  return { subscribeToCommissions };
};
```

### 3. CSV Upload Handler

#### CSV Processing Service
```typescript
// lib/csv-service.ts
export class CSVService {
  static parseCSV(content: string): any[] {
    const lines = content.split(/\r?\n/).filter(Boolean);
    const header = lines.shift()?.split(',') || [];
    
    return lines.map(line => {
      const values = line.split(',');
      const row: any = {};
      
      header.forEach((key, index) => {
        row[key.trim()] = values[index]?.trim() || '';
      });
      
      return row;
    });
  }

  static validateFarmerData(data: any[]): { valid: any[], errors: string[] } {
    const valid: any[] = [];
    const errors: string[] = [];

    data.forEach((row, index) => {
      if (!row.email) {
        errors.push(`Row ${index + 1}: Email is required`);
        return;
      }

      if (!row.name) {
        errors.push(`Row ${index + 1}: Name is required`);
        return;
      }

      if (!row.phone) {
        errors.push(`Row ${index + 1}: Phone is required`);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push(`Row ${index + 1}: Invalid email format`);
        return;
      }

      valid.push(row);
    });

    return { valid, errors };
  }

  static generateCSVTemplate(): string {
    return 'name,email,phone,location\nJohn Farmer,john@farmer.com,+2348012345678,Lagos\nJane Farmer,jane@farmer.com,+2348012345679,Abuja';
  }

  static downloadCSV(data: any[], filename: string): void {
    const csvContent = this.arrayToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private static arrayToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }
}
```

## Testing Strategy

### 1. Unit Testing
```typescript
// __tests__/components/partner-dashboard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PartnerDashboard } from '@/components/dashboard/partner-dashboard';

describe('PartnerDashboard', () => {
  it('renders dashboard with partner stats', () => {
    render(<PartnerDashboard />);
    
    expect(screen.getByText('Total Farmers')).toBeInTheDocument();
    expect(screen.getByText('Total Commissions')).toBeInTheDocument();
    expect(screen.getByText('Commission Rate')).toBeInTheDocument();
  });

  it('shows quick action buttons', () => {
    render(<PartnerDashboard />);
    
    expect(screen.getByText('Manage Farmers')).toBeInTheDocument();
    expect(screen.getByText('View Commissions')).toBeInTheDocument();
    expect(screen.getByText('Bulk Onboarding')).toBeInTheDocument();
  });
});
```

### 2. Integration Testing
```typescript
// __tests__/api/partner-api.test.ts
import { apiService } from '@/lib/api';

describe('Partner API Integration', () => {
  it('fetches partner dashboard successfully', async () => {
    const mockDashboard = {
      totalFarmers: 150,
      totalCommissions: 75000,
      commissionRate: 0.05
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', data: mockDashboard })
    });

    const result = await apiService.getPartnerDashboard();
    expect(result.data).toEqual(mockDashboard);
  });
});
```

### 3. E2E Testing
```typescript
// cypress/e2e/partner-dashboard.cy.ts
describe('Partner Dashboard E2E', () => {
  beforeEach(() => {
    cy.login('partner@example.com', 'password123');
    cy.visit('/dashboard');
  });

  it('displays partner dashboard with metrics', () => {
    cy.get('[data-testid="total-farmers"]').should('contain', '150');
    cy.get('[data-testid="total-commissions"]').should('contain', '₦75,000');
    cy.get('[data-testid="commission-rate"]').should('contain', '5%');
  });

  it('navigates to farmer management', () => {
    cy.get('[data-testid="manage-farmers-btn"]').click();
    cy.url().should('include', '/dashboard/farmers');
    cy.get('[data-testid="farmer-list"]').should('be.visible');
  });

  it('uploads CSV for bulk onboarding', () => {
    cy.visit('/dashboard/farmers/bulk');
    cy.get('[data-testid="csv-upload"]').attachFile('farmers.csv');
    cy.get('[data-testid="upload-btn"]').click();
    cy.get('[data-testid="success-message"]').should('contain', 'Farmers onboarded successfully');
  });
});
```

## Deployment Checklist

### 1. Frontend Deployment
- [ ] Build optimization for production
- [ ] Environment variables configuration
- [ ] CDN setup for static assets
- [ ] Service worker registration
- [ ] PWA manifest configuration
- [ ] Error tracking setup (Sentry)
- [ ] Performance monitoring

### 2. Backend Deployment
- [ ] Database connection optimization
- [ ] API rate limiting configuration
- [ ] CORS settings for production
- [ ] SSL/TLS certificate setup
- [ ] Load balancer configuration
- [ ] Monitoring and logging setup
- [ ] Backup and recovery procedures

### 3. Security Measures
- [ ] JWT token validation
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Data encryption at rest

### 4. Performance Optimization
- [ ] Database indexing
- [ ] API response caching
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Bundle size optimization

## Conclusion

This comprehensive guide provides everything needed to build a complete partner role system for GroChain. The modular approach allows for incremental development and testing, while the comprehensive API design ensures scalability and maintainability.

Key success factors:
1. **User Experience**: Intuitive interface for partners with varying tech literacy
2. **Performance**: Fast loading times even on slow internet connections
3. **Reliability**: Robust error handling and commission processing
4. **Security**: Comprehensive data protection and financial security
5. **Scalability**: Architecture that can handle growing partner base

The system is designed to be partner-centric, providing tools and insights that directly improve farmer onboarding efficiency and commission earnings.

## Additional Resources

- [WebSocket Implementation Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress E2E Testing](https://docs.cypress.io/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Aggregation](https://docs.mongodb.com/manual/aggregation/)

## Implementation Notes & Corrections

### ✅ **What's Correctly Aligned with Backend:**
- Partner dashboard, farmers, and commission endpoints
- CSV upload for bulk onboarding
- Basic partner CRUD operations
- Database models and relationships
- Frontend component structure

### ❌ **What Needs Backend Implementation:**
- Commission payout processing endpoints
- Analytics dashboard endpoints
- Data export functionality endpoints

### 🔧 **Endpoint Corrections Made:**
- Referral endpoints correctly point to `/api/referrals/*`
- Commission endpoints correctly point to `/api/referrals/commissions/*`
- Removed non-existent endpoints that weren't in backend

### 📋 **Missing Backend Features to Implement:**

#### 1. Commission Payout Processing
```javascript
// Add to backend/routes/commission.routes.js
router.post('/payout', authenticate, commissionController.processCommissionPayout);
```

#### 2. Analytics Dashboard
```javascript
// Add to backend/routes/analytics.routes.js
router.get('/dashboard', authenticate, analyticsController.getDashboardMetrics);
router.post('/report', authenticate, analyticsController.generateReport);
```

#### 3. Data Export System
```javascript
// Add to backend/routes/exportImport.routes.js
router.post('/export/custom', authenticate, exportImportController.exportCustomData);
```

### 🚀 **Next Steps for Complete Implementation:**

1. **Backend Development:**
   - Implement missing commission payout logic
   - Create analytics dashboard endpoints
   - Build data export system
   - Add WebSocket support for real-time updates

2. **Frontend Development:**
   - Build partner dashboard components
   - Implement CSV upload functionality
   - Create commission management interface
   - Build referral tracking system

3. **Testing:**
   - Unit tests for all components
   - Integration tests for API endpoints
   - E2E tests for complete user flows

4. **Deployment:**
   - Frontend build optimization
   - Backend production configuration
   - Database optimization and indexing
   - Security hardening

### 📊 **Performance Considerations:**

- **Database Indexing:** Ensure proper indexes on partner, farmer, and commission fields
- **API Caching:** Implement Redis caching for frequently accessed data
- **File Uploads:** Use streaming for large CSV files
- **Real-time Updates:** Implement efficient WebSocket connections

### 🔒 **Security Considerations:**

- **Input Validation:** Sanitize all CSV uploads and form inputs
- **Rate Limiting:** Prevent abuse of onboarding endpoints
- **Data Encryption:** Encrypt sensitive partner and financial data
- **Access Control:** Ensure partners can only access their own data

This guide now provides a complete, backend-aligned roadmap for implementing the Partner role system in GroChain.

 
 