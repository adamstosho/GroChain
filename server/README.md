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

### 7. Real-time WebSocket Integration

**Features**:
- Live notifications for all users
- Real-time payment updates
- Partner network communications
- User-specific notification channels
- WebSocket status monitoring

### 8. Enhanced Notification System

**New Endpoints**:
- Bulk notification sending (admin only)
- Transaction-specific notifications
- Harvest-specific notifications
- Marketplace event notifications
- Push token management
- User preference management

### 9. Advanced IoT & AI Integration

**IoT Features**:
- Sensor registration and management
- Real-time data monitoring
- Health status tracking
- Anomaly detection

**AI Features**:
- Crop disease detection via image analysis
- Yield prediction algorithms
- Market trend analysis
- Risk assessment models
- Predictive farming insights

### 10. Weather & Climate Integration

**Features**:
- Real-time weather data from OpenWeather API
- Agricultural insights and risk assessment
- Weather alerts and warnings
- Climate summary and recommendations
- Historical weather data analysis
- Regional weather statistics
- Growing degree days calculation
- Frost and drought risk assessment
- Pest risk evaluation
- Planting and irrigation recommendations

### 11. Multi-language & PWA Support

**Localization**:
- Multi-language support
- Dynamic translation system
- User language preferences
- Language statistics

**PWA Features**:
- Offline-first architecture
- Service worker implementation
- Installation instructions
- Offline page support

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
- `GET /api/notifications/preferences` - Get user notification preferences
- `PUT /api/notifications/preferences` - Update user notification preferences
- `PUT /api/notifications/push-token` - Update push notification token
- `POST /api/notifications/send-bulk` - Send bulk notifications (admin only)
- `POST /api/notifications/transaction` - Send transaction notification
- `POST /api/notifications/harvest` - Send harvest notification
- `POST /api/notifications/marketplace` - Send marketplace notification

### WebSocket (Real-time Communication)
- `GET /api/websocket/status` - Get WebSocket connection status
- `POST /api/websocket/notify-user` - Send real-time notification to specific user
- `POST /api/websocket/notify-partner-network` - Send real-time notification to partner network

### Weather & Climate Integration
- `GET /api/weather/current` - Get current weather for a location
- `GET /api/weather/forecast` - Get weather forecast for a location
- `GET /api/weather/agricultural-insights` - Get agricultural insights for a location
- `GET /api/weather/alerts` - Get weather alerts for a location
- `GET /api/weather/climate-summary` - Get climate summary for a location
- `GET /api/weather/coordinates/:lat/:lng` - Get weather data by coordinates
- `GET /api/weather/statistics/:region` - Get weather statistics for a region
- `GET /api/weather/regional-alerts` - Get all weather alerts for a region
- `GET /api/weather/historical` - Get historical weather data for analysis

### IoT Sensors
- `POST /api/iot/sensors` - Register new IoT sensor
- `GET /api/iot/sensors` - Get all sensors for authenticated farmer
- `GET /api/iot/sensors/:sensorId` - Get specific sensor details
- `PUT /api/iot/sensors/:sensorId` - Update sensor data
- `GET /api/iot/sensors/:sensorId/readings` - Get sensor readings
- `GET /api/iot/sensors/:sensorId/alerts` - Get sensor alerts
- `GET /api/iot/sensors/health/summary` - Get sensor health summary

### Image Recognition & AI
- `POST /api/image-recognition/analyze` - Analyze crop image for disease detection
- `GET /api/image-recognition/analyses` - Get all crop analyses for authenticated farmer
- `GET /api/image-recognition/analyses/:analysisId` - Get specific crop analysis
- `GET /api/image-recognition/analyses/crop/:cropType` - Get analyses by crop type
- `GET /api/image-recognition/analyses/risk/high` - Get high-risk analyses
- `POST /api/ai/crop-recommendations` - Get AI-powered crop recommendations
- `POST /api/ai/yield-prediction` - Get AI-powered yield prediction
- `GET /api/ai/market-insights` - Get AI-powered market insights
- `GET /api/ai/farming-insights` - Get AI-powered farming insights
- `GET /api/ai/farming-recommendations` - Get AI-powered farming recommendations
- `GET /api/ai/analytics-dashboard` - Get AI analytics dashboard data
- `GET /api/ai/seasonal-calendar` - Get AI-powered seasonal farming calendar
- `GET /api/ai/weather-prediction` - Get AI-powered weather prediction
- `GET /api/ai/market-trends` - Get AI-powered market trend analysis
- `POST /api/ai/risk-assessment` - Get AI-powered risk assessment
- `POST /api/ai/predictive-insights` - Get comprehensive AI predictive insights

### Advanced Machine Learning
- `GET /api/advanced-ml/sensors/:sensorId/maintenance` - Get predictive maintenance for IoT sensor
- `GET /api/advanced-ml/sensors/:sensorId/anomalies` - Detect anomalies in sensor data
- `GET /api/advanced-ml/optimize/irrigation` - Get irrigation optimization recommendations
- `GET /api/advanced-ml/optimize/fertilizer` - Get fertilizer optimization recommendations
- `GET /api/advanced-ml/optimize/harvest` - Get harvest optimization recommendations
- `GET /api/advanced-ml/insights/sensor-health` - Get sensor health insights
- `GET /api/advanced-ml/insights/efficiency-score` - Get farming efficiency score
- `GET /api/advanced-ml/models/performance` - Get ML model performance metrics

### Language & Localization
- `GET /api/languages` - Get supported languages
- `POST /api/languages/translations` - Get translations for specific keys
- `GET /api/languages/translations/:language` - Get all translations for a specific language
- `GET /api/languages/:language` - Get language information
- `PUT /api/languages/preference` - Update user language preference
- `GET /api/languages/stats` - Get language statistics

### Offline Sync & PWA
- `POST /api/sync/offline-data` - Queue offline data for synchronization
- `POST /api/sync/sync-user` - Sync user offline data
- `GET /api/sync/status/:userId` - Get sync status for a user
- `POST /api/sync/force-sync` - Force sync for specific data
- `GET /api/sync/history/:userId` - Get sync history for a user
- `GET /api/sync/stats` - Get sync statistics (admin only)
- `GET /api/pwa/manifest` - Get PWA manifest file
- `GET /api/pwa/service-worker` - Get service worker script
- `GET /api/pwa/offline` - Get offline page
- `GET /api/pwa/install` - Get installation instructions

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
