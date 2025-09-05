const axios = require('axios')

// Test partner dashboard endpoints
async function testPartnerDashboard() {
  const baseUrl = 'http://localhost:5000/api'
  const partnerCredentials = {
    email: 'adam.baqir@test.com',
    password: 'password123'
  }

  try {
    console.log('🧪 Testing Partner Dashboard Integration...\n')

    // 1. Login as partner
    console.log('1. Logging in as partner...')
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, partnerCredentials)
    const token = loginResponse.data.token
    console.log('✅ Login successful, token received\n')

    // Set authorization header
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    // 2. Test partner dashboard endpoint
    console.log('2. Testing /partners/dashboard endpoint...')
    const dashboardResponse = await axios.get(`${baseUrl}/partners/dashboard`, { headers })
    console.log('✅ Dashboard data:', dashboardResponse.data.data)
    console.log()

    // 3. Test partner farmers endpoint
    console.log('3. Testing /partners/farmers endpoint...')
    const farmersResponse = await axios.get(`${baseUrl}/partners/farmers`, { headers })
    console.log('✅ Farmers data:', {
      total: farmersResponse.data.data.total,
      farmerCount: farmersResponse.data.data.farmers.length,
      sampleFarmer: farmersResponse.data.data.farmers[0]?.name || 'None'
    })
    console.log()

    // 4. Test partner metrics endpoint
    console.log('4. Testing /partners/metrics endpoint...')
    const metricsResponse = await axios.get(`${baseUrl}/partners/metrics`, { headers })
    console.log('✅ Metrics data:', metricsResponse.data.data)
    console.log()

    // 5. Test partner commission endpoint
    console.log('5. Testing /partners/commission endpoint...')
    const commissionResponse = await axios.get(`${baseUrl}/partners/commission`, { headers })
    console.log('✅ Commission data:', commissionResponse.data.data)
    console.log()

    console.log('🎉 All partner dashboard endpoints are working correctly!')
    console.log('\n📊 Dashboard Summary:')
    console.log(`   - Total Farmers: ${dashboardResponse.data.data.totalFarmers}`)
    console.log(`   - Active Farmers: ${dashboardResponse.data.data.activeFarmers}`)
    console.log(`   - Commission Rate: ${(commissionResponse.data.data.commissionRate * 100).toFixed(1)}%`)
    console.log(`   - Total Earnings: ₦${commissionResponse.data.data.totalEarned.toLocaleString()}`)

    console.log('\n🌐 Frontend Dashboard URL: http://localhost:3000/dashboard')
    console.log('🔑 Test Login Credentials:')
    console.log(`   Email: ${partnerCredentials.email}`)
    console.log(`   Password: ${partnerCredentials.password}`)

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message)

    if (error.response?.status === 401) {
      console.log('\n🔐 Authentication failed. Make sure the partner account exists.')
      console.log('Run the test data creation script first:')
      console.log('cd backend && node create-test-data.js')
    }

    if (error.response?.status === 404) {
      console.log('\n🔍 Endpoint not found. Make sure the backend server is running on port 5000')
    }

    if (error.code === 'ECONNREFUSED') {
      console.log('\n🚫 Cannot connect to backend server. Make sure it is running:')
      console.log('cd backend && npm run dev')
    }
  }
}

// Run the test
testPartnerDashboard()
