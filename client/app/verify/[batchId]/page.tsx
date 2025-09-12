"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Scale,
  Leaf,
  User,
  Phone,
  Building,
  Package,
  Eye,
  ArrowLeft,
  QrCode,
  Image as ImageIcon,
  Shield,
  Award,
  Star
} from "lucide-react"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface HarvestData {
  batchId: string
  cropType: string
  variety?: string
  quantity: number
  unit: string
  quality: string
  location: string
  harvestDate: string
  farmer: {
    id: string
    name: string
    farmName?: string
    phone?: string
  }
  images?: string[]
  organic?: boolean
  price?: number
  status: string
  verificationUrl: string
  timestamp: string
}

export default function VerifyHarvestPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [harvestData, setHarvestData] = useState<HarvestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const batchId = params.batchId as string

  useEffect(() => {
    if (!batchId) {
      setError("Invalid batch ID")
      setLoading(false)
      return
    }

    fetchHarvestData()
  }, [batchId])

  const fetchHarvestData = async () => {
    try {
      setLoading(true)
      const response = await apiService.verifyHarvest(batchId)

      // Handle both response formats: direct data or wrapped in status/data
      let harvestData: HarvestData
      if (response?.status === 'success' && response?.data) {
        harvestData = response.data
      } else if (response?.batchId) {
        // Direct data format from new verification endpoint
        harvestData = response as HarvestData
      } else {
        throw new Error("Harvest not found or verification failed")
      }

      setHarvestData(harvestData)
    } catch (err: any) {
      console.error("Verification error:", err)
      setError(err?.message || "Failed to verify harvest")
      toast({
        title: "Verification Failed",
        description: err?.message || "Unable to verify this harvest batch.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200'
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'poor': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'listed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verifying Harvest</h2>
            <p className="text-sm text-gray-600 text-center">
              Scanning batch ID: {batchId}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !harvestData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-sm text-gray-600 text-center mb-4">
              {error || "Unable to verify this harvest batch"}
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-green-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Harvest Verified ✓
            </CardTitle>
            <CardDescription className="text-lg">
              Authentic GroChain Harvest Certificate
            </CardDescription>
            <Badge variant="outline" className="mt-2 text-sm font-mono">
              {harvestData.batchId}
            </Badge>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Harvest Details */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Harvest Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Crop Type</label>
                  <p className="text-lg font-semibold">{harvestData.cropType}</p>
                  {harvestData.variety && (
                    <p className="text-sm text-gray-600">Variety: {harvestData.variety}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Quantity</label>
                  <p className="text-lg font-semibold">{harvestData.quantity} {harvestData.unit}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Quality</label>
                  <Badge className={`${getQualityColor(harvestData.quality)} font-medium capitalize`}>
                    {harvestData.quality}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className={`${getStatusColor(harvestData.status)} font-medium capitalize`}>
                    {harvestData.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-600">Harvest Date</label>
                <p className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(harvestData.harvestDate)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {typeof harvestData.location === 'string' ? harvestData.location : `${harvestData.location?.city || 'Unknown'}, ${harvestData.location?.state || 'Unknown State'}`}
                </p>
              </div>

              {harvestData.price && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Price</label>
                  <p className="text-lg font-semibold">₦{harvestData.price.toLocaleString()} per {harvestData.unit}</p>
                </div>
              )}

              {harvestData.organic && (
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">Organic Certified</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Farmer Details */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Farmer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Farmer Name</label>
                <p className="text-lg font-semibold">{harvestData.farmer.name}</p>
              </div>

              {harvestData.farmer.farmName && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Farm Name</label>
                  <p className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4" />
                    {harvestData.farmer.farmName}
                  </p>
                </div>
              )}

              {harvestData.farmer.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact</label>
                  <p className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4" />
                    {harvestData.farmer.phone}
                  </p>
                </div>
              )}

              <Separator />

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Verified Farmer</span>
                </div>
                <p className="text-sm text-green-700">
                  This harvest is certified by GroChain and meets our quality standards.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Images */}
        {harvestData.images && harvestData.images.length > 0 && (
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Product Images ({harvestData.images.length})
              </CardTitle>
              <CardDescription>
                Visual verification of the harvested produce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {harvestData.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors">
                      <Image
                        src={image}
                        alt={`Harvest image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Details */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Verification Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Verified On</label>
                <p className="mt-1">{formatDate(harvestData.timestamp)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Verification Method</label>
                <p className="mt-1">QR Code Scan</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Blockchain Status</label>
                <p className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 bg-yellow-400 rounded-full inline-block"></span>
                  Pending Anchor
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Certificate ID</label>
                <p className="mt-1 font-mono text-sm">{harvestData.batchId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={() => window.print()}>
                <QrCode className="h-4 w-4 mr-2" />
                Print Certificate
              </Button>
              <Button variant="outline" onClick={() => navigator.share?.({
                title: 'GroChain Harvest Certificate',
                text: `Verified harvest: ${harvestData.cropType} - ${harvestData.quantity}${harvestData.unit}`,
                url: window.location.href
              })}>
                <QrCode className="h-4 w-4 mr-2" />
                Share Certificate
              </Button>
              <Button variant="default" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to GroChain
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <div className="relative max-w-4xl max-h-[90vh]">
              <Image
                src={selectedImage}
                alt="Harvest image"
                width={800}
                height={600}
                className="object-contain rounded-lg"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(null)
                }}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
