# Weather API Setup Guide

## Problem
The weather data is not being fetched because the required API keys are missing from your environment configuration.

## Solution
You need to add weather API keys to your `.env` file.

## Required Environment Variables

Add these to your `server/.env` file:

```bash
# Weather APIs
OPENWEATHER_API_KEY=your_openweather_api_key_here
AGROMONITORING_API_KEY=your_agromonitoring_api_key_here
```

## How to Get API Keys

### 1. OpenWeather API (Free)
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. The free tier allows 1000 calls per day

### 2. AgroMonitoring API (Optional)
1. Go to [AgroMonitoring](http://agromonitoring.com/)
2. Sign up for an account
3. Get your API key

## Current Status
- ❌ Weather API keys are missing
- ❌ Weather data is not being fetched
- ❌ Dashboard shows "Weather forecast unavailable"

## After Adding API Keys
1. Restart your backend server
2. The weather data will be fetched automatically
3. Dashboard will show real-time weather information

## Fallback Solution
If you don't want to set up API keys immediately, the system will show mock weather data to prevent errors.

## Testing
After setup, test the weather endpoints:
- `GET /api/weather/current?lat=9.0765&lng=7.3986&city=Abuja&state=FCT&country=Nigeria`
- `GET /api/weather/forecast?lat=9.0765&lng=7.3986&city=Abuja&state=FCT&country=Nigeria&days=5`
