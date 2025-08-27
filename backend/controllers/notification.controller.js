const Notification = require('../models/notification.model')
const User = require('../models/user.model')

exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type = 'info', category = 'system', channels = ['in_app'], data = {}, actionUrl, priority = 'normal' } = req.body
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' })
    }
    
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      category,
      channels,
      data,
      actionUrl,
      priority
    })
    
    await notification.save()
    
    // Send through different channels
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            if (user.email) {
              // Send email notification
              await sendEmailNotification(user.email, title, message, actionUrl)
              notification.channels.find(c => c.type === 'email').sent = true
              notification.channels.find(c => c.type === 'email').sentAt = new Date()
            }
            break
          case 'sms':
            if (user.phone) {
              // Send SMS notification
              await sendSMSNotification(user.phone, message)
              notification.channels.find(c => c.type === 'sms').sent = true
              notification.channels.find(c => c.type === 'sms').sentAt = new Date()
            }
            break
          case 'push':
            if (user.pushToken) {
              // Send push notification
              await sendPushNotification(user.pushToken, title, message, data)
              notification.channels.find(c => c.type === 'push').sent = true
              notification.channels.find(c => c.type === 'push').sentAt = new Date()
            }
            break
        }
      } catch (error) {
        notification.channels.find(c => c.type === channel).error = error.message
      }
    }
    
    await notification.save()
    
    return res.json({ status: 'success', data: notification })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.sendBulkNotifications = async (req, res) => {
  try {
    const { userIds, title, message, type = 'info', category = 'system', channels = ['in_app'], data = {}, actionUrl, priority = 'normal' } = req.body
    
    const users = await User.find({ _id: { $in: userIds } })
    if (users.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No users found' })
    }
    
    const notifications = []
    
    for (const user of users) {
      const notification = new Notification({
        user: user._id,
        title,
        message,
        type,
        category,
        channels,
        data,
        actionUrl,
        priority
      })
      
      await notification.save()
      notifications.push(notification)
      
      // Send through different channels
      for (const channel of channels) {
        try {
          switch (channel) {
            case 'email':
              if (user.email) {
                await sendEmailNotification(user.email, title, message, actionUrl)
                notification.channels.find(c => c.type === 'email').sent = true
                notification.channels.find(c => c.type === 'email').sentAt = new Date()
              }
              break
            case 'sms':
              if (user.phone) {
                await sendSMSNotification(user.phone, message)
                notification.channels.find(c => c.type === 'sms').sent = true
                notification.channels.find(c => c.type === 'sms').sentAt = new Date()
              }
              break
            case 'push':
              if (user.pushToken) {
                await sendPushNotification(user.pushToken, title, message, data)
                notification.channels.find(c => c.type === 'push').sent = true
                notification.channels.find(c => c.type === 'push').sentAt = new Date()
              }
              break
          }
        } catch (error) {
          notification.channels.find(c => c.type === channel).error = error.message
        }
      }
      
      await notification.save()
    }
    
    return res.json({ 
      status: 'success', 
      message: `${notifications.length} notifications sent successfully`,
      data: notifications 
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read, category, type } = req.query
    const userId = req.user.id
    
    const query = { user: userId }
    if (read !== undefined) query.read = read === 'true'
    if (category) query.category = category
    if (type) query.type = type
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
    
    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({ user: userId, read: false })
    
    return res.json({
      status: 'success',
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        unreadCount
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params
    const userId = req.user.id
    
    const notification = await Notification.findOne({ _id: notificationId, user: userId })
    if (!notification) {
      return res.status(404).json({ status: 'error', message: 'Notification not found' })
    }
    
    notification.read = true
    notification.readAt = new Date()
    await notification.save()
    
    return res.json({ status: 'success', data: notification })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id
    
    await Notification.updateMany(
      { user: userId, read: false },
      { read: true, readAt: new Date() }
    )
    
    return res.json({ status: 'success', message: 'All notifications marked as read' })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).select('notificationPreferences')
    
    return res.json({ status: 'success', data: user.notificationPreferences })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id
    const preferences = req.body
    
    const user = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true, runValidators: true }
    )
    
    return res.json({ status: 'success', data: user.notificationPreferences })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.updatePushToken = async (req, res) => {
  try {
    const userId = req.user.id
    const { pushToken } = req.body
    
    await User.findByIdAndUpdate(userId, { pushToken })
    
    return res.json({ status: 'success', message: 'Push token updated successfully' })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Helper functions for sending notifications
async function sendEmailNotification(email, title, message, actionUrl) {
  // Implementation for sending email notifications
  // This would integrate with your email service (SendGrid, SMTP, etc.)
  console.log(`Email notification sent to ${email}: ${title} - ${message}`)
}

async function sendSMSNotification(phone, message) {
  // Implementation for sending SMS notifications
  // This would integrate with your SMS service (Twilio, etc.)
  console.log(`SMS notification sent to ${phone}: ${message}`)
}

async function sendPushNotification(pushToken, title, message, data) {
  // Implementation for sending push notifications
  // This would integrate with Firebase Cloud Messaging or similar
  console.log(`Push notification sent to ${pushToken}: ${title} - ${message}`)
}

// Specialized notification functions
exports.sendHarvestNotification = async (req, res) => {
  try {
    const { harvestId, type, message } = req.body
    
    const harvest = await require('../models/harvest.model').findById(harvestId).populate('farmer')
    if (!harvest) {
      return res.status(404).json({ status: 'error', message: 'Harvest not found' })
    }
    
    const notification = new Notification({
      user: harvest.farmer._id,
      title: `Harvest Update: ${harvest.cropType}`,
      message,
      type: 'info',
      category: 'harvest',
      channels: ['in_app', 'email'],
      data: { harvestId, type },
      actionUrl: `/harvests/${harvestId}`
    })
    
    await notification.save()
    
    return res.json({ status: 'success', data: notification })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.sendMarketplaceNotification = async (req, res) => {
  try {
    const { listingId, type, message } = req.body
    
    const listing = await require('../models/listing.model').findById(listingId).populate('farmer')
    if (!listing) {
      return res.status(404).json({ status: 'error', message: 'Listing not found' })
    }
    
    const notification = new Notification({
      user: listing.farmer._id,
      title: `Marketplace Update: ${listing.cropName}`,
      message,
      type: 'info',
      category: 'marketplace',
      channels: ['in_app', 'email'],
      data: { listingId, type },
      actionUrl: `/marketplace/listings/${listingId}`
    })
    
    await notification.save()
    
    return res.json({ status: 'success', data: notification })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.sendTransactionNotification = async (req, res) => {
  try {
    const { orderId, type, message } = req.body
    
    const order = await require('../models/order.model').findById(orderId).populate('buyer')
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' })
    }
    
    const notification = new Notification({
      user: order.buyer._id,
      title: `Transaction Update`,
      message,
      type: 'success',
      category: 'financial',
      channels: ['in_app', 'email'],
      data: { orderId, type },
      actionUrl: `/orders/${orderId}`
    })
    
    await notification.save()
    
    return res.json({ status: 'success', data: notification })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

