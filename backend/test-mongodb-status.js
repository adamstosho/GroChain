const { MongoClient } = require('mongodb')
const mongoose = require('mongoose')

async function testMongoDBStatus() {
  console.log('🔍 MongoDB Status Test')
  console.log('=====================')

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain'

  console.log('Testing connection to:', mongoUri)
  console.log('')

  // Test 1: Basic connection test
  console.log('1️⃣ Testing basic MongoDB connection...')

  try {
    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    })

    await client.connect()
    console.log('✅ MongoDB connection successful!')

    // Get database info
    const db = client.db()
    const collections = await db.collections()
    console.log(`📊 Database: ${db.databaseName}`)
    console.log(`📁 Collections: ${collections.length}`)

    // List collection names
    const collectionNames = collections.map(col => col.collectionName)
    console.log('Available collections:', collectionNames.join(', '))

    await client.close()
    console.log('✅ Connection closed successfully')

  } catch (error) {
    console.log('❌ MongoDB connection failed!')
    console.log('Error:', error.message)
    console.log('Code:', error.code)

    if (error.message.includes('ECONNREFUSED')) {
      console.log('')
      console.log('💡 SOLUTION: MongoDB is not running!')
      console.log('')
      console.log('🔧 How to start MongoDB:')
      console.log('')
      console.log('Option 1 - Windows Service:')
      console.log('  1. Open Command Prompt as Administrator')
      console.log('  2. Run: net start MongoDB')
      console.log('')
      console.log('Option 2 - Manual Start:')
      console.log('  1. Open Command Prompt')
      console.log('  2. Run: mongod --dbpath "C:\\data\\db"')
      console.log('')
      console.log('Option 3 - Use our helper script:')
      console.log('  1. Double-click: backend\\start-mongodb.bat')
      console.log('     OR')
      console.log('  1. Run: powershell backend\\start-mongodb.ps1')
      console.log('')
      console.log('📥 If MongoDB is not installed:')
      console.log('  Download from: https://www.mongodb.com/try/download/community')
      console.log('')
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 SOLUTION: Authentication failed')
      console.log('  Check your MongoDB credentials in .env file')
    } else {
      console.log('💡 Unknown connection error')
      console.log('  Check MongoDB logs for more details')
    }

    return false
  }

  // Test 2: Mongoose connection test
  console.log('')
  console.log('2️⃣ Testing Mongoose connection...')

  try {
    await mongoose.connect(mongoUri)
    console.log('✅ Mongoose connection successful!')
    console.log('Connection state:', mongoose.connection.readyState)

    // Test models
    const Harvest = require('./models/harvest.model')
    const Listing = require('./models/listing.model')

    const harvestCount = await Harvest.countDocuments()
    const listingCount = await Listing.countDocuments()

    console.log(`📊 Harvests in database: ${harvestCount}`)
    console.log(`📊 Listings in database: ${listingCount}`)

    await mongoose.disconnect()
    console.log('✅ Mongoose disconnected successfully')

  } catch (mongooseError) {
    console.log('❌ Mongoose connection failed!')
    console.log('Error:', mongooseError.message)
    return false
  }

  // Test 3: Simulate the listing creation process
  console.log('')
  console.log('3️⃣ Testing listing creation simulation...')

  try {
    await mongoose.connect(mongoUri)
    const Harvest = require('./models/harvest.model')
    const Listing = require('./models/listing.model')

    // Find the specific harvest
    const harvestId = '68b471a8c96aaa6cc501df16'
    const harvest = await Harvest.findById(harvestId)

    if (!harvest) {
      console.log('❌ Test harvest not found')
    } else {
      console.log('✅ Found test harvest:', harvest.cropType)

      // Check if listing already exists
      const existingListing = await Listing.findOne({ harvest: harvest._id })
      if (existingListing) {
        console.log('⚠️ Listing already exists for this harvest')
        console.log('Listing ID:', existingListing._id)
      } else {
        console.log('✅ Ready to create new listing')
      }
    }

    await mongoose.disconnect()

  } catch (simError) {
    console.log('❌ Simulation failed:', simError.message)
    return false
  }

  console.log('')
  console.log('🎉 ALL TESTS PASSED!')
  console.log('MongoDB is running and ready for listing creation.')
  console.log('')
  console.log('✅ You can now try creating a harvest listing!')
  console.log('   Go to: http://localhost:3000/dashboard/marketplace/new?harvestId=68b471a8c96aaa6cc501df16')

  return true
}

testMongoDBStatus()

