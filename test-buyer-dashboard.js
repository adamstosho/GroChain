// Test script to verify buyer dashboard API
const fetch = require('node-fetch').default || require('node-fetch');

async function testBuyerDashboard() {
  try {
    console.log('🧪 Testing Buyer Dashboard API...');

    // Test login first
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'buyer@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Could not login test user. Please ensure a buyer user exists.');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    console.log('✅ Logged in successfully');

    // Test dashboard endpoint
    const dashboardResponse = await fetch('http://localhost:5000/api/users/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!dashboardResponse.ok) {
      console.log('❌ Dashboard API failed:', dashboardResponse.status);
      return;
    }

    const dashboardData = await dashboardResponse.json();
    console.log('📊 Dashboard Data:', JSON.stringify(dashboardData, null, 2));

    // Verify expected fields
    const expectedFields = [
      'totalOrders',
      'totalSpent',
      'monthlySpent',
      'favoriteProducts',
      'pendingDeliveries',
      'activeOrders'
    ];

    console.log('\n🔍 Checking expected fields:');
    expectedFields.forEach(field => {
      if (dashboardData.data && typeof dashboardData.data[field] !== 'undefined') {
        console.log(`✅ ${field}: ${dashboardData.data[field]}`);
      } else {
        console.log(`❌ ${field}: Missing or undefined`);
      }
    });

    console.log('\n🎉 Buyer dashboard test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBuyerDashboard();
