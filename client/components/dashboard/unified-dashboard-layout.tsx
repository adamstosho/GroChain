"use client"

import React from 'react'
import { MainNavigation } from '@/components/navigation/main-navigation'

interface UnifiedDashboardLayoutProps {
  children: React.ReactNode
  showNavigation?: boolean
}

export function UnifiedDashboardLayout({ 
  children, 
  showNavigation = false
}: UnifiedDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <MainNavigation />}
      
      <div className="container mx-auto px-4 py-6">
        {/* Main Content Area - Only render children (role-specific dashboards) */}
        {children}
      </div>
    </div>
  )
}
