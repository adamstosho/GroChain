"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <DashboardLayout pageTitle="Analytics Dashboard">
      <AnalyticsDashboard />
    </DashboardLayout>
  )
}
