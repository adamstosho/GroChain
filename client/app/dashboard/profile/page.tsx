"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProfileForm } from "@/components/profile/profile-form"
import { BuyerProfileForm } from "@/components/profile/buyer-profile-form"
import { useAuthStore } from "@/lib/auth"

export default function ProfilePage() {
  const { user } = useAuthStore()

  const getProfileComponent = () => {
    switch (user?.role) {
      case 'buyer':
        return <BuyerProfileForm />
      case 'farmer':
      case 'partner':
      default:
        return <ProfileForm />
    }
  }

  return (
    <DashboardLayout pageTitle="Profile">
      {getProfileComponent()}
    </DashboardLayout>
  )
}



