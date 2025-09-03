// Simple webhook fix without model dependencies
const mongoose = require('mongoose')

async function simpleWebhookFix() {
  try {
    console.log('🔗 Connecting to database...')

    await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    })

    console.log('✅ Connected to database')

    // Define schemas inline
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

    // Find pending orders
    const pendingOrders = await Order.find({
      $or: [
        { status: 'pending' },
        { paymentStatus: 'pending' }
      ]
    }).limit(20)

    console.log(`📦 Found ${pendingOrders.length} pending orders`)

    let fixedCount = 0

    for (const order of pendingOrders) {
      try {
        // Check for completed transaction
        const transaction = await Transaction.findOne({
          orderId: order._id,
          status: 'completed'
        })

        if (transaction) {
          console.log(`🔧 Fixing order ${order._id} (tx: ${transaction.reference})`)

          order.status = 'paid'
          order.paymentStatus = 'paid'
          order.paymentReference = transaction.reference
          await order.save()

          console.log(`✅ Fixed: ${order._id}`)
          fixedCount++
        }
      } catch (error) {
        console.error(`❌ Error processing order ${order._id}:`, error.message)
      }
    }

    console.log(`\n📊 Results:`)
    console.log(`✅ Fixed: ${fixedCount}`)
    console.log(`📦 Checked: ${pendingOrders.length}`)

    if (fixedCount > 0) {
      console.log('\n🎉 Orders fixed! Refresh your dashboard.')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected')
  }
}

// Function to simulate webhook for a specific reference
async function simulateWebhook(reference) {
  try {
    console.log(`🔗 Simulating webhook for: ${reference}`)

    await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    const TransactionSchema = new mongoose.Schema({
      orderId: mongoose.Schema.Types.ObjectId,
      status: String,
      reference: String,
      amount: Number,
      paymentProvider: String,
      processedAt: Date,
      metadata: Object
    }, { timestamps: true })

    const OrderSchema = new mongoose.Schema({
      status: String,
      paymentStatus: String,
      paymentReference: String,
      total: Number,
      buyer: mongoose.Schema.Types.ObjectId
    }, { timestamps: true })

    const Transaction = mongoose.model('Transaction', TransactionSchema, 'transactions')
    const Order = mongoose.model('Order', OrderSchema, 'orders')

    // Find transaction by reference
    const transaction = await Transaction.findOne({ reference })
    if (!transaction) {
      console.log('❌ Transaction not found')
      return false
    }

    console.log('💳 Found transaction:', {
      id: transaction._id,
      status: transaction.status,
      orderId: transaction.orderId
    })

    // Update transaction
    if (transaction.status !== 'completed') {
      transaction.status = 'completed'
      transaction.processedAt = new Date()
      await transaction.save()
      console.log('✅ Transaction updated to completed')
    }

    // Update order if exists
    if (transaction.orderId) {
      const order = await Order.findById(transaction.orderId)
      if (order && order.status !== 'paid') {
        order.status = 'paid'
        order.paymentStatus = 'paid'
        order.paymentReference = transaction.reference
        await order.save()
        console.log('✅ Order updated to paid')
        return true
      }
    }

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
    console.log('🔍 Running simple webhook fix...')
    await simpleWebhookFix()
  } else if (args[0] === 'simulate' && args[1]) {
    const reference = args[1]
    console.log(`🔗 Simulating webhook for reference: ${reference}`)
    const success = await simulateWebhook(reference)
    if (success) {
      console.log('✅ Webhook simulation completed')
    } else {
      console.log('❌ Webhook simulation failed')
    }
  } else {
    console.log('Usage:')
    console.log('  node simple-webhook-fix.js              # Fix pending orders')
    console.log('  node simple-webhook-fix.js simulate <ref> # Simulate webhook')
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { simpleWebhookFix, simulateWebhook }
