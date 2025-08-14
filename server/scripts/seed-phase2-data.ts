import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { IoTSensor } from '../src/models/iotSensor.model';
import { CropAnalysis } from '../src/models/cropAnalysis.model';
import { User } from '../src/models/user.model';
import { logger } from '../src/index';

dotenv.config();

const sampleSensors = [
  {
    sensorId: 'SOIL_001',
    sensorType: 'soil',
    location: {
      latitude: 6.5244,
      longitude: 3.3792,
      altitude: 10,
      fieldId: 'FIELD_A'
    },
    thresholds: {
      min: 20,
      max: 80,
      critical: 15
    },
    metadata: {
      manufacturer: 'AgriTech Solutions',
      model: 'SoilMoisture Pro',
      firmware: 'v2.1.0',
      installationDate: new Date('2024-01-15'),
      lastCalibration: new Date('2024-01-15'),
      nextCalibration: new Date('2024-07-15')
    }
  },
  {
    sensorId: 'WEATHER_001',
    sensorType: 'weather',
    location: {
      latitude: 6.5244,
      longitude: 3.3792,
      altitude: 15,
      fieldId: 'FIELD_A'
    },
    thresholds: {
      min: 15,
      max: 40,
      critical: 10
    },
    metadata: {
      manufacturer: 'ClimateSense',
      model: 'WeatherStation Plus',
      firmware: 'v1.8.2',
      installationDate: new Date('2024-01-20'),
      lastCalibration: new Date('2024-01-20'),
      nextCalibration: new Date('2024-07-20')
    }
  },
  {
    sensorId: 'CROP_001',
    sensorType: 'crop',
    location: {
      latitude: 6.5244,
      longitude: 3.3792,
      altitude: 12,
      fieldId: 'FIELD_B'
    },
    thresholds: {
      min: 60,
      max: 95,
      critical: 50
    },
    metadata: {
      manufacturer: 'CropMonitor',
      model: 'CropHealth Sensor',
      firmware: 'v1.5.1',
      installationDate: new Date('2024-02-01'),
      lastCalibration: new Date('2024-02-01'),
      nextCalibration: new Date('2024-08-01')
    }
  }
];

const sampleCropAnalyses = [
  {
    imageUrl: 'https://example.com/crop1.jpg',
    fieldId: 'FIELD_A',
    cropType: 'maize',
    analysisType: 'disease',
    confidence: 92,
    results: {
      detectedIssues: [
        {
          issue: 'Northern Leaf Blight',
          confidence: 92,
          severity: 'high',
          description: 'Fungal disease affecting maize leaves',
          recommendations: ['Apply fungicide', 'Remove infected plants']
        }
      ],
      cropHealth: {
        overall: 'poor',
        score: 60,
        factors: [
          {
            factor: 'Leaf Health',
            status: 'critical',
            value: 'Severe blight detected'
          }
        ]
      },
      growthStage: {
        current: 'Vegetative',
        estimatedDaysToHarvest: 45,
        progress: 35
      },
      qualityMetrics: {
        color: 'Yellowing',
        texture: 'Poor',
        size: 'Variable',
        uniformity: 40
      }
    },
    metadata: {
      imageSize: { width: 1920, height: 1080 },
      captureDate: new Date('2024-03-15'),
      location: { latitude: 6.5244, longitude: 3.3792 },
      weather: { temperature: 28, humidity: 75, rainfall: 0 },
      processingTime: 2500,
      modelVersion: '2.1.0'
    },
    recommendations: [
      {
        action: 'Apply fungicide treatment',
        priority: 'urgent',
        description: 'Immediate fungicide application required',
        estimatedCost: 150,
        estimatedTime: 2,
        effectiveness: 85
      }
    ],
    status: 'completed'
  },
  {
    imageUrl: 'https://example.com/crop2.jpg',
    fieldId: 'FIELD_B',
    cropType: 'rice',
    analysisType: 'quality',
    confidence: 88,
    results: {
      detectedIssues: [],
      cropHealth: {
        overall: 'good',
        score: 88,
        factors: [
          {
            factor: 'Color',
            status: 'good',
            value: 'Healthy green color'
          },
          {
            factor: 'Texture',
            status: 'good',
            value: 'Firm and consistent'
          }
        ]
      },
      growthStage: {
        current: 'Flowering',
        estimatedDaysToHarvest: 30,
        progress: 70
      },
      qualityMetrics: {
        color: 'Healthy green',
        texture: 'Firm',
        size: 'Uniform',
        uniformity: 85
      }
    },
    metadata: {
      imageSize: { width: 1920, height: 1080 },
      captureDate: new Date('2024-03-16'),
      location: { latitude: 6.5244, longitude: 3.3792 },
      weather: { temperature: 30, humidity: 80, rainfall: 5 },
      processingTime: 2100,
      modelVersion: '2.1.0'
    },
    recommendations: [
      {
        action: 'Continue current practices',
        priority: 'low',
        description: 'Crop is healthy, maintain current care routine',
        estimatedCost: 0,
        estimatedTime: 0,
        effectiveness: 100
      }
    ],
    status: 'completed'
  }
];

async function seedPhase2Data() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain');
    logger.info('Connected to MongoDB');

    // Get a sample farmer user
    const farmer = await User.findOne({ role: 'farmer' });
    if (!farmer) {
      logger.error('No farmer user found. Please seed users first.');
      return;
    }

    // Clear existing Phase 2 data
    await IoTSensor.deleteMany({});
    await CropAnalysis.deleteMany({});
    logger.info('Cleared existing Phase 2 data');

    // Seed IoT Sensors
    const sensors = [];
    for (const sensorData of sampleSensors) {
      const sensor = new IoTSensor({
        ...sensorData,
        farmer: farmer._id,
        status: 'active',
        batteryLevel: Math.floor(Math.random() * 30) + 70, // 70-100%
        signalStrength: Math.floor(Math.random() * 20) + 80, // 80-100%
        readings: generateSampleReadings(sensorData.sensorType),
        alerts: []
      });
      
      await sensor.save();
      sensors.push(sensor);
      logger.info(`Created sensor: ${sensor.sensorId}`);
    }

    // Seed Crop Analyses
    for (const analysisData of sampleCropAnalyses) {
      const analysis = new CropAnalysis({
        ...analysisData,
        farmer: farmer._id
      });
      
      await analysis.save();
      logger.info(`Created crop analysis for ${analysisData.cropType}`);
    }

    logger.info('Phase 2 data seeding completed successfully!');
    logger.info(`Created ${sensors.length} IoT sensors`);
    logger.info(`Created ${sampleCropAnalyses.length} crop analyses`);

  } catch (error) {
    logger.error('Error seeding Phase 2 data: %s', (error as Error).message);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

function generateSampleReadings(sensorType: string) {
  const readings = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    let value: number;
    let unit: string;
    let metric: string;
    
    switch (sensorType) {
      case 'soil':
        value = Math.floor(Math.random() * 30) + 35; // 35-65%
        unit = '%';
        metric = 'soil_moisture';
        break;
      case 'weather':
        value = Math.floor(Math.random() * 15) + 25; // 25-40°C
        unit = '°C';
        metric = 'temperature';
        break;
      case 'crop':
        value = Math.floor(Math.random() * 20) + 75; // 75-95%
        unit = '%';
        metric = 'crop_health';
        break;
      default:
        value = Math.floor(Math.random() * 50) + 50;
        unit = 'units';
        metric = 'general';
    }
    
    readings.push({
      timestamp,
      value,
      unit,
      metric,
      quality: value > 80 ? 'excellent' : value > 60 ? 'good' : 'fair'
    });
  }
  
  return readings;
}

if (require.main === module) {
  seedPhase2Data();
}

export default seedPhase2Data;

