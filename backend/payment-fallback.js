// PAYMENT FALLBACK SYSTEM
// Alternative payment verification without webhooks
const mongoose = require('mongoose')
const https = require('https')

class PaymentFallback {
  constructor() {
    this.paystackSecret = process.env.PAYSTACK_SECRET_KEY
  }

  // Verify payment with Paystack API directly
  async verifyPaymentWithPaystack(reference) {
    return new Promise((resolve, reject) => {
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
              const paymentData = response.data

              resolve({
                success: true,
                status: paymentData.status,
                reference: paymentData.reference,
                amount: paymentData.amount,
                paid: paymentData.status === 'success',
                customer: paymentData.customer,
                metadata: paymentData.metadata
              })
            } else {
              resolve({
                success: false,
                error: response.message || 'Unknown error'
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

  // Fallback payment verification system
  async fallbackPaymentVerification() {
    try {
      console.log('🔄 RUNNING PAYMENT FALLBACK VERIFICATION')
      console.log('=' .repeat(50))

      await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })

      console.log('✅ Connected to database')

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

      // Find pending transactions
      const pendingTransactions = await Transaction.find({
        status: 'pending',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).limit(10)

      console.log(`📦 Found ${pendingTransactions.length} pending transactions to verify`)

      let verifiedCount = 0

      for (const transaction of pendingTransactions) {
        console.log(`\n🔍 Verifying transaction: ${transaction.reference}`)

        // Verify with Paystack
        const verification = await this.verifyPaymentWithPaystack(transaction.reference)

        if (verification.success && verification.paid) {
          console.log('✅ Payment verified as successful!')

          // Update transaction
          transaction.status = 'completed'
          transaction.processedAt = new Date()
          transaction.metadata = {
            ...transaction.metadata,
            fallbackVerified: true,
            paystackData: verification,
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

            console.log('✅ Order updated to paid!')
            verifiedCount++
          }
        } else {
          console.log(`❌ Payment not verified: ${verification.error || 'Unknown status'}`)
        }
      }

      console.log(`\n📊 FALLBACK VERIFICATION COMPLETE:`)
      console.log(`✅ Payments verified: ${verifiedCount}`)
      console.log(`📦 Total checked: ${pendingTransactions.length}`)

      if (verifiedCount > 0) {
        console.log('\n🎉 Success! Pending payments have been verified and updated.')
      }

    } catch (error) {
      console.error('❌ Fallback verification failed:', error.message)
    } finally {
      await mongoose.disconnect()
    }
  }

  // Manual verification for specific reference
  async verifySpecificPayment(reference) {
    try {
      console.log(`🔍 Verifying payment: ${reference}`)

      const verification = await this.verifyPaymentWithPaystack(reference)

      if (verification.success) {
        console.log('📊 Payment Status:', verification.status)
        console.log('💰 Amount:', verification.amount / 100) // Convert from kobo
        console.log('👤 Customer:', verification.customer?.email)
        console.log('✅ Paid:', verification.paid ? 'YES' : 'NO')

        return verification
      } else {
        console.log('❌ Verification failed:', verification.error)
        return null
      }
    } catch (error) {
      console.error('❌ Error:', error.message)
      return null
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const fallback = new PaymentFallback()

  if (args.length === 0) {
    console.log('🔄 Running payment fallback verification...')
    await fallback.fallbackPaymentVerification()
  } else if (args[0] === 'verify' && args[1]) {
    const reference = args[1]
    console.log(`🔍 Verifying specific payment: ${reference}`)
    await fallback.verifySpecificPayment(reference)
  } else {
    console.log('Usage:')
    console.log('  node payment-fallback.js              # Run fallback verification')
    console.log('  node payment-fallback.js verify <ref> # Verify specific reference')
  }
}

// Export for use as module
module.exports = PaymentFallback

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}
