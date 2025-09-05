const mongoose = require('mongoose')
const User = require('./backend/models/user.model')
const Order = require('./backend/models/order.model')
const Listing = require('./backend/models/listing.model')
const Harvest = require('./backend/models/harvest.model')

// Mock request/response for testing
function createMockRequest(userId) {
  return {
    user: { id: userId },
    params: { farmerId: userId },
    query: {}
  }
}

function createMockResponse() {
  const res = {
    json: function(data) {
      console.log('Response:', JSON.stringify(data, null, 2))
      return data
    },
    status: function(code) {
      console.log(`Status: ${code}`)
      return this
    }
  }
  return res
}

async function testFarmerAnalytics() {
  try {
    console.log('🧪 Testing Farmer Analytics with Payment Data...\n')

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')

    // Find a farmer user
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer found in database')
      return
    }
    console.log(`👨‍🌾 Found farmer: ${farmer.name} (${farmer._id})`)

    // Test the analytics controller
    const { getFarmerAnalytics } = require('./backend/controllers/analytics.controller')

    const mockReq = createMockRequest(farmer._id.toString())
    const mockRes = createMockResponse()

    await getFarmerAnalytics(mockReq, mockRes)

    console.log('\n✅ Analytics test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testFarmerAnalytics()
}

module.exports = { testFarmerAnalytics }
