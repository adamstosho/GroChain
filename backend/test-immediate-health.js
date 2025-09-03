const http = require('http')

// Test health endpoint immediately
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 3000
}

console.log('Testing health endpoint...')

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode)
  let data = ''
  res.on('data', (chunk) => data += chunk)
  res.on('end', () => {
    try {
      const json = JSON.parse(data)
      console.log('Response:', json)
    } catch (e) {
      console.log('Raw response:', data)
    }
  })
})

req.on('error', (e) => {
  console.error('Error:', e.message)
})

req.on('timeout', () => {
  console.log('Request timed out')
  req.destroy()
})

req.end()
