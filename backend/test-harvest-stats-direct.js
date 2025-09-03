const mongoose = require('mongoose')
const Harvest = require('./models/harvest.model')
const User = require('./models/user.model')

async function testHarvestStatsDirect() {
  try {
    console.log('🔗 Testing harvest stats directly from database...')

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain')
    console.log('✅ Connected to MongoDB')

    // Find the farmer by email
    const farmer = await User.findOne({ email: 'omoridoh111@gmail.com' })
    if (!farmer) {
      console.log('❌ Farmer not found')
      return
    }

    console.log('👤 Found farmer:', farmer.name, farmer._id)

    // Get harvest statistics directly from database
    const stats = await Harvest.aggregate([
      { $match: { farmer: farmer._id } },
      {
        $group: {
          _id: null,
          totalHarvests: { $sum: 1 },
          pendingHarvests: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approvedHarvests: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejectedHarvests: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          verifiedHarvests: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] } },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$price' },
          avgQuality: { $avg: { $cond: [{ $eq: ['$quality', 'excellent'] }, 4, { $cond: [{ $eq: ['$quality', 'good'] }, 3, { $cond: [{ $eq: ['$quality', 'fair'] }, 2, 1] }] }] } }
        }
      }
    ])

    const result = stats[0] || {
      totalHarvests: 0,
      pendingHarvests: 0,
      approvedHarvests: 0,
      rejectedHarvests: 0,
      verifiedHarvests: 0,
      totalQuantity: 0,
      totalValue: 0,
      avgQuality: 0
    }

    console.log('\n📊 Database Harvest Stats:')
    console.log('Total Harvests:', result.totalHarvests)
    console.log('Pending:', result.pendingHarvests)
    console.log('Approved:', result.approvedHarvests)
    console.log('Rejected:', result.rejectedHarvests)
    console.log('Verified:', result.verifiedHarvests)
    console.log('Total Quantity:', result.totalQuantity)
    console.log('Total Value:', result.totalValue)

    // Also get all harvests for this farmer
    const harvests = await Harvest.find({ farmer: farmer._id }).select('cropType status quantity price date')
    console.log('\n🌾 Individual Harvests:')
    harvests.forEach((h, i) => {
      console.log(`${i+1}. ${h.cropType} - ${h.status} - Qty: ${h.quantity} - Value: ₦${h.price || 0} - Date: ${h.date}`)
    })

    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  }
}

testHarvestStatsDirect()

