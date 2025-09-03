const mongoose = require('mongoose')
const User = require('./models/user.model')
const Transaction = require('./models/transaction.model')
const FinancialGoal = require('./models/financial-goal.model')
const LoanApplication = require('./models/loan-application.model')
const InsurancePolicy = require('./models/insurance-policy.model')
const CreditScore = require('./models/credit-score.model')

require('dotenv').config()

async function clearSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI_PROD)
    console.log('🔗 Connected to MongoDB')

    // Get the farmer user
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer user found')
      return
    }
    console.log('👤 Found farmer:', farmer.name, 'ID:', farmer._id)

    // Clear all sample data
    const results = await Promise.all([
      Transaction.deleteMany({
        userId: farmer._id,
        reference: { $regex: 'SAMPLE' }
      }),
      FinancialGoal.deleteMany({
        farmer: farmer._id,
        title: { $in: ['Emergency Fund', 'Equipment Purchase', 'Business Expansion'] }
      }),
      LoanApplication.deleteMany({
        farmer: farmer._id,
        purpose: { $in: ['Equipment purchase - Tractor', 'Seed and fertilizer purchase'] }
      }),
      InsurancePolicy.deleteMany({
        farmer: farmer._id,
        policyNumber: { $regex: 'SAMPLE' }
      }),
      CreditScore.deleteMany({
        farmer: farmer._id,
        score: 720 // Only delete the sample credit score
      })
    ])

    console.log('🧹 Cleared sample data:')
    console.log(`   • Transactions: ${results[0].deletedCount}`)
    console.log(`   • Financial Goals: ${results[1].deletedCount}`)
    console.log(`   • Loan Applications: ${results[2].deletedCount}`)
    console.log(`   • Insurance Policies: ${results[3].deletedCount}`)
    console.log(`   • Credit Scores: ${results[4].deletedCount}`)

    console.log('✅ Sample data cleared successfully!')
    console.log('🔄 Now you can test with empty collections')

  } catch (error) {
    console.error('❌ Error clearing sample data:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Only run if called directly
if (require.main === module) {
  clearSampleData()
}

module.exports = clearSampleData

