// Automated webhook health check and auto-fix system
const mongoose = require('mongoose')
const http = require('http')

class WebhookAutoFix {
  constructor() {
    this.dbConnected = false
    this.models = {}
  }

  async connectDB() {
    try {
      await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      })
      this.dbConnected = true

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

      this.models.Order = mongoose.model('Order', OrderSchema, 'orders')
      this.models.Transaction = mongoose.model('Transaction', TransactionSchema, 'transactions')

      console.log('✅ Database connected')
    } catch (error) {
      console.error('❌ Database connection failed:', error.message)
      this.dbConnected = false
    }
  }

  async testWebhookEndpoint() {
    return new Promise((resolve) => {
      const webhookUrl = 'http://localhost:5000/api/payments/verify'
      const testData = {
        event: 'charge.success',
        data: {
          id: Math.floor(Math.random() * 1000000),
          reference: `AUTO_TEST_${Date.now()}`,
          amount: 10000,
          currency: 'NGN',
          status: 'success',
          paid_at: new Date().toISOString(),
          customer: { email: 'autotest@example.com' },
          metadata: { autoTest: true }
        }
      }

      const postData = JSON.stringify(testData)

      try {
        const urlObj = new URL(webhookUrl)
        const options = {
          hostname: urlObj.hostname,
          port: urlObj.port,
          path: urlObj.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        }

        const req = http.request(options, (res) => {
          let data = ''
          res.on('data', (chunk) => data += chunk)
          res.on('end', () => {
            resolve({
              reachable: true,
              statusCode: res.statusCode,
              response: data
            })
          })
        })

        req.on('error', (error) => {
          resolve({
            reachable: false,
            error: error.message
          })
        })

        req.setTimeout(5000, () => {
          req.destroy()
          resolve({
            reachable: false,
            error: 'Request timeout'
          })
        })

        req.write(postData)
        req.end()

      } catch (error) {
        resolve({
          reachable: false,
          error: error.message
        })
      }
    })
  }

  async analyzePaymentHealth() {
    if (!this.dbConnected) {
      console.log('❌ Database not connected')
      return null
    }

    try {
      const totalOrders = await this.models.Order.countDocuments()
      const pendingOrders = await this.models.Order.countDocuments({
        $or: [{ status: 'pending' }, { paymentStatus: 'pending' }]
      })
      const completedOrders = await this.models.Order.countDocuments({
        status: 'paid',
        paymentStatus: 'paid'
      })
      const completedTransactions = await this.models.Transaction.countDocuments({
        status: 'completed'
      })

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        completedTransactions,
        pendingPercentage: ((pendingOrders / totalOrders) * 100).toFixed(1),
        healthScore: completedTransactions > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0.0'
      }
    } catch (error) {
      console.error('❌ Health analysis failed:', error.message)
      return null
    }
  }

  async autoFixPendingOrders() {
    if (!this.dbConnected) {
      console.log('❌ Database not connected')
      return 0
    }

    try {
      const pendingOrders = await this.models.Order.find({
        $or: [
          { status: 'pending' },
          { paymentStatus: 'pending' }
        ]
      }).limit(10) // Process in batches

      let fixedCount = 0

      for (const order of pendingOrders) {
        try {
          // Check if there's a completed transaction
          const transaction = await this.models.Transaction.findOne({
            orderId: order._id,
            status: 'completed'
          })

          if (transaction) {
            // Fix the order
            order.status = 'paid'
            order.paymentStatus = 'paid'
            order.paymentReference = transaction.reference
            await order.save()

            console.log(`✅ Auto-fixed order: ${order._id}`)
            fixedCount++
          }
        } catch (error) {
          console.error(`❌ Error fixing order ${order._id}:`, error.message)
        }
      }

      return fixedCount
    } catch (error) {
      console.error('❌ Auto-fix failed:', error.message)
      return 0
    }
  }

  async runHealthCheck() {
    console.log('\n🔍 WEBHOOK HEALTH CHECK')
    console.log('=' .repeat(40))

    // Test webhook endpoint
    console.log('\n1️⃣ Testing webhook endpoint...')
    const endpointTest = await this.testWebhookEndpoint()

    if (endpointTest.reachable) {
      console.log(`✅ Endpoint reachable: ${endpointTest.statusCode}`)
    } else {
      console.log(`❌ Endpoint not reachable: ${endpointTest.error}`)
    }

    // Analyze payment health
    console.log('\n2️⃣ Analyzing payment health...')
    const health = await this.analyzePaymentHealth()

    if (health) {
      console.log(`📊 Total orders: ${health.totalOrders}`)
      console.log(`⏳ Pending orders: ${health.pendingOrders} (${health.pendingPercentage}%)`)
      console.log(`✅ Completed orders: ${health.completedOrders}`)
      console.log(`💳 Completed transactions: ${health.completedTransactions}`)
      console.log(`🏥 Health score: ${health.healthScore}%`)

      if (parseFloat(health.healthScore) < 50) {
        console.log('\n⚠️ HEALTH ALERT: Low webhook success rate!')
        console.log('💡 Recommended: Configure Paystack webhook URL')
      }
    }

    // Auto-fix if needed
    if (health && health.pendingOrders > 0) {
      console.log('\n3️⃣ Running auto-fix...')
      const fixedCount = await this.autoFixPendingOrders()

      if (fixedCount > 0) {
        console.log(`✅ Auto-fixed ${fixedCount} orders`)
      } else {
        console.log('ℹ️ No orders needed fixing')
      }
    }

    console.log('\n' + '=' .repeat(40))
  }

  async cleanup() {
    if (this.dbConnected) {
      await mongoose.disconnect()
      console.log('🔌 Database disconnected')
    }
  }
}

// Main execution
async function main() {
  const fixer = new WebhookAutoFix()

  try {
    await fixer.connectDB()
    await fixer.runHealthCheck()

    console.log('\n📋 RECOMMENDATIONS:')
    console.log('1. Configure webhook in Paystack dashboard if not done')
    console.log('2. Run this health check regularly')
    console.log('3. Monitor webhook delivery logs in Paystack')

  } catch (error) {
    console.error('❌ Health check failed:', error.message)
  } finally {
    await fixer.cleanup()
  }
}

// Export for use as module
module.exports = WebhookAutoFix

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}
