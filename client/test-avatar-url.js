// Test avatar URL construction
const NEXT_PUBLIC_API_BASE_URL = 'http://localhost:5000'
const avatarUrl = '/uploads/avatars/avatar-1756732424584-305357329.JPG'

console.log('API Base URL:', NEXT_PUBLIC_API_BASE_URL)
console.log('Avatar URL from DB:', avatarUrl)
console.log('Starts with http?', avatarUrl.startsWith('http'))
console.log('Constructed URL:', avatarUrl.startsWith('http') ? avatarUrl : `${NEXT_PUBLIC_API_BASE_URL}${avatarUrl}`)
console.log('Expected full URL: http://localhost:5000/uploads/avatars/avatar-1756732424584-305357329.JPG')
