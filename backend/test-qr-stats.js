const mongoose = require('mongoose');
require('dotenv').config();

async function testQRStatsAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain');

    const QRCodeModel = require('./models/qrcode.model');
    const User = require('./models/user.model');

    // Get first user
    const users = await User.find({}).limit(1);
    if (users.length === 0) {
      console.log('No users found');
      return;
    }

    const userId = users[0]._id;
    console.log('Testing with user ID:', userId);

    // Test the getStats method directly
    const stats = await QRCodeModel.getStats(userId);
    console.log('Direct model stats:', stats);

    // Test what the controller would return
    const QRCodeController = require('./controllers/qrCode.controller');

    // Mock request/response objects
    const mockReq = {
      user: { id: userId }
    };

    const mockRes = {
      json: (data) => {
        console.log('Controller response:', JSON.stringify(data, null, 2));
        return data;
      },
      status: (code) => ({
        json: (data) => {
          console.log(`Controller error response (${code}):`, JSON.stringify(data, null, 2));
          return data;
        }
      })
    };

    // Call the controller method
    await QRCodeController.getQRCodeStats(mockReq, mockRes);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testQRStatsAPI();
