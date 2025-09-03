const mongoose = require('mongoose');
require('dotenv').config();

async function fixTransactions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./models/user.model');
    const Transaction = require('./models/transaction.model');

    // Find first user
    const user = await User.findOne({});
    if (!user) {
      console.log('No users found in database');
      return;
    }

    console.log('Using userId:', user._id);

    // Update sample transactions
    const sampleResult = await Transaction.updateMany(
      { reference: { $regex: '^SAMPLE_' } },
      { userId: user._id }
    );

    // Update refund transaction
    const refundResult = await Transaction.updateOne(
      { reference: 'REFUND_001' },
      { userId: user._id }
    );

    console.log('Updated sample transactions:', sampleResult.modifiedCount);
    console.log('Updated refund transaction:', refundResult.modifiedCount);

    // Verify the updates
    const transactions = await Transaction.find({
      $or: [
        { reference: { $regex: '^SAMPLE_' } },
        { reference: 'REFUND_001' }
      ]
    });

    console.log('Sample transactions:');
    transactions.forEach(tx => {
      console.log(`- ${tx.reference}: ${tx.status} - userId: ${tx.userId}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixTransactions();