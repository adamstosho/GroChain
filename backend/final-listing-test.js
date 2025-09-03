const axios = require('axios')

async function finalListingTest() {
  console.log('🚀 FINAL LISTING CREATION TEST')
  console.log('==============================')

  const token = process.env.JWT_TOKEN

  if (!token) {
    console.log('❌ No JWT_TOKEN found!')
    console.log('\n📋 HOW TO GET YOUR JWT TOKEN:')
    console.log('=====================================')
    console.log('1. Open http://localhost:3000 in your browser')
    console.log('2. Login to your account (Adam Ridwan)')
    console.log('3. Open Developer Tools (F12)')
    console.log('4. Go to Console tab')
    console.log('5. Run this command:')
    console.log('   localStorage.getItem("grochain-auth")')
    console.log('6. Copy the token value (without quotes)')
    console.log('7. Run this script with:')
    console.log('   JWT_TOKEN=your_token_here node final-listing-test.js')
    console.log('\n💡 Alternative: Create a .env file with:')
    console.log('   JWT_TOKEN=your_token_here')
    return
  }

  console.log('✅ JWT token found')

  try {
    // Test 1: Check if backend is running
    console.log('\n🔍 Test 1: Backend connectivity...')
    try {
      const healthCheck = await axios.get('http://localhost:5000/api/health')
      console.log('✅ Backend is running (Status:', healthCheck.status + ')')
    } catch (error) {
      console.log('❌ Backend is not running or not accessible')
      console.log('💡 Make sure to start the backend: cd backend && npm start')
      return
    }

    // Test 2: Get user harvests
    console.log('\n🔍 Test 2: Fetching your harvests...')
    const harvestsResponse = await axios.get('http://localhost:5000/api/harvests', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const harvests = harvestsResponse.data.harvests || []
    console.log(`📊 Found ${harvests.length} harvests:`)

    harvests.forEach((h, i) => {
      const marker = h._id === '68b471a8c96aaa6cc501df16' ? '🎯' : '  '
      console.log(`${marker} ${i+1}. ${h.cropType} - ${h.quantity}${h.unit} - Status: ${h.status} - ID: ${h._id}`)
    })

    // Test 3: Find the specific harvest
    const targetHarvest = harvests.find(h => h._id === '68b471a8c96aaa6cc501df16')
    if (!targetHarvest) {
      console.log('\n❌ TARGET HARVEST NOT FOUND!')
      console.log('The harvest ID 68b471a8c96aaa6cc501df16 does not exist in your account.')
      console.log('This might mean:')
      console.log('• The harvest was deleted')
      console.log('• You are logged in with a different account')
      console.log('• The harvest ID is incorrect')
      return
    }

    console.log(`\n✅ Found target harvest: ${targetHarvest.cropType}`)
    console.log(`   Status: ${targetHarvest.status}`)
    console.log(`   Quantity: ${targetHarvest.quantity} ${targetHarvest.unit}`)
    console.log(`   Location: ${targetHarvest.location}`)
    console.log(`   Quality: ${targetHarvest.quality}`)

    // Test 4: Validate harvest can be listed
    if (targetHarvest.status !== 'approved') {
      console.log(`\n❌ HARVEST CANNOT BE LISTED!`)
      console.log(`Status is "${targetHarvest.status}", but it needs to be "approved"`)
      console.log('💡 You need to get this harvest approved first.')
      console.log('   Contact an admin or partner to approve your harvest.')
      return
    }

    // Test 5: Attempt to create listing
    console.log('\n🚀 Test 5: Creating listing from harvest...')

    const listingData = {
      price: 6000,
      description: `Premium ${targetHarvest.cropType} harvest - fresh and ready`,
      quantity: targetHarvest.quantity,
      unit: targetHarvest.unit
    }

    console.log('📝 Listing data to send:')
    console.log(JSON.stringify(listingData, null, 2))

    try {
      console.log('\n📡 Sending request to backend...')
      const createResponse = await axios.post(
        `http://localhost:5000/api/harvest-approval/${targetHarvest._id}/create-listing`,
        listingData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      )

      console.log('\n🎉 SUCCESS! LISTING CREATED!')
      console.log('================================')
      console.log('Response Status:', createResponse.status)
      console.log('Response Data:', JSON.stringify(createResponse.data, null, 2))

      if (createResponse.data.status === 'success') {
        console.log('\n✅ THE FIX WORKED!')
        console.log('✅ Harvest-to-listing conversion is now working')
        console.log('✅ You can now list approved harvests without errors')
        console.log('\n🎊 Try it in your browser now!')
      }

    } catch (createError) {
      console.log('\n❌ LISTING CREATION FAILED')
      console.log('===========================')
      console.log('Status:', createError.response?.status || 'Network Error')
      console.log('Message:', createError.response?.data?.message || createError.message)

      if (createError.response?.data?.details) {
        console.log('\n📋 Validation Details:')
        createError.response.data.details.forEach((detail, i) => {
          console.log(`   ${i+1}. ${detail}`)
        })
      }

      // Specific troubleshooting based on error type
      console.log('\n🔧 TROUBLESHOOTING:')
      if (createError.response?.status === 409) {
        console.log('• A listing already exists for this harvest')
        console.log('• Check your marketplace for existing listings')
      } else if (createError.response?.status === 400) {
        console.log('• Validation error - check the details above')
        console.log('• Make sure the harvest data is complete and valid')
      } else if (createError.response?.status === 401) {
        console.log('• Authentication failed - your token might be expired')
        console.log('• Try logging out and logging back in')
      } else if (createError.response?.status === 403) {
        console.log('• You do not own this harvest')
        console.log('• Make sure you are logged in with the correct account')
      } else if (createError.response?.status === 404) {
        console.log('• Harvest not found')
        console.log('• The harvest might have been deleted')
      } else {
        console.log('• Unknown server error')
        console.log('• Check backend logs for more details')
        console.log('• The database might have connection issues')
      }
    }

  } catch (error) {
    console.log('\n❌ TEST FAILED WITH ERROR:')
    console.log('==========================')
    console.log('Error:', error.message)

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend server is not running')
      console.log('   Start it with: cd backend && npm start')
    } else if (error.response) {
      console.log('Status:', error.response.status)
      console.log('Response:', JSON.stringify(error.response.data, null, 2))
    }
  }
}

finalListingTest()

