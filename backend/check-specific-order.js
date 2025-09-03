// Check specific order and transaction details
const mongoose = require('mongoose')

async function checkSpecificOrder(orderId) {
  try {
    console.log('🔍 CHECKING SPECIFIC ORDER DETAILS')
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
      buyer: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
      updatedAt: Date
    }, { timestamps: true })

    const TransactionSchema = new mongoose.Schema({
      orderId: mongoose.Schema.Types.ObjectId,
      status: String,
      reference: String,
      amount: Number,
      paymentProvider: String,
      processedAt: Date,
      metadata: Object,
      createdAt: Date,
      updatedAt: Date
    }, { timestamps: true })

    const Order = mongoose.model('Order', OrderSchema, 'orders')
    const Transaction = mongoose.model('Transaction', TransactionSchema, 'transactions')

    console.log(`🔍 Looking for order: ${orderId}`)

    // Find the order
    const order = await Order.findById(orderId)
    if (!order) {
      console.log('❌ Order not found!')
      return
    }

    console.log('\n📦 ORDER DETAILS:')
    console.log('- ID:', order._id)
    console.log('- Status:', order.status)
    console.log('- Payment Status:', order.paymentStatus)
    console.log('- Payment Reference:', order.paymentReference || 'None')
    console.log('- Total:', order.total)
    console.log('- Created:', order.createdAt)
    console.log('- Updated:', order.updatedAt)

    // Find associated transaction
    const transaction = await Transaction.findOne({ orderId: order._id })
    if (transaction) {
      console.log('\n💳 TRANSACTION DETAILS:')
      console.log('- ID:', transaction._id)
      console.log('- Reference:', transaction.reference)
      console.log('- Status:', transaction.status)
      console.log('- Amount:', transaction.amount)
      console.log('- Provider:', transaction.paymentProvider)
      console.log('- Processed At:', transaction.processedAt || 'Not processed')
      console.log('- Created:', transaction.createdAt)
      console.log('- Updated:', transaction.updatedAt)
      console.log('- Metadata:', JSON.stringify(transaction.metadata, null, 2))
    } else {
      console.log('\n❌ NO TRANSACTION FOUND for this order!')
      console.log('💡 This means the payment initialization may have failed')
    }

    // Analysis
    console.log('\n🔍 ANALYSIS:')

    if (!transaction) {
      console.log('❌ ISSUE: No transaction record exists')
      console.log('💡 CAUSE: Payment initialization failed or was not completed')
      console.log('🔧 SOLUTION: Create transaction record and update order status')
    } else if (transaction.status === 'pending') {
      console.log('⚠️ ISSUE: Transaction exists but is still pending')
      console.log('💡 CAUSE: Webhook was not received or payment not completed')
      console.log('🔧 SOLUTION: Verify payment with Paystack and update status')
    } else if (transaction.status === 'completed' && order.status === 'pending') {
      console.log('🔄 ISSUE: Transaction completed but order not updated')
      console.log('💡 CAUSE: Webhook processed transaction but failed to update order')
      console.log('🔧 SOLUTION: Update order status to match transaction')
    } else {
      console.log('✅ Status appears consistent')
    }

    // Check for recent similar orders
    const recentOrders = await Order.find({
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    }).sort({ createdAt: -1 }).limit(5)

    console.log('\n📋 RECENT ORDERS (Last hour):')
    for (const recentOrder of recentOrders) {
      const recentTx = await Transaction.findOne({ orderId: recentOrder._id })
      console.log(`- ${recentOrder._id}: ${recentOrder.status}/${recentOrder.paymentStatus} | TX: ${recentTx?.status || 'None'}`)
    }

    return { order, transaction }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from database')
  }
}

// Run with specific order ID
const orderId = process.argv[2] || '68b80804f4e6730c4259e07d'
console.log(`🚀 Checking order: ${orderId}`)
checkSpecificOrder(orderId).catch(console.error)
