const mongoose = require('mongoose')
const User = require('./backend/models/user.model')
const Order = require('./backend/models/order.model')
const Listing = require('./backend/models/listing.model')
const Transaction = require('./backend/models/transaction.model')

// Mock request/response for testing
function createMockRequest(userId, role = 'farmer') {
  return {
    user: { id: userId, role: role },
    query: { page: 1, limit: 20 }
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

async function testFarmerPayments() {
  try {
    console.log('🧪 Testing Farmer Payment Visibility...\n')

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')

    // Find a farmer user
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer found in database')
      return
    }
    console.log(`👨‍🌾 Found farmer: ${farmer.name} (${farmer._id})`)

    // Find farmer's listings
    const farmerListings = await Listing.find({ farmer: farmer._id })
    console.log(`📦 Farmer has ${farmerListings.length} listings`)

    // Find orders where farmer is seller
    const farmerOrders = await Order.find({ seller: farmer._id })
    console.log(`🛒 Farmer has ${farmerOrders.length} orders as seller`)

    // Find transactions related to farmer's listings or orders
    const orderIds = farmerOrders.map(order => order._id)
    const listingIds = farmerListings.map(listing => listing._id)

    const farmerTransactions = await Transaction.find({
      $or: [
        { orderId: { $in: orderIds } },
        { listingId: { $in: listingIds } }
      ]
    }).populate('orderId').populate('listingId')

    console.log(`💰 Found ${farmerTransactions.length} transactions for farmer:`)
    farmerTransactions.forEach((txn, index) => {
      console.log(`  ${index + 1}. ${txn.type} - ₦${txn.amount} (${txn.status})`)
    })

    // Test the payment controller method
    console.log('\n🔧 Testing Payment Controller...')
    const { getTransactionHistory } = require('./backend/controllers/payment.controller')

    const mockReq = createMockRequest(farmer._id.toString())
    const mockRes = createMockResponse()

    await getTransactionHistory(mockReq, mockRes)

    console.log('\n✅ Test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testFarmerPayments()
}

module.exports = { testFarmerPayments }
