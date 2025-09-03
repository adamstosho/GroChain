const axios = require('axios')

console.log('🔧 Harvest Stats Fix Script')
console.log('===========================')

// This script will help diagnose and fix harvest stats issues

async function diagnoseAndFix() {
  console.log('\n1️⃣ Checking servers...')

  // Check backend
  try {
    const backendRes = await axios.get('http://localhost:5000/api/health')
    console.log('✅ Backend server: RUNNING (Status:', backendRes.status + ')')
  } catch (error) {
    console.log('❌ Backend server: NOT RUNNING')
    console.log('   Please start backend: cd backend && npm start')
    return
  }

  // Check frontend
  try {
    const frontendRes = await axios.get('http://localhost:3000')
    console.log('✅ Frontend server: RUNNING (Status:', frontendRes.status + ')')
  } catch (error) {
    console.log('❌ Frontend server: NOT RUNNING')
    console.log('   Please start frontend: cd client && npm run dev')
    return
  }

  console.log('\n2️⃣ Getting JWT token from browser...')
  console.log('Please follow these steps:')
  console.log('1. Open http://localhost:3000 in your browser')
  console.log('2. Login to your account (Adam Ridwan)')
  console.log('3. Open Developer Tools (F12)')
  console.log('4. Go to Console tab')
  console.log('5. Run: localStorage.getItem("grochain-auth")')
  console.log('6. Copy the token value (without quotes)')
  console.log('7. Paste it below when prompted')

  // For now, let's assume they have the token and provide instructions
  console.log('\n3️⃣ Testing with your JWT token...')

  const token = process.env.JWT_TOKEN

  if (!token) {
    console.log('❌ No JWT_TOKEN found in environment')
    console.log('Please set your token: JWT_TOKEN=your_token_here node fix-harvest-stats.js')
    return
  }

  try {
    console.log('📊 Testing harvest stats API...')
    const response = await axios.get('http://localhost:5000/api/harvests/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ API Response Status:', response.status)

    const data = response.data?.data || response.data
    console.log('\n📈 Harvest Stats Results:')
    console.log('========================')
    console.log('Total Harvests:', data?.totalHarvests || 0)
    console.log('Pending:', data?.pendingHarvests || 0)
    console.log('Approved:', data?.approvedHarvests || 0)
    console.log('Rejected:', data?.rejectedHarvests || 0)
    console.log('Total Quantity:', data?.totalQuantity || 0)
    console.log('Total Value: ₦' + (data?.totalValue || 0))

    if ((data?.totalHarvests || 0) > 0) {
      console.log('\n✅ SUCCESS! API is working correctly.')
      console.log('If frontend still shows 0, try:')
      console.log('• Hard refresh browser: Ctrl+F5')
      console.log('• Clear browser cache')
      console.log('• Restart frontend server')
    } else {
      console.log('\n⚠️ API returned 0 values. Possible issues:')
      console.log('• No harvests found for this user')
      console.log('• Database connection issue')
      console.log('• Wrong user ID in token')
    }

  } catch (error) {
    console.error('\n❌ API Test Failed:', error.message)

    if (error.response?.status === 401) {
      console.log('🔐 Authentication failed - token might be expired')
      console.log('Please get a fresh token from browser')
    }
  }
}

diagnoseAndFix()

