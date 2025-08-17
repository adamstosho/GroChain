"use client"

import { useAuth } from "@/lib/auth-context"
import { FarmerDashboard } from "./farmer-dashboard"
import { BuyerDashboard } from "./buyer-dashboard"
import { PartnerDashboard } from "./partner-dashboard"
import { AdminDashboard } from "./admin-dashboard"
import { AgencyDashboard } from "./agency-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export function Dashboard() {
  const { user, loading, testSetUser } = useAuth()

  console.log('🔍 Dashboard render - user:', user, 'loading:', loading)
  console.log('🔍 Dashboard render - user type:', typeof user)
  console.log('🔍 Dashboard render - user keys:', user ? Object.keys(user) : 'null')
  console.log('🔍 Dashboard render - localStorage auth_token:', typeof window !== 'undefined' ? localStorage.getItem('auth_token') : 'N/A')
  console.log('🔍 Dashboard render - document.cookie:', typeof document !== 'undefined' ? document.cookie : 'N/A')

  // Add useEffect to track user state changes
  useEffect(() => {
    console.log('🔍 Dashboard useEffect - user changed:', user)
  }, [user])

  // Test function to manually set user state
  const handleTestSetUser = () => {
    const testUser = {
      id: "test-123",
      email: "test@example.com",
      name: "Test User",
      role: "farmer" as const,
      phone: "+2348012345678",
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    console.log('🔍 Test: Setting test user:', testUser)
    testSetUser(testUser)
  }

  if (loading) {
    console.log('🔍 Dashboard: Showing loading state')
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Loading Dashboard</h3>
              <p className="text-sm text-muted-foreground">Please wait while we load your data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    console.log('🔍 Dashboard: No user found, showing auth required')
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Authentication Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please log in to access your dashboard.
              </p>
              <div className="space-y-2">
                <Button asChild>
                  <Link href="/login">Go to Login</Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log('🔍 Test button clicked - current user state:', user)
                    console.log('🔍 Test button clicked - current loading state:', loading)
                  }}
                >
                  Debug Auth State
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestSetUser}
                >
                  Test Set User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  console.log('🔍 Dashboard: User found, rendering role-specific dashboard for role:', user.role)
  
  switch (user.role) {
    case "farmer":
      return <FarmerDashboard user={user} />
    case "buyer":
      return <BuyerDashboard user={user} />
    case "partner":
      return <PartnerDashboard user={user} />
    case "aggregator":
      return <AgencyDashboard user={user} />
    case "admin":
      return <AdminDashboard user={user} />
    default:
      console.log('🔍 Dashboard: Unknown role, defaulting to farmer dashboard')
      return <FarmerDashboard user={user} />
  }
}
