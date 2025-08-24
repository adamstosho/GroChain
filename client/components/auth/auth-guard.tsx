"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    // Only show fallback after loading is complete and user is not authenticated
    if (!loading && !isAuthenticated) {
      // Small delay to prevent flash
      const timer = setTimeout(() => {
        setShowFallback(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setShowFallback(false)
    }
  }, [loading, isAuthenticated])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show fallback if not authenticated
  if (showFallback) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
              <Lock className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-8">
              Please log in to access your dashboard.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated, show children
  return <>{children}</>
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard>
        <Component {...props} />
      </AuthGuard>
    )
  }
}




