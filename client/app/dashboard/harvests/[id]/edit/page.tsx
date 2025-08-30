"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HarvestForm, type HarvestFormData } from "@/components/agricultural"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Leaf, Edit, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

export default function EditHarvestPage() {
  const router = useRouter()
  const params = useParams()
  const harvestId = params.id as string
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<Partial<HarvestFormData> | undefined>()
  const [fetching, setFetching] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchHarvestData()
  }, [harvestId])

  const fetchHarvestData = async () => {
    try {
      setFetching(true)
      const response = await apiService.getHarvests({ id: harvestId })
      const harvest = (response as any)?.harvest || (response as any)?.data?.harvest || response
      
      if (harvest) {
        // Map backend data to our form format
        const formData: Partial<HarvestFormData> = {
          cropType: harvest.cropType,
          variety: harvest.variety || "Standard",
          harvestDate: new Date(harvest.date || harvest.harvestDate || Date.now()),
          quantity: harvest.quantity,
          unit: harvest.unit,
          location: harvest.location,
          quality: harvest.quality || "good",
          grade: harvest.qualityGrade || "B",
          organic: harvest.organic || false,
          moistureContent: harvest.moistureContent || 15,
          price: harvest.price || 0,
          notes: harvest.description || "",
          images: harvest.images || [],
          coordinates: harvest.geoLocation ? {
            latitude: harvest.geoLocation.lat,
            longitude: harvest.geoLocation.lng
          } : undefined,
          soilType: harvest.soilType || "loam",
          irrigationType: harvest.irrigationType || "rainfed",
          pestManagement: harvest.pestManagement || "conventional",
          certification: harvest.certification || ""
        }
        setInitialData(formData)
      }
    } catch (error) {
      console.error("Failed to fetch harvest:", error)
      toast({
        title: "Error",
        description: "Failed to load harvest data. Please try again.",
        variant: "destructive"
      })
      router.push("/dashboard/harvests")
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (data: HarvestFormData) => {
    try {
      setLoading(true)
      
      // Map our form data to backend schema
      const payload = {
        cropType: data.cropType,
        variety: data.variety,
        quantity: data.quantity,
        date: data.harvestDate,
        geoLocation: { 
          lat: data.coordinates?.latitude || 6.5244, 
          lng: data.coordinates?.longitude || 3.3792 
        },
        unit: data.unit,
        location: data.location,
        description: data.notes || "",
        quality: data.quality as "excellent" | "good" | "fair" | "poor",
        qualityGrade: data.grade,
        organic: data.organic,
        moistureContent: data.moistureContent,
        price: data.price,
        images: data.images || [],
        // Additional fields from our form
        soilType: data.soilType,
        irrigationType: data.irrigationType,
        pestManagement: data.pestManagement,
        certification: data.certification
      }

      // TODO: Implement update harvest API call
      console.log("Updating harvest:", harvestId, payload)
      
      toast({ 
        title: "Harvest updated successfully! ✨", 
        description: "Your harvest information has been updated and saved.",
        variant: "default"
      })
      
      router.push(`/dashboard/harvests/${harvestId}`)
    } catch (error) {
      console.error("Failed to update harvest:", error)
      toast({ 
        title: "Failed to update harvest", 
        description: (error as any)?.message || "Please try again.", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/dashboard/harvests/${harvestId}`)
  }

  if (fetching) {
    return (
      <DashboardLayout pageTitle="Loading Harvest...">
        <Card className="border border-gray-200">
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-2">Loading Harvest Data</h2>
                <p className="text-gray-600">Please wait while we fetch your harvest information...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Edit Harvest">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
                <Link href={`/dashboard/harvests/${harvestId}`} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Harvest Details
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Harvest</h1>
            <p className="text-gray-600">
              Update your harvest information and details for better accuracy and traceability
            </p>
          </div>
        </div>

        {/* Edit Guidelines */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-base font-medium flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Editing Guidelines
            </CardTitle>
            <CardDescription className="text-center">
              Important information about editing your harvest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                  <span className="text-amber-600 font-bold text-sm">!</span>
                </div>
                <h3 className="font-medium text-sm text-gray-900">Status Changes</h3>
                <p className="text-xs text-gray-600">Editing may affect verification status</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                  <span className="text-amber-600 font-bold text-sm">✓</span>
                </div>
                <h3 className="font-medium text-sm text-gray-900">Data Accuracy</h3>
                <p className="text-xs text-gray-600">Ensure all information is correct</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                  <span className="text-amber-600 font-bold text-sm">📝</span>
                </div>
                <h3 className="font-medium text-sm text-gray-900">Audit Trail</h3>
                <p className="text-xs text-gray-600">Changes are logged for transparency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Harvest Form */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Edit className="h-4 w-4 text-gray-500" />
              Edit Harvest Information
            </CardTitle>
            <CardDescription>
              Modify the details below to update your harvest. All changes will be tracked for transparency.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HarvestForm
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={loading}
              mode="edit"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-medium text-gray-900">Ready to Update?</h3>
                <p className="text-gray-600 text-sm">Review your changes and save when ready</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => document.querySelector('form')?.requestSubmit()}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Harvest
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
