const http = require('http')

// Simple test for basic endpoints
function testEndpoint(path, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      timeout: 5000
    }

    const req = http.request(options, (res) => {
      console.log(`${name}: ${res.statusCode}`)
      resolve(res.statusCode)
    })

    req.on('error', (e) => {
      console.log(`${name} Error: ${e.message}`)
      resolve(null)
    })

    req.on('timeout', () => {
      console.log(`${name} Timeout`)
      req.destroy()
      resolve(null)
    })

    req.end()
  })
}

async function runTests() {
  console.log('Testing basic endpoints...\n')

  const healthStatus = await testEndpoint('/api/health', 'Health')
  const usersStatus = await testEndpoint('/api/users/profile/me', 'Profile (will fail without auth)')

  console.log('\nTest completed')
  console.log('Health status:', healthStatus)
}

// Run the test
runTests()
