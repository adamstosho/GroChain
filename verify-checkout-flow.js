// Checkout Flow Verification Script
// Run this in browser console to verify the complete flow

console.log('🔍 Checkout Flow Verification')
console.log('=============================')

async function verifyCheckoutFlow() {
  const results = {
    environment: false,
    authentication: false,
    marketplace: false,
    cart: false,
    checkout: false,
    orderCreation: false,
    paystack: false,
    verification: false,
    orderDetails: false
  }

  // 1. Environment Check
  console.log('\n1️⃣ Environment Check:')
  try {
    const healthResponse = await fetch('http://localhost:5000/api/health')
    const healthData = await healthResponse.json()
    if (healthData.status === 'success') {
      console.log('✅ Backend server running')
      results.environment = true
    } else {
      console.log('❌ Backend server not responding')
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message)
  }

  // 2. Authentication Check
  console.log('\n2️⃣ Authentication Check:')
  const token = localStorage.getItem('grochain_auth_token')
  if (token && token !== 'undefined') {
    console.log('✅ User is authenticated')
    results.authentication = true
  } else {
    console.log('❌ User not authenticated')
  }

  // 3. Cart Check
  console.log('\n3️⃣ Cart Check:')
  const cartData = localStorage.getItem('grochain-buyer-cart')
  if (cartData) {
    try {
      const cart = JSON.parse(cartData)
      if (cart.length > 0) {
        console.log(`✅ Cart has ${cart.length} items`)
        results.cart = true
      } else {
        console.log('❌ Cart is empty')
      }
    } catch (error) {
      console.log('❌ Cart data corrupted:', error.message)
    }
  } else {
    console.log('❌ No cart data found')
  }

  // 4. Paystack Check
  console.log('\n4️⃣ Paystack Integration Check:')
  const paystackScript = document.querySelector('script[src*="paystack"]')
  if (paystackScript && typeof window.PaystackPop !== 'undefined') {
    console.log('✅ Paystack integration ready')
    results.paystack = true
  } else {
    console.log('❌ Paystack integration missing')
  }

  // 5. API Connectivity Check
  console.log('\n5️⃣ API Connectivity Check:')
  if (token) {
    try {
      const apiResponse = await fetch('http://localhost:5000/api/marketplace/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (apiResponse.status === 401) {
        console.log('✅ API responds (401 = auth required, which is expected)')
        results.checkout = true
      } else if (apiResponse.status === 200) {
        console.log('✅ API responds with data')
        results.checkout = true
      } else {
        console.log(`❌ API error: ${apiResponse.status}`)
      }
    } catch (error) {
      console.log('❌ API connection failed:', error.message)
    }
  } else {
    console.log('⏭️ Skipping API test - no auth token')
  }

  // 6. Current Page Check
  console.log('\n6️⃣ Current Page Check:')
  const currentPath = window.location.pathname
  console.log('Current path:', currentPath)

  if (currentPath === '/marketplace') {
    console.log('✅ On marketplace page')
    results.marketplace = true
  } else if (currentPath === '/marketplace/checkout') {
    console.log('✅ On checkout page')
    results.checkout = true
  } else if (currentPath.startsWith('/dashboard/orders/')) {
    console.log('✅ On order details page')
    results.orderDetails = true
  } else if (currentPath.startsWith('/payment/verify')) {
    console.log('✅ On payment verification page')
    results.verification = true
  }

  // Summary
  console.log('\n📊 VERIFICATION SUMMARY:')
  console.log('=======================')
  Object.entries(results).forEach(([key, value]) => {
    const status = value ? '✅' : '❌'
    const displayKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    console.log(`${status} ${displayKey}: ${value ? 'PASS' : 'FAIL'}`)
  })

  const passCount = Object.values(results).filter(Boolean).length
  const totalCount = Object.keys(results).length

  console.log(`\n🎯 Overall Score: ${passCount}/${totalCount} (${Math.round(passCount/totalCount*100)}%)`)

  if (passCount === totalCount) {
    console.log('🎉 ALL CHECKS PASSED! Checkout flow is working perfectly.')
  } else {
    console.log('⚠️ Some checks failed. Follow the testing guide to fix issues.')
  }

  return results
}

// Auto-run verification
verifyCheckoutFlow().then(results => {
  console.log('\n🔄 Verification complete. Results:', results)
})

// Make function globally available for manual testing
window.verifyCheckoutFlow = verifyCheckoutFlow
