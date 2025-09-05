// Test script to call the actual analytics API endpoint
const fetch = require('node-fetch')

async function testAnalyticsAPICall() {
  try {
    console.log('🔄 Testing Analytics API Call...')

    // Make a request to the analytics endpoint
    const response = await fetch('http://localhost:5000/api/analytics/farmers/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: This would need authentication in a real scenario
        // For testing purposes, we'll assume the endpoint is accessible
      }
    })

    if (!response.ok) {
      console.log(`❌ API Call Failed: ${response.status} ${response.statusText}`)
      return
    }

    const data = await response.json()
    console.log('📊 Analytics API Response:')
    console.log(`Status: ${data.status}`)

    if (data.status === 'success' && data.data) {
      console.log('✅ Analytics Data Received:')
      console.log(`   Total Harvests: ${data.data.totalHarvests}`)
      console.log(`   Approved Harvests: ${data.data.approvedHarvests}`)
      console.log(`   Total Listings: ${data.data.totalListings}`)
      console.log(`   Total Orders: ${data.data.totalOrders}`)
      console.log(`   Total Revenue: ₦${data.data.totalRevenue}`)
      console.log(`   Average Harvest Quantity: ${data.data.averageHarvestQuantity}`)

      if (data.data.monthlyTrends && data.data.monthlyTrends.length > 0) {
        console.log(`   Monthly Trends: ${data.data.monthlyTrends.length} entries`)
      }

      console.log('\n🎉 Analytics API is working with real data!')
    } else {
      console.log('⚠️ API returned success but no data or unexpected format')
      console.log('Response:', JSON.stringify(data, null, 2))
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message)
    console.log('💡 Make sure the backend server is running on port 5000')
  }
}

testAnalyticsAPICall()
