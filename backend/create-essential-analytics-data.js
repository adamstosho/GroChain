const mongoose = require('mongoose')
const User = require('./models/user.model')
const Listing = require('./models/listing.model')
const Order = require('./models/order.model')
const Transaction = require('./models/transaction.model')
const Harvest = require('./models/harvest.model')

async function createEssentialAnalyticsData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App')
    console.log('🔗 Connected to MongoDB')

    // Find or create farmer
    let farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      farmer = new User({
        name: 'Test Farmer',
        email: 'farmer@test.com',
        password: '$2a$10$test.hash',
        role: 'farmer'
      })
      await farmer.save()
      console.log('✅ Created test farmer')
    }

    // Find or create buyer
    let buyer = await User.findOne({ role: 'buyer' })
    if (!buyer) {
      buyer = new User({
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: '$2a$10$test.hash',
        role: 'buyer'
      })
      await buyer.save()
      console.log('✅ Created test buyer')
    }

    // Create a simple listing
    const existingListings = await Listing.countDocuments({ farmer: farmer._id })
    if (existingListings === 0) {
      const listing = new Listing({
        farmer: farmer._id,
        cropName: 'Test Crop',
        category: 'grains',
        description: 'Test crop for analytics',
        basePrice: 10000,
        unit: 'kg',
        quantity: 100,
        availableQuantity: 100,
        location: 'Test Location',
        status: 'active'
      })
      await listing.save()
      console.log('✅ Created test listing')
    }

    // Create a simple harvest
    const existingHarvests = await Harvest.countDocuments({ farmer: farmer._id })
    if (existingHarvests === 0) {
      const harvest = new Harvest({
        farmer: farmer._id,
        batchId: 'TEST001',
        cropType: 'Test Crop',
        quantity: 50,
        unit: 'kg',
        quality: 'good',
        location: 'Test Location',
        status: 'approved'
      })
      await harvest.save()
      console.log('✅ Created test harvest')
    }

    // Create a simple order
    const existingOrders = await Order.countDocuments()
    if (existingOrders === 0) {
      const listing = await Listing.findOne({ farmer: farmer._id })
      if (listing) {
        const order = new Order({
          buyer: buyer._id,
          seller: farmer._id,
          items: [{
            listing: listing._id,
            quantity: 5,
            price: 10000,
            unit: 'kg',
            total: 50000
          }],
          total: 50000,
          subtotal: 50000,
          shippingAddress: {
            street: 'Test Street',
            city: 'Test City',
            state: 'Test State',
            country: 'Nigeria',
            phone: '08012345678'
          },
          status: 'paid',
          paymentStatus: 'paid'
        })
        await order.save()
        console.log('✅ Created test order worth ₦50,000')

        // Create corresponding transaction
        const transaction = new Transaction({
          type: 'payment',
          status: 'completed',
          amount: 50000,
          currency: 'NGN',
          reference: 'TEST_TXN_001',
          description: 'Test payment',
          userId: buyer._id,
          orderId: order._id,
          listingId: listing._id
        })
        await transaction.save()
        console.log('✅ Created test transaction')
      }
    }

    console.log('\n📊 Test Data Created:')
    console.log('   - 1 Farmer')
    console.log('   - 1 Buyer')
    console.log('   - 1 Listing')
    console.log('   - 1 Harvest')
    console.log('   - 1 Order (₦50,000)')
    console.log('   - 1 Transaction')

    console.log('\n🎉 Analytics should now show real data!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

createEssentialAnalyticsData()
