const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/user.model')
const Partner = require('./models/partner.model')

async function checkAndCreatePartner() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App')
    console.log('✅ Connected to MongoDB')

    // Check if partner exists
    let partner = await Partner.findOne({ email: 'adam.baqir@test.com' })
    console.log('Partner exists:', !!partner)

    if (!partner) {
      console.log('Creating partner...')
      partner = await Partner.create({
        name: 'Adam Baqi',
        email: 'adam.baqir@test.com',
        phone: '+2348012345678',
        organization: 'Nigerian Agricultural Cooperative',
        type: 'cooperative',
        location: 'Lagos, Nigeria',
        status: 'active',
        commissionRate: 0.05,
        totalCommissions: 285000,
        farmers: []
      })
      console.log('✅ Partner created:', partner._id)
    }

    // Check if user account exists
    let user = await User.findOne({ email: 'adam.baqir@test.com' })
    console.log('User exists:', !!user)

    if (!user) {
      console.log('Creating user account...')
      const hashedPassword = await bcrypt.hash('password123', 10)

      user = await User.create({
        name: 'Adam Baqi',
        email: 'adam.baqir@test.com',
        phone: '+2348012345678',
        password: hashedPassword,
        role: 'partner',
        status: 'active',
        location: 'Lagos, Nigeria',
        partner: partner._id,
        emailVerified: true // Mark email as verified for testing
      })
      console.log('✅ User created:', user._id)
    } else {
      // Update existing user to ensure email is verified
      console.log('Updating existing user...')
      await User.findByIdAndUpdate(user._id, {
        emailVerified: true,
        partner: partner._id
      })
      console.log('✅ User updated with email verification')
    }

    // Check farmers count
    const farmerCount = await User.countDocuments({ partner: partner._id, role: 'farmer' })
    console.log('Farmers count:', farmerCount)

    console.log('\n📊 Partner Dashboard Data:')
    console.log(`Partner ID: ${partner._id}`)
    console.log(`User ID: ${user._id}`)
    console.log(`Farmers: ${farmerCount}`)
    console.log(`Commission Rate: ${partner.commissionRate}`)
    console.log(`Total Commissions: ${partner.totalCommissions}`)

    console.log('\n🔑 Login Credentials:')
    console.log(`Email: adam.baqir@test.com`)
    console.log(`Password: password123`)
    console.log(`Role: partner`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

checkAndCreatePartner()
