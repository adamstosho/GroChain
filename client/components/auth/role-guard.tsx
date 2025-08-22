"use client"

import { useAuth } from "@/lib/auth-context"
import { ReactNode } from "react"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return fallback || <div>Please log in to access this feature.</div>
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">
          You don't have permission to access this feature.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Required role: {allowedRoles.join(" or ")}
        </p>
      </div>
    )
  }

  return <>{children}</>
}

// Convenience components for common role combinations
export function AdminOnly({ children, fallback }: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard allowedRoles={["admin"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function AdminOrPartner({ children, fallback }: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard allowedRoles={["admin", "partner"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function AdminOrManager({ children, fallback }: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard allowedRoles={["admin", "manager"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function FarmerOnly({ children, fallback }: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard allowedRoles={["farmer"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function BuyerOnly({ children, fallback }: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard allowedRoles={["buyer"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
