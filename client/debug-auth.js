// Debug script to check authentication state
console.log('=== AUTH DEBUG ===')

// Check localStorage
console.log('localStorage keys:', Object.keys(localStorage))
console.log('Auth token:', localStorage.getItem('grochain_auth_token'))
console.log('Refresh token:', localStorage.getItem('grochain_refresh_token'))

// Check sessionStorage
console.log('sessionStorage keys:', Object.keys(sessionStorage))

// Check if user is logged in
const authData = localStorage.getItem('grochain-auth')
console.log('Auth store data:', authData ? JSON.parse(authData) : 'No auth data')

// Test API call
fetch('http://localhost:5000/api/marketplace/favorites/current', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('grochain_auth_token')}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('API Response status:', response.status)
  return response.json()
})
.then(data => {
  console.log('API Response data:', data)
})
.catch(error => {
  console.error('API Error:', error)
})

console.log('=== END AUTH DEBUG ===')
