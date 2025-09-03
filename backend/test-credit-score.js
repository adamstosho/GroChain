const mongoose = require('mongoose')
const User = require('./models/user.model')
const CreditScore = require('./models/credit-score.model')

require('dotenv').config()

async function testCreditScore() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI_PROD)
    console.log('🔗 Connected to MongoDB')

    // Find a farmer user
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer user found')
      return
    }

    console.log('👤 Found farmer:', farmer.name, 'ID:', farmer._id)

    // Check if credit score exists
    const existingCreditScore = await CreditScore.findOne({ farmer: farmer._id })
    console.log('📊 Existing credit score:', existingCreditScore || 'None')

    // Import and test the credit score calculation
    const { calculateInitialCreditScore } = require('./controllers/fintech.controller')

    console.log('🧮 Calculating credit score...')
    const result = await calculateInitialCreditScore(farmer._id)

    console.log('✅ Credit score calculation result:')
    console.log('   Score:', result.score)
    console.log('   Factors:', result.factors)

    // Simulate creating credit score
    if (!existingCreditScore) {
      const newCreditScore = await CreditScore.create({
        farmer: farmer._id,
        score: result.score,
        factors: result.factors,
        recommendations: [
          'Complete your first harvest to improve payment history',
          'Maintain consistent harvest schedules',
          'Build your marketplace reputation through quality produce'
        ],
        lastUpdated: new Date()
      })

      console.log('💾 Created new credit score:', newCreditScore)
    }

    console.log('✅ Credit score test completed successfully!')

  } catch (error) {
    console.error('❌ Error testing credit score:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Only run if called directly
if (require.main === module) {
  testCreditScore()
}

module.exports = testCreditScore

