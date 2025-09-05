const mongoose = require('mongoose')
const User = require('./models/user.model')
const Listing = require('./models/listing.model')
const Order = require('./models/order.model')
const Transaction = require('./models/transaction.model')
const Harvest = require('./models/harvest.model')

async function debugAnalyticsAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('🔗 Connected to MongoDB')

    // Find farmer
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer found in database')
      console.log('💡 Create a farmer user first')
      return
    }

    console.log(`👨‍🌾 Farmer: ${farmer.name} (${farmer._id})`)

    // Get farmer's listings
    const listings = await Listing.find({ farmer: farmer._id })
    console.log(`📦 Listings: ${listings.length}`)

    // Get farmer's orders (as seller)
    const listingIds = listings.map(l => l._id)
    const orders = await Order.find({
      'items.listing': { $in: listingIds },
      status: { $in: ['paid', 'delivered'] }
    }).populate('items.listing')

    console.log(`🛒 Paid Orders: ${orders.length}`)

    // Calculate revenue
    let totalRevenue = 0
    let totalOrders = 0

    orders.forEach(order => {
      if (order.status === 'paid' || order.status === 'delivered') {
        let farmerOrderRevenue = 0
        order.items?.forEach(item => {
          if (item.listing && listingIds.includes(item.listing._id)) {
            farmerOrderRevenue += item.total || 0
            console.log(`   Item: ${item.listing.cropName} - ₦${item.total}`)
          }
        })
        totalRevenue += farmerOrderRevenue
        totalOrders += 1
        console.log(`   Order ${order._id}: ₦${farmerOrderRevenue} (${order.status})`)
      }
    })

    // Get farmer's harvests
    const harvests = await Harvest.find({ farmer: farmer._id })
    const approvedHarvests = harvests.filter(h => h.status === 'approved')

    console.log(`🌾 Harvests: ${harvests.length}`)
    console.log(`✅ Approved Harvests: ${approvedHarvests.length}`)

    // Calculate approval rate
    const approvalRate = harvests.length > 0 ? Math.round((approvedHarvests.length / harvests.length) * 100) : 0

    // Calculate average harvest quantity
    const averageHarvestQuantity = harvests.length > 0
      ? harvests.reduce((sum, h) => sum + (h.quantity || 0), 0) / harvests.length
      : 0

    console.log('\n📊 Analytics Data Summary:')
    console.log(`   totalHarvests: ${harvests.length}`)
    console.log(`   approvedHarvests: ${approvedHarvests.length}`)
    console.log(`   approvalRate: ${approvalRate}%`)
    console.log(`   totalListings: ${listings.length}`)
    console.log(`   totalOrders: ${totalOrders}`)
    console.log(`   totalRevenue: ₦${totalRevenue}`)
    console.log(`   averageHarvestQuantity: ${Math.round(averageHarvestQuantity * 100) / 100}`)

    // Test the actual analytics controller
    console.log('\n🔄 Testing Analytics Controller...')
    const { getFarmerAnalytics } = require('./controllers/analytics.controller')

    const mockReq = {
      user: { id: farmer._id.toString() },
      params: { farmerId: farmer._id.toString() },
      query: {}
    }

    const mockRes = {
      json: (data) => {
        console.log('\n📈 API Response:')
        console.log(JSON.stringify(data, null, 2))
        return data
      },
      status: (code) => ({ json: mockRes.json })
    }

    await getFarmerAnalytics(mockReq, mockRes)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

debugAnalyticsAPI()
