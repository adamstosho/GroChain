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
const Favorite = require('../models/favorite.model')

router.get('/listings', async (req, res) => {
  const listings = await Listing.find({ status: 'active' }).sort({ createdAt: -1 })
  return res.json(listings)
})

router.get('/listings/:id', async (req, res) => {
  const l = await Listing.findById(req.params.id)
  if (!l) return res.status(404).json({ status: 'error', message: 'Listing not found' })
  return res.json(l)
})

// Search suggestions (cropName/category/tags)
router.get('/search-suggestions', async (req, res) => {
  const { q = '' } = req.query
  const limit = Number(req.query.limit || 10)
  const regex = new RegExp(q, 'i')
  const crops = await Listing.find({ cropName: regex }).limit(limit).select('cropName').lean()
  const categories = await Listing.find({ category: regex }).limit(limit).select('category').lean()
  const tags = await Listing.find({ tags: regex }).limit(limit).select('tags').lean()
  const suggestions = Array.from(new Set([
    ...crops.map(c => c.cropName),
    ...categories.map(c => c.category),
    ...tags.flatMap(t => t.tags || [])
  ].filter(Boolean))).slice(0, limit)
  return res.json({ status: 'success', data: { suggestions } })
})

// Favorites
router.get('/favorites/:userId', authenticate, async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const { userId } = req.params
  const result = await Favorite.getUserFavorites(userId, parseInt(page), parseInt(limit))
  return res.json({ status: 'success', data: result })
})

router.post('/favorites', authenticate, async (req, res) => {
  const { listingId, notes } = req.body || {}
  if (!listingId) return res.status(400).json({ status: 'error', message: 'listingId required' })
  try {
    const fav = await Favorite.create({ user: req.user.id, listing: listingId, notes })
    return res.status(201).json({ status: 'success', data: fav })
  } catch (e) {
    if (e.code === 11000) return res.status(200).json({ status: 'success', message: 'Already in favorites' })
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
})

router.delete('/favorites/:userId/:listingId', authenticate, async (req, res) => {
  const { userId, listingId } = req.params
  await Favorite.deleteOne({ user: userId, listing: listingId })
  return res.json({ status: 'success', message: 'Removed from favorites' })
})

router.post('/listings', authenticate, authorize('farmer','partner','admin'), async (req, res) => {
  // Minimal validation for test: expect cropName and price
  const { cropName, basePrice, category, description, unit, quantity, location } = req.body || {}
  if (!cropName || basePrice == null || !category || !description || !unit || !quantity || !location?.city || !location?.state) {
    return res.status(400).json({ status: 'error', message: 'Missing required listing fields' })
  }
  const listing = await Listing.create({
    farmer: req.user.id,
    cropName,
    basePrice,
    category,
    description,
    unit,
    quantity,
    availableQuantity: quantity,
    location,
    status: 'draft'
  })
  return res.status(201).json(listing)
})

router.post('/orders', authenticate, authorize('buyer','farmer','partner','admin'), async (req, res) => {
  const { buyer, items } = req.body || {}
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ status: 'error', message: 'Items required' })
  const total = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.price || 0)), 0)
  const order = await Order.create({ buyer: req.user.id, items, total })
  return res.status(201).json(order)
})

// Update and unpublish listings
router.patch('/listings/:id', authenticate, authorize('farmer','partner','admin'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ status: 'error', message: 'Listing not found' })
    if (listing.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Forbidden' })
    }
    const { status, description, images, basePrice, quantity } = req.body || {}
    if (status) listing.status = status
    if (description !== undefined) listing.description = description
    if (images !== undefined) listing.images = images
    if (basePrice !== undefined) listing.basePrice = Number(basePrice)
    if (quantity !== undefined) listing.quantity = Number(quantity)
    await listing.save()
    return res.json({ status: 'success', data: listing })
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
})

router.patch('/listings/:id/unpublish', authenticate, authorize('farmer','partner','admin'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ status: 'error', message: 'Listing not found' })
    if (listing.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Forbidden' })
    }
    listing.status = 'inactive'
    await listing.save()
    return res.json({ status: 'success', data: listing })
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
})

// Order details suite
router.get('/orders/:id', authenticate, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.listing', 'cropName images price farmer')
  if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' })
  if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' })
  }
  return res.json({ status: 'success', data: order })
})

router.get('/orders/buyer/:buyerId', authenticate, async (req, res) => {
  if (req.user.id !== req.params.buyerId && req.user.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' })
  }
  const orders = await Order.find({ buyer: req.params.buyerId }).sort({ createdAt: -1 })
  return res.json({ status: 'success', data: orders })
})

router.patch('/orders/:id/status', authenticate, authorize('admin','farmer','partner'), async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.listing', 'farmer')
  if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' })
  if (req.user.role === 'farmer') {
    const hasListing = order.items.some(i => i.listing?.farmer?.toString() === req.user.id)
    if (!hasListing) return res.status(403).json({ status: 'error', message: 'Forbidden' })
  }
  const { status } = req.body || {}
  if (!status) return res.status(400).json({ status: 'error', message: 'status required' })
  order.status = status
  await order.save()
  return res.json({ status: 'success', data: order })
})

router.get('/orders/:id/tracking', authenticate, async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' })
  if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' })
  }
  // Minimal tracking stub
  return res.json({ status: 'success', data: { trackingNumber: order.trackingNumber || null, status: order.status, updatedAt: order.updatedAt } })
})

module.exports = router

