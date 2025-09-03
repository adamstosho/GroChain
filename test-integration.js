// GroChain Integration Test Script
// Run this to test your frontend-backend integration

const BASE_URL = 'http://localhost:5000/api';

async function testIntegration() {
  console.log('🚀 Starting GroChain Integration Tests...\n');

  try {
    // Test 1: Backend Health Check
    console.log('📡 Testing Backend Health...');
    const healthResponse = await fetch(`${BASE_URL.replace('/api', '')}/api/health`);
    const healthData = await healthResponse.json();

    if (healthData.status === 'success') {
      console.log('✅ Backend is running successfully');
    } else {
      console.log('❌ Backend health check failed');
      return;
    }

    // Test 2: CORS Configuration
    console.log('\n🌐 Testing CORS Configuration...');
    const corsResponse = await fetch(`${BASE_URL}/users/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (corsResponse.status === 401) {
      console.log('✅ CORS is properly configured (401 expected without auth)');
    } else if (corsResponse.status === 200) {
      console.log('✅ CORS is working and authentication passed');
    } else {
      console.log('⚠️ CORS response:', corsResponse.status);
    }

    // Test 3: API Endpoints Structure
    console.log('\n🔗 Testing API Endpoints...');
    const endpoints = [
      '/auth/login',
      '/auth/register',
      '/users/dashboard',
      '/harvests',
      '/fintech/credit-score/me'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'OPTIONS',
          credentials: 'include'
        });
        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: Error - ${error.message}`);
      }
    }

    console.log('\n🎉 Integration Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start your frontend: cd client && npm run dev');
    console.log('2. Open http://localhost:3000');
    console.log('3. Register as a farmer');
    console.log('4. Check browser console for any errors');
    console.log('5. Verify dashboard loads data correctly');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: cd backend && npm run dev');
    console.log('2. Check environment variables in backend/.env');
    console.log('3. Verify MongoDB connection');
    console.log('4. Check CORS settings in backend/app.js');
  }
}

// Run the test
testIntegration();

