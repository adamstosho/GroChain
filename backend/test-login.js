const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/user.model')

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App')
    console.log('✅ Connected to MongoDB')

    // Find user
    const user = await User.findOne({ email: 'adam.baqir@test.com' })
    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      status: user.status
    })

    // Test password comparison
    const passwordMatch = await user.comparePassword('password123')
    console.log('Password match:', passwordMatch)

    // Test password hash directly
    const hashedPassword = await bcrypt.hash('password123', 12) // Use same cost factor as stored
    const bcryptMatch = await bcrypt.compare('password123', user.password)
    console.log('Bcrypt compare result:', bcryptMatch)
    console.log('Stored hash:', user.password.substring(0, 20) + '...')
    console.log('Generated hash:', hashedPassword.substring(0, 20) + '...')

    // If password doesn't match, update it
    if (!bcryptMatch) {
      console.log('Updating password...')
      const correctHash = await bcrypt.hash('password123', 12)
      await User.findByIdAndUpdate(user._id, { password: correctHash })
      console.log('✅ Password updated')

      // Test again
      const updatedUser = await User.findById(user._id)
      const newMatch = await bcrypt.compare('password123', updatedUser.password)
      console.log('New password match:', newMatch)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

testLogin()
