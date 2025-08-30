const axios = require('axios');
const fs = require('fs');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!',
  name: 'Test User',
  phone: '+2341234567890'
};

const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'Admin123!',
  name: 'Admin User',
  phone: '+2341234567891'
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const logTest = (endpoint, method, status, response, error = null) => {
  const result = {
    endpoint,
    method,
    status,
    success: status >= 200 && status < 300,
    response: response?.data || null,
    error: error?.message || null,
    timestamp: new Date().toISOString()
  };
  
  testResults.details.push(result);
  testResults.total++;
  
  if (result.success) {
    testResults.passed++;
    log(`PASS: ${method} ${endpoint}`, 'success');
  } else {
    testResults.failed++;
    log(`FAIL: ${method} ${endpoint} - Status: ${status}`, 'error');
    if (error) log(`Error: ${error.message}`, 'error');
  }
  
  return result;
};

// Test runner
const runTest = async (endpoint, method = 'GET', data = null, headers = {}) => {
  try {
    const config = {
      method: method.toLowerCase(),
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };
    
    if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
      config.data = data;
    }
    
    const response = await axios(config);
    return logTest(endpoint, method, response.status, response);
  } catch (error) {
    const status = error.response?.status || 0;
    const response = error.response;
    return logTest(endpoint, method, status, response, error);
  }
};

// Authentication tests
const testAuth = async () => {
  log('🔐 Testing Authentication Endpoints...');
  
  // Test registration
  await runTest('/auth/register', 'POST', TEST_USER);
  
  // Test login
  const loginResponse = await runTest('/auth/login', 'POST', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  
  if (loginResponse.success && loginResponse.response?.token) {
    global.authToken = loginResponse.response.token;
    log('✅ Authentication successful, token obtained', 'success');
  } else {
    log('❌ Authentication failed, some tests may not work', 'error');
  }
  
  // Test other auth endpoints
  await runTest('/auth/refresh', 'POST', { token: global.authToken });
  await runTest('/auth/forgot-password', 'POST', { email: TEST_USER.email });
  await runTest('/auth/resend-verification', 'POST', { email: TEST_USER.email });
};

// Health and public endpoints
const testPublicEndpoints = async () => {
  log('🏥 Testing Public Endpoints...');
  
  await runTest('/health');
  await runTest('/weather/current/Lagos');
  await runTest('/weather/forecast/Lagos');
  await runTest('/analytics/dashboard');
  await runTest('/analytics/harvests');
  await runTest('/analytics/marketplace');
  await runTest('/analytics/financial');
  await runTest('/export-import/formats');
  await runTest('/export-import/templates');
};

// User management tests
const testUserEndpoints = async () => {
  if (!global.authToken) {
    log('⚠️ Skipping user endpoints - no auth token', 'error');
    return;
  }
  
  log('👥 Testing User Management Endpoints...');
  
  const headers = { Authorization: `Bearer ${global.authToken}` };
  
  await runTest('/users/dashboard', 'GET', null, headers);
  await runTest('/users/profile/me', 'GET', null, headers);
  await runTest('/users/preferences/me', 'GET', null, headers);
  await runTest('/users/settings/me', 'GET', null, headers);
  
  // Test profile update
  await runTest('/users/profile/me', 'PUT', {
    name: 'Updated Test User',
    phone: '+2341234567890'
  }, headers);
  
  // Test preferences update
  await runTest('/users/preferences/me', 'PUT', {
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  }, headers);
};

// Partner endpoints
const testPartnerEndpoints = async () => {
  log('🤝 Testing Partner Endpoints...');
  
  // Public partner endpoints
  await runTest('/partners');
  await runTest('/partners/ping');
  await runTest('/partners/simple-test');
  
  if (global.authToken) {
    const headers = { Authorization: `Bearer ${global.authToken}` };
    
    // Protected partner endpoints
    await runTest('/partners/dashboard', 'GET', null, headers);
    await runTest('/partners/farmers', 'GET', null, headers);
    await runTest('/partners/commission', 'GET', null, headers);
    await runTest('/partners/auth-test', 'GET', null, headers);
    await runTest('/partners/test', 'GET', null, headers);
  }
};

// Marketplace endpoints
const testMarketplaceEndpoints = async () => {
  log('🛒 Testing Marketplace Endpoints...');
  
  // Public marketplace endpoints
  await runTest('/marketplace/listings');
  await runTest('/marketplace/search-suggestions?q=rice');
  
  if (global.authToken) {
    const headers = { Authorization: `Bearer ${global.authToken}` };
    
    // Protected marketplace endpoints
    await runTest('/marketplace/favorites/test-user-id', 'GET', null, headers);
    
    // Test listing creation
    const listingData = {
      cropName: 'Test Rice',
      basePrice: 50000,
      category: 'Grains',
      description: 'Test rice harvest',
      unit: 'kg',
      quantity: 100,
      location: {
        city: 'Lagos',
        state: 'Lagos'
      }
    };
    
    await runTest('/marketplace/listings', 'POST', listingData, headers);
  }
};

// Harvest endpoints
const testHarvestEndpoints = async () => {
  log('🌾 Testing Harvest Endpoints...');
  
  // Public harvest endpoints
      await runTest('/harvests/verification/test-batch-123');
  
  if (global.authToken) {
    const headers = { Authorization: `Bearer ${global.authToken}` };
    
    // Protected harvest endpoints
    await runTest('/harvests', 'GET', null, headers);
    await runTest('/harvests/provenance/test-batch-123', 'GET', null, headers);
    
    // Test harvest creation
    const harvestData = {
      cropName: 'Test Crop',
      quantity: 50,
      unit: 'kg',
      harvestDate: new Date().toISOString(),
      location: 'Test Farm',
      batchId: 'TEST-' + Date.now()
    };
    
    await runTest('/harvests', 'POST', harvestData, headers);
  }
};

// Fintech endpoints
const testFintechEndpoints = async () => {
  log('💰 Testing Fintech Endpoints...');
  
  if (global.authToken) {
    const headers = { Authorization: `Bearer ${global.authToken}` };
    
    // Public fintech endpoints (authenticated)
    await runTest('/fintech/loan-referrals', 'GET', null, headers);
    await runTest('/fintech/loan-stats', 'GET', null, headers);
    await runTest('/fintech/insurance-policies', 'GET', null, headers);
    await runTest('/fintech/insurance-stats', 'GET', null, headers);
    await runTest('/fintech/insurance-quotes', 'GET', null, headers);
    await runTest('/fintech/insurance-claims', 'GET', null, headers);
    
    // Protected fintech endpoints
    await runTest('/fintech/financial-health/test-farmer-123', 'GET', null, headers);
    await runTest('/fintech/crop-financials', 'GET', null, headers);
    await runTest('/fintech/financial-projections', 'GET', null, headers);
    await runTest('/fintech/credit-score/test-farmer-123', 'GET', null, headers);
    await runTest('/fintech/loan-applications', 'GET', null, headers);
  }
};

// Analytics endpoints
const testAnalyticsEndpoints = async () => {
  log('📊 Testing Analytics Endpoints...');
  
  if (global.authToken) {
    const headers = { Authorization: `Bearer ${global.authToken}` };
    
    // Protected analytics endpoints
    await runTest('/analytics/transactions', 'GET', null, headers);
    await runTest('/analytics/fintech', 'GET', null, headers);
    await runTest('/analytics/impact', 'GET', null, headers);
    await runTest('/analytics/weather', 'GET', null, headers);
    await runTest('/analytics/reports', 'GET', null, headers);
    await runTest('/analytics/predictive', 'GET', null, headers);
    await runTest('/analytics/summary', 'GET', null, headers);
  }
};

// Export/Import endpoints
const testExportImportEndpoints = async () => {
  log('📤📥 Testing Export/Import Endpoints...');
  
  if (global.authToken) {
    const headers = { Authorization: `Bearer ${global.authToken}` };
    
    // Test export endpoints
    await runTest('/export-import/export/harvests', 'POST', {}, headers);
    await runTest('/export-import/export/listings', 'POST', {}, headers);
    
    // Test import endpoints
    await runTest('/export-import/import/harvests', 'POST', {}, headers);
    await runTest('/export-import/import/listings', 'POST', {}, headers);
    
    // Test utility endpoints
    await runTest('/export-import/stats', 'GET', null, headers);
    await runTest('/export-import/cleanup', 'POST', {}, headers);
  }
};

// Notification endpoints
const testNotificationEndpoints = async () => {
  log('🔔 Testing Notification Endpoints...');
  
  if (global.authToken) {
    const headers = { Authorization: `Bearer ${global.authToken}` };
    
    await runTest('/notifications', 'GET', null, headers);
    
    // Test notification creation
    const notificationData = {
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'info',
      userId: 'test-user-id'
    };
    
    await runTest('/notifications', 'POST', notificationData, headers);
  }
};

// Payment endpoints
const testPaymentEndpoints = async () => {
  log('💳 Testing Payment Endpoints...');
  
  if (global.authToken) {
    const headers = { Authorization: `Bearer ${global.authToken}` };
    
    await runTest('/payments/initialize', 'POST', {
      amount: 50000,
      currency: 'NGN',
      reference: 'TEST-' + Date.now(),
      email: TEST_USER.email
    }, headers);
  }
};

// QR Code endpoints
const testQRCodeEndpoints = async () => {
  log('📱 Testing QR Code Endpoints...');
  
  if (global.authToken) {
    const headers = { Authorization: `Bearer ${global.authToken}` };
    
    await runTest('/qr-codes/generate', 'POST', {
      data: 'test-data',
      type: 'harvest'
    }, headers);
    
    await runTest('/qr-codes/verify/test-code-123', 'GET', null, headers);
  }
};

// Referral endpoints
const testReferralEndpoints = async () => {
  log('🔗 Testing Referral Endpoints...');
  
  if (global.authToken) {
    const headers = { Authorization: `Bearer ${global.authToken}` };
    
    await runTest('/referrals', 'GET', null, headers);
    await runTest('/referrals/stats', 'GET', null, headers);
    
    // Test referral creation
    const referralData = {
      referrerId: 'test-user-id',
      referredEmail: 'referred@example.com',
      referredName: 'Referred User',
      type: 'farmer'
    };
    
    await runTest('/referrals', 'POST', referralData, headers);
  }
};

// Shipment endpoints
const testShipmentEndpoints = async () => {
  log('📦 Testing Shipment Endpoints...');
  
  if (global.authToken) {
    const headers = { Authorization: `Bearer ${global.authToken}` };
    
    await runTest('/shipments', 'GET', null, headers);
    
    // Test shipment creation
    const shipmentData = {
      orderId: 'test-order-123',
      origin: 'Test Farm',
      destination: 'Test Market',
      items: ['test-item-1', 'test-item-2'],
      carrier: 'Test Carrier'
    };
    
    await runTest('/shipments', 'POST', shipmentData, headers);
  }
};

// Main test runner
const runAllTests = async () => {
  log('🚀 Starting GroChain Backend Endpoint Testing...');
  log(`📍 Testing against: ${BASE_URL}`);
  
  const startTime = Date.now();
  
  try {
    // Run tests in sequence
    await testAuth();
    await testPublicEndpoints();
    await testUserEndpoints();
    await testPartnerEndpoints();
    await testMarketplaceEndpoints();
    await testHarvestEndpoints();
    await testFintechEndpoints();
    await testAnalyticsEndpoints();
    await testExportImportEndpoints();
    await testNotificationEndpoints();
    await testPaymentEndpoints();
    await testQRCodeEndpoints();
    await testReferralEndpoints();
    await testShipmentEndpoints();
    
  } catch (error) {
    log(`❌ Test suite error: ${error.message}`, 'error');
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Generate test report
  const report = {
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(2) : 0,
      duration: `${duration}s`
    },
    details: testResults.details,
    timestamp: new Date().toISOString()
  };
  
  // Display summary
  log('\n📊 TEST RESULTS SUMMARY');
  log('='.repeat(50));
  log(`Total Tests: ${testResults.total}`);
  log(`Passed: ${testResults.passed} ✅`);
  log(`Failed: ${testResults.failed} ❌`);
  log(`Success Rate: ${report.summary.successRate}%`);
  log(`Duration: ${duration}s`);
  log('='.repeat(50));
  
  // Save detailed report
  const reportFile = `test-report-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  log(`📄 Detailed report saved to: ${reportFile}`);
  
  // Display failed tests
  if (testResults.failed > 0) {
    log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => !test.success)
      .forEach(test => {
        log(`  ${test.method} ${test.endpoint} - Status: ${test.status}`);
        if (test.error) log(`    Error: ${test.error}`);
      });
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
};

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
GroChain Backend Endpoint Tester

Usage: node test-all-endpoints.js [options]

Options:
  --base-url <url>    Base URL for testing (default: http://localhost:5000/api)
  --help, -h          Show this help message

Environment Variables:
  BASE_URL            Base URL for testing

Examples:
  node test-all-endpoints.js
  node test-all-endpoints.js --base-url http://localhost:3000/api
  BASE_URL=http://localhost:3000/api node test-all-endpoints.js
    `);
    process.exit(0);
  }
  
  const baseUrlIndex = args.indexOf('--base-url');
  if (baseUrlIndex !== -1 && args[baseUrlIndex + 1]) {
    process.env.BASE_URL = args[baseUrlIndex + 1];
  }
  
  runAllTests();
}

module.exports = {
  runAllTests,
  testResults
};
