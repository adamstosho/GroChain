import { ErrorBoundary } from "@/components/error-boundary"
import { WeatherDashboard } from "@/components/weather/weather-dashboard"

export default function WeatherPage() {
  return (
    <ErrorBoundary>
      <WeatherDashboard />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'
