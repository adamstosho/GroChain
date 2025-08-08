# GroChain Backend

A production-ready MERN-stack backend for GroChain - Digital Trust Platform for Nigeria's Agriculture.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Partner Management**: Bulk onboarding, referral tracking, commission management
- **CSV Upload for Bulk Farmer Onboarding**: Upload CSV files to onboard multiple farmers at once
- **Real SMS Integration**: Twilio SMS integration for notifications and invitations
- **QR Code Verification**: Public QR code verification endpoint for harvest provenance
- **Enhanced Partner Analytics**: Detailed revenue tracking, farmer engagement metrics
- **Commission Calculation System**: Automatic commission calculation and distribution
- **Transaction Tracking**: Comprehensive transaction logging and management
- **Supply Chain Tracking**: Harvest logging, QR codes, shipment tracking
- **Marketplace**: Product listings, orders, payments via Paystack
- **Fintech Integration**: Credit scoring, loan referrals
- **Analytics**: System overview and partner-specific metrics
- **Notifications**: SMS, email, USSD support
- **API Documentation**: Interactive Swagger UI
- **Testing**: Comprehensive test suite with Jest
- **Docker Support**: Containerized deployment
- **Security**: Rate limiting, input validation, CORS protection

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi schema validation
- **Logging**: Pino structured logging
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker + Docker Compose
- **SMS**: Twilio integration
- **File Upload**: Multer with CSV parsing
- **QR Codes**: QRCode generation and verification

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Docker (optional)
- Twilio account (for SMS functionality)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd server
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Database Setup

```bash
# Start MongoDB (if using local)
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api/docs`
- **Health Check**: `http://localhost:5000/health`

## 🔧 New Features Implementation

### 1. CSV Upload for Bulk Farmer Onboarding

**Endpoint**: `POST /api/partners/upload-csv`

Upload a CSV file to onboard multiple farmers at once. The CSV should have columns: `name`, `email`, `phone`, `password` (optional).

**Example CSV Format**:
```csv
name,email,phone,password
John Doe,john@example.com,+2348012345678,password123
Jane Smith,jane@example.com,+2348023456789,password123
```

**Template Download**: `GET /public/farmers-template.csv`

### 2. Real SMS Integration (Twilio)

**Environment Variables Required**:
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

**Features**:
- Automatic SMS invitations for new farmers
- Bulk SMS sending
- Nigerian phone number formatting (+234)
- Fallback to console logging if Twilio not configured

### 3. QR Code Verification Endpoint

**Public Endpoint**: `GET /api/harvests/verify/:batchId`

No authentication required. Returns comprehensive verification data including:
- Harvest details
- Farmer information
- Geographic location
- Verification timestamp

### 4. Enhanced Partner Dashboard Analytics

**Endpoint**: `GET /api/partners/:id/metrics`

Enhanced metrics include:
- Revenue tracking (total, monthly, per farmer)
- Farmer engagement rates
- Commission breakdown
- Performance trends (6-month history)
- Top performing farmers
- Conversion rates and growth metrics

### 5. Commission Calculation System

**Endpoints**:
- `GET /api/commissions/summary` - Commission summary
- `GET /api/commissions/history` - Commission history
- `POST /api/commissions/withdraw` - Request withdrawal

**Features**:
- Automatic commission calculation (5% default rate)
- Transaction-based commission tracking
- Withdrawal processing
- Commission history with pagination

### 6. Transaction Tracking

**New Model**: `Transaction` with types:
- Payment transactions
- Commission transactions
- Refund transactions
- Withdrawal transactions

**Features**:
- Comprehensive transaction logging
- Payment provider integration
- Metadata storage
- Performance indexing

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Partners
- `POST /api/partners/bulk-onboard` - Bulk farmer onboarding (JSON)
- `POST /api/partners/upload-csv` - Bulk farmer onboarding (CSV)
- `GET /api/partners/:id/metrics` - Enhanced partner analytics

### Commissions
- `GET /api/commissions/summary` - Commission summary
- `GET /api/commissions/history` - Commission history
- `POST /api/commissions/withdraw` - Request withdrawal

### Harvests
- `POST /api/harvests` - Create harvest record
- `GET /api/harvests/:batchId` - Get harvest provenance (authenticated)
- `GET /api/harvests/verify/:batchId` - Public QR verification

### Marketplace
- `GET /api/marketplace/listings` - Get product listings
- `POST /api/marketplace/listings` - Create listing
- `POST /api/marketplace/orders` - Create order
- `PUT /api/marketplace/orders/:id/status` - Update order status

### Payments
- `POST /api/payments/initialize` - Initialize Paystack payment
- `POST /api/payments/verify` - Verify payment webhook

### Analytics
- `GET /api/analytics/overview` - System overview
- `GET /api/analytics/partner/:partnerId` - Partner analytics

### Notifications
- `POST /api/notifications/send` - Send notification
- `GET /api/notifications/:userId` - Get user notifications

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://...
export JWT_SECRET=your-super-secret-key
export TWILIO_ACCOUNT_SID=your_twilio_account_sid
export TWILIO_AUTH_TOKEN=your_twilio_auth_token
export TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 2. Build and Deploy
```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### 3. Docker Production
```bash
# Build production image
docker build -t grochain-backend .

# Run with environment variables
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=... \
  -e TWILIO_ACCOUNT_SID=... \
  -e TWILIO_AUTH_TOKEN=... \
  -e TWILIO_PHONE_NUMBER=... \
  grochain-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api/docs`
- Review the test files for usage examples
- Open an issue for bugs or feature requests
