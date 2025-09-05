// Test script to debug favorites API
const testFavoritesAPI = async () => {
  const token = localStorage.getItem('grochain_auth_token');
  console.log('🔑 Token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.error('❌ No authentication token found');
    return;
  }

  // Test adding to favorites
  const testListingId = '68b0798fb26814228fb2138d'; // Use a real listing ID
  const testData = {
    listingId: testListingId,
    notes: 'Test favorite from debug script'
  };

  try {
    console.log('🧪 Testing add to favorites with data:', testData);
    
    const response = await fetch('http://localhost:5000/api/marketplace/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Successfully added to favorites');
    } else {
      console.error('❌ Failed to add to favorites:', response.status, responseText);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Test getting favorites
const testGetFavorites = async () => {
  const token = localStorage.getItem('grochain_auth_token');
  
  if (!token) {
    console.error('❌ No authentication token found');
    return;
  }

  try {
    console.log('🧪 Testing get favorites...');
    
    const response = await fetch('http://localhost:5000/api/marketplace/favorites/current', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📊 Get favorites status:', response.status);
    const responseText = await response.text();
    console.log('📄 Get favorites response:', responseText);
    
    if (response.ok) {
      console.log('✅ Successfully retrieved favorites');
    } else {
      console.error('❌ Failed to get favorites:', response.status, responseText);
    }
  } catch (error) {
    console.error('❌ Network error getting favorites:', error);
  }
};

// Run tests
console.log('🚀 Starting favorites API debug tests...');
testFavoritesAPI().then(() => {
  console.log('---');
  return testGetFavorites();
}).then(() => {
  console.log('🏁 Debug tests completed');
});

// Make functions available globally for manual testing
window.testFavoritesAPI = testFavoritesAPI;
window.testGetFavorites = testGetFavorites;
