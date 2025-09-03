// Check what location data is stored for the specific listing
const mongoose = require('mongoose')
require('dotenv').config()

async function checkListingLocation() {
  console.log('🔍 Checking Listing Location Data')
  console.log('=================================')

  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const Listing = require('./models/listing.model')

    // Find the specific listing
    const listingId = '68b6125e7ce0a13ef96208d2'
    const listing = await Listing.findById(listingId).populate('farmer', 'name location farmLocation')

    if (!listing) {
      console.log('❌ Listing not found')
      return
    }

    console.log('\n📋 Listing Details:')
    console.log('==================')
    console.log('ID:', listing._id)
    console.log('Crop Name:', listing.cropName)
    console.log('Location (raw):', listing.location)
    console.log('Location type:', typeof listing.location)

    console.log('\n👨‍🌾 Farmer Details:')
    console.log('===================')
    if (listing.farmer) {
      console.log('Name:', listing.farmer.name)
      console.log('Location:', listing.farmer.location)
      console.log('Farm Location:', listing.farmer.farmLocation)
    } else {
      console.log('No farmer data populated')
    }

    console.log('\n📊 Location Analysis:')
    console.log('===================')

    // Check if location is a string or object
    if (typeof listing.location === 'string') {
      console.log('✅ Location is a string:', listing.location)
      console.log('💡 This explains why frontend shows "Unknown City, Unknown State"')
      console.log('💡 The frontend expects location as an object with city/state properties')
    } else if (typeof listing.location === 'object') {
      console.log('✅ Location is an object:', JSON.stringify(listing.location, null, 2))
      if (listing.location.city && listing.location.state) {
        console.log('✅ Location has city and state properties')
      } else {
        console.log('❌ Location object missing city/state properties')
      }
    } else {
      console.log('❓ Location is neither string nor object:', listing.location)
    }

    console.log('\n🔧 SOLUTION OPTIONS:')
    console.log('===================')
    console.log('1. Update frontend to handle string location')
    console.log('2. Update database to store location as object')
    console.log('3. Create a mapping function to parse string location')

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkListingLocation()

