"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Flashlight, FlashlightOff } from "lucide-react"

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
  isOpen: boolean
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [error, setError] = useState("")
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      setError("")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Check if device has flash
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      setHasFlash(!!capabilities.torch)

      setIsScanning(true)
      startScanning()
    } catch (error) {
      console.error("Camera access error:", error)
      setError("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setIsScanning(false)
    setFlashOn(false)
  }

  const startScanning = async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      // Dynamic import to avoid SSR issues
      const jsQR = (await import("jsqr")).default

      scanIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current || !isScanning) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          onScan(code.data)
          stopCamera()
          onClose()
        }
      }, 100)
    } catch (error) {
      console.error("QR scanning error:", error)
      setError("QR scanning not supported on this device.")
    }
  }

  const toggleFlash = async () => {
    if (!streamRef.current) return

    try {
      const track = streamRef.current.getVideoTracks()[0]
      await track.applyConstraints({
        advanced: [{ torch: !flashOn }],
      })
      setFlashOn(!flashOn)
    } catch (error) {
      console.error("Flash toggle error:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Scan QR Code</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Camera View */}
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ transform: "scaleX(-1)" }} // Mirror for better UX
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                </div>
              </div>

              {/* Flash Button */}
              {hasFlash && (
                <Button variant="secondary" size="sm" className="absolute top-4 right-4" onClick={toggleFlash}>
                  {flashOn ? <FlashlightOff className="w-4 h-4" /> : <Flashlight className="w-4 h-4" />}
                </Button>
              )}
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Position the QR code within the frame</p>
              <p>The code will be scanned automatically</p>
            </div>

            {/* Error Message */}
            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            {/* Manual Input Fallback */}
            <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
              Enter Code Manually
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
