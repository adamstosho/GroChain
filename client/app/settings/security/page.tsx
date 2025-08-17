import { ErrorBoundary } from "@/components/error-boundary"
import { SecuritySettings } from "@/components/auth/security-settings"

export default function SecuritySettingsPage() {
  return (
    <ErrorBoundary>
      <SecuritySettings />
    </ErrorBoundary>
  )
}
