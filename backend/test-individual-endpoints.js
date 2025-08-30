const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

// Test a single endpoint
const testEndpoint = async (endpoint, method = 'GET', data = null, headers = {}) => {
  try {
    console.log(`\n🧪 Testing: ${method} ${endpoint}`);
    
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
    
    console.log(`✅ SUCCESS: ${response.status} ${response.statusText}`);
    console.log(`📊 Response:`, JSON.stringify(response.data, null, 2));
    
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    const status = error.response?.status || 0;
    const message = error.response?.data?.message || error.message;
    
    console.log(`❌ FAILED: ${status} - ${message}`);
    if (error.response?.data) {
      console.log(`📊 Error Response:`, JSON.stringify(error.response.data, null, 2));
    }
    
    return { success: false, status, error: message };
  }
};

// Test specific endpoint categories
const testAuthEndpoints = async () => {
  console.log('\n🔐 Testing Authentication Endpoints...');
  
  await testEndpoint('/auth/register', 'POST', {
    email: 'test@example.com',
    password: 'Test123!',
    name: 'Test User',
    phone: '+2341234567890'
  });
  
  await testEndpoint('/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'Test123!'
  });
  
  await testEndpoint('/auth/forgot-password', 'POST', {
    email: 'test@example.com'
  });
};

const testPublicEndpoints = async () => {
  console.log('\n🏥 Testing Public Endpoints...');
  
  await testEndpoint('/health');
  await testEndpoint('/weather/current/Lagos');
  await testEndpoint('/analytics/dashboard');
  await testEndpoint('/partners');
  await testEndpoint('/marketplace/listings');
  await testEndpoint('/export-import/formats');
};

const testPartnerEndpoints = async () => {
  console.log('\n🤝 Testing Partner Endpoints...');
  
  await testEndpoint('/partners/ping');
  await testEndpoint('/partners/simple-test');
  await testEndpoint('/partners');
  await testEndpoint('/partners/1'); // Test with ID 1
};

const testMarketplaceEndpoints = async () => {
  console.log('\n🛒 Testing Marketplace Endpoints...');
  
  await testEndpoint('/marketplace/listings');
  await testEndpoint('/marketplace/search-suggestions?q=rice');
  await testEndpoint('/marketplace/listings/1'); // Test with ID 1
};

const testHarvestEndpoints = async () => {
  console.log('\n🌾 Testing Harvest Endpoints...');
  
  await testEndpoint('/harvests/verify/test-batch-123');
  await testEndpoint('/harvests');
};

const testFintechEndpoints = async () => {
  console.log('\n💰 Testing Fintech Endpoints...');
  
  await testEndpoint('/fintech/loan-stats');
  await testEndpoint('/fintech/insurance-stats');
};

const testAnalyticsEndpoints = async () => {
  console.log('\n📊 Testing Analytics Endpoints...');
  
  await testEndpoint('/analytics/harvests');
  await testEndpoint('/analytics/marketplace');
  await testEndpoint('/analytics/financial');
};

const testExportImportEndpoints = async () => {
  console.log('\n📤📥 Testing Export/Import Endpoints...');
  
  await testEndpoint('/export-import/templates');
  await testEndpoint('/export-import/health');
};

// Test with authentication
const testAuthenticatedEndpoints = async (token) => {
  if (!token) {
    console.log('\n⚠️ No auth token provided, skipping authenticated endpoints');
    return;
  }
  
  console.log('\n🔒 Testing Authenticated Endpoints...');
  
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test user endpoints
  await testEndpoint('/users/dashboard', 'GET', null, headers);
  await testEndpoint('/users/profile/me', 'GET', null, headers);
  
  // Test partner endpoints
  await testEndpoint('/partners/dashboard', 'GET', null, headers);
  await testEndpoint('/partners/farmers', 'GET', null, headers);
  
  // Test marketplace endpoints
  await testEndpoint('/marketplace/favorites/test-user-id', 'GET', null, headers);
  
  // Test harvest endpoints
  await testEndpoint('/harvests', 'GET', null, headers);
  
  // Test fintech endpoints
  await testEndpoint('/fintech/loan-referrals', 'GET', null, headers);
  await testEndpoint('/fintech/financial-health/test-farmer-123', 'GET', null, headers);
  
  // Test analytics endpoints
  await testEndpoint('/analytics/transactions', 'GET', null, headers);
  await testEndpoint('/analytics/fintech', 'GET', null, headers);
};

// Main test runner
const runTests = async () => {
  console.log('🚀 GroChain Backend Endpoint Testing');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log('='.repeat(60));
  
  try {
    // Test public endpoints first
    await testPublicEndpoints();
    await testAuthEndpoints();
    await testPartnerEndpoints();
    await testMarketplaceEndpoints();
    await testHarvestEndpoints();
    await testFintechEndpoints();
    await testAnalyticsEndpoints();
    await testExportImportEndpoints();
    
    // Test authenticated endpoints if you have a token
    const token = process.env.AUTH_TOKEN;
    if (token) {
      await testAuthenticatedEndpoints(token);
    } else {
      console.log('\n💡 To test authenticated endpoints, set AUTH_TOKEN environment variable');
      console.log('   Example: AUTH_TOKEN=your_jwt_token node test-individual-endpoints.js');
    }
    
  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
  }
  
  console.log('\n✨ Testing completed!');
};

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
GroChain Individual Endpoint Tester

Usage: node test-individual-endpoints.js [options]

Options:
  --base-url <url>    Base URL for testing (default: http://localhost:5000/api)
  --help, -h          Show this help message

Environment Variables:
  BASE_URL            Base URL for testing
  AUTH_TOKEN          JWT token for testing authenticated endpoints

Examples:
  node test-individual-endpoints.js
  node test-individual-endpoints.js --base-url http://localhost:3000/api
  AUTH_TOKEN=your_token node test-individual-endpoints.js
    `);
    process.exit(0);
  }
  
  const baseUrlIndex = args.indexOf('--base-url');
  if (baseUrlIndex !== -1 && args[baseUrlIndex + 1]) {
    process.env.BASE_URL = args[baseUrlIndex + 1];
  }
  
  runTests();
}

module.exports = {
  testEndpoint,
  runTests
};
