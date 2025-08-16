import { weatherService, LocationCoordinates } from '../../src/services/weather.service';
import { WeatherData } from '../../src/models/weather.model';
import mongoose from 'mongoose';

// Mock axios
jest.mock('axios');
const mockedAxios = jest.mocked(require('axios'));

// Mock WeatherData model
jest.mock('../../src/models/weather.model');
const mockedWeatherData = WeatherData as jest.Mocked<typeof WeatherData>;

describe('WeatherService', () => {
  let mockLocation: LocationCoordinates;

  beforeEach(() => {
    mockLocation = {
      lat: 9.0820,
      lng: 8.6753,
      city: 'Jos',
      state: 'Plateau',
      country: 'Nigeria'
    };

    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.OPENWEATHER_API_KEY = 'test-api-key';
    process.env.AGROMONITORING_API_KEY = 'test-agro-key';
  });

  afterEach(() => {
    delete process.env.OPENWEATHER_API_KEY;
    delete process.env.AGROMONITORING_API_KEY;
  });

  describe('getCurrentWeather', () => {
    it('should return existing weather data if recent', async () => {
      const mockExistingData = {
        toObject: jest.fn().mockReturnValue({
          location: mockLocation,
          current: { temperature: 25, humidity: 60 },
          metadata: { lastUpdated: new Date() }
        })
      };

      mockedWeatherData.findOne.mockResolvedValue(mockExistingData as any);

      const result = await weatherService.getCurrentWeather(mockLocation);

      expect(mockedWeatherData.findOne).toHaveBeenCalledWith({
        'location.lat': mockLocation.lat,
        'location.lng': mockLocation.lng,
        'metadata.lastUpdated': { $gte: expect.any(Date) }
      });
      expect(result).toEqual(mockExistingData.toObject());
    });

    it('should fetch new weather data if none exists', async () => {
      // Mock no existing data
      mockedWeatherData.findOne.mockResolvedValue(null);

      // Mock OpenWeather API responses
      const mockWeatherResponse = {
        data: {
          main: {
            temp: 25,
            humidity: 60,
            pressure: 1013,
            feels_like: 26
          },
          wind: { speed: 5, deg: 180 },
          visibility: 10000,
          clouds: { all: 20 },
          weather: [{ main: 'Clear', icon: '01d' }]
        }
      };

      const mockForecastResponse = {
        data: {
          list: [
            {
              dt: Date.now() / 1000,
              main: { temp_max: 28, temp_min: 22, humidity: 65 },
              wind: { speed: 6 },
              pop: 0.1,
              weather: [{ main: 'Clouds', icon: '02d' }]
            }
          ]
        }
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockWeatherResponse)
        .mockResolvedValueOnce(mockForecastResponse);

      // Mock database save
      const mockSavedData = {
        toObject: jest.fn().mockReturnValue({
          location: mockLocation,
          current: { temperature: 25, humidity: 60 },
          metadata: { lastUpdated: new Date() }
        })
      };

      mockedWeatherData.findOneAndUpdate.mockResolvedValue(mockSavedData as any);

      const result = await weatherService.getCurrentWeather(mockLocation);

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(mockedWeatherData.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockSavedData.toObject());
    });

    it('should handle API errors gracefully', async () => {
      mockedWeatherData.findOne.mockResolvedValue(null);
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(weatherService.getCurrentWeather(mockLocation))
        .rejects.toThrow('Failed to fetch weather data');
    });
  });

  describe('getWeatherForecast', () => {
    it('should return forecast data for specified days', async () => {
      const mockWeatherData = {
        location: mockLocation,
        forecast: [
          { date: new Date(), highTemp: 28, lowTemp: 22 },
          { date: new Date(), highTemp: 29, lowTemp: 23 }
        ],
        metadata: { lastUpdated: new Date() }
      };

      jest.spyOn(weatherService, 'getCurrentWeather').mockResolvedValue(mockWeatherData as any);

      const result = await weatherService.getWeatherForecast(mockLocation, 2);

      expect(result.forecast).toHaveLength(2);
      expect(result.location).toEqual(mockLocation);
    });
  });

  describe('getAgriculturalInsights', () => {
    it('should return agricultural insights', async () => {
      const mockWeatherData = {
        agricultural: {
          soilMoisture: 75,
          soilTemperature: 25,
          growingDegreeDays: 15,
          frostRisk: 'low' as const,
          droughtIndex: 30,
          pestRisk: 'medium' as const,
          plantingRecommendation: 'Optimal conditions for most crops',
          irrigationAdvice: 'Normal conditions. Follow standard irrigation schedule.'
        }
      };

      jest.spyOn(weatherService, 'getCurrentWeather').mockResolvedValue(mockWeatherData as any);

      const result = await weatherService.getAgriculturalInsights(mockLocation);

      expect(result.soilMoisture).toBe(75);
      expect(result.frostRisk).toBe('low');
      expect(result.plantingRecommendation).toContain('Optimal conditions');
    });
  });

  describe('getWeatherAlerts', () => {
    it('should return weather alerts', async () => {
      const mockWeatherData = {
        alerts: [
          {
            type: 'weather',
            severity: 'high',
            title: 'Frost Warning',
            description: 'Temperatures below 5°C detected',
            startTime: new Date(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            affectedCrops: ['Tomatoes', 'Peppers']
          }
        ]
      };

      jest.spyOn(weatherService, 'getCurrentWeather').mockResolvedValue(mockWeatherData as any);

      const result = await weatherService.getWeatherAlerts(mockLocation);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('high');
      expect(result[0].affectedCrops).toContain('Tomatoes');
    });
  });

  describe('getHistoricalWeather', () => {
    it('should return historical weather data', async () => {
      const mockHistoricalData = [
        {
          toObject: jest.fn().mockReturnValue({
            location: mockLocation,
            current: { temperature: 24, humidity: 58 },
            createdAt: new Date('2024-01-01')
          })
        }
      ];

      mockedWeatherData.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockHistoricalData)
      } as any);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await weatherService.getHistoricalWeather(mockLocation, startDate, endDate);

      expect(mockedWeatherData.find).toHaveBeenCalledWith({
        'location.lat': mockLocation.lat,
        'location.lng': mockLocation.lng,
        createdAt: { $gte: startDate, $lte: endDate }
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getWeatherStatistics', () => {
    it('should return weather statistics for a region', async () => {
      const mockStats = [{
        avgTemperature: 25.5,
        avgHumidity: 65,
        maxTemperature: 32,
        minTemperature: 18,
        totalAlerts: 5,
        highRiskAlerts: 2
      }];

      mockedWeatherData.aggregate.mockResolvedValue(mockStats);

      const result = await weatherService.getWeatherStatistics('Plateau');

      expect(mockedWeatherData.aggregate).toHaveBeenCalledWith([
        { $match: { 'location.state': 'Plateau' } },
        {
          $group: {
            _id: null,
            avgTemperature: { $avg: '$current.temperature' },
            avgHumidity: { $avg: '$current.humidity' },
            maxTemperature: { $max: '$current.temperature' },
            minTemperature: { $min: '$current.temperature' },
            totalAlerts: { $sum: { $size: '$alerts' } },
            highRiskAlerts: {
              $sum: {
                $size: {
                  $filter: {
                    input: '$alerts',
                    cond: { $eq: ['$$this.severity', 'high'] }
                  }
                }
              }
            }
          }
        }
      ]);
      expect(result).toEqual(mockStats[0]);
    });

    it('should return null if no data found', async () => {
      mockedWeatherData.aggregate.mockResolvedValue([]);

      const result = await weatherService.getWeatherStatistics('Unknown');

      expect(result).toBeNull();
    });
  });

  describe('generateAgriculturalInsights', () => {
    it('should generate correct frost risk assessment', async () => {
      const mockWeatherData = {
        main: { temp: 3, humidity: 70, pressure: 1013 },
        wind: { speed: 5, deg: 180 }
      };

      const result = await (weatherService as any).generateAgriculturalInsights(mockWeatherData, mockLocation);

      expect(result.frostRisk).toBe('medium');
    });

    it('should generate correct pest risk assessment', async () => {
      const mockWeatherData = {
        main: { temp: 28, humidity: 75, pressure: 1013 },
        wind: { speed: 5, deg: 180 }
      };

      const result = await (weatherService as any).generateAgriculturalInsights(mockWeatherData, mockLocation);

      expect(result.pestRisk).toBe('high');
    });
  });

  describe('generateWeatherAlerts', () => {
    it('should generate frost warning for low temperatures', async () => {
      const mockWeatherData = {
        main: { temp: 3, humidity: 70 },
        wind: { speed: 5 }
      };

      const result = await (weatherService as any).generateWeatherAlerts(mockWeatherData, mockLocation);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('weather');
      expect(result[0].severity).toBe('high');
      expect(result[0].title).toBe('Frost Warning');
    });

    it('should generate heat stress warning for high temperatures', async () => {
      const mockWeatherData = {
        main: { temp: 37, humidity: 60 },
        wind: { speed: 5 }
      };

      const result = await (weatherService as any).generateWeatherAlerts(mockWeatherData, mockLocation);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('weather');
      expect(result[0].severity).toBe('medium');
      expect(result[0].title).toBe('Heat Stress Warning');
    });
  });

  describe('processForecastData', () => {
    it('should process forecast data correctly', () => {
      const mockForecastList = [
        {
          dt: Date.now() / 1000,
          main: { temp_max: 28, temp_min: 22, humidity: 65 },
          wind: { speed: 6 },
          pop: 0.1,
          weather: [{ main: 'Clouds', icon: '02d' }]
        }
      ];

      const result = (weatherService as any).processForecastData(mockForecastList);

      expect(result).toHaveLength(1);
      expect(result[0].highTemp).toBe(28);
      expect(result[0].lowTemp).toBe(22);
      expect(result[0].precipitation).toBe(10); // 0.1 * 100
    });
  });

  describe('getWindDirection', () => {
    it('should convert degrees to cardinal directions', () => {
      expect((weatherService as any).getWindDirection(0)).toBe('N');
      expect((weatherService as any).getWindDirection(90)).toBe('E');
      expect((weatherService as any).getWindDirection(180)).toBe('S');
      expect((weatherService as any).getWindDirection(270)).toBe('W');
      expect((weatherService as any).getWindDirection(45)).toBe('NE');
    });
  });
});
