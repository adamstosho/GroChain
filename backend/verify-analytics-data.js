const mongoose = require('mongoose')
const User = require('./models/user.model')
const Listing = require('./models/listing.model')
const Order = require('./models/order.model')
const Transaction = require('./models/transaction.model')
const Harvest = require('./models/harvest.model')

async function verifyAnalyticsData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('🔗 Connected to MongoDB')

    // Find farmer
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer found')
      return
    }

    console.log(`👨‍🌾 Farmer: ${farmer.name} (${farmer.email})`)

    // Check listings
    const listings = await Listing.find({ farmer: farmer._id })
    console.log(`📦 Listings: ${listings.length}`)
    listings.forEach(listing => {
      console.log(`   - ${listing.cropName}: ₦${listing.basePrice} (${listing.availableQuantity} ${listing.unit} available)`)
    })

    // Check harvests
    const harvests = await Harvest.find({ farmer: farmer._id })
    console.log(`🌾 Harvests: ${harvests.length}`)
    harvests.forEach(harvest => {
      console.log(`   - ${harvest.cropType}: ${harvest.quantity}${harvest.unit} (${harvest.status})`)
    })

    // Check orders
    const listingIds = listings.map(l => l._id)
    const orders = await Order.find({
      'items.listing': { $in: listingIds },
      status: { $in: ['paid', 'delivered'] }
    })

    console.log(`🛒 Paid Orders: ${orders.length}`)
    let totalRevenue = 0
    orders.forEach(order => {
      let orderRevenue = 0
      order.items?.forEach(item => {
        if (listingIds.includes(item.listing.toString())) {
          orderRevenue += item.total || 0
        }
      })
      totalRevenue += orderRevenue
      console.log(`   - Order ${order._id}: ₦${orderRevenue} (${order.status})`)
    })

    console.log(`💰 Total Revenue: ₦${totalRevenue}`)

    // Check transactions
    const transactions = await Transaction.find({
      $or: [
        { orderId: { $in: orders.map(o => o._id) } },
        { listingId: { $in: listingIds } }
      ]
    })
    console.log(`💳 Transactions: ${transactions.length}`)

    console.log('\n📊 Analytics Summary:')
    console.log(`   Total Harvests: ${harvests.length}`)
    console.log(`   Approved Harvests: ${harvests.filter(h => h.status === 'approved').length}`)
    console.log(`   Total Listings: ${listings.length}`)
    console.log(`   Total Orders: ${orders.length}`)
    console.log(`   Total Revenue: ₦${totalRevenue}`)
    console.log(`   Total Transactions: ${transactions.length}`)

    if (totalRevenue > 0) {
      console.log('\n✅ Analytics data is ready!')
    } else {
      console.log('\n⚠️ No revenue data found. Analytics will show zeros.')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

verifyAnalyticsData()
