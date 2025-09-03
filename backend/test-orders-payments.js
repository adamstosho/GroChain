// Test script to verify orders and payments endpoints
const mongoose = require('mongoose')
const Order = require('./models/order.model')
const Transaction = require('./models/transaction.model')
const User = require('./models/user.model')

async function testOrdersAndPayments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('🔗 Connected to database')

    // Test 1: Check if there are any orders in the database
    console.log('\n📦 Testing Orders...')
    const totalOrders = await Order.countDocuments()
    console.log(`📊 Total orders in database: ${totalOrders}`)

    if (totalOrders > 0) {
      // Get sample orders
      const sampleOrders = await Order.find()
        .populate('buyer', 'name email')
        .limit(3)
        .sort({ createdAt: -1 })

      console.log('📋 Sample orders:')
      sampleOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. ID: ${order._id}`)
        console.log(`     Status: ${order.status}`)
        console.log(`     Payment Status: ${order.paymentStatus}`)
        console.log(`     Total: ₦${order.total}`)
        console.log(`     Buyer: ${order.buyer?.name || 'Unknown'}`)
        console.log(`     Created: ${order.createdAt}`)
        console.log('')
      })
    }

    // Test 2: Check if there are any transactions
    console.log('💳 Testing Transactions...')
    const totalTransactions = await Transaction.countDocuments()
    console.log(`📊 Total transactions in database: ${totalTransactions}`)

    if (totalTransactions > 0) {
      // Get sample transactions
      const sampleTransactions = await Transaction.find()
        .populate('userId', 'name email')
        .populate('orderId', 'total status')
        .limit(3)
        .sort({ createdAt: -1 })

      console.log('💰 Sample transactions:')
      sampleTransactions.forEach((transaction, index) => {
        console.log(`  ${index + 1}. Reference: ${transaction.reference}`)
        console.log(`     Type: ${transaction.type}`)
        console.log(`     Status: ${transaction.status}`)
        console.log(`     Amount: ₦${transaction.amount}`)
        console.log(`     User: ${transaction.userId?.name || 'Unknown'}`)
        console.log(`     Order: ${transaction.orderId?._id || 'N/A'}`)
        console.log('')
      })
    }

    // Test 3: Check for a specific buyer (if any exist)
    console.log('👤 Testing Users...')
    const buyers = await User.find({ role: 'buyer' }).limit(3)
    console.log(`👥 Total buyers: ${buyers.length}`)

    if (buyers.length > 0) {
      console.log('🛒 Buyers found:')
      buyers.forEach((buyer, index) => {
        console.log(`  ${index + 1}. ${buyer.name} (${buyer.email})`)
      })

      // Test orders for first buyer
      const buyerOrders = await Order.find({ buyer: buyers[0]._id })
      console.log(`📦 Orders for ${buyers[0].name}: ${buyerOrders.length}`)

      // Test transactions for first buyer
      const buyerTransactions = await Transaction.find({ userId: buyers[0]._id })
      console.log(`💳 Transactions for ${buyers[0].name}: ${buyerTransactions.length}`)
    }

    console.log('\n✅ Database test completed successfully!')
    console.log('📊 Summary:')
    console.log(`   • Orders: ${totalOrders}`)
    console.log(`   • Transactions: ${totalTransactions}`)
    console.log(`   • Buyers: ${buyers.length}`)

  } catch (error) {
    console.error('❌ Test error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

testOrdersAndPayments()
