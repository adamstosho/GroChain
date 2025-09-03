const mongoose = require('mongoose')
const Listing = require('./models/listing.model')

async function debugListingValidation() {
  console.log('🔍 Listing Validation Debug')
  console.log('===========================')

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('✅ Connected to database')

    // Test data based on what the user is sending
    const testData = {
      farmer: '507f1f77bcf86cd799439011', // Mock ObjectId
      harvest: '507f1f77bcf86cd799439012', // Mock ObjectId
      cropName: 'Test Crop',
      category: 'grains',
      description: 'Fresh harvest for sale',
      basePrice: 100,
      quantity: 22,
      availableQuantity: 22,
      unit: 'kg',
      images: [],
      location: {
        city: 'Test City',
        state: 'Test State',
        country: 'Nigeria'
      },
      qualityGrade: 'standard',
      status: 'active',
      tags: ['fresh']
    }

    console.log('📋 Test data structure:')
    console.log(JSON.stringify(testData, null, 2))

    // Test 1: Validate with Mongoose
    console.log('\n1️⃣ Testing Mongoose validation...')
    try {
      const testListing = new Listing(testData)
      const validationError = testListing.validateSync()

      if (validationError) {
        console.log('❌ Validation errors:')
        Object.keys(validationError.errors).forEach(key => {
          console.log(`   ${key}: ${validationError.errors[key].message}`)
        })
      } else {
        console.log('✅ Mongoose validation passed')
      }
    } catch (validationError) {
      console.log('❌ Mongoose validation failed:', validationError.message)
    }

    // Test 2: Try to create the listing
    console.log('\n2️⃣ Testing actual creation...')
    try {
      const listing = await Listing.create(testData)
      console.log('✅ Listing created successfully!')
      console.log('   ID:', listing._id)
      console.log('   Crop:', listing.cropName)
      console.log('   Price:', listing.basePrice)

      // Clean up test listing
      await Listing.findByIdAndDelete(listing._id)
      console.log('✅ Test listing cleaned up')

    } catch (createError) {
      console.log('❌ Listing creation failed:')
      console.log('   Error name:', createError.name)
      console.log('   Error code:', createError.code)
      console.log('   Error message:', createError.message)

      if (createError.name === 'ValidationError') {
        console.log('\n📋 Detailed validation errors:')
        Object.keys(createError.errors).forEach(key => {
          console.log(`   ${key}: ${createError.errors[key].message}`)
          console.log(`       Path: ${createError.errors[key].path}`)
          console.log(`       Value: ${createError.errors[key].value}`)
          console.log(`       Kind: ${createError.errors[key].kind}`)
        })
      }

      if (createError.name === 'MongoError' || createError.name === 'MongoServerError') {
        console.log('\n📋 MongoDB specific error:')
        console.log('   This could be due to:')
        console.log('   • Database connection issues')
        console.log('   • Index conflicts')
        console.log('   • Schema validation issues')
      }
    }

    // Test 3: Check schema definition
    console.log('\n3️⃣ Checking Listing schema...')
    const schemaPaths = Object.keys(Listing.schema.paths)
    console.log('Schema paths:', schemaPaths.join(', '))

    // Check required fields
    const requiredFields = schemaPaths.filter(path => {
      const field = Listing.schema.paths[path]
      return field.isRequired && field.path !== '_id' && field.path !== '__v'
    })
    console.log('Required fields:', requiredFields.join(', '))

    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from database')

  } catch (error) {
    console.log('❌ Debug script failed:', error.message)

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB is not running!')
      console.log('   Please start MongoDB first:')
      console.log('   backend\\start-mongodb.bat')
    }
  }
}

debugListingValidation()

