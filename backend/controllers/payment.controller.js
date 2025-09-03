// crypto is built-in to Node.js, no need to require it
const Order = require('../models/order.model')
const Transaction = require('../models/transaction.model')
const Commission = require('../models/commission.model')

exports.getPaymentConfig = async (req, res) => {
  try {
    const config = {
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      currency: 'NGN',
      supportedChannels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      platformFeeRate: parseFloat(process.env.PLATFORM_FEE_RATE) || 0.03
    }
    
    return res.json({ status: 'success', data: config })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.initializePayment = async (req, res) => {
  try {
    const { orderId, amount, email, callbackUrl } = req.body
    
    if (!orderId || !amount || !email) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Order ID, amount, and email are required' 
      })
    }
    
    const order = await Order.findById(orderId).populate('buyer')
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' })
    }

    // More robust email validation - trim whitespace and handle case sensitivity
    const buyerEmail = (order.buyer.email || '').toLowerCase().trim()
    const providedEmail = (email || '').toLowerCase().trim()

    if (!buyerEmail || buyerEmail !== providedEmail) {
      console.log('❌ Email mismatch:', {
        buyerEmail: order.buyer.email,
        providedEmail: email,
        buyerEmailNormalized: buyerEmail,
        providedEmailNormalized: providedEmail
      })
      return res.status(400).json({
        status: 'error',
        message: 'Email mismatch: The email provided does not match the buyer\'s registered email'
      })
    }
    
    // Generate unique reference
    const reference = `GROCHAIN_${Date.now()}_${require('crypto').randomBytes(8).toString('hex')}`
    
    // Create transaction record
    const transaction = new Transaction({
      type: 'payment',
      status: 'pending',
      amount: amount,
      currency: 'NGN',
      reference: reference,
      description: `Payment for order ${orderId}`,
      userId: order.buyer._id,
      orderId: orderId,
      paymentProvider: 'paystack',
      metadata: {
        orderId: orderId,
        callbackUrl: callbackUrl
      }
    })
    
    await transaction.save()
    
    // Initialize Paystack payment with proper webhook URL (points to backend)
    const webhookUrl = process.env.NODE_ENV === 'production'
      ? `${process.env.WEBHOOK_URL || 'https://your-domain.com/api'}/payments/verify`
      : `http://localhost:5000/api/payments/verify`

    const paystackData = {
      email: email,
      amount: Math.round(amount * 100), // Convert to kobo
      reference: reference,
      callback_url: callbackUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/verify`,
      webhook_url: webhookUrl, // Add webhook URL for Paystack
      metadata: {
        order_id: orderId,
        transaction_id: transaction._id.toString()
      }
    }
    
    // In a real implementation, you would make an API call to Paystack here
    // For now, we'll simulate the response
    const paystackResponse = {
      authorization_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/verify?reference=${reference}`,
      access_code: require('crypto').randomBytes(32).toString('hex'),
      reference: reference
    }
    
    return res.json({
      status: 'success',
      data: {
        transaction: transaction,
        paystack: paystackResponse
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params

    console.log('🔍 Manual payment verification for reference:', reference)

    const transaction = await Transaction.findOne({ reference: reference })
    if (!transaction) {
      console.log('❌ Transaction not found:', reference)
      return res.status(404).json({ status: 'error', message: 'Transaction not found' })
    }

    // If already completed, return success
    if (transaction.status === 'completed') {
      console.log('✅ Transaction already completed')
      return res.json({
        status: 'success',
        data: {
          transaction: transaction,
          message: 'Payment already verified'
        }
      })
    }

    // In a real implementation, you would verify with Paystack here
    // For now, we'll simulate a successful verification
    const verificationData = {
      status: 'success',
      amount: transaction.amount * 100, // Convert from kobo
      reference: reference,
      gateway_response: 'Successful',
      paid_at: new Date().toISOString(),
      channel: 'card',
      ip_address: req.ip,
      fees: Math.round(transaction.amount * 0.015), // 1.5% Paystack fee
      customer: {
        email: 'customer@example.com',
        customer_code: 'CUS_1234567890'
      }
    }

    console.log('✅ Updating transaction to completed')

    // Update transaction status
    transaction.status = 'completed'
    transaction.paymentProviderReference = reference
    transaction.processedAt = new Date()
    transaction.metadata.verification = verificationData
    await transaction.save()

    // Update order status
    if (transaction.orderId) {
      const order = await Order.findById(transaction.orderId)
      if (order) {
        console.log('📦 Updating order status to paid:', transaction.orderId)

        order.status = 'paid'
        order.paymentStatus = 'paid'
        order.paymentReference = reference
        await order.save()
        console.log('✅ Order status updated successfully')

        // Calculate and create commissions
        try {
          await this.createCommissions(order)
          console.log('✅ Commissions created successfully')
        } catch (commissionError) {
          console.error('❌ Commission creation failed:', commissionError)
          // Don't fail the verification because of commission errors
        }
      } else {
        console.log('❌ Order not found for transaction')
      }
    } else {
      console.log('⚠️ No order ID in transaction')
    }

    return res.json({
      status: 'success',
      data: {
        transaction: transaction,
        verification: verificationData
      }
    })
  } catch (error) {
    console.error('❌ Payment verification error:', error)
    return res.status(500).json({ status: 'error', message: 'Payment verification failed' })
  }
}

exports.createCommissions = async (order) => {
  try {
    for (const item of order.items) {
      const listing = await require('../models/listing.model').findById(item.listing)
      if (!listing) continue
      
      const farmer = await require('../models/user.model').findById(listing.farmer)
      if (!farmer || !farmer.partner) continue
      
      const partner = await require('../models/partner.model').findById(farmer.partner)
      if (!partner) continue
      
      // Calculate commission
      const commissionAmount = item.price * item.quantity * partner.commissionRate
      
      // Create commission record
      const commission = new Commission({
        partner: partner._id,
        farmer: farmer._id,
        order: order._id,
        listing: listing._id,
        amount: commissionAmount,
        rate: partner.commissionRate,
        orderAmount: item.price * item.quantity,
        orderDate: order.createdAt
      })
      
      await commission.save()
      
      // Update partner's total commissions
      partner.totalCommissions += commissionAmount
      await partner.save()
    }
  } catch (error) {
    console.error('Error creating commissions:', error)
  }
}

exports.processRefund = async (req, res) => {
  try {
    const { orderId } = req.params
    const { reason, amount } = req.body
    
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' })
    }
    
    if (order.status !== 'paid') {
      return res.status(400).json({ status: 'error', message: 'Order is not paid' })
    }
    
    const refundAmount = amount || order.total
    
    // Create refund transaction
    const refundTransaction = new Transaction({
      type: 'refund',
      status: 'pending',
      amount: refundAmount,
      currency: 'NGN',
      reference: `REFUND_${Date.now()}_${require('crypto').randomBytes(8).toString('hex')}`,
      description: `Refund for order ${orderId}: ${reason}`,
      userId: order.buyer,
      orderId: orderId,
      paymentProvider: 'paystack',
      metadata: {
        reason: reason,
        originalOrderId: orderId
      }
    })
    
    await refundTransaction.save()
    
    // Update order status
    order.status = 'refunded'
    await order.save()
    
    return res.json({
      status: 'success',
      data: {
        refund: refundTransaction,
        message: 'Refund initiated successfully'
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 20, type, status } = req.query

    const query = { userId: userId }
    if (type) query.type = type
    if (status) query.status = status

    const transactions = await Transaction.find(query)
      .populate('orderId', 'total status')
      .populate('listingId', 'cropName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Transaction.countDocuments(query)

    return res.json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}



exports.webhookVerify = async (req, res) => {
  try {
    // For development/testing, we'll skip signature verification
    // In production, uncomment the lines below:
    /*
    const signature = req.headers['x-paystack-signature']
    if (!signature) return res.status(401).json({ status: 'error', message: 'Missing signature' })
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY
    const payload = JSON.stringify(req.body)
    const expected = require('crypto').createHmac('sha512', secret).update(payload).digest('hex')
    if (expected !== signature) return res.status(401).json({ status: 'error', message: 'Invalid signature' })
    */

    const event = req.body?.event
    const data = req.body?.data
    if (!event || !data) {
      console.log('❌ Webhook: Invalid payload received', { event, hasData: !!data })
      return res.status(400).json({ status: 'error', message: 'Invalid payload' })
    }

    console.log('🔗 Paystack Webhook Received:', {
      event,
      reference: data.reference,
      amount: data.amount,
      status: data.status,
      timestamp: new Date().toISOString()
    })

    // Use reference to find transaction
    const reference = data.reference
    let tx = await Transaction.findOne({ reference })

    // Idempotency: if already completed, ack and return
    if (tx && tx.status === 'completed') {
      console.log('✅ Webhook: Transaction already processed')
      return res.json({ status: 'success', message: 'Already processed' })
    }

    if (!tx) {
      console.log('⚠️ Webhook: Transaction not found, creating shell transaction')
      // Create a shell transaction if we didn't initiate (rare)
      tx = new Transaction({
        type: 'payment',
        status: 'pending',
        amount: (data.amount || 0) / 100,
        currency: (data.currency || 'NGN'),
        reference: reference,
        description: 'Paystack webhook',
        userId: undefined,
        paymentProvider: 'paystack',
        metadata: {}
      })
    }

    if (event === 'charge.success') {
      console.log('💰 Webhook: Processing successful charge')

      try {
        // Update transaction with comprehensive data
        tx.status = 'completed'
        tx.paymentProviderReference = data.reference
        tx.processedAt = new Date()
        tx.metadata = {
          ...tx.metadata,
          webhook: data,
          webhookProcessedAt: new Date(),
          webhookEvent: event
        }
        await tx.save()
        console.log('✅ Transaction updated to completed')

        // Update order if it exists
        if (tx.orderId) {
          const order = await Order.findById(tx.orderId)
          if (order) {
            console.log('📦 Webhook: Updating order status', {
              orderId: tx.orderId,
              currentStatus: order.status,
              currentPaymentStatus: order.paymentStatus
            })

            // Update order status to paid (only if not already paid)
            if (order.status !== 'paid') {
              order.status = 'paid'
              order.paymentStatus = 'paid'
              order.paymentReference = data.reference
              await order.save()
              console.log('✅ Order status updated to paid')
            } else {
              console.log('ℹ️ Order was already paid, skipping update')
            }

            // Create commissions (only if order was just paid)
            if (order.status === 'paid') {
              try {
                await this.createCommissions(order)
                console.log('✅ Commissions created successfully')
              } catch (commissionError) {
                console.error('❌ Commission creation failed:', commissionError)
                // Don't fail the webhook because of commission errors
              }
            }

            // Send email notification (you can implement this)
            console.log('📧 Email notification should be sent for order:', order._id)
          } else {
            console.log('❌ Webhook: Order not found for transaction')
          }
        } else {
          console.log('⚠️ Webhook: No order ID in transaction')
        }
      } catch (processingError) {
        console.error('❌ Webhook processing error:', processingError)
        // Log the error but don't fail the webhook response
      }
    } else {
      console.log('ℹ️ Webhook: Event type not charge.success:', event)
    }

    console.log('✅ Webhook processing completed')
    return res.json({ status: 'success', message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return res.status(500).json({ status: 'error', message: 'Webhook processing failed' })
  }
}

// Fallback method to sync order status with transaction status
exports.syncOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params

    if (!orderId) {
      return res.status(400).json({ status: 'error', message: 'Order ID is required' })
    }

    console.log('🔄 Syncing order status for:', orderId)

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' })
    }

    // Find the transaction for this order
    const transaction = await Transaction.findOne({ orderId: order._id })
    if (!transaction) {
      console.log('⚠️ No transaction found for order:', orderId)
      return res.json({
        status: 'success',
        message: 'No transaction found, order status unchanged',
        order: {
          id: order._id,
          status: order.status,
          paymentStatus: order.paymentStatus
        }
      })
    }

    console.log('💳 Found transaction:', {
      id: transaction._id,
      reference: transaction.reference,
      status: transaction.status
    })

    // If transaction is completed but order is not paid, fix it
    if (transaction.status === 'completed' && order.status !== 'paid') {
      console.log('🔧 Fixing order status mismatch')

      const oldStatus = order.status
      const oldPaymentStatus = order.paymentStatus

      order.status = 'paid'
      order.paymentStatus = 'paid'
      order.paymentReference = transaction.reference
      await order.save()

      console.log('✅ Order status synchronized')

      return res.json({
        status: 'success',
        message: 'Order status synchronized',
        changes: {
          status: `${oldStatus} → ${order.status}`,
          paymentStatus: `${oldPaymentStatus} → ${order.paymentStatus}`,
          paymentReference: order.paymentReference
        }
      })
    } else {
      console.log('ℹ️ Order status already synchronized')
      return res.json({
        status: 'success',
        message: 'Order status already synchronized',
        order: {
          id: order._id,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentReference: order.paymentReference
        }
      })
    }

  } catch (error) {
    console.error('❌ Order sync error:', error)
    return res.status(500).json({ status: 'error', message: 'Order synchronization failed' })
  }
}

// Bulk sync method to fix multiple orders
exports.bulkSyncOrders = async (req, res) => {
  try {
    console.log('🔄 Starting bulk order synchronization...')

    // Find all orders with pending status
    const pendingOrders = await Order.find({
      $or: [
        { status: 'pending' },
        { paymentStatus: 'pending' }
      ]
    }).limit(100) // Limit to prevent timeout

    console.log(`📦 Found ${pendingOrders.length} pending orders to check`)

    let fixedCount = 0
    let alreadySyncedCount = 0
    const results = []

    for (const order of pendingOrders) {
      try {
        // Find transaction for this order
        const transaction = await Transaction.findOne({
          orderId: order._id,
          status: 'completed'
        })

        if (transaction && order.status !== 'paid') {
          // Fix the order
          order.status = 'paid'
          order.paymentStatus = 'paid'
          order.paymentReference = transaction.reference
          await order.save()

          results.push({
            orderId: order._id,
            fixed: true,
            changes: `pending → paid`
          })

          fixedCount++
        } else if (transaction && order.status === 'paid') {
          alreadySyncedCount++
        }
      } catch (orderError) {
        console.error(`❌ Error processing order ${order._id}:`, orderError)
        results.push({
          orderId: order._id,
          error: orderError.message
        })
      }
    }

    console.log('✅ Bulk synchronization completed')

    return res.json({
      status: 'success',
      message: 'Bulk synchronization completed',
      summary: {
        totalChecked: pendingOrders.length,
        fixed: fixedCount,
        alreadySynced: alreadySyncedCount,
        errors: results.filter(r => r.error).length
      },
      results: results.slice(0, 10) // Return first 10 results
    })

  } catch (error) {
    console.error('❌ Bulk sync error:', error)
    return res.status(500).json({ status: 'error', message: 'Bulk synchronization failed' })
  }
}