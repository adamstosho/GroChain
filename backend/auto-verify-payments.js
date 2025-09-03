// AUTO PAYMENT VERIFICATION SYSTEM
// Automatically verifies and updates payment status for new payments
const mongoose = require('mongoose')
const https = require('https')

class AutoPaymentVerifier {
  constructor() {
    this.paystackSecret = process.env.PAYSTACK_SECRET_KEY
    this.isRunning = false
  }

  async startAutoVerification() {
    if (this.isRunning) {
      console.log('🔄 Auto-verification already running')
      return
    }

    this.isRunning = true
    console.log('🚀 Starting automatic payment verification...')

    // Run initial verification
    await this.verifyPendingPayments()

    // Set up periodic verification (every 30 seconds)
    this.intervalId = setInterval(async () => {
      try {
        await this.verifyPendingPayments()
      } catch (error) {
        console.error('❌ Auto-verification error:', error.message)
      }
    }, 30000) // 30 seconds

    console.log('✅ Auto-verification system active')
    console.log('🔄 Checking for new payments every 30 seconds')
  }

  async stopAutoVerification() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    this.isRunning = false
    console.log('🛑 Auto-verification stopped')
  }

  async verifyPendingPayments() {
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
        buyer: mongoose.Schema.Types.ObjectId,
        createdAt: Date
      }, { timestamps: true })

      const TransactionSchema = new mongoose.Schema({
        orderId: mongoose.Schema.Types.ObjectId,
        status: String,
        reference: String,
        amount: Number,
        paymentProvider: String,
        processedAt: Date,
        metadata: Object,
        createdAt: Date
      }, { timestamps: true })

      const Order = mongoose.model('Order', OrderSchema, 'orders')
      const Transaction = mongoose.model('Transaction', TransactionSchema, 'transactions')

      // Find recent pending transactions (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const pendingTransactions = await Transaction.find({
        status: 'pending',
        createdAt: { $gte: fiveMinutesAgo }
      }).limit(10)

      if (pendingTransactions.length === 0) {
        return // No pending transactions to check
      }

      console.log(`🔍 Found ${pendingTransactions.length} recent pending transactions`)

      let verifiedCount = 0

      for (const transaction of pendingTransactions) {
        // Check if payment was successful with Paystack
        const verification = await this.verifyWithPaystack(transaction.reference)

        if (verification.success && verification.paid) {
          console.log(`✅ Payment verified: ${transaction.reference}`)

          // Update transaction
          transaction.status = 'completed'
          transaction.processedAt = new Date()
          transaction.metadata = {
            ...transaction.metadata,
            autoVerified: true,
            paystackVerification: verification,
            verifiedAt: new Date()
          }
          await transaction.save()

          // Update order
          const order = await Order.findById(transaction.orderId)
          if (order && order.status !== 'paid') {
            order.status = 'paid'
            order.paymentStatus = 'paid'
            order.paymentReference = transaction.reference
            await order.save()

            console.log(`🎉 Order ${order._id} updated to PAID!`)
            verifiedCount++
          }
        }
      }

      if (verifiedCount > 0) {
        console.log(`✅ Auto-verified ${verifiedCount} payments`)
      }

    } catch (error) {
      console.error('❌ Auto-verification error:', error.message)
    } finally {
      await mongoose.disconnect()
    }
  }

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

      req.setTimeout(8000, () => {
        req.destroy()
        resolve({
          success: false,
          error: 'Request timeout'
        })
      })

      req.end()
    })
  }

  // Manual verification for specific reference
  async verifySpecificPayment(reference) {
    try {
      console.log(`🔍 Manually verifying payment: ${reference}`)

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

      // Find transaction
      const transaction = await Transaction.findOne({ reference })
      if (!transaction) {
        console.log('❌ Transaction not found')
        return { success: false, message: 'Transaction not found' }
      }

      // Verify with Paystack
      const verification = await this.verifyWithPaystack(reference)

      if (verification.success && verification.paid) {
        // Update transaction
        transaction.status = 'completed'
        transaction.processedAt = new Date()
        await transaction.save()

        // Update order
        const order = await Order.findById(transaction.orderId)
        if (order) {
          order.status = 'paid'
          order.paymentStatus = 'paid'
          order.paymentReference = reference
          await order.save()
        }

        console.log('✅ Payment verified and updated!')
        return {
          success: true,
          message: 'Payment verified and updated',
          data: { orderId: order?._id, status: 'paid' }
        }
      } else {
        console.log('❌ Payment not verified:', verification.error)
        return { success: false, message: verification.error }
      }

    } catch (error) {
      console.error('❌ Manual verification error:', error.message)
      return { success: false, message: error.message }
    } finally {
      await mongoose.disconnect()
    }
  }
}

// Main execution and export
let autoVerifier = null

async function startAutoVerification() {
  if (!autoVerifier) {
    autoVerifier = new AutoPaymentVerifier()
  }
  await autoVerifier.startAutoVerification()
}

async function stopAutoVerification() {
  if (autoVerifier) {
    await autoVerifier.stopAutoVerification()
    autoVerifier = null
  }
}

async function manualVerification(reference) {
  if (!autoVerifier) {
    autoVerifier = new AutoPaymentVerifier()
  }
  return await autoVerifier.verifySpecificPayment(reference)
}

module.exports = {
  AutoPaymentVerifier,
  startAutoVerification,
  stopAutoVerification,
  manualVerification
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2)

  if (args[0] === 'start') {
    console.log('🚀 Starting auto-verification service...')
    startAutoVerification().catch(console.error)
  } else if (args[0] === 'stop') {
    console.log('🛑 Stopping auto-verification service...')
    stopAutoVerification().catch(console.error)
  } else if (args[0] === 'verify' && args[1]) {
    const reference = args[1]
    console.log(`🔍 Verifying payment: ${reference}`)
    manualVerification(reference).then(result => {
      console.log('Result:', result)
    }).catch(console.error)
  } else {
    console.log('Usage:')
    console.log('  node auto-verify-payments.js start    # Start auto-verification')
    console.log('  node auto-verify-payments.js stop     # Stop auto-verification')
    console.log('  node auto-verify-payments.js verify <ref> # Verify specific payment')
  }
}
