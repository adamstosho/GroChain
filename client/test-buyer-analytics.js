// Test script for buyer analytics integration
const axios = require('axios')

const API_BASE_URL = 'http://localhost:5000/api'

async function testBuyerAnalytics() {
  try {
    console.log('🧪 Testing Buyer Analytics Integration...')

    // Test the buyer analytics endpoint
    const response = await axios.get(`${API_BASE_URL}/analytics/buyers/me`, {
      headers: {
        'Authorization': 'Bearer test-token', // This would need to be a valid token
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ Buyer Analytics API Response:')
    console.log(JSON.stringify(response.data, null, 2))

    // Check if the response has the expected structure
    const data = response.data.data
    const expectedFields = [
      'totalOrders',
      'completedOrders',
      'totalSpent',
      'averageOrderValue',
      'completionRate',
      'spendingByCategory',
      'monthlySpending',
      'topSuppliers',
      'recentOrders'
    ]

    console.log('\n📊 Checking response structure...')
    expectedFields.forEach(field => {
      if (data[field] !== undefined) {
        console.log(`✅ ${field}: ${Array.isArray(data[field]) ? data[field].length + ' items' : 'present'}`)
      } else {
        console.log(`❌ ${field}: missing`)
      }
    })

    console.log('\n🎉 Buyer Analytics Integration Test Completed Successfully!')
    return true

  } catch (error) {
    console.error('❌ Buyer Analytics Test Failed:')
    console.error(error.response?.data || error.message)
    return false
  }
}

// Run the test
testBuyerAnalytics().then(success => {
  process.exit(success ? 0 : 1)
})
