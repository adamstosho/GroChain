"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { SettingsPage } from '@/components/settings/settings-page'
import { PartnerSettingsPage } from '@/components/settings/partner-settings-page'
import { FarmerSettingsPage } from '@/components/settings/farmer-settings-page'
import { Loader2 } from 'lucide-react'

export default function Settings() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      if (user.role === 'partner') {
        router.push('/settings/partner')
      } else if (user.role === 'farmer') {
        router.push('/settings/farmer')
      }
      // For other roles, stay on general settings page
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Show general settings for non-partner/farmer roles
  if (user.role !== 'partner' && user.role !== 'farmer') {
    return <SettingsPage />
  }

  // This will be replaced by the redirect, but show a fallback
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">Redirecting to role-specific settings...</span>
    </div>
  )
}
