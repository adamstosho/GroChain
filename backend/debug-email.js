// Simple email debug script
require('dotenv').config()

console.log('🔍 Debugging Email Configuration...\n')

// Check environment variables
console.log('📧 Environment Variables:')
console.log('  EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER || 'NOT SET')
console.log('  SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'EXISTS' : 'NOT SET')
console.log('  SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || 'NOT SET')
console.log('  SENDGRID_FROM_NAME:', process.env.SENDGRID_FROM_NAME || 'NOT SET')
console.log('  SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET')
console.log('  SMTP_USER:', process.env.SMTP_USER || 'NOT SET')
console.log('  SMTP_PASS:', process.env.SMTP_PASS ? 'EXISTS' : 'NOT SET')
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET')
console.log('  NODE_ENV:', process.env.NODE_ENV || 'NOT SET')

// Test SendGrid connection
if (process.env.SENDGRID_API_KEY) {
  console.log('\n🧪 Testing SendGrid...')
  try {
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    console.log('✅ SendGrid initialized successfully')
    
    // Test a simple email
    const testMsg = {
      to: 'test@example.com',
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'grochain.ng@gmail.com',
        name: process.env.SENDGRID_FROM_NAME || 'GroChain'
      },
      subject: 'Test Email',
      html: '<p>This is a test email</p>'
    }
    
    console.log('📧 Test message config:', {
      to: testMsg.to,
      from: testMsg.from,
      subject: testMsg.subject
    })
    
  } catch (error) {
    console.error('❌ SendGrid error:', error.message)
  }
}

// Test nodemailer
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  console.log('\n🧪 Testing SMTP...')
  try {
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE) === 'true',
      auth: { 
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
      },
    })
    console.log('✅ SMTP transporter created successfully')
  } catch (error) {
    console.error('❌ SMTP error:', error.message)
  }
}

console.log('\n�� Debug complete!')

