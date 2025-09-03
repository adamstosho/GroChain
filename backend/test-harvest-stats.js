const axios = require('axios')

async function testHarvestStats() {
  try {
    // Replace with your actual JWT token from browser localStorage
    // You can get this by logging into the app and checking localStorage.getItem('grochain-auth')
    const jwt = process.env.JWT_TOKEN || 'your-jwt-token-here'

    console.log('🔗 Testing harvest stats API endpoint...')
    console.log('📊 This endpoint should return your actual harvest statistics')

    const response = await axios.get('http://localhost:5000/api/harvests/stats', {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ Harvest Stats API Response:')
    console.log(JSON.stringify(response.data, null, 2))

    // Validate the response structure
    const data = response.data.data || response.data
    console.log('\n📈 Extracted Stats:')
    console.log('Total Harvests:', data.totalHarvests || 0)
    console.log('Pending:', data.pendingHarvests || 0)
    console.log('Approved:', data.approvedHarvests || 0)
    console.log('Rejected:', data.rejectedHarvests || 0)
    console.log('Total Quantity:', data.totalQuantity || 0)
    console.log('Total Value:', data.totalValue || 0)

  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message)
    console.log('\n📝 To test this properly:')
    console.log('1. Make sure your backend server is running: npm start')
    console.log('2. Login to your app at http://localhost:3000')
    console.log('3. Open browser DevTools (F12) and go to Console')
    console.log('4. Run: localStorage.getItem("grochain-auth")')
    console.log('5. Copy the JWT token and set it as JWT_TOKEN environment variable')
    console.log('6. Run: JWT_TOKEN=your_token_here node test-harvest-stats.js')
  }
}

testHarvestStats()

