// Test the frontend API service directly
import { apiService } from './lib/api.js'

const testFrontendAPI = async () => {
  console.log('🧪 Testing Frontend API Service...\n')

  try {
    console.log('🔗 Testing marketplace listings...')

    // Test the frontend API service
    const response = await apiService.getMarketplaceListings({ page: 1, limit: 1 })

    console.log('✅ Frontend API working!')
    console.log('📦 Response structure:', response)

    if (response.data) {
      const listings = response.data.listings || response.data.data?.listings || response.data
      console.log('📋 Listings data:', listings)

      if (Array.isArray(listings) && listings.length > 0) {
        const productId = listings[0]._id
        console.log('\n🔍 Testing product detail with ID:', productId)

        // Test product detail
        const detailResponse = await apiService.getProductDetails(productId)
        console.log('✅ Product detail API working!')
        console.log('📦 Product detail response:', detailResponse)

        if (detailResponse.data) {
          const product = detailResponse.data.data || detailResponse.data
          console.log('\n🎯 Product Info:')
          console.log(`   • Name: ${product.cropName || product.name || 'Unknown'}`)
          console.log(`   • Price: ₦${product.basePrice || 'N/A'}`)
          console.log(`   • Status: ${product.status || 'Unknown'}`)

          console.log('\n✅ SUCCESS: Frontend API is working correctly!')
          console.log(`🚀 Product Detail URL: http://localhost:3000/dashboard/products/${productId}`)
        } else {
          console.error('❌ No product data in response')
        }
      } else {
        console.log('❌ No listings found')
      }
    } else {
      console.error('❌ No data in response')
    }

  } catch (error) {
    console.error('❌ Frontend API Error:', error.message)
    console.error('Full error:', error)

    if (error.message.includes('Network error')) {
      console.log('\n🔧 Troubleshooting:')
      console.log('1. Ensure backend server is running: http://localhost:5000')
      console.log('2. Check if CORS is configured correctly')
      console.log('3. Verify no firewall is blocking the connection')
    }
  }
}

// Run the test
testFrontendAPI()

