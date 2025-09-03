const mongoose = require('mongoose')
const Harvest = require('../models/harvest.model')
const Listing = require('../models/listing.model')
const User = require('../models/user.model')
const Notification = require('../models/notification.model')

// Helper function to map crop types to categories
const getCategoryFromCropType = (cropType) => {
  if (!cropType || typeof cropType !== 'string') return 'grains'

  try {
    const crop = cropType.toLowerCase().trim()

    if (['maize', 'rice', 'wheat', 'millet', 'sorghum', 'barley', 'corn'].includes(crop)) return 'grains'
    if (['cassava', 'yam', 'potato', 'sweet potato', 'cocoyam', 'sweet-potato'].includes(crop)) return 'tubers'
    if (['tomato', 'pepper', 'onion', 'lettuce', 'cabbage', 'carrot', 'spinach', 'vegetable'].includes(crop)) return 'vegetables'
    if (['mango', 'orange', 'banana', 'pineapple', 'apple', 'guava', 'fruit'].includes(crop)) return 'fruits'
    if (['beans', 'groundnut', 'soybean', 'cowpea', 'lentils', 'ground-nut', 'legume'].includes(crop)) return 'legumes'
    if (['cocoa', 'coffee', 'tea', 'cashew', 'cash-crop'].includes(crop)) return 'cash_crops'

    console.log(`⚠️ Unknown crop type "${crop}", defaulting to "grains"`)
    return 'grains' // default category
  } catch (error) {
    console.warn('⚠️ Error mapping crop type to category:', error.message)
    return 'grains'
  }
}

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

      console.log('Creating listing from harvest:', { harvestId, price, description, quantity, unit })

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

      console.log('Found harvest:', {
        id: harvest._id,
        farmer: harvest.farmer,
        status: harvest.status,
        cropType: harvest.cropType,
        quantity: harvest.quantity,
        unit: harvest.unit,
        location: harvest.location,
        quality: harvest.quality
      })

      // Validate harvest has required fields with detailed checks
      if (!harvest.cropType || typeof harvest.cropType !== 'string' || harvest.cropType.trim() === '') {
        return res.status(400).json({
          status: 'error',
          message: 'Harvest is missing valid crop type information'
        })
      }

      if (!harvest.quantity || isNaN(harvest.quantity) || harvest.quantity <= 0) {
        return res.status(400).json({
          status: 'error',
          message: `Harvest has invalid quantity: ${harvest.quantity}`
        })
      }

      if (!harvest.unit || typeof harvest.unit !== 'string' || harvest.unit.trim() === '') {
        return res.status(400).json({
          status: 'error',
          message: 'Harvest is missing valid unit information'
        })
      }

      // Additional validation for farmer
      if (!harvest.farmer || !harvest.farmer.toString()) {
        return res.status(400).json({
          status: 'error',
          message: 'Harvest is missing farmer information'
        })
      }

      if (harvest.status !== 'approved') {
        return res.status(400).json({
          status: 'error',
          message: `Harvest status is "${harvest.status}". Only approved harvests can be listed`
        })
      }

      if (String(harvest.farmer) !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Only the harvest owner can create listings'
        })
      }

      // Parse location from harvest.location string
      let city = 'Unknown City'
      let state = 'Unknown State'

      try {
        if (harvest.location && typeof harvest.location === 'string') {
          const locationParts = harvest.location.split(',')
          if (locationParts[0]?.trim()) city = locationParts[0].trim()
          if (locationParts[1]?.trim()) state = locationParts[1].trim()
        }
      } catch (locationError) {
        console.warn('⚠️ Error parsing location, using defaults:', locationError.message)
      }

      // Map harvest quality to listing qualityGrade
      const qualityGradeMap = {
        'excellent': 'premium',
        'good': 'standard',
        'fair': 'basic',
        'poor': 'basic'
      }
      const qualityGrade = qualityGradeMap[harvest.quality] || 'standard'

      // Validate required fields
      const finalQuantity = quantity || harvest.quantity
      const finalUnit = unit || harvest.unit

      if (!finalQuantity || finalQuantity <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid quantity is required'
        })
      }

      if (!finalUnit) {
        return res.status(400).json({
          status: 'error',
          message: 'Unit is required'
        })
      }

      console.log('Creating listing with data:', {
        farmer: harvest.farmer,
        harvest: harvest._id,
        cropName: harvest.cropType,
        category: getCategoryFromCropType(harvest.cropType),
        basePrice: Number(price),
        quantity: finalQuantity,
        availableQuantity: finalQuantity,
        unit: finalUnit,
        location: { city, state, country: 'Nigeria' },
        qualityGrade,
        description: description || harvest.description
      })

      // Validate all required fields before creating
      const cropName = harvest.cropType?.trim()
      const category = getCategoryFromCropType(cropName)
      const listingDescription = (description || harvest.description || `Fresh ${cropName} harvest`).trim()

      if (!cropName) {
        return res.status(400).json({
          status: 'error',
          message: 'Harvest crop type is missing or invalid'
        })
      }

      if (!category || category === 'grains') {
        console.warn('⚠️ Category defaulted to "grains" for crop:', cropName)
      }

      if (!listingDescription) {
        return res.status(400).json({
          status: 'error',
          message: 'Description is required for listing'
        })
      }

      // Create listing with correct field names and validation
      let listing = null
      try {
        const listingData = {
          farmer: harvest.farmer,
          harvest: harvest._id,
          cropName: cropName,
          category: category,
          description: listingDescription,
          basePrice: Number(price),
          quantity: finalQuantity,
          availableQuantity: finalQuantity,
          unit: finalUnit,
          images: harvest.images || [],
          location: `${city || 'Unknown City'}, ${state || 'Unknown State'}, Nigeria`,
          qualityGrade: qualityGrade || 'standard',
          status: 'active',
          tags: harvest.quality ? [harvest.quality] : []
        }

        console.log('📝 Final listing data to create:')
        console.log('   Farmer:', listingData.farmer)
        console.log('   Crop Name:', listingData.cropName)
        console.log('   Category:', listingData.category)
        console.log('   Base Price:', listingData.basePrice)
        console.log('   Quantity:', listingData.quantity)
        console.log('   Unit:', listingData.unit)
        console.log('   Location:', listingData.location)
        console.log('   Quality Grade:', listingData.qualityGrade)

        // Check database connection before attempting to create
        if (mongoose.connection.readyState !== 1) {
          console.error('❌ Database connection is not ready:', mongoose.connection.readyState)
          return res.status(500).json({
            status: 'error',
            message: 'Database connection failed. Please ensure MongoDB is running and try again.',
            dbConnectionError: true,
            readyState: mongoose.connection.readyState
          })
        }

        console.log('🏗️ Creating listing with data structure:')
        console.log('   Type of listingData:', typeof listingData)
        console.log('   Keys in listingData:', Object.keys(listingData))
        console.log('   listingData.farmer:', listingData.farmer, typeof listingData.farmer)
        console.log('   listingData.cropName:', listingData.cropName, typeof listingData.cropName)
        console.log('   listingData.category:', listingData.category, typeof listingData.category)
        console.log('   listingData.basePrice:', listingData.basePrice, typeof listingData.basePrice)
        console.log('   listingData.quantity:', listingData.quantity, typeof listingData.quantity)
        console.log('   listingData.availableQuantity:', listingData.availableQuantity, typeof listingData.availableQuantity)
        console.log('   listingData.unit:', listingData.unit, typeof listingData.unit)
        console.log('   listingData.location:', listingData.location)
        console.log('   listingData.qualityGrade:', listingData.qualityGrade, typeof listingData.qualityGrade)

        // Validate the data before creating
        try {
          const testListing = new Listing(listingData)
          const validationResult = testListing.validateSync()

          if (validationResult) {
            console.log('❌ Validation errors found:')
            Object.keys(validationResult.errors).forEach(key => {
              console.log(`   ${key}: ${validationResult.errors[key].message}`)
            })

            return res.status(400).json({
              status: 'error',
              message: 'Listing data validation failed',
              validationErrors: Object.values(validationResult.errors).map(err => err.message)
            })
          } else {
            console.log('✅ Data validation passed')
          }
        } catch (validationError) {
          console.log('❌ Validation test failed:', validationError.message)
          return res.status(400).json({
            status: 'error',
            message: 'Failed to validate listing data',
            error: validationError.message
          })
        }

        listing = await Listing.create(listingData)

        console.log('✅ Listing created successfully:', listing._id)

        // Update harvest status to listed only if listing was created successfully
        harvest.status = 'listed'
        await harvest.save()

        console.log('Harvest status updated to "listed"')

        res.status(201).json({
          status: 'success',
          message: 'Listing created successfully',
          data: { listingId: listing._id, harvestId: harvest._id }
        })

      } catch (listingError) {
        console.error('❌ Error creating listing:', listingError)
        console.error('❌ Error name:', listingError.name)
        console.error('❌ Error code:', listingError.code)
        console.error('❌ Error message:', listingError.message)

        if (listingError.name === 'ValidationError') {
          console.error('❌ Validation errors:', listingError.errors)
          const errors = Object.values(listingError.errors).map(err => err.message)
          return res.status(400).json({
            status: 'error',
            message: 'Listing validation failed',
            details: errors
          })
        }

        if (listingError.code === 11000) {
          console.error('❌ Duplicate key error - listing already exists')
          return res.status(400).json({
            status: 'error',
            message: 'A listing for this harvest already exists'
          })
        }

        if (listingError.name === 'MongoError' || listingError.name === 'MongoServerError') {
          console.error('❌ MongoDB error:', listingError)
          return res.status(500).json({
            status: 'error',
            message: 'Database error occurred while creating listing'
          })
        }

        // Handle connection errors
        if (listingError.message && listingError.message.includes('ECONNREFUSED')) {
          console.error('❌ Database connection refused')
          return res.status(500).json({
            status: 'error',
            message: 'Database connection failed. Please try again.',
            connectionError: true
          })
        }

        console.error('❌ Full error object:', listingError)
        console.error('❌ Error stack:', listingError.stack)

        console.error('❌ Unknown error type:', typeof listingError)
        return res.status(500).json({
          status: 'error',
          message: 'Failed to create listing due to unknown error',
          errorType: listingError.name,
          errorCode: listingError.code
        })
      }
    } catch (error) {
      console.error('❌ TOP LEVEL ERROR in createListingFromHarvest:', error)
      console.error('❌ Error name:', error.name)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error code:', error.code)
      console.error('❌ Full error:', error)

      // Check for specific database errors
      if (error.name === 'ValidationError') {
        console.error('❌ Validation errors:', error.errors)
        return res.status(400).json({
          status: 'error',
          message: 'Invalid data provided for listing creation',
          details: Object.values(error.errors).map(err => err.message)
        })
      }

      if (error.code === 11000) {
        console.error('❌ Duplicate key error - listing may already exist')
        return res.status(409).json({
          status: 'error',
          message: 'A listing for this harvest already exists'
        })
      }

      if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        console.error('❌ MongoDB specific error:', error)
        return res.status(500).json({
          status: 'error',
          message: 'Database error occurred while creating listing'
        })
      }

      // Catch-all for any other error
      console.error('❌ Unknown error type:', typeof error)
      return res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred while creating the listing'
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


