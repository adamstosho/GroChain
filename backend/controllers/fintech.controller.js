const CreditScore = require('../models/credit-score.model')
const LoanReferral = require('../models/loanReferral.model')
const User = require('../models/user.model')
const Partner = require('../models/partner.model')
const Transaction = require('../models/transaction.model')

const fintechController = {
  // Get credit score for a farmer
  async getCreditScore(req, res) {
    try {
      const { farmerId } = req.params
      const userId = farmerId === 'me' ? req.user.id : farmerId
      
      // Check if user exists and is a farmer
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        })
      }
      
      if (user.role !== 'farmer') {
        return res.status(403).json({
          status: 'error',
          message: 'Only farmers have credit scores'
        })
      }
      
      // Get or create credit score
      let creditScore = await CreditScore.findOne({ farmer: userId })
      
      if (!creditScore) {
        // Calculate initial credit score based on user data
        const initialScore = await calculateInitialCreditScore(userId)
        creditScore = await CreditScore.create({
          farmer: userId,
          score: initialScore.score,
          factors: initialScore.factors,
          lastUpdated: new Date()
        })
      }
      
      res.json({
        status: 'success',
        data: {
          farmerId: userId,
          score: creditScore.score,
          factors: creditScore.factors,
          recommendations: creditScore.recommendations || [],
          lastUpdated: creditScore.lastUpdated,
          nextReviewDate: creditScore.nextReviewDate
        }
      })
    } catch (error) {
      console.error('Error getting credit score:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get credit score'
      })
    }
  },

  // Create loan referral
  async createLoanReferral(req, res) {
    try {
      const { farmerId, loanAmount, purpose, term, description } = req.body
      
      if (!farmerId || !loanAmount || !purpose || !term) {
        return res.status(400).json({
          status: 'error',
          message: 'Farmer ID, loan amount, purpose, and term are required'
        })
      }
      
      // Verify farmer exists
      const farmer = await User.findById(farmerId)
      if (!farmer || farmer.role !== 'farmer') {
        return res.status(404).json({
          status: 'error',
          message: 'Farmer not found'
        })
      }
      
      // Check if user has permission to create referral
      if (req.user.role === 'partner') {
        // Partner can only refer their own farmers
        if (farmer.partner?.toString() !== req.user.id) {
          return res.status(403).json({
            status: 'error',
            message: 'You can only refer your own farmers'
          })
        }
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Only partners and admins can create loan referrals'
        })
      }
      
      // Generate referral ID
      const referralId = `LOAN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Create loan referral
      const loanReferral = await LoanReferral.create({
        referralId,
        partner: req.user.role === 'partner' ? req.user.id : undefined,
        farmer: farmerId,
        loanAmount: Number(loanAmount),
        purpose,
        term: Number(term),
        description,
        status: 'pending',
        submittedBy: req.user.id,
        submittedAt: new Date()
      })
      
      res.status(201).json({
        status: 'success',
        data: loanReferral
      })
    } catch (error) {
      console.error('Error creating loan referral:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to create loan referral'
      })
    }
  },

  // Get loan applications
  async getLoanApplications(req, res) {
    try {
      const { page = 1, limit = 10, status, farmerId } = req.query
      const query = {}
      
      // Filter by status if provided
      if (status) query.status = status
      
      // Filter by farmer if provided
      if (farmerId) query.farmer = farmerId
      
      // Role-based filtering
      if (req.user.role === 'partner') {
        query.partner = req.user.id
      } else if (req.user.role === 'farmer') {
        query.farmer = req.user.id
      }
      
      const skip = (parseInt(page) - 1) * parseInt(limit)
      
      const [applications, total] = await Promise.all([
        LoanReferral.find(query)
          .populate('farmer', 'name email phone')
          .populate('partner', 'name organization')
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        LoanReferral.countDocuments(query)
      ])
      
      res.json({
        status: 'success',
        data: {
          applications,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      })
    } catch (error) {
      console.error('Error getting loan applications:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get loan applications'
      })
    }
  },

  // Get loan statistics
  async getLoanStats(req, res) {
    try {
      const query = {}
      
      // Role-based filtering
      if (req.user.role === 'partner') {
        query.partner = req.user.id
      }
      
      const stats = await LoanReferral.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$loanAmount' }
          }
        }
      ])
      
      const totalApplications = await LoanReferral.countDocuments(query)
      const totalAmount = await LoanReferral.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$loanAmount' } } }
      ])
      
      res.json({
        status: 'success',
        data: {
          totalApplications,
          totalAmount: totalAmount[0]?.total || 0,
          statusBreakdown: stats,
          approvalRate: totalApplications > 0 ? 
            ((stats.find(s => s._id === 'approved')?.count || 0) / totalApplications * 100).toFixed(2) : 0
        }
      })
    } catch (error) {
      console.error('Error getting loan stats:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get loan statistics'
      })
    }
  },

  // Get insurance policies
  async getInsurancePolicies(req, res) {
    try {
      // Mock insurance policies for now
      const policies = [
        {
          id: 'crop_insurance_001',
          name: 'Crop Insurance Basic',
          type: 'crop',
          coverage: 'Basic crop protection',
          premium: 5000,
          coverageAmount: 100000,
          duration: '1 year'
        },
        {
          id: 'equipment_insurance_001',
          name: 'Farm Equipment Insurance',
          type: 'equipment',
          coverage: 'Farm machinery protection',
          premium: 8000,
          coverageAmount: 200000,
          duration: '1 year'
        }
      ]
      
      res.json({
        status: 'success',
        data: policies
      })
    } catch (error) {
      console.error('Error getting insurance policies:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get insurance policies'
      })
    }
  },

  // Get financial health assessment
  async getFinancialHealth(req, res) {
    try {
      const { farmerId } = req.params
      const userId = farmerId === 'me' ? req.user.id : farmerId
      
      // Get user's financial data
      const transactions = await Transaction.find({ userId })
      const creditScore = await CreditScore.findOne({ farmer: userId })
      
      // Calculate financial health metrics
      const totalIncome = transactions
        .filter(t => t.type === 'payment' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalExpenses = transactions
        .filter(t => t.type === 'withdrawal' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const netIncome = totalIncome - totalExpenses
      const savingsRate = totalIncome > 0 ? (netIncome / totalIncome * 100).toFixed(2) : 0
      
      const financialHealth = {
        score: creditScore?.score || 650,
        netIncome,
        savingsRate: parseFloat(savingsRate),
        totalIncome,
        totalExpenses,
        transactionCount: transactions.length,
        lastTransaction: transactions.length > 0 ? 
          Math.max(...transactions.map(t => t.createdAt)) : null,
        recommendations: generateFinancialRecommendations(netIncome, parseFloat(savingsRate))
      }
      
      res.json({
        status: 'success',
        data: financialHealth
      })
    } catch (error) {
      console.error('Error getting financial health:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get financial health'
      })
    }
  }
}

// Helper functions
async function calculateInitialCreditScore(farmerId) {
  // Mock calculation - in real implementation, this would analyze various factors
  const baseScore = 650
  const factors = {
    paymentHistory: 70,
    harvestConsistency: 60,
    businessStability: 50,
    marketReputation: 55
  }
  
  return {
    score: baseScore,
    factors
  }
}

function generateFinancialRecommendations(netIncome, savingsRate) {
  const recommendations = []
  
  if (netIncome < 0) {
    recommendations.push('Focus on reducing expenses and increasing income')
  }
  
  if (savingsRate < 20) {
    recommendations.push('Aim to save at least 20% of your income')
  }
  
  if (savingsRate > 50) {
    recommendations.push('Consider investing excess savings for better returns')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Maintain your current financial practices')
  }
  
  return recommendations
}

module.exports = fintechController
