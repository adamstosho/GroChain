// crypto is built-in to Node.js, no need to require it
const Order = require('../models/order.model')
const Transaction = require('../models/transaction.model')
const Commission = require('../models/commission.model')
const https = require('https')
const notificationController = require('./notification.controller')

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
    
    // Auto-verify payment in test mode (since Paystack keys are not configured)
    console.log('🔍 Checking Paystack configuration:', {
      hasSecretKey: !!process.env.PAYSTACK_SECRET_KEY,
      secretKeyValue: process.env.PAYSTACK_SECRET_KEY,
      isTestKey: process.env.PAYSTACK_SECRET_KEY === 'sk_test_your_secret_key_here'
    })
    
    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY === 'sk_test_your_secret_key_here') {
      console.log('🧪 Auto-verifying payment in test mode...')
      
      // Update transaction to completed
      transaction.status = 'completed'
      transaction.processedAt = new Date()
      transaction.metadata = {
        ...transaction.metadata,
        autoVerified: true,
        verifiedAt: new Date(),
        testMode: true
      }
      await transaction.save()
      
      // Update order to paid
      order.status = 'paid'
      order.paymentStatus = 'paid'
      order.paymentReference = reference
      await order.save()
      
      console.log('✅ Payment auto-verified and order marked as paid')
      
      // CRITICAL FIX: Update inventory for auto-verified payments
      try {
        console.log('📦 Auto-verification: Updating inventory for paid order...')
        console.log('📦 Order ID:', order._id)
        console.log('📦 Order items before populate:', order.items?.length || 0)
        
        const Listing = require('../models/listing.model')
        
        // Populate the order items with listing details
        const populatedOrder = await Order.findById(order._id)
          .populate('items.listing', 'cropName availableQuantity quantity status')
        
        console.log('📦 Order items after populate:', populatedOrder?.items?.length || 0)
        
        for (const item of populatedOrder.items) {
          console.log('🔍 Processing order item:', {
            hasListing: !!item.listing,
            listingId: item.listing?._id,
            quantity: item.quantity
          })
          
          if (item.listing) {
            const listing = item.listing
            const newAvailableQuantity = listing.availableQuantity - item.quantity
            
            console.log('🛒 Auto-verification: Updating inventory for item:', {
              listingId: listing._id,
              cropName: listing.cropName,
              orderedQuantity: item.quantity,
              oldAvailableQuantity: listing.availableQuantity,
              newAvailableQuantity: newAvailableQuantity
            })

            // Update the listing with final inventory reduction
            const updatedListing = await Listing.findByIdAndUpdate(listing._id, {
              $inc: { 
                availableQuantity: -item.quantity
              },
              status: newAvailableQuantity <= 0 ? 'sold_out' : listing.status,
              soldOutAt: newAvailableQuantity <= 0 ? new Date() : null
            }, { new: true })

            console.log('✅ Auto-verification: Inventory updated:', {
              listingId: listing._id,
              cropName: listing.cropName,
              finalAvailableQuantity: updatedListing.availableQuantity,
              finalTotalQuantity: updatedListing.quantity,
              status: updatedListing.status
            })
          } else {
            console.log('❌ No listing found for order item')
          }
        }
        
        console.log('✅ Auto-verification: All inventory updates completed successfully')
      } catch (inventoryError) {
        console.error('❌ Auto-verification: Inventory update failed:', inventoryError)
        // Don't fail the auto-verification because of inventory errors, but log them
      }
    }
    
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
    
    // Call real Paystack API to initialize payment
    console.log('🔗 Initializing payment with Paystack API...')
    
    // Check if Paystack keys are configured
    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY === 'sk_test_your_secret_key_here') {
      console.log('⚠️ Paystack keys not configured, using fallback mode')
      
      // Fallback: Create a simulated response that will work for testing
      const paystackResponse = {
        success: true,
        authorization_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/verify?reference=${reference}&test_mode=true`,
        access_code: require('crypto').randomBytes(32).toString('hex'),
        reference: reference
      }
      
      console.log('✅ Payment initialized in fallback mode (test)')
      
      return res.json({
        status: 'success',
        data: {
          transaction: transaction,
          paystack: paystackResponse,
          testMode: true
        }
      })
    }
    
    const paystackResponse = await initializePaystackPayment(paystackData)
    
    if (!paystackResponse.success) {
      console.log('❌ Paystack initialization failed:', paystackResponse.error)
      return res.status(400).json({ 
        status: 'error', 
        message: 'Payment initialization failed: ' + paystackResponse.error 
      })
    }
    
    console.log('✅ Paystack payment initialized successfully')
    
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

    // If already completed, still check if inventory needs updating
    if (transaction.status === 'completed') {
      console.log('✅ Transaction already completed - checking inventory updates')

      // Always try to fetch and return the latest order data
      let orderData = null
      if (transaction.orderId) {
        const order = await Order.findById(transaction.orderId)
          .populate('items.listing', 'cropName availableQuantity quantity status updatedAt createdAt')
        
        if (order) {
          orderData = order
          
          // Check if inventory needs updating for this completed transaction
          console.log('🔍 Checking if inventory needs updating for completed transaction...')
          
          try {
            const Listing = require('../models/listing.model')
            
            for (const item of order.items) {
              if (item.listing) {
                const listing = item.listing
                
                // Check if this listing was updated after the order was created
                // If listing was updated before order creation, we need to update inventory
                if (listing.updatedAt < order.createdAt) {
                  console.log('🛒 Inventory update needed for completed transaction:', {
                    listingId: listing._id,
                    cropName: listing.cropName,
                    orderCreated: order.createdAt,
                    listingUpdated: listing.updatedAt
                  })
                  
                  // Validate that we have enough stock before updating
                  if (listing.availableQuantity < item.quantity) {
                    console.error('❌ Insufficient stock for item:', {
                      listingId: listing._id,
                      cropName: listing.cropName,
                      availableQuantity: listing.availableQuantity,
                      orderedQuantity: item.quantity
                    })
                    continue
                  }
                  
                  const newAvailableQuantity = listing.availableQuantity - item.quantity
                  
                  // Use atomic update to prevent race conditions
                  const updatedListing = await Listing.findByIdAndUpdate(
                    listing._id, 
                    {
                      $inc: { 
                        availableQuantity: -item.quantity
                      },
                      $set: {
                        status: newAvailableQuantity <= 0 ? 'sold_out' : listing.status,
                        soldOutAt: newAvailableQuantity <= 0 ? new Date() : null,
                        updatedAt: new Date()
                      }
                    }, 
                    { 
                      new: true,
                      runValidators: true
                    }
                  )

                  if (updatedListing) {
                    console.log('✅ Inventory updated for completed transaction:', {
                      listingId: listing._id,
                      cropName: listing.cropName,
                      finalAvailableQuantity: updatedListing.availableQuantity,
                      status: updatedListing.status
                    })
                  }
                } else {
                  console.log('✅ Inventory already up to date for:', listing.cropName)
                }
              }
            }
          } catch (inventoryError) {
            console.error('❌ Inventory update failed for completed transaction:', inventoryError)
          }
        }
      }

      return res.json({
        status: 'success',
        data: {
          transaction: transaction,
          order: orderData,
          message: 'Payment already verified'
        }
      })
    }

    // Check if this is a test mode payment
    const isTestMode = req.query.test_mode === 'true' || req.body?.test_mode === true
    
    if (isTestMode || !process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY === 'sk_test_your_secret_key_here') {
      console.log('🧪 Test mode: Simulating successful payment verification')
      
      // In test mode, always mark as successful
      const verificationData = {
        status: 'success',
        amount: transaction.amount * 100, // Convert to kobo
        reference: reference,
        gateway_response: 'Successful (Test Mode)',
        paid_at: new Date().toISOString(),
        channel: 'card',
        ip_address: req.ip,
        fees: Math.round(transaction.amount * 0.015), // 1.5% Paystack fee
        customer: {
          email: 'test@example.com',
          customer_code: 'CUS_TEST'
        }
      }
      
      console.log('✅ Test mode verification successful')
    } else {
      // Verify with Paystack API
      console.log('🔍 Verifying payment with Paystack API...')
      const paystackVerification = await verifyWithPaystackAPI(reference)
      
      if (!paystackVerification.success) {
        console.log('❌ Paystack verification failed:', paystackVerification.error)
        return res.status(400).json({ 
          status: 'error', 
          message: 'Payment verification failed: ' + paystackVerification.error 
        })
      }

      if (!paystackVerification.paid) {
        console.log('❌ Payment not successful according to Paystack')
        return res.status(400).json({ 
          status: 'error', 
          message: 'Payment was not successful' 
        })
      }

      console.log('✅ Paystack verification successful')
      
      const verificationData = {
        status: 'success',
        amount: paystackVerification.amount,
        reference: reference,
        gateway_response: 'Successful',
        paid_at: new Date().toISOString(),
        channel: paystackVerification.channel || 'card',
        ip_address: req.ip,
        fees: Math.round((paystackVerification.amount / 100) * 0.015), // 1.5% Paystack fee
        customer: paystackVerification.customer || {
          email: 'customer@example.com',
          customer_code: 'CUS_1234567890'
        }
      }
    }

    console.log('✅ Updating transaction to completed')

    // Update transaction status
    transaction.status = 'completed'
    transaction.paymentProviderReference = reference
    transaction.processedAt = new Date()
    transaction.metadata.verification = verificationData
    await transaction.save()

    // Update order status - with enhanced error handling
    let updatedOrder = null
    if (transaction.orderId) {
      const order = await Order.findById(transaction.orderId)
        .populate('items.listing', 'cropName availableQuantity quantity status')
      
      if (order) {
        console.log('📦 Updating order status to paid:', transaction.orderId)

        // Ensure we update both status and paymentStatus
        order.status = 'paid'
        order.paymentStatus = 'paid'
        order.paymentReference = reference
        await order.save()
        updatedOrder = order
        console.log('✅ Order status updated successfully')

        // Update inventory for each item in the order (always update on successful payment verification)
        try {
          console.log('📦 Updating inventory for paid order...')
          const Listing = require('../models/listing.model')
          
          // Populate the order items with listing details
          const populatedOrder = await Order.findById(order._id)
            .populate('items.listing', 'cropName availableQuantity quantity status updatedAt createdAt')
          
          for (const item of populatedOrder.items) {
            if (item.listing) {
              const listing = item.listing
              
              // Validate that we have enough stock before updating
              if (listing.availableQuantity < item.quantity) {
                console.error('❌ Insufficient stock for item:', {
                  listingId: listing._id,
                  cropName: listing.cropName,
                  availableQuantity: listing.availableQuantity,
                  orderedQuantity: item.quantity
                })
                continue // Skip this item but continue with others
              }
              
              const newAvailableQuantity = listing.availableQuantity - item.quantity
              
              console.log('🛒 Updating inventory for item:', {
                listingId: listing._id,
                cropName: listing.cropName,
                orderedQuantity: item.quantity,
                oldAvailableQuantity: listing.availableQuantity,
                newAvailableQuantity: newAvailableQuantity
              })

              // Use atomic update to prevent race conditions
              const updatedListing = await Listing.findByIdAndUpdate(
                listing._id, 
                {
                  $inc: { 
                    availableQuantity: -item.quantity
                  },
                  $set: {
                    status: newAvailableQuantity <= 0 ? 'sold_out' : listing.status,
                    soldOutAt: newAvailableQuantity <= 0 ? new Date() : null,
                    updatedAt: new Date()
                  }
                }, 
                { 
                  new: true,
                  runValidators: true
                }
              )

              if (!updatedListing) {
                console.error('❌ Failed to update listing:', listing._id)
                continue
              }

              console.log('✅ Inventory updated:', {
                listingId: listing._id,
                cropName: listing.cropName,
                finalAvailableQuantity: updatedListing.availableQuantity,
                finalTotalQuantity: updatedListing.quantity,
                status: updatedListing.status
              })
            }
          }
          
          console.log('✅ All inventory updates completed successfully')
        } catch (inventoryError) {
          console.error('❌ Inventory update failed:', inventoryError)
          // Don't fail the verification because of inventory errors, but log them
        }

        // Calculate and create commissions
        try {
          await this.createCommissions(order)
          console.log('✅ Commissions created successfully')
        } catch (commissionError) {
          console.error('❌ Commission creation failed:', commissionError)
          // Don't fail the verification because of commission errors
        }

        // Create notifications for successful payment
        try {
          // Notify buyer about successful payment
          await notificationController.createNotificationForActivity(
            order.buyer._id,
            'buyer',
            'financial',
            'paymentCompleted',
            {
              amount: order.total,
              orderNumber: order.orderNumber || order._id,
              actionUrl: `/dashboard/orders/${order._id}`
            }
          )

          // Notify farmers about payment received
          const populatedOrder = await Order.findById(order._id)
            .populate('items.listing', 'farmer cropName')
            .populate('buyer', 'name')

          for (const item of populatedOrder.items) {
            if (item.listing && item.listing.farmer) {
              await notificationController.createNotificationForActivity(
                item.listing.farmer,
                'farmer',
                'financial',
                'paymentReceived',
                {
                  amount: item.price * item.quantity,
                  orderNumber: order.orderNumber || order._id,
                  productName: item.listing.cropName,
                  buyerName: populatedOrder.buyer.name,
                  actionUrl: `/dashboard/orders/${order._id}`
                }
              )
            }
          }

          // Notify admins about payment completion
          await notificationController.notifyAdmins(
            'farmer',
            'paymentCompleted',
            {
              amount: order.total,
              orderNumber: order.orderNumber || order._id,
              buyerName: populatedOrder.buyer.name,
              actionUrl: `/admin/orders/${order._id}`
            }
          )

        } catch (notificationError) {
          console.error('❌ Payment notification failed:', notificationError)
          // Don't fail the verification because of notification errors
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
        order: updatedOrder,
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
    const userRole = req.user.role
    const { page = 1, limit = 20, type, status } = req.query

    let query = {}

    if (userRole === 'farmer') {
      // For farmers, show transactions where they are the seller
      // First, get all orders where farmer is seller
      const farmerOrders = await require('../models/order.model').find({ seller: userId }).select('_id')
      const orderIds = farmerOrders.map(order => order._id)

      // Also get all listings where farmer is the owner
      const farmerListings = await require('../models/listing.model').find({ farmer: userId }).select('_id')
      const listingIds = farmerListings.map(listing => listing._id)

      query = {
        $or: [
          { orderId: { $in: orderIds } }, // Transactions for orders where farmer is seller
          { listingId: { $in: listingIds } } // Transactions for listings where farmer is owner
        ]
      }
    } else {
      // For buyers, show their own transactions
      query = { userId: userId }
    }

    if (type) query.type = type
    if (status) query.status = status

    const transactions = await Transaction.find(query)
      .populate('orderId', 'total status buyer seller')
      .populate('listingId', 'cropName farmer')
      .populate('userId', 'name email') // Buyer info
      .populate('listingId.farmer', 'name email') // Farmer info
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
    console.error('Transaction history error:', error)
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
        // Verify with Paystack API to double-check
        console.log('🔍 Double-checking with Paystack API...')
        const paystackVerification = await verifyWithPaystackAPI(data.reference)
        
        if (!paystackVerification.success || !paystackVerification.paid) {
          console.log('❌ Paystack verification failed for webhook, skipping update')
          return res.json({ status: 'success', message: 'Webhook received but payment not verified' })
        }

        console.log('✅ Paystack verification confirmed, updating transaction')

        // Update transaction with comprehensive data
        tx.status = 'completed'
        tx.paymentProviderReference = data.reference
        tx.processedAt = new Date()
        tx.metadata = {
          ...tx.metadata,
          webhook: data,
          webhookProcessedAt: new Date(),
          webhookEvent: event,
          paystackVerification: paystackVerification
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

            // Update inventory for each item in the order (always update on successful payment)
            try {
              console.log('📦 Webhook: Updating inventory for paid order...')
              const Listing = require('../models/listing.model')
              
              // Populate the order items with listing details
              const populatedOrder = await Order.findById(order._id)
                .populate('items.listing', 'cropName availableQuantity quantity status updatedAt createdAt')
              
              for (const item of populatedOrder.items) {
                if (item.listing) {
                  const listing = item.listing
                  
                  // Validate that we have enough stock before updating
                  if (listing.availableQuantity < item.quantity) {
                    console.error('❌ Webhook: Insufficient stock for item:', {
                      listingId: listing._id,
                      cropName: listing.cropName,
                      availableQuantity: listing.availableQuantity,
                      orderedQuantity: item.quantity
                    })
                    continue // Skip this item but continue with others
                  }
                  
                  const newAvailableQuantity = listing.availableQuantity - item.quantity
                  
                  console.log('🛒 Webhook: Updating inventory for item:', {
                    listingId: listing._id,
                    cropName: listing.cropName,
                    orderedQuantity: item.quantity,
                    oldAvailableQuantity: listing.availableQuantity,
                    newAvailableQuantity: newAvailableQuantity
                  })

                  // Use atomic update to prevent race conditions
                  const updatedListing = await Listing.findByIdAndUpdate(
                    listing._id, 
                    {
                      $inc: { 
                        availableQuantity: -item.quantity
                      },
                      $set: {
                        status: newAvailableQuantity <= 0 ? 'sold_out' : listing.status,
                        soldOutAt: newAvailableQuantity <= 0 ? new Date() : null,
                        updatedAt: new Date()
                      }
                    }, 
                    { 
                      new: true,
                      runValidators: true
                    }
                  )

                  if (!updatedListing) {
                    console.error('❌ Webhook: Failed to update listing:', listing._id)
                    continue
                  }

                  console.log('✅ Webhook: Inventory updated:', {
                    listingId: listing._id,
                    cropName: listing.cropName,
                    finalAvailableQuantity: updatedListing.availableQuantity,
                    finalTotalQuantity: updatedListing.quantity,
                    status: updatedListing.status
                  })
                }
              }
              
              console.log('✅ Webhook: All inventory updates completed successfully')
            } catch (inventoryError) {
              console.error('❌ Webhook: Inventory update failed:', inventoryError)
              // Don't fail the webhook because of inventory errors, but log them
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
    console.log('🔄 syncOrderStatus endpoint hit')
    console.log('📋 Request params:', req.params)
    console.log('👤 Request user:', req.user?.id || 'No user')
    
    const { orderId } = req.params

    if (!orderId) {
      console.log('❌ No orderId provided')
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

// Helper function to initialize payment with Paystack API
async function initializePaystackPayment(paymentData) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }

    const postData = JSON.stringify(paymentData)

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => data += chunk)

      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          console.log('📊 Paystack Initialize Response:', response)
          
          if (response.status && response.data) {
            resolve({
              success: true,
              authorization_url: response.data.authorization_url,
              access_code: response.data.access_code,
              reference: response.data.reference
            })
          } else {
            resolve({
              success: false,
              error: response.message || 'Payment initialization failed'
            })
          }
        } catch (error) {
          console.error('❌ Paystack initialization response parsing error:', error)
          resolve({
            success: false,
            error: 'Invalid response from Paystack'
          })
        }
      })
    })

    req.on('error', (error) => {
      console.error('❌ Paystack initialization request error:', error)
      resolve({
        success: false,
        error: error.message
      })
    })

    req.setTimeout(10000, () => {
      req.destroy()
      resolve({
        success: false,
        error: 'Paystack API timeout'
      })
    })

    req.write(postData)
    req.end()
  })
}

// Helper function to verify payment with Paystack API
async function verifyWithPaystackAPI(reference) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => data += chunk)

      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          console.log('📊 Paystack API Response:', response)
          
          if (response.status && response.data) {
            resolve({
              success: true,
              paid: response.data.status === 'success',
              status: response.data.status,
              amount: response.data.amount,
              reference: response.data.reference,
              channel: response.data.channel,
              customer: response.data.customer,
              paid_at: response.data.paid_at
            })
          } else {
            resolve({
              success: false,
              error: response.message || 'Verification failed'
            })
          }
        } catch (error) {
          console.error('❌ Paystack API response parsing error:', error)
          resolve({
            success: false,
            error: 'Invalid response from Paystack'
          })
        }
      })
    })

    req.on('error', (error) => {
      console.error('❌ Paystack API request error:', error)
      resolve({
        success: false,
        error: error.message
      })
    })

    req.setTimeout(10000, () => {
      req.destroy()
      resolve({
        success: false,
        error: 'Paystack API timeout'
      })
    })

    req.end()
  })
}