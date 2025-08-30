# GroChain Farmer Role - Comprehensive Development Guide

## Table of Contents
1. [Overview](#overview)
2. [Farmer User Journey](#farmer-user-journey)
3. [Frontend Pages & Components](#frontend-pages--components)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Database Models & Relationships](#database-models--relationships)
6. [Integration Guide](#integration-guide)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Checklist](#deployment-checklist)

## Overview

The Farmer role in GroChain represents smallholder farmers who use the platform to:
- Register and manage their profiles
- Log harvests and track shipments
- List products on the marketplace
- Access financial services and credit
- Monitor analytics and performance
- Generate and manage QR codes for provenance

## Farmer User Journey

### 1. Onboarding Flow
```
Registration → Profile Setup → Training → First Harvest → Marketplace Access
```

### 2. Daily Operations
```
Dashboard Check → Harvest Management → Marketplace Updates → Financial Monitoring
```

### 3. Monthly Activities
```
Performance Review → Credit Assessment → Insurance Renewal → Analytics Review
```

## Frontend Pages & Components

### 1. Main Dashboard (`/dashboard`)
**File**: `client/app/dashboard/page.tsx`

**Components**:
- `FarmerDashboard` - Main dashboard component
- `StatsCard` - Key metrics display
- `RecentActivity` - Latest activities
- `WeatherWidget` - Local weather information
- `QuickActions` - Common actions

**Features**:
- Total harvests count
- Earnings summary
- Pending harvests
- Recent activity feed
- Weather forecast
- Quick action buttons

**Key Metrics Displayed**:
```typescript
interface DashboardStats {
  totalHarvests: number;
  totalEarnings: number;
  pendingHarvests: number;
  activeListings: number;
  creditScore: number;
  lastHarvestDate: Date;
}
```

### 2. Harvest Management (`/dashboard/harvests`)
**File**: `client/app/dashboard/harvests/page.tsx`

**Sub-pages**:
- **List View** (`/dashboard/harvests`) - All harvests with filtering
- **New Harvest** (`/dashboard/harvests/new`) - Create new harvest
- **Harvest Details** (`/dashboard/harvests/[id]`) - Individual harvest view
- **Edit Harvest** (`/dashboard/harvests/[id]/edit`) - Modify harvest

**Components**:
- `HarvestList` - Paginated harvest list
- `HarvestForm` - Create/edit harvest form
- `HarvestCard` - Individual harvest display
- `HarvestFilters` - Search and filter options

**Harvest Form Fields**:
```typescript
interface HarvestFormData {
  cropType: string;
  quantity: number;
  unit: 'kg' | 'tons' | 'pieces';
  harvestDate: Date;
  location: {
    city: string;
    state: string;
    coordinates?: [number, number];
  };
  quality: 'A' | 'B' | 'C';
  notes?: string;
  images?: File[];
}
```

### 3. Marketplace (`/dashboard/marketplace`)
**File**: `client/app/dashboard/marketplace/page.tsx`

**Sub-pages**:
- **My Listings** (`/dashboard/marketplace/listings`) - Active/inactive listings
- **New Listing** (`/dashboard/marketplace/new`) - Create product listing
- **Orders** (`/dashboard/marketplace/orders`) - Incoming orders
- **Analytics** (`/dashboard/marketplace/analytics`) - Sales performance

**Components**:
- `ListingList` - Product listings management
- `ListingForm` - Create/edit listing form
- `OrderList` - Order management
- `MarketplaceStats` - Sales metrics

**Listing Form Fields**:
```typescript
interface ListingFormData {
  cropName: string;
  category: string;
  description: string;
  basePrice: number;
  quantity: number;
  unit: string;
  location: {
    city: string;
    state: string;
  };
  images: string[];
  tags: string[];
  availableQuantity: number;
}
```

### 4. QR Code Management (`/dashboard/qr-codes`)
**File**: `client/app/dashboard/qr-codes/page.tsx`

**Features**:
- View all generated QR codes
- Generate new QR codes for harvests
- Download QR codes
- Track QR code usage
- Verify provenance

**Components**:
- `QRCodeList` - All QR codes display
- `QRCodeGenerator` - Generate new codes
- `QRCodeDownload` - Download functionality
- `ProvenanceTracker` - Track usage

**QR Code Data Structure**:
```typescript
interface QRCodeData {
  id: string;
  batchId: string;
  harvestId: string;
  cropType: string;
  quantity: number;
  generatedAt: Date;
  lastScanned?: Date;
  scanCount: number;
  status: 'active' | 'expired' | 'revoked';
}
```

### 5. Financial Services (`/dashboard/financial`)
**File**: `client/app/dashboard/financial/page.tsx`

**Sub-pages**:
- **Overview** (`/dashboard/financial`) - Financial summary
- **Credit Score** (`/dashboard/financial/credit`) - Credit assessment
- **Loans** (`/dashboard/financial/loans`) - Loan applications
- **Insurance** (`/dashboard/financial/insurance`) - Insurance policies
- **Transactions** (`/dashboard/financial/transactions`) - Payment history

**Components**:
- `FinancialOverview` - Summary dashboard
- `CreditScoreCard` - Credit score display
- `LoanApplicationForm` - Apply for loans
- `InsurancePolicyList` - Active policies
- `TransactionHistory` - Payment records

**Financial Data Structure**:
```typescript
interface FinancialData {
  creditScore: number;
  totalEarnings: number;
  pendingPayments: number;
  activeLoans: number;
  insurancePolicies: number;
  transactionHistory: Transaction[];
}
```

### 6. Analytics (`/dashboard/analytics`)
**File**: `client/app/dashboard/analytics/page.tsx`

**Features**:
- Harvest performance metrics
- Financial analytics
- Market trends
- Weather impact analysis
- Predictive insights

**Components**:
- `AnalyticsDashboard` - Main analytics view
- `PerformanceCharts` - Visual data representation
- `TrendAnalysis` - Pattern recognition
- `WeatherImpact` - Climate correlation
- `PredictiveInsights` - Future projections

**Analytics Data Structure**:
```typescript
interface AnalyticsData {
  harvestMetrics: {
    totalYield: number;
    averageQuality: string;
    seasonalTrends: ChartData[];
  };
  financialMetrics: {
    revenueGrowth: number;
    profitMargins: number;
    costAnalysis: ChartData[];
  };
  marketMetrics: {
    priceTrends: ChartData[];
    demandForecast: ChartData[];
    competitorAnalysis: ChartData[];
  };
}
```

### 7. Profile & Settings (`/dashboard/profile`, `/dashboard/settings`)
**Files**: 
- `client/app/dashboard/profile/page.tsx`
- `client/app/dashboard/settings/page.tsx`

**Profile Features**:
- Personal information
- Farm details
- Bank account information
- KYC verification status
- Partner relationships

**Settings Features**:
- Notification preferences
- Language settings
- Privacy controls
- Security settings
- Data export

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
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "password": "securePassword123",
  "role": "farmer",
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
  "email": "john@example.com",
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
  "email": "john@example.com",
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
  "email": "john@example.com"
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

### 2. Farmer Profile Management

#### Get My Profile
```http
GET /api/farmers/profile/me
Authorization: Bearer <token>
```
**Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "farmer_profile_id",
    "farmer": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "role": "farmer",
      "region": "Lagos"
    },
    "farmDetails": {
      "farmSize": 5.5,
      "farmType": "mixed",
      "location": {
        "city": "Ibadan",
        "state": "Oyo",
        "coordinates": [7.3961, 3.8969]
      }
    },
    "crops": ["maize", "cassava", "vegetables"],
    "experience": 8,
    "certifications": ["organic", "good_agricultural_practices"]
  }
}
```

#### Update My Profile
```http
PUT /api/farmers/profile/me
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "farmDetails": {
    "farmSize": 6.0,
    "farmType": "mixed",
    "location": {
      "city": "Ibadan",
      "state": "Oyo"
    }
  },
  "crops": ["maize", "cassava", "vegetables", "rice"],
  "experience": 9
}
```

#### Get My Preferences
```http
GET /api/farmers/preferences/me
Authorization: Bearer <token>
```

#### Update My Preferences
```http
PUT /api/farmers/preferences/me
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get My Settings
```http
GET /api/farmers/settings/me
Authorization: Bearer <token>
```

#### Update My Settings
```http
PUT /api/farmers/settings/me
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Dashboard Data
```http
GET /api/farmers/dashboard
Authorization: Bearer <token>
```

#### Get Harvest Summary
```http
GET /api/farmers/harvests/summary
Authorization: Bearer <token>
```

#### Get Earnings Summary
```http
GET /api/farmers/earnings/summary
Authorization: Bearer <token>
```

### 3. User Profile & Avatar Management

#### Get User Profile
```http
GET /api/users/profile/me
Authorization: Bearer <token>
```

#### Update User Profile
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

### 4. Harvest Management

#### Get All Harvests
```http
GET /api/harvests?page=1&limit=10&status=active
Authorization: Bearer <token>
```

#### Create New Harvest
```http
POST /api/harvests
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "cropType": "maize",
  "quantity": 500,
  "unit": "kg",
  "harvestDate": "2024-01-15",
  "location": {
    "city": "Ibadan",
    "state": "Oyo",
    "coordinates": [7.3961, 3.8969]
  },
  "quality": "A",
  "notes": "Excellent harvest this season"
}
```

#### Get Harvest by Batch ID
```http
GET /api/harvests/:batchId
Authorization: Bearer <token>
```

#### Delete Harvest
```http
DELETE /api/harvests/:id
Authorization: Bearer <token>
```

#### Get Harvest Verification
```http
GET /api/harvests/verification/:batchId
```

#### Get Harvest Provenance
```http
GET /api/harvests/provenance/:batchId
Authorization: Bearer <token>
```

### 5. Harvest Approval System

#### Get Harvest Approvals
```http
GET /api/harvest-approval
Authorization: Bearer <token>
```

#### Create Harvest Approval
```http
POST /api/harvest-approval
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Harvest Approval by ID
```http
GET /api/harvest-approval/:id
Authorization: Bearer <token>
```

#### Update Harvest Approval
```http
PUT /api/harvest-approval/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Harvest Approval
```http
DELETE /api/harvest-approval/:id
Authorization: Bearer <token>
```

### 6. Marketplace Operations

#### Create Product Listing
```http
POST /api/marketplace/listings
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "cropName": "Fresh Maize",
  "category": "grains",
  "description": "High-quality maize harvested this season",
  "basePrice": 250,
  "quantity": 500,
  "unit": "kg",
  "location": {
    "city": "Ibadan",
    "state": "Oyo"
  },
  "images": ["image_url_1", "image_url_2"],
  "tags": ["organic", "fresh", "local"]
}
```

#### Get All Listings
```http
GET /api/marketplace/listings
```

#### Get Listing by ID
```http
GET /api/marketplace/listings/:id
```

#### Update Listing
```http
PATCH /api/marketplace/listings/:id
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "basePrice": 275,
  "quantity": 450,
  "description": "Updated description"
}
```

#### Unpublish Listing
```http
PATCH /api/marketplace/listings/:id/unpublish
Authorization: Bearer <token>
```

#### Upload Listing Images
```http
POST /api/marketplace/upload-image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Form Data**:
- `images`: File[] (up to 5 images)

#### Search Suggestions
```http
GET /api/marketplace/search-suggestions?q=maize&limit=10
```

#### Get My Orders
```http
GET /api/marketplace/orders
Authorization: Bearer <token>
```

#### Create Order
```http
POST /api/marketplace/orders
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Order Details
```http
GET /api/marketplace/orders/:id
Authorization: Bearer <token>
```

#### Get Orders by Buyer
```http
GET /api/marketplace/orders/buyer/:buyerId
Authorization: Bearer <token>
```

#### Update Order Status
```http
PATCH /api/marketplace/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Order Tracking
```http
GET /api/marketplace/orders/:id/tracking
Authorization: Bearer <token>
```

#### Manage Favorites
```http
GET /api/marketplace/favorites/:userId
Authorization: Bearer <token>
```

```http
POST /api/marketplace/favorites
Authorization: Bearer <token>
Content-Type: application/json
```

```http
DELETE /api/marketplace/favorites/:userId/:listingId
Authorization: Bearer <token>
```

### 7. QR Code Management

#### Get My QR Codes
```http
GET /api/qr-codes
Authorization: Bearer <token>
```

#### Generate New QR Code
```http
POST /api/qr-codes
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "harvestId": "harvest_id",
  "batchId": "BATCH_001",
  "expiryDate": "2024-12-31"
}
```

#### Get QR Code Statistics
```http
GET /api/qr-codes/stats
Authorization: Bearer <token>
```

#### Get QR Code by ID
```http
GET /api/qr-codes/:id
Authorization: Bearer <token>
```

#### Delete QR Code
```http
DELETE /api/qr-codes/:id
Authorization: Bearer <token>
```

### 8. Financial Services

#### Get Credit Score
```http
GET /api/fintech/credit-score/:farmerId
Authorization: Bearer <token>
```

#### Create Credit Score
```http
POST /api/fintech/credit-score
Authorization: Bearer <token>
Content-Type: application/json
```

#### Update Credit Score
```http
PUT /api/fintech/credit-score/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Financial Health
```http
GET /api/fintech/financial-health/:farmerId
Authorization: Bearer <token>
```

#### Get Crop Financials
```http
GET /api/fintech/crop-financials
Authorization: Bearer <token>
```

#### Get Financial Projections
```http
GET /api/fintech/financial-projections
Authorization: Bearer <token>
```

#### Get Financial Goals
```http
GET /api/fintech/financial-goals/:farmerId
Authorization: Bearer <token>
```

#### Loan Management
```http
GET /api/fintech/loan-applications
Authorization: Bearer <token>
```

```http
POST /api/fintech/loan-applications
Authorization: Bearer <token>
Content-Type: application/json
```

```http
GET /api/fintech/loan-applications/:id
Authorization: Bearer <token>
```

```http
PUT /api/fintech/loan-applications/:id
Authorization: Bearer <token>
Content-Type: application/json
```

```http
DELETE /api/fintech/loan-applications/:id
Authorization: Bearer <token>
```

#### Insurance Management
```http
GET /api/fintech/insurance-policies
Authorization: Bearer <token>
```

```http
POST /api/fintech/insurance-policies
Authorization: Bearer <token>
Content-Type: application/json
```

```http
GET /api/fintech/insurance-policies/:id
Authorization: Bearer <token>
```

```http
PUT /api/fintech/insurance-policies/:id
Authorization: Bearer <token>
Content-Type: application/json
```

```http
DELETE /api/fintech/insurance-policies/:id
Authorization: Bearer <token>
```

#### Insurance Claims
```http
POST /api/fintech/insurance-claims
Authorization: Bearer <token>
Content-Type: application/json
```

```http
GET /api/fintech/insurance-claims/:id
Authorization: Bearer <token>
```

```http
PUT /api/fintech/insurance-claims/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Loan Referrals
```http
GET /api/fintech/loan-referrals
Authorization: Bearer <token>
```

#### Loan Statistics
```http
GET /api/fintech/loan-stats
Authorization: Bearer <token>
```

#### Insurance Statistics
```http
GET /api/fintech/insurance-stats
Authorization: Bearer <token>
```

#### Insurance Quotes
```http
GET /api/fintech/insurance-quotes
Authorization: Bearer <token>
```

### 9. Analytics & Reporting

#### Get Dashboard Metrics
```http
GET /api/analytics/dashboard
```

#### Get Harvest Analytics
```http
GET /api/analytics/harvests
```

#### Get Marketplace Analytics
```http
GET /api/analytics/marketplace
```

#### Get Financial Analytics
```http
GET /api/analytics/financial
```

#### Get Transaction Analytics
```http
GET /api/analytics/transactions
Authorization: Bearer <token>
```

#### Get Fintech Analytics
```http
GET /api/analytics/fintech
Authorization: Bearer <token>
```

#### Get Impact Analytics
```http
GET /api/analytics/impact
Authorization: Bearer <token>
```

#### Get Weather Analytics
```http
GET /api/analytics/weather
Authorization: Bearer <token>
```

#### Get Reports List
```http
GET /api/analytics/reports
Authorization: Bearer <token>
```

#### Export Analytics
```http
GET /api/analytics/export
Authorization: Bearer <token>
```

#### Compare Analytics
```http
POST /api/analytics/compare
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Regional Analytics
```http
POST /api/analytics/regional
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Predictive Analytics
```http
GET /api/analytics/predictive
Authorization: Bearer <token>
```

#### Get Analytics Summary
```http
GET /api/analytics/summary
Authorization: Bearer <token>
```

#### Get Farmer Analytics
```http
GET /api/analytics/farmers/:farmerId
Authorization: Bearer <token>
```

#### Generate Report
```http
POST /api/analytics/report
Authorization: Bearer <token>
Content-Type: application/json
```

### 10. Notifications

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

#### Specialized Notifications
```http
POST /api/notifications/harvest
Authorization: Bearer <token>
Content-Type: application/json
```

```http
POST /api/notifications/marketplace
Authorization: Bearer <token>
Content-Type: application/json
```

```http
POST /api/notifications/transaction
Authorization: Bearer <token>
Content-Type: application/json
```

### 11. Shipment Management

#### Create Shipment
```http
POST /api/shipments
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Shipment by ID
```http
GET /api/shipments/:shipmentId
Authorization: Bearer <token>
```

#### Get Shipments with Filters
```http
GET /api/shipments
Authorization: Bearer <token>
```

#### Update Shipment Status
```http
PUT /api/shipments/:shipmentId/status
Authorization: Bearer <token>
Content-Type: application/json
```

#### Confirm Delivery
```http
PUT /api/shipments/:shipmentId/delivery
Authorization: Bearer <token>
Content-Type: application/json
```

#### Report Shipment Issue
```http
POST /api/shipments/:shipmentId/issues
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Shipment Statistics
```http
GET /api/shipments/stats/overview
Authorization: Bearer <token>
```

#### Search Shipments
```http
GET /api/shipments/search/query
Authorization: Bearer <token>
```

### 12. Weather Information

#### Get Weather Data
```http
GET /api/weather
```

### 13. Data Export & Import

#### Export Harvests
```http
POST /api/export-import/export/harvests
Authorization: Bearer <token>
Content-Type: application/json
```

#### Export Listings
```http
POST /api/export-import/export/listings
Authorization: Bearer <token>
Content-Type: application/json
```

#### Export Custom Data
```http
POST /api/export-import/export/custom
Authorization: Bearer <token>
Content-Type: application/json
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

### 14. Referral System

#### Get Referrals
```http
GET /api/referrals
Authorization: Bearer <token>
```

### 15. Payment Processing

#### Process Payments
```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json
```

### 16. Health & System

#### Health Check
```http
GET /api/health
```

#### Metrics
```http
GET /metrics
```

## Database Models & Relationships

### 1. User Model
```javascript
// models/user.model.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'buyer', 'partner', 'admin'], default: 'farmer' },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  region: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
```

### 2. Farmer Profile Model
```javascript
// models/farmer-profile.model.js
const farmerProfileSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmDetails: {
    farmSize: { type: Number, required: true },
    farmType: { type: String, enum: ['crop', 'livestock', 'mixed'], required: true },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      coordinates: [Number]
    }
  },
  crops: [String],
  experience: { type: Number, required: true },
  certifications: [String],
  preferences: {
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true },
    privacy: { type: String, enum: ['public', 'private'], default: 'public' }
  },
  settings: {
    theme: { type: String, default: 'light' },
    currency: { type: String, default: 'NGN' }
  }
});
```

### 3. Harvest Model
```javascript
// models/harvest.model.js
const harvestSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropType: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['kg', 'tons', 'pieces'], required: true },
  harvestDate: { type: Date, required: true },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: [Number]
  },
  quality: { type: String, enum: ['A', 'B', 'C'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'shipped'], default: 'pending' },
  notes: String,
  images: [String],
  batchId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});
```

### 4. Listing Model
```javascript
// models/listing.model.js
const listingSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  availableQuantity: { type: Number, required: true },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true }
  },
  images: [String],
  tags: [String],
  status: { type: String, enum: ['draft', 'active', 'inactive', 'sold_out'], default: 'draft' },
  createdAt: { type: Date, default: Date.now }
});
```

## Integration Guide

### 1. Frontend-Backend Integration

#### API Service Setup
```typescript
// lib/api.ts
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

  // Farmer-specific methods
  async getFarmerProfile() {
    return this.request('/farmer/profile/me');
  }

  async updateFarmerProfile(data: any) {
    return this.request('/farmer/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getHarvests(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/harvests?${queryString}`);
  }

  async createHarvest(data: any) {
    return this.request('/harvests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
```

#### State Management
```typescript
// hooks/use-farmer-store.ts
import { create } from 'zustand';

interface FarmerState {
  profile: any;
  harvests: any[];
  listings: any[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  fetchHarvests: () => Promise<void>;
  createHarvest: (data: any) => Promise<void>;
}

export const useFarmerStore = create<FarmerState>((set, get) => ({
  profile: null,
  harvests: [],
  listings: [],
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getFarmerProfile();
      set({ profile: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateProfile: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.updateFarmerProfile(data);
      set({ profile: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchHarvests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getHarvests();
      set({ harvests: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createHarvest: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.createHarvest(data);
      const newHarvests = [...get().harvests, response.data];
      set({ harvests: newHarvests, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
```

### 2. Real-time Updates

#### WebSocket Integration
```typescript
// hooks/use-websocket.ts
import { useEffect, useRef } from 'react';

export const useWebSocket = (url: string, onMessage: (data: any) => void) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
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
  }, [url, onMessage]);

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
};
```

### 3. Offline Support

#### Service Worker Implementation
```typescript
// public/sw.js
const CACHE_NAME = 'grochain-farmer-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/harvests',
  '/dashboard/marketplace',
  '/dashboard/financial',
  '/dashboard/analytics',
  '/dashboard/profile',
  '/dashboard/settings'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
```

## Testing Strategy

### 1. Unit Testing
```typescript
// __tests__/components/farmer-dashboard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FarmerDashboard } from '@/components/dashboard/farmer-dashboard';

describe('FarmerDashboard', () => {
  it('renders dashboard with stats', () => {
    render(<FarmerDashboard />);
    
    expect(screen.getByText('Total Harvests')).toBeInTheDocument();
    expect(screen.getByText('Total Earnings')).toBeInTheDocument();
    expect(screen.getByText('Pending Harvests')).toBeInTheDocument();
  });

  it('shows quick action buttons', () => {
    render(<FarmerDashboard />);
    
    expect(screen.getByText('Add New Harvest')).toBeInTheDocument();
    expect(screen.getByText('View QR Codes')).toBeInTheDocument();
    expect(screen.getByText('Check Analytics')).toBeInTheDocument();
  });
});
```

### 2. Integration Testing
```typescript
// __tests__/api/farmer-api.test.ts
import { apiService } from '@/lib/api';

describe('Farmer API Integration', () => {
  it('fetches farmer profile successfully', async () => {
    const mockProfile = {
      farmer: { name: 'John Doe', email: 'john@example.com' },
      farmDetails: { farmSize: 5.5, farmType: 'mixed' }
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', data: mockProfile })
    });

    const result = await apiService.getFarmerProfile();
    expect(result.data).toEqual(mockProfile);
  });
});
```

### 3. E2E Testing
```typescript
// cypress/e2e/farmer-dashboard.cy.ts
describe('Farmer Dashboard E2E', () => {
  beforeEach(() => {
    cy.login('farmer@example.com', 'password123');
    cy.visit('/dashboard');
  });

  it('displays farmer dashboard correctly', () => {
    cy.get('[data-testid="farmer-dashboard"]').should('be.visible');
    cy.get('[data-testid="stats-cards"]').should('have.length', 4);
    cy.get('[data-testid="quick-actions"]').should('be.visible');
  });

  it('navigates to harvest management', () => {
    cy.get('[data-testid="add-harvest-btn"]').click();
    cy.url().should('include', '/dashboard/harvests/new');
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

This comprehensive guide provides everything needed to build a complete farmer role system for GroChain. The modular approach allows for incremental development and testing, while the comprehensive API design ensures scalability and maintainability.

Key success factors:
1. **User Experience**: Intuitive interface for farmers with varying tech literacy
2. **Performance**: Fast loading times even on slow internet connections
3. **Reliability**: Offline support and robust error handling
4. **Security**: Comprehensive data protection and user privacy
5. **Scalability**: Architecture that can handle growing user base

The system is designed to be farmer-centric, providing tools and insights that directly improve agricultural productivity and financial outcomes.
