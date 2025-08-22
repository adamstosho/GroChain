"use client"

import { useAuth } from "@/lib/auth-context"
import { UnifiedDashboardLayout } from "./unified-dashboard-layout"
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
import { useRouter } from "next/navigation"

export function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  console.log('🔍 Dashboard render - user:', user, 'loading:', loading)

  // Add useEffect to track user state changes and handle redirects
  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      console.log('🔍 Dashboard: No user found, redirecting to login')
      router.push('/login')
    }
  }, [user, loading, router])



  if (loading) {
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

              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  console.log('🔍 Dashboard: Rendering dashboard for role:', user.role)
  
  const renderRoleSpecificDashboard = () => {
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
        return <FarmerDashboard user={user} />
    }
  }

  return (
    <UnifiedDashboardLayout>
      {renderRoleSpecificDashboard()}
    </UnifiedDashboardLayout>
  )
}
