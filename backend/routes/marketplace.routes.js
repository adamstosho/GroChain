const router = require('express').Router()
const mongoose = require('mongoose')
const { authenticate, authorize } = require('../middlewares/auth.middleware')
const multer = require('multer')
const cloudinary = require('../utils/cloudinary')

// Import models (ensure they are registered)
const Listing = require('../models/listing.model')
const Favorite = require('../models/favorite.model')
const Order = require('../models/order.model')
const User = require('../models/user.model') // Required for population
const Harvest = require('../models/harvest.model') // Required for population

// Ensure models are registered with Mongoose
if (!mongoose.models.User) mongoose.model('User', User.schema)
if (!mongoose.models.Favorite) mongoose.model('Favorite', Favorite.schema)
if (!mongoose.models.Listing) mongoose.model('Listing', Listing.schema)
if (!mongoose.models.Harvest) mongoose.model('Harvest', Harvest.schema)
if (!mongoose.models.Order) mongoose.model('Order', Order.schema)

console.log('📋 Models registered in marketplace routes:', Object.keys(mongoose.models))

// Use memory storage for multer
const storage = multer.memoryStorage()

// Custom file filter to allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ]

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG images and PDF documents are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  }
})

router.post('/upload-image', authenticate, authorize('farmer','partner','admin'), upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files || []
    if (files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files uploaded'
      })
    }

    console.log(`📤 Uploading ${files.length} file(s) to Cloudinary...`)

    // Upload each file to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString('base64')
      const dataURI = `data:${file.mimetype};base64,${b64}`

      // Determine resource type and folder based on file type
      const isPDF = file.mimetype === 'application/pdf'
      const uploadOptions = {
        folder: 'grochain-documents',
        public_id: `${isPDF ? 'document' : 'image'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        resource_type: isPDF ? 'raw' : 'image'
      }

      // Add transformation for images only
      if (!isPDF) {
        uploadOptions.transformation = [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' }
        ]
      }

      const result = await cloudinary.uploader.upload(dataURI, uploadOptions)
      return result.secure_url
    })

    const urls = await Promise.all(uploadPromises)

    console.log(`✅ Successfully uploaded ${urls.length} file(s)`)

    res.status(201).json({
      status: 'success',
      urls,
      count: files.length
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Upload failed'
    })
  }
})

// Import marketplace controller
const marketplaceController = require('../controllers/marketplace.controller')

// Use the full marketplace controller for listings
router.get('/listings', marketplaceController.getListings)

// Debug endpoint to see all listings
router.get('/listings-debug', marketplaceController.getAllListings)

// Get individual listing details
router.get('/listings/:id', marketplaceController.getListing)

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

// Debug endpoint to check authentication
router.get('/auth/debug', authenticate, (req, res) => {
  console.log('🔍 Auth debug endpoint called')
  console.log('User object:', req.user)
  console.log('Headers:', req.headers.authorization)

  res.json({
    status: 'success',
    user: req.user,
    authenticated: true,
    timestamp: new Date().toISOString()
  })
})

// Debug endpoint to test model registration
router.get('/debug/models', (req, res) => {
  res.json({
    status: 'success',
    registeredModels: Object.keys(mongoose.models),
    connectionState: mongoose.connection.readyState,
    database: mongoose.connection.name
  })
})

// Favorites for current authenticated user
router.get('/favorites/current', authenticate, async (req, res) => {
  console.log('🔍 Favorites/current endpoint called')
  console.log('User object:', req.user)

  const { page = 1, limit = 20 } = req.query
  const userId = req.user?.id || req.user?._id

  console.log('User ID extracted:', userId)

  if (!userId) {
    console.log('❌ No user ID found - user not authenticated')
    return res.status(401).json({
      status: 'error',
      message: 'User not authenticated'
    })
  }

  try {
    console.log(`🔍 Fetching favorites for user: ${userId}`)

    // First, let's try a simple query to see if the user exists
    const userExists = await User.findById(userId)
    console.log('User exists in database:', !!userExists)

    const result = await Favorite.getUserFavorites(userId, parseInt(page), parseInt(limit))
    console.log('✅ Favorites fetched successfully:', result.docs?.length || 0, 'items')

    // Log the structure of the result
    if (result.docs && result.docs.length > 0) {
      console.log('Sample favorite structure:', {
        id: result.docs[0]._id,
        user: result.docs[0].user,
        listing: result.docs[0].listing
      })
    }

    return res.json({ status: 'success', data: result })
  } catch (error) {
    console.error('❌ Error fetching favorites for current user:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)

    // Provide more specific error messages
    let errorMessage = 'Failed to fetch favorites'
    if (error.message.includes('Schema hasn\'t been registered')) {
      errorMessage = 'Database model registration error'
    } else if (error.message.includes('ObjectId')) {
      errorMessage = 'Invalid user ID format'
    }

    return res.status(500).json({
      status: 'error',
      message: errorMessage,
      details: error.message
    })
  }
})

// Favorites by user ID (with validation)
router.get('/favorites/:userId', authenticate, async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const { userId } = req.params

  // Validate userId
  if (!userId || userId === 'undefined' || userId === 'null') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID provided'
    })
  }

  // Validate that userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID format'
    })
  }

  try {
    const result = await Favorite.getUserFavorites(userId, parseInt(page), parseInt(limit))
    return res.json({ status: 'success', data: result })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch favorites'
    })
  }
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
  if (!cropName || basePrice == null || !category || !description || !unit || !quantity || !location) {
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
  try {
    const {
      buyer,
      items,
      shippingAddress,
      deliveryInstructions,
      paymentMethod,
      notes
    } = req.body || {}

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Items are required' })
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state) {
      return res.status(400).json({ status: 'error', message: 'Complete shipping address is required' })
    }

    // Calculate totals
    const subtotal = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.price || 0)), 0)
    const shipping = subtotal > 5000 ? 0 : 500 // Free shipping over ₦5,000
    const tax = Math.round(subtotal * 0.075) // 7.5% VAT
    const total = subtotal + shipping + tax

    // Prepare order data
    const orderData = {
      buyer: req.user.id,
      seller: items[0]?.listing ? await getSellerFromListing(items[0].listing) : null,
      items: items.map(item => ({
        listing: item.listing,
        quantity: Number(item.quantity),
        price: Number(item.price),
        unit: item.unit,
        total: Number(item.quantity) * Number(item.price)
      })),
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'paystack',
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country || 'Nigeria',
        postalCode: shippingAddress.postalCode || '',
        phone: shippingAddress.phone
      },
      deliveryInstructions: deliveryInstructions || '',
      notes: notes || ''
    }

    // Create the order
    const order = await Order.create(orderData)

    // Populate the created order for response
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'buyer',
        select: 'name email profile.phone'
      })
      .populate({
        path: 'items.listing',
        select: 'cropName images farmer',
        populate: {
          path: 'farmer',
          select: 'name email profile.phone profile.farmName'
        }
      })

    console.log('✅ Order created successfully:', order._id)

    return res.status(201).json({
      status: 'success',
      data: populatedOrder,
      message: 'Order created successfully'
    })
  } catch (error) {
    console.error('❌ Order creation error:', error)
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create order'
    })
  }
})

// Helper function to get seller from listing
async function getSellerFromListing(listingId) {
  try {
    const Listing = require('../models/listing.model')
    const listing = await Listing.findById(listingId).select('farmer')
    return listing?.farmer || null
  } catch (error) {
    console.error('Error getting seller from listing:', error)
    return null
  }
}



// Get all orders for the authenticated user with full population
router.get('/orders', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Build filter
    const filter = { buyer: req.user.id }
    if (status && status !== 'all') filter.status = status
    if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus

    // Get orders with full population
    const orders = await Order.find(filter)
      .populate({
        path: 'buyer',
        select: 'name email profile.phone profile.avatar'
      })
      .populate({
        path: 'items.listing',
        select: 'cropName images farmer category unit',
        populate: {
          path: 'farmer',
          select: 'name email profile.phone profile.farmName'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    // Get total count for pagination
    const total = await Order.countDocuments(filter)

    // Calculate stats
    const stats = {
      total: total,
      pending: await Order.countDocuments({ buyer: req.user.id, status: 'pending' }),
      confirmed: await Order.countDocuments({ buyer: req.user.id, status: 'confirmed' }),
      shipped: await Order.countDocuments({ buyer: req.user.id, status: 'shipped' }),
      delivered: await Order.countDocuments({ buyer: req.user.id, status: 'delivered' }),
      cancelled: await Order.countDocuments({ buyer: req.user.id, status: 'cancelled' }),
      totalSpent: await Order.aggregate([
        { $match: { buyer: req.user.id, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    }

    if (stats.totalSpent.length > 0) {
      stats.totalSpent = stats.totalSpent[0].total
    } else {
      stats.totalSpent = 0
    }

    return res.json({
      status: 'success',
      data: {
        orders,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return res.status(500).json({ status: 'error', message: 'Failed to fetch orders' })
  }
})

// Full update listing (PUT)
router.put('/listings/:id', authenticate, authorize('farmer','partner','admin'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ status: 'error', message: 'Listing not found' })
    if (listing.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Forbidden' })
    }

    const {
      cropName,
      category,
      description,
      basePrice,
      quantity,
      unit,
      availableQuantity,
      location,
      images,
      tags,
      status
    } = req.body || {}

    // Update fields if provided
    if (cropName !== undefined) listing.cropName = cropName
    if (category !== undefined) listing.category = category
    if (description !== undefined) listing.description = description
    if (basePrice !== undefined) listing.basePrice = Number(basePrice)
    if (quantity !== undefined) listing.quantity = Number(quantity)
    if (unit !== undefined) listing.unit = unit
    if (availableQuantity !== undefined) listing.availableQuantity = Number(availableQuantity)
    if (location !== undefined) listing.location = location
    if (images !== undefined) listing.images = images
    if (tags !== undefined) listing.tags = tags
    if (status !== undefined) listing.status = status

    // Update timestamp
    listing.updatedAt = new Date()

    await listing.save()
    return res.json({ status: 'success', data: listing })
  } catch (e) {
    console.error('Error updating listing:', e)
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
})

// Partial update listing (PATCH) - for backward compatibility
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
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'name email phone')
    .populate('items.listing', 'cropName images price farmer')
    .populate('items.listing.farmer', 'name email phone')
  if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' })
  if (order.buyer._id.toString() !== req.user.id && req.user.role !== 'admin') {
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

