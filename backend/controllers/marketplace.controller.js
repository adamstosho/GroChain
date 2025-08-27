const Listing = require('../models/listing.model')
const Order = require('../models/order.model')
const Product = require('../models/product.model')
const User = require('../models/user.model')
const Harvest = require('../models/harvest.model')
const Transaction = require('../models/transaction.model')

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
        query.price = {}
        if (minPrice) query.price.$gte = Number(minPrice)
        if (maxPrice) query.price.$lte = Number(maxPrice)
      }
      if (location) query.location = new RegExp(location, 'i')
      if (quality) query.quality = quality
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
      
      res.json({
        status: 'success',
        data: {
          listings,
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

  // Get specific listing
  async getListing(req, res) {
    try {
      const { id } = req.params
      
      const listing = await Listing.findById(id)
        .populate('farmer', 'name location phone email')
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
      
      res.json({
        status: 'success',
        data: listing
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
        category: harvest.cropType,
        price: Number(price),
        description: description || `Fresh ${harvest.cropType} from ${req.user.name}`,
        images: images || harvest.images || [],
        location: harvest.location,
        quality: harvest.quality,
        quantity: harvest.quantity,
        unit: harvest.unit,
        status: 'active'
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
      const query = { buyer: req.user.id }
      
      if (status) query.status = status
      
      const skip = (parseInt(page) - 1) * parseInt(limit)
      
      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate('items.listing', 'cropName images price')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Order.countDocuments(query)
      ])
      
      res.json({
        status: 'success',
        data: {
          orders,
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
