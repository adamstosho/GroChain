const axios = require('axios')

async function testHarvestStatsWithAuth() {
  try {
    console.log('🔗 Testing harvest stats API endpoint with authentication...')

    // First, let's try to login to get a valid token
    console.log('🔐 Attempting login to get JWT token...')

    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'omoridoh111@gmail.com',
      password: 'password123' // You may need to change this to your actual password
    })

    const token = loginResponse.data.token || loginResponse.data.data?.token
    console.log('✅ Login successful, got token')

    // Now test the harvest stats endpoint
    console.log('📊 Testing harvest stats endpoint...')

    const statsResponse = await axios.get('http://localhost:5000/api/harvests/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ Harvest Stats API Response:')
    console.log(JSON.stringify(statsResponse.data, null, 2))

    // Validate the response structure
    const data = statsResponse.data.data || statsResponse.data
    console.log('\n📈 Extracted Stats:')
    console.log('Total Harvests:', data.totalHarvests || 0)
    console.log('Pending:', data.pendingHarvests || 0)
    console.log('Approved:', data.approvedHarvests || 0)
    console.log('Rejected:', data.rejectedHarvests || 0)
    console.log('Total Quantity:', data.totalQuantity || 0)
    console.log('Total Value:', data.totalValue || 0)

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message)

    if (error.response?.status === 401) {
      console.log('\n🔐 Authentication failed. Please check your login credentials.')
      console.log('💡 Try updating the password in this script or get a token from your browser.')
    }

    console.log('\n📝 Alternative: Get token from browser localStorage:')
    console.log('1. Login to your app at http://localhost:3000')
    console.log('2. Open browser DevTools (F12)')
    console.log('3. Go to Console and run: localStorage.getItem("grochain-auth")')
    console.log('4. Copy the token and create a new test file with it')
  }
}

testHarvestStatsWithAuth()

