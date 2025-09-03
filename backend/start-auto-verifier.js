// Start automatic payment verification service
const { AutoPaymentVerifier } = require('./auto-verify-payments')

console.log('🚀 STARTING AUTOMATIC PAYMENT VERIFICATION SERVICE')
console.log('=' .repeat(60))

const verifier = new AutoPaymentVerifier()

// Start the service
verifier.startAutoVerification().then(() => {
  console.log('\n✅ AUTO-VERIFICATION SERVICE STARTED')
  console.log('🔄 Will check for new payments every 30 seconds')
  console.log('💡 This ensures all future payments show as "paid" automatically')
  console.log('\n📋 What this service does:')
  console.log('   1. Checks for new pending transactions every 30 seconds')
  console.log('   2. Verifies payment status with Paystack API')
  console.log('   3. Updates successful payments to "paid" status')
  console.log('   4. Works as backup to webhook system')
  console.log('\n🛑 To stop this service, press Ctrl+C')
  console.log('=' .repeat(60))
}).catch(error => {
  console.error('❌ Failed to start auto-verification service:', error)
  process.exit(1)
})

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down auto-verification service...')
  await verifier.stopAutoVerification()
  console.log('✅ Service stopped gracefully')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down auto-verification service...')
  await verifier.stopAutoVerification()
  console.log('✅ Service stopped gracefully')
  process.exit(0)
})
