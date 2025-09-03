// Browser Console Test for Harvest Stats
// Run this in your browser console at http://localhost:3000/dashboard/harvests

async function testHarvestStatsInBrowser() {
  console.log('🧪 Testing Harvest Stats in Browser Console')
  console.log('==========================================')

  try {
    // Get the API service (assuming it's available globally or in window)
    const apiService = window.apiService || (window.grochain && window.grochain.apiService)

    if (!apiService) {
      console.error('❌ API service not found. Make sure you are on the harvests page.')
      return
    }

    console.log('✅ API service found')

    // Test the harvest stats method
    console.log('\n📊 Calling getHarvestStats()...')
    const response = await apiService.getHarvestStats()
    console.log('📈 Raw API Response:', response)

    // Parse the response
    let statsData
    if (response?.status === 'success' && response?.data) {
      statsData = response.data
      console.log('✅ Found stats in response.data')
    } else if (response?.data) {
      statsData = response.data
      console.log('✅ Found stats in response.data (direct)')
    } else {
      statsData = response
      console.log('⚠️ Using response directly as stats data')
    }

    // Display results
    console.log('\n📋 Harvest Stats Results:')
    console.log('========================')
    console.log('Total Harvests:', statsData?.totalHarvests || 0)
    console.log('Pending:', statsData?.pendingHarvests || 0)
    console.log('Approved:', statsData?.approvedHarvests || 0)
    console.log('Rejected:', statsData?.rejectedHarvests || 0)
    console.log('Total Quantity:', statsData?.totalQuantity || 0)
    console.log('Total Value: ₦' + (statsData?.totalValue || 0))

    console.log('\n✅ Browser test completed!')

    if ((statsData?.totalHarvests || 0) === 0) {
      console.log('\n⚠️ STATS ARE STILL 0! Possible issues:')
      console.log('• Frontend is using cached code')
      console.log('• API authentication failed')
      console.log('• Backend endpoint returning empty data')
      console.log('• No harvests found for current user')
    } else {
      console.log('\n🎉 SUCCESS! Stats are working correctly.')
      console.log('The issue might be browser caching. Try:')
      console.log('• Hard refresh: Ctrl+F5')
      console.log('• Clear browser cache')
      console.log('• Check if frontend server was restarted after code changes')
    }

  } catch (error) {
    console.error('❌ Browser test failed:', error)

    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n🔐 Authentication issue detected!')
      console.log('Try logging out and logging back in.')
    }

    console.log('\n🔧 Debug steps:')
    console.log('1. Check browser Network tab for failed API requests')
    console.log('2. Verify you are logged in')
    console.log('3. Check browser Console for JavaScript errors')
    console.log('4. Try clearing browser cache and hard refreshing')
  }
}

// Auto-run the test
testHarvestStatsInBrowser()

