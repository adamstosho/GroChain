"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Package,
  QrCode,
  Download,
  Share2,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Map,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"

interface HarvestDetailProps {
  harvestId: string
}

// Mock data - in real app this would come from API
const mockHarvest = {
  id: "1",
  cropType: "Tomatoes",
  quantity: "500",
  unit: "kg",
  harvestDate: "2025-01-15",
  location: "Ikeja, Lagos State",
  status: "verified",
  qrCode: "QR001",
  images: ["/tomatoes-1.jpg", "/tomatoes-2.jpg", "/tomatoes-3.jpg"],
  description:
    "Fresh organic tomatoes from our farm. Grown using sustainable farming practices without harmful pesticides. Perfect for cooking and fresh consumption.",
  coordinates: { lat: 6.5244, lng: 3.3792 },
  farmer: {
    name: "John Doe",
    id: "farmer-1",
  },
  verificationDetails: {
    verifiedAt: "2025-01-16T10:30:00Z",
    verifiedBy: "Agency Partner Lagos",
    notes: "Product meets quality standards. Good color, size, and freshness.",
  },
  createdAt: "2025-01-15T14:20:00Z",
  updatedAt: "2025-01-16T10:30:00Z",
}

const statusConfig = {
  verified: {
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10",
    label: "Verified",
    description: "This product has been verified and approved",
  },
  pending: {
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10",
    label: "Pending Verification",
    description: "This product is awaiting verification",
  },
  rejected: {
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Rejected",
    description: "This product did not meet verification standards",
  },
}

export function HarvestDetail({ harvestId }: HarvestDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [harvestData, setHarvestData] = useState<any>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        // Try provenance endpoint first
        const resp = await api.getHarvestProvenance(harvestId)
        if (resp.success) {
          const payload: any = resp.data
          const prov = (payload as any)?.provenance || (payload as any)?.data?.provenance || payload
          if (!cancelled) setHarvestData(prov)
        } else {
          // Fallback to alias /:batchId
          const resp2 = await api.getHarvest(harvestId)
          if (resp2.success) {
            const payload2: any = resp2.data
            const prov2 = (payload2 as any)?.provenance || (payload2 as any)?.data?.provenance || payload2
            if (!cancelled) setHarvestData(prov2)
          } else {
            throw new Error(resp.error || "Failed to load harvest")
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load harvest")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [harvestId])

  if (loading && !harvestData) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading harvest provenance…</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !harvestData) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
              <div className="text-destructive font-medium">Failed to load harvest</div>
              <div className="text-sm text-muted-foreground">{error}</div>
              <div className="pt-2">
                <Button asChild variant="outline">
                  <Link href="/harvests">Back to Harvests</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const serverHarvest = harvestData
    ? {
        cropType: harvestData.cropType,
        quantity: harvestData.quantity,
        unit: (harvestData as any).unit || "kg",
        harvestDate: (harvestData as any).date || (harvestData as any).harvestDate,
        location:
          (harvestData as any).location ||
          (harvestData as any).geoLocation ||
          { lat: (harvestData as any)?.geoLocation?.lat, lng: (harvestData as any)?.geoLocation?.lng },
        status: "verified",
        qrCode: (harvestData as any).batchId,
        images: (harvestData as any).images || [],
        description: (harvestData as any).description || "",
        coordinates: (harvestData as any).geoLocation || undefined,
        farmer: {
          name: (harvestData as any)?.farmer?.name || "",
          id: (harvestData as any)?.farmer?._id || "",
          firstName: (harvestData as any)?.farmer?.firstName,
          lastName: (harvestData as any)?.farmer?.lastName,
          emailVerified: undefined,
        },
        verificationDetails: undefined,
        createdAt: (harvestData as any).createdAt,
        updatedAt: (harvestData as any).updatedAt,
      }
    : null

  const harvest = serverHarvest || mockHarvest

  const status = statusConfig[(harvest.status as keyof typeof statusConfig) || "verified"]
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/harvests"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{harvest.cropType}</h1>
                <p className="text-muted-foreground">
                  {harvest.quantity} {harvest.unit} • Harvested on {new Date(harvest.harvestDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" className="bg-transparent">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="text-destructive hover:text-destructive bg-transparent">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Images */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      {harvest.images[selectedImage] ? (
                        <Image
                          src={harvest.images[selectedImage] || "/placeholder.svg"}
                          alt={`${harvest.cropType} ${selectedImage + 1}`}
                          width={600}
                          height={400}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Images */}
                    {harvest.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {harvest.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                              selectedImage === index ? "border-primary" : "border-border"
                            }`}
                          >
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`${harvest.cropType} ${index + 1}`}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {harvest.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>

              {/* Verification Details */}
              {harvest.status === "verified" && harvest.verificationDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Verified by</span>
                      <span className="font-medium">{harvest.verificationDetails.verifiedBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Verified on</span>
                      <span className="font-medium">
                        {new Date(harvest.verificationDetails.verifiedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {harvest.verificationDetails.notes && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Verification Notes</p>
                          <p className="text-sm">{harvest.verificationDetails.notes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardContent className="p-6">
                  <div className={`flex items-center space-x-3 p-4 rounded-lg ${status.bgColor}`}>
                    <StatusIcon className={`w-6 h-6 ${status.color}`} />
                    <div>
                      <p className="font-medium text-foreground">{status.label}</p>
                      <p className="text-sm text-muted-foreground">{status.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code */}
              {harvest.status === "verified" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <QrCode className="w-5 h-5 mr-2" />
                      QR Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="w-32 h-32 bg-gray-200 mx-auto rounded flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-gray-400" />
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="mb-3">
                        {harvest.qrCode}
                      </Badge>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Download className="w-4 h-4 mr-2" />
                          Download QR Code
                        </Button>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share QR Code
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Crop Type</span>
                    <span className="font-medium">{harvest.cropType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Quantity</span>
                    <span className="font-medium">
                      {harvest.quantity} {harvest.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Harvest Date</span>
                    <span className="font-medium">{new Date(harvest.harvestDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="font-medium">{harvest.location}</span>
                  </div>
                  {harvest.coordinates && (
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Map className="w-4 h-4 mr-2" />
                        View on Map
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">{new Date(harvest.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm">{new Date(harvest.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
