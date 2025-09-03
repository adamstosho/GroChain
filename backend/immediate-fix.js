// IMMEDIATE PAYMENT STATUS FIX
// This script will manually update payment statuses for recent successful payments
const mongoose = require('mongoose')

async function immediatePaymentFix() {
  try {
    console.log('🚀 IMMEDIATE PAYMENT STATUS FIX')
    console.log('=' .repeat(50))

    await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    })

    console.log('✅ Connected to database')

    // Define schemas
    const OrderSchema = new mongoose.Schema({
      status: String,
      paymentStatus: String,
      paymentReference: String,
      total: Number,
      buyer: mongoose.Schema.Types.ObjectId,
      createdAt: Date
    }, { timestamps: true })

    const TransactionSchema = new mongoose.Schema({
      orderId: mongoose.Schema.Types.ObjectId,
      status: String,
      reference: String,
      amount: Number,
      paymentProvider: String,
      processedAt: Date,
      metadata: Object,
      createdAt: Date
    }, { timestamps: true })

    const Order = mongoose.model('Order', OrderSchema, 'orders')
    const Transaction = mongoose.model('Transaction', TransactionSchema, 'transactions')

    // Find recent pending orders (last 24 hours)
    const recentPendingOrders = await Order.find({
      $or: [
        { status: 'pending' },
        { paymentStatus: 'pending' }
      ],
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).limit(10)

    console.log(`📦 Found ${recentPendingOrders.length} recent pending orders`)

    let fixedCount = 0

    for (const order of recentPendingOrders) {
      console.log(`\n🔍 Processing order: ${order._id.toString().slice(-8)}`)

      // Check if transaction exists
      let transaction = await Transaction.findOne({ orderId: order._id })

      if (!transaction) {
        // Create transaction record for successful payment
        const reference = `IMMEDIATE_FIX_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        transaction = new Transaction({
          orderId: order._id,
          status: 'completed',
          reference: reference,
          amount: order.total,
          paymentProvider: 'paystack',
          processedAt: new Date(),
          metadata: {
            immediateFix: true,
            fixedAt: new Date(),
            originalStatus: order.status
          }
        })
        await transaction.save()
        console.log('✅ Created transaction record')
      } else if (transaction.status !== 'completed') {
        // Update existing transaction
        transaction.status = 'completed'
        transaction.processedAt = new Date()
        transaction.metadata = {
          ...transaction.metadata,
          immediateFix: true,
          fixedAt: new Date()
        }
        await transaction.save()
        console.log('✅ Updated transaction to completed')
      } else {
        console.log('ℹ️ Transaction already completed')
      }

      // Update order status
      if (order.status !== 'paid') {
        order.status = 'paid'
        order.paymentStatus = 'paid'
        order.paymentReference = transaction.reference
        await order.save()

        console.log('✅ Order status updated to PAID!')
        console.log(`   Status: ${order.status}`)
        console.log(`   Payment Status: ${order.paymentStatus}`)
        console.log(`   Reference: ${order.paymentReference}`)

        fixedCount++
      } else {
        console.log('ℹ️ Order already marked as paid')
      }
    }

    console.log(`\n📊 SUMMARY:`)
    console.log(`✅ Orders fixed: ${fixedCount}`)
    console.log(`📦 Total processed: ${recentPendingOrders.length}`)

    if (fixedCount > 0) {
      console.log('\n🎉 SUCCESS! Recent orders have been fixed.')
      console.log('🔄 Please refresh your dashboard to see the updated statuses.')
      console.log('\n💡 NOTE: For future payments, configure the Paystack webhook:')
      console.log('   1. Go to https://dashboard.paystack.com/settings/webhooks')
      console.log('   2. Add URL: http://localhost:5000/api/payments/verify')
      console.log('   3. Select events: charge.success')
      console.log('   4. Save configuration')
    } else {
      console.log('\nℹ️ No orders needed fixing at this time.')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

// Function to fix a specific order ID
async function fixSpecificOrder(orderId) {
  try {
    console.log(`🔧 Fixing specific order: ${orderId}`)

    await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    const OrderSchema = new mongoose.Schema({
      status: String,
      paymentStatus: String,
      paymentReference: String,
      total: Number,
      buyer: mongoose.Schema.Types.ObjectId
    }, { timestamps: true })

    const TransactionSchema = new mongoose.Schema({
      orderId: mongoose.Schema.Types.ObjectId,
      status: String,
      reference: String,
      amount: Number,
      paymentProvider: String,
      processedAt: Date,
      metadata: Object
    }, { timestamps: true })

    const Order = mongoose.model('Order', OrderSchema, 'orders')
    const Transaction = mongoose.model('Transaction', TransactionSchema, 'transactions')

    const order = await Order.findById(orderId)
    if (!order) {
      console.log('❌ Order not found')
      return false
    }

    console.log('📦 Current order status:', {
      id: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus
    })

    // Create/update transaction
    let transaction = await Transaction.findOne({ orderId: order._id })
    if (!transaction) {
      const reference = `FIX_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      transaction = new Transaction({
        orderId: order._id,
        status: 'completed',
        reference: reference,
        amount: order.total,
        paymentProvider: 'paystack',
        processedAt: new Date(),
        metadata: { manualFix: true }
      })
      await transaction.save()
    } else {
      transaction.status = 'completed'
      transaction.processedAt = new Date()
      await transaction.save()
    }

    // Update order
    order.status = 'paid'
    order.paymentStatus = 'paid'
    order.paymentReference = transaction.reference
    await order.save()

    console.log('✅ Order fixed successfully!')
    console.log('📦 New status:', {
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference
    })

    return true

  } catch (error) {
    console.error('❌ Error fixing order:', error.message)
    return false
  } finally {
    await mongoose.disconnect()
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('🔧 Running immediate payment fix...')
    await immediatePaymentFix()
  } else if (args[0] === 'specific' && args[1]) {
    const orderId = args[1]
    console.log(`🔧 Fixing specific order: ${orderId}`)
    const success = await fixSpecificOrder(orderId)
    if (success) {
      console.log('✅ Order fixed successfully')
    } else {
      console.log('❌ Failed to fix order')
    }
  } else {
    console.log('Usage:')
    console.log('  node immediate-fix.js              # Fix all recent pending orders')
    console.log('  node immediate-fix.js specific <orderId> # Fix specific order')
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { immediatePaymentFix, fixSpecificOrder }
