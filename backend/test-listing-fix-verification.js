const axios = require('axios')

async function testListingFix() {
  console.log('🧪 Testing Harvest-to-Listing Fix')
  console.log('================================')

  const token = process.env.JWT_TOKEN

  if (!token) {
    console.log('❌ No JWT_TOKEN found!')
    console.log('\n📋 How to get your JWT token:')
    console.log('1. Open http://localhost:3000 in your browser')
    console.log('2. Login to your account')
    console.log('3. Open Developer Tools (F12)')
    console.log('4. Go to Console tab')
    console.log('5. Run: localStorage.getItem("grochain-auth")')
    console.log('6. Copy the token (without quotes)')
    console.log('7. Run: JWT_TOKEN=your_token_here node test-listing-fix-verification.js')
    console.log('\n💡 Or create a .env file with: JWT_TOKEN=your_token_here')
    return
  }

  try {
    console.log('✅ JWT token found')

    // Step 1: Get user's harvests
    console.log('\n1️⃣ Fetching your harvests...')
    const harvestsResponse = await axios.get('http://localhost:5000/api/harvests', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const harvests = harvestsResponse.data.harvests || []
    console.log(`Found ${harvests.length} harvests`)

    // Find an approved harvest
    const approvedHarvest = harvests.find(h => h.status === 'approved')
    if (!approvedHarvest) {
      console.log('❌ No approved harvests found!')
      console.log('Make sure you have at least one approved harvest.')
      return
    }

    console.log(`✅ Found approved harvest: ${approvedHarvest.cropType} (ID: ${approvedHarvest._id})`)

    // Step 2: Test the fixed listing creation
    console.log('\n2️⃣ Testing the FIXED listing creation...')

    const listingData = {
      price: 7500,
      description: `Premium ${approvedHarvest.cropType} harvest - fresh and ready`,
      quantity: approvedHarvest.quantity,
      unit: approvedHarvest.unit
    }

    console.log('📝 Creating listing with:', listingData)

    const response = await axios.post(
      `http://localhost:5000/api/harvest-approval/${approvedHarvest._id}/create-listing`,
      listingData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('\n🎉 SUCCESS! Listing created successfully!')
    console.log('📊 Response:', JSON.stringify(response.data, null, 2))

    if (response.data.status === 'success') {
      console.log('\n✅ The 500 Internal Server Error has been FIXED!')
      console.log('✅ Harvest-to-marketplace workflow is working!')
      console.log('✅ You can now list approved harvests without errors!')
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)

    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Response:', JSON.stringify(error.response.data, null, 2))

      if (error.response.status === 400) {
        console.log('\n💡 Validation error - check the error details above')
      } else if (error.response.status === 401) {
        console.log('\n🔐 Authentication failed - your JWT token might be expired')
      } else if (error.response.status === 500) {
        console.log('\n🚨 Still getting 500 error - the fix might need more work')
        console.log('Check the backend logs for detailed error information')
      }
    } else {
      console.error('Network error or other issue')
    }
  }
}

testListingFix()

