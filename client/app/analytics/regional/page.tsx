import { Metadata } from "next"
import { ErrorBoundary } from "@/components/error-boundary"
import { RegionalAnalyticsPage } from "@/components/analytics/regional-analytics-page"

export const metadata: Metadata = {
  title: "Regional Analytics | GroChain",
  description: "Geographic performance analysis and regional insights for your agricultural platform",
}

export default function RegionalAnalyticsPageRoute() {
  return (
    <ErrorBoundary>
      <RegionalAnalyticsPage />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'

