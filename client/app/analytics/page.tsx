import { ErrorBoundary } from "@/components/error-boundary"
import { AnalyticsDashboardNew } from "@/components/analytics/analytics-dashboard-new"

export default function AnalyticsPage() {
  return (
    <ErrorBoundary>
      <AnalyticsDashboardNew />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'
