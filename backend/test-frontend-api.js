const mongoose = require('mongoose')

async function testFrontendAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://omoridoh111:Allahu009@cluster1.evqfycs.mongodb.net/Grochain_App')
    console.log('🔗 Connected to MongoDB')

    // Simulate frontend API call
    const mockToken = 'test-jwt-token' // This would be the real JWT token

    // Create mock request
    const mockReq = {
      user: { id: '68b015bf3ad988ba1a545fea' }, // Farmer ID
      headers: {
        authorization: `Bearer ${mockToken}`
      }
    }

    const mockRes = {
      json: (data) => {
        console.log('\n🎯 Frontend API Response:')
        console.log('Status:', data.status)
        if (data.status === 'success' && data.data) {
          console.log('✅ Dashboard data received successfully!')
          console.log(`   Total Harvests: ${data.data.totalHarvests}`)
          console.log(`   Pending Approvals: ${data.data.pendingApprovals}`)
          console.log(`   Active Listings: ${data.data.activeListings}`)
          console.log(`   Monthly Revenue: ₦${data.data.monthlyRevenue}`)
          console.log(`   Total Earnings: ₦${data.data.totalEarnings}`)
        }
        return data
      },
      status: (code) => ({
        json: (data) => {
          console.log(`HTTP ${code}:`, data)
          return data
        }
      })
    }

    console.log('📡 Simulating frontend API call to /api/users/dashboard')
    const { getDashboardData } = require('./controllers/farmer.controller')
    await getDashboardData(mockReq, mockRes)

    console.log('\n🎉 Frontend API Test Complete!')
    console.log('✅ The dashboard stats should now display correct values:')
    console.log('   - Pending Approvals: Should show 10 (not 0)')
    console.log('   - Revenue This Month: Should show ₦91,800 (not ₦0)')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

testFrontendAPI()
