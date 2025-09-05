const mongoose = require('mongoose')
const User = require('./models/user.model')
const Order = require('./models/order.model')
const Listing = require('./models/listing.model')

async function debugOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App')
    console.log('🔗 Connected to MongoDB')

    // Find farmer
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer found')
      return
    }

    console.log(`👨‍🌾 Farmer ID: ${farmer._id}`)
    console.log(`👨‍🌾 Farmer: ${farmer.name}`)

    // Get current month orders
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    console.log(`📅 Current month: ${startOfMonth.toDateString()} to ${endOfMonth.toDateString()}`)

    // Find orders with this farmer as seller
    const ordersAsSeller = await Order.find({
      seller: farmer._id,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).populate('items.listing')

    console.log(`\n🛒 Orders where farmer is seller: ${ordersAsSeller.length}`)

    ordersAsSeller.forEach((order, index) => {
      console.log(`Order ${index + 1}:`)
      console.log(`  - ID: ${order._id}`)
      console.log(`  - Status: ${order.status}`)
      console.log(`  - Total: ₦${order.total}`)
      console.log(`  - Items: ${order.items?.length || 0}`)
      order.items?.forEach((item, itemIndex) => {
        console.log(`    Item ${itemIndex + 1}:`)
        console.log(`      - Product: ${item.listing?.cropName || 'N/A'}`)
        console.log(`      - Quantity: ${item.quantity} ${item.unit}`)
        console.log(`      - Price: ₦${item.price}`)
        console.log(`      - Total: ₦${item.total}`)
        console.log(`      - Listing Farmer: ${item.listing?.farmer}`)
      })
    })

    // Check if there are any orders at all
    const allOrders = await Order.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).limit(5)

    console.log(`\n📋 All orders this month: ${allOrders.length}`)
    allOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}: Seller=${order.seller}, Buyer=${order.buyer}, Status=${order.status}, Total=₦${order.total}`)
    })

    // Check if farmer has any listings (already required above)
    const farmerListings = await Listing.find({ farmer: farmer._id })
    console.log(`\n📦 Farmer's listings: ${farmerListings.length}`)
    farmerListings.forEach(listing => {
      console.log(`  - ${listing.cropName}: ₦${listing.basePrice} (${listing.status})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

debugOrders()
