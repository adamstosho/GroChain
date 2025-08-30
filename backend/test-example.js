// Example: Testing Individual Endpoints Manually
// This script shows how to test specific endpoints for debugging

const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

// Example 1: Test a public endpoint
async function testPublicEndpoint() {
  try {
    console.log('🧪 Testing public endpoint: /health');
    
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Response:`, response.data);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
  }
}

// Example 2: Test authentication endpoint
async function testAuthEndpoint() {
  try {
    console.log('\n🧪 Testing auth endpoint: /auth/register');
    
    const userData = {
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User',
      phone: '+2341234567890'
    };
    
    const response = await axios.post(`${BASE_URL}/auth/register`, userData);
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Response:`, response.data);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
  }
}

// Example 3: Test with authentication
async function testAuthenticatedEndpoint(token) {
  if (!token) {
    console.log('\n⚠️ No token provided, skipping authenticated test');
    return;
  }
  
  try {
    console.log('\n🧪 Testing authenticated endpoint: /users/profile/me');
    
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(`${BASE_URL}/users/profile/me`, { headers });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Response:`, response.data);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
  }
}

// Example 4: Test marketplace endpoint
async function testMarketplaceEndpoint() {
  try {
    console.log('\n🧪 Testing marketplace endpoint: /marketplace/listings');
    
    const response = await axios.get(`${BASE_URL}/marketplace/listings`);
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Response:`, response.data);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
  }
}

// Example 5: Test with query parameters
async function testWithQueryParams() {
  try {
    console.log('\n🧪 Testing with query params: /marketplace/search-suggestions?q=rice');
    
    const response = await axios.get(`${BASE_URL}/marketplace/search-suggestions`, {
      params: { q: 'rice', limit: 5 }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Response:`, response.data);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
  }
}

// Example 6: Test error handling
async function testErrorHandling() {
  try {
    console.log('\n🧪 Testing error handling: /api/nonexistent-endpoint');
    
    const response = await axios.get(`${BASE_URL}/nonexistent-endpoint`);
    console.log(`✅ Status: ${response.status}`);
    
  } catch (error) {
    console.log(`❌ Expected Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
  }
}

// Main function
async function runExamples() {
  console.log('🚀 GroChain Endpoint Testing Examples');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('='.repeat(50));
  
  // Run examples
  await testPublicEndpoint();
  await testAuthEndpoint();
  await testMarketplaceEndpoint();
  await testWithQueryParams();
  await testErrorHandling();
  
  // Test authenticated endpoint if token is provided
  const token = process.env.AUTH_TOKEN;
  if (token) {
    await testAuthenticatedEndpoint(token);
  } else {
    console.log('\n💡 To test authenticated endpoints, set AUTH_TOKEN environment variable');
    console.log('   Example: AUTH_TOKEN=your_jwt_token node test-example.js');
  }
  
  console.log('\n✨ Examples completed!');
}

// Run if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = {
  testPublicEndpoint,
  testAuthEndpoint,
  testAuthenticatedEndpoint,
  testMarketplaceEndpoint,
  testWithQueryParams,
  testErrorHandling
};
