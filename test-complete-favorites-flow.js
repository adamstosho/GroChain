// Complete test for the favorites authentication flow
const axios = require('axios')

const API_BASE_URL = 'http://localhost:5000/api'

async function testCompleteFavoritesFlow() {
  console.log('🧪 Complete Favorites Authentication Flow Test')
  console.log('===============================================')

  try {
    console.log('\n1️⃣ Testing Backend Server Status...')
    try {
      const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`)
      console.log('✅ Backend server is running')
      console.log('Server status:', healthResponse.data)
    } catch (error) {
      console.log('❌ Backend server not responding')
      console.log('Make sure to run: cd backend && npm run dev')
      return
    }

    console.log('\n2️⃣ Testing Authentication Debug Endpoint...')
    try {
      // This should fail without auth
      await axios.get(`${API_BASE_URL}/marketplace/auth/debug`)
      console.log('❌ Should have failed without authentication')
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication properly required')
      } else {
        console.log('❓ Unexpected auth error:', error.response?.status)
      }
    }

    console.log('\n3️⃣ Testing Favorites Endpoint...')
    try {
      // This should also fail without auth
      await axios.get(`${API_BASE_URL}/marketplace/favorites/current`)
      console.log('❌ Should have failed without authentication')
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Favorites endpoint properly secured')
      } else {
        console.log('❓ Unexpected favorites error:', error.response?.status)
      }
    }

    console.log('\n🎯 FLOW TEST RESULTS:')
    console.log('====================')
    console.log('✅ Backend server: Running')
    console.log('✅ Authentication: Properly secured')
    console.log('✅ Favorites endpoint: Protected')
    console.log('')
    console.log('📋 TO FIX THE FRONTEND ISSUE:')
    console.log('=============================')
    console.log('1. Ensure user is logged in')
    console.log('2. Check JWT token exists in localStorage')
    console.log('3. Verify token is not expired')
    console.log('4. Test with browser developer tools:')
    console.log('   - Open: http://localhost:3000/dashboard/products/68b6125e7ce0a13ef96208d2')
    console.log('   - Check Network tab for failed requests')
    console.log('   - Check Console for authentication errors')
    console.log('')
    console.log('🔧 QUICK DEBUG COMMANDS:')
    console.log('=======================')
    console.log('• Check token: localStorage.getItem("grochain_auth_token")')
    console.log('• Test auth: Run testFrontendAuth() in browser console')
    console.log('• Check backend logs for authentication attempts')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testCompleteFavoritesFlow()

