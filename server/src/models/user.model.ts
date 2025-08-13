import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  FARMER = 'farmer',
  PARTNER = 'partner',
  AGGREGATOR = 'aggregator',
  ADMIN = 'admin',
  BUYER = 'buyer', 
}

// Notification preferences interface
export interface NotificationPreferences {
  sms: boolean;
  email: boolean;
  ussd: boolean;
  push: boolean;
  marketing: boolean;
  transaction: boolean;
  harvest: boolean;
  marketplace: boolean;
}

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  sms: true,
  email: true,
  ussd: false,
  push: false,
  marketing: true,
  transaction: true,
  harvest: true,
  marketplace: true
};

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  status: 'active' | 'inactive';
  emailVerified?: boolean;
  phoneVerified?: boolean;
  // Password reset
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // Email verification
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  // SMS OTP verification
  smsOtpToken?: string;
  smsOtpExpires?: Date;
  smsOtpAttempts?: number;
  pushToken?: string;
  notificationPreferences?: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.FARMER },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    smsOtpToken: { type: String },
    smsOtpExpires: { type: Date },
    smsOtpAttempts: { type: Number, default: 0 },
    pushToken: { type: String },
    notificationPreferences: {
      type: {
        sms: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        ussd: { type: Boolean, default: false },
        push: { type: Boolean, default: false },
        marketing: { type: Boolean, default: true },
        transaction: { type: Boolean, default: true },
        harvest: { type: Boolean, default: true },
        marketplace: { type: Boolean, default: true }
      },
      default: DEFAULT_NOTIFICATION_PREFERENCES
    }
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const currentPassword = this.password as unknown as string;
  // If password already appears to be a bcrypt hash, skip re-hashing
  const bcryptHashRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
  if (bcryptHashRegex.test(currentPassword)) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(currentPassword, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
