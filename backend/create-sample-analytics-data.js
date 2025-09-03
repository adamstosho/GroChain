const mongoose = require('mongoose')
const User = require('./models/user.model')
const Listing = require('./models/listing.model')
const Order = require('./models/order.model')
const Harvest = require('./models/harvest.model')

require('dotenv').config()

async function createSampleAnalyticsData() {
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

    // Create sample harvest data
    const harvests = [
      {
        farmer: farmer._id,
        cropType: 'Cassava',
        quantity: 500,
        qualityGrade: 'A',
        location: 'Lagos Farm, Lagos',
        date: new Date('2024-12-01'),
        price: 250000,
        status: 'approved',
        geoLocation: { lat: 6.5244, lng: 3.3792 }
      },
      {
        farmer: farmer._id,
        cropType: 'Maize',
        quantity: 300,
        qualityGrade: 'A',
        location: 'Ibadan Farm, Oyo',
        date: new Date('2024-12-05'),
        price: 180000,
        status: 'approved',
        geoLocation: { lat: 7.3775, lng: 3.9470 }
      },
      {
        farmer: farmer._id,
        cropType: 'Tomatoes',
        quantity: 200,
        qualityGrade: 'B',
        location: 'Abuja Farm, Abuja',
        date: new Date('2024-12-10'),
        price: 150000,
        status: 'approved',
        geoLocation: { lat: 9.0765, lng: 7.3986 }
      }
    ]

    const createdHarvests = await Harvest.insertMany(harvests)
    console.log('🌾 Created harvests:', createdHarvests.length)

    // Create sample listings
    const listings = [
      {
        farmer: farmer._id,
        cropName: 'Fresh Cassava',
        category: 'Tubers',
        unit: 'kg',
        basePrice: 50000,
        quantity: 100,
        availableQuantity: 100,
        location: {
          type: 'Point',
          coordinates: [3.3792, 6.5244], // [lng, lat]
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria'
        },
        status: 'active',
        description: 'Premium quality cassava tubers',
        images: ['https://example.com/cassava1.jpg'],
        harvest: createdHarvests[0]._id,
        views: 25,
        rating: 4.8,
        reviewCount: 8
      },
      {
        farmer: farmer._id,
        cropName: 'Yellow Maize',
        category: 'Grains',
        unit: 'kg',
        basePrice: 60000,
        quantity: 80,
        availableQuantity: 80,
        location: {
          type: 'Point',
          coordinates: [3.9470, 7.3775], // [lng, lat]
          city: 'Ibadan',
          state: 'Oyo',
          country: 'Nigeria'
        },
        status: 'active',
        description: 'High-quality yellow maize grains',
        images: ['https://example.com/maize1.jpg'],
        harvest: createdHarvests[1]._id,
        views: 45,
        rating: 4.6,
        reviewCount: 12
      },
      {
        farmer: farmer._id,
        cropName: 'Red Tomatoes',
        category: 'Vegetables',
        unit: 'kg',
        basePrice: 75000,
        quantity: 60,
        availableQuantity: 60,
        location: {
          type: 'Point',
          coordinates: [7.3986, 9.0765], // [lng, lat]
          city: 'Abuja',
          state: 'FCT',
          country: 'Nigeria'
        },
        status: 'active',
        description: 'Fresh red tomatoes from Abuja',
        images: ['https://example.com/tomato1.jpg'],
        harvest: createdHarvests[2]._id,
        views: 30,
        rating: 4.9,
        reviewCount: 15
      },
      {
        farmer: farmer._id,
        cropName: 'Rice Grains',
        category: 'Grains',
        unit: 'kg',
        basePrice: 55000,
        quantity: 90,
        availableQuantity: 90,
        location: {
          type: 'Point',
          coordinates: [8.5920, 12.0022], // [lng, lat]
          city: 'Kano',
          state: 'Kano',
          country: 'Nigeria'
        },
        status: 'active',
        description: 'Premium rice grains',
        images: ['https://example.com/rice1.jpg'],
        views: 20,
        rating: 4.5,
        reviewCount: 6
      }
    ]

    const createdListings = await Listing.insertMany(listings)
    console.log('🛍️  Created listings:', createdListings.length)

    // Create sample customers
    const customers = [
      {
        name: 'John Adebayo',
        email: 'john.adebayo@email.com',
        phone: '+2348012345678',
        role: 'buyer'
      },
      {
        name: 'Mary Okon',
        email: 'mary.okon@email.com',
        phone: '+2348023456789',
        role: 'buyer'
      },
      {
        name: 'Peter Nwosu',
        email: 'peter.nwosu@email.com',
        phone: '+2348034567890',
        role: 'buyer'
      }
    ]

    const createdCustomers = await User.insertMany(customers)
    console.log('👥 Created customers:', createdCustomers.length)

    // Create sample orders
    const orders = [
      {
        buyer: createdCustomers[0]._id,
        items: [{
          listing: createdListings[0]._id,
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
          listing: createdListings[1]._id,
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
          listing: createdListings[2]._id,
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
          listing: createdListings[3]._id,
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
          listing: createdListings[0]._id,
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

    // Update some orders to have different dates for monthly trends
    const pastOrders = [
      {
        buyer: createdCustomers[0]._id,
        items: [{
          listing: createdListings[0]._id,
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
          listing: createdListings[1]._id,
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
    console.log('📊 You can now test the marketplace analytics endpoint')

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await mongoose.disconnect()
  }
}

createSampleAnalyticsData()
