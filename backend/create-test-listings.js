const mongoose = require('mongoose')
const User = require('./models/user.model')
const Listing = require('./models/listing.model')
const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')

require('dotenv').config()

async function createTestListings() {
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

    // Generate JWT token
    const token = jwt.sign(
      { id: farmer._id, email: farmer.email, role: farmer.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    console.log('Generated JWT token for testing')

    const baseUrl = 'http://localhost:5000'
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    console.log('\n=== CREATING TEST LISTINGS ===')

    // Sample listings data
    const testListings = [
      {
        cropName: "Fresh Maize",
        category: "Grains",
        description: "High-quality fresh maize harvested from organic farms in Ogun State. Perfect for food processing and direct consumption.",
        basePrice: 250,
        unit: "kg",
        quantity: 1000,
        location: {
          city: "Abeokuta",
          state: "Ogun",
          country: "Nigeria",
          coordinates: [3.3792, 6.5244]
        },
        qualityGrade: "Premium",
        organic: true,
        tags: ["maize", "organic", "fresh", "grains"],
        status: "active"
      },
      {
        cropName: "Cassava Tubers",
        category: "Root Crops",
        description: "Premium cassava tubers with high starch content. Ideal for garri production and industrial processing.",
        basePrice: 180,
        unit: "kg",
        quantity: 2000,
        location: {
          city: "Ibadan",
          state: "Oyo",
          country: "Nigeria",
          coordinates: [3.8962, 7.3776]
        },
        qualityGrade: "Standard",
        organic: false,
        tags: ["cassava", "tubers", "starch", "processing"],
        status: "active"
      },
      {
        cropName: "Fresh Tomatoes",
        category: "Vegetables",
        description: "Juicy red tomatoes harvested at peak ripeness. Grown without chemical pesticides in Lagos area.",
        basePrice: 400,
        unit: "kg",
        quantity: 500,
        location: {
          city: "Lagos",
          state: "Lagos",
          country: "Nigeria",
          coordinates: [3.3792, 6.5244]
        },
        qualityGrade: "Premium",
        organic: true,
        tags: ["tomatoes", "vegetables", "fresh", "organic"],
        status: "active"
      },
      {
        cropName: "Yam Tubers",
        category: "Root Crops",
        description: "Large yam tubers suitable for both local consumption and export. Harvested from fertile farmland in Kwara State.",
        basePrice: 350,
        unit: "kg",
        quantity: 800,
        location: {
          city: "Ilorin",
          state: "Kwara",
          country: "Nigeria",
          coordinates: [4.5418, 8.5227]
        },
        qualityGrade: "Standard",
        organic: false,
        tags: ["yam", "tubers", "export", "local"],
        status: "draft"
      },
      {
        cropName: "Groundnut Seeds",
        category: "Oilseeds",
        description: "High-quality groundnut seeds with excellent oil content. Perfect for oil extraction and direct consumption.",
        basePrice: 280,
        unit: "kg",
        quantity: 1500,
        location: {
          city: "Kano",
          state: "Kano",
          country: "Nigeria",
          coordinates: [8.5167, 12.0000]
        },
        qualityGrade: "Premium",
        organic: true,
        tags: ["groundnut", "oilseeds", "oil", "organic"],
        status: "active"
      },
      {
        cropName: "Fresh Okra",
        category: "Vegetables",
        description: "Tender okra pods harvested fresh daily. Grown in rich soil conditions for maximum nutrition.",
        basePrice: 320,
        unit: "kg",
        quantity: 300,
        location: {
          city: "Benin City",
          state: "Edo",
          country: "Nigeria",
          coordinates: [5.6220, 6.3390]
        },
        qualityGrade: "Standard",
        organic: false,
        tags: ["okra", "vegetables", "fresh", "nutrition"],
        status: "active"
      }
    ]

    // Create listings via API
    for (let i = 0; i < testListings.length; i++) {
      const listing = testListings[i]
      try {
        console.log(`\n${i + 1}. Creating listing: ${listing.cropName}`)

        const createResponse = await fetch(`${baseUrl}/api/marketplace/listings`, {
          method: 'POST',
          headers,
          body: JSON.stringify(listing)
        })

        console.log(`Create listing response status:`, createResponse.status)
        if (createResponse.ok) {
          const createData = await createResponse.json()
          console.log(`✅ Created listing: ${createData.cropName}`)
        } else {
          console.log(`❌ Failed to create listing:`, createResponse.status)
          const errorText = await createResponse.text()
          console.log('Error details:', errorText)
        }
      } catch (error) {
        console.log(`❌ Error creating listing ${listing.cropName}:`, error.message)
      }
    }

    // Verify listings were created
    console.log('\n=== VERIFYING CREATED LISTINGS ===')
    try {
      const verifyResponse = await fetch(`${baseUrl}/api/marketplace/listings`, {
        headers
      })

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json()
        console.log(`✅ Total listings created: ${verifyData.length}`)
        console.log('Listings:', verifyData.map(l => ({
          name: l.cropName,
          price: l.basePrice,
          status: l.status,
          category: l.category
        })))
      }
    } catch (error) {
      console.log('❌ Error verifying listings:', error.message)
    }

  } catch (error) {
    console.error('Error creating test listings:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

createTestListings()

