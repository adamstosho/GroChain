# GroChain Backend - Comprehensive Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design](#architecture--design)
4. [Core Features](#core-features)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [Authentication & Authorization](#authentication--authorization)
8. [Payment Integration](#payment-integration)
9. [Real-time Features](#real-time-features)
10. [Analytics & Reporting](#analytics--reporting)
11. [Security Features](#security-features)
12. [Deployment & Configuration](#deployment--configuration)
13. [Development Workflow](#development-workflow)

## Project Overview

**GroChain** is a comprehensive agricultural supply chain management platform designed to connect farmers, partners, buyers, and other stakeholders in the Nigerian agricultural ecosystem. The backend serves as the core API that powers the entire platform, providing robust functionality for harvest tracking, marketplace operations, financial services, and analytics.

### Key Objectives
- **Digital Agricultural Supply Chain**: Enable end-to-end traceability of agricultural products
- **Financial Inclusion**: Provide farmers with access to credit, insurance, and payment solutions
- **Market Access**: Connect farmers directly to buyers through a digital marketplace
- **Data-Driven Insights**: Offer analytics and reporting for informed decision-making
- **Real-time Communication**: Facilitate seamless communication between stakeholders

## Technology Stack

### Core Technologies
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi schema validation
- **Logging**: Pino logger with HTTP middleware

### External Integrations
- **Payment Processing**: Paystack API
- **SMS Services**: Twilio
- **Email Services**: SendGrid & SMTP
- **Cloud Storage**: Cloudinary
- **Weather Data**: OpenWeather API
- **Push Notifications**: Firebase Cloud Messaging
- **USSD Gateway**: Africa's Talking

### Development Tools
- **Testing**: Jest with Supertest
- **Linting**: ESLint with TypeScript support
- **Documentation**: Swagger/OpenAPI
- **Monitoring**: Prometheus metrics
- **Containerization**: Docker support

## Architecture & Design

### Project Structure
```
server/
├── src/
│   ├── controllers/     # Business logic handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API route definitions
│   ├── middlewares/    # Custom middleware
│   ├── services/       # Business services
│   ├── utils/          # Utility functions
│   ├── validations/    # Input validation schemas
│   └── types/          # TypeScript type definitions
├── public/             # Static files (CSV templates, Swagger docs)
├── dist/              # Compiled JavaScript
└── tests/             # Test files
```

### Design Patterns
- **MVC Architecture**: Clear separation of concerns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic encapsulation
- **Middleware Chain**: Request processing pipeline
- **Role-Based Access Control**: Granular permissions

## Core Features

### 1. User Management & Authentication
- **Multi-role System**: Farmers, Partners, Buyers, Admins
- **JWT Authentication**: Secure token-based authentication
- **Email Verification**: Account verification workflow
- **SMS OTP**: Phone number verification
- **Password Management**: Reset and change functionality
- **Session Management**: Refresh token rotation

### 2. Harvest Management & Traceability
- **QR Code Generation**: Unique batch identification
- **Geolocation Tracking**: Farm location recording
- **Quality Assessment**: Partner verification system
- **Status Workflow**: Pending → Verified → Approved/Rejected
- **Image Upload**: Cloudinary integration for harvest photos
- **Public Verification**: QR code scanning for consumers

### 3. Digital Marketplace
- **Product Listings**: Rich product catalog with pricing
- **Order Management**: Complete order lifecycle
- **Search & Filtering**: Advanced product discovery
- **Favorites System**: User wishlist functionality
- **Order Tracking**: Real-time delivery status
- **Commission System**: Partner revenue sharing

### 4. Financial Services (FinTech)
- **Credit Scoring**: Farmer credit assessment
- **Loan Management**: Application and tracking
- **Insurance Services**: Crop and equipment insurance
- **Payment Processing**: Paystack integration
- **Transaction History**: Complete financial records
- **Financial Analytics**: Performance insights

### 5. Partner Management
- **Bulk Onboarding**: CSV-based farmer registration
- **Partner Dashboard**: Performance metrics
- **Commission Tracking**: Revenue sharing
- **Farmer Management**: Relationship oversight
- **Quality Control**: Harvest verification

### 6. Analytics & Reporting
- **Dashboard Metrics**: Real-time platform statistics
- **User Analytics**: Behavior and engagement insights
- **Transaction Analytics**: Financial performance
- **Harvest Analytics**: Production and quality metrics
- **Marketplace Analytics**: Sales and demand trends
- **Export Capabilities**: Government/NGO reporting

### 7. Weather & Agricultural Insights
- **Current Weather**: Real-time weather data
- **Forecasting**: Weather predictions
- **Agricultural Insights**: Farming recommendations
- **Weather Alerts**: Critical weather notifications
- **Historical Data**: Climate analysis
- **Regional Statistics**: Location-based insights

### 8. Notification System
- **Multi-channel Delivery**: SMS, Email, Push, USSD
- **Preference Management**: User-controlled settings
- **Bulk Notifications**: Mass communication
- **Transactional Notifications**: Payment confirmations
- **Harvest Notifications**: Status updates
- **Marketplace Alerts**: Order and listing updates

## API Endpoints

### Authentication (`/api/auth`)
```
POST   /register              # User registration
POST   /login                 # User login
POST   /refresh               # Token refresh
POST   /forgot-password       # Password reset request
POST   /reset-password        # Password reset
POST   /verify-email          # Email verification
POST   /resend-verification   # Resend verification email
POST   /send-sms-otp          # Send SMS OTP
POST   /verify-sms-otp        # Verify SMS OTP
GET    /protected             # Protected route test
GET    /health                # Health check
```

### User Management (`/api/users`)
```
GET    /overview              # User overview (Admin/Manager)
GET    /dashboard             # User dashboard
GET    /                      # Get all users
GET    /:userId               # Get specific user
POST   /                      # Create user
PUT    /:userId               # Update user
DELETE /:userId               # Delete user
POST   /bulk-create           # Bulk user creation
PUT    /bulk-update           # Bulk user updates
DELETE /bulk-delete           # Bulk user deletion
GET    /search                # Search users
GET    /:userId/stats         # User statistics
GET    /:userId/activity      # User activity
POST   /:userId/verify        # Verify user
PATCH  /:userId/suspend       # Suspend user
PATCH  /:userId/reactivate    # Reactivate user
PATCH  /:userId/role          # Change user role
POST   /export                # Export user data
GET    /profile/me            # Get own profile
PUT    /profile/me            # Update own profile
GET    /preferences/me        # Get preferences
PUT    /preferences/me        # Update preferences
GET    /settings/me           # Get settings
PUT    /settings/me           # Update settings
POST   /change-password       # Change password
POST   /reset-password        # Reset password
```

### Partner Management (`/api/partners`)
```
GET    /test                  # Test endpoint
POST   /onboard-farmer        # Single farmer onboarding
POST   /bulk-onboard          # Bulk farmer onboarding
POST   /upload-csv            # CSV-based onboarding
GET    /                      # Get all partners
GET    /:id                   # Get partner by ID
POST   /                      # Create partner
PUT    /:id                   # Update partner
DELETE /:id                   # Delete partner
GET    /:id/metrics           # Partner metrics
```

### Harvest Management (`/api/harvests`)
```
GET    /                      # Get harvests (with filters)
POST   /                      # Create harvest
GET    /:batchId              # Get harvest provenance
GET    /provenance/:batchId   # Get harvest provenance
GET    /verify/:batchId       # Public QR verification
```

### Harvest Approval (`/api/harvest-approval`)
```
GET    /pending               # Get pending harvests
PATCH  /:harvestId/approve    # Approve harvest
PATCH  /:harvestId/reject     # Reject harvest
POST   /:harvestId/create-listing # Create marketplace listing
```

### Marketplace (`/api/marketplace`)
```
GET    /listings              # Get all listings
GET    /listings/:id          # Get specific listing
GET    /search-suggestions    # Get search suggestions
PATCH  /listings/:id          # Update listing
PATCH  /listings/:id/unpublish # Unpublish listing
POST   /listings              # Create listing
POST   /orders                # Create order
PATCH  /orders/:id/status     # Update order status
GET    /orders/buyer/:buyerId # Get buyer orders
GET    /orders/:id            # Get order details
PATCH  /orders/:id/cancel     # Cancel order
GET    /orders/:id/tracking   # Get order tracking
GET    /favorites/:userId     # Get user favorites
POST   /favorites             # Add to favorites
DELETE /favorites/:userId/:listingId # Remove from favorites
POST   /upload-image          # Upload listing images
```

### Financial Services (`/api/fintech`)
```
GET    /credit-score/:farmerId # Get farmer credit score
POST   /loan-referrals        # Create loan referral
GET    /loan-applications     # Get loan applications
POST   /loan-applications     # Create loan application
GET    /loan-stats            # Get loan statistics
GET    /insurance-policies    # Get insurance policies
GET    /insurance-stats       # Get insurance statistics
POST   /insurance-quotes      # Create insurance quote
POST   /insurance-claims      # Create insurance claim
GET    /financial-health      # Get financial health
GET    /crop-financials       # Get crop financials
GET    /financial-projections # Get financial projections
POST   /financial-goals       # Create financial goal
```

### Analytics (`/api/analytics`)
```
GET    /dashboard             # Dashboard metrics
GET    /farmers               # Farmer analytics
GET    /transactions          # Transaction analytics
GET    /harvests              # Harvest analytics
GET    /marketplace           # Marketplace analytics
GET    /fintech               # Fintech analytics
GET    /impact                # Impact analytics
GET    /partners              # Partner analytics
GET    /weather               # Weather analytics
POST   /report                # Generate report
GET    /reports               # Get reports
GET    /export                # Export analytics data
POST   /compare               # Comparative analytics
POST   /regional              # Regional analytics
GET    /predictive            # Predictive analytics
GET    /summary               # Analytics summary
GET    /partner/:partnerId    # Partner dashboard
GET    /partner/:partnerId/stats # Partner statistics
GET    /farmer/:farmerId      # Farmer dashboard
GET    /farmer/:farmerId/stats # Farmer statistics
GET    /buyer/:buyerId        # Buyer dashboard
GET    /buyer/:buyerId/stats  # Buyer statistics
GET    /agency/:agencyId      # Agency dashboard
GET    /agency/:agencyId/stats # Agency statistics
```

### Payment Processing (`/api/payments`)
```
GET    /config                # Get payment configuration
POST   /initialize            # Initialize payment
POST   /verify                # Payment webhook verification
```

### Notifications (`/api/notifications`)
```
POST   /send                  # Send notification
POST   /send-bulk             # Send bulk notifications
GET    /preferences           # Get notification preferences
PUT    /preferences           # Update notification preferences
PUT    /push-token            # Update push token
POST   /transaction           # Send transaction notification
POST   /harvest               # Send harvest notification
POST   /marketplace           # Send marketplace notification
```

### Weather Services (`/api/weather`)
```
GET    /current               # Current weather
GET    /forecast              # Weather forecast
GET    /agricultural-insights # Agricultural insights
GET    /alerts                # Weather alerts
GET    /historical            # Historical weather data
GET    /coordinates/:lat/:lng # Weather by coordinates
GET    /statistics/:region    # Weather statistics
GET    /regional-alerts       # Regional alerts
GET    /climate-summary       # Climate summary
```

### QR Code Management (`/api/qr-codes`)
```
GET    /                      # Get user QR codes
POST   /                      # Generate new QR code
GET    /stats                 # QR code statistics
```

### Public Verification (`/api/verify`)
```
GET    /:batchId              # Public QR verification
```

### Farmer Management (`/api/farmers`)
```
GET    /profile/me            # Get farmer profile
PUT    /profile/me            # Update farmer profile
GET    /preferences/me        # Get farmer preferences
PUT    /preferences/me        # Update farmer preferences
GET    /settings/me           # Get farmer settings
PUT    /settings/me           # Update farmer settings
```

## Data Models

### Core Models

#### User Model
```typescript
interface IUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'farmer' | 'partner' | 'admin' | 'buyer';
  status: 'active' | 'inactive' | 'suspended';
  partner?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  location?: string;
  gender?: string;
  age?: number;
  education?: string;
  suspensionReason?: string;
  suspendedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  smsOtpToken?: string;
  smsOtpExpires?: Date;
  smsOtpAttempts?: number;
  pushToken?: string;
  notificationPreferences: NotificationPreferences;
}
```

#### Harvest Model
```typescript
interface IHarvest {
  farmer: ObjectId;
  cropType: string;
  quantity: number;
  date: Date;
  geoLocation: { lat: number; lng: number };
  batchId: string;
  qrData: string;
  status: 'pending' | 'verified' | 'rejected' | 'approved';
  verifiedBy?: ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  description?: string;
  unit: string;
  location: string;
  images: string[];
}
```

#### Product Model
```typescript
interface IProduct {
  cropName?: string;
  category: string;
  variety?: string;
  description?: string;
  basePrice?: number;
  unit: string;
  seasonality: string[];
  qualityGrade: 'premium' | 'standard' | 'basic';
  organic: boolean;
  certifications: string[];
  storageLife: number;
  nutritionalValue?: NutritionalInfo;
  farmingPractices: string[];
  pestResistance: string[];
  diseaseResistance: string[];
  yieldPotential?: number;
  maturityDays?: number;
  waterRequirement?: 'low' | 'medium' | 'high';
  soilType: string[];
  climateZone: string[];
  marketDemand: 'high' | 'medium' | 'low';
  exportPotential: boolean;
  processingRequirements: string[];
  packagingOptions: string[];
  transportationRequirements: string[];
}
```

#### Transaction Model
```typescript
interface ITransaction {
  type: 'payment' | 'commission' | 'refund' | 'withdrawal' | 'platform_fee';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  reference: string;
  description: string;
  userId: ObjectId;
  partnerId?: ObjectId;
  orderId?: ObjectId;
  referralId?: ObjectId;
  paymentProvider: string;
  paymentProviderReference: string;
  metadata: Record<string, any>;
  processedAt: Date;
}
```

### Supporting Models
- **Order Model**: Marketplace order management
- **Listing Model**: Product listings
- **Partner Model**: Partner organization data
- **Notification Model**: Notification records
- **Weather Model**: Weather data storage
- **Analytics Model**: Analytics data
- **Commission Model**: Commission tracking
- **Credit Score Model**: Credit assessment data
- **BVN Verification Model**: Bank verification data
- **Referral Model**: Referral tracking
- **Shipment Model**: Delivery tracking

## Authentication & Authorization

### JWT Implementation
- **Access Tokens**: 24-hour expiration
- **Refresh Tokens**: 30-day expiration
- **Token Rotation**: Automatic refresh token rotation
- **Secure Storage**: HTTP-only cookies for refresh tokens

### Role-Based Access Control (RBAC)
```typescript
enum UserRole {
  FARMER = 'farmer',
  PARTNER = 'partner',
  ADMIN = 'admin',
  BUYER = 'buyer'
}
```

### Permission Matrix
- **Farmers**: Harvest management, marketplace listings, financial services
- **Partners**: Farmer onboarding, harvest verification, analytics
- **Buyers**: Marketplace browsing, order placement, payment
- **Admins**: Full system access, user management, analytics

### Security Features
- **Password Hashing**: bcrypt with 12 rounds
- **Rate Limiting**: Configurable per endpoint
- **Input Sanitization**: XSS and injection prevention
- **CORS Protection**: Configurable origin restrictions
- **Helmet Security**: HTTP security headers
- **Request Validation**: Joi schema validation

## Payment Integration

### Paystack Integration
- **Payment Initialization**: Order payment setup
- **Webhook Processing**: Payment verification
- **Transaction Tracking**: Complete payment lifecycle
- **Error Handling**: Comprehensive error management

### Payment Flow
1. **Order Creation**: Buyer creates marketplace order
2. **Payment Initialization**: System creates Paystack transaction
3. **Payment Processing**: Buyer completes payment
4. **Webhook Verification**: Paystack confirms payment
5. **Order Fulfillment**: System processes successful payment
6. **Commission Distribution**: Partner commissions calculated

### Commission System
- **Default Rate**: 5% platform commission
- **Partner Commission**: Configurable partner rates
- **Withdrawal Threshold**: Minimum withdrawal amounts
- **Transaction Tracking**: Complete commission history

## Real-time Features

### WebSocket Integration
- **Socket.io Implementation**: Real-time communication
- **Event Broadcasting**: Live updates across platform
- **Connection Management**: Efficient connection handling
- **Room-based Messaging**: Targeted notifications

### Real-time Events
- **Order Updates**: Live order status changes
- **Payment Confirmations**: Instant payment notifications
- **Harvest Approvals**: Real-time approval notifications
- **Marketplace Activity**: Live listing and order updates
- **Weather Alerts**: Critical weather notifications

## Analytics & Reporting

### Dashboard Metrics
- **User Statistics**: Registration, activity, engagement
- **Transaction Analytics**: Revenue, volume, trends
- **Harvest Analytics**: Production, quality, approval rates
- **Marketplace Analytics**: Sales, demand, inventory
- **Financial Analytics**: Credit scores, loan performance
- **Weather Analytics**: Climate impact on agriculture

### Reporting Capabilities
- **Export Formats**: CSV, JSON, PDF
- **Custom Date Ranges**: Flexible time period selection
- **Comparative Analysis**: Period-over-period comparisons
- **Regional Analytics**: Location-based insights
- **Predictive Analytics**: Forecasting capabilities
- **Government Reporting**: Compliance-ready exports

### Data Visualization
- **Real-time Charts**: Live dashboard updates
- **Interactive Graphs**: User-friendly data exploration
- **Mobile Responsive**: Optimized for all devices
- **Export Capabilities**: Chart and data export

## Security Features

### Authentication Security
- **JWT Token Security**: Secure token generation and validation
- **Password Policies**: Strong password requirements
- **Account Lockout**: Brute force protection
- **Session Management**: Secure session handling
- **Multi-factor Authentication**: SMS OTP verification

### Data Security
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Cross-site request forgery prevention
- **Data Encryption**: Sensitive data encryption

### API Security
- **Rate Limiting**: Request throttling
- **CORS Configuration**: Cross-origin resource sharing
- **Security Headers**: HTTP security headers
- **Request Logging**: Comprehensive audit trails
- **Error Handling**: Secure error responses

## Deployment & Configuration

### Environment Configuration
```bash
# Core Configuration
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d

# External Services
PAYSTACK_SECRET_KEY=...
TWILIO_ACCOUNT_SID=...
SENDGRID_API_KEY=...
CLOUDINARY_CLOUD_NAME=...

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12
```

### Docker Support
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

### Production Deployment
- **Environment Variables**: Secure configuration management
- **Database Optimization**: Indexing and query optimization
- **Load Balancing**: Horizontal scaling support
- **Monitoring**: Prometheus metrics and health checks
- **Logging**: Structured logging with Pino
- **Backup Strategy**: Automated database backups

## Development Workflow

### Development Scripts
```json
{
  "dev": "ts-node src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "test": "jest --coverage",
  "lint": "eslint . --ext .ts",
  "seed": "ts-node scripts/seed.ts"
}
```

### Testing Strategy
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete workflow testing
- **Test Coverage**: Comprehensive coverage reporting
- **Mock Services**: External service mocking

### Code Quality
- **TypeScript**: Strong typing throughout
- **ESLint**: Code style enforcement
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit validation
- **Documentation**: Comprehensive API documentation

### API Documentation
- **Swagger/OpenAPI**: Interactive API documentation
- **Endpoint Descriptions**: Detailed endpoint documentation
- **Request/Response Examples**: Usage examples
- **Authentication Guide**: Security documentation
- **Error Codes**: Comprehensive error documentation

## Conclusion

The GroChain backend represents a comprehensive, production-ready agricultural supply chain management platform. With its robust architecture, extensive feature set, and focus on security and scalability, it provides a solid foundation for digital transformation in the agricultural sector.

The platform successfully addresses key challenges in agricultural supply chains:
- **Traceability**: End-to-end product tracking
- **Financial Inclusion**: Access to credit and payment solutions
- **Market Access**: Direct buyer-seller connections
- **Data-Driven Decisions**: Comprehensive analytics and insights
- **Real-time Communication**: Seamless stakeholder interaction

The modular design, comprehensive testing, and extensive documentation make it maintainable and extensible for future enhancements and integrations.
