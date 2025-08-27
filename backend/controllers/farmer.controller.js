const User = require('../models/user.model')
const Harvest = require('../models/harvest.model')
const Transaction = require('../models/transaction.model')
const FarmerProfile = require('../models/farmer-profile.model')

const farmerController = {
  // Get farmer's own profile
  async getMyProfile(req, res) {
    try {
      const farmerId = req.user.id
      
      const profile = await FarmerProfile.findOne({ farmer: farmerId })
        .populate('farmer', 'name email phone region')
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Farmer profile not found'
        })
      }
      
      res.json({
        status: 'success',
        data: profile
      })
    } catch (error) {
      console.error('Error getting farmer profile:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get farmer profile'
      })
    }
  },

  // Update farmer's own profile
  async updateMyProfile(req, res) {
    try {
      const farmerId = req.user.id
      const updateData = req.body
      
      // Remove sensitive fields that shouldn't be updated
      delete updateData.farmer
      delete updateData._id
      
      const profile = await FarmerProfile.findOneAndUpdate(
        { farmer: farmerId },
        updateData,
        { new: true, runValidators: true }
      ).populate('farmer', 'name email phone region')
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Farmer profile not found'
        })
      }
      
      res.json({
        status: 'success',
        data: profile,
        message: 'Profile updated successfully'
      })
    } catch (error) {
      console.error('Error updating farmer profile:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to update farmer profile'
      })
    }
  },

  // Get farmer's preferences
  async getMyPreferences(req, res) {
    try {
      const farmerId = req.user.id
      
      const profile = await FarmerProfile.findOne({ farmer: farmerId })
        .select('preferences')
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Farmer profile not found'
        })
      }
      
      res.json({
        status: 'success',
        data: profile.preferences || {}
      })
    } catch (error) {
      console.error('Error getting farmer preferences:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get farmer preferences'
      })
    }
  },

  // Update farmer's preferences
  async updateMyPreferences(req, res) {
    try {
      const farmerId = req.user.id
      const preferences = req.body
      
      const profile = await FarmerProfile.findOneAndUpdate(
        { farmer: farmerId },
        { preferences },
        { new: true, runValidators: true }
      )
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Farmer profile not found'
        })
      }
      
      res.json({
        status: 'success',
        data: profile.preferences,
        message: 'Preferences updated successfully'
      })
    } catch (error) {
      console.error('Error updating farmer preferences:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to update farmer preferences'
      })
    }
  },

  // Get farmer's settings
  async getMySettings(req, res) {
    try {
      const farmerId = req.user.id
      
      const profile = await FarmerProfile.findOne({ farmer: farmerId })
        .select('settings')
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Farmer profile not found'
        })
      }
      
      res.json({
        status: 'success',
        data: profile.settings || {}
      })
    } catch (error) {
      console.error('Error getting farmer settings:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get farmer settings'
      })
    }
  },

  // Update farmer's settings
  async updateMySettings(req, res) {
    try {
      const farmerId = req.user.id
      const settings = req.body
      
      const profile = await FarmerProfile.findOneAndUpdate(
        { farmer: farmerId },
        { settings },
        { new: true, runValidators: true }
      )
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Farmer profile not found'
        })
      }
      
      res.json({
        status: 'success',
        data: profile.settings,
        message: 'Settings updated successfully'
      })
    } catch (error) {
      console.error('Error updating farmer settings:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to update farmer settings'
      })
    }
  },

  // Get farmer dashboard data
  async getDashboardData(req, res) {
    try {
      const farmerId = req.user.id
      
      // Get recent harvests
      const recentHarvests = await Harvest.find({ farmer: farmerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('cropType quantity status createdAt')
      
      // Get earnings summary
      const earnings = await Transaction.aggregate([
        { $match: { farmer: farmerId, type: 'sale', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
      
      // Get harvest count
      const harvestCount = await Harvest.countDocuments({ farmer: farmerId })
      
      // Get pending harvests
      const pendingHarvests = await Harvest.countDocuments({ 
        farmer: farmerId, 
        status: 'pending' 
      })
      
      const dashboardData = {
        recentHarvests,
        totalEarnings: earnings[0]?.total || 0,
        harvestCount,
        pendingHarvests,
        lastUpdated: new Date()
      }
      
      res.json({
        status: 'success',
        data: dashboardData
      })
    } catch (error) {
      console.error('Error getting dashboard data:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get dashboard data'
      })
    }
  },

  // Get harvest summary
  async getHarvestSummary(req, res) {
    try {
      const farmerId = req.user.id
      
      const summary = await Harvest.aggregate([
        { $match: { farmer: farmerId } },
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }},
        { $sort: { count: -1 } }
      ])
      
      res.json({
        status: 'success',
        data: summary
      })
    } catch (error) {
      console.error('Error getting harvest summary:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get harvest summary'
      })
    }
  },

  // Get earnings summary
  async getEarningsSummary(req, res) {
    try {
      const farmerId = req.user.id
      
      const earnings = await Transaction.aggregate([
        { $match: { farmer: farmerId, type: 'sale', status: 'completed' } },
        { $group: { 
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }},
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
      
      res.json({
        status: 'success',
        data: earnings
      })
    } catch (error) {
      console.error('Error getting earnings summary:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get earnings summary'
      })
    }
  }
}

module.exports = farmerController

