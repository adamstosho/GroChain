"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, Copy, Check } from "lucide-react"
import { generateQRCodeURL, downloadQRCode, type QRCodeData } from "@/lib/qr-utils"

interface QRCodeGeneratorProps {
  data: QRCodeData
  size?: number
  className?: string
}

export function QRCodeGenerator({ data, size = 256, className }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const qrUrl = generateQRCodeURL(data)

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return

      try {
        // Dynamic import to avoid SSR issues
        const QRCode = (await import("qrcode")).default

        await QRCode.toCanvas(canvasRef.current, qrUrl, {
          width: size,
          margin: 2,
          color: {
            dark: "#006837", // GroChain primary color
            light: "#FFFFFF",
          },
        })
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to generate QR code:", error)
        setIsLoading(false)
      }
    }

    generateQR()
  }, [qrUrl, size])

  const handleDownload = async () => {
    if (canvasRef.current) {
      await downloadQRCode(canvasRef.current, `grochain-${data.batchId}.png`)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `GroChain Product Verification - ${data.cropType}`,
          text: `Verify this ${data.cropType} product from GroChain`,
          url: qrUrl,
        })
      } catch (error) {
        console.error("Failed to share:", error)
      }
    } else {
      // Fallback to copy
      handleCopy()
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          {/* QR Code Canvas */}
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className={`rounded-lg border ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity`}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </div>

          {/* Batch ID */}
          <div>
            <Badge variant="outline" className="text-sm">
              {data.batchId}
            </Badge>
          </div>

          {/* Product Info */}
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{data.cropType}</p>
            <p>
              {data.quantity} {data.unit}
            </p>
            <p>{data.location}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={handleDownload} className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} className="bg-transparent">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
