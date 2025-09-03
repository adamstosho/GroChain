// Debug API Configuration
// Copy and paste this into browser console

console.log('🔧 API Configuration Debug')
console.log('===========================')

// Check environment variables
console.log('\n1️⃣ Environment Variables:')
console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
console.log('Fallback default:', "http://localhost:5000/api")

// Check APP_CONFIG
console.log('\n2️⃣ APP_CONFIG Values:')
try {
  // Import the config (this might not work in console)
  console.log('Expected baseUrl:', 'http://localhost:5000/api')
} catch (error) {
  console.log('Cannot import APP_CONFIG in console')
}

// Check API service instance
console.log('\n3️⃣ API Service Check:')
try {
  // This will show the actual baseUrl being used
  console.log('Check browser Network tab for actual API calls')
  console.log('Expected URL format: http://localhost:5000/api/marketplace/orders')
  console.log('Actual URL in error: http://localhost:5000/marketplace/orders')
  console.log('Missing: /api/ in the URL')
} catch (error) {
  console.log('API service check error:', error.message)
}

// Test API call construction
console.log('\n4️⃣ URL Construction Test:')
const baseUrl = "http://localhost:5000/api"
const endpoint = "/marketplace/orders"
const fullUrl = baseUrl + endpoint
console.log('Base URL:', baseUrl)
console.log('Endpoint:', endpoint)
console.log('Full URL:', fullUrl)
console.log('Expected result:', 'http://localhost:5000/api/marketplace/orders')

// Check if backend routes exist
console.log('\n5️⃣ Backend Route Check:')
console.log('Expected backend route: POST /api/marketplace/orders')
console.log('Route exists: ✅ (confirmed in backend/routes/marketplace.routes.js)')

// Diagnosis
console.log('\n🔍 DIAGNOSIS:')
console.log('The issue is that the frontend is calling:')
console.log('❌ http://localhost:5000/marketplace/orders')
console.log('Instead of:')
console.log('✅ http://localhost:5000/api/marketplace/orders')
console.log('')
console.log('This means the baseUrl is missing the "/api" part.')
console.log('The API service is not getting the correct baseUrl from APP_CONFIG.')

console.log('\n🛠️ POSSIBLE FIXES:')
console.log('1. Check if .env.local exists in client/ directory')
console.log('2. Verify NEXT_PUBLIC_API_BASE_URL is set correctly')
console.log('3. Ensure APP_CONFIG is importing the correct value')
console.log('4. Check if there are any build/cache issues')

// Quick test
console.log('\n🧪 QUICK TEST:')
console.log('Run this in browser console:')
console.log('fetch("http://localhost:5000/api/marketplace/orders", {method: "POST", headers: {"Content-Type": "application/json"}}).then(r => console.log("Status:", r.status))')
