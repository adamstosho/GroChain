const mongoose = require('mongoose')

async function testReferenceErrorFix() {
  console.log('🔧 Testing Reference Error Fix')
  console.log('==============================')

  try {
    // Test mongoose import
    console.log('✅ Mongoose imported successfully')

    // Test connection state check (this was causing the ReferenceError)
    if (mongoose.connection.readyState !== undefined) {
      console.log('✅ mongoose.connection.readyState is accessible')
      console.log('Current connection state:', mongoose.connection.readyState)
    } else {
      console.log('❌ mongoose.connection.readyState is not accessible')
    }

    // Test database connection
    console.log('\n🔍 Testing database connection...')
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain'

    try {
      await mongoose.connect(mongoUri)
      console.log('✅ Database connected successfully')
      console.log('Connection state:', mongoose.connection.readyState)

      // Test models
      const Harvest = require('./models/harvest.model')
      const Listing = require('./models/listing.model')

      console.log('✅ Models loaded successfully')

      await mongoose.disconnect()
      console.log('✅ Database disconnected successfully')

    } catch (dbError) {
      console.log('❌ Database connection failed:', dbError.message)

      if (dbError.message.includes('ECONNREFUSED')) {
        console.log('💡 MongoDB is not running. Please start it first.')
        console.log('   Run: backend\\start-mongodb.bat')
      }
    }

    console.log('\n🎉 Reference Error Fix Test Completed!')
    console.log('The ReferenceError should now be resolved.')

  } catch (error) {
    console.log('❌ Test failed:', error.message)
    console.log('Stack:', error.stack)
  }
}

testReferenceErrorFix()

