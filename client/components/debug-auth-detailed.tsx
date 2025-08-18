"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function DetailedAuthDebug() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        localStorage_token: typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || 'None') : '',
        localStorage_user: typeof window !== 'undefined' ? (localStorage.getItem('user_data') || 'None') : '',
        document_cookie: typeof document !== 'undefined' ? document.cookie : '',
        current_url: typeof window !== 'undefined' ? window.location.href : '',
        current_pathname: typeof window !== 'undefined' ? window.location.pathname : '',
        user_state: user,
        loading_state: loading,
        is_authenticated: isAuthenticated,
        timestamp: new Date().toISOString()
      })
    }

    updateDebugInfo()
    
    // Update every second to track changes
    const interval = setInterval(updateDebugInfo, 1000)
    
    return () => clearInterval(interval)
  }, [user, loading, isAuthenticated])

  const clearAuthData = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.reload()
  }

  const testDashboardRedirect = () => {
    console.log('🧪 Testing dashboard redirect...')
    router.push('/dashboard')
  }

  const testDashboardLocation = () => {
    console.log('🧪 Testing dashboard window.location...')
    window.location.href = '/dashboard'
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>🔍 Detailed Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Auth State</h3>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
              {JSON.stringify({
                user: debugInfo.user_state,
                loading: debugInfo.loading_state,
                isAuthenticated: debugInfo.is_authenticated
              }, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Storage & Location</h3>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
              {JSON.stringify({
                url: debugInfo.current_url,
                pathname: debugInfo.current_pathname,
                hasToken: !!debugInfo.localStorage_token,
                hasUser: !!debugInfo.localStorage_user,
                cookieSet: debugInfo.document_cookie?.includes('auth_token')
              }, null, 2)}
            </pre>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Raw Data</h3>
          <details>
            <summary className="cursor-pointer text-sm">Click to view raw debug data</summary>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto mt-2">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={clearAuthData} variant="destructive" size="sm">
            Clear Auth Data
          </Button>
          <Button onClick={testDashboardRedirect} variant="outline" size="sm">
            Test router.push('/dashboard')
          </Button>
          <Button onClick={testDashboardLocation} variant="outline" size="sm">
            Test window.location.href = '/dashboard'
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Reload Page
          </Button>
          {isAuthenticated && (
            <Button 
              onClick={() => {
                console.log('🧪 Manual dashboard redirect test...')
                setTimeout(() => {
                  window.location.href = '/dashboard'
                }, 1000)
              }} 
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              🚀 Go to Dashboard (Authenticated)
            </Button>
          )}
        </div>

        {isAuthenticated && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 font-semibold">✅ You are authenticated!</p>
            <p className="text-green-700 text-sm">
              User: {user?.name} ({user?.email}) - Role: {user?.role}
            </p>
            <p className="text-green-600 text-xs mt-1">
              Click the green button above to manually go to dashboard
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
