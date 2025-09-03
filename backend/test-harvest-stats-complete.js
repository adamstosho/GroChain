const axios = require('axios')

async function testHarvestStatsComplete() {
  console.log('🔍 Complete Harvest Stats Debugging Test')
  console.log('==========================================')

  try {
    // Step 1: Check if backend is running
    console.log('\n1️⃣ Checking backend server...')
    const healthResponse = await axios.get('http://localhost:5000/api/health')
    console.log('✅ Backend server running - Status:', healthResponse.status)

    // Step 2: Try to get a JWT token from environment or prompt user
    console.log('\n2️⃣ JWT Token Check...')

    let token = process.env.JWT_TOKEN

    if (!token) {
      console.log('❌ No JWT_TOKEN environment variable found')
      console.log('\n📋 To get your JWT token:')
      console.log('1. Open http://localhost:3000 in your browser')
      console.log('2. Login to your account')
      console.log('3. Open Developer Tools (F12)')
      console.log('4. Go to Console tab')
      console.log('5. Run: localStorage.getItem("grochain-auth")')
      console.log('6. Copy the token value')
      console.log('7. Run this script with: JWT_TOKEN=your_token_here node test-harvest-stats-complete.js')
      return
    }

    console.log('✅ JWT token found in environment')

    // Step 3: Test the harvest stats endpoint
    console.log('\n3️⃣ Testing harvest stats endpoint...')
    const statsResponse = await axios.get('http://localhost:5000/api/harvests/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ API Response Status:', statsResponse.status)
    console.log('📊 Raw Response:', JSON.stringify(statsResponse.data, null, 2))

    // Step 4: Parse the data
    console.log('\n4️⃣ Parsing response data...')
    let statsData
    if (statsResponse.data?.status === 'success' && statsResponse.data?.data) {
      statsData = statsResponse.data.data
      console.log('✅ Found stats in response.data.data')
    } else if (statsResponse.data?.data) {
      statsData = statsResponse.data.data
      console.log('✅ Found stats in response.data (direct)')
    } else {
      statsData = statsResponse.data
      console.log('⚠️ Using response directly as stats data')
    }

    // Step 5: Display the results
    console.log('\n5️⃣ Final Harvest Stats:')
    console.log('========================')
    console.log('Total Harvests:', statsData?.totalHarvests || 0)
    console.log('Pending:', statsData?.pendingHarvests || 0)
    console.log('Approved:', statsData?.approvedHarvests || 0)
    console.log('Rejected:', statsData?.rejectedHarvests || 0)
    console.log('Total Quantity:', statsData?.totalQuantity || 0)
    console.log('Total Value: ₦' + (statsData?.totalValue || 0))

    console.log('\n✅ Test completed successfully!')

    if ((statsData?.totalHarvests || 0) === 0) {
      console.log('\n⚠️ WARNING: Stats are still showing 0. This could mean:')
      console.log('• No harvests found for this user')
      console.log('• Authentication issue')
      console.log('• Database connection problem')
      console.log('• Frontend caching issue')
    }

  } catch (error) {
    console.error('\n❌ Error occurred:', error.message)

    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', JSON.stringify(error.response.data, null, 2))

      if (error.response.status === 401) {
        console.log('\n🔐 Authentication failed. Your JWT token might be expired or invalid.')
        console.log('Please get a fresh token from your browser.')
      }
    }

    console.log('\n🔧 Troubleshooting steps:')
    console.log('1. Make sure both backend (port 5000) and frontend (port 3000) are running')
    console.log('2. Ensure you are logged in to your account')
    console.log('3. Get a fresh JWT token from browser localStorage')
    console.log('4. Clear browser cache and hard refresh (Ctrl+F5)')
    console.log('5. Check browser console for any JavaScript errors')
  }
}

testHarvestStatsComplete()

