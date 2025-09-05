"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SettingsForm } from "@/components/profile/settings-form"
import { BuyerSettingsForm } from "@/components/profile/buyer-settings-form"
import { useAuthStore } from "@/lib/auth"

export default function SettingsPage() {
  const { user } = useAuthStore()

  const getSettingsComponent = () => {
    switch (user?.role) {
      case 'buyer':
        return <BuyerSettingsForm />
      case 'farmer':
      case 'partner':
      default:
        return <SettingsForm />
    }
  }

  return (
    <DashboardLayout pageTitle="Settings">
      {getSettingsComponent()}
    </DashboardLayout>
  )
}


