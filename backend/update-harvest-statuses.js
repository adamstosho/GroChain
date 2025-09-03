const mongoose = require('mongoose');
require('dotenv').config();

async function checkAndUpdateHarvestStatuses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Harvest = require('./models/harvest.model');

    // Check current harvest statuses
    console.log('🔍 Checking current harvest statuses...');
    const harvests = await Harvest.find({}, 'cropType status quantity farmer');

    console.log('\n📊 Current Harvest Statuses:');
    harvests.forEach((h, i) => {
      console.log(`${i+1}. ${h.cropType} - Status: ${h.status} - Quantity: ${h.quantity}kg - Farmer: ${h.farmer}`);
    });

    // Update all harvests with status 'listed' to 'approved'
    console.log('\n🔄 Updating harvest statuses from "listed" to "approved"...');
    const updateResult = await Harvest.updateMany(
      { status: 'listed' },
      { $set: { status: 'approved' } }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} harvests to status "approved"`);

    // Verify the updates
    console.log('\n📈 Verifying updated harvest statuses...');
    const updatedHarvests = await Harvest.find({}, 'cropType status quantity');

    console.log('\n✨ Updated Harvest Statuses:');
    updatedHarvests.forEach((h, i) => {
      console.log(`${i+1}. ${h.cropType} - Status: ${h.status} - Quantity: ${h.quantity}kg`);
    });

    await mongoose.disconnect();
    console.log('\n🎉 Database updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndUpdateHarvestStatuses();

