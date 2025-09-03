const mongoose = require('mongoose')
const User = require('./models/user.model')
const http = require('http')
require('dotenv').config()

// Test avatar display functionality
async function testAvatarDisplay() {
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

    console.log(`🔍 Testing avatar display for user: ${testUser.name} (${testUser.email})`)
    console.log(`📸 Avatar URL in database: ${testUser.profile?.avatar || 'None'}`)

    if (!testUser.profile?.avatar) {
      console.log('⚠️ No avatar found in database')
      return
    }

    const avatarUrl = testUser.profile.avatar
    console.log(`🔗 Full avatar URL: http://localhost:5000${avatarUrl}`)

    // Test if the avatar file is accessible via static serving
    console.log('\n🧪 Testing static file serving...')

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: avatarUrl,
      method: 'GET'
    }

    console.log(`📡 Testing URL: http://localhost:5000${avatarUrl}`)

    const req = http.request(options, (res) => {
      console.log(`📡 Static file response status: ${res.statusCode}`)
      console.log(`📡 Content-Type: ${res.headers['content-type']}`)
      console.log(`📡 Content-Length: ${res.headers['content-length']}`)

      if (res.statusCode === 200) {
        console.log('✅ Avatar file is accessible via static serving')
      } else {
        console.log('❌ Avatar file is NOT accessible via static serving')
        console.log('💡 Possible causes:')
        console.log('1. Backend server not running')
        console.log('2. Static file serving not configured correctly')
        console.log('3. File does not exist')
        console.log('4. Wrong file path')
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
      console.error(`❌ Static file request failed: ${e.message}`)
      console.log('💡 Make sure the backend server is running on port 5000')
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
testAvatarDisplay()
