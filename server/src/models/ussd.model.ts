import mongoose, { Document, Schema } from 'mongoose';

export interface IUSSD extends Document {
  sessionId: string;
  phoneNumber: string;
  serviceCode: string;
  text: string;
  networkCode: string;
  status: 'active' | 'completed' | 'expired';
  currentMenu: string;
  userData: Record<string, any>;
  startTime: Date;
  lastActivity: Date;
  endTime?: Date;
  user?: mongoose.Types.ObjectId;
  partner?: mongoose.Types.ObjectId;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    deviceType?: string;
  };
}

const ussdSchema = new Schema<IUSSD>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phoneNumber: {
    type: String,
    required: true,
    match: /^(\+234|0)[789][01]\d{8}$/,
    index: true
  },
  serviceCode: {
    type: String,
    required: true,
    default: '*123#'
  },
  text: {
    type: String,
    default: ''
  },
  networkCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active',
    index: true
  },
  currentMenu: {
    type: String,
    default: 'main'
  },
  userData: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  startTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  endTime: {
    type: Date
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String,
    deviceType: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ussdSchema.index({ phoneNumber: 1, status: 1 });
ussdSchema.index({ sessionId: 1, status: 1 });
ussdSchema.index({ startTime: 1, status: 1 });

// Virtual for session duration
ussdSchema.virtual('sessionDuration').get(function() {
  if (this.endTime) {
    return this.endTime.getTime() - this.startTime.getTime();
  }
  return Date.now() - this.startTime.getTime();
});

// Virtual for is active
ussdSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Pre-save middleware to update lastActivity
ussdSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Static method to get active sessions
ussdSchema.statics.getActiveSessions = async function(phoneNumber?: string) {
  const query: any = { status: 'active' };
  if (phoneNumber) {
    query.phoneNumber = phoneNumber;
  }
  
  return this.find(query)
    .sort({ lastActivity: -1 })
    .populate('user', 'firstName lastName email phone')
    .populate('partner', 'name organization');
};

// Static method to expire old sessions
ussdSchema.statics.expireOldSessions = async function(maxAgeMinutes = 30) {
  const cutoffTime = new Date(Date.now() - (maxAgeMinutes * 60 * 1000));
  
  const result = await this.updateMany(
    { 
      status: 'active', 
      lastActivity: { $lt: cutoffTime } 
    },
    { 
      status: 'expired',
      endTime: new Date()
    }
  );
  
  return result.modifiedCount;
};

// Static method to get session statistics
ussdSchema.statics.getSessionStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDuration: {
          $avg: {
            $subtract: [
              { $ifNull: ['$endTime', new Date()] },
              '$startTime'
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
    averageSessionDuration: 0
  };

  stats.forEach((stat: any) => {
    result.statusBreakdown[stat._id] = {
      count: stat.count,
      percentage: (stat.count / total) * 100,
      avgDuration: stat.avgDuration
    };
  });

  // Calculate overall average session duration
  const totalDuration = stats.reduce((sum: number, stat: any) => sum + stat.avgDuration, 0);
  result.averageSessionDuration = totalDuration / stats.length;

  return result;
};

// Instance method to complete session
ussdSchema.methods.completeSession = async function() {
  this.status = 'completed';
  this.endTime = new Date();
  return this.save();
};

// Instance method to update menu
ussdSchema.methods.updateMenu = async function(menu: string, data?: Record<string, any>) {
  this.currentMenu = menu;
  if (data) {
    this.userData = { ...this.userData, ...data };
  }
  return this.save();
};

const USSD = mongoose.model<IUSSD>('USSD', ussdSchema);

export default USSD;


