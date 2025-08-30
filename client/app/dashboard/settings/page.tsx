"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SettingsForm } from "@/components/profile/settings-form"

export default function SettingsPage() {
  return (
    <DashboardLayout pageTitle="Settings">
      <SettingsForm />
    </DashboardLayout>
  )
}


