const mongoose = require('mongoose');
require('dotenv').config();

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Order = require('./models/order.model');

    const count = await Order.countDocuments();
    console.log('Total orders in database:', count);

    if (count > 0) {
      const orders = await Order.find().limit(3).populate('buyer', 'name email').populate('items.listing', 'cropName images');
      console.log('Sample orders:');
      orders.forEach((order, i) => {
        console.log(`Order ${i+1}:`);
        console.log(`  - ID: ${order._id}`);
        console.log(`  - Buyer: ${order.buyer?.name || 'Unknown'}`);
        console.log(`  - Status: ${order.status}`);
        console.log(`  - Payment Status: ${order.paymentStatus}`);
        console.log(`  - Total: ₦${order.total}`);
        console.log(`  - Items: ${order.items.length}`);
        if (order.items.length > 0) {
          console.log(`    - First item: ${order.items[0].listing?.cropName || 'Unknown'} (${order.items[0].quantity} ${order.items[0].unit})`);
        }
        console.log('');
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOrders();

