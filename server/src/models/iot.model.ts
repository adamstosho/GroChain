import mongoose, { Document, Schema } from 'mongoose';

// Sensor Reading Interface
export interface ISensorReading extends Document {
  sensorId: mongoose.Types.ObjectId;
  value: number;
  unit: string;
  timestamp: Date;
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'light' | 'ph' | 'nutrients';
  location: string;
  metadata: Record<string, any>;
}

// IoT Stats Interface
export interface IIoTStats extends Document {
  totalSensors: number;
  onlineSensors: number;
  offlineSensors: number;
  warningSensors: number;
  averageBatteryLevel: number;
  totalAlerts: number;
  unacknowledgedAlerts: number;
  dataPointsToday: number;
  lastUpdated: Date;
  metadata: Record<string, any>;
}

// Sensor Configuration Interface
export interface ISensorConfig extends Document {
  sensorId: mongoose.Types.ObjectId;
  thresholds: {
    min: number;
    max: number;
    warning: number;
    critical: number;
  };
  samplingRate: number; // in seconds
  alertSettings: {
    enabled: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  calibration: {
    offset: number;
    multiplier: number;
    lastCalibrated: Date;
  };
  metadata: Record<string, any>;
}

// Sensor Reading Schema
const sensorReadingSchema = new Schema<ISensorReading>({
  sensorId: {
    type: Schema.Types.ObjectId,
    ref: 'Sensor',
    required: true,
    index: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['temperature', 'humidity', 'soil_moisture', 'light', 'ph', 'nutrients']
  },
  location: {
    type: String,
    required: true
  },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// IoT Stats Schema
const iotStatsSchema = new Schema<IIoTStats>({
  totalSensors: {
    type: Number,
    required: true,
    min: 0
  },
  onlineSensors: {
    type: Number,
    required: true,
    min: 0
  },
  offlineSensors: {
    type: Number,
    required: true,
    min: 0
  },
  warningSensors: {
    type: Number,
    required: true,
    min: 0
  },
  averageBatteryLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalAlerts: {
    type: Number,
    required: true,
    min: 0
  },
  unacknowledgedAlerts: {
    type: Number,
    required: true,
    min: 0
  },
  dataPointsToday: {
    type: Number,
    required: true,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Sensor Configuration Schema
const sensorConfigSchema = new Schema<ISensorConfig>({
  sensorId: {
    type: Schema.Types.ObjectId,
    ref: 'Sensor',
    required: true,
    unique: true,
    index: true
  },
  thresholds: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    warning: {
      type: Number,
      required: true
    },
    critical: {
      type: Number,
      required: true
    }
  },
  samplingRate: {
    type: Number,
    required: true,
    min: 1,
    max: 86400 // max 24 hours
  },
  alertSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  calibration: {
    offset: {
      type: Number,
      default: 0
    },
    multiplier: {
      type: Number,
      default: 1
    },
    lastCalibrated: {
      type: Date,
      default: Date.now
    }
  },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for better query performance
sensorReadingSchema.index({ sensorId: 1, timestamp: -1 });
sensorReadingSchema.index({ type: 1, timestamp: -1 });
sensorReadingSchema.index({ location: 1, timestamp: -1 });
iotStatsSchema.index({ lastUpdated: -1 });
sensorConfigSchema.index({ sensorId: 1 });

// Export models
export const SensorReading = mongoose.model<ISensorReading>('SensorReading', sensorReadingSchema);
export const IoTStats = mongoose.model<IIoTStats>('IoTStats', iotStatsSchema);
export const SensorConfig = mongoose.model<ISensorConfig>('SensorConfig', sensorConfigSchema);
