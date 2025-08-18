"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrScanner } from "@/components/qr/qr-scanner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { QrCode, Camera, Type, ArrowLeft, Leaf } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function VerifyPage() {
  const [manualCode, setManualCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const router = useRouter()

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      router.push(`/verify/${manualCode.trim()}`)
    }
  }

  const handleScanResult = (result: string) => {
    console.log("Scan result:", result)
    setIsScanning(false)
    
    // Extract batch ID from QR code data if it's a URL
    let batchId = result
    if (result.includes('/verify/')) {
      batchId = result.split('/verify/')[1]
    }
    
    router.push(`/verify/${batchId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <Leaf className="w-6 h-6" />
              <span className="text-xl font-heading font-bold">GroChain</span>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-heading font-bold mb-2">Verify Product</h1>
            <p className="text-primary-foreground/80">
              Scan the QR code or enter the product code to verify authenticity
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center">
                <QrCode className="w-6 h-6 mr-2" />
                Product Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="scan" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="scan" className="flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Scan QR Code
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center">
                    <Type className="w-4 h-4 mr-2" />
                    Enter Code
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="scan" className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
                      <p className="text-muted-foreground text-sm">
                        Position the QR code within the camera frame to scan
                      </p>
                    </div>
                  </div>

                  {!isScanning ? (
                    <Button 
                      onClick={() => setIsScanning(true)} 
                      className="w-full"
                      size="lg"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <QrScanner
                        onScan={handleScanResult}
                        onClose={() => setIsScanning(false)}
                        isOpen={isScanning}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setIsScanning(false)}
                        className="w-full"
                      >
                        Stop Scanning
                      </Button>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 text-sm">How to scan</p>
                        <p className="text-blue-700 text-xs mt-1">
                          Look for the QR code on the product packaging or label. 
                          Hold your device steady and ensure good lighting for best results.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                      <Type className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Enter Product Code</h3>
                      <p className="text-muted-foreground text-sm">
                        Type the product code found on the package
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="productCode">Product Code</Label>
                      <Input
                        id="productCode"
                        type="text"
                        placeholder="Enter product code (e.g., GC-12345-ABC)"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        className="text-center font-mono"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={!manualCode.trim()}
                    >
                      Verify Product
                    </Button>
                  </form>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Type className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 text-sm">Product Code Location</p>
                        <p className="text-amber-700 text-xs mt-1">
                          The product code is usually printed on the package label, 
                          near the QR code, or on a verification sticker.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-6 border-t">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Don't have a product to verify?
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/marketplace">Browse Verified Products</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}