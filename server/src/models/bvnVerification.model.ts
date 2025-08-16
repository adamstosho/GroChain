import mongoose, { Document, Schema } from 'mongoose';

export interface IBVNVerification extends Document {
  bvn: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  phoneNumber: string;
  documentType: 'national_id' | 'passport' | 'drivers_license' | 'voter_card';
  documentNumber?: string;
  bankName?: string;
  accountNumber?: string;
  verificationStatus: 'pending' | 'verified' | 'failed' | 'manual_review';
  verificationMethod: 'online' | 'offline' | 'manual';
  verificationId: string;
  adminNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  attemptsCount: number;
  lastAttempt: Date;
  verifiedAt?: Date;
  user: mongoose.Types.ObjectId;
  partner?: mongoose.Types.ObjectId;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

const bvnVerificationSchema = new Schema<IBVNVerification>({
  bvn: {
    type: String,
    required: true,
    minlength: 11,
    maxlength: 11,
    match: /^\d{11}$/,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true
  },
  middleName: {
    type: String,
    maxlength: 50,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function(value: Date) {
        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        const monthDiff = today.getMonth() - value.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < value.getDate())) {
          return age - 1 >= 18;
        }
        return age >= 18;
      },
      message: 'User must be at least 18 years old'
    }
  },
  phoneNumber: {
    type: String,
    required: true,
    match: /^(\+234|0)[789][01]\d{8}$/,
    index: true
  },
  documentType: {
    type: String,
    enum: ['national_id', 'passport', 'drivers_license', 'voter_card'],
    default: 'national_id'
  },
  documentNumber: {
    type: String,
    maxlength: 50
  },
  bankName: {
    type: String,
    maxlength: 100
  },
  accountNumber: {
    type: String,
    maxlength: 20
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'manual_review'],
    default: 'pending',
    index: true
  },
  verificationMethod: {
    type: String,
    enum: ['online', 'offline', 'manual'],
    default: 'manual'
  },
  verificationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  adminNotes: {
    type: String,
    maxlength: 500
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  attemptsCount: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
bvnVerificationSchema.index({ bvn: 1, phoneNumber: 1 });
bvnVerificationSchema.index({ verificationStatus: 1, submittedAt: -1 });
bvnVerificationSchema.index({ user: 1, verificationStatus: 1 });
bvnVerificationSchema.index({ partner: 1, verificationStatus: 1 });

// Virtual for full name
bvnVerificationSchema.virtual('fullName').get(function() {
  if (this.middleName) {
    return `${this.firstName} ${this.middleName} ${this.lastName}`;
  }
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
bvnVerificationSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = this.dateOfBirth;
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for processing time
bvnVerificationSchema.virtual('processingTime').get(function() {
  if (this.verificationStatus === 'pending') {
    return Date.now() - this.submittedAt.getTime();
  }
  if (this.verifiedAt) {
    return this.verifiedAt.getTime() - this.submittedAt.getTime();
  }
  return null;
});

// Pre-save middleware to update lastAttempt
bvnVerificationSchema.pre('save', function(next) {
  if (this.isModified('verificationStatus')) {
    if (this.verificationStatus === 'verified') {
      this.verifiedAt = new Date();
    } else if (this.verificationStatus === 'manual_review') {
      this.reviewedAt = new Date();
    }
  }
  this.lastAttempt = new Date();
  next();
});

// Static method to get verification statistics
bvnVerificationSchema.statics.getVerificationStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$verificationStatus',
        count: { $sum: 1 },
        avgProcessingTime: {
          $avg: {
            $subtract: [
              { $ifNull: ['$verifiedAt', new Date()] },
              '$submittedAt'
            ]
          }
        }
      }
    }
  ]);

  const total = await this.countDocuments();
  const result: any = {
    total,
    statusBreakdown: {},
    averageProcessingTime: 0
  };

  stats.forEach((stat: any) => {
    result.statusBreakdown[stat._id] = {
      count: stat.count,
      percentage: (stat.count / total) * 100,
      avgProcessingTime: stat.avgProcessingTime
    };
  });

  // Calculate overall average processing time
  const totalProcessingTime = stats.reduce((sum: number, stat: any) => sum + stat.avgProcessingTime, 0);
  result.averageProcessingTime = totalProcessingTime / stats.length;

  return result;
};

// Static method to get manual verification queue
bvnVerificationSchema.statics.getManualVerificationQueue = async function(limit = 50) {
  return this.find({
    verificationStatus: 'manual_review'
  })
  .sort({ submittedAt: 1 })
  .limit(limit)
  .populate('user', 'firstName lastName email phone')
  .populate('partner', 'name organization')
  .populate('reviewedBy', 'firstName lastName');
};

// Instance method to resend verification
bvnVerificationSchema.methods.resendVerification = async function() {
  if (this.attemptsCount >= 10) {
    throw new Error('Maximum verification attempts reached');
  }

  this.attemptsCount += 1;
  this.lastAttempt = new Date();
  this.verificationStatus = 'pending';
  
  return this.save();
};

// Instance method to approve verification
bvnVerificationSchema.methods.approveVerification = async function(adminId: mongoose.Types.ObjectId, notes?: string) {
  this.verificationStatus = 'verified';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.verifiedAt = new Date();
  this.adminNotes = notes;
  
  return this.save();
};

// Instance method to reject verification
bvnVerificationSchema.methods.rejectVerification = async function(adminId: mongoose.Types.ObjectId, notes?: string) {
  this.verificationStatus = 'failed';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.adminNotes = notes;
  
  return this.save();
};

const BVNVerification = mongoose.model<IBVNVerification>('BVNVerification', bvnVerificationSchema);

export default BVNVerification;


