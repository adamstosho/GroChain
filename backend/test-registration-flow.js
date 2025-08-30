const axios = require('axios')

async function testRegistrationFlow() {
  try {
    console.log('🧪 Testing Complete Registration Flow...\n')
    
    // Generate unique email for testing
    const timestamp = Date.now()
    const testEmail = `test${timestamp}@example.com`
    
    console.log('📧 Test email:', testEmail)
    
    // 1. Test registration
    console.log('\n1️⃣ Testing user registration...')
    const registerData = {
      name: 'Test User',
      email: testEmail,
      phone: '+2341234567890',
      password: 'testpassword123',
      role: 'farmer',
      location: 'Lagos, Nigeria'
    }
    
    console.log('📤 Sending registration request...')
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', registerData)
    
    console.log('✅ Registration successful!')
    console.log('   Response:', registerResponse.data)
    console.log('   User ID:', registerResponse.data.user._id)
    console.log('   Email verified:', registerResponse.data.user.emailVerified)
    console.log('   Requires verification:', registerResponse.data.requiresVerification)
    
    // 2. Check if user exists in database
    console.log('\n2️⃣ Checking if user was created in database...')
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: testEmail,
        password: 'testpassword123'
      })
      console.log('❌ User can login without verification - this should not happen!')
      console.log('   Login response:', loginResponse.data)
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ User correctly blocked from login - email not verified')
        console.log('   Error message:', error.response.data.message)
      } else {
        console.log('❌ Unexpected login error:', error.response?.data || error.message)
      }
    }
    
    console.log('\n🎯 Registration flow test completed!')
    
  } catch (error) {
    console.error('❌ Registration test failed:')
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Data:', error.response.data)
      console.error('   Headers:', error.response.headers)
    } else {
      console.error('   Error:', error.message)
    }
  }
}

testRegistrationFlow()

