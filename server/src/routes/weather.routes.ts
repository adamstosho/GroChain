import express from 'express';
import {
  getCurrentWeather,
  getWeatherForecast,
  getAgriculturalInsights,
  getWeatherAlerts,
  getHistoricalWeather,
  getWeatherStatistics,
  getWeatherByCoordinates,
  getRegionalAlerts,
  getClimateSummary
} from '../controllers/weather.controller';
// Weather routes are public - no authentication required

const router = express.Router();

/**
 * @route   GET /api/weather/current
 * @desc    Get current weather for a location
 * @access  Public
 */
router.get('/current', getCurrentWeather);

/**
 * @route   GET /api/weather/forecast
 * @desc    Get weather forecast for a location
 * @access  Public
 */
router.get('/forecast', getWeatherForecast);

/**
 * @route   GET /api/weather/agricultural-insights
 * @desc    Get agricultural insights for a location
 * @access  Public
 */
router.get('/agricultural-insights', getAgriculturalInsights);

/**
 * @route   GET /api/weather/alerts
 * @desc    Get weather alerts for a location
 * @access  Public
 */
router.get('/alerts', getWeatherAlerts);

/**
 * @route   GET /api/weather/historical
 * @desc    Get historical weather data for a location
 * @access  Public
 */
router.get('/historical', getHistoricalWeather);

/**
 * @route   GET /api/weather/coordinates/:lat/:lng
 * @desc    Get weather data by coordinates
 * @access  Public
 */
router.get('/coordinates/:lat/:lng', getWeatherByCoordinates);

/**
 * @route   GET /api/weather/statistics/:region
 * @desc    Get weather statistics for a region
 * @access  Public
 */
router.get('/statistics/:region', getWeatherStatistics);

/**
 * @route   GET /api/weather/regional-alerts
 * @desc    Get all weather alerts for a region
 * @access  Public
 */
router.get('/regional-alerts', getRegionalAlerts);

/**
 * @route   GET /api/weather/climate-summary
 * @desc    Get climate summary for a location
 * @access  Public
 */
router.get('/climate-summary', getClimateSummary);

export default router;
