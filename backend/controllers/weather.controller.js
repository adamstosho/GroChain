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

// Get weather statistics for a region
exports.getWeatherStatistics = async (req, res) => {
  try {
    const { region, period = 'month' } = req.query
    
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
    
    const WeatherData = require('../models/weather.model')
    
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
    
    // Daily trends
    const dailyTrends = await WeatherData.aggregate([
      { $match: match },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        avgTemp: { $avg: '$current.temperature' },
        avgHumidity: { $avg: '$current.humidity' },
        alerts: { $sum: { $size: { $ifNull: ['$alerts', []] } } }
      }},
      { $sort: { _id: 1 } }
    ])
    
    return res.json({
      status: 'success',
      data: {
        period,
        region: region || 'all',
        statistics: stats[0] || {},
        dailyTrends
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Get regional weather alerts
exports.getRegionalAlerts = async (req, res) => {
  try {
    const { region, severity, active = true } = req.query
    
    const match = {}
    if (region) match['location.state'] = region
    if (severity) match['alerts.severity'] = severity
    if (active) match['alerts.active'] = true
    
    const WeatherData = require('../models/weather.model')
    
    const alerts = await WeatherData.aggregate([
      { $match: match },
      { $unwind: '$alerts' },
      { $match: active ? { 'alerts.active': true } : {} },
      { $group: {
        _id: {
          state: '$location.state',
          severity: '$alerts.severity',
          type: '$alerts.type'
        },
        count: { $sum: 1 },
        latestAlert: { $first: '$alerts' }
      }},
      { $sort: { '_id.severity': -1, count: -1 } }
    ])
    
    // Group by state for easier consumption
    const alertsByState = alerts.reduce((acc, alert) => {
      const state = alert._id.state
      if (!acc[state]) acc[state] = []
      acc[state].push({
        severity: alert._id.severity,
        type: alert._id.type,
        count: alert.count,
        latest: alert.latestAlert
      })
      return acc
    }, {})
    
    return res.json({
      status: 'success',
      data: {
        alertsByState,
        totalAlerts: alerts.reduce((sum, alert) => sum + alert.count, 0),
        activeAlerts: alerts.filter(alert => alert.latestAlert.active).length
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Get climate summary for agricultural planning
exports.getClimateSummary = async (req, res) => {
  try {
    const { region, season } = req.query
    
    const match = {}
    if (region) match['location.state'] = region
    
    const WeatherData = require('../models/weather.model')
    
    // Get seasonal data if specified
    if (season) {
      const seasonDates = getSeasonDates(season)
      match.createdAt = { $gte: seasonDates.start, $lte: seasonDates.end }
    }
    
    const climateData = await WeatherData.aggregate([
      { $match: match },
      { $group: {
        _id: {
          state: '$location.state',
          month: { $month: '$createdAt' }
        },
        avgTemp: { $avg: '$current.temperature' },
        avgHumidity: { $avg: '$current.humidity' },
        totalRainfall: { $sum: '$current.precipitation' },
        avgWindSpeed: { $avg: '$current.windSpeed' },
        sunnyHours: { $sum: { $cond: [{ $gt: ['$current.uvIndex', 5] }, 1, 0] } }
      }},
      { $sort: { '_id.month': 1 } }
    ])
    
    // Agricultural recommendations based on climate data
    const recommendations = generateAgriculturalRecommendations(climateData, region)
    
    return res.json({
      status: 'success',
      data: {
        region: region || 'all',
        season: season || 'all',
        climateData,
        recommendations,
        summary: {
          avgTemperature: climateData.reduce((sum, d) => sum + d.avgTemp, 0) / climateData.length,
          totalRainfall: climateData.reduce((sum, d) => sum + d.totalRainfall, 0),
          avgHumidity: climateData.reduce((sum, d) => sum + d.avgHumidity, 0) / climateData.length
        }
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Get weather data by coordinates
exports.getWeatherByCoordinates = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.params // radius in km
    
    const WeatherData = require('../models/weather.model')
    
    // Find weather stations within radius
    const weatherStations = await WeatherData.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }).limit(5)
    
    if (weatherStations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No weather data found for the specified coordinates'
      })
    }
    
    // Aggregate data from nearby stations
    const aggregatedData = await WeatherData.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          maxDistance: radius * 1000,
          spherical: true
        }
      },
      { $limit: 5 },
      { $group: {
        _id: null,
        avgTemperature: { $avg: '$current.temperature' },
        avgHumidity: { $avg: '$current.humidity' },
        avgWindSpeed: { $avg: '$current.windSpeed' },
        avgPrecipitation: { $avg: '$current.precipitation' },
        avgUVIndex: { $avg: '$current.uvIndex' },
        nearestStation: { $first: '$$ROOT' }
      }}
    ])
    
    const result = aggregatedData[0]
    
    return res.json({
      status: 'success',
      data: {
        coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: `${radius}km`,
        current: {
          temperature: Math.round(result.avgTemperature * 100) / 100,
          humidity: Math.round(result.avgHumidity * 100) / 100,
          windSpeed: Math.round(result.avgWindSpeed * 100) / 100,
          precipitation: Math.round(result.avgPrecipitation * 100) / 100,
          uvIndex: Math.round(result.avgUVIndex * 100) / 100
        },
        nearestStation: {
          name: result.nearestStation.location.name,
          distance: Math.round(result.nearestStation.distance / 1000 * 100) / 100, // Convert to km
          data: result.nearestStation.current
        },
        nearbyStations: weatherStations.length
      }
    })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

// Helper function to get season dates
function getSeasonDates(season) {
  const now = new Date()
  const currentYear = now.getFullYear()
  
  const seasons = {
    'spring': { start: new Date(currentYear, 2, 1), end: new Date(currentYear, 4, 31) },
    'summer': { start: new Date(currentYear, 5, 1), end: new Date(currentYear, 7, 31) },
    'autumn': { start: new Date(currentYear, 8, 1), end: new Date(currentYear, 10, 31) },
    'winter': { start: new Date(currentYear, 11, 1), end: new Date(currentYear, 1, 31) },
    'rainy': { start: new Date(currentYear, 3, 1), end: new Date(currentYear, 9, 30) },
    'dry': { start: new Date(currentYear, 10, 1), end: new Date(currentYear, 2, 28) }
  }
  
  return seasons[season.toLowerCase()] || { start: new Date(currentYear, 0, 1), end: new Date(currentYear, 11, 31) }
}

// Helper function to generate agricultural recommendations
function generateAgriculturalRecommendations(climateData, region) {
  const recommendations = []
  
  if (!climateData || climateData.length === 0) {
    return [{ type: 'general', message: 'Insufficient climate data for recommendations' }]
  }
  
  const avgTemp = climateData.reduce((sum, d) => sum + d.avgTemp, 0) / climateData.length
  const totalRainfall = climateData.reduce((sum, d) => sum + d.totalRainfall, 0)
  const avgHumidity = climateData.reduce((sum, d) => sum + d.avgHumidity, 0) / climateData.length
  
  // Temperature-based recommendations
  if (avgTemp > 30) {
    recommendations.push({
      type: 'temperature',
      severity: 'high',
      message: 'High temperatures detected. Consider heat-resistant crop varieties and increased irrigation.'
    })
  } else if (avgTemp < 15) {
    recommendations.push({
      type: 'temperature',
      severity: 'medium',
      message: 'Low temperatures detected. Consider cold-tolerant crops and frost protection measures.'
    })
  }
  
  // Rainfall-based recommendations
  if (totalRainfall < 100) {
    recommendations.push({
      type: 'rainfall',
      severity: 'high',
      message: 'Low rainfall detected. Implement drought-resistant farming practices and water conservation.'
    })
  } else if (totalRainfall > 500) {
    recommendations.push({
      type: 'rainfall',
      severity: 'medium',
      message: 'High rainfall detected. Consider flood-resistant crops and proper drainage systems.'
    })
  }
  
  // Humidity-based recommendations
  if (avgHumidity > 80) {
    recommendations.push({
      type: 'humidity',
      severity: 'medium',
      message: 'High humidity detected. Monitor for fungal diseases and ensure proper crop spacing.'
    })
  }
  
  // Regional-specific recommendations
  if (region) {
    recommendations.push({
      type: 'regional',
      severity: 'info',
      message: `Climate analysis complete for ${region}. Consider local agricultural extension advice.`
    })
  }
  
  return recommendations
}

module.exports = weatherController

