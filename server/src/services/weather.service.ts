import axios from 'axios';
import { WeatherData, IWeatherData } from '../models/weather.model';

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

interface WeatherAPIConfig {
  openWeatherApiKey: string;
  openWeatherBaseUrl: string;
  fallbackApiUrl: string;
}

export class WeatherService {
  private config: WeatherAPIConfig;
  private _initialized = false;

  constructor() {
    this.config = {
      openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
      openWeatherBaseUrl: 'https://api.openweathermap.org/data/2.5',
      fallbackApiUrl: 'https://api.open-meteo.com/v1'
    };
  }

  private initialize() {
    if (this._initialized) return;
    
    console.log('🌤️ Weather Service Configuration:');
    console.log('OpenWeather API Key:', this.config.openWeatherApiKey ? '✅ Configured' : '❌ Not configured');
    console.log('OpenWeather Base URL:', this.config.openWeatherBaseUrl);
    console.log('Fallback API URL:', this.config.fallbackApiUrl);
    
    this._initialized = true;
  }

  /**
   * Check if OpenWeather API is properly configured
   */
  private isOpenWeatherConfigured(): boolean {
    this.initialize();
    return this.config.openWeatherApiKey.length > 0 && 
           this.config.openWeatherApiKey !== 'test_openweather_api_key_for_testing' &&
           this.config.openWeatherApiKey !== 'your_openweather_api_key_here';
  }

  /**
   * Get current weather data for a location
   */
  async getCurrentWeather(location: LocationCoordinates): Promise<IWeatherData> {
    this.initialize();
    
    try {
      // Check if we have recent data in database
      const existingData = await WeatherData.findOne({
        'location.lat': location.lat,
        'location.lng': location.lng,
        'metadata.lastUpdated': { $gte: new Date(Date.now() - 30 * 60 * 1000) } // 30 minutes
      });

      if (existingData) {
        console.log('Using cached weather data for:', location.city);
        return existingData.toObject();
      }

      // Try OpenWeather API first
      if (this.isOpenWeatherConfigured()) {
        try {
          console.log('Fetching weather data from OpenWeather API for:', location.city);
          const weatherData = await this.fetchFromOpenWeather(location);
          await this.saveWeatherData(weatherData);
          return weatherData;
        } catch (error) {
          console.log('OpenWeather API failed, trying fallback API:', error instanceof Error ? error.message : String(error));
        }
      }

      // Fallback to Open-Meteo API (free, no key required)
      console.log('Fetching weather data from fallback API for:', location.city);
      const weatherData = await this.fetchFromFallbackAPI(location);
      await this.saveWeatherData(weatherData);
      return weatherData;

    } catch (error) {
      console.error('All weather APIs failed, generating mock data:', error);
      return this.generateMockWeatherData(location);
    }
  }

  /**
   * Fetch weather data from OpenWeather API
   */
  private async fetchFromOpenWeather(location: LocationCoordinates): Promise<IWeatherData> {
    const response = await axios.get(`${this.config.openWeatherBaseUrl}/weather`, {
      params: {
        lat: location.lat,
        lon: location.lng,
        appid: this.config.openWeatherApiKey,
        units: 'metric'
      },
      timeout: 10000
    });

    const data = response.data;
    
    return {
      location: location,
      current: {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windDirection: this.degreesToDirection(data.wind.deg),
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: 0, // OpenWeather doesn't provide UV in free tier
        weatherCondition: data.weather[0].main,
        weatherIcon: data.weather[0].icon,
        feelsLike: data.main.feels_like,
        dewPoint: data.main.temp, // Approximate
        cloudCover: data.clouds.all
      },
      forecast: [], // Will be populated by getWeatherForecast
      alerts: [],
      agricultural: await this.generateAgriculturalInsights(data, location),
      metadata: {
        source: 'openweather_api',
        lastUpdated: new Date(),
        dataQuality: 'high',
        nextUpdate: new Date(Date.now() + 30 * 60 * 1000)
      }
    };
  }

  /**
   * Fetch weather data from Open-Meteo API (fallback)
   */
  private async fetchFromFallbackAPI(location: LocationCoordinates): Promise<IWeatherData> {
    const response = await axios.get(`${this.config.fallbackApiUrl}/forecast`, {
      params: {
        latitude: location.lat,
        longitude: location.lng,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover',
        hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code',
        timezone: 'auto'
      },
      timeout: 10000
    });

    const data = response.data;
    const current = data.current;
    
    return {
      location: location,
      current: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: this.degreesToDirection(current.wind_direction_10m),
        pressure: current.pressure_msl,
        visibility: 10, // Default visibility
        uvIndex: 0, // Not provided by this API
        weatherCondition: this.weatherCodeToCondition(current.weather_code),
        weatherIcon: this.weatherCodeToIcon(current.weather_code),
        feelsLike: current.temperature_2m, // Approximate
        dewPoint: current.temperature_2m, // Approximate
        cloudCover: current.cloud_cover
      },
      forecast: [], // Will be populated by getWeatherForecast
      alerts: [],
      agricultural: await this.generateAgriculturalInsights({
        main: {
          temp: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          pressure: current.pressure_msl
        }
      }, location),
      metadata: {
        source: 'openmeteo_api',
        lastUpdated: new Date(),
        dataQuality: 'medium',
        nextUpdate: new Date(Date.now() + 30 * 60 * 1000)
      }
    };
  }

  /**
   * Get weather forecast for a location
   */
  async getWeatherForecast(location: LocationCoordinates, days: number = 7): Promise<any> {
    try {
      // Try OpenWeather API first for forecast
      if (this.isOpenWeatherConfigured()) {
        try {
          const forecast = await this.fetchForecastFromOpenWeather(location, days);
          return {
            location: location,
            forecast: forecast,
            metadata: {
              source: 'openweather_api',
              lastUpdated: new Date(),
              dataQuality: 'high'
            }
          };
        } catch (error) {
          console.log('OpenWeather forecast failed, using fallback:', error instanceof Error ? error.message : String(error));
        }
      }

      // Fallback to Open-Meteo for forecast
      const forecast = await this.fetchForecastFromFallbackAPI(location, days);
      return {
        location: location,
        forecast: forecast,
        metadata: {
          source: 'openmeteo_api',
          lastUpdated: new Date(),
          dataQuality: 'medium'
        }
      };

    } catch (error) {
      console.error('Error fetching forecast:', error);
      // Return mock forecast as last resort
      return {
        location: location,
        forecast: this.generateNigerianForecast().slice(0, days),
        metadata: {
          source: 'mock_data',
          lastUpdated: new Date(),
          dataQuality: 'low'
        }
      };
    }
  }

  /**
   * Fetch forecast from OpenWeather API
   */
  private async fetchForecastFromOpenWeather(location: LocationCoordinates, days: number): Promise<any[]> {
    const response = await axios.get(`${this.config.openWeatherBaseUrl}/forecast`, {
      params: {
        lat: location.lat,
        lon: location.lng,
        appid: this.config.openWeatherApiKey,
        units: 'metric',
        cnt: days * 8 // 8 readings per day (3-hour intervals)
      },
      timeout: 10000
    });

    const data = response.data;
    const dailyData = this.groupForecastByDay(data.list);
    
    return dailyData.slice(0, days).map(day => ({
      date: new Date(day.dt * 1000),
      highTemp: day.main.temp_max,
      lowTemp: day.main.temp_min,
      humidity: day.main.humidity,
      windSpeed: day.wind.speed,
      precipitation: day.pop * 100, // Probability of precipitation
      weatherCondition: day.weather[0].main,
      weatherIcon: day.weather[0].icon,
      uvIndex: 0
    }));
  }

  /**
   * Fetch forecast from Open-Meteo API
   */
  private async fetchForecastFromFallbackAPI(location: LocationCoordinates, days: number): Promise<any[]> {
    const response = await axios.get(`${this.config.fallbackApiUrl}/forecast`, {
      params: {
        latitude: location.lat,
        longitude: location.lng,
        daily: 'temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,wind_speed_10m_max,precipitation_probability_max,weather_code',
        timezone: 'auto'
      },
      timeout: 10000
    });

    const data = response.data;
    const forecast = [];
    
    for (let i = 0; i < Math.min(days, data.daily.time.length); i++) {
      forecast.push({
        date: new Date(data.daily.time[i]),
        highTemp: data.daily.temperature_2m_max[i],
        lowTemp: data.daily.temperature_2m_min[i],
        humidity: data.daily.relative_humidity_2m_max[i],
        windSpeed: data.daily.wind_speed_10m_max[i],
        precipitation: data.daily.precipitation_probability_max[i],
        weatherCondition: this.weatherCodeToCondition(data.daily.weather_code[i]),
        weatherIcon: this.weatherCodeToIcon(data.daily.weather_code[i]),
        uvIndex: 0
      });
    }
    
    return forecast;
  }

  /**
   * Group OpenWeather forecast data by day
   */
  private groupForecastByDay(forecastList: any[]): any[] {
    const dailyData: { [key: string]: any } = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          dt: item.dt,
          main: { temp_max: item.main.temp, temp_min: item.main.temp },
          wind: { speed: item.wind.speed },
          weather: item.weather,
          pop: item.pop
        };
      } else {
        dailyData[date].main.temp_max = Math.max(dailyData[date].main.temp_max, item.main.temp);
        dailyData[date].main.temp_min = Math.min(dailyData[date].main.temp_min, item.main.temp);
        dailyData[date].wind.speed = Math.max(dailyData[date].wind.speed, item.wind.speed);
        dailyData[date].pop = Math.max(dailyData[date].pop, item.pop);
      }
    });
    
    return Object.values(dailyData);
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
      return this.generateMockAgriculturalInsights();
    }
  }

  /**
   * Get weather alerts for a location
   */
  async getWeatherAlerts(location: LocationCoordinates): Promise<any[]> {
    try {
      // OpenWeather doesn't provide alerts in free tier
      // Return empty array for now
      return [];
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return [];
    }
  }

  /**
   * Save weather data to database
   */
  private async saveWeatherData(weatherData: IWeatherData): Promise<void> {
    try {
      await WeatherData.findOneAndUpdate(
        {
          'location.lat': weatherData.location.lat,
          'location.lng': weatherData.location.lng
        },
        weatherData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error saving weather data:', error);
    }
  }

  /**
   * Generate agricultural insights based on weather data
   */
  private async generateAgriculturalInsights(weatherData: any, location: LocationCoordinates): Promise<AgriculturalInsights> {
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
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
    const irrigationAdvice = this.generateIrrigationAdvice(temp, humidity, pressure);

    return {
      soilMoisture: Math.max(0, Math.min(100, 80 - droughtIndex)),
      soilTemperature: temp - 2 + Math.random() * 4,
      growingDegreeDays,
      frostRisk,
      droughtIndex,
      pestRisk,
      plantingRecommendation,
      irrigationAdvice
    };
  }

  /**
   * Generate mock agricultural insights
   */
  private generateMockAgriculturalInsights(): AgriculturalInsights {
    return {
      soilMoisture: 60 + Math.random() * 30,
      soilTemperature: 25 + Math.random() * 8,
      growingDegreeDays: 15 + Math.random() * 10,
      frostRisk: 'low',
      droughtIndex: 30 + Math.random() * 40,
      pestRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      plantingRecommendation: 'Good conditions for most crops',
      irrigationAdvice: 'Moderate irrigation recommended'
    };
  }

  /**
   * Generate planting recommendations
   */
  private generatePlantingRecommendation(temp: number, humidity: number, location: LocationCoordinates): string {
    if (temp < 15) return 'Too cold for most crops. Wait for warmer weather.';
    if (temp > 35) return 'Too hot for most crops. Consider shade and extra irrigation.';
    if (humidity < 40) return 'Low humidity. Ensure adequate irrigation for new plantings.';
    if (humidity > 85) return 'High humidity. Monitor for fungal diseases.';
    
    return 'Optimal conditions for planting most crops.';
  }

  /**
   * Generate irrigation advice
   */
  private generateIrrigationAdvice(temp: number, humidity: number, pressure: number): string {
    if (humidity < 50) return 'Low humidity detected. Increase irrigation frequency.';
    if (temp > 30) return 'High temperature. Consider additional irrigation to prevent stress.';
    if (pressure < 1000) return 'Low pressure may indicate incoming weather. Reduce irrigation.';
    
    return 'Standard irrigation schedule recommended.';
  }

  /**
   * Convert degrees to wind direction
   */
  private degreesToDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * Convert weather code to condition
   */
  private weatherCodeToCondition(code: number): string {
    const conditions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return conditions[code] || 'Unknown';
  }

  /**
   * Convert weather code to icon
   */
  private weatherCodeToIcon(code: number): string {
    const icons: { [key: number]: string } = {
      0: '01d', // Clear sky
      1: '02d', // Mainly clear
      2: '03d', // Partly cloudy
      3: '04d', // Overcast
      45: '50d', // Foggy
      48: '50d', // Depositing rime fog
      51: '09d', // Light drizzle
      53: '09d', // Moderate drizzle
      55: '09d', // Dense drizzle
      61: '10d', // Slight rain
      63: '10d', // Moderate rain
      65: '10d', // Heavy rain
      71: '13d', // Slight snow
      73: '13d', // Moderate snow
      75: '13d', // Heavy snow
      77: '13d', // Snow grains
      80: '09d', // Slight rain showers
      81: '09d', // Moderate rain showers
      82: '09d', // Violent rain showers
      85: '13d', // Slight snow showers
      86: '13d', // Heavy snow showers
      95: '11d', // Thunderstorm
      96: '11d', // Thunderstorm with slight hail
      99: '11d'  // Thunderstorm with heavy hail
    };
    return icons[code] || '01d';
  }

  /**
   * Generate mock weather data as fallback
   */
  private generateMockWeatherData(location: LocationCoordinates): IWeatherData {
    console.log('Generating mock weather data for location:', location.city);
    
    const baseTemp = 25 + Math.random() * 8; // 25-33°C (typical Nigerian range)
    const baseHumidity = 60 + Math.random() * 30; // 60-90% (typical Nigerian humidity)
    
    return {
      location: location,
      current: {
        temperature: baseTemp,
        humidity: baseHumidity,
        windSpeed: 3 + Math.random() * 7,
        windDirection: this.getWindDirection(Math.random() * 360),
        pressure: 1010 + Math.random() * 15,
        visibility: 8000 + Math.random() * 7000,
        uvIndex: 6 + Math.floor(Math.random() * 5),
        weatherCondition: this.getNigerianWeatherCondition(),
        weatherIcon: this.getWeatherIcon(),
        feelsLike: baseTemp + (Math.random() * 4 - 2),
        dewPoint: baseTemp - 5 + Math.random() * 10,
        cloudCover: 20 + Math.random() * 60
      },
      forecast: this.generateNigerianForecast(),
      alerts: [],
      agricultural: {
        soilMoisture: 40 + Math.random() * 40,
        soilTemperature: baseTemp - 2 + Math.random() * 4,
        growingDegreeDays: 15 + Math.random() * 10,
        frostRisk: 'low',
        droughtIndex: 20 + Math.random() * 40,
        pestRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        plantingRecommendation: this.getPlantingRecommendation(),
        irrigationAdvice: this.getIrrigationAdvice()
      },
      metadata: {
        source: 'mock_data',
        lastUpdated: new Date(),
        dataQuality: 'low',
        nextUpdate: new Date(Date.now() + 30 * 60 * 1000)
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
    const forecast = [];
    const baseTemp = 25;
    
    for (let i = 1; i <= 7; i++) {
      const dayTemp = baseTemp + (Math.random() * 6 - 3);
      const nightTemp = dayTemp - 8 + Math.random() * 4;
      
      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        highTemp: dayTemp,
        lowTemp: nightTemp,
        humidity: 65 + Math.random() * 25,
        windSpeed: 2 + Math.random() * 8,
        precipitation: Math.random() > 0.7 ? 10 + Math.random() * 40 : 0,
        weatherCondition: this.getNigerianWeatherCondition(),
        weatherIcon: this.getWeatherIcon(),
        uvIndex: 5 + Math.floor(Math.random() * 6)
      });
    }
    
    return forecast;
  }

  /**
   * Get realistic Nigerian weather conditions
   */
  private getNigerianWeatherCondition(): string {
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
    const icons = ['01d', '02d', '03d', '04d', '09d', '10d', '11d', '13d', '50d'];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  /**
   * Get wind direction from degrees
   */
  private getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * Get planting recommendation
   */
  private getPlantingRecommendation(): string {
    const recommendations = [
      'Good conditions for most crops',
      'Consider drought-resistant varieties',
      'Monitor soil moisture levels',
      'Optimal planting window'
    ];
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  }

  /**
   * Get irrigation advice
   */
  private getIrrigationAdvice(): string {
    const advice = [
      'Standard irrigation schedule',
      'Increase irrigation frequency',
      'Reduce irrigation to prevent waterlogging',
      'Monitor soil moisture closely'
    ];
    return advice[Math.floor(Math.random() * advice.length)];
  }

  /**
   * Get historical weather data for a location
   */
  async getHistoricalWeather(location: LocationCoordinates, start: Date, end: Date): Promise<any> {
    try {
      // For now, return mock historical data
      // In a real implementation, this would query a weather database or historical API
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      const historicalData = [];
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        historicalData.push({
          date: date.toISOString().split('T')[0],
          temperature: {
            min: 20 + Math.random() * 10,
            max: 30 + Math.random() * 15,
            average: 25 + Math.random() * 8
          },
          humidity: 60 + Math.random() * 30,
          precipitation: Math.random() > 0.7 ? 5 + Math.random() * 25 : 0,
          windSpeed: 2 + Math.random() * 8,
          weatherCondition: this.getNigerianWeatherCondition()
        });
      }
      
      return {
        location,
        period: { start, end },
        data: historicalData,
        summary: {
          averageTemperature: historicalData.reduce((sum, day) => sum + day.temperature.average, 0) / historicalData.length,
          totalPrecipitation: historicalData.reduce((sum, day) => sum + day.precipitation, 0),
          averageHumidity: historicalData.reduce((sum, day) => sum + day.humidity, 0) / historicalData.length
        }
      };
    } catch (error) {
      console.error('Error generating historical weather data:', error);
      throw new Error('Failed to generate historical weather data');
    }
  }

  /**
   * Get weather statistics for a region
   */
  async getWeatherStatistics(region: string): Promise<any> {
    try {
      // For now, return mock statistics
      // In a real implementation, this would aggregate data from the weather database
      return {
        region,
        period: 'Last 30 days',
        statistics: {
          temperature: {
            average: 26.5,
            min: 18.2,
            max: 35.8,
            trend: 'stable'
          },
          precipitation: {
            total: 45.2,
            average: 1.5,
            days: 12,
            trend: 'decreasing'
          },
          humidity: {
            average: 72.3,
            min: 45.1,
            max: 89.7,
            trend: 'stable'
          },
          windSpeed: {
            average: 4.2,
            max: 12.8,
            trend: 'stable'
          }
        },
        agriculturalInsights: {
          growingSeason: 'active',
          soilMoisture: 'adequate',
          pestRisk: 'low',
          recommendations: [
            'Continue regular irrigation schedule',
            'Monitor for early signs of pest activity',
            'Consider planting drought-resistant varieties'
          ]
        }
      };
    } catch (error) {
      console.error('Error generating weather statistics:', error);
      throw new Error('Failed to generate weather statistics');
    }
  }
}

export const weatherService = new WeatherService();
