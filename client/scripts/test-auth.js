// Simple authentication test script
// Run this in the browser console to test auth state

console.log('🔐 Testing GroChain Authentication...')

// Check current auth state
function checkAuthState() {
  const token = localStorage.getItem('auth_token')
  const refreshToken = localStorage.getItem('refresh_token')
  const userData = localStorage.getItem('user_data')
  const cookies = document.cookie
  
  console.log('🔐 Current Auth State:', {
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    hasUserData: !!userData,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
    cookies: cookies
  })
  
  return { token, refreshToken, userData, cookies }
}

// Test token validation
async function testTokenValidation() {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('🔐 Token validation response:', {
      status: response.status,
      ok: response.ok
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('🔐 User data:', data)
    }
    
    return response
  } catch (error) {
    console.error('🔐 Token validation error:', error)
    return null
  }
}

// Test token refresh
async function testTokenRefresh() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    console.log('🔐 No refresh token available')
    return false
  }
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include'
    })
    
    console.log('🔐 Token refresh response:', {
      status: response.status,
      ok: response.ok
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('🔐 Refresh result:', data)
      
      if (data.accessToken) {
        localStorage.setItem('auth_token', data.accessToken)
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken)
        }
        console.log('🔐 Tokens updated successfully')
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('🔐 Token refresh error:', error)
    return false
  }
}

// Clear all auth data
function clearAuth() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_data')
  
  // Clear cookies
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  
  console.log('🔐 Auth data cleared')
}

// Export functions for console use
window.grochainAuth = {
  checkAuthState,
  testTokenValidation,
  testTokenRefresh,
  clearAuth
}

console.log('🔐 Auth test functions available at window.grochainAuth')
console.log('🔐 Usage: grochainAuth.checkAuthState()')


