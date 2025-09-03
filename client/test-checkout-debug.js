// Browser console script to debug checkout API issues
// Copy and paste this into the browser console on the checkout page

console.log('🔍 Checkout API Debug Tool')
console.log('===========================')

// Test 1: Check API service configuration
console.log('\n1️⃣ API Service Configuration:')
console.log('Base URL:', 'http://localhost:5000/api')
console.log('Auth token exists:', !!localStorage.getItem('grochain_auth_token'))

// Test 2: Test direct API call (same as checkout does)
console.log('\n2️⃣ Testing Direct API Call:')
async function testOrderCreation() {
  try {
    const orderData = {
      items: [{
        listing: '507f1f77bcf86cd799439011', // Dummy listing ID
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

    console.log('📤 Making API call to:', 'http://localhost:5000/api/marketplace/orders')
    console.log('📤 Request data:', orderData)

    const response = await fetch('http://localhost:5000/api/marketplace/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('grochain_auth_token')}`
      },
      body: JSON.stringify(orderData)
    })

    console.log('📥 Response status:', response.status)
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('📥 Response content-type:', response.headers.get('content-type'))
    console.log('📥 Response length:', responseText.length)

    if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
      console.log('🚨 ERROR: Response is HTML, not JSON!')
      console.log('🚨 This is causing the "Unexpected token" error')
      console.log('🚨 HTML Preview:', responseText.substring(0, 200) + '...')
      return
    }

    try {
      const jsonData = JSON.parse(responseText)
      console.log('✅ Response is valid JSON:', jsonData)
    } catch (parseError) {
      console.log('❌ Failed to parse response as JSON:', parseError.message)
      console.log('❌ Raw response:', responseText)
    }

  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

testOrderCreation()

// Test 3: Test payment config endpoint
console.log('\n3️⃣ Testing Payment Config:')
async function testPaymentConfig() {
  try {
    const response = await fetch('http://localhost:5000/api/payments/config')
    const data = await response.json()
    console.log('✅ Payment config:', data)
  } catch (error) {
    console.log('❌ Payment config error:', error.message)
  }
}

testPaymentConfig()

// Test 4: Test if Paystack is loaded
console.log('\n4️⃣ Paystack Integration:')
console.log('Paystack script loaded:', !!document.querySelector('script[src*="paystack"]'))
console.log('Paystack object available:', typeof window.PaystackPop)

// Test 5: Environment check
console.log('\n5️⃣ Environment Check:')
console.log('Current URL:', window.location.href)
console.log('Protocol:', window.location.protocol)
console.log('Host:', window.location.host)
console.log('Port:', window.location.port)

console.log('\n🎯 Debug Complete!')
console.log('If you see HTML responses, check the browser network tab for the exact failing request.')
console.log('Look for requests returning 404 or other HTTP errors that serve HTML error pages.')
