const express = require('express')
const router = express.Router()
const harvestApprovalController = require('../controllers/harvest-approval.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

// Get harvests pending approval
router.get('/pending', 
  authenticate, 
  authorize(['partner', 'admin']), 
  harvestApprovalController.getPendingHarvests
)

// Approve harvest
router.post('/:harvestId/approve', 
  authenticate, 
  authorize(['partner', 'admin']), 
  harvestApprovalController.approveHarvest
)

// Reject harvest
router.post('/:harvestId/reject', 
  authenticate, 
  authorize(['partner', 'admin']), 
  harvestApprovalController.rejectHarvest
)

// Request harvest revision
router.post('/:harvestId/revision', 
  authenticate, 
  authorize(['partner', 'admin']), 
  harvestApprovalController.requestRevision
)

// Get approval statistics
router.get('/stats', 
  authenticate, 
  authorize(['partner', 'admin']), 
  harvestApprovalController.getApprovalStats
)

// Create listing from approved harvest
router.post('/:harvestId/create-listing', 
  authenticate, 
  harvestApprovalController.createListingFromHarvest
)

// Bulk process harvests
router.post('/bulk-process', 
  authenticate, 
  authorize(['partner', 'admin']), 
  harvestApprovalController.bulkProcessHarvests
)

module.exports = router


