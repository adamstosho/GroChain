const http = require('http')
const mongoose = require('mongoose')
const User = require('./models/user.model')
require('dotenv').config()

// Test current avatar functionality
async function testCurrentAvatar() {
  console.log('🔍 Testing current avatar functionality...\n')

  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI_PROD
    if (!mongoUri) {
      console.log('❌ No MongoDB URI found')
      return
    }

    await mongoose.connect(mongoUri)
    console.log('✅ Connected to database')

    // Get current user
    const testUser = await User.findOne({ role: 'farmer' }).select('_id name email profile.avatar')
    if (!testUser) {
      console.log('❌ No farmer user found')
      return
    }

    console.log(`👤 User: ${testUser.name}`)
    console.log(`📸 Current avatar in DB: ${testUser.profile?.avatar || 'None'}`)

    if (!testUser.profile?.avatar) {
      console.log('❌ User has no avatar')
      return
    }

    const filename = testUser.profile.avatar.split('/').pop()
    console.log(`📄 Filename: ${filename}`)

    // Test 1: Backend health
    console.log('\n1️⃣ Testing backend health...')
    await makeRequest('GET', '/api/health', null, 'Health Check')

    // Test 2: Avatar proxy endpoint
    console.log('\n2️⃣ Testing avatar proxy endpoint...')
    await makeRequest('GET', `/api/users/avatar/${filename}`, null, 'Avatar Proxy')

    // Test 3: Direct static file access
    console.log('\n3️⃣ Testing direct static file access...')
    await makeRequest('GET', testUser.profile.avatar, null, 'Direct Static')

    // Test 4: Check CORS headers on static file
    console.log('\n4️⃣ Testing CORS headers...')
    await testCORSHeaders(testUser.profile.avatar)

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    setTimeout(() => mongoose.disconnect(), 1000)
  }
}

async function makeRequest(method, path, data = null, name = 'Request') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    if (method === 'POST' && data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data))
    }

    const req = http.request(options, (res) => {
      console.log(`   📡 ${name}: ${res.statusCode}`)
      if (res.statusCode === 200) {
        console.log(`   ✅ ${name} working`)
      } else {
        console.log(`   ❌ ${name} failed with status ${res.statusCode}`)
      }
      resolve()
    })

    req.on('error', (e) => {
      console.log(`   ❌ ${name} error: ${e.message}`)
      resolve()
    })

    req.setTimeout(5000, () => {
      console.log(`   ⏱️ ${name} timeout`)
      req.destroy()
      resolve()
    })

    if (method === 'POST' && data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

async function testCORSHeaders(avatarPath) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: avatarPath,
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000'
      }
    }

    const req = http.request(options, (res) => {
      console.log(`   📡 CORS Origin: ${res.headers['access-control-allow-origin']}`)
      console.log(`   📡 CORS Methods: ${res.headers['access-control-allow-methods']}`)
      console.log(`   📡 CORS Credentials: ${res.headers['access-control-allow-credentials']}`)

      if (res.headers['access-control-allow-origin'] === 'http://localhost:3000') {
        console.log(`   ✅ CORS headers correct`)
      } else {
        console.log(`   ❌ CORS headers missing or incorrect`)
      }
      resolve()
    })

    req.on('error', (e) => {
      console.log(`   ❌ CORS test error: ${e.message}`)
      resolve()
    })

    req.setTimeout(5000, () => {
      req.destroy()
      resolve()
    })

    req.end()
  })
}

// Run the test
testCurrentAvatar()
