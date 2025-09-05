# Partners API Specification

## Overview

This document provides comprehensive API specifications for the Partners Dashboard functionality in GroChain. All endpoints require authentication and are role-restricted to partners and administrators.

## Authentication

All partner endpoints require JWT authentication with the following header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
https://api.grochain.com/api/partners
```

---

## 1. Dashboard Endpoints

### GET /dashboard
Get partner's main dashboard data with key metrics and recent activity.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 100 requests/minute

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "totalFarmers": 150,
    "activeFarmers": 120,
    "inactiveFarmers": 15,
    "pendingFarmers": 15,
    "pendingApprovals": 5,
    "monthlyCommission": 75000,
    "totalCommission": 285000,
    "commissionRate": 0.05,
    "approvalRate": 92.5,
    "recentActivity": [
      {
        "type": "farmer_onboarded",
        "farmer": {
          "name": "John Farmer",
          "id": "farmer_id"
        },
        "timestamp": "2024-01-15T10:30:00Z",
        "description": "New farmer onboarded via bulk upload"
      },
      {
        "type": "commission_paid",
        "amount": 15000,
        "timestamp": "2024-01-14T15:45:00Z",
        "description": "Commission payout processed"
      }
    ]
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User is not a partner
- `500 Internal Server Error`: Server error

---

### GET /metrics
Get detailed performance metrics for partner analytics.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 50 requests/minute

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "totalFarmers": 150,
    "activeFarmers": 120,
    "inactiveFarmers": 15,
    "pendingFarmers": 15,
    "totalCommissions": 285000,
    "monthlyCommissions": 75000,
    "commissionRate": 0.05,
    "approvalRate": 92.5,
    "conversionRate": 85.2,
    "performanceMetrics": {
      "farmersOnboardedThisMonth": 12,
      "commissionsEarnedThisMonth": 75000,
      "averageCommissionPerFarmer": 1900,
      "farmerRetentionRate": 87.5,
      "averageOnboardingTime": 3.2
    },
    "monthlyTrends": [
      {
        "month": "2024-01",
        "farmers": 12,
        "commissions": 75000,
        "approvals": 45
      },
      {
        "month": "2024-02",
        "farmers": 8,
        "commissions": 52000,
        "approvals": 38
      }
    ]
  }
}
```

---

### GET /commission
Get partner's commission summary and payment history.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 50 requests/minute

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "summary": {
      "totalEarned": 285000,
      "commissionRate": 0.05,
      "pendingAmount": 15000,
      "paidAmount": 270000,
      "availableForPayout": 15000,
      "lastPayout": "2024-01-01T00:00:00Z",
      "nextPayoutDate": "2024-02-01T00:00:00Z"
    },
    "monthlyBreakdown": [
      {
        "month": "2024-01",
        "amount": 75000,
        "transactions": 45,
        "status": "paid"
      },
      {
        "month": "2024-02",
        "amount": 52000,
        "transactions": 38,
        "status": "pending"
      }
    ],
    "recentPayments": [
      {
        "id": "payment_id",
        "amount": 75000,
        "method": "bank_transfer",
        "status": "completed",
        "paidAt": "2024-01-01T10:00:00Z",
        "reference": "PAY_20240101_001"
      }
    ]
  }
}
```

---

## 2. Farmer Management Endpoints

### GET /farmers
Get paginated list of partner's farmers with filtering and search.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 100 requests/minute

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status (active/inactive/pending)
- `search`: Search by name, email, or location
- `sortBy`: Sort field (name/email/joinedAt/status)
- `sortOrder`: Sort order (asc/desc)

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "farmers": [
      {
        "_id": "farmer_id_1",
        "name": "John Farmer",
        "email": "john@example.com",
        "phone": "+2348012345678",
        "location": "Lagos, Nigeria",
        "status": "active",
        "joinedDate": "2024-01-15T10:30:00Z",
        "lastActivity": "2024-01-20T08:15:00Z",
        "totalHarvests": 5,
        "totalSales": 150000,
        "totalCommissions": 7500,
        "performance": {
          "completionRate": 95,
          "averageRating": 4.2,
          "onTimeDelivery": 98
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalItems": 150,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "summary": {
      "totalFarmers": 150,
      "activeFarmers": 120,
      "inactiveFarmers": 15,
      "pendingFarmers": 15
    }
  }
}
```

### GET /farmers/:farmerId
Get detailed information about a specific farmer.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 200 requests/minute

**Path Parameters**:
- `farmerId`: Farmer's unique identifier

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "farmer": {
      "_id": "farmer_id",
      "name": "John Farmer",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "location": "Lagos, Nigeria",
      "status": "active",
      "joinedDate": "2024-01-15T10:30:00Z",
      "lastActivity": "2024-01-20T08:15:00Z",
      "profile": {
        "gender": "male",
        "age": 35,
        "education": "Secondary",
        "farmSize": "2 hectares",
        "cropTypes": ["tomatoes", "pepper", "onions"]
      },
      "stats": {
        "totalHarvests": 5,
        "totalSales": 150000,
        "totalCommissions": 7500,
        "completionRate": 95,
        "averageRating": 4.2
      },
      "recentActivity": [
        {
          "type": "harvest_logged",
          "description": "Logged 50kg tomatoes harvest",
          "timestamp": "2024-01-20T08:15:00Z",
          "value": 25000
        }
      ]
    }
  }
}
```

### POST /farmers/:farmerId/status
Update farmer status (activate/deactivate/suspend).

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 50 requests/minute

**Path Parameters**:
- `farmerId`: Farmer's unique identifier

**Request Body**:
```json
{
  "status": "active",
  "reason": "Farmer completed training",
  "notes": "Successfully onboarded and trained"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "farmer": {
      "_id": "farmer_id",
      "name": "John Farmer",
      "status": "active",
      "statusUpdatedAt": "2024-01-20T10:00:00Z",
      "statusReason": "Farmer completed training"
    },
    "message": "Farmer status updated successfully"
  }
}
```

---

## 3. Bulk Operations Endpoints

### POST /bulk-onboard
Upload CSV file for bulk farmer onboarding.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 10 requests/minute
**Content-Type**: `multipart/form-data`

**Request Body** (FormData):
```
csvFile: File (CSV file, max 5MB)
```

**CSV Format**:
```csv
name,email,phone,location,gender,age,education,farm_size,crop_types
John Farmer,john@example.com,+2348012345678,"Lagos, Nigeria",Male,35,Secondary,"2 hectares","tomatoes, pepper"
Jane Farmer,jane@example.com,+2348012345679,"Abuja, Nigeria",Female,28,Tertiary,"1.5 hectares","maize, cassava"
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "uploadId": "upload_123456",
    "totalRows": 100,
    "successfulRows": 95,
    "failedRows": 5,
    "processingTime": 2.3,
    "errors": [
      {
        "row": 5,
        "field": "email",
        "error": "Email already exists",
        "data": {
          "name": "Bob Smith",
          "email": "bob@example.com"
        }
      },
      {
        "row": 12,
        "field": "phone",
        "error": "Invalid phone format",
        "data": {
          "name": "Alice Johnson",
          "phone": "080123456789"
        }
      }
    ],
    "successfulFarmers": [
      {
        "id": "farmer_id_1",
        "name": "John Farmer",
        "email": "john@example.com",
        "status": "pending"
      }
    ]
  }
}
```

### GET /bulk-onboard/:uploadId/status
Check status of bulk upload processing.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 100 requests/minute

**Path Parameters**:
- `uploadId`: Upload batch identifier

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "uploadId": "upload_123456",
    "status": "completed",
    "progress": 100,
    "totalRows": 100,
    "successfulRows": 95,
    "failedRows": 5,
    "createdAt": "2024-01-20T10:00:00Z",
    "completedAt": "2024-01-20T10:02:30Z",
    "results": {
      "successful": [
        {
          "id": "farmer_id_1",
          "name": "John Farmer",
          "email": "john@example.com"
        }
      ],
      "failed": [
        {
          "row": 5,
          "error": "Email already exists"
        }
      ]
    }
  }
}
```

---

## 4. Commission Management Endpoints

### GET /commissions
Get detailed commission history with filtering.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 100 requests/minute

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status (pending/approved/paid/cancelled)
- `farmerId`: Filter by specific farmer
- `startDate`: Start date for filtering (YYYY-MM-DD)
- `endDate`: End date for filtering (YYYY-MM-DD)
- `minAmount`: Minimum commission amount
- `maxAmount`: Maximum commission amount

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "commissions": [
      {
        "_id": "commission_id",
        "farmer": {
          "_id": "farmer_id",
          "name": "John Farmer",
          "email": "john@example.com"
        },
        "order": {
          "_id": "order_id",
          "orderNumber": "ORD_001234",
          "total": 150000,
          "status": "completed"
        },
        "listing": {
          "_id": "listing_id",
          "cropName": "Tomatoes",
          "price": 5000,
          "quantity": 30
        },
        "amount": 7500,
        "rate": 0.05,
        "status": "paid",
        "orderAmount": 150000,
        "orderDate": "2024-01-15T10:30:00Z",
        "paidAt": "2024-01-16T14:00:00Z",
        "notes": "Commission for tomato harvest sale"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalItems": 285,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "summary": {
      "totalCommissions": 285,
      "pendingCommissions": 15,
      "paidCommissions": 270,
      "totalAmount": 1425000,
      "pendingAmount": 75000,
      "paidAmount": 1350000
    }
  }
}
```

### POST /commissions/payout
Process commission payout for selected commissions.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 20 requests/minute

**Request Body**:
```json
{
  "commissionIds": [
    "commission_id_1",
    "commission_id_2",
    "commission_id_3"
  ],
  "payoutMethod": "bank_transfer",
  "payoutDetails": {
    "bankName": "Access Bank",
    "accountNumber": "1234567890",
    "accountName": "Partner Organization Ltd",
    "bankCode": "044"
  },
  "notes": "Monthly commission payout for January 2024"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "payoutId": "payout_123456",
    "totalAmount": 22500,
    "commissionCount": 3,
    "payoutMethod": "bank_transfer",
    "status": "processing",
    "reference": "PAYOUT_20240120_001",
    "createdAt": "2024-01-20T10:00:00Z",
    "estimatedCompletion": "2024-01-20T10:30:00Z",
    "commissions": [
      {
        "id": "commission_id_1",
        "amount": 7500,
        "farmer": "John Farmer"
      }
    ]
  }
}
```

### GET /commissions/payouts
Get payout history and status.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 50 requests/minute

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (processing/completed/failed/cancelled)
- `startDate`: Start date for filtering
- `endDate`: End date for filtering

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "payouts": [
      {
        "_id": "payout_id",
        "reference": "PAYOUT_20240120_001",
        "totalAmount": 22500,
        "commissionCount": 3,
        "payoutMethod": "bank_transfer",
        "status": "completed",
        "createdAt": "2024-01-20T10:00:00Z",
        "completedAt": "2024-01-20T10:15:00Z",
        "payoutDetails": {
          "bankName": "Access Bank",
          "accountNumber": "****67890",
          "accountName": "Partner Organization Ltd"
        },
        "commissions": [
          {
            "id": "commission_id_1",
            "amount": 7500,
            "farmer": "John Farmer"
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20
    },
    "summary": {
      "totalPayouts": 45,
      "totalAmount": 2250000,
      "completedPayouts": 43,
      "pendingPayouts": 2
    }
  }
}
```

---

## 5. Referral Management Endpoints

### GET /referrals
Get partner's referral list with performance data.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 100 requests/minute

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status (pending/active/completed/cancelled/expired)
- `farmerId`: Filter by specific farmer
- `sortBy`: Sort field (createdAt/commission/status)
- `sortOrder`: Sort order (asc/desc)

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "referrals": [
      {
        "_id": "referral_id",
        "farmer": {
          "_id": "farmer_id",
          "name": "John Farmer",
          "email": "john@example.com",
          "phone": "+2348012345678",
          "region": "Lagos"
        },
        "status": "active",
        "referralCode": "REF_ABC123DEF",
        "referralDate": "2024-01-15T10:30:00Z",
        "activationDate": "2024-01-16T08:00:00Z",
        "commissionRate": 0.05,
        "commission": 7500,
        "commissionStatus": "paid",
        "performanceMetrics": {
          "totalTransactions": 15,
          "totalValue": 225000,
          "averageOrderValue": 15000,
          "customerRetention": 87.5,
          "lastActivity": "2024-01-20T08:15:00Z"
        },
        "notes": "High-performing farmer, excellent harvest quality",
        "communicationHistory": [
          {
            "type": "sms",
            "date": "2024-01-16T08:00:00Z",
            "summary": "Welcome SMS sent",
            "outcome": "Successfully delivered"
          }
        ],
        "followUpRequired": false,
        "expiresAt": "2025-01-15T10:30:00Z",
        "isRenewable": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalItems": 150,
      "itemsPerPage": 20
    },
    "summary": {
      "totalReferrals": 150,
      "activeReferrals": 120,
      "completedReferrals": 25,
      "pendingReferrals": 5,
      "totalCommission": 75000,
      "averageCommissionPerReferral": 500
    }
  }
}
```

### POST /referrals
Create a new referral for a farmer.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 50 requests/minute

**Request Body**:
```json
{
  "farmerId": "farmer_id",
  "commissionRate": 0.05,
  "notes": "Farmer referred through extension program",
  "followUpRequired": true,
  "followUpDate": "2024-02-15T00:00:00Z",
  "tags": ["extension_program", "high_potential"]
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "referral": {
      "_id": "referral_id",
      "farmer": {
        "_id": "farmer_id",
        "name": "John Farmer",
        "email": "john@example.com"
      },
      "status": "pending",
      "referralCode": "REF_XYZ789ABC",
      "referralDate": "2024-01-20T10:00:00Z",
      "commissionRate": 0.05,
      "commission": 0,
      "commissionStatus": "pending",
      "expiresAt": "2025-01-20T10:00:00Z",
      "isRenewable": true,
      "notes": "Farmer referred through extension program"
    },
    "message": "Referral created successfully"
  }
}
```

### GET /referrals/stats/overview
Get referral statistics overview.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 50 requests/minute

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "totalReferrals": 150,
    "activeReferrals": 120,
    "completedReferrals": 25,
    "pendingReferrals": 5,
    "expiredReferrals": 0,
    "conversionRate": 85.2,
    "totalCommissionEarned": 75000,
    "averageCommissionPerReferral": 500,
    "statusBreakdown": {
      "pending": 5,
      "active": 120,
      "completed": 25,
      "cancelled": 0,
      "expired": 0
    },
    "monthlyTrends": [
      {
        "month": "2024-01",
        "newReferrals": 12,
        "activations": 10,
        "completions": 8,
        "commission": 15000
      }
    ],
    "performanceMetrics": {
      "averageActivationTime": 2.3,
      "averageCompletionTime": 15.7,
      "retentionRate": 87.5,
      "highPerformers": 15
    },
    "lastUpdated": "2024-01-20T10:00:00Z"
  }
}
```

---

## 6. Analytics & Reporting Endpoints

### GET /analytics/dashboard
Get partner analytics dashboard data.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 30 requests/minute

**Query Parameters**:
- `period`: Time period (7d/30d/90d/1y)
- `compare`: Compare with previous period (true/false)

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "period": "30d",
    "currentPeriod": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "previousPeriod": {
      "startDate": "2023-12-01",
      "endDate": "2023-12-31"
    },
    "metrics": {
      "farmers": {
        "current": 150,
        "previous": 135,
        "change": 15,
        "changePercent": 11.1
      },
      "commissions": {
        "current": 75000,
        "previous": 67500,
        "change": 7500,
        "changePercent": 11.1
      },
      "referrals": {
        "current": 25,
        "previous": 22,
        "change": 3,
        "changePercent": 13.6
      },
      "conversionRate": {
        "current": 85.2,
        "previous": 82.1,
        "change": 3.1,
        "changePercent": 3.8
      }
    },
    "charts": {
      "farmerGrowth": [
        { "date": "2024-01-01", "count": 135 },
        { "date": "2024-01-15", "count": 142 },
        { "date": "2024-01-31", "count": 150 }
      ],
      "commissionTrends": [
        { "date": "2024-01-01", "amount": 65000 },
        { "date": "2024-01-15", "amount": 70000 },
        { "date": "2024-01-31", "amount": 75000 }
      ],
      "referralConversion": [
        { "date": "2024-01-01", "rate": 80.5 },
        { "date": "2024-01-15", "rate": 83.2 },
        { "date": "2024-01-31", "rate": 85.2 }
      ]
    },
    "topPerformers": {
      "farmers": [
        {
          "id": "farmer_id_1",
          "name": "John Farmer",
          "totalSales": 150000,
          "totalCommission": 7500,
          "performance": 95
        }
      ],
      "regions": [
        {
          "region": "Lagos",
          "farmers": 45,
          "totalSales": 2250000,
          "totalCommission": 112500
        }
      ]
    }
  }
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "field_name",
    "value": "invalid_value",
    "constraint": "validation_rule"
  },
  "timestamp": "2024-01-20T10:00:00Z"
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED`: Missing or invalid JWT token
- `INSUFFICIENT_PERMISSIONS`: User doesn't have required role
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `VALIDATION_ERROR`: Request data validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable

### HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

---

## Rate Limiting

Rate limits are enforced per user per minute:

- Dashboard/Metrics endpoints: 50 requests/minute
- Farmer management: 100 requests/minute
- Bulk operations: 10 requests/minute
- Commission management: 50 requests/minute
- Analytics: 30 requests/minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

---

## Pagination

All list endpoints support pagination with these parameters:

**Request Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Format**:
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Filtering & Sorting

### Common Filter Parameters

- `status`: Filter by status (active/inactive/pending/completed)
- `startDate`: Start date (YYYY-MM-DD or ISO 8601)
- `endDate`: End date (YYYY-MM-DD or ISO 8601)
- `search`: Full-text search across relevant fields
- `sortBy`: Field to sort by
- `sortOrder`: Sort order (asc/desc)

### Sorting Options

- Farmers: `name`, `email`, `joinedAt`, `status`, `totalSales`
- Commissions: `createdAt`, `amount`, `status`, `paidAt`
- Referrals: `createdAt`, `commission`, `status`, `expiresAt`

---

## Webhooks (Future Implementation)

Partners can subscribe to webhooks for real-time notifications:

### Available Events

- `farmer.onboarded`: New farmer onboarded
- `farmer.status_changed`: Farmer status updated
- `commission.earned`: Commission earned from farmer transaction
- `commission.paid`: Commission payout processed
- `referral.created`: New referral created
- `referral.completed`: Referral completed successfully

### Webhook Payload Format

```json
{
  "event": "farmer.onboarded",
  "timestamp": "2024-01-20T10:00:00Z",
  "partnerId": "partner_id",
  "data": {
    "farmer": {
      "id": "farmer_id",
      "name": "John Farmer",
      "email": "john@example.com",
      "location": "Lagos, Nigeria"
    },
    "source": "bulk_upload",
    "uploadId": "upload_123456"
  }
}
```

---

## Data Export

### GET /export/farmers
Export farmer data in various formats.

**Authentication**: Required (Partner/Admin)
**Rate Limit**: 10 requests/minute

**Query Parameters**:
- `format`: Export format (csv/json/xlsx)
- `status`: Filter by status
- `startDate`: Start date filter
- `endDate`: End date filter
- `fields`: Comma-separated list of fields to include

**Response**: File download with appropriate content-type

### GET /export/commissions
Export commission data.

**Parameters**: Same as farmers export, plus:
- `minAmount`: Minimum commission amount
- `maxAmount`: Maximum commission amount
- `status`: Commission status filter

### GET /export/referrals
Export referral data.

**Parameters**: Same as farmers export

---

## SDK & Libraries

### JavaScript SDK (Future)

```javascript
import { GroChainPartners } from '@grochain/partners-sdk'

const client = new GroChainPartners({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.grochain.com'
})

// Get dashboard data
const dashboard = await client.dashboard.get()

// Upload farmers
const upload = await client.farmers.upload(csvFile)

// Get commissions
const commissions = await client.commissions.list({
  page: 1,
  status: 'paid'
})
```

### Mobile SDKs (Future)

- **React Native**: `@grochain/partners-react-native`
- **Flutter**: `grochain_partners` package
- **iOS**: CocoaPods/Swift Package Manager
- **Android**: Maven/Gradle

---

## Changelog

### Version 1.0.0 (Current)
- Initial release of Partners API
- Basic CRUD operations for farmers, commissions, and referrals
- Bulk onboarding functionality
- Commission payout processing
- Analytics and reporting endpoints

### Upcoming Features (v1.1.0)
- Webhook notifications
- Advanced analytics with custom reports
- Mobile SDKs
- API rate limiting controls
- Enhanced data export options
- Real-time dashboard updates via WebSocket

---

## Support

For API support and questions:

- **Documentation**: https://docs.grochain.com/partners-api
- **API Status**: https://status.grochain.com
- **Support Email**: partners@grochain.com
- **Community Forum**: https://community.grochain.com/partners

---

## Terms of Service

By using the Partners API, you agree to:
1. Only access data for farmers associated with your partnership
2. Maintain farmer privacy and data protection standards
3. Not exceed rate limits or abuse the service
4. Report security issues immediately
5. Comply with local agricultural regulations

For complete terms, visit: https://grochain.com/partners/terms
