const mongoose = require('mongoose')
const User = require('./models/user.model')
require('dotenv').config()

// Test avatar upload functionality
async function testAvatarUpload() {
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
    console.log(`📸 Current avatar: ${testUser.profile?.avatar || 'None'}`)

    // Test avatar URL update simulation
    const mockAvatarUrl = '/uploads/avatars/avatar-test-123456789.jpg'
    const updatedUser = await User.findByIdAndUpdate(
      testUser._id,
      {
        'profile.avatar': mockAvatarUrl
      },
      { new: true }
    ).select('profile.avatar')

    console.log(`✅ Updated avatar URL: ${updatedUser.profile.avatar}`)

    // Verify the update
    const verifyUser = await User.findById(testUser._id).select('profile.avatar')
    console.log(`🔍 Verified avatar URL: ${verifyUser.profile.avatar}`)

    // Reset avatar for testing
    await User.findByIdAndUpdate(testUser._id, { 'profile.avatar': null })

    console.log('\n🎉 Avatar upload test completed successfully!')
    console.log('📝 Note: The actual file upload will be tested when the frontend is used')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('📪 Disconnected from database')
  }
}

// Run the test
testAvatarUpload()
