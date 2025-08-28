const Referral = require('../models/referral.model')
const User = require('../models/user.model')
const Partner = require('../models/partner.model')
const Commission = require('../models/commission.model')

const referralController = {
  // Get referrals for partner
  async getReferrals(req, res) {
    try {
      const userId = req.user.id
      const { page = 1, limit = 10, status, farmerId } = req.query
      
      // Build query - find partner by email first
      let partner = await Partner.findOne({ email: req.user.email })
      if (!partner) {
        // Return empty results if no partner profile
        return res.json({
          status: 'success',
          data: {
            docs: [],
            totalDocs: 0,
            limit: parseInt(limit),
            page: parseInt(page),
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        })
      }
      
      const query = { partner: partner._id }
      if (status) query.status = status
      if (farmerId) query.farmer = farmerId
      
      // Use regular MongoDB queries instead of paginate
      const skip = (parseInt(page) - 1) * parseInt(limit)
      
      const referrals = await Referral.find(query)
        .populate([
          { path: 'farmer', select: 'name email phone region' },
          { path: 'partner', select: 'name type contactEmail' }
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
      
      const total = await Referral.countDocuments(query)
      
      res.json({
        status: 'success',
        data: {
          docs: referrals,
          totalDocs: total,
          limit: parseInt(limit),
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      })
    } catch (error) {
      console.error('Error getting referrals:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get referrals'
      })
    }
  },

  // Create new referral
  async createReferral(req, res) {
    try {
      const userId = req.user.id
      const { farmerId, notes, commissionRate = 0.05 } = req.body
      
      if (!farmerId) {
        return res.status(400).json({
          status: 'error',
          message: 'Farmer ID is required'
        })
      }
      
      // Check if partner exists
      const partner = await Partner.findOne({ email: req.user.email })
      if (!partner) {
        return res.status(404).json({
          status: 'error',
          message: 'Partner profile not found'
        })
      }
      
      // Check if farmer exists
      const farmer = await User.findById(farmerId)
      if (!farmer) {
        return res.status(404).json({
          status: 'error',
          message: 'Farmer not found'
        })
      }
      
      // Check if referral already exists
      const existingReferral = await Referral.findOne({
        farmer: farmerId,
        partner: partner._id
      })
      
      if (existingReferral) {
        return res.status(400).json({
          status: 'error',
          message: 'Referral already exists for this farmer'
        })
      }
      
      // Create referral
      const referral = new Referral({
        farmer: farmerId,
        partner: partner._id,
        status: 'pending',
        commissionRate,
        notes: notes || 'Referral created by partner'
      })
      
      await referral.save()
      
      // Populate farmer and partner details
      await referral.populate([
        { path: 'farmer', select: 'name email phone region' },
        { path: 'partner', select: 'name type contactEmail' }
      ])
      
      res.status(201).json({
        status: 'success',
        data: referral,
        message: 'Referral created successfully'
      })
    } catch (error) {
      console.error('Error creating referral:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to create referral'
      })
    }
  },

  // Get referral by ID
  async getReferralById(req, res) {
    try {
      const userId = req.user.id
      const { id } = req.params
      
      const referral = await Referral.findById(id)
        .populate([
          { path: 'farmer', select: 'name email phone region' },
          { path: 'partner', select: 'name type contactEmail' }
        ])
      
      if (!referral) {
        return res.status(404).json({
          status: 'error',
          message: 'Referral not found'
        })
      }
      
      // Check if user has access to this referral
      if (referral.partner.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        })
      }
      
      res.json({
        status: 'success',
        data: referral
      })
    } catch (error) {
      console.error('Error getting referral by ID:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get referral'
      })
    }
  },

  // Update referral
  async updateReferral(req, res) {
    try {
      const userId = req.user.id
      const { id } = req.params
      const updateData = req.body
      
      const referral = await Referral.findById(id)
      
      if (!referral) {
        return res.status(404).json({
          status: 'error',
          message: 'Referral not found'
        })
      }
      
      // Check if user has access to update this referral
      if (referral.partner.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        })
      }
      
      // Remove fields that shouldn't be updated
      delete updateData._id
      delete updateData.farmer
      delete updateData.partner
      
      const updatedReferral = await Referral.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate([
        { path: 'farmer', select: 'name email phone region' },
        { path: 'partner', select: 'name type contactEmail' }
      ])
      
      res.json({
        status: 'success',
        data: updatedReferral,
        message: 'Referral updated successfully'
      })
    } catch (error) {
      console.error('Error updating referral:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to update referral'
      })
    }
  },

  // Delete referral
  async deleteReferral(req, res) {
    try {
      const { id } = req.params
      
      const referral = await Referral.findById(id)
      
      if (!referral) {
        return res.status(404).json({
          status: 'error',
          message: 'Referral not found'
        })
      }
      
      await Referral.findByIdAndDelete(id)
      
      res.json({
        status: 'success',
        message: 'Referral deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting referral:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete referral'
      })
    }
  },

  // Get referral statistics
  async getReferralStats(req, res) {
    try {
      const userId = req.user.id
      
      const stats = await Referral.aggregate([
        { $match: { partner: userId } },
        { $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCommission: { $sum: '$commission' }
        }}
      ])
      
      const totalReferrals = await Referral.countDocuments({ partner: userId })
      const completedReferrals = await Referral.countDocuments({ 
        partner: userId, 
        status: 'completed' 
      })
      
      const overview = {
        totalReferrals,
        completedReferrals,
        pendingReferrals: totalReferrals - completedReferrals,
        conversionRate: totalReferrals > 0 ? (completedReferrals / totalReferrals * 100).toFixed(2) : 0,
        statusBreakdown: stats,
        lastUpdated: new Date()
      }
      
      res.json({
        status: 'success',
        data: overview
      })
    } catch (error) {
      console.error('Error getting referral stats:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get referral statistics'
      })
    }
  },

  // Get performance statistics
  async getPerformanceStats(req, res) {
    try {
      const userId = req.user.id
      const { period = 'month' } = req.query
      
      let dateFilter = {}
      const now = new Date()
      
      if (period === 'week') {
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      } else if (period === 'month') {
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) }
      } else if (period === 'year') {
        dateFilter = { $gte: new Date(now.getFullYear(), 0, 1) }
      }
      
      const performance = await Referral.aggregate([
        { $match: { partner: userId, createdAt: dateFilter } },
        { $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          referrals: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          commission: { $sum: '$commission' }
        }},
        { $sort: { '_id.year': -1, '_id.month': -1 } }
      ])
      
      res.json({
        status: 'success',
        data: performance
      })
    } catch (error) {
      console.error('Error getting performance stats:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get performance statistics'
      })
    }
  },

  // Get pending commissions
  async getPendingCommissions(req, res) {
    try {
      const userId = req.user.id
      const { page = 1, limit = 10 } = req.query
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [
          { path: 'farmer', select: 'name email phone region' }
        ],
        sort: { createdAt: -1 }
      }
      
      const pendingCommissions = await Referral.paginate({
        partner: userId,
        status: 'completed',
        commission: { $gt: 0 }
      }, options)
      
      res.json({
        status: 'success',
        data: pendingCommissions
      })
    } catch (error) {
      console.error('Error getting pending commissions:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get pending commissions'
      })
    }
  },

  // Get paid commissions
  async getPaidCommissions(req, res) {
    try {
      const userId = req.user.id
      const { page = 1, limit = 10 } = req.query
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [
          { path: 'farmer', select: 'name email phone region' }
        ],
        sort: { updatedAt: -1 }
      }
      
      const paidCommissions = await Commission.paginate({
        partner: userId,
        status: 'paid'
      }, options)
      
      res.json({
        status: 'success',
        data: paidCommissions
      })
    } catch (error) {
      console.error('Error getting paid commissions:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get paid commissions'
      })
    }
  }
}

module.exports = referralController

