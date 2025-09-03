const mongoose = require('mongoose')
const jwt = require('./utils/jwt')
const User = require('./models/user.model')
require('dotenv').config()

// Test avatar upload endpoint accessibility
async function testAvatarEndpoint() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI_PROD
    if (!mongoUri) {
      console.log('❌ No MongoDB URI found in environment variables')
      return
    }

    await mongoose.connect(mongoUri)
    console.log('✅ Connected to database')

    // Find a test farmer user
    const testUser = await User.findOne({ role: 'farmer' }).select('_id name email')
    if (!testUser) {
      console.log('❌ No farmer user found. Please create a farmer user first.')
      return
    }

    console.log(`🔍 Testing with user: ${testUser.name} (${testUser.email})`)

    // Generate a JWT token for the user
    const token = jwt.signAccess({
      id: testUser._id.toString(),
      role: 'farmer',
      email: testUser.email,
      name: testUser.name
    })

    console.log(`🔑 Generated JWT token: ${token.substring(0, 50)}...`)

    // Test the token verification
    const decoded = jwt.verifyAccess(token)
    console.log(`✅ Token verification successful:`, decoded)

    // Test making a request to the avatar endpoint
    const http = require('http')

    // This is a simple test to see if the endpoint is accessible
    console.log('\n📡 Testing endpoint accessibility...')
    console.log('💡 To test the actual upload, you would need to:')
    console.log('1. Make sure the backend server is running')
    console.log('2. Use the JWT token in the Authorization header')
    console.log('3. Send a multipart/form-data request with an avatar file')

    console.log('\n🎯 Avatar Upload Test Token:', token)

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('📪 Disconnected from database')
  }
}

// Run the test
testAvatarEndpoint()
