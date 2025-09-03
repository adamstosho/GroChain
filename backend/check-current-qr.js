const mongoose = require('mongoose')
const QRCodeModel = require('./models/qrcode.model')

require('dotenv').config()

async function checkCurrentQRData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI_PROD)
    console.log('🔗 Connected to MongoDB')

    // Get all QR codes
    const qrCodes = await QRCodeModel.find()
    console.log('📱 Total QR codes:', qrCodes.length)

    qrCodes.forEach((qr, i) => {
      console.log(`${i + 1}. ${qr.code}`)
      console.log('   Status:', qr.status)
      console.log('   Crop Type:', qr.metadata.cropType)
      console.log('   Quantity:', qr.metadata.quantity)
      console.log('   Location:', qr.metadata.location.city, qr.metadata.location.state)
      console.log('   Farm:', qr.metadata.location.farmName)
      console.log('   Harvest Date:', qr.metadata.harvestDate)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
  }
}

checkCurrentQRData()

