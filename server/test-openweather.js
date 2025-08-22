const axios = require('axios');

async function testOpenWeatherAPI() {
  try {
    console.log('🧪 Testing OpenWeather API directly...');
    
    const apiKey = 'b1d077119edff48f7368e2582c67c4b1';
    const lat = 9.0765;
    const lng = 7.3986;
    
    console.log('API Key:', apiKey);
    console.log('Location:', { lat, lng });
    
    // Test OpenWeather API directly
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    );
    
    console.log('✅ OpenWeather API Response:');
    console.log('Status:', response.status);
    console.log('Temperature:', response.data.main.temp, '°C');
    console.log('Humidity:', response.data.main.humidity, '%');
    console.log('Weather:', response.data.weather[0].description);
    console.log('Full Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ OpenWeather API Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testOpenWeatherAPI();


