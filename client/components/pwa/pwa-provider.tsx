"use client"

import { useEffect, type ReactNode } from "react"
import { registerServiceWorker, requestNotificationPermission, subscribeToPushNotifications } from "@/lib/pwa-utils"
import AppUpdatePrompt from "./app-update-prompt"
import InstallPrompt from "./install-prompt"

interface PWAProviderProps {
  children: ReactNode
}

export default function PWAProvider({ children }: PWAProviderProps) {
  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Disable service worker in development to avoid navigation/cache issues
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_PWA !== 'true') {
          try {
            if ('serviceWorker' in navigator) {
              const regs = await navigator.serviceWorker.getRegistrations()
              await Promise.all(regs.map(r => r.unregister()))
              console.log('Development: Unregistered service workers to prevent caching issues')
            }
          } catch {}
          return
        }
        // Check if service worker is supported
        if (!("serviceWorker" in navigator)) {
          console.log("Service workers are not supported in this browser")
          return
        }

        // Try to register service worker with better error handling
        const registration = await registerServiceWorker()

        if (registration) {
          console.log("Service worker registered successfully")

          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data && event.data.type === "SKIP_WAITING") {
              window.location.reload()
            }
          })

          // Request notification permission after successful registration
          setTimeout(async () => {
            try {
              const permission = await requestNotificationPermission()

              if (permission === "granted") {
                // Subscribe to push notifications
                await subscribeToPushNotifications()
              }
            } catch (error) {
              console.log("Notification setup failed:", error)
            }
          }, 5000) // Wait 5 seconds before asking for permissions
        } else {
          console.log("Service worker registration failed, continuing without PWA features")
        }
      } catch (error) {
        console.log("PWA initialization failed:", error)
        // Continue without PWA features
      }
    }

    initializePWA()

    // Handle app updates
    const handleAppUpdate = () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          // Reload the page when a new service worker takes control
          window.location.reload()
        })
      }
    }

    handleAppUpdate()
  }, [])

  return (
    <>
      {children}
      <AppUpdatePrompt />
      <InstallPrompt />
    </>
  )
}
