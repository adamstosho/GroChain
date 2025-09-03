const mongoose = require('mongoose')
const jwt = require('./utils/jwt')
const User = require('./models/user.model')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Comprehensive test for avatar upload debugging
async function testAvatarUploadDebug() {
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
    const testUser = await User.findOne({ role: 'farmer' }).select('_id name email')
    if (!testUser) {
      console.log('❌ No farmer user found. Please create a farmer user first.')
      return
    }

    console.log(`🔍 Testing with user: ${testUser.name} (${testUser.email})`)
    console.log(`🆔 User ID: ${testUser._id}`)

    // Generate a JWT token for the user
    const token = jwt.signAccess({
      id: testUser._id.toString(),
      role: 'farmer',
      email: testUser.email,
      name: testUser.name
    })

    console.log(`🔑 Generated JWT token: ${token.substring(0, 50)}...`)

    // Test the token verification
    const decoded = jwt.verifyAccess(token)
    console.log(`✅ Token verification successful:`, {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name
    })

    // Test the avatar upload endpoint directly
    console.log('\n🧪 Testing avatar upload endpoint...')

    const http = require('http')
    const FormData = require('form-data')

    // Create a test file (simple text file for testing)
    const testFilePath = path.join(__dirname, 'test-avatar.txt')
    fs.writeFileSync(testFilePath, 'This is a test avatar file')

    // Create form data
    const form = new FormData()
    form.append('avatar', fs.createReadStream(testFilePath), {
      filename: 'test-avatar.jpg',
      contentType: 'image/jpeg'
    })

    const formHeaders = form.getHeaders()
    console.log('📄 Form headers:', formHeaders)

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/upload-avatar',
      method: 'POST',
      headers: {
        ...formHeaders,
        'Authorization': `Bearer ${token}`
      }
    }

    console.log('📡 Request options:', {
      ...options,
      headers: {
        ...options.headers,
        Authorization: options.headers.Authorization.substring(0, 50) + '...'
      }
    })

    const req = http.request(options, (res) => {
      console.log(`📡 Avatar upload response status: ${res.statusCode}`)

      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        console.log('📡 Raw response:', data)
        try {
          const response = JSON.parse(data)
          console.log('📡 Parsed response:', response)
        } catch (e) {
          console.log('📡 Could not parse response as JSON')
        }

        // Clean up test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath)
        }
      })
    })

    req.on('error', (e) => {
      console.error(`❌ Avatar upload request failed: ${e.message}`)
      console.log('💡 Possible causes:')
      console.log('1. Backend server not running')
      console.log('2. CORS issue')
      console.log('3. Authentication middleware issue')
      console.log('4. Multer configuration issue')
    })

    // Pipe the form data to the request
    form.pipe(req)

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
testAvatarUploadDebug()
