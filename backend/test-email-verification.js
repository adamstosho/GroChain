const axios = require('axios')

const BASE_URL = 'http://localhost:5000'

async function testEmailVerification() {
  try {
    console.log('🧪 Testing Email Verification System...\n')
    
    // Generate unique email for testing
    const timestamp = Date.now()
    const testEmail = `test${timestamp}@example.com`
    
    // 1. Test registration
    console.log('1. Testing user registration...')
    const registerData = {
      name: 'Test User',
      email: testEmail,
      phone: '+2341234567890',
      password: 'testpassword123',
      role: 'farmer',
      location: 'Lagos, Nigeria'
    }
    
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData)
    console.log('✅ Registration successful:', registerResponse.data.message)
    console.log('   User ID:', registerResponse.data.user._id)
    console.log('   Email verified:', registerResponse.data.user.emailVerified)
    console.log('   Requires verification:', registerResponse.data.requiresVerification)
    
    // 2. Test login without verification (should fail)
    console.log('\n2. Testing login without verification...')
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testEmail,
        password: 'testpassword123'
      })
      console.log('❌ Login should have failed but succeeded')
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Login correctly blocked - email not verified')
        console.log('   Error message:', error.response.data.message)
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message)
      }
    }
    
    // 3. Test resend verification
    console.log('\n3. Testing resend verification...')
    try {
      const resendResponse = await axios.post(`${BASE_URL}/api/auth/resend-verification`, {
        email: testEmail
      })
      console.log('✅ Resend verification successful:', resendResponse.data.message)
    } catch (error) {
      console.log('❌ Resend verification failed:', error.response?.data || error.message)
    }
    
    console.log('\n🎯 Test completed! Check your console for email verification links.')
    console.log('📧 In development mode, verification links are logged to the console.')
    console.log('📧 If SendGrid is configured, check your email inbox for:', testEmail)
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message)
  }
}

// Run the test
testEmailVerification()
