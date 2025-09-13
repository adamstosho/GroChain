const fetch = require('node-fetch')
const WeatherData = require('../models/weather.model')
const Notification = require('../models/notification.model')
const User = require('../models/user.model')
const SMSUtil = require('../utils/sms.util')

class WeatherService {
  constructor() {
    this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY
    this.agroMonitoringApiKey = process.env.AGROMONITORING_API_KEY
    this.weatherBaseUrl = process.env.WEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5'
    this.smsUtil = new SMSUtil()
  }

  // Get comprehensive weather data from multiple sources
  async getComprehensiveWeatherData(lat, lng, city, state, country) {
    try {
      const [currentWeather, forecast, agriculturalData] = await Promise.all([
        this.getCurrentWeatherData(lat, lng),
        this.getWeatherForecast(lat, lng),
        this.getAgriculturalWeatherData(lat, lng)
      ])

      // Generate weather alerts
      const alerts = this.generateWeatherAlerts(currentWeather, forecast, agriculturalData)

      // Create comprehensive weather object
      const weatherData = {
        location: {
          lat: Number(lat),
          lng: Number(lng),
          city: city || 'Unknown',
          state: state || 'Unknown',
          country: country || 'Nigeria'
        },
        current: {
          temperature: currentWeather.main?.temp || 0,
          humidity: currentWeather.main?.humidity || 0,
          windSpeed: currentWeather.wind?.speed || 0,
          windDirection: this.getWindDirection(currentWeather.wind?.deg || 0),
          pressure: currentWeather.main?.pressure || 0,
          visibility: currentWeather.visibility || 0,
          uvIndex: currentWeather.uvi || 0,
          weatherCondition: currentWeather.weather?.[0]?.main || 'Clear',
          weatherDescription: currentWeather.weather?.[0]?.description || 'Clear sky',
          weatherIcon: currentWeather.weather?.[0]?.icon || '01d',
          feelsLike: currentWeather.main?.feels_like || 0,
          dewPoint: this.calculateDewPoint(currentWeather.main?.temp || 0, currentWeather.main?.humidity || 0),
          cloudCover: currentWeather.clouds?.all || 0,
          precipitation: currentWeather.rain?.['1h'] || currentWeather.snow?.['1h'] || 0
        },
        forecast: this.processForecastData(forecast),
        alerts: alerts,
        agricultural: this.generateAgriculturalInsights(currentWeather, forecast, agriculturalData),
        metadata: {
          source: 'OpenWeather + AgroMonitoring',
          lastUpdated: new Date(),
          dataQuality: 'high',
          nextUpdate: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        }
      }

      // Store in database
      await this.storeWeatherData(weatherData)

      return weatherData
    } catch (error) {
      console.error('Error getting comprehensive weather data:', error)
      throw error
    }
  }

  // Get current weather from OpenWeather API
  async getCurrentWeatherData(lat, lng) {
    if (!this.openWeatherApiKey) {
      throw new Error('OpenWeather API key not configured')
    }

    const url = `${this.weatherBaseUrl}/weather?lat=${lat}&lon=${lng}&appid=${this.openWeatherApiKey}&units=metric`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`)
    }

    return await response.json()
  }

  // Get weather forecast from OpenWeather API
  async getWeatherForecast(lat, lng, days = 5) {
    if (!this.openWeatherApiKey) {
      throw new Error('OpenWeather API key not configured')
    }

    const url = `${this.weatherBaseUrl}/forecast?lat=${lat}&lon=${lng}&appid=${this.openWeatherApiKey}&units=metric&cnt=${days * 8}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`)
    }

    return await response.json()
  }

  // Get agricultural weather data from AgroMonitoring API
  async getAgriculturalWeatherData(lat, lng) {
    if (!this.agroMonitoringApiKey) {
      console.warn('AgroMonitoring API key not configured, using basic calculations')
      return null
    }

    try {
      // Get soil moisture and temperature data
      const url = `http://api.agromonitoring.com/agro/1.0/soil?lat=${lat}&lon=${lng}&appid=${this.agroMonitoringApiKey}`
      const response = await fetch(url)
      
      if (!response.ok) {
        console.warn('AgroMonitoring API error:', response.status)
        return null
      }

      return await response.json()
    } catch (error) {
      console.warn('AgroMonitoring API error:', error.message)
      return null
    }
  }

  // Generate weather alerts based on current conditions
  generateWeatherAlerts(current, forecast, agriculturalData) {
    const alerts = []
    const temp = current.main?.temp || 0
    const humidity = current.main?.humidity || 0
    const windSpeed = current.wind?.speed || 0
    const precipitation = current.rain?.['1h'] || current.snow?.['1h'] || 0

    // Temperature alerts
    if (temp > 35) {
      alerts.push({
        type: 'weather',
        severity: 'high',
        title: 'Heat Warning',
        description: `Extreme heat detected (${temp}°C). Protect crops from heat stress and ensure adequate irrigation.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        affectedCrops: ['vegetables', 'fruits', 'flowers']
      })
    } else if (temp < 5) {
      alerts.push({
        type: 'weather',
        severity: 'high',
        title: 'Frost Warning',
        description: `Low temperature detected (${temp}°C). Risk of frost damage to sensitive crops.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        affectedCrops: ['vegetables', 'fruits', 'flowers']
      })
    }

    // Humidity alerts
    if (humidity > 85) {
      alerts.push({
        type: 'agricultural',
        severity: 'medium',
        title: 'High Humidity Alert',
        description: `High humidity (${humidity}%) increases disease risk. Monitor crops for fungal infections.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        affectedCrops: ['all']
      })
    } else if (humidity < 30) {
      alerts.push({
        type: 'agricultural',
        severity: 'medium',
        title: 'Low Humidity Alert',
        description: `Low humidity (${humidity}%) may cause water stress. Increase irrigation frequency.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        affectedCrops: ['all']
      })
    }

    // Wind alerts
    if (windSpeed > 15) {
      alerts.push({
        type: 'weather',
        severity: 'medium',
        title: 'Strong Wind Warning',
        description: `Strong winds (${windSpeed} m/s) may damage crops. Secure structures and protect young plants.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        affectedCrops: ['all']
      })
    }

    // Precipitation alerts
    if (precipitation > 10) {
      alerts.push({
        type: 'weather',
        severity: 'medium',
        title: 'Heavy Rain Alert',
        description: `Heavy rainfall (${precipitation}mm) detected. Monitor for flooding and waterlogging.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        affectedCrops: ['all']
      })
    }

    // Agricultural data alerts
    if (agriculturalData) {
      const soilMoisture = agriculturalData.moisture || 0
      const soilTemp = agriculturalData.temp || temp

      if (soilMoisture < 20) {
        alerts.push({
          type: 'agricultural',
          severity: 'high',
          title: 'Drought Alert',
          description: `Very low soil moisture (${soilMoisture}%). Immediate irrigation required.`,
          startTime: new Date(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          affectedCrops: ['all']
        })
      }

      if (soilTemp < 10) {
        alerts.push({
          type: 'agricultural',
          severity: 'medium',
          title: 'Cold Soil Alert',
          description: `Low soil temperature (${soilTemp}°C). Consider delaying planting or using soil warming techniques.`,
          startTime: new Date(),
          endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
          affectedCrops: ['seeds', 'seedlings']
        })
      }
    }

    return alerts
  }

  // Generate comprehensive agricultural insights
  generateAgriculturalInsights(current, forecast, agriculturalData) {
    const temp = current.main?.temp || 0
    const humidity = current.main?.humidity || 0
    const windSpeed = current.wind?.speed || 0
    const pressure = current.main?.pressure || 0

    // Calculate growing degree days
    const baseTemp = 10
    const growingDegreeDays = Math.max(0, temp - baseTemp)

    // Determine frost risk
    let frostRisk = 'low'
    if (temp < 2) frostRisk = 'high'
    else if (temp < 5) frostRisk = 'medium'

    // Determine pest risk
    let pestRisk = 'low'
    if (temp > 25 && humidity > 70) pestRisk = 'high'
    else if (temp > 20 && humidity > 60) pestRisk = 'medium'

    // Calculate drought index
    const droughtIndex = Math.max(0, 100 - humidity - (temp > 30 ? 20 : 0))

    // Calculate disease risk
    let diseaseRisk = 'low'
    if (humidity > 80 && temp > 20) diseaseRisk = 'high'
    else if (humidity > 70 && temp > 15) diseaseRisk = 'medium'

    // Calculate planting suitability
    let plantingSuitability = 'good'
    if (temp < 10 || temp > 35) plantingSuitability = 'poor'
    else if (temp < 15 || temp > 30) plantingSuitability = 'fair'

    return {
      soilMoisture: agriculturalData?.moisture || Math.max(0, 100 - droughtIndex),
      soilTemperature: agriculturalData?.temp || temp,
      growingDegreeDays: growingDegreeDays,
      frostRisk: frostRisk,
      droughtIndex: droughtIndex,
      pestRisk: pestRisk,
      diseaseRisk: diseaseRisk,
      plantingSuitability: plantingSuitability,
      plantingRecommendation: this.getPlantingRecommendation(temp, humidity, droughtIndex),
      irrigationAdvice: this.getIrrigationAdvice(temp, humidity, droughtIndex),
      pestControlAdvice: this.getPestControlAdvice(temp, humidity, pestRisk),
      diseasePreventionAdvice: this.getDiseasePreventionAdvice(temp, humidity, diseaseRisk)
    }
  }

  // Get planting recommendations
  getPlantingRecommendation(temperature, humidity, droughtIndex) {
    if (temperature < 10) return 'Too cold for most crops. Wait for warmer weather or use cold frames.'
    if (temperature > 35) return 'Too hot for most crops. Consider shade cloth or wait for cooler weather.'
    if (droughtIndex > 70) return 'High drought risk. Ensure irrigation system is ready before planting.'
    if (humidity < 30) return 'Low humidity. Water soil thoroughly before planting and consider mulching.'
    if (humidity > 85) return 'High humidity. Wait for drier conditions to prevent disease issues.'
    
    return 'Good conditions for planting. Monitor soil moisture and temperature regularly.'
  }

  // Get irrigation advice
  getIrrigationAdvice(temperature, humidity, droughtIndex) {
    if (droughtIndex > 70) return 'High drought risk. Irrigate immediately and increase frequency to 2-3 times daily.'
    if (droughtIndex > 50) return 'Moderate drought risk. Monitor soil moisture closely and irrigate as needed.'
    if (humidity > 80) return 'High humidity. Reduce irrigation frequency to prevent waterlogging and disease.'
    if (temperature > 30) return 'High temperature. Increase irrigation frequency to prevent heat stress.'
    
    return 'Normal irrigation schedule recommended. Check soil moisture before watering.'
  }

  // Get pest control advice
  getPestControlAdvice(temperature, humidity, pestRisk) {
    if (pestRisk === 'high') return 'High pest risk detected. Apply preventive treatments and monitor crops daily.'
    if (pestRisk === 'medium') return 'Moderate pest risk. Monitor crops closely and prepare treatment options.'
    
    return 'Low pest risk. Continue regular monitoring and maintain good crop hygiene.'
  }

  // Get disease prevention advice
  getDiseasePreventionAdvice(temperature, humidity, diseaseRisk) {
    if (diseaseRisk === 'high') return 'High disease risk. Apply fungicides preventively and ensure good air circulation.'
    if (diseaseRisk === 'medium') return 'Moderate disease risk. Monitor for early signs and maintain proper spacing.'
    
    return 'Low disease risk. Continue good cultural practices and regular monitoring.'
  }

  // Store weather data in database
  async storeWeatherData(weatherData) {
    try {
      await WeatherData.findOneAndUpdate(
        { 
          'location.lat': weatherData.location.lat, 
          'location.lng': weatherData.location.lng 
        },
        weatherData,
        { upsert: true, new: true }
      )
    } catch (error) {
      console.error('Error storing weather data:', error)
    }
  }

  // Send weather alerts to farmers
  async sendWeatherAlerts(alerts, location) {
    try {
      // Find farmers in the affected area
      const farmers = await User.find({
        role: 'farmer',
        'preferences.weatherAlerts.subscribed': true,
        $or: [
          { 'profile.state': location.state },
          { 'profile.city': location.city }
        ]
      })

      for (const farmer of farmers) {
        for (const alert of alerts) {
          // Check if farmer should receive this alert
          if (this.shouldSendAlert(farmer, alert)) {
            await this.sendAlertToFarmer(farmer, alert, location)
          }
        }
      }
    } catch (error) {
      console.error('Error sending weather alerts:', error)
    }
  }

  // Check if farmer should receive alert
  shouldSendAlert(farmer, alert) {
    const preferences = farmer.preferences?.weatherAlerts
    if (!preferences?.subscribed) return false

    // Check alert types
    if (preferences.alertTypes && !preferences.alertTypes.includes(alert.type)) {
      return false
    }

    // Check crop types
    if (preferences.cropTypes && alert.affectedCrops) {
      const hasMatchingCrop = alert.affectedCrops.some(crop => 
        preferences.cropTypes.includes(crop) || preferences.cropTypes.includes('all')
      )
      if (!hasMatchingCrop) return false
    }

    return true
  }

  // Send alert to individual farmer
  async sendAlertToFarmer(farmer, alert, location) {
    try {
      // Create notification record
      const notification = new Notification({
        userId: farmer._id,
        type: 'weather_alert',
        title: alert.title,
        message: alert.description,
        data: {
          alertType: alert.type,
          severity: alert.severity,
          location: location,
          affectedCrops: alert.affectedCrops
        },
        priority: alert.severity === 'critical' ? 'high' : 'normal'
      })

      await notification.save()

      // Send SMS if enabled
      if (farmer.phone && farmer.phoneVerified && farmer.notificationPreferences?.sms) {
        const smsMessage = `🌤️ GroChain Weather Alert: ${alert.title}\n${alert.description}\nLocation: ${location.city}, ${location.state}`
        await this.smsUtil.sendSMS(farmer.phone, smsMessage, {
          type: 'weather_alert',
          priority: 'high'
        })
      }

      console.log(`Weather alert sent to farmer ${farmer.name}: ${alert.title}`)
    } catch (error) {
      console.error(`Error sending alert to farmer ${farmer.name}:`, error)
    }
  }

  // Helper methods
  getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  calculateDewPoint(temperature, humidity) {
    const a = 17.27
    const b = 237.7
    const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100)
    return (b * alpha) / (a - alpha)
  }

  processForecastData(forecastData) {
    if (!forecastData.list) return []
    
    const dailyData = {}
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000)
      const dayKey = date.toISOString().split('T')[0]
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          date,
          highTemp: -Infinity,
          lowTemp: Infinity,
          humidity: [],
          windSpeed: [],
          precipitation: 0,
          weatherCondition: item.weather?.[0]?.main || 'Clear',
          weatherDescription: item.weather?.[0]?.description || 'Clear sky',
          weatherIcon: item.weather?.[0]?.icon || '01d',
          uvIndex: 0
        }
      }
      
      dailyData[dayKey].highTemp = Math.max(dailyData[dayKey].highTemp, item.main?.temp || 0)
      dailyData[dayKey].lowTemp = Math.min(dailyData[dayKey].lowTemp, item.main?.temp || 0)
      dailyData[dayKey].humidity.push(item.main?.humidity || 0)
      dailyData[dayKey].windSpeed.push(item.wind?.speed || 0)
      
      if (item.rain && item.rain['3h']) {
        dailyData[dayKey].precipitation += item.rain['3h']
      }
      if (item.snow && item.snow['3h']) {
        dailyData[dayKey].precipitation += item.snow['3h']
      }
    })
    
    return Object.values(dailyData).map(day => ({
      ...day,
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length)
    }))
  }

  // Get weather statistics for a region
  async getWeatherStatistics(region, period = 'month') {
    const match = {}
    if (region) match['location.state'] = region
    
    const now = new Date()
    const startDate = new Date()
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    } else if (period === 'quarter') {
      startDate.setMonth(now.getMonth() - 3)
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1)
    }
    
    match.createdAt = { $gte: startDate, $lte: now }
    
    const stats = await WeatherData.aggregate([
      { $match: match },
      { $group: {
        _id: null,
        avgTemperature: { $avg: '$current.temperature' },
        minTemperature: { $min: '$current.temperature' },
        maxTemperature: { $max: '$current.temperature' },
        avgHumidity: { $avg: '$current.humidity' },
        avgWindSpeed: { $avg: '$current.windSpeed' },
        totalAlerts: { $sum: { $size: { $ifNull: ['$alerts', []] } } },
        rainyDays: { $sum: { $cond: [{ $gt: ['$current.precipitation', 0] }, 1, 0] } },
        sunnyDays: { $sum: { $cond: [{ $gt: ['$current.uvIndex', 7] }, 1, 0] } }
      }},
      { $project: {
        _id: 0,
        avgTemperature: { $round: ['$avgTemperature', 2] },
        minTemperature: { $round: ['$minTemperature', 2] },
        maxTemperature: { $round: ['$maxTemperature', 2] },
        avgHumidity: { $round: ['$avgHumidity', 2] },
        avgWindSpeed: { $round: ['$avgWindSpeed', 2] },
        totalAlerts,
        rainyDays,
        sunnyDays
      }}
    ])
    
    return stats[0] || {}
  }
}

module.exports = WeatherService
