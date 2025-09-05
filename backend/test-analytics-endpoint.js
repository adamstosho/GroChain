const mongoose = require('mongoose')
const User = require('./models/user.model')

async function testAnalyticsEndpoint() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('🔗 Connected to MongoDB')

    // Find farmer
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer found in database')
      return
    }

    console.log(`👨‍🌾 Found farmer: ${farmer.name} (${farmer._id})`)

    // Test the analytics controller directly
    const { getFarmerAnalytics } = require('./controllers/analytics.controller')

    // Mock request and response
    const mockReq = {
      user: { id: farmer._id.toString() },
      params: { farmerId: farmer._id.toString() },
      query: {}
    }

    const mockRes = {
      json: (data) => {
        console.log('\n📊 Analytics API Response:')
        console.log(`Status: ${data.status}`)
        if (data.status === 'success') {
          console.log(`Total Harvests: ${data.data.totalHarvests}`)
          console.log(`Approved Harvests: ${data.data.approvedHarvests}`)
          console.log(`Total Listings: ${data.data.totalListings}`)
          console.log(`Total Orders: ${data.data.totalOrders}`)
          console.log(`Total Revenue: ₦${data.data.totalRevenue}`)
          console.log(`Average Harvest Quantity: ${data.data.averageHarvestQuantity}`)
          console.log(`Monthly Trends: ${data.data.monthlyTrends?.length || 0} months`)

          if (data.data.monthlyTrends && data.data.monthlyTrends.length > 0) {
            console.log('Recent Monthly Trends:')
            data.data.monthlyTrends.slice(-3).forEach(trend => {
              console.log(`  ${trend.month}: ${trend.harvests} harvests, ₦${trend.revenue} revenue`)
            })
          }
        }
        return data
      },
      status: (code) => {
        console.log(`HTTP Status: ${code}`)
        return mockRes
      }
    }

    console.log('🔄 Calling getFarmerAnalytics...')
    await getFarmerAnalytics(mockReq, mockRes)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

testAnalyticsEndpoint()
