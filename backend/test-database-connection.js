const mongoose = require('mongoose')
const Harvest = require('./models/harvest.model')
const Listing = require('./models/listing.model')
const User = require('./models/user.model')

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection and Models')
  console.log('=========================================')

  try {
    // Test 1: Connect to database
    console.log('\n1️⃣ Testing database connection...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('✅ Database connected successfully')

    // Test 2: Check collections exist
    console.log('\n2️⃣ Testing collections...')

    const collections = await mongoose.connection.db.listCollections().toArray()
    const collectionNames = collections.map(col => col.name)
    console.log('Available collections:', collectionNames)

    // Test 3: Check models are working
    console.log('\n3️⃣ Testing model definitions...')

    try {
      // Test Harvest model
      const harvestCount = await Harvest.countDocuments()
      console.log('✅ Harvest model working - Count:', harvestCount)

      // Test Listing model
      const listingCount = await Listing.countDocuments()
      console.log('✅ Listing model working - Count:', listingCount)

      // Test User model
      const userCount = await User.countDocuments()
      console.log('✅ User model working - Count:', userCount)

    } catch (modelError) {
      console.log('❌ Model test failed:', modelError.message)
    }

    // Test 4: Find the specific harvest
    console.log('\n4️⃣ Testing specific harvest...')
    const harvestId = '68b471a8c96aaa6cc501df16'

    try {
      const harvest = await Harvest.findById(harvestId)
      if (harvest) {
        console.log('✅ Harvest found:')
        console.log('   ID:', harvest._id)
        console.log('   Farmer:', harvest.farmer)
        console.log('   Crop Type:', harvest.cropType)
        console.log('   Quantity:', harvest.quantity)
        console.log('   Unit:', harvest.unit)
        console.log('   Status:', harvest.status)
        console.log('   Location:', harvest.location)
        console.log('   Quality:', harvest.quality)
        console.log('   Description:', harvest.description)

        // Check if harvest is already listed
        const existingListing = await Listing.findOne({ harvest: harvest._id })
        if (existingListing) {
          console.log('⚠️ WARNING: Harvest already has a listing!')
          console.log('   Listing ID:', existingListing._id)
          console.log('   Listing Status:', existingListing.status)
        } else {
          console.log('✅ Harvest is not listed yet - ready to create listing')
        }

        // Test 5: Try to create a listing (simulation)
        console.log('\n5️⃣ Testing listing creation simulation...')

        const listingData = {
          farmer: harvest.farmer,
          harvest: harvest._id,
          cropName: harvest.cropType || 'Test Crop',
          category: 'grains',
          description: harvest.description || `Fresh ${harvest.cropType} harvest`,
          basePrice: 5000,
          quantity: harvest.quantity || 100,
          availableQuantity: harvest.quantity || 100,
          unit: harvest.unit || 'kg',
          location: {
            city: 'Test City',
            state: 'Test State',
            country: 'Nigeria'
          },
          qualityGrade: 'standard',
          status: 'active'
        }

        console.log('📋 Simulated listing data:')
        console.log(JSON.stringify(listingData, null, 2))

        // Validate the data structure
        const requiredFields = ['farmer', 'cropName', 'category', 'description', 'basePrice', 'quantity', 'availableQuantity', 'unit']
        const missingFields = requiredFields.filter(field => !listingData[field])

        if (missingFields.length > 0) {
          console.log('❌ Missing required fields:', missingFields)
        } else {
          console.log('✅ All required fields present')

          // Try actual creation
          console.log('\n🏗️ Attempting actual listing creation...')
          try {
            const testListing = await Listing.create(listingData)
            console.log('✅ Test listing created successfully!')
            console.log('   Listing ID:', testListing._id)

            // Clean up test listing
            await Listing.findByIdAndDelete(testListing._id)
            console.log('✅ Test listing cleaned up')

          } catch (createError) {
            console.log('❌ Listing creation failed:', createError.message)
            console.log('Error type:', createError.name)
            console.log('Error code:', createError.code)

            if (createError.name === 'ValidationError') {
              console.log('Validation errors:', createError.errors)
            }
          }
        }

      } else {
        console.log('❌ Harvest not found with ID:', harvestId)
      }

    } catch (harvestError) {
      console.log('❌ Error finding harvest:', harvestError.message)
    }

  } catch (error) {
    console.log('\n❌ Database test failed:')
    console.log('Error:', error.message)
    console.log('Code:', error.code)

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB is not running!')
      console.log('   Please start MongoDB service')
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 Database authentication failed')
      console.log('   Check your MongoDB credentials in .env file')
    }
  } finally {
    try {
      await mongoose.disconnect()
      console.log('\n🔌 Disconnected from database')
    } catch (disconnectError) {
      console.log('Error disconnecting:', disconnectError.message)
    }
  }
}

testDatabaseConnection()

