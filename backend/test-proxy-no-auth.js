const http = require('http')
const mongoose = require('mongoose')
const User = require('./models/user.model')
require('dotenv').config()

// Test the avatar proxy endpoint without authentication
async function testProxyNoAuth() {
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

    // Extract filename from avatar URL
    const filename = testUser.profile.avatar.split('/').pop()
    console.log(`📄 Filename: ${filename}`)

    // Test proxy endpoint without authentication
    console.log('\n🧪 Testing avatar proxy endpoint (no auth required)...')

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/users/avatar/${filename}`,
      method: 'GET'
    }

    console.log(`📡 Testing URL: http://localhost:5000/api/users/avatar/${filename}`)

    const req = http.request(options, (res) => {
      console.log(`📡 Proxy response status: ${res.statusCode}`)
      console.log(`📡 Content-Type: ${res.headers['content-type']}`)
      console.log(`📡 Content-Length: ${res.headers['content-length']}`)

      if (res.statusCode === 200) {
        console.log('✅ Avatar proxy endpoint working without authentication!')
        console.log('🎉 Frontend should now be able to load avatars')
      } else {
        console.log('❌ Avatar proxy endpoint failed')
        console.log('Response:', res.statusCode)

        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          console.log('Error response:', data)
        })
      }
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
testProxyNoAuth()
