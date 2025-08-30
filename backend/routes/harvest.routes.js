const router = require('express').Router()
const { authenticate } = require('../middlewares/auth.middleware')
const ctrl = require('../controllers/harvest.controller')

router.get('/', authenticate, ctrl.getHarvests)
router.post('/', authenticate, ctrl.createHarvest)
router.get('/verification/:batchId', ctrl.getProvenance)
router.get('/provenance/:batchId', authenticate, ctrl.getProvenance)
router.delete('/:id', authenticate, ctrl.deleteHarvest)
router.get('/:batchId', authenticate, ctrl.getProvenance)

module.exports = router


