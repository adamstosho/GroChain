"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Leaf, 
  Edit, 
  Trash2, 
  QrCode, 
  MapPin, 
  Calendar, 
  Scale, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Truck, 
  Download, 
  Share2,
  Eye,
  BarChart3,
  Package,
  Thermometer,
  Shield,
  Star
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"

interface HarvestDetail {
  _id: string
  cropType: string
  variety?: string
  quantity: number
  unit: string
  date: string
  location: string
  geoLocation?: { lat: number; lng: number }
  quality: string
  qualityGrade: string
  status: string
  description?: string
  images?: string[]
  organic?: boolean
  moistureContent?: number
  price?: number
  soilType?: string
  irrigationType?: string
  pestManagement?: string
  certification?: string
  batchId?: string
  createdAt: string
  updatedAt: string
}

export default function HarvestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const harvestId = params.id as string
  const [harvest, setHarvest] = useState<HarvestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchHarvestData()
  }, [harvestId])

  const fetchHarvestData = async () => {
    try {
      setLoading(true)
      const response = await apiService.getHarvests({ id: harvestId })
      const harvestData = (response as any)?.harvest || (response as any)?.data?.harvest || response
      setHarvest(harvestData)
    } catch (error) {
      console.error("Failed to fetch harvest:", error)
      toast({
        title: "Error",
        description: "Failed to load harvest data. Please try again.",
        variant: "destructive"
      })
      router.push("/dashboard/harvests")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await apiService.deleteHarvest(harvestId)
      toast({
        title: "Harvest deleted",
        description: "Your harvest has been successfully removed.",
        variant: "default"
      })
      router.push("/dashboard/harvests")
    } catch (error) {
      console.error("Failed to delete harvest:", error)
      toast({
        title: "Failed to delete harvest",
        description: "Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "fair":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "poor":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-16">
              <div className="text-center space-y-6">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading Harvest Details</h2>
                  <p className="text-gray-600">Please wait while we fetch your harvest information...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!harvest) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-16">
              <div className="space-y-6">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                <h2 className="text-2xl font-semibold text-gray-900">Harvest Not Found</h2>
                <p className="text-gray-600">The harvest you're looking for doesn't exist or has been removed.</p>
                <Button asChild>
                  <Link href="/dashboard/harvests">Back to Harvests</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-primary hover:text-primary/80">
              <Link href="/dashboard/harvests" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Harvests
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{harvest.cropType}</h1>
                <p className="text-gray-600">Harvest Details & Information</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/harvests/${harvestId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Harvest</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this harvest? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Status Banner */}
        <Card className={`border-0 shadow-lg ${getStatusColor(harvest.status)}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {harvest.status === "pending" && <Clock className="h-5 w-5" />}
                {harvest.status === "approved" && <CheckCircle className="h-5 w-5" />}
                {harvest.status === "rejected" && <AlertCircle className="h-5 w-5" />}
                {harvest.status === "shipped" && <Truck className="h-5 w-5" />}
                <div>
                  <h3 className="font-semibold capitalize">Status: {harvest.status}</h3>
                  <p className="text-sm opacity-80">
                    {harvest.status === "pending" && "Awaiting verification from our team"}
                    {harvest.status === "approved" && "Your harvest has been verified and approved"}
                    {harvest.status === "rejected" && "Please review and update the information"}
                    {harvest.status === "shipped" && "Your harvest is on its way to market"}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {harvest.batchId || `HARVEST_${harvest._id.slice(-6)}`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Crop Type</label>
                    <p className="font-semibold">{harvest.cropType}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Variety</label>
                    <p className="font-semibold">{harvest.variety || "Standard"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Quantity</label>
                    <p className="font-semibold">{harvest.quantity} {harvest.unit}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Harvest Date</label>
                    <p className="font-semibold">{new Date(harvest.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold">{harvest.location}</p>
                  </div>
                </div>

                {harvest.description && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Notes</label>
                      <p className="text-gray-700">{harvest.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quality & Pricing */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Quality & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Quality Grade</label>
                    <Badge className={getQualityColor(harvest.quality)}>
                      {harvest.qualityGrade}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Quality Level</label>
                    <Badge className={getQualityColor(harvest.quality)}>
                      {harvest.quality.charAt(0).toUpperCase() + harvest.quality.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Price per Unit</label>
                    <p className="font-semibold text-green-600">
                      ₦{harvest.price?.toLocaleString() || "Not set"}
                    </p>
                  </div>
                </div>

                {harvest.moistureContent && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Moisture Content</label>
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-gray-400" />
                        <p className="font-semibold">{harvest.moistureContent}%</p>
                      </div>
                    </div>
                  </>
                )}

                {harvest.organic && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Certified Organic</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Advanced Details */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Advanced Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Soil Type</label>
                    <p className="font-semibold capitalize">{harvest.soilType || "Not specified"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Irrigation</label>
                    <p className="font-semibold capitalize">{harvest.irrigationType || "Not specified"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Pest Management</label>
                    <p className="font-semibold capitalize">{harvest.pestManagement || "Not specified"}</p>
                  </div>
                </div>

                {harvest.certification && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Certifications</label>
                      <p className="font-semibold">{harvest.certification}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Images */}
            {harvest.images && harvest.images.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Harvest Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {harvest.images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                        <Image
                          src={image}
                          alt={`Harvest ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Actions & Timeline */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href={`/dashboard/harvests/${harvestId}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Harvest
                  </Link>
                </Button>
                
                {/* List on Marketplace Button - Only show for approved harvests */}
                {harvest.status === "approved" && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/marketplace/new?harvestId=${harvestId}`}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      List on Marketplace
                    </Link>
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Details
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Harvest Created</p>
                      <p className="text-xs text-gray-500">
                        {new Date(harvest.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Last Updated</p>
                      <p className="text-xs text-gray-500">
                        {new Date(harvest.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Related</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
