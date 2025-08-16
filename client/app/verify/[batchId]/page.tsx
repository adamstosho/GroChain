"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Calendar, 
  User, 
  Package, 
  Leaf,
  ArrowLeft,
  AlertCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Harvest } from "@/types/api"

export default function VerifyProductPage() {
  const params = useParams()
  const batchId = params.batchId as string
  const [harvest, setHarvest] = useState<Harvest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyProduct = async () => {
      try {
        const response = await api.verifyProduct(batchId)
        if (response.success && response.data) {
          setHarvest(response.data as Harvest)
        } else {
          setError(response.error || "Product not found")
        }
      } catch (err) {
        setError("Failed to verify product. Please check your connection.")
      } finally {
        setLoading(false)
      }
    }

    if (batchId) {
      verifyProduct()
    }
  }, [batchId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center space-x-4 p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Verifying product...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !harvest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-destructive">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Product Not Found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                {error || "The product with this QR code could not be verified. It may be invalid or not registered in our system."}
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/">Return Home</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/verify">Try Another Code</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'A':
        return 'bg-green-500'
      case 'B':
        return 'bg-yellow-500'
      case 'C':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
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
            <div className="inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Product Verified</span>
            </div>
            <h1 className="text-3xl font-heading font-bold mb-2">Authentic Nigerian Produce</h1>
            <p className="text-primary-foreground/80">
              This product has been verified through our trusted farmer network
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Info */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 capitalize">{harvest.cropType}</h2>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Quantity</p>
                        <p className="text-sm text-muted-foreground">{harvest.quantity} {harvest.unit}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Harvest Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(harvest.harvestDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {harvest.location.city}, {harvest.location.state}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Quality */}
                <div>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">Verification Status</p>
                      <Badge className={`${getStatusColor(harvest.status)} text-white`}>
                        {harvest.status.charAt(0).toUpperCase() + harvest.status.slice(1)}
                      </Badge>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Quality Grade</p>
                      <Badge className={`${getQualityColor(harvest.quality)} text-white`}>
                        Grade {harvest.quality}
                      </Badge>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Batch ID</p>
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {harvest.batchId}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Farmer Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Farmer Information
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold">
                        {harvest.farmer.firstName?.charAt(0) || harvest.farmer.name.charAt(0)}
                        {harvest.farmer.lastName?.charAt(0) || harvest.farmer.name.charAt(1)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {harvest.farmer.firstName && harvest.farmer.lastName 
                          ? `${harvest.farmer.firstName} ${harvest.farmer.lastName}`
                          : harvest.farmer.name
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">Verified Farmer</p>
                      {harvest.farmer.emailVerified && (
                        <div className="flex items-center space-x-1 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600">Email Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Trust & Transparency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-700">Verified Farmer</p>
                  <p className="text-xs text-green-600">Identity confirmed</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-medium text-blue-700">Location Tracked</p>
                  <p className="text-xs text-blue-600">GPS coordinates recorded</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Package className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="font-medium text-purple-700">Quality Assured</p>
                  <p className="text-xs text-purple-600">Grade {harvest.quality} certified</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">About Product Verification</p>
                    <p className="text-sm text-amber-700 mt-1">
                      This product is part of GroChain's digital trust platform. Every item is tracked from farm to market, 
                      ensuring transparency and quality for Nigerian consumers.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-6 text-center space-y-4">
            <p className="text-muted-foreground">
              Want to learn more about supporting Nigerian farmers?
            </p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/marketplace">Browse Products</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">Join GroChain</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
