// Test script for favorites functionality
// Run this in the browser console on the favorites page

console.log('=== FAVORITES TEST ===')

// Check authentication
const token = localStorage.getItem('grochain_auth_token')
console.log('Token available:', !!token)

if (!token) {
  console.error('No authentication token found. Please log in first.')
} else {
  // Test adding a favorite
  const testListingId = '68b6125e7ce0a13ef96208d2' // Use the first listing from the API response
  
  fetch('http://localhost:5000/api/marketplace/favorites', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listingId: testListingId,
      notes: 'Test favorite from console'
    })
  })
  .then(response => {
    console.log('Response status:', response.status)
    return response.json()
  })
  .then(data => {
    console.log('Response data:', data)
  })
  .catch(error => {
    console.error('Error:', error)
  })
}

console.log('=== END FAVORITES TEST ===')
