const mongoose = require('mongoose')
const QRCodeModel = require('./models/qrcode.model')
const User = require('./models/user.model')

require('dotenv').config()

async function debugQRDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI_PROD)
    console.log('🔗 Connected to MongoDB')

    // Find farmer
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer user found')
      return
    }

    console.log('👤 Found farmer:', farmer.name, farmer.email, farmer._id)

    // Direct database query for QR codes
    console.log('\n🔍 Direct database query for QR codes...')
    const qrCodes = await QRCodeModel.find({ farmer: farmer._id })
    console.log('📱 QR codes found in database:', qrCodes.length)

    if (qrCodes.length > 0) {
      qrCodes.forEach((qr, i) => {
        console.log(`${i + 1}. ID: ${qr._id}`)
        console.log(`   Code: ${qr.code}`)
        console.log(`   Farmer: ${qr.farmer}`)
        console.log(`   Harvest: ${qr.harvest}`)
        console.log(`   Status: ${qr.status}`)
        console.log(`   Created: ${qr.createdAt}`)
        console.log('')
      })
    } else {
      console.log('ℹ️ No QR codes found in database')
    }

    // Test the aggregation query used in getQRCodeStats
    console.log('\n📊 Testing stats aggregation...')
    const stats = await QRCodeModel.aggregate([
      { $match: { farmer: farmer._id } },
      {
        $group: {
          _id: null,
          totalCodes: { $sum: 1 },
          activeCodes: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          expiredCodes: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
          revokedCodes: { $sum: { $cond: [{ $eq: ['$status', 'revoked'] }, 1, 0] } },
          verifiedCodes: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] } },
          totalScans: { $sum: '$scanCount' },
          totalDownloads: { $sum: '$downloadCount' }
        }
      }
    ])

    console.log('📈 Stats aggregation result:', JSON.stringify(stats, null, 2))

    // Test the getStats static method
    console.log('\n📊 Testing getStats static method...')
    const staticStats = await QRCodeModel.getStats(farmer._id)
    console.log('📈 Static stats result:', JSON.stringify(staticStats, null, 2))

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

debugQRDatabase()

