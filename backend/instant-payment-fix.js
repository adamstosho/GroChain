// INSTANT PAYMENT STATUS FIX FOR NEW PAYMENTS
// This ensures new payments show as "paid" immediately
const mongoose = require('mongoose')
const https = require('https')

class InstantPaymentFix {
  constructor() {
    this.paystackSecret = process.env.PAYSTACK_SECRET_KEY
  }

  // Express route handler for instant verification
  async instantVerifyHandler(req, res) {
    try {
      const { reference } = req.body

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Payment reference is required'
        })
      }

      console.log(`🔍 Instant verification for: ${reference}`)

      const result = await this.verifyAndUpdatePayment(reference)

      if (result.success) {
        res.json({
          success: true,
          message: 'Payment verified successfully',
          data: result.data
        })
      } else {
        res.json({
          success: false,
          message: result.message
        })
      }

    } catch (error) {
      console.error('❌ Instant verification error:', error)
      res.status(500).json({
        success: false,
        message: 'Verification failed'
      })
    }
  }

  // Core verification logic
  async verifyAndUpdatePayment(reference) {
    try {
      await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })

      // Define schemas
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

      // Find transaction by reference
      const transaction = await Transaction.findOne({ reference })
      if (!transaction) {
        return { success: false, message: 'Transaction not found' }
      }

      // If already completed, return success
      if (transaction.status === 'completed') {
        const order = await Order.findById(transaction.orderId)
        return {
          success: true,
          message: 'Payment already verified',
          data: {
            orderId: order?._id,
            status: order?.status || 'unknown',
            paymentStatus: order?.paymentStatus || 'unknown'
          }
        }
      }

      // Verify with Paystack
      const verification = await this.verifyWithPaystack(reference)

      if (verification.success && verification.paid) {
        // Update transaction
        transaction.status = 'completed'
        transaction.processedAt = new Date()
        transaction.metadata = {
          ...transaction.metadata,
          instantVerified: true,
          paystackData: verification,
          verifiedAt: new Date()
        }
        await transaction.save()

        // Update order
        const order = await Order.findById(transaction.orderId)
        if (order) {
          order.status = 'paid'
          order.paymentStatus = 'paid'
          order.paymentReference = reference
          await order.save()
        }

        return {
          success: true,
          message: 'Payment verified and updated to paid',
          data: {
            orderId: order?._id,
            status: 'paid',
            paymentStatus: 'paid',
            paymentReference: reference
          }
        }
      } else {
        return {
          success: false,
          message: verification.error || 'Payment verification failed'
        }
      }

    } catch (error) {
      console.error('❌ Verification error:', error.message)
      return { success: false, message: error.message }
    } finally {
      await mongoose.disconnect()
    }
  }

  // Verify payment with Paystack
  async verifyWithPaystack(reference) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: `/transaction/verify/${reference}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.paystackSecret}`,
          'Content-Type': 'application/json'
        }
      }

      const req = https.request(options, (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          try {
            const response = JSON.parse(data)
            if (response.status && response.data) {
              resolve({
                success: true,
                paid: response.data.status === 'success',
                status: response.data.status,
                amount: response.data.amount,
                reference: response.data.reference
              })
            } else {
              resolve({
                success: false,
                error: response.message || 'Verification failed'
              })
            }
          } catch (error) {
            resolve({
              success: false,
              error: 'Invalid response format'
            })
          }
        })
      })

      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message
        })
      })

      req.setTimeout(10000, () => {
        req.destroy()
        resolve({
          success: false,
          error: 'Request timeout'
        })
      })

      req.end()
    })
  }

  // Batch verification for multiple references
  async batchVerifyPayments(references) {
    const results = []

    for (const reference of references) {
      try {
        const result = await this.verifyAndUpdatePayment(reference)
        results.push({
          reference,
          ...result
        })
      } catch (error) {
        results.push({
          reference,
          success: false,
          message: error.message
        })
      }
    }

    return results
  }
}

// Export class and create instance
const instantFix = new InstantPaymentFix()

// Express route handler
async function instantVerifyHandler(req, res) {
  return await instantFix.instantVerifyHandler(req, res)
}

// Batch verification handler
async function batchVerifyHandler(req, res) {
  try {
    const { references } = req.body

    if (!Array.isArray(references) || references.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'References array is required'
      })
    }

    console.log(`🔍 Batch verifying ${references.length} payments`)

    const results = await instantFix.batchVerifyPayments(references)

    const successCount = results.filter(r => r.success).length

    res.json({
      success: true,
      message: `Verified ${successCount}/${references.length} payments`,
      results
    })

  } catch (error) {
    console.error('❌ Batch verification error:', error)
    res.status(500).json({
      success: false,
      message: 'Batch verification failed'
    })
  }
}

module.exports = {
  InstantPaymentFix,
  instantVerifyHandler,
  batchVerifyHandler
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2)

  if (args[0] === 'verify' && args[1]) {
    const reference = args[1]
    console.log(`🔍 Verifying payment: ${reference}`)
    instantFix.verifyAndUpdatePayment(reference).then(result => {
      console.log('Result:', JSON.stringify(result, null, 2))
    }).catch(console.error)
  } else if (args[0] === 'batch' && args.length > 1) {
    const references = args.slice(1)
    console.log(`🔍 Batch verifying ${references.length} payments`)
    instantFix.batchVerifyPayments(references).then(results => {
      console.log('Results:', JSON.stringify(results, null, 2))
    }).catch(console.error)
  } else {
    console.log('Usage:')
    console.log('  node instant-payment-fix.js verify <reference>')
    console.log('  node instant-payment-fix.js batch <ref1> <ref2> ...')
  }
}
