// Test script to fix order status after payment
const mongoose = require('mongoose')
const Order = require('./models/order.model')
const Transaction = require('./models/transaction.model')

async function fixOrderStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    console.log('🔗 Connected to database')

    // Find the specific order mentioned by the user
    const orderId = '5b570fa9' // This is the order ID from the user's message
    const order = await Order.findById(orderId)

    if (!order) {
      console.log('❌ Order not found with ID:', orderId)

      // Try to find orders with similar ID pattern
      const similarOrders = await Order.find({
        _id: { $regex: orderId.slice(-6), $options: 'i' }
      }).limit(5)

      if (similarOrders.length > 0) {
        console.log('📋 Similar orders found:')
        similarOrders.forEach(o => {
          console.log(`  • ID: ${o._id}, Status: ${o.status}, Payment Status: ${o.paymentStatus}`)
        })
      }

      return
    }

    console.log('📦 Found order:', {
      id: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      buyer: order.buyer,
      createdAt: order.createdAt
    })

    // Check if there's a corresponding transaction
    const transaction = await Transaction.findOne({ orderId: order._id })
    if (transaction) {
      console.log('💳 Found transaction:', {
        id: transaction._id,
        reference: transaction.reference,
        status: transaction.status,
        amount: transaction.amount
      })

      // If transaction is completed but order is not, fix it
      if (transaction.status === 'completed' && order.status !== 'paid') {
        console.log('🔧 Fixing order status...')

        order.status = 'paid'
        order.paymentStatus = 'paid'
        order.paymentReference = transaction.reference
        await order.save()

        console.log('✅ Order status fixed successfully!')
        console.log('📦 Updated order:', {
          id: order._id,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentReference: order.paymentReference
        })
      } else {
        console.log('ℹ️ Order status is already correct or transaction is not completed')
      }
    } else {
      console.log('⚠️ No transaction found for this order')

      // Create a mock transaction for testing
      console.log('🔧 Creating mock transaction for testing...')

      const mockTransaction = new Transaction({
        type: 'payment',
        status: 'completed',
        amount: order.total,
        currency: 'NGN',
        reference: `GROCHAIN_TEST_${Date.now()}`,
        description: `Payment for order ${order._id}`,
        userId: order.buyer,
        orderId: order._id,
        paymentProvider: 'paystack',
        paymentProviderReference: `TEST_${Date.now()}`,
        processedAt: new Date(),
        metadata: {
          test: true,
          fixed: true
        }
      })

      await mockTransaction.save()
      console.log('✅ Mock transaction created:', mockTransaction._id)

      // Now update the order
      order.status = 'paid'
      order.paymentStatus = 'paid'
      order.paymentReference = mockTransaction.reference
      await order.save()

      console.log('✅ Order status fixed with mock transaction!')
    }

  } catch (error) {
    console.error('❌ Error fixing order status:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

// Test webhook simulation
async function testWebhook() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    console.log('🔗 Testing webhook simulation...')

    // Find a pending order to test with
    const pendingOrder = await Order.findOne({ status: 'pending' }).populate('buyer')
    if (!pendingOrder) {
      console.log('❌ No pending orders found to test with')
      return
    }

    console.log('📦 Testing with order:', {
      id: pendingOrder._id,
      status: pendingOrder.status,
      paymentStatus: pendingOrder.paymentStatus,
      total: pendingOrder.total
    })

    // Find or create transaction
    let transaction = await Transaction.findOne({ orderId: pendingOrder._id })
    if (!transaction) {
      console.log('🔧 Creating test transaction...')
      transaction = new Transaction({
        type: 'payment',
        status: 'pending',
        amount: pendingOrder.total,
        currency: 'NGN',
        reference: `WEBHOOK_TEST_${Date.now()}`,
        description: `Test payment for order ${pendingOrder._id}`,
        userId: pendingOrder.buyer._id || pendingOrder.buyer,
        orderId: pendingOrder._id,
        paymentProvider: 'paystack',
        metadata: {
          webhook_test: true
        }
      })
      await transaction.save()
      console.log('✅ Test transaction created:', transaction.reference)
    }

    // Simulate webhook payload
    const webhookPayload = {
      event: 'charge.success',
      data: {
        reference: transaction.reference,
        amount: transaction.amount * 100, // Convert to kobo
        currency: 'NGN',
        status: 'success',
        paid_at: new Date().toISOString(),
        customer: {
          email: pendingOrder.buyer?.email || 'test@example.com'
        }
      }
    }

    console.log('🔗 Simulating webhook payload:', JSON.stringify(webhookPayload, null, 2))

    // Simulate webhook processing (similar to the actual webhook handler)
    transaction.status = 'completed'
    transaction.paymentProviderReference = webhookPayload.data.reference
    transaction.processedAt = new Date()
    transaction.metadata.webhook = webhookPayload.data
    await transaction.save()

    console.log('✅ Transaction updated to completed')

    // Update order status
    pendingOrder.status = 'paid'
    pendingOrder.paymentStatus = 'paid'
    pendingOrder.paymentReference = webhookPayload.data.reference
    await pendingOrder.save()

    console.log('✅ Order updated to paid')
    console.log('📦 Final order status:', {
      id: pendingOrder._id,
      status: pendingOrder.status,
      paymentStatus: pendingOrder.paymentStatus,
      paymentReference: pendingOrder.paymentReference
    })

  } catch (error) {
    console.error('❌ Webhook test error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

// Main execution
async function main() {
  const command = process.argv[2]

  if (command === 'fix') {
    console.log('🔧 Fixing specific order status...')
    await fixOrderStatus()
  } else if (command === 'webhook') {
    console.log('🔗 Testing webhook simulation...')
    await testWebhook()
  } else {
    console.log('📋 Usage:')
    console.log('  node test-webhook-fix.js fix    - Fix specific order status')
    console.log('  node test-webhook-fix.js webhook - Test webhook simulation')
  }
}

main().catch(console.error)
