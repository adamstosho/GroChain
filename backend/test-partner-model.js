const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import Partner model
const Partner = require('./models/partner.model');

async function testPartnerModel() {
  try {
    console.log('🧪 Testing Partner model creation...');
    
    // Test data
    const testPartner = new Partner({
      name: 'Test Partner',
      email: 'test@partner.com',
      phone: '+234000000000',
      organization: 'Test Organization',
      type: 'cooperative',
      location: 'Nigeria',
      status: 'active',
      commissionRate: 0.05
    });
    
    console.log('📝 Partner data prepared:', testPartner);
    
    // Try to save
    const savedPartner = await testPartner.save();
    console.log('✅ Partner saved successfully:', savedPartner._id);
    
    // Try to find
    const foundPartner = await Partner.findOne({ email: 'test@partner.com' });
    console.log('🔍 Partner found:', foundPartner ? 'Yes' : 'No');
    
    // Clean up
    await Partner.findByIdAndDelete(savedPartner._id);
    console.log('🧹 Test partner cleaned up');
    
  } catch (error) {
    console.error('💥 Partner model test error:', error);
    console.error('💥 Error stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
}

testPartnerModel();

