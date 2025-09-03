// Simple test to verify API connection from frontend
const testApiConnection = async () => {
  console.log('🧪 Testing API Connection...\n')

  const API_BASE_URL = 'http://localhost:5000/api'

  try {
    console.log('🔗 Testing basic API connectivity...')

    // Test basic listings endpoint
    const listingsResponse = await fetch(`${API_BASE_URL}/marketplace/listings?page=1&limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include'
    })

    console.log('📊 Listings API Response Status:', listingsResponse.status)

    if (listingsResponse.ok) {
      const listingsData = await listingsResponse.json()
      console.log('✅ Listings API working!')
      console.log('📦 Response structure:', JSON.stringify(listingsData, null, 2).substring(0, 500) + '...')

      // Extract product ID for detail test
      const listings = listingsData.data?.listings || listingsData.listings || []
      if (listings.length > 0) {
        const productId = listings[0]._id
        console.log('\n🔍 Testing product detail endpoint with ID:', productId)

        // Test product detail endpoint
        const detailResponse = await fetch(`${API_BASE_URL}/marketplace/listings/${productId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'include'
        })

        console.log('📊 Product Detail API Response Status:', detailResponse.status)

        if (detailResponse.ok) {
          const detailData = await detailResponse.json()
          console.log('✅ Product Detail API working!')
          console.log('📦 Product Detail Response:', JSON.stringify(detailData, null, 2).substring(0, 500) + '...')

          const product = detailData.data || detailData
          console.log('\n🎯 Product Info:')
          console.log(`   • Name: ${product.cropName || product.name || 'Unknown'}`)
          console.log(`   • ID: ${product._id}`)
          console.log(`   • Price: ${product.basePrice || 'N/A'}`)
          console.log(`   • Status: ${product.status || 'Unknown'}`)

          console.log('\n✅ SUCCESS: Both APIs are working correctly!')
          console.log(`🚀 Frontend should be able to load: http://localhost:3000/dashboard/products/${productId}`)

        } else {
          console.error('❌ Product Detail API failed with status:', detailResponse.status)
          const errorText = await detailResponse.text()
          console.error('Error details:', errorText)
        }
      } else {
        console.log('❌ No products found in listings')
      }
    } else {
      console.error('❌ Listings API failed with status:', listingsResponse.status)
      const errorText = await listingsResponse.text()
      console.error('Error details:', errorText)
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message)
    console.log('\n🔧 Troubleshooting Tips:')
    console.log('1. Ensure backend server is running on http://localhost:5000')
    console.log('2. Check if CORS is properly configured')
    console.log('3. Verify no firewall is blocking the connection')
    console.log('4. Check browser console for more detailed errors')
  }
}

// Run the test
testApiConnection()

