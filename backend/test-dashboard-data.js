const mongoose = require('mongoose')
const User = require('./models/user.model')
const Order = require('./models/order.model')
const Listing = require('./models/listing.model')
const Harvest = require('./models/harvest.model')

async function testDashboardData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App')
    console.log('🔗 Connected to MongoDB')

    // Find farmer
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer found')
      return
    }

    console.log(`👨‍🌾 Testing dashboard data for: ${farmer.name}`)

    // Test the dashboard data calculation
    const farmerId = farmer._id

    // Get harvest count
    const harvestCount = await Harvest.countDocuments({ farmer: farmerId })
    console.log(`🌾 Total Harvests: ${harvestCount}`)

    // Get pending approvals
    const pendingApprovals = await Harvest.countDocuments({
      farmer: farmerId,
      status: 'pending'
    })
    console.log(`⏳ Pending Approvals: ${pendingApprovals}`)

    // Get active listings
    const activeListings = await Listing.countDocuments({
      farmer: farmerId,
      status: 'active'
    })
    console.log(`📦 Active Listings: ${activeListings}`)

    // Calculate monthly revenue
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const monthlyOrders = await Order.find({
      seller: farmerId,
      status: { $in: ['paid', 'delivered'] },
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).populate('items.listing')

    let monthlyRevenue = 0
    monthlyOrders.forEach(order => {
      order.items?.forEach(item => {
        if (item.listing && item.listing.farmer.toString() === farmerId) {
          monthlyRevenue += item.total || 0
        }
      })
    })

    console.log(`💰 Monthly Revenue: ₦${monthlyRevenue}`)
    console.log(`🛒 Monthly Orders: ${monthlyOrders.length}`)

    // Summary
    console.log('\n📊 Dashboard Summary:')
    console.log(`   Total Harvests: ${harvestCount}`)
    console.log(`   Pending Approvals: ${pendingApprovals}`)
    console.log(`   Active Listings: ${activeListings}`)
    console.log(`   Monthly Revenue: ₦${monthlyRevenue}`)

    if (pendingApprovals > 0) {
      console.log('\n✅ Pending Approvals should show real data!')
    } else {
      console.log('\n⚠️ No pending approvals - create some pending harvests to test')
    }

    if (monthlyRevenue > 0) {
      console.log('✅ Monthly Revenue should show real data!')
    } else {
      console.log('⚠️ No monthly revenue - create some orders to test')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

testDashboardData()
