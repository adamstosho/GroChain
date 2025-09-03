// Test QR codes frontend integration
console.log('🧪 Testing QR Codes Frontend Integration...')

// Check if we're in browser environment
if (typeof window !== 'undefined') {
  console.log('✅ Running in browser environment')

  // Check if localStorage has auth token
  const token = localStorage.getItem('grochain_auth_token')
  console.log('🔑 Auth token exists:', !!token)

  if (token) {
    console.log('📝 Token preview:', token.substring(0, 50) + '...')
  }

  // Test API connection
  const testAPI = async () => {
    try {
      console.log('🌐 Testing API connection to QR codes endpoint...')

      const response = await fetch('http://localhost:5000/api/qr-codes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 API Response Status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ API Response:', data)
      } else {
        const errorText = await response.text()
        console.log('❌ API Error:', errorText)
      }
    } catch (error) {
      console.log('❌ API Connection Error:', error.message)
    }
  }

  // Run test after a short delay
  setTimeout(testAPI, 1000)

} else {
  console.log('❌ Not running in browser environment')
}

