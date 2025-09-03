const http = require('http')
const jwt = require('./utils/jwt')
const User = require('./models/user.model')
const mongoose = require('mongoose')
require('dotenv').config()

// Test the avatar proxy endpoint
async function testProxyEndpoint() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI_PROD
    if (!mongoUri) {
      console.log('❌ No MongoDB URI found')
      return
    }

    await mongoose.connect(mongoUri)
    console.log('✅ Connected to database')

    // Find a test user
    const testUser = await User.findOne({ role: 'farmer' }).select('_id name email profile.avatar')
    if (!testUser) {
      console.log('❌ No farmer user found')
      return
    }

    if (!testUser.profile?.avatar) {
      console.log('❌ User has no avatar')
      return
    }

    console.log(`🔍 Testing proxy for user: ${testUser.name}`)
    console.log(`📸 Avatar URL: ${testUser.profile.avatar}`)

    // Generate JWT token
    const token = jwt.signAccess({
      id: testUser._id.toString(),
      role: 'farmer',
      email: testUser.email,
      name: testUser.name
    })

    // Extract filename from avatar URL
    const filename = testUser.profile.avatar.split('/').pop()
    console.log(`📄 Filename: ${filename}`)

    // Test proxy endpoint
    console.log('\n🧪 Testing avatar proxy endpoint...')

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/users/avatar/${filename}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }

    console.log(`📡 Testing URL: http://localhost:5000/api/users/avatar/${filename}`)

    const req = http.request(options, (res) => {
      console.log(`📡 Proxy response status: ${res.statusCode}`)
      console.log(`📡 Content-Type: ${res.headers['content-type']}`)
      console.log(`📡 Content-Length: ${res.headers['content-length']}`)

      if (res.statusCode === 200) {
        console.log('✅ Avatar proxy endpoint is working!')
        console.log('🎉 This should resolve the CORS issues')
      } else {
        console.log('❌ Avatar proxy endpoint failed')
        console.log('Response:', res.statusCode)
      }

      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (data.length > 0) {
          console.log(`📄 Received ${data.length} bytes`)
        }
      })
    })

    req.on('error', (e) => {
      console.log('❌ Proxy request failed:', e.message)
    })

    req.end()

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    setTimeout(() => {
      mongoose.disconnect()
    }, 3000)
  }
}

// Run the test
testProxyEndpoint()
