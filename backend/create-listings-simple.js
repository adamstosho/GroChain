const mongoose = require('mongoose')
const User = require('./models/user.model')
const Listing = require('./models/listing.model')

require('dotenv').config()

async function createSimpleListings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI_PROD)
    console.log('Connected to MongoDB')

    // Find the farmer user
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('No farmer user found')
      return
    }

    console.log('Found farmer:', farmer.name, farmer.email)

    console.log('\n=== CREATING SIMPLE TEST LISTINGS ===')

    // Simple listings data
    const testListings = [
      {
        farmer: farmer._id,
        cropName: "Fresh Maize",
        category: "Grains",
        description: "High-quality fresh maize harvested from organic farms in Ogun State.",
        basePrice: 250,
        unit: "kg",
        quantity: 1000,
        availableQuantity: 1000,
        location: {
          city: "Abeokuta",
          state: "Ogun",
          country: "Nigeria"
        },
        simpleLocation: {
          city: "Abeokuta",
          state: "Ogun",
          country: "Nigeria"
        },
        qualityGrade: "premium",
        organic: true,
        tags: ["maize", "organic", "fresh", "grains"],
        status: "active",
        views: 45,
        favorites: 12,
        orders: 3,
        rating: 4.8,
        reviewCount: 8
      },
      {
        farmer: farmer._id,
        cropName: "Cassava Tubers",
        category: "Root Crops",
        description: "Premium cassava tubers with high starch content.",
        basePrice: 180,
        unit: "kg",
        quantity: 2000,
        availableQuantity: 2000,
        location: {
          city: "Ibadan",
          state: "Oyo",
          country: "Nigeria"
        },
        simpleLocation: {
          city: "Ibadan",
          state: "Oyo",
          country: "Nigeria"
        },
        qualityGrade: "standard",
        organic: false,
        tags: ["cassava", "tubers", "starch"],
        status: "active",
        views: 78,
        favorites: 23,
        orders: 7,
        rating: 4.2,
        reviewCount: 15
      }
    ]

    // Create listings
    for (let i = 0; i < testListings.length; i++) {
      const listingData = testListings[i]
      try {
        console.log(`\n${i + 1}. Creating listing: ${listingData.cropName}`)

        const listing = new Listing(listingData)
        await listing.save()
        console.log(`✅ Created listing: ${listing.cropName}`)
      } catch (error) {
        console.log(`❌ Error creating listing ${listingData.cropName}:`, error.message)
      }
    }

    // Verify listings were created
    const allListings = await Listing.find({ farmer: farmer._id })
    console.log(`\n✅ Total listings created: ${allListings.length}`)
    console.log('Listings:', allListings.map(l => l.cropName))

    console.log('\n🎉 Test listings created successfully!')
    console.log('You can now visit: http://localhost:3000/dashboard/marketplace/listings')

  } catch (error) {
    console.error('Error creating test listings:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

createSimpleListings()
