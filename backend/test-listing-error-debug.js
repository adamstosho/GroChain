const axios = require('axios')

async function testListingErrorDebug() {
  console.log('🔍 Listing Creation Error Debug Test')
  console.log('=====================================')

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
    console.log('7. Run: JWT_TOKEN=your_token_here node test-listing-error-debug.js')
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

    // Find the problematic harvest
    const targetHarvest = harvests.find(h => h._id === '68b471a8c96aaa6cc501df16')
    if (!targetHarvest) {
      console.log('❌ Could not find the harvest with ID: 68b471a8c96aaa6cc501df16')
      console.log('Available harvests:')
      harvests.forEach((h, i) => {
        console.log(`  ${i+1}. ${h.cropType} - ${h._id} (${h.status})`)
      })
      return
    }

    console.log(`✅ Found target harvest: ${targetHarvest.cropType} (${targetHarvest.status})`)
    console.log(`   Location: ${targetHarvest.location}`)
    console.log(`   Quantity: ${targetHarvest.quantity} ${targetHarvest.unit}`)
    console.log(`   Quality: ${targetHarvest.quality}`)

    // Check if harvest is approved
    if (targetHarvest.status !== 'approved') {
      console.log(`❌ Harvest status is "${targetHarvest.status}", not "approved"`)
      console.log('💡 You need to get this harvest approved first')
      return
    }

    // Step 2: Try to create listing with detailed error handling
    console.log('\n2️⃣ Attempting to create listing...')

    const listingData = {
      price: 5500,
      description: `Fresh ${targetHarvest.cropType} harvest ready for sale`,
      quantity: targetHarvest.quantity,
      unit: targetHarvest.unit
    }

    console.log('📝 Listing data:', listingData)

    try {
      const response = await axios.post(
        `http://localhost:5000/api/harvest-approval/${targetHarvest._id}/create-listing`,
        listingData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('\n🎉 SUCCESS! Listing created!')
      console.log('Response:', JSON.stringify(response.data, null, 2))

    } catch (error) {
      console.log('\n❌ FAILED to create listing!')
      console.log('Status:', error.response?.status)
      console.log('Error message:', error.response?.data?.message)

      if (error.response?.data?.details) {
        console.log('Validation details:')
        error.response.data.details.forEach((detail, i) => {
          console.log(`  ${i+1}. ${detail}`)
        })
      }

      // Provide specific troubleshooting based on error
      if (error.response?.status === 409) {
        console.log('\n💡 TROUBLESHOOTING: Duplicate listing')
        console.log('   A listing already exists for this harvest')
        console.log('   Check your marketplace for existing listings')
      } else if (error.response?.status === 400) {
        console.log('\n💡 TROUBLESHOOTING: Validation error')
        console.log('   Check the validation details above')
        console.log('   Make sure all required fields are provided')
      } else if (error.response?.status === 500) {
        console.log('\n💡 TROUBLESHOOTING: Server error')
        console.log('   Check backend logs for more details')
        console.log('   The issue might be with database connection or schema')
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed with network error:', error.message)
  }
}

testListingErrorDebug()

