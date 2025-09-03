// Simple test to check QR stats API
async function testQRStats() {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('grochain-auth') || localStorage.getItem('grochain-auth-token');

    const response = await fetch('http://localhost:3001/api/qr-codes/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    const data = await response.json();
    console.log('API Response:', data);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run test
testQRStats();
