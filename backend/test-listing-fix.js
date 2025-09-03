require('dotenv').config();

const mongoose = require('mongoose');
const Listing = require('./models/listing.model');
const Harvest = require('./models/harvest.model');
const User = require('./models/user.model');

async function testListingCreation() {
  console.log('🧪 Testing Listing Creation Fix');
  console.log('================================');

  try {
    // Connect to cloud database
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App';
    console.log('📡 Connecting to MongoDB Atlas...');

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
    });

    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Test data that matches the Listing model
    const testListingData = {
      farmer: new mongoose.Types.ObjectId(), // Mock farmer ID
      harvest: new mongoose.Types.ObjectId(), // Mock harvest ID
      cropName: 'Maize',
      category: 'grains',
      description: 'Fresh maize harvest for testing',
      basePrice: 100,
      quantity: 50,
      availableQuantity: 50,
      unit: 'kg',
      location: 'Lagos, Lagos State, Nigeria', // String as expected by model
      qualityGrade: 'standard',
      status: 'active',
      tags: ['fresh', 'organic']
    };

    console.log('📋 Test listing data:');
    console.log('   Farmer:', testListingData.farmer)
    console.log('   Crop Name:', testListingData.cropName)
    console.log('   Category:', testListingData.category)
    console.log('   Base Price:', testListingData.basePrice)
    console.log('   Quantity:', testListingData.quantity)
    console.log('   Unit:', testListingData.unit)
    console.log('   Location:', testListingData.location)
    console.log('   Quality Grade:', testListingData.qualityGrade)

    // Validate the data
    const testListing = new Listing(testListingData);
    const validationResult = testListing.validateSync();

    if (validationResult) {
      console.log('❌ Validation errors found:');
      Object.keys(validationResult.errors).forEach(key => {
        console.log(`   ${key}: ${validationResult.errors[key].message}`);
      });
      return;
    } else {
      console.log('✅ Data validation passed');
    }

    // Try to create the listing
    console.log('🏗️ Creating test listing...');
    const listing = await Listing.create(testListingData);

    console.log('✅ Test listing created successfully!');
    console.log('   Listing ID:', listing._id);
    console.log('   Created at:', listing.createdAt);

    // Clean up - delete the test listing
    console.log('🧹 Cleaning up test listing...');
    await Listing.findByIdAndDelete(listing._id);
    console.log('✅ Test listing cleaned up');

    console.log('\n🎉 All tests passed! Listing creation is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error code:', error.code);

    if (error.name === 'ValidationError') {
      console.error('❌ Validation errors:', error.errors);
    }

    if (error.name === 'MongoServerError' && error.message.includes('geo keys')) {
      console.error('❌ Geospatial index error still present!');
      console.error('   This means the geospatial index was not properly removed.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

testListingCreation();

