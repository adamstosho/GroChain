const Analytics = require('../models/analytics.model')
const User = require('../models/user.model')
const Harvest = require('../models/harvest.model')
const Listing = require('../models/listing.model')
const Order = require('../models/order.model')
const CreditScore = require('../models/credit-score.model')

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

exports.generateReport = async (req, res) => {
  try {
    const { type, period, startDate, endDate, format = 'json' } = req.body
    
    let query = {}
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) }
    }
    
    let data = {}
    
    switch (type) {
      case 'user':
        data = await User.find(query).select('-password')
        break
      case 'harvest':
        data = await Harvest.find(query).populate('farmer', 'name email')
        break
      case 'marketplace':
        data = await Listing.find(query).populate('farmer', 'name email')
        break
      case 'financial':
        data = await Order.find(query).populate('buyer', 'name email')
        break
      default:
        return res.status(400).json({ status: 'error', message: 'Invalid report type' })
    }
    
    return res.json({ status: 'success', data })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

