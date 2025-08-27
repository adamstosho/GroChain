const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/partner.controller')
const { authenticate } = require('../middlewares/auth.middleware')

// Public routes
router.get('/', ctrl.getAllPartners)
router.get('/:id', ctrl.getPartnerById)

// Protected routes (require authentication)
router.use(authenticate)

router.post('/', ctrl.createPartner)
router.put('/:id', ctrl.updatePartner)
router.delete('/:id', ctrl.deletePartner)
router.get('/:id/metrics', ctrl.getPartnerMetrics)
router.post('/:id/onboard-farmer', ctrl.onboardFarmer)
router.post('/:id/bulk-onboard', ctrl.bulkOnboardFarmers)

module.exports = router

