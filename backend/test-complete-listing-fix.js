const axios = require('axios')

async function testCompleteListingFix() {
  console.log('🚀 COMPLETE LISTING CREATION FIX TEST')
  console.log('=====================================')

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
    console.log('7. Run: JWT_TOKEN=your_token_here node test-complete-listing-fix.js')
    return
  }

  try {
    console.log('✅ JWT token found')

    // Step 1: Check if backend is running
    console.log('\n1️⃣ Checking backend server...')
    try {
      const healthCheck = await axios.get('http://localhost:5000/api/health')
      console.log('✅ Backend server is running')
    } catch (error) {
      console.log('❌ Backend server is not running')
      console.log('💡 Please start the backend: cd backend && npm start')
      return
    }

    // Step 2: Test the API endpoint directly
    console.log('\n2️⃣ Testing listing creation endpoint...')
    const testHarvestId = '68b5c2f77ab0d33736998087' // From the user's error
    const testData = {
      price: 150,
      description: 'Test listing from automated test',
      quantity: 25,
      unit: 'kg'
    }

    console.log('📝 Test data:', testData)
    console.log('🎯 Target harvest ID:', testHarvestId)

    try {
      const response = await axios.post(
        `http://localhost:5000/api/harvest-approval/${testHarvestId}/create-listing`,
        testData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      )

      console.log('\n🎉 SUCCESS! Listing created successfully!')
      console.log('Response:', JSON.stringify(response.data, null, 2))

      if (response.data.status === 'success') {
        console.log('\n✅ ALL FIXES WORKING PERFECTLY!')
        console.log('✅ ReferenceError resolved')
        console.log('✅ Database connection check working')
        console.log('✅ Listing creation successful')
        console.log('\n🎊 Your harvest-to-marketplace listing is now working!')
        console.log('\n🌟 Next Steps:')
        console.log('1. Go to: http://localhost:3000/dashboard/marketplace/new?harvestId=' + testHarvestId)
        console.log('2. Set your price and description')
        console.log('3. Click "List Harvest"')
        console.log('4. It should work without any 500 errors!')
      }

    } catch (apiError) {
      console.log('\n❌ API Test Failed')
      console.log('Status:', apiError.response?.status)
      console.log('Error:', apiError.response?.data?.message)

      if (apiError.response?.status === 500) {
        console.log('\n🚨 Still getting 500 error - possible causes:')
        console.log('• MongoDB is not running')
        console.log('• Backend server needs restart')
        console.log('• There might be another error in the code')

        if (apiError.response?.data?.message?.includes('ECONNREFUSED')) {
          console.log('\n💡 SOLUTION: Start MongoDB')
          console.log('   Run: backend\\start-mongodb.bat')
        } else if (apiError.response?.data?.errorType === 'ReferenceError') {
          console.log('\n💡 SOLUTION: Backend server needs restart')
          console.log('   Stop backend (Ctrl+C) and restart: npm start')
        }
      } else if (apiError.response?.status === 404) {
        console.log('\n💡 Harvest not found or you do not own it')
        console.log('   Check that the harvest exists and belongs to your account')
      } else if (apiError.response?.status === 400) {
        console.log('\n💡 Validation error:', apiError.response?.data?.message)
      }

      console.log('\n🔧 Troubleshooting steps:')
      console.log('1. Make sure MongoDB is running: backend\\start-mongodb.bat')
      console.log('2. Restart backend server: cd backend && npm start')
      console.log('3. Check backend console logs for detailed errors')
      console.log('4. Verify you own the harvest with ID:', testHarvestId)
    }

  } catch (error) {
    console.log('\n❌ Test failed with error:', error.message)
  }
}

testCompleteListingFix()

