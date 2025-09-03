// Test script to verify the location fix is working
const axios = require('axios')

const API_BASE_URL = 'http://localhost:5000/api'

async function testLocationFix() {
  console.log('🧪 Testing Location Fix')
  console.log('=======================')

  try {
    // Test 1: Check the specific product detail
    console.log('\n1️⃣ Testing Product Detail API...')
    const response = await axios.get(`${API_BASE_URL}/marketplace/listings/68b6125e7ce0a13ef96208d2`)

    if (response.status === 200 && response.data.status === 'success') {
      const product = response.data.data
      console.log('✅ Product detail API working')

      console.log('\n📋 Product Information:')
      console.log(`   • Name: ${product.cropName || product.name}`)
      console.log(`   • Price: ₦${product.basePrice || product.price}`)
      console.log(`   • Location (raw):`, product.location)

      // Check if location is properly formatted
      if (product.location && typeof product.location === 'object') {
        console.log('✅ Location is properly formatted as object:')
        console.log(`   • City: ${product.location.city}`)
        console.log(`   • State: ${product.location.state}`)
        console.log(`   • Country: ${product.location.country || 'Nigeria'}`)
      } else {
        console.log('❌ Location is not properly formatted')
      }

    } else {
      console.log('❌ Product detail API failed')
    }

    // Test 2: Check the listings API
    console.log('\n2️⃣ Testing Listings API...')
    const listingsResponse = await axios.get(`${API_BASE_URL}/marketplace/listings?page=1&limit=3`)

    if (listingsResponse.status === 200 && listingsResponse.data.status === 'success') {
      const listings = listingsResponse.data.data.listings
      console.log('✅ Listings API working')
      console.log(`📦 Retrieved ${listings.length} listings`)

      // Check first listing's location
      if (listings.length > 0) {
        const firstListing = listings[0]
        console.log('\n📋 First Listing Location:')
        console.log(`   • Name: ${firstListing.cropName || firstListing.name}`)
        console.log(`   • Location (raw):`, firstListing.location)

        if (firstListing.location && typeof firstListing.location === 'object') {
          console.log('✅ First listing location is properly formatted:')
          console.log(`   • City: ${firstListing.location.city}`)
          console.log(`   • State: ${firstListing.location.state}`)
          console.log(`   • Country: ${firstListing.location.country || 'Nigeria'}`)
        } else {
          console.log('❌ First listing location is not properly formatted')
        }
      }
    } else {
      console.log('❌ Listings API failed')
    }

    console.log('\n🎉 LOCATION FIX TEST COMPLETE!')
    console.log('===============================')

    console.log('\n✅ What was fixed:')
    console.log('   • Backend now parses location strings into objects')
    console.log('   • Frontend expects and receives proper location format')
    console.log('   • Location display should now show actual city/state')

    console.log('\n🚀 Next Steps:')
    console.log('   1. Refresh the product detail page')
    console.log('   2. Location should now show actual city and state')
    console.log('   3. No more "Unknown City, Unknown State"')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.log('Response status:', error.response.status)
      console.log('Response data:', error.response.data)
    }
  }
}

testLocationFix()

