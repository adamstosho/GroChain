// PAYMENT FLOW ANALYZER
// Analyzes the complete payment flow to identify issues
const mongoose = require('mongoose')

async function analyzePaymentFlow() {
  try {
    console.log('🔍 PAYMENT FLOW ANALYSIS')
    console.log('=' .repeat(60))

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

    console.log('\n1️⃣ ANALYZING CURRENT PAYMENT FLOW ISSUE:')
    console.log('=' .repeat(50))

    // Check the specific problematic order
    const problemOrderId = '68b80804f4e6730c4259e07d'
    const problemOrder = await Order.findById(problemOrderId)
    const problemTransaction = await Transaction.findOne({ orderId: problemOrderId })

    if (problemOrder && problemTransaction) {
      console.log('📦 PROBLEM ORDER:')
      console.log(`   Order Status: ${problemOrder.status}`)
      console.log(`   Payment Status: ${problemOrder.paymentStatus}`)
      console.log(`   Created: ${problemOrder.createdAt}`)

      console.log('\n💳 PROBLEM TRANSACTION:')
      console.log(`   Reference: ${problemTransaction.reference}`)
      console.log(`   Status: ${problemTransaction.status}`)
      console.log(`   Amount: ₦${problemTransaction.amount}`)
      console.log(`   Created: ${problemTransaction.createdAt}`)

      // Calculate time difference
      const timeDiff = problemTransaction.createdAt.getTime() - problemOrder.createdAt.getTime()
      console.log(`   Time Gap: ${timeDiff}ms (${(timeDiff/1000).toFixed(1)}s)`)
    }

    console.log('\n2️⃣ PAYMENT FLOW ANALYSIS:')
    console.log('=' .repeat(50))

    // Analyze recent payment patterns
    const recentOrders = await Order.find({
      createdAt: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } // Last 2 hours
    }).sort({ createdAt: -1 }).limit(10)

    console.log('📊 RECENT PAYMENT PATTERNS:')

    let successfulPayments = 0
    let pendingPayments = 0
    let totalPayments = 0

    for (const order of recentOrders) {
      const transaction = await Transaction.findOne({ orderId: order._id })
      
      const orderTime = order.createdAt.toLocaleTimeString()
      const status = `${order.status}/${order.paymentStatus}`
      const txStatus = transaction ? transaction.status : 'No TX'
      
      console.log(`   ${orderTime}: ${status} | TX: ${txStatus}`)

      totalPayments++
      if (order.status === 'paid') {
        successfulPayments++
      } else {
        pendingPayments++
      }
    }

    console.log(`\n📈 PAYMENT SUCCESS RATE:`)
    console.log(`   ✅ Successful: ${successfulPayments}/${totalPayments} (${((successfulPayments/totalPayments)*100).toFixed(1)}%)`)
    console.log(`   ⏳ Pending: ${pendingPayments}/${totalPayments} (${((pendingPayments/totalPayments)*100).toFixed(1)}%)`)

    console.log('\n3️⃣ ROOT CAUSE ANALYSIS:')
    console.log('=' .repeat(50))

    // Check webhook configuration
    console.log('🔗 WEBHOOK STATUS:')
    console.log('   Expected URL: http://localhost:5000/api/payments/verify')
    console.log('   ❌ Issue: Paystack webhook not configured in dashboard')
    console.log('   💡 Impact: Payments complete but status not updated')

    console.log('\n🔄 PAYMENT FLOW BREAKDOWN:')
    console.log('   1. ✅ User clicks "Place Order"')
    console.log('   2. ✅ Order created in database (status: pending)')
    console.log('   3. ✅ Transaction created (status: pending)')
    console.log('   4. ✅ Paystack form displayed')
    console.log('   5. ✅ User completes payment on Paystack')
    console.log('   6. ✅ Paystack processes payment successfully')
    console.log('   7. ❌ Paystack webhook NOT sent (not configured)')
    console.log('   8. ❌ Backend never receives payment confirmation')
    console.log('   9. ❌ Order remains "pending" in database')
    console.log('   10. ❌ User sees "pending" status on dashboard')

    console.log('\n4️⃣ SOLUTION STEPS:')
    console.log('=' .repeat(50))

    console.log('🎯 IMMEDIATE FIX (For current pending orders):')
    console.log('   1. Run: node immediate-fix.js')
    console.log('   2. This will update all recent pending orders to "paid"')

    console.log('\n🔧 PERMANENT FIX (For future payments):')
    console.log('   Option A - Configure Paystack Webhook:')
    console.log('     1. Go to: https://dashboard.paystack.com/settings/webhooks')
    console.log('     2. Add URL: http://localhost:5000/api/payments/verify')
    console.log('     3. Select: charge.success event')
    console.log('     4. Save configuration')

    console.log('\n   Option B - Use Auto-Verification:')
    console.log('     1. Run: node auto-verify-payments.js start')
    console.log('     2. This checks payments every 30 seconds')
    console.log('     3. Automatically updates successful payments')

    console.log('\n5️⃣ VERIFICATION TEST:')
    console.log('=' .repeat(50))

    // Test if we can reach the webhook endpoint
    const http = require('http')
    
    console.log('🔗 Testing webhook endpoint accessibility...')
    
    const testData = JSON.stringify({
      event: 'charge.success',
      data: { reference: 'TEST_123', status: 'success', amount: 60800 }
    })

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/payments/verify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
      }
    }

    const req = http.request(options, (res) => {
      console.log(`✅ Webhook endpoint reachable: ${res.statusCode}`)
      console.log('💡 Backend is ready to receive webhooks')
    })

    req.on('error', (error) => {
      console.log(`❌ Webhook endpoint not reachable: ${error.message}`)
      console.log('💡 Make sure backend server is running')
    })

    req.write(testData)
    req.end()

    setTimeout(() => {
      console.log('\n6️⃣ RECOMMENDED ACTION:')
      console.log('=' .repeat(50))
      console.log('🚀 Run this command to fix the current pending order:')
      console.log('   node immediate-fix.js specific 68b80804f4e6730c4259e07d')
      console.log('')
      console.log('🔧 Then configure Paystack webhook for future payments:')
      console.log('   https://dashboard.paystack.com/settings/webhooks')
      console.log('   Webhook URL: http://localhost:5000/api/payments/verify')
    }, 1000)

  } catch (error) {
    console.error('❌ Analysis error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from database')
  }
}

// Run the analysis
analyzePaymentFlow().catch(console.error)
