import { RegistrationForm } from "@/components/auth/registration-form"

interface RegisterRolePageProps {
  params: {
    role: string
  }
}

export default function RegisterRolePage({ params }: RegisterRolePageProps) {
  return <RegistrationForm role={params.role} />
}
