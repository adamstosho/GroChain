// Script to fix orders that are still showing as pending but have completed transactions
const mongoose = require('mongoose')
const Order = require('./models/order.model')
const Transaction = require('./models/transaction.model')

async function fixPendingOrders() {
  try {
    console.log('🔗 Connecting to database...')

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    console.log('✅ Connected to database')

    // Find all orders that are pending or have pending payment status
    const pendingOrders = await Order.find({
      $or: [
        { status: 'pending' },
        { paymentStatus: 'pending' }
      ]
    }).populate('buyer').limit(50) // Limit to prevent memory issues

    console.log(`📦 Found ${pendingOrders.length} potentially pending orders`)

    let fixedCount = 0
    let skippedCount = 0

    for (const order of pendingOrders) {
      console.log(`\n🔍 Checking order: ${order._id}`)

      // Check if there's a corresponding completed transaction
      const transaction = await Transaction.findOne({
        orderId: order._id,
        status: 'completed'
      })

      if (transaction) {
        console.log(`💳 Found completed transaction: ${transaction.reference}`)

        // Update order status
        const oldStatus = order.status
        const oldPaymentStatus = order.paymentStatus

        order.status = 'paid'
        order.paymentStatus = 'paid'
        order.paymentReference = transaction.reference

        await order.save()

        console.log(`✅ Fixed order ${order._id}:`)
        console.log(`   Status: ${oldStatus} → ${order.status}`)
        console.log(`   Payment Status: ${oldPaymentStatus} → ${order.paymentStatus}`)
        console.log(`   Payment Reference: ${order.paymentReference}`)

        fixedCount++
      } else {
        console.log(`⚠️ No completed transaction found for order ${order._id}`)
        skippedCount++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`✅ Fixed orders: ${fixedCount}`)
    console.log(`⚠️ Skipped orders: ${skippedCount}`)
    console.log(`📦 Total processed: ${pendingOrders.length}`)

    // Also check for any transactions that are completed but orders don't exist
    const orphanedTransactions = await Transaction.find({
      status: 'completed',
      orderId: { $exists: true }
    }).populate('orderId').limit(20)

    console.log(`\n🔍 Checking for orphaned transactions...`)
    let orphanedCount = 0

    for (const tx of orphanedTransactions) {
      if (!tx.orderId) {
        console.log(`🚨 Transaction ${tx.reference} has no associated order`)
        orphanedCount++
      }
    }

    if (orphanedCount === 0) {
      console.log(`✅ No orphaned transactions found`)
    } else {
      console.log(`⚠️ Found ${orphanedCount} orphaned transactions`)
    }

  } catch (error) {
    console.error('❌ Error fixing pending orders:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

// Function to manually fix a specific order
async function fixSpecificOrder(orderId) {
  try {
    console.log(`🔍 Fixing specific order: ${orderId}`)

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    const order = await Order.findById(orderId).populate('buyer')
    if (!order) {
      console.log('❌ Order not found')
      return
    }

    console.log(`📦 Found order:`, {
      id: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total
    })

    // Find transaction
    const transaction = await Transaction.findOne({ orderId: order._id })
    if (transaction) {
      console.log(`💳 Found transaction:`, {
        id: transaction._id,
        reference: transaction.reference,
        status: transaction.status
      })

      // Force update to paid
      order.status = 'paid'
      order.paymentStatus = 'paid'
      order.paymentReference = transaction.reference
      await order.save()

      console.log('✅ Order manually fixed to paid status')
    } else {
      console.log('⚠️ No transaction found, creating mock transaction...')

      // Create a mock transaction
      const mockTransaction = new Transaction({
        type: 'payment',
        status: 'completed',
        amount: order.total,
        currency: 'NGN',
        reference: `FIXED_${Date.now()}`,
        description: `Payment for order ${order._id} (manually fixed)`,
        userId: order.buyer._id || order.buyer,
        orderId: order._id,
        paymentProvider: 'paystack',
        paymentProviderReference: `FIXED_${Date.now()}`,
        processedAt: new Date(),
        metadata: {
          manuallyFixed: true,
          fixedAt: new Date()
        }
      })

      await mockTransaction.save()
      console.log('✅ Mock transaction created')

      // Update order
      order.status = 'paid'
      order.paymentStatus = 'paid'
      order.paymentReference = mockTransaction.reference
      await order.save()

      console.log('✅ Order manually fixed to paid status')
    }

  } catch (error) {
    console.error('❌ Error fixing specific order:', error)
  } finally {
    await mongoose.disconnect()
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('🔧 Fixing all pending orders...')
    await fixPendingOrders()
  } else if (args[0] === 'specific' && args[1]) {
    console.log(`🔧 Fixing specific order: ${args[1]}`)
    await fixSpecificOrder(args[1])
  } else {
    console.log('Usage:')
    console.log('  node fix-pending-orders.js                    # Fix all pending orders')
    console.log('  node fix-pending-orders.js specific <orderId> # Fix specific order')
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { fixPendingOrders, fixSpecificOrder }
