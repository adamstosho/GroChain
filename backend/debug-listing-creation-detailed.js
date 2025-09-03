const mongoose = require('mongoose')
const Harvest = require('./models/harvest.model')
const Listing = require('./models/listing.model')

async function debugListingCreationDetailed() {
  console.log('🔍 Detailed Listing Creation Debug')
  console.log('===================================')

  try {
    // Connect to database
    console.log('🔌 Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('✅ Connected to database')

    // Find the harvest by ID from the error log
    const harvestId = '68b471a8c96aaa6cc501df16'
    console.log(`\n🔍 Looking for harvest with ID: ${harvestId}`)

    const harvest = await Harvest.findById(harvestId)
    if (!harvest) {
      console.log('❌ Harvest not found!')
      return
    }

    console.log('✅ Found harvest:')
    console.log('   ID:', harvest._id)
    console.log('   Farmer:', harvest.farmer)
    console.log('   Crop Type:', harvest.cropType)
    console.log('   Quantity:', harvest.quantity)
    console.log('   Unit:', harvest.unit)
    console.log('   Status:', harvest.status)
    console.log('   Location:', harvest.location)
    console.log('   Quality:', harvest.quality)
    console.log('   Description:', harvest.description)
    console.log('   Images:', harvest.images)

    // Check harvest status
    if (harvest.status !== 'approved') {
      console.log(`❌ Harvest status is "${harvest.status}", not "approved"`)
      return
    }

    // Check if a listing already exists for this harvest
    console.log('\n🔍 Checking if listing already exists...')
    const existingListing = await Listing.findOne({ harvest: harvest._id })
    if (existingListing) {
      console.log('❌ Listing already exists for this harvest!')
      console.log('   Existing listing ID:', existingListing._id)
      console.log('   Status:', existingListing.status)
      return
    }

    console.log('✅ No existing listing found')

    // Prepare test data
    console.log('\n📝 Preparing listing data...')
    const locationParts = harvest.location ? harvest.location.split(',') : ['', '']
    const city = locationParts[0]?.trim() || 'Unknown City'
    const state = locationParts[1]?.trim() || 'Unknown State'

    const listingData = {
      farmer: harvest.farmer,
      harvest: harvest._id,
      cropName: harvest.cropType || 'Unknown Crop',
      category: 'grains', // Default category
      description: harvest.description || `Fresh ${harvest.cropType || 'crop'} harvest`,
      basePrice: 5000,
      quantity: harvest.quantity || 100,
      availableQuantity: harvest.quantity || 100,
      unit: harvest.unit || 'kg',
      images: harvest.images || [],
      location: {
        city: city,
        state: state,
        country: 'Nigeria'
      },
      qualityGrade: harvest.quality === 'excellent' ? 'premium' : harvest.quality === 'good' ? 'standard' : 'basic',
      status: 'active',
      tags: harvest.quality ? [harvest.quality] : []
    }

    console.log('📋 Final listing data:')
    console.log(JSON.stringify(listingData, null, 2))

    // Try to create the listing
    console.log('\n🏗️ Attempting to create listing...')
    try {
      const listing = await Listing.create(listingData)
      console.log('✅ SUCCESS! Listing created successfully!')
      console.log('   Listing ID:', listing._id)
      console.log('   Crop Name:', listing.cropName)
      console.log('   Price:', listing.basePrice)
      console.log('   Status:', listing.status)

      // Update harvest status
      harvest.status = 'listed'
      await harvest.save()
      console.log('✅ Harvest status updated to "listed"')

      console.log('\n🎉 COMPLETE SUCCESS!')
      console.log('The issue has been resolved!')

    } catch (createError) {
      console.log('\n❌ FAILED to create listing!')
      console.log('Error type:', createError.name)
      console.log('Error code:', createError.code)
      console.log('Error message:', createError.message)

      if (createError.name === 'ValidationError') {
        console.log('\n📋 Validation Errors:')
        Object.keys(createError.errors).forEach(key => {
          console.log(`   ${key}: ${createError.errors[key].message}`)
        })
      }

      if (createError.code === 11000) {
        console.log('\n📋 Duplicate Key Error - this usually means:')
        console.log('   - A listing already exists for this harvest')
        console.log('   - There\'s a unique index constraint violation')
      }

      if (createError.name === 'MongoError' || createError.name === 'MongoServerError') {
        console.log('\n📋 MongoDB Error:')
        console.log('   This could be due to:')
        console.log('   - Database connection issues')
        console.log('   - Index conflicts')
        console.log('   - Schema validation issues')
      }
    }

  } catch (error) {
    console.log('\n❌ Debug script failed:', error.message)
    console.log('Stack trace:', error.stack)
  } finally {
    console.log('\n🔌 Disconnecting from database...')
    await mongoose.disconnect()
    console.log('✅ Disconnected')
  }
}

debugListingCreationDetailed()

