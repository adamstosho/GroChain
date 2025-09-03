// Test environment variable loading
console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
console.log('API Base URL fallback:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000')

// Test URL construction
const avatarUrl = '/uploads/avatars/test-avatar.jpg'
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

console.log('Avatar URL:', avatarUrl)
console.log('API Base URL:', apiBaseUrl)
console.log('Constructed URL:', `${apiBaseUrl}${avatarUrl}`)
console.log('Expected URL: http://localhost:5000/uploads/avatars/test-avatar.jpg')
