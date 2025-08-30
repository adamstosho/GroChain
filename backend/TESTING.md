# 🧪 GroChain Backend Endpoint Testing Guide

This guide provides comprehensive testing for all GroChain backend endpoints to ensure they're working correctly.

## 📋 Prerequisites

1. **Backend Server Running**: Make sure your GroChain backend is running
2. **Dependencies Installed**: Ensure all required packages are installed
3. **Environment Variables**: Set up your `.env` file with necessary configurations

## 🚀 Quick Start

### 1. Health Check (Recommended First Step)
```bash
# Check if backend is running and accessible
npm run test:health

# Or with custom URL
npm run test:health -- --base-url http://localhost:3000
```

### 2. Quick Endpoint Test
```bash
# Test public endpoints and basic functionality
npm run test:quick

# Or with custom URL
npm run test:quick -- --base-url http://localhost:3000
```

### 3. Comprehensive Endpoint Testing
```bash
# Test ALL endpoints systematically
npm run test:endpoints

# Or with custom URL
npm run test:endpoints -- --base-url http://localhost:3000
```

## 📁 Test Scripts Overview

### `test-health-check.js` - Health Check
- ✅ Verifies backend is running
- 🔍 Checks all API routes accessibility
- 📊 Reports endpoint status (accessible, requires auth, not found)
- 🚨 Provides troubleshooting tips

### `test-individual-endpoints.js` - Individual Testing
- 🧪 Tests specific endpoint categories
- 🔒 Supports authenticated endpoint testing
- 📝 Detailed response logging
- 🎯 Good for debugging specific issues

### `test-all-endpoints.js` - Comprehensive Testing
- 🚀 Tests ALL endpoints systematically
- 📊 Generates detailed test reports
- 💾 Saves results to JSON file
- 📈 Calculates success rates and timing

## 🔧 Configuration

### Environment Variables
```bash
# Base URL for testing (default: http://localhost:5000/api)
BASE_URL=http://localhost:3000/api

# JWT token for authenticated endpoint testing
AUTH_TOKEN=your_jwt_token_here
```

### Command Line Options
```bash
# Custom base URL
--base-url http://localhost:3000/api

# Help
--help or -h
```

## 📊 Testing Categories

### 🔐 Authentication Endpoints
- User registration
- Login/logout
- Password reset
- SMS OTP verification
- Token refresh

### 👥 User Management
- Profile management
- Preferences and settings
- Admin user operations
- Bulk operations

### 🤝 Partner Management
- Partner CRUD operations
- Dashboard and metrics
- Farmer onboarding
- CSV bulk upload

### 🛒 Marketplace
- Listings management
- Search and discovery
- Favorites system
- Order processing
- Image uploads

### 🌾 Harvest Management
- Harvest creation and tracking
- Provenance verification
- Batch management
- Approval workflows

### 💰 Fintech Services
- Credit scoring
- Loan applications
- Insurance policies
- Financial health analysis

### 📊 Analytics
- Dashboard metrics
- Transaction analytics
- Impact measurement
- Regional analysis
- Predictive analytics

### 📤📥 Export/Import
- Data export in multiple formats
- Bulk data import
- Template validation
- File management

### 🔔 Notifications
- Notification creation
- User preferences
- Delivery tracking

### 💳 Payments
- Payment initialization
- Verification
- Refund processing

### 📱 QR Codes
- QR code generation
- Verification
- Batch tracking

### 🔗 Referrals
- Referral management
- Statistics tracking
- Commission calculation

### 📦 Shipments
- Shipment tracking
- Status updates
- Route optimization

## 🎯 Testing Strategies

### 1. **Start with Health Check**
Always begin with health check to ensure backend is accessible:
```bash
npm run test:health
```

### 2. **Test Public Endpoints First**
Verify basic functionality before testing authenticated endpoints:
```bash
npm run test:quick
```

### 3. **Test with Authentication**
For full endpoint coverage, obtain a JWT token and test authenticated endpoints:
```bash
# Set your JWT token
export AUTH_TOKEN="your_jwt_token_here"

# Run comprehensive tests
npm run test:endpoints
```

### 4. **Debug Specific Issues**
Use individual testing for targeted debugging:
```bash
# Test specific category
node test-individual-endpoints.js
```

## 📈 Understanding Test Results

### Success Indicators
- ✅ **PASS**: Endpoint responded with 2xx status
- 🔒 **Requires Auth**: Endpoint returned 401 (expected for protected routes)
- 📊 **Response Data**: Valid JSON response received

### Failure Indicators
- ❌ **FAIL**: Endpoint returned 4xx/5xx status
- 🔌 **Connection Error**: Backend not accessible
- ⏰ **Timeout**: Endpoint took too long to respond

### Test Report
Comprehensive testing generates a detailed JSON report with:
- Total tests run
- Pass/fail counts
- Success rate percentage
- Individual test details
- Timing information

## 🚨 Troubleshooting

### Common Issues

#### 1. **Connection Refused**
```bash
❌ Error: connect ECONNREFUSED 127.0.0.1:5000
💡 Solution: Start your backend server first
```

#### 2. **Authentication Required**
```bash
🔒 /api/users/dashboard: 401 - Requires authentication
💡 Solution: Set AUTH_TOKEN environment variable
```

#### 3. **Endpoint Not Found**
```bash
❌ /api/invalid-route: 404 - Not found
💡 Solution: Check route configuration in app.js
```

#### 4. **Validation Errors**
```bash
❌ /api/auth/register: 400 - Validation failed
💡 Solution: Check request payload format
```

### Debugging Tips

1. **Check Backend Logs**: Monitor your backend console for errors
2. **Verify Environment**: Ensure all environment variables are set
3. **Check Database**: Verify MongoDB connection and collections
4. **Test Manually**: Use Postman or curl to test specific endpoints
5. **Review Routes**: Check if routes are properly registered in app.js

## 🔄 Continuous Testing

### Development Workflow
```bash
# 1. Start backend
npm run dev

# 2. In another terminal, run health check
npm run test:health

# 3. Run quick tests
npm run test:quick

# 4. After making changes, run comprehensive tests
npm run test:endpoints
```

### CI/CD Integration
```bash
# Add to your CI pipeline
npm run test:health
npm run test:endpoints
```

## 📚 Additional Resources

- **Backend Documentation**: Check `README.md` for setup instructions
- **API Documentation**: Swagger docs available at `/api-docs` (if configured)
- **Environment Template**: See `env.template` for required variables
- **Models**: Check `models/` directory for data structure
- **Controllers**: Review `controllers/` for business logic

## 🆘 Getting Help

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Review backend console logs**
3. **Verify environment configuration**
4. **Test with simpler tools (curl, Postman)**
5. **Check if backend dependencies are installed**

## 📝 Test Customization

You can customize the test scripts by:

1. **Modifying test data** in the script files
2. **Adding new endpoint categories** to test functions
3. **Adjusting timeouts** for slower environments
4. **Customizing success criteria** based on your needs

---

**Happy Testing! 🎉**

For more information, check the main `README.md` file or contact the development team.
