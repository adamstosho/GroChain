const mongoose = require('mongoose')
const User = require('./models/user.model')
const Order = require('./models/order.model')

require('dotenv').config()

async function createSimpleAnalyticsData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI_PROD)
    console.log('🔗 Connected to MongoDB')

    // Get the farmer user
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer user found')
      return
    }
    console.log('👤 Found farmer:', farmer.name)

    // Create sample customers
    const customers = [
      {
        name: 'John Adebayo',
        email: 'john.adebayo@email.com',
        phone: '+2348012345678',
        role: 'buyer',
        password: '$2a$10$hashedpassword1' // Mock hashed password
      },
      {
        name: 'Mary Okon',
        email: 'mary.okon@email.com',
        phone: '+2348023456789',
        role: 'buyer',
        password: '$2a$10$hashedpassword2' // Mock hashed password
      },
      {
        name: 'Peter Nwosu',
        email: 'peter.nwosu@email.com',
        phone: '+2348034567890',
        role: 'buyer',
        password: '$2a$10$hashedpassword3' // Mock hashed password
      }
    ]

    const createdCustomers = await User.insertMany(customers)
    console.log('👥 Created customers:', createdCustomers.length)

    // Create sample orders with mock listing data
    const orders = [
      {
        buyer: createdCustomers[0]._id,
        items: [{
          listing: new mongoose.Types.ObjectId(), // Mock listing ID
          cropName: 'Fresh Cassava',
          category: 'Tubers',
          quantity: 20,
          price: 50000,
          total: 1000000
        }],
        total: 1000000,
        status: 'paid',
        paymentMethod: 'card',
        createdAt: new Date('2024-12-15')
      },
      {
        buyer: createdCustomers[1]._id,
        items: [{
          listing: new mongoose.Types.ObjectId(), // Mock listing ID
          cropName: 'Yellow Maize',
          category: 'Grains',
          quantity: 15,
          price: 60000,
          total: 900000
        }],
        total: 900000,
        status: 'paid',
        paymentMethod: 'transfer',
        createdAt: new Date('2024-12-16')
      },
      {
        buyer: createdCustomers[2]._id,
        items: [{
          listing: new mongoose.Types.ObjectId(), // Mock listing ID
          cropName: 'Red Tomatoes',
          category: 'Vegetables',
          quantity: 10,
          price: 75000,
          total: 750000
        }],
        total: 750000,
        status: 'paid',
        paymentMethod: 'card',
        createdAt: new Date('2024-12-17')
      },
      {
        buyer: createdCustomers[0]._id,
        items: [{
          listing: new mongoose.Types.ObjectId(), // Mock listing ID
          cropName: 'Rice Grains',
          category: 'Grains',
          quantity: 12,
          price: 55000,
          total: 660000
        }],
        total: 660000,
        status: 'paid',
        paymentMethod: 'card',
        createdAt: new Date('2024-12-18')
      },
      {
        buyer: createdCustomers[1]._id,
        items: [{
          listing: new mongoose.Types.ObjectId(), // Mock listing ID
          cropName: 'Fresh Cassava',
          category: 'Tubers',
          quantity: 8,
          price: 50000,
          total: 400000
        }],
        total: 400000,
        status: 'paid',
        paymentMethod: 'transfer',
        createdAt: new Date('2024-12-19')
      }
    ]

    const createdOrders = await Order.insertMany(orders)
    console.log('📦 Created orders:', createdOrders.length)

    // Create additional orders for monthly trends
    const pastOrders = [
      {
        buyer: createdCustomers[0]._id,
        items: [{
          listing: new mongoose.Types.ObjectId(),
          cropName: 'Fresh Cassava',
          category: 'Tubers',
          quantity: 5,
          price: 50000,
          total: 250000
        }],
        total: 250000,
        status: 'paid',
        paymentMethod: 'card',
        createdAt: new Date('2024-11-15')
      },
      {
        buyer: createdCustomers[1]._id,
        items: [{
          listing: new mongoose.Types.ObjectId(),
          cropName: 'Yellow Maize',
          category: 'Grains',
          quantity: 7,
          price: 60000,
          total: 420000
        }],
        total: 420000,
        status: 'paid',
        paymentMethod: 'transfer',
        createdAt: new Date('2024-11-20')
      }
    ]

    await Order.insertMany(pastOrders)
    console.log('📦 Created additional past orders for monthly trends')

    console.log('✅ Sample analytics data created successfully!')
    console.log('📊 Total orders created:', orders.length + pastOrders.length)

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await mongoose.disconnect()
  }
}

createSimpleAnalyticsData()
