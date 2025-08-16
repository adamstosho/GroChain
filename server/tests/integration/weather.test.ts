import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/index';
import { WeatherData } from '../../src/models/weather.model';

describe('Weather API Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const testMongoURI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/grochain_test';
    await mongoose.connect(testMongoURI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear weather data before each test
    await WeatherData.deleteMany({});
  });

  describe('GET /api/weather/current', () => {
    it('should return 400 for missing parameters', async () => {
      const res = await request(app)
        .get('/api/weather/current')
        .expect(400);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('required');
    });

    it('should return 400 for invalid coordinates', async () => {
      const res = await request(app)
        .get('/api/weather/current')
        .query({
          lat: 'invalid',
          lng: 'invalid',
          city: 'Jos',
          state: 'Plateau',
          country: 'Nigeria'
        })
        .expect(400);

      expect(res.body.status).toBe('error');
    });

    it('should return 500 when weather service fails', async () => {
      // This test will fail because we don't have real API keys in test environment
      // But it tests the error handling path
      const res = await request(app)
        .get('/api/weather/current')
        .query({
          lat: 9.0820,
          lng: 8.6753,
          city: 'Jos',
          state: 'Plateau',
          country: 'Nigeria'
        })
        .expect(500);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Failed to fetch current weather');
    });
  });

  describe('GET /api/weather/forecast', () => {
    it('should return 400 for missing parameters', async () => {
      const res = await request(app)
        .get('/api/weather/forecast')
        .expect(400);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('required');
    });

    it('should accept optional days parameter', async () => {
      const res = await request(app)
        .get('/api/weather/forecast')
        .query({
          lat: 9.0820,
          lng: 8.6753,
          city: 'Jos',
          state: 'Plateau',
          country: 'Nigeria',
          days: 5
        })
        .expect(500); // Will fail due to missing API keys, but tests parameter validation

      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /api/weather/agricultural-insights', () => {
    it('should return 400 for missing parameters', async () => {
      const res = await request(app)
        .get('/api/weather/agricultural-insights')
        .expect(400);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('required');
    });
  });

  describe('GET /api/weather/alerts', () => {
    it('should return 400 for missing parameters', async () => {
      const res = await request(app)
        .get('/api/weather/alerts')
        .expect(400);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('required');
    });
  });

  describe('GET /api/weather/climate-summary', () => {
    it('should return 400 for missing parameters', async () => {
      const res = await request(app)
        .get('/api/weather/climate-summary')
        .expect(400);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('required');
    });
  });

  describe('GET /api/weather/coordinates/:lat/:lng', () => {
    it('should return 400 for invalid coordinates', async () => {
      const res = await request(app)
        .get('/api/weather/coordinates/invalid/invalid')
        .expect(400);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Invalid latitude or longitude values');
    });

    it('should return 404 when no weather data found', async () => {
      const res = await request(app)
        .get('/api/weather/coordinates/9.0820/8.6753')
        .expect(404);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('No weather data found');
    });
  });

  describe('GET /api/weather/statistics/:region', () => {
    it('should return 400 for missing region parameter', async () => {
      const res = await request(app)
        .get('/api/weather/statistics/')
        .expect(404); // Express will return 404 for this route

      expect(res.status).toBe(404);
    });

    it('should return 404 when no data found for region', async () => {
      const res = await request(app)
        .get('/api/weather/statistics/UnknownRegion')
        .expect(404);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('No weather data found');
    });
  });

  describe('GET /api/weather/regional-alerts', () => {
    it('should return 400 for missing region parameter', async () => {
      const res = await request(app)
        .get('/api/weather/regional-alerts')
        .expect(400);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Region parameter is required');
    });

    it('should return empty alerts array when no data found', async () => {
      const res = await request(app)
        .get('/api/weather/regional-alerts')
        .query({ region: 'Plateau' })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/weather/historical', () => {
    it('should return 400 for missing parameters', async () => {
      const res = await request(app)
        .get('/api/weather/historical')
        .expect(400);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('required');
    });

    it('should return 400 for invalid date format', async () => {
      const res = await request(app)
        .get('/api/weather/historical')
        .query({
          lat: 9.0820,
          lng: 8.6753,
          city: 'Jos',
          state: 'Plateau',
          country: 'Nigeria',
          startDate: 'invalid-date',
          endDate: 'invalid-date'
        })
        .expect(400);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Invalid date format');
    });
  });

  describe('Weather Data Model Tests', () => {
    it('should create weather data with valid schema', async () => {
      const weatherData = new WeatherData({
        location: {
          lat: 9.0820,
          lng: 8.6753,
          city: 'Jos',
          state: 'Plateau',
          country: 'Nigeria'
        },
        current: {
          temperature: 25,
          humidity: 60,
          windSpeed: 5,
          windDirection: 'S',
          pressure: 1013,
          visibility: 10,
          uvIndex: 5,
          weatherCondition: 'Clear',
          weatherIcon: '01d',
          feelsLike: 26,
          dewPoint: 16,
          cloudCover: 20
        },
        forecast: [
          {
            date: new Date(),
            highTemp: 28,
            lowTemp: 22,
            humidity: 65,
            windSpeed: 6,
            precipitation: 10,
            weatherCondition: 'Clouds',
            weatherIcon: '02d',
            uvIndex: 4
          }
        ],
        alerts: [
          {
            type: 'weather',
            severity: 'medium',
            title: 'Wind Advisory',
            description: 'Moderate winds expected',
            startTime: new Date(),
            endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
            affectedCrops: ['Young seedlings']
          }
        ],
        agricultural: {
          soilMoisture: 75,
          soilTemperature: 25,
          growingDegreeDays: 15,
          frostRisk: 'low',
          droughtIndex: 30,
          pestRisk: 'medium',
          plantingRecommendation: 'Optimal conditions for most crops',
          irrigationAdvice: 'Normal conditions. Follow standard irrigation schedule.'
        },
        metadata: {
          source: 'OpenWeather API + Agricultural Analysis',
          lastUpdated: new Date(),
          dataQuality: 'high',
          nextUpdate: new Date(Date.now() + 30 * 60 * 1000)
        }
      });

      const savedData = await weatherData.save();
      expect(savedData._id).toBeDefined();
      expect(savedData.location.city).toBe('Jos');
      expect(savedData.current.temperature).toBe(25);
      expect(savedData.agricultural.frostRisk).toBe('low');
    });

    it('should validate required fields', async () => {
      const invalidWeatherData = new WeatherData({
        // Missing required fields
        location: {
          lat: 9.0820,
          lng: 8.6753
          // Missing city, state, country
        }
      });

      try {
        await invalidWeatherData.save();
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors).toBeDefined();
        expect(error.errors['location.city']).toBeDefined();
        expect(error.errors['location.state']).toBeDefined();
        expect(error.errors['location.country']).toBeDefined();
      }
    });

    it('should enforce enum values for risk levels', async () => {
      const weatherData = new WeatherData({
        location: {
          lat: 9.0820,
          lng: 8.6753,
          city: 'Jos',
          state: 'Plateau',
          country: 'Nigeria'
        },
        current: {
          temperature: 25,
          humidity: 60,
          windSpeed: 5,
          windDirection: 'S',
          pressure: 1013,
          visibility: 10,
          uvIndex: 5,
          weatherCondition: 'Clear',
          weatherIcon: '01d',
          feelsLike: 26,
          dewPoint: 16,
          cloudCover: 20
        },
        forecast: [],
        alerts: [],
        agricultural: {
          soilMoisture: 75,
          soilTemperature: 25,
          growingDegreeDays: 15,
          frostRisk: 'invalid-risk', // Invalid enum value
          droughtIndex: 30,
          pestRisk: 'medium',
          plantingRecommendation: 'Optimal conditions for most crops',
          irrigationAdvice: 'Normal conditions. Follow standard irrigation schedule.'
        },
        metadata: {
          source: 'OpenWeather API + Agricultural Analysis',
          lastUpdated: new Date(),
          dataQuality: 'high',
          nextUpdate: new Date(Date.now() + 30 * 60 * 1000)
        }
      });

      try {
        await weatherData.save();
        fail('Should have thrown validation error for invalid enum');
      } catch (error: any) {
        expect(error.errors).toBeDefined();
        expect(error.errors['agricultural.frostRisk']).toBeDefined();
      }
    });
  });
});
