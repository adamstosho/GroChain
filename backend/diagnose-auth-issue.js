const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

async function diagnoseAuthIssue() {
  try {
    console.log('🔍 Diagnosing Authentication Issues...\n')

    // Check environment variables
    console.log('📋 Environment Variables:')
    console.log('JWT_SECRET present:', !!process.env.JWT_SECRET)
    console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || '24h')
    console.log('JWT_REFRESH_SECRET present:', !!process.env.JWT_REFRESH_SECRET)
    console.log('JWT_REFRESH_EXPIRES_IN:', process.env.JWT_REFRESH_EXPIRES_IN || '30d')

    // Test JWT token generation and verification
    console.log('\n🔐 Testing JWT Token Operations:')
    const testPayload = {
      id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'farmer',
      name: 'Test User'
    }

    // Generate tokens
    const accessToken = jwt.sign(testPayload, process.env.JWT_SECRET || 'test_secret', { expiresIn: '24h' })
    const refreshToken = jwt.sign(testPayload, process.env.JWT_REFRESH_SECRET || 'test_refresh_secret', { expiresIn: '30d' })

    console.log('✅ Access token generated:', accessToken.substring(0, 20) + '...')
    console.log('✅ Refresh token generated:', refreshToken.substring(0, 20) + '...')

    // Verify tokens
    try {
      const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET || 'test_secret')
      console.log('✅ Access token verified:', { id: decodedAccess.id, role: decodedAccess.role })
    } catch (error) {
      console.log('❌ Access token verification failed:', error.message)
    }

    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'test_refresh_secret')
      console.log('✅ Refresh token verified:', { id: decodedRefresh.id, role: decodedRefresh.role })
    } catch (error) {
      console.log('❌ Refresh token verification failed:', error.message)
    }

    // Test expired token
    console.log('\n⏰ Testing Token Expiration:')
    const expiredToken = jwt.sign(testPayload, process.env.JWT_SECRET || 'test_secret', { expiresIn: '-1h' })
    try {
      jwt.verify(expiredToken, process.env.JWT_SECRET || 'test_secret')
      console.log('❌ Expired token should have failed verification')
    } catch (error) {
      console.log('✅ Expired token correctly rejected:', error.message)
    }

    // Check database connection
    console.log('\n🗄️  Checking Database Connection:')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App')
    console.log('✅ Database connected successfully')

    // Check if users exist
    const User = require('./models/user.model')
    const userCount = await User.countDocuments()
    console.log(`👥 Total users in database: ${userCount}`)

    const farmers = await User.find({ role: 'farmer' }).select('name email role status')
    console.log(`🌾 Farmers found: ${farmers.length}`)
    farmers.forEach(farmer => {
      console.log(`   - ${farmer.name} (${farmer.email}) - ${farmer.status}`)
    })

    console.log('\n📋 Possible Issues to Check:')
    console.log('1. Token expiration time too short')
    console.log('2. Frontend not properly restoring tokens on refresh')
    console.log('3. LocalStorage/cookie mismatch')
    console.log('4. Backend token validation issues')
    console.log('5. CORS or cookie domain issues')

    console.log('\n🔧 Recommended Fixes:')
    console.log('1. Increase JWT_EXPIRES_IN to 7d for better UX')
    console.log('2. Check browser console for token errors')
    console.log('3. Verify localStorage has correct tokens')
    console.log('4. Test API endpoints manually with tokens')
    console.log('5. Check browser developer tools Network tab for 401 errors')

  } catch (error) {
    console.error('❌ Diagnosis failed:', error)
  } finally {
    await mongoose.disconnect()
  }
}

diagnoseAuthIssue()
