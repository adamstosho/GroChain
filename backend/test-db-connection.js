require('dotenv').config()
const mongoose = require('mongoose')

async function testDatabaseConnection() {
  try {
    console.log('🔧 Testing MongoDB connection...')

    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    }

    console.log('📡 Connecting to:', process.env.MONGODB_URI.substring(0, 50) + '...')

    await mongoose.connect(process.env.MONGODB_URI, options)

    console.log('✅ MongoDB connected successfully!')
    console.log('📊 Database:', mongoose.connection.db.databaseName)
    console.log('🌐 Host:', mongoose.connection.host)

    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('📁 Collections found:', collections.length)

    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)

    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Possible issues:')
      console.log('1. Check MongoDB credentials in .env file')
      console.log('2. Verify database user permissions')
      console.log('3. Ensure MongoDB Atlas cluster is accessible')
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Network issues:')
      console.log('1. Check internet connection')
      console.log('2. Verify MongoDB Atlas cluster URL')
      console.log('3. Check firewall settings')
    }
  }
}

testDatabaseConnection()
