// Test script to verify products page API integration
const testProductsAPI = async () => {
  try {
    console.log('🧪 Testing Products API Integration...\n')

    // Test 1: Basic listings fetch
    console.log('📦 Test 1: Fetching basic product listings...')
    const response = await fetch('http://localhost:5000/api/marketplace/listings?page=1&limit=10')
    const data = await response.json()

    if (response.ok && data.status === 'success') {
      console.log('✅ Basic listings fetch: SUCCESS')
      console.log(`   - Found ${data.data?.listings?.length || 0} products`)
    } else {
      console.log('❌ Basic listings fetch: FAILED')
      console.log('   Response:', data)
    }

    // Test 2: Category filter
    console.log('\n🏷️  Test 2: Testing category filter (grains)...')
    const grainsResponse = await fetch('http://localhost:5000/api/marketplace/listings?page=1&limit=10&category=grains')
    const grainsData = await grainsResponse.json()

    if (grainsResponse.ok && grainsData.status === 'success') {
      console.log('✅ Category filter: SUCCESS')
      console.log(`   - Found ${grainsData.data?.listings?.length || 0} grain products`)
    } else {
      console.log('❌ Category filter: FAILED')
    }

    // Test 3: Search functionality
    console.log('\n🔍 Test 3: Testing search functionality (maize)...')
    const searchResponse = await fetch('http://localhost:5000/api/marketplace/listings?page=1&limit=10&search=maize')
    const searchData = await searchResponse.json()

    if (searchResponse.ok && searchData.status === 'success') {
      console.log('✅ Search functionality: SUCCESS')
      console.log(`   - Found ${searchData.data?.listings?.length || 0} products matching "maize"`)
    } else {
      console.log('❌ Search functionality: FAILED')
    }

    // Test 4: Price filtering
    console.log('\n💰 Test 4: Testing price filtering (₦1000-₦5000)...')
    const priceResponse = await fetch('http://localhost:5000/api/marketplace/listings?page=1&limit=10&minPrice=1000&maxPrice=5000')
    const priceData = await priceResponse.json()

    if (priceResponse.ok && priceData.status === 'success') {
      console.log('✅ Price filtering: SUCCESS')
      console.log(`   - Found ${priceData.data?.listings?.length || 0} products in price range`)
    } else {
      console.log('❌ Price filtering: FAILED')
    }

    // Test 5: Sorting
    console.log('\n📊 Test 5: Testing sorting (price low to high)...')
    const sortResponse = await fetch('http://localhost:5000/api/marketplace/listings?page=1&limit=10&sortBy=basePrice&sortOrder=asc')
    const sortData = await sortResponse.json()

    if (sortResponse.ok && sortData.status === 'success') {
      console.log('✅ Sorting: SUCCESS')
      console.log(`   - Found ${sortData.data?.listings?.length || 0} products sorted by price`)
    } else {
      console.log('❌ Sorting: FAILED')
    }

    console.log('\n🎉 Products API Integration Tests Complete!')
    console.log('=============================================')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

// Run the test
testProductsAPI()

