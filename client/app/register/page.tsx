import { ErrorBoundary } from "@/components/error-boundary"
import { RoleSelection } from "@/components/auth/role-selection"

export default function RegisterPage() {
  return (
    <ErrorBoundary>
      <RoleSelection />
    </ErrorBoundary>
  )
}
