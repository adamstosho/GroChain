const mongoose = require('mongoose')
const User = require('./models/user.model')
const Listing = require('./models/listing.model')
const Order = require('./models/order.model')
const Transaction = require('./models/transaction.model')
const Harvest = require('./models/harvest.model')

async function createRealAnalyticsData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('🔗 Connected to MongoDB')

    // Clear existing data to start fresh
    await Order.deleteMany({})
    await Transaction.deleteMany({})
    await Listing.deleteMany({})
    await Harvest.deleteMany({})
    console.log('🧹 Cleared existing data')

    // Find existing farmer or create one
    let farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      farmer = new User({
        name: 'Adam Ridwan',
        email: 'omoridoh111@gmail.com',
        password: '$2a$10$example.hash.here',
        role: 'farmer',
        profile: {
          phone: '08012345678',
          farmName: 'Green Valley Farm'
        }
      })
      await farmer.save()
      console.log('✅ Created farmer:', farmer._id)
    } else {
      console.log('👨‍🌾 Found existing farmer:', farmer.name)
    }

    // Find existing buyer or create one
    let buyer = await User.findOne({ role: 'buyer' })
    if (!buyer) {
      buyer = new User({
        name: 'John Buyer',
        email: 'john.buyer@example.com',
        password: '$2a$10$example.hash.here',
        role: 'buyer',
        profile: {
          phone: '08087654321'
        }
      })
      await buyer.save()
      console.log('✅ Created buyer:', buyer._id)
    } else {
      console.log('👤 Found existing buyer:', buyer.name)
    }

    // Create sample listings for farmer (with correct string location format)
    const listings = [
      {
        farmer: farmer._id,
        cropName: 'Fresh Maize',
        category: 'grains',
        description: 'Premium quality fresh maize from our farm',
        basePrice: 25000, // ₦25,000 per bag
        unit: '50kg bag',
        quantity: 100,
        availableQuantity: 100,
        location: 'Abeokuta, Ogun State, Nigeria',
        status: 'active'
      },
      {
        farmer: farmer._id,
        cropName: 'Cassava Tubers',
        category: 'tubers',
        description: 'Fresh cassava tubers ready for processing',
        basePrice: 15000, // ₦15,000 per bag
        unit: '25kg bag',
        quantity: 75,
        availableQuantity: 75,
        location: 'Abeokuta, Ogun State, Nigeria',
        status: 'active'
      },
      {
        farmer: farmer._id,
        cropName: 'Fresh Tomatoes',
        category: 'vegetables',
        description: 'Organic fresh tomatoes from our greenhouse',
        basePrice: 5000, // ₦5,000 per crate
        unit: '10kg crate',
        quantity: 50,
        availableQuantity: 50,
        location: 'Abeokuta, Ogun State, Nigeria',
        status: 'active'
      },
      {
        farmer: farmer._id,
        cropName: 'Yam Tubers',
        category: 'tubers',
        description: 'Large yam tubers perfect for market',
        basePrice: 20000, // ₦20,000 per bag
        unit: '20kg bag',
        quantity: 40,
        availableQuantity: 40,
        location: 'Abeokuta, Ogun State, Nigeria',
        status: 'active'
      }
    ]

    const createdListings = []
    for (const listingData of listings) {
      const listing = new Listing(listingData)
      await listing.save()
      createdListings.push(listing)
      console.log(`✅ Created listing: ${listing.cropName} - ₦${listing.basePrice}`)
    }

    // Create sample harvests for farmer
    const harvests = [
      {
        farmer: farmer._id,
        batchId: 'HARVEST_001',
        cropType: 'Maize',
        quantity: 500,
        unit: 'kg',
        quality: 'excellent',
        location: 'Abeokuta, Ogun State, Nigeria',
        status: 'approved',
        harvestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        farmer: farmer._id,
        batchId: 'HARVEST_002',
        cropType: 'Cassava',
        quantity: 300,
        unit: 'kg',
        quality: 'good',
        location: 'Abeokuta, Ogun State, Nigeria',
        status: 'approved',
        harvestDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
      },
      {
        farmer: farmer._id,
        batchId: 'HARVEST_003',
        cropType: 'Tomatoes',
        quantity: 200,
        unit: 'kg',
        quality: 'excellent',
        location: 'Abeokuta, Ogun State, Nigeria',
        status: 'approved',
        harvestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      }
    ]

    for (const harvestData of harvests) {
      const harvest = new Harvest(harvestData)
      await harvest.save()
      console.log(`✅ Created harvest: ${harvest.cropType} - ${harvest.quantity}${harvest.unit}`)
    }

    // Create sample orders and transactions
    const ordersData = [
      {
        buyer: buyer._id,
        seller: farmer._id,
        items: [
          {
            listing: createdListings[0]._id, // Maize
            quantity: 2,
            price: 25000,
            unit: '50kg bag',
            total: 50000
          }
        ],
        total: 50000,
        subtotal: 50000,
        shippingAddress: {
          street: '123 Buyer Street',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          phone: '08012345678'
        },
        status: 'paid',
        paymentStatus: 'paid',
        paymentMethod: 'paystack'
      },
      {
        buyer: buyer._id,
        seller: farmer._id,
        items: [
          {
            listing: createdListings[1]._id, // Cassava
            quantity: 1,
            price: 15000,
            unit: '25kg bag',
            total: 15000
          },
          {
            listing: createdListings[2]._id, // Tomatoes
            quantity: 3,
            price: 5000,
            unit: '10kg crate',
            total: 15000
          }
        ],
        total: 30000,
        subtotal: 30000,
        shippingAddress: {
          street: '123 Buyer Street',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          phone: '08012345678'
        },
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'paystack'
      },
      {
        buyer: buyer._id,
        seller: farmer._id,
        items: [
          {
            listing: createdListings[3]._id, // Yam
            quantity: 2,
            price: 20000,
            unit: '20kg bag',
            total: 40000
          }
        ],
        total: 40000,
        subtotal: 40000,
        shippingAddress: {
          street: '123 Buyer Street',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          phone: '08012345678'
        },
        status: 'paid',
        paymentStatus: 'paid',
        paymentMethod: 'paystack'
      }
    ]

    const createdOrders = []
    for (const orderData of ordersData) {
      const order = new Order(orderData)
      await order.save()
      createdOrders.push(order)
      console.log(`✅ Created order: ${order._id} - ₦${order.total} (${order.status})`)
    }

    // Create corresponding transactions
    for (let i = 0; i < createdOrders.length; i++) {
      const order = createdOrders[i]
      const transaction = new Transaction({
        type: 'payment',
        status: 'completed',
        amount: order.total,
        currency: 'NGN',
        reference: `TXN_${Date.now()}_${i}`,
        description: `Payment for order ${order._id}`,
        userId: buyer._id,
        orderId: order._id,
        listingId: order.items[0].listing,
        paymentProvider: 'paystack',
        paymentProviderReference: `REF_${Date.now()}_${i}`,
        processedAt: new Date()
      })
      await transaction.save()
      console.log(`✅ Created transaction: ${transaction.reference} - ₦${transaction.amount}`)
    }

    // Summary
    console.log('\n📊 Sample Data Summary:')
    console.log(`👨‍🌾 Farmer: ${farmer.name} (${farmer.email})`)
    console.log(`👤 Buyer: ${buyer.name} (${buyer.email})`)
    console.log(`🌾 Harvests: ${harvests.length}`)
    console.log(`📦 Listings: ${createdListings.length}`)
    console.log(`🛒 Orders: ${createdOrders.length}`)
    console.log(`💰 Total Revenue: ₦${createdOrders.reduce((sum, order) => sum + order.total, 0)}`)

    console.log('\n🎉 Real analytics data created successfully!')
    console.log('🔄 Now the farmer analytics page should show real data!')

  } catch (error) {
    console.error('❌ Error creating sample data:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

createRealAnalyticsData()
