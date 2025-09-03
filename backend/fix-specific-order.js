// Quick fix for specific order
const mongoose = require('mongoose')
const Order = require('./models/order.model')
const Transaction = require('./models/transaction.model')

async function fixSpecificOrder(orderId) {
  try {
    console.log('🔗 Connecting to database...')

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    console.log('✅ Connected to database')

    console.log(`🔍 Checking order: ${orderId}`)

    const order = await Order.findById(orderId).populate('buyer')
    if (!order) {
      console.log('❌ Order not found')
      return
    }

    console.log('📦 Order details:', {
      id: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      buyer: order.buyer?.email
    })

    // Check for existing transaction
    let transaction = await Transaction.findOne({ orderId: order._id })
    if (!transaction) {
      console.log('🔧 Creating transaction record...')

      // Generate a reference that matches Paystack format
      const reference = `GROCHAIN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      transaction = new Transaction({
        type: 'payment',
        status: 'completed',
        amount: order.total,
        currency: 'NGN',
        reference: reference,
        description: `Payment for order ${order._id}`,
        userId: order.buyer._id || order.buyer,
        orderId: order._id,
        paymentProvider: 'paystack',
        paymentProviderReference: reference,
        processedAt: new Date(),
        metadata: {
          manuallyFixed: true,
          fixedAt: new Date(),
          originalStatus: order.status
        }
      })

      await transaction.save()
      console.log('✅ Transaction created:', transaction.reference)
    } else {
      console.log('💳 Found existing transaction:', {
        id: transaction._id,
        reference: transaction.reference,
        status: transaction.status
      })

      // Update transaction to completed if not already
      if (transaction.status !== 'completed') {
        transaction.status = 'completed'
        transaction.processedAt = new Date()
        await transaction.save()
        console.log('✅ Transaction updated to completed')
      }
    }

    // Update order status
    if (order.status !== 'paid') {
      console.log('🔧 Updating order status...')
      order.status = 'paid'
      order.paymentStatus = 'paid'
      order.paymentReference = transaction.reference
      await order.save()

      console.log('✅ Order updated successfully!')
      console.log('📦 New order status:', {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentReference: order.paymentReference
      })
    } else {
      console.log('ℹ️ Order was already paid')
    }

    console.log('\n🎉 Order fixed successfully!')
    console.log('🔄 Please refresh the order page to see the updated status')

  } catch (error) {
    console.error('❌ Error fixing order:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

// Run with specific order ID
const orderId = process.argv[2] || '68b8033ca3b9a905c8287446'
console.log(`🚀 Fixing order: ${orderId}`)
fixSpecificOrder(orderId).catch(console.error)
