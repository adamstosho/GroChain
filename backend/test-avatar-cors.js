const mongoose = require('mongoose')
const User = require('./models/user.model')
const http = require('http')
require('dotenv').config()

// Test CORS headers for avatar serving
async function testAvatarCORS() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI_PROD
    if (!mongoUri) {
      console.log('❌ No MongoDB URI found in environment variables')
      return
    }

    await mongoose.connect(mongoUri)
    console.log('✅ Connected to database')

    // Find a test farmer user
    const testUser = await User.findOne({ role: 'farmer' }).select('_id name email profile.avatar')
    if (!testUser) {
      console.log('❌ No farmer user found. Please create a farmer user first.')
      return
    }

    console.log(`🔍 Testing CORS for user: ${testUser.name}`)

    if (!testUser.profile?.avatar) {
      console.log('⚠️ No avatar found in database')
      return
    }

    const avatarUrl = testUser.profile.avatar
    console.log(`📸 Avatar URL: ${avatarUrl}`)

    // Test CORS headers
    console.log('\n🧪 Testing CORS headers...')

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: avatarUrl,
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'User-Agent': 'Mozilla/5.0'
      }
    }

    console.log(`📡 Testing CORS with Origin: http://localhost:3000`)

    const req = http.request(options, (res) => {
      console.log(`📡 Response status: ${res.statusCode}`)
      console.log(`📡 Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`)
      console.log(`📡 Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods']}`)
      console.log(`📡 Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers']}`)
      console.log(`📡 Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials']}`)
      console.log(`📡 Content-Type: ${res.headers['content-type']}`)
      console.log(`📡 Content-Length: ${res.headers['content-length']}`)

      if (res.statusCode === 200) {
        console.log('✅ Avatar file is accessible')
        if (res.headers['access-control-allow-origin'] === 'http://localhost:3000') {
          console.log('✅ CORS headers are correctly set')
        } else {
          console.log('❌ CORS headers are missing or incorrect')
        }
      } else {
        console.log('❌ Avatar file is not accessible')
      }

      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (data.length > 0) {
          console.log(`📄 File size: ${data.length} bytes`)
        }
      })
    })

    req.on('error', (e) => {
      console.error(`❌ Request failed: ${e.message}`)
    })

    req.end()

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    setTimeout(() => {
      mongoose.disconnect()
      console.log('📪 Disconnected from database')
    }, 3000)
  }
}

// Run the test
testAvatarCORS()
