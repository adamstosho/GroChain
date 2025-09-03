// Test Weather Integration Script
// Run this to verify weather widget functionality

const BASE_URL = 'http://localhost:5000/api';

async function testWeatherIntegration() {
  console.log('🌤️ Testing Weather Integration...\n');

  try {
    // Test 1: Current Weather API
    console.log('📍 Testing Current Weather API...');
    const currentWeatherUrl = `${BASE_URL}/weather/current/6.5244,3.3792?city=Lagos&state=Lagos&country=Nigeria`;
    console.log('🌐 Requesting:', currentWeatherUrl);

    const currentResponse = await fetch(currentWeatherUrl);
    const currentData = await currentResponse.json();

    if (currentResponse.ok && currentData.status === 'success') {
      console.log('✅ Current weather API working');
      console.log('📊 Weather data:', {
        location: currentData.data.location,
        temperature: currentData.data.current.temperature,
        condition: currentData.data.current.weatherCondition,
        humidity: currentData.data.current.humidity
      });
    } else {
      console.log('❌ Current weather API failed:', currentData);
      return;
    }

    // Test 2: Forecast API
    console.log('\n📅 Testing Weather Forecast API...');
    const forecastUrl = `${BASE_URL}/weather/forecast/6.5244,3.3792?city=Lagos&state=Lagos&country=Nigeria&days=5`;
    console.log('🌐 Requesting:', forecastUrl);

    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    if (forecastResponse.ok && forecastData.status === 'success') {
      console.log('✅ Forecast API working');
      console.log('📊 Forecast data:', {
        forecastCount: forecastData.data.forecast?.length || 0,
        sampleDay: forecastData.data.forecast?.[0] ? {
          date: forecastData.data.forecast[0].date,
          temperature: forecastData.data.forecast[0].temperature,
          condition: forecastData.data.forecast[0].weatherCondition
        } : 'No data'
      });
    } else {
      console.log('❌ Forecast API failed:', forecastData);
      return;
    }

    // Test 3: Different Locations
    console.log('\n🌍 Testing Different Locations...');

    const locations = [
      { coords: '9.0820,7.3986', city: 'Abuja', state: 'FCT' },
      { coords: '11.9914,8.5311', city: 'Kano', state: 'Kano' },
      { coords: '7.3775,3.9470', city: 'Ibadan', state: 'Oyo' }
    ];

    for (const location of locations) {
      try {
        const testUrl = `${BASE_URL}/weather/current/${location.coords}?city=${location.city}&state=${location.state}&country=Nigeria`;
        const testResponse = await fetch(testUrl);
        const testData = await testResponse.json();

        if (testResponse.ok && testData.status === 'success') {
          console.log(`✅ ${location.city}: ${testData.data.current.temperature}°C`);
        } else {
          console.log(`❌ ${location.city}: Failed`);
        }
      } catch (error) {
        console.log(`❌ ${location.city}: Error - ${error.message}`);
      }
    }

    console.log('\n🎉 Weather Integration Test Complete!');
    console.log('\n📋 What should work now:');
    console.log('✅ Weather widget shows real temperature and conditions');
    console.log('✅ Location-based weather data for farmer\'s location');
    console.log('✅ "View Forecast" button opens 5-day forecast modal');
    console.log('✅ Agricultural insights based on real weather data');
    console.log('✅ Proper error handling when weather data unavailable');

    console.log('\n🔧 Frontend Integration:');
    console.log('1. Weather widget uses farmer\'s actual location');
    console.log('2. Real-time weather updates based on location changes');
    console.log('3. Intelligent agricultural recommendations');
    console.log('4. 5-day forecast with detailed weather information');

  } catch (error) {
    console.error('❌ Weather integration test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: cd backend && npm run dev');
    console.log('2. Check weather API key in backend/.env');
    console.log('3. Verify weather routes are registered in app.js');
    console.log('4. Check MongoDB connection for weather data storage');
  }
}

// Run the test
testWeatherIntegration();

