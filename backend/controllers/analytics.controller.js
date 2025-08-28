const Analytics = require('../models/analytics.model')
const User = require('../models/user.model')
const Harvest = require('../models/harvest.model')
const Listing = require('../models/listing.model')
const Order = require('../models/order.model')
const CreditScore = require('../models/credit-score.model')

// Add export helpers
const ExcelJS = require('exceljs')
const { createObjectCsvStringifier } = require('csv-writer')

exports.getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    
    // Get current metrics
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ status: 'active' })
    const newRegistrations = await User.countDocuments({ createdAt: { $gte: startOfMonth } })
    
    const totalHarvests = await Harvest.countDocuments()
    const approvedHarvests = await Harvest.countDocuments({ status: 'approved' })
    
    const totalListings = await Listing.countDocuments()
    const totalOrders = await Order.countDocuments()
    
    // Calculate revenue (simplified)
    const orders = await Order.find({ status: 'paid' })
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    
    // Get credit score average
    const creditScores = await CreditScore.find()
    const averageCreditScore = creditScores.length > 0 
      ? creditScores.reduce((sum, cs) => sum + cs.score, 0) / creditScores.length 
      : 0
    
    const metrics = {
      totalUsers,
      activeUsers,
      newRegistrations,
      totalHarvests,
      approvedHarvests,
      totalListings,
      totalOrders,
      totalRevenue,
      averageCreditScore: Math.round(averageCreditScore),
      approvalRate: totalHarvests > 0 ? Math.round((approvedHarvests / totalHarvests) * 100) : 0
    }
    
    return res.json({ status: 'success', data: metrics })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getFarmerAnalytics = async (req, res) => {
  try {
    const { farmerId } = req.params
    const { period = 'monthly' } = req.query
    
    const farmer = await User.findById(farmerId)
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({ status: 'error', message: 'Farmer not found' })
    }
    
    // Get farmer's harvests
    const harvests = await Harvest.find({ farmer: farmerId })
    const approvedHarvests = harvests.filter(h => h.status === 'approved')
    
    // Get farmer's listings
    const listings = await Listing.find({ farmer: farmerId })
    
    // Get farmer's orders (as seller)
    const orders = await Order.find({ 
      'items.listing': { $in: listings.map(l => l._id) }
    })
    
    // Calculate metrics
    const metrics = {
      totalHarvests: harvests.length,
      approvedHarvests: approvedHarvests.length,
      approvalRate: harvests.length > 0 ? Math.round((approvedHarvests.length / harvests.length) * 100) : 0,
      totalListings: listings.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      averageHarvestQuantity: harvests.length > 0 ? harvests.reduce((sum, h) => sum + h.quantity, 0) / harvests.length : 0
    }
    
    return res.json({ status: 'success', data: metrics })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getPartnerAnalytics = async (req, res) => {
  try {
    const { partnerId } = req.params
    
    const partner = await require('../models/partner.model').findById(partnerId)
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner not found' })
    }
    
    // Get partner's farmers
    const farmers = await User.find({ partner: partnerId, role: 'farmer' })
    
    // Get harvests from partner's farmers
    const harvests = await Harvest.find({ 
      farmer: { $in: farmers.map(f => f._id) }
    })
    
    // Get listings from partner's farmers
    const listings = await Listing.find({ 
      farmer: { $in: farmers.map(f => f._id) }
    })
    
    // Calculate metrics
    const metrics = {
      totalFarmers: farmers.length,
      totalHarvests: harvests.length,
      approvedHarvests: harvests.filter(h => h.status === 'approved').length,
      totalListings: listings.length,
      totalCommissions: partner.totalCommissions,
      commissionRate: partner.commissionRate,
      averageFarmerHarvests: farmers.length > 0 ? harvests.length / farmers.length : 0
    }
    
    return res.json({ status: 'success', data: metrics })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getBuyerAnalytics = async (req, res) => {
  try {
    const { buyerId } = req.params
    
    const buyer = await User.findById(buyerId)
    if (!buyer || buyer.role !== 'buyer') {
      return res.status(404).json({ status: 'error', message: 'Buyer not found' })
    }
    
    // Get buyer's orders
    const orders = await Order.find({ buyer: buyerId })
    const completedOrders = orders.filter(o => o.status === 'delivered')
    
    // Calculate metrics
    const metrics = {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
      completionRate: orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0
    }
    
    return res.json({ status: 'success', data: metrics })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getHarvestAnalytics = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query
    
    const totalHarvests = await Harvest.countDocuments()
    const approvedHarvests = await Harvest.countDocuments({ status: 'approved' })
    const rejectedHarvests = await Harvest.countDocuments({ status: 'rejected' })
    const pendingHarvests = await Harvest.countDocuments({ status: 'pending' })
    
    // Get harvests by crop type
    const cropTypes = await Harvest.aggregate([
      { $group: { _id: '$cropType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
    
    // Get harvests by location
    const locations = await Harvest.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
    
    const metrics = {
      totalHarvests,
      approvedHarvests,
      rejectedHarvests,
      pendingHarvests,
      approvalRate: totalHarvests > 0 ? Math.round((approvedHarvests / totalHarvests) * 100) : 0,
      cropTypeBreakdown: cropTypes,
      locationBreakdown: locations
    }
    
    return res.json({ status: 'success', data: metrics })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getMarketplaceAnalytics = async (req, res) => {
  try {
    const totalListings = await Listing.countDocuments()
    const activeListings = await Listing.countDocuments({ status: 'active' })
    const totalOrders = await Order.countDocuments()
    const completedOrders = await Order.countDocuments({ status: 'delivered' })
    
    // Calculate revenue
    const orders = await Order.find({ status: 'paid' })
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    
    // Get top selling crops
    const topCrops = await Listing.aggregate([
      { $group: { _id: '$cropName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
    
    const metrics = {
      totalListings,
      activeListings,
      totalOrders,
      completedOrders,
      totalRevenue,
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      topSellingCrops: topCrops
    }
    
    return res.json({ status: 'success', data: metrics })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getFinancialAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ status: 'paid' })
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
    
    const creditScores = await CreditScore.find()
    const averageCreditScore = creditScores.length > 0 
      ? creditScores.reduce((sum, cs) => sum + cs.score, 0) / creditScores.length 
      : 0
    
    const riskDistribution = await CreditScore.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ])
    
    const metrics = {
      totalOrders,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      averageCreditScore: Math.round(averageCreditScore),
      riskDistribution,
      totalCreditScores: creditScores.length
    }
    
    return res.json({ status: 'success', data: metrics })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Advanced analytics: transactions
exports.getTransactionAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, interval = 'day' } = req.query
    const match = {}
    if (startDate || endDate) {
      match.createdAt = {}
      if (startDate) match.createdAt.$gte = new Date(startDate)
      if (endDate) match.createdAt.$lte = new Date(endDate)
    }
    const Order = require('../models/order.model')
    const groupId = interval === 'month' ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } } : { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
    const pipeline = [
      { $match: match },
      { $group: { _id: groupId, orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } }
    ]
    const series = await Order.aggregate(pipeline)
    const totals = await Order.aggregate([{ $match: match }, { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$total' }, aov: { $avg: '$total' } } }])
    return res.json({ status: 'success', data: { series, totals: totals[0] || { orders: 0, revenue: 0, aov: 0 } } })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Advanced analytics: regional
exports.getRegionalAnalytics = async (req, res) => {
  try {
    const Listing = require('../models/listing.model')
    const Harvest = require('../models/harvest.model')
    const Order = require('../models/order.model')
    const byStateListings = await Listing.aggregate([
      { $group: { _id: '$location.state', listings: { $sum: 1 }, avgPrice: { $avg: '$basePrice' }, quantity: { $sum: '$quantity' } } },
      { $sort: { listings: -1 } }
    ])
    const byStateHarvests = await Harvest.aggregate([
      { $group: { _id: '$location', harvests: { $sum: 1 }, qty: { $sum: '$quantity' } } }
    ])
    const byStateOrders = await Order.aggregate([
      { $lookup: { from: 'users', localField: 'buyer', foreignField: '_id', as: 'buyerUser' } },
      { $unwind: '$buyerUser' },
      { $group: { _id: '$buyerUser.location', orders: { $sum: 1 }, revenue: { $sum: '$total' } } }
    ])
    return res.json({ status: 'success', data: { listings: byStateListings, harvests: byStateHarvests, orders: byStateOrders } })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Advanced analytics: impact (simple proxy metrics)
exports.getImpactAnalytics = async (req, res) => {
  try {
    const User = require('../models/user.model')
    const Harvest = require('../models/harvest.model')
    const Order = require('../models/order.model')
    const farmers = await User.countDocuments({ role: 'farmer', status: 'active' })
    const totalHarvests = await Harvest.countDocuments()
    const totalOrders = await Order.countDocuments()
    return res.json({ status: 'success', data: { activeFarmers: farmers, totalHarvests, totalOrders, sdg2Proxy: { increasedIncomeBeneficiaries: farmers, reducedPostHarvestLoss: Math.round(totalHarvests * 0.1) } } })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Advanced analytics: weather statistics per region
exports.getWeatherAnalytics = async (req, res) => {
  try {
    const { region } = req.query
    const WeatherData = require('../models/weather.model')
    const match = {}
    if (region) match['location.state'] = region
    const agg = await WeatherData.aggregate([
      { $match: match },
      { $group: { _id: '$location.state', avgTemp: { $avg: '$current.temperature' }, avgHumidity: { $avg: '$current.humidity' }, alerts: { $sum: { $size: { $ifNull: ['$alerts', []] } } } } },
      { $sort: { _id: 1 } }
    ])
    return res.json({ status: 'success', data: agg })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Advanced analytics: fintech
exports.getFintechAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const match = {}
    if (startDate || endDate) {
      match.createdAt = {}
      if (startDate) match.createdAt.$gte = new Date(startDate)
      if (endDate) match.createdAt.$lte = new Date(endDate)
    }
    
    const LoanApplication = require('../models/loan-application.model')
    const CreditScore = require('../models/credit-score.model')
    
    const loanStats = await LoanApplication.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ])
    
    const creditScoreStats = await CreditScore.aggregate([
      { $match: match },
      { $group: { _id: null, avgScore: { $avg: '$score' }, minScore: { $min: '$score' }, maxScore: { $max: '$score' } } }
    ])
    
    const loanTrends = await LoanApplication.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 }, amount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ])
    
    return res.json({
      status: 'success',
      data: {
        loanStats,
        creditScoreStats: creditScoreStats[0] || { avgScore: 0, minScore: 0, maxScore: 0 },
        loanTrends
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Advanced analytics: reports list
exports.getReportsList = async (req, res) => {
  try {
    const { type, status } = req.query
    const match = {}
    if (type) match.type = type
    if (status) match.status = status
    
    const Report = require('../models/report.model')
    const reports = await Report.find(match).sort({ createdAt: -1 }).limit(50)
    const reportStats = await Report.aggregate([
      { $match: match },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ])
    
    return res.json({
      status: 'success',
      data: { reports, stats: reportStats }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Advanced analytics: export functionality
exports.exportAnalytics = async (req, res) => {
  try {
    const { format = 'json', type, filters } = req.query
    
    let data = {}
    const Order = require('../models/order.model')
    const Harvest = require('../models/harvest.model')
    const User = require('../models/user.model')
    
    if (type === 'transactions') {
      data = await Order.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { _id: 1 } }
      ])
    } else if (type === 'harvests') {
      data = await Harvest.aggregate([
        { $group: { _id: '$cropType', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
        { $sort: { count: -1 } }
      ])
    } else if (type === 'users') {
      data = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    }
    
    const exportData = {
      timestamp: new Date().toISOString(),
      type,
      filters,
      data,
      format
    }
    
    return res.json({
      status: 'success',
      data: exportData
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Advanced analytics: compare data
exports.compareAnalytics = async (req, res) => {
  try {
    const { metrics, timeframes, regions } = req.body
    
    const Order = require('../models/order.model')
    const Harvest = require('../models/harvest.model')
    
    let comparisonData = {}
    
    if (metrics.includes('revenue')) {
      const revenueComparison = await Order.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$total' } } },
        { $sort: { _id: 1 } }
      ])
      comparisonData.revenue = revenueComparison
    }
    
    if (metrics.includes('harvests')) {
      const harvestComparison = await Harvest.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
      comparisonData.harvests = harvestComparison
    }
    
    if (regions && regions.length > 0) {
      const regionalComparison = await Order.aggregate([
        { $lookup: { from: 'users', localField: 'buyer', foreignField: '_id', as: 'buyerUser' } },
        { $unwind: '$buyerUser' },
        { $match: { 'buyerUser.location': { $in: regions } } },
        { $group: { _id: '$buyerUser.location', orders: { $sum: 1 }, revenue: { $sum: '$total' } } }
      ])
      comparisonData.regional = regionalComparison
    }
    
    return res.json({
      status: 'success',
      data: comparisonData
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Advanced analytics: predictive analytics
exports.getPredictiveAnalytics = async (req, res) => {
  try {
    const { forecast = 30 } = req.query // days to forecast
    
    const Order = require('../models/order.model')
    const Harvest = require('../models/harvest.model')
    
    // Get historical data for trend analysis
    const historicalOrders = await Order.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { _id: -1 } },
      { $limit: 90 } // Last 90 days
    ])
    
    const historicalHarvests = await Harvest.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 90 }
    ])
    
    // Simple trend calculation (linear regression approximation)
    const calculateTrend = (data, key) => {
      if (data.length < 2) return 0
      const recent = data.slice(0, 7).reduce((sum, item) => sum + item[key], 0) / 7
      const older = data.slice(-7).reduce((sum, item) => sum + item[key], 0) / 7
      return (recent - older) / 7
    }
    
    const orderTrend = calculateTrend(historicalOrders, 'orders')
    const revenueTrend = calculateTrend(historicalOrders, 'revenue')
    const harvestTrend = calculateTrend(historicalHarvests, 'count')
    
    // Generate forecast
    const forecastData = []
    for (let i = 1; i <= forecast; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      forecastData.push({
        date: dateStr,
        predictedOrders: Math.max(0, Math.round(historicalOrders[0]?.orders + (orderTrend * i))),
        predictedRevenue: Math.max(0, historicalOrders[0]?.revenue + (revenueTrend * i)),
        predictedHarvests: Math.max(0, Math.round(historicalHarvests[0]?.count + (harvestTrend * i)))
      })
    }
    
    return res.json({
      status: 'success',
      data: {
        historical: { orders: historicalOrders, harvests: historicalHarvests },
        trends: { orders: orderTrend, revenue: revenueTrend, harvests: harvestTrend },
        forecast: forecastData
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Advanced analytics: summary dashboard
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const { period = 'month' } = req.query
    
    const Order = require('../models/order.model')
    const Harvest = require('../models/harvest.model')
    const User = require('../models/user.model')
    const Listing = require('../models/listing.model')
    
    const now = new Date()
    const startOfPeriod = new Date()
    
    if (period === 'week') {
      startOfPeriod.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startOfPeriod.setMonth(now.getMonth() - 1)
    } else if (period === 'quarter') {
      startOfPeriod.setMonth(now.getMonth() - 3)
    } else if (period === 'year') {
      startOfPeriod.setFullYear(now.getFullYear() - 1)
    }
    
    const match = { createdAt: { $gte: startOfPeriod, $lte: now } }
    
    // Key metrics
    const [orders, harvests, users, listings] = await Promise.all([
      Order.countDocuments(match),
      Harvest.countDocuments(match),
      User.countDocuments({ ...match, role: 'farmer' }),
      Listing.countDocuments(match)
    ])
    
    // Revenue metrics
    const revenueData = await Order.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$total' }, avg: { $avg: '$total' }, count: { $sum: 1 } } }
    ])
    
    // Top performing crops
    const topCrops = await Harvest.aggregate([
      { $match: match },
      { $group: { _id: '$cropType', count: { $sum: 1 }, quantity: { $sum: '$quantity' } } },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ])
    
    // Regional distribution
    const regionalData = await Order.aggregate([
      { $match: match },
      { $lookup: { from: 'users', localField: 'buyer', foreignField: '_id', as: 'buyerUser' } },
      { $unwind: '$buyerUser' },
      { $group: { _id: '$buyerUser.location', orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ])
    
    // Growth rates (compare with previous period)
    const previousStart = new Date(startOfPeriod)
    const previousEnd = new Date(startOfPeriod)
    if (period === 'week') {
      previousStart.setDate(previousStart.getDate() - 7)
      previousEnd.setDate(previousEnd.getDate() - 7)
    } else if (period === 'month') {
      previousStart.setMonth(previousStart.getMonth() - 1)
      previousEnd.setMonth(previousEnd.getMonth() - 1)
    }
    
    const previousMatch = { createdAt: { $gte: previousStart, $lte: previousEnd } }
    const [prevOrders, prevRevenue] = await Promise.all([
      Order.countDocuments(previousMatch),
      Order.aggregate([{ $match: previousMatch }, { $group: { _id: null, total: { $sum: '$total' } } }])
    ])
    
    const orderGrowth = prevOrders > 0 ? ((orders - prevOrders) / prevOrders * 100).toFixed(2) : 0
    const revenueGrowth = prevRevenue[0]?.total > 0 ? ((revenueData[0]?.total - prevRevenue[0].total) / prevRevenue[0].total * 100).toFixed(2) : 0
    
    return res.json({
      status: 'success',
      data: {
        period,
        metrics: {
          orders,
          harvests,
          activeFarmers: users,
          listings,
          totalRevenue: revenueData[0]?.total || 0,
          avgOrderValue: revenueData[0]?.avg || 0
        },
        growth: {
          orders: parseFloat(orderGrowth),
          revenue: parseFloat(revenueGrowth)
        },
        topCrops,
        regionalData,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Helpers for reporting
function resolvePeriodToDates (period) {
  const now = new Date()
  switch (period) {
    case 'today':
      return { startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()), endDate: now }
    case 'weekly': {
      const day = now.getDay()
      const diff = now.getDate() - day
      return { startDate: new Date(now.getFullYear(), now.getMonth(), diff), endDate: now }
    }
    case 'monthly':
      return { startDate: new Date(now.getFullYear(), now.getMonth(), 1), endDate: now }
    case 'quarterly': {
      const quarter = Math.floor(now.getMonth() / 3)
      const startMonth = quarter * 3
      return { startDate: new Date(now.getFullYear(), startMonth, 1), endDate: now }
    }
    case 'yearly':
      return { startDate: new Date(now.getFullYear(), 0, 1), endDate: now }
    default:
      return null
  }
}

function buildRows (type, docs) {
  switch (type) {
    case 'user':
      return docs.map(u => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }))
    case 'harvest':
      return docs.map(h => ({
        id: String(h._id),
        batchId: h.batchId,
        cropType: h.cropType,
        quantity: h.quantity,
        unit: h.unit,
        status: h.status,
        farmerName: h.farmer?.name,
        farmerEmail: h.farmer?.email,
        createdAt: h.createdAt
      }))
    case 'marketplace':
      return docs.map(l => ({
        id: String(l._id),
        cropName: l.cropName,
        price: l.price,
        status: l.status,
        farmerName: l.farmer?.name,
        farmerEmail: l.farmer?.email,
        createdAt: l.createdAt
      }))
    case 'financial':
      return docs.map(o => ({
        id: String(o._id),
        buyerName: o.buyer?.name,
        buyerEmail: o.buyer?.email,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt
      }))
    default:
      return []
  }
}

function csvFromRows (rows) {
  if (!rows || rows.length === 0) return ''
  const headers = Object.keys(rows[0]).map(id => ({ id, title: id }))
  const stringifier = createObjectCsvStringifier({ header: headers })
  return stringifier.getHeaderString() + stringifier.stringifyRecords(rows)
}

async function xlsxFromRows (rows, sheetName = 'Report') {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)
  if (rows.length > 0) {
    sheet.columns = Object.keys(rows[0]).map(k => ({ header: k, key: k }))
    sheet.addRows(rows)
  }
  return await workbook.xlsx.writeBuffer()
}

exports.generateReport = async (req, res) => {
  try {
    const { type, period, startDate, endDate, format = 'json', filename } = req.body
    
    // Validate type
    const allowedTypes = ['user', 'harvest', 'marketplace', 'financial']
    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({ status: 'error', message: 'Invalid or missing report type' })
    }
    
    // Resolve date range
    let from = startDate ? new Date(startDate) : undefined
    let to = endDate ? new Date(endDate) : undefined
    if ((!from || !to) && period) {
      const resolved = resolvePeriodToDates(period)
      if (resolved) {
        from = resolved.startDate
        to = resolved.endDate
      }
    }
    
    const query = {}
    if (from && to && !isNaN(from) && !isNaN(to)) {
      query.createdAt = { $gte: from, $lte: to }
    }
    
    // Get data
    let docs = []
    switch (type) {
      case 'user':
        docs = await User.find(query).select('-password')
        break
      case 'harvest':
        docs = await Harvest.find(query).populate('farmer', 'name email')
        break
      case 'marketplace':
        docs = await Listing.find(query).populate('farmer', 'name email')
        break
      case 'financial':
        docs = await Order.find(query).populate('buyer', 'name email')
        break
    }
    
    // Return JSON if requested
    if (format === 'json') {
      return res.json({ status: 'success', data: docs })
    }
    
    // Build flat rows for export
    const rows = buildRows(type, docs)
    const safeBase = `${type}-report-${Date.now()}`
    const outName = `${filename || safeBase}.${format === 'xlsx' ? 'xlsx' : 'csv'}`
    
    if (format === 'csv') {
      const csv = csvFromRows(rows)
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${outName}"`)
      return res.status(200).send(csv)
    }
    
    if (format === 'xlsx') {
      const buffer = await xlsxFromRows(rows, `${type} Report`)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${outName}"`)
      return res.status(200).send(Buffer.from(buffer))
    }
    
    return res.status(400).json({ status: 'error', message: 'Unsupported format. Use json, csv, or xlsx' })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

