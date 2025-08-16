# GroChain API Documentation

## Overview
The GroChain API provides comprehensive services for agricultural technology, including AI-powered recommendations, marketplace operations, financial services, and more.

## Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://api.grochain.com`

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
- **Standard users**: 100 requests per hour
- **Premium users**: 1000 requests per hour
- **Admin users**: 5000 requests per hour

## Error Handling
All endpoints return consistent error responses:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### AI Services
- `POST /api/ai/recommendations` - Get AI-powered recommendations
- `POST /api/ai/chat` - AI chat assistance
- `GET /api/ai/analytics` - AI analytics insights

### Marketplace
- `GET /api/marketplace/products` - List marketplace products
- `POST /api/marketplace/products` - Create new product listing
- `GET /api/marketplace/products/:id` - Get product details
- `PUT /api/marketplace/products/:id` - Update product listing
- `DELETE /api/marketplace/products/:id` - Delete product listing

### Financial Services
- `POST /api/fintech/loans/apply` - Apply for agricultural loan
- `GET /api/fintech/loans/status/:id` - Check loan application status
- `POST /api/fintech/payments/initiate` - Initiate payment
- `GET /api/fintech/payments/status/:id` - Check payment status

### Weather Services
- `GET /api/weather/current` - Get current weather (lat,lng,city,state,country)
- `GET /api/weather/forecast` - Get weather forecast (lat,lng,city,state,country[,days])
- `GET /api/weather/agricultural-insights` - Get agricultural insights (lat,lng,city,state,country)
- `GET /api/weather/alerts` - Get weather alerts (lat,lng,city,state,country)
- `GET /api/weather/coordinates/:lat/:lng` - Get weather data by coordinates
- `GET /api/weather/statistics/:region` - Get regional weather statistics
- `GET /api/weather/regional-alerts?region=STATE` - Get all alerts for a region
- `GET /api/weather/historical` - Get historical data (lat,lng,city,state,country,startDate,endDate)

### IoT & Sensors
- `POST /api/iot/sensors/data` - Submit sensor data
- `GET /api/iot/sensors/status` - Get sensor status
- `POST /api/iot/sensors/calibrate` - Calibrate sensors

### Analytics & Reporting
- `GET /api/analytics/dashboard` - Get analytics dashboard
- `GET /api/analytics/reports` - Generate reports
- `POST /api/analytics/export` - Export analytics data

### Notifications
- `GET /api/notifications/preferences` - Get user notification preferences
- `PUT /api/notifications/preferences` - Update user notification preferences
- `PUT /api/notifications/push-token` - Set device push token for the authenticated user
- `POST /api/notifications/send` - Send a notification to a user (admin/partner)
- `POST /api/notifications/send-bulk` - Send notifications to multiple users (admin)

### Partner Services
- `GET /api/partners` - List partner organizations
- `POST /api/partners/apply` - Apply for partnership
- `GET /api/partners/status/:id` - Check partnership application status

### Referral System
- `POST /api/referrals/generate` - Generate referral code
- `GET /api/referrals/stats` - Get referral statistics
- `POST /api/referrals/redeem` - Redeem referral bonus

### Commission Management
- `GET /api/commission/earnings` - Get commission earnings
- `POST /api/commission/withdraw` - Request commission withdrawal
- `GET /api/commission/history` - Get commission history

### Image Recognition
- `POST /api/ai/images/analyze` - Analyze crop images
- `POST /api/ai/images/disease` - Detect plant diseases
- `POST /api/ai/images/quality` - Assess crop quality

### Language & Localization
- `GET /api/language/supported` - Get supported languages
- `POST /api/language/translate` - Translate content
- `GET /api/language/current` - Get current language setting

### PWA Services
- `GET /api/pwa/manifest` - Get PWA manifest
- `POST /api/pwa/install` - Register PWA installation
- `GET /api/pwa/updates` - Check for PWA updates

### Shipment & Logistics
- `POST /api/shipments/create` - Create shipment
- `GET /api/shipments/track/:id` - Track shipment
- `PUT /api/shipments/update/:id` - Update shipment status

### Sync Services
- `POST /api/sync/upload` - Upload offline data
- `GET /api/sync/status` - Check sync status
- `POST /api/sync/conflict-resolve` - Resolve sync conflicts

### Advanced ML Services
- `POST /api/ml/predict` - Make ML predictions
- `POST /api/ml/train` - Train ML models
- `GET /api/ml/models` - List available ML models

## BVN Verification Services

The BVN (Bank Verification Number) verification service provides secure identity verification for users in the GroChain platform.

### Endpoints

#### 1. Verify BVN
**POST** `/api/verification/bvn`

Verify a user's BVN for identity confirmation.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "bvn": "12345678901",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "phoneNumber": "+2348012345678"
}
```

**Response**:
```json
{
  "isValid": true,
  "message": "BVN verification successful",
  "userDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Michael",
    "dateOfBirth": "1990-01-01",
    "phoneNumber": "+2348012345678",
    "bankName": "First Bank",
    "accountNumber": "1234567890"
  },
  "verificationId": "ver_123456789",
  "timestamp": "2024-01-15T10:30:00Z",
  "verificationMethod": "online"
}
```

#### 2. Get Verification Status
**GET** `/api/verification/status/{userId}`

Check the verification status for a specific user.

**Authentication**: Required (Bearer token)

**Path Parameters**:
- `userId` (string, required): The ID of the user to check

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "verificationStatus": "verified",
    "verificationMethod": "online",
    "verifiedAt": "2024-01-15T10:30:00Z",
    "lastAttempt": "2024-01-15T10:30:00Z",
    "attemptsCount": 1
  }
}
```

#### 3. Offline BVN Verification
**POST** `/api/verification/bvn/offline`

Initiate offline BVN verification (Admin only).

**Authentication**: Required (Bearer token, Admin role)

**Request Body**:
```json
{
  "bvn": "12345678901",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "phoneNumber": "+2348012345678",
  "adminNotes": "Manual verification required due to system issues"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Offline verification initiated",
  "verificationId": "ver_offline_123",
  "estimatedCompletionTime": "24-48 hours"
}
```

#### 4. Resend Verification Request
**POST** `/api/verification/bvn/resend`

Resend a BVN verification request.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "bvn": "12345678901",
  "phoneNumber": "+2348012345678"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Verification request resent successfully",
  "newVerificationId": "ver_resend_456"
}
```

### BVN Verification Features

- **Format Validation**: Ensures BVN is exactly 11 digits
- **Checksum Validation**: Validates BVN checksum algorithm
- **Name Matching**: Compares provided names with bank records
- **Phone Verification**: Validates phone number format and matches with records
- **Date of Birth Validation**: Ensures DOB matches bank records
- **Offline Processing**: Manual verification for edge cases
- **Retry Mechanism**: Allows multiple verification attempts with rate limiting

## USSD Services

The USSD (Unstructured Supplementary Service Data) service enables mobile users to access GroChain services through their mobile phones without internet connectivity.

### Endpoints

#### 1. Handle USSD Requests
**POST** `/api/ussd`

Process incoming USSD requests from telecom providers.

**Authentication**: Not required (Public endpoint)

**Request Body**:
```json
{
  "sessionId": "ussd_session_123",
  "phoneNumber": "+2348012345678",
  "serviceCode": "*123*1#",
  "text": "1",
  "networkCode": "MTN"
}
```

**Response**:
```json
{
  "sessionId": "ussd_session_123",
  "phoneNumber": "+2348012345678",
  "serviceCode": "*123*1#",
  "text": "Welcome to GroChain!\n\n1. Market Prices\n2. Weather Info\n3. Loan Status\n4. Account Balance\n\nSelect an option:",
  "networkCode": "MTN"
}
```

#### 2. Handle USSD Callbacks
**POST** `/api/ussd/callback`

Process callbacks from telecom providers.

**Authentication**: Not required (Public endpoint)

**Request Body**:
```json
{
  "sessionId": "ussd_session_123",
  "phoneNumber": "+2348012345678",
  "status": "success",
  "userInput": "1",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Callback processed successfully"
}
```

#### 3. Get USSD Service Information
**GET** `/api/ussd/info`

Retrieve information about available USSD services.

**Authentication**: Not required (Public endpoint)

**Response**:
```json
{
  "serviceCode": "*123#",
  "description": "GroChain Agricultural Services",
  "features": [
    "Market Prices",
    "Weather Information",
    "Loan Status",
    "Account Balance",
    "Crop Advice"
  ],
  "instructions": "Dial *123# to access GroChain services",
  "supportedNetworks": ["MTN", "Airtel", "Glo", "9mobile"],
  "languages": ["English", "Hausa", "Yoruba", "Igbo"]
}
```

#### 4. Test USSD Service
**POST** `/api/ussd/test`

Test USSD service functionality (Admin only).

**Authentication**: Required (Bearer token, Admin role)

**Request Body**:
```json
{
  "phoneNumber": "+2348012345678",
  "testScenario": "menu_navigation",
  "customInput": "1"
}
```

**Response**:
```json
{
  "success": true,
  "testResults": {
    "scenario": "menu_navigation",
    "status": "passed",
    "responseTime": 150,
    "errors": []
  }
}
```

#### 5. Get USSD Statistics
**GET** `/api/ussd/stats`

Retrieve USSD usage statistics (Admin only).

**Authentication**: Required (Bearer token, Admin role)

**Query Parameters**:
- `startDate` (optional): Start date for statistics (YYYY-MM-DD)
- `endDate` (optional): End date for statistics (YYYY-MM-DD)
- `network` (optional): Filter by network provider

**Response**:
```json
{
  "success": true,
  "data": {
    "totalSessions": 15420,
    "activeUsers": 8920,
    "successRate": 94.5,
    "averageResponseTime": 180,
    "topFeatures": [
      {
        "feature": "Market Prices",
        "usageCount": 5670
      },
      {
        "feature": "Weather Info",
        "usageCount": 4230
      }
    ]
  }
}
```

#### 6. Register USSD Service
**POST** `/api/ussd/register`

Register USSD service with telecom provider (Admin only).

**Authentication**: Required (Bearer token, Admin role)

**Request Body**:
```json
{
  "provider": "mtn",
  "serviceCode": "*123#",
  "callbackUrl": "https://api.grochain.com/api/ussd",
  "apiKey": "provider_api_key_123",
  "apiSecret": "provider_secret_456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "USSD service registered successfully",
  "registrationId": "reg_789",
  "status": "active"
}
```

### USSD Service Features

- **Multi-language Support**: English, Hausa, Yoruba, and Igbo
- **Network Compatibility**: Works with all major Nigerian telecom providers
- **Session Management**: Maintains user context across USSD interactions
- **Menu Navigation**: Intuitive menu system for easy navigation
- **Offline Access**: No internet connection required
- **Real-time Data**: Access to live market prices and weather information
- **Secure Transactions**: Encrypted communication for sensitive operations

## Data Models

### BVN Verification Models

#### BVNVerificationRequest
```json
{
  "bvn": "string (11 digits)",
  "firstName": "string (min 2 chars)",
  "lastName": "string (min 2 chars)",
  "dateOfBirth": "string (YYYY-MM-DD)",
  "phoneNumber": "string (Nigerian format)"
}
```

#### BVNVerificationResponse
```json
{
  "isValid": "boolean",
  "message": "string",
  "userDetails": {
    "firstName": "string",
    "lastName": "string",
    "middleName": "string",
    "dateOfBirth": "string",
    "phoneNumber": "string",
    "bankName": "string",
    "accountNumber": "string"
  },
  "verificationId": "string",
  "timestamp": "string (ISO 8601)",
  "verificationMethod": "string (online|offline|manual)"
}
```

### USSD Models

#### USSDRequest
```json
{
  "sessionId": "string",
  "phoneNumber": "string",
  "serviceCode": "string",
  "text": "string",
  "networkCode": "string"
}
```

#### USSDResponse
```json
{
  "sessionId": "string",
  "phoneNumber": "string",
  "serviceCode": "string",
  "text": "string",
  "networkCode": "string"
}
```

## Error Codes

### BVN Verification Errors
- `BVN_INVALID_FORMAT`: BVN must be exactly 11 digits
- `BVN_CHECKSUM_FAILED`: BVN checksum validation failed
- `NAME_MISMATCH`: Provided names don't match bank records
- `PHONE_MISMATCH`: Phone number doesn't match BVN records
- `DOB_MISMATCH`: Date of birth doesn't match bank records
- `VERIFICATION_LIMIT_EXCEEDED`: Too many verification attempts

### USSD Service Errors
- `INVALID_SESSION`: Invalid or expired session ID
- `UNSUPPORTED_NETWORK`: Network provider not supported
- `SERVICE_UNAVAILABLE`: USSD service temporarily unavailable
- `INVALID_INPUT`: User input is invalid or malformed
- `SESSION_TIMEOUT`: Session has timed out

## Rate Limiting

### BVN Verification
- **Standard users**: 5 attempts per hour
- **Premium users**: 10 attempts per hour
- **Admin users**: 50 attempts per hour

### USSD Services
- **Standard users**: 100 requests per hour
- **Premium users**: 500 requests per hour
- **Admin users**: 1000 requests per hour

## Security Considerations

### BVN Verification
- All BVN data is encrypted in transit and at rest
- BVN numbers are hashed and never stored in plain text
- Access to verification endpoints requires authentication
- Admin operations require elevated privileges

### USSD Services
- USSD sessions are secured with unique session IDs
- Callback URLs are validated to prevent unauthorized access
- Rate limiting prevents abuse and DoS attacks
- All sensitive data is encrypted in transit

## Testing

### BVN Verification Testing
```bash
# Test BVN verification
curl -X POST http://localhost:5000/api/verification/bvn \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bvn": "12345678901",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "phoneNumber": "+2348012345678"
  }'
```

### USSD Service Testing
```bash
# Test USSD request handling
curl -X POST http://localhost:5000/api/ussd \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_session_123",
    "phoneNumber": "+2348012345678",
    "serviceCode": "*123*1#",
    "text": "1",
    "networkCode": "MTN"
  }'
```

## Support

For technical support or questions about the API:
- **Email**: api-support@grochain.com
- **Documentation**: https://docs.grochain.com
- **Developer Portal**: https://developers.grochain.com
- **Status Page**: https://status.grochain.com
