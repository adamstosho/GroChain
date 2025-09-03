// PAYSTACK WEBHOOK CONFIGURATION GUIDE
// Complete guide for setting up webhooks properly

console.log('🔧 PAYSTACK WEBHOOK CONFIGURATION GUIDE')
console.log('=' .repeat(60))

console.log('\n⚠️ IMPORTANT: LOCALHOST WEBHOOK LIMITATION')
console.log('=' .repeat(50))
console.log('❌ Issue: Paystack cannot reach http://localhost:5000 from the internet')
console.log('💡 Reason: localhost is only accessible from your computer')
console.log('🌐 Solution: Use a tunneling service to expose localhost to the internet')

console.log('\n📋 RECOMMENDED SOLUTIONS:')
console.log('=' .repeat(30))

console.log('\n1️⃣ OPTION A: Use ngrok (Recommended for Development)')
console.log('   📥 Install: npm install -g ngrok')
console.log('   🚀 Run: ngrok http 5000')
console.log('   🔗 Copy the https URL (e.g., https://abc123.ngrok.io)')
console.log('   📝 Use in Paystack: https://abc123.ngrok.io/api/payments/verify')

console.log('\n2️⃣ OPTION B: Use localtunnel')
console.log('   📥 Install: npm install -g localtunnel')
console.log('   🚀 Run: lt --port 5000')
console.log('   🔗 Copy the https URL')
console.log('   📝 Use in Paystack webhook')

console.log('\n3️⃣ OPTION C: Deploy to Production')
console.log('   🌐 Deploy your backend to Heroku/Railway/Vercel')
console.log('   🔗 Use production URL in webhook')
console.log('   📝 Example: https://yourapp.herokuapp.com/api/payments/verify')

console.log('\n4️⃣ OPTION D: Use Auto-Verification (No Webhook Needed)')
console.log('   🔄 Run: node start-auto-verifier.js')
console.log('   ⏰ Checks payments every 30 seconds')
console.log('   ✅ Updates status automatically')
console.log('   💡 Perfect for development/testing')

console.log('\n🎯 STEP-BY-STEP WEBHOOK SETUP:')
console.log('=' .repeat(40))

console.log('\nStep 1: Expose your localhost (Choose one option above)')
console.log('Step 2: Configure Paystack webhook:')
console.log('   🌐 Go to: https://dashboard.paystack.com/settings/webhooks')
console.log('   ➕ Click: "Add Webhook"')
console.log('   🔗 URL: [Your ngrok/tunnel URL]/api/payments/verify')
console.log('   ✅ Events: charge.success, charge.failed')
console.log('   💾 Save configuration')

console.log('\nStep 3: Test the webhook:')
console.log('   🧪 Make a test payment')
console.log('   👀 Check webhook logs in Paystack dashboard')
console.log('   ✅ Verify order status updates to "paid"')

console.log('\n🔍 WEBHOOK TESTING COMMANDS:')
console.log('=' .repeat(35))
console.log('# Test webhook endpoint locally:')
console.log('curl -X POST http://localhost:5000/api/payments/verify \\')
console.log('  -H "Content-Type: application/json" \\')
console.log('  -d \'{"event":"charge.success","data":{"reference":"TEST_123","status":"success"}}\'')

console.log('\n# Monitor webhook calls:')
console.log('node webhook-monitor.js')

console.log('\n# Auto-verify payments (backup solution):')
console.log('node start-auto-verifier.js')

console.log('\n🎨 DEVELOPMENT WORKFLOW:')
console.log('=' .repeat(30))
console.log('1. Start your backend: npm start')
console.log('2. Start ngrok: ngrok http 5000')
console.log('3. Copy ngrok URL to Paystack webhook')
console.log('4. Test payments → Should auto-update to "paid"')
console.log('5. For backup: Run auto-verifier service')

console.log('\n💡 PRO TIPS:')
console.log('=' .repeat(15))
console.log('✅ Use HTTPS URLs for webhooks (required by Paystack)')
console.log('✅ Test webhook with small amounts first')
console.log('✅ Monitor webhook delivery logs in Paystack')
console.log('✅ Keep auto-verifier running as backup')
console.log('✅ Use webhook signature verification in production')

console.log('\n🚨 PRODUCTION CONSIDERATIONS:')
console.log('=' .repeat(35))
console.log('🔒 Enable webhook signature verification')
console.log('🌐 Use production domain (not localhost)')
console.log('📊 Set up monitoring and alerting')
console.log('🔄 Implement retry mechanisms')
console.log('💾 Log all webhook events')

console.log('\n🎯 IMMEDIATE ACTION PLAN:')
console.log('=' .repeat(30))
console.log('For Development (Quick Setup):')
console.log('   1. npm install -g ngrok')
console.log('   2. ngrok http 5000')
console.log('   3. Copy https URL to Paystack')
console.log('   4. Test payment')

console.log('\nFor Production:')
console.log('   1. Deploy backend to cloud service')
console.log('   2. Use production URL in webhook')
console.log('   3. Enable signature verification')
console.log('   4. Set up monitoring')

console.log('\n=' .repeat(60))
console.log('🚀 Ready to configure? Choose your preferred option above!')
console.log('=' .repeat(60))
