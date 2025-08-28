const Partner = require('../models/partner.model')
const User = require('../models/user.model')

exports.getAllPartners = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, search } = req.query
    const query = {}
    
    if (status) query.status = status
    if (type) query.type = type
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ]
    }
    
    const partners = await Partner.find(query)
      .populate('farmers', 'name email phone location')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
    
    const total = await Partner.countDocuments(query)
    
    return res.json({
      status: 'success',
      data: {
        partners,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
      .populate('farmers', 'name email phone location')
    
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner not found' })
    }
    
    return res.json({ status: 'success', data: partner })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.createPartner = async (req, res) => {
  try {
    const partnerData = req.body
    const partner = new Partner(partnerData)
    await partner.save()
    
    return res.status(201).json({ status: 'success', data: partner })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: 'error', message: 'Partner with this email already exists' })
    }
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner not found' })
    }
    
    return res.json({ status: 'success', data: partner })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id)
    
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner not found' })
    }
    
    // Remove partner reference from associated farmers
    await User.updateMany(
      { partner: req.params.id },
      { $unset: { partner: 1 } }
    )
    
    return res.json({ status: 'success', message: 'Partner deleted successfully' })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getPartnerMetrics = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
    
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner not found' })
    }
    
    const metrics = {
      totalFarmers: partner.totalFarmers,
      totalCommissions: partner.totalCommissions,
      commissionRate: partner.commissionRate,
      status: partner.status,
      joinedAt: partner.createdAt
    }
    
    return res.json({ status: 'success', data: metrics })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.onboardFarmer = async (req, res) => {
  try {
    const { farmerId } = req.body
    const partnerId = req.params.id
    
    const partner = await Partner.findById(partnerId)
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner not found' })
    }
    
    const farmer = await User.findById(farmerId)
    if (!farmer) {
      return res.status(404).json({ status: 'error', message: 'Farmer not found' })
    }
    
    if (farmer.role !== 'farmer') {
      return res.status(400).json({ status: 'error', message: 'User is not a farmer' })
    }
    
    // Add farmer to partner's farmers list
    if (!partner.farmers.includes(farmerId)) {
      partner.farmers.push(farmerId)
      partner.totalFarmers = partner.farmers.length
      await partner.save()
    }
    
    // Update farmer's partner reference
    farmer.partner = partnerId
    await farmer.save()
    
    return res.json({ status: 'success', message: 'Farmer onboarded successfully' })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.bulkOnboardFarmers = async (req, res) => {
  try {
    const { farmerIds } = req.body
    const partnerId = req.params.id
    
    const partner = await Partner.findById(partnerId)
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner not found' })
    }
    
    const farmers = await User.find({ _id: { $in: farmerIds }, role: 'farmer' })
    
    for (const farmer of farmers) {
      if (!partner.farmers.includes(farmer._id)) {
        partner.farmers.push(farmer._id)
        farmer.partner = partnerId
        await farmer.save()
      }
    }
    
    partner.totalFarmers = partner.farmers.length
    await partner.save()
    
    return res.json({ 
      status: 'success', 
      message: `${farmers.length} farmers onboarded successfully` 
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Add missing partner dashboard method
exports.getPartnerDashboard = async (req, res) => {
  try {
    const userId = req.user.id
    console.log('🔍 Partner dashboard - User ID:', userId);
    console.log('🔍 Partner dashboard - User email:', req.user.email);
    
    // Find partner by user email or create one if it doesn't exist
    let partner = await Partner.findOne({ email: req.user.email })
    console.log('🔍 Partner dashboard - Existing partner found:', !!partner);
    
    if (!partner) {
      console.log('🔍 Partner dashboard - Creating new partner profile...');
      // Create a basic partner profile for the user
      const partnerData = {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '+234000000000', // Default phone if not provided
        organization: `${req.user.name} Organization`, // Proper organization name
        type: 'cooperative', // Default type
        location: req.user.location || 'Nigeria',
        status: 'active',
        commissionRate: 0.05
      };
      console.log('🔍 Partner dashboard - Partner data:', partnerData);
      
      partner = new Partner(partnerData)
      await partner.save()
      console.log('🔍 Partner dashboard - New partner saved successfully');
    }
    
    // Get basic dashboard data
    const dashboard = {
      totalFarmers: partner.farmers?.length || 0,
      totalCommissions: partner.totalCommissions || 0,
      commissionRate: partner.commissionRate || 0.05,
      status: partner.status,
      joinedAt: partner.createdAt,
      recentActivity: []
    }
    
    console.log('🔍 Partner dashboard - Dashboard data:', dashboard);
    return res.json({ status: 'success', data: dashboard })
  } catch (error) {
    console.error('💥 Partner dashboard error:', error);
    console.error('💥 Error stack:', error.stack);
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Add missing partner farmers method
exports.getPartnerFarmers = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Find partner by user email or create one if it doesn't exist
    let partner = await Partner.findOne({ email: req.user.email })
    
    if (!partner) {
      // Create a basic partner profile for the user
      partner = new Partner({
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '+234000000000', // Default phone if not provided
        organization: `${req.user.name} Organization`, // Proper organization name
        type: 'cooperative', // Default type
        location: req.user.location || 'Nigeria',
        status: 'active',
        commissionRate: 0.05
      })
      await partner.save()
    }
    
    // Get farmers associated with this partner
    const farmers = await User.find({ partner: partner._id, role: 'farmer' })
      .select('name email phone location createdAt')
      .sort({ createdAt: -1 })
    
    return res.json({ 
      status: 'success', 
      data: { farmers, total: farmers.length } 
    })
  } catch (error) {
    console.error('Partner farmers error:', error)
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Add missing partner commission method
exports.getPartnerCommission = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Find partner by user email or create one if it doesn't exist
    let partner = await Partner.findOne({ email: req.user.email })
    
    if (!partner) {
      // Create a basic partner profile for the user
      partner = new Partner({
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '+234000000000', // Default phone if not provided
        organization: `${req.user.name} Organization`, // Proper organization name
        type: 'cooperative', // Default type
        location: req.user.location || 'Nigeria',
        status: 'active',
        commissionRate: 0.05
      })
      await partner.save()
    }
    
    // Get commission data
    const commission = {
      totalEarned: partner.totalCommissions || 0,
      commissionRate: partner.commissionRate || 0.05,
      pendingAmount: 0, // This would need to be calculated from actual transactions
      paidAmount: partner.totalCommissions || 0,
      lastPayout: null // This would need to be tracked
    }
    
    return res.json({ status: 'success', data: commission })
  } catch (error) {
    console.error('Partner commission error:', error)
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

