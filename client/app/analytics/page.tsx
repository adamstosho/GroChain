import { ErrorBoundary } from "@/components/error-boundary"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <ErrorBoundary>
      <AnalyticsDashboard />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'
