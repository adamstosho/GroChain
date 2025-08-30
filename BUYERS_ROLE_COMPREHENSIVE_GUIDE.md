# GroChain Buyer Role - Comprehensive Development Guide

## Table of Contents
1. [Overview](#overview)
2. [Buyer User Journey](#buyer-user-journey)
3. [Frontend Pages & Components](#frontend-pages--components)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Database Models & Relationships](#database-models--relationships)
6. [Integration Guide](#integration-guide)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Checklist](#deployment-checklist)

## Overview

The Buyer role in GroChain represents agricultural product purchasers who use the platform to:
- Browse and search for agricultural products
- Place orders and manage purchases
- Track shipments and deliveries
- Manage payment methods and transactions
- Access product provenance and quality information
- Receive notifications and updates
- Export order data and reports

## Buyer User Journey

### 1. Onboarding Flow
```
Registration → Profile Setup → Payment Setup → First Purchase → Regular Usage
```

### 2. Daily Operations
```
Browse Products → Search & Filter → Add to Cart → Checkout → Track Orders
```

### 3. Monthly Activities
```
Order Review → Payment Management → Shipment Tracking → Quality Assessment
```

## Frontend Pages & Components

### 1. Main Dashboard (`/dashboard`)
**File**: `client/app/dashboard/page.tsx`

**Components**:
- `BuyerDashboard` - Main dashboard component
- `StatsCard` - Key metrics display
- `RecentOrders` - Latest order activities
- `QuickActions` - Common buyer actions
- `ProductRecommendations` - Personalized suggestions

**Features**:
- Total orders count
- Spending summary
- Pending deliveries
- Recent activity feed
- Quick action buttons

**Key Metrics Displayed**:
```typescript
interface BuyerDashboardStats {
  totalOrders: number;
  totalSpent: number;
  pendingDeliveries: number;
  activeOrders: number;
  favoriteProducts: number;
  lastOrderDate: Date;
}
```

### 2. Marketplace (`/marketplace`)
**File**: `client/app/marketplace/page.tsx`

**Sub-pages**:
- **Browse Products** (`/marketplace`) - Product catalog with search/filter
- **Product Details** (`/marketplace/product/[id]`) - Individual product view
- **Search Results** (`/marketplace/search`) - Search results display
- **Categories** (`/marketplace/category/[name]`) - Category-based browsing

**Components**:
- `ProductGrid` - Product listings display
- `ProductCard` - Individual product display
- `SearchFilters` - Advanced search and filtering
- `ProductDetails` - Detailed product information
- `AddToCart` - Shopping cart functionality

**Product Display Structure**:
```typescript
interface ProductDisplay {
  id: string;
  cropName: string;
  category: string;
  description: string;
  basePrice: number;
  unit: string;
  availableQuantity: number;
  qualityGrade: 'premium' | 'standard' | 'basic';
  organic: boolean;
  location: {
    city: string;
    state: string;
  };
  images: string[];
  rating: number;
  reviewCount: number;
  farmer: {
    name: string;
    rating: number;
    verified: boolean;
  };
}
```

### 3. Shopping Cart (`/cart`)
**File**: `client/app/cart/page.tsx`

**Features**:
- Add/remove products
- Quantity adjustment
- Price calculation
- Shipping options
- Checkout process

**Components**:
- `CartItem` - Individual cart item
- `CartSummary` - Order summary
- `ShippingOptions` - Delivery choices
- `CheckoutForm` - Payment and delivery form

**Cart Data Structure**:
```typescript
interface CartItem {
  productId: string;
  listingId: string;
  cropName: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  farmer: string;
  location: string;
}

interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}
```

### 4. Orders Management (`/dashboard/orders`)
**File**: `client/app/dashboard/orders/page.tsx`

**Sub-pages**:
- **All Orders** (`/dashboard/orders`) - Order history and management
- **Order Details** (`/dashboard/orders/[id]`) - Individual order view
- **Order Tracking** (`/dashboard/orders/[id]/tracking`) - Shipment tracking

**Components**:
- `OrderList` - Paginated order list
- `OrderCard` - Individual order display
- `OrderStatus` - Order status tracking
- `TrackingMap` - Shipment location tracking
- `OrderActions` - Cancel, modify, support

**Order Data Structure**:
```typescript
interface Order {
  id: string;
  orderNumber: string;
  buyer: string;
  seller: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  deliveryInstructions: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
```

### 5. Favorites & Wishlist (`/dashboard/favorites`)
**File**: `client/app/dashboard/favorites/page.tsx`

**Features**:
- Save favorite products
- Create wishlists
- Price drop notifications
- Bulk actions

**Components**:
- `FavoriteList` - Saved products display
- `WishlistManager` - Wishlist organization
- `PriceAlerts` - Price monitoring
- `BulkActions` - Multiple item management

### 6. Payment Management (`/dashboard/payments`)
**File**: `client/app/dashboard/payments/page.tsx`

**Sub-pages**:
- **Payment Methods** (`/dashboard/payments/methods`) - Saved payment options
- **Transaction History** (`/dashboard/payments/history`) - Payment records
- **Billing** (`/dashboard/payments/billing`) - Invoices and billing

**Components**:
- `PaymentMethods` - Saved payment options
- `TransactionList` - Payment history
- `BillingHistory` - Invoice management
- `RefundRequests` - Refund processing

### 7. Profile & Settings (`/dashboard/profile`, `/dashboard/settings`)
**Files**: 
- `client/app/dashboard/profile/page.tsx`
- `client/app/dashboard/settings/page.tsx`

**Profile Features**:
- Personal information
- Delivery addresses
- Business details
- KYC verification status

**Settings Features**:
- Notification preferences
- Language settings
- Privacy controls
- Security settings
- Data export

### 8. Analytics & Reports (`/dashboard/analytics`)
**File**: `client/app/dashboard/analytics/page.tsx`

**Features**:
- Purchase history analysis
- Spending patterns
- Product preferences
- Supplier performance
- Cost analysis

**Components**:
- `PurchaseAnalytics` - Buying pattern analysis
- `SpendingCharts` - Cost visualization
- `SupplierRatings` - Vendor performance
- `CostBreakdown` - Expense analysis

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
  "name": "John Buyer",
  "email": "buyer@example.com",
  "phone": "+2348012345678",
  "password": "securePassword123",
  "role": "buyer",
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
  "email": "buyer@example.com",
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
  "email": "buyer@example.com",
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
  "email": "buyer@example.com"
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

### 2. Buyer Profile Management

#### Get My Profile
```http
GET /api/users/profile/me
Authorization: Bearer <token>
```
**Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "buyer_user_id",
    "name": "John Buyer",
    "email": "buyer@example.com",
    "phone": "+2348012345678",
    "role": "buyer",
    "location": "Lagos",
    "profile": {
      "avatar": "avatar_url",
      "bio": "Agricultural products buyer",
      "address": "123 Buyer Street",
      "city": "Lagos",
      "state": "Lagos"
    },
    "preferences": {
      "cropTypes": ["maize", "cassava", "vegetables"],
      "locations": ["Lagos", "Oyo", "Kano"],
      "priceRange": { "min": 1000, "max": 50000 },
      "qualityPreferences": ["premium", "organic"],
      "organicPreference": true
    }
  }
}
```

#### Update My Profile
```http
PUT /api/users/profile/me
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "profile": {
    "address": "456 New Buyer Street",
    "city": "Lagos",
    "state": "Lagos"
  },
  "preferences": {
    "cropTypes": ["maize", "cassava", "vegetables", "rice"],
    "priceRange": { "min": 1000, "max": 75000 }
  }
}
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

### 3. Marketplace Operations

#### Browse Products
```http
GET /api/marketplace/listings?page=1&limit=20&category=grains&location=Lagos&priceMin=1000&priceMax=50000
```

#### Get Product Details
```http
GET /api/marketplace/listings/:id
```

#### Search Products
```http
GET /api/marketplace/search-suggestions?q=maize&limit=10
```

#### Add to Favorites
```http
POST /api/marketplace/favorites
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "listingId": "listing_id",
  "notes": "High quality maize for processing"
}
```

#### Get My Favorites
```http
GET /api/marketplace/favorites/:userId?page=1&limit=20
Authorization: Bearer <token>
```

#### Remove from Favorites
```http
DELETE /api/marketplace/favorites/:userId/:listingId
Authorization: Bearer <token>
```

### 4. Order Management

#### Create Order
```http
POST /api/marketplace/orders
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "items": [
    {
      "listing": "listing_id",
      "quantity": 100,
      "price": 250,
      "unit": "kg"
    }
  ],
  "shippingAddress": {
    "street": "123 Buyer Street",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postalCode": "100001",
    "phone": "+2348012345678"
  },
  "deliveryInstructions": "Leave at gate if no one is home",
  "paymentMethod": "paystack"
}
```

#### Get My Orders
```http
GET /api/marketplace/orders
Authorization: Bearer <token>
```

#### Get Orders by Buyer ID
```http
GET /api/marketplace/orders/buyer/:buyerId?page=1&limit=20&status=active
Authorization: Bearer <token>
```

#### Get Order Details
```http
GET /api/marketplace/orders/:id
Authorization: Bearer <token>
```

#### Get Order Tracking
```http
GET /api/marketplace/orders/:id/tracking
Authorization: Bearer <token>
```

### 5. Payment Operations

#### Process Payments
```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json
```

### 6. Shipment Tracking

#### Get Shipment Details
```http
GET /api/shipments/:shipmentId
Authorization: Bearer <token>
```

#### Get My Shipments
```http
GET /api/shipments?buyer=buyer_id&status=shipped
Authorization: Bearer <token>
```

#### Report Shipment Issue
```http
POST /api/shipments/:shipmentId/issues
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "issueType": "damaged_package",
  "description": "Package arrived with visible damage",
  "severity": "high",
  "images": ["image_url_1", "image_url_2"]
}
```

### 7. Analytics & Reporting

#### Get Dashboard Metrics
```http
GET /api/analytics/dashboard
```

#### Get Buyer Analytics
```http
GET /api/analytics/buyers/:buyerId
Authorization: Bearer <token>
```

#### Generate Report
```http
POST /api/analytics/report
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "reportType": "purchase_history",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "metrics": ["spending", "orders", "suppliers"]
}
```

### 8. Notifications

#### Get My Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

#### Mark Notification as Read
```http
PATCH /api/notifications/:notificationId/read
Authorization: Bearer <token>
```

#### Update Notification Preferences
```http
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "notifications": {
    "email": true,
    "sms": false,
    "push": true,
    "inApp": true,
    "orderUpdates": true,
    "priceAlerts": true,
    "promotions": false
  }
}
```

#### Get Notification Preferences
```http
GET /api/notifications/preferences
Authorization: Bearer <token>
```

#### Update Push Token
```http
PUT /api/notifications/push-token
Authorization: Bearer <token>
Content-Type: application/json
```

#### Specialized Notifications
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

### 9. Data Export

#### Export Custom Data
```http
POST /api/export-import/export/custom
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "dataType": "orders",
  "format": "csv",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "filters": {
    "status": ["delivered", "cancelled"],
    "category": ["grains", "vegetables"]
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

#### Download Export
```http
GET /api/export-import/download/:filename
Authorization: Bearer <token>
```

### 10. Weather Information

#### Get Weather Data
```http
GET /api/weather
```

### 11. Health & System

#### Health Check
```http
GET /api/health
```

#### Metrics
```http
GET /metrics
```

## Database Models & Relationships

### 1. User Model (Buyer Role)
```javascript
// models/user.model.js - Buyer specific fields
const userSchema = new mongoose.Schema({
  // ... existing fields ...
  role: { type: String, enum: ['farmer', 'partner', 'admin', 'buyer'], required: true },
  
  // Buyer-specific preferences
  preferences: {
    cropTypes: [{ type: String }],
    locations: [{ type: String }],
    priceRange: {
      min: { type: Number },
      max: { type: Number }
    },
    qualityPreferences: [{ type: String }],
    organicPreference: { type: Boolean, default: false }
  },
  
  // Buyer statistics
  stats: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    favoriteProducts: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  }
});
```

### 2. Order Model
```javascript
// models/order.model.js
const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentMethod: { type: String, enum: ['paystack', 'bank_transfer', 'cash'], default: 'paystack' },
  paymentReference: { type: String },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'Nigeria' },
    postalCode: { type: String },
    phone: { type: String, required: true }
  },
  deliveryInstructions: { type: String },
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date },
  trackingNumber: { type: String },
  notes: { type: String },
  metadata: { type: Object }
}, { timestamps: true });
```

### 3. Favorite Model
```javascript
// models/favorite.model.js
const FavoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  notes: { type: String },
  priceAlert: { type: Number }, // Price threshold for notifications
  createdAt: { type: Date, default: Date.now }
});

FavoriteSchema.index({ user: 1, listing: 1 }, { unique: true });
```

### 4. Payment Model
```javascript
// models/payment.model.js
const PaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  method: { type: String, required: true },
  reference: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'successful', 'failed', 'refunded'], 
    default: 'pending' 
  },
  gateway: { type: String, default: 'paystack' },
  metadata: { type: Object },
  processedAt: { type: Date }
}, { timestamps: true });
```

### 5. Shipment Model
```javascript
// models/shipment.model.js
const ShipmentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carrier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trackingNumber: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'], 
    default: 'pending' 
  },
  pickupDate: { type: Date },
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  route: [{
    location: { type: String },
    timestamp: { type: Date },
    status: { type: String }
  }],
  issues: [{
    type: { type: String },
    description: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high'] },
    reportedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date }
  }]
}, { timestamps: true });
```

## Integration Guide

### 1. Frontend-Backend Integration

#### API Service Setup
```typescript
// lib/api.ts - Buyer-specific methods
class ApiService {
  // ... existing methods ...

  // Buyer-specific methods
  async getBuyerProfile() {
    return this.request('/users/profile/me');
  }

  async updateBuyerProfile(data: any) {
    return this.request('/users/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getMarketplaceListings(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/marketplace/listings?${queryString}`);
  }

  async getProductDetails(productId: string) {
    return this.request(`/marketplace/listings/${productId}`);
  }

  async addToFavorites(listingId: string, notes?: string) {
    return this.request('/marketplace/favorites', {
      method: 'POST',
      body: JSON.stringify({ listingId, notes }),
    });
  }

  async getFavorites(userId: string, params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/marketplace/favorites/${userId}?${queryString}`);
  }

  async createOrder(orderData: any) {
    return this.request('/marketplace/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getBuyerOrders(buyerId: string, params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/marketplace/orders/buyer/${buyerId}?${queryString}`);
  }

  async getOrderDetails(orderId: string) {
    return this.request(`/marketplace/orders/${orderId}`);
  }

  async getOrderTracking(orderId: string) {
    return this.request(`/marketplace/orders/${orderId}/tracking`);
  }

  async initializePayment(paymentData: any) {
    return this.request('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async verifyPayment(reference: string) {
    return this.request(`/payments/verify/${reference}`);
  }

  async getTransactionHistory(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/payments/transactions?${queryString}`);
  }

  async getShipmentDetails(shipmentId: string) {
    return this.request(`/shipments/${shipmentId}`);
  }

  async reportShipmentIssue(shipmentId: string, issueData: any) {
    return this.request(`/shipments/${shipmentId}/issues`, {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  }

  async getBuyerAnalytics(buyerId: string) {
    return this.request(`/analytics/buyers/${buyerId}`);
  }

  async generateReport(reportData: any) {
    return this.request('/analytics/report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getUserNotifications(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notifications?${queryString}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async updateNotificationPreferences(preferences: any) {
    return this.request('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify({ notifications: preferences }),
    });
  }

  async exportOrderData(exportData: any) {
    return this.request('/export-import/export/orders', {
      method: 'POST',
      body: JSON.stringify(exportData),
    });
  }
}

export const apiService = new ApiService();
```

#### State Management
```typescript
// hooks/use-buyer-store.ts
import { create } from 'zustand';

interface BuyerState {
  profile: any;
  favorites: any[];
  cart: any[];
  orders: any[];
  notifications: any[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  addToFavorites: (listingId: string, notes?: string) => Promise<void>;
  removeFromFavorites: (listingId: string) => Promise<void>;
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  fetchOrders: () => Promise<void>;
  createOrder: (orderData: any) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

export const useBuyerStore = create<BuyerState>((set, get) => ({
  profile: null,
  favorites: [],
  cart: [],
  orders: [],
  notifications: [],
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getBuyerProfile();
      set({ profile: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateProfile: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.updateBuyerProfile(data);
      set({ profile: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getFavorites(get().profile?._id);
      set({ favorites: response.data.favorites, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addToFavorites: async (listingId: string, notes?: string) => {
    try {
      await apiService.addToFavorites(listingId, notes);
      await get().fetchFavorites();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  removeFromFavorites: async (listingId: string) => {
    try {
      await apiService.removeFromFavorites(get().profile?._id, listingId);
      await get().fetchFavorites();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addToCart: (product: any, quantity: number) => {
    const existingItem = get().cart.find(item => item.id === product.id);
    if (existingItem) {
      get().updateCartQuantity(product.id, existingItem.quantity + quantity);
    } else {
      set(state => ({
        cart: [...state.cart, { ...product, quantity }]
      }));
    }
  },

  removeFromCart: (productId: string) => {
    set(state => ({
      cart: state.cart.filter(item => item.id !== productId)
    }));
  },

  updateCartQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
    } else {
      set(state => ({
        cart: state.cart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      }));
    }
  },

  clearCart: () => {
    set({ cart: [] });
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getBuyerOrders(get().profile?._id);
      set({ orders: response.data.orders, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createOrder: async (orderData: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.createOrder(orderData);
      const newOrders = [...get().orders, response.data];
      set({ orders: newOrders, isLoading: false });
      get().clearCart(); // Clear cart after successful order
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getUserNotifications();
      set({ notifications: response.data.notifications, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      set(state => ({
        notifications: state.notifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
```

### 2. Real-time Updates

#### WebSocket Integration for Order Updates
```typescript
// hooks/use-order-updates.ts
import { useEffect, useRef } from 'react';
import { useBuyerStore } from './use-buyer-store';

export const useOrderUpdates = () => {
  const ws = useRef<WebSocket | null>(null);
  const { orders, updateOrderStatus } = useBuyerStore();

  useEffect(() => {
    ws.current = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000');

    ws.current.onopen = () => {
      console.log('WebSocket connected for order updates');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'order_update') {
        updateOrderStatus(data.orderId, data.status, data.updates);
      } else if (data.type === 'shipment_update') {
        updateShipmentStatus(data.shipmentId, data.status, data.location);
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
  }, [updateOrderStatus]);

  const subscribeToOrder = (orderId: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'subscribe_order',
        orderId
      }));
    }
  };

  return { subscribeToOrder };
};
```

### 3. Payment Integration

#### Paystack Payment Handler
```typescript
// lib/payment.ts
import { apiService } from './api';

export class PaymentService {
  static async initializePayment(orderData: any) {
    try {
      const response = await apiService.initializePayment({
        amount: orderData.total * 100, // Convert to kobo
        email: orderData.buyerEmail,
        reference: `ORDER_${Date.now()}`,
        callback_url: `${window.location.origin}/payment/callback`,
        metadata: {
          orderId: orderData.orderId,
          buyerId: orderData.buyerId,
          items: orderData.items
        }
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to initialize payment');
    }
  }

  static async verifyPayment(reference: string) {
    try {
      const response = await apiService.verifyPayment(reference);
      return response.data;
    } catch (error) {
      throw new Error('Failed to verify payment');
    }
  }

  static handlePaymentSuccess(paymentData: any) {
    // Update order status
    // Clear cart
    // Redirect to success page
    console.log('Payment successful:', paymentData);
  }

  static handlePaymentFailure(error: any) {
    // Handle payment failure
    // Show error message
    // Redirect to failure page
    console.error('Payment failed:', error);
  }
}
```

## Testing Strategy

### 1. Unit Testing
```typescript
// __tests__/components/buyer-dashboard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BuyerDashboard } from '@/components/dashboard/buyer-dashboard';

describe('BuyerDashboard', () => {
  it('renders dashboard with buyer stats', () => {
    render(<BuyerDashboard />);
    
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('Total Spent')).toBeInTheDocument();
    expect(screen.getByText('Pending Deliveries')).toBeInTheDocument();
  });

  it('shows quick action buttons', () => {
    render(<BuyerDashboard />);
    
    expect(screen.getByText('Browse Products')).toBeInTheDocument();
    expect(screen.getByText('View Orders')).toBeInTheDocument();
    expect(screen.getByText('Track Shipments')).toBeInTheDocument();
  });
});
```

### 2. Integration Testing
```typescript
// __tests__/api/buyer-api.test.ts
import { apiService } from '@/lib/api';

describe('Buyer API Integration', () => {
  it('fetches buyer profile successfully', async () => {
    const mockProfile = {
      name: 'John Buyer',
      email: 'buyer@example.com',
      role: 'buyer'
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', data: mockProfile })
    });

    const result = await apiService.getBuyerProfile();
    expect(result.data).toEqual(mockProfile);
  });
});
```

### 3. E2E Testing
```typescript
// cypress/e2e/buyer-marketplace.cy.ts
describe('Buyer Marketplace E2E', () => {
  beforeEach(() => {
    cy.login('buyer@example.com', 'password123');
    cy.visit('/marketplace');
  });

  it('browses products and adds to cart', () => {
    cy.get('[data-testid="product-grid"]').should('be.visible');
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart-btn"]').click();
    cy.get('[data-testid="cart-count"]').should('contain', '1');
  });

  it('completes checkout process', () => {
    cy.addToCart('maize-product');
    cy.visit('/cart');
    cy.get('[data-testid="checkout-btn"]').click();
    cy.fillCheckoutForm();
    cy.get('[data-testid="place-order-btn"]').click();
    cy.url().should('include', '/order-success');
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

This comprehensive guide provides everything needed to build a complete buyer role system for GroChain. The modular approach allows for incremental development and testing, while the comprehensive API design ensures scalability and maintainability.

Key success factors:
1. **User Experience**: Intuitive interface for buyers with varying tech literacy
2. **Performance**: Fast loading times even on slow internet connections
3. **Reliability**: Robust error handling and payment processing
4. **Security**: Comprehensive data protection and payment security
5. **Scalability**: Architecture that can handle growing user base

The system is designed to be buyer-centric, providing tools and insights that directly improve purchasing decisions and supply chain transparency.

## Additional Resources

- [Paystack Payment Integration](https://paystack.com/docs)
- [WebSocket Implementation Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress E2E Testing](https://docs.cypress.io/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
