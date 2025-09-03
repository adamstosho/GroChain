const axios = require('axios')

async function testHarvestListingFix() {
  console.log('🔧 Testing Harvest-to-Listing Fix')
  console.log('=================================')

  // Get JWT token from environment
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
    console.log('7. Run: JWT_TOKEN=your_token_here node test-harvest-listing-fix.js')
    console.log('\n💡 Or create a .env file with: JWT_TOKEN=your_token_here')
    return
  }

  console.log('✅ JWT token found')

  try {
    // Step 1: Get user's harvests
    console.log('\n1️⃣ Fetching your harvests...')
    const harvestsResponse = await axios.get('http://localhost:5000/api/harvests', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const harvests = harvestsResponse.data.harvests || []
    console.log(`📊 Found ${harvests.length} harvests:`)

    harvests.forEach((h, i) => {
      console.log(`   ${i+1}. ${h.cropType} - ${h.quantity}${h.unit} - Status: ${h.status}`)
    })

    // Step 2: Find an approved harvest
    const approvedHarvest = harvests.find(h => h.status === 'approved')

    if (!approvedHarvest) {
      console.log('\n❌ No approved harvests found!')
      console.log('💡 You need to have at least one approved harvest to test listing creation.')
      console.log('   Go to your harvests page and make sure you have an approved harvest.')
      return
    }

    console.log(`\n✅ Found approved harvest: ${approvedHarvest.cropType} (ID: ${approvedHarvest._id})`)

    // Step 3: Test the fixed listing creation
    console.log('\n3️⃣ Testing the FIXED listing creation...')

    const listingData = {
      price: 7500, // ₦7,500
      description: `Premium ${approvedHarvest.cropType} harvest - fresh and ready for market`,
      quantity: approvedHarvest.quantity,
      unit: approvedHarvest.unit
    }

    console.log('📝 Creating listing with:', listingData)

    const createResponse = await axios.post(
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
    console.log('📊 Response:', JSON.stringify(createResponse.data, null, 2))

    // Step 4: Verify harvest status updated
    console.log('\n4️⃣ Verifying harvest status update...')

    const updatedHarvestResponse = await axios.get(`http://localhost:5000/api/harvests/id/${approvedHarvest._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const updatedHarvest = updatedHarvestResponse.data.harvest
    console.log(`✅ Harvest status updated to: "${updatedHarvest.status}"`)

    if (updatedHarvest.status === 'listed') {
      console.log('\n🏆 COMPLETE SUCCESS!')
      console.log('✅ Listing created from approved harvest')
      console.log('✅ Harvest status updated to "listed"')
      console.log('✅ No more 500 Internal Server Error!')
      console.log('\n🎊 Your harvest-to-marketplace workflow is now working perfectly!')
    } else {
      console.log('\n⚠️ Harvest status not updated correctly')
    }

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message)

    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Response:', JSON.stringify(error.response.data, null, 2))

      if (error.response.status === 500) {
        console.log('\n🚨 Still getting 500 error! The fix might not be complete.')
        console.log('Check the backend logs for more details.')
      } else if (error.response.status === 401) {
        console.log('\n🔐 Authentication failed - your JWT token might be expired.')
        console.log('Please get a fresh token from your browser.')
      }
    } else {
      console.error('Network error or other issue:', error.code)
    }
  }
}

testHarvestListingFix()

