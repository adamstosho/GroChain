// Test script to verify spending calculations
const mongoose = require('mongoose');

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

// Test spending calculations
const testSpendingCalculations = async () => {
  try {
    const Order = require('./backend/models/order.model');
    const User = require('./backend/models/user.model');

    // Get all buyers
    const buyers = await User.find({ role: 'buyer' });
    console.log(`📊 Found ${buyers.length} buyers`);

    if (buyers.length === 0) {
      console.log('⚠️ No buyers found in database');
      return;
    }

    for (const buyer of buyers.slice(0, 3)) { // Test first 3 buyers
      console.log(`\n👤 Testing buyer: ${buyer.name} (${buyer._id})`);

      // Get all orders for this buyer
      const allOrders = await Order.find({ buyer: buyer._id });
      console.log(`📦 Total orders: ${allOrders.length}`);

      // Get delivered orders
      const deliveredOrders = allOrders.filter(order => order.status === 'delivered');
      console.log(`✅ Delivered orders: ${deliveredOrders.length}`);

      // Calculate total spent manually
      const totalSpent = deliveredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      console.log(`💰 Manual total spent: ₦${totalSpent.toLocaleString()}`);

      // Get current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Get monthly orders
      const monthlyOrders = deliveredOrders.filter(order =>
        order.createdAt >= startOfMonth && order.createdAt <= endOfMonth
      );
      const monthlySpent = monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      console.log(`📅 Manual monthly spent: ₦${monthlySpent.toLocaleString()}`);
      console.log(`📅 Monthly orders: ${monthlyOrders.length}`);

      // Test aggregation query (same as backend)
      const totalSpentResult = await Order.aggregate([
        { $match: { buyer: buyer._id, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);

      const aggTotalSpent = totalSpentResult[0]?.total || 0;
      console.log(`🔢 Aggregation total spent: ₦${aggTotalSpent.toLocaleString()}`);

      const monthlySpentResult = await Order.aggregate([
        {
          $match: {
            buyer: buyer._id,
            status: 'delivered',
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);

      const aggMonthlySpent = monthlySpentResult[0]?.total || 0;
      console.log(`🔢 Aggregation monthly spent: ₦${aggMonthlySpent.toLocaleString()}`);

      // Check for discrepancies
      if (totalSpent !== aggTotalSpent) {
        console.log(`⚠️ DISCREPANCY: Manual (${totalSpent}) vs Aggregation (${aggTotalSpent})`);
      } else {
        console.log(`✅ Total spent calculations match`);
      }

      if (monthlySpent !== aggMonthlySpent) {
        console.log(`⚠️ DISCREPANCY: Manual (${monthlySpent}) vs Aggregation (${aggMonthlySpent})`);
      } else {
        console.log(`✅ Monthly spent calculations match`);
      }

      // Show sample orders
      if (deliveredOrders.length > 0) {
        console.log(`📋 Sample delivered orders:`);
        deliveredOrders.slice(0, 2).forEach(order => {
          console.log(`  - Order: ${order._id}, Total: ₦${order.total}, Date: ${order.createdAt}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run test
const runTest = async () => {
  await connectDB();
  await testSpendingCalculations();
  await mongoose.connection.close();
  console.log('✅ Test completed');
};

runTest();
