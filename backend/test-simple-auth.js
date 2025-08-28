const axios = require('axios');

async function testSimpleAuth() {
  try {
    // Login as partner
    console.log('🔐 Logging in as partner...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'partner@test.com',
      password: 'partner123'
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful, token received');
    
    // Test a simple protected endpoint to see if auth works
    console.log('\n🔍 Testing simple protected endpoint...');
    try {
      const profileResponse = await axios.get('http://localhost:5000/api/users/profile/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Profile response status:', profileResponse.status);
      console.log('✅ Profile response data keys:', Object.keys(profileResponse.data));
    } catch (error) {
      console.log('❌ Profile error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }
    
    // Test a public endpoint
    console.log('\n🔍 Testing public endpoint...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Health response status:', healthResponse.status);
    } catch (error) {
      console.log('❌ Health error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testSimpleAuth();

