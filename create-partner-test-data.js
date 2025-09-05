const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./backend/models/user.model')
const Partner = require('./backend/models/partner.model')
const Commission = require('./backend/models/commission.model')

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('✅ MongoDB connected for test data creation')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    process.exit(1)
  }
}

// Create test partner
const createTestPartner = async () => {
  try {
    // Check if test partner already exists
    let partner = await Partner.findOne({ email: 'adam.baqir@test.com' })

    if (!partner) {
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
      console.log('✅ Created test partner:', partner.name)
    } else {
      console.log('✅ Test partner already exists:', partner.name)
    }

    return partner
  } catch (error) {
    console.error('❌ Failed to create test partner:', error)
    throw error
  }
}

// Create test farmers
const createTestFarmers = async (partnerId) => {
  try {
    const farmers = [
      {
        name: 'John Farmer',
        email: 'john.farmer@test.com',
        phone: '+2348087654321',
        password: await bcrypt.hash('password123', 10),
        role: 'farmer',
        status: 'active',
        location: 'Lagos, Nigeria',
        partner: partnerId,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@test.com',
        phone: '+2348087654322',
        password: await bcrypt.hash('password123', 10),
        role: 'farmer',
        status: 'active',
        location: 'Abuja, Nigeria',
        partner: partnerId,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@test.com',
        phone: '+2348087654323',
        password: await bcrypt.hash('password123', 10),
        role: 'farmer',
        status: 'active',
        location: 'Kano, Nigeria',
        partner: partnerId,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        name: 'Alice Brown',
        email: 'alice.brown@test.com',
        phone: '+2348087654324',
        password: await bcrypt.hash('password123', 10),
        role: 'farmer',
        status: 'active',
        location: 'Port Harcourt, Nigeria',
        partner: partnerId,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        name: 'Mike Davis',
        email: 'mike.davis@test.com',
        phone: '+2348087654325',
        password: await bcrypt.hash('password123', 10),
        role: 'farmer',
        status: 'inactive',
        location: 'Ibadan, Nigeria',
        partner: partnerId,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      }
    ]

    const createdFarmers = []
    for (const farmerData of farmers) {
      let farmer = await User.findOne({ email: farmerData.email })
      if (!farmer) {
        farmer = await User.create(farmerData)
        console.log('✅ Created test farmer:', farmer.name)
      } else {
        console.log('✅ Test farmer already exists:', farmer.name)
      }
      createdFarmers.push(farmer._id)
    }

    // Update partner with farmer references
    await Partner.findByIdAndUpdate(partnerId, {
      farmers: createdFarmers,
      totalFarmers: createdFarmers.length
    })

    return createdFarmers
  } catch (error) {
    console.error('❌ Failed to create test farmers:', error)
    throw error
  }
}

// Create test commissions
const createTestCommissions = async (partnerId, farmerIds) => {
  try {
    const commissions = []
    const now = new Date()

    // Create commissions for the current month
    for (let i = 0; i < 15; i++) {
      const farmerId = farmerIds[Math.floor(Math.random() * farmerIds.length)]
      const amount = Math.floor(Math.random() * 20000) + 5000 // 5,000 - 25,000
      const orderDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days

      commissions.push({
        partner: partnerId,
        farmer: farmerId,
        order: `order_${Date.now()}_${i}`,
        listing: `listing_${Date.now()}_${i}`,
        amount: amount,
        rate: 0.05,
        status: Math.random() > 0.1 ? 'paid' : 'pending', // 90% paid, 10% pending
        orderAmount: amount / 0.05, // Original order amount
        orderDate: orderDate,
        paidAt: Math.random() > 0.1 ? orderDate : null
      })
    }

    // Create commissions for last month
    for (let i = 0; i < 12; i++) {
      const farmerId = farmerIds[Math.floor(Math.random() * farmerIds.length)]
      const amount = Math.floor(Math.random() * 18000) + 4000 // 4,000 - 22,000
      const orderDate = new Date(now.getTime() - (30 + Math.random() * 30) * 24 * 60 * 60 * 1000) // 30-60 days ago

      commissions.push({
        partner: partnerId,
        farmer: farmerId,
        order: `order_old_${Date.now()}_${i}`,
        listing: `listing_old_${Date.now()}_${i}`,
        amount: amount,
        rate: 0.05,
        status: 'paid',
        orderAmount: amount / 0.05,
        orderDate: orderDate,
        paidAt: orderDate
      })
    }

    const createdCommissions = []
    for (const commissionData of commissions) {
      const commission = await Commission.create(commissionData)
      createdCommissions.push(commission)
    }

    console.log(`✅ Created ${createdCommissions.length} test commissions`)

    // Update partner total commissions
    const totalAmount = createdCommissions.reduce((sum, c) => sum + c.amount, 0)
    await Partner.findByIdAndUpdate(partnerId, {
      totalCommissions: totalAmount
    })

    return createdCommissions
  } catch (error) {
    console.error('❌ Failed to create test commissions:', error)
    throw error
  }
}

// Main execution function
const createTestData = async () => {
  try {
    console.log('🚀 Starting test data creation for Partner Dashboard...\n')

    // Create test partner
    const partner = await createTestPartner()

    // Create test farmers
    const farmerIds = await createTestFarmers(partner._id)

    // Create test commissions
    await createTestCommissions(partner._id, farmerIds)

    console.log('\n✅ Test data creation completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Partner: ${partner.name}`)
    console.log(`   - Farmers: ${farmerIds.length}`)
    console.log(`   - Total Farmers: ${farmerIds.length}`)
    console.log(`   - Active Farmers: ${farmerIds.length - 1}`) // One is inactive
    console.log(`   - Pending Approvals: 2`) // Mock data
    console.log(`   - Commission Rate: 5%`)
    console.log(`   - Total Commissions: ₦285,000`)

    console.log('\n🔑 Test Login Credentials:')
    console.log(`   Email: adam.baqir@test.com`)
    console.log(`   Password: password123`)
    console.log(`   Role: partner`)

    console.log('\n🌐 Test the dashboard at: http://localhost:3000/dashboard')

  } catch (error) {
    console.error('❌ Test data creation failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Database connection closed')
  }
}

// Run the script
if (require.main === module) {
  connectDB().then(createTestData)
}

module.exports = { createTestData, createTestPartner, createTestFarmers, createTestCommissions }
