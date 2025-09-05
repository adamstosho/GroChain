// Script to create a test buyer user and some orders for testing
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/grochain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Create test data
const createTestData = async () => {
  try {
    const User = require('./backend/models/user.model');
    const Order = require('./backend/models/order.model');

    // Check if test buyer already exists
    let testBuyer = await User.findOne({ email: 'testbuyer@example.com' });

    if (!testBuyer) {
      // Create test buyer
      const hashedPassword = await bcrypt.hash('password123', 12);
      testBuyer = await User.create({
        name: 'Test Buyer',
        email: 'testbuyer@example.com',
        password: hashedPassword,
        phone: '+2348012345678',
        role: 'buyer',
        location: {
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria'
        },
        emailVerified: true,
        phoneVerified: true
      });
      console.log('✅ Created test buyer:', testBuyer._id);
    } else {
      console.log('✅ Test buyer already exists:', testBuyer._id);
    }

    // Check if test orders exist
    const existingOrders = await Order.countDocuments({ buyer: testBuyer._id });
    console.log(`📦 Existing orders for test buyer: ${existingOrders}`);

    if (existingOrders === 0) {
      // Create some test orders
      const orders = [
        {
          buyer: testBuyer._id,
          seller: new mongoose.Types.ObjectId(), // Dummy seller ID
          items: [{
            listing: new mongoose.Types.ObjectId(), // Dummy listing ID
            quantity: 5,
            price: 2000,
            unit: 'kg',
            total: 10000
          }],
          total: 10500, // 10000 + 500 shipping
          subtotal: 10000,
          tax: 0,
          shipping: 500,
          discount: 0,
          status: 'paid',
          paymentStatus: 'paid',
          paymentMethod: 'paystack',
          shippingAddress: {
            street: '123 Test Street',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            postalCode: '100001',
            phone: '+2348012345678'
          },
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        },
        {
          buyer: testBuyer._id,
          seller: new mongoose.Types.ObjectId(),
          items: [{
            listing: new mongoose.Types.ObjectId(),
            quantity: 3,
            price: 1500,
            unit: 'kg',
            total: 4500
          }],
          total: 5000, // 4500 + 500 shipping
          subtotal: 4500,
          tax: 0,
          shipping: 500,
          discount: 0,
          status: 'delivered',
          paymentStatus: 'paid',
          paymentMethod: 'paystack',
          shippingAddress: {
            street: '123 Test Street',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            postalCode: '100001',
            phone: '+2348012345678'
          },
          createdAt: new Date() // Current month
        }
      ];

      await Order.insertMany(orders);
      console.log('✅ Created test orders');

      // Calculate expected totals
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
      const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() &&
               orderDate.getFullYear() === now.getFullYear();
      });
      const monthlySpent = monthlyOrders.reduce((sum, order) => sum + order.total, 0);

      console.log(`📊 Expected total spent: ₦${totalSpent}`);
      console.log(`📊 Expected monthly spent: ₦${monthlySpent}`);
    }

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
};

// Run script
const runScript = async () => {
  await connectDB();
  await createTestData();
  await mongoose.connection.close();
  console.log('✅ Script completed');
};

runScript();
