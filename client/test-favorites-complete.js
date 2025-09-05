// Complete test script for favorites functionality
// Run this in the browser console on the favorites page

console.log('=== COMPLETE FAVORITES TEST ===')

// Test 1: Check authentication state
const checkAuth = () => {
  console.log('🔍 Test 1: Checking authentication state...')
  
  const token = localStorage.getItem('grochain_auth_token')
  console.log('Token present:', !!token)
  console.log('Token length:', token ? token.length : 0)
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('Token user ID:', payload.id)
      console.log('Token role:', payload.role)
      console.log('Token expires:', new Date(payload.exp * 1000))
    } catch (e) {
      console.error('Error decoding token:', e)
    }
  }
  
  return !!token
}

// Test 2: Test API service directly
const testAPIService = async () => {
  console.log('🔍 Test 2: Testing API service...')
  
  try {
    // Test the API service method directly
    const response = await fetch('http://localhost:5000/api/marketplace/favorites/current', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('grochain_auth_token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API Response successful:', data)
      console.log('Favorites count:', data.data?.favorites?.length || 0)
      return true
    } else {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      return false
    }
  } catch (error) {
    console.error('❌ API Test failed:', error)
    return false
  }
}

// Test 3: Test buyer store (if accessible)
const testBuyerStore = () => {
  console.log('🔍 Test 3: Testing buyer store...')
  
  // Try to access the store through the window object or other means
  if (typeof window !== 'undefined') {
    // Check if there's a global store reference
    const storeKeys = Object.keys(window).filter(key => key.includes('store') || key.includes('Store'))
    console.log('Available store keys:', storeKeys)
    
    // Try to find the buyer store
    if (window.grochain && window.grochain.buyerStore) {
      console.log('✅ Buyer store found:', window.grochain.buyerStore)
    } else {
      console.log('⚠️ Buyer store not accessible globally')
    }
  }
}

// Test 4: Test adding a new favorite
const testAddFavorite = async () => {
  console.log('🔍 Test 4: Testing add favorite...')
  
  try {
    const response = await fetch('http://localhost:5000/api/marketplace/favorites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('grochain_auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        listingId: '68b5ce13fa4ba418fd7722cc', // Ginger listing
        notes: 'Test from complete test script'
      })
    })
    
    const data = await response.json()
    console.log('Add favorite response:', data)
    return response.ok
  } catch (error) {
    console.error('❌ Add favorite failed:', error)
    return false
  }
}

// Test 5: Check if favorites page is loading
const checkFavoritesPage = () => {
  console.log('🔍 Test 5: Checking favorites page state...')
  
  // Check if we're on the favorites page
  if (window.location.pathname.includes('/favorites')) {
    console.log('✅ On favorites page')
    
    // Check for common elements
    const debugPanel = document.querySelector('[class*="debug"]')
    const favoritesList = document.querySelector('[class*="favorite"]')
    const loadingSpinner = document.querySelector('[class*="loading"]')
    
    console.log('Debug panel present:', !!debugPanel)
    console.log('Favorites list present:', !!favoritesList)
    console.log('Loading spinner present:', !!loadingSpinner)
    
    // Check for error messages
    const errorMessages = document.querySelectorAll('[class*="error"]')
    console.log('Error messages found:', errorMessages.length)
    
  } else {
    console.log('⚠️ Not on favorites page, current path:', window.location.pathname)
  }
}

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Running all tests...')
  
  const authOk = checkAuth()
  if (!authOk) {
    console.error('❌ Authentication failed - please log in first')
    return
  }
  
  const apiOk = await testAPIService()
  testBuyerStore()
  const addOk = await testAddFavorite()
  checkFavoritesPage()
  
  console.log('📊 Test Results:')
  console.log('  Authentication:', authOk ? '✅' : '❌')
  console.log('  API Service:', apiOk ? '✅' : '❌')
  console.log('  Add Favorite:', addOk ? '✅' : '❌')
  
  if (authOk && apiOk) {
    console.log('🎉 Core functionality is working! The issue might be in the React component.')
  } else {
    console.log('❌ Core functionality has issues that need to be fixed.')
  }
}

// Run the tests
runAllTests()

console.log('=== END COMPLETE FAVORITES TEST ===')
