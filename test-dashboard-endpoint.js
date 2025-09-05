// Simple test for dashboard endpoint
const fetch = require('node-fetch').default || require('node-fetch');

async function testDashboard() {
  try {
    console.log('🧪 Testing dashboard endpoint...');

    // Test with a simple GET request to see if server is running
    const response = await fetch('http://localhost:5000/api/health', {
      method: 'GET'
    });

    if (!response.ok) {
      console.log('❌ Backend server not running');
      return;
    }

    console.log('✅ Backend server is running');

    // Try to get dashboard without auth first (should fail)
    const dashboardResponse = await fetch('http://localhost:5000/api/users/dashboard', {
      method: 'GET'
    });

    console.log('Dashboard response status:', dashboardResponse.status);

    if (dashboardResponse.status === 401) {
      console.log('✅ Authentication required (expected)');
    } else {
      console.log('❌ Unexpected response:', dashboardResponse.status);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testDashboard();
