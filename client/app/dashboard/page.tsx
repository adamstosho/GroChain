"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { BuyerDashboard } from "@/components/dashboard/buyer-dashboard"
import { FarmerDashboard } from "@/components/dashboard/farmer-dashboard"
import { PartnerDashboard } from "@/components/dashboard/partner-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen bg-background">
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="text-lg font-medium">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "buyer":
        return <BuyerDashboard />
      case "farmer":
        return <FarmerDashboard />
      case "partner":
        return <PartnerDashboard />
      case "admin":
        return <AdminDashboard />
      default:
        return <BuyerDashboard />
    }
  }

  return (
    <DashboardLayout pageTitle="Dashboard">
      {renderDashboard()}
    </DashboardLayout>
  )
}
