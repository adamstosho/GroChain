const axios = require('axios')

async function testCreditScoreAPI() {
  try {
    // Replace with actual JWT token from your browser's localStorage
    const jwt = 'your-jwt-token-here'

    console.log('🔗 Testing credit score API endpoint...')

    const response = await axios.get('http://localhost:5000/api/fintech/credit-score/me', {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ Credit score API response:')
    console.log(JSON.stringify(response.data, null, 2))

  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message)
    console.log('\n📝 To test this properly:')
    console.log('1. Start your backend server: npm start')
    console.log('2. Start your frontend: cd ../client && npm run dev')
    console.log('3. Login to get a JWT token from browser localStorage')
    console.log('4. Replace the jwt variable in this file with the actual token')
    console.log('5. Run this script again')
  }
}

testCreditScoreAPI()

