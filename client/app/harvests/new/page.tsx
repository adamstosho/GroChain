"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Upload, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewHarvestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [harvestData, setHarvestData] = useState({
    cropType: "",
    variety: "",
    quantity: "",
    unit: "kg",
    harvestDate: "",
    location: "",
    lat: "6.5244",
    lng: "3.3792",
    farmSize: "",
    qualityGrade: "A",
    description: "",
    images: [] as File[],
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setHarvestData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setHarvestData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      // Upload images first and collect URLs via marketplace upload endpoint
      const imageUrls: string[] = await apiService.uploadImages(harvestData.images)

      // Map UI fields to backend schema
      const qualityMap: Record<string, string> = { A: "excellent", B: "good", C: "fair" }
      const payload = {
        cropType: harvestData.cropType,
        quantity: Number(harvestData.quantity),
        date: harvestData.harvestDate,
        geoLocation: { lat: Number(harvestData.lat), lng: Number(harvestData.lng) },
        unit: harvestData.unit,
        location: harvestData.location,
        description: harvestData.description,
        quality: (qualityMap[harvestData.qualityGrade] || "good") as any,
        images: imageUrls,
      }

      const response = await apiService.createHarvest(payload)
      const created = (response as any)?.harvest || (response as any)?.data?.harvest || (response as any)
      const id = created?._id || created?.id
      toast({ title: "Harvest logged", description: "Your harvest has been created successfully." })
      router.push(id ? `/harvests/${id}` : "/harvests")
    } catch (error) {
      console.error("Failed to create harvest:", error)
      toast({ title: "Failed to create harvest", description: (error as any)?.message || "Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/harvests" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Harvests
          </Link>
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Log New Harvest</CardTitle>
              <p className="text-gray-600">Record details of your latest harvest for tracking and verification</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cropType">Crop Type *</Label>
                      <Select
                        value={harvestData.cropType}
                        onValueChange={(value) => handleInputChange("cropType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rice">Rice</SelectItem>
                          <SelectItem value="maize">Maize</SelectItem>
                          <SelectItem value="cassava">Cassava</SelectItem>
                          <SelectItem value="yam">Yam</SelectItem>
                          <SelectItem value="tomato">Tomato</SelectItem>
                          <SelectItem value="pepper">Pepper</SelectItem>
                          <SelectItem value="onion">Onion</SelectItem>
                          <SelectItem value="beans">Beans</SelectItem>
                          <SelectItem value="plantain">Plantain</SelectItem>
                          <SelectItem value="cocoa">Cocoa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="variety">Variety</Label>
                      <Input
                        id="variety"
                        value={harvestData.variety}
                        onChange={(e) => handleInputChange("variety", e.target.value)}
                        placeholder="e.g., FARO 44, BR1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={harvestData.quantity}
                        onChange={(e) => handleInputChange("quantity", e.target.value)}
                        placeholder="Enter quantity"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={harvestData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="tons">Tons</SelectItem>
                          <SelectItem value="bags">Bags</SelectItem>
                          <SelectItem value="crates">Crates</SelectItem>
                          <SelectItem value="pieces">Pieces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Location & Date */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location & Date</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="harvestDate">Harvest Date *</Label>
                      <Input
                        id="harvestDate"
                        type="date"
                        value={harvestData.harvestDate}
                        onChange={(e) => handleInputChange("harvestDate", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="farmSize">Farm Size (hectares)</Label>
                      <Input
                        id="farmSize"
                        type="number"
                        step="0.1"
                        value={harvestData.farmSize}
                        onChange={(e) => handleInputChange("farmSize", e.target.value)}
                        placeholder="e.g., 2.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={harvestData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="Farm location (State, LGA, Village)"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lat">Lat *</Label>
                        <Input id="lat" type="number" step="0.0001" value={harvestData.lat} onChange={(e) => handleInputChange("lat", e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="lng">Lng *</Label>
                        <Input id="lng" type="number" step="0.0001" value={harvestData.lng} onChange={(e) => handleInputChange("lng", e.target.value)} required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality & Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quality & Description</h3>

                  <div>
                    <Label htmlFor="qualityGrade">Quality Grade</Label>
                    <Select
                      value={harvestData.qualityGrade}
                      onValueChange={(value) => handleInputChange("qualityGrade", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Grade A (Premium)</SelectItem>
                        <SelectItem value="B">Grade B (Standard)</SelectItem>
                        <SelectItem value="C">Grade C (Commercial)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={harvestData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Additional details about the harvest, farming practices, etc."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Harvest Images</h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Upload photos of your harvest</p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="flex items-center gap-2 bg-transparent">
                        <Upload className="h-4 w-4" />
                        Choose Images
                      </Button>
                    </Label>
                    {harvestData.images.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2">{harvestData.images.length} image(s) selected</p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-6">
                  <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                    <Link href="/harvests">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={
                      loading ||
                      !harvestData.cropType ||
                      !harvestData.quantity ||
                      !harvestData.harvestDate ||
                      !harvestData.location
                    }
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      "Log Harvest"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
