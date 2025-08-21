import { Metadata } from "next"
import { ErrorBoundary } from "@/components/error-boundary"
import { ExportReportsPage } from "@/components/analytics/export-reports-page"

export const metadata: Metadata = {
  title: "Export & Reports | GroChain",
  description: "Generate comprehensive reports and export data in multiple formats for analysis",
}

export default function ExportReportsPageRoute() {
  return (
    <ErrorBoundary>
      <ExportReportsPage />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'
