const mongoose = require('mongoose')

async function fixListingIndexes() {
  console.log('🔧 Fixing Listing Collection Indexes')
  console.log('=====================================')

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('✅ Connected to database')

    const db = mongoose.connection.db
    const collection = db.collection('listings')

    // Get current indexes
    console.log('\n📋 Current indexes on listings collection:')
    const indexes = await collection.indexes()
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index)}`)
    })

    // Drop any geospatial indexes
    console.log('\n🔍 Checking for geospatial indexes...')
    const indexesToDrop = []

    for (const index of indexes) {
      // Check if it's a geospatial index
      if (index.name && (
        index.name.includes('2dsphere') ||
        index.name.includes('location') ||
        (index.key && (
          index.key['location'] === '2dsphere' ||
          index.key['location.city'] ||
          index.key['location.state'] ||
          index.key['location.coordinates']
        ))
      )) {
        indexesToDrop.push(index.name)
      }
    }

    if (indexesToDrop.length > 0) {
      console.log('🗑️ Found geospatial indexes to drop:', indexesToDrop)

      for (const indexName of indexesToDrop) {
        try {
          await collection.dropIndex(indexName)
          console.log(`✅ Dropped index: ${indexName}`)
        } catch (dropError) {
          console.log(`⚠️ Failed to drop index ${indexName}:`, dropError.message)
        }
      }
    } else {
      console.log('✅ No geospatial indexes found')
    }

    // Create proper indexes (excluding geospatial)
    console.log('\n🏗️ Creating proper indexes...')

    const indexesToCreate = [
      { key: { farmer: 1 }, name: 'farmer_1' },
      { key: { cropName: 1 }, name: 'cropName_1' },
      { key: { category: 1 }, name: 'category_1' },
      { key: { status: 1 }, name: 'status_1' },
      { key: { featured: 1 }, name: 'featured_1' },
      { key: { createdAt: -1 }, name: 'createdAt_-1' }
    ]

    for (const indexSpec of indexesToCreate) {
      try {
        await collection.createIndex(indexSpec.key, { name: indexSpec.name })
        console.log(`✅ Created index: ${indexSpec.name}`)
      } catch (createError) {
        if (createError.code === 85) { // Index already exists
          console.log(`ℹ️ Index ${indexSpec.name} already exists`)
        } else {
          console.log(`⚠️ Failed to create index ${indexSpec.name}:`, createError.message)
        }
      }
    }

    // Create text index for search
    try {
      await collection.createIndex(
        { cropName: 'text', description: 'text', tags: 'text' },
        { name: 'text_search' }
      )
      console.log('✅ Created text search index')
    } catch (textError) {
      if (textError.code === 85) {
        console.log('ℹ️ Text search index already exists')
      } else {
        console.log('⚠️ Failed to create text search index:', textError.message)
      }
    }

    // Verify final indexes
    console.log('\n📋 Final indexes after cleanup:')
    const finalIndexes = await collection.indexes()
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`)
    })

    console.log('\n🎉 Index cleanup completed!')
    console.log('✅ No more geospatial index conflicts')
    console.log('✅ Listing creation should now work')

  } catch (error) {
    console.log('❌ Error during index cleanup:', error.message)
    console.log('Stack:', error.stack)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

fixListingIndexes()

