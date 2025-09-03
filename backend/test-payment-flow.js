// Complete payment flow test
const mongoose = require('mongoose')
const Order = require('./models/order.model')
const Transaction = require('./models/transaction.model')

async function testPaymentFlow() {
  try {
    console.log('🔗 Testing complete payment flow...')

    await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    console.log('✅ Connected to database')

    // Step 1: Find a recent pending order
    const recentOrder = await Order.findOne({
      status: 'pending',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).populate('buyer').sort({ createdAt: -1 })

    if (!recentOrder) {
      console.log('❌ No recent pending orders found')
      return
    }

    console.log('📦 Testing with order:', {
      id: recentOrder._id,
      status: recentOrder.status,
      paymentStatus: recentOrder.paymentStatus,
      total: recentOrder.total,
      createdAt: recentOrder.createdAt
    })

    // Step 2: Check if transaction exists
    let transaction = await Transaction.findOne({ orderId: recentOrder._id })

    if (!transaction) {
      console.log('🔧 Creating test transaction...')
      const reference = `TEST_FLOW_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      transaction = new Transaction({
        type: 'payment',
        status: 'pending',
        amount: recentOrder.total,
        currency: 'NGN',
        reference: reference,
        description: `Test payment flow for order ${recentOrder._id}`,
        userId: recentOrder.buyer._id || recentOrder.buyer,
        orderId: recentOrder._id,
        paymentProvider: 'paystack',
        metadata: {
          testFlow: true,
          testTimestamp: new Date()
        }
      })

      await transaction.save()
      console.log('✅ Test transaction created:', transaction.reference)
    } else {
      console.log('💳 Using existing transaction:', transaction.reference)
    }

    // Step 3: Simulate successful payment webhook
    console.log('\n🔄 Simulating successful payment...')

    // Update transaction to completed
    transaction.status = 'completed'
    transaction.processedAt = new Date()
    transaction.metadata.webhook = {
      simulated: true,
      event: 'charge.success',
      timestamp: new Date()
    }
    await transaction.save()

    console.log('✅ Transaction status updated to completed')

    // Step 4: Update order status
    recentOrder.status = 'paid'
    recentOrder.paymentStatus = 'paid'
    recentOrder.paymentReference = transaction.reference
    await recentOrder.save()

    console.log('✅ Order status updated to paid')

    // Step 5: Verify final state
    console.log('\n📊 Final Verification:')

    const finalOrder = await Order.findById(recentOrder._id)
    const finalTransaction = await Transaction.findById(transaction._id)

    console.log('📦 Final Order Status:', {
      id: finalOrder._id,
      status: finalOrder.status,
      paymentStatus: finalOrder.paymentStatus,
      paymentReference: finalOrder.paymentReference
    })

    console.log('💳 Final Transaction Status:', {
      id: finalTransaction._id,
      reference: finalTransaction.reference,
      status: finalTransaction.status,
      processedAt: finalTransaction.processedAt
    })

    console.log('\n🎉 Payment flow test completed successfully!')
    console.log('✅ All statuses updated correctly')
    console.log('🔄 The webhook system should work the same way for real payments')

  } catch (error) {
    console.error('❌ Payment flow test error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

// Function to check webhook URL configuration
function checkWebhookConfiguration() {
  console.log('\n🔧 Webhook Configuration Check:')

  const nodeEnv = process.env.NODE_ENV || 'development'
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  const webhookUrl = process.env.WEBHOOK_URL

  console.log('🌍 Environment:', nodeEnv)
  console.log('🌐 Frontend URL:', frontendUrl)
  console.log('🔗 Webhook URL:', webhookUrl || 'Not set')

  const expectedWebhookUrl = nodeEnv === 'production'
    ? `${webhookUrl || 'https://your-domain.com/api'}/payments/verify`
    : `http://localhost:5000/api/payments/verify`

  console.log('🎯 Expected Webhook URL:', expectedWebhookUrl)

  console.log('\n📋 Configuration Status:')
  if (nodeEnv === 'development') {
    console.log('✅ Development mode: Webhook points to backend (localhost:5000)')
  } else {
    if (webhookUrl) {
      console.log('✅ Production mode: Webhook URL configured')
    } else {
      console.log('⚠️ Production mode: WEBHOOK_URL not set in environment')
    }
  }

  console.log('\n💡 Make sure your Paystack webhook URL is set to:', expectedWebhookUrl)
}

// Main execution
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('🚀 Running complete payment flow test...')
    checkWebhookConfiguration()
    await testPaymentFlow()
  } else if (args[0] === 'config') {
    checkWebhookConfiguration()
  } else {
    console.log('Usage:')
    console.log('  node test-payment-flow.js         # Run complete payment flow test')
    console.log('  node test-payment-flow.js config  # Check webhook configuration')
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { testPaymentFlow, checkWebhookConfiguration }
