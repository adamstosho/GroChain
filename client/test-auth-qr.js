// Test authentication and QR codes in browser
console.log('🧪 Testing Authentication and QR Codes...')

if (typeof window !== 'undefined') {
  // Check authentication
  const token = localStorage.getItem('grochain_auth_token')
  console.log('🔑 Auth token exists:', !!token)

  if (!token) {
    console.log('❌ No auth token found! User might not be logged in.')
    return
  }

  // Test QR codes API
  const testQRApi = async () => {
    try {
      console.log('🌐 Testing QR codes API...')

      const response = await fetch('http://localhost:5000/api/qr-codes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 QR API Response Status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ QR API Response:', data)

        if (data.status === 'success' && data.data && data.data.length > 0) {
          console.log('🎉 QR codes found:', data.data.length)
          data.data.forEach((qr, i) => {
            console.log(`${i + 1}. ${qr.code} - ${qr.cropType} - Status: ${qr.status}`)
          })
        } else {
          console.log('ℹ️ No QR codes in response')
        }
      } else {
        const errorText = await response.text()
        console.log('❌ QR API Error:', response.status, errorText)
      }
    } catch (error) {
      console.log('❌ QR API Connection Error:', error.message)
    }
  }

  // Test QR stats API
  const testQRStatsApi = async () => {
    try {
      console.log('📊 Testing QR stats API...')

      const response = await fetch('http://localhost:5000/api/qr-codes/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 QR Stats Response Status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ QR Stats Response:', data)
      } else {
        const errorText = await response.text()
        console.log('❌ QR Stats Error:', response.status, errorText)
      }
    } catch (error) {
      console.log('❌ QR Stats Connection Error:', error.message)
    }
  }

  // Run tests
  setTimeout(() => {
    testQRApi()
    setTimeout(testQRStatsApi, 1000)
  }, 1000)

} else {
  console.log('❌ Not in browser environment')
}

