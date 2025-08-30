# GroChain Backend & Frontend - Comprehensive Documentation

## Table of Contents
1. [Overview](#overview)
2. [Backend Architecture](#backend-architecture)
3. [API Endpoints](#api-endpoints)
4. [Database Models](#database-models)
5. [Authentication & Authorization](#authentication--authorization)
6. [Frontend Architecture](#frontend-architecture)
7. [Component Structure](#component-structure)
8. [State Management](#state-management)
9. [API Integration](#api-integration)
10. [Deployment & DevOps](#deployment--devops)
11. [Testing Strategy](#testing-strategy)
12. [Security Considerations](#security-considerations)

## Overview

GroChain is a comprehensive agricultural supply chain management platform built with a MERN stack (MongoDB, Express.js, React/Next.js, Node.js). The system provides end-to-end solutions for farmers, buyers, partners, and administrators to manage agricultural operations, marketplace transactions, and financial services.

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT with role-based access control
- **File Storage**: Cloudinary + local file system
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

### Project Structure
```
backend/
├── app.js                 # Main application entry point
├── routes/               # API route definitions
├── controllers/          # Business logic handlers
├── models/              # Database schemas
├── middlewares/         # Custom middleware functions
├── services/            # Business service layer
├── utils/               # Utility functions
└── tests/               # Test files
```

### Key Features
- **Role-Based Access Control (RBAC)**: farmer, buyer, partner, admin
- **Real-time Updates**: WebSocket support for live data
- **File Uploads**: Image and document handling
- **Rate Limiting**: Environment-based throttling
- **Error Handling**: Centralized error management
- **Validation**: Request/response validation
- **Logging**: Comprehensive logging system

## API Endpoints

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.grochain.ng/api`

### Route Categories

#### 1. Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /verify-email` - Email verification
- `POST /forgot-password` - Password recovery
- `POST /reset-password` - Password reset
- `POST /refresh` - Token refresh
- `POST /logout` - User logout
- `POST /send-sms-otp` - SMS OTP generation
- `POST /verify-sms-otp` - SMS OTP verification

#### 2. User Management Routes (`/api/users`)
- `GET /profile/me` - Get user profile
- `PUT /profile/me` - Update user profile
- `POST /upload-avatar` - Upload profile picture
- `GET /preferences/me` - Get user preferences
- `PUT /preferences/me` - Update user preferences
- `GET /settings/me` - Get user settings
- `PUT /settings/me` - Update user settings
- `POST /change-password` - Change password
- `GET /dashboard` - Get user dashboard

**Admin Routes:**
- `GET /` - List all users
- `POST /` - Create user
- `GET /:userId` - Get user by ID
- `PUT /:userId` - Update user
- `DELETE /:userId` - Delete user
- `POST /bulk-create` - Bulk create users
- `PUT /bulk-update` - Bulk update users
- `DELETE /bulk-delete` - Bulk delete users
- `GET /search/query` - Search users
- `GET /:userId/stats` - Get user statistics
- `GET /:userId/activity` - Get user activity
- `POST /:userId/verify` - Verify user
- `PATCH /:userId/suspend` - Suspend user
- `PATCH /:userId/reactivate` - Reactivate user
- `PATCH /:userId/role` - Change user role
- `POST /export` - Export users

#### 3. Farmer Routes (`/api/farmers`)
- `GET /profile/me` - Get farmer profile
- `PUT /profile/me` - Update farmer profile
- `GET /preferences/me` - Get farmer preferences
- `PUT /preferences/me` - Update farmer preferences
- `GET /settings/me` - Get farmer settings
- `PUT /settings/me` - Update farmer settings
- `GET /dashboard` - Get farmer dashboard
- `GET /harvests/summary` - Get harvest summary
- `GET /earnings/summary` - Get earnings summary

#### 4. Partner Routes (`/api/partners`)
- `GET /` - Get all partners
- `GET /:id` - Get partner by ID
- `POST /` - Create partner
- `PUT /:id` - Update partner
- `DELETE /:id` - Delete partner
- `GET /dashboard` - Get partner dashboard
- `GET /farmers` - Get partner farmers
- `GET /commission` - Get partner commission
- `POST /upload-csv` - Upload CSV for bulk onboarding
- `POST /:id/onboard-farmer` - Onboard individual farmer
- `POST /:id/bulk-onboard` - Bulk onboard farmers
- `GET /:id/metrics` - Get partner metrics

**Test Routes:**
- `GET /ping` - Health check
- `GET /simple-test` - Simple test endpoint
- `GET /auth-test` - Authentication test
- `GET /test` - General test endpoint

#### 5. Marketplace Routes (`/api/marketplace`)
- `GET /listings` - Get all listings
- `GET /listings/:id` - Get listing by ID
- `POST /listings` - Create product listing
- `PATCH /listings/:id` - Update listing
- `PATCH /listings/:id/unpublish` - Unpublish listing
- `POST /upload-image` - Upload listing images
- `GET /search-suggestions` - Get search suggestions
- `GET /favorites/:userId` - Get user favorites
- `POST /favorites` - Add to favorites
- `DELETE /favorites/:userId/:listingId` - Remove from favorites
- `GET /orders` - Get user orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `GET /orders/buyer/:buyerId` - Get buyer orders
- `PATCH /orders/:id/status` - Update order status
- `GET /orders/:id/tracking` - Get order tracking

#### 6. Harvest Management Routes (`/api/harvests`)
- `GET /` - Get all harvests
- `POST /` - Create new harvest
- `GET /:batchId` - Get harvest by batch ID
- `DELETE /:id` - Delete harvest
- `GET /verification/:batchId` - Get harvest verification
- `GET /provenance/:batchId` - Get harvest provenance

#### 7. Harvest Approval Routes (`/api/harvest-approval`)
- `GET /` - Get harvest approvals
- `POST /` - Create harvest approval
- `GET /:id` - Get harvest approval by ID
- `PUT /:id` - Update harvest approval
- `DELETE /:id` - Delete harvest approval

#### 8. Financial Services Routes (`/api/fintech`)
- `GET /credit-score/:farmerId` - Get credit score
- `POST /credit-score` - Create credit score
- `PUT /credit-score/:id` - Update credit score
- `GET /financial-health/:farmerId` - Get financial health
- `GET /crop-financials` - Get crop financials
- `GET /financial-projections` - Get financial projections
- `GET /financial-goals/:farmerId` - Get financial goals
- `GET /loan-applications` - Get loan applications
- `POST /loan-applications` - Create loan application
- `GET /loan-applications/:id` - Get loan application by ID
- `PUT /loan-applications/:id` - Update loan application
- `DELETE /loan-applications/:id` - Delete loan application
- `GET /insurance-policies` - Get insurance policies
- `POST /insurance-policies` - Create insurance policy
- `GET /insurance-policies/:id` - Get insurance policy by ID
- `PUT /insurance-policies/:id` - Update insurance policy
- `DELETE /insurance-policies/:id` - Delete insurance policy
- `POST /insurance-claims` - Create insurance claim
- `GET /insurance-claims/:id` - Get insurance claim by ID
- `PUT /insurance-claims/:id` - Update insurance claim
- `GET /loan-referrals` - Get loan referrals
- `GET /loan-stats` - Get loan statistics
- `GET /insurance-stats` - Get insurance statistics
- `GET /insurance-quotes` - Get insurance quotes

#### 9. Analytics Routes (`/api/analytics`)
**Public Routes:**
- `GET /dashboard` - Get dashboard metrics
- `GET /harvests` - Get harvest analytics
- `GET /marketplace` - Get marketplace analytics
- `GET /financial` - Get financial analytics

**Protected Routes:**
- `GET /transactions` - Get transaction analytics
- `GET /fintech` - Get fintech analytics
- `GET /impact` - Get impact analytics
- `GET /weather` - Get weather analytics
- `GET /reports` - Get reports list
- `GET /export` - Export analytics
- `POST /compare` - Compare analytics
- `POST /regional` - Get regional analytics
- `GET /predictive` - Get predictive analytics
- `GET /summary` - Get analytics summary
- `GET /farmers/:farmerId` - Get farmer analytics
- `GET /partners/:partnerId` - Get partner analytics
- `GET /buyers/:buyerId` - Get buyer analytics
- `POST /report` - Generate custom report

#### 10. Notification Routes (`/api/notifications`)
- `GET /` - Get user notifications
- `POST /send` - Send notification
- `POST /send-bulk` - Send bulk notifications
- `PATCH /:notificationId/read` - Mark notification as read
- `PATCH /mark-all-read` - Mark all notifications as read
- `GET /preferences` - Get notification preferences
- `PUT /preferences` - Update notification preferences
- `PUT /push-token` - Update push token
- `POST /harvest` - Send harvest notification
- `POST /marketplace` - Send marketplace notification
- `POST /transaction` - Send transaction notification

#### 11. Shipment Routes (`/api/shipments`)
- `POST /` - Create shipment
- `GET /:shipmentId` - Get shipment by ID
- `GET /` - Get shipments with filters
- `PUT /:shipmentId/status` - Update shipment status
- `PUT /:shipmentId/delivery` - Confirm delivery
- `POST /:shipmentId/issues` - Report shipment issue
- `GET /stats/overview` - Get shipment statistics
- `GET /search/query` - Search shipments

#### 12. QR Code Routes (`/api/qr-codes`)
- `GET /` - Get user QR codes
- `POST /` - Generate new QR code
- `GET /stats` - Get QR code statistics
- `GET /:id` - Get QR code by ID
- `DELETE /:id` - Delete QR code

#### 13. Data Export/Import Routes (`/api/export-import`)
**Export Routes:**
- `POST /export/harvests` - Export harvests
- `POST /export/listings` - Export listings
- `POST /export/users` - Export users
- `POST /export/partners` - Export partners
- `POST /export/shipments` - Export shipments
- `POST /export/transactions` - Export transactions
- `POST /export/analytics` - Export analytics
- `POST /export/custom` - Export custom data

**Import Routes:**
- `POST /import/data` - Import data
- `POST /import/harvests` - Import harvests
- `POST /import/listings` - Import listings
- `POST /import/users` - Import users
- `POST /import/partners` - Import partners
- `POST /import/shipments` - Import shipments
- `POST /import/transactions` - Import transactions

**Utility Routes:**
- `GET /formats` - Get supported formats
- `GET /templates` - Get export templates
- `POST /validate-template` - Validate export template
- `GET /stats` - Get export statistics
- `POST /cleanup` - Cleanup old exports
- `GET /download/:filename` - Download export file
- `GET /health` - Health check

#### 14. Weather Routes (`/api/weather`)
- `GET /` - Get weather information

#### 15. Referral Routes (`/api/referrals`)
- `GET /` - Get referrals

#### 16. Payment Routes (`/api/payments`)
- `POST /` - Process payments

#### 17. Verification Routes (`/api/verify`)
- Various verification endpoints

### System Routes
- `GET /api/health` - System health check
- `GET /metrics` - Prometheus metrics
- `GET /` - Root endpoint

## Database Models

### Core Models

#### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  role: Enum ['farmer', 'buyer', 'partner', 'admin'],
  password: String (hashed),
  isVerified: Boolean,
  region: String,
  profile: {
    avatar: String,
    bio: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: { lat: Number, lng: Number }
  },
  preferences: {
    cropTypes: [String],
    locations: [String],
    priceRange: { min: Number, max: Number },
    qualityPreferences: [String],
    organicPreference: Boolean
  },
  settings: {
    language: String,
    timezone: String,
    currency: String,
    theme: String,
    notifications: Boolean,
    marketing: Boolean
  },
  stats: {
    totalHarvests: Number,
    totalListings: Number,
    totalOrders: Number,
    totalRevenue: Number,
    lastActive: Date
  },
  notificationPreferences: {
    email: Boolean,
    sms: Boolean,
    push: Boolean,
    inApp: Boolean,
    harvestUpdates: Boolean,
    marketplaceUpdates: Boolean,
    financialUpdates: Boolean,
    systemUpdates: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Farmer Profile Model
```javascript
{
  farmer: ObjectId (ref: User),
  farmDetails: {
    farmSize: Number,
    farmType: Enum ['crop', 'livestock', 'mixed'],
    location: {
      city: String,
      state: String,
      coordinates: [Number]
    }
  },
  crops: [String],
  experience: Number,
  certifications: [String],
  preferences: {
    language: String,
    notifications: Boolean,
    privacy: Enum ['public', 'private']
  },
  settings: {
    theme: String,
    currency: String
  }
}
```

#### Harvest Model
```javascript
{
  farmer: ObjectId (ref: User),
  cropType: String,
  quantity: Number,
  unit: Enum ['kg', 'tons', 'pieces'],
  harvestDate: Date,
  location: {
    city: String,
    state: String,
    coordinates: [Number]
  },
  quality: Enum ['A', 'B', 'C'],
  status: Enum ['pending', 'approved', 'rejected', 'shipped'],
  notes: String,
  images: [String],
  batchId: String (unique),
  createdAt: Date
}
```

#### Listing Model
```javascript
{
  farmer: ObjectId (ref: User),
  cropName: String,
  category: String,
  description: String,
  basePrice: Number,
  quantity: Number,
  unit: String,
  availableQuantity: Number,
  location: {
    city: String,
    state: String
  },
  images: [String],
  tags: [String],
  status: Enum ['draft', 'active', 'inactive', 'sold_out'],
  createdAt: Date
}
```

#### Order Model
```javascript
{
  buyer: ObjectId (ref: User),
  seller: ObjectId (ref: User),
  items: [OrderItem],
  total: Number,
  subtotal: Number,
  tax: Number,
  shipping: Number,
  discount: Number,
  status: Enum ['pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
  paymentStatus: Enum ['pending', 'paid', 'failed', 'refunded'],
  paymentMethod: String,
  shippingAddress: Address,
  deliveryInstructions: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  trackingNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Additional Models
- **Partner Model**: Organization details and farmer relationships
- **QR Code Model**: Batch tracking and provenance
- **Shipment Model**: Logistics and delivery tracking
- **Financial Models**: Credit scores, loans, insurance
- **Analytics Models**: Performance metrics and reporting
- **Notification Models**: User communication preferences

## Authentication & Authorization

### JWT Implementation
- **Token Type**: JSON Web Token (JWT)
- **Algorithm**: HS256
- **Expiration**: Configurable (default: 24 hours)
- **Refresh**: Automatic token refresh mechanism

### Role-Based Access Control (RBAC)
```javascript
const roles = {
  farmer: ['harvests', 'listings', 'profile', 'analytics'],
  buyer: ['marketplace', 'orders', 'profile', 'analytics'],
  partner: ['farmers', 'analytics', 'reports', 'bulk-operations'],
  admin: ['all-operations', 'user-management', 'system-config']
}
```

### Middleware Chain
1. **Rate Limiting**: Environment-based throttling
2. **Authentication**: JWT token validation
3. **Authorization**: Role-based endpoint access
4. **Validation**: Request data validation
5. **Sanitization**: Input sanitization
6. **Error Handling**: Centralized error management

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Custom API service
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner

### Project Structure
```
client/
├── app/                  # Next.js app directory
│   ├── dashboard/       # Dashboard pages
│   ├── analytics/       # Analytics pages
│   ├── marketplace/     # Marketplace pages
│   └── auth/           # Authentication pages
├── components/          # Reusable components
│   ├── ui/             # Base UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── analytics/      # Analytics components
│   ├── profile/        # Profile components
│   └── settings/       # Settings components
├── lib/                # Utility libraries
├── hooks/              # Custom React hooks
├── stores/             # Zustand state stores
└── types/              # TypeScript type definitions
```

### Key Features
- **Progressive Web App (PWA)**: Offline support and mobile optimization
- **Role-Based Routing**: Dynamic page rendering based on user role
- **Responsive Design**: Mobile-first responsive layout
- **Theme Support**: Light/dark mode with system preference detection
- **Internationalization**: Multi-language support (planned)
- **Real-time Updates**: WebSocket integration for live data
- **Offline Support**: Service worker for offline functionality

## Component Structure

### Core Components

#### Dashboard Layout
- **DashboardLayout**: Main dashboard wrapper
- **Sidebar**: Navigation and user info
- **Header**: Top navigation and actions
- **Breadcrumbs**: Page navigation context

#### Role-Specific Components
- **FarmerDashboard**: Farmer-specific dashboard
- **BuyerDashboard**: Buyer-specific dashboard
- **PartnerDashboard**: Partner-specific dashboard
- **AdminDashboard**: Admin-specific dashboard

#### Profile Management
- **FarmerProfile**: Farmer profile component
- **BuyerProfile**: Buyer profile component
- **PartnerProfile**: Partner profile component
- **AdminProfile**: Admin profile component
- **ProfilePictureUpload**: Avatar upload component

#### Settings Management
- **FarmerSettings**: Farmer settings component
- **BuyerSettings**: Buyer settings component
- **PartnerSettings**: Partner settings component
- **AdminSettings**: Admin settings component

#### Analytics Components
- **AnalyticsDashboard**: Main analytics view
- **PerformanceCharts**: Data visualization
- **TrendAnalysis**: Pattern recognition
- **WeatherImpact**: Climate correlation
- **PredictiveInsights**: Future projections

### UI Component Library
- **Card**: Content containers
- **Button**: Action buttons with variants
- **Input**: Form input fields
- **Select**: Dropdown selections
- **Tabs**: Tabbed content organization
- **Skeleton**: Loading state placeholders
- **Badge**: Status indicators
- **Avatar**: User profile pictures
- **Switch**: Toggle controls
- **Separator**: Visual dividers

## State Management

### Zustand Stores

#### User Store
```typescript
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

#### Analytics Store
```typescript
interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  
  fetchAnalytics: (params: AnalyticsParams) => Promise<void>;
  exportData: (format: string) => Promise<void>;
}
```

#### Profile Store
```typescript
interface ProfileState {
  profile: ProfileData | null;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  toggleEdit: () => void;
}
```

### Local State Management
- **React useState**: Component-level state
- **React useReducer**: Complex state logic
- **React Context**: Theme and global preferences
- **Local Storage**: User preferences and settings

## API Integration

### API Service Layer
```typescript
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

  // Role-specific methods
  async getFarmerProfile() {
    return this.request('/farmers/profile/me');
  }

  async getBuyerProfile() {
    return this.request('/users/profile/me');
  }

  async getAnalytics(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics?${queryString}`);
  }
}
```

### Error Handling
- **Network Errors**: Automatic retry with exponential backoff
- **Validation Errors**: User-friendly error messages
- **Authentication Errors**: Automatic token refresh or logout
- **Rate Limiting**: User notification and retry guidance

### Request/Response Interceptors
- **Authentication**: Automatic token injection
- **Loading States**: Global loading indicator management
- **Error Logging**: Centralized error logging and reporting
- **Caching**: Response caching for improved performance

## Deployment & DevOps

### Environment Configuration
```bash
# Development
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/grochain
JWT_SECRET=dev_secret_key
CORS_ORIGIN=http://localhost:3000

# Production
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/grochain
JWT_SECRET=production_secret_key
CORS_ORIGIN=https://grochain.ng
```

### Docker Configuration
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/.next /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### CI/CD Pipeline
```yaml
# GitHub Actions
name: Deploy GroChain
on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deployment commands
```

## Testing Strategy

### Testing Pyramid
1. **Unit Tests**: Component and function testing
2. **Integration Tests**: API and database testing
3. **E2E Tests**: Full user journey testing

### Testing Tools
- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Cypress**: E2E testing
- **Supertest**: API testing
- **MongoDB Memory Server**: Database testing

### Test Coverage Goals
- **Backend**: ≥90% code coverage
- **Frontend**: ≥80% code coverage
- **Critical Paths**: 100% coverage

## Security Considerations

### Data Protection
- **Encryption**: AES-256 for sensitive data
- **Hashing**: bcrypt for password storage
- **TLS**: HTTPS enforcement in production
- **Input Validation**: Comprehensive input sanitization

### Authentication Security
- **JWT Security**: Secure token storage and transmission
- **Password Policy**: Strong password requirements
- **Rate Limiting**: Brute force attack prevention
- **Session Management**: Secure session handling

### API Security
- **CORS**: Proper cross-origin configuration
- **Helmet**: Security headers middleware
- **Rate Limiting**: API abuse prevention
- **Input Sanitization**: XSS and injection prevention

### Infrastructure Security
- **Environment Variables**: Secure configuration management
- **Secrets Management**: Secure API key storage
- **Network Security**: VPC and firewall configuration
- **Monitoring**: Security event logging and alerting

---

## Conclusion

This comprehensive documentation provides a complete overview of the GroChain backend and frontend architecture. The system is designed with scalability, security, and maintainability in mind, following industry best practices and modern development patterns.

For additional information, refer to:
- [Backend API Endpoints Documentation](./BACKEND_API_ENDPOINTS_COMPREHENSIVE.md)
- [Farmer Role Guide](./FARMER_ROLE_COMPREHENSIVE_GUIDE.md)
- [Buyer Role Guide](./BUYERS_ROLE_COMPREHENSIVE_GUIDE.md)
- [Testing Documentation](./README-TESTING.md)
