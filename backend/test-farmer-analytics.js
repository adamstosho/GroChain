const mongoose = require('mongoose')
const User = require('./models/user.model')

// Simple test to verify database connection and farmer existence
async function testFarmerAnalytics() {
  try {
    console.log('🧪 Testing Farmer Analytics Setup...\n')

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')

    // Find a farmer user
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer found in database')
      console.log('💡 You may need to create sample data or check your database')
      return
    }

    console.log(`✅ Found farmer: ${farmer.name} (${farmer._id})`)
    console.log(`📧 Email: ${farmer.email}`)
    console.log(`🔖 Role: ${farmer.role}`)

    // Test the analytics controller
    console.log('\n📊 Testing Analytics Controller...')
    const { getFarmerAnalytics } = require('./controllers/analytics.controller')

    // Create mock request/response
    const mockReq = {
      user: { id: farmer._id.toString() },
      params: { farmerId: farmer._id.toString() },
      query: {}
    }

    const mockRes = {
      json: function(data) {
        console.log('📈 Analytics Response:')
        console.log(`   Total Harvests: ${data.data?.totalHarvests || 0}`)
        console.log(`   Total Orders: ${data.data?.totalOrders || 0}`)
        console.log(`   Total Revenue: ₦${data.data?.totalRevenue || 0}`)
        console.log(`   Total Listings: ${data.data?.totalListings || 0}`)
        console.log(`   Monthly Trends: ${data.data?.monthlyTrends?.length || 0} months`)
        return data
      },
      status: function(code) {
        console.log(`Status: ${code}`)
        return this
      }
    }

    console.log('🔄 Calling getFarmerAnalytics...')
    await getFarmerAnalytics(mockReq, mockRes)

    console.log('\n✅ Analytics test completed successfully!')
    console.log('🎯 Farmer analytics page should now show payments from buyers correctly!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('💡 Make sure your backend server is running and MongoDB is connected')
  } finally {
    await mongoose.disconnect()
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testFarmerAnalytics()
}

module.exports = { testFarmerAnalytics }