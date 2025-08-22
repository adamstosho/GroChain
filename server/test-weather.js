const axios = require('axios');

async function testWeatherAPI() {
  try {
    console.log('🧪 Testing Weather API...');
    
    // Test current weather
    const weatherResponse = await axios.get('http://localhost:5000/api/weather/current', {
      params: {
        lat: 9.0765,
        lng: 7.3986,
        city: 'Abuja',
        state: 'FCT',
        country: 'Nigeria'
      }
    });
    
    console.log('✅ Current Weather API Response:');
    console.log('Status:', weatherResponse.status);
    console.log('Data:', JSON.stringify(weatherResponse.data, null, 2));
    
    // Test forecast
    const forecastResponse = await axios.get('http://localhost:5000/api/weather/forecast', {
      params: {
        lat: 9.0765,
        lng: 7.3986,
        city: 'Abuja',
        state: 'FCT',
        country: 'Nigeria',
        days: 5
      }
    });
    
    console.log('\n✅ Forecast API Response:');
    console.log('Status:', forecastResponse.status);
    console.log('Data:', JSON.stringify(forecastResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Weather API Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Wait for server to start
setTimeout(() => {
  testWeatherAPI();
}, 3000);


