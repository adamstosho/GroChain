// Test script for export functionality
const mongoose = require('mongoose')
const User = require('./models/user.model')

async function testExport() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('✅ Connected to MongoDB')

    // Find a farmer user
    const farmer = await User.findOne({ role: 'farmer' }).select('-password')
    if (!farmer) {
      console.log('❌ No farmer user found. Please create sample data first.')
      process.exit(1)
    }

    console.log('👤 Found farmer:', farmer.name, `(${farmer._id})`)

    // Test the generateReport function
    const { generateReport } = require('./controllers/analytics.controller')

    // Mock request and response objects
    const mockReq = {
      body: {
        type: 'user',
        period: '30d',
        format: 'csv',
        filename: `test-export-${Date.now()}`
      },
      user: { id: farmer._id }
    }

    const mockRes = {
      setHeader: (name, value) => console.log(`📄 Header: ${name} = ${value}`),
      status: (code) => ({
        json: (data) => console.log(`📊 Response ${code}:`, data),
        send: (data) => console.log(`📊 Response ${code}:`, typeof data === 'string' ? data.substring(0, 100) + '...' : data)
      }),
      json: (data) => console.log('📊 JSON Response:', data)
    }

    console.log('🔄 Testing export functionality...')
    await generateReport(mockReq, mockRes)

    console.log('✅ Export test completed')
  } catch (error) {
    console.error('❌ Export test failed:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

testExport()
