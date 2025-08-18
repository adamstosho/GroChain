"use client"

import { Button } from "@/components/ui/button"

export function ClearAuthButton() {
  const clearAllAuthData = () => {
    console.log('🧹 Clearing all authentication data...')
    
    // Clear localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    
    // Clear auth cookie via server to keep middleware in sync
    fetch('/api/auth/clear-cookie', { method: 'POST' }).finally(() => {
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=")
        const name = eqPos > -1 ? c.substr(0, eqPos) : c
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
      })
    })
    
    console.log('🧹 All auth data cleared. Reloading page...')
    
    // Reload the page
    window.location.reload()
  }

  return (
    <Button 
      onClick={clearAllAuthData}
      variant="destructive"
      size="sm"
      className="mb-4"
    >
      🧹 Clear All Auth Data & Reload
    </Button>
  )
}
