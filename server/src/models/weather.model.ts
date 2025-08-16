import mongoose, { Document, Schema } from 'mongoose';

export interface IWeatherData {
  location: {
    lat: number;
    lng: number;
    city: string;
    state: string;
    country: string;
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    visibility: number;
    uvIndex: number;
    weatherCondition: string;
    weatherIcon: string;
    feelsLike: number;
    dewPoint: number;
    cloudCover: number;
  };
  forecast: Array<{
    date: Date;
    highTemp: number;
    lowTemp: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    weatherCondition: string;
    weatherIcon: string;
    uvIndex: number;
  }>;
  alerts: Array<{
    type: 'weather' | 'climate' | 'agricultural';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    affectedCrops?: string[];
  }>;
  agricultural: {
    soilMoisture: number;
    soilTemperature: number;
    growingDegreeDays: number;
    frostRisk: 'low' | 'medium' | 'high';
    droughtIndex: number;
    pestRisk: 'low' | 'medium' | 'high';
    plantingRecommendation: string;
    irrigationAdvice: string;
  };
  metadata: {
    source: string;
    lastUpdated: Date;
    dataQuality: 'high' | 'medium' | 'low';
    nextUpdate: Date;
  };
}

export interface IWeatherDataDocument extends IWeatherData, Document {
  createdAt: Date;
  updatedAt: Date;
}

const WeatherDataSchema = new Schema<IWeatherDataDocument>({
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true }
  },
  current: {
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    windSpeed: { type: Number, required: false, default: 0 },
    windDirection: { type: String, required: false, default: 'N' },
    pressure: { type: Number, required: false, default: 0 },
    visibility: { type: Number, required: false, default: 0 },
    uvIndex: { type: Number, required: false, default: 0 },
    weatherCondition: { type: String, required: false, default: 'Clear' },
    weatherIcon: { type: String, required: false, default: '01d' },
    feelsLike: { type: Number, required: false, default: 0 },
    dewPoint: { type: Number, required: false, default: 0 },
    cloudCover: { type: Number, required: false, default: 0 }
  },
  forecast: [{
    date: { type: Date, required: true },
    highTemp: { type: Number, required: true },
    lowTemp: { type: Number, required: true },
    humidity: { type: Number, required: true },
    windSpeed: { type: Number, required: true },
    precipitation: { type: Number, required: true },
    weatherCondition: { type: String, required: true },
    weatherIcon: { type: String, required: true },
    uvIndex: { type: Number, required: true }
  }],
  alerts: [{
    type: { type: String, enum: ['weather', 'climate', 'agricultural'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    affectedCrops: [String]
  }],
  agricultural: {
    soilMoisture: { type: Number, required: false, default: 0 },
    soilTemperature: { type: Number, required: false, default: 0 },
    growingDegreeDays: { type: Number, required: false, default: 0 },
    frostRisk: { type: String, enum: ['low', 'medium', 'high'], required: false, default: 'low' },
    droughtIndex: { type: Number, required: false, default: 0 },
    pestRisk: { type: String, enum: ['low', 'medium', 'high'], required: false, default: 'low' },
    plantingRecommendation: { type: String, required: false, default: '' },
    irrigationAdvice: { type: String, required: false, default: '' }
  },
  metadata: {
    source: { type: String, required: false, default: 'test' },
    lastUpdated: { type: Date, required: false, default: () => new Date() },
    dataQuality: { type: String, enum: ['high', 'medium', 'low'], required: false, default: 'high' },
    nextUpdate: { type: Date, required: false, default: () => new Date(Date.now() + 3600 * 1000) }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
WeatherDataSchema.index({ 'location.lat': 1, 'location.lng': 1 });
WeatherDataSchema.index({ 'metadata.lastUpdated': -1 });
WeatherDataSchema.index({ 'alerts.severity': 1, 'alerts.type': 1 });
WeatherDataSchema.index({ 'agricultural.frostRisk': 1, 'agricultural.droughtIndex': 1 });

export const WeatherData = mongoose.model<IWeatherDataDocument>('WeatherData', WeatherDataSchema);
