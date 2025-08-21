import axios from 'axios';
import { WeatherData, IWeatherData } from '../models/weather.model';
import moment from 'moment';

export interface WeatherAPIConfig {
  openWeatherApiKey: string;
  openWeatherBaseUrl: string;
  agromonitoringApiKey: string;
  agromonitoringBaseUrl: string;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
}

export interface AgriculturalInsights {
  soilMoisture: number;
  soilTemperature: number;
  growingDegreeDays: number;
  frostRisk: 'low' | 'medium' | 'high';
  droughtIndex: number;
  pestRisk: 'low' | 'medium' | 'high';
  plantingRecommendation: string;
  irrigationAdvice: string;
}

export class WeatherService {
  private config: WeatherAPIConfig;
  private _initialized = false;

  constructor() {
    this.config = {
      openWeatherApiKey: '',
      openWeatherBaseUrl: 'https://api.openweathermap.org/data/2.5',
      agromonitoringApiKey: '',
      agromonitoringBaseUrl: 'http://api.agromonitoring.com/agro/1.0'
    };
  }

  private initialize() {
    if (this._initialized) return;
    
    this.config = {
      openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
      openWeatherBaseUrl: 'https://api.openweathermap.org/data/2.5',
      agromonitoringApiKey: process.env.AGROMONITORING_API_KEY || '',
      agromonitoringBaseUrl: 'http://api.agromonitoring.com/agro/1.0'
    };
    
    // Debug: Log configuration
    console.log('🌤️ Weather Service Configuration:');
    console.log('OpenWeather API Key:', this.config.openWeatherApiKey ? '✅ Configured' : '❌ Not configured');
    console.log('OpenWeather Base URL:', this.config.openWeatherBaseUrl);
    console.log('AgroMonitoring API Key:', this.config.agromonitoringApiKey ? '✅ Configured' : '❌ Not configured');
    console.log('Environment OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY ? '✅ Set' : '❌ Not set');
    
    this._initialized = true;
  }

  /**
   * Check if weather APIs are properly configured
   */
  private isWeatherAPIConfigured(): boolean {
    this.initialize(); // Ensure config is loaded
    const isConfigured = this.config.openWeatherApiKey.length > 0 && 
           this.config.openWeatherApiKey !== 'test_openweather_api_key_for_testing' &&
           this.config.openWeatherApiKey !== 'your_openweather_api_key_here';
    
    console.log('🔍 Weather API Configuration Check:');
    console.log('API Key Length:', this.config.openWeatherApiKey.length);
    console.log('API Key Value:', this.config.openWeatherApiKey);
    console.log('Is Configured:', isConfigured);
    
    return isConfigured;
  }

  /**
   * Get current weather data for a location
   */
  async getCurrentWeather(location: LocationCoordinates): Promise<IWeatherData> {
    this.initialize(); // Ensure config is loaded
    try {
      // Check if we have recent data in database
      const existingData = await WeatherData.findOne({
        'location.lat': location.lat,
        'location.lng': location.lng,
        'metadata.lastUpdated': { $gte: new Date(Date.now() - 30 * 60 * 1000) } // 30 minutes
      });

      if (existingData) {
        return existingData.toObject();
      }

      // If APIs are not configured, return mock data for testing
      if (!this.isWeatherAPIConfigured()) {
        console.log('Weather API not configured, returning mock data');
        return this.generateMockWeatherData(location);
      }

      console.log('Fetching weather data from OpenWeather API for:', location);

      // Fetch fresh data from OpenWeather API
      const weatherResponse = await axios.get(
        `${this.config.openWeatherBaseUrl}/weather`,
        {
          params: {
            lat: location.lat,
            lon: location.lng,
            appid: this.config.openWeatherApiKey,
            units: 'metric'
          }
        }
      );

      // Fetch forecast data
      const forecastResponse = await axios.get(
        `${this.config.openWeatherBaseUrl}/forecast`,
        {
          params: {
            lat: location.lat,
            lon: location.lng,
            appid: this.config.openWeatherApiKey,
            units: 'metric'
          }
        }
      );

      console.log('OpenWeather API responses received');

      // Generate agricultural insights
      const agriculturalInsights = await this.generateAgriculturalInsights(
        weatherResponse.data,
        location
      );

      // Create weather data object with correct structure
      const weatherData: Partial<IWeatherData> = {
        location,
        current: {
          temperature: weatherResponse.data.main.temp,
          humidity: weatherResponse.data.main.humidity,
          windSpeed: weatherResponse.data.wind.speed,
          windDirection: this.getWindDirection(weatherResponse.data.wind.deg),
          pressure: weatherResponse.data.main.pressure,
          visibility: weatherResponse.data.visibility / 1000, // Convert to km
          uvIndex: 0, // Will be calculated separately
          weatherCondition: weatherResponse.data.weather[0].description,
          weatherIcon: weatherResponse.data.weather[0].icon,
          feelsLike: weatherResponse.data.main.feels_like,
          dewPoint: weatherResponse.data.main.temp - ((100 - weatherResponse.data.main.humidity) / 5),
          cloudCover: weatherResponse.data.clouds.all
        },
        forecast: this.processForecastData(forecastResponse.data.list),
        alerts: await this.generateWeatherAlerts(weatherResponse.data, location),
        agricultural: agriculturalInsights,
        metadata: {
          source: 'OpenWeather API + Agricultural Analysis',
          lastUpdated: new Date(),
          dataQuality: 'high',
          nextUpdate: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        }
      };

      // Save to database
      const savedData = await WeatherData.findOneAndUpdate(
        { 'location.lat': location.lat, 'location.lng': location.lng },
        weatherData,
        { upsert: true, new: true }
      );

      console.log('Weather data saved to database');
      return savedData.toObject();
    } catch (error) {
      console.error('Error fetching weather data:', error);
      console.log('Falling back to mock data');
      return this.generateMockWeatherData(location);
    }
  }

  /**
   * Get weather forecast for a location
   */
  async getWeatherForecast(location: LocationCoordinates, days: number = 7): Promise<any> {
    try {
      const weatherData = await this.getCurrentWeather(location);
      return {
        location: weatherData.location,
        forecast: weatherData.forecast.slice(0, days),
        metadata: weatherData.metadata
      };
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  /**
   * Get agricultural insights for a location
   */
  async getAgriculturalInsights(location: LocationCoordinates): Promise<AgriculturalInsights> {
    try {
      const weatherData = await this.getCurrentWeather(location);
      return weatherData.agricultural;
    } catch (error) {
      console.error('Error fetching agricultural insights:', error);
      throw new Error('Failed to fetch agricultural insights');
    }
  }

  /**
   * Get weather alerts for a location
   */
  async getWeatherAlerts(location: LocationCoordinates): Promise<any[]> {
    try {
      const weatherData = await this.getCurrentWeather(location);
      return weatherData.alerts;
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      throw new Error('Failed to fetch weather alerts');
    }
  }

  /**
   * Get historical weather data for analysis
   */
  async getHistoricalWeather(
    location: LocationCoordinates,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      // This would typically integrate with a historical weather API
      // For now, we'll return data from our database
      const historicalData = await WeatherData.find({
        'location.lat': location.lat,
        'location.lng': location.lng,
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort({ createdAt: 1 });

      return historicalData.map(data => data.toObject());
    } catch (error) {
      console.error('Error fetching historical weather:', error);
      throw new Error('Failed to fetch historical weather data');
    }
  }

  /**
   * Generate agricultural insights based on weather data
   */
  private async generateAgriculturalInsights(weatherData: any, location: LocationCoordinates): Promise<AgriculturalInsights> {
    this.initialize(); // Ensure config is loaded
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const pressure = weatherData.main.pressure;

    // Calculate growing degree days (base temperature 10°C)
    const baseTemp = 10;
    const growingDegreeDays = Math.max(0, temp - baseTemp);

    // Calculate frost risk
    let frostRisk: 'low' | 'medium' | 'high' = 'low';
    if (temp < 2) frostRisk = 'high';
    else if (temp < 5) frostRisk = 'medium';

    // Calculate drought index (simplified)
    const droughtIndex = Math.max(0, 100 - humidity - (pressure - 1013) / 10);

    // Calculate pest risk based on temperature and humidity
    let pestRisk: 'low' | 'medium' | 'high' = 'low';
    if (temp > 25 && humidity > 70) pestRisk = 'high';
    else if (temp > 20 && humidity > 60) pestRisk = 'medium';

    // Generate planting recommendations
    const plantingRecommendation = this.generatePlantingRecommendation(temp, humidity, location);

    // Generate irrigation advice
    const irrigationAdvice = this.generateIrrigationAdvice(temp, humidity, droughtIndex);

    return {
      soilMoisture: Math.max(0, Math.min(100, 100 - droughtIndex)),
      soilTemperature: temp,
      growingDegreeDays,
      frostRisk,
      droughtIndex: Math.min(100, droughtIndex),
      pestRisk,
      plantingRecommendation,
      irrigationAdvice
    };
  }

  /**
   * Generate planting recommendations based on weather conditions
   */
  private generatePlantingRecommendation(temp: number, humidity: number, location: LocationCoordinates): string {
    this.initialize(); // Ensure config is loaded
    if (temp < 10) {
      return 'Temperature too low for most crops. Consider cold-hardy vegetables or wait for warmer weather.';
    } else if (temp < 15) {
      return 'Good conditions for early spring crops like peas, spinach, and lettuce.';
    } else if (temp < 25) {
      return 'Optimal conditions for most crops. Plant tomatoes, peppers, beans, and corn.';
    } else if (temp < 30) {
      return 'Warm conditions suitable for heat-loving crops like okra, sweet potatoes, and melons.';
    } else {
      return 'High temperatures may stress plants. Ensure adequate irrigation and consider shade structures.';
    }
  }

  /**
   * Generate irrigation advice based on weather conditions
   */
  private generateIrrigationAdvice(temp: number, humidity: number, droughtIndex: number): string {
    this.initialize(); // Ensure config is loaded
    if (droughtIndex > 70) {
      return 'High drought risk. Increase irrigation frequency and consider drought-resistant crops.';
    } else if (droughtIndex > 40) {
      return 'Moderate drought conditions. Maintain regular irrigation schedule.';
    } else if (humidity > 80) {
      return 'High humidity. Reduce irrigation to prevent fungal diseases.';
    } else if (temp > 30) {
      return 'High temperatures. Increase irrigation frequency, preferably in early morning or evening.';
    } else {
      return 'Normal conditions. Follow standard irrigation schedule.';
    }
  }

  /**
   * Generate weather alerts based on conditions
   */
  private async generateWeatherAlerts(weatherData: any, location: LocationCoordinates): Promise<any[]> {
    this.initialize(); // Ensure config is loaded
    const alerts: any[] = [];
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;

    // Temperature alerts
    if (temp < 5) {
      alerts.push({
        type: 'weather',
        severity: 'high',
        title: 'Frost Warning',
        description: 'Temperatures below 5°C detected. Protect sensitive crops from frost damage.',
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        affectedCrops: ['Tomatoes', 'Peppers', 'Beans', 'Corn']
      });
    }

    if (temp > 35) {
      alerts.push({
        type: 'weather',
        severity: 'medium',
        title: 'Heat Stress Warning',
        description: 'High temperatures detected. Ensure adequate irrigation and consider shade protection.',
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        affectedCrops: ['Lettuce', 'Spinach', 'Cool-season crops']
      });
    }

    // Wind alerts
    if (windSpeed > 20) {
      alerts.push({
        type: 'weather',
        severity: 'medium',
        title: 'High Wind Warning',
        description: 'Strong winds detected. Secure structures and protect young plants.',
        startTime: new Date(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        affectedCrops: ['Young seedlings', 'Tall crops']
      });
    }

    // Humidity alerts
    if (humidity > 85) {
      alerts.push({
        type: 'agricultural',
        severity: 'medium',
        title: 'High Humidity Alert',
        description: 'High humidity conditions. Monitor for fungal diseases and reduce irrigation.',
        startTime: new Date(),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        affectedCrops: ['Tomatoes', 'Cucumbers', 'Squash']
      });
    }

    return alerts;
  }

  /**
   * Process forecast data from API response
   */
  private processForecastData(forecastList: any[]): any[] {
    this.initialize(); // Ensure config is loaded
    const dailyForecasts = new Map<string, any>();

    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyForecasts.has(dateKey)) {
        dailyForecasts.set(dateKey, {
          date,
          highTemp: item.main.temp_max,
          lowTemp: item.main.temp_min,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
          precipitation: item.pop * 100, // Probability of precipitation
          weatherCondition: item.weather[0].main,
          weatherIcon: item.weather[0].icon,
          uvIndex: 0
        });
      } else {
        const existing = dailyForecasts.get(dateKey);
        existing.highTemp = Math.max(existing.highTemp, item.main.temp_max);
        existing.lowTemp = Math.min(existing.lowTemp, item.main.temp_min);
        existing.humidity = Math.round((existing.humidity + item.main.humidity) / 2);
        existing.windSpeed = Math.round((existing.windSpeed + item.wind.speed) / 2);
      }
    });

    return Array.from(dailyForecasts.values()).slice(0, 7); // 7-day forecast
  }

  /**
   * Convert wind direction degrees to cardinal directions
   */
  private getWindDirection(degrees: number): string {
    this.initialize(); // Ensure config is loaded
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * Get weather statistics for a region
   */
  async getWeatherStatistics(region: string): Promise<any> {
    this.initialize(); // Ensure config is loaded
    try {
      const stats = await WeatherData.aggregate([
        { $match: { 'location.state': region } },
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

      return stats[0] || null;
    } catch (error) {
      console.error('Error fetching weather statistics:', error);
      throw new Error('Failed to fetch weather statistics');
    }
  }

  /**
   * Generate mock weather data for testing
   */
  private generateMockWeatherData(location: LocationCoordinates): IWeatherData {
    this.initialize(); // Ensure config is loaded
    console.log('Generating mock weather data for location:', location);
    
    // Generate realistic Nigerian weather data
    const baseTemp = 25 + Math.random() * 8; // 25-33°C (typical Nigerian range)
    const baseHumidity = 60 + Math.random() * 30; // 60-90% (typical Nigerian humidity)
    
    return {
      location: location,
      current: {
        temperature: baseTemp,
        humidity: baseHumidity,
        windSpeed: 3 + Math.random() * 7, // 3-10 m/s
        windDirection: this.getWindDirection(Math.random() * 360),
        pressure: 1010 + Math.random() * 15, // 1010-1025 hPa
        visibility: 8000 + Math.random() * 7000, // 8-15 km
        uvIndex: 6 + Math.floor(Math.random() * 5), // 6-10 (high UV in Nigeria)
        weatherCondition: this.getNigerianWeatherCondition(),
        weatherIcon: this.getWeatherIcon(),
        feelsLike: baseTemp + (Math.random() * 4 - 2), // ±2°C from actual temp
        dewPoint: baseTemp - 5 + Math.random() * 10, // 5-15°C below temp
        cloudCover: 20 + Math.random() * 60 // 20-80%
      },
      forecast: this.generateNigerianForecast(),
      alerts: [],
      agricultural: {
        soilMoisture: 40 + Math.random() * 40, // 40-80%
        soilTemperature: baseTemp - 2 + Math.random() * 4, // 2-4°C below air temp
        growingDegreeDays: 15 + Math.random() * 10, // 15-25 GDD
        frostRisk: 'low' as const, // No frost risk in Nigeria
        droughtIndex: 20 + Math.random() * 40, // 20-60 (moderate to low drought)
        pestRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        plantingRecommendation: this.getPlantingRecommendation(),
        irrigationAdvice: this.getIrrigationAdvice()
      },
      metadata: {
        source: 'mock_data',
        lastUpdated: new Date(),
        dataQuality: 'medium' as const,
        nextUpdate: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }
    };
  }

  /**
   * Generate realistic Nigerian weather forecast
   */
  private generateNigerianForecast(): Array<{
    date: Date;
    highTemp: number;
    lowTemp: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    weatherCondition: string;
    weatherIcon: string;
    uvIndex: number;
  }> {
    this.initialize(); // Ensure config is loaded
    const forecast = [];
    const baseTemp = 25;
    
    for (let i = 1; i <= 7; i++) {
      const dayTemp = baseTemp + (Math.random() * 6 - 3); // ±3°C variation
      const nightTemp = dayTemp - 8 + Math.random() * 4; // 4-12°C cooler at night
      
      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        highTemp: dayTemp,
        lowTemp: nightTemp,
        humidity: 65 + Math.random() * 25, // 65-90%
        windSpeed: 2 + Math.random() * 8, // 2-10 m/s
        precipitation: Math.random() > 0.7 ? 10 + Math.random() * 40 : 0, // 30% chance of rain
        weatherCondition: this.getNigerianWeatherCondition(),
        weatherIcon: this.getWeatherIcon(),
        uvIndex: 5 + Math.floor(Math.random() * 6) // 5-10
      });
    }
    
    return forecast;
  }

  /**
   * Get realistic Nigerian weather conditions
   */
  private getNigerianWeatherCondition(): string {
    this.initialize(); // Ensure config is loaded
    const conditions = [
      'Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Moderate Rain',
      'Thunderstorm', 'Hazy', 'Misty', 'Clear'
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  /**
   * Get appropriate weather icon
   */
  private getWeatherIcon(): string {
    this.initialize(); // Ensure config is loaded
    const icons = ['01d', '02d', '03d', '04d', '09d', '10d', '11d', '50d'];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  /**
   * Get planting recommendation based on season
   */
  private getPlantingRecommendation(): string {
    this.initialize(); // Ensure config is loaded
    const month = new Date().getMonth();
    if (month >= 2 && month <= 5) {
      return 'Planting season for early crops like maize and vegetables';
    } else if (month >= 8 && month <= 10) {
      return 'Planting season for late crops like yam and cassava';
    } else {
      return 'Maintenance and harvesting season';
    }
  }

  /**
   * Get irrigation advice
   */
  private getIrrigationAdvice(): string {
    this.initialize(); // Ensure config is loaded
    const month = new Date().getMonth();
    if (month >= 5 && month <= 9) {
      return 'Rainy season - reduce irrigation, focus on drainage';
    } else {
      return 'Dry season - increase irrigation frequency';
    }
  }
}

export const weatherService = new WeatherService();
