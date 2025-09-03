const axios = require('axios')

async function testListingCreation() {
  console.log('🧪 Testing Harvest to Listing Creation')
  console.log('=====================================')

  try {
    // First, let's check if we can login to get a token
    console.log('\n1️⃣ Attempting to login...')

    let token
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'omoridoh111@gmail.com',
        password: 'password123' // This might need to be updated
      })

      token = loginResponse.data.token || loginResponse.data.data?.token
      console.log('✅ Login successful, got JWT token')
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message)
      console.log('💡 You can get a JWT token from browser localStorage and set JWT_TOKEN=your_token_here')
      return
    }

    // Step 2: Get user's harvests to find an approved one
    console.log('\n2️⃣ Fetching user harvests...')
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
      console.log('❌ No approved harvests found. Please approve a harvest first.')
      console.log('Available harvests:', harvests.map(h => `${h.cropType} (${h.status})`))
      return
    }

    console.log(`✅ Found approved harvest: ${approvedHarvest.cropType} (ID: ${approvedHarvest._id})`)

    // Step 3: Try to create a listing from the approved harvest
    console.log('\n3️⃣ Creating listing from approved harvest...')

    const listingData = {
      price: 5000, // ₦5,000
      description: `Fresh ${approvedHarvest.cropType} harvest ready for sale`,
      quantity: approvedHarvest.quantity,
      unit: approvedHarvest.unit
    }

    console.log('📝 Listing data:', listingData)

    try {
      const createListingResponse = await axios.post(
        `http://localhost:5000/api/harvest-approval/${approvedHarvest._id}/create-listing`,
        listingData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('✅ Listing created successfully!')
      console.log('📊 Response:', createListingResponse.data)

      // Step 4: Verify the harvest status was updated
      console.log('\n4️⃣ Verifying harvest status update...')
      const updatedHarvestResponse = await axios.get(`http://localhost:5000/api/harvests/id/${approvedHarvest._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const updatedHarvest = updatedHarvestResponse.data.harvest
      console.log(`✅ Harvest status updated to: ${updatedHarvest.status}`)

      if (updatedHarvest.status === 'listed') {
        console.log('🎉 SUCCESS! Harvest-to-listing workflow is working correctly!')
      } else {
        console.log('⚠️ Harvest status not updated correctly')
      }

    } catch (createError) {
      console.error('❌ Failed to create listing:', createError.response?.data || createError.message)

      if (createError.response?.status === 400) {
        console.log('💡 This might be because the harvest is not approved or other validation error')
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error.response?.data || error)
  }
}

testListingCreation()

