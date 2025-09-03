const axios = require('axios')

async function testListingAPIEndpoint() {
  console.log('🚀 Testing Listing API Endpoint')
  console.log('===============================')

  const token = process.env.JWT_TOKEN

  if (!token) {
    console.log('❌ No JWT_TOKEN found!')
    console.log('\n📋 How to get your JWT token:')
    console.log('1. Open http://localhost:3000 in your browser')
    console.log('2. Login to your account')
    console.log('3. Open Developer Tools (F12)')
    console.log('4. Go to Console tab')
    console.log('5. Run: localStorage.getItem("grochain_auth_token")')
    console.log('6. Copy the token (without quotes)')
    console.log('7. Run: JWT_TOKEN=your_token_here node test-listing-api-endpoint.js')
    console.log('\n💡 Alternative: Create a .env file with:')
    console.log('   JWT_TOKEN=your_token_here')
    return
  }

  console.log('✅ JWT token found')

  try {
    // Test the API endpoint with detailed logging
    console.log('\n📡 Testing harvest listing creation endpoint...')
    const harvestId = '68b5c2f77ab0d33736998087' // The ID from your error
    const testData = {
      price: 100,
      description: 'Test listing creation',
      quantity: 22,
      unit: 'kg'
    }

    console.log('🎯 Target harvest ID:', harvestId)
    console.log('📝 Test data:', JSON.stringify(testData, null, 2))

    const response = await axios.post(
      `http://localhost:5000/api/harvest-approval/${harvestId}/create-listing`,
      testData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    )

    console.log('\n🎉 SUCCESS! Listing created!')
    console.log('Response status:', response.status)
    console.log('Response data:', JSON.stringify(response.data, null, 2))

    if (response.data.status === 'success') {
      console.log('\n✅ LISTING CREATION WORKED!')
      console.log('The issue has been resolved!')
    }

  } catch (error) {
    console.log('\n❌ API Test Failed')
    console.log('==================')

    if (error.response) {
      console.log('Status:', error.response.status)
      console.log('Error message:', error.response.data?.message)

      // Check for our enhanced error messages
      if (error.response.data?.dbConnectionError) {
        console.log('\n💡 SOLUTION: MongoDB Connection Issue')
        console.log('The backend detected that MongoDB is not running.')
        console.log('')
        console.log('🔧 How to fix:')
        console.log('1. Install MongoDB: https://www.mongodb.com/try/download/community')
        console.log('2. Start MongoDB service: net start MongoDB')
        console.log('3. Or run: mongod --dbpath "C:\\data\\db"')
        console.log('')
        console.log('📝 Once MongoDB is running, try the listing creation again.')
      }

      if (error.response.data?.validationErrors) {
        console.log('\n💡 SOLUTION: Data Validation Errors')
        console.log('Validation errors found:')
        error.response.data.validationErrors.forEach((error, i) => {
          console.log(`   ${i+1}. ${error}`)
        })
      }

      if (error.response.data?.connectionError) {
        console.log('\n💡 SOLUTION: Database Connection Refused')
        console.log('The database connection was refused.')
        console.log('Make sure MongoDB is running and accessible.')
      }

    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running!')
      console.log('Start it with: cd backend && npm start')
    } else {
      console.log('❌ Network or other error:', error.message)
    }

    console.log('\n🔍 Check the backend server console logs for detailed error information.')
    console.log('The enhanced logging should show exactly what\'s failing.')
  }
}

testListingAPIEndpoint()

