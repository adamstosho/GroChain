const mongoose = require('mongoose')
const User = require('./models/user.model')
const Harvest = require('./models/harvest.model')
const QRCodeModel = require('./models/qrcode.model')

require('dotenv').config()

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI_PROD)
    console.log('🔗 Connected to MongoDB')

    // Find farmer
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer user found')
      return
    }

    console.log('👤 Found farmer:', farmer.name, farmer.email)

    // Check harvests
    const harvests = await Harvest.find({ farmer: farmer._id })
    console.log('🌾 Total harvests found:', harvests.length)

    if (harvests.length > 0) {
      console.log('📋 Harvest details:')
      harvests.forEach((h, i) => {
        console.log(`${i + 1}. ${h.cropType} - ${h.batchId} - Status: ${h.status} - Date: ${h.createdAt}`)
      })

      // Check approved harvests
      const approvedHarvests = harvests.filter(h => h.status === 'approved')
      console.log('✅ Approved harvests:', approvedHarvests.length)
    }

    // Check QR codes
    const qrCodes = await QRCodeModel.find({ farmer: farmer._id })
    console.log('📱 Total QR codes found:', qrCodes.length)

    if (qrCodes.length > 0) {
      console.log('📋 QR code details:')
      qrCodes.forEach((qr, i) => {
        console.log(`${i + 1}. ${qr.code} - Batch: ${qr.batchId} - Status: ${qr.status} - Scans: ${qr.scanCount}`)
      })
    }

    // If no QR codes but have approved harvests, suggest generating one
    if (qrCodes.length === 0 && harvests.length > 0) {
      console.log('💡 No QR codes found but harvests exist. You can generate QR codes from approved harvests.')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

checkDatabase()

