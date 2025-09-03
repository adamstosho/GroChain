const mongoose = require('mongoose')
const Harvest = require('./models/harvest.model')
const Listing = require('./models/listing.model')
const User = require('./models/user.model')

async function debugListingCreation() {
  console.log('🔍 Debugging Listing Creation Issue')
  console.log('===================================')

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('✅ Connected to database')

    // Find the harvest by ID
    const harvestId = '68b471a8c96aaa6cc501df16'
    console.log(`\n🔍 Looking for harvest with ID: ${harvestId}`)

    const harvest = await Harvest.findById(harvestId)
    if (!harvest) {
      console.log('❌ Harvest not found!')
      return
    }

    console.log('✅ Found harvest:', {
      id: harvest._id,
      farmer: harvest.farmer,
      cropType: harvest.cropType,
      quantity: harvest.quantity,
      unit: harvest.unit,
      status: harvest.status,
      location: harvest.location,
      quality: harvest.quality
    })

    // Check harvest status
    if (harvest.status !== 'approved') {
      console.log(`❌ Harvest status is "${harvest.status}", not "approved"`)
      return
    }

    // Find the farmer
    const farmer = await User.findById(harvest.farmer)
    if (!farmer) {
      console.log('❌ Farmer not found!')
      return
    }

    console.log('✅ Found farmer:', farmer.name, farmer.email)

    // Test data for listing creation
    const testData = {
      farmer: harvest.farmer,
      harvest: harvest._id,
      cropName: harvest.cropType,
      category: 'grains', // Simplified for testing
      description: `Fresh ${harvest.cropType} harvest`,
      basePrice: 5000,
      quantity: harvest.quantity,
      availableQuantity: harvest.quantity,
      unit: harvest.unit,
      images: harvest.images || [],
      location: {
        city: 'Test City',
        state: 'Test State',
        country: 'Nigeria'
      },
      qualityGrade: 'standard',
      status: 'active'
    }

    console.log('\n📝 Test data for listing creation:')
    console.log(JSON.stringify(testData, null, 2))

    // Try to create the listing
    console.log('\n🏗️ Attempting to create listing...')
    try {
      const listing = await Listing.create(testData)
      console.log('✅ Listing created successfully!')
      console.log('📊 Created listing:', {
        id: listing._id,
        cropName: listing.cropName,
        basePrice: listing.basePrice,
        quantity: listing.quantity,
        status: listing.status
      })

      // Update harvest status
      harvest.status = 'listed'
      await harvest.save()
      console.log('✅ Harvest status updated to "listed"')

    } catch (createError) {
      console.log('❌ Failed to create listing:')
      console.log('Error name:', createError.name)
      console.log('Error message:', createError.message)

      if (createError.name === 'ValidationError') {
        console.log('Validation errors:')
        Object.keys(createError.errors).forEach(key => {
          console.log(`  - ${key}: ${createError.errors[key].message}`)
        })
      }

      if (createError.name === 'MongoError' || createError.name === 'MongoServerError') {
        console.log('Database error:', createError.code, createError.codeName)
      }
    }

  } catch (error) {
    console.log('❌ Debug script failed:', error.message)
    console.log('Full error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

debugListingCreation()

