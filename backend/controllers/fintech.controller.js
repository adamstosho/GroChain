const CreditScore = require('../models/credit-score.model')
const LoanReferral = require('../models/loanReferral.model')
const User = require('../models/user.model')
const Partner = require('../models/partner.model')
const Transaction = require('../models/transaction.model')

const fintechController = {
  // Get loan referrals
  async getLoanReferrals(req, res) {
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
      console.error('Error getting loan referrals:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get loan referrals'
      })
    }
  },

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
  },

  // Get crop financials
  async getCropFinancials(req, res) {
    try {
      const { cropType, region, period = 'month' } = req.query
      
      const match = {}
      if (cropType) match.cropType = cropType
      if (region) match['location.state'] = region
      
      const now = new Date()
      const startDate = new Date()
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7)
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1)
      } else if (period === 'quarter') {
        startDate.setMonth(now.getMonth() - 3)
      } else if (period === 'year') {
        startDate.setFullYear(now.getFullYear() - 1)
      }
      
      match.createdAt = { $gte: startDate, $lte: now }
      
      const Harvest = require('../models/harvest.model')
      const Listing = require('../models/listing.model')
      const Order = require('../models/order.model')
      
      // Harvest costs and yields
      const harvestData = await Harvest.aggregate([
        { $match: match },
        { $group: {
          _id: '$cropType',
          totalQuantity: { $sum: '$quantity' },
          avgQuality: { $avg: { $cond: [{ $eq: ['$quality', 'excellent'] }, 4, { $cond: [{ $eq: ['$quality', 'good'] }, 3, { $cond: [{ $eq: ['$quality', 'fair'] }, 2, 1] }] }] } },
          harvests: { $sum: 1 }
        }},
        { $sort: { totalQuantity: -1 } }
      ])
      
      // Market prices
      const marketPrices = await Listing.aggregate([
        { $match: { ...match, status: 'active' } },
        { $group: {
          _id: '$cropType',
          avgPrice: { $avg: '$basePrice' },
          minPrice: { $min: '$basePrice' },
          maxPrice: { $max: '$basePrice' },
          listings: { $sum: 1 }
        }},
        { $sort: { avgPrice: -1 } }
      ])
      
      // Sales performance
      const salesData = await Order.aggregate([
        { $lookup: { from: 'listings', localField: 'items.listing', foreignField: '_id', as: 'listingData' } },
        { $unwind: '$listingData' },
        { $match: { ...match, 'listingData.cropType': { $exists: true } } },
        { $group: {
          _id: '$listingData.cropType',
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }},
        { $sort: { revenue: -1 } }
      ])
      
      // Calculate profitability metrics
      const cropFinancials = harvestData.map(harvest => {
        const market = marketPrices.find(m => m._id === harvest._id)
        const sales = salesData.find(s => s._id === harvest._id)
        
        const estimatedRevenue = (harvest.totalQuantity * (market?.avgPrice || 0))
        const estimatedProfit = estimatedRevenue * 0.7 // Assuming 30% costs
        const roi = estimatedRevenue > 0 ? (estimatedProfit / estimatedRevenue) * 100 : 0
        
        return {
          cropType: harvest._id,
          quantity: harvest.totalQuantity,
          quality: Math.round(harvest.avgQuality * 100) / 100,
          marketPrice: market?.avgPrice || 0,
          estimatedRevenue,
          estimatedProfit,
          roi: Math.round(roi * 100) / 100,
          marketData: market,
          salesData: sales
        }
      })
      
      res.json({
        status: 'success',
        data: {
          period,
          region: region || 'all',
          cropType: cropType || 'all',
          cropFinancials,
          summary: {
            totalCrops: cropFinancials.length,
            totalRevenue: cropFinancials.reduce((sum, crop) => sum + crop.estimatedRevenue, 0),
            avgROI: cropFinancials.reduce((sum, crop) => sum + crop.roi, 0) / cropFinancials.length || 0
          }
        }
      })
    } catch (error) {
      console.error('Error getting crop financials:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get crop financials'
      })
    }
  },

  // Get financial projections
  async getFinancialProjections(req, res) {
    try {
      const { months = 12, farmerId } = req.query
      
      const Order = require('../models/order.model')
      const Harvest = require('../models/harvest.model')
      const Listing = require('../models/listing.model')
      
      const match = {}
      if (farmerId) match.seller = farmerId
      
      // Historical data for trend analysis
      const historicalOrders = await Order.aggregate([
        { $match: match },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }},
        { $sort: { _id: -1 } },
        { $limit: 24 } // Last 24 months
      ])
      
      const historicalHarvests = await Harvest.aggregate([
        { $match: match },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          quantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }},
        { $sort: { _id: -1 } },
        { $limit: 24 }
      ])
      
      // Calculate trends using linear regression
      const calculateTrend = (data, key) => {
        if (data.length < 2) return 0
        const n = data.length
        const sumX = data.reduce((sum, _, i) => sum + i, 0)
        const sumY = data.reduce((sum, item) => sum + item[key], 0)
        const sumXY = data.reduce((sum, item, i) => sum + (i * item[key]), 0)
        const sumXX = data.reduce((sum, _, i) => sum + (i * i), 0)
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
        return slope || 0
      }
      
      const revenueTrend = calculateTrend(historicalOrders, 'revenue')
      const orderTrend = calculateTrend(historicalOrders, 'orders')
      const harvestTrend = calculateTrend(historicalHarvests, 'quantity')
      
      // Generate projections
      const projections = []
      const baseRevenue = historicalOrders[0]?.revenue || 0
      const baseOrders = historicalOrders[0]?.orders || 0
      const baseHarvests = historicalHarvests[0]?.quantity || 0
      
      for (let i = 1; i <= months; i++) {
        const projectedDate = new Date()
        projectedDate.setMonth(projectedDate.getMonth() + i)
        const monthStr = projectedDate.toISOString().slice(0, 7)
        
        const projectedRevenue = Math.max(0, baseRevenue + (revenueTrend * i))
        const projectedOrders = Math.max(0, Math.round(baseOrders + (orderTrend * i)))
        const projectedHarvests = Math.max(0, Math.round(baseHarvests + (harvestTrend * i)))
        
        projections.push({
          month: monthStr,
          projectedRevenue: Math.round(projectedRevenue * 100) / 100,
          projectedOrders,
          projectedHarvests,
          confidence: Math.max(0.1, 1 - (i * 0.05)) // Decreasing confidence over time
        })
      }
      
      res.json({
        status: 'success',
        data: {
          projectionPeriod: months,
          farmerId: farmerId || 'all',
          trends: {
            revenue: Math.round(revenueTrend * 100) / 100,
            orders: Math.round(orderTrend * 100) / 100,
            harvests: Math.round(harvestTrend * 100) / 100
          },
          projections,
          summary: {
            totalProjectedRevenue: projections.reduce((sum, p) => sum + p.projectedRevenue, 0),
            avgMonthlyGrowth: Math.round((revenueTrend / baseRevenue) * 100 * 100) / 100
          }
        }
      })
    } catch (error) {
      console.error('Error getting financial projections:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get financial projections'
      })
    }
  },

  // Get financial goals
  async getFinancialGoals(req, res) {
    try {
      const { farmerId } = req.params
      
      const FinancialGoal = require('../models/financial-goal.model')
      const Order = require('../models/order.model')
      
      // Get farmer's financial goals
      const goals = await FinancialGoal.find({ farmer: farmerId }).sort({ targetDate: 1 })
      
      // Calculate progress for each goal
      const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
        const startDate = goal.startDate || new Date(new Date().getFullYear(), 0, 1) // Start of year if not specified
        const endDate = goal.targetDate || new Date()
        
        const revenueMatch = { 
          seller: farmerId, 
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
        
        const actualRevenue = await Order.aggregate([
          { $match: revenueMatch },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ])
        
        const currentAmount = actualRevenue[0]?.total || 0
        const progress = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0
        const remaining = Math.max(0, goal.targetAmount - currentAmount)
        
        // Calculate days remaining
        const daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))
        
        // Determine status
        let status = 'on_track'
        if (progress >= 100) status = 'completed'
        else if (daysRemaining < 30 && progress < 75) status = 'at_risk'
        else if (daysRemaining < 7 && progress < 50) status = 'critical'
        
        return {
          ...goal.toObject(),
          currentAmount: Math.round(currentAmount * 100) / 100,
          progress: Math.round(progress * 100) / 100,
          remaining: Math.round(remaining * 100) / 100,
          daysRemaining,
          status
        }
      }))
      
      // Overall financial health score
      const totalGoals = goalsWithProgress.length
      const completedGoals = goalsWithProgress.filter(g => g.status === 'completed').length
      const onTrackGoals = goalsWithProgress.filter(g => g.status === 'on_track').length
      const atRiskGoals = goalsWithProgress.filter(g => g.status === 'at_risk').length
      const criticalGoals = goalsWithProgress.filter(g => g.status === 'critical').length
      
      const overallScore = totalGoals > 0 ? Math.round(
        (completedGoals * 100 + onTrackGoals * 80 + atRiskGoals * 40 + criticalGoals * 20) / totalGoals
      ) : 0
      
      res.json({
        status: 'success',
        data: {
          farmerId,
          goals: goalsWithProgress,
          summary: {
            totalGoals,
            completedGoals,
            onTrackGoals,
            atRiskGoals,
            criticalGoals,
            overallScore
          },
          recommendations: generateGoalRecommendations(goalsWithProgress)
        }
      })
    } catch (error) {
      console.error('Error getting financial goals:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get financial goals'
      })
    }
  },

  // Get insurance stats
  async getInsuranceStats(req, res) {
    try {
      const { type, region } = req.query
      
      const match = {}
      if (type) match.type = type
      if (region) match.region = region
      
      const InsurancePolicy = require('../models/insurance-policy.model')
      
      const policyStats = await InsurancePolicy.aggregate([
        { $match: match },
        { $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premium' },
          totalCoverage: { $sum: '$coverageAmount' },
          activePolicies: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        }},
        { $sort: { count: -1 } }
      ])
      
      const regionalStats = await InsurancePolicy.aggregate([
        { $match: match },
        { $group: {
          _id: '$region',
          policies: { $sum: 1 },
          totalPremium: { $sum: '$premium' },
          avgCoverage: { $avg: '$coverageAmount' } 
        }},
        { $sort: { totalPremium: -1 } }
      ])
      
      const monthlyTrends = await InsurancePolicy.aggregate([
        { $match: match },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          newPolicies: { $sum: 1 },
          premium: { $sum: '$premium' }
        }},
        { $sort: { _id: 1 } }
      ])
      
      res.json({
        status: 'success',
        data: {
          policyStats,
          regionalStats,
          monthlyTrends,
          summary: {
            totalPolicies: policyStats.reduce((sum, stat) => sum + stat.count, 0),
            totalPremium: policyStats.reduce((sum, stat) => sum + stat.totalPremium, 0),
            totalCoverage: policyStats.reduce((sum, stat) => sum + stat.totalCoverage, 0)
          }
        }
      })
    } catch (error) {
      console.error('Error getting insurance stats:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get insurance statistics'
      })
    }
  },

  // Get crop financials
  async getCropFinancials(req, res) {
    try {
      const { cropType, region, period = 'month' } = req.query
      
      const match = {}
      if (cropType) match.cropType = cropType
      if (region) match['location.state'] = region
      
      const now = new Date()
      const startDate = new Date()
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7)
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1)
      } else if (period === 'quarter') {
        startDate.setMonth(now.getMonth() - 3)
      } else if (period === 'year') {
        startDate.setFullYear(now.getFullYear() - 1)
      }
      
      match.createdAt = { $gte: startDate, $lte: now }
      
      const Harvest = require('../models/harvest.model')
      const Listing = require('../models/listing.model')
      const Order = require('../models/order.model')
      
      // Harvest costs and yields
      const harvestData = await Harvest.aggregate([
        { $match: match },
        { $group: {
          _id: '$cropType',
          totalQuantity: { $sum: '$quantity' },
          avgQuality: { $avg: { $cond: [{ $eq: ['$quality', 'excellent'] }, 4, { $cond: [{ $eq: ['$quality', 'good'] }, 3, { $cond: [{ $eq: ['$quality', 'fair'] }, 2, 1] }] }] } },
          harvests: { $sum: 1 }
        }},
        { $sort: { totalQuantity: -1 } }
      ])
      
      // Market prices
      const marketPrices = await Listing.aggregate([
        { $match: { ...match, status: 'active' } },
        { $group: {
          _id: '$cropType',
          avgPrice: { $avg: '$basePrice' },
          minPrice: { $min: '$basePrice' },
          maxPrice: { $max: '$basePrice' },
          listings: { $sum: 1 }
        }},
        { $sort: { avgPrice: -1 } }
      ])
      
      // Sales performance
      const salesData = await Order.aggregate([
        { $lookup: { from: 'listings', localField: 'items.listing', foreignField: '_id', as: 'listingData' } },
        { $unwind: '$listingData' },
        { $match: { ...match, 'listingData.cropType': { $exists: true } } },
        { $group: {
          _id: '$listingData.cropType',
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }},
        { $sort: { revenue: -1 } }
      ])
      
      // Calculate profitability metrics
      const cropFinancials = harvestData.map(harvest => {
        const market = marketPrices.find(m => m._id === harvest._id)
        const sales = salesData.find(s => s._id === harvest._id)
        
        const estimatedRevenue = (harvest.totalQuantity * (market?.avgPrice || 0))
        const estimatedProfit = estimatedRevenue * 0.7 // Assuming 30% costs
        const roi = estimatedRevenue > 0 ? (estimatedProfit / estimatedRevenue) * 100 : 0
        
        return {
          cropType: harvest._id,
          quantity: harvest.totalQuantity,
          quality: Math.round(harvest.avgQuality * 100) / 100,
          marketPrice: market?.avgPrice || 0,
          estimatedRevenue,
          estimatedProfit,
          roi: Math.round(roi * 100) / 100,
          marketData: market,
          salesData: sales
        }
      })
      
      res.json({
        status: 'success',
        data: {
          period,
          region: region || 'all',
          cropType: cropType || 'all',
          cropFinancials,
          summary: {
            totalCrops: cropFinancials.length,
            totalRevenue: cropFinancials.reduce((sum, crop) => sum + crop.estimatedRevenue, 0),
            avgROI: cropFinancials.reduce((sum, crop) => sum + crop.roi, 0) / cropFinancials.length || 0
          }
        }
      })
    } catch (error) {
      console.error('Error getting crop financials:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get crop financials'
      })
    }
  },

  // Get financial projections
  async getFinancialProjections(req, res) {
    try {
      const { months = 12, farmerId } = req.query
      
      const Order = require('../models/order.model')
      const Harvest = require('../models/harvest.model')
      const Listing = require('../models/listing.model')
      
      const match = {}
      if (farmerId) match.seller = farmerId
      
      // Historical data for trend analysis
      const historicalOrders = await Order.aggregate([
        { $match: match },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }},
        { $sort: { _id: -1 } },
        { $limit: 24 } // Last 24 months
      ])
      
      const historicalHarvests = await Harvest.aggregate([
        { $match: match },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          quantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }},
        { $sort: { _id: -1 } },
        { $limit: 24 }
      ])
      
      // Calculate trends using linear regression
      const calculateTrend = (data, key) => {
        if (data.length < 2) return 0
        const n = data.length
        const sumX = data.reduce((sum, _, i) => sum + i, 0)
        const sumY = data.reduce((sum, item) => sum + item[key], 0)
        const sumXY = data.reduce((sum, item, i) => sum + (i * item[key]), 0)
        const sumXX = data.reduce((sum, _, i) => sum + (i * i), 0)
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
        return slope || 0
      }
      
      const revenueTrend = calculateTrend(historicalOrders, 'revenue')
      const orderTrend = calculateTrend(historicalOrders, 'orders')
      const harvestTrend = calculateTrend(historicalHarvests, 'quantity')
      
      // Generate projections
      const projections = []
      const baseRevenue = historicalOrders[0]?.revenue || 0
      const baseOrders = historicalOrders[0]?.orders || 0
      const baseHarvests = historicalHarvests[0]?.quantity || 0
      
      for (let i = 1; i <= months; i++) {
        const projectedDate = new Date()
        projectedDate.setMonth(projectedDate.getMonth() + i)
        const monthStr = projectedDate.toISOString().slice(0, 7)
        
        const projectedRevenue = Math.max(0, baseRevenue + (revenueTrend * i))
        const projectedOrders = Math.max(0, Math.round(baseOrders + (orderTrend * i)))
        const projectedHarvests = Math.max(0, Math.round(baseHarvests + (harvestTrend * i)))
        
        projections.push({
          month: monthStr,
          projectedRevenue: Math.round(projectedRevenue * 100) / 100,
          projectedOrders,
          projectedHarvests,
          confidence: Math.max(0.1, 1 - (i * 0.05)) // Decreasing confidence over time
        })
      }
      
      res.json({
        status: 'success',
        data: {
          projectionPeriod: months,
          farmerId: farmerId || 'all',
          trends: {
            revenue: Math.round(revenueTrend * 100) / 100,
            orders: Math.round(orderTrend * 100) / 100,
            harvests: Math.round(harvestTrend * 100) / 100
          },
          projections,
          summary: {
            totalProjectedRevenue: projections.reduce((sum, p) => sum + p.projectedRevenue, 0),
            avgMonthlyGrowth: Math.round((revenueTrend / baseRevenue) * 100 * 100) / 100
          }
        }
      })
    } catch (error) {
      console.error('Error getting financial projections:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get financial projections'
      })
    }
  },

  // Get financial goals
  async getFinancialGoals(req, res) {
    try {
      const { farmerId } = req.params
      
      const FinancialGoal = require('../models/financial-goal.model')
      const Order = require('../models/order.model')
      
      // Get farmer's financial goals
      const goals = await FinancialGoal.find({ farmer: farmerId }).sort({ targetDate: 1 })
      
      // Calculate progress for each goal
      const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
        const startDate = goal.startDate || new Date(new Date().getFullYear(), 0, 1) // Start of year if not specified
        const endDate = goal.targetDate || new Date()
        
        const revenueMatch = { 
          seller: farmerId, 
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
        
        const actualRevenue = await Order.aggregate([
          { $match: revenueMatch },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ])
        
        const currentAmount = actualRevenue[0]?.total || 0
        const progress = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0
        const remaining = Math.max(0, goal.targetAmount - currentAmount)
        
        // Calculate days remaining
        const daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))
        
        // Determine status
        let status = 'on_track'
        if (progress >= 100) status = 'completed'
        else if (daysRemaining < 30 && progress < 75) status = 'at_risk'
        else if (daysRemaining < 7 && progress < 50) status = 'critical'
        
        return {
          ...goal.toObject(),
          currentAmount: Math.round(currentAmount * 100) / 100,
          progress: Math.round(progress * 100) / 100,
          remaining: Math.round(remaining * 100) / 100,
          daysRemaining,
          status
        }
      }))
      
      // Overall financial health score
      const totalGoals = goalsWithProgress.length
      const completedGoals = goalsWithProgress.filter(g => g.status === 'completed').length
      const onTrackGoals = goalsWithProgress.filter(g => g.status === 'on_track').length
      const atRiskGoals = goalsWithProgress.filter(g => g.status === 'at_risk').length
      const criticalGoals = goalsWithProgress.filter(g => g.status === 'critical').length
      
      const overallScore = totalGoals > 0 ? Math.round(
        (completedGoals * 100 + onTrackGoals * 80 + atRiskGoals * 40 + criticalGoals * 20) / totalGoals
      ) : 0
      
      res.json({
        status: 'success',
        data: {
          farmerId,
          goals: goalsWithProgress,
          summary: {
            totalGoals,
            completedGoals,
            onTrackGoals,
            atRiskGoals,
            criticalGoals,
            overallScore
          },
          recommendations: generateGoalRecommendations(goalsWithProgress)
        }
      })
    } catch (error) {
      console.error('Error getting financial goals:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get financial goals'
      })
    }
  },

  // Create credit score
  async createCreditScore(req, res) {
    try {
      const { farmerId, score, factors, recommendations } = req.body
      
      if (!farmerId || !score) {
        return res.status(400).json({
          status: 'error',
          message: 'Farmer ID and score are required'
        })
      }
      
      // Check if credit score already exists
      const existingScore = await CreditScore.findOne({ farmer: farmerId })
      if (existingScore) {
        return res.status(400).json({
          status: 'error',
          message: 'Credit score already exists for this farmer'
        })
      }
      
      const creditScore = await CreditScore.create({
        farmer: farmerId,
        score: Number(score),
        factors: factors || {},
        recommendations: recommendations || [],
        lastUpdated: new Date()
      })
      
      res.status(201).json({
        status: 'success',
        data: creditScore
      })
    } catch (error) {
      console.error('Error creating credit score:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to create credit score'
      })
    }
  },

  // Update credit score
  async updateCreditScore(req, res) {
    try {
      const { id } = req.params
      const { score, factors, recommendations } = req.body
      
      const creditScore = await CreditScore.findByIdAndUpdate(
        id,
        {
          score: score ? Number(score) : undefined,
          factors: factors || undefined,
          recommendations: recommendations || undefined,
          lastUpdated: new Date()
        },
        { new: true, runValidators: true }
      )
      
      if (!creditScore) {
        return res.status(404).json({
          status: 'error',
          message: 'Credit score not found'
        })
      }
      
      res.json({
        status: 'success',
        data: creditScore
      })
    } catch (error) {
      console.error('Error updating credit score:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to update credit score'
      })
    }
  },

  // Get loan application
  async getLoanApplication(req, res) {
    try {
      const { id } = req.params
      
      const loanApplication = await LoanReferral.findById(id)
        .populate('farmer', 'name email phone')
        .populate('partner', 'name organization')
      
      if (!loanApplication) {
        return res.status(404).json({
          status: 'error',
          message: 'Loan application not found'
        })
      }
      
      res.json({
        status: 'success',
        data: loanApplication
      })
    } catch (error) {
      console.error('Error getting loan application:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get loan application'
      })
    }
  },

  // Update loan application
  async updateLoanApplication(req, res) {
    try {
      const { id } = req.params
      const { status, notes, approvedAmount, approvedBy } = req.body
      
      const loanApplication = await LoanReferral.findByIdAndUpdate(
        id,
        {
          status: status || undefined,
          notes: notes || undefined,
          approvedAmount: approvedAmount ? Number(approvedAmount) : undefined,
          approvedBy: approvedBy || undefined,
          approvedAt: status === 'approved' ? new Date() : undefined
        },
        { new: true, runValidators: true }
      )
      
      if (!loanApplication) {
        return res.status(404).json({
          status: 'error',
          message: 'Loan application not found'
        })
      }
      
      res.json({
        status: 'success',
        data: loanApplication
      })
    } catch (error) {
      console.error('Error updating loan application:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to update loan application'
      })
    }
  },

  // Delete loan application
  async deleteLoanApplication(req, res) {
    try {
      const { id } = req.params
      
      const loanApplication = await LoanReferral.findByIdAndDelete(id)
      
      if (!loanApplication) {
        return res.status(404).json({
          status: 'error',
          message: 'Loan application not found'
        })
      }
      
      res.json({
        status: 'success',
        message: 'Loan application deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting loan application:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete loan application'
      })
    }
  },

  // Create insurance policy
  async createInsurancePolicy(req, res) {
    try {
      const { farmerId, type, provider, policyNumber, coverageAmount, premium, startDate, endDate, region } = req.body
      
      if (!farmerId || !type || !provider || !policyNumber || !coverageAmount || !premium || !startDate || !endDate || !region) {
        return res.status(400).json({
          status: 'error',
          message: 'All required fields must be provided'
        })
      }
      
      const InsurancePolicy = require('../models/insurance-policy.model')
      
      const insurancePolicy = await InsurancePolicy.create({
        farmer: farmerId,
        type,
        provider,
        policyNumber,
        coverageAmount: Number(coverageAmount),
        premium: Number(premium),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        region
      })
      
      res.status(201).json({
        status: 'success',
        data: insurancePolicy
      })
    } catch (error) {
      console.error('Error creating insurance policy:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to create insurance policy'
      })
    }
  },

  // Get insurance policy
  async getInsurancePolicy(req, res) {
    try {
      const { id } = req.params
      
      const InsurancePolicy = require('../models/insurance-policy.model')
      
      const insurancePolicy = await InsurancePolicy.findById(id)
        .populate('farmer', 'name email phone')
      
      if (!insurancePolicy) {
        return res.status(404).json({
          status: 'error',
          message: 'Insurance policy not found'
        })
      }
      
      res.json({
        status: 'success',
        data: insurancePolicy
      })
    } catch (error) {
      console.error('Error getting insurance policy:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get insurance policy'
      })
    }
  },

  // Update insurance policy
  async updateInsurancePolicy(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body
      
      const InsurancePolicy = require('../models/insurance-policy.model')
      
      const insurancePolicy = await InsurancePolicy.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
      
      if (!insurancePolicy) {
        return res.status(404).json({
          status: 'error',
          message: 'Insurance policy not found'
        })
      }
      
      res.json({
        status: 'success',
        data: insurancePolicy
      })
    } catch (error) {
      console.error('Error updating insurance policy:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to update insurance policy'
      })
    }
  },

  // Delete insurance policy
  async deleteInsurancePolicy(req, res) {
    try {
      const { id } = req.params
      
      const InsurancePolicy = require('../models/insurance-policy.model')
      
      const insurancePolicy = await InsurancePolicy.findByIdAndDelete(id)
      
      if (!insurancePolicy) {
        return res.status(404).json({
          status: 'error',
          message: 'Insurance policy not found'
        })
      }
      
      res.json({
        status: 'success',
        message: 'Insurance policy deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting insurance policy:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete insurance policy'
      })
    }
  },

  // Create insurance claim
  async createInsuranceClaim(req, res) {
    try {
      const { policyId, claimAmount, description, incidentDate, documents } = req.body
      
      if (!policyId || !claimAmount || !description || !incidentDate) {
        return res.status(400).json({
          status: 'error',
          message: 'Policy ID, claim amount, description, and incident date are required'
        })
      }
      
      // Mock implementation - in real app, you'd have an InsuranceClaim model
      const claim = {
        id: `CLAIM_${Date.now()}`,
        policyId,
        claimAmount: Number(claimAmount),
        description,
        incidentDate: new Date(incidentDate),
        documents: documents || [],
        status: 'pending',
        submittedAt: new Date()
      }
      
      res.status(201).json({
        status: 'success',
        data: claim
      })
    } catch (error) {
      console.error('Error creating insurance claim:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to create insurance claim'
      })
    }
  },

  // Get insurance claim
  async getInsuranceClaim(req, res) {
    try {
      const { id } = req.params
      
      // Mock implementation - in real app, you'd fetch from InsuranceClaim model
      const claim = {
        id,
        policyId: 'POLICY_123',
        claimAmount: 50000,
        description: 'Crop damage due to flooding',
        incidentDate: new Date('2024-01-15'),
        status: 'pending',
        submittedAt: new Date('2024-01-20')
      }
      
      res.json({
        status: 'success',
        data: claim
      })
    } catch (error) {
      console.error('Error getting insurance claim:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get insurance claim'
      })
    }
  },

  // Update insurance claim
  async updateInsuranceClaim(req, res) {
    try {
      const { id } = req.params
      const { status, notes, approvedAmount } = req.body
      
      // Mock implementation - in real app, you'd update InsuranceClaim model
      const claim = {
        id,
        policyId: 'POLICY_123',
        claimAmount: 50000,
        description: 'Crop damage due to flooding',
        incidentDate: new Date('2024-01-15'),
        status: status || 'pending',
        notes: notes || undefined,
        approvedAmount: approvedAmount ? Number(approvedAmount) : undefined,
        submittedAt: new Date('2024-01-20')
      }
      
      res.json({
        status: 'success',
        data: claim
      })
    } catch (error) {
      console.error('Error updating insurance claim:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to update insurance claim'
      })
    }
  },

  // Get insurance quotes
  async getInsuranceQuotes(req, res) {
    try {
      // Mock insurance quotes for now
      const quotes = [
        {
          id: 'quote_001',
          type: 'crop',
          provider: 'AgriInsurance Ltd',
          coverage: 'Basic crop protection',
          premium: 5000,
          coverageAmount: 100000,
          duration: '1 year',
          features: ['Drought protection', 'Flood coverage', 'Pest damage']
        },
        {
          id: 'quote_002',
          type: 'equipment',
          provider: 'FarmSecure Insurance',
          coverage: 'Farm machinery protection',
          premium: 8000,
          coverageAmount: 200000,
          duration: '1 year',
          features: ['Breakdown coverage', 'Theft protection', 'Accident damage']
        }
      ]
      
      res.json({
        status: 'success',
        data: quotes
      })
    } catch (error) {
      console.error('Error getting insurance quotes:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get insurance quotes'
      })
    }
  },

  // Get insurance claims
  async getInsuranceClaims(req, res) {
    try {
      // Mock insurance claims for now
      const claims = [
        {
          id: 'claim_001',
          policyId: 'POLICY_123',
          farmerId: 'farmer_001',
          claimAmount: 50000,
          description: 'Crop damage due to flooding',
          incidentDate: new Date('2024-01-15'),
          status: 'pending',
          submittedAt: new Date('2024-01-20'),
          documents: ['flood_photos.pdf', 'damage_assessment.pdf']
        },
        {
          id: 'claim_002',
          policyId: 'POLICY_124',
          farmerId: 'farmer_002',
          claimAmount: 30000,
          description: 'Equipment breakdown',
          incidentDate: new Date('2024-01-10'),
          status: 'approved',
          submittedAt: new Date('2024-01-12'),
          approvedAt: new Date('2024-01-18'),
          approvedAmount: 28000
        }
      ]
      
      res.json({
        status: 'success',
        data: claims
      })
    } catch (error) {
      console.error('Error getting insurance claims:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get insurance claims'
      })
    }
  },

  // Create loan application
  async createLoanApplication(req, res) {
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
      
      // Check if user has permission to create application
      if (req.user.role === 'partner') {
        // Partner can only create applications for their own farmers
        if (farmer.partner?.toString() !== req.user.id) {
          return res.status(403).json({
            status: 'error',
            message: 'You can only create applications for your own farmers'
          })
        }
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Only partners and admins can create loan applications'
        })
      }
      
      // Generate application ID
      const applicationId = `LOAN_APP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Create loan application
      const loanApplication = await LoanReferral.create({
        referralId: applicationId,
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
        data: loanApplication
      })
    } catch (error) {
      console.error('Error creating loan application:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to create loan application'
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

function generateGoalRecommendations(goals) {
  const recommendations = []
  
  const criticalGoals = goals.filter(g => g.status === 'critical')
  const atRiskGoals = goals.filter(g => g.status === 'at_risk')
  
  if (criticalGoals.length > 0) {
    recommendations.push({
      type: 'urgent',
      message: `${criticalGoals.length} goal(s) are in critical condition. Immediate action required.`
    })
  }
  
  if (atRiskGoals.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `${atRiskGoals.length} goal(s) are at risk. Review strategies and consider adjustments.`
    })
  }
  
  const lowProgressGoals = goals.filter(g => g.progress < 30 && g.daysRemaining < 60)
  if (lowProgressGoals.length > 0) {
    recommendations.push({
      type: 'strategy',
      message: `${lowProgressGoals.length} goal(s) have low progress. Consider revising targets or strategies.`
    })
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'positive',
      message: 'All goals are on track! Keep up the excellent work.'
    })
  }
  
  return recommendations
}

module.exports = fintechController
