const mongoose = require('mongoose')

const weatherAlertSchema = new mongoose.Schema({
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'Nigeria' }
  },
  
  type: {
    type: String,
    enum: ['weather', 'climate', 'agricultural', 'emergency'],
    required: true
  },
  
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date,
    required: true
  },
  
  affectedCrops: [{
    type: String,
    enum: ['maize', 'rice', 'cassava', 'yam', 'sorghum', 'millet', 'beans', 'vegetables', 'fruits', 'all']
  }],
  
  weatherConditions: {
    temperature: { type: Number },
    humidity: { type: Number },
    windSpeed: { type: Number },
    precipitation: { type: Number },
    pressure: { type: Number }
  },
  
  recommendations: [{
    type: String,
    maxlength: 500
  }],
  
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Notification tracking
  notificationsSent: {
    type: Number,
    default: 0
  },
  
  farmersNotified: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Source information
  source: {
    type: String,
    default: 'GroChain Weather Service'
  },
  
  externalId: {
    type: String // For external weather service alerts
  },
  
  // Metadata
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dataQuality: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'high'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
})

// Indexes for efficient querying
weatherAlertSchema.index({ 'location.state': 1, 'location.city': 1 })
weatherAlertSchema.index({ type: 1, severity: 1 })
weatherAlertSchema.index({ status: 1, startTime: 1, endTime: 1 })
weatherAlertSchema.index({ affectedCrops: 1 })
weatherAlertSchema.index({ 'location.lat': 1, 'location.lng': 1 })

// TTL index to automatically remove expired alerts after 7 days
weatherAlertSchema.index({ endTime: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 })

// Virtual for alert duration
weatherAlertSchema.virtual('duration').get(function() {
  return this.endTime - this.startTime
})

// Virtual for alert age
weatherAlertSchema.virtual('age').get(function() {
  return Date.now() - this.startTime
})

// Static method to find active alerts
weatherAlertSchema.statics.findActiveAlerts = function(location = null, cropType = null) {
  const now = new Date()
  const query = {
    status: 'active',
    startTime: { $lte: now },
    endTime: { $gte: now }
  }
  
  if (location) {
    if (location.state) query['location.state'] = location.state
    if (location.city) query['location.city'] = location.city
  }
  
  if (cropType) {
    query.$or = [
      { affectedCrops: cropType },
      { affectedCrops: 'all' }
    ]
  }
  
  return this.find(query).sort({ severity: -1, startTime: -1 })
}

// Static method to find alerts by severity
weatherAlertSchema.statics.findBySeverity = function(severity, location = null) {
  const query = { severity }
  
  if (location) {
    if (location.state) query['location.state'] = location.state
    if (location.city) query['location.city'] = location.city
  }
  
  return this.find(query).sort({ startTime: -1 })
}

// Static method to get alert statistics
weatherAlertSchema.statics.getAlertStatistics = function(region = null, period = 'month') {
  const match = {}
  if (region) match['location.state'] = region
  
  const now = new Date()
  const startDate = new Date()
  
  if (period === 'week') {
    startDate.setDate(now.getDate() - 7)
  } else if (period === 'month') {
    startDate.setMonth(now.getMonth() - 1)
  } else if (period === 'quarter') {
    startDate.setMonth(now.getMonth() - 3)
  } else if (period === 'year') {
    startDate.setFullYear(now.getFullYear() - 1)
  }
  
  match.createdAt = { $gte: startDate, $lte: now }
  
  return this.aggregate([
    { $match: match },
    { $group: {
      _id: {
        type: '$type',
        severity: '$severity'
      },
      count: { $sum: 1 },
      avgDuration: { $avg: { $subtract: ['$endTime', '$startTime'] } },
      totalNotifications: { $sum: '$notificationsSent' }
    }},
    { $sort: { '_id.severity': -1, count: -1 } }
  ])
}

// Instance method to check if alert is active
weatherAlertSchema.methods.isActive = function() {
  const now = new Date()
  return this.status === 'active' && 
         this.startTime <= now && 
         this.endTime >= now
}

// Instance method to check if alert affects specific crop
weatherAlertSchema.methods.affectsCrop = function(cropType) {
  return this.affectedCrops.includes(cropType) || this.affectedCrops.includes('all')
}

// Instance method to get alert priority based on severity and time
weatherAlertSchema.methods.getPriority = function() {
  if (this.severity === 'critical') return 'urgent'
  if (this.severity === 'high') return 'high'
  if (this.severity === 'medium') return 'normal'
  return 'low'
}

// Pre-save middleware to set priority
weatherAlertSchema.pre('save', function(next) {
  this.priority = this.getPriority()
  next()
})

// Pre-save middleware to validate time range
weatherAlertSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    return next(new Error('End time must be after start time'))
  }
  next()
})

module.exports = mongoose.model('WeatherAlert', weatherAlertSchema)
