const fetch = require('node-fetch')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')

async function testFileUpload() {
  try {
    console.log('🔧 Testing updated file upload endpoint...')

    // Create a small test image file
    const testImagePath = './test-image.png'
    const testPdfPath = './test-document.pdf'

    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==', 'base64')
    fs.writeFileSync(testImagePath, testImageBuffer)

    // Create a simple test PDF content (minimal PDF)
    const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test Document) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000200 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n284\n%%EOF'
    fs.writeFileSync(testPdfPath, testPdfContent)

    // Test image upload
    console.log('📤 Testing image upload...')
    const imageForm = new FormData()
    imageForm.append('images', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    })

    const imageResponse = await fetch('http://localhost:5000/api/marketplace/upload-image', {
      method: 'POST',
      body: imageForm,
      headers: {
        ...imageForm.getHeaders(),
        // Add authorization if needed
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    })

    console.log('📊 Image upload response status:', imageResponse.status)
    const imageResponseText = await imageResponse.text()
    console.log('📄 Image upload response:', imageResponseText)

    // Test PDF upload
    console.log('\n📤 Testing PDF upload...')
    const pdfForm = new FormData()
    pdfForm.append('images', fs.createReadStream(testPdfPath), {
      filename: 'test-document.pdf',
      contentType: 'application/pdf'
    })

    const pdfResponse = await fetch('http://localhost:5000/api/marketplace/upload-image', {
      method: 'POST',
      body: pdfForm,
      headers: {
        ...pdfForm.getHeaders(),
        // Add authorization if needed
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    })

    console.log('📊 PDF upload response status:', pdfResponse.status)
    const pdfResponseText = await pdfResponse.text()
    console.log('📄 PDF upload response:', pdfResponseText)

    if (imageResponse.ok && pdfResponse.ok) {
      console.log('✅ Both image and PDF uploads successful!')
    } else {
      console.log('❌ Some uploads failed')
    }

    // Clean up test files
    fs.unlinkSync(testImagePath)
    fs.unlinkSync(testPdfPath)
    console.log('🧹 Test files cleaned up')

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
