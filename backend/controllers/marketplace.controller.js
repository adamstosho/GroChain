const Listing = require('../models/listing.model')
const Order = require('../models/order.model')
const Product = require('../models/product.model')
const User = require('../models/user.model')
const Harvest = require('../models/harvest.model')
const Transaction = require('../models/transaction.model')

// Helper function to map crop types to categories
const getCategoryFromCropType = (cropType) => {
  if (!cropType || typeof cropType !== 'string') return 'grains'

  try {
    const crop = cropType.toLowerCase().trim()

    if (['maize', 'rice', 'wheat', 'millet', 'sorghum', 'barley', 'corn'].includes(crop)) return 'grains'
    if (['cassava', 'yam', 'potato', 'sweet potato', 'cocoyam', 'sweet-potato'].includes(crop)) return 'tubers'
    if (['tomato', 'pepper', 'onion', 'lettuce', 'cabbage', 'carrot', 'spinach', 'vegetable'].includes(crop)) return 'vegetables'
    if (['mango', 'orange', 'banana', 'pineapple', 'apple', 'guava', 'fruit'].includes(crop)) return 'fruits'
    if (['beans', 'groundnut', 'soybean', 'cowpea', 'lentils', 'ground-nut', 'legume'].includes(crop)) return 'legumes'
    if (['cocoa', 'coffee', 'tea', 'cashew', 'cash-crop'].includes(crop)) return 'cash_crops'

    console.log(`⚠️ Unknown crop type "${crop}", defaulting to "grains"`)
    return 'grains' // default category
  } catch (error) {
    console.warn('⚠️ Error mapping crop type to category:', error.message)
    return 'grains'
  }
}

const marketplaceController = {
  // Get all listings with filters
  async getListings(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        category, 
        minPrice, 
        maxPrice, 
        location, 
        quality,
        search,
        farmerId,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query
      
      const query = { status: 'active' }
      
      // Apply filters
      if (category) query.category = category
      if (minPrice || maxPrice) {
        query.basePrice = {}
        if (minPrice) query.basePrice.$gte = Number(minPrice)
        if (maxPrice) query.basePrice.$lte = Number(maxPrice)
      }
      if (location) query.location = new RegExp(location, 'i')
      if (quality) query.qualityGrade = quality
      if (farmerId) query.farmer = farmerId
      
      // Search functionality
      if (search) {
        query.$or = [
          { cropName: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { category: new RegExp(search, 'i') }
        ]
      }
      
      const skip = (parseInt(page) - 1) * parseInt(limit)
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
      
      const [listings, total] = await Promise.all([
        Listing.find(query)
          .populate('farmer', 'name location')
          .populate('harvest', 'batchId cropType quality')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Listing.countDocuments(query)
      ])

      // Parse location strings into objects for each listing
      const parsedListings = listings.map(listing => {
        let locationObject = null
        if (listing.location) {
          if (typeof listing.location === 'string') {
            // Parse string location format: "City, State, Country" or "City, State"
            const locationParts = listing.location.split(',').map(part => part.trim())

            locationObject = {
              city: locationParts[0] || 'Unknown City',
              state: locationParts[1] || 'Unknown State',
              country: locationParts[2] || 'Nigeria' // Default to Nigeria if not specified
            }
          } else if (typeof listing.location === 'object') {
            // Already in object format
            locationObject = listing.location
          }
        }

        return {
          ...listing.toObject(),
          location: locationObject
        }
      })

      res.json({
        status: 'success',
        data: {
          listings: parsedListings,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      })
    } catch (error) {
      console.error('Error getting listings:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get listings'
      })
    }
  },

  // Debug endpoint to get all listings (for troubleshooting)
  async getAllListings(req, res) {
    try {
      const listings = await Listing.find({})
        .populate('farmer', 'name location')
        .populate('harvest', 'batchId cropType quality')
        .sort({ createdAt: -1 })
        .limit(20)

      res.json({
        status: 'success',
        data: {
          listings,
          total: listings.length,
          message: 'Debug endpoint - shows all listings regardless of status'
        }
      })
    } catch (error) {
      console.error('Error getting all listings:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get all listings'
      })
    }
  },

  // Get specific listing
  async getListing(req, res) {
    try {
      const { id } = req.params

      const listing = await Listing.findById(id)
        .populate('farmer', 'name location phone email farmLocation')
        .populate('harvest', 'batchId cropType quality harvestDate geoLocation')

      if (!listing) {
        return res.status(404).json({
          status: 'error',
          message: 'Listing not found'
        })
      }

      if (listing.status !== 'active') {
        return res.status(404).json({
          status: 'error',
          message: 'Listing is not available'
        })
      }

      // Parse location string into object format expected by frontend
      let locationObject = null
      if (listing.location) {
        if (typeof listing.location === 'string') {
          // Parse string location format: "City, State, Country" or "City, State"
          const locationParts = listing.location.split(',').map(part => part.trim())

          locationObject = {
            city: locationParts[0] || 'Unknown City',
            state: locationParts[1] || 'Unknown State',
            country: locationParts[2] || 'Nigeria' // Default to Nigeria if not specified
          }
        } else if (typeof listing.location === 'object') {
          // Already in object format
          locationObject = listing.location
        }
      }

      // Create response data with parsed location
      const responseData = {
        ...listing.toObject(),
        location: locationObject
      }

      res.json({
        status: 'success',
        data: responseData
      })
    } catch (error) {
      console.error('Error getting listing:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get listing'
      })
    }
  },

  // Create listing from harvest
  async createListing(req, res) {
    try {
      const { harvestId, price, description, images } = req.body
      
      if (!harvestId || !price) {
        return res.status(400).json({
          status: 'error',
          message: 'Harvest ID and price are required'
        })
      }
      
      // Verify harvest exists and belongs to user
      const harvest = await Harvest.findById(harvestId)
      if (!harvest) {
        return res.status(404).json({
          status: 'error',
          message: 'Harvest not found'
        })
      }
      
      if (harvest.farmer.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only create listings for your own harvests'
        })
      }
      
      // Check if harvest is approved
      if (harvest.status !== 'approved') {
        return res.status(400).json({
          status: 'error',
          message: 'Only approved harvests can be listed'
        })
      }
      
      // Create listing
      const listing = await Listing.create({
        farmer: req.user.id,
        harvest: harvestId,
        cropName: harvest.cropType,
        category: getCategoryFromCropType(harvest.cropType),
        basePrice: Number(price),
        description: description || `Fresh ${harvest.cropType} from ${req.user.name}`,
        images: images || harvest.images || [],
        location: typeof harvest.location === 'string' ? harvest.location : `${harvest.location?.city || 'Unknown'}, ${harvest.location?.state || 'Unknown'}, Nigeria`,
        qualityGrade: harvest.quality || 'standard',
        quantity: harvest.quantity,
        availableQuantity: harvest.quantity,
        unit: harvest.unit,
        status: 'active',
        tags: harvest.quality ? [harvest.quality] : []
      })
      
      // Update harvest status
      harvest.status = 'listed'
      await harvest.save()
      
      res.status(201).json({
        status: 'success',
        data: listing
      })
    } catch (error) {
      console.error('Error creating listing:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to create listing'
      })
    }
  },

  // Update listing
  async updateListing(req, res) {
    try {
      const { id } = req.params
      const { price, description, images, status } = req.body
      
      const listing = await Listing.findById(id)
      if (!listing) {
        return res.status(404).json({
          status: 'error',
          message: 'Listing not found'
        })
      }
      
      if (listing.farmer.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only update your own listings'
        })
      }
      
      // Update fields
      if (price !== undefined) listing.price = Number(price)
      if (description !== undefined) listing.description = description
      if (images !== undefined) listing.images = images
      if (status !== undefined) listing.status = status
      
      await listing.save()
      
      res.json({
        status: 'success',
        data: listing
      })
    } catch (error) {
      console.error('Error updating listing:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to update listing'
      })
    }
  },

  // Create order
  async createOrder(req, res) {
    try {
      const { items, shippingAddress, paymentMethod } = req.body
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Order items are required'
        })
      }
      
      if (!shippingAddress) {
        return res.status(400).json({
          status: 'error',
          message: 'Shipping address is required'
        })
      }
      
      // Validate items and calculate total
      let total = 0
      const orderItems = []
      
      for (const item of items) {
        const listing = await Listing.findById(item.listingId)
        if (!listing || listing.status !== 'active') {
          return res.status(400).json({
            status: 'error',
            message: `Listing ${item.listingId} is not available`
          })
        }
        
        if (listing.quantity < item.quantity) {
          return res.status(400).json({
            status: 'error',
            message: `Insufficient quantity for ${listing.cropName}`
          })
        }
        
        const itemTotal = listing.price * item.quantity
        total += itemTotal
        
        orderItems.push({
          listing: item.listingId,
          quantity: item.quantity,
          price: listing.price,
          total: itemTotal
        })
      }
      
      // Create order
      const order = await Order.create({
        buyer: req.user.id,
        items: orderItems,
        total,
        shippingAddress,
        paymentMethod: paymentMethod || 'paystack',
        status: 'pending',
        orderNumber: `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
      
      // Update listing quantities
      for (const item of items) {
        await Listing.findByIdAndUpdate(item.listingId, {
          $inc: { quantity: -item.quantity }
        })
      }
      
      res.status(201).json({
        status: 'success',
        data: order
      })
    } catch (error) {
      console.error('Error creating order:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to create order'
      })
    }
  },

  // Get user orders
  async getUserOrders(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query
      const userId = req.user.id
      const query = { buyer: userId }
      
      if (status) query.status = status
      
      const skip = (parseInt(page) - 1) * parseInt(limit)
      
      // Get orders and total count
      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate('items.listing', 'cropName images price')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Order.countDocuments(query)
      ])

      // Calculate comprehensive stats
      const statsPipeline = [
        { $match: { buyer: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            confirmed: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
            shipped: { $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            totalSpent: { 
              $sum: { 
                $cond: [
                  { $eq: ['$paymentStatus', 'paid'] }, 
                  '$total', 
                  0
                ] 
              } 
            }
          }
        }
      ]

      const [statsResult] = await Order.aggregate(statsPipeline)
      const stats = statsResult || {
        total: 0,
        pending: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalSpent: 0
      }

      console.log('📊 Orders stats calculated:', stats)
      
      res.json({
        status: 'success',
        data: {
          orders,
          stats,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      })
    } catch (error) {
      console.error('Error getting user orders:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get orders'
      })
    }
  },

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params
      const { status, trackingNumber, notes } = req.body
      
      const order = await Order.findById(id)
      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found'
        })
      }
      
      // Check permissions
      if (req.user.role === 'farmer') {
        // Farmer can only update orders for their listings
        const hasPermission = order.items.some(item => 
          item.listing.farmer?.toString() === req.user.id
        )
        if (!hasPermission) {
          return res.status(403).json({
            status: 'error',
            message: 'You can only update orders for your own listings'
          })
        }
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions'
        })
      }
      
      // Update order
      order.status = status
      if (trackingNumber) order.trackingNumber = trackingNumber
      if (notes) order.notes = notes
      order.updatedAt = new Date()
      
      await order.save()
      
      res.json({
        status: 'success',
        data: order
      })
    } catch (error) {
      console.error('Error updating order status:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to update order status'
      })
    }
  },

  // Get search suggestions
  async getSearchSuggestions(req, res) {
    try {
      const { q } = req.query
      
      if (!q || q.length < 2) {
        return res.json({
          status: 'success',
          data: { suggestions: [] }
        })
      }
      
      const suggestions = await Listing.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$cropName',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' }
          }
        },
        {
          $match: {
            _id: { $regex: q, $options: 'i' }
          }
        },
        { $limit: 10 }
      ])
      
      res.json({
        status: 'success',
        data: { suggestions }
      })
    } catch (error) {
      console.error('Error getting search suggestions:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get search suggestions'
      })
    }
  },

  // Get marketplace statistics
  async getMarketplaceStats(req, res) {
    try {
      const stats = await Listing.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ])
      
      const totalListings = await Listing.countDocuments({ status: 'active' })
      const totalOrders = await Order.countDocuments()
      
      res.json({
        status: 'success',
        data: {
          totalListings,
          totalOrders,
          categoryBreakdown: stats
        }
      })
    } catch (error) {
      console.error('Error getting marketplace stats:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get marketplace statistics'
      })
    }
  }
}

module.exports = marketplaceController
