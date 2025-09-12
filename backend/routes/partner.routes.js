const express = require('express')
const router = express.Router()

// Simple test route - no authentication required
router.get('/ping', (req, res) => {
  res.json({ status: 'success', message: 'Partner routes are working' });
});

// Debug route
router.get('/debug-simple', (req, res) => {
  console.log('🔍 Debug-simple route called');
  res.json({
    status: 'success',
    message: 'Debug route working',
    timestamp: new Date().toISOString()
  });
});

// Import required modules for dashboard
const User = require('../models/user.model');
const Partner = require('../models/partner.model');
const { authenticate } = require('../middlewares/auth.middleware');
const multer = require('multer');
const ctrl = require('../controllers/partner.controller');

// Apply authentication to all routes below
router.use(authenticate);

// Partner dashboard endpoint - REAL DATA ONLY
router.get('/dashboard', async (req, res) => {
  console.log('🔍 Partner dashboard endpoint called');

  try {
    console.log('🔍 Checking authentication...');
    // Validate authentication
    if (!req.user || (!req.user.id && !req.user._id)) {
      console.log('❌ No authentication found');
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.user.id || req.user._id;
    console.log('🔍 User ID from JWT:', userId);

    console.log('🔍 Finding user in database...');
    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    console.log('✅ User found:', user.email);

    console.log('🔍 Finding partner profile...');
    // Get or create partner profile
    let partner = await Partner.findOne({ email: user.email });
    if (!partner) {
      console.log('🔍 Creating new partner profile...');
      partner = new Partner({
        name: user.name,
        email: user.email,
        phone: user.phone || '+234000000000',
        organization: `${user.name} Organization`,
        type: 'cooperative',
        location: user.location || 'Nigeria',
        status: 'active',
        commissionRate: 0.05,
        farmers: [],
        totalFarmers: 0,
        totalCommissions: 0
      });
      await partner.save();
      console.log('✅ Partner created');
    }

    console.log('✅ Partner found:', partner.name);

    console.log('🔍 Getting farmer statistics...');
    // Get REAL farmer statistics
    const totalFarmers = await User.countDocuments({
      partner: partner._id,
      role: 'farmer'
    });

    const activeFarmers = await User.countDocuments({
      partner: partner._id,
      role: 'farmer',
      status: 'active'
    });

    const inactiveFarmers = totalFarmers - activeFarmers;

    console.log('✅ Farmer stats:', { totalFarmers, activeFarmers, inactiveFarmers });

    console.log('🔍 Getting recent farmers...');
    // Get recent farmers
    const recentFarmers = await User.find({
      partner: partner._id,
      role: 'farmer'
    })
    .select('name email phone location status createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

    console.log('✅ Recent farmers found:', recentFarmers.length);

    // Return real data only
    const dashboard = {
      totalFarmers: totalFarmers,
      activeFarmers: activeFarmers,
      inactiveFarmers: inactiveFarmers,
      pendingApprovals: 0, // Real data when harvest system is implemented
      monthlyCommission: partner.totalCommissions || 0,
      totalCommission: partner.totalCommissions || 0,
      commissionRate: partner.commissionRate || 0.05,
      approvalRate: totalFarmers > 0 ? Math.round((activeFarmers / totalFarmers) * 100) : 0,
      recentFarmers: recentFarmers.map(farmer => ({
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        phone: farmer.phone,
        location: farmer.location,
        status: farmer.status || 'active',
        joinedAt: farmer.createdAt
      })),
      partnerInfo: {
        name: partner.name,
        email: partner.email,
        organization: partner.organization,
        joinedAt: partner.createdAt,
        status: partner.status
      }
    };

    console.log('✅ Dashboard data prepared successfully');
    return res.json({
      status: 'success',
      message: 'Dashboard data retrieved from database',
      data: dashboard
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);

    // Handle database connection errors
    if (error.name === 'MongoNetworkError' ||
        error.name === 'MongoTimeoutError' ||
        error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        status: 'error',
        message: 'Database connection unavailable - please check your internet connection',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Server error occurred',
      debug: error.message,
      stack: error.stack
    });
  }
});

// Partner farmers endpoint - REAL DATA ONLY
router.get('/farmers', async (req, res) => {
  try {
    // Validate authentication
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.user.id || req.user._id;

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get or create partner profile
    let partner = await Partner.findOne({ email: user.email });
    if (!partner) {
      partner = new Partner({
        name: user.name,
        email: user.email,
        phone: user.phone || '+234000000000',
        organization: `${user.name} Organization`,
        type: 'cooperative',
        location: user.location || 'Nigeria',
        status: 'active',
        commissionRate: 0.05,
        farmers: [],
        totalFarmers: 0,
        totalCommissions: 0
      });
      await partner.save();
    }

    // Get farmer data with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const query = { partner: partner._id, role: 'farmer' };

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    if (req.query.location && req.query.location !== 'all') {
      query.location = req.query.location;
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get total farmers count for stats (without pagination, but with filters)
    const baseQuery = { partner: partner._id, role: 'farmer' };
    const statsQuery = { ...baseQuery };

    // Apply location filter to stats if present
    if (req.query.location && req.query.location !== 'all') {
      statsQuery.location = req.query.location;
    }

    // Apply search filter to stats if present
    if (req.query.search) {
      statsQuery.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const totalFarmers = await User.countDocuments(statsQuery);
    const activeFarmers = await User.countDocuments({ ...statsQuery, status: 'active' });
    const inactiveFarmers = await User.countDocuments({ ...statsQuery, status: 'inactive' });
    const suspendedFarmers = await User.countDocuments({ ...statsQuery, status: 'suspended' });

    // Get farmers for current page
    const farmers = await User.find(query)
      .select('name email phone location status createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get harvest data for each farmer
    const farmersData = await Promise.all(farmers.map(async (farmer) => {
      // Count harvests for this farmer
      const Harvest = require('../models/harvest.model');
      const totalHarvests = await Harvest.countDocuments({ farmer: farmer._id });

      // Get total earnings from orders/transactions
      const Order = require('../models/order.model');
      const totalEarningsResult = await Order.aggregate([
        { $match: { farmer: farmer._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].total : 0;

      // Get last activity (last harvest or order)
      const lastHarvest = await Harvest.findOne({ farmer: farmer._id }).sort({ createdAt: -1 });
      const lastOrder = await Order.findOne({ farmer: farmer._id }).sort({ createdAt: -1 });

      let lastActivity = farmer.createdAt;
      if (lastHarvest && lastHarvest.createdAt > lastActivity) {
        lastActivity = lastHarvest.createdAt;
      }
      if (lastOrder && lastOrder.createdAt > lastActivity) {
        lastActivity = lastOrder.createdAt;
      }

      return {
        _id: farmer._id,
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        phone: farmer.phone,
        location: farmer.location,
        status: farmer.status || 'active',
        joinedAt: farmer.createdAt,
        lastActivity: lastActivity,
        totalHarvests: totalHarvests,
        totalEarnings: totalEarnings,
        partner: partner._id
      };
    }));

    return res.json({
      status: 'success',
      message: 'Farmers data retrieved from database',
      data: {
        farmers: farmersData,
        total: totalFarmers,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalFarmers / limit),
        stats: {
          totalFarmers,
          activeFarmers,
          inactiveFarmers,
          suspendedFarmers
        }
      }
    });

  } catch (error) {
    console.error('Farmers endpoint error:', error);

    // Handle database connection errors
    if (error.name === 'MongoNetworkError' ||
        error.name === 'MongoTimeoutError' ||
        error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        status: 'error',
        message: 'Database connection unavailable',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Server error occurred',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Partner commission endpoint - REAL DATA ONLY
router.get('/commission', async (req, res) => {
  try {
    // Validate authentication
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.user.id || req.user._id;

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get or create partner profile
    let partner = await Partner.findOne({ email: user.email });
    if (!partner) {
      partner = new Partner({
        name: user.name,
        email: user.email,
        phone: user.phone || '+234000000000',
        organization: `${user.name} Organization`,
        type: 'cooperative',
        location: user.location || 'Nigeria',
        status: 'active',
        commissionRate: 0.05,
        farmers: [],
        totalFarmers: 0,
        totalCommissions: 0
      });
      await partner.save();
    }

    // Return real commission data
    const commissionData = {
      totalEarned: partner.totalCommissions || 0,
      commissionRate: partner.commissionRate || 0.05,
      pendingAmount: 0, // Real data when commission system is fully implemented
      paidAmount: partner.totalCommissions || 0,
      lastPayout: null, // Real data when payout system is implemented
      summary: {
        thisMonth: partner.totalCommissions || 0,
        lastMonth: 0, // Real data when monthly tracking is implemented
        totalEarned: partner.totalCommissions || 0
      },
      monthlyBreakdown: [], // Real data when commission history is implemented
      partnerInfo: {
        name: partner.name,
        organization: partner.organization,
        commissionRate: partner.commissionRate
      }
    };

    return res.json({
      status: 'success',
      message: 'Commission data retrieved from database',
      data: commissionData
    });

  } catch (error) {
    console.error('Commission endpoint error:', error);

    // Handle database connection errors
    if (error.name === 'MongoNetworkError' ||
        error.name === 'MongoTimeoutError' ||
        error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        status: 'error',
        message: 'Database connection unavailable',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Server error occurred',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Partner metrics endpoint - REAL DATA ONLY
router.get('/metrics', async (req, res) => {
  try {
    // Validate authentication
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.user.id || req.user._id;

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get or create partner profile
    let partner = await Partner.findOne({ email: user.email });
    if (!partner) {
      partner = new Partner({
        name: user.name,
        email: user.email,
        phone: user.phone || '+234000000000',
        organization: `${user.name} Organization`,
        type: 'cooperative',
        location: user.location || 'Nigeria',
        status: 'active',
        commissionRate: 0.05,
        farmers: [],
        totalFarmers: 0,
        totalCommissions: 0
      });
      await partner.save();
    }

    // Get REAL metrics data
    const totalFarmers = await User.countDocuments({
      partner: partner._id,
      role: 'farmer'
    });

    const activeFarmers = await User.countDocuments({
      partner: partner._id,
      role: 'farmer',
      status: 'active'
    });

    const inactiveFarmers = totalFarmers - activeFarmers;

    const metrics = {
      totalFarmers: totalFarmers,
      activeFarmers: activeFarmers,
      inactiveFarmers: inactiveFarmers,
      totalCommissions: partner.totalCommissions || 0,
      monthlyCommissions: partner.totalCommissions || 0,
      commissionRate: partner.commissionRate || 0.05,
      approvalRate: totalFarmers > 0 ? Math.round((activeFarmers / totalFarmers) * 100) : 0,
      conversionRate: 85, // Placeholder for when conversion tracking is implemented
      performanceMetrics: {
        farmersOnboardedThisMonth: 0, // Real data when monthly tracking is implemented
        commissionsEarnedThisMonth: partner.totalCommissions || 0,
        averageCommissionPerFarmer: totalFarmers > 0 ? (partner.totalCommissions || 0) / totalFarmers : 0
      },
      partnerInfo: {
        name: partner.name,
        email: partner.email,
        organization: partner.organization,
        status: partner.status,
        joinedAt: partner.createdAt
      }
    };

    return res.json({
      status: 'success',
      message: 'Metrics data retrieved from database',
      data: metrics
    });

  } catch (error) {
    console.error('Metrics endpoint error:', error);

    // Handle database connection errors
    if (error.name === 'MongoNetworkError' ||
        error.name === 'MongoTimeoutError' ||
        error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        status: 'error',
        message: 'Database connection unavailable',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Server error occurred',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// CSV upload for bulk onboarding
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

router.post('/upload-csv', upload.single('csvFile'), ctrl.bulkUploadFarmersCSV);

// Add single farmer endpoint
router.post('/farmers/add', ctrl.addSingleFarmer);

// Referral management routes
const referralController = require('../controllers/referral.controller');

// Get referrals for partner
router.get('/referrals', referralController.getReferrals);

// Get referral statistics
router.get('/referrals/stats/overview', referralController.getReferralStats);

// Create new referral
router.post('/referrals', referralController.createReferral);

// Get specific referral
router.get('/referrals/:id', referralController.getReferralById);

// Update referral
router.put('/referrals/:id', referralController.updateReferral);

// Delete referral
router.delete('/referrals/:id', referralController.deleteReferral);

module.exports = router
