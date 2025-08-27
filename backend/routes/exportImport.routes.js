const express = require('express')
const router = express.Router()
const ExportImportController = require('../controllers/exportImport.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')
const { rateLimit } = require('../middlewares/rateLimit.middleware')


// Apply rate limiting to all export/import routes
router.use(rateLimit('api'))

// Export routes
router.post('/export/harvests', 
  authenticate, 
  authorize(['admin', 'manager']), 
  ExportImportController.exportHarvests
)

router.post('/export/listings', 
  authenticate, 
  authorize(['admin', 'manager', 'farmer']), 
  ExportImportController.exportListings
)

router.post('/export/users', 
  authenticate, 
  authorize(['admin']), 
  ExportImportController.exportUsers
)

router.post('/export/partners', 
  authenticate, 
  authorize(['admin', 'manager']), 
  ExportImportController.exportPartners
)

router.post('/export/shipments', 
  authenticate, 
  authorize(['admin', 'manager', 'logistics']), 
  ExportImportController.exportShipments
)

router.post('/export/transactions', 
  authenticate, 
  authorize(['admin', 'finance']), 
  ExportImportController.exportTransactions
)

router.post('/export/analytics', 
  authenticate, 
  authorize(['admin', 'analyst']), 
  ExportImportController.exportAnalytics
)

router.post('/export/custom', 
  authenticate, 
  authorize(['admin', 'manager']), 
  ExportImportController.exportCustomData
)

// Import routes
router.post('/import/data', 
  authenticate, 
  authorize(['admin']), 
  ExportImportController.importData
)

router.post('/import/harvests', 
  authenticate, 
  authorize(['admin', 'manager']), 
  ExportImportController.importHarvests
)

router.post('/import/listings', 
  authenticate, 
  authorize(['admin', 'manager']), 
  ExportImportController.importListings
)

router.post('/import/users', 
  authenticate, 
  authorize(['admin']), 
  ExportImportController.importUsers
)

router.post('/import/partners', 
  authenticate, 
  authorize(['admin', 'manager']), 
  ExportImportController.importPartners
)

router.post('/import/shipments', 
  authenticate, 
  authorize(['admin', 'logistics']), 
  ExportImportController.importShipments
)

router.post('/import/transactions', 
  authenticate, 
  authorize(['admin', 'finance']), 
  ExportImportController.importTransactions
)

// Utility routes
router.get('/formats', 
  ExportImportController.getSupportedFormats
)

router.get('/templates', 
  ExportImportController.getExportTemplates
)

router.post('/validate-template', 
  authenticate, 
  authorize(['admin', 'manager']), 
  ExportImportController.validateExportTemplate
)

router.get('/stats', 
  authenticate, 
  authorize(['admin']), 
  ExportImportController.getExportStats
)

router.post('/cleanup', 
  authenticate, 
  authorize(['admin']), 
  ExportImportController.cleanupOldExports
)

// File download route
router.get('/download/:filename', 
  authenticate, 
  authorize(['admin', 'manager', 'farmer', 'buyer']), 
  ExportImportController.downloadExport
)

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Export/Import service is healthy',
    timestamp: new Date().toISOString(),
    service: 'ExportImportService'
  })
})

module.exports = router
