import { Metadata } from "next"
import { ErrorBoundary } from "@/components/error-boundary"
import { PredictiveAnalyticsPage } from "@/components/analytics/predictive-analytics-page"

export const metadata: Metadata = {
  title: "Predictive Analytics | GroChain",
  description: "AI-powered forecasting, yield predictions, and market insights for agricultural planning",
}

export default function PredictiveAnalyticsPageRoute() {
  return (
    <ErrorBoundary>
      <PredictiveAnalyticsPage />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'

