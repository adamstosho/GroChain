const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'partner', 'admin', 'buyer'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  location: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  age: { type: Number, min: 18, max: 120 },
  education: { type: String },
  suspensionReason: { type: String },
  suspendedAt: { type: Date },
  suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  smsOtpToken: { type: String },
  smsOtpExpires: { type: Date },
  smsOtpAttempts: { type: Number, default: 0 },
  pushToken: { type: String },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    harvestUpdates: { type: Boolean, default: true },
    marketplaceUpdates: { type: Boolean, default: true },
    financialUpdates: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: true }
  },
  profile: {
    avatar: { type: String },
    bio: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'Nigeria' },
    postalCode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  settings: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Africa/Lagos' },
    currency: { type: String, default: 'NGN' },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    notifications: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },
  preferences: {
    cropTypes: [{ type: String }],
    locations: [{ type: String }],
    priceRange: {
      min: { type: Number },
      max: { type: Number }
    },
    qualityPreferences: [{ type: String }],
    organicPreference: { type: Boolean, default: false }
  },
  stats: {
    totalHarvests: { type: Number, default: 0 },
    totalListings: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  }
}, { timestamps: true })

// Indexes
UserSchema.index({ phone: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ status: 1 })
UserSchema.index({ partner: 1 })
UserSchema.index({ location: 1 })
UserSchema.index({ createdAt: -1 })

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Method to get public profile (without sensitive data)
UserSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject()
  delete userObject.password
  delete userObject.resetPasswordToken
  delete userObject.resetPasswordExpires
  delete userObject.emailVerificationToken
  delete userObject.emailVerificationExpires
  delete userObject.smsOtpToken
  delete userObject.smsOtpExpires
  return userObject
}

module.exports = mongoose.model('User', UserSchema)
