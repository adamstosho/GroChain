const jwt = require('jsonwebtoken')
require('dotenv').config()

console.log('🔐 Testing JWT Configuration...\n')

// Check if JWT secrets are loaded
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET)
console.log('JWT_REFRESH_SECRET loaded:', !!process.env.JWT_REFRESH_SECRET)
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN)

// Test JWT token generation
try {
  const testPayload = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'farmer'
  }

  const accessToken = jwt.sign(testPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  })

  const refreshToken = jwt.sign(testPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  })

  console.log('\n✅ JWT Tokens Generated Successfully')
  console.log('Access Token (first 50 chars):', accessToken.substring(0, 50) + '...')
  console.log('Refresh Token (first 50 chars):', refreshToken.substring(0, 50) + '...')

  // Test token verification
  const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET)
  const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

  console.log('\n✅ JWT Tokens Verified Successfully')
  console.log('Access Token Payload:', { id: decodedAccess.id, role: decodedAccess.role })
  console.log('Refresh Token Payload:', { id: decodedRefresh.id, role: decodedRefresh.role })

  // Test token expiration
  const expiredToken = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '-1h' })
  try {
    jwt.verify(expiredToken, process.env.JWT_SECRET)
    console.log('\n❌ ERROR: Expired token should have failed verification')
  } catch (error) {
    console.log('\n✅ Expired token correctly rejected:', error.message)
  }

  console.log('\n🎉 JWT Configuration is working correctly!')
  console.log('🔄 Authentication should now work properly on page refresh')

} catch (error) {
  console.log('\n❌ JWT Test Failed:', error.message)
  console.log('💡 Check your JWT_SECRET and JWT_REFRESH_SECRET in .env file')
}
