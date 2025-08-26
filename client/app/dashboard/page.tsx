"use client"

import { useAuthGuard } from "@/lib/auth"
import { FarmerDashboard } from "@/components/dashboard/farmer-dashboard"
import { BuyerDashboard } from "@/components/dashboard/buyer-dashboard"
import { PartnerDashboard } from "@/components/dashboard/partner-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user, isAuthenticated, hasAccess } = useAuthGuard()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return <LoadingSpinner />
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "farmer":
        return <FarmerDashboard />
      case "buyer":
        return <BuyerDashboard />
      case "partner":
        return <PartnerDashboard />
      case "admin":
        return <AdminDashboard />
      default:
        return <div>Invalid role</div>
    }
  }

  return <DashboardLayout>{renderDashboard()}</DashboardLayout>
}
