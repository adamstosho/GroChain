// Test script to check frontend authentication
import { apiService } from './lib/api.js'

async function testFrontendAuth() {
  console.log('🧪 Testing Frontend Authentication')
  console.log('==================================')

  try {
    // Check if token exists in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('grochain_auth_token') : null
    console.log('🔑 Token in localStorage:', token ? 'Present' : 'Missing')
    if (token) {
      console.log('Token preview:', token.substring(0, 20) + '...')
    }

    // Test auth debug endpoint
    console.log('\n🔍 Testing auth debug endpoint...')
    try {
      const authResponse = await apiService.request('/api/marketplace/auth/debug')
      console.log('✅ Auth debug successful:', authResponse)
      console.log('User info:', authResponse.data?.user)
    } catch (authError) {
      console.error('❌ Auth debug failed:', authError.message)
      if (authError.response) {
        console.log('Status:', authError.response.status)
        console.log('Data:', authError.response.data)
      }
    }

    // Test favorites endpoint
    console.log('\n💝 Testing favorites endpoint...')
    try {
      const favoritesResponse = await apiService.getFavorites()
      console.log('✅ Favorites API working:', favoritesResponse)
    } catch (favError) {
      console.error('❌ Favorites API failed:', favError.message)
      if (favError.response) {
        console.log('Status:', favError.response.status)
        console.log('Data:', favError.response.data)
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Export for use in browser console
window.testFrontendAuth = testFrontendAuth
console.log('🔧 Run testFrontendAuth() in browser console to test authentication')

