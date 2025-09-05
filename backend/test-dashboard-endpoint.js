const mongoose = require('mongoose')
const { getDashboardData } = require('./controllers/farmer.controller')

async function testDashboardEndpoint() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App')
    console.log('🔗 Connected to MongoDB')

    // Find farmer
    const User = require('./models/user.model')
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer found')
      return
    }

    console.log(`👨‍🌾 Testing dashboard for: ${farmer.name} (${farmer._id})`)

    // Create mock request/response
    const mockReq = {
      user: { id: farmer._id.toString() }
    }

    const mockRes = {
      json: (data) => {
        console.log('\n📊 Dashboard API Response:')
        console.log(`Status: ${data.status}`)
        if (data.status === 'success' && data.data) {
          const d = data.data
          console.log(`Total Harvests: ${d.totalHarvests}`)
          console.log(`Pending Approvals: ${d.pendingApprovals}`)
          console.log(`Active Listings: ${d.activeListings}`)
          console.log(`Monthly Revenue: ₦${d.monthlyRevenue}`)
          console.log(`Total Earnings: ₦${d.totalEarnings}`)
        }
        return data
      },
      status: (code) => ({ json: mockRes.json })
    }

    console.log('\n🔄 Calling getDashboardData...')
    await getDashboardData(mockReq, mockRes)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

testDashboardEndpoint()
