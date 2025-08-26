import { LoginForm } from "@/components/auth/login-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your GroChain account" showFeatures={true}>
      <LoginForm />
    </AuthLayout>
  )
}
