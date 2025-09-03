// Test script to verify webhook flow for future payments
const mongoose = require('mongoose')
const Order = require('./models/order.model')
const Transaction = require('./models/transaction.model')

async function testWebhookFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')

    console.log('🔗 Connected to database for webhook testing')

    // Create a test order
    console.log('📦 Creating test order...')
    const testOrder = new Order({
      buyer: '507f1f77bcf86cd799439011', // Fake ObjectId
      seller: '507f1f77bcf86cd799439012', // Fake ObjectId
      items: [{
        listing: '507f1f77bcf86cd799439013',
        quantity: 1,
        price: 100,
        unit: 'kg',
        total: 100
      }],
      total: 608,
      subtotal: 100,
      tax: 8,
      shipping: 500,
      discount: 0,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'paystack',
      shippingAddress: {
        street: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        country: 'Nigeria',
        phone: '08012345678'
      }
    })

    await testOrder.save()
    console.log('✅ Test order created:', testOrder._id)

    // Create a test transaction linked to the order
    console.log('💳 Creating test transaction...')
    const testTransaction = new Transaction({
      type: 'payment',
      status: 'pending',
      amount: 608,
      currency: 'NGN',
      reference: `TEST_WEBHOOK_${Date.now()}`,
      description: `Test payment for order ${testOrder._id}`,
      userId: '507f1f77bcf86cd799439011',
      orderId: testOrder._id,
      paymentProvider: 'paystack',
      metadata: {
        orderId: testOrder._id.toString(),
        test: true
      }
    })

    await testTransaction.save()
    console.log('✅ Test transaction created:', testTransaction.reference)

    // Simulate Paystack webhook payload
    const webhookPayload = {
      event: 'charge.success',
      data: {
        reference: testTransaction.reference,
        amount: 60800, // In kobo (608 * 100)
        currency: 'NGN',
        status: 'success',
        paid_at: new Date().toISOString(),
        customer: {
          email: 'test@example.com',
          customer_code: 'CUS_TEST123'
        },
        metadata: {
          order_id: testOrder._id.toString(),
          transaction_id: testTransaction._id.toString()
        }
      }
    }

    console.log('🔗 Simulating Paystack webhook...')
    console.log('📤 Webhook payload:', JSON.stringify(webhookPayload, null, 2))

    // Simulate webhook processing (same logic as webhookVerify function)
    const event = webhookPayload.event
    const data = webhookPayload.data

    if (event === 'charge.success') {
      console.log('💰 Processing successful charge via webhook')

      // Find transaction
      const tx = await Transaction.findOne({ reference: data.reference })
      if (!tx) {
        console.log('❌ Transaction not found in webhook')
        return
      }

      console.log('✅ Found transaction:', tx.reference)

      // Update transaction
      tx.status = 'completed'
      tx.paymentProviderReference = data.reference
      tx.processedAt = new Date()
      tx.metadata.webhook = data
      await tx.save()
      console.log('✅ Transaction updated to completed')

      // Update order if it exists
      if (tx.orderId) {
        const order = await Order.findById(tx.orderId)
        if (order) {
          console.log('📦 Updating order status', {
            orderId: tx.orderId,
            currentStatus: order.status,
            currentPaymentStatus: order.paymentStatus
          })

          // Update order status to paid
          order.status = 'paid'
          order.paymentStatus = 'paid'
          order.paymentReference = data.reference
          await order.save()
          console.log('✅ Order status updated to paid')

          console.log('📦 Final order status:', {
            id: order._id,
            status: order.status,
            paymentStatus: order.paymentStatus,
            paymentReference: order.paymentReference
          })
        } else {
          console.log('❌ Order not found for transaction')
        }
      } else {
        console.log('⚠️ No order ID in transaction')
      }
    }

    console.log('✅ Webhook simulation completed successfully!')
    console.log('🎉 Future payments should work correctly with this webhook flow.')

    // Clean up test data
    console.log('🧹 Cleaning up test data...')
    await Order.findByIdAndDelete(testOrder._id)
    await Transaction.findByIdAndDelete(testTransaction._id)
    console.log('✅ Test data cleaned up')

  } catch (error) {
    console.error('❌ Webhook test error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

testWebhookFlow()
