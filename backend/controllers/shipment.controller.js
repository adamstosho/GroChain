const Shipment = require('../models/shipment.model')
const Order = require('../models/order.model')
const User = require('../models/user.model')
const Listing = require('../models/listing.model')
const Notification = require('../models/notification.model')

const shipmentController = {
  // Create new shipment
  async createShipment(req, res) {
    try {
      const {
        orderId,
        shippingMethod,
        carrier,
        estimatedDelivery,
        shippingCost,
        insuranceCost,
        packaging,
        specialInstructions,
        temperatureControl,
        temperatureRange,
        fragile
      } = req.body

      // Validate required fields
      if (!orderId || !shippingMethod || !carrier || !estimatedDelivery || !shippingCost) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields'
        })
      }

      // Get order details
      const order = await Order.findById(orderId)
        .populate('buyer seller items.listing')
      
      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found'
        })
      }

      // Check if shipment already exists for this order
      const existingShipment = await Shipment.findOne({ order: orderId })
      if (existingShipment) {
        return res.status(409).json({
          status: 'error',
          message: 'Shipment already exists for this order'
        })
      }

      // Prepare shipment items
      const items = order.items.map(item => ({
        listing: item.listing._id,
        quantity: item.quantity,
        unit: item.listing.unit || 'kg',
        price: item.price
      }))

      // Create shipment
      const shipment = await Shipment.create({
        order: orderId,
        buyer: order.buyer._id,
        seller: order.seller._id,
        items,
        origin: {
          address: order.seller.location || 'Farm Location',
          city: order.seller.city || 'Unknown',
          state: order.seller.state || 'Unknown',
          country: order.seller.country || 'Nigeria',
          coordinates: {
            lat: order.seller.geoLocation?.lat || 0,
            lng: order.seller.geoLocation?.lng || 0
          },
          contactPerson: order.seller.name,
          phone: order.seller.phone
        },
        destination: {
          address: order.buyer.location || 'Delivery Address',
          city: order.buyer.city || 'Unknown',
          state: order.buyer.state || 'Unknown',
          country: order.buyer.country || 'Nigeria',
          coordinates: {
            lat: order.buyer.geoLocation?.lat || 0,
            lng: order.buyer.geoLocation?.lng || 0
          },
          contactPerson: order.buyer.name,
          phone: order.buyer.phone
        },
        shippingMethod,
        carrier,
        estimatedDelivery: new Date(estimatedDelivery),
        shippingCost: Number(shippingCost),
        insuranceCost: Number(insuranceCost) || 0,
        packaging: packaging || {
          type: 'standard',
          materials: ['cardboard', 'plastic'],
          weight: 0,
          dimensions: { length: 0, width: 0, height: 0 }
        },
        specialInstructions,
        temperatureControl: temperatureControl || false,
        temperatureRange: temperatureRange || null,
        fragile: fragile || false
      })

      // Add initial tracking event
      await shipment.addTrackingEvent(
        'pending',
        'Shipment created',
        'Shipment has been created and is pending confirmation'
      )

      // Create notification for buyer
      await Notification.create({
        user: order.buyer._id,
        title: 'Shipment Created',
        message: `Your order #${order.orderNumber} has been shipped. Track your delivery with shipment #${shipment.shipmentNumber}`,
        type: 'info',
        category: 'shipment',
        data: { shipmentId: shipment._id, orderId: order._id }
      })

      res.status(201).json({
        status: 'success',
        message: 'Shipment created successfully',
        data: shipment
      })
    } catch (error) {
      console.error('Error creating shipment:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to create shipment'
      })
    }
  },

  // Get shipment by ID
  async getShipmentById(req, res) {
    try {
      const { shipmentId } = req.params

      const shipment = await Shipment.findById(shipmentId)
        .populate('order buyer seller items.listing')
        .populate('issues.reportedBy', 'name')

      if (!shipment) {
        return res.status(404).json({
          status: 'error',
          message: 'Shipment not found'
        })
      }

      // Check permissions
      if (!['admin', 'partner'].includes(req.user.role) && 
          shipment.buyer.toString() !== req.user.id && 
          shipment.seller.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        })
      }

      res.json({
        status: 'success',
        data: shipment
      })
    } catch (error) {
      console.error('Error getting shipment:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get shipment'
      })
    }
  },

  // Get shipments with filters
  async getShipments(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        shippingMethod,
        carrier,
        origin,
        destination,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query

      const query = {}

      // Role-based filtering
      if (req.user.role === 'buyer') {
        query.buyer = req.user.id
      } else if (req.user.role === 'farmer') {
        query.seller = req.user.id
      }

      // Apply filters
      if (status) query.status = status
      if (shippingMethod) query.shippingMethod = shippingMethod
      if (carrier) query.carrier = { $regex: carrier, $options: 'i' }
      if (origin) query['origin.city'] = { $regex: origin, $options: 'i' }
      if (destination) query['destination.city'] = { $regex: destination, $options: 'i' }
      
      if (startDate || endDate) {
        query.createdAt = {}
        if (startDate) query.createdAt.$gte = new Date(startDate)
        if (endDate) query.createdAt.$lte = new Date(endDate)
      }

      const skip = (parseInt(page) - 1) * parseInt(limit)
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }

      const [shipments, total] = await Promise.all([
        Shipment.find(query)
          .populate('order', 'orderNumber total')
          .populate('buyer', 'name email phone')
          .populate('seller', 'name email phone')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Shipment.countDocuments(query)
      ])

      res.json({
        status: 'success',
        data: {
          shipments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      })
    } catch (error) {
      console.error('Error getting shipments:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get shipments'
      })
    }
  },

  // Update shipment status
  async updateShipmentStatus(req, res) {
    try {
      const { shipmentId } = req.params
      const { status, location, description, coordinates } = req.body

      if (!status || !location || !description) {
        return res.status(400).json({
          status: 'error',
          message: 'Status, location, and description are required'
        })
      }

      const shipment = await Shipment.findById(shipmentId)
      if (!shipment) {
        return res.status(404).json({
          status: 'error',
          message: 'Shipment not found'
        })
      }

      // Check permissions
      if (!['admin', 'partner', 'carrier'].includes(req.user.role) && 
          shipment.seller.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        })
      }

      // Add tracking event
      await shipment.addTrackingEvent(status, location, description, coordinates)

      // Create notification for buyer
      await Notification.create({
        user: shipment.buyer,
        title: 'Shipment Update',
        message: `Your shipment #${shipment.shipmentNumber} status: ${status} - ${description}`,
        type: 'info',
        category: 'shipment',
        data: { shipmentId: shipment._id, status, location }
      })

      res.json({
        status: 'success',
        message: 'Shipment status updated successfully',
        data: shipment
      })
    } catch (error) {
      console.error('Error updating shipment status:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to update shipment status'
      })
    }
  },

  // Confirm delivery
  async confirmDelivery(req, res) {
    try {
      const { shipmentId } = req.params
      const { signature, photo, notes, deliveredBy } = req.body

      const shipment = await Shipment.findById(shipmentId)
      if (!shipment) {
        return res.status(404).json({
          status: 'error',
          message: 'Shipment not found'
        })
      }

      // Check permissions
      if (!['admin', 'partner', 'carrier'].includes(req.user.role) && 
          shipment.seller.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        })
      }

      // Update delivery status
      await shipment.updateDeliveryStatus('delivered', {
        signature,
        photo,
        notes,
        deliveredBy: deliveredBy || req.user.name,
        deliveryTime: new Date()
      })

      // Add tracking event
      await shipment.addTrackingEvent(
        'delivered',
        shipment.destination.city,
        'Package delivered successfully',
        shipment.destination.coordinates
      )

      // Create notification for buyer and seller
      const notifications = [
        {
          user: shipment.buyer,
          title: 'Package Delivered',
          message: `Your shipment #${shipment.shipmentNumber} has been delivered successfully!`,
          type: 'success',
          category: 'shipment'
        },
        {
          user: shipment.seller,
          title: 'Delivery Confirmed',
          message: `Shipment #${shipment.shipmentNumber} has been delivered to the buyer.`,
          type: 'success',
          category: 'shipment'
        }
      ]

      await Notification.insertMany(notifications)

      res.json({
        status: 'success',
        message: 'Delivery confirmed successfully',
        data: shipment
      })
    } catch (error) {
      console.error('Error confirming delivery:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to confirm delivery'
      })
    }
  },

  // Report shipment issue
  async reportIssue(req, res) {
    try {
      const { shipmentId } = req.params
      const { type, description } = req.body

      if (!type || !description) {
        return res.status(400).json({
          status: 'error',
          message: 'Issue type and description are required'
        })
      }

      const shipment = await Shipment.findById(shipmentId)
      if (!shipment) {
        return res.status(404).json({
          status: 'error',
          message: 'Shipment not found'
        })
      }

      // Check permissions
      if (shipment.buyer.toString() !== req.user.id && 
          shipment.seller.toString() !== req.user.id &&
          !['admin', 'partner'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        })
      }

      // Report issue
      await shipment.reportIssue(type, description, req.user.id)

      // Create notification for relevant parties
      const notifications = []
      
      if (req.user.id === shipment.buyer.toString()) {
        notifications.push({
          user: shipment.seller,
          title: 'Shipment Issue Reported',
          message: `Buyer reported an issue with shipment #${shipment.shipmentNumber}: ${type}`,
          type: 'warning',
          category: 'shipment'
        })
      } else {
        notifications.push({
          user: shipment.buyer,
          title: 'Shipment Issue Reported',
          message: `Seller reported an issue with shipment #${shipment.shipmentNumber}: ${type}`,
          type: 'warning',
          category: 'shipment'
        })
      }

      await Notification.insertMany(notifications)

      res.json({
        status: 'success',
        message: 'Issue reported successfully',
        data: shipment
      })
    } catch (error) {
      console.error('Error reporting issue:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to report issue'
      })
    }
  },

  // Get shipment statistics
  async getShipmentStats(req, res) {
    try {
      const { startDate, endDate } = req.query

      const query = {}
      if (startDate || endDate) {
        query.createdAt = {}
        if (startDate) query.createdAt.$gte = new Date(startDate)
        if (endDate) query.createdAt.$lte = new Date(endDate)
      }

      // Role-based filtering
      if (req.user.role === 'buyer') {
        query.buyer = req.user.id
      } else if (req.user.role === 'farmer') {
        query.seller = req.user.id
      }

      const [totalShipments, statusBreakdown, delayedShipments, avgDeliveryTime] = await Promise.all([
        Shipment.countDocuments(query),
        Shipment.aggregate([
          { $match: query },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Shipment.countDocuments({
          ...query,
          status: { $in: ['confirmed', 'in_transit', 'out_for_delivery'] },
          estimatedDelivery: { $lt: new Date() }
        }),
        Shipment.aggregate([
          { $match: { ...query, status: 'delivered', actualDelivery: { $exists: true } } },
          {
            $group: {
              _id: null,
              avgTime: {
                $avg: { $subtract: ['$actualDelivery', '$createdAt'] }
              }
            }
          }
        ])
      ])

      res.json({
        status: 'success',
        data: {
          totalShipments,
          statusBreakdown,
          delayedShipments,
          avgDeliveryTime: avgDeliveryTime[0]?.avgTime ? 
            Math.round(avgDeliveryTime[0].avgTime / (1000 * 60 * 60 * 24)) : 0
        }
      })
    } catch (error) {
      console.error('Error getting shipment stats:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get shipment statistics'
      })
    }
  },

  // Search shipments
  async searchShipments(req, res) {
    try {
      const { q, page = 1, limit = 20 } = req.query

      if (!q) {
        return res.status(400).json({
          status: 'error',
          message: 'Search query is required'
        })
      }

      const query = {
        $or: [
          { shipmentNumber: { $regex: q, $options: 'i' } },
          { trackingNumber: { $regex: q, $options: 'i' } },
          { carrier: { $regex: q, $options: 'i' } },
          { 'origin.city': { $regex: q, $options: 'i' } },
          { 'destination.city': { $regex: q, $options: 'i' } }
        ]
      }

      // Role-based filtering
      if (req.user.role === 'buyer') {
        query.buyer = req.user.id
      } else if (req.user.role === 'farmer') {
        query.seller = req.user.id
      }

      const skip = (parseInt(page) - 1) * parseInt(limit)

      const [shipments, total] = await Promise.all([
        Shipment.find(query)
          .populate('order', 'orderNumber total')
          .populate('buyer', 'name email')
          .populate('seller', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Shipment.countDocuments(query)
      ])

      res.json({
        status: 'success',
        data: {
          shipments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      })
    } catch (error) {
      console.error('Error searching shipments:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to search shipments'
      })
    }
  }
}

module.exports = shipmentController

