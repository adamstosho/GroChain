require('dotenv').config({ path: './.env' })
const cloudinary = require('cloudinary').v2

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

async function testCloudinaryConnection() {
  try {
    console.log('🔧 Testing Cloudinary connection...')
    console.log('📋 Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME)
    console.log('🔑 API Key:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing')
    console.log('🔐 API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing')

    // Test basic connection
    const result = await cloudinary.api.ping()
    console.log('✅ Cloudinary connection successful!')
    console.log('📊 Ping result:', result)

    // Test upload capability (small test image)
    console.log('\n📤 Testing file upload...')
    const testResult = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==', {
      folder: 'grochain/test',
      public_id: `test_${Date.now()}`,
      resource_type: 'image'
    })

    console.log('✅ Test upload successful!')
    console.log('🔗 Test image URL:', testResult.secure_url)
    console.log('🆔 Public ID:', testResult.public_id)

    // Clean up test file
    await cloudinary.uploader.destroy(testResult.public_id)
    console.log('🧹 Test file cleaned up')

  } catch (error) {
    console.error('❌ Cloudinary test failed:', error?.message || error)
    console.error('🔍 Error details:', error)

    if (error?.message?.includes('ENOTFOUND')) {
      console.log('\n💡 Possible issues:')
      console.log('1. Check your internet connection')
      console.log('2. Verify Cloudinary credentials are correct')
      console.log('3. Ensure Cloudinary account is active')
    } else if (error?.message?.includes('Must supply')) {
      console.log('\n💡 Configuration issues:')
      console.log('1. Check if .env file exists and contains Cloudinary credentials')
      console.log('2. Verify the environment variable names match')
      console.log('3. Ensure dotenv is loading the .env file correctly')
    }
  }
}

testCloudinaryConnection()
