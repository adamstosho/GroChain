const express = require('express')
const router = express.Router()
const weatherController = require('../controllers/weather.controller')
const { authenticate } = require('../middlewares/auth.middleware')

// Get current weather data
router.get('/current', weatherController.getCurrentWeather)

// Get weather forecast
router.get('/forecast', weatherController.getWeatherForecast)

// Get agricultural weather insights
router.get('/agricultural-insights', weatherController.getAgriculturalInsights)

// Get weather alerts
router.get('/alerts', weatherController.getWeatherAlerts)

// Get historical weather data
router.get('/historical', weatherController.getHistoricalWeather)

// Subscribe to weather alerts (requires authentication)
router.post('/subscribe', 
  authenticate, 
  weatherController.subscribeToAlerts
)

module.exports = router


