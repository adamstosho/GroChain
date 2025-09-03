// Debug script to check user location data
const mongoose = require('mongoose')

async function debugUserLocation() {
  try {
    // Connect to database
    await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App')
    console.log('✅ Connected to database')

    // Get user model
    const User = require('./backend/models/user.model')

    // Find all farmers
    const farmers = await User.find({ role: 'farmer' }).select('name email location profile').limit(5)

    console.log('\n👥 Farmers found:', farmers.length)
    console.log('📍 User Location Data:\n')

    farmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} (${farmer.email})`)
      console.log(`   - Location field: "${farmer.location || 'NOT SET'}"`)
      console.log(`   - Profile.city: "${farmer.profile?.city || 'NOT SET'}"`)
      console.log(`   - Profile.state: "${farmer.profile?.state || 'NOT SET'}"`)
      console.log(`   - Profile.coordinates:`, farmer.profile?.coordinates || 'NOT SET')
      console.log('')
    })

    // Try to find users with Ilorin location
    const ilorinUsers = await User.find({
      $or: [
        { location: /Ilorin/i },
        { 'profile.city': /Ilorin/i },
        { 'profile.state': /Kwara/i }
      ]
    }).select('name email location profile')

    console.log('🔍 Users with Ilorin location:', ilorinUsers.length)
    if (ilorinUsers.length > 0) {
      ilorinUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} - Location: "${user.location}", Profile: ${user.profile?.city}, ${user.profile?.state}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('✅ Disconnected from database')
  }
}

debugUserLocation()

