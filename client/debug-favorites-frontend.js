// Debug script for favorites frontend issues
// Run this in the browser console on the favorites page

console.log('=== FAVORITES FRONTEND DEBUG ===')

// Check authentication state
const token = localStorage.getItem('grochain_auth_token')
console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing')
console.log('🔑 Token length:', token ? token.length : 0)

if (token) {
  // Decode token to see its contents
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    console.log('🔑 Token payload:', payload)
    console.log('🔑 Token expires:', new Date(payload.exp * 1000))
    console.log('🔑 Token user ID:', payload.id)
  } catch (e) {
    console.error('❌ Error decoding token:', e)
  }
}

// Test the API call directly
const testDirectAPI = async () => {
  try {
    console.log('🧪 Testing direct API call...')
    
    const response = await fetch('http://localhost:5000/api/marketplace/favorites/current', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      return
    }
    
    const data = await response.json()
    console.log('✅ API Response:', data)
    
    if (data.status === 'success' && data.data.favorites) {
      console.log(`✅ Found ${data.data.favorites.length} favorites`)
    }
    
  } catch (error) {
    console.error('❌ Direct API test failed:', error)
  }
}

// Test with user ID parameter
const testWithUserId = async () => {
  try {
    console.log('🧪 Testing API call with user ID...')
    
    const response = await fetch('http://localhost:5000/api/marketplace/favorites/68b0798fb26814228fb2138d', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📡 Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error with user ID:', errorText)
      return
    }
    
    const data = await response.json()
    console.log('✅ API Response with user ID:', data)
    
  } catch (error) {
    console.error('❌ API test with user ID failed:', error)
  }
}

// Check if the buyer store is working
const checkBuyerStore = () => {
  console.log('🏪 Checking buyer store...')
  
  // Try to access the store (this might not work depending on how it's set up)
  if (typeof window !== 'undefined' && window.grochain) {
    console.log('🏪 Global store available:', window.grochain)
  } else {
    console.log('🏪 No global store found')
  }
}

// Run all tests
if (token) {
  testDirectAPI().then(() => testWithUserId()).then(() => checkBuyerStore())
} else {
  console.error('❌ No authentication token found. Please log in first.')
}

console.log('=== END FAVORITES FRONTEND DEBUG ===')
