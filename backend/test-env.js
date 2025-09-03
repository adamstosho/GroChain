require('dotenv').config()

console.log('🔧 Testing environment variable loading...')
console.log('📋 NODE_ENV:', process.env.NODE_ENV)
console.log('🔌 PORT:', process.env.PORT)
console.log('📊 MONGODB_URI:', process.env.MONGODB_URI ? 'Present' : 'Missing')
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? 'Present (' + process.env.JWT_SECRET.length + ' chars)' : 'Missing')
console.log('🌐 CORS_ORIGIN:', process.env.CORS_ORIGIN)

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not loaded!')
  process.exit(1)
}

console.log('✅ Environment variables loaded successfully!')
console.log('🚀 MongoDB URI:', process.env.MONGODB_URI.substring(0, 50) + '...')
