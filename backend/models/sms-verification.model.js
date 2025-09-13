const mongoose = require('mongoose')

const smsVerificationSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  
  code: {
    type: String,
    required: true,
    length: 6
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for pre-registration verification
  },
  
  purpose: {
    type: String,
    enum: ['registration', 'login', 'password_reset', 'phone_update', 'transaction'],
    default: 'registration'
  },
  
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  
  verified: {
    type: Boolean,
    default: false
  },
  
  verifiedAt: {
    type: Date
  },
  
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    },
    index: { expireAfterSeconds: 0 }
  },
  
  ipAddress: {
    type: String
  },
  
  userAgent: {
    type: String
  }
}, {
  timestamps: true
})

// Indexes
smsVerificationSchema.index({ phone: 1, verified: 1 })
smsVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Static method to generate verification code
smsVerificationSchema.statics.generateCode = function() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Static method to create verification record
smsVerificationSchema.statics.createVerification = async function(phone, purpose = 'registration', userId = null, req = null) {
  // Clean up any existing unverified codes for this phone
  await this.deleteMany({ 
    phone, 
    verified: false,
    purpose 
  })
  
  const code = this.generateCode()
  
  const verification = new this({
    phone,
    code,
    userId,
    purpose,
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get('User-Agent')
  })
  
  return verification.save()
}

// Instance method to verify code
smsVerificationSchema.methods.verifyCode = async function(inputCode) {
  // Check if already verified
  if (this.verified) {
    throw new Error('Phone number already verified')
  }
  
  // Check if expired
  if (this.expiresAt < new Date()) {
    throw new Error('Verification code has expired')
  }
  
  // Check attempts limit
  if (this.attempts >= 5) {
    throw new Error('Too many verification attempts. Please request a new code.')
  }
  
  // Increment attempts
  this.attempts += 1
  
  // Check if code matches
  if (this.code !== inputCode) {
    await this.save()
    throw new Error('Invalid verification code')
  }
  
  // Mark as verified
  this.verified = true
  this.verifiedAt = new Date()
  
  await this.save()
  return true
}

// Static method to check if phone is verified
smsVerificationSchema.statics.isPhoneVerified = async function(phone, purpose = 'registration') {
  const verification = await this.findOne({
    phone,
    purpose,
    verified: true
  }).sort({ verifiedAt: -1 })
  
  return !!verification
}

// Static method to get verification status
smsVerificationSchema.statics.getVerificationStatus = async function(phone, purpose = 'registration') {
  const verification = await this.findOne({
    phone,
    purpose,
    verified: false
  }).sort({ createdAt: -1 })
  
  if (!verification) {
    return { status: 'none', message: 'No verification code found' }
  }
  
  if (verification.verified) {
    return { status: 'verified', message: 'Phone number already verified' }
  }
  
  if (verification.expiresAt < new Date()) {
    return { status: 'expired', message: 'Verification code has expired' }
  }
  
  if (verification.attempts >= 5) {
    return { status: 'blocked', message: 'Too many attempts. Please request a new code.' }
  }
  
  return { 
    status: 'pending', 
    message: 'Verification code is pending',
    attempts: verification.attempts,
    expiresAt: verification.expiresAt
  }
}

module.exports = mongoose.model('SMSVerification', smsVerificationSchema)
