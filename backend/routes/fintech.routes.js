const router = require('express').Router()
const { authenticate, authorize } = require('../middlewares/auth.middleware')

// Root endpoint - get fintech overview
router.get('/', authenticate, async (req, res) => {
  return res.json({ 
    status: 'success', 
    data: { 
      services: ['credit-score', 'loan-applications', 'financial-analysis'],
      available: true,
      lastUpdated: new Date()
    } 
  })
})

// Minimal endpoints to satisfy frontend calls; implement controllers similarly later
router.get('/credit-score/me', authenticate, async (req, res) => {
  // Simple deterministic score until full implementation
  return res.json({ status: 'success', data: { farmerId: req.user.id, score: 650, factors: { paymentHistory: 70, harvestConsistency: 60, businessStability: 50, marketReputation: 55 }, recommendations: [], lastUpdated: new Date() } })
})

router.get('/credit-score/:farmerId', authenticate, async (req, res) => {
  const farmerId = req.params.farmerId === 'me' ? req.user.id : req.params.farmerId
  return res.json({ status: 'success', data: { farmerId, score: 650, factors: { paymentHistory: 70, harvestConsistency: 60, businessStability: 50, marketReputation: 55 }, recommendations: [], lastUpdated: new Date() } })
})

router.get('/loan-applications', authenticate, async (req, res) => {
  return res.json({ status: 'success', data: { applications: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 10 } } })
})

router.post('/loan-applications', authenticate, async (req, res) => {
  const { amount, purpose, term, description } = req.body || {}
  const application = { id: `loan_${Date.now()}`, _id: undefined, farmerId: req.user.id, amount, purpose, term, status: 'submitted', interestRate: 12.5, monthlyPayment: Math.round((amount * (1 + 0.125)) / term), submittedAt: new Date(), description }
  return res.status(201).json({ status: 'success', data: application })
})

module.exports = router

