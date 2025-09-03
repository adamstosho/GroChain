// Test webhook endpoint accessibility
const http = require('http')

async function testWebhookEndpoint() {
  const testData = {
    event: 'charge.success',
    data: {
      id: 123456789,
      reference: 'TEST_WEBHOOK_123',
      amount: 60800,
      currency: 'NGN',
      status: 'success',
      paid_at: new Date().toISOString(),
      customer: {
        email: 'test@example.com'
      },
      metadata: {
        order_id: '68b8033ca3b9a905c8287446'
      }
    }
  }

  const postData = JSON.stringify(testData)

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/payments/verify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  console.log('🔗 Testing webhook endpoint...')
  console.log('📡 Sending to:', `http://${options.hostname}:${options.port}${options.path}`)
  console.log('📤 Payload:', JSON.stringify(testData, null, 2))

  const req = http.request(options, (res) => {
    console.log('📥 Response status:', res.statusCode)
    console.log('📥 Response headers:', res.headers)

    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      console.log('📥 Response body:', data)
      console.log('✅ Webhook endpoint test completed')
    })
  })

  req.on('error', (error) => {
    console.error('❌ Webhook endpoint test failed:', error.message)
    console.log('💡 Make sure your backend server is running on port 5000')
  })

  req.write(postData)
  req.end()
}

testWebhookEndpoint()
