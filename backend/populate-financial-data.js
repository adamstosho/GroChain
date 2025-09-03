const mongoose = require('mongoose')
const User = require('./models/user.model')
const Transaction = require('./models/transaction.model')
const FinancialGoal = require('./models/financial-goal.model')
const LoanApplication = require('./models/loan-application.model')
const InsurancePolicy = require('./models/insurance-policy.model')
const CreditScore = require('./models/credit-score.model')

require('dotenv').config()

async function populateFinancialData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI_PROD)
    console.log('🔗 Connected to MongoDB')

    // Get the farmer user
    const farmer = await User.findOne({ role: 'farmer' })
    if (!farmer) {
      console.log('❌ No farmer user found. Please create a farmer user first.')
      return
    }
    console.log('👤 Found farmer:', farmer.name, 'ID:', farmer._id)

    // Clear existing data first
    await Promise.all([
      Transaction.deleteMany({ userId: farmer._id }),
      FinancialGoal.deleteMany({ farmer: farmer._id }),
      LoanApplication.deleteMany({ farmer: farmer._id }),
      InsurancePolicy.deleteMany({ farmer: farmer._id }),
      CreditScore.deleteMany({ farmer: farmer._id })
    ])
    console.log('🧹 Cleared existing financial data')

    // Create credit score
    const creditScore = await CreditScore.create({
      farmer: farmer._id,
      score: 720,
      factors: {
        paymentHistory: 85,
        creditUtilization: 70,
        creditHistory: 75,
        newCredit: 80,
        creditMix: 65
      },
      recommendations: [
        'Continue making timely payments',
        'Consider reducing credit utilization below 30%',
        'Maintain good payment history'
      ]
    })
    console.log('📊 Created credit score:', creditScore.score)

    // Create transactions (earnings)
    const transactions = [
      {
        type: 'payment',
        status: 'completed',
        amount: 250000,
        currency: 'NGN',
        reference: 'TXN-001-' + Date.now(),
        description: 'Harvest sale - Cassava',
        userId: farmer._id,
        createdAt: new Date('2024-01-15')
      },
      {
        type: 'commission',
        status: 'completed',
        amount: 15000,
        currency: 'NGN',
        reference: 'TXN-002-' + Date.now(),
        description: 'Referral commission',
        userId: farmer._id,
        createdAt: new Date('2024-01-14')
      },
      {
        type: 'payment',
        status: 'completed',
        amount: 180000,
        currency: 'NGN',
        reference: 'TXN-003-' + Date.now(),
        description: 'Harvest sale - Maize',
        userId: farmer._id,
        createdAt: new Date('2024-01-13')
      },
      {
        type: 'payment',
        status: 'completed',
        amount: 320000,
        currency: 'NGN',
        reference: 'TXN-004-' + Date.now(),
        description: 'Harvest sale - Tomatoes',
        userId: farmer._id,
        createdAt: new Date('2024-01-12')
      }
    ]

    const createdTransactions = await Transaction.insertMany(transactions)
    console.log('💰 Created transactions:', createdTransactions.length)

    // Create financial goals
    const financialGoals = [
      {
        farmer: farmer._id,
        title: 'Emergency Fund',
        description: 'Build emergency fund for unexpected expenses',
        type: 'emergency_fund',
        targetAmount: 500000,
        currentAmount: 150000,
        targetDate: new Date('2025-12-31'),
        priority: 'high',
        category: 'short_term',
        status: 'active'
      },
      {
        farmer: farmer._id,
        title: 'Equipment Purchase',
        description: 'Save for new tractor',
        type: 'equipment_purchase',
        targetAmount: 2000000,
        currentAmount: 450000,
        targetDate: new Date('2025-06-30'),
        priority: 'medium',
        category: 'medium_term',
        status: 'active'
      },
      {
        farmer: farmer._id,
        title: 'Business Expansion',
        description: 'Expand farm operations',
        type: 'business_expansion',
        targetAmount: 1000000,
        currentAmount: 200000,
        targetDate: new Date('2026-12-31'),
        priority: 'medium',
        category: 'long_term',
        status: 'active'
      }
    ]

    const createdGoals = await FinancialGoal.insertMany(financialGoals)
    console.log('🎯 Created financial goals:', createdGoals.length)

    // Create loan applications
    const loanApplications = [
      {
        farmer: farmer._id,
        amount: 500000,
        purpose: 'Equipment purchase - Tractor',
        duration: 12,
        interestRate: 15,
        status: 'approved',
        approvedAmount: 500000,
        approvedDuration: 12,
        approvedInterestRate: 15,
        repaymentSchedule: [
          {
            dueDate: new Date('2024-02-15'),
            amount: 45000,
            status: 'pending'
          },
          {
            dueDate: new Date('2024-03-15'),
            amount: 45000,
            status: 'pending'
          },
          {
            dueDate: new Date('2024-04-15'),
            amount: 45000,
            status: 'pending'
          }
        ]
      },
      {
        farmer: farmer._id,
        amount: 300000,
        purpose: 'Seed and fertilizer purchase',
        duration: 6,
        interestRate: 12,
        status: 'disbursed',
        approvedAmount: 300000,
        approvedDuration: 6,
        approvedInterestRate: 12,
        disbursedAt: new Date('2024-01-10'),
        repaymentSchedule: [
          {
            dueDate: new Date('2024-02-10'),
            amount: 53000,
            status: 'pending'
          },
          {
            dueDate: new Date('2024-03-10'),
            amount: 53000,
            status: 'pending'
          }
        ]
      }
    ]

    const createdLoans = await LoanApplication.insertMany(loanApplications)
    console.log('💳 Created loan applications:', createdLoans.length)

    // Create insurance policies
    const insurancePolicies = [
      {
        farmer: farmer._id,
        type: 'crop',
        provider: 'GroChain Insurance',
        policyNumber: 'POL-001-2024-' + Date.now(),
        coverageAmount: 1000000,
        premium: 25000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        region: 'Lagos',
        coverageDetails: {
          crops: ['Cassava', 'Maize'],
          exclusions: ['Natural disasters']
        }
      },
      {
        farmer: farmer._id,
        type: 'equipment',
        provider: 'Farm Equipment Insurance',
        policyNumber: 'POL-002-2024-' + Date.now(),
        coverageAmount: 500000,
        premium: 15000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        region: 'Lagos',
        coverageDetails: {
          equipment: ['Tractor', 'Harvester'],
          exclusions: ['Operator negligence']
        }
      },
      {
        farmer: farmer._id,
        type: 'livestock',
        provider: 'Livestock Protection',
        policyNumber: 'POL-003-2024-' + Date.now(),
        coverageAmount: 300000,
        premium: 12000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        region: 'Lagos',
        coverageDetails: {
          livestock: ['Goats', 'Sheep'],
          exclusions: ['Disease outbreaks']
        }
      }
    ]

    const createdPolicies = await InsurancePolicy.insertMany(insurancePolicies)
    console.log('🛡️  Created insurance policies:', createdPolicies.length)

    console.log('\n✅ Financial sample data populated successfully!')
    console.log('📊 Summary:')
    console.log(`   • Credit Score: ${creditScore.score}`)
    console.log(`   • Total Earnings: ₦${transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`)
    console.log(`   • Total Savings: ₦${financialGoals.reduce((sum, g) => sum + g.currentAmount, 0).toLocaleString()}`)
    console.log(`   • Active Loans: ${createdLoans.length}`)
    console.log(`   • Insurance Policies: ${createdPolicies.length}`)
    console.log('\n🎉 You can now test the financial dashboard with real data!')

  } catch (error) {
    console.error('❌ Error populating sample data:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

populateFinancialData()

