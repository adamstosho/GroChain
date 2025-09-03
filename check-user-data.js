// Check current user data in database
const mongoose = require('mongoose')

async function checkUserData() {
  try {
    // Connect to database
    await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App')
    console.log('✅ Connected to database')

    // Get user model
    const User = require('./backend/models/user.model')

    // Find all users to see what location data exists
    const users = await User.find({}).select('name email role location profile').limit(10)

    console.log('\n👥 All Users in Database:\n')

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`)
      console.log(`   📍 Location field: "${user.location || 'NOT SET'}"`)
      console.log(`   🏠 Profile.city: "${user.profile?.city || 'NOT SET'}"`)
      console.log(`   🗺️ Profile.state: "${user.profile?.state || 'NOT SET'}"`)
      console.log(`   📌 Profile.coordinates:`, user.profile?.coordinates || 'NOT SET')
      console.log(`   🌍 Profile.country: "${user.profile?.country || 'NOT SET'}"`)
      console.log('')
    })

    // Find specifically farmers
    const farmers = await User.find({ role: 'farmer' }).select('name email location profile')

    console.log(`\n🌾 Farmers Found: ${farmers.length}\n`)

    farmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name}`)
      console.log(`   📍 Location: "${farmer.location || 'NOT SET'}"`)
      console.log(`   🏠 City: "${farmer.profile?.city || 'NOT SET'}"`)
      console.log(`   🗺️ State: "${farmer.profile?.state || 'NOT SET'}"`)
      console.log(`   📌 Coordinates: ${farmer.profile?.coordinates?.lat || 'N/A'}, ${farmer.profile?.coordinates?.lng || 'N/A'}`)
      console.log('')
    })

    // Check for any Ilorin references
    const ilorinUsers = await User.find({
      $or: [
        { location: /Ilorin/i },
        { 'profile.city': /Ilorin/i },
        { 'profile.state': /Kwara/i }
      ]
    }).select('name email location profile')

    console.log(`🔍 Users with Ilorin/Kwara references: ${ilorinUsers.length}`)
    if (ilorinUsers.length > 0) {
      ilorinUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} - ${user.location} - ${user.profile?.city}, ${user.profile?.state}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('✅ Disconnected from database')
  }
}

checkUserData()
