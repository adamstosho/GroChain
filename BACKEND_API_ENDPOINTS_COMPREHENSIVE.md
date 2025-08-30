# GroChain Backend API - Comprehensive Endpoints Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [User Management](#user-management)
4. [Farmer Operations](#farmer-operations)
5. [Buyer Operations](#buyer-operations)
6. [Partner Operations](#partner-operations)
7. [Marketplace Operations](#marketplace-operations)
8. [Harvest Management](#harvest-management)
9. [Financial Services](#financial-services)
10. [Analytics & Reporting](#analytics--reporting)
11. [Notifications](#notifications)
12. [Shipment Management](#shipment-management)
13. [QR Code Management](#qr-code-management)
14. [Data Export & Import](#data-export--import)
15. [Weather Information](#weather-information)
16. [System & Health](#system--health)

## Overview

This document provides a comprehensive list of all available API endpoints in the GroChain backend system. All endpoints are prefixed with `/api` and require appropriate authentication and authorization based on user roles.

**Base URL**: `http://localhost:5000/api` (Development)
**Production URL**: `https://api.grochain.ng/api`

## Authentication & Authorization

### Authentication Endpoints

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json
```
**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "password": "securePassword123",
  "role": "farmer|buyer|partner|admin",
  "region": "Lagos"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json
```
**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Email Verification
```http
POST /api/auth/verify-email
Content-Type: application/json
```
**Request Body**:
```json
{
  "email": "john@example.com",
  "verificationCode": "123456"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json
```
**Request Body**:
```json
{
  "email": "john@example.com"
}
```

#### Reset Password
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

#### Resend Verification
```http
POST /api/auth/resend-verification
Content-Type: application/json
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
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

## User Management

### User Profile & Settings

#### Get My Profile
```http
GET /api/users/profile/me
Authorization: Bearer <token>
```

#### Update My Profile
```http
PUT /api/users/profile/me
Authorization: Bearer <token>
Content-Type: application/json
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

### Admin User Management (Admin Only)

#### List Users
```http
GET /api/users?page=1&limit=20&role=farmer&status=active&search=john
Authorization: Bearer <token>
```

#### Create User
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get User by ID
```http
GET /api/users/:userId
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/users/:userId
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete User
```http
DELETE /api/users/:userId
Authorization: Bearer <token>
```

#### Bulk Create Users
```http
POST /api/users/bulk-create
Authorization: Bearer <token>
Content-Type: application/json
```

#### Bulk Update Users
```http
PUT /api/users/bulk-update
Authorization: Bearer <token>
Content-Type: application/json
```

#### Bulk Delete Users
```http
DELETE /api/users/bulk-delete
Authorization: Bearer <token>
Content-Type: application/json
```

#### Search Users
```http
GET /api/users/search/query?q=john
Authorization: Bearer <token>
```

#### Get User Stats
```http
GET /api/users/:userId/stats
Authorization: Bearer <token>
```

#### Get User Activity
```http
GET /api/users/:userId/activity
Authorization: Bearer <token>
```

#### Verify User
```http
POST /api/users/:userId/verify
Authorization: Bearer <token>
```

#### Suspend User
```http
PATCH /api/users/:userId/suspend
Authorization: Bearer <token>
Content-Type: application/json
```

#### Reactivate User
```http
PATCH /api/users/:userId/reactivate
Authorization: Bearer <token>
```

#### Change User Role
```http
PATCH /api/users/:userId/role
Authorization: Bearer <token>
Content-Type: application/json
```

#### Export Users
```http
POST /api/users/export
Authorization: Bearer <token>
```

### User Dashboard
```http
GET /api/users/dashboard
Authorization: Bearer <token>
```

## Farmer Operations

### Farmer Profile & Settings

#### Get My Profile
```http
GET /api/farmers/profile/me
Authorization: Bearer <token>
```

#### Update My Profile
```http
PUT /api/farmers/profile/me
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get My Preferences
```http
GET /api/farmers/preferences/me
Authorization: Bearer <token>
```

#### Update My Preferences
```http
PUT /api/farmers/preferences/me
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get My Settings
```http
GET /api/farmers/settings/me
Authorization: Bearer <token>
```

#### Update My Settings
```http
PUT /api/farmers/settings/me
Authorization: Bearer <token>
Content-Type: application/json
```

### Farmer Dashboard & Analytics

#### Get Dashboard Data
```http
GET /api/farmers/dashboard
Authorization: Bearer <token>
```

#### Get Harvest Summary
```http
GET /api/farmers/harvests/summary
Authorization: Bearer <token>
```

#### Get Earnings Summary
```http
GET /api/farmers/earnings/summary
Authorization: Bearer <token>
```

## Buyer Operations

*Note: Buyers use the general user endpoints for profile management and the marketplace endpoints for purchasing operations.*

## Partner Operations

### Partner Management

#### Get All Partners
```http
GET /api/partners
```

#### Get Partner by ID
```http
GET /api/partners/:id
```

#### Create Partner
```http
POST /api/partners
Authorization: Bearer <token>
Content-Type: application/json
```

#### Update Partner
```http
PUT /api/partners/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Partner
```http
DELETE /api/partners/:id
Authorization: Bearer <token>
```

#### Get Partner Metrics
```http
GET /api/partners/:id/metrics
Authorization: Bearer <token>
```

#### Onboard Farmer
```http
POST /api/partners/:id/onboard-farmer
Authorization: Bearer <token>
Content-Type: application/json
```

#### Bulk Onboard Farmers
```http
POST /api/partners/:id/bulk-onboard
Authorization: Bearer <token>
Content-Type: application/json
```

### Partner Dashboard & Operations

#### Get Partner Dashboard
```http
GET /api/partners/dashboard
Authorization: Bearer <token>
```

#### Get Partner Farmers
```http
GET /api/partners/farmers
Authorization: Bearer <token>
```

#### Get Partner Commission
```http
GET /api/partners/commission
Authorization: Bearer <token>
```

#### Upload CSV for Bulk Onboarding
```http
POST /api/partners/upload-csv
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Form Data**:
- `file`: File (CSV)

### Partner Test Routes
```http
GET /api/partners/ping
```

```http
GET /api/partners/simple-test
```

```http
GET /api/partners/auth-test
Authorization: Bearer <token>
```

```http
GET /api/partners/test
Authorization: Bearer <token>
```

## Marketplace Operations

### Product Listings

#### Get All Listings
```http
GET /api/marketplace/listings
```

#### Get Listing by ID
```http
GET /api/marketplace/listings/:id
```

#### Create Product Listing
```http
POST /api/marketplace/listings
Authorization: Bearer <token>
Content-Type: application/json
```

#### Update Listing
```http
PATCH /api/marketplace/listings/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Unpublish Listing
```http
PATCH /api/marketplace/listings/:id/unpublish
Authorization: Bearer <token>
```

#### Upload Listing Images
```http
POST /api/marketplace/upload-image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Form Data**:
- `images`: File[] (up to 5 images)

### Search & Discovery

#### Search Suggestions
```http
GET /api/marketplace/search-suggestions?q=maize&limit=10
```

### Favorites Management

#### Get User Favorites
```http
GET /api/marketplace/favorites/:userId?page=1&limit=20
Authorization: Bearer <token>
```

#### Add to Favorites
```http
POST /api/marketplace/favorites
Authorization: Bearer <token>
Content-Type: application/json
```

#### Remove from Favorites
```http
DELETE /api/marketplace/favorites/:userId/:listingId
Authorization: Bearer <token>
```

### Order Management

#### Get All Orders (Authenticated User)
```http
GET /api/marketplace/orders
Authorization: Bearer <token>
```

#### Create Order
```http
POST /api/marketplace/orders
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Order Details
```http
GET /api/marketplace/orders/:id
Authorization: Bearer <token>
```

#### Get Orders by Buyer
```http
GET /api/marketplace/orders/buyer/:buyerId
Authorization: Bearer <token>
```

#### Update Order Status
```http
PATCH /api/marketplace/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Order Tracking
```http
GET /api/marketplace/orders/:id/tracking
Authorization: Bearer <token>
```

## Harvest Management

### Harvest Operations

#### Get All Harvests
```http
GET /api/harvests?page=1&limit=10&status=active
Authorization: Bearer <token>
```

#### Create New Harvest
```http
POST /api/harvests
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Harvest by Batch ID
```http
GET /api/harvests/:batchId
Authorization: Bearer <token>
```

#### Delete Harvest
```http
DELETE /api/harvests/:id
Authorization: Bearer <token>
```

#### Get Harvest Verification
```http
GET /api/harvests/verification/:batchId
```

#### Get Harvest Provenance
```http
GET /api/harvests/provenance/:batchId
Authorization: Bearer <token>
```

### Harvest Approval System

#### Get Harvest Approvals
```http
GET /api/harvest-approval
Authorization: Bearer <token>
```

#### Create Harvest Approval
```http
POST /api/harvest-approval
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Harvest Approval by ID
```http
GET /api/harvest-approval/:id
Authorization: Bearer <token>
```

#### Update Harvest Approval
```http
PUT /api/harvest-approval/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Harvest Approval
```http
DELETE /api/harvest-approval/:id
Authorization: Bearer <token>
```

## Financial Services

### Credit Score Management

#### Get Credit Score
```http
GET /api/fintech/credit-score/:farmerId
Authorization: Bearer <token>
```

#### Create Credit Score
```http
POST /api/fintech/credit-score
Authorization: Bearer <token>
Content-Type: application/json
```

#### Update Credit Score
```http
PUT /api/fintech/credit-score/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### Financial Health & Analysis

#### Get Financial Health
```http
GET /api/fintech/financial-health/:farmerId
Authorization: Bearer <token>
```

#### Get Crop Financials
```http
GET /api/fintech/crop-financials
Authorization: Bearer <token>
```

#### Get Financial Projections
```http
GET /api/fintech/financial-projections
Authorization: Bearer <token>
```

#### Get Financial Goals
```http
GET /api/fintech/financial-goals/:farmerId
Authorization: Bearer <token>
```

### Loan Management

#### Get Loan Applications
```http
GET /api/fintech/loan-applications
Authorization: Bearer <token>
```

#### Create Loan Application
```http
POST /api/fintech/loan-applications
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Loan Application by ID
```http
GET /api/fintech/loan-applications/:id
Authorization: Bearer <token>
```

#### Update Loan Application
```http
PUT /api/fintech/loan-applications/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Loan Application
```http
DELETE /api/fintech/loan-applications/:id
Authorization: Bearer <token>
```

### Insurance Management

#### Get Insurance Policies
```http
GET /api/fintech/insurance-policies
Authorization: Bearer <token>
```

#### Create Insurance Policy
```http
POST /api/fintech/insurance-policies
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Insurance Policy by ID
```http
GET /api/fintech/insurance-policies/:id
Authorization: Bearer <token>
```

#### Update Insurance Policy
```http
PUT /api/fintech/insurance-policies/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Insurance Policy
```http
DELETE /api/fintech/insurance-policies/:id
Authorization: Bearer <token>
```

### Insurance Claims

#### Create Insurance Claim
```http
POST /api/fintech/insurance-claims
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Insurance Claim by ID
```http
GET /api/fintech/insurance-claims/:id
Authorization: Bearer <token>
```

#### Update Insurance Claim
```http
PUT /api/fintech/insurance-claims/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### Financial Statistics & Referrals

#### Get Loan Referrals
```http
GET /api/fintech/loan-referrals
Authorization: Bearer <token>
```

#### Get Loan Statistics
```http
GET /api/fintech/loan-stats
Authorization: Bearer <token>
```

#### Get Insurance Statistics
```http
GET /api/fintech/insurance-stats
Authorization: Bearer <token>
```

#### Get Insurance Quotes
```http
GET /api/fintech/insurance-quotes
Authorization: Bearer <token>
```

## Analytics & Reporting

### Public Analytics

#### Get Dashboard Metrics
```http
GET /api/analytics/dashboard
```

#### Get Harvest Analytics
```http
GET /api/analytics/harvests
```

#### Get Marketplace Analytics
```http
GET /api/analytics/marketplace
```

#### Get Financial Analytics
```http
GET /api/analytics/financial
```

### Protected Analytics (Require Authentication)

#### Get Transaction Analytics
```http
GET /api/analytics/transactions
Authorization: Bearer <token>
```

#### Get Fintech Analytics
```http
GET /api/analytics/fintech
Authorization: Bearer <token>
```

#### Get Impact Analytics
```http
GET /api/analytics/impact
Authorization: Bearer <token>
```

#### Get Weather Analytics
```http
GET /api/analytics/weather
Authorization: Bearer <token>
```

#### Get Reports List
```http
GET /api/analytics/reports
Authorization: Bearer <token>
```

#### Export Analytics
```http
GET /api/analytics/export
Authorization: Bearer <token>
```

#### Compare Analytics
```http
POST /api/analytics/compare
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Regional Analytics
```http
POST /api/analytics/regional
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Predictive Analytics
```http
GET /api/analytics/predictive
Authorization: Bearer <token>
```

#### Get Analytics Summary
```http
GET /api/analytics/summary
Authorization: Bearer <token>
```

### Role-Specific Analytics

#### Get Farmer Analytics
```http
GET /api/analytics/farmers/:farmerId
Authorization: Bearer <token>
```

#### Get Partner Analytics
```http
GET /api/analytics/partners/:partnerId
Authorization: Bearer <token>
```

#### Get Buyer Analytics
```http
GET /api/analytics/buyers/:buyerId
Authorization: Bearer <token>
```

#### Generate Custom Report
```http
POST /api/analytics/report
Authorization: Bearer <token>
Content-Type: application/json
```

## Notifications

### Notification Management

#### Get User Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

#### Send Notification
```http
POST /api/notifications/send
Authorization: Bearer <token>
Content-Type: application/json
```

#### Send Bulk Notifications
```http
POST /api/notifications/send-bulk
Authorization: Bearer <token>
Content-Type: application/json
```

#### Mark Notification as Read
```http
PATCH /api/notifications/:notificationId/read
Authorization: Bearer <token>
```

#### Mark All Notifications as Read
```http
PATCH /api/notifications/mark-all-read
Authorization: Bearer <token>
```

### Notification Preferences

#### Get Notification Preferences
```http
GET /api/notifications/preferences
Authorization: Bearer <token>
```

#### Update Notification Preferences
```http
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json
```

#### Update Push Token
```http
PUT /api/notifications/push-token
Authorization: Bearer <token>
Content-Type: application/json
```

### Specialized Notifications

#### Send Harvest Notification
```http
POST /api/notifications/harvest
Authorization: Bearer <token>
Content-Type: application/json
```

#### Send Marketplace Notification
```http
POST /api/notifications/marketplace
Authorization: Bearer <token>
Content-Type: application/json
```

#### Send Transaction Notification
```http
POST /api/notifications/transaction
Authorization: Bearer <token>
Content-Type: application/json
```

## Shipment Management

### Shipment Operations

#### Create Shipment
```http
POST /api/shipments
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Shipment by ID
```http
GET /api/shipments/:shipmentId
Authorization: Bearer <token>
```

#### Get Shipments with Filters
```http
GET /api/shipments
Authorization: Bearer <token>
```

#### Update Shipment Status
```http
PUT /api/shipments/:shipmentId/status
Authorization: Bearer <token>
Content-Type: application/json
```

#### Confirm Delivery
```http
PUT /api/shipments/:shipmentId/delivery
Authorization: Bearer <token>
Content-Type: application/json
```

#### Report Shipment Issue
```http
POST /api/shipments/:shipmentId/issues
Authorization: Bearer <token>
Content-Type: application/json
```

### Shipment Analytics

#### Get Shipment Statistics
```http
GET /api/shipments/stats/overview
Authorization: Bearer <token>
```

#### Search Shipments
```http
GET /api/shipments/search/query
Authorization: Bearer <token>
```

## QR Code Management

### QR Code Operations

#### Get User QR Codes
```http
GET /api/qr-codes
Authorization: Bearer <token>
```

#### Generate New QR Code
```http
POST /api/qr-codes
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get QR Code Statistics
```http
GET /api/qr-codes/stats
Authorization: Bearer <token>
```

#### Get QR Code by ID
```http
GET /api/qr-codes/:id
Authorization: Bearer <token>
```

#### Delete QR Code
```http
DELETE /api/qr-codes/:id
Authorization: Bearer <token>
```

## Data Export & Import

### Export Operations

#### Export Harvests
```http
POST /api/export-import/export/harvests
Authorization: Bearer <token>
Content-Type: application/json
```

#### Export Listings
```http
POST /api/export-import/export/listings
Authorization: Bearer <token>
Content-Type: application/json
```

#### Export Users
```http
POST /api/export-import/export/users
Authorization: Bearer <token>
Content-Type: application/json
```

#### Export Partners
```http
POST /api/export-import/export/partners
Authorization: Bearer <token>
Content-Type: application/json
```

#### Export Shipments
```http
POST /api/export-import/export/shipments
Authorization: Bearer <token>
Content-Type: application/json
```

#### Export Transactions
```http
POST /api/export-import/export/transactions
Authorization: Bearer <token>
Content-Type: application/json
```

#### Export Analytics
```http
POST /api/export-import/export/analytics
Authorization: Bearer <token>
Content-Type: application/json
```

#### Export Custom Data
```http
POST /api/export-import/export/custom
Authorization: Bearer <token>
Content-Type: application/json
```

### Import Operations

#### Import Data
```http
POST /api/export-import/import/data
Authorization: Bearer <token>
Content-Type: application/json
```

#### Import Harvests
```http
POST /api/export-import/import/harvests
Authorization: Bearer <token>
Content-Type: application/json
```

#### Import Listings
```http
POST /api/export-import/import/listings
Authorization: Bearer <token>
Content-Type: application/json
```

#### Import Users
```http
POST /api/export-import/import/users
Authorization: Bearer <token>
Content-Type: application/json
```

#### Import Partners
```http
POST /api/export-import/import/partners
Authorization: Bearer <token>
Content-Type: application/json
```

#### Import Shipments
```http
POST /api/export-import/import/shipments
Authorization: Bearer <token>
Content-Type: application/json
```

#### Import Transactions
```http
POST /api/export-import/import/transactions
Authorization: Bearer <token>
Content-Type: application/json
```

### Export/Import Utilities

#### Get Supported Formats
```http
GET /api/export-import/formats
```

#### Get Export Templates
```http
GET /api/export-import/templates
```

#### Validate Export Template
```http
POST /api/export-import/validate-template
Authorization: Bearer <token>
Content-Type: application/json
```

#### Get Export Statistics
```http
GET /api/export-import/stats
Authorization: Bearer <token>
```

#### Cleanup Old Exports
```http
POST /api/export-import/cleanup
Authorization: Bearer <token>
```

#### Download Export File
```http
GET /api/export-import/download/:filename
Authorization: Bearer <token>
```

#### Health Check
```http
GET /api/export-import/health
```

## Weather Information

### Weather Data

#### Get Weather Information
```http
GET /api/weather
```

## System & Health

### System Endpoints

#### Health Check
```http
GET /api/health
```

#### Metrics (Prometheus)
```http
GET /metrics
```

#### Root Endpoint
```http
GET /
```

## Error Handling

All API endpoints return consistent error responses:

### Success Response Format
```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response Format
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting based on environment:

- **Development**: Lenient rate limiting
- **Production**: Strict rate limiting with different limits for auth and general endpoints

## Authentication

Most endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## Authorization

Endpoints use role-based access control (RBAC) with the following roles:
- `farmer` - Smallholder farmers
- `buyer` - Agricultural product purchasers
- `partner` - Agricultural organizations and cooperatives
- `admin` - System administrators

## Pagination

List endpoints support pagination with query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

## File Uploads

File upload endpoints support:
- **Images**: JPG, JPEG, PNG formats
- **Documents**: CSV, PDF formats
- **Size Limits**: Configurable per endpoint

## WebSocket Support

Real-time updates are available via WebSocket connections for:
- Order status updates
- Shipment tracking
- Notifications
- Live chat (planned)

## SDK & Client Libraries

Official client libraries are available for:
- JavaScript/TypeScript (Node.js & Browser)
- Python
- PHP
- Java (planned)

## Support & Documentation

For additional support:
- **API Documentation**: `/api/docs` (Swagger UI)
- **Status Page**: `/api/status`
- **Support Email**: api-support@grochain.ng
- **Developer Portal**: https://developers.grochain.ng

