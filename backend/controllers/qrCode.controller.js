const QRCode = require('qrcode')
const Harvest = require('../models/harvest.model')
const User = require('../models/user.model')

const qrCodeController = {
  // Get user's QR codes
  async getUserQRCodes(req, res) {
    try {
      const userId = req.user.id
      
      // Get all harvests for the user with QR codes
      const harvests = await Harvest.find({ farmer: userId })
        .select('batchId cropType quantity status qrCode createdAt')
        .sort({ createdAt: -1 })
      
      const qrCodes = harvests.map(harvest => ({
        id: harvest._id,
        batchId: harvest.batchId,
        cropType: harvest.cropType,
        quantity: harvest.quantity,
        status: harvest.status,
        qrCode: harvest.qrCode,
        createdAt: harvest.createdAt
      }))
      
      res.json({
        status: 'success',
        data: qrCodes
      })
    } catch (error) {
      console.error('Error getting user QR codes:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get QR codes'
      })
    }
  },

  // Generate new QR code for existing harvest
  async generateNewQRCode(req, res) {
    try {
      const userId = req.user.id
      const { harvestId } = req.body
      
      if (!harvestId) {
        return res.status(400).json({
          status: 'error',
          message: 'Harvest ID is required'
        })
      }
      
      // Find the harvest
      const harvest = await Harvest.findOne({ 
        _id: harvestId, 
        farmer: userId 
      })
      
      if (!harvest) {
        return res.status(404).json({
          status: 'error',
          message: 'Harvest not found'
        })
      }
      
      // Generate QR code data
      const qrData = {
        batchId: harvest.batchId,
        cropType: harvest.cropType,
        farmerId: harvest.farmer,
        harvestDate: harvest.harvestDate,
        verificationUrl: `${process.env.FRONTEND_URL}/verify/${harvest.batchId}`
      }
      
      // Generate QR code image
      const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData))
      
      // Update harvest with new QR code
      harvest.qrCode = qrCodeImage
      harvest.qrCodeData = qrData
      await harvest.save()
      
      res.json({
        status: 'success',
        data: {
          qrCode: qrCodeImage,
          qrData,
          message: 'QR code generated successfully'
        }
      })
    } catch (error) {
      console.error('Error generating QR code:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate QR code'
      })
    }
  },

  // Get QR code statistics
  async getQRCodeStats(req, res) {
    try {
      const userId = req.user.id
      
      // Get total harvests
      const totalHarvests = await Harvest.countDocuments({ farmer: userId })
      
      // Get harvests with QR codes
      const harvestsWithQR = await Harvest.countDocuments({ 
        farmer: userId, 
        qrCode: { $exists: true, $ne: null } 
      })
      
      // Get harvests by status
      const statusStats = await Harvest.aggregate([
        { $match: { farmer: userId } },
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        }}
      ])
      
      // Get recent QR code generation activity
      const recentActivity = await Harvest.find({ 
        farmer: userId, 
        qrCode: { $exists: true, $ne: null } 
      })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('batchId cropType status updatedAt')
      
      const stats = {
        totalHarvests,
        harvestsWithQR,
        qrCodeCoverage: totalHarvests > 0 ? (harvestsWithQR / totalHarvests * 100).toFixed(2) : 0,
        statusBreakdown: statusStats,
        recentActivity,
        lastUpdated: new Date()
      }
      
      res.json({
        status: 'success',
        data: stats
      })
    } catch (error) {
      console.error('Error getting QR code stats:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get QR code statistics'
      })
    }
  },

  // Get specific QR code details
  async getQRCodeById(req, res) {
    try {
      const userId = req.user.id
      const { id } = req.params
      
      const harvest = await Harvest.findOne({ 
        _id: id, 
        farmer: userId 
      }).select('batchId cropType quantity status qrCode qrCodeData createdAt')
      
      if (!harvest) {
        return res.status(404).json({
          status: 'error',
          message: 'Harvest not found'
        })
      }
      
      if (!harvest.qrCode) {
        return res.status(404).json({
          status: 'error',
          message: 'QR code not found for this harvest'
        })
      }
      
      res.json({
        status: 'success',
        data: {
          id: harvest._id,
          batchId: harvest.batchId,
          cropType: harvest.cropType,
          quantity: harvest.quantity,
          status: harvest.status,
          qrCode: harvest.qrCode,
          qrCodeData: harvest.qrCodeData,
          createdAt: harvest.createdAt
        }
      })
    } catch (error) {
      console.error('Error getting QR code by ID:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get QR code'
      })
    }
  },

  // Delete QR code
  async deleteQRCode(req, res) {
    try {
      const userId = req.user.id
      const { id } = req.params
      
      const harvest = await Harvest.findOne({ 
        _id: id, 
        farmer: userId 
      })
      
      if (!harvest) {
        return res.status(404).json({
          status: 'error',
          message: 'Harvest not found'
        })
      }
      
      // Remove QR code data
      harvest.qrCode = undefined
      harvest.qrCodeData = undefined
      await harvest.save()
      
      res.json({
        status: 'success',
        message: 'QR code deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting QR code:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete QR code'
      })
    }
  }
}

module.exports = qrCodeController

