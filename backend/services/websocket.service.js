const socketIo = require('socket.io')
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const Notification = require('../models/notification.model')

class WebSocketService {
  constructor() {
    this.io = null
    this.connectedUsers = new Map() // userId -> socketId
    this.userSockets = new Map() // userId -> socket
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    })

    this.setupMiddleware()
    this.setupEventHandlers()
    
    console.log('🔌 WebSocket service initialized')
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
        
        if (!token) {
          return next(new Error('Authentication token required'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('_id name email role status')
        
        if (!user || user.status !== 'active') {
          return next(new Error('Invalid or inactive user'))
        }

        socket.user = user
        next()
      } catch (error) {
        next(new Error('Authentication failed'))
      }
    })
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.user.name} (${socket.user._id})`)
      
      // Store user connection
      this.connectedUsers.set(socket.user._id.toString(), socket.id)
      this.userSockets.set(socket.user._id.toString(), socket)

      // Join user to role-based room
      socket.join(`role:${socket.user.role}`)
      
      // Join user to personal room
      socket.join(`user:${socket.user._id}`)

      // Handle user joining specific rooms
      socket.on('join-room', (roomName) => {
        socket.join(roomName)
        console.log(`👥 User ${socket.user.name} joined room: ${roomName}`)
      })

      // Handle user leaving rooms
      socket.on('leave-room', (roomName) => {
        socket.leave(roomName)
        console.log(`👋 User ${socket.user.name} left room: ${roomName}`)
      })

      // Handle private messages
      socket.on('private-message', async (data) => {
        try {
          const { recipientId, message, type = 'text' } = data
          
          if (!recipientId || !message) {
            return socket.emit('error', { message: 'Recipient ID and message are required' })
          }

          // Check if recipient is online
          const recipientSocketId = this.connectedUsers.get(recipientId)
          
          if (recipientSocketId) {
            // Send real-time message
            this.io.to(recipientSocketId).emit('private-message', {
              senderId: socket.user._id,
              senderName: socket.user.name,
              message,
              type,
              timestamp: new Date()
            })
          }

          // Store message in database (you can create a Message model for this)
          // await Message.create({
          //   sender: socket.user._id,
          //   recipient: recipientId,
          //   message,
          //   type
          // })

          // Confirm message sent
          socket.emit('message-sent', { 
            recipientId, 
            message, 
            timestamp: new Date() 
          })
        } catch (error) {
          console.error('Error sending private message:', error)
          socket.emit('error', { message: 'Failed to send message' })
        }
      })

      // Handle typing indicators
      socket.on('typing-start', (data) => {
        const { recipientId } = data
        const recipientSocketId = this.connectedUsers.get(recipientId)
        
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('typing-start', {
            userId: socket.user._id,
            userName: socket.user.name
          })
        }
      })

      socket.on('typing-stop', (data) => {
        const { recipientId } = data
        const recipientSocketId = this.connectedUsers.get(recipientId)
        
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('typing-stop', {
            userId: socket.user._id
          })
        }
      })

      // Handle harvest updates
      socket.on('harvest-update', (data) => {
        const { harvestId, status, message } = data
        
        // Broadcast to relevant users (farmers, partners, admins)
        this.io.to('role:farmer').to('role:partner').to('role:admin').emit('harvest-update', {
          harvestId,
          status,
          message,
          updatedBy: socket.user._id,
          updatedBy: socket.user.name,
          timestamp: new Date()
        })
      })

      // Handle marketplace updates
      socket.on('marketplace-update', (data) => {
        const { type, listingId, message } = data
        
        // Broadcast to all users
        this.io.emit('marketplace-update', {
          type,
          listingId,
          message,
          updatedBy: socket.user._id,
          updatedBy: socket.user.name,
          timestamp: new Date()
        })
      })

      // Handle shipment updates
      socket.on('shipment-update', (data) => {
        const { shipmentId, status, location, message } = data
        
        // Broadcast to relevant users
        this.io.to('role:buyer').to('role:farmer').to('role:partner').emit('shipment-update', {
          shipmentId,
          status,
          location,
          message,
          updatedBy: socket.user._id,
          updatedBy: socket.user.name,
          timestamp: new Date()
        })
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.user.name} (${socket.user._id})`)
        
        // Remove user connection
        this.connectedUsers.delete(socket.user._id.toString())
        this.userSockets.delete(socket.user._id.toString())
      })
    })
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    const socketId = this.connectedUsers.get(userId.toString())
    
    if (socketId) {
      this.io.to(socketId).emit('notification', notification)
      return true
    }
    
    return false
  }

  // Send notification to multiple users
  sendNotificationToUsers(userIds, notification) {
    const sentCount = userIds.filter(userId => 
      this.sendNotificationToUser(userId, notification)
    ).length
    
    return sentCount
  }

  // Send notification to users by role
  sendNotificationToRole(role, notification) {
    this.io.to(`role:${role}`).emit('notification', notification)
  }

  // Broadcast to all connected users
  broadcastToAll(event, data) {
    this.io.emit(event, data)
  }

  // Send to specific room
  sendToRoom(roomName, event, data) {
    this.io.to(roomName).emit(event, data)
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connectedUsers.size
  }

  // Get online users by role
  getOnlineUsersByRole(role) {
    const users = []
    
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      const socket = this.userSockets.get(userId)
      if (socket && socket.user.role === role) {
        users.push({
          userId,
          name: socket.user.name,
          email: socket.user.email
        })
      }
    }
    
    return users
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId.toString())
  }

  // Send real-time harvest approval update
  sendHarvestApprovalUpdate(harvestId, status, farmerId, partnerId) {
    const update = {
      harvestId,
      status,
      timestamp: new Date()
    }

    // Send to farmer
    this.sendNotificationToUser(farmerId, {
      type: 'harvest-approval',
      title: 'Harvest Status Updated',
      message: `Your harvest has been ${status}`,
      data: update
    })

    // Send to partner
    if (partnerId) {
      this.sendNotificationToUser(partnerId, {
        type: 'harvest-approval',
        title: 'Harvest Processed',
        message: `Harvest ${harvestId} has been ${status}`,
        data: update
      })
    }

    // Broadcast to relevant roles
    this.io.to('role:farmer').to('role:partner').emit('harvest-approval-update', update)
  }

  // Send real-time weather alert
  sendWeatherAlert(location, alert) {
    const weatherUpdate = {
      location,
      alert,
      timestamp: new Date()
    }

    // Send to users in the affected location
    this.io.to(`location:${location.city}:${location.state}`).emit('weather-alert', weatherUpdate)
    
    // Also broadcast to all users (they can filter on frontend)
    this.io.emit('weather-alert', weatherUpdate)
  }

  // Send real-time marketplace update
  sendMarketplaceUpdate(type, data) {
    const update = {
      type,
      data,
      timestamp: new Date()
    }

    // Broadcast to all users
    this.io.emit('marketplace-update', update)
  }

  // Send real-time shipment update
  sendShipmentUpdate(shipmentId, status, buyerId, sellerId) {
    const update = {
      shipmentId,
      status,
      timestamp: new Date()
    }

    // Send to buyer
    if (buyerId) {
      this.sendNotificationToUser(buyerId, {
        type: 'shipment-update',
        title: 'Shipment Update',
        message: `Your shipment status: ${status}`,
        data: update
      })
    }

    // Send to seller
    if (sellerId) {
      this.sendNotificationToUser(sellerId, {
        type: 'shipment-update',
        title: 'Shipment Update',
        message: `Shipment ${shipmentId} status: ${status}`,
        data: update
      })
    }

    // Broadcast to relevant roles
    this.io.to('role:buyer').to('role:farmer').emit('shipment-update', update)
  }

  // Send real-time payment update
  sendPaymentUpdate(paymentId, status, userId) {
    const update = {
      paymentId,
      status,
      timestamp: new Date()
    }

    // Send to user
    if (userId) {
      this.sendNotificationToUser(userId, {
        type: 'payment-update',
        title: 'Payment Update',
        message: `Your payment status: ${status}`,
        data: update
      })
    }

    // Broadcast to relevant roles
    this.io.to('role:buyer').to('role:farmer').to('role:partner').emit('payment-update', update)
  }

  // Get connection statistics
  getConnectionStats() {
    return {
      totalConnections: this.connectedUsers.size,
      usersByRole: {
        farmer: this.getOnlineUsersByRole('farmer').length,
        buyer: this.getOnlineUsersByRole('buyer').length,
        partner: this.getOnlineUsersByRole('partner').length,
        admin: this.getOnlineUsersByRole('admin').length
      }
    }
  }
}

module.exports = new WebSocketService()
