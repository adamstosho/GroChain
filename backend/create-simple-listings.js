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

    // Simple listings data without complex GeoJSON
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
        qualityGrade: "standard",
        organic: false,
        tags: ["cassava", "tubers", "starch"],
        status: "active",
        views: 78,
        favorites: 23,
        orders: 7,
        rating: 4.2,
        reviewCount: 15
      },
      {
        farmer: farmer._id,
        cropName: "Fresh Tomatoes",
        category: "Vegetables",
        description: "Juicy red tomatoes harvested at peak ripeness.",
        basePrice: 400,
        unit: "kg",
        quantity: 500,
        availableQuantity: 500,
        location: {
          city: "Lagos",
          state: "Lagos",
          country: "Nigeria"
        },
        qualityGrade: "premium",
        organic: true,
        tags: ["tomatoes", "vegetables", "fresh", "organic"],
        status: "active",
        views: 92,
        favorites: 31,
        orders: 12,
        rating: 4.9,
        reviewCount: 22
      },
      {
        farmer: farmer._id,
        cropName: "Yam Tubers",
        category: "Root Crops",
        description: "Large yam tubers suitable for both local consumption and export.",
        basePrice: 350,
        unit: "kg",
        quantity: 800,
        availableQuantity: 800,
        location: {
          city: "Ilorin",
          state: "Kwara",
          country: "Nigeria"
        },
        qualityGrade: "standard",
        organic: false,
        tags: ["yam", "tubers", "export"],
        status: "draft",
        views: 0,
        favorites: 0,
        orders: 0,
        rating: 0,
        reviewCount: 0
      },
      {
        farmer: farmer._id,
        cropName: "Groundnut Seeds",
        category: "Oilseeds",
        description: "High-quality groundnut seeds with excellent oil content.",
        basePrice: 280,
        unit: "kg",
        quantity: 1500,
        availableQuantity: 1500,
        location: {
          city: "Kano",
          state: "Kano",
          country: "Nigeria"
        },
        qualityGrade: "premium",
        organic: true,
        tags: ["groundnut", "oilseeds", "oil"],
        status: "active",
        views: 156,
        favorites: 45,
        orders: 18,
        rating: 4.6,
        reviewCount: 32
      }
    ]

    // Create listings
    const createdListings = []
    for (let i = 0; i < testListings.length; i++) {
      const listingData = testListings[i]
      try {
        console.log(`\n${i + 1}. Creating listing: ${listingData.cropName}`)

        const listing = new Listing(listingData)
        const savedListing = await listing.save()

        createdListings.push(savedListing)
        console.log(`✅ Created listing: ${savedListing.cropName} (${savedListing._id})`)
      } catch (error) {
        console.log(`❌ Error creating listing ${listingData.cropName}:`, error.message)
      }
    }

    // Verify listings were created
    console.log('\n=== VERIFYING CREATED LISTINGS ===')
    const allListings = await Listing.find({ farmer: farmer._id })
    console.log(`✅ Total listings created: ${allListings.length}`)
    console.log('Listings summary:')
    allListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.cropName} - ₦${listing.basePrice}/${listing.unit} - ${listing.status} (${listing.category})`)
    })

    console.log('\n=== STATISTICS ===')
    const activeListings = allListings.filter(l => l.status === 'active').length
    const draftListings = allListings.filter(l => l.status === 'draft').length
    const totalViews = allListings.reduce((sum, l) => sum + (l.views || 0), 0)
    const totalOrders = allListings.reduce((sum, l) => sum + (l.orders || 0), 0)
    const totalRevenue = allListings.reduce((sum, l) => sum + ((l.orders || 0) * l.basePrice), 0)
    const averagePrice = allListings.length > 0
      ? allListings.reduce((sum, l) => sum + l.basePrice, 0) / allListings.length
      : 0

    console.log(`Active listings: ${activeListings}`)
    console.log(`Draft listings: ${draftListings}`)
    console.log(`Total views: ${totalViews}`)
    console.log(`Total orders: ${totalOrders}`)
    console.log(`Total revenue: ₦${totalRevenue.toLocaleString()}`)
    console.log(`Average price: ₦${averagePrice.toFixed(0)}`)

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
