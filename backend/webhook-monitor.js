// Webhook monitoring and auto-fix system
const mongoose = require('mongoose')
const Order = require('./models/order.model')
const Transaction = require('./models/transaction.model')

async function monitorAndFixWebhooks() {
  try {
    console.log('🔗 Connecting to database...')

    await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    })

    console.log('✅ Connected to database')

    // Find orders that are pending but have completed transactions
    const pendingOrders = await Order.find({
      $or: [
        { status: 'pending' },
        { paymentStatus: 'pending' }
      ]
    }).populate('buyer').limit(20)

    console.log(`📦 Found ${pendingOrders.length} pending orders to check`)

    let fixedCount = 0

    for (const order of pendingOrders) {
      try {
        // Check if there's a completed transaction for this order
        const transaction = await Transaction.findOne({
          orderId: order._id,
          status: 'completed'
        })

        if (transaction) {
          console.log(`🔧 Fixing order ${order._id} (transaction: ${transaction.reference})`)

          // Update order status
          order.status = 'paid'
          order.paymentStatus = 'paid'
          order.paymentReference = transaction.reference
          await order.save()

          console.log(`✅ Fixed order: ${order._id}`)
          fixedCount++
        }
      } catch (error) {
        console.error(`❌ Error processing order ${order._id}:`, error.message)
      }
    }

    console.log(`\n📊 Monitoring Results:`)
    console.log(`✅ Orders fixed: ${fixedCount}`)
    console.log(`📦 Total checked: ${pendingOrders.length}`)

    if (fixedCount > 0) {
      console.log('\n🎉 Successfully fixed pending orders!')
      console.log('🔄 Refresh your dashboard to see updated statuses.')
    } else {
      console.log('\nℹ️ No orders needed fixing at this time.')
    }

  } catch (error) {
    console.error('❌ Monitoring error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

// Function to simulate webhook processing
async function simulateWebhook(reference, orderId) {
  try {
    console.log('🔗 Simulating webhook for reference:', reference)

    await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    // Find transaction by reference
    const transaction = await Transaction.findOne({ reference })
    if (!transaction) {
      console.log('❌ Transaction not found for reference:', reference)
      return false
    }

    console.log('💳 Found transaction:', {
      id: transaction._id,
      reference: transaction.reference,
      status: transaction.status,
      orderId: transaction.orderId
    })

    // Update transaction to completed
    if (transaction.status !== 'completed') {
      transaction.status = 'completed'
      transaction.processedAt = new Date()
      await transaction.save()
      console.log('✅ Transaction updated to completed')
    }

    // Find and update order
    const orderIdToUse = orderId || transaction.orderId
    if (orderIdToUse) {
      const order = await Order.findById(orderIdToUse)
      if (order && order.status !== 'paid') {
        order.status = 'paid'
        order.paymentStatus = 'paid'
        order.paymentReference = transaction.reference
        await order.save()
        console.log('✅ Order updated to paid')
        return true
      }
    }

    console.log('ℹ️ Order already processed or not found')
    return true

  } catch (error) {
    console.error('❌ Webhook simulation error:', error.message)
    return false
  } finally {
    await mongoose.disconnect()
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('🔍 Running webhook monitoring...')
    await monitorAndFixWebhooks()
  } else if (args[0] === 'simulate' && args[1]) {
    const reference = args[1]
    const orderId = args[2] || null
    console.log(`🔗 Simulating webhook for reference: ${reference}`)
    const success = await simulateWebhook(reference, orderId)
    if (success) {
      console.log('✅ Webhook simulation completed successfully')
    } else {
      console.log('❌ Webhook simulation failed')
    }
  } else {
    console.log('Usage:')
    console.log('  node webhook-monitor.js                    # Monitor and fix pending orders')
    console.log('  node webhook-monitor.js simulate <ref>    # Simulate webhook for reference')
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { monitorAndFixWebhooks, simulateWebhook }
