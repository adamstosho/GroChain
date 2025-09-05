const router = require('express').Router()
const { authenticate, authorize } = require('../middlewares/auth.middleware')
const User = require('../models/user.model')
const upload = require('../utils/upload')

router.get('/dashboard', authenticate, authorize('admin','partner','farmer','buyer'), async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    
    let dashboardData = {
      totalHarvests: 0,
      pendingApprovals: 0,
      activeListings: 0,
      monthlyRevenue: 0
    }
    
    // Get harvest data for farmers
    if (userRole === 'farmer') {
      const Harvest = require('../models/harvest.model')
      const [totalHarvests, pendingHarvests] = await Promise.all([
        Harvest.countDocuments({ farmer: userId }),
        Harvest.countDocuments({ farmer: userId, status: 'pending' })
      ])
      
      dashboardData.totalHarvests = totalHarvests
      dashboardData.pendingApprovals = pendingHarvests
      
      // Get marketplace listings for farmers
      const Listing = require('../models/listing.model')
      const activeListings = await Listing.countDocuments({ 
        farmer: userId, 
        status: 'active' 
      })
      dashboardData.activeListings = activeListings
      
      // Get monthly revenue for farmers
      const Transaction = require('../models/transaction.model')
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const monthlyTransactions = await Transaction.aggregate([
        {
          $match: {
            farmer: userId,
            status: 'completed',
            createdAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
      
      dashboardData.monthlyRevenue = monthlyTransactions[0]?.total || 0
    }
    
    // Get partner data
    if (userRole === 'partner') {
      const Partner = require('../models/partner.model')
      const partner = await Partner.findOne({ user: userId })
      
      if (partner) {
        const Harvest = require('../models/harvest.model')
        const pendingApprovals = await Harvest.countDocuments({ 
          partner: partner._id, 
          status: 'pending' 
        })
        
        dashboardData.pendingApprovals = pendingApprovals
        dashboardData.totalHarvests = await Harvest.countDocuments({ partner: partner._id })
      }
    }
    
    // Get buyer data
    if (userRole === 'buyer') {
      const Order = require('../models/order.model')
      const Favorite = require('../models/favorite.model')

      // Get current month start and end
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

      // Get total orders
      const totalOrders = await Order.countDocuments({ buyer: userId })

      // Get total spent (sum of all completed orders) - use 'paid' or 'delivered' status
      const totalSpentResult = await Order.aggregate([
        {
          $match: {
            buyer: userId,
            status: { $in: ['paid', 'delivered'] },
            total: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$total', 0] } }
          }
        }
      ])
      let totalSpent = totalSpentResult[0]?.total || 0

      // Fallback: If no results from aggregation, try manual calculation
      if (totalSpent === 0) {
        const paidOrders = await Order.find({
          buyer: userId,
          status: { $in: ['paid', 'delivered'] },
          total: { $exists: true, $ne: null }
        }).select('total')
        totalSpent = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      }

      // Get monthly spent (current month)
      const monthlySpentResult = await Order.aggregate([
        {
          $match: {
            buyer: userId,
            status: { $in: ['paid', 'delivered'] },
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            total: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$total', 0] } }
          }
        }
      ])
      let monthlySpent = monthlySpentResult[0]?.total || 0

      // Fallback: If no results from aggregation, try manual calculation
      if (monthlySpent === 0) {
        const monthlyPaidOrders = await Order.find({
          buyer: userId,
          status: { $in: ['paid', 'delivered'] },
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          total: { $exists: true, $ne: null }
        }).select('total')
        monthlySpent = monthlyPaidOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      }

      // Get favorites count
      const favoritesCount = await Favorite.countDocuments({ user: userId })

      // Get pending deliveries (orders that are shipped but not delivered)
      const pendingDeliveries = await Order.countDocuments({
        buyer: userId,
        status: 'shipped'
      })

      // Get active orders (confirmed, processing, or paid but not shipped)
      const activeOrders = await Order.countDocuments({
        buyer: userId,
        status: { $in: ['confirmed', 'processing', 'paid'] }
      })

      dashboardData = {
        totalOrders,
        totalSpent,
        monthlySpent,
        favoriteProducts: favoritesCount,
        pendingDeliveries,
        activeOrders,
        lastOrderDate: null
      }

      // Get last order date
      const lastOrder = await Order.findOne({ buyer: userId }).sort({ createdAt: -1 })
      if (lastOrder) {
        dashboardData.lastOrderDate = lastOrder.createdAt
      }
    }
    
    // Get admin data
    if (userRole === 'admin') {
      const Harvest = require('../models/harvest.model')
      const User = require('../models/user.model')
      const Transaction = require('../models/transaction.model')
      
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const [totalHarvests, pendingApprovals, totalUsers, monthlyRevenue] = await Promise.all([
        Harvest.countDocuments(),
        Harvest.countDocuments({ status: 'pending' }),
        User.countDocuments(),
        Transaction.aggregate([
          {
            $match: {
              status: 'completed',
              createdAt: { $gte: startOfMonth }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ])
      ])
      
      dashboardData.totalHarvests = totalHarvests
      dashboardData.pendingApprovals = pendingApprovals
      dashboardData.activeListings = totalUsers
      dashboardData.monthlyRevenue = monthlyRevenue[0]?.total || 0
    }
    
    return res.json({ status: 'success', data: dashboardData })
  } catch (error) {
    console.error('Dashboard error:', error)
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to load dashboard data' 
    })
  }
})

router.get('/profile/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('partner').select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires -smsOtpToken -smsOtpExpires')

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' })
    }

    // Get additional profile data based on user role
    let profileData = {
      ...user.toObject(),
      stats: {
        totalHarvests: 0,
        totalListings: 0,
        totalOrders: 0,
        totalRevenue: 0,
        lastActive: user.stats?.lastActive || user.createdAt
      }
    }

    if (user.role === 'farmer') {
      // Get farmer-specific stats
      const Harvest = require('../models/harvest.model')
      const Listing = require('../models/listing.model')
      const Order = require('../models/order.model')
      const Transaction = require('../models/transaction.model')

      const [totalHarvests, totalListings, totalOrders, totalRevenue] = await Promise.all([
        Harvest.countDocuments({ farmer: user._id }),
        Listing.countDocuments({ farmer: user._id }),
        Order.countDocuments({ 'items.listing': { $in: await Listing.find({ farmer: user._id }).distinct('_id') } }),
        Transaction.aggregate([
          { $match: { userId: user._id, type: { $in: ['payment', 'commission'] }, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ])

      profileData.stats = {
        totalHarvests,
        totalListings,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        lastActive: user.stats?.lastActive || user.createdAt
      }

      // Get recent harvests
      const recentHarvests = await Harvest.find({ farmer: user._id })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('cropType quantity qualityGrade status createdAt')

      profileData.recentHarvests = recentHarvests

    } else if (user.role === 'partner') {
      // Get partner-specific data
      const partnerFarmers = await User.countDocuments({ partner: user.partner?._id, role: 'farmer' })
      const partnerHarvests = await require('../models/harvest.model').countDocuments({
        farmer: { $in: await User.find({ partner: user.partner?._id, role: 'farmer' }).distinct('_id') }
      })

      profileData.partnerStats = {
        totalFarmers: partnerFarmers,
        totalHarvests: partnerHarvests,
        partnerInfo: user.partner
      }
    }

    return res.json({ status: 'success', data: profileData })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return res.status(500).json({ status: 'error', message: 'Failed to fetch profile' })
  }
})

router.put('/profile/me', authenticate, async (req, res) => {
  try {
    const updateData = { ...req.body }

    // Remove sensitive fields that shouldn't be updated via profile
    delete updateData.password
    delete updateData.role
    delete updateData.status
    delete updateData.emailVerified
    delete updateData.phoneVerified
    delete updateData.resetPasswordToken
    delete updateData.resetPasswordExpires
    delete updateData.emailVerificationToken
    delete updateData.emailVerificationExpires
    delete updateData.smsOtpToken
    delete updateData.smsOtpExpires
    delete updateData.suspensionReason
    delete updateData.suspendedAt
    delete updateData.suspendedBy

    // Update last active timestamp
    updateData.stats = {
      ...updateData.stats,
      lastActive: new Date()
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires -smsOtpToken -smsOtpExpires')

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' })
    }

    return res.json({ status: 'success', data: user })
  } catch (error) {
    console.error('Error updating profile:', error)
    return res.status(500).json({ status: 'error', message: 'Failed to update profile' })
  }
})

router.get('/preferences/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id)
  return res.json({ notifications: user?.notificationPreferences || {} })
})

router.put('/preferences/me', authenticate, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, { notificationPreferences: req.body.notifications || {} }, { new: true })
  return res.json({ notifications: user.notificationPreferences })
})

router.get('/settings/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings preferences notificationPreferences profile')

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' })
    }

    // Return structured settings data
    const settingsData = {
      general: {
        language: user.settings?.language || 'en',
        timezone: user.settings?.timezone || 'Africa/Lagos',
        currency: user.settings?.currency || 'NGN',
        theme: user.settings?.theme || 'auto'
      },
      notifications: user.notificationPreferences || {},
      preferences: user.preferences || {},
      profile: {
        bio: user.profile?.bio || '',
        address: user.profile?.address || '',
        city: user.profile?.city || '',
        state: user.profile?.state || '',
        country: user.profile?.country || 'Nigeria',
        postalCode: user.profile?.postalCode || '',
        avatar: user.profile?.avatar || null
      },
      security: {
        twoFactorAuth: false, // Will be implemented later
        loginNotifications: true,
        sessionTimeout: 60 // minutes
      }
    }

    return res.json({ status: 'success', data: settingsData })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return res.status(500).json({ status: 'error', message: 'Failed to fetch settings' })
  }
})

router.put('/settings/me', authenticate, async (req, res) => {
  try {
    const { general, notifications, preferences, security } = req.body

    // Prepare update data
    const updateData = {}

    if (general) {
      updateData.settings = {
        ...general
      }
    }

    if (notifications) {
      updateData.notificationPreferences = {
        ...notifications
      }
    }

    if (preferences) {
      updateData.preferences = {
        ...preferences
      }
    }

    // Note: Security settings will be handled separately for now
    // as they may require additional validation and implementation

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('settings preferences notificationPreferences')

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' })
    }

    // Return updated settings
    const settingsData = {
      general: {
        language: user.settings?.language || 'en',
        timezone: user.settings?.timezone || 'Africa/Lagos',
        currency: user.settings?.currency || 'NGN',
        theme: user.settings?.theme || 'auto'
      },
      notifications: user.notificationPreferences || {},
      preferences: user.preferences || {},
      security: {
        twoFactorAuth: false,
        loginNotifications: true,
        sessionTimeout: 60
      }
    }

    return res.json({ status: 'success', data: settingsData, message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return res.status(500).json({ status: 'error', message: 'Failed to update settings' })
  }
})

router.get('/recent-activities', authenticate, async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    const limit = parseInt(req.query.limit) || 10

    let activities = []

    // Get recent harvests for farmers
    if (userRole === 'farmer') {
      const Harvest = require('../models/harvest.model')
      const recentHarvests = await Harvest.find({ farmer: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('farmer', 'name')

      activities = recentHarvests.map(harvest => ({
        _id: harvest._id,
        type: 'harvest',
        description: `New harvest of ${harvest.quantity}${harvest.unit} ${harvest.cropType} submitted`,
        timestamp: harvest.createdAt,
        user: harvest.farmer?.name || 'You',
        metadata: {
          cropType: harvest.cropType,
          quantity: harvest.quantity,
          status: harvest.status
        }
      }))
    }

    // Get recent orders for buyers
    if (userRole === 'buyer') {
      const Order = require('../models/order.model')
      const recentOrders = await Order.find({ buyer: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('buyer', 'name')

      activities = recentOrders.map(order => ({
        _id: order._id,
        type: 'order',
        description: `Order #${order._id.toString().slice(-6)} placed`,
        timestamp: order.createdAt,
        user: order.buyer?.name || 'You',
        metadata: {
          amount: order.totalAmount,
          status: order.status
        }
      }))
    }

    // Get recent activities for partners
    if (userRole === 'partner') {
      const Partner = require('../models/partner.model')
      const partner = await Partner.findOne({ user: userId })

      if (partner) {
        const Harvest = require('../models/harvest.model')
        const recentHarvests = await Harvest.find({ partner: partner._id })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('farmer', 'name')

        activities = recentHarvests.map(harvest => ({
          _id: harvest._id,
          type: 'harvest',
          description: `Harvest from ${harvest.farmer?.name || 'Unknown Farmer'} verified`,
          timestamp: harvest.updatedAt || harvest.createdAt,
          user: harvest.farmer?.name || 'Unknown Farmer',
          metadata: {
            cropType: harvest.cropType,
            quantity: harvest.quantity,
            status: harvest.status
          }
        }))
      }
    }

    return res.json({ status: 'success', data: activities })

  } catch (error) {
    console.error('Recent activities error:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recent activities'
    })
  }
})

// Avatar upload endpoint (must be before admin middleware)
router.post('/upload-avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      })
    }

    const userId = req.user.id
    const avatarUrl = `/uploads/avatars/${req.file.filename}`

    // Update user profile with new avatar
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        'profile.avatar': avatarUrl
      },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }

    res.json({
      status: 'success',
      data: {
        avatarUrl: avatarUrl,
        message: 'Avatar uploaded successfully'
      }
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload avatar'
    })
  }
})

// Proxy endpoint for serving avatars (bypasses CORS issues)
router.get('/avatar/:filename', async (req, res) => {
  try {
    console.log('Avatar proxy request received for:', req.params.filename)
    const fs = require('fs')
    const path = require('path')
    const filename = req.params.filename
    const filePath = path.join(__dirname, '..', 'uploads', 'avatars', filename)

    console.log('Looking for file at:', filePath)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath)
      return res.status(404).json({
        status: 'error',
        message: 'Avatar not found'
      })
    }

    console.log('File exists, sending file...')
    // Send the file directly (no CORS issues since it's from the same origin)
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err)
        // Check if headers have already been sent before sending error response
        if (!res.headersSent) {
          res.status(500).json({
            status: 'error',
            message: 'Failed to serve avatar'
          })
        }
      } else {
        console.log('File sent successfully')
      }
    })
  } catch (error) {
    console.error('Avatar proxy error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to serve avatar'
    })
  }
})

router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required'
      })
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 8 characters long'
      })
    }

    // Get user with password field
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' })
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      })
    }

    // Update password (pre-save middleware will hash it)
    user.password = newPassword
    await user.save()

    return res.json({
      status: 'success',
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Failed to change password'
    })
  }
})

// Admin suite
router.use(authenticate, authorize('admin'))

// List users
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, role, status, search } = req.query
  const query = {}
  if (role) query.role = role
  if (status) query.status = status
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') }
    ]
  }
  const users = await User.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(parseInt(limit))
  const total = await User.countDocuments(query)
  return res.json({ status: 'success', data: { users, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total/limit), totalItems: total, itemsPerPage: parseInt(limit) } } })
})

// Create user
router.post('/', async (req, res) => {
  const user = await User.create(req.body)
  return res.status(201).json({ status: 'success', data: user })
})

// Get user
router.get('/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId)
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', data: user })
})

// Update user
router.put('/:userId', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true })
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', data: user })
})

// Delete user
router.delete('/:userId', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.userId)
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', message: 'User deleted' })
})

// Bulk create
router.post('/bulk-create', async (req, res) => {
  const { users } = req.body || {}
  if (!Array.isArray(users) || users.length === 0) return res.status(400).json({ status: 'error', message: 'users array required' })
  const created = await User.insertMany(users, { ordered: false })
  return res.status(201).json({ status: 'success', data: { created: created.length } })
})

// Bulk update
router.put('/bulk-update', async (req, res) => {
  const { updates } = req.body || {}
  if (!Array.isArray(updates) || updates.length === 0) return res.status(400).json({ status: 'error', message: 'updates array required' })
  for (const u of updates) { await User.findByIdAndUpdate(u.id, u.data) }
  return res.json({ status: 'success', message: 'Bulk update applied' })
})

// Bulk delete
router.delete('/bulk-delete', async (req, res) => {
  const { ids } = req.body || {}
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ status: 'error', message: 'ids array required' })
  const result = await User.deleteMany({ _id: { $in: ids } })
  return res.json({ status: 'success', data: { deleted: result.deletedCount } })
})

// Search users
router.get('/search/query', async (req, res) => {
  const { q } = req.query
  const users = await User.find({ $or: [ { name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') } ] }).limit(50)
  return res.json({ status: 'success', data: users })
})

// Stats & activity
router.get('/:userId/stats', async (req, res) => {
  return res.json({ status: 'success', data: { orders: 0, harvests: 0, listings: 0 } })
})

router.get('/:userId/activity', async (req, res) => {
  return res.json({ status: 'success', data: [] })
})

// Verify / suspend / reactivate / change role
router.post('/:userId/verify', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { emailVerified: true }, { new: true })
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', data: user })
})

router.patch('/:userId/suspend', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { status: 'suspended', suspendedAt: new Date(), suspensionReason: req.body?.reason }, { new: true })
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', data: user })
})

router.patch('/:userId/reactivate', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { status: 'active', suspensionReason: null, suspendedAt: null }, { new: true })
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', data: user })
})

router.patch('/:userId/role', async (req, res) => {
  const { role } = req.body || {}
  if (!role) return res.status(400).json({ status: 'error', message: 'role required' })
  const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true })
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', data: user })
})

// Export users (stub)
router.post('/export', async (req, res) => {
  return res.json({ status: 'success', data: { url: null, message: 'Not yet implemented' } })
})



module.exports = router


