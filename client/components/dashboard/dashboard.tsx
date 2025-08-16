"use client"

import { useAuth } from "@/lib/auth-context"
import { FarmerDashboard } from "./farmer-dashboard"
import { BuyerDashboard } from "./buyer-dashboard"
import { PartnerDashboard } from "./partner-dashboard"
import { AdminDashboard } from "./admin-dashboard"
import { AgencyDashboard } from "./agency-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function Dashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Please log in to access your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
