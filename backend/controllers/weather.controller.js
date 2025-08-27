const WeatherData = require('../models/weather.model')
const Notification = require('../models/notification.model')
const User = require('../models/user.model')

// Use node-fetch for consistent behavior across Node.js versions
const fetch = require('node-fetch')

const weatherController = {
  // Get current weather data
  async getCurrentWeather(req, res) {
    try {
      const { lat, lng, city, state, country } = req.query
      
      if (!lat || !lng || !city || !state || !country) {
        return res.status(400).json({
          status: 'error',
          message: 'lat, lng, city, state, and country are required'
        })
      }
      
      const apiKey = process.env.OPENWEATHER_API_KEY
      
      // For development/testing, return mock data if no API key
      if (!apiKey || process.env.NODE_ENV === 'development') {
        return res.json({
          status: 'success',
          data: {
            location: { lat: Number(lat), lng: Number(lng), city, state, country },
            current: {
              temperature: 25,
              humidity: 65,
              windSpeed: 5,
              windDirection: 'NE',
              pressure: 1013,
              visibility: 10000,
              weatherCondition: 'Clear',
              weatherIcon: '01d',
              feelsLike: 26,
              dewPoint: 18,
              cloudCover: 20
            },
            forecast: [],
            alerts: [],
            agricultural: { recommendation: 'Good conditions for farming', risk: 'low' },
            metadata: { source: 'Mock Data', lastUpdated: new Date(), dataQuality: 'development' }
          }
        })
      }
      
      // Fetch current weather from OpenWeather API
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
      const currentResponse = await fetch(currentUrl)
      const currentData = await currentResponse.json()
      
      if (currentData.cod !== 200) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to fetch weather data'
        })
      }
      
      // Fetch 5-day forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
      const forecastResponse = await fetch(forecastUrl)
      const forecastData = await forecastResponse.json()
      
      // Process current weather data
      const weatherInfo = {
        location: {
          lat: Number(lat),
          lng: Number(lng),
          city,
          state,
          country
        },
        current: {
          temperature: currentData.main?.temp || 0,
          humidity: currentData.main?.humidity || 0,
          windSpeed: currentData.wind?.speed || 0,
          windDirection: this.getWindDirection(currentData.wind?.deg || 0),
          pressure: currentData.main?.pressure || 0,
          visibility: currentData.visibility || 0,
          uvIndex: 0, // OpenWeather doesn't provide UV index in free tier
          weatherCondition: currentData.weather?.[0]?.main || 'Clear',
          weatherIcon: currentData.weather?.[0]?.icon || '01d',
          feelsLike: currentData.main?.feels_like || 0,
          dewPoint: this.calculateDewPoint(currentData.main?.temp || 0, currentData.main?.humidity || 0),
          cloudCover: currentData.clouds?.all || 0
        },
        forecast: this.processForecastData(forecastData),
        alerts: [],
        agricultural: this.generateAgriculturalInsights(currentData, forecastData),
        metadata: {
          source: 'OpenWeather',
          lastUpdated: new Date(),
          dataQuality: 'high',
          nextUpdate: new Date(Date.now() + 3600 * 1000)
        }
      }
      
      // Store weather data
      await WeatherData.findOneAndUpdate(
        { 'location.lat': Number(lat), 'location.lng': Number(lng) },
        weatherInfo,
        { upsert: true, new: true }
      )
      
      res.json({
        status: 'success',
        data: weatherInfo
      })
    } catch (error) {
      console.error('Error fetching current weather:', error)
      
      // Return mock data for development/testing when there's an error
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          status: 'success',
          data: {
            location: { 
              lat: Number(req.query.lat || 0), 
              lng: Number(req.query.lng || 0), 
              city: req.query.city || 'Unknown', 
              state: req.query.state || 'Unknown', 
              country: req.query.country || 'Unknown' 
            },
            current: {
              temperature: 25,
              humidity: 65,
              windSpeed: 5,
              windDirection: 'NE',
              pressure: 1013,
              visibility: 10000,
              weatherCondition: 'Clear',
              weatherIcon: '01d',
              feelsLike: 26,
              dewPoint: 18,
              cloudCover: 20
            },
            forecast: [],
            alerts: [],
            agricultural: { recommendation: 'Good conditions for farming', risk: 'low' },
            metadata: { source: 'Mock Data', lastUpdated: new Date(), dataQuality: 'development' }
          }
        })
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch weather data',
        error: error.message
      })
    }
  },

  // Get weather forecast
  async getWeatherForecast(req, res) {
    try {
      const { lat, lng, days = 5 } = req.query
      
      if (!lat || !lng) {
        return res.status(400).json({
          status: 'error',
          message: 'lat and lng are required'
        })
      }
      
      const apiKey = process.env.OPENWEATHER_API_KEY
      if (!apiKey) {
        return res.status(500).json({
          status: 'error',
          message: 'Weather API key not configured'
        })
      }
      
      // Fetch forecast data
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&cnt=${days * 8}`
      const response = await fetch(forecastUrl)
      const data = await response.json()
      
      if (data.cod !== '200') {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to fetch forecast data'
        })
      }
      
      const forecast = this.processForecastData(data)
      
      res.json({
        status: 'success',
        data: { forecast }
      })
    } catch (error) {
      console.error('Error fetching weather forecast:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch forecast data'
      })
    }
  },

  // Get agricultural weather insights
  async getAgriculturalInsights(req, res) {
    try {
      const { lat, lng, cropType } = req.query
      
      if (!lat || !lng) {
        return res.status(400).json({
          status: 'error',
          message: 'lat and lng are required'
        })
      }
      
      // Get stored weather data
      const weatherData = await WeatherData.findOne({
        'location.lat': Number(lat),
        'location.lng': Number(lng)
      }).sort({ 'metadata.lastUpdated': -1 })
      
      if (!weatherData) {
        return res.status(404).json({
          status: 'error',
          message: 'Weather data not found for this location'
        })
      }
      
      // Generate agricultural insights
      const insights = this.generateAgriculturalInsights(weatherData.current, weatherData.forecast, cropType)
      
      res.json({
        status: 'success',
        data: {
          location: weatherData.location,
          current: weatherData.current,
          agricultural: insights,
          recommendations: this.generateFarmingRecommendations(insights, cropType)
        }
      })
    } catch (error) {
      console.error('Error getting agricultural insights:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get agricultural insights'
      })
    }
  },

  // Get weather alerts
  async getWeatherAlerts(req, res) {
    try {
      const { lat, lng, severity, type } = req.query
      
      const query = {}
      if (lat && lng) {
        query['location.lat'] = Number(lat)
        query['location.lng'] = Number(lng)
      }
      if (severity) query['alerts.severity'] = severity
      if (type) query['alerts.type'] = type
      
      const alerts = await WeatherData.find(query)
        .select('location alerts')
        .sort({ 'metadata.lastUpdated': -1 })
        .limit(50)
      
      const allAlerts = alerts.reduce((acc, weather) => {
        if (weather.alerts && weather.alerts.length > 0) {
          acc.push(...weather.alerts.map(alert => ({
            ...alert.toObject(),
            location: weather.location
          })))
        }
        return acc
      }, [])
      
      res.json({
        status: 'success',
        data: { alerts: allAlerts }
      })
    } catch (error) {
      console.error('Error getting weather alerts:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get weather alerts'
      })
    }
  },

  // Get historical weather data
  async getHistoricalWeather(req, res) {
    try {
      const { lat, lng, startDate, endDate } = req.query
      
      if (!lat || !lng || !startDate || !endDate) {
        return res.status(400).json({
          status: 'error',
          message: 'lat, lng, startDate, and endDate are required'
        })
      }
      
      const query = {
        'location.lat': Number(lat),
        'location.lng': Number(lng),
        'metadata.lastUpdated': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
      
      const historicalData = await WeatherData.find(query)
        .select('current metadata')
        .sort({ 'metadata.lastUpdated': 1 })
      
      res.json({
        status: 'success',
        data: { historicalData }
      })
    } catch (error) {
      console.error('Error getting historical weather:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get historical weather data'
      })
    }
  },

  // Subscribe to weather alerts
  async subscribeToAlerts(req, res) {
    try {
      const { lat, lng, alertTypes, cropTypes } = req.body
      
      if (!lat || !lng) {
        return res.status(400).json({
          status: 'error',
          message: 'lat and lng are required'
        })
      }
      
      // Update user preferences
      await User.findByIdAndUpdate(req.user.id, {
        $set: {
          'preferences.weatherAlerts': {
            location: { lat: Number(lat), lng: Number(lng) },
            alertTypes: alertTypes || ['weather', 'agricultural'],
            cropTypes: cropTypes || [],
            subscribed: true,
            subscribedAt: new Date()
          }
        }
      })
      
      res.json({
        status: 'success',
        message: 'Successfully subscribed to weather alerts'
      })
    } catch (error) {
      console.error('Error subscribing to weather alerts:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to subscribe to weather alerts'
      })
    }
  },

  // Helper methods
  getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  },

  calculateDewPoint(temperature, humidity) {
    const a = 17.27
    const b = 237.7
    const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100)
    return (b * alpha) / (a - alpha)
  },

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
    })
    
    return Object.values(dailyData).map(day => ({
      ...day,
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length)
    }))
  },

  generateAgriculturalInsights(current, forecast, cropType) {
    const temp = current.temperature
    const humidity = current.humidity
    const windSpeed = current.windSpeed
    
    // Calculate growing degree days (simplified)
    const baseTemp = 10 // Base temperature for most crops
    const growingDegreeDays = Math.max(0, temp - baseTemp)
    
    // Determine frost risk
    let frostRisk = 'low'
    if (temp < 2) frostRisk = 'high'
    else if (temp < 5) frostRisk = 'medium'
    
    // Determine pest risk based on temperature and humidity
    let pestRisk = 'low'
    if (temp > 25 && humidity > 70) pestRisk = 'high'
    else if (temp > 20 && humidity > 60) pestRisk = 'medium'
    
    // Calculate drought index (simplified)
    const droughtIndex = Math.max(0, 100 - humidity - (temp > 30 ? 20 : 0))
    
    return {
      soilMoisture: Math.max(0, 100 - droughtIndex),
      soilTemperature: temp,
      growingDegreeDays,
      frostRisk,
      droughtIndex,
      pestRisk,
      plantingRecommendation: this.getPlantingRecommendation(temp, humidity, cropType),
      irrigationAdvice: this.getIrrigationAdvice(temp, humidity, droughtIndex)
    }
  },

  getPlantingRecommendation(temperature, humidity, cropType) {
    if (temperature < 10) return 'Too cold for most crops. Wait for warmer weather.'
    if (temperature > 35) return 'Too hot for most crops. Consider shade or wait for cooler weather.'
    if (humidity < 30) return 'Low humidity. Ensure proper irrigation before planting.'
    
    return 'Good conditions for planting. Monitor soil moisture and temperature.'
  },

  getIrrigationAdvice(temperature, humidity, droughtIndex) {
    if (droughtIndex > 70) return 'High drought risk. Increase irrigation frequency.'
    if (droughtIndex > 50) return 'Moderate drought risk. Monitor soil moisture closely.'
    if (humidity > 80) return 'High humidity. Reduce irrigation to prevent disease.'
    
    return 'Normal irrigation schedule recommended.'
  },

  generateFarmingRecommendations(insights, cropType) {
    const recommendations = []
    
    if (insights.frostRisk === 'high') {
      recommendations.push('High frost risk. Protect sensitive crops with covers or delay planting.')
    }
    
    if (insights.pestRisk === 'high') {
      recommendations.push('High pest risk. Monitor crops closely and consider preventive measures.')
    }
    
    if (insights.droughtIndex > 70) {
      recommendations.push('High drought risk. Increase irrigation and consider drought-resistant varieties.')
    }
    
    if (insights.soilMoisture < 30) {
      recommendations.push('Low soil moisture. Irrigate before planting and consider mulching.')
    }
    
    return recommendations
  }
}

module.exports = weatherController

