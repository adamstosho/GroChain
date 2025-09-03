const mongoose = require('mongoose')
const User = require('./models/user.model')
require('dotenv').config()

// Test avatar database update
async function testAvatarDbUpdate() {
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
    const testUser = await User.findOne({ role: 'farmer' }).select('_id name email profile.avatar')
    if (!testUser) {
      console.log('❌ No farmer user found. Please create a farmer user first.')
      return
    }

    console.log(`🔍 Testing avatar for user: ${testUser.name} (${testUser.email})`)
    console.log(`📸 Current avatar in database: ${testUser.profile?.avatar || 'None'}`)

    // Check if avatar URL looks correct
    if (testUser.profile?.avatar) {
      const avatarUrl = testUser.profile.avatar
      console.log(`✅ Avatar URL format: ${avatarUrl}`)
      console.log(`✅ Avatar URL starts with /uploads/avatars/: ${avatarUrl.startsWith('/uploads/avatars/')}`)
    } else {
      console.log('⚠️ No avatar found in database')
    }

    console.log('\n🎉 Avatar database test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('📪 Disconnected from database')
  }
}

// Run the test
testAvatarDbUpdate()
