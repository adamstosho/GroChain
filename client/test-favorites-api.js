// Test script to verify favorites API integration
// Run this in the browser console on the favorites page

console.log('=== FAVORITES API TEST ===')

// Test the API service directly
const testFavoritesAPI = async () => {
  try {
    // Test getFavorites
    console.log('Testing getFavorites...')
    const response = await fetch('http://localhost:5000/api/marketplace/favorites/current', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('grochain_auth_token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('✅ getFavorites response:', data)
    
    if (data.status === 'success' && data.data.favorites) {
      console.log(`✅ Found ${data.data.favorites.length} favorites`)
      data.data.favorites.forEach((fav, index) => {
        console.log(`  ${index + 1}. ${fav.listing.cropName} - ₦${fav.listing.basePrice}/${fav.listing.unit}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error testing favorites API:', error)
  }
}

// Test addToFavorites
const testAddToFavorites = async () => {
  try {
    console.log('Testing addToFavorites...')
    const response = await fetch('http://localhost:5000/api/marketplace/favorites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('grochain_auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        listingId: '68b6125e7ce0a13ef96208d2', // Use the first listing ID
        notes: 'Test from browser console'
      })
    })
    
    const data = await response.json()
    console.log('✅ addToFavorites response:', data)
    
  } catch (error) {
    console.error('❌ Error testing addToFavorites:', error)
  }
}

// Run tests
if (localStorage.getItem('grochain_auth_token')) {
  testFavoritesAPI().then(() => testAddToFavorites())
} else {
  console.error('❌ No authentication token found. Please log in first.')
}

console.log('=== END FAVORITES API TEST ===')
