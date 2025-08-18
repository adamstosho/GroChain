"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"

export function DebugAuth() {
  const { user, loading, login } = useAuth()
  const [testResult, setTestResult] = useState<string>("")

  const testLogin = async () => {
    setTestResult("Testing login...")
    try {
      console.log('🧪 Debug: Starting login test')
      
      // Test the login function directly
      const success = await login('test@example.com', 'password123')
      
      console.log('🧪 Debug: Login result:', success)
      
      if (success) {
        setTestResult("✅ Login successful! Check console for details. Redirecting in 2 seconds...")
        setTimeout(() => {
          console.log('🧪 Debug: Redirecting to dashboard...')
          window.location.href = "/dashboard"
        }, 2000)
      } else {
        setTestResult("❌ Login failed!")
      }
    } catch (error) {
      console.error('🧪 Debug: Login error:', error)
      setTestResult(`❌ Login error: ${error}`)
    }
  }

  const goToDashboard = () => {
    console.log('🧪 Debug: Direct navigation to dashboard')
    window.location.href = "/dashboard"
  }

  const testApiDirect = async () => {
    setTestResult("Testing API directly...")
    try {
      const response = await api.login({ email: 'test@example.com', password: 'password123' })
      console.log('🧪 Debug: Direct API response:', response)
      setTestResult(`API Response: ${JSON.stringify(response, null, 2)}`)
    } catch (error) {
      console.error('🧪 Debug: API error:', error)
      setTestResult(`❌ API error: ${error}`)
    }
  }

  const clearStorage = () => {
    localStorage.clear()
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setTestResult("🧹 Storage cleared")
    window.location.reload()
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>🔧 Authentication Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Auth State:</h3>
            <p>Loading: {loading ? "Yes" : "No"}</p>
            <p suppressHydrationWarning>User: {user ? user.name : ""}</p>
            <p suppressHydrationWarning>Role: {user?.role || ""}</p>
            <p suppressHydrationWarning>Token: {typeof window !== 'undefined' ? (localStorage.getItem('auth_token') ? 'Present' : '') : ''}</p>
          </div>
          <div>
            <h3 className="font-semibold">Browser Info:</h3>
            <p suppressHydrationWarning>URL: {typeof window !== 'undefined' ? window.location.pathname : ''}</p>
            <p suppressHydrationWarning>Cookie: {typeof document !== 'undefined' ? (document.cookie.includes('auth_token') ? 'Present' : '') : ''}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={testLogin} className="w-full">
            🧪 Test Login Function
          </Button>
          <Button onClick={goToDashboard} variant="secondary" className="w-full">
            🎯 Go to Dashboard
          </Button>
          <Button onClick={testApiDirect} variant="outline" className="w-full">
            🔌 Test API Direct
          </Button>
          <Button onClick={clearStorage} variant="destructive" className="w-full">
            🧹 Clear Storage & Reload
          </Button>
        </div>

        {testResult && (
          <div className="p-4 bg-gray-100 rounded-md">
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>Console logs are prefixed with 🧪 Debug, 🔐 Auth, or 🔍 Dashboard</p>
          <p className="text-red-600 font-semibold">⚠️ Middleware is DISABLED for debugging</p>
        </div>
      </CardContent>
    </Card>
  )
}
