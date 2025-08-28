const axios = require('axios');

async function debugPartnerEndpoints() {
  try {
    // Login as partner
    console.log('🔐 Logging in as partner...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'partner@test.com',
      password: 'partner123'
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful, token received');
    
    // Test partner dashboard
    console.log('\n🔍 Testing partner dashboard...');
    try {
      const dashboardResponse = await axios.get('http://localhost:5000/api/partners/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Dashboard response:', dashboardResponse.data);
    } catch (error) {
      console.log('❌ Dashboard error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }
    
    // Test partner farmers
    console.log('\n🔍 Testing partner farmers...');
    try {
      const farmersResponse = await axios.get('http://localhost:5000/api/partners/farmers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Farmers response:', farmersResponse.data);
    } catch (error) {
      console.log('❌ Farmers error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }
    
    // Test partner commission
    console.log('\n🔍 Testing partner commission...');
    try {
      const commissionResponse = await axios.get('http://localhost:5000/api/partners/commission', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Commission response:', commissionResponse.data);
    } catch (error) {
      console.log('❌ Commission error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }
    
  } catch (error) {
    console.error('💥 Debug script error:', error.message);
  }
}

debugPartnerEndpoints();

