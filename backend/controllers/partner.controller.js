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

