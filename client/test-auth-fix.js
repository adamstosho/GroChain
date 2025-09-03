// Test script to verify authentication is working
// Run this in your browser console at http://localhost:3000

async function testAuthentication() {
  console.log('🔐 Authentication Test')
  console.log('=====================')

  try {
    // Check if we're on the correct domain
    if (window.location.origin !== 'http://localhost:3000') {
      console.log('❌ Please run this test on http://localhost:3000')
      return
    }

    // Check localStorage
    console.log('\n1️⃣ Checking localStorage...')
    const authData = localStorage.getItem('grochain-auth')
    const token = localStorage.getItem('grochain_auth_token')
    const refreshToken = localStorage.getItem('grochain_refresh_token')

    console.log('Auth store data:', authData ? '✅ Present' : '❌ Missing')
    console.log('Access token:', token ? '✅ Present (' + token.substring(0, 20) + '...)' : '❌ Missing')
    console.log('Refresh token:', refreshToken ? '✅ Present' : '❌ Missing')

    // Check cookies
    console.log('\n2️⃣ Checking cookies...')
    const cookies = document.cookie.split(';').map(c => c.trim())
    const authCookie = cookies.find(c => c.startsWith('auth_token='))
    const refreshCookie = cookies.find(c => c.startsWith('refresh_token='))

    console.log('Auth cookie:', authCookie ? '✅ Present' : '❌ Missing')
    console.log('Refresh cookie:', refreshCookie ? '✅ Present' : '❌ Missing')

    // Parse auth store data
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        console.log('\n3️⃣ Auth store contents:')
        console.log('  User:', parsed.user ? '✅ Present' : '❌ Missing')
        console.log('  Token:', parsed.token ? '✅ Present' : '❌ Missing')
        console.log('  Refresh Token:', parsed.refreshToken ? '✅ Present' : '❌ Missing')
        console.log('  Is Authenticated:', parsed.isAuthenticated ? '✅ True' : '❌ False')

        if (parsed.user) {
          console.log('  User Name:', parsed.user.name)
          console.log('  User Email:', parsed.user.email)
          console.log('  User Role:', parsed.user.role)
        }
      } catch (parseError) {
        console.log('❌ Auth store data is corrupted:', parseError.message)
      }
    }

    // Test API call
    console.log('\n4️⃣ Testing API call...')
    try {
      const response = await fetch('/api/users/profile/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })

      console.log('API Status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API call successful:', data.user ? data.user.name : 'User data received')
      } else {
        const errorText = await response.text()
        console.log('❌ API call failed:', errorText)
      }
    } catch (apiError) {
      console.log('❌ API call error:', apiError.message)
    }

    // Summary
    console.log('\n📊 SUMMARY:')
    if (authData && token && refreshToken) {
      console.log('✅ Authentication setup looks good!')
      console.log('✅ Tokens are stored in localStorage')
      console.log('✅ Auth store is properly configured')

      const parsed = JSON.parse(authData)
      if (parsed.isAuthenticated && parsed.user) {
        console.log('✅ User is authenticated and data is available')
        console.log('🎉 Authentication should work correctly on refresh!')
      } else {
        console.log('⚠️ User is not marked as authenticated in the store')
      }
    } else {
      console.log('❌ Authentication setup is incomplete')
      console.log('💡 Try logging in again to fix this')
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message)
  }
}

// Auto-run the test
testAuthentication()

