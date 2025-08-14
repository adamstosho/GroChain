import mongoose, { Document, Schema } from 'mongoose';

export interface IIoTSensor extends Document {
  sensorId: string;
  sensorType: 'soil' | 'weather' | 'crop' | 'equipment' | 'water' | 'air';
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
    fieldId?: string;
  };
  farmer: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  lastReading: Date;
  batteryLevel: number;
  signalStrength: number;
  readings: Array<{
    timestamp: Date;
    value: number;
    unit: string;
    metric: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  }>;
  thresholds: {
    min: number;
    max: number;
    critical: number;
  };
  alerts: Array<{
    type: 'threshold' | 'battery' | 'signal' | 'maintenance';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    resolved: boolean;
  }>;
  metadata: {
    manufacturer: string;
    model: string;
    firmware: string;
    installationDate: Date;
    lastCalibration: Date;
    nextCalibration: Date;
  };
}

const IoTSensorSchema = new Schema<IIoTSensor>({
  sensorId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sensorType: {
    type: String,
    enum: ['soil', 'weather', 'crop', 'equipment', 'water', 'air'],
    required: true,
    index: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    altitude: { type: Number },
    fieldId: { type: String }
  },
  farmer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error'],
    default: 'active',
    index: true
  },
  lastReading: {
    type: Date,
    default: Date.now
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  signalStrength: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  readings: [{
    timestamp: { type: Date, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    metric: { type: String, required: true },
    quality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  }],
  thresholds: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    critical: { type: Number, required: true }
  },
  alerts: [{
    type: {
      type: String,
      enum: ['threshold', 'battery', 'signal', 'maintenance'],
      required: true
    },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
  }],
  metadata: {
    manufacturer: { type: String, required: true },
    model: { type: String, required: true },
    firmware: { type: String, required: true },
    installationDate: { type: Date, required: true },
    lastCalibration: { type: Date, required: true },
    nextCalibration: { type: Date, required: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
IoTSensorSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
IoTSensorSchema.index({ sensorType: 1, status: 1 });
IoTSensorSchema.index({ farmer: 1, sensorType: 1 });
IoTSensorSchema.index({ lastReading: 1 });

// Virtual for current reading
IoTSensorSchema.virtual('currentReading').get(function() {
  return this.readings.length > 0 ? this.readings[this.readings.length - 1] : null;
});

// Virtual for sensor health score
IoTSensorSchema.virtual('healthScore').get(function() {
  let score = 100;
  
  // Battery level impact
  if (this.batteryLevel < 20) score -= 30;
  else if (this.batteryLevel < 50) score -= 15;
  
  // Signal strength impact
  if (this.signalStrength < 30) score -= 25;
  else if (this.signalStrength < 70) score -= 10;
  
  // Status impact
  if (this.status === 'error') score -= 50;
  else if (this.status === 'maintenance') score -= 20;
  
  // Unresolved alerts impact
  const unresolvedAlerts = this.alerts.filter(alert => !alert.resolved);
  score -= unresolvedAlerts.length * 5;
  
  return Math.max(0, score);
});

// Pre-save middleware to update lastReading
IoTSensorSchema.pre('save', function(next) {
  if (this.readings.length > 0) {
    this.lastReading = this.readings[this.readings.length - 1].timestamp;
  }
  next();
});

// Static methods
IoTSensorSchema.statics.findByLocation = function(lat: number, lng: number, radius: number = 1000) {
  return this.find({
    'location.latitude': { $gte: lat - radius/111000, $lte: lat + radius/111000 },
    'location.longitude': { $gte: lng - radius/111000, $lte: lng + radius/111000 }
  });
};

IoTSensorSchema.statics.findByType = function(sensorType: string) {
  return this.find({ sensorType });
};

IoTSensorSchema.statics.findByFarmer = function(farmerId: string) {
  return this.find({ farmer: farmerId });
};

IoTSensorSchema.statics.findNeedsMaintenance = function() {
  return this.find({
    $or: [
      { status: 'maintenance' },
      { 'metadata.nextCalibration': { $lte: new Date() } },
      { batteryLevel: { $lt: 20 } },
      { signalStrength: { $lt: 30 } }
    ]
  });
};

// Instance methods
IoTSensorSchema.methods.addReading = function(value: number, unit: string, metric: string, quality: string = 'good') {
  this.readings.push({
    timestamp: new Date(),
    value,
    unit,
    metric,
    quality
  });
  
  // Keep only last 1000 readings
  if (this.readings.length > 1000) {
    this.readings = this.readings.slice(-1000);
  }
  
  return this.save();
};

IoTSensorSchema.methods.addAlert = function(type: string, message: string, severity: string) {
  this.alerts.push({
    type,
    message,
    severity,
    timestamp: new Date(),
    resolved: false
  });
  
  return this.save();
};

IoTSensorSchema.methods.resolveAlert = function(alertIndex: number) {
  if (this.alerts[alertIndex]) {
    this.alerts[alertIndex].resolved = true;
  }
  return this.save();
};

export const IoTSensor = mongoose.model<IIoTSensor>('IoTSensor', IoTSensorSchema);
export default IoTSensor;

