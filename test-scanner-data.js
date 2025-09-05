const mongoose = require('mongoose');
const Harvest = require('./backend/models/harvest.model');

async function checkAndCreateTestData() {
  try {
    await mongoose.connect('mongodb+srv://grochain:grochain123@cluster0.8xqjq.mongodb.net/grochain?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');

    // Check existing harvests
    const harvests = await Harvest.find().limit(5);
    console.log('Found harvests:', harvests.length);

    if (harvests.length > 0) {
      console.log('Sample harvest batchId:', harvests[0].batchId);
      console.log('You can test the scanner with batch ID:', harvests[0].batchId);
    } else {
      console.log('No harvests found, creating test harvest...');
      
      // Create a test harvest
      const testHarvest = new Harvest({
        farmer: '68b0998fb26814228fb2138d', // Use the buyer ID we know exists
        cropType: 'Test Maize',
        quantity: 100,
        unit: 'kg',
        quality: 'Premium',
        location: 'Lagos, Nigeria',
        harvestDate: new Date(),
        batchId: 'TEST-BATCH-2024-001',
        status: 'approved'
      });

      await testHarvest.save();
      console.log('Test harvest created with batch ID: TEST-BATCH-2024-001');
      console.log('You can now test the scanner with this batch ID');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndCreateTestData();
