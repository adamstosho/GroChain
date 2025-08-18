import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUSSDSession extends Document {
  sessionId: string;
  phoneNumber: string;
  currentMenu: string;
  userData: Record<string, any>;
  lastActivity: Date;
  step: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUSSDSessionModel extends Model<IUSSDSession> {
  findActiveByPhone(phoneNumber: string): Promise<IUSSDSession | null>;
  findActiveById(sessionId: string): Promise<IUSSDSession | null>;
  cleanupExpired(): Promise<any>;
}

const ussdSessionSchema = new Schema<IUSSDSession>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },
  currentMenu: {
    type: String,
    required: true,
    default: 'main'
  },
  userData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  lastActivity: {
    type: Date,
    required: true,
    default: Date.now
  },
  step: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true,
  collection: 'ussd_sessions'
});

// Index for performance
ussdSessionSchema.index({ phoneNumber: 1, isActive: 1 });
ussdSessionSchema.index({ lastActivity: 1 });
ussdSessionSchema.index({ sessionId: 1, isActive: 1 });

// TTL index to automatically expire old sessions (24 hours)
ussdSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

// Method to update session activity
ussdSessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Method to close session
ussdSessionSchema.methods.closeSession = function() {
  this.isActive = false;
  return this.save();
};

// Static method to find active session by phone number
ussdSessionSchema.statics.findActiveByPhone = function(phoneNumber: string) {
  return this.findOne({ phoneNumber, isActive: true });
};

// Static method to find active session by session ID
ussdSessionSchema.statics.findActiveById = function(sessionId: string) {
  return this.findOne({ sessionId, isActive: true });
};

// Static method to clean up expired sessions
ussdSessionSchema.statics.cleanupExpired = function() {
  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  return this.updateMany(
    { lastActivity: { $lt: cutoffDate } },
    { isActive: false }
  );
};

export default mongoose.model<IUSSDSession, IUSSDSessionModel>('USSDSession', ussdSessionSchema);

