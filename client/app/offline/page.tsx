"use client"

import { Wifi, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
            <Wifi className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">You're Offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            It looks like you're not connected to the internet. Some features may not be available, but you can still:
          </p>

          <div className="bg-green-50 p-4 rounded-lg text-left">
            <h3 className="font-semibold text-green-800 mb-2">Available Offline:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• View cached products</li>
              <li>• Access your profile</li>
              <li>• Browse saved content</li>
              <li>• Use QR scanner</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">Your data will sync automatically when you're back online.</p>
        </CardContent>
      </Card>
    </div>
  )
}
