const router = require('express').Router()
const { authenticate, authorize } = require('../middlewares/auth.middleware')
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../utils/cloudinary')

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'grochain-listings', allowed_formats: ['jpg','jpeg','png'] }
})
const upload = multer({ storage })

router.post('/upload-image', authenticate, authorize('farmer','partner','admin'), upload.array('images', 5), (req, res) => {
  const files = req.files || []
  const urls = files.map(f => f.path)
  res.status(201).json({ status: 'success', urls })
})

// Minimal listing and order endpoints used by client lib
const Listing = require('../models/listing.model')
const Order = require('../models/order.model')

router.get('/listings', async (req, res) => {
  const listings = await Listing.find({ status: 'active' }).sort({ createdAt: -1 })
  return res.json(listings)
})

router.get('/listings/:id', async (req, res) => {
  const l = await Listing.findById(req.params.id)
  if (!l) return res.status(404).json({ status: 'error', message: 'Listing not found' })
  return res.json(l)
})

router.post('/orders', authenticate, authorize('buyer','farmer','partner','admin'), async (req, res) => {
  const { buyer, items } = req.body || {}
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ status: 'error', message: 'Items required' })
  const total = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.price || 0)), 0)
  const order = await Order.create({ buyer: req.user.id, items, total })
  return res.status(201).json(order)
})

module.exports = router

