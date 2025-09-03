// Test weather API with real data only
const fetch = require('node-fetch')

async function testWeatherAPI() {
  const baseUrl = 'http://localhost:5000/api/weather'

  console.log('🌤️ Testing Weather API with Real Data Only...\n')

  // Test coordinates for Sango Otta, Ogun State, Nigeria
  const sangoOttaCoords = {
    lat: 6.6818,
    lng: 3.1757,
    city: 'Sango Otta',
    state: 'Ogun',
    country: 'Nigeria'
  }

  try {
    // Test current weather
    console.log('📍 Testing Current Weather for Sango Otta...')
    const currentUrl = `${baseUrl}/current/${sangoOttaCoords.lat},${sangoOttaCoords.lng}?city=${sangoOttaCoords.city}&state=${sangoOttaCoords.state}&country=${sangoOttaCoords.country}`

    console.log('🔗 Current Weather URL:', currentUrl)

    const currentResponse = await fetch(currentUrl)
    const currentData = await currentResponse.json()

    console.log('📊 Current Weather Response Status:', currentResponse.status)

    if (currentResponse.ok && currentData.status === 'success') {
      console.log('✅ Current Weather Success!')
      console.log('🌡️ Temperature:', currentData.data.current.temperature, '°C')
      console.log('🌤️ Condition:', currentData.data.current.weatherCondition)
      console.log('💧 Humidity:', currentData.data.current.humidity, '%')
      console.log('🌬️ Wind Speed:', currentData.data.current.windSpeed, 'km/h')
      console.log('📍 Location:', currentData.data.location.city, ',', currentData.data.location.state)
      console.log('')
    } else {
      console.log('❌ Current Weather Failed:', currentData.message || 'Unknown error')
      return
    }

    // Test forecast
    console.log('📅 Testing 5-Day Forecast...')
    const forecastUrl = `${baseUrl}/forecast/${sangoOttaCoords.lat},${sangoOttaCoords.lng}?days=5`

    console.log('🔗 Forecast URL:', forecastUrl)

    const forecastResponse = await fetch(forecastUrl)
    const forecastData = await forecastResponse.json()

    console.log('📊 Forecast Response Status:', forecastResponse.status)

    if (forecastResponse.ok && forecastData.status === 'success') {
      console.log('✅ Forecast Success!')
      const forecastList = forecastData.data.forecast || []
      console.log(`📋 Forecast Days: ${forecastList.length}`)

      forecastList.slice(0, 5).forEach((day, index) => {
        const date = new Date(day.date)
        console.log(`  ${index + 1}. ${date.toLocaleDateString()} - ${day.weatherCondition} ${day.highTemp}°C/${day.lowTemp}°C`)
      })
      console.log('')
    } else {
      console.log('❌ Forecast Failed:', forecastData.message || 'Unknown error')
    }

    console.log('🎉 All tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testWeatherAPI()

