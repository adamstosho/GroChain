// Checkout Process Debug Helper
// Copy and paste this into browser console during testing

console.log('🔧 Checkout Debug Helper')
console.log('========================')

// Function to check authentication status
window.checkAuth = () => {
  const token = localStorage.getItem('grochain_auth_token')
  console.log('🔑 Authentication Check:')
  console.log('Token exists:', !!token)
  console.log('Token length:', token ? token.length : 0)
  console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token')

  if (!token) {
    console.log('❌ User not authenticated - redirecting to login')
    return false
  }

  console.log('✅ User is authenticated')
  return true
}

// Function to check cart status
window.checkCart = () => {
  console.log('🛒 Cart Check:')
  try {
    const cartKey = 'grochain-buyer-cart'
    const cartData = localStorage.getItem(cartKey)
    const cart = cartData ? JSON.parse(cartData) : []

    console.log('Cart exists:', !!cartData)
    console.log('Cart items count:', cart.length)
    console.log('Cart items:', cart)

    if (cart.length === 0) {
      console.log('❌ Cart is empty - redirecting to marketplace')
      return false
    }

    console.log('✅ Cart has items')
    return true
  } catch (error) {
    console.log('❌ Cart error:', error.message)
    return false
  }
}

// Function to test API connectivity
window.testAPI = async () => {
  console.log('🔌 API Connectivity Test:')

  try {
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5000/api/health')
    const healthData = await healthResponse.json()
    console.log('✅ Health check:', healthData)

    // Test marketplace endpoint (requires auth)
    const token = localStorage.getItem('grochain_auth_token')
    if (token) {
      const marketResponse = await fetch('http://localhost:5000/api/marketplace/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      console.log('✅ Marketplace API:', marketResponse.status)
    } else {
      console.log('⚠️ Skipping marketplace test - no auth token')
    }

  } catch (error) {
    console.log('❌ API test failed:', error.message)
  }
}

// Function to test Paystack integration
window.testPaystack = () => {
  console.log('💳 Paystack Integration Check:')
  console.log('Paystack script loaded:', !!document.querySelector('script[src*="paystack"]'))
  console.log('Paystack object available:', typeof window.PaystackPop)

  if (typeof window.PaystackPop === 'undefined') {
    console.log('❌ Paystack not loaded - check script in layout')
  } else {
    console.log('✅ Paystack ready for payment')
  }
}

// Function to clear all test data
window.clearTestData = () => {
  console.log('🧹 Clearing Test Data:')
  localStorage.removeItem('grochain_auth_token')
  localStorage.removeItem('grochain_refresh_token')
  localStorage.removeItem('grochain-buyer-cart')
  console.log('✅ All test data cleared')
}

// Function to show current page info
window.pageInfo = () => {
  console.log('📄 Page Information:')
  console.log('Current URL:', window.location.href)
  console.log('Pathname:', window.location.pathname)
  console.log('Search params:', window.location.search)
  console.log('User agent:', navigator.userAgent)
  console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`)
}

// Quick status check
window.statusCheck = () => {
  console.log('📊 Quick Status Check:')
  console.log('======================')
  checkAuth()
  checkCart()
  testPaystack()
  pageInfo()
}

// Available functions
console.log('\n🛠️ Available Debug Functions:')
console.log('checkAuth()     - Check authentication status')
console.log('checkCart()     - Check cart status')
console.log('testAPI()       - Test API connectivity')
console.log('testPaystack()  - Check Paystack integration')
console.log('clearTestData() - Clear all test data')
console.log('pageInfo()      - Show current page info')
console.log('statusCheck()   - Run all checks')

console.log('\n🎯 Quick Start:')
console.log('1. Run statusCheck() to see current state')
console.log('2. Follow the checkout testing guide')
console.log('3. Use specific functions to debug issues')
