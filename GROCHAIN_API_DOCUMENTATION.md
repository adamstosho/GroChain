# 🚀 GroChain API Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Base URL & Authentication](#base-url--authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Frontend Integration Guide](#frontend-integration-guide)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [WebSocket Events](#websocket-events)
9. [Testing & Development](#testing--development)

---

## 🌟 Overview

GroChain is a comprehensive agricultural supply chain management platform built with Node.js/Express backend and Next.js frontend. The API provides endpoints for farmer management, harvest tracking, marketplace operations, fintech services, analytics, and more.

**Tech Stack:**
- **Backend**: Node.js 18+, Express.js, MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens
- **File Storage**: Cloudinary
- **SMS**: Africa's Talking
- **Payments**: Paystack/Flutterwave integration
- **Real-time**: WebSocket support
- **AI/ML**: Advanced analytics and image recognition

---

## 🔐 Base URL & Authentication

### Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

### Authentication
All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Token Management
- **Access Token**: Valid for 24 hours
- **Refresh Token**: Valid for 30 days
- **Auto-refresh**: Implemented in frontend auth context

---

## 📡 API Endpoints

### 🔓 Authentication (`/api/auth`)

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "password": "password123",
  "role": "farmer"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Token Refresh
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "password": "new_password123"
}
```

#### Email Verification
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token"
}
```

#### SMS OTP
```http
POST /api/auth/send-sms-otp
Content-Type: application/json

{
  "phone": "+2348012345678"
}

POST /api/auth/verify-sms-otp
Content-Type: application/json

{
  "phone": "+2348012345678",
  "otp": "123456"
}
```

#### Protected Route (Get Current User)
```http
GET /api/auth/protected
Authorization: Bearer <token>
```

### 🌾 Harvest Management (`/api/harvests`)

#### Create Harvest
```http
POST /api/harvests
Authorization: Bearer <token>
Content-Type: application/json

{
  "cropType": "Corn",
  "quantity": 100,
  "date": "2024-01-15T10:00:00Z",
  "geoLocation": {
    "lat": 9.0765,
    "lng": 7.3986
  }
}
```

#### Get Harvests (with filtering)
```http
GET /api/harvests?farmer=user_id&cropType=Corn&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Harvest Provenance
```http
GET /api/harvests/:batchId
Authorization: Bearer <token>
```

#### Verify QR Code (Public)
```http
GET /api/harvests/verify/:batchId
```

### 🏪 Marketplace (`/api/marketplace`)

#### Get Listings
```http
GET /api/marketplace/listings?page=1&limit=20&category=grains
```

#### Get Single Listing
```http
GET /api/marketplace/listings/:id
```

#### Create Listing
```http
POST /api/marketplace/listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "product": "Fresh Corn",
  "price": 1500,
  "quantity": 50,
  "farmer": "farmer_id",
  "partner": "partner_id",
  "images": ["image_url1", "image_url2"]
}
```

#### Update Listing
```http
PATCH /api/marketplace/listings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 1600,
  "quantity": 45
}
```

#### Create Order
```http
POST /api/marketplace/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "buyer": "buyer_id",
  "items": [
    {
      "listing": "listing_id",
      "quantity": 10
    }
  ]
}
```

#### Get Buyer Orders
```http
GET /api/marketplace/orders/buyer/:buyerId
Authorization: Bearer <token>
```

#### Update Order Status
```http
PATCH /api/marketplace/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "delivered"
}
```

#### Search Suggestions
```http
GET /api/marketplace/search-suggestions?q=corn
```

#### Favorites Management
```http
GET /api/marketplace/favorites
POST /api/marketplace/favorites
DELETE /api/marketplace/favorites/:listingId
Authorization: Bearer <token>
```

### 🤝 Partner Management (`/api/partners`)

#### Get Partners
```http
GET /api/partners?role=aggregator&page=1&limit=20
Authorization: Bearer <token>
```

#### Create Partner
```http
POST /api/partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Agro Partners Ltd",
  "email": "info@agropartners.com",
  "phone": "+2348012345678",
  "role": "aggregator",
  "location": "Lagos, Nigeria"
}
```

#### Bulk Partner Upload
```http
POST /api/partners/bulk-upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: CSV file with partner data
```

### 💰 Fintech Services (`/api/fintech`)

#### Get Credit Score
```http
GET /api/fintech/credit-score
Authorization: Bearer <token>
```

#### Apply for Loan
```http
POST /api/fintech/loan-application
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000,
  "purpose": "Equipment purchase",
  "duration": 12
}
```

#### Insurance Policies
```http
GET /api/fintech/insurance-policies
POST /api/fintech/insurance-claims
Authorization: Bearer <token>
```

### 📊 Analytics (`/api/analytics`)

#### Dashboard Analytics
```http
GET /api/analytics/dashboard?period=monthly&farmer=user_id
Authorization: Bearer <token>
```

#### Crop Analysis
```http
GET /api/analytics/crop-analysis?cropType=corn&season=2024
Authorization: Bearer <token>
```

#### Financial Reports
```http
GET /api/analytics/financial?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Export Data
```http
GET /api/analytics/export?format=csv&type=harvests
Authorization: Bearer <token>
```

### 🌤️ Weather Services (`/api/weather`)

#### Current Weather
```http
GET /api/weather/current?lat=9.0765&lng=7.3986&city=Abuja&state=FCT&country=Nigeria
```

#### Weather Forecast
```http
GET /api/weather/forecast?lat=9.0765&lng=7.3986&days=5
```

### 🔔 Notifications (`/api/notifications`)

#### Get Notifications
```http
GET /api/notifications?page=1&limit=20&read=false
Authorization: Bearer <token>
```

#### Mark as Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

#### Send Notification
```http
POST /api/notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient": "user_id",
  "type": "harvest_ready",
  "title": "Harvest Ready for Collection",
  "message": "Your corn harvest is ready for collection"
}
```

### 💳 Payment Processing (`/api/payments`)

#### Initialize Payment
```http
POST /api/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "email": "user@example.com",
  "reference": "order_123",
  "callback_url": "https://your-domain.com/payment/callback"
}
```

#### Verify Payment
```http
POST /api/payments/verify
Content-Type: application/json

{
  "reference": "payment_reference"
}
```

### 🔍 Verification Services (`/api/verification`)

#### BVN Verification
```http
POST /api/verification/bvn
Authorization: Bearer <token>
Content-Type: application/json

{
  "bvn": "12345678901",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01"
}
```

### 📱 USSD Services (`/api/ussd`)

#### USSD Session
```http
POST /api/ussd/session
Content-Type: application/json

{
  "sessionId": "session_123",
  "phoneNumber": "+2348012345678",
  "text": "1*2*3"
}
```

### 🤖 AI & ML Services (`/api/ai`)

#### Crop Recommendation
```http
POST /api/ai/crop-recommendation
Authorization: Bearer <token>
Content-Type: application/json

{
  "soilType": "loamy",
  "climate": "tropical",
  "season": "rainy",
  "location": {
    "lat": 9.0765,
    "lng": 7.3986
  }
}
```

#### Image Recognition
```http
POST /api/image-recognition/analyze
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: crop_image_file
```

### 🌐 WebSocket Events (`/api/websocket`)

#### Real-time Updates
```javascript
// Connect to WebSocket
const socket = io('ws://localhost:5000/api/websocket');

// Listen for events
socket.on('harvest_created', (data) => {
  console.log('New harvest:', data);
});

socket.on('order_updated', (data) => {
  console.log('Order status changed:', data);
});

socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

---

## 📊 Data Models

### User Model
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'farmer' | 'partner' | 'aggregator' | 'admin' | 'buyer';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Harvest Model
```typescript
interface Harvest {
  _id: string;
  farmer: string; // User ID
  cropType: string;
  quantity: number;
  date: Date;
  geoLocation: {
    lat: number;
    lng: number;
  };
  batchId: string;
  qrData: string;
  status: 'pending' | 'verified' | 'shipped';
  createdAt: Date;
  updatedAt: Date;
}
```

### Order Model
```typescript
interface Order {
  _id: string;
  buyer: string; // User ID
  items: Array<{
    listing: string; // Listing ID
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'paid' | 'delivered' | 'cancelled';
  paymentReference: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Listing Model
```typescript
interface Listing {
  _id: string;
  product: string;
  price: number;
  quantity: number;
  farmer: string; // User ID
  partner: string; // User ID
  images: string[];
  status: 'active' | 'sold' | 'removed';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🎯 Frontend Integration Guide

### 1. Authentication Setup

#### Install Dependencies
```bash
cd client
npm install axios @tanstack/react-query
```

#### Create API Client
```typescript
// lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### Authentication Context
```typescript
// lib/auth-context.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from './api-client';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { accessToken, user: userData } = response.data;
    
    localStorage.setItem('auth_token', accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.get('/auth/protected')
        .then(response => setUser(response.data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 2. Harvest Management Integration

#### Create Harvest Form
```typescript
// components/harvests/harvest-form.tsx
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api-client';

export function HarvestForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    cropType: '',
    quantity: 0,
    date: '',
    geoLocation: { lat: 0, lng: 0 }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiClient.post('/harvests', {
        ...formData,
        farmer: user?.id
      });
      
      // Handle success - redirect or show success message
      console.log('Harvest created:', response.data);
    } catch (error) {
      console.error('Error creating harvest:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### Harvest List with Filtering
```typescript
// components/harvests/harvest-list.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api-client';

export function HarvestList() {
  const { user } = useAuth();
  const [harvests, setHarvests] = useState([]);
  const [filters, setFilters] = useState({
    cropType: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });

  const fetchHarvests = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await apiClient.get(`/harvests?${params}`);
      setHarvests(response.data.harvests);
    } catch (error) {
      console.error('Error fetching harvests:', error);
    }
  };

  useEffect(() => {
    fetchHarvests();
  }, [filters]);

  return (
    <div>
      {/* Filter controls */}
      {/* Harvest list */}
    </div>
  );
}
```

### 3. Marketplace Integration

#### Product Listings
```typescript
// components/marketplace/product-listings.tsx
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export function ProductListings() {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  const fetchListings = async () => {
    try {
      const response = await apiClient.get(`/marketplace/listings?page=${pagination.page}&limit=${pagination.limit}`);
      setListings(response.data.listings);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total
      }));
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [pagination.page]);

  return (
    <div>
      {/* Product grid */}
      {/* Pagination */}
    </div>
  );
}
```

#### Order Management
```typescript
// components/marketplace/order-management.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import apiClient from '@/lib/api-client';

export function OrderManagement() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get(`/marketplace/orders/buyer/${user?.id}`);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const createOrder = async (items: any[]) => {
    try {
      const response = await apiClient.post('/marketplace/orders', {
        buyer: user?.id,
        items
      });
      
      // Handle success
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div>
      {/* Order list */}
      {/* Create order form */}
    </div>
  );
}
```

### 4. Real-time Updates with WebSocket

#### WebSocket Integration
```typescript
// lib/websocket.ts
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io('ws://localhost:5000/api/websocket', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onHarvestCreated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('harvest_created', callback);
    }
  }

  onOrderUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('order_updated', callback);
    }
  }
}

export const wsService = new WebSocketService();
```

### 5. Weather Integration

#### Weather Widget
```typescript
// components/weather/weather-widget.tsx
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState({ lat: 9.0765, lng: 7.3986 });

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Fallback to default location
          console.log('Using default location');
        }
      );
    }
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await apiClient.get('/weather/current', {
        params: {
          lat: location.lat,
          lng: location.lng,
          city: 'Current Location',
          state: 'Current',
          country: 'Nigeria'
        }
      });
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  useEffect(() => {
    if (location.lat && location.lng) {
      fetchWeather();
    }
  }, [location]);

  return (
    <div>
      {/* Weather display */}
      <button onClick={fetchWeather}>Refresh</button>
    </div>
  );
}
```

---

## ❌ Error Handling

### Standard Error Response Format
```typescript
interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Error Handling in Frontend
```typescript
try {
  const response = await apiClient.post('/harvests', data);
  // Handle success
} catch (error: any) {
  if (error.response?.status === 400) {
    // Handle validation errors
    const errors = error.response.data.errors;
    // Display errors to user
  } else if (error.response?.status === 401) {
    // Handle authentication error
    // Redirect to login or refresh token
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

---

## 🚦 Rate Limiting

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Rules
- **Development**: 1000 requests per 15 minutes
- **Production**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File Uploads**: 10 requests per 15 minutes

### Handling Rate Limits
```typescript
// Check rate limit headers
const remaining = response.headers['x-ratelimit-remaining'];
const resetTime = response.headers['x-ratelimit-reset'];

if (remaining === '0') {
  const waitTime = (resetTime * 1000) - Date.now();
  // Show user-friendly message about waiting
}
```

---

## 🔌 WebSocket Events

### Connection Events
- `connect` - Successfully connected
- `disconnect` - Connection lost
- `error` - Connection error

### Business Events
- `harvest_created` - New harvest created
- `harvest_updated` - Harvest status changed
- `order_created` - New order placed
- `order_updated` - Order status changed
- `payment_received` - Payment successful
- `notification` - New notification

### Event Data Structure
```typescript
interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}
```

---

## 🧪 Testing & Development

### Environment Variables
```bash
# .env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grochain
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
OPENWEATHER_API_KEY=your_openweather_key
AGROMONITORING_API_KEY=your_agromonitoring_key
AFRICASTALKING_API_KEY=your_africastalking_key
PAYSTACK_SECRET_KEY=your_paystack_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Running the Backend
```bash
cd server
npm install
npm run dev
```

### Testing Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint
curl http://localhost:5000/api/auth/protected \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Seeding
```bash
cd server
npm run seed
```

---

## 📱 Mobile & PWA Features

### Service Worker
- Offline functionality
- Background sync
- Push notifications
- App-like experience

### USSD Integration
- Menu-driven navigation
- SMS notifications
- Offline data collection

### Progressive Web App
- Installable on mobile devices
- Offline-first approach
- Native app-like experience

---

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- Multi-factor authentication (SMS OTP)
- Session management

### Data Protection
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### API Security
- Rate limiting
- Request validation
- CORS configuration
- Helmet security headers

---

## 📊 Monitoring & Analytics

### Health Checks
- `/health` - Basic health status
- `/metrics` - Prometheus metrics
- Database connectivity
- External service status

### Logging
- Request/response logging
- Error tracking
- Performance monitoring
- Audit trails

### Performance
- Response time monitoring
- Database query optimization
- Caching strategies
- Load balancing ready

---

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database connection secured
- [ ] SSL certificates installed
- [ ] Rate limiting enabled
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] CI/CD pipeline setup

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 📞 Support & Documentation

### Additional Resources
- **Swagger UI**: `/api-docs` - Interactive API documentation
- **GitHub Repository**: Source code and issues
- **Issue Tracking**: Bug reports and feature requests

### API Versioning
- Current version: v1
- Backward compatibility maintained
- Breaking changes documented in advance

---

## 🎯 Next Steps

1. **Frontend Integration**: Implement the provided code examples
2. **Testing**: Test all endpoints with provided examples
3. **Customization**: Adapt to your specific business requirements
4. **Deployment**: Follow production checklist
5. **Monitoring**: Set up logging and monitoring
6. **Documentation**: Keep this document updated

---

*This documentation covers the complete GroChain backend API. For specific implementation details or additional features, refer to the source code or contact the development team.*
