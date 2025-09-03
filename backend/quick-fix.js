const mongoose = require('mongoose')

async function quickFix() {
  try {
    console.log('🔗 Connecting to database...')

    await mongoose.connect('mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    })

    console.log('✅ Connected to database')

    const Order = mongoose.model('Order', new mongoose.Schema({
      status: String,
      paymentStatus: String,
      paymentReference: String,
      total: Number
    }, { timestamps: true }))

    const Transaction = mongoose.model('Transaction', new mongoose.Schema({
      orderId: mongoose.Schema.Types.ObjectId,
      status: String,
      reference: String,
      amount: Number,
      paymentProvider: String,
      processedAt: Date,
      metadata: Object
    }, { timestamps: true }))

    const orderId = '68b8033ca3b9a905c8287446'
    console.log(`🔍 Fixing order: ${orderId}`)

    const order = await Order.findById(orderId)
    if (!order) {
      console.log('❌ Order not found')
      return
    }

    console.log('📦 Current order status:', {
      id: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus
    })

    // Check for existing transaction
    let transaction = await Transaction.findOne({ orderId: order._id })

    if (!transaction) {
      console.log('🔧 Creating transaction...')
      const reference = `GROCHAIN_FIXED_${Date.now()}`
      transaction = new Transaction({
        orderId: order._id,
        status: 'completed',
        reference: reference,
        amount: order.total,
        paymentProvider: 'paystack',
        processedAt: new Date(),
        metadata: { manuallyFixed: true }
      })
      await transaction.save()
      console.log('✅ Transaction created')
    } else {
      console.log('💳 Transaction exists:', transaction.reference)
      if (transaction.status !== 'completed') {
        transaction.status = 'completed'
        transaction.processedAt = new Date()
        await transaction.save()
        console.log('✅ Transaction updated to completed')
      }
    }

    // Update order
    order.status = 'paid'
    order.paymentStatus = 'paid'
    order.paymentReference = transaction.reference
    await order.save()

    console.log('✅ Order updated to paid!')
    console.log('📦 Final status:', {
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference
    })

    console.log('\n🎉 SUCCESS! Order has been fixed.')
    console.log('🔄 Please refresh your browser to see the updated status.')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected')
  }
}

quickFix()
