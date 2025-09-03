// NGROK WEBHOOK SETUP AUTOMATION
// Helps set up ngrok tunnel for Paystack webhook

const { spawn } = require('child_process')
const http = require('http')

class NgrokWebhookSetup {
  constructor() {
    this.ngrokProcess = null
    this.tunnelUrl = null
  }

  // Check if ngrok is installed
  async checkNgrokInstalled() {
    return new Promise((resolve) => {
      const check = spawn('ngrok', ['--version'], { shell: true })
      
      check.on('error', () => {
        resolve(false)
      })
      
      check.on('close', (code) => {
        resolve(code === 0)
      })
    })
  }

  // Install ngrok
  async installNgrok() {
    console.log('📥 Installing ngrok...')
    
    return new Promise((resolve, reject) => {
      const install = spawn('npm', ['install', '-g', 'ngrok'], { 
        shell: true,
        stdio: 'inherit'
      })
      
      install.on('close', (code) => {
        if (code === 0) {
          console.log('✅ ngrok installed successfully')
          resolve(true)
        } else {
          console.log('❌ Failed to install ngrok')
          reject(new Error('ngrok installation failed'))
        }
      })
    })
  }

  // Start ngrok tunnel
  async startNgrokTunnel(port = 5000) {
    console.log(`🚀 Starting ngrok tunnel for port ${port}...`)
    
    return new Promise((resolve, reject) => {
      this.ngrokProcess = spawn('ngrok', ['http', port.toString()], { 
        shell: true
      })
      
      let output = ''
      
      this.ngrokProcess.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      this.ngrokProcess.stderr.on('data', (data) => {
        console.log('ngrok stderr:', data.toString())
      })
      
      // Wait a bit for ngrok to start
      setTimeout(async () => {
        try {
          const tunnelInfo = await this.getNgrokTunnelInfo()
          if (tunnelInfo) {
            this.tunnelUrl = tunnelInfo.public_url
            console.log(`✅ ngrok tunnel started: ${this.tunnelUrl}`)
            resolve(this.tunnelUrl)
          } else {
            reject(new Error('Could not get tunnel information'))
          }
        } catch (error) {
          reject(error)
        }
      }, 3000)
    })
  }

  // Get tunnel information from ngrok API
  async getNgrokTunnelInfo() {
    return new Promise((resolve, reject) => {
      const req = http.get('http://localhost:4040/api/tunnels', (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
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
      
      req.on('error', (error) => {
        reject(error)
      })
      
      req.setTimeout(5000, () => {
        req.destroy()
        reject(new Error('Timeout getting tunnel info'))
      })
    })
  }

  // Test webhook endpoint
  async testWebhookEndpoint(url) {
    console.log(`🧪 Testing webhook endpoint: ${url}`)
    
    const testData = JSON.stringify({
      event: 'charge.success',
      data: {
        id: 12345,
        reference: 'NGROK_TEST_' + Date.now(),
        amount: 10000,
        currency: 'NGN',
        status: 'success',
        customer: { email: 'test@example.com' },
        metadata: { test: true }
      }
    })

    return new Promise((resolve, reject) => {
      const urlObj = new URL(url)
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(testData)
        }
      }

      const protocol = urlObj.protocol === 'https:' ? require('https') : require('http')
      
      const req = protocol.request(options, (res) => {
        let responseData = ''
        
        res.on('data', (chunk) => {
          responseData += chunk
        })
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ Webhook endpoint test successful')
            resolve(true)
          } else {
            console.log(`❌ Webhook test failed: ${res.statusCode}`)
            resolve(false)
          }
        })
      })
      
      req.on('error', (error) => {
        console.log(`❌ Webhook test error: ${error.message}`)
        resolve(false)
      })
      
      req.setTimeout(10000, () => {
        req.destroy()
        console.log('❌ Webhook test timeout')
        resolve(false)
      })
      
      req.write(testData)
      req.end()
    })
  }

  // Stop ngrok tunnel
  stopNgrokTunnel() {
    if (this.ngrokProcess) {
      console.log('🛑 Stopping ngrok tunnel...')
      this.ngrokProcess.kill('SIGTERM')
      this.ngrokProcess = null
      this.tunnelUrl = null
      console.log('✅ ngrok tunnel stopped')
    }
  }

  // Complete setup process
  async setupWebhook() {
    try {
      console.log('🔧 SETTING UP NGROK WEBHOOK')
      console.log('=' .repeat(40))

      // Check if ngrok is installed
      const isInstalled = await this.checkNgrokInstalled()
      
      if (!isInstalled) {
        console.log('📥 ngrok not found, installing...')
        await this.installNgrok()
      } else {
        console.log('✅ ngrok is already installed')
      }

      // Start tunnel
      const tunnelUrl = await this.startNgrokTunnel(5000)
      const webhookUrl = `${tunnelUrl}/api/payments/verify`

      console.log('\n🎉 WEBHOOK SETUP COMPLETE!')
      console.log('=' .repeat(30))
      console.log(`🔗 Tunnel URL: ${tunnelUrl}`)
      console.log(`🎯 Webhook URL: ${webhookUrl}`)

      // Test the endpoint
      const testResult = await this.testWebhookEndpoint(webhookUrl)

      console.log('\n📋 NEXT STEPS:')
      console.log('=' .repeat(20))
      console.log('1. Go to: https://dashboard.paystack.com/settings/webhooks')
      console.log('2. Click: "Add Webhook"')
      console.log(`3. URL: ${webhookUrl}`)
      console.log('4. Events: charge.success, charge.failed')
      console.log('5. Save the configuration')
      console.log('6. Test with a payment')

      console.log('\n⚠️ IMPORTANT:')
      console.log('- Keep this terminal window open')
      console.log('- ngrok tunnel will stay active')
      console.log('- Press Ctrl+C to stop')

      return webhookUrl

    } catch (error) {
      console.error('❌ Setup failed:', error.message)
      throw error
    }
  }
}

// Export for use as module
module.exports = NgrokWebhookSetup

// CLI usage
if (require.main === module) {
  const setup = new NgrokWebhookSetup()
  
  setup.setupWebhook().then((webhookUrl) => {
    console.log(`\n✅ Webhook URL ready: ${webhookUrl}`)
    console.log('🎯 Configure this URL in your Paystack dashboard')
    
    // Keep process running
    process.on('SIGINT', () => {
      setup.stopNgrokTunnel()
      process.exit(0)
    })
    
  }).catch((error) => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  })
}
