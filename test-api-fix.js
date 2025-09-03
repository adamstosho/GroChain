// Test API URL Fix
// Copy and paste this into browser console to test the fix

console.log('🧪 Testing API URL Fix')
console.log('=======================')

// Test 1: Check if API service is initialized correctly
console.log('\n1️⃣ API Service Initialization:')
console.log('Check browser console for API service constructor logs')
console.log('Expected: baseUrl should be "http://localhost:5000/api"')

// Test 2: Manual API call test
console.log('\n2️⃣ Manual API Call Test:')
async function testOrderEndpoint() {
  try {
    const testData = {
      items: [{
        listing: 'test123',
        quantity: 1,
        price: 1000,
        unit: 'kg'
      }],
      shippingAddress: {
        street: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Nigeria',
        phone: '08012345678'
      },
      deliveryInstructions: 'Test delivery',
      paymentMethod: 'paystack',
      notes: 'Test order'
    }

    console.log('📤 Testing order creation endpoint...')
    console.log('URL: http://localhost:5000/api/marketplace/orders')
    console.log('Method: POST')
    console.log('Data:', testData)

    const response = await fetch('http://localhost:5000/api/marketplace/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    console.log('📥 Response status:', response.status)
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('📥 Response content length:', responseText.length)

    if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
      console.log('❌ Still getting HTML response - route not found')
      console.log('HTML preview:', responseText.substring(0, 200) + '...')
    } else if (response.status === 400) {
      console.log('✅ Got validation error (expected without auth)')
      console.log('Response:', responseText)
    } else if (response.status === 401) {
      console.log('✅ Got auth error (expected without token)')
      console.log('Response:', responseText)
    } else {
      console.log('✅ Got JSON response')
      console.log('Response:', responseText)
    }

  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

testOrderEndpoint()

// Test 3: Check for environment file
console.log('\n3️⃣ Environment Configuration:')
console.log('Check if .env.local exists in client/ directory')
console.log('If not, create it with:')
console.log('NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api')

// Test 4: Verify fix
console.log('\n4️⃣ Fix Verification:')
console.log('✅ API service should log correct baseUrl')
console.log('✅ URL construction should include /api/')
console.log('✅ Final URL should be: http://localhost:5000/api/marketplace/orders')
console.log('✅ Backend should respond with auth/validation error (not 404)')

console.log('\n🎯 Expected Results:')
console.log('1. API service constructor logs show correct baseUrl')
console.log('2. URL construction shows /api/ included')
console.log('3. Backend responds with 400/401 (not 404)')
console.log('4. Checkout should work after authentication')

console.log('\n🚀 Next Steps:')
console.log('1. Check browser console for API service logs')
console.log('2. Run the manual test above')
console.log('3. If still getting 404, check backend server logs')
console.log('4. Ensure user is authenticated before testing checkout')
