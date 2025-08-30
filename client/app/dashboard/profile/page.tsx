"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProfileForm } from "@/components/profile/profile-form"

export default function ProfilePage() {
  return (
    <DashboardLayout pageTitle="Profile">
      <ProfileForm />
    </DashboardLayout>
  )
}



