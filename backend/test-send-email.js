// Test the actual sendEmail function
require('dotenv').config()

// Import the sendEmail function from auth controller
const { sendEmail } = require('./controllers/auth.controller')

async function testSendEmail() {
  try {
    console.log('🧪 Testing sendEmail function...\n')
    
    const testEmail = 'test@example.com'
    const testSubject = 'Test Email'
    const testHtml = '<p>This is a test email</p>'
    
    console.log('📧 Attempting to send email...')
    console.log('  To:', testEmail)
    console.log('  Subject:', testSubject)
    
    const result = await sendEmail(testEmail, testSubject, testHtml)
    console.log('✅ Email sent successfully:', result)
    
  } catch (error) {
    console.error('❌ Email sending failed:')
    console.error('  Error:', error.message)
    console.error('  Stack:', error.stack)
  }
}

testSendEmail()

