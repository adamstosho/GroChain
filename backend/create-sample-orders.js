// Script to create sample orders and transactions for testing
const mongoose = require('mongoose')
const Order = require('./models/order.model')
const Transaction = require('./models/transaction.model')
const User = require('./models/user.model')
const Listing = require('./models/listing.model')

async function createSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('🔗 Connected to database')

    // Check if we already have data
    const existingOrders = await Order.countDocuments()
    const existingTransactions = await Transaction.countDocuments()

    if (existingOrders > 0 || existingTransactions > 0) {
      console.log('⚠️ Sample data already exists!')
      console.log(`   • Orders: ${existingOrders}`)
      console.log(`   • Transactions: ${existingTransactions}`)
      console.log('Skipping sample data creation.')
      return
    }

    console.log('📝 Creating sample data...')

    // Create sample buyer
    const buyer = new User({
      name: 'John Buyer',
      email: 'john.buyer@example.com',
      password: '$2a$10$example.hash.here', // This would be hashed in real scenario
      role: 'buyer',
      profile: {
        phone: '08012345678',
        avatar: '/placeholder-avatar.jpg'
      }
    })
    await buyer.save()
    console.log('✅ Created buyer:', buyer._id)

    // Create sample farmer
    const farmer = new User({
      name: 'Jane Farmer',
      email: 'jane.farmer@example.com',
      password: '$2a$10$example.hash.here',
      role: 'farmer',
      profile: {
        phone: '08087654321',
        farmName: 'Green Valley Farm'
      }
    })
    await farmer.save()
    console.log('✅ Created farmer:', farmer._id)

    // Create sample listing
    const listing = new Listing({
      farmer: farmer._id,
      cropName: 'Cassava',
      basePrice: 100,
      quantity: 100,
      availableQuantity: 100,
      category: 'tubers',
      unit: 'kg',
      description: 'Fresh cassava from our farm',
      location: 'Lagos, Nigeria',
      images: ['/placeholder-cassava.jpg'],
      status: 'active'
    })
    await listing.save()
    console.log('✅ Created listing:', listing._id)

    // Create sample orders
    const orders = [
      {
        buyer: buyer._id,
        seller: farmer._id,
        items: [{
          listing: listing._id,
          quantity: 5,
          price: 100,
          unit: 'kg',
          total: 500
        }],
        subtotal: 500,
        shipping: 200,
        tax: 38, // 7.5% of 500 + 200 = 7.5% of 700
        total: 738,
        status: 'paid',
        paymentStatus: 'paid',
        paymentMethod: 'paystack',
        shippingAddress: {
          street: '123 Main Street',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          phone: '08012345678'
        }
      },
      {
        buyer: buyer._id,
        seller: farmer._id,
        items: [{
          listing: listing._id,
          quantity: 3,
          price: 100,
          unit: 'kg',
          total: 300
        }],
        subtotal: 300,
        shipping: 200,
        tax: 38, // 7.5% of 500
        total: 538,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'paystack',
        shippingAddress: {
          street: '456 Oak Avenue',
          city: 'Abuja',
          state: 'FCT',
          country: 'Nigeria',
          phone: '08012345678'
        }
      }
    ]

    const createdOrders = []
    for (const orderData of orders) {
      const order = new Order(orderData)
      await order.save()
      createdOrders.push(order)
      console.log(`✅ Created order: ${order._id} (${order.status})`)
    }

    // Create sample transactions
    const transactions = [
      {
        type: 'payment',
        status: 'completed',
        amount: 738,
        currency: 'NGN',
        reference: `GROCHAIN_${Date.now()}_SAMPLE1`,
        description: `Payment for order ${createdOrders[0]._id}`,
        userId: buyer._id,
        orderId: createdOrders[0]._id,
        paymentProvider: 'paystack',
        paymentProviderReference: `PAYSTACK_SAMPLE_1`,
        processedAt: new Date(),
        metadata: {
          sample: true,
          orderId: createdOrders[0]._id.toString()
        }
      },
      {
        type: 'payment',
        status: 'pending',
        amount: 538,
        currency: 'NGN',
        reference: `GROCHAIN_${Date.now()}_SAMPLE2`,
        description: `Payment for order ${createdOrders[1]._id}`,
        userId: buyer._id,
        orderId: createdOrders[1]._id,
        paymentProvider: 'paystack',
        metadata: {
          sample: true,
          orderId: createdOrders[1]._id.toString()
        }
      }
    ]

    for (const transactionData of transactions) {
      const transaction = new Transaction(transactionData)
      await transaction.save()
      console.log(`✅ Created transaction: ${transaction.reference} (${transaction.status})`)
    }

    console.log('\n🎉 Sample data created successfully!')
    console.log('📊 Summary:')
    console.log('   • 1 Buyer created')
    console.log('   • 1 Farmer created')
    console.log('   • 1 Listing created')
    console.log('   • 2 Orders created (1 paid, 1 pending)')
    console.log('   • 2 Transactions created (1 completed, 1 pending)')

    console.log('\n🔗 Test URLs:')
    console.log(`   Orders: http://localhost:3000/dashboard/orders`)
    console.log(`   Payments: http://localhost:3000/dashboard/payments`)
    console.log(`   Order Details: http://localhost:3000/dashboard/orders/${createdOrders[0]._id}`)

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

createSampleData()
