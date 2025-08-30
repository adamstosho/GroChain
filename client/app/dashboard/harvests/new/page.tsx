"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HarvestForm, type HarvestFormData } from "@/components/agricultural"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Leaf, CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewHarvestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

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

      const response = await apiService.createHarvest(payload)
      const created = (response as any)?.harvest || (response as any)?.data?.harvest || response
      const id = created?._id || created?.id
      
      toast({ 
        title: "Harvest logged successfully! 🎉", 
        description: "Your harvest has been recorded and is pending verification.",
        variant: "default"
      })
      
      router.push(id ? `/dashboard/harvests/${id}` : "/dashboard/harvests")
    } catch (error) {
      console.error("Failed to create harvest:", error)
      toast({ 
        title: "Failed to log harvest", 
        description: (error as any)?.message || "Please try again.", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/harvests")
  }

  return (
    <DashboardLayout pageTitle="Log New Harvest">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
                <Link href="/dashboard/harvests" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Harvests
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Log New Harvest</h1>
            <p className="text-gray-600">
              Record your latest harvest for transparency, traceability, and market access
            </p>
          </div>
        </div>

        {/* Process Steps */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-base font-medium">Harvest Logging Process</CardTitle>
            <CardDescription className="text-center">
              Follow these steps to ensure your harvest is properly recorded and verified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <h3 className="font-medium text-sm text-gray-900">Basic Information</h3>
                <p className="text-xs text-gray-600">Crop type, quantity, and harvest date</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <h3 className="font-medium text-sm text-gray-900">Quality Assessment</h3>
                <p className="text-xs text-gray-600">Grade, moisture content, and organic status</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <h3 className="font-medium text-sm text-gray-900">Advanced Details</h3>
                <p className="text-xs text-gray-600">Soil type, irrigation, and pest management</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold text-sm">4</span>
                </div>
                <h3 className="font-medium text-sm text-gray-900">Verification</h3>
                <p className="text-xs text-gray-600">Review and submit for approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-base font-medium">Why Log Your Harvests?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-medium text-sm text-gray-900">Quality Assurance</h3>
                <p className="text-xs text-gray-600">Build trust with buyers through verified harvest data</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-medium text-sm text-gray-900">Traceability</h3>
                <p className="text-xs text-gray-600">Track your produce from farm to market</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-medium text-sm text-gray-900">Market Access</h3>
                <p className="text-xs text-gray-600">List verified products on our marketplace</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Harvest Form */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Leaf className="h-4 w-4 text-gray-500" />
              Harvest Information
            </CardTitle>
            <CardDescription>
              Fill in the details below to log your harvest. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HarvestForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={loading}
              mode="create"
            />
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-base font-medium">Need Help?</CardTitle>
            <CardDescription className="text-center">
              Our agricultural experts are here to support you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-3">
              <p className="text-gray-600 text-sm">
                If you have questions about logging your harvest or need assistance with best practices, 
                don't hesitate to reach out to our support team.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" asChild size="sm">
                  <Link href="/dashboard/analytics">
                    View Harvest Analytics
                  </Link>
                </Button>
                <Button variant="outline" asChild size="sm">
                  <Link href="/dashboard/qr-codes">
                    Manage QR Codes
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
