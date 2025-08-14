# GroChain API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Rate Limiting](#rate-limiting)
5. [Error Handling](#error-handling)
6. [Data Models](#data-models)
7. [API Endpoints](#api-endpoints)
8. [Webhooks](#webhooks)
9. [SDKs & Libraries](#sdks--libraries)
10. [Examples](#examples)
11. [Changelog](#changelog)

## Overview

The GroChain API is a RESTful service that provides comprehensive agricultural supply chain management capabilities. It enables farmers, partners, aggregators, and buyers to manage harvests, track shipments, conduct marketplace transactions, and access AI-powered insights.

**Version:** 1.0.0  
**Base URL:** `https://api.grochain.com`  
**Documentation URL:** `https://api.grochain.com/api/docs`

### Key Features
- **Authentication & Authorization:** JWT-based authentication with role-based access control
- **Real-time Data:** WebSocket support for live updates
- **Multilingual Support:** Built-in localization for multiple languages
- **Offline Sync:** PWA-compatible offline data synchronization
- **AI Integration:** Machine learning-powered crop recommendations and yield predictions
- **IoT Support:** Sensor data management and analytics
- **Payment Integration:** Paystack and Flutterwave payment processing

## Base URL

```
Production: https://api.grochain.com
Development: http://localhost:5000
Staging: https://staging-api.grochain.com
```

## Authentication

GroChain API uses JWT (JSON Web Token) authentication. All protected endpoints require a valid JWT token in the Authorization header.

### Getting Started

1. **Register a new user:**
   ```http
   POST /api/auth/register
   ```

2. **Login to get access token:**
   ```http
   POST /api/auth/login
   ```

3. **Use the token in subsequent requests:**
   ```http
   Authorization: Bearer <your_access_token>
   ```

### Token Types

- **Access Token:** Short-lived (15 minutes) for API requests
- **Refresh Token:** Long-lived (7 days) for getting new access tokens

### Refresh Token Flow

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

## Rate Limiting

API requests are rate-limited to ensure fair usage:

- **General API:** 100 requests per minute per IP
- **Authentication:** 5 requests per minute per IP
- **Payment Webhooks:** No rate limiting (exempted)

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Handling

The API uses standard HTTP status codes and returns consistent error responses.

### Error Response Format

```json
{
  "status": "error",
  "message": "Validation failed",
  "code": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Data Models

### User

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "farmer|partner|aggregator|admin|buyer",
  "location": {
    "lat": "number",
    "lng": "number",
    "address": "string"
  },
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Harvest

```json
{
  "id": "string",
  "farmer": "string",
  "cropType": "string",
  "quantity": "number",
  "unit": "kg|tons|bags",
  "date": "date",
  "geoLocation": {
    "lat": "number",
    "lng": "number"
  },
  "batchId": "string",
  "qrData": "string",
  "status": "pending|harvested|shipped|delivered",
  "createdAt": "datetime"
}
```

### Listing

```json
{
  "id": "string",
  "product": "string",
  "price": "number",
  "quantity": "number",
  "farmer": "string",
  "partner": "string",
  "images": ["string"],
  "description": "string",
  "category": "string",
  "status": "active|sold|inactive",
  "createdAt": "datetime"
}
```

### Order

```json
{
  "id": "string",
  "buyer": "string",
  "items": [
    {
      "listing": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "total": "number",
  "status": "pending|paid|delivered|cancelled",
  "paymentReference": "string",
  "createdAt": "datetime"
}
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "password": "securepassword123",
  "role": "farmer",
  "location": "Lagos, Nigeria"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "farmer"
    }
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "farmer"
    }
  }
}
```

### Harvest Management

#### Create Harvest
```http
POST /api/harvests
Authorization: Bearer <token>
Content-Type: application/json

{
  "cropType": "Cassava",
  "quantity": 500,
  "unit": "kg",
  "date": "2024-01-15",
  "geoLocation": {
    "lat": 6.5244,
    "lng": 3.3792
  }
}
```

#### Get Harvests
```http
GET /api/harvests?page=1&limit=10
Authorization: Bearer <token>
```

#### Verify Harvest (Public)
```http
GET /api/verify/{batchId}
```

### Marketplace

#### Create Listing
```http
POST /api/marketplace/listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "product": "Fresh Cassava",
  "price": 1500,
  "quantity": 100,
  "unit": "kg",
  "description": "Freshly harvested cassava",
  "category": "Tubers",
  "images": ["image_url_1", "image_url_2"]
}
```

#### Search Listings
```http
GET /api/marketplace/listings?search=cassava&category=Tubers&page=1&limit=20
```

#### Place Order
```http
POST /api/marketplace/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "listing": "listing_id",
      "quantity": 50
    }
  ]
}
```

### AI & Machine Learning

#### Get Crop Recommendations
```http
POST /api/ai/crop-recommendations
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": "Lagos, Nigeria",
  "season": "rainy",
  "soilType": "loamy",
  "previousCrops": ["Cassava", "Yam"]
}
```

#### Get Yield Prediction
```http
POST /api/ai/yield-prediction
Authorization: Bearer <token>
Content-Type: application/json

{
  "cropType": "Cassava",
  "location": "Lagos, Nigeria",
  "season": "rainy",
  "weatherData": {
    "rainfall": 150,
    "temperature": 28,
    "humidity": 75
  }
}
```

#### Get Market Insights
```http
GET /api/ai/market-insights
Authorization: Bearer <token>
```

### IoT & Sensors

#### Register Sensor
```http
POST /api/iot/sensors
Authorization: Bearer <token>
Content-Type: application/json

{
  "sensorType": "soil_moisture",
  "location": {
    "lat": 6.5244,
    "lng": 3.3792
  }
}
```

#### Get Sensor Data
```http
GET /api/iot/sensors/{sensorId}/readings
Authorization: Bearer <token>
```

#### Update Sensor Data
```http
PUT /api/iot/sensors/{sensorId}/data
Authorization: Bearer <token>
Content-Type: application/json

{
  "readings": {
    "moisture": 65,
    "temperature": 25,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Image Recognition

#### Analyze Crop Image
```http
POST /api/image-recognition/analyze
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "image": "file",
  "cropType": "Cassava"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "analysis": {
      "id": "analysis_id",
      "cropType": "Cassava",
      "healthStatus": "healthy",
      "diseaseRisk": "low",
      "recommendations": [
        "Continue current watering schedule",
        "Monitor for early blight symptoms"
      ],
      "confidence": 0.92
    }
  }
}
```

### Partner Management

#### Bulk Onboard Farmers
```http
POST /api/partners/bulk-onboard
Authorization: Bearer <token>
Content-Type: application/json

{
  "farmers": [
    {
      "name": "Farmer 1",
      "phone": "+2348012345678",
      "location": "Lagos"
    },
    {
      "name": "Farmer 2",
      "phone": "+2348012345679",
      "location": "Abuja"
    }
  ]
}
```

#### Upload CSV
```http
POST /api/partners/upload-csv
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "csvFile": "file"
}
```

### Fintech Services

#### Get Credit Score
```http
GET /api/fintech/credit-score/{farmerId}
Authorization: Bearer <token>
```

#### Create Loan Referral
```http
POST /api/fintech/loan-referrals
Authorization: Bearer <token>
Content-Type: application/json

{
  "farmer": "farmer_id",
  "amount": 50000,
  "purpose": "Equipment purchase"
}
```

### Payments

#### Initialize Payment
```http
POST /api/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_id",
  "email": "buyer@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "reference": "payment_reference"
  }
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

### Notifications

#### Send Notification
```http
POST /api/notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id",
  "type": "sms",
  "message": "Your harvest has been successfully registered!"
}
```

### Analytics

#### Get System Overview
```http
GET /api/analytics/overview
```

#### Get Partner Analytics
```http
GET /api/analytics/partner/{partnerId}
Authorization: Bearer <token>
```

### Language & Localization

#### Get Supported Languages
```http
GET /api/languages
```

#### Get Translations
```http
POST /api/languages/translations
Content-Type: application/json

{
  "keys": ["welcome", "harvest", "marketplace"],
  "targetLanguage": "yoruba"
}
```

### PWA & Offline Support

#### Get PWA Manifest
```http
GET /api/pwa/manifest
```

#### Get Service Worker
```http
GET /api/pwa/service-worker
```

### Data Synchronization

#### Queue Offline Data
```http
POST /api/sync/offline-data
Authorization: Bearer <token>
Content-Type: application/json

{
  "dataType": "harvest",
  "data": {
    "cropType": "Cassava",
    "quantity": 300
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Sync User Data
```http
POST /api/sync/sync-user
Authorization: Bearer <token>
```

## Webhooks

GroChain supports webhooks for real-time notifications on important events.

### Webhook Events

- `harvest.created` - New harvest registered
- `order.placed` - New order placed
- `payment.completed` - Payment successful
- `shipment.delivered` - Shipment delivered
- `analysis.completed` - Image analysis completed

### Webhook Format

```json
{
  "event": "harvest.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "harvestId": "harvest_id",
    "farmerId": "farmer_id",
    "cropType": "Cassava"
  }
}
```

### Setting Up Webhooks

```http
POST /api/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["harvest.created", "order.placed"],
  "secret": "webhook_secret"
}
```

## SDKs & Libraries

### JavaScript/Node.js

```bash
npm install grochain-sdk
```

```javascript
import { GroChainAPI } from 'grochain-sdk';

const api = new GroChainAPI({
  baseURL: 'https://api.grochain.com',
  accessToken: 'your_access_token'
});

// Create harvest
const harvest = await api.harvests.create({
  cropType: 'Cassava',
  quantity: 500,
  date: '2024-01-15'
});
```

### Python

```bash
pip install grochain-python
```

```python
from grochain import GroChainAPI

api = GroChainAPI(
    base_url='https://api.grochain.com',
    access_token='your_access_token'
)

# Get crop recommendations
recommendations = api.ai.get_crop_recommendations(
    location='Lagos, Nigeria',
    season='rainy'
)
```

### PHP

```bash
composer require grochain/php-sdk
```

```php
use GroChain\GroChainAPI;

$api = new GroChainAPI([
    'base_url' => 'https://api.grochain.com',
    'access_token' => 'your_access_token'
]);

// Get marketplace listings
$listings = $api->marketplace->getListings([
    'category' => 'Tubers',
    'limit' => 20
]);
```

## Examples

### Complete Harvest Workflow

```javascript
// 1. Register harvest
const harvest = await api.harvests.create({
  cropType: 'Cassava',
  quantity: 500,
  unit: 'kg',
  date: '2024-01-15',
  geoLocation: { lat: 6.5244, lng: 3.3792 }
});

// 2. Create marketplace listing
const listing = await api.marketplace.listings.create({
  product: 'Fresh Cassava',
  price: 1500,
  quantity: 500,
  unit: 'kg',
  description: 'Freshly harvested cassava',
  category: 'Tubers'
});

// 3. Get AI recommendations
const recommendations = await api.ai.getCropRecommendations({
  location: 'Lagos, Nigeria',
  season: 'rainy',
  soilType: 'loamy'
});

// 4. Monitor with IoT sensors
const sensorData = await api.iot.sensors.getReadings(sensorId);
```

### Payment Integration

```javascript
// 1. Initialize payment
const payment = await api.payments.initialize({
  orderId: order.id,
  email: buyer.email
});

// 2. Redirect to payment page
window.location.href = payment.authorizationUrl;

// 3. Verify payment (webhook or manual)
const verification = await api.payments.verify({
  reference: payment.reference
});
```

### Offline-First PWA

```javascript
// 1. Queue offline data
await api.sync.queueOfflineData({
  dataType: 'harvest',
  data: harvestData,
  timestamp: new Date().toISOString()
});

// 2. Sync when online
if (navigator.onLine) {
  await api.sync.syncUser();
}
```

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial API release
- Core CRUD operations for harvests, listings, orders
- JWT authentication
- AI-powered crop recommendations
- IoT sensor integration
- Payment processing
- Multilingual support
- PWA and offline sync capabilities

### Upcoming Features
- Blockchain integration for supply chain transparency
- Advanced ML models for yield prediction
- Real-time collaboration tools
- Advanced analytics dashboard
- Mobile SDKs for iOS and Android

## Support

- **Documentation:** [https://docs.grochain.com](https://docs.grochain.com)
- **API Status:** [https://status.grochain.com](https://status.grochain.com)
- **Support Email:** api-support@grochain.com
- **Developer Community:** [https://community.grochain.com](https://community.grochain.com)
- **GitHub:** [https://github.com/grochain/api](https://github.com/grochain/api)

## License

This API is proprietary software owned by GroChain. Unauthorized use, reproduction, or distribution is strictly prohibited.

---

*Last updated: January 15, 2024*
*API Version: 1.0.0*
