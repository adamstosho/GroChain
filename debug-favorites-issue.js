// Debug script for favorites authentication issue
console.log('🔧 Favorites Authentication Debug')
console.log('=================================')

// Test 1: Check if user is logged in
console.log('\n1️⃣ Checking User Authentication:')
const token = localStorage.getItem('grochain_auth_token')
console.log('Token exists:', !!token)
if (token) {
  console.log('Token preview:', token.substring(0, 20) + '...')
} else {
  console.log('❌ No token found - user not logged in!')
  console.log('💡 Solution: Please log in first')
}

// Test 2: Test API connectivity
console.log('\n2️⃣ Testing API Connectivity:')
fetch('http://localhost:5000/api/health')
  .then(response => {
    console.log('✅ Backend reachable:', response.status)
    return response.json()
  })
  .then(data => console.log('Server status:', data))
  .catch(error => {
    console.log('❌ Backend not reachable:', error.message)
    console.log('💡 Solution: Start backend server with: cd backend && npm run dev')
  })

// Test 3: Test authentication endpoint
console.log('\n3️⃣ Testing Authentication:')
if (token) {
  fetch('http://localhost:5000/api/marketplace/auth/debug', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Auth debug status:', response.status)
    if (response.ok) {
      return response.json()
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  })
  .then(data => {
    console.log('✅ Authentication working!')
    console.log('User:', data.user)
  })
  .catch(error => {
    console.log('❌ Authentication failed:', error.message)
    console.log('💡 Solutions:')
    console.log('   • Token might be expired - try logging out and in again')
    console.log('   • User might not exist in database')
    console.log('   • JWT secret might be different between frontend/backend')
  })
} else {
  console.log('⏭️ Skipping auth test - no token available')
}

// Test 4: Test favorites endpoint
console.log('\n4️⃣ Testing Favorites Endpoint:')
if (token) {
  fetch('http://localhost:5000/api/marketplace/favorites/current', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Favorites status:', response.status)
    if (response.ok) {
      return response.json()
    } else {
      return response.json().then(err => { throw err })
    }
  })
  .then(data => {
    console.log('✅ Favorites working!')
    console.log('Favorites count:', data.data?.docs?.length || 0)
  })
  .catch(error => {
    console.log('❌ Favorites failed:')
    if (typeof error === 'object') {
      console.log('Error details:', error)
    } else {
      console.log('Error message:', error)
    }
  })
} else {
  console.log('⏭️ Skipping favorites test - no token available')
}

console.log('\n🎯 DEBUG COMPLETE')
console.log('Check the results above to identify the issue')

