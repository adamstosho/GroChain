// PAYMENT VERIFICATION SERVICE
// Can be called from frontend to verify payment status
const mongoose = require('mongoose')
const https = require('https')

class PaymentVerifier {
  constructor() {
    this.paystackSecret = process.env.PAYSTACK_SECRET_KEY
  }

  // Verify payment and update database
  async verifyAndUpdatePayment(reference) {
    try {
      console.log(`🔍 Verifying payment: ${reference}`)

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

        return {
          success: true,
          message: 'Payment verified and updated',
          data: {
            orderId: order?._id,
            status: 'paid',
            reference: reference
          }
        }
      } else {
        return {
          success: false,
          message: verification.error || 'Payment not verified'
        }
      }

    } catch (error) {
      console.error('❌ Verification error:', error.message)
      return { success: false, message: error.message }
    } finally {
      await mongoose.disconnect()
    }
  }

  // Verify with Paystack API
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

        res.on('data', (chunk) => data += chunk)

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
              error: 'Invalid response'
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
          error: 'Timeout'
        })
      })

      req.end()
    })
  }
}

// Express route handler
async function verifyPaymentHandler(req, res) {
  try {
    const { reference } = req.params

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Reference is required'
      })
    }

    const verifier = new PaymentVerifier()
    const result = await verifier.verifyAndUpdatePayment(reference)

    res.json(result)

  } catch (error) {
    console.error('❌ Payment verification handler error:', error)
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    })
  }
}

module.exports = { PaymentVerifier, verifyPaymentHandler }

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2)

  if (args[0] === 'verify' && args[1]) {
    const reference = args[1]
    const verifier = new PaymentVerifier()
    verifier.verifyAndUpdatePayment(reference).then(result => {
      console.log('Result:', result)
      process.exit(0)
    }).catch(error => {
      console.error('Error:', error)
      process.exit(1)
    })
  } else {
    console.log('Usage: node payment-verifier.js verify <reference>')
  }
}
