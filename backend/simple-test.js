const axios = require('axios')

async function simpleTest() {
  try {
    console.log('🧪 Simple API Test...\n')
    
    // Test health endpoint
    console.log('1. Testing health endpoint...')
    const healthResponse = await axios.get('http://localhost:5000/api/health')
    console.log('✅ Health check passed:', healthResponse.data.message)
    
    // Test registration with minimal data
    console.log('\n2. Testing registration...')
    const testEmail = `test${Date.now()}@example.com`
    
    const registerData = {
      name: 'Test User',
      email: testEmail,
      password: 'testpassword123',
      role: 'farmer'
    }
    
    console.log('📧 Attempting to register:', testEmail)
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', registerData)
    console.log('✅ Registration response:', registerResponse.data)
    
  } catch (error) {
    console.error('❌ Test failed:')
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Data:', error.response.data)
    } else {
      console.error('   Error:', error.message)
    }
  }
}

simpleTest()

