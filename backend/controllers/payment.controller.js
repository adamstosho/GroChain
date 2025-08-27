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
    
    if (order.buyer.email !== email) {
      return res.status(400).json({ status: 'error', message: 'Email mismatch' })
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
    
    // Initialize Paystack payment
    const paystackData = {
      email: email,
      amount: Math.round(amount * 100), // Convert to kobo
      reference: reference,
      callback_url: callbackUrl || `${process.env.FRONTEND_URL}/payment/verify`,
      metadata: {
        order_id: orderId,
        transaction_id: transaction._id.toString()
      }
    }
    
    // In a real implementation, you would make an API call to Paystack here
    // For now, we'll simulate the response
    const paystackResponse = {
      authorization_url: `${process.env.FRONTEND_URL}/payment/verify?reference=${reference}`,
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
    
    const transaction = await Transaction.findOne({ reference: reference })
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' })
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
    
    // Update transaction status
    transaction.status = 'completed'
    transaction.paymentProviderReference = reference
    transaction.processedAt = new Date()
    transaction.metadata.verification = verificationData
    await transaction.save()
    
    // Update order status
    const order = await Order.findById(transaction.orderId)
    if (order) {
      order.status = 'paid'
      await order.save()
      
      // Calculate and create commissions
      await this.createCommissions(order)
    }
    
    return res.json({
      status: 'success',
      data: {
        transaction: transaction,
        verification: verificationData
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
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
