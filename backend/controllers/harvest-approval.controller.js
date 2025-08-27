const Harvest = require('../models/harvest.model')
const Listing = require('../models/listing.model')
const User = require('../models/user.model')
const Notification = require('../models/notification.model')

const harvestApprovalController = {
  // Get harvests pending approval
  async getPendingHarvests(req, res) {
    try {
      const { page = 1, limit = 20, cropType, location, sortBy = 'createdAt', sortOrder = 'desc' } = req.query
      
      const query = { status: 'pending' }
      if (cropType) query.cropType = cropType
      if (location) query.location = location
      
      const skip = (parseInt(page) - 1) * parseInt(limit)
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
      
      const [harvests, total] = await Promise.all([
        Harvest.find(query)
          .populate('farmer', 'name email phone location')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Harvest.countDocuments(query)
      ])
      
      res.json({
        status: 'success',
        data: {
          harvests,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      })
    } catch (error) {
      console.error('Error getting pending harvests:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get pending harvests'
      })
    }
  },

  // Approve harvest
  async approveHarvest(req, res) {
    try {
      const { harvestId } = req.params
      const { quality, notes, agriculturalData, qualityMetrics } = req.body
      
      if (!['partner', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Only partners and admins can approve harvests'
        })
      }
      
      const harvest = await Harvest.findById(harvestId)
      if (!harvest) {
        return res.status(404).json({
          status: 'error',
          message: 'Harvest not found'
        })
      }
      
      if (harvest.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: 'Harvest is not pending approval'
        })
      }
      
      // Update harvest with approval details
      harvest.status = 'approved'
      harvest.verifiedBy = req.user.id
      harvest.verifiedAt = new Date()
      harvest.quality = quality || harvest.quality
      
      if (agriculturalData) {
        harvest.agriculturalData = { ...harvest.agriculturalData, ...agriculturalData }
      }
      
      if (qualityMetrics) {
        harvest.qualityMetrics = { ...harvest.qualityMetrics, ...qualityMetrics }
      }
      
      await harvest.save()
      
      // Create notification for farmer
      await Notification.create({
        user: harvest.farmer,
        title: 'Harvest Approved',
        message: `Your ${harvest.cropType} harvest has been approved with ${harvest.quality} quality rating.`,
        type: 'success',
        category: 'harvest',
        data: { harvestId: harvest._id, quality: harvest.quality }
      })
      
      res.json({
        status: 'success',
        message: 'Harvest approved successfully',
        data: harvest
      })
    } catch (error) {
      console.error('Error approving harvest:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to approve harvest'
      })
    }
  },

  // Reject harvest
  async rejectHarvest(req, res) {
    try {
      const { harvestId } = req.params
      const { rejectionReason, notes } = req.body
      
      if (!['partner', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Only partners and admins can reject harvests'
        })
      }
      
      if (!rejectionReason) {
        return res.status(400).json({
          status: 'error',
          message: 'Rejection reason is required'
        })
      }
      
      const harvest = await Harvest.findById(harvestId)
      if (!harvest) {
        return res.status(404).json({
          status: 'error',
          message: 'Harvest not found'
        })
      }
      
      if (harvest.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: 'Harvest is not pending approval'
        })
      }
      
      // Update harvest with rejection details
      harvest.status = 'rejected'
      harvest.verifiedBy = req.user.id
      harvest.verifiedAt = new Date()
      harvest.rejectionReason = rejectionReason
      
      await harvest.save()
      
      // Create notification for farmer
      await Notification.create({
        user: harvest.farmer,
        title: 'Harvest Rejected',
        message: `Your ${harvest.cropType} harvest has been rejected. Reason: ${rejectionReason}`,
        type: 'warning',
        category: 'harvest',
        data: { harvestId: harvest._id, rejectionReason }
      })
      
      res.json({
        status: 'success',
        message: 'Harvest rejected successfully',
        data: harvest
      })
    } catch (error) {
      console.error('Error rejecting harvest:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to reject harvest'
      })
    }
  },

  // Request harvest revision
  async requestRevision(req, res) {
    try {
      const { harvestId } = req.params
      const { revisionNotes, requiredChanges } = req.body
      
      if (!['partner', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Only partners and admins can request revisions'
        })
      }
      
      if (!revisionNotes) {
        return res.status(400).json({
          status: 'error',
          message: 'Revision notes are required'
        })
      }
      
      const harvest = await Harvest.findById(harvestId)
      if (!harvest) {
        return res.status(404).json({
          status: 'error',
          message: 'Harvest not found'
        })
      }
      
      if (harvest.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: 'Harvest is not pending approval'
        })
      }
      
      // Update harvest status to revision requested
      harvest.status = 'revision_requested'
      harvest.revisionNotes = revisionNotes
      harvest.requiredChanges = requiredChanges
      harvest.revisionRequestedBy = req.user.id
      harvest.revisionRequestedAt = new Date()
      
      await harvest.save()
      
      // Create notification for farmer
      await Notification.create({
        user: harvest.farmer,
        title: 'Harvest Revision Requested',
        message: `Your ${harvest.cropType} harvest needs revision. Please review the feedback and resubmit.`,
        type: 'info',
        category: 'harvest',
        data: { harvestId: harvest._id, revisionNotes, requiredChanges }
      })
      
      res.json({
        status: 'success',
        message: 'Revision requested successfully',
        data: harvest
      })
    } catch (error) {
      console.error('Error requesting revision:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to request revision'
      })
    }
  },

  // Get harvest approval statistics
  async getApprovalStats(req, res) {
    try {
      const { partnerId, startDate, endDate } = req.query
      
      const query = {}
      if (partnerId) query.verifiedBy = partnerId
      if (startDate || endDate) {
        query.verifiedAt = {}
        if (startDate) query.verifiedAt.$gte = new Date(startDate)
        if (endDate) query.verifiedAt.$lte = new Date(endDate)
      }
      
      const [totalApproved, totalRejected, totalPending, totalRevision] = await Promise.all([
        Harvest.countDocuments({ ...query, status: 'approved' }),
        Harvest.countDocuments({ ...query, status: 'rejected' }),
        Harvest.countDocuments({ status: 'pending' }),
        Harvest.countDocuments({ status: 'revision_requested' })
      ])
      
      // Get quality distribution for approved harvests
      const qualityDistribution = await Harvest.aggregate([
        { $match: { ...query, status: 'approved' } },
        { $group: { _id: '$quality', count: { $sum: 1 } } }
      ])
      
      // Get crop type distribution
      const cropDistribution = await Harvest.aggregate([
        { $match: { ...query, status: 'approved' } },
        { $group: { _id: '$cropType', count: { $sum: 1 } } }
      ])
      
      res.json({
        status: 'success',
        data: {
          totalApproved,
          totalRejected,
          totalPending,
          totalRevision,
          qualityDistribution,
          cropDistribution,
          approvalRate: totalApproved + totalRejected > 0 ? 
            (totalApproved / (totalApproved + totalRejected)) * 100 : 0
        }
      })
    } catch (error) {
      console.error('Error getting approval stats:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get approval statistics'
      })
    }
  },

  // Create listing from approved harvest
  async createListingFromHarvest(req, res) {
    try {
      const { harvestId } = req.params
      const { price, description, quantity, unit } = req.body
      
      if (!price || Number(price) <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid price is required'
        })
      }
      
      const harvest = await Harvest.findById(harvestId)
      if (!harvest) {
        return res.status(404).json({
          status: 'error',
          message: 'Harvest not found'
        })
      }
      
      if (harvest.status !== 'approved') {
        return res.status(400).json({
          status: 'error',
          message: 'Only approved harvests can be listed'
        })
      }
      
      if (String(harvest.farmer) !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Only the harvest owner can create listings'
        })
      }
      
      // Create listing
      const listing = await Listing.create({
        farmer: harvest.farmer,
        harvest: harvest._id,
        cropName: harvest.cropType,
        price: Number(price),
        quantity: quantity || harvest.quantity,
        unit: unit || harvest.unit,
        description: description || harvest.description,
        images: harvest.images || [],
        location: harvest.location,
        quality: harvest.quality,
        status: 'active'
      })
      
      // Update harvest status to listed
      harvest.status = 'listed'
      await harvest.save()
      
      res.status(201).json({
        status: 'success',
        message: 'Listing created successfully',
        data: { listingId: listing._id, harvestId: harvest._id }
      })
    } catch (error) {
      console.error('Error creating listing from harvest:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to create listing'
      })
    }
  },

  // Bulk approve/reject harvests
  async bulkProcessHarvests(req, res) {
    try {
      const { harvestIds, action, quality, rejectionReason, notes } = req.body
      
      if (!['partner', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Only partners and admins can bulk process harvests'
        })
      }
      
      if (!Array.isArray(harvestIds) || harvestIds.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Harvest IDs are required'
        })
      }
      
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({
          status: 'error',
          message: 'Action must be either approve or reject'
        })
      }
      
      if (action === 'reject' && !rejectionReason) {
        return res.status(400).json({
          status: 'error',
          message: 'Rejection reason is required for rejections'
        })
      }
      
      const harvests = await Harvest.find({
        _id: { $in: harvestIds },
        status: 'pending'
      })
      
      if (harvests.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'No pending harvests found'
        })
      }
      
      const updateData = {
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      }
      
      if (action === 'approve') {
        updateData.status = 'approved'
        if (quality) updateData.quality = quality
      } else {
        updateData.status = 'rejected'
        updateData.rejectionReason = rejectionReason
      }
      
      // Update all harvests
      await Harvest.updateMany(
        { _id: { $in: harvestIds } },
        updateData
      )
      
      // Create notifications for farmers
      const notifications = harvests.map(harvest => ({
        user: harvest.farmer,
        title: `Harvest ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `Your ${harvest.cropType} harvest has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
        type: action === 'approve' ? 'success' : 'warning',
        category: 'harvest',
        data: { 
          harvestId: harvest._id, 
          action,
          quality: action === 'approve' ? quality : undefined,
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        }
      }))
      
      await Notification.insertMany(notifications)
      
      res.json({
        status: 'success',
        message: `Successfully ${action}d ${harvests.length} harvests`,
        data: { processedCount: harvests.length, action }
      })
    } catch (error) {
      console.error('Error bulk processing harvests:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to bulk process harvests'
      })
    }
  }
}

module.exports = harvestApprovalController


