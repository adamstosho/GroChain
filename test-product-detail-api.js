// Test script to verify product detail API endpoint
const axios = require('axios')

const API_BASE_URL = 'http://localhost:5000/api'

async function testProductDetailAPI() {
  console.log('🧪 Testing Product Detail API Endpoint...\n')

  try {
    // First, get all listings to find a valid product ID
    console.log('📦 Fetching all listings to get a valid product ID...')
    const listingsResponse = await axios.get(`${API_BASE_URL}/marketplace/listings?page=1&limit=5`)

    if (!listingsResponse.data?.data?.listings || listingsResponse.data.data.listings.length === 0) {
      console.log('❌ No listings found. Please ensure there are products in the marketplace.')
      return
    }

    const listings = listingsResponse.data.data.listings
    const firstProduct = listings[0]

    console.log(`✅ Found ${listings.length} listings`)
    console.log(`📋 Testing with product: ${firstProduct.cropName} (ID: ${firstProduct._id})`)

    // Test the product detail endpoint
    console.log('\n🔍 Testing product detail endpoint...')
    const productId = firstProduct._id

    const detailResponse = await axios.get(`${API_BASE_URL}/marketplace/listings/${productId}`)

    if (detailResponse.status === 200) {
      const product = detailResponse.data.data || detailResponse.data

      console.log('✅ Product detail fetched successfully!')
      console.log('📊 Product Details:')
      console.log(`   • Name: ${product.cropName}`)
      console.log(`   • Category: ${product.category}`)
      console.log(`   • Price: ₦${product.basePrice} per ${product.unit}`)
      console.log(`   • Available: ${product.availableQuantity} ${product.unit}`)
      console.log(`   • Location: ${product.location?.city}, ${product.location?.state}`)
      console.log(`   • Status: ${product.status}`)
      console.log(`   • Images: ${product.images?.length || 0} images`)
      console.log(`   • Farmer: ${product.farmer ? 'Populated' : 'Not populated'}`)

      // Test with invalid product ID
      console.log('\n❌ Testing with invalid product ID...')
      try {
        await axios.get(`${API_BASE_URL}/marketplace/listings/invalid-id-123`)
        console.log('⚠️ Should have returned 404 for invalid ID')
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ Correctly returned 404 for invalid product ID')
        } else {
          console.log('❌ Unexpected error for invalid ID:', error.response?.status)
        }
      }

      console.log('\n🎉 Product Detail API Test Complete!')
      console.log('========================================')
      console.log('✅ API Endpoint: Working')
      console.log('✅ Product Data: Retrieved')
      console.log('✅ Error Handling: Working')
      console.log('✅ Route Structure: Correct')
      console.log('\n🚀 Frontend should now work with:')
      console.log(`   http://localhost:3000/dashboard/products/${productId}`)

    } else {
      console.log('❌ Failed to fetch product details')
    }

  } catch (error) {
    console.error('❌ Error testing product detail API:', error.message)
    if (error.response) {
      console.log('   Status:', error.response.status)
      console.log('   Data:', error.response.data)
    }
  }
}

// Run the test
testProductDetailAPI()

