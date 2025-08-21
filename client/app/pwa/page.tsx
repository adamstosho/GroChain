import { Metadata } from "next"
import { ErrorBoundary } from "@/components/error-boundary"
import { PWADashboard } from "@/components/pwa/pwa-dashboard"

export const metadata: Metadata = {
  title: "PWA & Offline Features | GroChain",
  description: "Progressive Web App capabilities and offline functionality for GroChain",
}

export default function PWAPage() {
  return (
    <ErrorBoundary>
      <PWADashboard />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'
