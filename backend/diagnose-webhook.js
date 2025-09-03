// Comprehensive webhook diagnostic tool
const mongoose = require('mongoose')
const http = require('http')

async function diagnoseWebhookIssues() {
  console.log('🔍 WEBHOOK DIAGNOSTIC REPORT')
  console.log('=' .repeat(50))

  // Step 1: Check environment configuration
  console.log('\n1️⃣ ENVIRONMENT CONFIGURATION:')
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'development')
  console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:3000')
  console.log('- WEBHOOK_URL:', process.env.WEBHOOK_URL || 'Not set')

  const expectedWebhookUrl = process.env.NODE_ENV === 'production'
    ? `${process.env.WEBHOOK_URL || 'https://your-domain.com/api'}/payments/verify`
    : 'http://localhost:5000/api/payments/verify'

  console.log('- Expected Webhook URL:', expectedWebhookUrl)

  // Step 2: Test webhook endpoint accessibility
  console.log('\n2️⃣ WEBHOOK ENDPOINT TEST:')
  await testWebhookEndpoint(expectedWebhookUrl)

  // Step 3: Check database for payment patterns
  console.log('\n3️⃣ DATABASE ANALYSIS:')
  await analyzePaymentData()

  // Step 4: Provide recommendations
  console.log('\n4️⃣ RECOMMENDATIONS:')
  provideRecommendations(expectedWebhookUrl)

  console.log('\n' + '=' .repeat(50))
  console.log('🔍 DIAGNOSTIC COMPLETE')
}

async function testWebhookEndpoint(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url)
      const testData = {
        event: 'charge.success',
        data: {
          id: 12345,
          reference: 'DIAGNOSTIC_TEST_' + Date.now(),
          amount: 10000,
          status: 'success',
          customer: { email: 'test@example.com' },
          metadata: { test: true }
        }
      }

      const postData = JSON.stringify(testData)
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

      console.log(`Testing endpoint: ${url}`)
      console.log('Sending test payload...')

      const req = http.request(options, (res) => {
        console.log(`✅ Endpoint reachable: ${res.statusCode}`)
        let data = ''
        res.on('data', (chunk) => data += chunk)
        res.on('end', () => {
          console.log('Response:', data.substring(0, 100) + '...')
          resolve(true)
        })
      })

      req.on('error', (error) => {
        console.log(`❌ Endpoint not reachable: ${error.message}`)
        console.log('💡 Make sure your backend server is running on the correct port')
        resolve(false)
      })

      req.setTimeout(5000, () => {
        console.log('❌ Request timeout - endpoint may be down')
        req.destroy()
        resolve(false)
      })

      req.write(postData)
      req.end()

    } catch (error) {
      console.log(`❌ Invalid URL format: ${error.message}`)
      resolve(false)
    }
  })
}

async function analyzePaymentData() {
  try {
    await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    })

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

    // Check recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)

    console.log(`Found ${recentOrders.length} recent orders:`)

    for (const order of recentOrders) {
      const transaction = await Transaction.findOne({ orderId: order._id })
      const status = transaction ? transaction.status : 'No transaction'

      console.log(`- Order ${order._id.toString().slice(-8)}: ${order.status}/${order.paymentStatus} | TX: ${status}`)
    }

    // Count pending orders
    const pendingCount = await Order.countDocuments({
      $or: [{ status: 'pending' }, { paymentStatus: 'pending' }]
    })

    const completedTxCount = await Transaction.countDocuments({ status: 'completed' })

    console.log(`\n📊 Summary:`)
    console.log(`- Pending orders: ${pendingCount}`)
    console.log(`- Completed transactions: ${completedTxCount}`)

    if (pendingCount > 0 && completedTxCount === 0) {
      console.log('⚠️ ISSUE DETECTED: Orders are pending but no transactions are completed')
      console.log('💡 This suggests webhooks are not being processed')
    }

    await mongoose.disconnect()

  } catch (error) {
    console.log(`❌ Database analysis failed: ${error.message}`)
  }
}

function provideRecommendations(webhookUrl) {
  console.log('🔧 REQUIRED ACTIONS:')

  console.log('\n1. Paystack Dashboard Configuration:')
  console.log(`   - Go to https://dashboard.paystack.com/settings/webhooks`)
  console.log(`   - Add webhook URL: ${webhookUrl}`)
  console.log(`   - Select events: charge.success, charge.failed`)

  console.log('\n2. Verify Backend Server:')
  console.log('   - Ensure backend is running on port 5000')
  console.log('   - Check that /api/payments/verify endpoint is accessible')
  console.log('   - Verify no firewall blocking incoming requests')

  console.log('\n3. Test Webhook:')
  console.log('   - Use the test-webhook-endpoint.js script')
  console.log('   - Check server logs for webhook processing')

  console.log('\n4. Environment Variables:')
  console.log('   - Ensure FRONTEND_URL is set correctly')
  console.log('   - For production, set WEBHOOK_URL properly')

  console.log('\n5. Manual Fix (Temporary):')
  console.log('   - Use simple-webhook-fix.js for pending orders')
  console.log('   - Monitor webhook-monitor.js regularly')

  console.log('\n🚀 QUICK TEST:')
  console.log('   node diagnose-webhook.js')
  console.log('   node test-webhook-endpoint.js')
}

// Run diagnostic
diagnoseWebhookIssues().catch(console.error)
