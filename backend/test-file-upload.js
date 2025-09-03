const fetch = require('node-fetch')
const FormData = require('form-data')
const fs = require('fs')

async function testFileUpload() {
  try {
    console.log('🔧 Testing file upload endpoint...')

    // Create a simple test file
    const testContent = 'This is a test file for upload verification.'
    const testFilePath = './test-upload.txt'
    fs.writeFileSync(testFilePath, testContent)

    // Create form data
    const form = new FormData()
    form.append('images', fs.createReadStream(testFilePath), {
      filename: 'test-upload.txt',
      contentType: 'text/plain'
    })

    console.log('📤 Sending test file to upload endpoint...')

    // Make the request
    const response = await fetch('http://localhost:5000/api/marketplace/upload-image', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        // Add authorization if needed
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    })

    console.log('📊 Response status:', response.status)
    const responseText = await response.text()
    console.log('📄 Response body:', responseText)

    if (response.ok) {
      console.log('✅ File upload test successful!')
    } else {
      console.log('❌ File upload test failed')
    }

    // Clean up
    fs.unlinkSync(testFilePath)
    console.log('🧹 Test file cleaned up')

  } catch (error) {
    console.error('❌ Test failed:', error.message)

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend server might not be running')
      console.log('1. Make sure to run: npm run dev')
      console.log('2. Verify the server is listening on port 5000')
    }
  }
}

testFileUpload()
