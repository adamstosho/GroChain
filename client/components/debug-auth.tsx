"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugAuth() {
  const { user, loading, isAuthenticated } = useAuth()

  const testAuth = async () => {
    console.log('🔍 Testing authentication...')
    
    // Test localStorage
    const token = localStorage.getItem('auth_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const userData = localStorage.getItem('user_data')
    
    console.log('🔍 LocalStorage:', { token: !!token, refreshToken: !!refreshToken, userData: !!userData })
    
    // Test cookie
    console.log('🔍 Cookies:', document.cookie)
    
    // Test API call
    try {
      console.log('🔍 Testing /api/auth/me...')
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('🔍 Response status:', response.status)
      console.log('🔍 Response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Response data:', data)
      } else {
        console.log('🔍 Error response:', response.statusText)
      }
    } catch (error) {
      console.error('🔍 API call error:', error)
    }
  }

  const testBackendDirect = async () => {
    console.log('🔍 Testing backend directly...')
    
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.log('🔍 No token available')
      return
    }
    
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
      const response = await fetch(`${base}/api/auth/protected`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('🔍 Backend response status:', response.status)
      console.log('🔍 Backend response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Backend data:', data)
      } else {
        console.log('🔍 Backend error:', response.statusText)
      }
    } catch (error) {
      console.error('🔍 Backend call error:', error)
    }
  }

  const clearAuth = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    console.log('🔍 Auth data cleared')
    window.location.reload()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Status</h3>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>User: {user ? user.name : 'None'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Storage</h3>
            <p>Token: {localStorage.getItem('auth_token') ? 'Yes' : 'No'}</p>
            <p>Refresh: {localStorage.getItem('refresh_token') ? 'Yes' : 'No'}</p>
            <p>User Data: {localStorage.getItem('user_data') ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={testAuth} variant="outline">
            Test Frontend API
          </Button>
          <Button onClick={testBackendDirect} variant="outline">
            Test Backend Direct
          </Button>
          <Button onClick={clearAuth} variant="destructive">
            Clear Auth
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Check browser console for detailed logs</p>
        </div>
      </CardContent>
    </Card>
  )
}
