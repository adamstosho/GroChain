const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/partner.controller')
const { authenticate } = require('../middlewares/auth.middleware')

// Simple test route - no authentication required
router.get('/ping', (req, res) => {
  res.json({ status: 'success', message: 'Partner routes are working' });
});

// Very simple test route - just static data
router.get('/simple-test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Simple partner test route working',
    timestamp: new Date().toISOString()
  });
});

// Public routes
router.get('/', ctrl.getAllPartners)
router.get('/:id', ctrl.getPartnerById)

// Protected routes (require authentication)
router.use(authenticate)

// Add missing partner endpoints
router.get('/dashboard', ctrl.getPartnerDashboard)
router.get('/farmers', ctrl.getPartnerFarmers)
router.get('/commission', ctrl.getPartnerCommission)

// CSV upload for bulk onboarding
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: 'error', message: 'CSV file required' })
    const content = req.file.buffer.toString('utf-8')
    const lines = content.split(/\r?\n/).filter(Boolean)
    const header = lines.shift()
    const created = []
    for (const line of lines) {
      const [name, email, phone, location] = line.split(',')
      if (!email) continue
      const User = require('../models/user.model')
      let user = await User.findOne({ email })
      if (!user) {
        user = await User.create({ name, email, phone, location, role: 'farmer', status: 'active' })
      }
      created.push(user._id)
    }
    // Link to partner profile by email
    const Partner = require('../models/partner.model')
    let partner = await Partner.findOne({ email: req.user.email })
    if (!partner) {
      partner = await Partner.create({ name: req.user.name, email: req.user.email, phone: req.user.phone || '+234000000000', organization: `${req.user.name} Organization`, type: 'cooperative', location: req.user.location || 'Nigeria' })
    }
    for (const farmerId of created) {
      if (!partner.farmers.includes(farmerId)) partner.farmers.push(farmerId)
    }
    partner.totalFarmers = partner.farmers.length
    await partner.save()
    return res.json({ status: 'success', data: { onboarded: created.length } })
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
})

router.post('/', ctrl.createPartner)
router.put('/:id', ctrl.updatePartner)
router.delete('/:id', ctrl.deletePartner)
router.get('/:id/metrics', ctrl.getPartnerMetrics)
router.post('/:id/onboard-farmer', ctrl.onboardFarmer)
router.post('/:id/bulk-onboard', ctrl.bulkOnboardFarmers)

// Very simple authenticated test route - just return user data
router.get('/auth-test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Partner auth test route working',
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Simple authenticated test route
router.get('/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Partner test route working',
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

module.exports = router

