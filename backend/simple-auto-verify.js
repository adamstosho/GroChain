// SIMPLE AUTO-VERIFICATION (Fixed)
// Fixes the mongoose model issue and provides clean auto-verification
const mongoose = require('mongoose')
const https = require('https')

// Clear any existing models to prevent compilation errors
delete mongoose.models.Order
delete mongoose.models.Transaction

class SimpleAutoVerifier {
  constructor() {
    this.isRunning = false
    this.intervalId = null
    this.paystackSecret = process.env.PAYSTACK_SECRET_KEY
  }

  async connectDB() {
    if (mongoose.connection.readyState === 1) {
      return // Already connected
    }

    await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  }

  async verifyPendingPayments() {
    try {
      await this.connectDB()

      // Get collections directly to avoid model compilation issues
      const ordersCollection = mongoose.connection.collection('orders')
      const transactionsCollection = mongoose.connection.collection('transactions')

      // Find recent pending transactions (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const pendingTransactions = await transactionsCollection.find({
        status: 'pending',
        createdAt: { $gte: fiveMinutesAgo }
      }).limit(10).toArray()

      if (pendingTransactions.length === 0) {
        return
      }

      console.log(`🔍 Found ${pendingTransactions.length} recent pending transactions`)

      let verifiedCount = 0

      for (const transaction of pendingTransactions) {
        // Verify with Paystack
        const verification = await this.verifyWithPaystack(transaction.reference)

        if (verification.success && verification.paid) {
          console.log(`✅ Payment verified: ${transaction.reference}`)

          // Update transaction
          await transactionsCollection.updateOne(
            { _id: transaction._id },
            {
              $set: {
                status: 'completed',
                processedAt: new Date(),
                'metadata.autoVerified': true,
                'metadata.verifiedAt': new Date()
              }
            }
          )

          // Update order
          await ordersCollection.updateOne(
            { _id: transaction.orderId },
            {
              $set: {
                status: 'paid',
                paymentStatus: 'paid',
                paymentReference: transaction.reference
              }
            }
          )

          console.log(`🎉 Order ${transaction.orderId} updated to PAID!`)
          verifiedCount++
        }
      }

      if (verifiedCount > 0) {
        console.log(`✅ Auto-verified ${verifiedCount} payments`)
      }

    } catch (error) {
      console.error('❌ Auto-verification error:', error.message)
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
        res.on('data', (chunk) => data += chunk)
        res.on('end', () => {
          try {
            const response = JSON.parse(data)
            if (response.status && response.data) {
              resolve({
                success: true,
                paid: response.data.status === 'success',
                status: response.data.status
              })
            } else {
              resolve({ success: false, error: response.message })
            }
          } catch (error) {
            resolve({ success: false, error: 'Invalid response' })
          }
        })
      })

      req.on('error', (error) => {
        resolve({ success: false, error: error.message })
      })

      req.setTimeout(8000, () => {
        req.destroy()
        resolve({ success: false, error: 'Timeout' })
      })

      req.end()
    })
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
    }, 30000)

    console.log('✅ Auto-verification system active')
    console.log('🔄 Checking for new payments every 30 seconds')
  }

  async stopAutoVerification() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('🛑 Auto-verification stopped')
    await mongoose.disconnect()
  }
}

// Export and run
const verifier = new SimpleAutoVerifier()

async function main() {
  try {
    console.log('🚀 SIMPLE AUTO-VERIFICATION SERVICE')
    console.log('=' .repeat(50))
    
    await verifier.startAutoVerification()
    
    console.log('\n✅ SERVICE ACTIVE!')
    console.log('🔄 Monitoring payments every 30 seconds')
    console.log('💡 All successful payments will show as "paid"')
    console.log('\n🛑 Press Ctrl+C to stop')
    
    // Keep process running
    process.stdin.resume()
    
  } catch (error) {
    console.error('❌ Failed to start service:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...')
  await verifier.stopAutoVerification()
  process.exit(0)
})

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = SimpleAutoVerifier
