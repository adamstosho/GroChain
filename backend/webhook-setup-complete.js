// COMPLETE WEBHOOK SETUP SOLUTION
// Sets up ngrok and provides exact webhook configuration steps

const { spawn } = require('child_process')
const http = require('http')

console.log('🔧 COMPLETE WEBHOOK SETUP FOR PAYSTACK')
console.log('=' .repeat(50))

console.log('\n📋 WHAT WE\'RE GOING TO DO:')
console.log('1. Install ngrok (if not installed)')
console.log('2. Start ngrok tunnel for port 5000')
console.log('3. Get the public HTTPS URL')
console.log('4. Provide exact Paystack configuration steps')
console.log('5. Test the webhook endpoint')

async function setupWebhook() {
  try {
    console.log('\n🚀 STEP 1: Setting up ngrok tunnel...')
    console.log('=' .repeat(40))

    // Check if ngrok is available
    console.log('📥 Checking if ngrok is installed...')
    
    const checkNgrok = spawn('ngrok', ['version'], { shell: true })
    
    checkNgrok.on('error', async () => {
      console.log('❌ ngrok not found, installing...')
      await installNgrok()
    })
    
    checkNgrok.on('close', async (code) => {
      if (code === 0) {
        console.log('✅ ngrok is installed')
        await startNgrokTunnel()
      } else {
        console.log('❌ ngrok not working, installing...')
        await installNgrok()
      }
    })

  } catch (error) {
    console.error('❌ Setup error:', error.message)
    
    // Fallback: Show manual setup instructions
    console.log('\n🔧 MANUAL SETUP INSTRUCTIONS:')
    console.log('=' .repeat(35))
    console.log('1. Install ngrok: npm install -g ngrok')
    console.log('2. Run: ngrok http 5000')
    console.log('3. Copy the https URL (e.g., https://abc123.ngrok.io)')
    console.log('4. Use this URL in Paystack: [URL]/api/payments/verify')
    console.log('5. Configure webhook in Paystack dashboard')
  }
}

async function installNgrok() {
  console.log('📥 Installing ngrok globally...')
  
  return new Promise((resolve, reject) => {
    const install = spawn('npm', ['install', '-g', 'ngrok'], { 
      shell: true,
      stdio: 'inherit'
    })
    
    install.on('close', (code) => {
      if (code === 0) {
        console.log('✅ ngrok installed successfully')
        startNgrokTunnel()
        resolve()
      } else {
        console.log('❌ Failed to install ngrok')
        showManualInstructions()
        resolve()
      }
    })
  })
}

async function startNgrokTunnel() {
  console.log('\n🚀 STEP 2: Starting ngrok tunnel...')
  console.log('🔗 Exposing http://localhost:5000 to the internet...')
  
  const ngrok = spawn('ngrok', ['http', '5000'], { shell: true })
  
  ngrok.stdout.on('data', (data) => {
    console.log('ngrok:', data.toString())
  })
  
  ngrok.stderr.on('data', (data) => {
    console.log('ngrok error:', data.toString())
  })
  
  // Wait for ngrok to start, then get tunnel info
  setTimeout(async () => {
    try {
      const tunnelInfo = await getNgrokTunnelInfo()
      if (tunnelInfo) {
        showWebhookConfiguration(tunnelInfo.public_url)
      } else {
        showManualInstructions()
      }
    } catch (error) {
      console.log('❌ Could not get tunnel info, showing manual instructions')
      showManualInstructions()
    }
  }, 5000)
}

async function getNgrokTunnelInfo() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:4040/api/tunnels', (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          const tunnels = JSON.parse(data)
          const httpsTunnel = tunnels.tunnels.find(t => t.proto === 'https')
          resolve(httpsTunnel)
        } catch (error) {
          reject(error)
        }
      })
    })
    
    req.on('error', reject)
    req.setTimeout(5000, () => {
      req.destroy()
      reject(new Error('Timeout'))
    })
  })
}

function showWebhookConfiguration(tunnelUrl) {
  const webhookUrl = `${tunnelUrl}/api/payments/verify`
  
  console.log('\n🎉 NGROK TUNNEL ACTIVE!')
  console.log('=' .repeat(30))
  console.log(`🔗 Public URL: ${tunnelUrl}`)
  console.log(`🎯 Webhook URL: ${webhookUrl}`)
  
  console.log('\n📋 PAYSTACK CONFIGURATION STEPS:')
  console.log('=' .repeat(40))
  console.log('1. 🌐 Go to: https://dashboard.paystack.com/settings/webhooks')
  console.log('2. ➕ Click: "Add Webhook"')
  console.log(`3. 🔗 Webhook URL: ${webhookUrl}`)
  console.log('4. ✅ Select Events:')
  console.log('   - charge.success ✓')
  console.log('   - charge.failed ✓')
  console.log('5. 💾 Click "Save"')
  
  console.log('\n🧪 TEST THE WEBHOOK:')
  console.log('=' .repeat(25))
  console.log('1. Make a test payment (small amount)')
  console.log('2. Complete payment on Paystack')
  console.log('3. Check order status → Should show "paid" in 2-3 seconds')
  console.log('4. Check Paystack webhook logs for delivery confirmation')
  
  console.log('\n⚠️ IMPORTANT NOTES:')
  console.log('=' .repeat(25))
  console.log('🔴 Keep this terminal window open')
  console.log('🔴 ngrok tunnel will stay active')
  console.log('🔴 If you close this, webhook will stop working')
  console.log('🔴 Press Ctrl+C to stop ngrok')
  
  // Test the webhook endpoint
  testWebhookEndpoint(webhookUrl)
}

function showManualInstructions() {
  console.log('\n🔧 MANUAL WEBHOOK SETUP:')
  console.log('=' .repeat(30))
  console.log('Since automatic setup failed, follow these steps:')
  console.log('')
  console.log('1. 📥 Install ngrok:')
  console.log('   npm install -g ngrok')
  console.log('')
  console.log('2. 🚀 Start ngrok:')
  console.log('   ngrok http 5000')
  console.log('')
  console.log('3. 🔗 Copy the HTTPS URL (looks like: https://abc123.ngrok.io)')
  console.log('')
  console.log('4. 🌐 Go to Paystack dashboard:')
  console.log('   https://dashboard.paystack.com/settings/webhooks')
  console.log('')
  console.log('5. ➕ Add webhook with:')
  console.log('   URL: [Your ngrok URL]/api/payments/verify')
  console.log('   Events: charge.success, charge.failed')
  console.log('')
  console.log('6. 🧪 Test with a payment')
  
  console.log('\n💡 ALTERNATIVE: Use auto-verification')
  console.log('If webhook setup is too complex, run:')
  console.log('node simple-auto-verify.js')
}

async function testWebhookEndpoint(url) {
  console.log('\n🧪 TESTING WEBHOOK ENDPOINT...')
  
  const testData = JSON.stringify({
    event: 'charge.success',
    data: {
      id: 12345,
      reference: 'WEBHOOK_TEST_' + Date.now(),
      amount: 10000,
      currency: 'NGN',
      status: 'success',
      customer: { email: 'test@example.com' }
    }
  })

  try {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
      }
    }

    const https = require('https')
    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Webhook endpoint test SUCCESSFUL!')
        console.log('🎉 Your webhook is ready to receive Paystack events')
      } else {
        console.log(`❌ Webhook test failed: ${res.statusCode}`)
      }
    })

    req.on('error', (error) => {
      console.log(`❌ Webhook test error: ${error.message}`)
    })

    req.write(testData)
    req.end()

  } catch (error) {
    console.log(`❌ Webhook test failed: ${error.message}`)
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping webhook setup...')
  console.log('💡 You can restart anytime with: node webhook-setup-complete.js')
  process.exit(0)
})

// Start the setup
setupWebhook()
