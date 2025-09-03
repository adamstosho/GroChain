// Debug script to check token and API issues
// Copy and paste this into the browser console

console.log('🔍 Token and API Debug Tool')
console.log('===========================')

// Test 1: Check localStorage token
console.log('\n1️⃣ localStorage Token Check:')
const tokenKey = 'grochain_auth_token'
const storedToken = localStorage.getItem(tokenKey)
console.log('Token key:', tokenKey)
console.log('Stored token exists:', !!storedToken)
console.log('Token length:', storedToken ? storedToken.length : 0)
console.log('Token preview:', storedToken ? storedToken.substring(0, 50) + '...' : 'No token')

// Test 2: Check API service
console.log('\n2️⃣ API Service Check:')
try {
  // Import the API service (this might not work in console)
  console.log('API base URL should be:', 'http://localhost:5000/api')
  console.log('Order endpoint should be:', '/marketplace/orders')
  console.log('Full URL should be:', 'http://localhost:5000/api/marketplace/orders')
} catch (error) {
  console.log('API service check error:', error.message)
}

// Test 3: Manual API call test
console.log('\n3️⃣ Manual API Call Test:')
async function testOrderCreation() {
  const testOrderData = {
    items: [{
      listing: '507f1f77bcf86cd799439011',
      quantity: 1,
      price: 5000,
      unit: 'kg'
    }],
    shippingAddress: {
      street: '123 Test Street',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      phone: '08012345678'
    },
    deliveryInstructions: 'Test delivery',
    paymentMethod: 'paystack',
    notes: 'Test order'
  }

  console.log('📤 Test data:', testOrderData)

  try {
    const response = await fetch('http://localhost:5000/api/marketplace/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': storedToken ? `Bearer ${storedToken}` : ''
      },
      body: JSON.stringify(testOrderData)
    })

    console.log('📥 Response status:', response.status)
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('📥 Response length:', responseText.length)

    if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
      console.log('🚨 ERROR: Response is HTML (404 or error page)')
      console.log('HTML preview:', responseText.substring(0, 200) + '...')
    } else {
      try {
        const jsonData = JSON.parse(responseText)
        console.log('✅ Response is JSON:', jsonData)
      } catch (parseError) {
        console.log('❌ Failed to parse response:', parseError.message)
        console.log('Raw response:', responseText)
      }
    }

  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

testOrderCreation()

// Test 4: Check if backend is running
console.log('\n4️⃣ Backend Health Check:')
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend is running:', data))
  .catch(error => console.log('❌ Backend not responding:', error.message))

console.log('\n🎯 Debug Complete!')
console.log('==================')
console.log('If you see:')
console.log('- "No token" → Login again to get a new token')
console.log('- HTML response → Backend route issue')
console.log('- 401 Unauthorized → Token expired or invalid')
console.log('- 404 → API endpoint not found')
