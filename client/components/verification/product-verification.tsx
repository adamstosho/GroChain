"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  QrCode,
  Camera,
  Search,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  MapPin,
  User,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { QRScanner } from "@/components/qr/qr-scanner"

interface VerificationResult {
  found: boolean
  product?: {
    id: string
    cropType: string
    quantity: string
    unit: string
    harvestDate: string
    location: string
    farmer: {
      name: string
      verified: boolean
    }
    images: string[]
    qrCode: string
    verificationDate: string
    status: "verified" | "pending" | "rejected"
  }
}

export function ProductVerification() {
  const [qrCode, setQrCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState("")
  const [showScanner, setShowScanner] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrCode.trim()) return

    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock verification result
      if (qrCode.toLowerCase().includes("qr001") || qrCode.toLowerCase().includes("valid")) {
        setResult({
          found: true,
          product: {
            id: "1",
            cropType: "Tomatoes",
            quantity: "500",
            unit: "kg",
            harvestDate: "2025-01-15",
            location: "Ikeja, Lagos State",
            farmer: {
              name: "Adunni Adebayo",
              verified: true,
            },
            images: ["/tomatoes-1.jpg", "/tomatoes-2.jpg"],
            qrCode: "QR001",
            verificationDate: "2025-01-16",
            status: "verified",
          },
        })
      } else {
        setResult({
          found: false,
        })
      }
    } catch (error) {
      setError("Failed to verify product. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleScanResult = (scannedCode: string) => {
    setQrCode(scannedCode)
    setShowScanner(false)
    // Auto-verify after scan
    setTimeout(() => {
      const form = document.querySelector("form") as HTMLFormElement
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Verify Product</h1>
              <p className="text-muted-foreground">
                Scan or enter a QR code to verify the authenticity of Nigerian agricultural products
              </p>
            </div>
          </div>

          {/* Verification Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Enter QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qrCode">QR Code or Batch ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qrCode"
                      placeholder="Enter QR code (e.g., QR001)"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowScanner(true)}
                      className="bg-transparent"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Scan
                    </Button>
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading || !qrCode.trim()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Verify Product
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Verification Result */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {result.found && result.product ? (
                <Card className="border-success">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <CardTitle className="text-success">Product Verified!</CardTitle>
                        <p className="text-sm text-muted-foreground">This product is authentic and verified</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Product Images */}
                    {result.product.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {result.product.images.slice(0, 2).map((image, index) => (
                          <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`${result.product!.cropType} ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <Separator />

                    {/* Product Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">Product Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Product</p>
                            <p className="font-medium">
                              {result.product.cropType} ({result.product.quantity} {result.product.unit})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Harvest Date</p>
                            <p className="font-medium">{new Date(result.product.harvestDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-medium">{result.product.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Farmer</p>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{result.product.farmer.name}</p>
                              {result.product.farmer.verified && (
                                <Badge variant="outline" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Verification Details */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Verification Details</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">QR Code</span>
                        <Badge variant="outline">{result.product.qrCode}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Verified On</span>
                        <span className="text-sm font-medium">
                          {new Date(result.product.verificationDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="default">Verified</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-destructive">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <CardTitle className="text-destructive">Product Not Found</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          The QR code you entered is not valid or the product is not registered
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">This could mean:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• The QR code is invalid or damaged</li>
                        <li>• The product is not registered in our system</li>
                        <li>• The QR code may be counterfeit</li>
                      </ul>
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setResult(null)
                            setQrCode("")
                          }}
                          className="bg-transparent"
                        >
                          Try Another Code
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Help Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">How to Verify Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Find the QR Code</p>
                    <p>Look for the GroChain QR code on the product packaging or label</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Scan or Enter Code</p>
                    <p>Use your camera to scan the QR code or manually enter the code</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">View Results</p>
                    <p>Get instant verification of the product's authenticity and origin</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* QR Scanner Modal */}
        <QRScanner isOpen={showScanner} onScan={handleScanResult} onClose={() => setShowScanner(false)} />
      </div>
    </div>
  )
}
