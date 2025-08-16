"use client"

import { useState, useEffect } from "react"
import { RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AppUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    const handleServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting)
        setShowUpdatePrompt(true)
      }
    }

    // Check for updates
    navigator.serviceWorker.ready.then((registration) => {
      // Check for waiting service worker
      if (registration.waiting) {
        setWaitingWorker(registration.waiting)
        setShowUpdatePrompt(true)
      }

      // Listen for new service worker
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker)
              setShowUpdatePrompt(true)
            }
          })
        }
      })
    })

    // Listen for controller change (new SW took control)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload()
    })
  }, [])

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" })
      setShowUpdatePrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
  }

  if (!showUpdatePrompt) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="shadow-lg border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">App Update Available</h3>
              <p className="text-sm text-gray-600 mb-3">
                A new version of GroChain is available with improvements and bug fixes.
              </p>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdate} className="flex-1">
                  Update Now
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
