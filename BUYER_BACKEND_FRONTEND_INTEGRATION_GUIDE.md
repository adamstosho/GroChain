
# GroChain Buyer Role - Backend-Frontend Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture Overview](#architecture-overview)
3. [Backend API Endpoints](#backend-api-endpoints)
4. [Frontend Integration](#frontend-integration)
5. [Data Models & Types](#data-models--types)
6. [Authentication & Authorization](#authentication--authorization)
7. [State Management](#state-management)
8. [API Integration Patterns](#api-integration-patterns)
9. [Error Handling](#error-handling)
10. [Testing Strategy](#testing-strategy)
11. [Deployment & Performance](#deployment--performance)
12. [Troubleshooting](#troubleshooting)

## Overview

This comprehensive guide provides detailed documentation for integrating the GroChain backend with the frontend specifically for buyer roles. The integration covers all buyer functionalities including marketplace browsing, order management, payment processing, and analytics.

### Key Buyer Features
- **Marketplace Access**: Browse, search, and filter agricultural products
- **Shopping Cart**: Add/remove products, manage quantities
- **Order Management**: Create orders, track shipments, manage deliveries
- **Payment Processing**: Secure payment integration with Paystack
- **Favorites & Wishlist**: Save products for future purchases
- **Analytics & Reporting**: Purchase history and spending analytics
- **Profile Management**: User preferences, delivery addresses
- **Notifications**: Real-time updates on orders and products

## Architecture Overview

### Backend Architecture
```
backend/
├── controllers/
│   ├── marketplace.controller.js    # Core marketplace operations
│   ├── user.controller.js          # User profile management
│   ├── payment.controller.js       # Payment processing
│   └── notification.controller.js  # Notification management
├── models/
│   ├── user.model.js              # User data structure
│   ├── listing.model.js           # Product listings
│   ├── order.model.js             # Order management
│   ├── favorite.model.js          # User favorites
│   └── payment.model.js           # Payment transactions
├── routes/
│   └── marketplace.routes.js      # API routing
└── services/
    ├── payment.service.js         # Payment gateway integration
    └── notification.service.js    # Notification services
```

### Frontend Architecture
```
client/
├── app/dashboard/                 # Buyer dashboard pages
│   ├── page.tsx                  # Main dashboard
│   ├── marketplace/              # Marketplace pages
│   ├── orders/                   # Order management
│   ├── favorites/                # Favorites management
│   └── payments/                 # Payment management
├── components/
│   ├── dashboard/
│   │   └── buyer-dashboard.tsx   # Main dashboard component
│   ├── agricultural/
│   │   └── marketplace-card.tsx  # Product display
│   └── ui/                       # Reusable UI components
├── hooks/
│   └── use-buyer-store.ts        # Buyer state management
└── lib/
    └── api.ts                    # API integration layer
```

## Backend API Endpoints

### 1. Authentication & User Management

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Buyer",
  "email": "buyer@example.com",
  "phone": "+2348012345678",
  "password": "securePassword123",
  "role": "buyer",
  "location": "Lagos"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "buyer@example.com",
  "password": "securePassword123"
}
```

#### Get Buyer Profile
```http
GET /api/users/profile/me
Authorization: Bearer <token>
```

**Response:**
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
    },
    "stats": {
      "totalOrders": 25,
      "totalSpent": 150000,
      "favoriteProducts": 12,
      "lastActive": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Update Buyer Profile
```http
PUT /api/users/profile/me
Authorization: Bearer <token>
Content-Type: application/json

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

### 2. Marketplace Operations

#### Get Product Listings
```http
GET /api/marketplace/listings?page=1&limit=20&category=grains&location=Lagos&priceMin=1000&priceMax=50000
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `category`: Product category filter
- `location`: Location filter
- `priceMin`: Minimum price filter
- `priceMax`: Maximum price filter
- `quality`: Quality grade filter
- `search`: Search term
- `sortBy`: Sort field (default: 'createdAt')
- `sortOrder`: Sort order ('asc' or 'desc', default: 'desc')

**Response:**
```json
{
  "status": "success",
  "data": {
    "listings": [
      {
        "_id": "listing_id",
        "farmer": {
          "_id": "farmer_id",
          "name": "Local Farmer",
          "location": "Lagos",
          "rating": 4.5,
          "verified": true
        },
        "cropName": "Fresh Maize",
        "category": "grains",
        "description": "High-quality fresh maize from local farms",
        "basePrice": 2500,
        "unit": "kg",
        "quantity": 500,
        "availableQuantity": 450,
        "qualityGrade": "premium",
        "organic": true,
        "location": "Lagos, Nigeria",
        "images": ["image1.jpg", "image2.jpg"],
        "rating": 4.5,
        "reviewCount": 23,
        "status": "active",
        "createdAt": "2024-01-10T08:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

#### Get Product Details
```http
GET /api/marketplace/listings/:id
Authorization: Bearer <token>
```

#### Search Suggestions
```http
GET /api/marketplace/search-suggestions?q=maize&limit=10
```

### 3. Favorites Management

#### Add to Favorites
```http
POST /api/marketplace/favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "listingId": "listing_id",
  "notes": "High quality maize for processing"
}
```

#### Get User Favorites
```http
GET /api/marketplace/favorites/:userId?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "favorites": [
      {
        "_id": "favorite_id",
        "user": "buyer_id",
        "listing": {
          "_id": "listing_id",
          "cropName": "Fresh Maize",
          "basePrice": 2500,
          "farmer": {
            "name": "Local Farmer",
            "location": "Lagos"
          }
        },
        "notes": "High quality maize for processing",
        "addedAt": "2024-01-10T08:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 25,
      "itemsPerPage": 20
    }
  }
}
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

{
  "items": [
    {
      "listing": "listing_id_1",
      "quantity": 100,
      "price": 2500,
      "unit": "kg"
    },
    {
      "listing": "listing_id_2",
      "quantity": 50,
      "price": 3000,
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

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "order_id",
    "orderNumber": "ORD_1705123456789_abc123",
    "buyer": "buyer_id",
    "items": [
      {
        "listing": "listing_id_1",
        "quantity": 100,
        "price": 2500,
        "unit": "kg",
        "total": 250000
      }
    ],
    "total": 250000,
    "subtotal": 250000,
    "tax": 0,
    "shipping": 2500,
    "status": "pending",
    "paymentStatus": "pending",
    "shippingAddress": { /* address object */ },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Buyer Orders
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

**Response:**
```json
{
  "status": "success",
  "data": {
    "trackingNumber": "TRK123456789",
    "status": "shipped",
    "currentLocation": {
      "lat": 6.5244,
      "lng": 3.3792,
      "address": "Lagos Distribution Center"
    },
    "route": [
      {
        "location": "Farm Location",
        "timestamp": "2024-01-15T08:00:00Z",
        "status": "picked_up"
      },
      {
        "location": "Lagos Distribution Center",
        "timestamp": "2024-01-15T12:00:00Z",
        "status": "in_transit"
      }
    ],
    "estimatedDelivery": "2024-01-17T10:00:00Z",
    "actualDelivery": null
  }
}
```

### 5. Payment Processing

#### Initialize Payment
```http
POST /api/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_id",
  "amount": 252500, // Amount in kobo (₦2,525.00)
  "email": "buyer@example.com",
  "callback_url": "https://grochain.ng/payment/callback",
  "metadata": {
    "orderId": "order_id",
    "buyerId": "buyer_id"
  }
}
```

#### Verify Payment
```http
GET /api/payments/verify/:reference
Authorization: Bearer <token>
```

### 6. Notification Management

#### Get User Notifications
```http
GET /api/notifications?page=1&limit=20&read=false
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "type": "order_update",
        "title": "Order Shipped",
        "message": "Your order ORD_1705123456789 has been shipped",
        "read": false,
        "data": {
          "orderId": "order_id",
          "status": "shipped"
        },
        "createdAt": "2024-01-15T14:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20
    }
  }
}
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

### 7. Analytics & Reporting

#### Get Buyer Analytics
```http
GET /api/analytics/buyers/:buyerId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "totalOrders": 25,
      "totalSpent": 150000,
      "averageOrderValue": 6000,
      "favoriteCategories": ["grains", "vegetables"],
      "topSuppliers": ["farmer_1", "farmer_2"]
    },
    "spendingTrends": [
      {
        "month": "2024-01",
        "amount": 25000,
        "orderCount": 5
      }
    ],
    "categoryBreakdown": [
      {
        "category": "grains",
        "amount": 75000,
        "percentage": 50
      }
    ]
  }
}
```

#### Generate Purchase Report
```http
POST /api/analytics/report
Authorization: Bearer <token>
Content-Type: application/json

{
  "reportType": "purchase_history",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "metrics": ["spending", "orders", "suppliers"],
  "format": "pdf"
}
```

### 8. Data Export

#### Export Order Data
```http
POST /api/export-import/export/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "format": "csv",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "filters": {
    "status": ["delivered", "cancelled"],
    "category": ["grains", "vegetables"]
  },
  "fields": ["orderNumber", "total", "status", "createdAt"]
}
```

## Frontend Integration

### 1. API Service Layer

```typescript
// lib/api.ts - Buyer-specific API methods
class ApiService {
  // ... existing methods ...

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

  async createOrder(orderData: any) {
    return this.request('/api/marketplace/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
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

  async getBuyerAnalytics(buyerId: string) {
    return this.request(`/api/analytics/buyers/${buyerId}`)
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
}

export const apiService = new ApiService()
```

### 2. State Management

```typescript
// hooks/use-buyer-store.ts
import { create } from 'zustand'
import { apiService } from '@/lib/api'

interface BuyerState {
  profile: any
  favorites: any[]
  cart: CartItem[]
  orders: any[]
  notifications: any[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchProfile: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  fetchFavorites: () => Promise<void>
  addToFavorites: (listingId: string, notes?: string) => Promise<void>
  removeFromFavorites: (listingId: string) => Promise<void>
  addToCart: (product: any, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  fetchOrders: () => Promise<void>
  createOrder: (orderData: any) => Promise<void>
  fetchNotifications: () => Promise<void>
  markNotificationAsRead: (notificationId: string) => Promise<void>
}

interface CartItem {
  id: string
  listingId: string
  cropName: string
  quantity: number
  unit: string
  price: number
  total: number
  farmer: string
  location: string
  image: string
  availableQuantity: number
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
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.getBuyerProfile()
      set({ profile: response.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  updateProfile: async (data: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.updateBuyerProfile(data)
      set({ profile: response.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchFavorites: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.getFavorites(get().profile?._id)
      set({ favorites: response.data?.favorites || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  addToFavorites: async (listingId: string, notes?: string) => {
    try {
      await apiService.addToFavorites(listingId, notes)
      await get().fetchFavorites()
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  removeFromFavorites: async (listingId: string) => {
    try {
      await apiService.removeFromFavorites(get().profile?._id, listingId)
      await get().fetchFavorites()
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  addToCart: (product: any, quantity: number) => {
    const existingItem = get().cart.find(item => item.id === product._id)
    if (existingItem) {
      get().updateCartQuantity(product._id, existingItem.quantity + quantity)
    } else {
      set(state => ({
        cart: [...state.cart, { 
          id: product._id,
          listingId: product._id,
          cropName: product.cropName,
          quantity,
          unit: product.unit,
          price: product.basePrice,
          total: product.basePrice * quantity,
          farmer: product.farmer.name,
          location: product.location,
          image: product.images[0],
          availableQuantity: product.availableQuantity
        }]
      }))
    }
  },

  removeFromCart: (productId: string) => {
    set(state => ({
      cart: state.cart.filter(item => item.id !== productId)
    }))
  },

  updateCartQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
    } else {
      set(state => ({
        cart: state.cart.map(item =>
          item.id === productId 
            ? { ...item, quantity, total: item.price * quantity }
            : item
        )
      }))
    }
  },

  clearCart: () => {
    set({ cart: [] })
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.getBuyerOrders(get().profile?._id)
      set({ orders: response.data?.orders || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  createOrder: async (orderData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.createOrder(orderData)
      const newOrders = [...get().orders, response.data]
      set({ orders: newOrders, isLoading: false })
      get().clearCart() // Clear cart after successful order
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.getUserNotifications()
      set({ notifications: response.data?.notifications || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId)
      set(state => ({
        notifications: state.notifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      }))
    } catch (error: any) {
      set({ error: error.message })
    }
  },
}))
```

### 3. Component Integration Example

```typescript
// app/dashboard/marketplace/page.tsx
"use client"

import { useState, useEffect } from "react"
import { MarketplaceCard } from "@/components/agricultural"
import { apiService } from "@/lib/api"
import { useBuyerStore } from "@/hooks/use-buyer-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    quality: ''
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })

  const { addToCart, addToFavorites } = useBuyerStore()

  useEffect(() => {
    fetchListings()
  }, [filters, pagination.currentPage])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.currentPage,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      }
      
      const response = await apiService.getMarketplaceListings(params)
      setListings(response.data.listings)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleAddToCart = (product: any) => {
    addToCart(product, 1)
  }

  const handleAddToFavorites = (listingId: string) => {
    addToFavorites(listingId)
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  return (
    <div className="container mx-auto p-6">
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        
        <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grains">Grains</SelectItem>
            <SelectItem value="vegetables">Vegetables</SelectItem>
            <SelectItem value="fruits">Fruits</SelectItem>
            <SelectItem value="tubers">Tubers</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />

        <Select value={filters.quality} onValueChange={(value) => handleFilterChange('quality', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Min Price"
          type="number"
          value={filters.minPrice}
          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
        />
        <Input
          placeholder="Max Price"
          type="number"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((product) => (
              <MarketplaceCard
                key={product._id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onAddToWishlist={() => handleAddToFavorites(product._id)}
                onView={() => window.location.href = `/dashboard/marketplace/${product._id}`}
                onContact={() => window.location.href = `/dashboard/marketplace/${product._id}/contact`}
                onShare={() => navigator.share({ title: product.cropName, url: window.location.href })}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                Previous
              </Button>
              
              {[...Array(pagination.totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={pagination.currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              
              <Button
                variant="outline"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

## Data Models & Types

### TypeScript Interfaces

```typescript
// lib/types.ts

export interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: 'farmer' | 'buyer' | 'partner' | 'admin'
  status: 'active' | 'inactive' | 'suspended'
  location: string
  emailVerified: boolean
  phoneVerified: boolean
  profile: UserProfile
  preferences: BuyerPreferences
  stats: BuyerStats
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  avatar?: string
  bio?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface BuyerPreferences {
  cropTypes: string[]
  locations: string[]
  priceRange: {
    min: number
    max: number
  }
  qualityPreferences: string[]
  organicPreference: boolean
}

export interface BuyerStats {
  totalOrders: number
  totalSpent: number
  favoriteProducts: number
  lastActive: Date
}

export interface Listing {
  _id: string
  farmer: {
    _id: string
    name: string
    location: string
    rating: number
    verified: boolean
  }
  harvest?: {
    _id: string
    batchId: string
    cropType: string
    quality: string
    harvestDate: string
    geoLocation: {
      lat: number
      lng: number
    }
  }
  cropName: string
  category: string
  variety?: string
  description: string
  basePrice: number
  unit: string
  quantity: number
  availableQuantity: number
  seasonality?: string[]
  qualityGrade: 'premium' | 'standard' | 'basic'
  organic: boolean
  certifications?: string[]
  images: string[]
  location: string
  status: 'draft' | 'active' | 'inactive' | 'sold_out' | 'expired'
  featured: boolean
  views: number
  favorites: number
  rating: number
  reviewCount: number
  tags: string[]
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface Order {
  _id: string
  orderNumber: string
  buyer: string
  seller: string
  items: OrderItem[]
  total: number
  subtotal: number
  tax: number
  shipping: number
  discount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: 'paystack' | 'bank_transfer' | 'cash'
  paymentReference?: string
  shippingAddress: Address
  deliveryInstructions?: string
  estimatedDelivery?: string
  actualDelivery?: string
  trackingNumber?: string
  notes?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  listing: string
  quantity: number
  price: number
  unit: string
  total: number
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'paid' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode?: string
  phone: string
}

export interface Favorite {
  _id: string
  user: string
  listing: Listing
  notes?: string
  addedAt: string
}

export interface Notification {
  _id: string
  type: string
  title: string
  message: string
  read: boolean
  data?: any
  createdAt: string
}

export interface CartItem {
  id: string
  listingId: string
  cropName: string
  quantity: number
  unit: string
  price: number
  total: number
  farmer: string
  location: string
  image: string
  availableQuantity: number
}

export interface DashboardStats {
  totalOrders: number
  totalSpent: number
  pendingDeliveries: number
  activeOrders: number
  favoriteProducts: number
  monthlySpent: number
  lastOrderDate?: string
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  data?: T
  message?: string
  code?: string
  details?: any
}
```

## Authentication & Authorization

### JWT Token Management

```typescript
// lib/auth.ts
class AuthService {
  private tokenKey = 'grochain-auth-token'
  private refreshTokenKey = 'grochain-refresh-token'

  setTokens(accessToken: string, refreshToken?: string) {
    localStorage.setItem(this.tokenKey, accessToken)
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken)
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey)
  }

  clearTokens() {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }

  getUserFromToken(): any {
    const token = this.getAccessToken()
    if (!token) return null
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.user
    } catch {
      return null
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })

      if (response.ok) {
        const data = await response.json()
        this.setTokens(data.token, data.refreshToken)
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    this.clearTokens()
    return false
  }
}

export const authService = new AuthService()
```

### Route Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email'
  ]
  
  // Buyer-specific protected routes
  const buyerRoutes = [
    '/dashboard',
    '/dashboard/marketplace',
    '/dashboard/orders',
    '/dashboard/favorites',
    '/dashboard/payments',
    '/dashboard/profile',
    '/dashboard/settings',
    '/dashboard/analytics'
  ]
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isBuyerRoute = buyerRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Check for authentication token
  const token = request.cookies.get('grochain-auth-token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Verify token and role for buyer routes
  if (isBuyerRoute) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.user.role !== 'buyer') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ]
}
```

## API Integration Patterns

### 1. Request/Response Handling

```typescript
// lib/api-client.ts
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  params?: Record<string, any>
}

class ApiClient {
  private baseUrl: string
  private authService: AuthService

  constructor(baseUrl: string, authService: AuthService) {
    this.baseUrl = baseUrl
    this.authService = authService
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, params } = config
    
    // Build URL with query parameters
    const url = new URL(endpoint, this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    }

    // Add authorization header if token exists
    const token = this.authService.getAccessToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }

    // Prepare request body
    let requestBody: string | FormData | undefined
    if (body) {
      if (body instanceof FormData) {
        requestBody = body
        delete requestHeaders['Content-Type'] // Let browser set correct boundary
      } else if (typeof body === 'object') {
        requestBody = JSON.stringify(body)
      } else {
        requestBody = body
      }
    }

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: requestBody,
        credentials: 'include'
      })

      // Handle token refresh on 401
      if (response.status === 401) {
        const refreshed = await this.authService.refreshToken()
        if (refreshed) {
          // Retry the request with new token
          return this.request(endpoint, config)
        }
      }

      let data: any
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        throw new ApiError(response.status, data.message || 'Request failed', data)
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Network or other errors
      throw new ApiError(0, 'Network error', { originalError: error })
    }
  }

  // HTTP method helpers
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, params })
  }

  async put<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, params })
  }

  async patch<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, params })
  }

  async delete<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', params })
  }
}

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message)
    this.name = 'ApiError'
  }
}

export { ApiClient, ApiError }
```

### 2. React Query Integration

```typescript
// lib/react-query-client.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from './api'

// Query keys
export const queryKeys = {
  profile: ['profile'] as const,
  listings: ['listings'] as const,
  listing: (id: string) => ['listings', id] as const,
  favorites: ['favorites'] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  notifications: ['notifications'] as const,
  analytics: ['analytics'] as const
}

// Profile queries
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => apiService.getBuyerProfile(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => apiService.updateBuyerProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    }
  })
}

// Listings queries
export const useListings = (params?: any) => {
  return useQuery({
    queryKey: [...queryKeys.listings, params],
    queryFn: () => apiService.getMarketplaceListings(params),
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

export const useListing = (id: string) => {
  return useQuery({
    queryKey: queryKeys.listing(id),
    queryFn: () => apiService.getProductDetails(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

// Favorites queries
export const useFavorites = (userId: string, params?: any) => {
  return useQuery({
    queryKey: [...queryKeys.favorites, userId, params],
    queryFn: () => apiService.getFavorites(userId, params),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000
  })
}

export const useAddToFavorites = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ listingId, notes }: { listingId: string; notes?: string }) => 
      apiService.addToFavorites(listingId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites })
    }
  })
}

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, listingId }: { userId: string; listingId: string }) => 
      apiService.removeFromFavorites(userId, listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites })
    }
  })
}

// Orders queries
export const useOrders = (buyerId: string, params?: any) => {
  return useQuery({
    queryKey: [...queryKeys.orders, buyerId, params],
    queryFn: () => apiService.getBuyerOrders(buyerId, params),
    enabled: !!buyerId,
    staleTime: 1 * 60 * 1000 // 1 minute
  })
}

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => apiService.getOrderDetails(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (orderData: any) => apiService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders })
      queryClient.invalidateQueries({ queryKey: queryKeys.listings })
    }
  })
}

// Notifications queries
export const useNotifications = (params?: any) => {
  return useQuery({
    queryKey: [...queryKeys.notifications, params],
    queryFn: () => apiService.getUserNotifications(params),
    staleTime: 30 * 1000 // 30 seconds
  })
}

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (notificationId: string) => 
      apiService.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    }
  })
}
```

## Error Handling

### Global Error Boundary

```typescript
// components/error-boundary.tsx
"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo)
    
    // Log to error reporting service
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <Button onClick={resetError} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  )
}
```

### API Error Handling

```typescript
// lib/error-handler.ts
export interface ApiError {
  status: number
  message: string
  code?: string
  details?: any
}

export class ErrorHandler {
  static handleApiError(error: any): ApiError {
    if (error.status) {
      // API error with status code
      return {
        status: error.status,
        message: error.message || 'An error occurred',
        code: error.code,
        details: error.details
      }
    }

    // Network or other errors
    if (error.message?.includes('fetch')) {
      return {
        status: 0,
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR'
      }
    }

    return {
      status: 500,
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    }
  }

  static getErrorMessage(error: ApiError): string {
    switch (error.status) {
      case 0:
        return 'Network error. Please check your connection.'
      case 400:
        return error.message || 'Invalid request. Please check your input.'
      case 401:
        return 'Your session has expired. Please log in again.'
      case 403:
        return 'You don\'t have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 422:
        return 'Validation error. Please check your input.'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }

  static isRetryableError(error: ApiError): boolean {
    return error.status === 0 || error.status === 429 || error.status >= 500
  }

  static logError(error: ApiError, context?: any) {
    console.error('API Error:', {
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.details,
      context,
      timestamp: new Date().toISOString()
    })

    // Send to error reporting service
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry.captureException(new Error(error.message), {
      //   tags: { status: error.status, code: error.code },
      //   extra: { details: error.details, context }
      // })
    }
  }
}

// React hook for error handling
export const useErrorHandler = () => {
  const { toast } = useToast()

  const handleError = (error: any, context?: string) => {
    const apiError = ErrorHandler.handleApiError(error)
    ErrorHandler.logError(apiError, context)

    // Show toast notification
    toast({
      title: 'Error',
      description: ErrorHandler.getErrorMessage(apiError),
      variant: 'destructive'
    })

    return apiError
  }

  const handleAsyncError = async (promise: Promise<any>, context?: string) => {
    try {
      return await promise
    } catch (error) {
      return handleError(error, context)
    }
  }

  return { handleError, handleAsyncError }
}
```

## Testing Strategy

### 1. Unit Tests

```typescript
// __tests__/api/buyer-api.test.ts
import { apiService } from '@/lib/api'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/marketplace/listings', (req, res, ctx) => {
    return res(ctx.json({
      status: 'success',
      data: {
        listings: [
          {
            _id: '1',
            cropName: 'Fresh Maize',
            basePrice: 2500,
            farmer: { name: 'John Farmer' }
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 20
        }
      }
    }))
  }),

  rest.post('/api/marketplace/orders', (req, res, ctx) => {
    return res(ctx.json({
      status: 'success',
      data: {
        _id: 'order_123',
        orderNumber: 'ORD_1234567890_abc123',
        total: 25000,
        status: 'pending'
      }
    }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Buyer API', () => {
  it('should fetch marketplace listings', async () => {
    const response = await apiService.getMarketplaceListings()
    
    expect(response.status).toBe('success')
    expect(response.data.listings).toHaveLength(1)
    expect(response.data.listings[0].cropName).toBe('Fresh Maize')
  })

  it('should create an order', async () => {
    const orderData = {
      items: [{
        listing: 'listing_123',
        quantity: 10,
        price: 2500
      }],
      shippingAddress: {
        street: '123 Main St',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        phone: '+2348012345678'
      }
    }

    const response = await apiService.createOrder(orderData)
    
    expect(response.status).toBe('success')
    expect(response.data.orderNumber).toMatch(/^ORD_/)
    expect(response.data.total).toBe(25000)
  })

  it('should handle API errors', async () => {
    server.use(
      rest.get('/api/marketplace/listings', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({
          status: 'error',
          message: 'Internal server error'
        }))
      })
    )

    await expect(apiService.getMarketplaceListings()).rejects.toThrow()
  })
})
```

### 2. Integration Tests

```typescript
// __tests__/components/marketplace.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarketplacePage } from '@/app/dashboard/marketplace/page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the API service
jest.mock('@/lib/api', () => ({
  apiService: {
    getMarketplaceListings: jest.fn(),
    addToFavorites: jest.fn(),
  }
}))

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('MarketplacePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display loading state initially', () => {
    const { apiService } = require('@/lib/api')
    apiService.getMarketplaceListings.mockResolvedValue({
      status: 'success',
      data: { listings: [], pagination: { currentPage: 1, totalPages: 1 } }
    })

    renderWithProviders(<MarketplacePage />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display products when loaded', async () => {
    const { apiService } = require('@/lib/api')
    const mockListings = [
      {
        _id: '1',
        cropName: 'Fresh Maize',
        basePrice: 2500,
        farmer: { name: 'John Farmer' },
        images: ['/placeholder.jpg']
      }
    ]
    
    apiService.getMarketplaceListings.mockResolvedValue({
      status: 'success',
      data: { 
        listings: mockListings, 
        pagination: { currentPage: 1, totalPages: 1 } 
      }
    })

    renderWithProviders(<MarketplacePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Fresh Maize')).toBeInTheDocument()
    })
  })

  it('should add product to favorites', async () => {
    const { apiService } = require('@/lib/api')
    const user = userEvent.setup()
    
    apiService.getMarketplaceListings.mockResolvedValue({
      status: 'success',
      data: { 
        listings: [{
          _id: '1',
          cropName: 'Fresh Maize',
          basePrice: 2500,
          farmer: { name: 'John Farmer' },
          images: ['/placeholder.jpg']
        }], 
        pagination: { currentPage: 1, totalPages: 1 } 
      }
    })
    
    apiService.addToFavorites.mockResolvedValue({
      status: 'success',
      data: { message: 'Added to favorites' }
    })

    renderWithProviders(<MarketplacePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Fresh Maize')).toBeInTheDocument()
    })
    
    const addToFavoritesButton = screen.getByRole('button', { name: /add to favorites/i })
    await user.click(addToFavoritesButton)
    
    expect(apiService.addToFavorites).toHaveBeenCalledWith('1', undefined)
  })
})
```

### 3. E2E Tests

```typescript
// e2e/marketplace.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    // Login as buyer
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'buyer@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/dashboard')
  })

  test('should browse marketplace and add to cart', async ({ page }) => {
    await page.goto('/dashboard/marketplace')
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]')
    
    // Check that products are displayed
    const products = page.locator('[data-testid="product-card"]')
    await expect(products).toHaveCountGreaterThan(0)
    
    // Click on first product
    await products.first().click()
    
    // Should navigate to product details
    await expect(page).toHaveURL(/\/dashboard\/marketplace\/.+/)
    
    // Add to cart
    await page.click('[data-testid="add-to-cart-button"]')
    
    // Check cart count
    const cartCount = page.locator('[data-testid="cart-count"]')
    await expect(cartCount).toHaveText('1')
  })

  test('should create order from cart', async ({ page }) => {
    // Add product to cart first
    await page.goto('/dashboard/marketplace')
    await page.waitForSelector('[data-testid="product-card"]')
    await page.locator('[data-testid="product-card"]').first().click()
    await page.click('[data-testid="add-to-cart-button"]')
    
    // Go to cart
    await page.goto('/dashboard/cart')
    
    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]')
    
    // Fill shipping address
    await page.fill('[data-testid="street"]', '123 Buyer Street')
    await page.fill('[data-testid="city"]', 'Lagos')
    await page.fill('[data-testid="state"]', 'Lagos')
    await page.fill('[data-testid="phone"]', '+2348012345678')
    
    // Place order
    await page.click('[data-testid="place-order-button"]')
    
    // Should redirect to order confirmation
    await expect(page).toHaveURL(/\/dashboard\/orders\/.+/)
    
    // Should show success message
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible()
  })

  test('should view order history', async ({ page }) => {
    await page.goto('/dashboard/orders')
    
    // Should display orders list
    await page.waitForSelector('[data-testid="orders-list"]')
    
    const orders = page.locator('[data-testid="order-item"]')
    const orderCount = await orders.count()
    
    if (orderCount > 0) {
      // Click on first order
      await orders.first().click()
      
      // Should show order details
      await expect(page.locator('[data-testid="order-details"]')).toBeVisible()
    }
  })
})
```

## Deployment & Performance

### 1. Environment Configuration

```typescript
// lib/config.ts
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    timeout: 30000,
    retries: 3
  },
  payment: {
    paystack: {
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      callbackUrl: process.env.NEXT_PUBLIC_PAYSTACK_CALLBACK_URL
    }
  },
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
    offlineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true'
  },
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}
```

### 2. Performance Optimization

```typescript
// lib/performance.ts
import { useMemo } from 'react'

// Memoize expensive computations
export const useMemoizedListings = (listings: any[], filters: any) => {
  return useMemo(() => {
    let filtered = [...listings]
    
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category)
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(item => item.basePrice >= filters.minPrice)
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(item => item.basePrice <= filters.maxPrice)
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(item => 
        item.cropName.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      )
    }
    
    return filtered
  }, [listings, filters])
}

// Debounce search input
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Lazy loading hook
export const useLazyLoad = (ref: RefObject<Element>, options?: IntersectionObserverInit) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      options
    )
    
    observer.observe(element)
    
    return () => {
      observer.disconnect()
    }
  }, [ref, options])
  
  return isIntersecting
}
```

### 3. Service Worker for Offline Support

```typescript
// public/sw.js
const CACHE_NAME = 'grochain-buyer-v1'
const STATIC_CACHE = 'grochain-static-v1'
const DYNAMIC_CACHE = 'grochain-dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/marketplace',
  '/dashboard/orders',
  '/dashboard/favorites',
  '/manifest.json',
  '/offline.html'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(request)
        })
    )
    return
  }
  
  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response
        }
        
        return fetch(request)
          .then(response => {
            // Cache successful responses
            if (response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone()
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(request, responseClone))
            }
            return response
          })
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/offline.html')
        }
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncPendingOrders())
  }
})

async function syncPendingOrders() {
  const cache = await caches.open(DYNAMIC_CACHE)
  const keys = await cache.keys()
  
  const orderRequests = keys.filter(request => 
    request.url.includes('/api/marketplace/orders')
  )
  
  return Promise.all(
    orderRequests.map(async (request) => {
      try {
        const response = await fetch(request)
        if (response.ok) {
          await cache.delete(request)
        }
      } catch (error) {
        console.error('Failed to sync order:', error)
      }
    })
  )
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Issues

**Problem**: User keeps getting logged out
```typescript
// Check token expiration
const checkTokenExpiration = () => {
  const token = localStorage.getItem('grochain-auth-token')
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// Auto refresh token
const setupTokenRefresh = () => {
  const interval = setInterval(async () => {
    if (checkTokenExpiration()) {
      try {
        await apiService.refreshToken()
      } catch (error) {
        // Redirect to login
        window.location.href = '/login'
      }
    }
  }, 5 * 60 * 1000) // Check every 5 minutes
  
  return () => clearInterval(interval)
}
```

#### 2. API Rate Limiting

**Problem**: Getting 429 Too Many Requests errors
```typescript
// Implement request throttling
class RequestThrottler {
  private requests: Map<string, number[]> = new Map()
  private limit: number
  private window: number
  
  constructor(limit: number = 100, windowMs: number = 60000) {
    this.limit = limit
    this.window = windowMs
  }
  
  canMakeRequest(endpoint: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(endpoint) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.window)
    
    if (validRequests.length >= this.limit) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(endpoint, validRequests)
    return true
  }
  
  getRemainingRequests(endpoint: string): number {
    const requests = this.requests.get(endpoint) || []
    const now = Date.now()
    const validRequests = requests.filter(time => now - time < this.window)
    return Math.max(0, this.limit - validRequests.length)
  }
}

export const requestThrottler = new RequestThrottler()
```

#### 3. Payment Integration Issues

**Problem**: Payment callbacks not working properly
```typescript
// Payment verification hook
export const usePaymentVerification = (reference: string) => {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [isVerifying, setIsVerifying] = useState(false)
  
  useEffect(() => {
    if (!reference) return
    
    const verifyPayment = async () => {
      setIsVerifying(true)
      try {
        const response = await apiService.verifyPayment(reference)
        
        if (response.data.status === 'success') {
          setStatus('success')
          // Update order status
          await apiService.updateOrderStatus(response.data.orderId, 'paid')
        } else {
          setStatus('failed')
        }
      } catch (error) {
        console.error('Payment verification failed:', error)
        setStatus('failed')
      } finally {
        setIsVerifying(false)
      }
    }
    
    // Poll for payment status
    const pollInterval = setInterval(verifyPayment, 3000)
    
    // Initial verification
    verifyPayment()
    
    // Cleanup
    return () => clearInterval(pollInterval)
  }, [reference])
  
  return { status, isVerifying }
}
```

#### 4. Real-time Updates Issues

**Problem**: WebSocket connections dropping frequently
```typescript
// WebSocket reconnection logic
class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 1000
  private url: string
  
  constructor(url: string) {
    this.url = url
    this.connect()
  }
  
  private connect() {
    try {
      this.ws = new WebSocket(this.url)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.attemptReconnect()
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      this.attemptReconnect()
    }
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }
    
    this.reconnectAttempts++
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }
  
  private handleMessage(data: any) {
    // Handle different message types
    switch (data.type) {
      case 'order_update':
        // Update order status
        break
      case 'notification':
        // Show notification
        break
      default:
        console.log('Unknown message type:', data.type)
    }
  }
  
  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
```

#### 5. Performance Issues

**Problem**: Slow loading times for large datasets
```typescript
// Implement virtual scrolling for large lists
export const useVirtualScroll = (items: any[], itemHeight: number, containerHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0)
  
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  )
  
  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop)
    }
  }
}

// Implement pagination with cursor-based navigation
export const useCursorPagination = (initialCursor?: string) => {
  const [cursor, setCursor] = useState(initialCursor)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  const loadMore = async (fetchFunction: (cursor?: string) => Promise<any>) => {
    if (!hasNextPage || isLoading) return
    
    setIsLoading(true)
    try {
      const response = await fetchFunction(cursor)
      const { data, pagination } = response
      
      setCursor(pagination.nextCursor)
      setHasNextPage(pagination.hasNextPage)
      
      return data
    } finally {
      setIsLoading(false)
    }
  }
  
  return {
    cursor,
    hasNextPage,
    isLoading,
    loadMore,
    reset: () => {
      setCursor(initialCursor)
      setHasNextPage(true)
    }
  }
}
```

This comprehensive integration guide provides everything needed to successfully integrate the GroChain backend with the frontend for buyer roles. The documentation covers all major aspects including API endpoints, state management, error handling, testing, and deployment considerations.
