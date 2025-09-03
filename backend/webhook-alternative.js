// WEBHOOK ALTERNATIVE SOLUTION
// Auto-verification service that works without webhooks

const { AutoPaymentVerifier } = require('./auto-verify-payments')

console.log('🚀 WEBHOOK ALTERNATIVE: AUTO-VERIFICATION SERVICE')
console.log('=' .repeat(60))

console.log('\n💡 WHY USE THIS INSTEAD OF WEBHOOKS?')
console.log('✅ No need to expose localhost to internet')
console.log('✅ No need for ngrok or tunneling services')
console.log('✅ Works immediately without external setup')
console.log('✅ Perfect for development and testing')
console.log('✅ Reliable fallback for production')

console.log('\n🔄 HOW IT WORKS:')
console.log('1. Monitors database for pending transactions')
console.log('2. Checks with Paystack API every 30 seconds')
console.log('3. Updates successful payments to "paid" status')
console.log('4. Runs continuously in the background')

console.log('\n🎯 BENEFITS:')
console.log('✅ Immediate setup (no configuration needed)')
console.log('✅ Works with localhost development')
console.log('✅ No external dependencies')
console.log('✅ Handles webhook failures gracefully')
console.log('✅ Perfect for development environment')

console.log('\n🚀 STARTING AUTO-VERIFICATION SERVICE...')
console.log('=' .repeat(45))

const verifier = new AutoPaymentVerifier()

async function startService() {
  try {
    await verifier.startAutoVerification()
    
    console.log('\n✅ AUTO-VERIFICATION SERVICE ACTIVE!')
    console.log('🔄 Checking for new payments every 30 seconds')
    console.log('💡 All successful payments will automatically show as "paid"')
    console.log('\n📊 Service Status:')
    console.log('   🟢 Payment Monitoring: ACTIVE')
    console.log('   🟢 Paystack API: CONNECTED')
    console.log('   🟢 Database Updates: ENABLED')
    console.log('   🟢 Auto-Verification: RUNNING')
    
    console.log('\n🎉 READY FOR PAYMENTS!')
    console.log('Make any payment now and it will automatically update to "paid"')
    console.log('\n🛑 To stop this service, press Ctrl+C')
    console.log('=' .repeat(60))

    // Keep the process running
    process.stdin.resume()

  } catch (error) {
    console.error('❌ Failed to start service:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down auto-verification service...')
  await verifier.stopAutoVerification()
  console.log('✅ Service stopped gracefully')
  console.log('💡 You can restart anytime with: node webhook-alternative.js')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down auto-verification service...')
  await verifier.stopAutoVerification()
  console.log('✅ Service stopped gracefully')
  process.exit(0)
})

// Start the service
startService()
