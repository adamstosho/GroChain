const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const User = require('./models/user.model');
const Partner = require('./models/partner.model');

async function testUserPartnerLogic() {
  try {
    console.log('🧪 Testing User-Partner logic...');
    
    // Find the partner user
    const partnerUser = await User.findOne({ email: 'partner@test.com' });
    console.log('👤 Partner user found:', partnerUser ? 'Yes' : 'No');
    if (partnerUser) {
      console.log('👤 User details:', {
        id: partnerUser._id,
        name: partnerUser.name,
        email: partnerUser.email,
        phone: partnerUser.phone,
        location: partnerUser.location
      });
    }
    
    // Check if partner profile exists
    const existingPartner = await Partner.findOne({ email: 'partner@test.com' });
    console.log('🤝 Existing partner profile:', existingPartner ? 'Yes' : 'No');
    
    if (!existingPartner) {
      console.log('🔧 Creating partner profile...');
      
      // Try to create partner with the exact data from controller
      const partnerData = {
        name: partnerUser.name,
        email: partnerUser.email,
        phone: partnerUser.phone || '+234000000000',
        organization: `${partnerUser.name} Organization`,
        type: 'cooperative',
        location: partnerUser.location || 'Nigeria',
        status: 'active',
        commissionRate: 0.05
      };
      
      console.log('📝 Partner data to create:', partnerData);
      
      const newPartner = new Partner(partnerData);
      const savedPartner = await newPartner.save();
      console.log('✅ Partner created successfully:', savedPartner._id);
      
      // Clean up
      await Partner.findByIdAndDelete(savedPartner._id);
      console.log('🧹 Test partner cleaned up');
    }
    
  } catch (error) {
    console.error('💥 User-Partner test error:', error);
    console.error('💥 Error stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
}

testUserPartnerLogic();

