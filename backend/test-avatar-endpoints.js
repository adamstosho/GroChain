const http = require('http')
const mongoose = require('mongoose')
const User = require('./models/user.model')
require('dotenv').config()

// Comprehensive test of avatar endpoints
async function testAvatarEndpoints() {
  console.log('🔍 Testing avatar endpoints...\n')

  // Test 1: Check if backend is running
  console.log('1️⃣ Testing backend health...')
  await testEndpoint('/api/health', 'Backend Health')

  // Test 2: Check avatar proxy endpoint
  console.log('\n2️⃣ Testing avatar proxy endpoint...')
  const testUser = await getTestUser()
  if (testUser && testUser.profile?.avatar) {
    const filename = testUser.profile.avatar.split('/').pop()
    await testEndpoint(`/api/users/avatar/${filename}`, 'Avatar Proxy')
  }

  // Test 3: Check direct static file access
  console.log('\n3️⃣ Testing direct static file access...')
  if (testUser && testUser.profile?.avatar) {
    await testEndpoint(testUser.profile.avatar, 'Direct Static')
  }

  // Test 4: Check if file exists in filesystem
  console.log('\n4️⃣ Checking filesystem...')
  await checkFileExists(testUser)

  console.log('\n🏁 Testing complete!')
}

async function testEndpoint(path, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      timeout: 5000
    }

    const req = http.request(options, (res) => {
      console.log(`   📡 ${name}: ${res.statusCode}`)
      if (res.statusCode === 200) {
        console.log(`   ✅ ${name} endpoint working`)
      } else {
        console.log(`   ❌ ${name} endpoint failed with status ${res.statusCode}`)
      }
      resolve()
    })

    req.on('error', (e) => {
      console.log(`   ❌ ${name} request failed: ${e.message}`)
      resolve()
    })

    req.on('timeout', () => {
      console.log(`   ⏱️ ${name} request timed out`)
      req.destroy()
      resolve()
    })

    req.end()
  })
}

async function getTestUser() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI_PROD
    if (!mongoUri) {
      console.log('❌ No MongoDB URI found')
      return null
    }

    await mongoose.connect(mongoUri)
    console.log('✅ Connected to database')

    const testUser = await User.findOne({ role: 'farmer' }).select('_id name email profile.avatar')
    if (!testUser) {
      console.log('❌ No farmer user found')
      return null
    }

    console.log(`👤 Found test user: ${testUser.name}`)
    console.log(`📸 Avatar URL: ${testUser.profile?.avatar || 'None'}`)

    return testUser
  } catch (error) {
    console.error('❌ Database error:', error.message)
    return null
  }
}

async function checkFileExists(user) {
  if (!user || !user.profile?.avatar) {
    console.log('❌ No avatar to check')
    return
  }

  const fs = require('fs')
  const path = require('path')
  const filename = user.profile.avatar.split('/').pop()
  const filePath = path.join(__dirname, 'uploads', 'avatars', filename)

  console.log(`📁 Checking file: ${filePath}`)

  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath)
    console.log(`✅ File exists: ${stats.size} bytes`)
  } else {
    console.log('❌ File does not exist on filesystem')
    console.log('📂 Checking uploads directory...')
    const uploadsDir = path.join(__dirname, 'uploads', 'avatars')
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir)
      console.log(`📂 Files in uploads/avatars: ${files.length}`)
      files.forEach(file => console.log(`   - ${file}`))
    } else {
      console.log('❌ uploads/avatars directory does not exist')
    }
  }

  setTimeout(() => mongoose.disconnect(), 1000)
}

// Run the comprehensive test
testAvatarEndpoints()
